import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown } from 'lucide-react';

const AspectRatioSelector = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const ratios = [
        { label: "1:1", width: 20, height: 20 },
        { label: "9:16", width: 14, height: 24 },
        { label: "16:9", width: 24, height: 14 },
        { label: "4:3", width: 24, height: 18 },
        { label: "3:4", width: 18, height: 24 },
        { label: "2:3", width: 16, height: 24 },
        { label: "3:2", width: 24, height: 16 },
        { label: "4:5", width: 19, height: 24 },
        { label: "5:4", width: 24, height: 19 },
        { label: "21:9", width: 28, height: 12 },
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
            const dropdownHeight = 300;

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

    const handleSelect = (ratioLabel) => {
        onChange(ratioLabel);
        setIsOpen(false);
    };

    const selectedRatio = ratios.find(r => r.label === value) || ratios[0];

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
                width: '140px',
                maxHeight: '250px',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-lg)'
            }}
        >
            {ratios.map((ratio) => (
                <div
                    key={ratio.label}
                    onClick={() => handleSelect(ratio.label)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        background: value === ratio.label ? 'var(--background-color)' : 'transparent',
                        transition: 'all var(--transition-fast)',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = value === ratio.label ? 'var(--background-color)' : 'transparent'}
                >
                    <div
                        style={{
                            width: '20px', // Reduced icon size
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <div
                            style={{
                                width: `${Math.max(ratio.width * 0.7, 1)}px`,
                                height: `${Math.max(ratio.height * 0.7, 1)}px`,
                                border: '1.5px solid var(--primary-color)',
                                borderRadius: '1px',
                                backgroundColor: value === ratio.label ? 'var(--accent-color)' : 'transparent',
                                opacity: value === ratio.label ? 1 : 0.6
                            }}
                        />
                    </div>
                    <span>{ratio.label}</span>
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
                    minWidth: '85px',
                    justifyContent: 'space-between',
                    transition: 'all var(--transition-fast)',
                    boxShadow: 'var(--shadow-sm)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                        style={{
                            width: `${Math.max(selectedRatio.width * 0.7, 1)}px`,
                            height: `${Math.max(selectedRatio.height * 0.7, 1)}px`,
                            border: '1.5px solid var(--primary-color)',
                            borderRadius: '1px',
                            backgroundColor: 'var(--accent-color)',
                            opacity: 0.8
                        }}
                    />
                    <span>{selectedRatio.label}</span>
                </div>
                <ChevronDown size={12} />
            </div>
            {isOpen && ReactDOM.createPortal(dropdownContent, document.body)}
        </>
    );
};

export default AspectRatioSelector;
