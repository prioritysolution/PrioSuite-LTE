// "use client";

// import { Dispatch, FC, SetStateAction } from "react";
// import { CheckCircle2, X } from "lucide-react";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";

// interface SuccessMessageProps {
//   showSuccessMessage: boolean;
//   setShowSuccessMessage: Dispatch<SetStateAction<boolean>>;
//   successMessage: string;
//   showNextButton?: boolean;
//   handleNextClick?: () => void;
//   nextLabel?: string;
//   closeLabel?: string;
// }

// const SuccessMessage: FC<SuccessMessageProps> = ({
//   showSuccessMessage,
//   setShowSuccessMessage,
//   successMessage,
//   showNextButton = true,
//   handleNextClick,
//   nextLabel = "Generate PDF",
//   closeLabel = "Close",
// }) => {
//   const handleClose = () => setShowSuccessMessage(false);

//   const handleNext = () => {
//     handleNextClick?.();
//     setShowSuccessMessage(false);
//   };

//   return (
//     <Dialog open={showSuccessMessage} onOpenChange={setShowSuccessMessage}>
//       <DialogContent
//         showCloseButton={false}
//         className="
//           w-[calc(100%-1rem)]
//           max-w-sm
//           rounded-3xl
//           border border-emerald-100/70
//           bg-white
//           p-0
//           shadow-[0_20px_60px_-20px_rgba(16,24,40,0.28)]
//           overflow-hidden
//         "
//       >
//         <div className="relative">
//           <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />

//           <DialogHeader className="px-6 pt-8 sm:px-8">
//             <div
//               className="
//                 mx-auto mb-5 flex h-18 w-18 items-center justify-center
//                 rounded-full bg-emerald-50 ring-8 ring-emerald-50/60
//               "
//             >
//               <CheckCircle2 className="h-9 w-9 text-emerald-500" />
//             </div>

//             <DialogTitle className="text-center text-xl font-semibold text-gray-900">
//               Success
//             </DialogTitle>

//             <DialogDescription className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-gray-500 sm:text-base">
//               {successMessage}
//             </DialogDescription>

//             {showNextButton && (
//               <p className="mt-2 text-center text-sm text-gray-400">
//                 Click on Generate PDF to Print
//               </p>
//             )}
//           </DialogHeader>

//           <DialogFooter
//             className="
//               flex-col gap-3 px-6 pb-6 pt-6
//               sm:flex-row sm:px-8
//             "
//           >
//             <Button
//               type="button"
//               variant="outline"
//               onClick={handleClose}
//               className="
//                 h-11 w-full rounded-xl border-gray-300
//                 text-gray-700 hover:bg-gray-50
//                 sm:flex-1  cursor-pointer
//               "
//             >
//               {closeLabel}
//             </Button>

//             {showNextButton && (
//               <Button
//                 type="button"
//                 onClick={handleNext}
//                 className="
//                   h-11 w-full rounded-xl
//                   bg-emerald-600 text-white
//                   hover:bg-emerald-700
//                   sm:flex-1 cursor-pointer
//                 "
//               >
//                 {nextLabel}
//               </Button>
//             )}
//           </DialogFooter>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default SuccessMessage;

"use client";

import { Dispatch, FC, SetStateAction } from "react";
import { CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SuccessMessageProps {
  showSuccessMessage: boolean;
  setShowSuccessMessage: Dispatch<SetStateAction<boolean>>;
  successMessage: string;
  showNextButton?: boolean;
  handleNextClick?: () => void;
  nextLabel?: string;
  closeLabel?: string;
}

const SuccessMessage: FC<SuccessMessageProps> = ({
  showSuccessMessage,
  setShowSuccessMessage,
  successMessage,
  showNextButton = true,
  handleNextClick,
  nextLabel = "Generate PDF",
  closeLabel = "Close",
}) => {
  const handleClose = () => setShowSuccessMessage(false);

  const handleNext = () => {
    handleNextClick?.();
    setShowSuccessMessage(false);
  };

  return (
    <Dialog open={showSuccessMessage} onOpenChange={setShowSuccessMessage}>
      <DialogContent
        showCloseButton={false}
        className="
          w-[calc(100%-2rem)]
          max-w-[22rem]
          sm:max-w-sm
          rounded-2xl sm:rounded-3xl
          border border-emerald-100/70
          bg-white
          p-0
          gap-0
          shadow-[0_20px_60px_-20px_rgba(16,24,40,0.28)]
          overflow-hidden
          data-[state=open]:animate-in
          data-[state=open]:fade-in-0
          data-[state=open]:zoom-in-95
          data-[state=open]:duration-300
          data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0
          data-[state=closed]:zoom-out-95
          data-[state=closed]:duration-200
        "
      >
        <div className="relative">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />

          <DialogHeader className="px-5 pt-7 sm:px-8 sm:pt-9">
            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center sm:mb-5 sm:h-18 sm:w-18">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-100/70 [animation-duration:1.8s] [animation-iteration-count:1]" />
              <span className="absolute inset-0 rounded-full bg-emerald-50 ring-8 ring-emerald-50/60" />
              <CheckCircle2
                className="
                  relative h-8 w-8 text-emerald-500
                  sm:h-9 sm:w-9
                  animate-in zoom-in-50 duration-500 ease-out
                "
                strokeWidth={1.75}
              />
            </div>

            <DialogTitle className="text-center text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
              Success
            </DialogTitle>

            <DialogDescription className="mx-auto mt-1.5 max-w-xs text-center text-[13px] leading-6 text-gray-500 sm:mt-2 sm:max-w-sm sm:text-sm md:text-base whitespace-pre-line">
              {successMessage}
            </DialogDescription>

            {showNextButton && (
              <p className="mt-2 text-center text-xs text-gray-400 sm:text-sm">
                Click on {nextLabel} to print
              </p>
            )}
          </DialogHeader>

          <DialogFooter
            className="
              flex-col-reverse gap-2.5 px-5 pb-5 pt-6
              sm:flex-row sm:gap-3 sm:px-8 sm:pb-6
            "
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="
                h-10 w-full rounded-xl border-gray-300
                text-sm text-gray-700
                transition-colors duration-150
                hover:bg-gray-50
                active:scale-[0.98]
                sm:h-11 sm:flex-1 sm:text-base
                cursor-pointer
              "
            >
              {closeLabel}
            </Button>

            {showNextButton && (
              <Button
                type="button"
                onClick={handleNext}
                className="
                  h-10 w-full rounded-xl
                  bg-emerald-600 text-sm text-white
                  shadow-sm shadow-emerald-600/20
                  transition-all duration-150
                  hover:bg-emerald-700 hover:shadow-emerald-600/30
                  active:scale-[0.98]
                  sm:h-11 sm:flex-1 sm:text-base
                  cursor-pointer
                "
              >
                {nextLabel}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessMessage;
