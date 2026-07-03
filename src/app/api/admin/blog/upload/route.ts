import { NextRequest, NextResponse } from "next/server";
import { uploadToCRM } from "@/lib/crm/upload";

// Inline image upload for the blog editor. Uses the same CRM media pipeline as
// the rest of the admin (via the shared uploadToCRM helper) but returns just
// the URL — it does NOT write to the CMS MediaAssets table, since inline blog
// images aren't keyed page/html-id assets. Protected by the admin middleware
// (every /api/admin/** route requires a valid session).

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image must be under 10MB" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image type (use JPG, PNG, WEBP, GIF or AVIF)" },
        { status: 400 }
      );
    }

    const url = await uploadToCRM(file, "blog");
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[POST /api/admin/blog/upload]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 502 }
    );
  }
}
