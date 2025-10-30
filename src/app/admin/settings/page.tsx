"use client";

import { useEffect, useState } from "react";
import { Save, ServerCog, ShieldCheck, Network, Lock } from "lucide-react";

type Settings = {
  aiEndpoint: string;
  aiApiKey: string;
  mapboxToken: string;
  enableBlockchainLog: boolean;
  blockchainNetwork: "polygon-testnet" | "bsc-testnet";
};

const STORAGE_KEY = "admin_settings_v1";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    aiEndpoint: "",
    aiApiKey: "",
    mapboxToken: "",
    enableBlockchainLog: true,
    blockchainNetwork: "polygon-testnet",
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings(JSON.parse(raw));
    } catch {}
  }, []);

  const onSave = async () => {
    try {
      setSaving(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSavedAt(new Date().toLocaleString("vi-VN"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cài đặt hệ thống</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Quản trị cấu hình AI, bản đồ và blockchain</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-semibold">
            <ServerCog className="w-5 h-5" />
            Cấu hình AI Service
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Endpoint</label>
              <input
                value={settings.aiEndpoint}
                onChange={(e) => setSettings({ ...settings, aiEndpoint: e.target.value })}
                placeholder="https://ai.smartcity.local/predict"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">API Key</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={settings.aiApiKey}
                  onChange={(e) => setSettings({ ...settings, aiApiKey: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-semibold">
            <Network className="w-5 h-5" />
            Bản đồ & Blockchain
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Mapbox Token</label>
              <input
                value={settings.mapboxToken}
                onChange={(e) => setSettings({ ...settings, mapboxToken: e.target.value })}
                placeholder="pk.ey..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <ShieldCheck className="w-4 h-4" />
                Ghi log Blockchain
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.enableBlockchainLog}
                  onChange={(e) => setSettings({ ...settings, enableBlockchainLog: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 relative"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Mạng Blockchain</label>
              <select
                value={settings.blockchainNetwork}
                onChange={(e) => setSettings({ ...settings, blockchainNetwork: e.target.value as Settings["blockchainNetwork"] })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="polygon-testnet">Polygon (testnet)</option>
                <option value="bsc-testnet">BSC (testnet)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white px-5 py-3 rounded-lg font-semibold"
        >
          <Save className="w-5 h-5" />
          Lưu cài đặt
        </button>
        {savedAt && (
          <span className="text-sm text-gray-500 dark:text-gray-400">Đã lưu lúc {savedAt}</span>
        )}
      </div>
    </div>
  );
}


