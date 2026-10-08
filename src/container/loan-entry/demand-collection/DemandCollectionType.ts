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

export interface DemandCollectionSummary {
  groupNo: string;
  groupName: string;
  collectionDay: string;
  totalDemand: number;
  collAmount: number;
  pendingDemand: number;
  collectedCount: number;
  accountCount: number;
  isFullyCollected: boolean;
  demandGenerated: boolean;
}

export interface DemandCollectionMember {
  accountId: number;
  memberId: number;
  memberNo: string;
  memberName: string;
  guardianName: string;
  accountLabel: string;
  loanDate: string;
  totalDemand: number;
  pendingDemand: number;
  outstanding: number;
  collAmount: number;
  isCollected: boolean;
  voucherNo: string;
  payAmount: string;
}

export interface DemandCollectionProps {
  form: UseFormReturn<DemandCollectionForm>;
  coOptions: SelectOption[];
  groupOptions: SelectOption[];
  coLoading: boolean;
  groupLoading: boolean;
  detailsLoading: boolean;
  saving: boolean;
  members: DemandCollectionMember[];
  summary: DemandCollectionSummary | null;
  showMembers: boolean;
  onAmountChange: (accountId: number, amount: string) => void;
  onCollectionDetails: () => void;
  onSave: () => void;
  onReset: () => void;
  onSahayikaChange: () => void;
}
