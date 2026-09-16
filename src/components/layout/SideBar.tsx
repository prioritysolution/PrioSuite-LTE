/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronDown, ChevronUp, ChevronLeft, Home, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import IconDisplay from "@/common/IconDisplay";

interface SideBarProps {
  closeMobileMenu?: () => void;
  isLoading: boolean;
  sideBarData: any[];
  expandedLink: string;
  handleExpandedLink: (title: string) => void;
  isMounted: boolean;
  endDate: any;
}

/** Read route from mst_menus / GetSidebar (supports common casings). */
const getRawRoute = (item: any): string | null => {
  const raw =
    item?.route ??
    item?.Route ??
    item?.menu_route ??
    item?.Menu_Route ??
    null;

  if (raw === null || raw === undefined) return null;
  const trimmed = String(raw).trim();
  if (!trimmed || trimmed.toLowerCase() === "null") return null;
  return trimmed;
};

const getMenuName = (menu: any): string =>
  menu?.menu_name ||
  menu?.Menu_Name ||
  menu?.menuName ||
  menu?.name ||
  "";

const getSubMenuName = (sub: any): string =>
  sub?.SubMenu_Name ||
  sub?.sub_menu_name ||
  sub?.submenu_name ||
  sub?.Sub_Menu_Name ||
  sub?.name ||
  "";

const getSubMenus = (menu: any): any[] => {
  const list =
    menu?.submenus ??
    menu?.SubMenus ??
    menu?.sub_menus ??
    menu?.children ??
    [];
  return Array.isArray(list) ? list : [];
};

/**
 * Use only DB route. When Route is null/empty → no link.
 * Light remaps only when a real route exists (legacy DB values → app pages).
 */
const resolveMenuPath = (item: any): string | null => {
  let path = getRawRoute(item);
  if (!path) return null;

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  if (path.includes("group-loan")) {
    path = path.replace("group-loan", "new-application");
  }

  const schemeAliases = new Set([
    "/setup/scheme",
    "/setup/schemes",
    "/setup/loan-scheme",
    "/setup/loan-scheme-master",
    "/setup/scheme-setup",
  ]);

  if (schemeAliases.has(path)) {
    path = "/setup/scheme-master";
  }

  return path;
};

