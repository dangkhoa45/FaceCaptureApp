import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function GET() {
  const baseDir = path.join(process.cwd(), "public/employee_images");

  try {
    if (!fs.existsSync(baseDir)) {
      return NextResponse.json({ employees: [] });
    }

    const employeeDirs = fs
      .readdirSync(baseDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    const result = employeeDirs.map((employeeId) => {
      const employeePath = path.join(baseDir, employeeId);
      const imageFiles = fs
        .readdirSync(employeePath)
        .filter(
          (f) => f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png")
        );

      return {
        employeeId,
        images: imageFiles.map(
          (img) => `/employee_images/${employeeId}/${img}`
        ),
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error reading image folders:", error);
    return NextResponse.json(
      { error: "Unable to read image list" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { employeeId, images, step } = body;

    if (!employeeId || !images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: "Thiếu dữ liệu upload" },
        { status: 400 }
      );
    }

    const uploadedUrls = await Promise.all(
      images.map((base64: string, index: number) =>
        cloudinary.uploader.upload(base64, {
          folder: `face-captures/${employeeId}`,
          public_id: step?.[index] || `step_${index + 1}`,
        })
      )
    );

    return NextResponse.json({
      message: "Upload thành công",
      urls: uploadedUrls.map((r) => r.secure_url),
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Lỗi khi upload Cloudinary" },
      { status: 500 }
    );
  }
}
