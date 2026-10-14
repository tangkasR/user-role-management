// src/lib/swal.ts
import Swal from "sweetalert2";

export function swalSuccess(title: string, text?: string) {
  return Swal.fire({
    icon: "success",
    title,
    text,
    timer: 1800,
    showConfirmButton: false,
  });
}

export function swalError(title: string, text?: string) {
  return Swal.fire({ icon: "error", title, text, confirmButtonText: "Tutup" });
}

export async function swalConfirm(opts: {
  title: string;
  text?: string;
  confirmText?: string;
  icon?: "warning" | "question" | "info";
}) {
  const res = await Swal.fire({
    title: opts.title,
    text: opts.text,
    icon: opts.icon ?? "warning",
    showCancelButton: true,
    confirmButtonText: opts.confirmText ?? "Ya",
    cancelButtonText: "Batal",
    reverseButtons: true,
    focusCancel: true,
  });
  return res.isConfirmed;
}
