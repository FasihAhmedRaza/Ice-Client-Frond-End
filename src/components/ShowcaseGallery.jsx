import React, { useState, useEffect } from 'react';
import { X, Heart, Download, Sparkles, Loader, Maximize2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import LazyImage from './LazyImage';

const ShowcaseGallery = ({ isOpen, onClose }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [closing, setClosing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [lightboxImg, setLightboxImg] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setClosing(false);
            setActiveCategory('All');
            fetchShowcase();
        }
    }, [isOpen]);

    // Close lightbox on Escape
    useEffect(() => {
        if (!lightboxImg) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') setLightboxImg(null);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxImg]);

    const fetchShowcase = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/get_showcase_favourites`);
            const data = await res.json();
            setImages(data.data || []);
        } catch (err) {
            console.error('Error fetching showcase:', err);
            setImages([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            onClose();
        }, 350);
    };

    const downloadImage = async (url) => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `ice-sculpture-${Date.now()}.jpg`;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch {
            window.open(url, '_blank');
        }
    };

    const getImageUrl = (img) => {
        if (!img?.image_url) return '';
        return img.image_url.startsWith('/static') ? `${API_BASE_URL}${img.image_url}` : img.image_url;
    };

    const getCategory = (img) => img.template_type || 'Other';

    // Build unique category list
    const categories = ['All', ...Array.from(new Set(images.map(getCategory))).sort()];

    const filtered = activeCategory === 'All'
        ? images
        : images.filter(img => getCategory(img) === activeCategory);

    if (!isOpen && !closing) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`showcase-drawer-backdrop ${closing ? 'closing' : ''}`}
                onClick={handleClose}
            />

            {/* Drawer */}
            <div
                className={`showcase-drawer ${closing ? 'closing' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="showcase-drawer-header">
                    <div className="showcase-drawer-title-area">
                        <div className="showcase-drawer-icon">
                            <Sparkles size={16} />
                        </div>
                        <div>
                            <h2>Our Best Work</h2>
                            <p>Hand-picked by our team</p>
                        </div>
                    </div>
                    <button className="showcase-drawer-close" onClick={handleClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Category tabs */}
                {!loading && images.length > 0 && (
                    <div className="showcase-cat-tabs">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`showcase-cat-tab ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                                {cat !== 'All' && (
                                    <span className="showcase-cat-count">
                                        {images.filter(img => getCategory(img) === cat).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Body */}
                <div className="showcase-drawer-body">
                    {loading ? (
                        <div className="showcase-drawer-loading">
                            <Loader size={28} className="showcase-spinner" />
                            <p>Loading gallery...</p>
                        </div>
                    ) : images.length === 0 ? (
                        <div className="showcase-drawer-empty">
                            <Heart size={40} />
                            <h3>Coming Soon</h3>
                            <p>Our team is curating the best renders for you.</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="showcase-drawer-empty">
                            <Heart size={32} />
                            <h3>No images yet</h3>
                            <p>No favourites in this category.</p>
                        </div>
                    ) : (
                        <div className="showcase-grid">
                            {filtered.map((img) => (
                                <div
                                    key={img.id}
                                    className="showcase-card"
                                    onClick={() => setLightboxImg(img)}
                                >
                                    <LazyImage
                                        src={getImageUrl(img)}
                                        alt={getCategory(img)}
                                        draggable={false}
                                        placeholderH="200px"
                                    />
                                    <div className="showcase-card-overlay">
                                        <div className="showcase-card-actions">
                                            <button
                                                className="showcase-card-btn"
                                                onClick={e => { e.stopPropagation(); downloadImage(getImageUrl(img)); }}
                                                title="Download"
                                            >
                                                <Download size={13} />
                                            </button>
                                            <button
                                                className="showcase-card-btn"
                                                onClick={e => { e.stopPropagation(); setLightboxImg(img); }}
                                                title="View full size"
                                            >
                                                <Maximize2 size={13} />
                                            </button>
                                        </div>
                                        {img.template_type && (
                                            <span className="showcase-card-label">{img.template_type}</span>
                                        )}
                                    </div>
                                    <div className="showcase-card-heart">
                                        <Heart size={9} fill="#ff4b6e" color="#ff4b6e" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxImg && (
                <div className="showcase-lightbox" onClick={() => setLightboxImg(null)}>
                    <button className="showcase-lightbox-close" onClick={() => setLightboxImg(null)}>
                        <X size={20} />
                    </button>
                    <img
                        src={getImageUrl(lightboxImg)}
                        alt={getCategory(lightboxImg)}
                        onClick={e => e.stopPropagation()}
                        draggable={false}
                        onError={e => { e.target.src = 'https://placehold.co/600x600?text=Error'; }}
                    />
                    <div className="showcase-lightbox-footer" onClick={e => e.stopPropagation()}>
                        <span>{lightboxImg.template_type || 'Ice Sculpture'}</span>
                        <button
                            onClick={() => downloadImage(getImageUrl(lightboxImg))}
                            title="Download"
                        >
                            <Download size={15} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShowcaseGallery;
