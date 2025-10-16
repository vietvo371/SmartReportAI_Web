import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartReportAI - Hệ thống phản ánh thông minh",
  description: "Nền tảng phản ánh và xử lý sự cố thông minh với AI và Blockchain",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
          <ToastProvider>
            <QueryProvider>{children}</QueryProvider>
          </ToastProvider>
      </body>
    </html>
  );
}
