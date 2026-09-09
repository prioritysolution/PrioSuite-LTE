// "use client";

// import TopBar from "@/components/layout/TopBar";
// import { SidebarContainer, FooterContainer } from "@/container/layout";
// import { useEffect, useState, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { cn } from "@/lib/utils";

// const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const handleResize = useCallback(() => {
//     if (window.innerWidth >= 768) setIsSidebarOpen(false); // 768px is the 'md' breakpoint in tailwind
//   }, []);

//   useEffect(() => {
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [handleResize]);

//   return (
//     <div className="flex h-full w-full overflow-hidden bg-gray-100">
//       {/* ── Mobile backdrop overlay ── */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* ── SIDEBAR ── full viewport height, fixed on mobile / relative on desktop ── */}
//       <aside
//         className={cn(
//           "fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0",
//           "transform transition-transform duration-300 ease-in-out",
//           "md:relative md:translate-x-0 md:flex md:flex-col",
//           isSidebarOpen
//             ? "translate-x-0 shadow-2xl"
//             : "-translate-x-full md:translate-x-0",
//         )}
//       >
//         <SidebarContainer onClose={() => setIsSidebarOpen(false)} />
//       </aside>

//       {/* ── RIGHT COLUMN ── navbar + content + footer ── */}
//       <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
//         {/* Navbar — fixed height */}
//         <TopBar onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />

//         {/* Scrollable main content */}
//         {/* bg-gray-50 */}
//         <main className="flex-1 overflow-y-auto overflow-x-hidden ">
//           {/* p-4 sm:p-1 */}
//           <div className="w-full h-full  lg:p-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
//             {children}
//           </div>
//         </main>

//         {/* Footer */}
//         <FooterContainer />
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;

"use client";

import TopBar from "@/components/layout/TopBar";
import { SidebarContainer, FooterContainer } from "@/container/layout";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleResize = useCallback(() => {
    if (window.innerWidth >= 768) setIsSidebarOpen(false); // 768px is the 'md' breakpoint in tailwind
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    // h-screen (100vh) instead of h-full (100%) — h-full needs every
    // ancestor (html/body) to have an explicit height too, which they
    // don't here, so it silently collapsed to auto and let the whole
    // page scroll. h-screen is viewport-relative and works standalone.
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      {/* ── Mobile backdrop overlay ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── full viewport height, fixed on mobile / relative on desktop ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0",
          "transform transition-transform duration-300 ease-in-out",
          "md:relative md:translate-x-0 md:flex md:flex-col",
          isSidebarOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        <SidebarContainer onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* ── RIGHT COLUMN ── navbar + content + footer ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Navbar — fixed height */}
        <TopBar onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />

        {/* Scrollable main content */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="page-shell w-full min-h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>

        {/* Footer */}
        <FooterContainer />
      </div>
    </div>
  );
};

export default DashboardLayout;
