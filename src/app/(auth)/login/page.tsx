
import { Metadata } from "next";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Đăng nhập | SmartReportAI",
  description: "Đăng nhập vào tài khoản của bạn",
};

export default function LoginPage() {
  return <SignInForm />;
}
