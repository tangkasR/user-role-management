// src/app/global-error.tsx   (error di root layout; menggantikan seluruh dokumen)
"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1>Terjadi kesalahan</h1>
          <p>Aplikasi mengalami masalah. Silakan coba lagi.</p>
          <button type="button" onClick={() => reset()}>
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
