import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Heart, Download, ChevronLeft, ChevronRight, Sparkles, Loader, Pause, Play } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AUTOPLAY_INTERVAL = 5000;

const ShowcaseGallery = ({ isOpen, onClose }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIdx, setActiveIdx] = useState(0);
    const [direction, setDirection] = useState('next'); // 'next' | 'prev'
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [imgLoaded, setImgLoaded] = useState({});
    const [closing, setClosing] = useState(false);
    const autoPlayRef = useRef(null);
    const thumbsRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setClosing(false);
            fetchShowcase();
        } else {
            setActiveIdx(0);
        }
    }, [isOpen]);

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

    // Autoplay
    useEffect(() => {
        if (!isOpen || !isAutoPlay || images.length <= 1 || loading) return;
        autoPlayRef.current = setInterval(() => {
            setDirection('next');
            setActiveIdx(prev => (prev + 1) % images.length);
        }, AUTOPLAY_INTERVAL);
        return () => clearInterval(autoPlayRef.current);
    }, [isOpen, isAutoPlay, images.length, loading]);

    // Scroll active thumbnail into view
    useEffect(() => {
        if (thumbsRef.current) {
            const thumb = thumbsRef.current.children[activeIdx];
            if (thumb) thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [activeIdx]);

    const goNext = useCallback(() => {
        setDirection('next');
        setActiveIdx(prev => (prev + 1) % images.length);
    }, [images.length]);

    const goPrev = useCallback(() => {
        setDirection('prev');
        setActiveIdx(prev => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    const goTo = (idx) => {
        setDirection(idx > activeIdx ? 'next' : 'prev');
        setActiveIdx(idx);
    };

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'ArrowRight') goNext();
            else if (e.key === 'ArrowLeft') goPrev();
            else if (e.key === 'Escape') handleClose();
            else if (e.key === ' ') { e.preventDefault(); setIsAutoPlay(p => !p); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, goNext, goPrev]);

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
        } catch (err) {
            window.open(url, '_blank');
        }
    };

    const getPromptDisplay = (img) => {
        const promptData = img.prompt;
        if (!promptData) return img.template_type || 'Ice Sculpture';
        if (typeof promptData === 'object') return promptData.user_input || img.template_type || 'Ice Sculpture';
        try {
            const parsed = JSON.parse(promptData);
            return parsed.user_input || img.template_type || 'Ice Sculpture';
        } catch {
            const match = promptData.match(/"user_input":\s*"?([^"}\n,]+)"?/i);
            return (match && match[1]?.trim()) || img.template_type || 'Ice Sculpture';
        }
    };

    const getImageUrl = (img) => {
        if (!img?.image_url) return '';
        return img.image_url.startsWith('/static') ? `${API_BASE_URL}${img.image_url}` : img.image_url;
    };

    if (!isOpen && !closing) return null;

    const activeImage = images[activeIdx];

    return (
        <div className={`showcase-drawer-backdrop ${closing ? 'closing' : ''}`} onClick={handleClose}>
            <div className={`showcase-drawer ${closing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>

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
                    <div className="showcase-drawer-header-actions">
                        {images.length > 1 && (
                            <button className="showcase-autoplay-btn" onClick={() => setIsAutoPlay(p => !p)} title={isAutoPlay ? 'Pause' : 'Play'}>
                                {isAutoPlay ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                        )}
                        <button className="showcase-drawer-close" onClick={handleClose}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

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
                    ) : (
                        <>
                            {/* Main image area */}
                            <div className="showcase-stage">
                                {/* Nav arrows */}
                                {images.length > 1 && (
                                    <>
                                        <button className="showcase-nav showcase-nav-prev" onClick={goPrev}><ChevronLeft size={24} /></button>
                                        <button className="showcase-nav showcase-nav-next" onClick={goNext}><ChevronRight size={24} /></button>
                                    </>
                                )}

                                {/* Crossfade images */}
                                <div className="showcase-slide-container">
                                    {images.map((img, idx) => (
                                        <div
                                            key={img.id}
                                            className={`showcase-slide ${idx === activeIdx ? 'active' : ''}`}
                                        >
                                            <img
                                                src={getImageUrl(img)}
                                                alt={getPromptDisplay(img)}
                                                onLoad={() => setImgLoaded(prev => ({ ...prev, [img.id]: true }))}
                                                onError={(e) => { e.target.src = 'https://placehold.co/600x800?text=Error'; }}
                                                draggable={false}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Heart badge */}
                                <div className="showcase-stage-heart">
                                    <Heart size={14} fill="#ff4b6e" color="#ff4b6e" />
                                    <span>Team Pick</span>
                                </div>

                                {/* Counter */}
                                <div className="showcase-stage-counter">
                                    {activeIdx + 1} / {images.length}
                                </div>
                            </div>

                            {/* Info bar */}
                            {activeImage && (
                                <div className="showcase-info-bar">
                                    <div className="showcase-info-text">
                                        <span className="showcase-info-label" title={getPromptDisplay(activeImage)}>
                                            {getPromptDisplay(activeImage)}
                                        </span>
                                        {activeImage.template_name && (
                                            <span className="showcase-info-badge">{activeImage.template_name}</span>
                                        )}
                                    </div>
                                    <button className="showcase-download-btn" onClick={() => downloadImage(getImageUrl(activeImage))} title="Download">
                                        <Download size={16} />
                                    </button>
                                </div>
                            )}

                            {/* Progress dots */}
                            {images.length > 1 && images.length <= 12 && (
                                <div className="showcase-dots">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            className={`showcase-dot ${idx === activeIdx ? 'active' : ''}`}
                                            onClick={() => goTo(idx)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Thumbnail strip */}
                            {images.length > 1 && (
                                <div className="showcase-thumbs-wrap">
                                    <div className="showcase-thumbs" ref={thumbsRef}>
                                        {images.map((img, idx) => (
                                            <button
                                                key={img.id}
                                                className={`showcase-thumb ${idx === activeIdx ? 'active' : ''}`}
                                                onClick={() => goTo(idx)}
                                            >
                                                <img
                                                    src={getImageUrl(img)}
                                                    alt=""
                                                    draggable={false}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShowcaseGallery;
