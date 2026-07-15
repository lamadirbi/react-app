"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  files: File[];
  onRemoveAt: (index: number) => void;
};

function fileKey(f: File) {
  return `${f.name}:${f.size}:${f.lastModified}`;
}

function slotKey(index: number, f: File) {
  return `${index}__${fileKey(f)}`;
}

function isImageFile(f: File) {
  if (f.type?.toLowerCase().startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?|$)/i.test(f.name);
}

function isPdfFile(f: File) {
  if (f.type?.toLowerCase() === "application/pdf") return true;
  return f.name.toLowerCase().endsWith(".pdf");
}

function formatBytes(bytes: number) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let b = bytes;
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i += 1;
  }
  return `${b.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function fileKindLabel(f: File) {
  if (isImageFile(f)) return "صورة";
  if (isPdfFile(f)) return "PDF";
  return "مرفق";
}

/** يعرض ملفات تم اختيارها محلياً مع قصّ آمن لأسماء الملفات الطويلة على الجوال */
export function SelectedLocalFilesList({ files, onRemoveAt }: Props) {
  const key = useMemo(() => files.map((f, i) => slotKey(i, f)).join(","), [files]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!isImageFile(f)) continue;
      next[slotKey(i, f)] = URL.createObjectURL(f);
    }
    setPreviewUrls((prev) => {
      Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
      return next;
    });
    return () => {
      Object.values(next).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [key]);

  return (
    <ul className="gc-selected-files">
      {files.map((f, idx) => {
        const slot = slotKey(idx, f);
        const previewUrl = isImageFile(f) ? previewUrls[slot] : null;
        const sizeLabel = formatBytes(f.size);

        return (
          <li key={slot} className="gc-selected-file-row">
            <div className="gc-selected-file-thumb" aria-hidden>
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="" />
              ) : (
                <span>{isPdfFile(f) ? "PDF" : "FILE"}</span>
              )}
            </div>

            <div className="gc-selected-file-meta">
              <p className="gc-selected-file-name" title={f.name}>
                {f.name}
              </p>
              <p className="gc-selected-file-sub">
                <span>{fileKindLabel(f)}</span>
                {sizeLabel ? (
                  <>
                    <span aria-hidden> · </span>
                    <span dir="ltr">{sizeLabel}</span>
                  </>
                ) : null}
              </p>
            </div>

            <button
              type="button"
              className="gc-file-remove-btn"
              onClick={() => onRemoveAt(idx)}
              aria-label={`حذف ${f.name}`}
              title="حذف"
            >
              حذف
            </button>
          </li>
        );
      })}
    </ul>
  );
}
