"use client"

import React from "react";
import { useForgotPasswordHook } from "./Hooks";
import { ForgotPasswordUI } from "@/components/auth/forgot-password";

export const ForgotPasswordContainer: React.FC = () => {
    const { state, onSubmit } = useForgotPasswordHook();

    return (
        <ForgotPasswordUI
            loading={state.loading}
            onSubmit={onSubmit}
        />
    );
};
