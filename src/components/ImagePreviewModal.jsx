import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Edit2, Check, RotateCcw } from 'lucide-react';

const ImagePreviewModal = ({ isOpen, onClose, imageUrl, onConfirmEdit }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    const [isDrawingAction, setIsDrawingAction] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!isOpen) {
            setIsDrawing(false);
            setIsDrawingAction(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isDrawing && canvasRef.current && imageRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = imageRef.current;

            // Set canvas size to match image display size
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            // Draw initial image
            ctx.drawImage(img, 0, 0);

            // Setup drawing style
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, [isDrawing]);

    if (!isOpen || !imageUrl) return null;

    // Check if it's a video
    const isVideo = imageUrl.toLowerCase().endsWith('.mp4');

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.target = '_blank';
        link.download = `ice-sculpture-${Date.now()}.${isVideo ? 'mp4' : 'png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const startDrawing = (e) => {
        if (!isDrawing) return;
        setIsDrawingAction(true);

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        lastPos.current = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const draw = (e) => {
        if (!isDrawingAction || !isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const currentX = (e.clientX - rect.left) * scaleX;
        const currentY = (e.clientY - rect.top) * scaleY;

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        lastPos.current = { x: currentX, y: currentY };
    };

    const stopDrawing = () => {
        setIsDrawingAction(false);
    };

    const handleConfirm = () => {
        if (canvasRef.current) {
            canvasRef.current.toBlob((blob) => {
                const file = new File([blob], `edited-sculpture-${Date.now()}.png`, { type: 'image/png' });
                onConfirmEdit(file);
                setIsDrawing(false);
            }, 'image/png');
        }
    };

    return (
        <div className="modal-overlay lightbox-overlay" onClick={onClose}>
            <button className="lightbox-close-btn" onClick={onClose}>
                <X size={32} />
            </button>

            <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                <div className="lightbox-image-container" style={{ cursor: isDrawing ? 'crosshair' : 'default' }}>
                    {isVideo ? (
                        <video
                            src={imageUrl}
                            controls
                            autoPlay
                            className="lightbox-image"
                            style={{ maxHeight: '75vh', maxWidth: '100%' }}
                        />
                    ) : (
                        <>
                            <img
                                ref={imageRef}
                                src={imageUrl}
                                alt="Full Preview"
                                className="lightbox-image"
                                style={{ display: isDrawing ? 'none' : 'block' }}
                                crossOrigin="anonymous"
                            />
                            <canvas
                                ref={canvasRef}
                                className="lightbox-image"
                                style={{ display: isDrawing ? 'block' : 'none', maxWidth: '100%', maxHeight: '75vh' }}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                            />
                        </>
                    )}
                </div>

                <div className="lightbox-controls">
                    {!isDrawing ? (
                        <>
                            <button className="control-btn" onClick={handleDownload}>
                                <Download size={20} />
                                <span>Download</span>
                            </button>
                            {!isVideo && (
                                <button className="control-btn secondary" onClick={() => setIsDrawing(true)}>
                                    <Edit2 size={20} />
                                    <span>Edit / Draw</span>
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button className="control-btn" onClick={handleConfirm} style={{ color: 'var(--success-color)' }}>
                                <Check size={20} />
                                <span>Confirm</span>
                            </button>
                            <button className="control-btn secondary" onClick={() => setIsDrawing(false)}>
                                <RotateCcw size={20} />
                                <span>Cancel</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImagePreviewModal;

