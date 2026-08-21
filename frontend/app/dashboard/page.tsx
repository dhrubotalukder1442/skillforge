"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  Tag,
  Target,
  Map as MapIcon,
  ExternalLink,
  Code2,
  Loader2,
  Search,
  RefreshCw,
  Home,
  Brain,
  Rocket,
  BarChart3,
  User,
  Settings,
  Bell,
  Mic,
  Trophy,
  Flame,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Lock,
  Camera,
  Sun,
  Moon,
  Atom,
  Server,
  Database,
  Container,
  GitBranch,
  Cloud,
  Braces,
  Palette,
  Globe,
  Cpu,
  Phone,
  Mail,
} from "lucide-react";

type UserProfile = {
  userId: number;
  email: string;
};

type Job = {
  id: number | null;
  title: string;
  isNew?: boolean;
};

type SkillGapResult = {
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  readinessScore: number;
};

type RoadmapStepData = {
  id: number;
  skillName: string;
  resourceTitle: string;
  resourceUrl: string;
  order: number;
  status: string;
};

type RoadmapData = {
  id: number;
  generatedAt: string;
  steps: RoadmapStepData[];
};

// ---------------------------------------------------------------------
// Small presentation helpers (module scope, no state needed)
// ---------------------------------------------------------------------

function getSkillIcon(skill: string) {
  const key = skill.toLowerCase();
  if (key.includes("react")) return Atom;
  if (key.includes("node")) return Server;
  if (key.includes("sql") || key.includes("redis") || key.includes("mongo") || key.includes("database"))
    return Database;
  if (key.includes("docker") || key.includes("container") || key.includes("kubernetes")) return Container;
  if (key.includes("git")) return GitBranch;
  if (key.includes("aws") || key.includes("cloud") || key.includes("azure") || key.includes("gcp"))
    return Cloud;
  if (key.includes("script") || key === "js" || key === "ts") return Braces;
  if (key.includes("css") || key.includes("design") || key.includes("figma")) return Palette;
  if (key.includes("api") || key.includes("rest") || key.includes("graphql")) return Globe;
  return Cpu;
}

function proficiencyColor(proficiency: string) {
  if (proficiency === "Expert") return "#46c2a5";
  if (proficiency === "Intermediate") return "#6d63ff";
  if (proficiency === "Beginner") return "#f5b942";
  return "#94a3b8";
}

function proficiencyPercent(proficiency: string) {
  if (proficiency === "Expert") return 100;
  if (proficiency === "Intermediate") return 65;
  if (proficiency === "Beginner") return 30;
  return 10;
}

