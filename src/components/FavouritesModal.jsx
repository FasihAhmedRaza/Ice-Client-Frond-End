import React, { useState, useEffect } from 'react';
import { X, Calendar, Image as ImageIcon, Heart } from 'lucide-react';
import api from '../api';
import './HistoryModal.css'; // Reuse styles
import { API_BASE_URL } from '../config';

const FavouritesModal = ({ isOpen, onClose, onSelectImage }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchFavourites();
        }
    }, [isOpen]);

    const fetchFavourites = async () => {
        try {
            setLoading(true);
            const response = await api.get(`${API_BASE_URL}/api/get_user_favourites`);
            setImages(response.data.data || []);
        } catch (error) {
            console.error("Error fetching favourites:", error);
            setImages([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUnfavourite = async (e, id) => {
        e.stopPropagation();
        try {
            // Optimistic update
            setImages(prev => prev.filter(img => img.id !== id));

            const response = await fetch(`${API_BASE_URL}/api/toggle_favourite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_favourite: false }),
            });

            if (!response.ok) throw new Error('Failed to update');
        } catch (error) {
            console.error("Error removing favourite:", error);
            fetchFavourites(); // Revert
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content history-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-top">
                        <h2>Favourites</h2>
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
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="history-item skeleton">
                                    <div className="history-image-skeleton"></div>
                                </div>
                            ))}
                        </div>
                    ) : images.length === 0 ? (
                        <div className="empty-state">
                            <Heart size={48} />
                            <p>No favourite images yet</p>
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
                                        <HistoryImage src={img.image_url} alt={img.prompt} />
                                        <button
                                            className="favourite-btn active"
                                            onClick={(e) => handleUnfavourite(e, img.id)}
                                            style={{
                                                position: 'absolute',
                                                top: '5px',
                                                right: '5px',
                                                background: 'rgba(0,0,0,0.6)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: '#ff4b4b',
                                                padding: 0
                                            }}
                                            title="Remove from Favourites"
                                        >
                                            <Heart size={14} fill="#ff4b4b" />
                                        </button>
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
                </div>
            </div>
        </div>
    );
};

const HistoryImage = ({ src, alt }) => {
    const [loaded, setLoaded] = useState(false);
    // Ensure absolute URL
    const fullUrl = src && src.startsWith('/static') ? `${API_BASE_URL}${src}` : src;

    return (
        <div className="history-image-container">
            {!loaded && <div className="history-image-skeleton"></div>}
            <img
                src={fullUrl}
                alt={alt}
                className={!loaded ? 'hidden' : ''}
                onLoad={() => setLoaded(true)}
                onError={(e) => { e.target.src = 'https://placehold.co/150x150?text=Error'; setLoaded(true); }}
            />
        </div>
    );
};

export default FavouritesModal;
