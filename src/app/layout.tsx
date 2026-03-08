import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ShotPro VMS",
  description: "Video Management System for production companies",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      profile = data;
    } catch {
      // profiles table may not exist yet (migration not run)
    }
    // Fallback profile from auth user
    if (!profile) {
      profile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        role: "producer",
        avatar_url: null,
        email: user.email,
      };
    }
  }

  return (
    <html lang="en">
      <body className="antialiased">
        {user && <Sidebar user={profile} />}
        <main className={user ? "ml-64 min-h-screen" : "min-h-screen"}>
          {children}
        </main>
      </body>
    </html>
  );
}
