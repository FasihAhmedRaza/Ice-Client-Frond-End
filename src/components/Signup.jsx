import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, Lock, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signUp, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await signUp({ email, password });
            if (error) throw error;
            alert('Registration successful! Check your email to verify your account.');
            navigate('/login');
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
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
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
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
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
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
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
                maxWidth: '440px',
                position: 'relative',
                zIndex: 10,
                animation: 'slideUp 0.6s ease-out'
            }}>
                <div style={{
                    background: 'rgba(18, 18, 18, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
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
                        background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #06b6d4)',
                        backgroundSize: '200% 100%',
                        animation: 'gradientShift 3s ease infinite'
                    }} />

                    <style>{`
            @keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          `}</style>

                    <Link to="/" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: '#9ca3af',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        marginBottom: '2rem',
                        transition: 'color 0.2s'
                    }}
                        onMouseEnter={(e) => e.target.style.color = '#fff'}
                        onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                        <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
                        Back to Home
                    </Link>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <div style={{
                                padding: '0.75rem',
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Sparkles size={24} style={{ color: '#a78bfa' }} />
                            </div>
                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                background: 'linear-gradient(135deg, #fff 0%, #c4b5fd 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                margin: 0
                            }}>
                                Create Account
                            </h2>
                        </div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginLeft: '4rem' }}>
                            Join us and start creating amazing ice sculptures
                        </p>
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

                    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                                        background: 'rgba(26, 26, 26, 0.6)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '0.9375rem',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
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
                                        background: 'rgba(26, 26, 26, 0.6)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '0.9375rem',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                            <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.5rem', marginLeft: '0.25rem' }}>
                                Minimum 6 characters
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: loading ? '#4b5563' : 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
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
                                boxShadow: loading ? 'none' : '0 10px 25px -5px rgba(139, 92, 246, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 15px 30px -5px rgba(139, 92, 246, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 10px 25px -5px rgba(139, 92, 246, 0.3)';
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{
                                color: '#a78bfa',
                                textDecoration: 'none',
                                fontWeight: '500',
                                transition: 'color 0.2s'
                            }}
                                onMouseEnter={(e) => e.target.style.color = '#c4b5fd'}
                                onMouseLeave={(e) => e.target.style.color = '#a78bfa'}>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <p style={{
                    textAlign: 'center',
                    marginTop: '1.5rem',
                    fontSize: '0.75rem',
                    color: '#4b5563'
                }}>
                    Powered by Cynx AI • Secure Authentication
                </p>
            </div>
        </div>
    );
};

export default Signup;
