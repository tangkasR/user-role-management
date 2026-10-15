// src/app/error.tsx   (error di layout dashboard, misalnya database mati: layar penuh)
"use client";

import ErrorView from "@/components/ErrorView";

export default function RootError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView {...props} fullScreen />;
}
