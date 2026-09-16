"use client";

import { useState, useEffect, useMemo } from "react";
import { useGlobalContext } from "@/context/GlobalContext";
import { masterService } from "@/services/master.service";
import { useQuery } from "@tanstack/react-query";
import getCookieData from "@/lib/getCookieData";

export const useSideBarHook = () => {
  const { user } = useGlobalContext();
  const [expandedLink, setExpandedLink] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: sideBarResponse, isLoading } = useQuery({
    queryKey: ["sidebar-data", user?.org_id],
    queryFn: () => masterService.getSidebarData(user?.org_id as number),
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleExpandedLink = (title: string) => {
    setExpandedLink((prev) => (prev !== title ? title : ""));
  };

  const sideBarData = useMemo(() => {
    const rawSideBarData = Array.isArray(
      (sideBarResponse as any)?.data?.Data ??
        (sideBarResponse as any)?.Data ??
        (sideBarResponse as any)?.data,
    )
      ? ((sideBarResponse as any)?.data?.Data ??
        (sideBarResponse as any)?.Data ??
        (sideBarResponse as any)?.data)
      : [];

    return rawSideBarData.map((menu: any) => {
      const submenus =
        menu?.submenus ??
        menu?.SubMenus ??
        menu?.sub_menus ??
        menu?.children ??
        [];

      return {
        ...menu,
        menu_name:
          menu?.menu_name || menu?.Menu_Name || menu?.menuName || menu?.name,
        menu_id: menu?.menu_id || menu?.Menu_Id || menu?.id,
        route: menu?.route ?? menu?.Route ?? null,
        icon: menu?.icon || menu?.icon_name || menu?.Icon,
        submenus: (Array.isArray(submenus) ? submenus : []).map((sub: any) => ({
          ...sub,
          sub_menu_name:
            sub?.SubMenu_Name ||
            sub?.sub_menu_name ||
            sub?.submenu_name ||
            sub?.Sub_Menu_Name ||
            sub?.name,
          sub_menu_id:
            sub?.sub_menu_id ||
            sub?.Sub_Menu_Id ||
            sub?.SubMenu_Id ||
            sub?.id,
          route: sub?.route ?? sub?.Route ?? null,
        })),
      };
    });
  }, [sideBarResponse]);

  const endDate = getCookieData("priobank-lite-fin_end_date");

  return {
    user,
    sideBarData,
    isLoading,
    expandedLink,
    handleExpandedLink,
    isMounted,
    endDate,
  };
};

export const useFooterHook = () => {
  const { user, financialYearLabel } = useGlobalContext();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [branchName, setBranchName] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBranchName(getCookieData("priobank-lite-userBranchName") || "");
    const start = getCookieData("priobank-lite-fin_start_date") || "";
    const end = getCookieData("priobank-lite-fin_end_date") || "";
    setStartDate(start);
    setEndDate(end);
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return {
    financialYearLabel,
    startDate,
    endDate,
    branchName,
    currentTime,
    mounted,
  };
};
