"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { insforge, type Profile } from "@/lib/insforge";

type CurrentUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  avatar_url?: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [signingOut, setSigningOut] = useState(false);

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
      await ensureProfile(u);
      setLoading(false);
    }

    async function ensureProfile(u: CurrentUser) {
      const { data: existing } = await insforge.database
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();

      if (existing) {
        setProfile(existing as Profile);
        return;
      }

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

      if (inserted) setProfile(inserted as Profile);
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSignOut() {
    setSigningOut(true);
    await insforge.auth.signOut();
    router.replace("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eceef0] text-[#202020] flex items-center justify-center">
        <div className="text-sm opacity-60">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eceef0] text-[#202020] font-sans">
      {/* Top bar */}
      <header className="border-b border-[#dee0e2]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
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
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm opacity-60">
              {profile?.email ?? user?.email}
            </span>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-sm border border-[#202020] px-4 py-2 rounded-full hover:bg-[#dee0e2] transition-colors disabled:opacity-50"
            >
              {signingOut ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Greeting */}
        <section className="mb-12">
          <p className="text-sm opacity-60 mb-2">환영합니다</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {profile?.full_name || user?.name || "크리에이터"}님,
            <br />
            오늘은 어떤 영상을 만들까요?
          </h1>
        </section>

        {/* Stats cards */}
        <section className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-[#dee0e2] p-6 rounded-2xl">
            <p className="text-xs opacity-60 mb-2">남은 크레딧</p>
            <p className="text-3xl font-bold">{profile?.credits ?? 0}</p>
            <p className="text-xs opacity-50 mt-1">영상 1개당 1크레딧 소모</p>
          </div>
          <div className="bg-[#dee0e2] p-6 rounded-2xl">
            <p className="text-xs opacity-60 mb-2">현재 플랜</p>
            <p className="text-3xl font-bold capitalize">
              {profile?.subscription_tier ?? "free"}
            </p>
            <p className="text-xs opacity-50 mt-1">언제든 변경 가능</p>
          </div>
          <div className="bg-[#dee0e2] p-6 rounded-2xl">
            <p className="text-xs opacity-60 mb-2">제작한 영상</p>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs opacity-50 mt-1">아직 만든 영상이 없어요</p>
          </div>
        </section>

        {/* Primary action */}
        <section className="bg-[#202020] text-[#eceef0] rounded-2xl p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            첫 영상을 만들어보세요
          </h2>
          <p className="opacity-70 mb-8">
            주제만 입력하면 AI가 3분 안에 바이럴 영상을 만들어드려요.
          </p>
          <button
            disabled
            className="bg-[#eceef0] text-[#202020] px-8 py-4 rounded-full font-semibold opacity-50 cursor-not-allowed"
          >
            영상 만들기 (곧 출시)
          </button>
        </section>
      </main>
    </div>
  );
}
