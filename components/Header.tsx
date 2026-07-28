"use client";

import { Menu } from "lucide-react";

interface HeaderProps {
  /** Called when the user taps the hamburger icon (mobile only). */
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1">
        {/* Reserved for breadcrumbs / page title / search once business logic is added */}
      </div>

      <div className="flex items-center gap-3">
        {/* Reserved for future user menu / notifications once auth is added */}
        <div className="h-9 w-9 rounded-full bg-slate-800" />
      </div>
    </header>
  );
}
