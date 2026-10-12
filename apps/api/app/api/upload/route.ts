import { NextRequest, NextResponse } from "next/server";
import { getAuthedUser, requireRole } from "@/lib/auth";
import { signUpload } from "@/lib/cloudinary";

// POST /api/upload — vendor requests signed params, then uploads the file
// directly from their browser/app straight to Cloudinary (server never
// touches the image bytes). Body: { folder?: string }
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req);
  const denied = requireRole(user, "vendor", "admin");
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const folder = body.folder || `zooli/stores/${user!.storeId ?? "unknown"}/products`;

  try {
    const params = signUpload(folder);
    return NextResponse.json(params);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
