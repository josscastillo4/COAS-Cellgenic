import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Settings,
} from "lucide-react";
import type { NavItem } from "@/types/navigation";

/**
 * Single source of truth for the primary sidebar navigation.
 * Add new top-level routes here rather than editing Sidebar.tsx directly.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "COAs", href: "/coas", icon: FileText },
  { label: "Products", href: "/products", icon: Package },
  { label: "Users", href: "/users", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];
