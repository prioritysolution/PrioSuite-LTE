"use client"

import { useDispatch, useSelector } from "react-redux";
import {
  submitStart,
  submitSuccess,
  submitFailure,
} from "./ForgotPasswordReducer";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/redux/store";

export const useForgotPasswordHook = () => {
    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((state: RootState) => state.forgotPassword);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        if (!email) {
            toast.error("Please enter a valid email");
            return;
        }

        dispatch(submitStart());
        try {
            // Mock API or actual reset call if needed
            dispatch(submitSuccess(email));
            toast.success("Password reset instructions sent to your email!");
        } catch (err: any) {
            dispatch(submitFailure(err.message || "Something went wrong"));
            toast.error(err.message || "Failed to process request");
        }
    };

    return {
        state,
        onSubmit,
    };
};
