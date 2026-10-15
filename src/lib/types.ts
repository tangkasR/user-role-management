// src/lib/types.ts
export type ListResponse<T> = {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};
