import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function VulnLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(null); // new state

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
      setIsLoggedIn(true); // login succeeded
    } else {
      setResult(data);
      setIsLoggedIn(false); // login failed
    }
  };

  return (
    <div className="p-4 min-h-screen bg-zinc-900 text-white flex items-center justify-center">
      {!isLoggedIn ? (
        <div className="w-full max-w-sm">
          <h2 className="text-xl mb-4">Vulnerable Login</h2>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="text"
              placeholder="username"
              className="p-2 w-full bg-zinc-800 border border-zinc-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="text"
              placeholder="password"
              className="p-2 w-full bg-zinc-800 border border-zinc-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 px-4 py-2">
              Login
            </button>
          </form>
          {result && <div className="mt-4 text-red-400">{result}</div>}
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">{result}</h1>
          <p className="text-zinc-400">You are now logged in.</p>
        </div>
      )}
    </div>
  );
}
