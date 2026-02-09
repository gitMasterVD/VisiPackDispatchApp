export type Priority = "P1" | "P2" | "P3";

export const calculatePriority = (
  qty: string | number,
  status: string
): Priority => {
  // HIGH
  if (typeof qty === "string" && qty.toLowerCase().includes("need")) {
    return "P1";
  }

  // LOW
  if (status === "Closed") {
    return "P3";
  }

  // DEFAULT (as you requested)
  return "P1";
};
