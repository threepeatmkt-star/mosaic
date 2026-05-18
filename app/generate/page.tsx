"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  insforge,
  type GenerationStyle,
  type Profile,
} from "@/lib/insforge";

type CurrentUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  avatar_url?: string | null;
};

type Position = "10" | "2" | "8" | "4";

type VideoMeta = {
  id: GenerationStyle;
  position: Position;
  title: string;
  subtitle: string;
};

const VIDEOS: VideoMeta[] = [
  { id: "baseball", position: "10", title: "야구 중계샷", subtitle: "스포츠 중계 스타일" },
  { id: "idol", position: "2", title: "아이돌 직캠", subtitle: "팬캠 무대 스타일" },
  { id: "showme", position: "8", title: "쇼미관객석", subtitle: "리액션 클로즈업" },
  { id: "street", position: "4", title: "스트릿패션", subtitle: "스트릿 인터뷰 컷" },
];

const BASE_ANGLES: Record<Position, { x: number; y: number }> = {
  "10": { x: 5, y: 10 },
  "2": { x: 5, y: -10 },
  "8": { x: -5, y: 10 },
  "4": { x: -5, y: -10 },
};

// Corner positions when generation starts (fixed within viewport)
const CORNER_CLASSES: Record<Position, string> = {
  "10": "top-6 left-6",
  "2": "top-6 right-6",
  "8": "bottom-6 left-6",
  "4": "bottom-6 right-6",
};

type Phase = "idle" | "generating" | "image_ready" | "error";

