"use client"

import React from "react";
import { useLoginHook } from "./Hooks";
import { LoginUI } from "@/components/auth/login";

export const LoginContainer: React.FC = () => {
    const {
        methods,
        showPassword,
        togglePassword,
        financialYear,
        isPending,
        register,
        handleSubmit,
        control,
        errors,
        onSubmit
    } = useLoginHook();

    return (
        <LoginUI
            methods={methods}
            showPassword={showPassword}
            togglePassword={togglePassword}
            financialYear={financialYear}
            isPending={isPending}
            register={register}
            handleSubmit={handleSubmit}
            control={control}
            errors={errors}
            onSubmit={onSubmit}
        />
    );
};
