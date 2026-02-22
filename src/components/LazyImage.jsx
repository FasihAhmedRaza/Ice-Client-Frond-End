import React, { useState } from 'react';
import brandLogo from '../assets/react.svg';

/**
 * LazyImage — shows the Cynx brand logo + spinner while any remote image loads.
 * Fades in the real image once ready. Works as a drop-in <img> replacement.
 *
 * Extra props:
 *   wrapStyle      — style for the outer wrapper div
 *   wrapClassName  — className for the outer wrapper div
 *   placeholderH   — min-height of placeholder while loading (default '120px')
 */
const LazyImage = ({
    src,
    alt,
    className,
    style,
    onClick,
    wrapStyle,
    wrapClassName,
    placeholderH = '120px',
    ...rest
}) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            className={wrapClassName}
            style={{
                position: 'relative',
                display: 'block',
                width: '100%',
                minHeight: loaded ? undefined : placeholderH,
                background: loaded ? 'transparent' : 'var(--surface-alt, #1e293b)',
                borderRadius: style?.borderRadius || 'inherit',
                overflow: 'hidden',
                ...wrapStyle,
            }}
        >
            <style>{`
                @keyframes lz-spin  { to { transform: rotate(360deg); } }
                @keyframes lz-pulse { 0%,100%{ opacity:.3; } 50%{ opacity:.75; } }
            `}</style>

            {/* Placeholder — visible only while loading */}
            {!loaded && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem',
                    pointerEvents: 'none',
                }}>
                    <img
                        src={brandLogo}
                        alt=""
                        style={{
                            width: '36px', height: '36px',
                            objectFit: 'contain',
                            opacity: 0.3,
                            animation: 'lz-pulse 1.6s ease-in-out infinite',
                        }}
                    />
                    <div style={{
                        width: '18px', height: '18px',
                        border: '2px solid transparent',
                        borderTop: '2px solid #52caef',
                        borderRadius: '50%',
                        animation: 'lz-spin 0.75s linear infinite',
                    }} />
                </div>
            )}

            {/* Real image — hidden until loaded, then fades in */}
            <img
                src={src}
                alt={alt}
                className={className}
                onClick={onClick}
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(true)}
                style={{
                    ...style,
                    display: 'block',
                    width: style?.width || '100%',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                }}
                {...rest}
            />
        </div>
    );
};

export default LazyImage;
