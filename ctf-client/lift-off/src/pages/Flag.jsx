import { useState } from "react";
import { supabase } from '../singletonSupabase';
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

  async function handleSubmit(e) {
    e.preventDefault(); // stop page reload
  
    const { data, error } = await supabase.rpc("submit_flag", {
      username_input: username,
      flag_input: flag,
    });
  
    if (error) {
      console.error(error);
      alert("❌ Error submitting flag");
    } else {
      alert(data); // shows success / already submitted / invalid
    }
  
    setFlag(""); // clear flag input
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
