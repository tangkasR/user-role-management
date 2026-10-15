// src/components/SearchInput.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchInput({
  placeholder = "Cari...",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const current = sp.get("q") ?? "";
  const [value, setValue] = useState(current);

  useEffect(() => {
    if (value.trim() === current) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(sp.toString());
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`); // replace: riwayat back tidak penuh
    }, 400);

    return () => clearTimeout(timer);
  }, [value, current, sp, pathname, router]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}
