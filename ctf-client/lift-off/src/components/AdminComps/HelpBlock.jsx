import { useEffect, useState } from "react";

export default function HelpBlock() {
  const [visibility, setVisibility] = useState(true);

  useEffect(() => {
    const handleEnter = (event) => {
      if (event.key === "Enter") {
        console.log("Close");
        setVisibility(false); // hide on Enter
      }
    };


    

    window.addEventListener("keydown", handleEnter);


    return () => {
      window.removeEventListener("keydown", handleEnter);
    };
  }, []);

  return (
    visibility && (
      <div className="mt-6 text-[11px] text-white leading-6">
        <div className="uppercase tracking-widest">Controls</div>
        <ul className="list-disc list-inside">
          <li>
            Type <span className="px-1 rounded-sm bg-white/10">help</span> for
            commands
          </li>
          <li>
            Try{" "}
            <span className="px-1 rounded-sm bg-white/10">status</span> or{" "}
            <span className="px-1 rounded-sm bg-white/10">shutdown</span>
          </li>
          <li>
            Use <span className="px-1 rounded-sm bg-white/10">clear</span> to
            wipe the console
          </li>
        </ul>
      </div>
    )
  );
}
