// src/lib/fetcher.ts
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetchJson<T>(
  url: string,
  signal?: AbortSignal
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e; // dibatalkan TanStack, bukan error
    throw new ApiError(0, "Tidak dapat terhubung ke server");
  }

  if (!res.ok) {
    let message = "Gagal memuat data";
    try {
      const body = await res.json();
      if (typeof body?.message === "string") message = body.message;
    } catch {
      // body bukan JSON: pakai pesan default
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}
