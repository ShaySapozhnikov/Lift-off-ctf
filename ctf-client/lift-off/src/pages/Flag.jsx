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

// Simple client-side rate limiting
class RateLimiter {
    constructor(maxAttempts = 3, windowMs = 60000) { // 3 attempts per minute
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
        this.attempts = [];
    }
    
    canAttempt() {
        const now = Date.now();
        // Remove attempts older than the window
        this.attempts = this.attempts.filter(time => now - time < this.windowMs);
        return this.attempts.length < this.maxAttempts;
    }
    
    recordAttempt() {
        this.attempts.push(Date.now());
    }
    
    getRemainingTime() {
        if (this.attempts.length === 0) return 0;
        const oldestAttempt = Math.min(...this.attempts);
        const remainingMs = this.windowMs - (Date.now() - oldestAttempt);
        return Math.max(0, Math.ceil(remainingMs / 1000));
    }
}

// Bot detection utilities
const detectBotBehavior = () => {
    const checks = {
        webdriver: navigator.webdriver === true,
        languages: navigator.languages && navigator.languages.length === 0,
        platform: navigator.platform === '',
        plugins: navigator.plugins.length === 0,
        userAgent: /headless|phantom|selenium|webdriver|bot|spider|crawler/i.test(navigator.userAgent),
        // Check for automation tools
        automation: window.chrome && window.chrome.runtime && window.chrome.runtime.onConnect,
        // Check mouse movement (will be tracked separately)
        noMouseMovement: true // Will be updated by mouse tracking
    };
    
    const suspiciousCount = Object.values(checks).filter(Boolean).length;
    return { suspicious: suspiciousCount >= 2, checks };
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
    const [cooldownTime, setCooldownTime] = useState(0);
    const [mouseMovements, setMouseMovements] = useState(0);
    const [keystrokes, setKeystrokes] = useState(0);
    const [focusTime, setFocusTime] = useState(0);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [showCaptcha, setShowCaptcha] = useState(false);
    
    const rateLimiter = useRef(new RateLimiter(3, 60000)); // 3 attempts per minute
    const sessionStartTime = useRef(Date.now());
    const lastSubmissionTime = useRef(0);
    const focusStartTime = useRef(Date.now());

    // Track user interactions for bot detection
    useEffect(() => {
        let mouseMoveCount = 0;
        let keystrokeCount = 0;

        const handleMouseMove = () => {
            mouseMoveCount++;
            setMouseMovements(prev => prev + 1);
        };

        const handleKeyPress = () => {
            keystrokeCount++;
            setKeystrokes(prev => prev + 1);
        };

        const handleFocus = () => {
            focusStartTime.current = Date.now();
        };

        const handleBlur = () => {
            const focusTimeMs = Date.now() - focusStartTime.current;
            setFocusTime(prev => prev + focusTimeMs);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('keypress', handleKeyPress);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('keypress', handleKeyPress);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    // Cooldown timer
    useEffect(() => {
        let interval;
        if (cooldownTime > 0) {
            interval = setInterval(() => {
                setCooldownTime(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [cooldownTime]);

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

    // Simple math captcha component
    const MathCaptcha = ({ onVerify, onClose }) => {
        const [answer, setAnswer] = useState('');
        const [question, setQuestion] = useState('');
        const [correctAnswer, setCorrectAnswer] = useState(0);

        useEffect(() => {
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            const operation = Math.random() > 0.5 ? '+' : '-';
            
            if (operation === '+') {
                setQuestion(`${a} + ${b} = ?`);
                setCorrectAnswer(a + b);
            } else {
                const larger = Math.max(a, b);
                const smaller = Math.min(a, b);
                setQuestion(`${larger} - ${smaller} = ?`);
                setCorrectAnswer(larger - smaller);
            }
        }, []);

        const handleVerify = () => {
            if (parseInt(answer) === correctAnswer) {
                onVerify();
            } else {
                alert('❌ Incorrect answer. Please try again.');
                setAnswer('');
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-zinc-800 p-6 rounded border border-dotted">
                    <h3 className="text-white mb-4">Please solve this math problem:</h3>
                    <p className="text-white text-xl mb-4">{question}</p>
                    <input
                        type="number"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="rounded border bg-zinc-900 border-dotted px-3 py-1 mr-2"
                        placeholder="Answer"
                        autoFocus
                    />
                    <button 
                        onClick={handleVerify}
                        className="px-4 py-1 bg-green-600 text-white rounded border border-dashed mr-2"
                    >
                        Verify
                    </button>
                    <button 
                        onClick={onClose}
                        className="px-4 py-1 bg-red-600 text-white rounded border border-dashed"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    };

    // Bot behavior analysis
    const analyzeUserBehavior = () => {
        const sessionTime = Date.now() - sessionStartTime.current;
        const timeSinceLastSubmission = Date.now() - lastSubmissionTime.current;
        
        const behaviorScore = {
            // Positive indicators (human-like)
            mouseMovements: mouseMovements > 10 ? 1 : 0,
            keystrokes: keystrokes > 5 ? 1 : 0,
            sessionTime: sessionTime > 30000 ? 1 : 0, // At least 30 seconds
            focusTime: focusTime > 10000 ? 1 : 0, // At least 10 seconds focused
            
            // Negative indicators (bot-like)
            tooFast: timeSinceLastSubmission < 5000 ? -2 : 0, // Less than 5 seconds between submissions
            noInteraction: mouseMovements === 0 && keystrokes === 0 ? -2 : 0,
            shortSession: sessionTime < 10000 ? -1 : 0 // Less than 10 seconds
        };

        const botDetection = detectBotBehavior();
        if (botDetection.suspicious) {
            behaviorScore.automationDetected = -3;
        }

        const totalScore = Object.values(behaviorScore).reduce((sum, score) => sum + score, 0);
        return { score: totalScore, details: behaviorScore, botDetection };
    };

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
        
        if (isSubmitting || cooldownTime > 0) return;

        // Rate limiting check
        if (!rateLimiter.current.canAttempt()) {
            const waitTime = rateLimiter.current.getRemainingTime();
            setCooldownTime(waitTime);
            alert(`❌ Too many attempts. Please wait ${waitTime} seconds.`);
            return;
        }

        // Behavior analysis
        const behaviorAnalysis = analyzeUserBehavior();
        console.log('Behavior analysis:', behaviorAnalysis); // For debugging

        // Require captcha for suspicious behavior
        if (behaviorAnalysis.score < -1 && !captchaVerified) {
            setShowCaptcha(true);
            return;
        }

        setErrors({ username: '', flag: '' });
        setIsSubmitting(true);

        try {
            const sanitizedUsername = validateUsername(username);
            const sanitizedFlag = validateFlag(flag);

            if (sanitizedUsername.length === 0 || sanitizedFlag.length === 0) {
                alert("❌ Please fill in all fields");
                return;
            }

            // Record the attempt
            rateLimiter.current.recordAttempt();
            lastSubmissionTime.current = Date.now();

            // Add behavioral data to submission for server-side analysis
            const submissionData = {
                username_input: sanitizedUsername,
                flag_input: sanitizedFlag,
                // Metadata for server-side bot detection
                client_metadata: {
                    session_time: Date.now() - sessionStartTime.current,
                    mouse_movements: mouseMovements,
                    keystrokes: keystrokes,
                    focus_time: focusTime,
                    behavior_score: behaviorAnalysis.score,
                    user_agent: navigator.userAgent,
                    timestamp: Date.now()
                }
            };

            const { data, error } = await supabase.rpc("submit_flag", submissionData);

            if (error) {
                console.error('Supabase error:', error);
                
                // Handle specific server-side bot detection
                if (error.message && error.message.includes('rate_limit')) {
                    setCooldownTime(300); // 5 minute cooldown for server rate limit
                    alert("❌ Server rate limit exceeded. Please wait 5 minutes.");
                } else if (error.message && error.message.includes('suspicious_activity')) {
                    setShowCaptcha(true);
                    alert("❌ Suspicious activity detected. Please complete verification.");
                } else {
                    alert("❌ Error submitting flag");
                }
            } else {
                const sanitizedResponse = sanitizeInput(String(data || 'Flag submitted successfully'));
                alert(sanitizedResponse);
                
                // Reset form and verification state
                setFlag("");
                setCaptchaVerified(false);
            }
        } catch (error) {
            console.error('Validation error:', error);
            alert(`❌ ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleCaptchaVerified = () => {
        setCaptchaVerified(true);
        setShowCaptcha(false);
        // Allow immediate submission after captcha
        setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
                form.requestSubmit();
            }
        }, 100);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-black">
            <SpeedInsights />
            {showCaptcha && (
                <MathCaptcha 
                    onVerify={handleCaptchaVerified}
                    onClose={() => setShowCaptcha(false)}
                />
            )}
            
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
                        disabled={isSubmitting || cooldownTime > 0}
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
                        disabled={isSubmitting || cooldownTime > 0}
                    />
                    {errors.flag && (
                        <span className="text-red-400 text-sm mt-1">{errors.flag}</span>
                    )}
                </div>
                
                <button
                    type="submit"
                    className="mt-6 px-6 py-2 bg-zinc-900 text-white hover:text-amber-100 rounded border border-dashed disabled:opacity-50"
                    disabled={errors.username || errors.flag || isSubmitting || cooldownTime > 0}
                >
                    {isSubmitting ? 'Submitting...' : cooldownTime > 0 ? `Wait ${cooldownTime}s` : 'Submit Flag'}
                </button>

                {/* Behavioral indicators (for debugging - remove in production) */}
                <div className="mt-4 text-xs text-gray-400">
                    <div>Mouse: {mouseMovements} | Keys: {keystrokes}</div>
                    <div>Focus: {Math.round(focusTime/1000)}s | Session: {Math.round((Date.now() - sessionStartTime.current)/1000)}s</div>
                </div>
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