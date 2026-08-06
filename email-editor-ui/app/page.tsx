import EmailEditor from "@/components/EmailEditor";

export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="app-header sticky top-0 z-30 border-b border-slate-200/80 bg-[#f7f8f4]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-sm font-black tracking-tight text-white shadow-sm">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold tracking-tight text-slate-950 sm:text-lg">
                  NOBI Email Studio
                </h1>
                <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800 sm:inline">
                  Builder
                </span>
              </div>
              <p className="hidden text-xs text-slate-500 sm:block">
                Compose visually. Export safely.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
            <span className="hidden sm:inline">Draft autosaves locally</span>
            <span className="sm:hidden">Autosave</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1720px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <EmailEditor />
      </main>
    </div>
  );
}
