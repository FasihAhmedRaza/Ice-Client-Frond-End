import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Snowflake, ChevronDown } from 'lucide-react';
import api from '../api';
import { API_BASE_URL } from '../config';

const FALLBACK_ANSWERS = {
    logo: "Yes, we can add custom logos to ice sculptures! We use a combination of CNC carving and hand-finishing techniques to embed logos, text, or branding into the ice with incredible detail. The logo can be either carved into the surface or frozen within the block for a stunning 3D effect. Just upload your logo in the sculpture builder and we'll handle the rest.",
    cost: "Ice sculpture pricing varies based on size, complexity, and design. A simple single-block sculpture typically starts around $300–$500, while more elaborate multi-block pieces or custom designs can range from $800 to several thousand dollars. We'd be happy to provide a detailed quote once we understand your vision — just use our sculpture builder to get started!",
    last: "Under ideal conditions (indoors, around 65–70°F), a standard ice sculpture will maintain its shape for approximately 4–6 hours. Larger sculptures and those displayed in cooler environments can last 8–12 hours or more. We also offer drip trays and LED lighting setups that enhance the display while managing the melting process elegantly.",
    type: "We offer a wide range of ice sculptures including luges (drink slides), ice bars, ice cubes with embedded logos, showpieces, wedding sculptures, and fully custom designs. Our gallery includes over 70 templates across categories like Luges, Ice Bars, Ice Cubes, Showpieces, and Wedding pieces. You can browse all of them in our sculpture builder!",
    size: "We offer sculptures in multiple sizes: Small (1–2 feet, great for table centerpieces), Medium (3–5 feet, perfect for buffet displays), Large (6–8+ feet, ideal as event focal points), and fully custom dimensions. The right size depends on your venue and event type — we're happy to recommend the best fit.",
    deliver: "Yes, we provide full delivery and setup services! Our team will transport the sculpture in a refrigerated vehicle and professionally set it up at your venue with drip trays, lighting, and any accessories needed. We typically arrive 1–2 hours before your event to ensure everything looks perfect.",
    event: "Ice sculptures are perfect for weddings, corporate events, galas, product launches, holiday parties, bar/bat mitzvahs, and trade shows. They serve as stunning centerpieces, functional drink luges, branded displays, or artistic showpieces. Whatever your event, a custom ice sculpture adds an unforgettable wow factor.",
    order: "We recommend placing your order at least 2–3 weeks in advance for standard designs, and 4–6 weeks for complex custom pieces. During peak seasons (holidays, wedding season), earlier booking is advisable. However, we can sometimes accommodate rush orders within 1 week depending on availability.",
    temperature: "For the best display longevity, keep the sculpture in an air-conditioned indoor space around 65–70°F, away from direct sunlight, heat sources, and strong air currents. Outdoors, a shaded area works best. We provide professional drip trays and can advise on the optimal placement for your specific venue.",
    lighting: "Absolutely! LED lighting dramatically enhances ice sculptures, creating beautiful color effects and illuminating the translucent ice from within. We offer built-in LED bases with customizable colors, spotlights, and even programmable color-changing setups to match your event theme or branding.",
    clear: "Clear ice is made through a specialized slow-freezing process that removes air bubbles, resulting in crystal-clear, glass-like ice that's ideal for detailed carvings and logo work. White or cloudy ice freezes faster and has a frosted, opaque look. We primarily use clear ice for our sculptures as it showcases details beautifully and lasts longer.",
    custom: "Yes, we specialize in custom designs! Whether it's a company logo, a portrait, an architectural model, or any creative concept, our artists can bring your vision to life in ice. Use our sculpture builder to describe your idea, upload reference images, and we'll generate a photorealistic preview of your custom sculpture.",
    wedding: "We create stunning wedding ice sculptures including elegant swans, intertwined hearts, monogram displays, champagne luges, and custom centerpieces. Many couples also love our ice bars for cocktail hour. Each piece is hand-crafted to complement your wedding theme and can incorporate your names, date, or monogram.",
};

