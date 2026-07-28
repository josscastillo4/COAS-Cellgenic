import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cellgenic COA Manager",
  description: "Manage Certificates of Analysis for Cellgenic products.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
