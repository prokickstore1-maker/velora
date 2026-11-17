"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/common/brand-logo";
import { adminLogoutAction } from "@/app/actions/admin-auth";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products & Versions", icon: Package },
  { href: "/admin/orders", label: "Orders & Verification", icon: ShoppingBag },
  { href: "/admin/reviews", label: "Customer Reviews", icon: MessageSquare },
  { href: "/admin/settings", label: "Store Settings", icon: Settings },
];

export function AdminSidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-plum text-white border-r border-plum-hover flex flex-col justify-between shrink-0">
      <div>
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-plum-hover flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" />
            <span className="text-[10px] font-bold bg-pink text-white px-2 py-0.5 rounded-full uppercase">
              Admin
            </span>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle admin menu"
            className="md:hidden p-1.5 rounded-lg text-white hover:bg-plum-hover transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Links (Collapsible on Mobile, Always Visible on Desktop) */}
        <nav
          className={`${
            mobileMenuOpen ? "block" : "hidden md:block"
          } p-3 sm:p-4 space-y-1.5 text-xs font-semibold`}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? "bg-plum-hover text-white font-bold ring-1 ring-pink/40"
                    : "text-white/80 hover:text-white hover:bg-plum-hover"
                }`}
              >
                <Icon className="w-4 h-4 text-pink shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div
        className={`${
          mobileMenuOpen ? "block" : "hidden md:block"
        } p-3 sm:p-4 border-t border-plum-hover space-y-2`}
      >
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-plum-hover transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-pink shrink-0" />
            View Storefront
          </span>
        </Link>

        <form action={adminLogoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-white/60 hover:text-white hover:bg-destructive/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
