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
  Map,
  ExternalLink,
    Code2,
} from "lucide-react";

type UserProfile = {
  userId: number;
  email: string;
};

type Job = {
  id: number;
  title: string;
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
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

    const [githubUsername, setGithubUsername] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubMessage, setGithubMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [githubSkills, setGithubSkills] = useState<string[]>([]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [gapResult, setGapResult] = useState<SkillGapResult | null>(null);
  const [gapLoading, setGapLoading] = useState(false);
  const [gapError, setGapError] = useState("");

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState("");

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

  const scoreColor =
    gapResult && gapResult.readinessScore >= 70
      ? "#15803d"
      : gapResult && gapResult.readinessScore >= 40
        ? "#b45309"
        : "#b91c1c";

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

        <div className="mb-6 rounded-[24px] bg-white p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
            Dashboard
          </p>
          <h1 className="mb-1 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
            Welcome back{user?.email ? `, ${user.email}` : ""}
          </h1>
          <p className="text-sm text-[#64748b]">
            Your account is authenticated. Upload your resume below to get
            started.
          </p>
        </div>

        <div className="mb-6 rounded-[24px] bg-white p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
            Step 1
          </p>
          <h2 className="mb-1 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
            Upload your resume
          </h2>
          <p className="mb-6 text-sm text-[#64748b]">
            We&apos;ll analyze your resume to detect your current skills.
            PDF only.
          </p>

          <label
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#dce3ee] bg-[#fbfcfe] px-6 py-10 text-center transition hover:border-[#6d63ff] hover:bg-[#f5f4ff]"
            htmlFor="resume-file"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef1f7] text-[#6d63ff]">
              <Upload className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#334155]">
                Click to select a PDF
              </p>
              <p className="mt-1 text-xs text-[#94a3b8]">
                or drag and drop it here
              </p>
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
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#dce3ee] bg-[#fbfcfe] px-4 py-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="h-4 w-4 shrink-0 text-[#6d63ff]" />
                <span className="truncate text-sm font-medium text-[#334155]">
                  {selectedFile.name}
                </span>
              </div>
              <span className="shrink-0 text-xs text-[#94a3b8]">
                {(selectedFile.size / 1024).toFixed(0)} KB
              </span>
            </div>
          )}

          <button
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#6d63ff] text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(109,99,255,0.24)] transition hover:bg-[#5d53eb] focus:outline-none focus:ring-4 focus:ring-[#6d63ff]/25 disabled:cursor-not-allowed disabled:bg-[#a9a4f7] disabled:shadow-none sm:h-12"
            disabled={!selectedFile || uploading}
            onClick={handleUpload}
          >
            {uploading ? (
              "Uploading..."
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
            <div className="mt-5 rounded-xl border border-[#dce3ee] bg-[#fbfcfe] p-5">
              <div className="mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#6d63ff]" strokeWidth={2.5} />
                <p className="text-sm font-semibold text-[#334155]">
                  Detected skills ({matchedSkills.length})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((skill) => (
                  <span
                    className="rounded-full bg-[#eef1f7] px-3 py-1.5 text-xs font-semibold text-[#6d63ff]"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

                  <div className="mb-6 rounded-[24px] bg-white p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
            Optional
          </p>
          <h2 className="mb-1 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
            Connect your GitHub
          </h2>
          <p className="mb-6 text-sm text-[#64748b]">
            We&apos;ll scan your public repositories to detect more skills.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Code2 className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94a3b8]" />
              <input
                className="h-11 w-full rounded-xl border border-[#dce3ee] bg-[#fbfcfe] pl-11 pr-4 text-[15px] text-[#14213d] outline-none transition placeholder:text-[#9aa8ba] focus:border-[#6d63ff] focus:bg-white focus:ring-4 focus:ring-[#6d63ff]/10 sm:h-12"
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="your-github-username"
                type="text"
                value={githubUsername}
              />
            </div>

            <button
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#14213d] px-6 text-[15px] font-semibold text-white transition hover:bg-[#1e2c52] disabled:cursor-not-allowed disabled:bg-[#a0a7b8] sm:h-12"
              disabled={!githubUsername.trim() || githubLoading}
              onClick={handleConnectGithub}
            >
              {githubLoading ? (
                "Analyzing..."
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
            <div className="mt-5 rounded-xl border border-[#dce3ee] bg-[#fbfcfe] p-5">
              <div className="mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#6d63ff]" strokeWidth={2.5} />
                <p className="text-sm font-semibold text-[#334155]">
                  Skills from GitHub ({githubSkills.length})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {githubSkills.map((skill) => (
                  <span
                    className="rounded-full bg-[#eef1f7] px-3 py-1.5 text-xs font-semibold text-[#6d63ff]"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 rounded-[24px] bg-white p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
            Step 2
          </p>
          <h2 className="mb-1 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
            Check your skill gap
          </h2>
          <p className="mb-6 text-sm text-[#64748b]">
            Pick a target role to see how ready you are and what&apos;s
            missing.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              className="h-11 flex-1 rounded-xl border border-[#dce3ee] bg-[#fbfcfe] px-4 text-[15px] text-[#14213d] outline-none transition focus:border-[#6d63ff] focus:bg-white focus:ring-4 focus:ring-[#6d63ff]/10 sm:h-12"
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                setGapResult(null);
                setRoadmap(null);
              }}
              value={selectedJobId}
            >
              <option value="">Select a target role</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>

            <button
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#14213d] px-6 text-[15px] font-semibold text-white transition hover:bg-[#1e2c52] disabled:cursor-not-allowed disabled:bg-[#a0a7b8] sm:h-12"
              disabled={!selectedJobId || gapLoading}
              onClick={handleCheckGap}
            >
              {gapLoading ? (
                "Checking..."
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
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-4 rounded-xl border border-[#dce3ee] bg-[#fbfcfe] p-5">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold"
                  style={{ backgroundColor: `${scoreColor}15`, color: scoreColor }}
                >
                  {gapResult.readinessScore}%
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#334155]">
                    Job readiness score
                  </p>
                  <p className="text-xs text-[#94a3b8]">
                    {gapResult.matchedSkills.length} of{" "}
                    {gapResult.requiredSkills.length} required skills matched
                  </p>
                </div>
              </div>

              {gapResult.missingSkills.length > 0 ? (
                <div>
                  <p className="mb-3 text-sm font-semibold text-[#334155]">
                    Skills to work on
                  </p>
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
                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#46c2a5] text-[15px] font-semibold text-[#14213d] transition hover:bg-[#3bab90] disabled:cursor-not-allowed disabled:bg-[#a9d9cd] sm:h-12"
                    disabled={roadmapLoading}
                    onClick={handleGenerateRoadmap}
                  >
                    {roadmapLoading ? (
                      "Generating..."
                    ) : (
                      <>
                        <Map className="h-4 w-4" strokeWidth={2.5} />
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
        </div>

        {roadmapError && (
          <div className="mb-6 rounded-xl border border-[#f2c9cd] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#ba4d58]">
            {roadmapError}
          </div>
        )}

        {roadmap && roadmap.steps.length > 0 && (
          <div className="rounded-[24px] bg-white p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
              Step 3
            </p>
            <h2 className="mb-1 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
              Your learning roadmap
            </h2>
            <p className="mb-6 text-sm text-[#64748b]">
              Follow these steps in order to close your skill gap.
            </p>

            <div className="space-y-3">
                               {roadmap.steps.map((step) => (
                <a
                  className="flex items-center gap-4 rounded-xl border border-[#dce3ee] bg-[#fbfcfe] p-4 transition hover:border-[#6d63ff] hover:bg-[#f5f4ff]"
                  href={step.resourceUrl}
                  key={step.id}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef1f7] text-xs font-bold text-[#6d63ff]">
                    {step.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#334155]">
                      {step.skillName}
                    </p>
                    <p className="truncate text-xs text-[#94a3b8]">
                      {step.resourceTitle}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-[#94a3b8]" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}