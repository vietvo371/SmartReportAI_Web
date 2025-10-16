"use client";

import CitizenSidebar from "@/components/relief/CitizenSidebar";
import Navbar from "@/components/relief/Navbar";

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <CitizenSidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

