/* eslint-disable @typescript-eslint/no-explicit-any */
import { DemandRow } from "./DemandGenerationType";

export interface DummyDemandMember {
  Member_No: string;
  Member_Name: string;
  FatHusb_Name: string;
  Loan_Amount: number;
  Outs_Amount: number;
  Demand: number;
}

export interface DummyGroup {
  Group_Id: number;
  Group_No: string;
  Group_Name: string;
  members: DummyDemandMember[];
}

export interface DummySahayika {
  CO_Id: number;
  CO_Name: string;
  CO_Code: string;
  groups: DummyGroup[];
}

export const dummySahayikaList: DummySahayika[] = [
  {
    CO_Id: 1,
    CO_Name: "Anita Devi",
    CO_Code: "CO001",
    groups: [
      {
        Group_Id: 101,
        Group_No: "GRP101",
        Group_Name: "Maa Sarala",
        members: [
          {
            Member_No: "M10101",
            Member_Name: "Sabita Nayak",
            FatHusb_Name: "Ramesh Nayak",
            Loan_Amount: 20000,
            Outs_Amount: 12500,
            Demand: 850,
          },
          {
            Member_No: "M10102",
            Member_Name: "Laxmi Behera",
            FatHusb_Name: "Suresh Behera",
            Loan_Amount: 15000,
            Outs_Amount: 9000,
            Demand: 720,
          },
          {
            Member_No: "M10103",
            Member_Name: "Kuntala Das",
            FatHusb_Name: "Bikash Das",
            Loan_Amount: 25000,
            Outs_Amount: 18000,
            Demand: 1100,
          },
        ],
      },
      {
        Group_Id: 102,
        Group_No: "GRP102",
        Group_Name: "Jagannath SHG",
        members: [
          {
            Member_No: "M10201",
            Member_Name: "Pramila Swain",
            FatHusb_Name: "Ajay Swain",
            Loan_Amount: 18000,
            Outs_Amount: 7600,
            Demand: 640,
          },
          {
            Member_No: "M10202",
            Member_Name: "Sandhya Rout",
            FatHusb_Name: "Manoj Rout",
            Loan_Amount: 12000,
            Outs_Amount: 5400,
            Demand: 500,
          },
        ],
      },
    ],
  },
  {
    CO_Id: 2,
    CO_Name: "Sunita Malik",
    CO_Code: "CO002",
    groups: [
      {
        Group_Id: 201,
        Group_No: "GRP201",
        Group_Name: "Maa Tarini",
        members: [
          {
            Member_No: "M20101",
            Member_Name: "Basanti Jena",
            FatHusb_Name: "Prakash Jena",
            Loan_Amount: 30000,
            Outs_Amount: 21000,
            Demand: 1350,
          },
          {
            Member_No: "M20102",
            Member_Name: "Reena Sahoo",
            FatHusb_Name: "Deba Sahoo",
            Loan_Amount: 10000,
            Outs_Amount: 4200,
            Demand: 480,
          },
        ],
      },
      {
        Group_Id: 202,
        Group_No: "GRP202",
        Group_Name: "Shakti Group",
        members: [
          {
            Member_No: "M20201",
            Member_Name: "Mamata Barik",
            FatHusb_Name: "Santosh Barik",
            Loan_Amount: 22000,
            Outs_Amount: 15000,
            Demand: 980,
          },
          {
            Member_No: "M20202",
            Member_Name: "Padmini Mohanty",
            FatHusb_Name: "Ranjit Mohanty",
            Loan_Amount: 16000,
            Outs_Amount: 8800,
            Demand: 760,
          },
          {
            Member_No: "M20203",
            Member_Name: "Urmila Parida",
            FatHusb_Name: "Gopal Parida",
            Loan_Amount: 14000,
            Outs_Amount: 6100,
            Demand: 590,
          },
        ],
      },
    ],
  },
];

export const extractList = (res: any): any[] => {
  const candidates = [
    res?.Data,
    res?.details,
    res?.data?.Data,
    res?.data?.details,
    res?.data?.data,
    res?.data,
    res,
  ];
  const list = candidates.find((item) => Array.isArray(item));
  return Array.isArray(list) ? list : [];
};

const pick = (item: any, keys: string[]) => {
  if (!item) return "";
  for (const key of keys) {
    const value = item[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
};

const pickPositive = (item: any, keys: string[]) => {
  for (const key of keys) {
    const value = item?.[key];
    if (value === undefined || value === null || String(value).trim() === "") {
      continue;
    }
    const amount = Number(value);
    if (!Number.isNaN(amount) && amount > 0) return value;
  }
  return "";
};

export const mapDemandRows = (list: any[]): DemandRow[] =>
  list.map((item, index) => ({
    sl: index + 1,
    memberNo: String(
      pick(item, ["Member_No", "Mem_No", "mem_no", "Member_Code", "Mem_Code"]) ||
        "",
    ),
    memberName: String(
      pick(item, ["Member_Name", "Mem_Name", "mem_name"]) || "",
    ),
    guardianName: String(
      pick(item, ["FatHusb_Name", "Guardian_Name", "Gurdain_Name"]) || "",
    ),
    loanAmount:
      pick(item, ["Loan_Amount", "Sanc_Amount", "Disb_Amount", "Loan_Amt"]) ||
      0,
    outstanding:
      pickPositive(item, [
        "Outs_Amount",
        "Outstanding_Balance",
        "Curr_Balance",
        "Current_Balance",
        "Curr_Bal",
        "Realisable_Amt",
        "Resilable_Amt",
      ]) || 0,
    demand:
      pickPositive(item, [
        "Demand",
        "Demand_Amt",
        "Demand_Amount",
        "Due_Amount",
        "Due_Amt",
        "Coll_Demand",
        "Inst_Demand",
      ]) ||
      pick(item, ["Installment_Amt", "Inst_Amount", "Inst_Amt"]) ||
      0,
  }));
