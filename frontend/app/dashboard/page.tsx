"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Sparkles, Upload, FileText, CheckCircle2 } from "lucide-react";

type UserProfile = {
  userId: number;
  email: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (file: File | null) => {
    setUploadMessage(null);
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

        <div className="rounded-[24px] bg-white p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10">
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
        </div>
      </div>
    </main>
  );
}