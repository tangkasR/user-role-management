// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ShieldCheck } from "lucide-react";
import { NAV_GROUPS } from "@/lib/navigation";
import { usePermission } from "@/context/PermissionContext";
import { useSidebar } from "@/context/SidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const { can } = usePermission();
  const { collapsed, mobileOpen, closeMobile } = useSidebar();

  // tutup drawer mobile setelah pindah halaman
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      closeMobile();
    }
  }, [pathname, closeMobile]);

  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.feature || can(i.feature, "read")),
  })).filter((g) => g.items.length > 0);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const hideOnCollapsed = collapsed ? "md:hidden" : "";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-all duration-200 md:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${collapsed ? "md:w-16" : "md:w-64"}`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 px-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <ShieldCheck className="size-5" />
          </span>
          <span
            className={`truncate text-sm font-semibold text-gray-900 ${hideOnCollapsed}`}
          >
            Role Management
          </span>
        </div>

        <nav
          className="flex-1 space-y-6 overflow-y-auto p-3"
          aria-label="Menu utama"
        >
          {groups.map((group) => (
            <div key={group.label}>
              <p
                className={`mb-2 px-3 text-xs font-medium uppercase tracking-wide text-gray-400 ${hideOnCollapsed}`}
              >
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map(({ label, href, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      title={collapsed ? label : undefined}
                      aria-current={isActive(href) ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        isActive(href)
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="size-5 shrink-0" />
                      <span className={`truncate ${hideOnCollapsed}`}>
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {groups.length === 0 && (
            <p className={`px-3 text-sm text-gray-400 ${hideOnCollapsed}`}>
              Belum ada menu yang tersedia.
            </p>
          )}
        </nav>
      </aside>
    </>
  );
}
