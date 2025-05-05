
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function GET() {
  try {
    const result = await cloudinary.search
      .expression("folder:face-captures/*")
      .sort_by("public_id", "desc")
      .max_results(100)
      .execute();

    const grouped: Record<string, EmployeeImage[]> = {};

    result.resources.forEach((res: any) => {
      const parts = res.public_id.split("/");
      const employeeId = parts[1];
      const step = parts[2] || "unknown";

      if (!grouped[employeeId]) grouped[employeeId] = [];
      grouped[employeeId].push({ step, url: res.secure_url });
    });

    const data = Object.entries(grouped).map(([employeeId, urls]) => ({
      employeeId,
      urls,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Lỗi lấy danh sách từ Cloudinary:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

interface EmployeeImage {
  step: string;
  url: string;
}
