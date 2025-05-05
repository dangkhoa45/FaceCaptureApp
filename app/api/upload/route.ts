import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

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
    const { images, step, employeeId } = body;

    if (
      !images ||
      !Array.isArray(images) ||
      images.length === 0 ||
      !employeeId
    ) {
      return NextResponse.json(
        { error: "Missing images or employeeId" },
        { status: 400 }
      );
    }

    const employeeDir = path.join(
      process.cwd(),
      "public/employee_images",
      employeeId
    );

    if (!fs.existsSync(employeeDir)) {
      fs.mkdirSync(employeeDir, { recursive: true });
    }

    images.forEach((image: string, index: number) => {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      const stepName = Array.isArray(step) ? step[index] : `step_${index + 1}`;
      const filePath = path.join(employeeDir, `${stepName}.jpg`);

      fs.writeFileSync(filePath, base64Data, "base64");
    });

    return NextResponse.json({
      message: `Images for ${employeeId} uploaded successfully.`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
