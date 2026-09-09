"use client"
import { useAuth } from "@/hooks/useAuth";
import { IUser } from "@/types/types";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Cookies from "@/lib/secureCookieHelper";
import { CookieKeys } from "@/constants/auth";

interface GlobalContextType {
    user: IUser | null;
    financialYear: string | null;
    financialYearLabel: string | null;
    isLoading: boolean;
    isMounted: boolean;
    login: (userData: IUser, fyLabel?: string, fyStartDate?: string, fyEndDate?: string) => void;
    updateUser: (partial: Partial<IUser>) => void;
    updateFinancialYearLabel: (label: string) => void;
    logout: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
    const { user, login: authLogin, updateUser: authUpdateUser, logout: authLogout } = useAuth();
    
    // Mount status - using a deferred update to satisfy strict React linting
    const [isMounted, setIsMounted] = useState(false);

    // Initialize from cookies synchronously to avoid "cascading renders" lint errors
    const [financialYear] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        return Cookies.get(CookieKeys.FINANCIAL_YEAR) || null;
    });
    const [financialYearLabel, setFinancialYearLabel] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        return Cookies.get("priobank-lite-financialYearLabel") || null;
    });

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setIsMounted(true);
        });
        return () => cancelAnimationFrame(frame);
    }, []);

    const handleLogin = (userData: IUser, fyLabel?: string, fyStartDate?: string, fyEndDate?: string) => {
        if (fyLabel) {
            setFinancialYearLabel(fyLabel);
        }
        authLogin(userData, fyLabel, fyStartDate, fyEndDate);
    };

    const updateFinancialYearLabel = (label: string) => {
        const cookieOptions = {
            expires: 7,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict" as const,
            path: "/",
        };
        Cookies.set("priobank-lite-financialYearLabel", label, cookieOptions);
        setFinancialYearLabel(label);
    };

    const value = {
        user,
        financialYear,
        financialYearLabel,
        isLoading: !isMounted,
        isMounted,
        login: handleLogin,
        updateUser: authUpdateUser,
        updateFinancialYearLabel,
        logout: authLogout
    };


    return (
        <GlobalContext.Provider value={value}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }
    return context;
};