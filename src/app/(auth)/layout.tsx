import { Suspense } from "react";

// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
          Memuat...
        </div>
      }
    >
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        {children}
      </main>
    </Suspense>
  );
}
