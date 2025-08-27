import { useState } from "react";
import { supabase } from '../singletonSupabase';
import { useEffect } from "react";

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
                                                  //|\\\\`;
                                                  
    const [username, setUsername] = useState("");
    const [flag, setFlag] = useState("");
    const [particles, setParticles] = useState([]);
    const [windowDimensions, setWindowDimensions] = useState({ width: 1200, height: 800 });

    // Handle window resize and get proper dimensions
    useEffect(() => {
        const updateWindowDimensions = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        // Set initial dimensions
        if (typeof window !== 'undefined') {
            updateWindowDimensions();
            window.addEventListener('resize', updateWindowDimensions);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', updateWindowDimensions);
            }
        };
    }, []);

    // Create fire particles effect at bottom
    useEffect(() => {
        // Initialize fire particles
        const initParticles = Array.from({ length: 60 }, (_, i) => ({
            id: i,
            x: Math.random() * windowDimensions.width,
            y: windowDimensions.height - Math.random() * 50, // Start near bottom
            size: Math.random() * 6 + 2,
            speed: Math.random() * 3 + 2, // Upward speed
            drift: (Math.random() - 0.5) * 1.5, // Side to side movement
            age: 0,
            maxAge: 2000 + Math.random() * 1500 // Vary lifetime
        }));
        
        setParticles(initParticles);

        const interval = setInterval(() => {
            setParticles(prev => prev.map(particle => {
                let newY = particle.y - particle.speed;
                let newX = particle.x + particle.drift;
                let newAge = particle.age + 50;

                // Reset particle when it goes too high or gets too old
                if (newY < windowDimensions.height - 300 || newAge >= particle.maxAge) {
                    newY = windowDimensions.height - Math.random() * 20; // Respawn at bottom
                    newX = Math.random() * windowDimensions.width;
                    newAge = 0;
                }

                // Wrap particles horizontally instead of resetting
                if (newX < -10) {
                    newX = windowDimensions.width + 10;
                } else if (newX > windowDimensions.width + 10) {
                    newX = -10;
                }

                return {
                    ...particle,
                    x: newX,
                    y: newY,
                    age: newAge
                };
            }));
        }, 50);

        return () => clearInterval(interval);
    }, [windowDimensions]);

    async function handleSubmit(e) {
        e.preventDefault();
        const { data, error } = await supabase.rpc("submit_flag", {
            username_input: username,
            flag_input: flag,
        });

        if (error) {
            console.error(error);
            alert("❌ Error submitting flag");
        } else {
            alert(data);
        }
        setFlag("");
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center justify-center z-10"
            >
                <pre className="text-white font-mono text-[5px] leading-tight whitespace-pre-wrap p-4 mt-[10px] ml-[150px]">
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

            {/* Fire particles effect - confined to bottom */}
            <div className="fixed bottom-0 left-0 right-0 h-80 pointer-events-none overflow-hidden">
                {particles.map(particle => {
                    const fadeOpacity = Math.max(0, (1 - particle.age / particle.maxAge) * 0.8);
                    const relativeY = windowDimensions.height - particle.y; // Convert to relative position
                    
                    // Only render if particle is in the bottom area
                    if (relativeY > 320) return null;
                    
                    return (
                        <div
                            key={particle.id}
                            className="absolute bg-white"
                            style={{
                                left: `${particle.x}px`,
                                bottom: `${relativeY}px`,
                                width: `${particle.size}px`,
                                height: `${particle.size}px`,
                                transform: 'rotate(45deg)',
                                opacity: fadeOpacity
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default Flags;