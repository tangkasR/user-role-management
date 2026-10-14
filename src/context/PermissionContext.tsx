// src/context/PermissionContext.tsx
"use client";

import { createContext, useContext, useMemo } from "react";
import type { Action, FeatureKey, PermissionMap } from "@/lib/constants";

type CurrentUser = { name: string; email: string; roleName: string };

type PermissionValue = {
  user: CurrentUser;
  permissions: PermissionMap;
  can: (feature: FeatureKey, action: Action) => boolean;
};

const PermissionContext = createContext<PermissionValue | null>(null);

export function PermissionProvider({
  user,
  permissions,
  children,
}: {
  user: CurrentUser;
  permissions: PermissionMap;
  children: React.ReactNode;
}) {
  const value = useMemo<PermissionValue>(
    () => ({
      user,
      permissions,
      can: (feature, action) => permissions[feature]?.includes(action) ?? false,
    }),
    [user, permissions]
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermission() {
  const ctx = useContext(PermissionContext);
  if (!ctx)
    throw new Error("usePermission harus dipakai di dalam PermissionProvider");
  return ctx;
}
