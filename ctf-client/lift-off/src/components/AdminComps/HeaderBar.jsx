export default function HeaderBar() {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] tracking-widest uppercase text-white/60">
          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-white/80 animate-pulse" />
            <span>// ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <span>v2.1</span>
            <span>[ Unhackable ]</span>
          </div>
        </div>
        <div className="mt-2 h-px w-full bg-gradient-to-r from-white/40 via-white/20 to-transparent" />
      </div>
    );
  }