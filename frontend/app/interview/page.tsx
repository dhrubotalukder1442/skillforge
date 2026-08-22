"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, ArrowRight, CheckCircle2, MessageCircleQuestion, Loader2 } from "lucide-react";

type Job = {
  id: number;
  title: string;
};

type Question = {
  id: number;
  question: string;
};

function QuestionLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-7 py-10">
      <div
        className="relative h-20 w-20"
        style={{ perspective: "500px" }}
      >
        {/* Glow behind the cube */}
        <div
          className="absolute inset-0 rounded-full bg-[#6d63ff]/30 blur-2xl"
          style={{ animation: "pulseGlow 2.2s ease-in-out infinite" }}
        />

        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            animation: "spin3d 3s ease-in-out infinite",
          }}
        >
          <div className="absolute inset-0 rounded-xl border border-white/20 shadow-lg" style={{ background: "linear-gradient(135deg, #6d63ff, #5d53eb)", transform: "translateZ(40px)" }} />
          <div className="absolute inset-0 rounded-xl border border-white/20 shadow-lg" style={{ background: "linear-gradient(135deg, #5d53eb, #4a41d1)", transform: "rotateY(180deg) translateZ(40px)" }} />
          <div className="absolute inset-0 rounded-xl border border-white/20 shadow-lg" style={{ background: "linear-gradient(135deg, #46c2a5, #3bab90)", transform: "rotateY(90deg) translateZ(40px)" }} />
          <div className="absolute inset-0 rounded-xl border border-white/20 shadow-lg" style={{ background: "linear-gradient(135deg, #3bab90, #2f8f77)", transform: "rotateY(-90deg) translateZ(40px)" }} />
          <div className="absolute inset-0 rounded-xl border border-white/20 shadow-lg" style={{ background: "linear-gradient(135deg, #8b7fff, #6d63ff)", transform: "rotateX(90deg) translateZ(40px)" }} />
          <div className="absolute inset-0 rounded-xl border border-white/20 shadow-lg" style={{ background: "linear-gradient(135deg, #14213d, #1e2c52)", transform: "rotateX(-90deg) translateZ(40px)" }} />
        </div>
      </div>

      <div className="text-center">
        <p className="text-[15px] font-semibold text-[#14213d]">
          Crafting your interview questions
        </p>
        <p className="mt-1.5 text-xs text-[#94a3b8]">
          Tailoring them to your target role...
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#6d63ff]" style={{ animation: "dotBounce 1.4s ease-in-out infinite", animationDelay: "0s" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-[#6d63ff]" style={{ animation: "dotBounce 1.4s ease-in-out infinite", animationDelay: "0.2s" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-[#6d63ff]" style={{ animation: "dotBounce 1.4s ease-in-out infinite", animationDelay: "0.4s" }} />
      </div>

      <style jsx>{`
        @keyframes spin3d {
          0% {
            transform: rotateX(0deg) rotateY(0deg);
          }
          50% {
            transform: rotateX(180deg) rotateY(180deg);
          }
          100% {
            transform: rotateX(360deg) rotateY(360deg);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.9);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.15);
          }
        }
        @keyframes dotBounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default function InterviewPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [savedAnswers, setSavedAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gradingResult, setGradingResult] = useState<{ score: number | null; feedback: string | null } | null>(null);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchJobs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/jobs`);
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        // ignore
      }
    };

    fetchJobs();
  }, [router]);

  const handleStart = async () => {
    if (!selectedJobId) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/interview/questions?jobId=${selectedJobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not load questions");
      }

      setQuestions(data.questions);
      setCurrentIndex(0);
      setAnswer("");
      setSavedAnswers({});
      setStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = async () => {
    const token = localStorage.getItem("access_token");
    if (!token || !questions[currentIndex]) return;

    if (answer.trim()) {
      setSaving(true);
      setGradingResult(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/interview/answer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            interviewId: questions[currentIndex].id,
            answer: answer.trim(),
          }),
        });
        const data = await res.json();
        setSavedAnswers((prev) => ({ ...prev, [questions[currentIndex].id]: answer.trim() }));
        setGradingResult({ score: data.score ?? null, feedback: data.feedback ?? null });
      } catch (err) {
        // fail silently, allow moving on
      } finally {
        setSaving(false);
      }
    }
  };

  const handleNextQuestion = () => {
    setGradingResult(null);
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setAnswer(savedAnswers[questions[nextIndex].id] || "");
    }
  };

  const handlePrevious = () => {
    if (currentIndex === 0) return;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    setAnswer(savedAnswers[questions[prevIndex].id] || "");
  };

  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 font-sans text-[#14213d] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#334155] transition hover:bg-[#f8fafc]"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#46c2a5] text-[#14213d] shadow-[0_10px_24px_rgba(70,194,165,0.28)]">
            <Sparkles className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-[-0.03em]">
            Mock Interview
          </span>
        </div>

        {!started ? (
          <div className="rounded-[24px] bg-white p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef1f7] text-[#6d63ff]">
              <MessageCircleQuestion className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <h1 className="mb-1 text-2xl font-semibold tracking-[-0.04em]">
              Practice for a role
            </h1>
            <p className="mb-6 text-sm text-[#64748b]">
              Pick a target role and answer a set of practice interview
              questions.
            </p>

                        {loading ? (
              <QuestionLoader />
            ) : (
              <>
                <select
                  className="mb-4 h-11 w-full rounded-xl border border-[#dce3ee] bg-[#fbfcfe] px-4 text-[15px] text-[#14213d] outline-none transition focus:border-[#6d63ff] focus:bg-white focus:ring-4 focus:ring-[#6d63ff]/10 sm:h-12"
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  value={selectedJobId}
                >
                  <option value="">Select a target role</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>

                {error && (
                  <div className="mb-4 rounded-xl border border-[#f2c9cd] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#ba4d58]">
                    {error}
                  </div>
                )}
                <button
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#6d63ff] text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(109,99,255,0.24)] transition hover:bg-[#5d53eb] disabled:cursor-not-allowed disabled:bg-[#a9a4f7] sm:h-12"
                  disabled={!selectedJobId}
                  onClick={handleStart}
                >
                  Start practice interview
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="rounded-[24px] bg-white p-8 shadow-[0_12px_40px_rgba(30,52,92,0.08)] sm:p-10">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
              Question {currentIndex + 1} of {questions.length}
            </p>

            <h2 className="mb-6 text-xl font-semibold leading-snug tracking-[-0.02em]">
              {questions[currentIndex]?.question}
            </h2>

                        <textarea
              className="min-h-[160px] w-full rounded-xl border border-[#dce3ee] bg-[#fbfcfe] p-4 text-[15px] text-[#14213d] outline-none transition placeholder:text-[#9aa8ba] focus:border-[#6d63ff] focus:bg-white focus:ring-4 focus:ring-[#6d63ff]/10"
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              value={answer}
            />

            {gradingResult && (
              <div className="mt-4 rounded-xl border border-[#dce3ee] bg-[#fbfcfe] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#334155]">AI Feedback</span>
                  {gradingResult.score !== null && (
                    <span className="rounded-full bg-[#eef1f7] px-2.5 py-0.5 text-xs font-bold text-[#6d63ff]">
                      {gradingResult.score}/5
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#64748b]">
                  {gradingResult.feedback || "Feedback unavailable for this answer."}
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                className="flex h-11 items-center justify-center rounded-xl border border-[#dce3ee] bg-white px-5 text-sm font-semibold text-[#334155] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isFirstQuestion}
                onClick={handlePrevious}
              >
                Previous
              </button>

              {gradingResult ? (
                isLastQuestion ? (
                  <span className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#eef1f7] px-6 text-sm font-semibold text-[#6d63ff]">
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                    All done!
                  </span>
                ) : (
                  <button
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#14213d] px-6 text-sm font-semibold text-white transition hover:bg-[#1e2c52]"
                    onClick={handleNextQuestion}
                  >
                    Next question
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                )
              ) : (
                <button
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#46c2a5] px-6 text-sm font-semibold text-[#14213d] transition hover:bg-[#3bab90] disabled:cursor-not-allowed"
                  disabled={saving || !answer.trim()}
                  onClick={handleSaveAndNext}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                      Grading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                      Submit answer
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}