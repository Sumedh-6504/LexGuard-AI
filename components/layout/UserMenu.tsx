/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-none transition-all duration-100 hover:opacity-80"
        aria-label="User menu"
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
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#ffffff] border-2 border-[#1a1a1a] neo-shadow z-50">
          <div className="px-4 py-3 border-b-2 border-[#1a1a1a]/10">
            <div className="flex items-center gap-3">
              <div className="p-2 border-2 border-[#1a1a1a] bg-[#d2c4fb]">
                <User className="w-4 h-4 text-[#1a1a1a]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black truncate uppercase tracking-wider text-[#1a1a1a]">
                  {user.name || "User"}
                </p>
                <p className="text-[10px] font-mono text-[#555555] truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="p-1.5 space-y-0.5">
            <Link
              href={ROUTES.PROFILE}
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-black tracking-wider uppercase hover:bg-[#f5f4f0] transition-colors text-[#1a1a1a]"
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
        </div>
      )}
    </div>
  );
}
