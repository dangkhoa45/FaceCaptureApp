"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface EmployeeImage {
  step: string;
  url: string;
}

interface UploadedEntry {
  employeeId: string;
  urls: EmployeeImage[];
}

export default function FaceList() {
  const [data, setData] = useState<UploadedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUploaded = async () => {
      try {
        const res = await fetch("/api/list-cloudinary");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu Cloudinary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUploaded();
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách ảnh đã upload</h1>
      {data.map((entry) => (
        <div key={entry.employeeId} className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-blue-700">
            {entry.employeeId}
          </h2>
          <div className="flex gap-2">
            {entry.urls.map((img) => (
              <div key={img.step}>
                <Image
                  src={img.url}
                  alt={img.step}
                  width={200}
                  height={200}
                  className="rounded-xs shadow object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
