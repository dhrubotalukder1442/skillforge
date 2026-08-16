"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Sparkles,
  Check,
} from "lucide-react";

type MessageState = {
  type: "success" | "error";
  text: string;
} | null;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as {
        access_token?: string;
        user?: { id: number; email: string; name: string };
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      setMessage({
        type: "success",
        text: `Welcome back${data.user?.name ? `, ${data.user.name}` : ""}.`,
      });
      router.push("/dashboard");
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f7fb] px-3 py-6 font-sans text-[#14213d] sm:px-6 sm:py-10 lg:p-8">
      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 overflow-hidden rounded-[20px] bg-white shadow-[0_12px_40px_rgba(30,52,92,0.12)] sm:rounded-[24px] sm:shadow-[0_20px_70px_rgba(30,52,92,0.14)] lg:min-h-[760px] lg:grid-cols-[0.92fr_1.08fr] lg:rounded-[30px] lg:shadow-[0_28px_90px_rgba(30,52,92,0.15)]">
        <section className="relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-[#14213d] p-5 text-white sm:min-h-[420px] sm:p-8 md:min-h-[480px] md:p-10 lg:min-h-0">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#46c2a5]/20 blur-2xl sm:-right-28 sm:-top-24 sm:h-80 sm:w-80" />

          <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[#6d63ff]/25 blur-3xl sm:-bottom-28 sm:-left-20 sm:h-72 sm:w-72" />

          <div className="relative">
            <div className="mb-8 flex items-center gap-3 sm:mb-14 md:mb-20">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#46c2a5] text-[#14213d] shadow-[0_10px_24px_rgba(70,194,165,0.28)] sm:h-10 sm:w-10">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
              </div>

              <span className="text-base font-bold tracking-[-0.03em] sm:text-lg">
                SkillForge
              </span>
            </div>

            <p className="mb-3 max-w-sm text-xs font-semibold uppercase tracking-[0.14em] text-[#8ed9c6] sm:mb-5 sm:text-sm sm:tracking-[0.18em]">
              Welcome back
            </p>

            <h1 className="max-w-md text-[1.75rem] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-4xl sm:tracking-[-0.05em] md:text-5xl md:leading-[1.03] md:tracking-[-0.06em]">
              Pick up right where you left off.
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[#b9c5dc] sm:mt-6 sm:text-base sm:leading-7">
              Your roadmap, your progress, and your next step are all
              waiting for you.
            </p>
          </div>

          <div className="relative mt-8 grid gap-3 sm:mt-0 sm:gap-4">
            {[
              ["01", "Choose your direction"],
              ["02", "Follow a clear roadmap"],
              ["03", "Make progress that sticks"],
            ].map(([number, label], index) => (
              <div className="flex items-center gap-3 sm:gap-4" key={number}>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold sm:h-9 sm:w-9 ${
                    index === 1
                      ? "border-[#46c2a5] bg-[#46c2a5] text-[#14213d]"
                      : "border-white/20 text-[#aebbd2]"
                  }`}
                >
                  {index === 1 ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    number
                  )}
                </span>

                <span
                  className={`text-sm sm:text-base ${
                    index === 1 ? "text-white" : "text-[#aebbd2]"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-8 sm:py-12 md:px-12 md:py-14 lg:px-16">
          <div className="w-full max-w-[430px]">
            <div className="mb-6 sm:mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b] sm:mb-3 sm:text-sm sm:tracking-[0.16em]">
                Continue your journey
              </p>

              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#14213d] sm:text-3xl sm:tracking-[-0.05em] md:text-[2.2rem]">
                Log in to your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#64748b] sm:mt-3 sm:text-[15px]">
                Enter your details to access your dashboard.
              </p>
            </div>

            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  className="mb-1.5 block text-sm font-semibold text-[#334155] sm:mb-2"
                  htmlFor="email"
                >
                  Email address
                </label>

                <input
                  autoComplete="email"
                  className="h-11 w-full rounded-xl border border-[#dce3ee] bg-[#fbfcfe] px-4 text-[15px] text-[#14213d] outline-none transition placeholder:text-[#9aa8ba] focus:border-[#6d63ff] focus:bg-white focus:ring-4 focus:ring-[#6d63ff]/10 sm:h-12"
                  id="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </div>

              <div>
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1 sm:mb-2">
                  <label
                    className="block text-sm font-semibold text-[#334155]"
                    htmlFor="password"
                  >
                    Password
                  </label>

                  <span className="text-xs font-medium text-[#94a3b8]">
                    Forgot password?
                  </span>
                </div>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94a3b8]" />

                  <input
                    autoComplete="current-password"
                    className="h-11 w-full rounded-xl border border-[#dce3ee] bg-[#fbfcfe] pl-11 pr-12 text-[15px] text-[#14213d] outline-none transition placeholder:text-[#9aa8ba] focus:border-[#6d63ff] focus:bg-white focus:ring-4 focus:ring-[#6d63ff]/10 sm:h-12"
                    id="password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />

                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#7f8da3] transition hover:bg-[#eef1f7] hover:text-[#14213d] focus:outline-none focus:ring-2 focus:ring-[#6d63ff]/40"
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              <button
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#6d63ff] text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(109,99,255,0.24)] transition hover:bg-[#5d53eb] hover:shadow-[0_12px_28px_rgba(109,99,255,0.32)] focus:outline-none focus:ring-4 focus:ring-[#6d63ff]/25 disabled:cursor-not-allowed disabled:bg-[#a9a4f7] disabled:shadow-none sm:h-12"
                disabled={loading}
                type="submit"
              >
                {loading ? "Logging in..." : "Log in"}

                {!loading && (
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            </form>

            {message && (
              <div
                aria-live="polite"
                className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium sm:mt-5 ${
                  message.type === "success"
                    ? "border-[#bce8da] bg-[#effbf7] text-[#13795f]"
                    : "border-[#f2c9cd] bg-[#fff5f5] text-[#ba4d58]"
                }`}
              >
                {message.text}
              </div>
            )}

            <p className="mt-6 text-center text-xs leading-5 text-[#91a0b4] sm:mt-7">
              Don&apos;t have an account?{" "}
              <span className="font-semibold text-[#6d63ff]">
                Create one
              </span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}