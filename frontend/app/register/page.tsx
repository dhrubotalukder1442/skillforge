"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Sparkles,
  X,
} from "lucide-react";

type MessageState = {
  type: "success" | "error";
  text: string;
} | null;

const passwordRules = [
  {
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "One number",
    test: (value: string) => /\d/.test(value),
  },
  {
    label: "One special character",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);
  const [loading, setLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordChecks = useMemo(
    () =>
      passwordRules.map((rule) => ({
        ...rule,
        valid: rule.test(password),
      })),
    [password],
  );

  const passwordValid = passwordChecks.every((rule) => rule.valid);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage(null);
    setPasswordTouched(true);

    if (!passwordValid) {
      setMessage({
        type: "error",
        text: "Update your password to meet all three requirements.",
      });
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const data = (await response.json()) as {
        access_token?: string;
        email?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      setMessage({
        type: "success",
        text: `Welcome to SkillForge${
          data.email ? `, ${data.email}` : ""
        }.`,
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
                <Sparkles
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  strokeWidth={2.5}
                />
              </div>

              <span className="text-base font-bold tracking-[-0.03em] sm:text-lg">
                SkillForge
              </span>
            </div>

            <p className="mb-3 max-w-sm text-xs font-semibold uppercase tracking-[0.14em] text-[#8ed9c6] sm:mb-5 sm:text-sm sm:tracking-[0.18em]">
              Build what&apos;s next
            </p>

            <h1 className="max-w-md text-[1.75rem] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-4xl sm:tracking-[-0.05em] md:text-5xl md:leading-[1.03] md:tracking-[-0.06em]">
              Turn curiosity into your next skill.
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[#b9c5dc] sm:mt-6 sm:text-base sm:leading-7">
              Create a focused learning roadmap, keep momentum, and make
              progress you can see.
            </p>
          </div>

          <div className="relative mt-8 grid gap-3 sm:mt-0 sm:gap-4">
            {[
              ["01", "Choose your direction"],
              ["02", "Follow a clear roadmap"],
              ["03", "Make progress that sticks"],
            ].map(([number, label], index) => (
              <div
                className="flex items-center gap-3 sm:gap-4"
                key={number}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold sm:h-9 sm:w-9 ${
                    index === 0
                      ? "border-[#46c2a5] bg-[#46c2a5] text-[#14213d]"
                      : "border-white/20 text-[#aebbd2]"
                  }`}
                >
                  {index === 0 ? (
                    <Check
                      className="h-4 w-4"
                      strokeWidth={3}
                    />
                  ) : (
                    number
                  )}
                </span>

                <span
                  className={`text-sm sm:text-base ${
                    index === 0 ? "text-white" : "text-[#aebbd2]"
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
                Start your journey
              </p>

              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#14213d] sm:text-3xl sm:tracking-[-0.05em] md:text-[2.2rem]">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#64748b] sm:mt-3 sm:text-[15px]">
                Join SkillForge and start building your learning roadmap.
              </p>
            </div>

            <form
              className="space-y-4 sm:space-y-5"
              onSubmit={handleSubmit}
            >
              <div>
                <label
                  className="mb-1.5 block text-sm font-semibold text-[#334155] sm:mb-2"
                  htmlFor="name"
                >
                  Full name
                </label>

                <input
                  autoComplete="name"
                  className="h-11 w-full rounded-xl border border-[#dce3ee] bg-[#fbfcfe] px-4 text-[15px] text-[#14213d] outline-none transition placeholder:text-[#9aa8ba] focus:border-[#6d63ff] focus:bg-white focus:ring-4 focus:ring-[#6d63ff]/10 sm:h-12"
                  id="name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  required
                  type="text"
                  value={name}
                />
              </div>

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
                    Secure your account
                  </span>
                </div>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94a3b8]" />

                  <input
                    aria-describedby="password-requirements"
                    aria-invalid={passwordTouched && !passwordValid}
                    autoComplete="new-password"
                    className="h-11 w-full rounded-xl border border-[#dce3ee] bg-[#fbfcfe] pl-11 pr-12 text-[15px] text-[#14213d] outline-none transition placeholder:text-[#9aa8ba] focus:border-[#6d63ff] focus:bg-white focus:ring-4 focus:ring-[#6d63ff]/10 aria-[invalid=true]:border-[#e57373] aria-[invalid=true]:focus:ring-[#e57373]/10 sm:h-12"
                    id="password"
                    minLength={8}
                    onBlur={() => setPasswordTouched(true)}
                    onChange={(event) => setPassword(event.target.value)}
                    pattern="(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}"
                    placeholder="Create a strong password"
                    required
                    title="Use at least 8 characters, one number, and one special character."
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />

                  <button
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#7f8da3] transition hover:bg-[#eef1f7] hover:text-[#14213d] focus:outline-none focus:ring-2 focus:ring-[#6d63ff]/40"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>

                <div
                  className="mt-3 flex flex-wrap gap-x-3 gap-y-2 sm:gap-x-4"
                  id="password-requirements"
                >
                  {passwordChecks.map((rule) => {
                    const showValid =
                      password.length > 0 && rule.valid;

                    const showInvalid =
                      passwordTouched && !rule.valid;

                    return (
                      <div
                        className={`flex items-center gap-1.5 text-[11px] font-medium sm:text-xs ${
                          showValid
                            ? "text-[#159a78]"
                            : showInvalid
                              ? "text-[#d45c63]"
                              : "text-[#8190a6]"
                        }`}
                        key={rule.label}
                      >
                        {showValid ? (
                          <Check
                            className="h-3.5 w-3.5 shrink-0"
                            strokeWidth={2.5}
                          />
                        ) : showInvalid ? (
                          <X
                            className="h-3.5 w-3.5 shrink-0"
                            strokeWidth={2.5}
                          />
                        ) : (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                        )}

                        {rule.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#6d63ff] text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(109,99,255,0.24)] transition hover:bg-[#5d53eb] hover:shadow-[0_12px_28px_rgba(109,99,255,0.32)] focus:outline-none focus:ring-4 focus:ring-[#6d63ff]/25 disabled:cursor-not-allowed disabled:bg-[#a9a4f7] disabled:shadow-none sm:h-12"
                disabled={loading}
                type="submit"
              >
                {loading
                  ? "Creating your account..."
                  : "Create account"}

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
              By creating an account, you agree to our{" "}
              <span className="font-semibold text-[#64748b]">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="font-semibold text-[#64748b]">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}