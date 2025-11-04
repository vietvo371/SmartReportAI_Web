"use client"; 
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircleIcon,
  BoltIcon,
  BoxIcon,
  GroupIcon,
  ChevronDownIcon,
} from "@/icons";
import MapboxMap from "@/components/ui/map/MapboxMap";
import TokenDebugger from "@/components/auth/TokenDebugger";
import RoleTester from "@/components/auth/RoleTester";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-20 bg-gradient-to-br from-primary/40 to-transparent blur-3xl"
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }} 
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 bg-gradient-to-br from-blue-light-400/30 to-transparent blur-3xl"
          animate={{
            x: -mousePosition.x * 0.015,
            y: -mousePosition.y * 0.015,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-theme-lg border-b border-gray-200/50 dark:border-gray-800/50"
            : "bg-transparent"
        }`}
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <img src="/images/logo/logo.svg" alt="SmartReportAI Logo" className="h-8 w-auto" />
            </motion.div>
            <div className="hidden gap-8 md:flex">
              {["Tính năng", "Cách hoạt động", "Thống kê"].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item === "Tính năng" ? "features" : item === "Cách hoạt động" ? "how-it-works" : "stats"}`}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-primary/80 relative group"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 transition-all group-hover:w-full" />
                </motion.a>
              ))}
            </div>
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-all rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg hover:shadow-primary/50 hover:scale-105"
              >
                Đăng ký
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden sm:pt-32 sm:pb-32">
        {/* Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-primary/10 to-blue-light-50/20 dark:from-gray-950 dark:via-primary/10 dark:to-blue-light-950/10" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] dark:opacity-[0.05]" />
        </div>
        
        {/* Animated Decorative Elements */}
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary/30 to-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-blue-light-400/20 to-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-primary/10 to-blue-light-50 dark:from-primary/20 dark:to-blue-light-500/10 border border-primary/30 dark:border-primary/30 shadow-lg"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <img src="/images/logo/logo.svg" alt="SmartReportAI Logo" className="w-4 h-4" />
              </motion.div>
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-blue-light-600 dark:from-primary/80 dark:to-blue-light-400 bg-clip-text text-transparent">
                Hệ thống phản ánh sự cố thông minh
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6 font-bold text-gray-900 text-title-md sm:text-title-lg lg:text-title-xl dark:text-white"
            >
              Phản ánh thông minh,{" "}
              <span className="bg-gradient-to-r from-primary via-primary/90 to-blue-light-500 bg-clip-text text-transparent animate-gradient">
                xử lý hiệu quả
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-3xl mx-auto mb-10 text-lg text-gray-600 sm:text-xl dark:text-gray-400"
            >
              SmartReportAI là hệ thống phản ánh và xử lý sự cố thông minh 
              với AI nhận dạng và tính minh bạch blockchain, giúp người dân 
              phản ánh sự cố và cán bộ xử lý một cách nhanh chóng và hiệu quả nhất.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center w-full px-6 py-4 text-base font-medium text-white transition-all rounded-xl shadow-xl bg-gradient-to-r from-primary via-primary/90 to-blue-light-500 hover:shadow-2xl hover:shadow-primary/50 sm:w-auto group"
                >
                  Bắt đầu ngay
                  <motion.svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    whileHover={{ x: 5 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </motion.svg>
                </Link>
              </motion.div>
              <motion.a
                href="#how-it-works"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center w-full px-6 py-4 text-base font-medium text-gray-700 transition-all bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl shadow-lg hover:bg-white/80 hover:shadow-xl sm:w-auto dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800/80"
              >
                Tìm hiểu thêm
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronDownIcon className="w-5 h-5 ml-2" />
                </motion.div>
              </motion.a>
            </motion.div>
          </div>

          {/* Map Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 sm:mt-24"
          >
            <div className="relative p-1 mx-auto rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-blue-light-500 max-w-6xl shadow-2xl hover:shadow-primary/30 transition-shadow duration-500">
              <div className="overflow-hidden bg-white rounded-xl dark:bg-gray-900">
                <div className="aspect-video relative">
                  <MapboxMap className="w-full h-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 sm:py-32 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] dark:opacity-[0.03]" />
        
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 font-bold text-gray-900 text-title-sm sm:text-title-md dark:text-white">
              Tính năng{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                nổi bật
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              Công nghệ hiện đại giúp tối ưu hóa quy trình phản ánh và xử lý sự cố
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: () => <img src="/images/logo/logo.svg" alt="SmartReportAI Logo" className="w-8 h-8" />,
                title: "Thời gian thực",
                desc: "Theo dõi và cập nhật phản ánh sự cố ngay lập tức với hệ thống thời gian thực, đảm bảo phản hồi nhanh chóng.",
                gradient: "from-primary to-primary/80",
                bgGradient: "from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30",
                delay: 0,
              },
              {
                icon: CheckCircleIcon,
                title: "Blockchain minh bạch",
                desc: "Mọi phân phối được ghi lại trên blockchain, đảm bảo tính minh bạch và có thể truy vết hoàn toàn.",
                gradient: "from-primary to-primary/80",
                bgGradient: "from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30",
                delay: 0.1,
              },
              {
                icon: BoxIcon,
                title: "AI nhận dạng",
                desc: "Trí tuệ nhân tạo nhận dạng và phân loại sự cố tự động, giúp xử lý hiệu quả và chính xác hơn.",
                gradient: "from-blue-light-500 to-blue-light-600",
                bgGradient: "from-blue-light-50 to-blue-light-100 dark:from-blue-light-500/10 dark:to-blue-light-500/20",
                delay: 0.2,
              },
              {
                icon: () => (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: "Bản đồ tương tác",
                desc: "Trực quan hóa vị trí sự cố và khu vực xử lý trên bản đồ Mapbox với định vị chính xác.",
                gradient: "from-warning-500 to-orange-500",
                bgGradient: "from-warning-50 to-orange-50 dark:from-warning-500/10 dark:to-orange-500/10",
                delay: 0.3,
              },
              {
                icon: BoxIcon,
                title: "Quản lý xử lý",
                desc: "Theo dõi tiến độ và phân công xử lý sự cố một cách có hệ thống và chuyên nghiệp.",
                gradient: "from-theme-purple-500 to-purple-600",
                bgGradient: "from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-500/20",
                delay: 0.4,
              },
              {
                icon: GroupIcon,
                title: "Phân quyền linh hoạt",
                desc: "Hệ thống vai trò Quản trị, Cán bộ và Người dân với quyền hạn phù hợp cho từng nhóm.",
                gradient: "from-theme-pink-500 to-pink-600",
                bgGradient: "from-pink-50 to-pink-100 dark:from-pink-500/10 dark:to-pink-500/20",
                delay: 0.5,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: feature.delay }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="relative p-8 overflow-hidden transition-all bg-white border border-gray-200 group rounded-2xl hover:shadow-2xl hover:shadow-primary/10 dark:bg-gray-800/50 dark:border-gray-700 dark:hover:border-primary/30 backdrop-blur-sm"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Animated Orb */}
                <motion.div
                  className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${feature.gradient} opacity-0 blur-2xl group-hover:opacity-20 transition-opacity duration-500 -mr-16 -mt-16`}
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`flex items-center justify-center w-14 h-14 mb-5 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary/80 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </div>

                {/* Bottom Gradient Line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-gray-950 sm:py-32">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-bold text-gray-900 text-title-sm sm:text-title-md dark:text-white">
              Cách hoạt động
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              Quy trình đơn giản và hiệu quả để phản ánh và xử lý sự cố
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/90 to-blue-light-500 hidden lg:block"></div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="relative grid items-center grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="lg:text-right">
                  <div className="inline-block p-4 mb-4 rounded-lg bg-primary/10 dark:bg-primary/20">
                    <span className="text-2xl font-bold text-primary dark:text-primary/80">
                      01
                    </span>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
                    Đăng ký tài khoản
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Người dân, cán bộ hoặc quản trị viên tạo tài khoản và 
                    được phân quyền phù hợp với vai trò của mình trong hệ thống.
                  </p>
                </div>
                <div className="relative p-6 bg-gray-50 rounded-2xl dark:bg-gray-900 lg:ml-12">
                  <div className="absolute left-0 w-4 h-4 transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 bg-primary hidden lg:block"></div>
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/30 dark:from-primary/20 dark:to-primary/30 rounded-xl"></div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative grid items-center grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="relative p-6 bg-gray-50 rounded-2xl dark:bg-gray-900 lg:mr-12 lg:order-1">
                  <div className="absolute right-0 w-4 h-4 transform translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 bg-primary hidden lg:block"></div>
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/30 dark:from-primary/20 dark:to-primary/30 rounded-xl"></div>
                </div>
                <div className="lg:order-2">
                  <div className="inline-block p-4 mb-4 rounded-lg bg-primary/10 dark:bg-primary/20">
                    <span className="text-2xl font-bold text-primary dark:text-primary/80">
                      02
                    </span>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
                    Gửi phản ánh sự cố
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Người dân gửi phản ánh sự cố với thông tin chi tiết về vị trí, 
                    loại sự cố và mức độ nghiêm trọng. AI tự động nhận dạng và phân loại.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative grid items-center grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="lg:text-right">
                  <div className="inline-block p-4 mb-4 rounded-lg bg-primary/10 dark:bg-primary/20">
                    <span className="text-2xl font-bold text-primary dark:text-primary/80">
                      03
                    </span>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
                    Xử lý & Giải quyết
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Cán bộ và quản trị viên xem phản ánh, phân công xử lý và 
                    thực hiện giải quyết sự cố. Mọi hoạt động được ghi blockchain.
                  </p>
                </div>
                <div className="relative p-6 bg-gray-50 rounded-2xl dark:bg-gray-900 lg:ml-12">
                  <div className="absolute left-0 w-4 h-4 transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 bg-primary hidden lg:block"></div>
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/30 dark:from-primary/20 dark:to-primary/30 rounded-xl"></div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative grid items-center grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="relative p-6 bg-gray-50 rounded-2xl dark:bg-gray-900 lg:mr-12 lg:order-1">
                  <div className="absolute right-0 w-4 h-4 transform translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 bg-blue-light-500 hidden lg:block"></div>
                  <div className="aspect-video bg-gradient-to-br from-blue-light-100 to-blue-light-200 dark:from-blue-light-900/20 dark:to-blue-light-800/20 rounded-xl"></div>
                </div>
                <div className="lg:order-2">
                  <div className="inline-block p-4 mb-4 rounded-lg bg-blue-light-100 dark:bg-blue-light-500/10">
                    <span className="text-2xl font-bold text-blue-light-500 dark:text-blue-light-400">
                      04
                    </span>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
                    Theo dõi & Báo cáo
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tất cả bên liên quan có thể theo dõi tiến độ xử lý thời gian thực, 
                    xem báo cáo thống kê và kiểm tra tính minh bạch qua blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-gray-50 dark:bg-gray-900 sm:py-32">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="mb-4 font-bold text-gray-900 text-title-sm sm:text-title-md dark:text-white">
              Con số ấn tượng
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              Hiệu quả và tác động của SmartReportAI trong công tác phản ánh và xử lý sự cố
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 dark:bg-primary/20">
                <GroupIcon className="w-8 h-8 text-primary dark:text-primary/80" />
              </div>
              <div className="mb-2 font-bold text-gray-900 text-title-md dark:text-white">
                10,000+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Người dùng đăng ký
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 dark:bg-primary/20">
                <CheckCircleIcon className="w-8 h-8 text-primary dark:text-primary/80" />
              </div>
              <div className="mb-2 font-bold text-gray-900 text-title-md dark:text-white">
                5,000+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Phản ánh đã xử lý
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-light-100 dark:bg-blue-light-500/10">
                <BoxIcon className="w-8 h-8 text-blue-light-500 dark:text-blue-light-400" />
              </div>
              <div className="mb-2 font-bold text-gray-900 text-title-md dark:text-white">
                20,000+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Sự cố được giải quyết
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 dark:bg-primary/20">
                <img src="/images/logo/logo.svg" alt="SmartReportAI Logo" className="w-10 h-10" />
              </div>
              <div className="mb-2 font-bold text-gray-900 text-title-md dark:text-white">
                99.9%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Tỷ lệ hoạt động
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden sm:py-32">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-light-500"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        {/* Animated Orbs */}
        <motion.div
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        
        <div className="relative px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6 font-bold text-white text-title-sm sm:text-title-md drop-shadow-lg"
          >
            Sẵn sàng tạo{" "}
            <span className="bg-gradient-to-r from-white to-brand-100 bg-clip-text text-transparent">
              sự khác biệt
            </span>
            ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-10 text-lg text-white/90 sm:text-xl drop-shadow"
          >
            Tham gia cùng chúng tôi để xây dựng một hệ thống phản ánh và xử lý sự cố 
            minh bạch, hiệu quả và nhân văn hơn.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                className="inline-flex items-center justify-center w-full px-8 py-4 text-base font-semibold transition-all bg-white rounded-xl shadow-2xl text-primary hover:bg-primary/10 hover:shadow-white/30 sm:w-auto group"
              >
                Đăng ký miễn phí
                <motion.svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  whileHover={{ x: 5 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </motion.svg>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full px-8 py-4 text-base font-semibold text-white transition-all border-2 border-white/50 backdrop-blur-sm rounded-xl hover:bg-white/10 hover:border-white sm:w-auto"
              >
                Đã có tài khoản? Đăng nhập
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 overflow-hidden">
        {/* Background with subtle primary accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        {/* Subtle decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
        
        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex items-center mb-6"
              >
                <div className="relative">
                  <img src="/images/logo/logo.svg" alt="SmartReportAI Logo" className="h-10 w-auto" />
                  <div className="absolute inset-0 bg-primary/20 rounded-lg blur-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
              <p className="mb-4 text-gray-200">
                Hệ thống phản ánh và xử lý sự cố thông minh với AI và Blockchain.
              </p>
              <p className="text-sm text-gray-300">
                © 2025 SmartReportAI. All rights reserved.
              </p>
            </div>

            <div>
              <h3 className="mb-6 text-sm font-semibold text-white uppercase tracking-wider relative">
                Sản phẩm
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-primary/50"></div>
              </h3>
              <ul className="space-y-2">
                {["Tính năng", "Bảng giá", "API"].map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <a
                      href={item === "Tính năng" ? "#features" : "#"}
                      className="text-gray-200 transition-colors hover:text-primary/80 relative group inline-block"
                    >
                      {item}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 transition-all group-hover:w-full" />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-6 text-sm font-semibold text-white uppercase tracking-wider relative">
                Công ty
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-primary/50"></div>
              </h3>
              <ul className="space-y-2">
                {["Về chúng tôi", "Blog", "Liên hệ"].map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <a
                      href="#"
                      className="text-gray-200 transition-colors hover:text-primary/80 relative group inline-block"
                    >
                      {item}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 transition-all group-hover:w-full" />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Token Debugger - Remove in production */}
      {/* <TokenDebugger /> */}
      
      {/* Role Tester - Remove in production */}
    </div>
  );
}

