
import { Metadata } from "next";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Đăng ký | SmartReportAI",
  description: "Đăng ký tài khoản mới",
};

export default function RegisterPage() {
  return <SignUpForm />;
}