const SideBar = ({
  closeMobileMenu,
  isLoading,
  sideBarData,
  expandedLink,
  handleExpandedLink,
  isMounted,
  endDate,
}: SideBarProps) => {
  const pathname = usePathname();
  if (!isMounted) {
    return (
      <div className="w-64 h-full flex flex-col bg-[#00264D]">
        <div className="h-[64px] min-h-[64px] max-h-[64px] flex items-center flex-shrink-0 border-b border-white/10 overflow-hidden relative px-3">
          <div className="relative w-full h-full flex justify-left">
            <Image
              src="/logobg1.png"
              alt="Logo"
              fill
              className="object-cover object-left px-2 py-1"
              priority
            />
          </div>
        </div>
        <div className="flex-1 px-3 pt-5 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-10 rounded-lg bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 h-full flex flex-col bg-[#00264D]">
      <div className="h-[64px] min-h-[64px] max-h-[64px] flex items-center flex-shrink-0 border-b border-white/10 overflow-hidden relative px-3">
        <div className="relative w-full h-full flex justify-left">
          <Image
            src="/logobg1.png"
            alt="Logo"
            fill
            className="object-cover object-left px-2 py-1"
            priority
          />
        </div>
        <span className="hidden absolute right-1 top-12 text-white/30 text-xs">
          v1.0.1
        </span>
        <span className="absolute right-2 top-12 text-white/30 text-xs">
          v1.0.1
        </span>

        <button
          onClick={closeMobileMenu}
          className="lg:hidden flex-shrink-0 ml-2 p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors z-10 md:hidden"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-3 px-2 space-y-1">
        {isLoading || !sideBarData || !sideBarData.length ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-full h-10 rounded-lg bg-white/10"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div>
              <Link
                href="/dashboard"
                prefetch={false}
                onClick={() => {
                  handleExpandedLink("");
                  closeMobileMenu?.();
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer",
                  pathname === "/dashboard"
                    ? "bg-[#14B8A6] text-white shadow-sm"
                    : "text-white/85 hover:text-white border border-white/20",
                )}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="text-[20px] flex-shrink-0 transition-colors text-white">
                    <Home size={20} />
                  </span>
                  <span className="truncate text-[15px]">Dashboard</span>
                </span>
              </Link>
            </div>

            {sideBarData.map((menu: any, id: number) => {
              const menuName = getMenuName(menu);
              const submenus = getSubMenus(menu);
              const hasChildren = submenus.length > 0;
              const isExpanded = menuName === expandedLink;
              const menuPath = resolveMenuPath(menu);

              const hasActiveChild =
                hasChildren &&
                submenus.some((sub: any) => {
                  const subPath = resolveMenuPath(sub);
                  return !!subPath && pathname === subPath;
                });

              const isActive =
                hasActiveChild || (!!menuPath && pathname === menuPath);

              return (
                <div key={menu.menu_id || menu.Menu_Id || id}>
                  {hasChildren || !menuPath ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (hasChildren) {
                          handleExpandedLink(menuName);
                          return;
                        }
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                        hasChildren || menuPath
                          ? "cursor-pointer"
                          : "cursor-default",
                        isActive
                          ? "bg-[#14B8A6] text-white shadow-sm"
                          : "text-white/85 hover:text-white border border-white/20",
                      )}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="text-[20px] flex-shrink-0 transition-colors text-white">
                          {menu.icon || menu.icon_name || menu.Icon ? (
                            <IconDisplay
                              iconName={
                                menu.icon || menu.icon_name || menu.Icon
                              }
                              iconSet={(
                                menu.icon ||
                                menu.icon_name ||
                                menu.Icon
                              )
                                .slice(0, 2)
                                .toLowerCase()}
                              className="text-xl"
                            />
                          ) : (
                            <></>
                          )}
                        </span>
                        <span className="truncate text-[15px]">{menuName}</span>
                      </span>

                      {hasChildren && (
                        <span className="flex-shrink-0 text-white/60">
                          {isExpanded ? (
                            <ChevronUp className="text-base" />
                          ) : (
                            <ChevronDown className="text-base" />
                          )}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={menuPath}
                      prefetch={false}
                      onClick={() => {
                        handleExpandedLink("");
                        closeMobileMenu?.();
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer",
                        isActive
                          ? "bg-[#14B8A6] text-white shadow-sm"
                          : "text-white/85 hover:text-white border border-white/20",
                      )}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="text-[20px] flex-shrink-0 transition-colors text-white">
                          {menu.icon || menu.icon_name || menu.Icon ? (
                            <IconDisplay
                              iconName={
                                menu.icon || menu.icon_name || menu.Icon
                              }
                              iconSet={(
                                menu.icon ||
                                menu.icon_name ||
                                menu.Icon
                              )
                                .slice(0, 2)
                                .toLowerCase()}
                              className="text-xl"
                            />
                          ) : (
                            <></>
                          )}
                        </span>
                        <span className="truncate text-[15px]">{menuName}</span>
                      </span>
                    </Link>
                  )}

                  {hasChildren && isExpanded && (
                    <div
                      className={cn(
                        "relative mb-1.5 mt-1",
                        "before:absolute before:left-[18px] before:top-0 before:h-full before:w-[1.5px] before:rounded-sm before:bg-white/20",
                      )}
                    >
                      {submenus.map((sub: any, idx: number) => {
                        const subName = getSubMenuName(sub);
                        const subPath = resolveMenuPath(sub);
                        const canLink = !!subPath;
                        const isChildActive =
                          canLink && pathname === subPath;
                        const isHidden =
                          subPath === "/voucher/adjustmentVoucher" &&
                          new Date(endDate) > new Date();

                        // Always show SubMenu_Name; only hide known special cases
                        if (isHidden) return null;
                        if (!subName) return null;

                        const itemClass = cn(
                          "w-full text-left pl-9 pr-4 py-[9px] rounded-md transition-all duration-155 relative flex items-center justify-between",
                          isChildActive
                            ? "before:absolute before:left-[18px] before:top-1/2 before:-translate-y-1/2 before:w-2.5 before:h-[1.5px] before:bg-white/60"
                            : "before:absolute before:left-[18px] before:top-1/2 before:-translate-y-1/2 before:w-2.5 before:h-[1.5px] before:bg-white/20",
                          isChildActive
                            ? "text-white font-semibold"
                            : "text-white/70",
                          canLink
                            ? "cursor-pointer hover:text-white"
                            : "cursor-default",
                        );

                        // Route present → link (no prefetch); Route null → label only
                        if (canLink) {
                          return (
                            <Link
                              key={
                                sub.sub_menu_id ||
                                sub.Sub_Menu_Id ||
                                sub.SubMenu_Id ||
                                idx
                              }
                              href={subPath}
                              prefetch={false}
                              onClick={() => closeMobileMenu?.()}
                              className={itemClass}
                            >
                              <span className="text-[13.5px] tracking-wide truncate">
                                {subName}
                              </span>
                              {isChildActive && (
                                <ChevronLeft className="w-4 h-4 text-white/70 flex-shrink-0" />
                              )}
                            </Link>
                          );
                        }

                        return (
                          <div
                            key={
                              sub.sub_menu_id ||
                              sub.Sub_Menu_Id ||
                              sub.SubMenu_Id ||
                              idx
                            }
                            className={itemClass}
                            title="No route configured"
                            aria-disabled="true"
                          >
                            <span className="text-[13.5px] tracking-wide truncate">
                              {subName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-white/10 px-4 h-10 flex items-center justify-center">
        <Link
          href="https://prioritysolutions.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/50 text-[10px] font-medium tracking-widest uppercase hover:text-white transition-colors"
        >
          By Priority Solutions
        </Link>
      </div>
    </div>
  );
};

export default SideBar;
