import { UseFormReturn } from "react-hook-form";

export interface DemandCollectionForm {
  collectionDate: string | Date | null;
  co_id: number | "";
  group_id: number | "";
}

export interface SelectOption {
  label: string;
  value: number;
}

export interface DemandCollectionMember {
  Member_Id: number;
  Member_No: string;
  Member_Name: string;
  FatHusb_Name: string;
  Loan_Date: string;
  Loan_Amount: number;
  Installment_Amt: number;
  Outs_Amount: number;
  Demand: number;
}

export interface DemandCollectionProps {
  form: UseFormReturn<DemandCollectionForm>;
  coOptions: SelectOption[];
  groupOptions: SelectOption[];
  members: DemandCollectionMember[];
  showMembers: boolean;
  selectedMemberIds: number[];
  onToggleMember: (memberId: number, checked: boolean) => void;
  onCollectionDetails: () => void;
  onSend: () => void;
  onReset: () => void;
  onSahayikaChange: () => void;
}
