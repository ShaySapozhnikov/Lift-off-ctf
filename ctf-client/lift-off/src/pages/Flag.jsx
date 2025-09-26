import { useState, useEffect, useRef } from 'react';
import { supabase } from '../singletonSupabase';
import { SpeedInsights } from "@vercel/speed-insights/next"

// Input sanitization functions
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    
    const htmlStripped = input.replace(/<[^>]*>/g, '');
    const sanitized = htmlStripped
        .replace(/[<>'"&]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    
    return sanitized;
};

const validateUsername = (username) => {
    const sanitized = sanitizeInput(username);
    const minLength = 3;
    const maxLength = 20;
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    
    if (sanitized.length < minLength) {
        throw new Error(`Username must be at least ${minLength} characters long`);
    }
    if (sanitized.length > maxLength) {
        throw new Error(`Username must be no more than ${maxLength} characters long`);
    }
    if (!validPattern.test(sanitized)) {
        throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
    }
    
    return sanitized;
};

const validateFlag = (flag) => {
    const sanitized = sanitizeInput(flag);
    const maxLength = 100;
    const validPattern = /^[a-zA-Z0-9_{}.-]+$/;
    
    if (sanitized.length === 0) {
        throw new Error('Flag cannot be empty');
    }
    if (sanitized.length > maxLength) {
        throw new Error(`Flag must be no more than ${maxLength} characters long`);
    }
    if (!validPattern.test(sanitized)) {
        throw new Error('Flag contains invalid characters');
    }
    
    return sanitized;
};

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
    const [errors, setErrors] = useState({ username: '', flag: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle window resize and get proper dimensions
    useEffect(() => {
        const updateWindowDimensions = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

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

    // Create fire particles effect
    useEffect(() => {
        const initParticles = Array.from({ length: 60 }, (_, i) => ({
            id: i,
            x: Math.random() * windowDimensions.width,
            y: windowDimensions.height - Math.random() * 50,
            size: Math.random() * 6 + 2,
            speed: Math.random() * 3 + 2,
            drift: (Math.random() - 0.5) * 1.5,
            age: 0,
            maxAge: 2000 + Math.random() * 1500
        }));
        
        setParticles(initParticles);

        const interval = setInterval(() => {
            setParticles(prev => prev.map(particle => {
                let newY = particle.y - particle.speed;
                let newX = particle.x + particle.drift;
                let newAge = particle.age + 50;

                if (newY < windowDimensions.height - 300 || newAge >= particle.maxAge) {
                    newY = windowDimensions.height - Math.random() * 20;
                    newX = Math.random() * windowDimensions.width;
                    newAge = 0;
                }

                if (newX < -10) {
                    newX = windowDimensions.width + 10;
                } else if (newX > windowDimensions.width + 10) {
                    newX = -10;
                }

                return { ...particle, x: newX, y: newY, age: newAge };
            }));
        }, 50);

        return () => clearInterval(interval);
    }, [windowDimensions]);

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setUsername(value);
        
        try {
            if (value.length > 0) {
                validateUsername(value);
            }
            setErrors(prev => ({ ...prev, username: '' }));
        } catch (error) {
            setErrors(prev => ({ ...prev, username: error.message }));
        }
    };

    const handleFlagChange = (e) => {
        const value = e.target.value;
        setFlag(value);
        
        try {
            if (value.length > 0) {
                validateFlag(value);
            }
            setErrors(prev => ({ ...prev, flag: '' }));
        } catch (error) {
            setErrors(prev => ({ ...prev, flag: error.message }));
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (isSubmitting) return;

        setErrors({ username: '', flag: '' });
        setIsSubmitting(true);

        try {
            const sanitizedUsername = validateUsername(username);
            const sanitizedFlag = validateFlag(flag);

            if (sanitizedUsername.length === 0 || sanitizedFlag.length === 0) {
                alert("❌ Please fill in all fields");
                return;
            }

            const submissionData = {
                username_input: sanitizedUsername,
                flag_input: sanitizedFlag,
                client_metadata: {
                    user_agent: navigator.userAgent,
                    timestamp: Date.now()
                }
            };

            const { data, error } = await supabase.rpc("submit_flag", submissionData);

            if (error) {
                console.error('Supabase error:', error);
                alert("❌ Error submitting flag");
            } else {
                const sanitizedResponse = sanitizeInput(String(data || 'Flag submitted successfully'));
                alert(sanitizedResponse);
                setFlag("");
            }
        } catch (error) {
            console.error('Validation error:', error);
            alert(`❌ ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-black">
            <SpeedInsights />
            
            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center justify-center z-10"
            >
                <pre className="text-white font-mono text-[5px] leading-tight whitespace-pre-wrap p-4 mt-[10px] ml-[150px]">
                    {sanitizeInput(textLabel || '')}
                </pre>
                
                <div className="flex flex-col">
                    <input
                        className={`rounded mt-5 border bg-zinc-900 border-dotted px-3 py-1 text-white ${
                            errors.username ? 'border-red-500' : ''
                        }`}
                        type="text"
                        placeholder="Username (3-20 chars, letters/numbers/_/-)"
                        value={username}
                        onChange={handleUsernameChange}
                        maxLength="20"
                        required
                        disabled={isSubmitting}
                    />
                    {errors.username && (
                        <span className="text-red-400 text-sm mt-1">{errors.username}</span>
                    )}
                </div>
                
                <div className="flex flex-col">
                    <input
                        className={`rounded mt-5 border bg-zinc-900 border-dotted px-3 py-1 text-white ${
                            errors.flag ? 'border-red-500' : ''
                        }`}
                        type="text"
                        placeholder="Enter Flag"
                        value={flag}
                        onChange={handleFlagChange}
                        maxLength="100"
                        required
                        disabled={isSubmitting}
                    />
                    {errors.flag && (
                        <span className="text-red-400 text-sm mt-1">{errors.flag}</span>
                    )}
                </div>
                
                <button
                    type="submit"
                    className="mt-6 px-6 py-2 bg-zinc-900 text-white hover:text-amber-100 rounded border border-dashed disabled:opacity-50"
                    disabled={errors.username || errors.flag || isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Flag'}
                </button>
            </form>

            {/* Fire particles effect */}
            <div className="fixed bottom-0 left-0 right-0 h-80 pointer-events-none overflow-hidden">
                {particles.map(particle => {
                    const fadeOpacity = Math.max(0, (1 - particle.age / particle.maxAge) * 0.8);
                    const relativeY = windowDimensions.height - particle.y;
                    
                    if (relativeY > 320) return null;
                    
                    return (
                        <div
                            key={particle.id}
                            className="absolute bg-white"
                            style={{
                                left: `${Math.max(0, Math.min(windowDimensions.width, particle.x))}px`,
                                bottom: `${Math.max(0, relativeY)}px`,
                                width: `${Math.max(0, particle.size)}px`,
                                height: `${Math.max(0, particle.size)}px`,
                                transform: 'rotate(45deg)',
                                opacity: Math.max(0, Math.min(1, fadeOpacity))
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default Flags;