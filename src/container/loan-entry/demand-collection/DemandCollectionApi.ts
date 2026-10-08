import { DemandCollectionMember } from "./DemandCollectionType";

export interface DummyGroup {
  Group_Id: number;
  Group_No: string;
  Group_Name: string;
  members: DemandCollectionMember[];
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
            Member_Id: 10101,
            Member_No: "M10101",
            Member_Name: "Sabita Nayak",
            FatHusb_Name: "Ramesh Nayak",
            Loan_Date: "2026-01-12",
            Loan_Amount: 20000,
            Installment_Amt: 850,
            Outs_Amount: 12500,
            Demand: 850,
          },
          {
            Member_Id: 10102,
            Member_No: "M10102",
            Member_Name: "Laxmi Behera",
            FatHusb_Name: "Suresh Behera",
            Loan_Date: "2026-02-04",
            Loan_Amount: 15000,
            Installment_Amt: 720,
            Outs_Amount: 9000,
            Demand: 720,
          },
          {
            Member_Id: 10103,
            Member_No: "M10103",
            Member_Name: "Kuntala Das",
            FatHusb_Name: "Bikash Das",
            Loan_Date: "2025-11-18",
            Loan_Amount: 25000,
            Installment_Amt: 1100,
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
            Member_Id: 10201,
            Member_No: "M10201",
            Member_Name: "Pramila Swain",
            FatHusb_Name: "Ajay Swain",
            Loan_Date: "2026-03-02",
            Loan_Amount: 18000,
            Installment_Amt: 640,
            Outs_Amount: 7600,
            Demand: 640,
          },
          {
            Member_Id: 10202,
            Member_No: "M10202",
            Member_Name: "Sandhya Rout",
            FatHusb_Name: "Manoj Rout",
            Loan_Date: "2025-12-09",
            Loan_Amount: 12000,
            Installment_Amt: 500,
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
            Member_Id: 20101,
            Member_No: "M20101",
            Member_Name: "Basanti Jena",
            FatHusb_Name: "Prakash Jena",
            Loan_Date: "2026-01-20",
            Loan_Amount: 30000,
            Installment_Amt: 1350,
            Outs_Amount: 21000,
            Demand: 1350,
          },
          {
            Member_Id: 20102,
            Member_No: "M20102",
            Member_Name: "Reena Sahoo",
            FatHusb_Name: "Deba Sahoo",
            Loan_Date: "2026-04-11",
            Loan_Amount: 10000,
            Installment_Amt: 480,
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
            Member_Id: 20201,
            Member_No: "M20201",
            Member_Name: "Mamata Barik",
            FatHusb_Name: "Santosh Barik",
            Loan_Date: "2025-10-15",
            Loan_Amount: 22000,
            Installment_Amt: 980,
            Outs_Amount: 15000,
            Demand: 980,
          },
          {
            Member_Id: 20202,
            Member_No: "M20202",
            Member_Name: "Padmini Mohanty",
            FatHusb_Name: "Ranjit Mohanty",
            Loan_Date: "2026-02-28",
            Loan_Amount: 16000,
            Installment_Amt: 760,
            Outs_Amount: 8800,
            Demand: 760,
          },
          {
            Member_Id: 20203,
            Member_No: "M20203",
            Member_Name: "Urmila Parida",
            FatHusb_Name: "Gopal Parida",
            Loan_Date: "2026-03-16",
            Loan_Amount: 14000,
            Installment_Amt: 590,
            Outs_Amount: 6100,
            Demand: 590,
          },
        ],
      },
    ],
  },
];
