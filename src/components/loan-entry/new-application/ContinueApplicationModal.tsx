"use client";

import { CheckCircle2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ContinueApplicationModalProps {
  isOpen: boolean;
  onContinueSame: () => void;
  onStartFresh: () => void;
}

export const ContinueApplicationModal = ({
  isOpen,
  onContinueSame,
  onStartFresh,
}: ContinueApplicationModalProps) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onContinueSame()}>
    <DialogContent
      showCloseButton={false}
      className="sm:max-w-[440px] p-0 overflow-hidden border-0 shadow-2xl rounded-xl font-sans"
    >
      <div className="bg-primary px-6 py-5 flex items-center gap-3">
        <CheckCircle2 className="text-primary-foreground" size={24} />
        <div>
          <DialogTitle className="text-[18px] font-semibold text-primary-foreground tracking-wide">
            Loan Application Saved
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80 text-[12px] mt-1 font-medium">
            Do you want to continue with the same Group &amp; Scheme details?
          </DialogDescription>
        </div>
      </div>

      <div className="p-6 bg-white space-y-5">
        <p className="text-sm text-gray-600">
          <span className="font-bold text-gray-800">Yes</span> keeps the
          current Group &amp; Scheme details and reloads the member list.{" "}
          <span className="font-bold text-gray-800">No</span> resets the whole
          page.
        </p>

        <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-6 font-bold rounded-lg text-gray-700 border-gray-200 hover:bg-gray-50 flex items-center gap-2"
            onClick={onStartFresh}
          >
            <RefreshCw size={16} />
            No, Reset Page
          </Button>
          <Button
            type="button"
            className="bg-primary hover:bg-primary/90 h-10 px-8 font-bold rounded-lg text-white shadow-md"
            onClick={onContinueSame}
          >
            Yes, Continue
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
