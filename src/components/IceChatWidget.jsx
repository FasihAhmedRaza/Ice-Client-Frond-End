import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Snowflake, ChevronDown } from 'lucide-react';

// Short, direct, human-style answers
const QA = [
    { keys: ['how much', 'cost', 'price', 'pricing', 'expensive', 'budget', 'quote'], answer: "Prices start around $300–$500 for simple pieces, and go up from there based on size and complexity. Contact us for a custom quote!" },
    { keys: ['how long', 'last', 'melt', 'hours', 'duration'], answer: "Indoors at 65–70°F, about 4–6 hours. Larger sculptures or cooler rooms can last 8–12+ hours." },
    { keys: ['logo', 'brand', 'emblem', 'branding'], answer: "Yes! We embed logos into ice — carved, colored, or as a paper card on the surface. Just upload your logo in the builder." },
    { keys: ['deliver', 'shipping', 'transport', 'setup'], answer: "Yes, we deliver and set up at your venue with drip trays and lighting, usually 1–2 hours before your event." },
    { keys: ['how far', 'advance', 'book', 'lead time', 'rush', 'order'], answer: "2–3 weeks for standard designs, 4–6 weeks for custom. Rush orders may be possible — just ask!" },
    { keys: ['what type', 'what kind', 'what do you', 'categories', 'options', 'offer'], answer: "We do luges, ice bars, showpieces, wedding pieces, ice cubes with logos, and fully custom designs — 70+ templates available." },
    { keys: ['size', 'dimension', 'how big', 'how tall', 'feet'], answer: "Small (1–2 ft), Medium (3–5 ft), Large (6–8+ ft). Custom sizes available too." },
    { keys: ['light', 'led', 'glow', 'illuminat'], answer: "Absolutely! We offer LED bases with color options to make your sculpture glow beautifully." },
    { keys: ['clear', 'cloudy', 'transparent', 'white ice', 'opaque'], answer: "Clear ice is crystal-like and shows detail best. Cloudy ice is faster to make but less refined. We use clear ice for all our sculptures." },
    { keys: ['custom', 'unique', 'bespoke', 'special design', 'personali'], answer: "100%! We do fully custom sculptures from any idea or reference image. Use the builder above to get started." },
    { keys: ['wedding', 'bride', 'groom', 'marriage', 'engagement'], answer: "We love weddings! Swans, hearts, monograms, champagne luges, ice bars — all hand-crafted to match your theme." },
    { keys: ['event', 'party', 'corporate', 'gala', 'birthday', 'celebration'], answer: "We do weddings, corporate events, galas, holiday parties, trade shows, birthdays — any occasion!" },
    { keys: ['temperature', 'temp', 'warm', 'indoor', 'outdoor', 'display'], answer: "Best indoors at 65–70°F, away from direct sunlight. We provide drip trays and placement advice." },
    { keys: ['luge', 'drink', 'slide', 'shot'], answer: "Luges are ice sculptures with channels to slide drinks through — a crowd favorite! We have martini, tube, double, and custom luge styles." },
    { keys: ['hello', 'hi', 'hey', 'howdy'], answer: "Hey! 👋 What can I help you with today?" },
    { keys: ['thank', 'thanks', 'thx'], answer: "You're welcome! Anything else I can help with?" },
];

function getAnswer(userMsg) {
    const msg = userMsg.toLowerCase();

    for (const { keys, answer } of QA) {
        if (keys.some(k => msg.includes(k))) {
            return answer;
        }
    }

    return "Not sure about that one! Try asking about pricing, delivery, sizing, or our sculpture types.";
}

const IceChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm your Ice Sculpting Assistant. Ask me anything about ice sculptures, techniques, materials, or our services!"
        }
    ]);
    const [input, setInput] = useState('');
    const [hasUnread, setHasUnread] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setInput('');
        handleSendWithInput(userMsg);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleOpen = () => {
        setIsOpen(prev => !prev);
        setHasUnread(false);
    };

    const allSuggestions = [
        "What types of ice sculptures do you offer?",
        "How long does an ice sculpture last?",
        "Can you add logos to ice?",
        "What sizes are available?",
        "How much does an ice sculpture cost?",
        "Can you do custom designs?",
        "What events are ice sculptures good for?",
        "How far in advance should I order?",
        "Do you deliver ice sculptures?",
        "What's the best temperature for display?",
        "Can I add lighting to the sculpture?",
        "What's the difference between clear and white ice?",
    ];

    // Pick 4 random suggestions, different each time
    const [suggestions, setSuggestions] = useState(allSuggestions.slice(0, 4));

    const refreshSuggestions = () => {
        const shuffled = [...allSuggestions].sort(() => Math.random() - 0.5);
        setSuggestions(shuffled.slice(0, 4));
    };

    const handleQuickQuestion = (q) => {
        refreshSuggestions();
        handleSendWithInput(q);
    };

    const handleSendWithInput = (text) => {
        if (!text.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content: text }]);

        // Answer instantly from local knowledge — no API call needed
        const replyText = getAnswer(text);
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: replyText
        }]);
        refreshSuggestions();
        if (!isOpen) setHasUnread(true);
    };

    return (
        <>
            {/* Floating Chat Window */}
            <div className={`ice-chat-widget ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="ice-chat-header" onClick={toggleOpen}>
                    <div className="ice-chat-header-left">
                        <div className="ice-chat-header-avatar">
                            <Snowflake size={18} />
                        </div>
                        <div>
                            <div className="ice-chat-header-title">Ice Assistant</div>
                            <div className="ice-chat-header-status">
                                <span className="ice-chat-status-dot"></span>
                                Online
                            </div>
                        </div>
                    </div>
                    <button className="ice-chat-close" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                        <ChevronDown size={18} />
                    </button>
                </div>

                {/* Messages */}
                <div className="ice-chat-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`ice-chat-msg ${msg.role === 'user' ? 'ice-chat-user' : 'ice-chat-bot'}`}>
                            {msg.role === 'assistant' && (
                                <div className="ice-chat-bot-avatar">
                                    <Snowflake size={12} />
                                </div>
                            )}
                            <div className="ice-chat-bubble">
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {/* Suggestion questions after every bot response */}
                    {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                        <div className="ice-chat-quick-questions">
                            {suggestions.map((q, i) => (
                                <button key={i} className="ice-chat-quick-btn" onClick={() => handleQuickQuestion(q)}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="ice-chat-input-area">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about ice sculptures..."
                        className="ice-chat-input"
                    />
                    <button
                        className="ice-chat-send"
                        onClick={handleSend}
                        disabled={!input.trim()}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

            {/* Floating Toggle Button */}
            <button className={`ice-chat-fab ${isOpen ? 'hidden' : ''}`} onClick={toggleOpen}>
                <MessageCircle size={24} />
                {hasUnread && <span className="ice-chat-unread"></span>}
            </button>
        </>
    );
};

export default IceChatWidget;
