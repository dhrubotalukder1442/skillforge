"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";

type UserProfile = {
  userId: number;
  email: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError("Could not load your profile. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <p className="text-sm font-medium text-[#64748b]">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4">
        <p className="text-sm font-medium text-[#ba4d58]">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 font-sans text-[#14213d] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#46c2a5] text-[#14213d] shadow-[0_10px_24px_rgba(70,194,165,0.28)]">
              <Sparkles className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-[-0.03em]">
              SkillForge
            </span>
          </div>

          <button
            className="flex items-center gap-2 rounded-xl border border-[#dce3ee] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition hover:bg-[#f8fafc]"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" strokeWidth={2.5} />
            Log out
          </button>
        </div>

        <div className="rounded-[24px] bg-white p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
            Dashboard
          </p>
          <h1 className="mb-1 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
            Welcome back{user?.email ? `, ${user.email}` : ""}
          </h1>
          <p className="text-sm text-[#64748b]">
            Your account is authenticated. This is where your resume
            upload, skill gap analysis, and roadmap will live.
          </p>
        </div>
      </div>
    </main>
  );
}