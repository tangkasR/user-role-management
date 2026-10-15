// src/modules/note/note.hooks.ts
"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type { ListResponse } from "@/lib/types";
import { listParamsToSearch } from "@/lib/utils";
import type { ListParams } from "@/lib/validations";
import type { NoteRow } from "./note.schema";

export const noteKeys = {
  all: ["notes"] as const,
  list: (params: ListParams) => ["notes", "list", params] as const,
};

export function useNotes(params: ListParams) {
  return useQuery({
    queryKey: noteKeys.list(params),
    queryFn: ({ signal }) =>
      fetchJson<ListResponse<NoteRow>>(
        `/api/notes?${listParamsToSearch(params)}`,
        signal
      ),
    placeholderData: keepPreviousData, // data lama tetap tampil saat memuat yang baru
    staleTime: 0, // selalu disegarkan saat dibuka lagi
  });
}
