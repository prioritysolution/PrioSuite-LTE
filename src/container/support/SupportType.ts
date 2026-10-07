export type SupportPriority = "Low" | "Medium" | "High" | "Urgent";

export const SUPPORT_PRIORITY_OPTIONS: { value: SupportPriority; label: string }[] = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Urgent", label: "Urgent" },
];

export const SUPPORT_MAX_FILES = 5;
export const SUPPORT_MAX_FILE_SIZE_MB = 5;
export const SUPPORT_ACCEPTED_FILE_TYPES =
  ".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt";

export interface ISupportTicket {
  id: string | number;
  ticketNo: string;
  subject: string;
  issue: string;
  priority: string;
  status: string;
  attachmentCount: number;
  createdAt: string;
}

export interface ISupportFormInput {
  subject: string;
  issue: string;
  priority: SupportPriority | "";
  attachments: File[];
}
