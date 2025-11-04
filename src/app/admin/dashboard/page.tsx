"use client";

import { useState, useEffect } from "react";
import InfrastructureStats from "@/components/admin/InfrastructureStats";
import InfrastructureMap from "@/components/admin/InfrastructureMap";
import RecentReports from "@/components/admin/RecentReports";
import AIStatsComponent from "@/components/admin/AIStats";
import ProcessingTable from "@/components/admin/ProcessingTable";
import QuickActions from "@/components/admin/QuickActions";
import MapDebugger from "@/components/admin/MapDebugger";
import { Loader2, RefreshCw } from "lucide-react";
import { Report, Process, AIStats } from "@/types/report";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [aiStats, setAiStats] = useState<AIStats>({
    total_analyses: 0,
    accuracy_rate: 0,
    processing_time_avg: 0,
    predictions_today: 0,
    model_version: "1.0.0",
    last_updated: new Date().toISOString(),
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch reports
      const reportsResponse = await fetch('/api/admin/reports');
      const reportsData = await reportsResponse.json();
      setReports(reportsData.reports || []);
      
      // Fetch processes
      const processesResponse = await fetch('/api/admin/processes');
      const processesData = await processesResponse.json();
      setProcesses(processesData.processes || []);
      
      // Mock AI stats for now
      setAiStats({
        total_analyses: 1250,
        accuracy_rate: 94.5,
        processing_time_avg: 150,
        predictions_today: 45,
        model_version: "1.0.0",
        last_updated: new Date().toISOString(),
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total_reports: reports.length,
    pending_reports: reports.filter((r: Report) => r.trang_thai === "cho_xu_ly").length,
    in_progress_reports: reports.filter((r: Report) => r.trang_thai === "dang_xu_ly").length,
    resolved_reports: reports.filter((r: Report) => r.trang_thai === "da_hoan_tat").length,
    critical_issues: reports.filter((r: Report) => r.muc_do_nghiem_trong >= 4).length,
    processing_teams: 3, // Mock data
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Quản Trị
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tổng quan hệ thống phản ánh hạ tầng đô thị thông minh
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Infrastructure Stats */}
      <InfrastructureStats stats={stats} />

      {/* AI Stats */}
      <AIStatsComponent stats={aiStats} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Map and Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfrastructureMap reports={reports} />
        <RecentReports reports={reports} />
      </div>

      {/* Processing Table */}
      <ProcessingTable processes={processes} />
    </div>
  );
}

