import React, { useState, useEffect } from 'react';
import { X, Calendar, Image as ImageIcon, Heart, Video, ChevronDown } from 'lucide-react';
import api from '../api';
import './HistoryModal.css';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const getAvatarColor = (userId) => {
    if (!userId) return '#ccc';
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + "00000".substring(0, 6 - c.length) + c;
};

const UserAvatar = ({ user, userId, email }) => {
    // Try to find an image URL from possible fields
    const avatarUrl = user?.avatar_url || user?.user_metadata?.avatar_url || user?.picture;
    const displayName = user?.display_name || user?.user_metadata?.display_name;
    const identifier = displayName || email || userId || '?';
    const initial = (displayName || email || '?')[0].toUpperCase();
    const bgColor = getAvatarColor(userId || userId || email || 'default');

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt="User"
                title={identifier}
                className="user-avatar-img"
            />
        );
    }

    return (
        <div
            className="user-avatar-placeholder"
            style={{ backgroundColor: bgColor }}
            title={identifier}
        >
            {initial}
        </div>
    );
};

const HistoryModal = ({ isOpen, onClose, onSelectImage }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 50;

    const { user } = useAuth();
    // Normalize email for check
    const userEmail = user?.email?.toLowerCase() || '';
    const isAdmin = userEmail === 'alvaro@theicebutcher.com' || userEmail === 'alvaro@icebutcher.com';

    // Debug isAdmin status
    useEffect(() => {
        if (isOpen) {
            console.log("DEBUG: HistoryModal opened. User:", userEmail, "IsAdmin:", isAdmin);
        }
    }, [isOpen, userEmail, isAdmin]);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, isAdmin]); // Re-fetch if admin status changes (e.g. loads)

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setPage(0);
            setHasMore(true);

            if (isAdmin) {
                // Admin fetch: Use backend endpoint to get emails
                const response = await api.post(`${API_BASE_URL}/api/admin/get_history`, {
                    page: 0,
                    limit: ITEMS_PER_PAGE
                });

                const data = response.data.data;
                console.log("DEBUG: Admin History Data:", data);
                if (data && data.length > 0) {
                    console.log("DEBUG: First item user info:", {
                        email: data[0].email,
                        display_name: data[0].display_name,
                        user_id: data[0].user_id
                    });
                }
                setImages(data || []);
                if (data.length < ITEMS_PER_PAGE) setHasMore(false);
            } else {
                // Regular user fetch (existing API doesn't support pagination yet, so keeps as is)
                const response = await api.get(`${API_BASE_URL}/api/get_user_history`);
                setImages(response.data.data || []);
                setHasMore(false); // Disable load more for regular users for now
            }
        } catch (error) {
            console.error("Error fetching history:", error);
            setImages([]);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreHistory = async () => {
        if (!isAdmin || loadingMore) return;

        try {
            setLoadingMore(true);
            const nextPage = page + 1;

            const response = await api.post(`${API_BASE_URL}/api/admin/get_history`, {
                page: nextPage,
                limit: ITEMS_PER_PAGE
            });

            const data = response.data.data;

            if (data && data.length > 0) {
                setImages(prev => [...prev, ...data]);
                setPage(nextPage);
                if (data.length < ITEMS_PER_PAGE) setHasMore(false);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error loading more history:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent selecting the image
        if (!confirm("Are you sure you want to delete this image from history?")) return;

        try {
            // Optimistic update
            setImages(prev => prev.filter(img => img.id !== id));

            const response = await fetch(`${API_BASE_URL}/api/delete_history_item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            console.error("Error deleting image:", error);
            alert("Failed to delete image. Please try again.");
            fetchHistory(); // Revert on error
        }
    };

    const handleToggleFavourite = async (e, img) => {
        e.stopPropagation();
        const newStatus = !img.is_favourite;

        try {
            // Optimistic update
            setImages(prev => prev.map(item =>
                item.id === img.id ? { ...item, is_favourite: newStatus } : item
            ));

            const response = await fetch(`${API_BASE_URL}/api/toggle_favourite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: img.id, is_favourite: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update');
        } catch (error) {
            console.error("Error updating favourite:", error);
            fetchHistory(); // Revert
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content history-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-top">
                        <h2>History</h2>
                        <button className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by prompt or template..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="history-search-input"
                        />
                    </div>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="history-grid">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="history-item skeleton">
                                    <div className="history-image-skeleton"></div>
                                    <div className="history-info">
                                        <div className="history-text-skeleton" style={{ width: '60px' }}></div>
                                        <div className="history-text-skeleton" style={{ width: '40px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : images.length === 0 ? (
                        <div className="empty-state">
                            <ImageIcon size={48} />
                            <p>No generated images yet</p>
                        </div>
                    ) : (
                        <div className="history-grid">
                            {images.filter(img => {
                                const promptStr = typeof img.prompt === 'object' ? JSON.stringify(img.prompt) : (img.prompt || "");
                                const searchLower = searchTerm.toLowerCase();
                                return (
                                    promptStr.toLowerCase().includes(searchLower) ||
                                    (img.template_type && img.template_type.toLowerCase().includes(searchLower)) ||
                                    (img.template_name && img.template_name.toLowerCase().includes(searchLower))
                                );
                            }).map((img) => (
                                <div key={img.id} className="history-item" onClick={() => onSelectImage(img.image_url)}>
                                    <div className="history-image-wrapper" style={{ position: 'relative' }}>
                                        <HistoryImage
                                            src={img.image_url}
                                            alt={img.prompt || "Generated Image"}
                                            isVideo={img.template_type === 'video' || (img.image_url && img.image_url.endsWith('.mp4'))}
                                        />
                                        <div className="item-actions" style={{ position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '5px' }}>
                                            <button
                                                className="action-icon-btn"
                                                onClick={(e) => handleToggleFavourite(e, img)}
                                                style={{
                                                    background: 'rgba(0,0,0,0.6)',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: img.is_favourite ? '#ff4b4b' : '#fff',
                                                    padding: 0
                                                }}
                                                title={img.is_favourite ? "Remove from Favourites" : "Add to Favourites"}
                                            >
                                                <Heart size={14} fill={img.is_favourite ? "#ff4b4b" : "none"} />
                                            </button>
                                            <button
                                                className="action-icon-btn"
                                                onClick={(e) => handleDelete(e, img.id)}
                                                style={{
                                                    background: 'rgba(0,0,0,0.6)',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: '#fff',
                                                    padding: 0
                                                }}
                                                title="Delete"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                        {isAdmin && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '5px',
                                                right: '5px',
                                                zIndex: 10,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                background: 'rgba(0,0,0,0.6)',
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                backdropFilter: 'blur(2px)'
                                            }}
                                                onClick={(e) => e.stopPropagation()}
                                                title={img.email}
                                            >
                                                <span style={{
                                                    fontSize: '11px',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    maxWidth: '100px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {img.display_name || img.email?.split('@')[0] || 'User'}
                                                </span>
                                                <UserAvatar
                                                    userId={img.user_id}
                                                    email={img.email}
                                                    user={img}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="history-info">
                                        <span className="history-date">
                                            <Calendar size={12} />
                                            {new Date(img.created_at).toLocaleDateString()}
                                        </span>

                                        {(() => {
                                            const promptData = img.prompt;
                                            let userInput = "";

                                            if (promptData) {
                                                if (typeof promptData === 'object') {
                                                    userInput = promptData.user_input;
                                                } else {
                                                    try {
                                                        const parsed = JSON.parse(promptData);
                                                        userInput = parsed.user_input;
                                                    } catch (e) {
                                                        // Fallback to regex for malformed JSON
                                                        const match = promptData.match(/"user_input":\s*"?([^"}\n,]+)"?/i);
                                                        if (match && match[1]) {
                                                            userInput = match[1].trim();
                                                        } else {
                                                            userInput = promptData;
                                                        }
                                                    }
                                                }
                                            }

                                            const displayPrompt = (userInput && userInput.trim()) || img.template_type || "Generated Image";
                                            return (
                                                <div className="history-type-container">
                                                    <span className="history-type" title={displayPrompt}>{displayPrompt}</span>
                                                    {img.template_name && (
                                                        <span className="template-badge" title={`Template: ${img.template_name}`}>
                                                            {img.template_name}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isAdmin && hasMore && !loading && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                            <button
                                onClick={loadMoreHistory}
                                disabled={loadingMore}
                                style={{
                                    padding: '10px 20px',
                                    background: '#333',
                                    color: 'white',
                                    border: '1px solid #555',
                                    borderRadius: '8px',
                                    cursor: loadingMore ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {loadingMore ? 'Loading...' : 'Load More'}
                                {!loadingMore && <ChevronDown size={16} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const HistoryImage = ({ src, alt, isVideo }) => {
    const [loaded, setLoaded] = useState(false);
    // Ensure absolute URL
    const fullUrl = src && src.startsWith('/static') ? `${API_BASE_URL}${src}` : src;

    if (isVideo) {
        return (
            <div className="history-image-container" style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <video
                    src={fullUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    muted
                    loop
                    onMouseOver={e => e.target.play()}
                    onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                    <Video color="white" size={24} />
                </div>
            </div>
        );
    }

    return (
        <div className="history-image-container">
            {!loaded && <div className="history-image-skeleton"></div>}
            <img
                src={fullUrl}
                alt={alt}
                className={!loaded ? 'hidden' : ''}
                onLoad={() => setLoaded(true)}
                onError={(e) => {
                    e.target.src = 'https://placehold.co/150x150?text=Error';
                    setLoaded(true);
                }}
            />
        </div>
    );
};

export default HistoryModal;
