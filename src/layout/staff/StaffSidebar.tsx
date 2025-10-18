"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useStaffSidebar } from "@/context/StaffSidebarContext";
import { HorizontaLDots } from "@/icons/index";
import { Home, List, CheckCircle, Camera, User, Bell, BarChart3 } from "lucide-react";
import SidebarWidget from "@/layout/SidebarWidget";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType;
};

const navItems: NavItem[] = [
  { name: "Trang chủ", href: "/staff/dashboard", icon: Home },
  { name: "Nhiệm vụ được giao", href: "/staff/assigned-tasks", icon: List },
  { name: "Đang xử lý", href: "/staff/in-progress", icon: CheckCircle },
  { name: "Upload minh chứng", href: "/staff/upload-evidence", icon: Camera },
  { name: "Thống kê cá nhân", href: "/staff/statistics", icon: BarChart3 },
  { name: "Thông báo", href: "/staff/notifications", icon: Bell },
  { name: "Hồ sơ cá nhân", href: "/staff/profile", icon: User },
];

const StaffSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useStaffSidebar();
  const pathname = usePathname();

  const renderNavigation = () => (
    <ul className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-500"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className={`w-5 h-5 ${
                !isExpanded && !isHovered ? "mx-auto" : "mr-3"
              }`} />
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="font-medium">{item.name}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-center"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderNavigation()}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <></> : null}
      </div>
    </aside>
  );
};

export default StaffSidebar;
