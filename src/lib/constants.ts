// src/lib/constants.ts
export const ACTIONS = ["read", "add", "edit", "delete"] as const;
export type Action = (typeof ACTIONS)[number];
export type PermissionMap = Record<string, Action[]>;

export const ACTION_COLUMN = {
  read: "isRead",
  add: "isAdd",
  edit: "isEdit",
  delete: "isDelete",
} as const;

export const ROLE_SUPER_ADMIN = "Super Admin";
export const ROLE_DEFAULT = "User";

export const FEATURES = [
  { key: "user", name: "User", desc: "Kelola user" },
  { key: "role", name: "Role", desc: "Kelola role" },
  { key: "feature", name: "Feature", desc: "Kelola feature" },
  { key: "role-permission", name: "Role Permission", desc: "Kelola izin role" },
  { key: "note", name: "Note", desc: "Catatan untuk uji permission" },
] as const;

export type FeatureKey = (typeof FEATURES)[number]["key"];

export const SESSION_COOKIE = "session";
