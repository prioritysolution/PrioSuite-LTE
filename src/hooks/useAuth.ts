import Cookies from "@/lib/secureCookieHelper";
import getCookieData from "@/lib/getCookieData";
import { IUser } from "@/types/types";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CookieKeys } from "@/constants/auth";

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();

  // 1. Initialized synchronously to ensure the first client render knows the auth status.
  // This prevents the flickering "logged out" state that causes loops.
  const resolveUserStatus = (value: unknown): number => {
    if (value === undefined || value === null || value === "") return 0;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const [user, setUser] = useState<IUser | null>(() => {
    if (typeof window === "undefined") return null;
    const token = getCookieData("priobank-lite-token");
    if (token) {
      try {
        return {
          token,
          User_Name: getCookieData("priobank-lite-User_Name") || "",
          org_id: Number(getCookieData("priobank-lite-org_id")) || 0,
          org_name: getCookieData("priobank-lite-org_name") || "",
          branch_id: Number(getCookieData("priobank-lite-branch_id")) || 0,
          branch_name: getCookieData("priobank-lite-branch_name") || "",
          branch_code: getCookieData("priobank-lite-branch_code") || "",
          shg_inv: getCookieData("priobank-lite-shg_inv") || "",
          user_status: resolveUserStatus(
            getCookieData("priobank-lite-user_status"),
          ),
          branch_address:
            getCookieData("priobank-lite-branch_address") ?? undefined,
          branch_mobile:
            getCookieData("priobank-lite-branch_mobile") ?? undefined,
          branch_mail: getCookieData("priobank-lite-branch_mail") ?? undefined,
          is_head: getCookieData("priobank-lite-is_head") ?? undefined,
          branch_status:
            getCookieData("priobank-lite-branch_status") ?? undefined,
        };
      } catch (error) {
        console.error("Reconstructing user from cookies failed:", error);
      }
    }
    return null;
  });

  // 2. Client-side protection logic
  useEffect(() => {
    // Only perform redirects after mounting to avoid hydration conflicts
    // but trust the current 'user' state which was initialized synchronously.
    if (user) {
      if (pathname === "/login" || pathname === "/") {
        console.log(
          "[Auth] Authenticated user on auth page, pushing dashboard...",
        );
        router.push("/dashboard");
      }
    } else {
      if (pathname !== "/login" && pathname !== "/forgot-password") {
        console.log("[Auth] No session found, pushing login...");
        router.push("/login");
      }
    }
  }, [user, pathname, router]);

  const login = (
    userData: IUser,
    fyLabel?: string,
    fyStartDate?: string,
    fyEndDate?: string,
  ) => {
    const cookieOptions = {
      expires: 7, // 7 days expiration
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
      sameSite: "Strict" as const, // Prevent CSRF attacks
      path: "/",
    };

    // Persist mst_org_user.Status as user_status (API may send Status / status)
    const rawStatus =
      userData.user_status ??
      (userData as IUser & { Status?: number; status?: number }).Status ??
      (userData as IUser & { Status?: number; status?: number }).status;
    const normalizedUser: IUser = {
      ...userData,
      user_status: resolveUserStatus(rawStatus),
    };

    if (fyLabel) {
      Cookies.set("priobank-lite-financialYearLabel", fyLabel, cookieOptions);
    }
    if (fyStartDate) {
      Cookies.set("priobank-lite-fin_start_date", fyStartDate, cookieOptions);
    }
    if (fyEndDate) {
      Cookies.set("priobank-lite-fin_end_date", fyEndDate, cookieOptions);
    }
    if (normalizedUser.branch_name) {
      Cookies.set(
        "priobank-lite-userBranchName",
        normalizedUser.branch_name,
        cookieOptions,
      );
    }

    // Store each key individually in cookies
    if (normalizedUser.token)
      Cookies.set("priobank-lite-token", normalizedUser.token, cookieOptions);
    if (normalizedUser.User_Name)
      Cookies.set(
        "priobank-lite-User_Name",
        normalizedUser.User_Name,
        cookieOptions,
      );
    if (normalizedUser.org_id !== undefined)
      Cookies.set(
        "priobank-lite-org_id",
        String(normalizedUser.org_id),
        cookieOptions,
      );
    if (normalizedUser.org_name)
      Cookies.set(
        "priobank-lite-org_name",
        normalizedUser.org_name,
        cookieOptions,
      );
    if (normalizedUser.branch_id !== undefined)
      Cookies.set(
        "priobank-lite-branch_id",
        String(normalizedUser.branch_id),
        cookieOptions,
      );
    if (normalizedUser.branch_name)
      Cookies.set(
        "priobank-lite-branch_name",
        normalizedUser.branch_name,
        cookieOptions,
      );
    if (normalizedUser.branch_code)
      Cookies.set(
        "priobank-lite-branch_code",
        normalizedUser.branch_code,
        cookieOptions,
      );
    if (normalizedUser.shg_inv !== undefined)
      Cookies.set(
        "priobank-lite-shg_inv",
        String(normalizedUser.shg_inv),
        cookieOptions,
      );
    Cookies.set(
      "priobank-lite-user_status",
      String(normalizedUser.user_status),
      cookieOptions,
    );

    setUser(normalizedUser);
  };

  const updateUser = (partial: Partial<IUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      const cookieOptions = {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict" as const,
        path: "/",
      };

      if (partial.User_Name !== undefined) {
        Cookies.set("priobank-lite-User_Name", next.User_Name, cookieOptions);
      }
      if (partial.org_id !== undefined) {
        Cookies.set("priobank-lite-org_id", String(next.org_id), cookieOptions);
      }
      if (partial.org_name !== undefined) {
        Cookies.set("priobank-lite-org_name", next.org_name, cookieOptions);
      }
      if (partial.branch_id !== undefined) {
        Cookies.set(
          "priobank-lite-branch_id",
          String(next.branch_id),
          cookieOptions,
        );
      }
      if (partial.branch_name !== undefined) {
        Cookies.set("priobank-lite-branch_name", next.branch_name, cookieOptions);
        Cookies.set("priobank-lite-userBranchName", next.branch_name, cookieOptions);
      }
      if (partial.branch_code !== undefined) {
        Cookies.set("priobank-lite-branch_code", next.branch_code, cookieOptions);
      }
      if (partial.shg_inv !== undefined) {
        Cookies.set("priobank-lite-shg_inv", String(next.shg_inv), cookieOptions);
      }
      if (partial.user_status !== undefined) {
        Cookies.set(
          "priobank-lite-user_status",
          String(next.user_status),
          cookieOptions,
        );
      }
      if (partial.branch_address !== undefined) {
        Cookies.set(
          "priobank-lite-branch_address",
          String(next.branch_address ?? ""),
          cookieOptions,
        );
      }
      if (partial.branch_mobile !== undefined) {
        Cookies.set(
          "priobank-lite-branch_mobile",
          String(next.branch_mobile ?? ""),
          cookieOptions,
        );
      }
      if (partial.branch_mail !== undefined) {
        Cookies.set(
          "priobank-lite-branch_mail",
          String(next.branch_mail ?? ""),
          cookieOptions,
        );
      }
      if (partial.is_head !== undefined) {
        Cookies.set(
          "priobank-lite-is_head",
          String(next.is_head ?? ""),
          cookieOptions,
        );
      }
      if (partial.branch_status !== undefined) {
        Cookies.set(
          "priobank-lite-branch_status",
          String(next.branch_status ?? ""),
          cookieOptions,
        );
      }

      return next;
    });
  };

  const logout = () => {
    console.log("[Auth] Logout initiated");

    Cookies.remove("priobank-lite-financialYearLabel", { path: "/" });
    Cookies.remove("priobank-lite-fin_start_date", { path: "/" });
    Cookies.remove("priobank-lite-fin_end_date", { path: "/" });
    Cookies.remove("priobank-lite-userBranchName", { path: "/" });
    Cookies.remove("priobank-lite-financial_Id", { path: "/" });

    // Clean up individual cookie keys
    Cookies.remove("priobank-lite-token", { path: "/" });
    Cookies.remove("priobank-lite-User_Name", { path: "/" });
    Cookies.remove("priobank-lite-org_id", { path: "/" });
    Cookies.remove("priobank-lite-org_name", { path: "/" });
    Cookies.remove("priobank-lite-branch_id", { path: "/" });
    Cookies.remove("priobank-lite-branch_name", { path: "/" });
    Cookies.remove("priobank-lite-branch_code", { path: "/" });
    Cookies.remove("priobank-lite-shg_inv", { path: "/" });
    Cookies.remove("priobank-lite-user_status", { path: "/" });
    Cookies.remove("priobank-lite-branch_address", { path: "/" });
    Cookies.remove("priobank-lite-branch_mobile", { path: "/" });
    Cookies.remove("priobank-lite-branch_mail", { path: "/" });
    Cookies.remove("priobank-lite-is_head", { path: "/" });
    Cookies.remove("priobank-lite-branch_status", { path: "/" });

    setUser(null);
    router.replace("/login");
  };

  return {
    user,
    token: user?.token || null,
    login,
    updateUser,
    logout,
    isAuthenticated: !!user,
  };
};
