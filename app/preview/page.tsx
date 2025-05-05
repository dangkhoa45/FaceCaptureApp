"use client";

import { useEffect, useState } from "react";

interface Employee {
  employeeId: string;
  images: string[];
}

export default function PreviewPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/upload");
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách ảnh:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();

    const interval = setInterval(fetchImages, 2500);
    return () => clearInterval(interval);

  }, []);

  return (
    <div className="min-h-screen bg-blue-50 py-4 px-2 md:px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">
          Danh sách ảnh employee đã lưu
        </h1>
        {loading ? (
          <p className="text-gray-500">Đang tải...</p>
        ) : employees.length === 0 ? (
          <p className="text-gray-500 text-center">Chưa có ảnh nào được lưu.</p>
        ) : (
          employees.map((emp) => (
            <div
              key={emp.employeeId}
              className="bg-white shadow p-4 rounded-md my-2"
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {emp.employeeId}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {emp.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${emp.employeeId} - ${idx}`}
                    className="w-full h-auto object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
