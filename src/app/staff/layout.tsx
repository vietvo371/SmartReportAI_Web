"use client";

import StaffSidebar from "@/layout/staff/StaffSidebar";
import StaffHeader from "@/layout/staff/StaffHeader";
import { StaffSidebarProvider, useStaffSidebar } from "@/context/StaffSidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import StaffBackdrop from "@/layout/staff/StaffBackdrop";

function StaffLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useStaffSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <StaffSidebar />
      <StaffBackdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <StaffHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  ); 
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <StaffSidebarProvider>
        <StaffLayoutContent>{children}</StaffLayoutContent>
      </StaffSidebarProvider>
    </ThemeProvider>
  );
}
