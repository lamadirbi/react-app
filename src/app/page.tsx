import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent font-sans">
      <header className="sticky top-0 z-20 border-b border-(--border) bg-[color-mix(in_srgb,var(--surface-2)_93%,transparent)] backdrop-blur-sm">
        <div className="mx-auto w-full max-w-6xl px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* RTL: أول عنصر يظهر يمين — الشعار */}
            <div className="flex items-center justify-center sm:justify-start">
              <BrandLogo href="/" size="lg" showTitle showTagline className="gap-3" />
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              <a href="#services" className="gc-pill-btn gc-pill-btn-outline h-9 text-sm">
                الخدمات
              </a>
              <a href="#how" className="gc-pill-btn gc-pill-btn-outline h-9 text-sm">
                كيف تعمل
              </a>
              <a href="#faq" className="gc-pill-btn gc-pill-btn-outline h-9 text-sm">
                أسئلة شائعة
              </a>
            </nav>

            <div className="flex items-center justify-center gap-2 sm:justify-end">
              <Link href="/register" className="gc-pill-btn gc-pill-btn-outline text-sm">
                إنشاء حساب
              </Link>
              <Link href="/login" className="gc-pill-btn gc-pill-btn-solid text-sm">
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative px-4 pb-12 pt-8 sm:pt-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl md:text-4xl">
              رعاية صحية آمنة ومنظمة
              <span className="mt-1 block text-(--gc-accent)">عبر استشارات طبية عن بُعد</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-(--muted)">
              منصة تربط المرضى في قطاع غزة بأطباء أخصائيين خارج القطاع — ملف طبي، مرفقات، واستشارات
              في مسار واحد واضح.
            </p>
          </div>

          <div className="mx-auto mt-8 w-full max-w-xl">
            <div className="gc-glass rounded-3xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-bold">ملف طبي + استشارة</div>
                <div className="shrink-0 rounded-full border border-(--border) bg-(--surface-2) px-3 py-1 text-xs font-semibold text-(--muted)">
                  تجريبي
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-4 text-sm">
                  <div className="font-semibold text-foreground">الأعراض</div>
                  <p className="mt-1 text-(--muted)">صداع مستمر منذ أسبوعين مع دوخة خفيفة…</p>
                </div>

                <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-4 text-sm">
                  <div className="font-semibold text-foreground">مرفقات</div>
                  <div className="mt-3 grid gap-2 text-xs">
                    <div className="flex items-center justify-between rounded-xl border border-(--border) bg-(--surface-2) px-3 py-2">
                      <span>تحاليل.pdf</span>
                      <span className="text-(--muted)">1.2 MB</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-(--border) bg-(--surface-2) px-3 py-2">
                      <span>صورة-أشعة.jpg</span>
                      <span className="text-(--muted)">620 KB</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.08)] p-4 text-sm">
                  <div className="font-semibold text-emerald-900 dark:text-emerald-100">رد الطبيب</div>
                  <p className="mt-1 text-emerald-900/90 dark:text-emerald-50">
                    يُنصح بعمل فحوصات إضافية ومتابعة ضغط الدم…
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/register" className="gc-btn gc-btn-primary">
              ابدأ الآن
            </Link>
          </div>
        </section>

        <section id="how" className="gc-steps-strip scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">كيف تعمل الخدمة؟</h2>
              <p className="mt-1 text-sm text-(--muted)">من التسجيل حتى استلام رد الطبيب</p>
              <div className="mx-auto mt-4 max-w-md gc-step-line" />
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { n: "1", t: "إنشاء حساب", d: "مريض أو طبيب." },
                { n: "2", t: "الملف الطبي", d: "تعبئة المعلومات الأساسية." },
                { n: "3", t: "إرسال الاستشارة", d: "نص ومرفقات اختيارية." },
                { n: "4", t: "رد الطبيب", d: "توصيات منظمة داخل المنصة." },
              ].map((s) => (
                <div key={s.n} className="rounded-2xl border border-(--border) bg-(--surface-2) p-4 text-center">
                  <div className="gc-step-dot mx-auto">{s.n}</div>
                  <div className="mt-2 text-sm font-semibold">{s.t}</div>
                  <div className="mt-1 text-xs text-(--muted)">{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12">
          <h2 className="text-xl font-bold">الخدمات</h2>
          <p className="mt-1 text-sm text-(--muted)">ما الذي تقدمه المنصة؟</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                t: "الاستشارة التخصصية",
                d: "إرسال تفاصيل الحالة للأطباء المختصين خارج غزة.",
              },
              {
                t: "الملف الطبي",
                d: "معلومات صحية وتاريخ مرضي في مكان واحد.",
              },
              {
                t: "رفع الملفات",
                d: "تقارير PDF وصور لدعم الاستشارة بشكل آمن.",
              },
            ].map((x) => (
              <div key={x.t} className="gc-glass rounded-2xl p-5">
                <div className="text-sm font-bold">{x.t}</div>
                <p className="mt-2 text-sm leading-6 text-(--muted)">{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-6xl px-4 py-12 scroll-mt-20">
          <h2 className="text-xl font-bold">أسئلة شائعة</h2>
          <div className="mt-4 grid gap-2">
            {[
              {
                q: "هل بياناتي آمنة؟",
                a: "نعم، الوصول محصور بالأطراف المصرح لها، وتنزيل الملفات عبر مسار محمٍ.",
              },
              {
                q: "هل يعمل على إنترنت ضعيف؟",
                a: "واجهة بسيطة وموبايل أولاً قدر الإمكان.",
              },
              {
                q: "هل يمكن إرفاق ملفات؟",
                a: "نعم، يمكن رفع PDF وصور مع الاستشارة.",
              },
            ].map((x) => (
              <details key={x.q} className="gc-glass rounded-2xl p-4">
                <summary className="cursor-pointer text-sm font-semibold">{x.q}</summary>
                <p className="mt-2 text-sm leading-7 text-(--muted)">{x.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-(--border) bg-[color-mix(in_srgb,var(--surface-2)_88%,transparent)] py-6 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo href="/" size="md" showTitle />
          <p className="text-xs text-(--muted) sm:text-sm">
            © {new Date().getFullYear()} — منصة استشارات طبية عن بُعد
          </p>
        </div>
      </footer>
    </div>
  );
}