function ProficiencyRing({ skill, proficiency }: { skill: string; proficiency: string }) {
  const Icon = getSkillIcon(skill);
  const color = proficiencyColor(proficiency);
  const percent = proficiencyPercent(proficiency);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-7 w-7" style={{ color }} strokeWidth={2.25} />
        </div>
      </div>
      <p className="max-w-[90px] truncate text-center text-xs font-semibold" title={skill}>
        {skill}
      </p>
      <span className="text-[10px] font-bold" style={{ color }}>
        {proficiency}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  type MatchedSkill = { skill: string; proficiency: string };
  const [matchedSkills, setMatchedSkills] = useState<MatchedSkill[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [githubUsername, setGithubUsername] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubMessage, setGithubMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [githubSkills, setGithubSkills] = useState<MatchedSkill[]>([]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [roleQuery, setRoleQuery] = useState("");
  const [roleSuggestions, setRoleSuggestions] = useState<Job[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);
  const [gapResult, setGapResult] = useState<SkillGapResult | null>(null);
  const [gapLoading, setGapLoading] = useState(false);
  const [gapError, setGapError] = useState("");

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState("");

  // ---- New UI-only state (theme, sidebar profile, navbar role selector) ----
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhone, setProfilePhone] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [roleSelectorOpen, setRoleSelectorOpen] = useState(false);

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

    const fetchJobs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/jobs`);
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        // Silently ignore
      }
    };

    fetchProfile();
    fetchJobs();
  }, [router]);

  useEffect(() => {
    if (!roleQuery.trim()) {
      setRoleSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/jobs/search?q=${encodeURIComponent(roleQuery.trim())}`);
        const data = await res.json();
        setRoleSuggestions(Array.isArray(data) ? data : []);
      } catch (err) {
        setRoleSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [roleQuery]);

  useEffect(() => {
    if (user?.email) setProfileEmail(user.email);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const handleFileSelect = (file: File | null) => {
    setUploadMessage(null);
    setMatchedSkills([]);
    if (file && file.type !== "application/pdf") {
      setUploadMessage({ type: "error", text: "Only PDF files are allowed." });
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setUploading(true);
    setUploadMessage(null);
    setMatchedSkills([]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`${apiUrl}/resumes/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setUploadMessage({
        type: "success",
        text: `"${data.resume.fileName}" uploaded successfully.`,
      });
      setMatchedSkills(data.skills || []);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleConnectGithub = async () => {
    if (!githubUsername.trim()) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setGithubLoading(true);
    setGithubMessage(null);
    setGithubSkills([]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/github/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ githubUsername: githubUsername.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not connect GitHub");
      }

      setGithubMessage({
        type: "success",
        text: `Analyzed ${data.reposAnalyzed} repositories for "${data.githubUsername}".`,
      });
      setGithubSkills(data.skills || []);
    } catch (err) {
      setGithubMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setGithubLoading(false);
    }
  };

  const handleSelectRole = async (job: Job) => {
    setRoleQuery(job.title);
    setShowSuggestions(false);

    if (job.id !== null) {
      setSelectedJobId(String(job.id));
      setSelectedJobTitle(job.title);
      setGapResult(null);
      setRoadmap(null);
      return;
    }

    setCreatingRole(true);
    setGapError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/jobs/find-or-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: job.title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not select role");

      setSelectedJobId(String(data.id));
      setSelectedJobTitle(data.title);
      setGapResult(null);
      setRoadmap(null);
    } catch (err) {
      setGapError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCreatingRole(false);
    }
  };

  const handleSubmitNewRole = async () => {
    const title = roleQuery.trim();
    if (!title) return;

    setCreatingRole(true);
    setGapError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/jobs/find-or-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not create role");
      }

      setSelectedJobId(String(data.id));
      setSelectedJobTitle(data.title);
      setRoleQuery(data.title);
      setShowSuggestions(false);
      setGapResult(null);
      setRoadmap(null);
    } catch (err) {
      setGapError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCreatingRole(false);
    }
  };

  const handleCheckGap = async () => {
    if (!selectedJobId) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setGapLoading(true);
    setGapError("");
    setGapResult(null);
    setRoadmap(null);
    setRoadmapError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/jobs/gap?jobId=${selectedJobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not check skill gap");
      }

      setGapResult(data);
    } catch (err) {
      setGapError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGapLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!selectedJobId) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setRoadmapLoading(true);
    setRoadmapError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/roadmap/generate?jobId=${selectedJobId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not generate roadmap");
      }

      setRoadmap(data);
    } catch (err) {
      setRoadmapError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setRoadmapLoading(false);
    }
  };

  // ---- Handlers for the new UI-only features ----

  const handleProfilePhotoChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const selectRoleFromNav = async (job: Job) => {
    await handleSelectRole(job);
    setRoleSelectorOpen(false);
  };

  const submitNewRoleFromNav = async () => {
    await handleSubmitNewRole();
    setRoleSelectorOpen(false);
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

  // ---------------------------------------------------------------------
  // Derived / display-only values.
  // These are computed purely from existing state for presentation —
  // no new API calls or stored data were introduced.
  // ---------------------------------------------------------------------

  const scoreColor =
    gapResult && gapResult.readinessScore >= 70
      ? "#15803d"
      : gapResult && gapResult.readinessScore >= 40
        ? "#b45309"
        : "#b91c1c";

  const readinessScore = gapResult?.readinessScore ?? null;

  const combinedSkillsMap = new Map<string, string>();
  const proficiencyRank: Record<string, number> = {
    Expert: 3,
    Intermediate: 2,
    Beginner: 1,
  };
  [...matchedSkills, ...githubSkills].forEach((item) => {
    const existing = combinedSkillsMap.get(item.skill);
    if (!existing || (proficiencyRank[item.proficiency] ?? 0) > (proficiencyRank[existing] ?? 0)) {
      combinedSkillsMap.set(item.skill, item.proficiency);
    }
  });
  const combinedSkills = Array.from(combinedSkillsMap.entries()).map(([skill, proficiency]) => ({
    skill,
    proficiency,
  }));
  const totalSkillsDetected = combinedSkills.length;

  const orbitSkills = (
    combinedSkills.length > 0
      ? combinedSkills
      : [
          { skill: "React", proficiency: "Expert" },
          { skill: "Node.js", proficiency: "Intermediate" },
          { skill: "SQL", proficiency: "Intermediate" },
          { skill: "Docker", proficiency: "Beginner" },
          { skill: "Git", proficiency: "Expert" },
        ]
  ).slice(0, 6);

  const roadmapSteps = roadmap?.steps ?? [];
  const roadmapCompleted = roadmapSteps.filter((s) => s.status === "completed").length;
  const roadmapTotal = roadmapSteps.length;
  const roadmapPercent = roadmapTotal > 0 ? Math.round((roadmapCompleted / roadmapTotal) * 100) : null;

  const topMissingSkills = gapResult?.missingSkills.slice(0, 3) ?? [];

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();
  const displayName = user?.email ? user.email.split("@")[0] : "there";
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "U";

  const achievements = [
    { label: "Resume Ready", unlocked: matchedSkills.length > 0, icon: FileText, color: "#6d63ff" },
    { label: "GitHub Connected", unlocked: githubSkills.length > 0, icon: Code2, color: "#14213d" },
    { label: "First Skill Analysis", unlocked: totalSkillsDetected > 0, icon: Brain, color: "#f472b6" },
    { label: "Roadmap Started", unlocked: roadmap !== null, icon: MapIcon, color: "#46c2a5" },
    {
      label: "90% Job Ready",
      unlocked: readinessScore !== null && readinessScore >= 90,
      icon: Trophy,
      color: "#f5b942",
    },
  ];

  const statCards = [
    {
      label: "Skills",
      value: String(totalSkillsDetected),
      sub: "Skills detected",
      icon: Brain,
      from: "#6d63ff",
      to: "#a78bfa",
    },
    {
      label: "Skill Gap",
      value: gapResult ? String(gapResult.missingSkills.length) : "—",
      sub: gapResult ? "Skills missing" : "Run a gap check",
      icon: Target,
      from: "#f472b6",
      to: "#fb7185",
    },
    {
      label: "Roadmap",
      value: roadmapPercent !== null ? `${roadmapPercent}%` : "—",
      sub: roadmapTotal > 0 ? `${roadmapCompleted} / ${roadmapTotal} steps` : "Not generated yet",
      icon: MapIcon,
      from: "#46c2a5",
      to: "#34d399",
    },
    {
      label: "Interview",
      value: "—",
      sub: "Take your first mock interview",
      icon: Mic,
      from: "#f5b942",
      to: "#fb923c",
    },
  ];

  const sidebarLinks: { label: string; icon: typeof Home; action?: () => void }[] = [
    { label: "Dashboard", icon: Home },
    { label: "My Skills", icon: Brain },
    { label: "Job Targets", icon: Target },
    { label: "Learning Roadmap", icon: MapIcon },
    { label: "Mock Interview", icon: Mic, action: () => router.push("/interview") },
    { label: "Projects", icon: Rocket },
    { label: "My Progress", icon: BarChart3 },
  ];

  const isDark = theme === "dark";

  const t = {
    pageGradient: isDark
      ? "radial-gradient(circle at 12% -10%, rgba(109,99,255,0.35), transparent 45%), radial-gradient(circle at 90% 10%, rgba(70,194,165,0.22), transparent 40%), radial-gradient(circle at 50% 110%, rgba(244,114,182,0.18), transparent 45%), #0b1020"
      : "radial-gradient(circle at 12% -10%, rgba(109,99,255,0.16), transparent 45%), radial-gradient(circle at 90% 10%, rgba(70,194,165,0.18), transparent 40%), radial-gradient(circle at 50% 110%, rgba(244,114,182,0.14), transparent 45%), #f4f7fb",
    card: isDark ? "bg-[#141a2e] border border-white/10" : "bg-white border border-[#eef1f7]",
    text: isDark ? "text-[#f1f5f9]" : "text-[#14213d]",
    textSecondary: isDark ? "text-[#a8b3c7]" : "text-[#64748b]",
    textMuted: isDark ? "text-[#64748b]" : "text-[#94a3b8]",
    nav: isDark ? "bg-[#0f1424]/95 border-b border-white/10" : "bg-white border-b border-[#e4e9f2]",
    sidebar: isDark ? "bg-[#0f1424] border-r border-white/10" : "bg-white border-r border-[#e4e9f2]",
    input: isDark
      ? "border-white/10 bg-[#0f1424] text-white placeholder:text-[#64748b] focus:border-[#8b7fff]"
      : "border-[#dce3ee] bg-[#fbfcfe] text-[#14213d] focus:border-[#6d63ff]",
    popover: isDark ? "bg-[#141a2e] border border-white/10" : "bg-white border border-[#dce3ee]",
    innerCard: isDark ? "border-white/10 bg-white/[0.03]" : "border-[#dce3ee] bg-[#fbfcfe]",
  };

  return (
    <main className={`min-h-screen font-sans ${t.text}`} style={{ background: t.pageGradient }}>
      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
        @keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
      `}</style>

      <div className="lg:flex">
        {/* ================= SIDEBAR ================= */}
        <aside
          className={`hidden w-72 shrink-0 flex-col px-5 py-7 lg:flex lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${t.sidebar}`}
        >
          <div className="mb-8 flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#46c2a5] text-[#14213d] shadow-[0_10px_24px_rgba(70,194,165,0.28)]">
              <Sparkles className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-base font-bold leading-tight tracking-[-0.03em]">SkillForge</p>
              <p className={`text-[11px] font-medium ${t.textMuted}`}>AI Career Readiness</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {sidebarLinks.map((link, i) => {
              const Icon = link.icon;
              const active = i === 0;
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={link.action}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                    active
                      ? "bg-gradient-to-r from-[#6d63ff]/15 to-[#46c2a5]/15 text-[#6d63ff]"
                      : link.action
                        ? `${t.textSecondary} hover:bg-black/5`
                        : `cursor-default ${t.textMuted}`
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
                  {link.label}
                </button>
              );
            })}

            <div className={`mt-6 border-t pt-4 ${isDark ? "border-white/10" : "border-[#eef1f7]"}`}>
              {/* Expandable profile section */}
              <button
                type="button"
                onClick={() => setProfileExpanded((v) => !v)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${t.textSecondary} hover:bg-black/5`}
              >
                <span className="flex items-center gap-3">
                  <User className="h-[18px] w-[18px]" strokeWidth={2.25} />
                  Profile
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${profileExpanded ? "rotate-180" : ""}`}
                  strokeWidth={2.5}
                />
              </button>

              {profileExpanded && (
                <div className={`mt-2 space-y-3 rounded-xl border p-4 ${t.innerCard}`}>
                  <div className="relative mx-auto h-16 w-16">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#6d63ff] to-[#46c2a5] text-base font-bold text-white">
                      {profilePhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <label
                      htmlFor="profile-photo"
                      className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#6d63ff] text-white shadow ring-2 ring-white"
                    >
                      <Camera className="h-3 w-3" strokeWidth={2.5} />
                      <input
                        id="profile-photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleProfilePhotoChange(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>

                  <div>
                    <label className={`mb-1 flex items-center gap-1.5 text-[11px] font-semibold ${t.textMuted}`}>
                      <Mail className="h-3 w-3" /> Email
                    </label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className={`h-9 w-full rounded-lg border px-2.5 text-xs outline-none ${t.input}`}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className={`mb-1 flex items-center gap-1.5 text-[11px] font-semibold ${t.textMuted}`}>
                      <Phone className="h-3 w-3" /> Phone number
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className={`h-9 w-full rounded-lg border px-2.5 text-xs outline-none ${t.input}`}
                      placeholder="+880 1XXXXXXXXX"
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                className={`mt-1 flex w-full cursor-default items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${t.textMuted}`}
              >
                <Settings className="h-[18px] w-[18px]" strokeWidth={2.25} />
                Settings
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-[#fff5f5] hover:text-[#ba4d58] ${t.textSecondary}`}
              >
                <LogOut className="h-[18px] w-[18px]" strokeWidth={2.25} />
                Log out
              </button>
            </div>
          </nav>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#6d63ff] to-[#46c2a5] p-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80">Job Readiness</p>
            <p className="mt-1 text-2xl font-bold tracking-[-0.03em]">
              {readinessScore !== null ? `${readinessScore}%` : "—"}
            </p>
            <p className="mt-1 text-[11px] font-medium text-white/80">
              {readinessScore !== null
                ? "Based on your last gap check"
                : "Run a skill gap check to see your score"}
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* ================= TOP NAVBAR ================= */}
          <header className={`flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 ${t.nav}`}>
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#46c2a5] text-[#14213d]">
                <Sparkles className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold tracking-[-0.03em]">SkillForge</span>
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-[-0.03em] sm:text-xl">
                {greeting}, {displayName} 👋
              </h1>
              <p className={`text-sm ${t.textSecondary}`}>Let&apos;s get you career-ready.</p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                  isDark
                    ? "border-white/10 bg-[#141a2e] text-[#f5b942] hover:bg-white/5"
                    : "border-[#dce3ee] bg-white text-[#6d63ff] hover:bg-[#f8fafc]"
                }`}
              >
                {isDark ? <Sun className="h-[18px] w-[18px]" strokeWidth={2.25} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={2.25} />}
              </button>

              <button
                type="button"
                className={`flex h-10 w-10 shrink-0 cursor-default items-center justify-center rounded-xl border ${
                  isDark ? "border-white/10 bg-[#141a2e] text-[#a8b3c7]" : "border-[#dce3ee] bg-white text-[#64748b]"
                }`}
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={2.25} />
              </button>

              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#6d63ff] to-[#46c2a5] text-xs font-bold text-white">
                  {profilePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <span className="hidden text-sm font-medium md:inline">{user?.email}</span>
              </div>

              <button
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  isDark ? "border-white/10 bg-[#141a2e] hover:bg-white/5" : "border-[#dce3ee] bg-white hover:bg-[#f8fafc]"
                }`}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" strokeWidth={2.5} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-8">
            {/* ================= 01. HERO (colorful) ================= */}
            <section
              className="grid grid-cols-1 gap-6 rounded-[24px] p-8 text-white shadow-[0_20px_50px_rgba(109,99,255,0.25)] sm:p-10 lg:grid-cols-[1.1fr_0.9fr]"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, #241a52 0%, #1a1440 45%, #0f2a3d 100%)"
                  : "linear-gradient(135deg, #6d63ff 0%, #8b7fff 45%, #46c2a5 100%)",
              }}
            >
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Your Career Readiness</h2>
                <p className="mt-2 text-sm text-white/85">
                  You&apos;re making great progress toward your target role.
                </p>

                {/* Target Role — now clickable, opens the role search/select dropdown */}
                <div className="relative mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setRoleSelectorOpen((v) => !v);
                      setShowSuggestions(true);
                    }}
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-left backdrop-blur-sm transition hover:bg-white/15"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/70">Target Role</p>
                        <p className="mt-1 text-base font-semibold">{selectedJobTitle || "Not set yet"}</p>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-white/70 transition-transform ${roleSelectorOpen ? "rotate-180" : ""}`}
                        strokeWidth={2.5}
                      />
                    </div>
                  </button>

                  {roleSelectorOpen && (
                    <div className={`absolute left-0 right-0 z-20 mt-2 rounded-xl p-3 shadow-[0_16px_36px_rgba(20,33,61,0.25)] ${t.popover}`}>
                       <input
                        autoFocus
                        className={`h-10 w-full rounded-lg border px-3 text-sm outline-none ${t.input}`}
                        placeholder="Search a role, e.g. Product Manager"
                        value={roleQuery}
                        onChange={(e) => {
                          setRoleQuery(e.target.value);
                          setShowSuggestions(true);
                          if (e.target.value !== selectedJobTitle) setSelectedJobId("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitNewRoleFromNav();
                        }}
                        onBlur={() => setTimeout(() => setRoleSelectorOpen(false), 150)}
                      />
                      <div className="mt-2 max-h-56 overflow-y-auto">
                        {creatingRole ? (
                          <div className={`flex items-center gap-2 px-2 py-2 text-sm ${t.textMuted}`}>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Setting up this role...
                          </div>
                        ) : roleQuery.trim() && roleSuggestions.length > 0 ? (
                          roleSuggestions.map((job) => (
                            <button
                              key={job.id ?? job.title}
                              type="button"
                              onClick={() => selectRoleFromNav(job)}
                              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition ${
                                isDark ? "text-[#e2e8f0] hover:bg-white/5" : "text-[#334155] hover:bg-[#f5f4ff]"
                              }`}
                            >
                              <span>{job.title}</span>
                              {job.isNew && <span className={`text-xs font-medium ${t.textMuted}`}>Suggested</span>}
                            </button>
                          ))
                        ) : roleQuery.trim() ? (
                          <div className={`flex items-center gap-2 px-2.5 py-2 text-sm ${t.textMuted}`}>
                            <Search className="h-3.5 w-3.5 animate-pulse text-[#6d63ff]" strokeWidth={2.5} />
                            Searching...
                          </div>
                        ) : (
                          <p className={`px-2.5 py-2 text-xs ${t.textMuted}`}>Start typing to find a role.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-2">
                  {[
                    { label: "Resume analyzed", done: matchedSkills.length > 0 },
                    { label: "GitHub analyzed", done: githubSkills.length > 0 },
                    { label: "Skills evaluated", done: gapResult !== null },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2
                        className={`h-4 w-4 ${item.done ? "text-white" : "text-white/40"}`}
                        strokeWidth={2.5}
                      />
                      <span className={item.done ? "text-white" : "text-white/60"}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center justify-center py-6">
                <div
                  className="absolute h-64 w-64 rounded-full opacity-70 blur-2xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.5), rgba(244,114,182,0.4) 55%, transparent 75%)",
                    animation: "pulse-glow 4s ease-in-out infinite",
                  }}
                />
                <div
                  className="absolute h-56 w-56 rounded-full opacity-60 blur-md"
                  style={{
                    background: "conic-gradient(from 0deg, #ffffff, transparent 30%, #f5b942, transparent 60%, #ffffff)",
                    animation: "spin-slow 10s linear infinite",
                  }}
                />
                <div className="relative flex h-52 w-52 animate-[spin-slow_18s_linear_infinite] items-center justify-center rounded-full border border-dashed border-white/40">
                  {orbitSkills.map((item, i) => {
                    const angle = (360 / orbitSkills.length) * i;
                    const color = proficiencyColor(item.proficiency);
                    return (
                      <span
                        key={item.skill}
                        className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold shadow-[0_6px_16px_rgba(20,33,61,0.25)]"
                        style={{
                          top: "50%",
                          left: "50%",
                          color,
                          transform: `rotate(${angle}deg) translate(104px) rotate(-${angle}deg) translate(-50%, -50%)`,
                        }}
                      >
                        {item.skill}
                      </span>
                    );
                  })}
                </div>
                <div className="absolute flex h-36 w-36 flex-col items-center justify-center rounded-full bg-[#14213d] text-white shadow-[0_16px_40px_rgba(20,33,61,0.45)]">
                  <span className="text-3xl font-bold tracking-[-0.03em]">
                    {readinessScore !== null ? `${readinessScore}%` : "—"}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/70">Job Ready</span>
                </div>
              </div>
            </section>

            {/* ================= 02. QUICK STATISTICS (colorful) ================= */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className={`rounded-2xl p-5 shadow-[0_12px_30px_rgba(30,52,92,0.10)] ${t.card}`}>
                    <div
                      className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-white"
                      style={{ background: `linear-gradient(135deg, ${card.from}, ${card.to})` }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.1em] ${t.textMuted}`}>{card.label}</p>
                    <p className="mt-1 text-3xl font-bold tracking-[-0.03em]" style={{ color: card.from }}>
                      {card.value}
                    </p>
                    <p className={`text-xs font-medium ${t.textSecondary}`}>{card.sub}</p>
                  </div>
                );
              })}
            </section>

            {/* ================= 03. RESUME + GITHUB (moved up) ================= */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className={`rounded-[24px] p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10 ${t.card}`}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6d63ff]/15 text-[#6d63ff]">
                    <FileText className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${t.textMuted}`}>Step 1</p>
                </div>
                <h2 className="mb-1 text-xl font-semibold tracking-[-0.03em]">Upload your resume</h2>
                <p className={`mb-6 text-sm ${t.textSecondary}`}>
                  We&apos;ll analyze your resume to detect your current skills. PDF only.
                </p>

                <label
                  className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition hover:border-[#6d63ff] ${
                    isDark ? "border-white/15 bg-white/[0.02] hover:bg-[#6d63ff]/5" : "border-[#dce3ee] bg-[#fbfcfe] hover:bg-[#f5f4ff]"
                  }`}
                  htmlFor="resume-file"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6d63ff]/15 text-[#6d63ff]">
                    <Upload className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Click to select a PDF</p>
                    <p className={`mt-1 text-xs ${t.textMuted}`}>or drag and drop it here</p>
                  </div>
                  <input
                    accept="application/pdf"
                    className="hidden"
                    id="resume-file"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                    ref={fileInputRef}
                    type="file"
                  />
                </label>

                {selectedFile && (
                  <div className={`mt-4 flex items-center justify-between rounded-xl border px-4 py-3 ${t.innerCard}`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-4 w-4 shrink-0 text-[#6d63ff]" />
                      <span className="truncate text-sm font-medium">{selectedFile.name}</span>
                    </div>
                    <span className={`shrink-0 text-xs ${t.textMuted}`}>
                      {(selectedFile.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                )}

                <button
                  className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6d63ff] to-[#8b7fff] text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(109,99,255,0.3)] transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[#6d63ff]/25 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12"
                  disabled={!selectedFile || uploading}
                  onClick={handleUpload}
                >
                  {uploading ? (
                    <>
                      <Upload className="h-4 w-4 animate-bounce" strokeWidth={2.5} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                      Upload resume
                    </>
                  )}
                </button>

                {uploadMessage && (
                  <div
                    className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                      uploadMessage.type === "success"
                        ? "border-[#bce8da] bg-[#effbf7] text-[#13795f]"
                        : "border-[#f2c9cd] bg-[#fff5f5] text-[#ba4d58]"
                    }`}
                  >
                    {uploadMessage.text}
                  </div>
                )}

                {matchedSkills.length > 0 && (
                  <div className={`mt-5 rounded-xl border p-5 ${t.innerCard}`}>
                    <div className="mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#6d63ff]" strokeWidth={2.5} />
                      <p className="text-sm font-semibold">Detected skills ({matchedSkills.length})</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matchedSkills.map((item) => (
                        <span
                          className="flex items-center gap-1.5 rounded-full bg-[#6d63ff]/10 px-3 py-1.5 text-xs font-semibold text-[#6d63ff]"
                          key={item.skill}
                        >
                          {item.skill}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              item.proficiency === "Expert"
                                ? "bg-[#dcfce7] text-[#15803d]"
                                : item.proficiency === "Intermediate"
                                  ? "bg-[#fef3c7] text-[#b45309]"
                                  : item.proficiency === "Beginner"
                                    ? "bg-[#e0e7ff] text-[#4338ca]"
                                    : "bg-[#f1f5f9] text-[#64748b]"
                            }`}
                          >
                            {item.proficiency}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={`rounded-[24px] p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10 ${t.card}`}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#46c2a5]/15 text-[#13795f]">
                    <Code2 className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${t.textMuted}`}>Optional</p>
                </div>
                <h2 className="mb-1 text-xl font-semibold tracking-[-0.03em]">Connect your GitHub</h2>
                <p className={`mb-6 text-sm ${t.textSecondary}`}>
                  We&apos;ll scan your public repositories to detect more skills.
                </p>

                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Code2 className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94a3b8]" />
                    <input
                      className={`h-11 w-full rounded-xl border pl-11 pr-4 text-[15px] outline-none transition focus:ring-4 focus:ring-[#6d63ff]/10 sm:h-12 ${t.input}`}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="your-github-username"
                      type="text"
                      value={githubUsername}
                    />
                  </div>

                  <button
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#14213d] to-[#1e2c52] px-6 text-[15px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12"
                    disabled={!githubUsername.trim() || githubLoading}
                    onClick={handleConnectGithub}
                  >
                    {githubLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Code2 className="h-4 w-4" strokeWidth={2.5} />
                        Connect
                      </>
                    )}
                  </button>
                </div>

                {githubMessage && (
                  <div
                    className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                      githubMessage.type === "success"
                        ? "border-[#bce8da] bg-[#effbf7] text-[#13795f]"
                        : "border-[#f2c9cd] bg-[#fff5f5] text-[#ba4d58]"
                    }`}
                  >
                    {githubMessage.text}
                  </div>
                )}

                {githubSkills.length > 0 && (
                  <div className={`mt-5 rounded-xl border p-5 ${t.innerCard}`}>
                    <div className="mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#46c2a5]" strokeWidth={2.5} />
                      <p className="text-sm font-semibold">Skills from GitHub ({githubSkills.length})</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {githubSkills.map((item) => (
                        <span
                          className="flex items-center gap-1.5 rounded-full bg-[#46c2a5]/10 px-3 py-1.5 text-xs font-semibold text-[#13795f]"
                          key={item.skill}
                        >
                          {item.skill}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              item.proficiency === "Expert"
                                ? "bg-[#dcfce7] text-[#15803d]"
                                : item.proficiency === "Intermediate"
                                  ? "bg-[#fef3c7] text-[#b45309]"
                                  : "bg-[#e0e7ff] text-[#4338ca]"
                            }`}
                          >
                            {item.proficiency}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ================= 04. ACHIEVEMENTS (3D, right after GitHub) ================= */}
            <section className={`rounded-[24px] p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10 ${t.card}`}>
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                <Trophy className="h-5 w-5 text-[#f5b942]" strokeWidth={2.5} />
                Achievements
              </h2>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5" style={{ perspective: "900px" }}>
                {achievements.map((item) => {
                  const Icon = item.icon;
                  const lighten = item.unlocked ? `${item.color}cc` : "#e2e8f0";
                  const base = item.unlocked ? item.color : "#cbd5e1";
                  return (
                    <div
                      key={item.label}
                      className="group flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-transform duration-300 [transform-style:preserve-3d] hover:-translate-y-1 hover:[transform:rotateX(8deg)_rotateY(-8deg)]"
                      style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                    >
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${lighten}, ${base} 65%, ${base}99 100%)`,
                          boxShadow: item.unlocked
                            ? `0 10px 20px ${base}55, inset 0 2px 3px rgba(255,255,255,0.6), inset 0 -6px 10px rgba(0,0,0,0.18)`
                            : "0 6px 14px rgba(0,0,0,0.10), inset 0 2px 3px rgba(255,255,255,0.5)",
                        }}
                      >
                        {item.unlocked ? (
                          <Icon className="h-6 w-6 text-white drop-shadow" strokeWidth={2.5} />
                        ) : (
                          <Lock className="h-5 w-5 text-white/80" strokeWidth={2.5} />
                        )}
                      </div>
                      <p className={`text-xs font-semibold ${item.unlocked ? "" : t.textMuted}`}>{item.label}</p>
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.08em]"
                        style={{ color: item.unlocked ? item.color : undefined }}
                      >
                        {item.unlocked ? "Completed" : "Locked"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ================= 05. SKILL INTELLIGENCE (colorful + icons + rings) ================= */}
            <section className={`rounded-[24px] p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10 ${t.card}`}>
              <h2 className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">🧠 Your Skill Intelligence</h2>
              <p className={`mt-1 text-sm ${t.textSecondary}`}>
                Understand your current strengths and the skills you need to improve.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div>
                  <p className={`mb-3 text-sm font-semibold ${t.textSecondary}`}>Your Skills</p>
                  {combinedSkills.length === 0 ? (
                    <p className={`text-sm ${t.textMuted}`}>
                      Upload your resume or connect GitHub to map your skills here.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {combinedSkills.map((item) => {
                        const Icon = getSkillIcon(item.skill);
                        const color = proficiencyColor(item.proficiency);
                        return (
                          <div
                            key={item.skill}
                            className="flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition hover:-translate-y-0.5"
                            style={{
                              background: `linear-gradient(160deg, ${color}22, ${color}08)`,
                              border: `1px solid ${color}33`,
                            }}
                          >
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-xl"
                              style={{ background: `${color}22`, color }}
                            >
                              <Icon className="h-5 w-5" strokeWidth={2.25} />
                            </div>
                            <span className="text-xs font-semibold">{item.skill}</span>
                            <span className="text-[10px] font-bold" style={{ color }}>
                              {item.proficiency}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <p className={`mb-3 text-sm font-semibold ${t.textSecondary}`}>Skill Proficiency</p>
                  {combinedSkills.length === 0 ? (
                    <p className={`text-sm ${t.textMuted}`}>No skills detected yet.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                      {combinedSkills.map((item) => (
                        <ProficiencyRing key={item.skill} skill={item.skill} proficiency={item.proficiency} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ================= 06. SKILL GAP ANALYSIS ================= */}
            <section className={`rounded-[24px] p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10 ${t.card}`}>
              <h2 className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                🎯 What&apos;s Between You &amp; Your Target?
              </h2>
              <p className={`mt-1 text-sm ${t.textSecondary}`}>
                Compare your current skills with the requirements of your target role.
              </p>

                            <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <div className={`flex h-11 flex-1 items-center rounded-xl border px-4 text-[15px] sm:h-12 ${t.innerCard}`}>
                  <Target className="mr-2 h-4 w-4 shrink-0 text-[#6d63ff]" strokeWidth={2.5} />
                  {selectedJobTitle ? (
                    <span className="font-medium">{selectedJobTitle}</span>
                  ) : (
                    <span className={t.textMuted}>
                      Set your target role above, in the &quot;Target Role&quot; card
                    </span>
                  )}
                </div>

                <button
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#14213d] to-[#1e2c52] px-6 text-[15px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12"
                  disabled={!selectedJobId || gapLoading}
                  onClick={handleCheckGap}
                >
                  {gapLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" strokeWidth={2.5} />
                      Check readiness
                    </>
                  )}
                </button>
              </div>

              {gapError && (
                <div className="mt-4 rounded-xl border border-[#f2c9cd] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#ba4d58]">
                  {gapError}
                </div>
              )}

              {gapResult && (
                <div className="mt-6 space-y-6">
                  <div className={`flex items-center gap-4 rounded-xl border p-5 ${t.innerCard}`}>
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold"
                      style={{ backgroundColor: `${scoreColor}15`, color: scoreColor }}
                    >
                      {gapResult.readinessScore}%
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Job readiness score</p>
                      <p className={`text-xs ${t.textMuted}`}>
                        {gapResult.matchedSkills.length} of {gapResult.requiredSkills.length} required
                        skills matched
                      </p>
                    </div>
                  </div>

                  <div className={`overflow-hidden rounded-xl border ${isDark ? "border-white/10" : "border-[#dce3ee]"}`}>
                    <table className="w-full text-left text-sm">
                      <thead className={`text-xs font-semibold uppercase tracking-[0.06em] ${t.textMuted} ${isDark ? "bg-white/[0.03]" : "bg-[#fbfcfe]"}`}>
                        <tr>
                          <th className="px-4 py-3">Required Skill</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className={isDark ? "divide-y divide-white/10" : "divide-y divide-[#eef1f7]"}>
                        {gapResult.requiredSkills.map((skill) => {
                          const matched = gapResult.matchedSkills.includes(skill);
                          return (
                            <tr key={skill}>
                              <td className="px-4 py-3 font-medium">{skill}</td>
                              <td className="px-4 py-3">
                                {matched ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#effbf7] px-2.5 py-1 text-xs font-semibold text-[#13795f]">
                                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    Matched
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fff5f5] px-2.5 py-1 text-xs font-semibold text-[#ba4d58]">
                                    Missing
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {gapResult.missingSkills.length > 0 ? (
                    <div>
                      <p className="mb-3 text-sm font-semibold">Skills to work on</p>
                      <div className="flex flex-wrap gap-2">
                        {gapResult.missingSkills.map((skill) => (
                          <span
                            className="rounded-full bg-[#fff5f5] px-3 py-1.5 text-xs font-semibold text-[#ba4d58]"
                            key={skill}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <button
                        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#46c2a5] to-[#34d399] text-[15px] font-semibold text-[#14213d] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12"
                        disabled={roadmapLoading}
                        onClick={handleGenerateRoadmap}
                      >
                        {roadmapLoading ? (
                          <>
                            <MapIcon className="h-4 w-4 animate-pulse" strokeWidth={2.5} />
                            Generating...
                          </>
                        ) : (
                          <>
                            <MapIcon className="h-4 w-4" strokeWidth={2.5} />
                            Generate learning roadmap
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#bce8da] bg-[#effbf7] px-4 py-3 text-sm font-medium text-[#13795f]">
                      You already match every required skill for this role.
                    </div>
                  )}
                </div>
              )}

              {roadmapError && (
                <div className="mt-4 rounded-xl border border-[#f2c9cd] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#ba4d58]">
                  {roadmapError}
                </div>
              )}
            </section>

            {/* ================= 07. AI CAREER INSIGHT ================= */}
            <section className="rounded-[24px] bg-[#14213d] p-8 text-white shadow-[0_12px_40px_rgba(20,33,61,0.25)] sm:p-10">
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                <Sparkles className="h-5 w-5 text-[#46c2a5]" strokeWidth={2.5} />
                SkillForge AI Insight
              </h2>

              {gapResult ? (
                <>
                  <p className="mt-4 max-w-2xl text-sm text-[#cbd5e1]">
                    {gapResult.matchedSkills.length > 0
                      ? `Your ${gapResult.matchedSkills.slice(0, 2).join(" and ")} foundation is solid. `
                      : ""}
                    {topMissingSkills.length > 0
                      ? `Your biggest gaps for the ${selectedJobTitle || "target"} role are ${topMissingSkills.join(", ")}.`
                      : "You already cover every required skill for this role — nice work."}
                  </p>
                  {topMissingSkills.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#b9c5dc]">
                      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8fa0c2]">
                        Recommended Focus
                      </span>
                      {topMissingSkills.map((skill, i) => (
                        <span key={skill} className="flex items-center gap-2">
                          {i > 0 && <ArrowRight className="h-3.5 w-3.5" />}
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-4 max-w-2xl text-sm text-[#cbd5e1]">
                  Run a skill gap check above to get a personalized breakdown of your strengths and the
                  skills to focus on next.
                </p>
              )}
            </section>

            {/* ================= 08. YOUR NEXT MOVE ================= */}
            <section className={`rounded-[24px] p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10 ${t.card}`}>
              <h2 className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">🚀 Your Next Move</h2>
              <p className={`mt-1 text-sm ${t.textSecondary}`}>
                Don&apos;t know what to learn next? We&apos;ve already figured it out.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className={`rounded-2xl border p-5 ${t.innerCard}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6d63ff]">01 — Learn</p>
                  <p className="mt-2 text-base font-semibold">
                    {topMissingSkills[0] ?? "Complete your skill gap check"}
                  </p>
                  <p className={`mt-1 text-xs ${t.textMuted}`}>
                    {topMissingSkills[0] ? "Beginner → Intermediate" : "Then we'll suggest a topic here"}
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateRoadmap}
                    disabled={!selectedJobId || roadmapLoading}
                    className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#6d63ff] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue learning <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className={`rounded-2xl border p-5 ${t.innerCard}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#f472b6]">02 — Practice</p>
                  <p className="mt-2 text-base font-semibold">REST API Practice</p>
                  <p className={`mt-1 text-xs ${t.textMuted}`}>
                    Build a small backend project using Node.js and Express.
                  </p>
                  <span className={`mt-4 flex items-center gap-1 text-sm font-semibold ${t.textMuted}`}>
                    Coming soon
                  </span>
                </div>

                <div className={`rounded-2xl border p-5 ${t.innerCard}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#f5b942]">03 — Interview</p>
                  <p className="mt-2 text-base font-semibold">Mock Interview</p>
                  <p className={`mt-1 text-xs ${t.textMuted}`}>Test your knowledge before the real interview.</p>
                  <button
                    type="button"
                    onClick={() => router.push("/interview")}
                    className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#6d63ff]"
                  >
                    Start interview <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* ================= 09. LEARNING ROADMAP PREVIEW ================= */}
            <section className={`rounded-[24px] p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10 ${t.card}`}>
              <h2 className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">🗺️ Your Learning Roadmap</h2>

              {roadmapSteps.length === 0 ? (
                <p className={`mt-4 text-sm ${t.textMuted}`}>
                  Generate a roadmap from your skill gap results above to see your step-by-step plan here.
                </p>
              ) : (
                <div className="mt-6 space-y-0">
                  {[...roadmapSteps]
                    .sort((a, b) => a.order - b.order)
                    .map((step, i, arr) => {
                      const done = step.status === "completed";
                      return (
                        <div key={step.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                done ? "bg-[#46c2a5] text-[#14213d]" : "border-2 border-[#6d63ff] bg-transparent text-[#6d63ff]"
                              }`}
                            >
                              {done ? <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
                            </span>
                            {i < arr.length - 1 && (
                              <span className={`w-px flex-1 ${isDark ? "bg-white/10" : "bg-[#dce3ee]"}`} />
                            )}
                          </div>
                          <div className="pb-6">
                            <p className="text-sm font-semibold">
                              {step.skillName}
                              {!done && <span className="ml-2 text-xs font-semibold text-[#6d63ff]">You&apos;re here</span>}
                            </p>
                            <a
                              href={step.resourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`mt-1 flex items-center gap-1 text-xs font-medium hover:text-[#6d63ff] ${t.textMuted}`}
                            >
                              {step.resourceTitle}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </section>

            {/* ================= 10. CAREER PROGRESS ================= */}
            <section className={`rounded-[24px] p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10 ${t.card}`}>
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                <TrendingUp className="h-5 w-5 text-[#46c2a5]" strokeWidth={2.5} />
                Your Progress
              </h2>
              <p className={`mt-1 text-sm ${t.textSecondary}`}>Job Readiness Over Time</p>

              {readinessScore === null ? (
                <p className={`mt-6 text-sm ${t.textMuted}`}>
                  Check your readiness score at least once to start tracking your progress here.
                </p>
              ) : (
                <div className="mt-6 flex items-end gap-3">
                  <div
                    className="flex w-16 flex-col items-center justify-end rounded-t-lg bg-gradient-to-t from-[#6d63ff] to-[#46c2a5]"
                    style={{ height: `${Math.max(readinessScore, 8)}px`, maxHeight: 140 }}
                  />
                  <p className={`pb-1 text-sm ${t.textSecondary}`}>
                    Your current score is <span className="font-semibold">{readinessScore}%</span>. Come back
                    after your next gap check to see your trend over time.
                  </p>
                </div>
              )}
            </section>

            {/* ================= 11. MOCK INTERVIEW ================= */}
            <section className={`rounded-[24px] p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10 ${t.card}`}>
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                <Mic className="h-5 w-5 text-[#6d63ff]" strokeWidth={2.5} />
                Mock Interview
              </h2>
              <p className={`mt-1 text-sm ${t.textSecondary}`}>
                Practice role-specific questions and get AI feedback before the real thing.
              </p>

              <button
                className="group mt-6 flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#14213d] to-[#1e2c52] p-6 text-left transition hover:brightness-110"
                onClick={() => router.push("/interview")}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#46c2a5]">
                    <Mic className="h-5 w-5 text-[#14213d]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">Practice a mock interview</p>
                    <p className="text-sm text-[#b9c5dc]">
                      Answer role-specific questions to prepare for the real thing
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#46c2a5] transition group-hover:translate-x-1">
                  Start →
                </span>
              </button>
            </section>

            {/* ================= 12. LEARNING STREAK ================= */}
            <section className={`flex flex-col items-start gap-4 rounded-[24px] p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:flex-row sm:items-center sm:p-10 ${t.card}`}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff5e6] text-[#f5b942]">
                <Flame className="h-7 w-7" strokeWidth={2.5} />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.1em] ${t.textMuted}`}>Learning Streak</p>
                <p className={`text-sm ${t.textSecondary}`}>
                  Streak tracking is on its way — keep coming back to build your habit.
                </p>
              </div>
            </section>

            {/* ================= CLOSING CTA ================= */}
            <section className="flex flex-col items-start gap-5 rounded-[24px] bg-gradient-to-br from-[#6d63ff] via-[#8b7fff] to-[#46c2a5] p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">Ready for your next step?</h2>
                <p className="mt-1 text-sm text-white/85">Your next improvement is just one action away.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleGenerateRoadmap}
                  disabled={!selectedJobId || roadmapLoading}
                  className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#14213d] transition hover:bg-[#f4f7fb] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MapIcon className="h-4 w-4" strokeWidth={2.5} />
                  Continue Roadmap
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/interview")}
                  className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  <Mic className="h-4 w-4" strokeWidth={2.5} />
                  Practice Interview
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}