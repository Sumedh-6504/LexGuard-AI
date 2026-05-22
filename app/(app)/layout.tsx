/**
 * App Layout — Authenticated pages.
 *
 * Wraps all protected routes with:
 *   - NextAuth SessionProvider (for useSession() in client components)
 *   - Sidebar left vertical navigation
 *   - Warm Sand background matching the Retro Neo-Brutalist look
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Defensive redirect
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex bg-[#f5f4f0] text-[#111111]">
        {/* Left Vertical Sidebar */}
        <Sidebar
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
        />

        {/* Right Scrollable Page Content Frame */}
        <main className="flex-1 h-screen overflow-y-auto">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
