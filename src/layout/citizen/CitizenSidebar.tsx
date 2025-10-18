"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCitizenSidebar } from "@/context/CitizenSidebarContext";
import { HorizontaLDots } from "@/icons/index";
import { Home, Plus, List, CheckCircle, Bell, User, MapPin } from "lucide-react";
import SidebarWidget from "@/layout/SidebarWidget";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType;
};

const navItems: NavItem[] = [
  { name: "Trang chủ", href: "/citizen/dashboard", icon: Home },
  { name: "Gửi phản ánh", href: "/citizen/new-report", icon: Plus },
  { name: "Phản ánh của tôi", href: "/citizen/my-requests", icon: List },
  { name: "Theo dõi tiến trình", href: "/citizen/status", icon: CheckCircle },
  { name: "Bản đồ sự cố", href: "/citizen/map", icon: MapPin },
  { name: "Thông báo", href: "/citizen/notifications", icon: Bell },
  { name: "Hồ sơ cá nhân", href: "/citizen/profile", icon: User },
];

const CitizenSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useCitizenSidebar();
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
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-500"
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

export default CitizenSidebar;
