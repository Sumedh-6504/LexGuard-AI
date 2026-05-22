/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  Upload,
  FileText,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { href: ROUTES.DASHBOARD,  label: "Dashboard", icon: Home },
    { href: ROUTES.UPLOAD,     label: "Upload",    icon: Upload },
    { href: ROUTES.CONTRACTS,  label: "Contracts",  icon: FileText },
  ];

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <aside className="w-56 flex-shrink-0 bg-[#ffffff] border-r-3 border-[#1a1a1a] flex flex-col h-screen sticky top-0 z-40 text-[#1a1a1a]">
      {/* ── Brand Logo Header ── */}
      <div className="h-16 px-5 border-b-3 border-[#1a1a1a] flex items-center bg-[#ffffff]">
        <span className="font-black text-lg tracking-[0.12em] uppercase font-sans">
          LexGuard
        </span>
      </div>

      {/* ── Nav Links ── */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black tracking-wider uppercase rounded-none transition-all duration-100 ${
                isActive
                  ? "bg-[#d2c4fb] border-l-4 border-[#1a1a1a]"
                  : "bg-transparent hover:bg-[#f5f4f0] border-l-4 border-transparent"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <Link
          href={ROUTES.SETTINGS}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black tracking-wider uppercase rounded-none transition-all duration-100 ${
            pathname === ROUTES.SETTINGS
              ? "bg-[#d2c4fb] border-l-4 border-[#1a1a1a]"
              : "bg-transparent hover:bg-[#f5f4f0] border-l-4 border-transparent"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      </nav>

      {/* ── Bottom Identity / Profile Card ── */}
      <div className="px-3 py-4 border-t-2 border-[#1a1a1a]/10 bg-[#ffffff] relative">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full flex items-center gap-2.5 p-2 rounded-none hover:bg-[#f5f4f0] transition-all"
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-8 h-8 rounded-none border-2 border-[#1a1a1a]"
            />
          ) : (
            <div className="w-8 h-8 rounded-none border-2 border-[#1a1a1a] bg-[#ffe082] flex items-center justify-center text-xs font-black">
              {initials}
            </div>
          )}
          <div className="min-w-0 text-left flex-1">
            <p className="text-[11px] font-black truncate uppercase tracking-wider leading-none mb-1">
              {user.name || "User"}
            </p>
            <p className="text-[9px] font-mono text-[#555555] truncate leading-none">
              {user.email}
            </p>
          </div>
        </button>

        {showProfileMenu && (
          <div className="absolute left-3 right-3 bottom-[68px] bg-[#ffffff] border-2 border-[#1a1a1a] neo-shadow-sm p-1.5 space-y-0.5">
            <Link
              href={ROUTES.PROFILE}
              onClick={() => setShowProfileMenu(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-black tracking-wider uppercase text-[#1a1a1a] hover:bg-[#f5f4f0] transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              View Profile
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-black tracking-wider uppercase text-[#ff8a80] hover:bg-[#ff8a80]/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