export default function GeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [selectedStyle, setSelectedStyle] = useState<GenerationStyle | null>(null);
  const [sourceImageDataUrl, setSourceImageDataUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (cancelled) return;
      if (error || !data?.user) {
        router.replace("/auth");
        return;
      }
      const u = data.user as CurrentUser;
      setUser(u);

      const { data: existing } = await insforge.database
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();

      if (existing) {
        if (!cancelled) setProfile(existing as Profile);
      } else {
        const { data: inserted } = await insforge.database
          .from("profiles")
          .insert([
            {
              id: u.id,
              email: u.email ?? null,
              full_name: u.name ?? null,
              avatar_url: u.avatar_url ?? null,
            },
          ])
          .select()
          .single();
        if (!cancelled && inserted) setProfile(inserted as Profile);
      }

      if (!cancelled) setLoading(false);
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSignOut() {
    await insforge.auth.signOut();
    router.replace("/");
  }

  async function handleAttach(style: GenerationStyle, file: File) {
    if (!user) return;

    // Local preview for the source image
    const localUrl = URL.createObjectURL(file);
    setSourceImageDataUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return localUrl;
    });
    setSelectedStyle(style);
    setGeneratedImageUrl(null);
    setErrorMessage(null);
    setPhase("generating");

    try {
      const resp = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style }),
      });
      const body = (await resp.json()) as
        | { url: string; key: string; prompt: string; style: string }
        | { error: string };

      if (!resp.ok || "error" in body) {
        throw new Error("error" in body ? body.error : "이미지 생성에 실패했습니다.");
      }

      // Persist record in generations table (RLS-scoped to current user)
      await insforge.database.from("generations").insert([
        {
          user_id: user.id,
          style,
          prompt: body.prompt,
          source_filename: file.name,
          generated_image_url: body.url,
          generated_image_key: body.key,
          status: "image_ready",
        },
      ]);

      setGeneratedImageUrl(body.url);
      setPhase("image_ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류";
      setErrorMessage(message);
      setPhase("error");
    }
  }

  function handleReset() {
    if (sourceImageDataUrl) URL.revokeObjectURL(sourceImageDataUrl);
    setSourceImageDataUrl(null);
    setGeneratedImageUrl(null);
    setSelectedStyle(null);
    setErrorMessage(null);
    setPhase("idle");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eceef0] flex items-center justify-center text-sm opacity-60">
        불러오는 중...
      </div>
    );
  }

  const displayName =
    profile?.full_name || user?.name || profile?.email || user?.email || "";
  const avatarUrl = profile?.avatar_url || user?.avatar_url;
  const initial = (displayName || "?").trim().charAt(0).toUpperCase();
  const isExploded = phase !== "idle";

  return (
    <div className="min-h-screen bg-[#eceef0] text-[#202020] font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between relative z-30">
        <a href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="삼대오백"
            width={300}
            height={98}
            priority
            className="h-8 w-auto"
          />
        </a>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-10 h-10 rounded-full bg-[#dee0e2] overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity border border-[#202020]/10"
            aria-label="사용자 메뉴"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-semibold">{initial}</span>
            )}
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-60 bg-[#eceef0] border border-[#dee0e2] rounded-2xl shadow-lg overflow-hidden z-30">
                <div className="px-4 py-3 border-b border-[#dee0e2]">
                  <p className="text-sm font-semibold truncate">
                    {displayName}
                  </p>
                  <p className="text-xs opacity-60 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-[#dee0e2] transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main: cards either in grid (idle) or exploded to corners (generating/...) */}
      <main className="flex-1 relative">
        {/* Center grid for idle state */}
        {!isExploded && (
          <div className="absolute inset-0 flex items-center justify-center px-8 pb-16">
            <div
              className="grid grid-cols-2 gap-x-16 gap-y-20 w-full max-w-4xl"
              style={{ perspective: "1600px", perspectiveOrigin: "50% 50%" }}
            >
              {VIDEOS.map((v) => (
                <VideoCard
                  key={v.id}
                  meta={v}
                  onAttach={handleAttach}
                />
              ))}
            </div>
          </div>
        )}

        {/* Exploded cards at corners, spinning */}
        {isExploded &&
          VIDEOS.map((v, i) => (
            <div
              key={v.id}
              className={`fixed ${CORNER_CLASSES[v.position]} w-40 h-28 md:w-52 md:h-36 z-10 pointer-events-none`}
              style={{
                animation: "mosaic-pop 0.6s cubic-bezier(0.2, 0.8, 0.2, 1.2) both",
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  animation: "mosaic-spin 9s linear infinite",
                  animationDelay: `${600 + i * 60}ms`,
                }}
              >
                <div className="absolute inset-0 rounded-2xl overflow-hidden bg-[#202020] shadow-[0_20px_50px_-20px_rgba(32,32,32,0.5)]">
                  <VideoPlaceholder seed={v.position} />
                  <div className="absolute bottom-2 left-3 right-3 text-[#eceef0] pointer-events-none">
                    <h3 className="text-xs font-bold leading-tight">
                      {v.title}
                    </h3>
                    <p className="text-[10px] opacity-70">{v.subtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {/* Central generation stage */}
        {isExploded && (
          <div className="absolute inset-0 flex items-center justify-center px-8 pb-16">
            <GenerationStage
              phase={phase}
              sourceUrl={sourceImageDataUrl}
              generatedUrl={generatedImageUrl}
              errorMessage={errorMessage}
              style={selectedStyle}
              onReset={handleReset}
            />
          </div>
        )}

        <style jsx global>{`
          @keyframes mosaic-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes mosaic-pop {
            0% {
              opacity: 0;
              transform: scale(0.3) translate(0, 0);
            }
            60% {
              opacity: 1;
              transform: scale(1.05);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </main>
    </div>
  );
}

function VideoCard({
  meta,
  onAttach,
}: {
  meta: VideoMeta;
  onAttach: (style: GenerationStyle, file: File) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState(BASE_ANGLES[meta.position]);

  function handleMouseLeave() {
    setHovered(false);
    setTilt(BASE_ANGLES[meta.position]);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const py = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    const base = BASE_ANGLES[meta.position];
    setTilt({
      x: base.x - py * 8,
      y: base.y - px * 8,
    });
  }

  function openPicker() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onAttach(meta.id, file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        ref={cardRef}
        className="relative aspect-[4/3] w-full"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
          transition: hovered
            ? "transform 80ms ease-out"
            : "transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={openPicker}
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden bg-[#202020] shadow-[0_30px_70px_-30px_rgba(32,32,32,0.5)] cursor-pointer">
          <VideoPlaceholder seed={meta.position} />
          <div className="absolute bottom-4 left-4 right-4 text-[#eceef0] z-[1] pointer-events-none">
            <h3 className="text-base md:text-lg font-bold leading-tight">
              {meta.title}
            </h3>
            <p className="text-xs opacity-70 mt-1">{meta.subtitle}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={openPicker}
        className="flex flex-col items-center gap-2 group"
        aria-label={`${meta.title} 사진 첨부`}
      >
        <div className="w-11 h-11 rounded-full bg-[#202020] flex items-center justify-center transition-transform group-hover:scale-110">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#eceef0]"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight">사진 첨부</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

function GenerationStage({
  phase,
  sourceUrl,
  generatedUrl,
  errorMessage,
  style,
  onReset,
}: {
  phase: Phase;
  sourceUrl: string | null;
  generatedUrl: string | null;
  errorMessage: string | null;
  style: GenerationStyle | null;
  onReset: () => void;
}) {
  const styleTitle = VIDEOS.find((v) => v.id === style)?.title ?? "";

  return (
    <div className="w-full max-w-xl bg-[#eceef0] rounded-3xl p-8 shadow-[0_30px_80px_-20px_rgba(32,32,32,0.25)] border border-[#dee0e2] z-20 relative">
      <div className="text-center mb-6">
        <p className="text-xs opacity-60 mb-1">선택한 스타일</p>
        <h2 className="text-2xl font-bold tracking-tight">{styleTitle}</h2>
      </div>

      <div className="flex flex-col gap-4">
        <StageRow label="사용자가 첨부한 사진" url={sourceUrl} state="done" />
        <Connector />
        <StageRow
          label="AI가 생성한 이미지"
          url={generatedUrl}
          state={
            phase === "generating"
              ? "loading"
              : phase === "image_ready"
                ? "done"
                : phase === "error"
                  ? "error"
                  : "pending"
          }
        />
        <Connector />
        <StageRow
          label="AI가 생성한 영상"
          url={null}
          state="pending"
          hint="다음 단계에서 출시 예정"
        />
      </div>

      {phase === "error" && (
        <div className="mt-6 text-sm bg-[#202020] text-[#eceef0] px-4 py-3 rounded-xl text-center">
          {errorMessage ?? "이미지 생성 중 오류가 발생했습니다."}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={onReset}
          className="text-sm border border-[#202020] px-5 py-2 rounded-full hover:bg-[#dee0e2] transition-colors"
        >
          다른 스타일로 다시 시작
        </button>
      </div>
    </div>
  );
}

function StageRow({
  label,
  url,
  state,
  hint,
}: {
  label: string;
  url: string | null;
  state: "pending" | "loading" | "done" | "error";
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-[#dee0e2] flex items-center justify-center shrink-0">
        {url && (state === "done" || state === "loading") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs opacity-50">
            {state === "loading" ? "생성 중..." : state === "error" ? "—" : "대기 중"}
          </span>
        )}
        {state === "loading" && (
          <div className="absolute inset-0 bg-[#202020]/30 backdrop-blur-sm flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-[#eceef0] border-t-transparent animate-spin" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs opacity-60 mt-0.5">
          {hint
            ? hint
            : state === "done"
              ? "완료"
              : state === "loading"
                ? "AI가 작업 중이에요"
                : state === "error"
                  ? "실패"
                  : "대기 중"}
        </p>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-start pl-12">
      <div className="w-px h-4 bg-[#202020]/30" />
    </div>
  );
}

function VideoPlaceholder({ seed }: { seed: string }) {
  const variants: Record<string, string> = {
    "10": "from-[#2a2a2a] via-[#202020] to-[#0e0e0e]",
    "2": "from-[#1a1a1a] via-[#262626] to-[#0a0a0a]",
    "8": "from-[#202020] via-[#161616] to-[#2a2a2a]",
    "4": "from-[#161616] via-[#222222] to-[#0e0e0e]",
  };
  return (
    <div className="w-full h-full relative">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${variants[seed] ?? variants["10"]}`}
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-50">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-[#eceef0]"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
}
