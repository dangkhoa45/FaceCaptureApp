"use client";

import { useEmployees } from "@/hooks/useEmployeeList";

function EmployeeList() {
  const { data, loading, error } = useEmployees();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-blue-50 py-4 px-2 md:px-4 ">
      <div className="m-5 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Employee List</h1>
        {data.map((entry: any) => {
          const imageFields = [
            entry.custom_face_images1,
            entry.custom_face_images2,
            entry.custom_face_images3,
            entry.custom_face_images4,
            entry.custom_face_images5,
            entry.custom_face_images6,
          ];

          return (
            <div key={entry.employee} className="mb-8">
              <h2 className="text-lg font-semibold mb-2">
                {entry.employee} - {entry.employee_name}
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {imageFields.map((img: string, index: number) =>
                  img ? (
                    <div
                      key={index}
                      className="border rounded shadow-sm overflow-hidden"
                    >
                      <img
                        src={`https://dev4.tadalabs.vn${img}`}
                        alt={`Face ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ) : null
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EmployeeList;
