import { useStaffSidebar } from "@/context/StaffSidebarContext";
import React from "react";

const StaffBackdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useStaffSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};

export default StaffBackdrop;
