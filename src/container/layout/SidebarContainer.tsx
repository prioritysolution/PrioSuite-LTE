"use client";

import React from "react";
import SideBar from "@/components/layout/SideBar";
import { useSideBarHook } from "./Hooks";

interface SidebarContainerProps {
    onClose?: () => void;
}

export const SidebarContainer: React.FC<SidebarContainerProps> = ({ onClose }) => {
    const {
        sideBarData,
        isLoading,
        expandedLink,
        handleExpandedLink,
        isMounted,
        endDate,
    } = useSideBarHook();

    return (
        <SideBar
            isLoading={isLoading}
            sideBarData={sideBarData}
            expandedLink={expandedLink}
            handleExpandedLink={handleExpandedLink}
            isMounted={isMounted}
            endDate={endDate}
            closeMobileMenu={onClose}
        />
    );
};

export default SidebarContainer;
