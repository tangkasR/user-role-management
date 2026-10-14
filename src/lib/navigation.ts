// src/lib/navigation.ts
import {
  Boxes,
  LayoutDashboard,
  ShieldCheck,
  StickyNote,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { FeatureKey } from "@/lib/constants";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  feature?: FeatureKey; // kosong = semua user yang login boleh melihat
};

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Utama",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Notes", href: "/notes", icon: StickyNote, feature: "note" },
    ],
  },
  {
    label: "Manajemen",
    items: [
      { label: "Users", href: "/users", icon: Users, feature: "user" },
      { label: "Roles", href: "/roles", icon: ShieldCheck, feature: "role" },
      { label: "Features", href: "/features", icon: Boxes, feature: "feature" },
    ],
  },
];
