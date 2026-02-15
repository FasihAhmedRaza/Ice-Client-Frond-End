import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, Monitor } from 'lucide-react';

const ResolutionSelector = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const resolutions = [
        { label: "1K", desc: "Standard" },
        { label: "2K", desc: "High Def" },
        { label: "4K", desc: "Ultra HD" },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                triggerRef.current && !triggerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleScroll = (event) => {
            // Don't close if scrolling inside the dropdown
            if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
                return;
            }
            if (isOpen) setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = 150;

            if (spaceBelow < dropdownHeight) {
                setPosition({
                    top: rect.top - dropdownHeight - 5 + window.scrollY,
                    bottom: window.innerHeight - rect.top + 5,
                    left: rect.left + window.scrollX,
                    isUp: true
                });
            } else {
                setPosition({
                    top: rect.bottom + 5 + window.scrollY,
                    left: rect.left + window.scrollX,
                    isUp: false
                });
            }
        }
    }, [isOpen]);

    const handleSelect = (resLabel) => {
        onChange(resLabel);
        setIsOpen(false);
    };

    const dropdownContent = (
        <div
            ref={dropdownRef}
            className="selector-dropdown"
            style={{
                position: 'absolute',
                top: position.isUp ? 'auto' : position.top,
                bottom: position.isUp ? position.bottom : 'auto',
                left: position.left,
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '4px',
                zIndex: 9999,
                width: '120px',
                boxShadow: 'var(--shadow-lg)'
            }}
        >
            {resolutions.map((res) => (
                <div
                    key={res.label}
                    onClick={() => handleSelect(res.label)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        background: value === res.label ? 'var(--background-color)' : 'transparent',
                        transition: 'all var(--transition-fast)',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = value === res.label ? 'var(--background-color)' : 'transparent'}
                >
                    <span>{res.label}</span>
                    {/* Removed description for compactness */}
                </div>
            ))}
        </div>
    );

    return (
        <>
            <div
                ref={triggerRef}
                className="selector-trigger"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    background: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    minWidth: '75px',
                    justifyContent: 'space-between',
                    transition: 'all var(--transition-fast)',
                    boxShadow: 'var(--shadow-sm)',
                    marginLeft: '8px'
                }}
                title="Resolution"
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Monitor size={12} />
                    <span>{value}</span>
                </div>
                <ChevronDown size={12} />
            </div>
            {isOpen && ReactDOM.createPortal(dropdownContent, document.body)}
        </>
    );
};

export default ResolutionSelector;
