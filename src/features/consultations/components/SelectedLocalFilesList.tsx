"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

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

function formatBytes(bytes: number) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let b = bytes;
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  return `${b.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** يعرض ملفات تم اختيارها محلياً مع معاينة للصور + حذف */
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
    <div className="grid gap-2">
      {files.map((f, idx) => {
        const isImg = isImageFile(f);
        const slot = slotKey(idx, f);
        const previewUrl = isImg ? previewUrls[slot] : null;

        if (isImg && previewUrl) {
          return (
            <LocalPreviewCard
              key={slot}
              previewUrl={previewUrl}
              meta={`${formatBytes(f.size)}${f.type ? ` — ${f.type}` : ""}`}
              onRemove={() => onRemoveAt(idx)}
            />
          );
        }

        return (
          <div
            key={slot}
            className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="min-w-0">
              <div className="truncate font-medium text-zinc-900 dark:text-zinc-50">{f.name}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                <span dir="ltr">{formatBytes(f.size)}</span>
                {f.type ? (
                  <>
                    {" "}
                    — <span dir="ltr">{f.type}</span>
                  </>
                ) : null}
              </div>
            </div>
            <Button type="button" variant="danger" size="sm" onClick={() => onRemoveAt(idx)}>
              حذف
            </Button>
          </div>
        );
      })}
    </div>
  );
}

function LocalPreviewCard({
  previewUrl,
  meta,
  onRemove,
}: {
  previewUrl: string;
  meta: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt=""
        className="mx-auto max-h-56 w-full rounded-lg border border-zinc-200 object-contain dark:border-zinc-800"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span dir="ltr">{meta}</span>
        </div>
        <Button type="button" variant="danger" size="sm" onClick={onRemove}>
          حذف
        </Button>
      </div>
    </div>
  );
}

