import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Quán Ngon | Ẩm thực Việt truyền thống",
  description: "Khám phá thực đơn, đặt bàn trực tuyến và trải nghiệm ẩm thực Việt đậm đà tại Quán Ngon.",
};

import { auth } from "@/lib/auth";
import { ActiveOrderFAB } from "@/components/layout/ActiveOrderFAB";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-zinc-900">
        <SessionProvider session={session}>
          <Toaster position="bottom-right" />
          {children}
          <ActiveOrderFAB />
        </SessionProvider>
      </body>
    </html>
  );
}
