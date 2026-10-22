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
  groupCount: number;
  totalDemand: number;
  collAmount: number;
  pendingDemand: number;
  collectedCount: number;
  accountCount: number;
  isFullyCollected: boolean;
  demandGenerated: boolean;
}

export interface DemandCollectionGroup {
  groupId: number;
  groupNo: string;
  groupName: string;
  collectionDay: string;
  coName: string;
  accountCount: number;
  collectedCount: number;
  totalDemand: number;
  collAmount: number;
  pendingDemand: number;
  isFullyCollected: boolean;
}

export interface DemandCollectionMember {
  accountId: number;
  memberId: number;
  groupId: number;
  groupNo: string;
  groupName: string;
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
  demandOptions: SelectOption[];
  coLoading: boolean;
  demandLoading: boolean;
  detailsLoading: boolean;
  saving: boolean;
  members: DemandCollectionMember[];
  summary: DemandCollectionSummary | null;
  groups: DemandCollectionGroup[];
  groupWise: boolean;
  showMembers: boolean;
  onAmountChange: (accountId: number, amount: string) => void;
  onCollectionDetails: () => void;
  onSave: () => void;
  onReset: () => void;
  onSahayikaChange: () => void;
}
