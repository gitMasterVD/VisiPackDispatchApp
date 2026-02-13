// mockDispatches.ts
export type Priority = "P1" | "P2" | "P3";



export interface Dispatch {
  id: number;
  code: string;
  po: string;
  client: string;
  priority: Priority;
  status: "Closed" | "Need Confirmation" | "NIA";
  date: string;
  time: string;
  quantity: string | number;
  location: string;

  // ===============================
  // Role-based fields (optional)
  // ===============================
  pmPoVerified?: string | null;
  pmTimeRequired?: number | "";
  pmComments?: string;

  fgMaterial?: string | null;
  fgTime?: number | "";
  fgComments?: string;

  qcClearance?: string | null;
  qcTime?: number | "";
  qcComments?: string;

  dispatchVehicle?: string | null;
  dispatchHamali?: string | null;
  dispatchSummary?: string;
  dispatchTime?: number | "";
  dispatchComments?: string;

  financeDispatch?: string | null;
  financeChallan?: string | null;
  financeTime?: number | "";
  financeComments?: string;
}


export const mockDispatches: Dispatch[] = [
  {
    id: 1,
    client: "Gland",
    code: "GX 369",
    po: "12",
    priority: "P3",
    status: "Closed",
    date: "27.11.2025",
    time: "12:00PM",
    quantity: 200,
    location: "Dundigal - HYD",
  },
  {
    id: 2,
    client: "Gland dispatch unit 10",
    code: "GX 116",
    po: "13",
    priority: "P3",
    status: "Closed",
    date: "27.11.2025",
    time: "12:00PM",
    quantity: 1200,
    location: "Dundigal - HYD",
  },
  {
    id: 3,
    client: "Gland",
    code: "GX 509",
    po: "14",
    priority: "P3",
    status: "Closed",
    date: "27.11.2025",
    time: "12:00PM",
    quantity: 100,
    location: "PASHAMYLARAM - HYD warehouse 10",
  },
  {
    id: 4,
    client: "Gland",
    code: "GX 509",
    po: "15",
    priority: "P3",
    status: "Closed",
    date: "27.11.2025",
    time: "12:00PM",
    quantity: 1150,
    location: "PASHAMYLARAM - HYD",
  },
  {
    id: 5,
    client: "Gland",
    code: "GX 444",
    po: "16",
    priority: "P3",
    status: "Closed",
    date: "27.11.2025",
    time: "12:00PM",
    quantity: 10000,
    location: "Dundigal - HYD",
  },
  {
    id: 6,
    client: "Laurus Unit 2",
    code: "2001566",
    po: "17",
    priority: "P3",
    status: "Need Confirmation",
    date: "28.11.2025",
    time: "12:00PM",
    quantity: 1500,
    location: "DCM - 5254",
  },
  {
    id: 7,
    client: "Laurus Unit 2",
    code: "2000498",
    po: "18",
    priority: "P1",
    status: "Need Confirmation",
    date: "27.11.2025",
    time: "12:00PM",
    quantity: 500,
    location: "DCM - 5254",
  },
  {
    id: 8,
    client: "Laurus Unit 2",
    code: "2001568",
    po: "19",
    priority: "P2",
    status: "Need Confirmation",
    date: "27.11.2025",
    time: "12:00PM",
    quantity: 1100,
    location: "DCM - 5254",
  },
  {
    id: 9,
    client: "PEPSI",
    code: "OLD - Aquafine",
    po: "20",
    priority: "P2",
    status: "Need Confirmation",
    date: "28.11.2025",
    time: "12:00PM",
    quantity: "Need QTY Confirmation",
    location: "Tata Ace - Time 12pm/1pm",
  },
  {
    id: 10,
    client: "PEPSI",
    code: "Aquaves",
    po: "21",
    priority: "P2",
    status: "Need Confirmation",
    date: "28.11.2025",
    time: "12:00PM",
    quantity: "Need QTY Confirmation",
    location: "Tata Ace - Time 12pm/1pm",
  },
  {
    id: 11,
    client: "PID Unit 1",
    code: "Probond 1kg",
    po: "22",
    priority: "P3",
    status: "Need Confirmation",
    date: "28.11.2025",
    time: "12:00PM",
    quantity: "Need QTY Confirmation",
    location: "AP12V6662/DCM 5254",
  },
  {
    id: 12,
    client: "PID Unit 1",
    code: "SH 1KG",
    po: "23",
    priority: "P3",
    status: "Need Confirmation",
    date: "28.11.2025",
    time: "12:00PM",
    quantity: "Need QTY Confirmation",
    location: "AP12V6662/DCM 5254",
  },
  {
    id: 13,
    client: "PID Unit 1",
    code: "HTX 1LTR",
    po: "24",
    priority: "P3",
    status: "Need Confirmation",
    date: "28.11.2025",
    time: "12:00PM",
    quantity: "Need QTY Confirmation",
    location: "AP12V6662/DCM 5254",
  },
  {
    id: 14,
    client: "PID Unit 1",
    code: "SH 10KG",
    po: "25",
    priority: "P2",
    status: "Need Confirmation",
    date: "28.11.2025",
    time: "12:00PM",
    quantity: "Need QTY Confirmation",
    location: "AP12V6662/DCM 5254",
  },
  {
    id: 15,
    client: "PID Unit2",
    code: "UNPNTD 20KG - Partition",
    po: "26",
    priority: "P2",
    status: "Need Confirmation",
    date: "27.11.2025",
    time: "12:00PM",
    quantity: "Need QTY Confirmation",
    location: "",
  },
  {
    id: 16,
    client: "PID Unit2",
    code: "Z Partition",
    po: "27",
    priority: "P1",
    status: "Need Confirmation",
    date: "28.11.2025",
    time: "12:00PM",
    quantity: "Need QTY Confirmation",
    location: "",
  },
  {
    id: 17,
    client: "Laurus Unit4",
    code: "30mm Pads",
    po: "28",
    priority: "P1",
    status: "Need Confirmation",
    date: "28.11.2025",
    time: "12:00PM",
    quantity: 60,
    location: "Urgent need by 6:30pm",
  },
];
