// components/main-navbar.tsx
import { AuthStatus } from "@/components/auth/auth-status";
import { Logo } from "@/components/logo";
import Link from "next/link";

export function MainNavbar() {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="mr-4">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <AuthStatus />
        </div>
      </div>
    </div>
  );
}