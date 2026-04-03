import { apiFetch, type ApiResult } from "@/lib/api";

export type MedicalFileKind = "report" | "image" | "pdf" | "audio" | "video" | "other";

export type UploadedMedicalFile = {
  id: number;
  original_name?: string;
  mime_type?: string | null;
  file_kind?: string | null;
  size_bytes?: number | null;
};

export function inferMedicalFileKind(file: File): MedicalFileKind {
  const name = file.name.toLowerCase();
  const type = (file.type ?? "").toLowerCase();

  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (type.startsWith("image/") || /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?|$)/i.test(name))
    return "image";
  if (type.startsWith("audio/")) return "audio";
  if (type.startsWith("video/")) return "video";
  return "other";
}

type UploadOptions = {
  file_kind?: MedicalFileKind;
  consultation_id?: number;
};

export async function uploadMedicalFile(
  file: File,
  options: UploadOptions = {},
): Promise<ApiResult<{ file: UploadedMedicalFile }>> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("file_kind", options.file_kind ?? inferMedicalFileKind(file));
  if (options.consultation_id != null) {
    fd.append("consultation_id", String(options.consultation_id));
  }

  return apiFetch<{ file: UploadedMedicalFile }>("/medical-files", {
    method: "POST",
    body: fd,
  });
}

export async function uploadMedicalFiles(
  files: File[],
  options: UploadOptions = {},
): Promise<ApiResult<{ files: UploadedMedicalFile[] }>> {
  const uploaded: UploadedMedicalFile[] = [];
  for (const f of files) {
    const res = await uploadMedicalFile(f, options);
    if (!res.ok) return res;
    uploaded.push(res.data.file);
  }
  return { ok: true, data: { files: uploaded } };
}

