import React, { useState } from "react";
import ShipIcon from "./shipIcon";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function Signin() {
    const [user, setuser] = useState("");
    const [pass, setpass] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        await checkLogin(user, pass);
    };

    async function checkLogin(username, password) {
        const { data, error } = await supabase
            .from('InternalCommunications')  //extreamly vanrabilbe! never ever do this lol
            .select('*')
            .eq('user', username)
            .eq('password', password)
            .single();

        if (error || !data) {
            console.error('Login failed:', error?.message || "Invalid credentials");
            setErrorMsg("Invalid username or password");
        } else {
            console.log('Login successful:', data);
            setLoggedIn(true); // hides the form
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            {!loggedIn ? (
                <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center">
                    <ShipIcon />

                    <h1 className="text-[20px] mt-2">Sign in</h1>

                    <input
                        className="rounded mt-5 border bg-zinc-900 border-dotted px-3 py-1"
                        type="text"
                        placeholder="Username"
                        value={user}
                        onChange={(e) => setuser(e.target.value)}
                    />

                    <input
                        className="rounded mt-5 border bg-zinc-900 border-dotted px-3 py-1"
                        type="password"
                        placeholder="Password"
                        value={pass}
                        onChange={(e) => setpass(e.target.value)}
                    />

                    <button
                        type="submit"
                        className="mt-6 px-6 py-2 bg-zinc-900 text-white hover:text-amber-100 rounded border border-dashed"
                    >
                        Sign In
                    </button>

                    {errorMsg && (
                        <p className="text-red-400 mt-3 text-sm">{errorMsg}</p>
                    )}

                    <footer className="mt-20 glow">
                        <p>The Unhackable @ 2025</p>
                    </footer>
                </form>
            ) : (
                <div className="completed-login!">
                </div>
            )}
        </div>
    );
}

export default Signin;
