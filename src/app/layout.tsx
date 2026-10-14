// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "User Role Management",
  description: "Aplikasi pengelolaan user, role, feature, dan permission",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased">
        <Providers>
          <Suspense
            fallback={
              <div className="flex h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
                Memuat...
              </div>
            }
          >
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
