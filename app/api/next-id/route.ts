import { cloudinary } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let folders: string[] = [];

    try {
      const result = await cloudinary.api.sub_folders("face-captures");
      folders = result.folders?.map((f: any) => f.name) || [];
    } catch (subErr) {
      if ((subErr as { http_code?: number }).http_code === 404) {
        folders = [];
      } else {
        throw subErr;
      }
    }

    const filtered = folders.filter((name) => /^HR-EMP-\d{7}$/.test(name));

    const maxId = filtered
      .map((name) => parseInt(name.replace("HR-EMP-", ""), 10))
      .filter(Number.isFinite)
      .reduce((a, b) => Math.max(a, b), 0);

    const nextId = (maxId + 1).toString().padStart(7, "0");

    return NextResponse.json({ id: `HR-EMP-${nextId}` });
  } catch (err) {
    console.error("Cloudinary folder fetch failed", err);
    return NextResponse.json(
      { error: "Lỗi khi lấy ID từ Cloudinary" },
      { status: 500 }
    );
  }
}
