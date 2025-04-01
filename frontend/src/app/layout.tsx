// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./Components/Home/Header/Header";
import ReduxProvider from "@/store/storeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventWise | Modern, Intuitive Design",
  description: "Streamline your event planning with intuitive modern design",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#1a1a1a] text-white`}>
        <ReduxProvider>
          <Header />
          {children}
          <div id="portal-root"></div>
        </ReduxProvider>
      </body>
    </html>
  );
}
