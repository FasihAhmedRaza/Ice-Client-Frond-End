import React, { useState, useMemo } from 'react';
import { X, Search, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import sculptureData from '../assets/images2.json';
import './TemplateGalleryModal.css';

const ALL_ITEMS = sculptureData?.standardSculptures || [];
const PAGE_SIZE = 32;
const CATEGORIES = ['All', 'Luges', 'Seafood & Displays', 'Showpieces', 'Bars', 'Wedding', 'Other'];

function getCategory(name) {
    const n = name.toLowerCase();
    if (/\bluge\b/.test(n)) return 'Luges';
    if (/\b(seafood|caviar|clam)\b/.test(n) || /\bdisplay\b/.test(n)) return 'Seafood & Displays';
    if (/\bshowpiece\b/.test(n)) return 'Showpieces';
    if (/\bbar\b/.test(n)) return 'Bars';
    if (/mr & mrs|wedding|bride/.test(n)) return 'Wedding';
    return 'Other';
}

const TAGGED_ITEMS = ALL_ITEMS.map(item => ({ ...item, category: getCategory(item.name) }));

const CATEGORY_COUNTS = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'All' ? ALL_ITEMS.length : TAGGED_ITEMS.filter(i => i.category === cat).length;
    return acc;
}, {});

const TemplateGalleryModal = ({ isOpen, onClose }) => {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        let items = TAGGED_ITEMS;
        if (activeCategory !== 'All') items = items.filter(i => i.category === activeCategory);
        if (search.trim()) {
            const q = search.toLowerCase();
            items = items.filter(i => i.name.toLowerCase().includes(q));
        }
        return items;
    }, [search, activeCategory]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleCategory = (cat) => {
        setActiveCategory(cat);
        setPage(1);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    if (!isOpen) return null;

    return (
        <div className="tg-overlay" onClick={onClose}>
            <div className="tg-modal" onClick={e => e.stopPropagation()}>
                <div className="tg-header">
                    <div className="tg-header-top">
                        <div className="tg-title">
                            <LayoutGrid size={20} />
                            <span>Template Gallery</span>
                            <span className="tg-count">{filtered.length.toLocaleString()} templates</span>
                        </div>
                        <button className="tg-close" onClick={onClose}><X size={22} /></button>
                    </div>
                    <div className="tg-search-wrap">
                        <Search size={15} />
                        <input
                            placeholder="Search templates..."
                            value={search}
                            onChange={handleSearch}
                            autoFocus
                        />
                    </div>
                    <div className="tg-cats">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`tg-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => handleCategory(cat)}
                            >
                                {cat}
                                <span className="tg-cat-count">{CATEGORY_COUNTS[cat].toLocaleString()}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="tg-body">
                    {paged.length === 0 ? (
                        <div className="tg-empty">No templates found</div>
                    ) : (
                        <div className="tg-grid">
                            {paged.map((item, i) => (
                                <div key={i} className="tg-item">
                                    <div className="tg-img-wrap">
                                        <img
                                            src={item.link}
                                            alt={item.name}
                                            loading="lazy"
                                            onError={e => { e.target.parentNode.parentNode.style.display = 'none'; }}
                                        />
                                    </div>
                                    <div className="tg-item-footer">
                                        <span className="tg-item-name">{item.name}</span>
                                        <span className="tg-item-cat">{item.category}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="tg-pagination">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                            <ChevronLeft size={16} />
                        </button>
                        <span>{page} of {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateGalleryModal;
