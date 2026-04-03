"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, downloadWithAuth } from "@/lib/api";
import { uploadMedicalFiles } from "@/lib/medicalFiles";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { triggerBlobDownload } from "@/components/BlobDownload";

type Consultation = {
  id: number;
  question_text: string;
  status: "pending" | "completed";
  submitted_at: string;
  responded_at?: string | null;
  physician_response?: string | null;
  patient?: { id: number; name: string; role: string };
};

type CertificateFileRef = {
  id: number;
  original_name: string;
  mime_type?: string | null;
  file_kind?: string | null;
};

type PhysicianProfile = {
  specialty: string;
  certificate: string;
  certificate_file_id?: number | null;
  certificate_file_ids?: number[];
  certificateFile?: CertificateFileRef | null;
  certificateFiles?: CertificateFileRef[];
};
type PhysicianProfileResponse = { profile: PhysicianProfile };

function normalizePhysicianProfile(raw: any): PhysicianProfile {
  const fromRel = raw?.certificate_files ?? raw?.certificateFiles ?? [];
  const arr: CertificateFileRef[] = Array.isArray(fromRel)
    ? fromRel.map((f: any) => ({
        id: f.id,
        original_name: f.original_name,
        mime_type: f.mime_type ?? null,
        file_kind: f.file_kind ?? null,
      }))
    : [];
  const cf = raw?.certificate_file ?? raw?.certificateFile;
  const legacy =
    cf && arr.length === 0
      ? [
          {
            id: cf.id,
            original_name: cf.original_name,
            mime_type: cf.mime_type ?? null,
            file_kind: cf.file_kind ?? null,
          },
        ]
      : [];
  const certificateFiles = arr.length ? arr : legacy;
  const idsRaw = raw?.certificate_file_ids;
  const certificate_file_ids = Array.isArray(idsRaw)
    ? idsRaw.map((x: any) => Number(x)).filter((n: number) => !Number.isNaN(n))
    : certificateFiles.map((f) => f.id);

  return {
    specialty: raw?.specialty ?? "",
    certificate: raw?.certificate ?? "",
    certificate_file_id: certificateFiles[0]?.id ?? raw?.certificate_file_id ?? null,
    certificate_file_ids,
    certificateFile: certificateFiles[0] ?? null,
    certificateFiles,
  };
}

