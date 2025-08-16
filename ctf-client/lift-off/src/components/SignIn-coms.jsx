import React, { useState, useEffect, useRef } from "react";
import ShipIcon from "./shipIcon";
import { supabase } from '../singletonSupabase';

const defaultTextLabel = `
░██████              ░██                                              ░██      ░██████                                                                   ░██                         ░██    ░██                                 
  ░██                ░██                                              ░██     ░██   ░██                                                                                              ░██                                        
  ░██  ░████████  ░████████  ░███████  ░██░████ ░████████   ░██████   ░██    ░██         ░███████  ░█████████████  ░█████████████  ░██    ░██ ░████████  ░██ ░███████   ░██████   ░████████ ░██ ░███████  ░████████   ░███████  
  ░██  ░██    ░██    ░██    ░██    ░██ ░███     ░██    ░██       ░██  ░██    ░██        ░██    ░██ ░██   ░██   ░██ ░██   ░██   ░██ ░██    ░██ ░██    ░██ ░██░██    ░██       ░██     ░██    ░██░██    ░██ ░██    ░██ ░██        
  ░██  ░██    ░██    ░██    ░█████████ ░██      ░██    ░██  ░███████  ░██    ░██        ░██    ░██ ░██   ░██   ░██ ░██   ░██   ░██ ░██    ░██ ░██    ░██ ░██░██         ░███████     ░██    ░██░██    ░██ ░██    ░██  ░███████  
  ░██  ░██    ░██    ░██    ░██        ░██      ░██    ░██ ░██   ░██  ░██     ░██   ░██ ░██    ░██ ░██   ░██   ░██ ░██   ░██   ░██ ░██   ░███ ░██    ░██ ░██░██    ░██ ░██   ░██     ░██    ░██░██    ░██ ░██    ░██        ░██ 
░██████░██    ░██     ░████  ░███████  ░██      ░██    ░██  ░█████░██ ░██      ░██████   ░███████  ░██   ░██   ░██ ░██   ░██   ░██  ░█████░██ ░██    ░██ ░██ ░███████   ░█████░██     ░████ ░██ ░███████  ░██    ░██  ░███████  
`;







function Signin({ onLoginSuccess , textLabel = defaultTextLabel}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const formRef = useRef(null);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const overlay = document.getElementById("protected-overlay");
            if (!overlay) {
                console.warn("Overlay was deleted. Reloading...");
                window.location.reload();
            }
        });

        if (formRef.current) {
            observer.observe(formRef.current, {
                childList: true,
                subtree: true,
            });
        }

        return () => observer.disconnect();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Login failed:", error.message);
            setErrorMsg("Invalid email or password.");
        } else {
            console.log("Login success:", data);
            onLoginSuccess?.(); 
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="flex flex-col items-center justify-center"
            >
                <pre
                    id="protected-overlay"
                    className="text-white text-left font-mono text-[5px] leading-tight whitespace-pre-wrap p-4 mt-[10px] z-10"
                >
                    {textLabel}
                </pre>

                <ShipIcon />

                <h1 className="text-[20px] mt-2">Sign in</h1>

                <input
                    className="rounded mt-5 border bg-zinc-900 border-dotted px-3 py-1"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    className="rounded mt-5 border bg-zinc-900 border-dotted px-3 py-1"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
        </div>
    );
}

export default Signin;