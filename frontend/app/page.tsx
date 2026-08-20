"use client";

import { useEffect, useRef, useState } from "react";
import { motion, MotionConfig } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Design tokens (see comment block at bottom of file for rationale)  */
/* ------------------------------------------------------------------ */
const INK = "#05070A";
const PANEL = "#0B1220";
const TEAL = "#22E5B0";
const AMBER = "#FFA94D";
const VIOLET = "#8B7CFF";
const TEXT = "#EDF1F7";
const MUTED = "#8B95A8";

/* ------------------------------------------------------------------ */
/*  Small reusable primitives                                          */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 46, rotateX: -10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformPerspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}

function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)",
  });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setStyle({
      transform: `perspective(900px) rotateX(${y * -9}deg) rotateY(${
        x * 11
      }deg) translateZ(6px)`,
      transition: "transform 0.12s ease-out",
    });
  }

  function handleLeave() {
    setStyle({
      transform: "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)",
      transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
    });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero — 3D Readiness Orb                                            */
/* ------------------------------------------------------------------ */

function ReadinessOrb() {
  const [pct, setPct] = useState(0);
  const skills = ["React", "Node.js", "SQL", "Docker", "Git"];

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const target = 78;
    const duration = 1500;
    const step = (t: number) => {
      if (start === null) start = t;
      const progress = Math.min((t - start) / duration, 1);
      setPct(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="scale-[0.72] sm:scale-90 md:scale-100 origin-center">
      <div className="orb-scene">
        <div className="orb-radar" />
        <div className="orb-core">
          <div className="orb-ring orb-ring--1" />
          <div className="orb-ring orb-ring--2" />
          <div className="orb-ring orb-ring--3" />
          <div className="orb-center">
            <span className="orb-pct">{pct}%</span>
            <span className="orb-label">Job Ready</span>
          </div>
          {skills.map((s, i) => (
            <div
              key={s}
              className="orb-chip"
              style={
                {
                  "--i": i,
                  "--n": skills.length,
                } as React.CSSProperties
              }
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons (hand-rolled, no dependency)                                 */
/* ------------------------------------------------------------------ */

function IconScan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M12 3.5 4 8l8 4.5L20 8l-8-4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M4 12.5 12 17l8-4.5M4 16.5 12 21l8-4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRoute() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <circle cx="5" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="19" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 8c0 5 14 3 14 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <rect
        x="9"
        y="3"
        width="6"
        height="11"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3m-3.5 0h7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                              */
/* ------------------------------------------------------------------ */

function Header() {
  const links = [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Mock Interview", href: "#interview" },
  ];
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-[#05070A]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="logo-text text-2xl font-semibold tracking-tight">
            Skill<span className="logo-forge">Forge</span>
          </span>
          <span
            className="hidden sm:inline text-[10px] uppercase tracking-[0.18em]"
            style={{ color: MUTED }}
          >
            AI Career Readiness
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22E5B0] rounded"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="/login"
          className="rounded-full px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22E5B0]"
          style={{ background: `linear-gradient(120deg, ${TEAL}, ${VIOLET})` }}
        >
          Get Started
        </a>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Background FX — grid + glow + particles                            */
/* ------------------------------------------------------------------ */

function BackgroundFX() {
  const particles = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="bg-grid absolute inset-0 opacity-[0.25]" />
      <div className="glow-blob glow-blob--teal" />
      <div className="glow-blob glow-blob--violet" />
      {particles.map((_, i) => (
        <span
          key={i}
          className="particle"
          style={
            {
              left: `${(i * 137) % 100}%`,
              top: `${(i * 71) % 100}%`,
              animationDelay: `${(i % 7) * 1.3}s`,
              animationDuration: `${9 + (i % 5) * 2}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section id="top" className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-40">
      <div className="grid items-center gap-16 md:grid-cols-2">
        <div>
          <Reveal>
            <span
              className="mb-6 inline-block rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
              style={{ color: TEAL }}
            >
              AI Career Readiness Platform
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Know exactly what stands between you and your next job.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-md text-base leading-7" style={{ color: MUTED }}>
              SkillForge reads your resume and GitHub, scores what you actually
              know, and builds a prioritized roadmap toward the role you're
              targeting — then puts it to the test with an AI mock interview.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-9 flex flex-wrap gap-4">
            <a
              href="#cta"
              className="rounded-full px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22E5B0]"
              style={{ background: `linear-gradient(120deg, ${TEAL}, ${VIOLET})` }}
            >
              Analyze My Skills
            </a>
            <a
              href="#how-it-works"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/85 transition-colors hover:border-white/35 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22E5B0]"
            >
              See How It Works
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <ReadinessOrb />
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick stats                                                        */
/* ------------------------------------------------------------------ */

function StatsBar() {
  const stats = [
    { label: "Skills detected", value: "24" },
    { label: "Skills missing", value: "8" },
    { label: "Roadmap complete", value: "64%" },
    { label: "Latest interview score", value: "78" },
  ];
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <TiltCard className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center">
              <div
                className="stat-num text-3xl font-semibold"
                style={{ color: i % 2 === 0 ? TEAL : AMBER }}
              >
                {s.value}
              </div>
              <div className="mt-2 text-xs" style={{ color: MUTED }}>
                {s.label}
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Features / Skill Intelligence                                      */
/* ------------------------------------------------------------------ */

function Features() {
  const items = [
    {
      icon: <IconScan />,
      title: "Skill Analysis",
      desc: "Your resume and GitHub are parsed for real skills, then rated Beginner, Intermediate, or Expert — not just present or absent.",
      color: TEAL,
    },
    {
      icon: <IconLayers />,
      title: "Skill Gap Detection",
      desc: "See your skills next to what your target role actually needs, so you know precisely what's missing before you plan anything.",
      color: AMBER,
    },
    {
      icon: <IconRoute />,
      title: "Personalized Roadmap",
      desc: "Missing skills get ordered by impact — the roadmap tells you what to learn first, and links straight to a resource.",
      color: VIOLET,
    },
  ];

  return (
    <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-tight">
          Your Skill Intelligence
        </h2>
        <p className="mt-3 max-w-lg text-sm" style={{ color: MUTED }}>
          See what you know, how strong you are, and exactly where to improve
          next.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 0.08}>
            <TiltCard className="h-full rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-7">
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  color: it.color,
                  background: `${it.color}1A`,
                  border: `1px solid ${it.color}33`,
                }}
              >
                {it.icon}
              </div>
              <h3 className="text-lg font-medium">{it.title}</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: MUTED }}>
                {it.desc}
              </p>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How it works                                                       */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Upload & Connect",
      desc: "Add your resume and connect GitHub.",
    },
    {
      n: "02",
      title: "AI Extracts Skills",
      desc: "NLP and proficiency detection read what you actually know.",
    },
    {
      n: "03",
      title: "Compare to Target Role",
      desc: "See exactly which required skills you're missing.",
    },
    {
      n: "04",
      title: "Roadmap + Interview",
      desc: "Follow a prioritized path, then practice with a mock interview.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative z-10 mx-auto max-w-6xl px-6 pb-24"
    >
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-tight">How It Works</h2>
      </Reveal>

      <div className="relative mt-14 grid gap-8 md:grid-cols-4">
        <div className="how-line hidden md:block" />
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.08}>
            <TiltCard className="relative rounded-2xl border border-white/[0.08] bg-[#0B1220]/60 p-6">
              <span
                className="font-mono text-xs"
                style={{ color: TEAL }}
              >
                {s.n}
              </span>
              <h3 className="mt-3 text-base font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: MUTED }}>
                {s.desc}
              </p>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock interview spotlight                                           */
/* ------------------------------------------------------------------ */

function InterviewSpotlight() {
  const breakdown = [
    { label: "Technical Knowledge", value: 82 },
    { label: "Communication", value: 76 },
    { label: "Problem Solving", value: 74 },
    { label: "Answer Relevance", value: 81 },
  ];

  return (
    <section id="interview" className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <Reveal>
          <div
            className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ color: TEAL, background: `${TEAL}1A`, border: `1px solid ${TEAL}33` }}
          >
            <IconMic />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Practice before it counts.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6" style={{ color: MUTED }}>
            Role-specific mock interviews are scored and broken down question
            by question. Weak answers feed straight back into your roadmap —
            so what you practice next always maps to what you're weakest at.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <TiltCard className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Full Stack Developer</div>
                <div className="text-xs" style={{ color: MUTED }}>
                  20 questions · 15 completed
                </div>
              </div>
              <div className="font-mono text-2xl font-semibold" style={{ color: TEAL }}>
                78<span className="text-sm" style={{ color: MUTED }}>/100</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {breakdown.map((b) => (
                <div key={b.label}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span style={{ color: MUTED }}>{b.label}</span>
                    <span className="font-mono">{b.value}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${TEAL}, ${VIOLET})` }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${b.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Why SkillForge                                                     */
/* ------------------------------------------------------------------ */

function WhySkillForge() {
  const points = [
    {
      title: "Gap-first, not generic",
      desc: "You get the exact skills missing for your target role — not a one-size-fits-all course list.",
    },
    {
      title: "Real signal, not guesswork",
      desc: "Your resume and GitHub are read the way a hiring manager would: proficiency, not just presence.",
    },
    {
      title: "A closed feedback loop",
      desc: "Mock interview results feed straight back into your roadmap, so every session sharpens the next.",
    },
  ];
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
      <div className="grid gap-6 md:grid-cols-3">
        {points.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}>
            <div className="rounded-2xl border border-white/[0.06] p-6">
              <h3 className="text-base font-medium" style={{ color: TEAL }}>
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-6" style={{ color: MUTED }}>
                {p.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Final CTA                                                          */
/* ------------------------------------------------------------------ */

function FinalCTA() {
  return (
    <section id="cta" className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
      <Reveal>
        <TiltCard className="cta-panel rounded-3xl border border-white/[0.08] px-8 py-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to know where you actually stand?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm" style={{ color: MUTED }}>
            Your next improvement is one analysis away.
          </p>
          <a
            href="/register"
            className="mt-8 inline-block rounded-full px-7 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22E5B0]"
            style={{ background: `linear-gradient(120deg, ${TEAL}, ${VIOLET})` }}
          >
            Start Your Skill Analysis
          </a>
        </TiltCard>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "How it Works", href: "#how-it-works" },
        { label: "Mock Interview", href: "#interview" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="relative z-10 border-t border-white/[0.06] px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="logo-text text-xl font-semibold">
              Skill<span className="logo-forge">Forge</span>
            </span>
            <p className="mt-3 max-w-[220px] text-sm leading-6" style={{ color: MUTED }}>
              AI career readiness — know your skills, close the gap, land the
              role.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-xs uppercase tracking-[0.14em]" style={{ color: MUTED }}>
                {c.title}
              </div>
              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-white/75 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22E5B0] rounded"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/[0.06] pt-6 text-xs sm:flex-row sm:items-center sm:justify-between" style={{ color: MUTED }}>
          <span>&copy; {new Date().getFullYear()} SkillForge. All rights reserved.</span>
          <span>Built for job-ready developers.</span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative min-h-screen overflow-x-hidden"
        style={{ background: INK, color: TEXT }}
      >
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500;600&display=swap");

          :root {
            --font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
            --font-body: "Inter", ui-sans-serif, system-ui, sans-serif;
            --font-mono: "JetBrains Mono", ui-monospace, monospace;
          }

          body {
            font-family: var(--font-body);
          }

          h1, h2, h3, .logo-text {
            font-family: var(--font-display);
          }

          .font-mono {
            font-family: var(--font-mono);
          }

          /* ---------- logo ---------- */
          .logo-text {
            background: linear-gradient(110deg, ${TEAL}, ${VIOLET}, ${TEAL});
            background-size: 220% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: logo-shift 6s ease-in-out infinite;
          }
          .logo-forge {
            background: linear-gradient(110deg, ${AMBER}, ${TEAL});
            background-size: 220% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: logo-shift 6s ease-in-out infinite reverse;
          }
          @keyframes logo-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          /* ---------- background fx ---------- */
          .bg-grid {
            background-image:
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
            background-size: 56px 56px;
            mask-image: radial-gradient(ellipse 70% 60% at 50% 20%, black 40%, transparent 90%);
          }
          .glow-blob {
            position: absolute;
            width: 480px;
            height: 480px;
            border-radius: 50%;
            filter: blur(120px);
            opacity: 0.22;
            animation: pulse-glow 10s ease-in-out infinite;
          }
          .glow-blob--teal {
            top: -120px;
            left: 8%;
            background: ${TEAL};
          }
          .glow-blob--violet {
            top: 220px;
            right: 6%;
            background: ${VIOLET};
            animation-delay: 2.5s;
          }
          @keyframes pulse-glow {
            0%, 100% { transform: scale(1); opacity: 0.18; }
            50% { transform: scale(1.15); opacity: 0.28; }
          }
          .particle {
            position: absolute;
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: ${TEAL};
            opacity: 0.5;
            animation-name: float-particle;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
          }
          @keyframes float-particle {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.15; }
            50% { transform: translateY(-40px) translateX(14px); opacity: 0.6; }
          }

          /* ---------- readiness orb ---------- */
          .orb-scene {
            position: relative;
            width: 340px;
            height: 340px;
            perspective: 1200px;
          }
          .orb-radar {
            position: absolute;
            inset: -20px;
            border-radius: 50%;
            background: conic-gradient(from 0deg, ${TEAL}22, transparent 30%);
            animation: radar-spin 6s linear infinite;
          }
          @keyframes radar-spin {
            to { transform: rotate(360deg); }
          }
          .orb-core {
            position: relative;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            animation: orb-spin 22s linear infinite;
          }
          @keyframes orb-spin {
            from { transform: rotateY(0deg) rotateX(10deg); }
            to { transform: rotateY(360deg) rotateX(10deg); }
          }
          .orb-ring {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 1px solid rgba(34, 229, 176, 0.28);
          }
          .orb-ring--1 { transform: rotateX(76deg); }
          .orb-ring--2 { transform: rotateX(76deg) rotateZ(60deg); border-color: rgba(255,169,77,0.22); }
          .orb-ring--3 { transform: rotateX(76deg) rotateZ(120deg); border-color: rgba(139,124,255,0.22); }
          .orb-center {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .orb-pct {
            font-family: var(--font-mono);
            font-size: 3rem;
            font-weight: 600;
            background: linear-gradient(135deg, ${TEAL}, ${VIOLET});
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .orb-label {
            font-size: 0.75rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: ${MUTED};
            margin-top: 4px;
          }
          .orb-chip {
            position: absolute;
            top: 50%;
            left: 50%;
            padding: 6px 14px;
            border-radius: 999px;
            background: rgba(11, 18, 32, 0.85);
            border: 1px solid rgba(255,255,255,0.1);
            font-family: var(--font-mono);
            font-size: 0.72rem;
            white-space: nowrap;
            backdrop-filter: blur(4px);
            transform: translate(-50%, -50%)
              rotateY(calc(var(--i) * (360deg / var(--n))))
              translateZ(172px);
          }

          /* ---------- how it works connector ---------- */
          .how-line {
            position: absolute;
            top: 14px;
            left: 12%;
            right: 12%;
            height: 1px;
            background: linear-gradient(90deg, ${TEAL}55, ${VIOLET}55, ${AMBER}55);
          }

          /* ---------- final cta panel ---------- */
          .cta-panel {
            background:
              radial-gradient(ellipse 80% 100% at 50% 0%, ${TEAL}14, transparent 60%),
              linear-gradient(180deg, rgba(255,255,255,0.04), transparent);
          }

          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.001ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.001ms !important;
            }
          }
        `}</style>

        <BackgroundFX />
        <Header />
        <main>
          <Hero />
          <StatsBar />
          <Features />
          <HowItWorks />
          <InterviewSpotlight />
          <WhySkillForge />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}