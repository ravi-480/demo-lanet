import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./Components/Home/Header/Header";
import Footer from "./Components/Home/Footer/Footer";
import ReduxProvider from "@/store/storeProvider";
import { Toaster } from "sonner";
import NotificationLoader from "@/utils/NotificationLoader";

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
      <body
        className={`${inter.className} bg-gray-950 text-white min-h-screen flex flex-col`}
      >
        <ReduxProvider>
          <NotificationLoader />
          <Header />
          <main className="flex-1">{children}</main>
          <Toaster richColors />
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
