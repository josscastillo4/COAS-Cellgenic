"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Top-level application chrome shared by every route.
 * Lives in the root layout so individual pages only need to render
 * their own content, not re-implement the sidebar/header each time.
 */
export default function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          aria-hidden="true"
        />
      )}

      <div className="lg:pl-64">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main>{children}</main>
      </div>
    </div>
  );
}
