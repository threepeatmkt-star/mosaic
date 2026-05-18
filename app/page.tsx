export default function Home() {
  return (
    <div className="min-h-screen bg-[#eceef0] text-[#202020] font-sans">
      {/* Navigation */}
      <nav className="border-b border-[#dee0e2]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">mosaic</div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="hover:opacity-60 transition-opacity">기능</a>
            <a href="#how" className="hover:opacity-60 transition-opacity">사용 방법</a>
            <a href="#pricing" className="hover:opacity-60 transition-opacity">요금제</a>
          </div>
          <a
            href="#start"
            className="bg-[#202020] text-[#eceef0] px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            시작하기
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-block bg-[#dee0e2] px-4 py-1.5 rounded-full text-xs font-medium mb-8">
          ✨ AI 기반 바이럴 영상 생성 서비스
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          원클릭으로 만드는
          <br />
          바이럴 영상
        </h1>
        <p className="text-lg md:text-xl text-[#202020]/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          트렌드 분석부터 컷 편집, 자막 삽입, 발행까지.
          <br />
          AI가 모든 과정을 자동화합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href="#start"
            className="bg-[#202020] text-[#eceef0] px-8 py-4 rounded-full text-base font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto"
          >
            무료로 시작하기
          </a>
          <a
            href="#how"
            className="border border-[#202020] px-8 py-4 rounded-full text-base font-semibold hover:bg-[#dee0e2] transition-colors w-full sm:w-auto"
          >
            데모 영상 보기
          </a>
        </div>
        <p className="text-xs text-[#202020]/50 mt-6">신용카드 등록 불필요 · 평생 무료 플랜 제공</p>
      </section>

      {/* Visual mockup placeholder */}
      <section className="max-w-5xl mx-auto px-6 mb-32">
        <div className="aspect-video bg-[#dee0e2] rounded-2xl border border-[#202020]/10 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#202020] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#eceef0] ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-sm text-[#202020]/60">제품 데모 영상 영역</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[#dee0e2] py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-sm font-medium mb-3 opacity-60">FEATURES</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              영상 제작, 더 이상 어렵지 않아요
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "실시간 트렌드 분석",
                desc: "지금 이 순간 가장 핫한 주제와 포맷을 AI가 분석해 추천해드려요.",
              },
              {
                num: "02",
                title: "완전 자동 편집",
                desc: "컷 편집·자막·BGM·전환 효과까지. 클릭 한 번으로 완성.",
              },
              {
                num: "03",
                title: "원클릭 멀티 업로드",
                desc: "YouTube, TikTok, Instagram Reels에 동시 발행.",
              },
            ].map((f) => (
              <div
                key={f.num}
                className="bg-[#eceef0] p-8 rounded-2xl border border-[#202020]/5"
              >
                <div className="text-sm font-mono opacity-40 mb-6">{f.num}</div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-[#202020]/70 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-sm font-medium mb-3 opacity-60">HOW IT WORKS</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              세 단계면 충분합니다
            </h2>
          </div>
          <div className="space-y-6">
            {[
              {
                step: "STEP 1",
                title: "주제 입력",
                desc: "영상으로 만들고 싶은 주제나 키워드를 한 문장으로 입력하세요.",
              },
              {
                step: "STEP 2",
                title: "AI가 영상 생성",
                desc: "스크립트 작성부터 영상 편집까지 평균 3분 안에 완료됩니다.",
              },
              {
                step: "STEP 3",
                title: "검토 후 발행",
                desc: "미리보기로 확인하고, 원하는 플랫폼에 바로 업로드하세요.",
              },
            ].map((s, i) => (
              <div
                key={s.step}
                className="flex flex-col md:flex-row md:items-center gap-6 p-8 bg-[#dee0e2] rounded-2xl"
              >
                <div className="text-6xl md:text-7xl font-bold opacity-20 md:w-32">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-mono opacity-60 mb-2">{s.step}</p>
                  <h3 className="text-2xl font-bold mb-2">{s.title}</h3>
                  <p className="text-[#202020]/70">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-[#dee0e2] py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-medium mb-8 opacity-60">크리에이터들이 선택한 이유</p>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">3분</div>
              <div className="text-sm opacity-60">평균 제작 시간</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">12K+</div>
              <div className="text-sm opacity-60">월간 활성 사용자</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-sm opacity-60">사용자 만족도</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="start" className="bg-[#202020] text-[#eceef0] py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            첫 바이럴 영상,
            <br />
            오늘 만들어보세요
          </h2>
          <p className="text-lg opacity-70 mb-10">
            가입 후 30초면 첫 영상을 만들 수 있습니다.
          </p>
          <a
            href="#"
            className="inline-block bg-[#eceef0] text-[#202020] px-10 py-4 rounded-full text-base font-semibold hover:opacity-90 transition-opacity"
          >
            지금 무료로 시작하기 →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#dee0e2] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm opacity-60">© 2026 mosaic. All rights reserved.</div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity">이용약관</a>
            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity">개인정보처리방침</a>
            <a href="#" className="opacity-60 hover:opacity-100 transition-opacity">고객지원</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
