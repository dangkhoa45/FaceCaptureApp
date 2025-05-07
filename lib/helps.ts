export const getNextIdFromEmployees = (employees: any[]): string => {
  const prefix = "HR-EMP-";
  const maxNum = employees
    .map((emp) => {
      const match = emp.name?.match(/^HR-EMP-(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num) => num !== null) as number[];

  const nextNumber = Math.max(0, ...maxNum) + 1;
  const padded = nextNumber.toString().padStart(5, "0");
  return `${prefix}${padded}`;
};
