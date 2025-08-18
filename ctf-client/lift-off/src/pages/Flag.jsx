import { useState } from "react";

function Flags() {
    const textLabel = `░██████████░██            ░███      ░██████       ░██████   ░██     ░██ ░████████   ░███     ░███ ░██████░██████████            
░██        ░██           ░██░██    ░██   ░██     ░██   ░██  ░██     ░██ ░██    ░██  ░████   ░████   ░██      ░██       
░██        ░██          ░██  ░██  ░██           ░██         ░██     ░██ ░██    ░██  ░██░██ ░██░██   ░██      ░██       
░█████████ ░██         ░█████████ ░██  █████     ░████████  ░██     ░██ ░████████   ░██ ░████ ░██   ░██      ░██       
░██        ░██         ░██    ░██ ░██     ██            ░██ ░██     ░██ ░██     ░██ ░██  ░██  ░██   ░██      ░██       
░██        ░██         ░██    ░██  ░██  ░███     ░██   ░██   ░██   ░██  ░██     ░██ ░██       ░██   ░██      ░██                           
░██        ░██████████ ░██    ░██   ░█████░█      ░██████     ░██████   ░█████████  ░██       ░██ ░██████    ░██       
                                                                                                                       
                                                                                                                                                                       
                                                   .^.
                                                  (( ))
                                                   |#|_______________________________
                                                   |#||########$$$###################|
                                                   |#||########$$$###################|
                                                   |#||########$$$###################|
                                                   |#||########$$$###################|
                                                   |#||$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$|
                                                   |#||$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$|
                                                   |#|'""""""""""""""""""""""""""""""'
                                                   |#|
                                                   |#|
                                                   |#|
                                                   |#|
                                                   |#|
                                                   |#|
                                                   |#|
                                                   |#|
                                                   |#|
                                                   |#|
                                                  //|\\\\     `
                                                
                                                
                                                




  const [username, setUsername] = useState("");
  const [flag, setFlag] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // later: send to Supabase or API
    console.log("Submitted:", { username, flag });
  }



  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center justify-center"
      >
        <pre
                    className="text-white font-mono text-[5px] leading-tight whitespace-pre-wrap p-4 mt-[10px] ml-[150px] z-10">
                    {textLabel}
        </pre>
        <input
          className="rounded mt-5 border bg-zinc-900 border-dotted px-3 py-1"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          className="rounded mt-5 border bg-zinc-900 border-dotted px-3 py-1"
          type="text"
          placeholder="Enter Flag"
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          required
        />

        <button
          type="submit"
          className="mt-6 px-6 py-2 bg-zinc-900 text-white hover:text-amber-100 rounded border border-dashed"
        >
          Submit Flag
        </button>
      </form>
    </div>
  );
}

export default Flags;
