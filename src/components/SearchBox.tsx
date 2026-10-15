// src/components/SearchBox.tsx
"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type Props = {
  value: string;
  onSearch: (q: string) => void;
  placeholder?: string;
};

export default function SearchBox({
  value,
  onSearch,
  placeholder = "Cari...",
}: Props) {
  const [text, setText] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // URL berubah dari luar (misalnya tombol back): ikuti nilainya
  if (value !== prevValue) {
    setPrevValue(value);
    setText(value);
  }

  useEffect(() => {
    if (text.trim() === value) return;
    const timer = setTimeout(() => onSearch(text.trim()), 400); // debounce
    return () => clearTimeout(timer);
  }, [text, value, onSearch]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}
