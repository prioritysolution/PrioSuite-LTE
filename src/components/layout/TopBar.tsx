"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Phone,
  ChevronDown,
  User,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/GlobalContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface TopBarProps {
  logoutLoading?: boolean;
  handleLogout?: () => void;
  onMenuClick?: () => void;
  onMenuToggle?: () => void;
}

const Navbar = ({
  logoutLoading = false,
  handleLogout,
  onMenuClick,
  onMenuToggle,
}: TopBarProps) => {
  const router = useRouter();
  const { user, logout, isMounted } = useGlobalContext();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const executeLogout = handleLogout || logout;
  const toggleMenu = onMenuClick || onMenuToggle;

  const orgName = user?.org_name;
  const userName = user?.User_Name;
  const branchName = user?.branch_name;

  const openLogoutConfirm = () => {
    if (logoutLoading) return;
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    executeLogout();
  };

  return (
    /* ── height matches sidebar logo area exactly ── */
    <header className="h-[64px] w-full bg-[#00264D] flex-shrink-0 flex items-center px-3 sm:px-5 gap-3 shadow-md">
      {/* ── Hamburger — mobile only ── */}
      <button
        onClick={toggleMenu}
        className="lg:hidden md:hidden flex-shrink-0 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* ── Org & Branch info ── grows to fill space ── */}
      <div className="flex-1 flex items-center gap-4 sm:gap-6 min-w-0 overflow-hidden">
        {/* Organisation */}
        <div className="hidden sm:flex items-center gap-1.5 min-w-0">
          <span className="text-white/60 text-xs font-medium whitespace-nowrap flex-shrink-0">
            Organisation:
          </span>
          {!isMounted ? (
            <Skeleton className="w-28 h-4 bg-white/15 rounded" />
          ) : orgName ? (
            <span className="text-white text-xs sm:text-sm font-semibold truncate">
              {orgName}
            </span>
          ) : (
            <span className="text-white/40 text-xs sm:text-sm">
              No Organisation
            </span>
          )}
        </div>
      </div>

      {/* ── Action icons ── */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border border-primary animate-pulse" />
        </button>

        {/* Call — hidden on small screens */}
        <button
          className="hidden sm:flex p-2 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Call"
        >
          <Phone className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-white/20 mx-1 flex-shrink-0" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            {/* Trigger: show skeleton until mounted so SSR and client-first render match */}
            {!isMounted ? (
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Skeleton className="w-8 h-8 rounded-full bg-white/15" />
                <Skeleton className="hidden md:block w-20 h-4 bg-white/15 rounded" />
              </div>
            ) : userName ? (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary text-sm font-bold flex-shrink-0 shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                {/* Name & Branch — hidden on small screens */}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-white text-sm font-medium max-w-[100px] truncate leading-tight">
                    {userName}
                  </span>
                  {branchName && (
                    <span className="text-white/60 text-[10px] max-w-[100px] truncate leading-none mt-0.5">
                      {branchName}
                    </span>
                  )}
                </div>
                <ChevronDown className="hidden md:block text-white/60 w-4 h-4 group-hover:text-white transition-colors" />
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Skeleton className="w-8 h-8 rounded-full bg-white/15" />
                <Skeleton className="hidden md:block w-20 h-4 bg-white/15 rounded" />
              </div>
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-52 border border-gray-200 shadow-xl rounded-xl mt-2 p-1"
          >
            <DropdownMenuLabel className="px-3 py-2">
              <p className="text-xs text-gray-400 font-normal">Signed in as</p>
              <p className="text-sm font-semibold text-gray-800 truncate">
                {userName || "Admin"}
              </p>
              {branchName && (
                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                  {branchName}
                </p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-gray-700 hover:bg-primary/8 focus:bg-primary/10 transition-colors"
            >
              <User className="w-4 h-4 text-primary/70" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={openLogoutConfirm}
              disabled={logoutLoading}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {logoutLoading ? "Logging out…" : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
          <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border border-gray-100 shadow-2xl rounded-xl font-sans gap-0">
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 bg-white">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <AlertTriangle size={18} />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-xl font-bold text-primary tracking-tight">
                    Confirm Logout
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500 mt-1 font-medium">
                    You will need to sign in again to continue.
                  </DialogDescription>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 form-sections bg-white">
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                Are you sure you want to logout
                {userName ? (
                  <>
                    {" "}
                    as{" "}
                    <span className="font-bold text-gray-900">{userName}</span>
                  </>
                ) : null}
                ?
              </p>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm w-full sm:w-auto"
                  onClick={() => setLogoutConfirmOpen(false)}
                  disabled={logoutLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={logoutLoading}
                  className="bg-red-600 hover:bg-red-700 h-11 px-8 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto min-w-[120px]"
                  onClick={confirmLogout}
                >
                  <LogOut size={18} />
                  {logoutLoading ? "Logging out…" : "Logout"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};

export default Navbar;
