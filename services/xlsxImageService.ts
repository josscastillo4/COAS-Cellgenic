/**
 * Extracts embedded images from an .xlsx file's first worksheet and decodes
 * any QR code found in each, associated with the spreadsheet row it's
 * anchored to. `read-excel-file` (used elsewhere for cell values) cannot see
 * embedded media at all — this is a separate concern, kept in its own file
 * since it's really "how to read OOXML drawing relationships", not
 * "how to read Excel cell data".
 *
 * The .xlsx embedded-image anchoring format (workbook.xml -> worksheet rels
 * -> drawing XML -> drawing rels -> media file) is a standard, documented
 * part of the OOXML zip structure, not proprietary — but this was built and
 * tested against a synthetic file with a manually-embedded image, so the
 * exact drawing-XML shape may need a follow-up adjustment once tested
 * against a real-world file. Every step here fails soft (never throws out of
 * extractRowQrMap) so a structural surprise just means "no embedded QR for
 * these rows", not a broken import.
 */

/** Maps 0-indexed worksheet row numbers to the QR URL decoded from the image anchored there. */
export type RowQrMap = Map<number, string>;

const RELATIONSHIPS_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const SPREADSHEET_DRAWING_NS = "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing";
const DRAWINGML_MAIN_NS = "http://schemas.openxmlformats.org/drawingml/2006/main";

/**
 * Relationship targets come in two flavors depending on which tool wrote the
 * file: relative ("../media/image1.png", resolved against basePath's
 * directory) or zip-root-absolute ("/xl/media/image1.png", e.g. from
 * openpyxl). Both are valid OPC conventions.
 */
function resolveRelativePath(basePath: string, target: string): string {
  if (target.startsWith("/")) {
    return target.slice(1);
  }

  const baseDir = basePath.split("/").slice(0, -1);
  const resultParts = [...baseDir];
  for (const part of target.split("/")) {
    if (part === "..") resultParts.pop();
    else if (part === "." || part === "") continue;
    else resultParts.push(part);
  }
  return resultParts.join("/");
}

/**
 * Drawing-part elements (twoCellAnchor/from/row/blip, etc.) may or may not
 * use the "xdr"/"a" prefixes depending on the tool that wrote the file —
 * some (e.g. openpyxl) put the spreadsheetDrawing namespace as the *default*
 * (unprefixed) namespace instead. Namespace-aware lookup handles both.
 */
function getElementsByNs(parent: Document | Element, namespaceUri: string, localName: string): Element[] {
  return Array.from(parent.getElementsByTagNameNS(namespaceUri, localName));
}

function parseXml(xmlText: string): Document {
  return new DOMParser().parseFromString(xmlText, "application/xml");
}

async function readZipText(zip: import("jszip"), path: string): Promise<string | null> {
  const file = zip.file(path);
  if (!file) return null;
  return file.async("text");
}

function getRelationshipTarget(relsDoc: Document, relId: string): string | null {
  const rel = Array.from(relsDoc.getElementsByTagName("Relationship")).find(
    (entry) => entry.getAttribute("Id") === relId
  );
  return rel?.getAttribute("Target") ?? null;
}

