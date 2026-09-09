"use client";

import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Info,
  Calendar,
  User,
  Shield,
  Percent,
  Calculator,
  Users,
  Wallet,
  Save,
} from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputField from "@/common/formFields/InputField";
import { useLoanIssue } from "@/container/loan-entry/loan-issue/Hooks";
import { IDisbursement } from "@/container/loan-entry/loan-issue/LoanIssueType";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RadioField from "@/common/formFields/RadioFields";
import { DatePicker } from "@/common/formFields/DatePicker";
import { toast } from "sonner";
import { format } from "date-fns";
import SuccessMessage from "@/common/SuccessMessage";

interface IDisbursementDetail {
  Account_Id: number;
  Loan_Date: string;
  Loan_Amount: string;
  RoI: string;
  Guaranter_Name: string;
  Installment_No: number;
  Installment_Amt: string;
  Realisable_Amt: string;
  Schme_Name: string;
  Grp_Name: string;
  CO_Name: string;
  Member_Name: string;
  Gurdain_Name?: string;
  Loan_Cycle: number;
}

interface DisbursementDetailsScreenProps {
  disbursement: IDisbursement;
  branchId?: number;
  onBack: () => void;
}

export function DisbursementDetailsScreen({
  disbursement,
  branchId,
  onBack,
}: DisbursementDetailsScreenProps) {
  const { fetchDisbursementDetails, postDisbursement } = useLoanIssue(branchId);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState<IDisbursementDetail[]>([]);
  const [activeDetail, setActiveDetail] = useState<IDisbursementDetail | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const methods = useForm({
    defaultValues: {
      ln_cycle: 1,
      inst_no: 0,
      inst_amt: "",
      resil_amt: "",
      account_id: 0,
      member_name: "",
      guaranter_name: "",
      voucher_mode: "1",
      ref_voucher_no: "",
      disb_date: undefined,
    },
  });

  const { control, reset } = methods;

  const onSubmit = async (data: any) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const formattedDate =
        data.disb_date instanceof Date
          ? format(data.disb_date, "yyyy-MM-dd")
          : data.disb_date || "";

      const res = await postDisbursement(
        disbursement.Group_Id,
        formattedDate,
        Number(data.voucher_mode),
        data.ref_voucher_no,
        null,
        details,
      );

      if (
        res?.message === "Success" ||
        res?.massage === "Success" ||
        res?.status === "Success" ||
        res?.Data ||
        res?.data?.status === "Success"
      ) {
        const msg =
          res?.details ||
          res?.message ||
          res?.massage ||
          "Disbursement processed successfully!";
        setSuccessMsg(msg);
        setShowSuccess(true);
      } else {
        toast.error(
          res?.message || res?.massage || "Failed to process disbursement.",
        );
      }
    } catch (error: any) {
      console.error("Disbursement submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return "₹ 0.00";

    const formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);

    return `₹ ${formatted}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    const cacheKey = `${disbursement.Group_Id}-${disbursement.Loan_Date}`;
    if (fetchedRef.current === cacheKey) return;

    const loadDetails = async () => {
      fetchedRef.current = cacheKey;
      setLoading(true);
      try {
        const dataList = await fetchDisbursementDetails(
          disbursement.Group_Id,
          disbursement.Loan_Date,
        );
        setDetails(dataList);
      } catch (error) {
        console.error("Failed to load disbursement details:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [disbursement, fetchDisbursementDetails]);

  useEffect(() => {
    if (activeDetail) {
      const current = methods.getValues();
      reset({
        ...current,
        ln_cycle: activeDetail.Loan_Cycle,
        inst_no: activeDetail.Installment_No,
        inst_amt: formatCurrency(activeDetail.Installment_Amt),
        resil_amt: formatCurrency(activeDetail.Realisable_Amt),
        account_id: activeDetail.Account_Id,
        member_name: activeDetail.Member_Name,
        guaranter_name: activeDetail.Guaranter_Name || "",
      });
    }
  }, [activeDetail, reset, methods]);

  const firstRecord = details[0];
  const schemeName = firstRecord?.Schme_Name || "SHG LOAN";
  const coName = firstRecord?.CO_Name || disbursement.Co_Name || "-";
  const roi = firstRecord?.RoI || "15.00";
  const loanDate = firstRecord?.Loan_Date || disbursement.Loan_Date;

  const totalAmount = details.reduce(
    (sum, item) => sum + (Number(item.Loan_Amount) || 0),
    0,
  );

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        <div className="page-header-card">
          <div className="absolute left-0 top-0 w-1.5 h-full bg-primary"></div>
          <div className="pl-2 flex-shrink-0 min-w-0">
            <h2 className="text-2xl font-bold text-primary tracking-tight">
              Process Disbursement
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Review loan information and process members for{" "}
              <span className="font-semibold text-gray-800">
                {disbursement.Grp_Name}
              </span>
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 z-10 w-full xl:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-12 px-8 font-bold text-gray-700 border-gray-300 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2 w-full md:w-auto"
            >
              <ArrowLeft size={18} />
              Back
            </Button>
          </div>
        </div>

        <div className="form-sections">
          {/* Loan metadata */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Shield size={18} />
              </div>
              <h3 className="font-semibold text-primary text-lg">
                Loan Information
              </h3>
            </div>

            <div className="p-4 sm:p-5 lg:p-6 form-grid xl:grid-cols-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={12} />
                  Loan Date
                </span>
                <Input
                  readOnly
                  value={formatDate(loanDate)}
                  className="bg-slate-50 border-gray-200 font-semibold text-gray-700 h-11"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={12} />
                  Scheme Name
                </span>
                <Input
                  readOnly
                  value={schemeName}
                  className="bg-slate-50 border-gray-200 font-semibold text-gray-700 h-11"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={12} />
                  CO Name
                </span>
                <Input
                  readOnly
                  value={coName}
                  className="bg-slate-50 border-gray-200 font-semibold text-gray-700 h-11"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Percent size={12} />
                  Rate of Interest (RoI)
                </span>
                <Input
                  readOnly
                  value={`${roi}%`}
                  className="bg-slate-50 border-gray-200 font-semibold text-gray-700 h-11"
                />
              </div>
            </div>
          </div>

          {/* Members list */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Users size={18} />
              </div>
              <h3 className="font-semibold text-primary text-lg">
                Members Loan List
              </h3>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="font-semibold text-sm">
                  Loading member details...
                </p>
              </div>
            ) : details.length === 0 ? (
              <div className="text-center py-20 text-gray-400 font-medium">
                No member details found for this group.
              </div>
            ) : (
              <>
                <div className="hidden lg:block">
                  <ScrollArea className="w-full">
                    <Table>
                      <TableHeader className="bg-primary">
                        <TableRow className="hover:bg-primary border-0">
                          <TableHead className="w-16 text-center h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                            Sl
                          </TableHead>
                          <TableHead className="h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                            Member Name
                          </TableHead>
                          <TableHead className="h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                            Guardian Name
                          </TableHead>
                          <TableHead className="h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider text-right w-56">
                            Loan Amount
                          </TableHead>
                          <TableHead className="h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider text-center w-48">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {details.map((detail, index) => (
                          <TableRow
                            key={detail.Account_Id}
                            className="hover:bg-slate-50/80 transition-colors border-b-gray-100"
                          >
                            <TableCell className="text-center font-semibold text-gray-600 text-[14px]">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-semibold text-primary">
                              {detail.Member_Name}
                            </TableCell>
                            <TableCell className="text-gray-600 font-medium">
                              {detail.Gurdain_Name || "-"}
                            </TableCell>
                            <TableCell className="py-2 text-right">
                              <div className="w-36 ml-auto">
                                <Input
                                  readOnly
                                  value={formatCurrency(detail.Loan_Amount)}
                                  className="h-9 bg-slate-50 border-gray-200 font-bold text-gray-700 text-right text-xs"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 mx-auto"
                                onClick={() => {
                                  setActiveDetail(detail);
                                  setIsModalOpen(true);
                                }}
                              >
                                <Info size={12} />
                                Get Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>

                  <div className="bg-primary/5 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-4">
                    <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs uppercase tracking-widest">
                      <Calculator size={16} />
                      <span>Total Disbursement Amount</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-primary font-bold text-sm">₹</span>
                      <span className="font-black text-primary text-2xl tracking-tighter">
                        {totalAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
                  {details.map((detail, index) => (
                    <div
                      key={detail.Account_Id}
                      className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                    >
                      <div className="bg-primary/5 border-b border-gray-100 px-4 py-2 flex items-center justify-between">
                        <span className="font-bold text-gray-700 text-xs">
                          #{index + 1}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          ID: {detail.Account_Id}
                        </span>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400 font-medium">
                              Member Name
                            </span>
                            <p className="font-bold text-primary">
                              {detail.Member_Name}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">
                              Guardian Name
                            </span>
                            <p className="font-medium text-gray-600">
                              {detail.Gurdain_Name || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Loan Amount
                          </label>
                          <Input
                            readOnly
                            value={formatCurrency(detail.Loan_Amount)}
                            className="h-9 bg-slate-50 border-gray-200 font-bold text-gray-700 text-xs"
                          />
                        </div>

                        <div className="flex justify-end pt-2 border-t border-gray-100">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                            onClick={() => {
                              setActiveDetail(detail);
                              setIsModalOpen(true);
                            }}
                          >
                            <Info size={12} />
                            Get Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="col-span-full bg-primary/5 px-4 py-3 border border-gray-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs uppercase tracking-widest">
                      <Calculator size={16} />
                      <span>Total Disbursement Amount</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-primary font-bold text-sm">₹</span>
                      <span className="font-black text-primary text-2xl tracking-tighter">
                        {totalAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {!loading && details.length > 0 && (
            <>
              {/* Voucher block */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Wallet size={18} />
                  </div>
                  <h3 className="font-semibold text-primary text-lg">
                    Voucher Details
                  </h3>
                </div>

                <div className="p-4 sm:p-5 lg:p-6 form-grid">
                  <RadioField
                    control={control}
                    name="voucher_mode"
                    label="Voucher Mode"
                    options={[
                      { value: "1", label: "Cash" },
                      { value: "2", label: "Bank" },
                    ]}
                    orientation="horizontal"
                    isRequired
                  />

                  <InputField
                    control={control}
                    name="ref_voucher_no"
                    label="Ref. Voucher No."
                    placeholder="Enter reference voucher number"
                    isRequired
                  />

                  <DatePicker
                    control={control}
                    name="disb_date"
                    label="Disb Date"
                    placeholder="Select disbursement date"
                    isRequired
                    restrictToFinancialYear
                  />
                </div>
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="h-12 px-8 font-bold text-gray-700 border-gray-300 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:bg-primary/90 h-12 px-10 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto"
                >
                  {submitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save size={20} />
                  )}
                  Submit Disbursement
                </Button>
              </div>
            </>
          )}
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent
            showCloseButton={false}
            className="sm:max-w-[450px] p-0 overflow-hidden border-0 shadow-2xl rounded-xl font-sans"
          >
            <div className="bg-primary px-6 py-5 flex items-center justify-between">
              <div>
                <DialogTitle className="text-[18px] font-semibold text-primary-foreground tracking-wide">
                  Loan Other Information
                </DialogTitle>
                <DialogDescription className="text-primary-foreground/80 text-[12px] mt-1 font-medium">
                  Details for {activeDetail?.Member_Name} (
                  {activeDetail?.Account_Id})
                </DialogDescription>
              </div>
            </div>

            <div className="p-6 bg-white space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Loan Cycle
                  </Label>
                  <InputField
                    control={control}
                    name="ln_cycle"
                    isNumeric={true}
                    className="h-10 bg-slate-50 border-gray-200 font-bold text-primary"
                    disabled={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    No. of Installments
                  </Label>
                  <InputField
                    control={control}
                    name="inst_no"
                    isNumeric={true}
                    endContent={
                      <Calculator className="text-gray-300" size={14} />
                    }
                    className="h-10 bg-slate-50 border-gray-200 font-bold text-primary"
                    disabled={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Installment Amount
                  </Label>
                  <InputField
                    control={control}
                    name="inst_amt"
                    className="h-10 bg-slate-50 border-gray-200 font-bold text-green-600"
                    disabled={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Resil Amount
                  </Label>
                  <InputField
                    control={control}
                    name="resil_amt"
                    className="h-10 bg-slate-50 border-gray-200 font-bold text-orange-600"
                    disabled={true}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Guarantor Name
                  </Label>
                  <InputField
                    control={control}
                    name="guaranter_name"
                    className="h-10 bg-slate-50 border-gray-200 font-bold text-gray-700"
                    disabled={true}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <Button
                  type="button"
                  className="bg-primary hover:bg-primary/90 h-10 px-8 font-bold rounded-lg text-white shadow-md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <SuccessMessage
          showSuccessMessage={showSuccess}
          setShowSuccessMessage={(val) => {
            setShowSuccess(val);
            if (!val) {
              onBack();
            }
          }}
          successMessage={successMsg}
          showNextButton={false}
        />
      </form>
    </FormProvider>
  );
}
