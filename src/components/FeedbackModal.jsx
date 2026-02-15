import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const FeedbackModal = ({ isOpen, onClose, imageUrl }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await axios.post(`${API_BASE_URL}/api/submit_feedback`, {
                image_url: imageUrl,
                rating,
                comment
            });
            alert('Thank you for your feedback!');
            onClose();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback.');
        } finally {
            setIsSubmitting(false);
            setRating(0);
            setComment('');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Rate this Generation</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className={`star-btn ${rating >= star ? 'active' : ''}`}
                            onClick={() => setRating(star)}
                        >
                            <Star size={32} fill={rating >= star ? 'currentColor' : 'none'} />
                        </button>
                    ))}
                </div>

                <textarea
                    className="feedback-textarea"
                    placeholder="Tell us what you think..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <button
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={isSubmitting || rating === 0}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </div>
        </div>
    );
};

export default FeedbackModal;
