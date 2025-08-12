import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import CorruptedAdminPanel from '../components/CorruptedAdminPanel';

// Supabase setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ASCII logo
const textLabel = `   ░███           ░██                 ░██           
  ░██░██          ░██                               
 ░██  ░██   ░████████ ░█████████████  ░██░████████  
░█████████ ░██    ░██ ░██   ░██   ░██ ░██░██    ░██ 
░██    ░██ ░██    ░██ ░██   ░██   ░██ ░██░██    ░██ 
░██    ░██ ░██   ░███ ░██   ░██   ░██ ░██░██    ░██ 
░██    ░██  ░█████░██ ░██   ░██   ░██ ░██░██    ░██ 
                                                   `;

export default function AdminLoginAndPanel() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // -----------------------
  // LOGIN HANDLER
  // -----------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.rpc('vulnerable_login', {
      user_input: username,
      pass_input: password
    });
    if (error) {
      console.error(error);
      setResult('Something went wrong.');
      setIsLoggedIn(false);
    } else if (data.startsWith('Welcome')) {
      setResult(data);
      setIsLoggedIn(true);
    } else {
      setResult(data);
      setIsLoggedIn(false);
    }
  };
  // -----------------------
  // RENDER
  // -----------------------
  return (
    <>
      {!isLoggedIn ? (
        <div className="p-4 min-h-screen bg-zinc-900 text-white flex items-center justify-center">
          <div className="w-full max-w-sm">
            <form onSubmit={handleLogin} className="space-y-4">
              <pre className="text-red-500 text-center font-mono text-[5px] leading-tight whitespace-pre-wrap p-4 mt-[10px]">
                {textLabel}
              </pre>
              <input type="text" placeholder="username" className="w-full rounded border bg-zinc-900 border-dotted px-3 py-2"
                value={username} onChange={(e) => setUsername(e.target.value)} />
              <input type="password" placeholder="password" className="w-full rounded border bg-zinc-900 border-dotted px-3 py-2"
                value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit" className="w-full bg-zinc-900 text-white hover:text-amber-100 rounded border border-dashed py-2 px-4 mt-6">
                Login
              </button>
            </form>
            {result && <div className="mt-4 text-red-400">{result}</div>}
          </div>
        </div>
      ) : (
        <CorruptedAdminPanel />
      )}
    </>
  );
}
