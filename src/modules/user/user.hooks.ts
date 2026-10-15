// src/modules/user/user.hooks.ts
"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type { ListResponse } from "@/lib/types";
import { listParamsToSearch } from "@/lib/utils";
import type { ListParams } from "@/lib/validations";
import type { UserRow } from "./user.schema";

export const userKeys = {
  all: ["users"] as const,
  list: (params: ListParams) => ["users", "list", params] as const,
};

export function useUsers(params: ListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) =>
      fetchJson<ListResponse<UserRow>>(
        `/api/users?${listParamsToSearch(params)}`,
        signal
      ),
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}
