import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "public/employee_images");

  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const folders = fs
      .readdirSync(dir)
      .filter((name) => /^HR-EMP-\d{7}$/.test(name));

    const maxId = folders
      .map((name) => parseInt(name.replace("HR-EMP-", ""), 10))
      .filter(Number.isFinite)
      .reduce((a, b) => Math.max(a, b), 0);

    const nextId = (maxId + 1).toString().padStart(7, "0");
    return NextResponse.json({ id: `HR-EMP-${nextId}` });
  } catch (e) {
    console.error("Error generating next employee ID:", e);
    return NextResponse.json(
      { error: "Failed to get next ID" },
      { status: 500 }
    );
  }
}
