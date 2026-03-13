"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/details", label: "Details" },
  { href: "/contact-us", label: "Contact Support" },
];

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, status } = useAuthSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [pathname, router, status]);

  return (
    <main className="bg-[#fcfaf7] px-4 py-8 sm:px-6 md:px-12 md:py-12 lg:px-[50px]">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
          <aside className="rounded-[18px] border border-black/8 bg-white p-5 sm:p-6">
            <p className="text-[14px] uppercase tracking-[0.08em] text-[#7a7368]">
              Account Dashboard
            </p>
            <h1 className="mt-3 font-display text-[28px] leading-[1.05] text-[#1f1f1f] sm:text-[32px]">
              {status === "loading" ? "Loading..." : session?.user?.name || "Welcome"}
            </h1>
            <p className="mt-3 text-[15px] leading-[1.7] text-[#5b5b5b]">
              {session?.user?.email || session?.user?.username || ""}
            </p>

            <nav className="mt-6 grid gap-3 sm:grid-cols-2 lg:mt-8 lg:grid-cols-1">
              {navItems.map((item) => {
                const isActive =
                  item.href.startsWith("/dashboard") && pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex min-h-11 items-center rounded-[10px] px-4 py-3 text-[15px] font-medium transition-colors ${
                      isActive
                        ? "bg-[#1f1f1f] text-white"
                        : "bg-[#fcfaf7] text-[#2c2c2c] hover:bg-[#f3eee6]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <LogoutButton
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[10px] border border-black/10 px-4 py-3 text-[15px] font-medium text-[#1f1f1f] transition-colors hover:bg-[#f5f0e8] lg:mt-8"
            />
          </aside>

          <div>{children}</div>
        </div>
      </div>
    </main>
  );
}
