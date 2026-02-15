import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, Lock, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import CynxLogo from '../assets/react.svg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signIn, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await signIn({ email, password });
            if (error) throw error;
            navigate('/');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            flex: 1,
            background: 'radial-gradient(1200px 800px at 15% 20%, rgba(59, 130, 246, 0.18), transparent 60%), radial-gradient(1000px 700px at 85% 85%, rgba(139, 92, 246, 0.2), transparent 55%), #0b0b12',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1.25rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background Orbs */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'float 8s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '10%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'float 10s ease-in-out infinite reverse'
            }} />

            <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            <div style={{
                width: '100%',
                maxWidth: '460px',
                position: 'relative',
                zIndex: 10,
                animation: 'slideUp 0.6s ease-out'
            }}>
                <div style={{
                    background: 'rgba(10, 12, 18, 0.78)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    padding: '2.5rem 2.5rem 2.25rem',
                    boxShadow: '0 30px 60px -24px rgba(0, 0, 0, 0.7)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Top Gradient Bar */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
                        backgroundSize: '200% 100%',
                        animation: 'gradientShift 3s ease infinite'
                    }} />

                    <style>{`
            @keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          `}</style>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <Link to="/" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#9ca3af',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#fff'}
                        onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                            <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
                            Back to Home
                        </Link>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            color: '#e5e7eb',
                            fontWeight: 600,
                            letterSpacing: '0.02em'
                        }}>
                            <img src={CynxLogo} alt="Cynx" style={{ width: '32px', height: '32px' }} />
                            <span>Cynx</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <div style={{
                                padding: '0.75rem',
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Sparkles size={24} style={{ color: '#60a5fa' }} />
                            </div>
                            <div>
                                <h2 style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    margin: 0
                                }}>
                                    Welcome Back
                                </h2>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.35rem 0 0' }}>
                                    Sign in to Cynx to continue sculpting with AI
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '12px',
                            display: 'flex',
                            gap: '0.75rem',
                            animation: 'slideUp 0.3s ease-out'
                        }}>
                            <AlertCircle size={20} style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ color: '#fca5a5', fontSize: '0.875rem', margin: 0 }}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: '#9ca3af',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none'
                                }}>
                                    <Mail size={20} style={{ color: '#6b7280' }} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 3rem',
                                        background: 'rgba(17, 20, 28, 0.7)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '0.9375rem',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: '#9ca3af',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none'
                                }}>
                                    <Lock size={20} style={{ color: '#6b7280' }} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 3rem',
                                        background: 'rgba(17, 20, 28, 0.7)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '0.9375rem',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: loading ? '#4b5563' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                marginTop: '0.5rem',
                                transition: 'all 0.2s',
                                boxShadow: loading ? 'none' : '0 10px 25px -5px rgba(59, 130, 246, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 15px 30px -5px rgba(59, 130, 246, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.3)';
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            Don't have an account?{' '}
                            <Link to="/signup" style={{
                                color: '#60a5fa',
                                textDecoration: 'none',
                                fontWeight: '500',
                                transition: 'color 0.2s'
                            }}
                                onMouseEnter={(e) => e.target.style.color = '#93c5fd'}
                                onMouseLeave={(e) => e.target.style.color = '#60a5fa'}>
                                Create one now
                            </Link>
                        </p>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '1.5rem',
                    fontSize: '0.75rem',
                    color: '#4b5563'
                }}>
                    <img src={CynxLogo} alt="Cynx" style={{ width: '16px', height: '16px', opacity: 0.8 }} />
                    <span>Powered by Cynx AI • Secure Authentication</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
