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

export const ACTION_LABEL: Record<Action, string> = {
  read: "Read",
  add: "Add",
  edit: "Edit",
  delete: "Delete",
};

export const SYSTEM_FEATURE_KEYS: readonly string[] = FEATURES.map(
  (f) => f.key
);

// ["read","edit"], true → { isRead: true, isEdit: true }
export function actionsToColumns(actions: readonly Action[], value: boolean) {
  return Object.fromEntries(
    actions.map((a) => [ACTION_COLUMN[a], value])
  ) as Partial<Record<(typeof ACTION_COLUMN)[Action], boolean>>;
}

// Role yang dipakai langsung oleh kode: tidak boleh dihapus atau diganti namanya
export const PROTECTED_ROLE_NAMES: readonly string[] = [
  ROLE_SUPER_ADMIN,
  ROLE_DEFAULT,
];

// ["read","edit"] → { isRead: true, isAdd: false, isEdit: true, isDelete: false }
export function actionsToFlags(granted: readonly Action[]) {
  return {
    isRead: granted.includes("read"),
    isAdd: granted.includes("add"),
    isEdit: granted.includes("edit"),
    isDelete: granted.includes("delete"),
  };
}
