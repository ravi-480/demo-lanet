import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthGuard from "../Components/Home/AuthGuard/AuthGuard";

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
        <AuthGuard>{children}</AuthGuard>
  );
}