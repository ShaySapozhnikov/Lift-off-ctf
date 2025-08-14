export default function HelpBlock() {
    return (
      <div className="mt-6 text-[11px] text-white/50 leading-6">
        <div className="uppercase tracking-widest">Controls</div>
        <ul className="list-disc list-inside">
          <li>Type <span className="px-1 rounded-sm bg-white/10">help</span> for commands</li>
          <li>Try <span className="px-1 rounded-sm bg-white/10">status</span> or <span className="px-1 rounded-sm bg-white/10">shutdown</span></li>
          <li>Use <span className="px-1 rounded-sm bg-white/10">clear</span> to wipe the console</li>
        </ul>
      </div>
    );
  }