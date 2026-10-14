// src/components/Header.tsx
"use client";

import { LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePermission } from "@/context/PermissionContext";
import { useSidebar } from "@/context/SidebarContext";
import { logout } from "@/modules/auth/auth.actions";
import { swalConfirm } from "@/lib/swal";

export default function Header() {
  const { user } = usePermission();
  const { collapsed, toggleCollapsed, openMobile } = useSidebar();

  async function handleLogout() {
    const ok = await swalConfirm({
      title: "Keluar dari akun?",
      text: "Kamu perlu login lagi untuk mengakses dashboard.",
      confirmText: "Ya, keluar",
      icon: "question",
    });
    if (ok) await logout();
  }

  const iconBtn =
    "size-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openMobile}
          className={`${iconBtn} inline-flex  md:hidden`}
          aria-label="Buka menu"
        >
          <Menu className="size-5" />
        </button>
        <button
          type="button"
          onClick={toggleCollapsed}
          className={`${iconBtn} hidden md:inline-flex`}
          aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-gray-900">
            {user.name}
          </p>
          <p className="text-xs text-gray-500">{user.roleName}</p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className={`${iconBtn} inline-flex`}
          aria-label="Keluar"
          title="Keluar"
        >
          <LogOut className="size-5" />
        </button>
      </div>
    </header>
  );
}
