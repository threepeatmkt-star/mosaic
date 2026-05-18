"use client";

import Image from "next/image";
import { useState } from "react";
import { insforge } from "@/lib/insforge";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    try {
      const { error } = await insforge.auth.signInWithOAuth({
        provider: "google",
        redirectTo: `${window.location.origin}/dashboard`,
      });
      if (error) throw error;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "로그인에 실패했습니다.";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#eceef0] text-[#202020] font-sans flex flex-col">
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
          <a
            href="/"
            className="text-sm opacity-60 hover:opacity-100 transition-opacity"
          >
            ← 홈으로
          </a>
        </div>
      </header>

      {/* Centered auth card */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              시작해볼까요?
            </h1>
            <p className="text-[#202020]/60">
              구글 계정으로 로그인하면 바로 영상을 만들 수 있어요.
            </p>
          </div>

          <div className="bg-[#dee0e2] rounded-2xl p-8 border border-[#202020]/5">
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full bg-[#202020] text-[#eceef0] py-4 rounded-full font-semibold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              {loading ? "이동 중..." : "Google 계정으로 계속하기"}
            </button>

            {error && (
              <div className="mt-4 text-sm text-center bg-[#202020] text-[#eceef0] px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <p className="mt-6 text-xs text-center text-[#202020]/50 leading-relaxed">
              계속 진행하시면 <span className="underline">이용약관</span>과{" "}
              <span className="underline">개인정보처리방침</span>에 동의하는
              것으로 간주됩니다.
            </p>
          </div>

          <div className="mt-8 text-center text-sm text-[#202020]/60">
            처음 오셨나요? 위 버튼 한 번이면 가입과 로그인이 동시에 완료됩니다.
          </div>
        </div>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#eceef0"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#eceef0"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#eceef0"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#eceef0"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