const getFallbackAnswer = (userMsg) => {
    const msg = userMsg.toLowerCase();
    const keywords = [
        { keys: ['logo', 'brand', 'emblem', 'text on', 'name on'], answer: FALLBACK_ANSWERS.logo },
        { keys: ['cost', 'price', 'how much', 'expensive', 'afford', 'budget', 'pricing'], answer: FALLBACK_ANSWERS.cost },
        { keys: ['last', 'long', 'melt', 'duration', 'how many hours'], answer: FALLBACK_ANSWERS.last },
        { keys: ['type', 'kind', 'what do you offer', 'categories', 'options'], answer: FALLBACK_ANSWERS.type },
        { keys: ['size', 'dimension', 'big', 'small', 'tall', 'feet', 'large'], answer: FALLBACK_ANSWERS.size },
        { keys: ['deliver', 'shipping', 'transport', 'setup', 'install'], answer: FALLBACK_ANSWERS.deliver },
        { keys: ['event', 'party', 'occasion', 'celebration', 'function'], answer: FALLBACK_ANSWERS.event },
        { keys: ['order', 'advance', 'book', 'ahead', 'lead time', 'rush'], answer: FALLBACK_ANSWERS.order },
        { keys: ['temperature', 'temp', 'warm', 'cold', 'indoor', 'outdoor', 'display'], answer: FALLBACK_ANSWERS.temperature },
        { keys: ['light', 'led', 'glow', 'illuminat'], answer: FALLBACK_ANSWERS.lighting },
        { keys: ['clear', 'white', 'cloudy', 'transparent', 'opaque'], answer: FALLBACK_ANSWERS.clear },
        { keys: ['custom', 'unique', 'bespoke', 'personali', 'special design'], answer: FALLBACK_ANSWERS.custom },
        { keys: ['wedding', 'bride', 'groom', 'marriage', 'engagement'], answer: FALLBACK_ANSWERS.wedding },
    ];

    for (const { keys, answer } of keywords) {
        if (keys.some(k => msg.includes(k))) return answer;
    }

    // Generic fallback
    const genericAnswers = [
        "Great question! Ice sculptures are incredibly versatile — we work with everything from elegant wedding centerpieces to corporate branded luges and custom artistic showpieces. I'd recommend using our sculpture builder above to explore our full range of 70+ templates and see what inspires you. If you have something specific in mind, feel free to describe it!",
        "That's a wonderful thing to consider! At Ice Butcher, we combine traditional ice carving artistry with modern technology to create stunning pieces for any occasion. Our sculpture builder tool lets you preview exactly how your piece will look before we carve it. Would you like to know about our specific categories, pricing, or custom design options?",
        "I'd love to help with that! Our team has extensive experience creating ice sculptures for all sorts of events and purposes. For the best experience, try our step-by-step sculpture builder — it'll walk you through selecting a style, adding customizations like logos or bases, and generating a photorealistic preview. Is there something specific about ice sculpting you'd like to know more about?",
    ];
    return genericAnswers[Math.floor(Math.random() * genericAnswers.length)];
};

const IceChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm your Ice Sculpting Assistant. Ask me anything about ice sculptures, techniques, materials, or our services!"
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('user_input', userMsg);
            formData.append('aspect_ratio', '9:16');
            formData.append('resolution', '2K');
            formData.append('image_prompts', JSON.stringify({}));

            const response = await api.post(`${API_BASE_URL}/api/chatbot`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const reply = response.data.response || "I can help you with ice sculpting questions!";
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            refreshSuggestions();

            if (!isOpen) setHasUnread(true);
        } catch (error) {
            console.error('Chat widget error:', error);
            const fallback = getFallbackAnswer(userMsg);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: fallback
            }]);
            refreshSuggestions();
        } finally {
            setIsLoading(false);
        }
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

    const handleSendWithInput = async (text) => {
        if (!text.trim() || isLoading) return;

        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setInput('');
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('user_input', text);
            formData.append('aspect_ratio', '9:16');
            formData.append('resolution', '2K');
            formData.append('image_prompts', JSON.stringify({}));

            const response = await api.post(`${API_BASE_URL}/api/chatbot`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.response || "I can help you with ice sculpting questions!"
            }]);
            refreshSuggestions();
        } catch {
            const fallback = getFallbackAnswer(text);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: fallback
            }]);
            refreshSuggestions();
        } finally {
            setIsLoading(false);
        }
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
                            <div className="ice-chat-bubble">{msg.content}</div>
                        </div>
                    ))}

                    {/* Suggestion questions after every bot response */}
                    {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                        <div className="ice-chat-quick-questions">
                            {suggestions.map((q, i) => (
                                <button key={i} className="ice-chat-quick-btn" onClick={() => handleQuickQuestion(q)}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {isLoading && (
                        <div className="ice-chat-msg ice-chat-bot">
                            <div className="ice-chat-bot-avatar">
                                <Snowflake size={12} />
                            </div>
                            <div className="ice-chat-bubble ice-chat-typing">
                                <span></span><span></span><span></span>
                            </div>
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
                        disabled={!input.trim() || isLoading}
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
