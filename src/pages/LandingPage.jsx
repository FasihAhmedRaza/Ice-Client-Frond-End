import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Layers, MessageSquare, Video, Upload, Eye, ChevronDown } from 'lucide-react';

const FEATURES = [
    {
        icon: <Layers size={28} />,
        title: 'Step-by-Step Builder',
        desc: 'Choose from 70+ sculpture templates, bases & toppers — or upload your own designs with our guided wizard.',
    },
    {
        icon: <Sparkles size={28} />,
        title: 'AI-Powered Rendering',
        desc: 'Our AI instantly generates photorealistic ice sculpture previews from your selections and prompts.',
    },
    {
        icon: <Video size={28} />,
        title: '360° Video Creation',
        desc: 'Turn any generated render into a stunning rotating video to share with clients.',
    },
    {
        icon: <Upload size={28} />,
        title: 'Custom Uploads',
        desc: 'Upload logos, reference images, and custom designs — the AI incorporates them seamlessly.',
    },
    {
        icon: <MessageSquare size={28} />,
        title: 'Natural Chat Interface',
        desc: 'Describe what you want in plain English, attach images, and let the AI bring your vision to life.',
    },
    {
        icon: <Eye size={28} />,
        title: 'Instant Preview & Edit',
        desc: 'Preview, expand, edit, and rate your renders — iterate until it\'s perfect.',
    },
];

const LandingPage = () => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [featuresVisible, setFeaturesVisible] = useState(false);

    useEffect(() => {
        // Trigger hero entrance animation
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const onScroll = () => {
            const section = document.getElementById('lp-features');
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.8) setFeaturesVisible(true);
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleGetStarted = () => {
        // Mark as visited so tour can trigger
        const isFirstVisit = !localStorage.getItem('cynx_visited');
        if (isFirstVisit) {
            localStorage.setItem('cynx_show_tour', 'true');
        }
        localStorage.setItem('cynx_visited', 'true');
        navigate('/app');
    };

    const handleTakeTour = () => {
        localStorage.setItem('cynx_show_tour', 'true');
        localStorage.setItem('cynx_visited', 'true');
        navigate('/app');
    };

    return (
        <div className="lp-root">
            {/* ---- Floating particles background ---- */}
            <div className="lp-particles">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="lp-particle" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 8}s`,
                        animationDuration: `${6 + Math.random() * 8}s`,
                        width: `${3 + Math.random() * 6}px`,
                        height: `${3 + Math.random() * 6}px`,
                    }} />
                ))}
            </div>

            {/* ---- Nav bar ---- */}
            <nav className="lp-nav">
                <div className="lp-nav-brand">
                    <img src="/vite.svg" alt="CYNX" className="lp-nav-logo" />
                    <span className="lp-nav-name">CYNX</span>
                </div>
                <div className="lp-nav-actions">
                    <button className="lp-nav-tour-btn" onClick={handleTakeTour}>
                        <Eye size={16} />
                        Take a Tour
                    </button>
                    <button className="lp-nav-cta" onClick={handleGetStarted}>
                        Get Started
                    </button>
                </div>
            </nav>

            {/* ---- Hero Section ---- */}
            <section className={`lp-hero ${visible ? 'visible' : ''}`}>
                <div className="lp-hero-badge">
                    <Sparkles size={14} />
                    <span>AI-Powered Ice Sculpture Platform</span>
                </div>

                <h1 className="lp-hero-title">
                    Transform Ideas into<br />
                    <span className="lp-gradient-text">Stunning Ice Sculptures</span>
                </h1>

                <p className="lp-hero-subtitle">
                    Design, visualize, and preview custom ice sculptures in seconds.
                    Choose from our curated library or upload your own — our AI does the rest.
                </p>

                <div className="lp-hero-actions">
                    <button className="lp-cta-primary lp-pulse-btn" onClick={handleGetStarted}>
                        <Sparkles size={18} />
                        Start Building
                        <ArrowRight size={18} />
                    </button>
                    <button className="lp-cta-secondary" onClick={handleTakeTour}>
                        <Eye size={18} />
                        Watch Tutorial
                    </button>
                </div>

                <div className="lp-hero-stats">
                    <div className="lp-stat">
                        <span className="lp-stat-number">70+</span>
                        <span className="lp-stat-label">Templates</span>
                    </div>
                    <div className="lp-stat-divider" />
                    <div className="lp-stat">
                        <span className="lp-stat-number">7</span>
                        <span className="lp-stat-label">Steps to Create</span>
                    </div>
                    <div className="lp-stat-divider" />
                    <div className="lp-stat">
                        <span className="lp-stat-number">&lt;30s</span>
                        <span className="lp-stat-label">Render Time</span>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="lp-scroll-hint">
                    <ChevronDown size={22} />
                </div>
            </section>

            {/* ---- Features Section ---- */}
            <section id="lp-features" className={`lp-features ${featuresVisible ? 'visible' : ''}`}>
                <div className="lp-section-badge">
                    <span>How It Works</span>
                </div>
                <h2 className="lp-features-title">
                    Everything You Need to Create<br />
                    <span className="lp-gradient-text">Perfect Ice Sculptures</span>
                </h2>
                <p className="lp-features-subtitle">
                    From concept to photorealistic render in minutes — no design experience required.
                </p>

                <div className="lp-features-grid">
                    {FEATURES.map((f, i) => (
                        <div key={i} className="lp-feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="lp-feature-icon">{f.icon}</div>
                            <h3 className="lp-feature-title">{f.title}</h3>
                            <p className="lp-feature-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---- CTA Footer ---- */}
            <section className="lp-cta-section">
                <div className="lp-cta-glow" />
                <h2 className="lp-cta-title">Ready to Create Something Beautiful?</h2>
                <p className="lp-cta-subtitle">
                    Jump in and start building your first ice sculpture render — it only takes a few clicks.
                </p>
                <button className="lp-cta-primary lp-cta-big lp-pulse-btn" onClick={handleGetStarted}>
                    <Sparkles size={20} />
                    Launch the Builder
                    <ArrowRight size={20} />
                </button>
            </section>

            {/* ---- Footer ---- */}
            <footer className="lp-footer">
                <div className="lp-footer-brand">
                    <img src="/vite.svg" alt="CYNX" className="lp-footer-logo" />
                    <span>CYNX AI</span>
                </div>
                <p className="lp-footer-text">Powered by Ice Butcher &mdash; Crafting frozen artistry since day one.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
