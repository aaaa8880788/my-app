import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/main.scss";
import "antd/dist/reset.css";

// 优化字体加载，使用display: swap确保页面快速渲染
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "评分系统",
  description: "前后端结合的评分系统",
  // 添加视口元标签，确保在移动设备上正确显示
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  // 添加主题颜色，优化移动设备体验
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen overflow-x-hidden`}
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        {/* 页面内容容器，确保一致的内边距和最大宽度 */}
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
