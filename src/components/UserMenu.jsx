import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown } from 'lucide-react';

import UsersModal from './UsersModal';

const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, signOut, updateProfile } = useAuth();
    const navigate = useNavigate();
    const menuRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
    const [saving, setSaving] = useState(false);
    const [showUsersModal, setShowUsersModal] = useState(false);

    const isAdmin = user?.email === 'alvaro@theicebutcher.com' || user?.email === 'alvaro@icebutcher.com';

    useEffect(() => {
        setDisplayName(user?.user_metadata?.display_name || '');
    }, [user]);

    const handleSaveProfile = async () => {
        if (!displayName.trim()) return;
        setSaving(true);
        try {
            const { error } = await updateProfile({
                data: { display_name: displayName }
            });
            if (error) throw error;
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Logout error (network/403?), forcing local cleanup:", error);
        } finally {
            // Manually clear Supabase tokens from localStorage
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-')) {
                    localStorage.removeItem(key);
                }
            });

            // Force hard reload to login page to wipe memory state
            window.location.href = '/login';
        }
    };

    if (!user) return null;

    return (
        <>
            <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: 'var(--background-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-full)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e2e8f0';
                        e.currentTarget.style.borderColor = 'var(--accent-color)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--background-color)';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                    }}>
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown size={16} style={{
                        transition: 'transform 0.2s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }} />
                </button>

                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 0.5rem)',
                        right: 0,
                        width: '280px',
                        background: 'var(--surface-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-xl)',
                        padding: '0.5rem',
                        zIndex: 1000,
                        animation: 'slideDown 0.2s ease-out'
                    }}>
                        <style>{`
                @keyframes slideDown {
                  from {
                    opacity: 0;
                    transform: translateY(-10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>

                        {/* User Info Section */}
                        <div style={{
                            padding: '0.75rem',
                            borderBottom: '1px solid var(--border-color)',
                            marginBottom: '0.5rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '0.5rem'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '600'
                                }}>
                                    {user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                placeholder="Display Name"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.25rem 0.5rem',
                                                    fontSize: '0.875rem',
                                                    borderRadius: '4px',
                                                    border: '1px solid var(--border-color)',
                                                    background: 'var(--background-color)',
                                                    color: 'var(--text-primary)'
                                                }}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveProfile();
                                                    if (e.key === 'Escape') setIsEditing(false);
                                                }}
                                            />
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    background: 'var(--primary-color)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    cursor: saving ? 'wait' : 'pointer',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {saving ? '...' : 'Save'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsEditing(true);
                                            }}
                                            style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: 'var(--text-primary)',
                                                marginBottom: '0.125rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                            title="Click to edit display name"
                                        >
                                            {user.user_metadata?.display_name || 'Set Display Name'}
                                            <div style={{ opacity: 0.5 }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-secondary)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isAdmin && (
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setShowUsersModal(true);
                                }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--hover-color)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <User size={18} />
                                <span>Users</span>
                            </button>
                        )}

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                                color: 'var(--danger-color)',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                textAlign: 'left'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                )}
            </div>
            <UsersModal isOpen={showUsersModal} onClose={() => setShowUsersModal(false)} />
        </>
    );
};

export default UserMenu;
