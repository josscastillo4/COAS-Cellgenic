"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Eye, Pencil, FileUp, Copy, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentActionsMenuProps {
  documentName: string;
  onView?: () => void;
  onEdit?: () => void;
  onReplacePdf?: () => void;
  onVerify?: () => void;
  onDuplicate?: () => void;
}

/**
 * Kebab-menu of row-level actions, reused for every row in the Documents
 * table. Handles its own open/close + outside-click state so callers only
 * need to pass in what should happen for each action.
 */
export default function DocumentActionsMenu({
  documentName,
  onView,
  onEdit,
  onReplacePdf,
  onVerify,
  onDuplicate,
}: DocumentActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const items = [
    { label: "View", icon: Eye, onClick: onView },
    { label: "Edit", icon: Pencil, onClick: onEdit },
    { label: "Verify", icon: ShieldCheck, onClick: onVerify },
    { label: "Replace PDF", icon: FileUp, onClick: onReplacePdf },
    { label: "Duplicate", icon: Copy, onClick: onDuplicate },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        aria-label={`Actions for ${documentName}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 py-1 shadow-lg shadow-black/30"
          )}
        >
          {items.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={() => {
                onClick?.();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Icon className="h-4 w-4 text-slate-400" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