/** Resolves workbook.xml -> workbook rels -> first sheet's rels -> its drawing part, if any. */
async function findFirstSheetDrawingPath(zip: import("jszip")): Promise<string | null> {
  const workbookXml = await readZipText(zip, "xl/workbook.xml");
  if (!workbookXml) return null;

  const workbookDoc = parseXml(workbookXml);
  const firstSheet = workbookDoc.getElementsByTagName("sheet")[0];
  const sheetRid =
    firstSheet?.getAttributeNS(RELATIONSHIPS_NS, "id") ?? firstSheet?.getAttribute("r:id") ?? null;
  if (!sheetRid) return null;

  const workbookRelsXml = await readZipText(zip, "xl/_rels/workbook.xml.rels");
  if (!workbookRelsXml) return null;
  const sheetTarget = getRelationshipTarget(parseXml(workbookRelsXml), sheetRid);
  if (!sheetTarget) return null;
  const sheetPath = resolveRelativePath("xl/workbook.xml", sheetTarget);

  const sheetDir = sheetPath.split("/").slice(0, -1).join("/");
  const sheetFileName = sheetPath.split("/").pop();
  const sheetRelsXml = await readZipText(zip, `${sheetDir}/_rels/${sheetFileName}.rels`);
  if (!sheetRelsXml) return null;

  const sheetRelsDoc = parseXml(sheetRelsXml);
  const drawingRel = Array.from(sheetRelsDoc.getElementsByTagName("Relationship")).find((rel) =>
    (rel.getAttribute("Type") ?? "").endsWith("/drawing")
  );
  const drawingTarget = drawingRel?.getAttribute("Target");
  if (!drawingTarget) return null;

  return resolveRelativePath(sheetPath, drawingTarget);
}

function inferMimeType(path: string): string {
  const extension = path.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "bmp":
      return "image/bmp";
    case "png":
    default:
      return "image/png";
  }
}

function bytesToImageData(bytes: Uint8Array, mimeType: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable");
        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to decode embedded image"));
    };
    img.src = url;
  });
}

/**
 * Extracts embedded images anchored to worksheet rows and decodes any QR
 * code found in each. Never throws — any structural surprise (no drawings,
 * unexpected XML shape, undecodable image) just yields fewer/no entries in
 * the returned map, and callers should fall back to a text QR column.
 */
export async function extractRowQrMap(file: File): Promise<RowQrMap> {
  const result: RowQrMap = new Map();

  try {
    const JSZip = (await import("jszip")).default;
    const jsQR = (await import("jsqr")).default;

    const zip = await JSZip.loadAsync(file);
    const drawingPath = await findFirstSheetDrawingPath(zip);
    if (!drawingPath) return result;

    const drawingXml = await readZipText(zip, drawingPath);
    if (!drawingXml) return result;

    const drawingDir = drawingPath.split("/").slice(0, -1).join("/");
    const drawingFileName = drawingPath.split("/").pop();
    const drawingRelsXml = await readZipText(zip, `${drawingDir}/_rels/${drawingFileName}.rels`);
    if (!drawingRelsXml) return result;

    const drawingDoc = parseXml(drawingXml);
    const relsDoc = parseXml(drawingRelsXml);

    const anchors = [
      ...getElementsByNs(drawingDoc, SPREADSHEET_DRAWING_NS, "twoCellAnchor"),
      ...getElementsByNs(drawingDoc, SPREADSHEET_DRAWING_NS, "oneCellAnchor"),
    ];

    for (const anchor of anchors) {
      const fromElement = getElementsByNs(anchor, SPREADSHEET_DRAWING_NS, "from")[0];
      const fromRowText = fromElement
        ? getElementsByNs(fromElement, SPREADSHEET_DRAWING_NS, "row")[0]?.textContent
        : undefined;
      const blip = getElementsByNs(anchor, DRAWINGML_MAIN_NS, "blip")[0];
      const embedId = blip?.getAttributeNS(RELATIONSHIPS_NS, "embed") ?? blip?.getAttribute("r:embed");

      if (fromRowText === null || fromRowText === undefined || !embedId) continue;

      const mediaTarget = getRelationshipTarget(relsDoc, embedId);
      if (!mediaTarget) continue;

      const mediaPath = resolveRelativePath(drawingPath, mediaTarget);
      const mediaFile = zip.file(mediaPath);
      if (!mediaFile) continue;

      try {
        const bytes = await mediaFile.async("uint8array");
        const imageData = await bytesToImageData(bytes, inferMimeType(mediaPath));
        const decoded = jsQR(imageData.data, imageData.width, imageData.height);
        if (decoded?.data) {
          result.set(Number(fromRowText), decoded.data);
        }
      } catch {
        continue;
      }
    }
  } catch {
    // Any unexpected zip/XML structure means "no embedded QR data available".
  }

  return result;
}