export function PhysicianProfilePanel({ initialProfile }: { initialProfile?: any }) {
  const [profile, setProfile] = useState<PhysicianProfile | null>(() =>
    initialProfile ? normalizePhysicianProfile(initialProfile) : null,
  );
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [certificateUploading, setCertificateUploading] = useState(false);
  const [certPreviewMap, setCertPreviewMap] = useState<
    Record<number, { url: string; kind: "image" | "pdf" }>
  >({});

  const certificateList = useMemo(() => {
    if (!profile) return [];
    if (profile.certificateFiles?.length) return profile.certificateFiles;
    if (profile.certificateFile) return [profile.certificateFile];
    return [];
  }, [profile]);

  const certFilesKey = useMemo(() => certificateList.map((f) => f.id).join(","), [certificateList]);

  useEffect(() => {
    let mounted = true;
    apiFetch<PhysicianProfileResponse>("/physician-profile")
      .then((res) => {
        if (!mounted) return;
        if (!res.ok) return;
        setProfile(normalizePhysicianProfile(res.data.profile));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  function isCertificateFileImage(f: CertificateFileRef | null | undefined) {
    if (!f) return false;
    const mime = f.mime_type ?? "";
    const name = f.original_name ?? "";
    if (mime.startsWith("image/")) return true;
    if (f.file_kind === "image") return true;
    return /\.(jpe?g|png|gif|webp|bmp)$/i.test(name);
  }

  function isCertificateFilePdf(f: CertificateFileRef | null | undefined) {
    if (!f) return false;
    const mime = f.mime_type ?? "";
    const name = f.original_name ?? "";
    if (mime === "application/pdf" || mime.includes("pdf")) return true;
    if (f.file_kind === "pdf") return true;
    return name.toLowerCase().endsWith(".pdf");
  }

  useEffect(() => {
    if (!certFilesKey) {
      setCertPreviewMap((prev) => {
        Object.values(prev).forEach((v) => URL.revokeObjectURL(v.url));
        return {};
      });
      return;
    }
    const previewable = certificateList.filter((f) => isCertificateFileImage(f) || isCertificateFilePdf(f));
    if (!previewable.length) {
      setCertPreviewMap((prev) => {
        Object.values(prev).forEach((v) => URL.revokeObjectURL(v.url));
        return {};
      });
      return;
    }

    const next: Record<number, { url: string; kind: "image" | "pdf" }> = {};
    const urlsToRevoke: string[] = [];
    let cancelled = false;

    (async () => {
      for (const f of previewable) {
        if (cancelled) break;
        const res = await downloadWithAuth(`/medical-files/${f.id}/download`);
        if (cancelled || !res.ok) continue;
        const url = URL.createObjectURL(res.data.blob);
        urlsToRevoke.push(url);
        next[f.id] = { url, kind: isCertificateFilePdf(f) ? "pdf" : "image" };
      }
      if (!cancelled) setCertPreviewMap(next);
    })();

    return () => {
      cancelled = true;
      urlsToRevoke.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [certFilesKey, certificateList]);

  async function saveProfile() {
    if (!profile) return;
    setSavingProfile(true);
    setProfileMsg(null);
    const ids = certificateList.map((f) => f.id);
    const res = await apiFetch<PhysicianProfileResponse>("/physician-profile", {
      method: "PUT",
      body: JSON.stringify({
        specialty: profile.specialty,
        certificate: profile.certificate ?? "",
        certificate_file_ids: ids,
      }),
    });
    setSavingProfile(false);
    if (!res.ok) {
      setProfileMsg(res.message);
      return;
    }
    setProfile(normalizePhysicianProfile(res.data.profile));
    setProfileMsg("تم حفظ معلومات الطبيب");
    setEditingProfile(false);
  }

  async function uploadCertificateFiles(toUpload: File[]) {
    if (!profile || toUpload.length === 0) return;
    setCertificateUploading(true);
    setProfileMsg(null);

    const up = await uploadMedicalFiles(toUpload);
    if (!up.ok) {
      setCertificateUploading(false);
      setProfileMsg(up.message);
      return;
    }
    const newRefs: CertificateFileRef[] = up.data.files.map((row) => ({
      id: row.id,
      original_name: row.original_name ?? "certificate",
      mime_type: row.mime_type ?? null,
      file_kind: row.file_kind ?? null,
    }));

    const mergedFiles = [...certificateList, ...newRefs];
    const mergedIds = mergedFiles.map((f) => f.id);
    const next: PhysicianProfile = {
      ...profile,
      certificateFiles: mergedFiles,
      certificate_file_ids: mergedIds,
      certificateFile: mergedFiles[0] ?? null,
      certificate_file_id: mergedIds[0] ?? null,
    };
    setProfile(next);
    setCertificateUploading(false);

    if (next.specialty?.trim()) {
      const saveRes = await apiFetch<PhysicianProfileResponse>("/physician-profile", {
        method: "PUT",
        body: JSON.stringify({
          specialty: next.specialty,
          certificate: next.certificate ?? "",
          certificate_file_ids: mergedIds,
        }),
      });
      if (saveRes.ok) {
        setProfile(normalizePhysicianProfile(saveRes.data.profile));
        setProfileMsg(newRefs.length > 1 ? `تم رفع ${newRefs.length} مرفقات وحفظها.` : "تم رفع مرفق الشهادة وحفظه.");
        return;
      }
      setProfileMsg(saveRes.message || "تم الرفع؛ اضغط حفظ لإرفاق الملفات.");
      return;
    }
    setProfileMsg("تم رفع الملفات. عيّن التخصص ثم احفظ لتثبيت المرفقات.");
  }

  function removeCertificateAt(index: number) {
    setProfile((p) => {
      if (!p) return p;
      const list = p.certificateFiles?.length ? [...p.certificateFiles] : p.certificateFile ? [p.certificateFile] : [];
      const nextList = list.filter((_, i) => i !== index);
      const ids = nextList.map((f) => f.id);
      return {
        ...p,
        certificateFiles: nextList,
        certificate_file_ids: ids,
        certificateFile: nextList[0] ?? null,
        certificate_file_id: ids[0] ?? null,
      };
    });
  }

  async function downloadCertificateFile(fileId: number, fallbackName: string) {
    const res = await downloadWithAuth(`/medical-files/${fileId}/download`);
    if (!res.ok) {
      setProfileMsg(res.message);
      return;
    }
    triggerBlobDownload(res.data.blob, res.data.filename ?? fallbackName);
  }

  return (
    <Card>
      <CardBody className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">ملف الطبيب</div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              هذه المعلومات ستظهر للمريض عند الرد على الاستشارة.
            </div>
          </div>
        </div>

        {profileMsg ? (
          <div className="mt-3">
            <Alert variant={profileMsg.includes("تم") ? "success" : "info"}>{profileMsg}</Alert>
          </div>
        ) : null}

        {profile ? (
          <>
            <div className="mt-4 grid gap-3 text-sm text-zinc-700 dark:text-zinc-200 sm:grid-cols-2">
              <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">التخصص</div>
                <div className="mt-1 font-medium">{profile.specialty?.trim() ? profile.specialty : "غير محدد"}</div>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 sm:col-span-2">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  مرفقات الشهادة{certificateList.length > 1 ? ` (${certificateList.length})` : ""}
                </div>
                {certificateList.length ? (
                  <p className="mt-1 text-xs text-(--muted)">يوجد مرفق (مرفقات) محفوظ.</p>
                ) : (
                  <div className="mt-1 text-sm font-medium text-(--muted)">غير مرفق</div>
                )}
                {certificateList.length ? (
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {certificateList.map((cf, idx) => {
                      const prev = certPreviewMap[cf.id];
                      return (
                        <div key={`${cf.id}-${idx}`} className="overflow-hidden rounded-xl border border-(--border) bg-(--surface)">
                          {prev?.kind === "image" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={prev.url} alt="" className="max-h-48 w-full object-contain" />
                          ) : null}
                          {prev?.kind === "pdf" ? (
                            <div className="h-48">
                              <iframe title="معاينة PDF" src={prev.url} className="h-full w-full border-0" />
                            </div>
                          ) : null}
                          <div className="flex justify-end border-t border-(--border) px-2 py-2">
                            <Button type="button" variant="secondary" size="sm" onClick={() => downloadCertificateFile(cf.id, cf.original_name)}>
                              تنزيل
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 sm:col-span-2">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">وصف الشهادة / المؤهل</div>
                <div className="mt-1 whitespace-pre-wrap font-medium">{profile.certificate?.trim() ? profile.certificate : "—"}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <Button
                type="button"
                variant={editingProfile ? "secondary" : "primary"}
                size="sm"
                onClick={() => {
                  setProfileMsg(null);
                  setEditingProfile((v) => !v);
                }}
              >
                {editingProfile ? "إخفاء التعديل" : "تعديل المعلومات"}
              </Button>
            </div>

            {editingProfile ? (
              <div className="mt-4 grid gap-4 rounded-2xl border border-(--border) bg-(--surface-2) p-4">
                <label className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">التخصص</span>
                  <input
                    value={profile.specialty}
                    onChange={(e) => setProfile((p) => (p ? { ...p, specialty: e.target.value } : p))}
                    className="h-11 rounded-xl border border-(--border) bg-(--surface) px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-(--ring) dark:text-zinc-50"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">وصف الشهادة / المؤهل (اختياري)</span>
                  <textarea
                    value={profile.certificate}
                    onChange={(e) => setProfile((p) => (p ? { ...p, certificate: e.target.value } : p))}
                    rows={4}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:focus:ring-white/10"
                  />
                </label>

                <div className="grid gap-2">
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">مرفقات الشهادة (اختياري — صور أو PDF، أكثر من ملف)</div>
                  <input
                    type="file"
                    multiple
                    aria-label="مرفقات الشهادة"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const picked = Array.from(e.target.files ?? []);
                      e.target.value = "";
                      if (picked.length) void uploadCertificateFiles(picked);
                    }}
                    className="block w-full text-sm text-zinc-700 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-900 hover:file:bg-zinc-200 dark:text-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-50 dark:hover:file:bg-zinc-700"
                  />
                  {certificateUploading ? <div className="text-xs text-zinc-500 dark:text-zinc-400">جاري رفع الملفات...</div> : null}

                  {certificateList.length ? (
                    <ul className="mt-1 grid gap-2 text-sm">
                      {certificateList.map((cf, idx) => (
                        <li key={`${cf.id}-${idx}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-(--border) bg-(--surface) px-3 py-2">
                          <span className="min-w-0 truncate text-xs text-(--muted)">#{idx + 1} — {cf.original_name}</span>
                          <div className="flex shrink-0 gap-1">
                            <Button type="button" variant="secondary" size="sm" onClick={() => downloadCertificateFile(cf.id, cf.original_name)}>
                              تنزيل
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeCertificateAt(idx)}>
                              إزالة
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">لا يوجد ملف مرفق حالياً.</div>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingProfile(false);
                      setProfileMsg(null);
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button type="button" onClick={saveProfile} disabled={savingProfile || !profile?.specialty?.trim()}>
                    {savingProfile ? "جاري الحفظ..." : "حفظ التعديل"}
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">جاري تحميل معلومات الطبيب...</div>
        )}
      </CardBody>
    </Card>
  );
}

