import fs from "node:fs/promises";
import path from "node:path";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Icon() {
  const filePath = path.join(process.cwd(), "public", "logo.png");
  const buf = await fs.readFile(filePath);

  // eslint-disable-next-line @next/next/no-img-element
  return new Response(
    buf,
    {
      headers: {
        "Content-Type": "image/png",
        // Browsers aggressively cache tab icons; avoid "immutable" so updates reflect.
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

