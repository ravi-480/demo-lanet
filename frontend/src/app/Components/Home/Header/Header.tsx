import Link from "next/link";
import { AuthButtons } from "./AuthButton";

const Header = () => {
  return (
    <header className="w-full sticky top-0 h-16 z-30 shadow-md bg-black">
      <div className="container mx-auto px-4 md:px-40 h-full flex items-center justify-between">
        <Link href="/">
          <span className="text-2xl font-bold text-[#d4c99e]">EventWise</span>
        </Link>

        <nav className="flex gap-6">
          <Link href="/dashboard" className="text-white hover:text-[#d4c99e]">
            Dashboard
          </Link>
          <Link href="/events" className="text-white hover:text-[#d4c99e]">
            Events
          </Link>
          <Link href="/contact" className="text-white hover:text-[#d4c99e]">
            Contact
          </Link>
        </nav>

        <AuthButtons />
      </div>
    </header>
  );
};

export default Header;
