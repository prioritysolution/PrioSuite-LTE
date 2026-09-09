"use client";

import React from "react";
import Footer from "@/components/layout/Footer";
import { useFooterHook } from "./Hooks";

export const FooterContainer: React.FC = () => {
    const {
        financialYearLabel,
        startDate,
        endDate,
        branchName,
        currentTime,
        mounted,
    } = useFooterHook();

    return (
        <Footer
            financialYearLabel={financialYearLabel}
            startDate={startDate}
            endDate={endDate}
            branchName={branchName}
            currentTime={currentTime}
            mounted={mounted}
        />
    );
};

export default FooterContainer;
