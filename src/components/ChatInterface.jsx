import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import api from '../api';
import { Send, Mic, Image as ImageIcon, X, ThumbsUp, ThumbsDown, Lightbulb, Wand2, Sun, Moon, Menu, Settings, ChevronDown, ChevronRight, ChevronLeft, Check, Sparkles, Video, Edit2, Upload, Trash2, ArrowRight, ArrowLeft, Layers, Paintbrush, RotateCcw, Gem, Zap, Eye, Clock, Download, Maximize2, Type, ImagePlus, Hammer, Heart, LayoutGrid, Search } from 'lucide-react';
import LazyImage from './LazyImage';
import FeedbackModal from './FeedbackModal';
import ImagePreviewModal from './ImagePreviewModal';
import GuidedTour from './GuidedTour';
import IceChatWidget from './IceChatWidget';
import ShowcaseGallery from './ShowcaseGallery';
import TemplateGalleryModal from './TemplateGalleryModal';
import './ShowcaseGallery.css';
import AspectRatioSelector from './AspectRatioSelector';
import ResolutionSelector from './ResolutionSelector';
import { API_BASE_URL } from '../config';
import userImage from '../assets/static/user.png';
import sidebarImages from '../assets/sidebar_images.json';
import allTemplates from '../assets/images2.json';

const INITIAL_PANEL = {
    selectedSculpture: null,   // { name, image, type } or null
    customSculptureFile: null,
    selectedBase: null,        // { name, image, type } or null
    customBaseFile: null,
    selectedTopper: null,      // { name, image, type } or null
    customTopperFile: null,
    logoFile: null,
    referenceFiles: [],
    referenceNotes: '',
    background: 'studio',
    additionalPrompt: '',
};

const STEPS_CUSTOM = [
    { id: 'mode', label: 'Mode', icon: '1' },
    { id: 'sculpture', label: 'Sculpture', icon: '2' },
    { id: 'extras', label: 'Extras', icon: '3' },
    { id: 'refs', label: 'References', icon: '4' },
    { id: 'details', label: 'Details', icon: '5' },
    { id: 'review', label: 'Review', icon: '6' },
];

const STEPS_TEXT = [
    { id: 'mode', label: 'Mode', icon: '1' },
    { id: 'describe', label: 'Describe', icon: '2' },
    { id: 'details', label: 'Details', icon: '3' },
    { id: 'review', label: 'Review', icon: '4' },
];

const STEPS_IMAGE = [
    { id: 'mode', label: 'Mode', icon: '1' },
    { id: 'upload', label: 'Upload', icon: '2' },
    { id: 'describe', label: 'Describe', icon: '3' },
    { id: 'details', label: 'Details', icon: '4' },
    { id: 'review', label: 'Review', icon: '5' },
];

const STEPS_VIDEO = [
    { id: 'mode', label: 'Mode', icon: '1' },
    { id: 'source', label: 'Source', icon: '2' },
    { id: 'review', label: 'Review', icon: '3' },
];

const STEPS_EDIT = [
    { id: 'mode', label: 'Mode', icon: '1' },
    { id: 'upload', label: 'Upload', icon: '2' },
    { id: 'edits', label: 'Edits', icon: '3' },
    { id: 'review', label: 'Review', icon: '4' },
];

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTemplateLoading, setIsTemplateLoading] = useState(false);
    const [aspectRatio, setAspectRatio] = useState('9:16');
    const [resolution, setResolution] = useState('2K');
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentIceCube, setCurrentIceCube] = useState(null);

    const [panel, setPanel] = useState(INITIAL_PANEL);
    const [wizardOpen, setWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(0);
    const [sculptureCategory, setSculptureCategory] = useState('');
    const [wantBase, setWantBase] = useState(false);
    const [wantTopper, setWantTopper] = useState(false);
    const [wantLogo, setWantLogo] = useState(false);
    const [lugeLogoOption, setLugeLogoOption] = useState(null); // 'top' | 'addon' | 'both'
    const [lugeFinish, setLugeFinish] = useState(null); // 'snowfilled' | 'color' | 'paper' | 'paper-snowfilled'
    const [wantFrontPiece, setWantFrontPiece] = useState(false);
    const [lugeFrontPieceDesc, setLugeFrontPieceDesc] = useState('');
    const [threeDLogoStyle, setThreeDLogoStyle] = useState(null); // 'paper' | 'snowfilled'
    const [standardLogoShape, setStandardLogoShape] = useState(null); // 'round' | 'square' | 'shape' | 'none'
    const [standardTextOption, setStandardTextOption] = useState(null); // 'names' | 'images' | 'both' | 'none'
    const [standardText, setStandardText] = useState('');
    const [lugeTopperOption, setLugeTopperOption] = useState(null); // 'round' | 'crown' | 'custom'
    const [lugeTopperFile, setLugeTopperFile] = useState(null);
    const [lugeAddonLogoShape, setLugeAddonLogoShape] = useState(null); // 'square' | 'round' | 'custom'
    const [theme, setTheme] = useState(() => localStorage.getItem('cynx_theme') || 'light');

    const [wizardGalleryOpen, setWizardGalleryOpen] = useState(false);
    const [wizardGallerySearch, setWizardGallerySearch] = useState('');
    const [wizardGalleryPage, setWizardGalleryPage] = useState(1);
    const [wizardGalleryCategory, setWizardGalleryCategory] = useState('All');
    const [sculptureSelectedFrom, setSculptureSelectedFrom] = useState(null); // 'main' | 'gallery'

    const [buildMode, setBuildMode] = useState(''); // 'text-to-image', 'image-to-image', 'custom-build'
    const [textPrompt, setTextPrompt] = useState('');
    const [imgToImgFiles, setImgToImgFiles] = useState([]);
    const [videoSourceType, setVideoSourceType] = useState('text');
    const [videoPrompt, setVideoPrompt] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const [editPrompt, setEditPrompt] = useState('');
    const videoFileInputRef = useRef(null);
    const editFileInputRef = useRef(null);
    const [imgToImgPrompt, setImgToImgPrompt] = useState('');
    const imgToImgInputRef = useRef(null);
    const [imagePrompts, setImagePrompts] = useState({});
    const [activeTaskIds, setActiveTaskIds] = useState([]);
    const [showTour, setShowTour] = useState(false);

    const [historyOpen, setHistoryOpen] = useState(true);
    const [showcaseOpen, setShowcaseOpen] = useState(false);
    const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
    const [generatedHistory, setGeneratedHistory] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('cynx_image_history') || '[]');
        } catch { return []; }
    });

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Auto-start tour on first visit
    useEffect(() => {
        const hasVisited = localStorage.getItem('cynx_visited');
        if (!hasVisited) {
            localStorage.setItem('cynx_visited', 'true');
            const t = setTimeout(() => setShowTour(true), 1000);
            return () => clearTimeout(t);
        }
        const shouldTour = localStorage.getItem('cynx_show_tour');
        if (shouldTour === 'true') {
            const t = setTimeout(() => setShowTour(true), 800);
            return () => clearTimeout(t);
        }
    }, []);

    // Apply theme to <html> and persist preference
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('cynx_theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

    const handleStartTour = () => {
        setShowTour(true);
    };
    const fileInputRef = useRef(null);
    const logoInputRef = useRef(null);
    const referenceInputRef = useRef(null);
    const customSculptureInputRef = useRef(null);
    const customBaseInputRef = useRef(null);
    const customTopperInputRef = useRef(null);
    const lugeTopperInputRef = useRef(null);
    const filesRef = useRef([]);

    // Build category item lists from sidebarImages JSON
    const sculptureCategoryMap = [
        { label: 'Luges',              key: 'Luges' },
        { label: '3D Showpiece',        key: '3D Showpiece' },
        { label: 'Standard Showpiece',  key: 'Standard Showpiece' },
        { label: 'Seafood Display',     key: 'Seafood Display' },
        { label: 'Ice Bar',             key: 'Ice Bars' },
        { label: 'Ice Cube',            key: 'Ice Cubes' },
    ];
    const SEAFOOD_KEYWORDS = ['crab', 'lobster', 'shrimp', 'mahi', 'dolphin', 'whale', 'shark', 'penguin', 'fish', 'octopus', 'clam', 'oyster', 'seafood', 'salmon'];
    const categoryItems = useMemo(() => {
        const sculpturesByCategory = {
            'Luges': [], '3D Showpiece': [], 'Standard Showpiece': [],
            'Seafood Display': [], 'Ice Bars': [], 'Ice Cubes': [],
        };
        const bases = [];
        const toppers = [];
        sidebarImages.forEach(item => {
            const entry = { type: item.label, name: item.label, image: item.url, category: item.category };
            if (item.category === 'Luges') {
                sculpturesByCategory['Luges'].push(entry);
            } else if (item.category === 'Ice Bars') {
                sculpturesByCategory['Ice Bars'].push(entry);
            } else if (item.category === 'Ice Cubes') {
                sculpturesByCategory['Ice Cubes'].push(entry);
            } else if (item.category === 'Sculptures' || item.category === 'Wedding Showpieces') {
                sculpturesByCategory['3D Showpiece'].push(entry);
                if (SEAFOOD_KEYWORDS.some(k => item.label.toLowerCase().includes(k))) {
                    sculpturesByCategory['Seafood Display'].push(entry);
                }
            } else if (item.category === 'Bases') {
                bases.push(entry);
            } else if (item.category === 'Toppers') {
                toppers.push(entry);
            }
        });
        return { sculpturesByCategory, bases, toppers };
    }, []);

    useEffect(() => {
        filesRef.current = files;
    }, [files]);

    // Polling for video status
    useEffect(() => {
        if (activeTaskIds.length === 0) return;

        const pollInterval = setInterval(async () => {
            for (const taskId of activeTaskIds) {
                try {
                    const response = await api.get(`${API_BASE_URL}/api/get_video_status/${taskId}`);
                    const data = response.data.data;

                    if (data && data.task_status === 'succeed') {
                        const videoUrl = data.task_result?.videos?.[0]?.url;
                        if (videoUrl) {
                            setMessages(prev => prev.map(msg =>
                                msg.taskId === taskId
                                    ? { ...msg, isLoadingVideo: false, videoUrl: videoUrl, content: "Here is your generated video:" }
                                    : msg
                            ));
                            setActiveTaskIds(prev => prev.filter(id => id !== taskId));
                        }
                    } else if (data && data.task_status === 'failed') {
                        setMessages(prev => prev.map(msg =>
                            msg.taskId === taskId
                                ? { ...msg, isLoadingVideo: false, content: `❌ Video generation failed: ${data.task_status_msg}` }
                                : msg
                        ));
                        setActiveTaskIds(prev => prev.filter(id => id !== taskId));
                    }
                } catch (error) {
                    console.error(`Error polling for task ${taskId}:`, error);
                }
            }
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [activeTaskIds]);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            requestAnimationFrame(() => {
                messagesContainerRef.current.scrollTo({
                    top: messagesContainerRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            if (currentIceCube) {
                // In ice cube mode, we need 2 files: 1 template (already there) + 1 logo (uploaded)
                if (files.length > 0) {
                    setFiles([files[0], selectedFiles[0]]);
                    setImagePrompts(prev => ({ ...prev, 1: "" }));
                } else {
                    setFiles(selectedFiles.slice(0, 2));
                    setImagePrompts({ 0: "", 1: "" });
                }
            } else {
                // Normal mode: max 3 total
                const totalFiles = files.length + selectedFiles.length;
                if (totalFiles > 3) {
                    alert("You can only select up to 3 images.");
                    const remainingSlots = 3 - files.length;
                    if (remainingSlots > 0) {
                        const newFilesToAdd = selectedFiles.slice(0, remainingSlots);
                        setFiles(prev => {
                            const updatedFiles = [...prev, ...newFilesToAdd];
                            const newPrompts = { ...imagePrompts };
                            newFilesToAdd.forEach((_, idx) => {
                                newPrompts[prev.length + idx] = "";
                            });
                            setImagePrompts(newPrompts);
                            return updatedFiles;
                        });
                    }
                } else {
                    setFiles(prev => {
                        const updatedFiles = [...prev, ...selectedFiles];
                        const newPrompts = { ...imagePrompts };
                        selectedFiles.forEach((_, idx) => {
                            newPrompts[prev.length + idx] = "";
                        });
                        setImagePrompts(newPrompts);
                        return updatedFiles;
                    });
                }
            }
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
        const newPrompts = {};
        let newIndex = 0;
        Object.keys(imagePrompts).sort().forEach(key => {
            const keyInt = parseInt(key);
            if (keyInt !== index) {
                newPrompts[newIndex] = imagePrompts[keyInt];
                newIndex++;
            }
        });
        setImagePrompts(newPrompts);
    };

    const handleImagePromptChange = (index, text) => {
        setImagePrompts(prev => ({
            ...prev,
            [index]: text
        }));
    };

    const handleSubmit = async (e, overrides = {}) => {
        e?.preventDefault();
        const finalInput = overrides.input ?? input;
        const finalFiles = overrides.files ?? files;
        const finalImagePrompts = overrides.imagePrompts ?? imagePrompts;
        const finalAspectRatio = overrides.aspectRatio ?? aspectRatio;
        const finalResolution = overrides.resolution ?? resolution;

        if (!finalInput.trim() && finalFiles.length === 0) return;

        const userMessage = {
            role: 'user',
            content: finalInput,
            images: finalFiles.map(f => URL.createObjectURL(f))
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = finalInput;
        setInput('');
        setFiles([]);
        setImagePrompts({});
        setCurrentIceCube(null);
        setIsLoading(true);

        const formData = new FormData();
        formData.append('user_input', currentInput);
        formData.append('aspect_ratio', finalAspectRatio);
        formData.append('resolution', finalResolution);
        formData.append('image_prompts', JSON.stringify(finalImagePrompts));
        if (panel.selectedSculpture?.name) {
            formData.append('template_name', panel.selectedSculpture.name);
        }
        // Send ice cube type so backend uses correct ice cube prompt
        if (sculptureCategory === 'Ice Cubes' && panel.selectedSculpture?.name) {
            formData.append('ice_cube_type', panel.selectedSculpture.name);
        }

        finalFiles.forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await api.post(`${API_BASE_URL}/api/chatbot`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const botMessage = {
                role: 'assistant',
                content: response.data.response || "Here is your generated image:",
                image: response.data.image_url
            };

            // Save to history if there's a generated image
            if (response.data.image_url) {
                const historyEntry = {
                    id: Date.now(),
                    image: response.data.image_url,
                    prompt: currentInput.substring(0, 100),
                    timestamp: new Date().toISOString(),
                };
                setGeneratedHistory(prev => {
                    const updated = [historyEntry, ...prev];
                    localStorage.setItem('cynx_image_history', JSON.stringify(updated.slice(0, 50)));
                    return updated;
                });
            }

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, something went wrong. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickPrompt = (prompt) => {
        setInput(prompt);
    };

    const openPreview = (imageUrl) => {
        const fullUrl = imageUrl.startsWith('/static') ? `${API_BASE_URL}${imageUrl}` : imageUrl;
        setSelectedImage(fullUrl);
        setPreviewModalOpen(true);
    };

    const openFeedback = (imageUrl) => {
        const fullUrl = imageUrl.startsWith('/static') ? `${API_BASE_URL}${imageUrl}` : imageUrl;
        setSelectedImage(fullUrl);
        setFeedbackModalOpen(true);
    };

    const handleEditConfirm = (file) => {
        setFiles(prev => [...prev, file]);
        setPreviewModalOpen(false);
        fileInputRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSelectImage = async (imageUrl) => {
        try {
            const fullUrl = imageUrl.startsWith('/static') ? `${API_BASE_URL}${imageUrl}` : imageUrl;
            const response = await fetch(fullUrl);
            const blob = await response.blob();
            const filename = `selected-image-${Date.now()}.png`;
            const file = new File([blob], filename, { type: blob.type });

            setFiles(prev => {
                if (prev.length >= 3) {
                    alert("You can only select up to 3 images.");
                    return prev;
                }
                const newFiles = [...prev, file];
                setImagePrompts(prevPrompts => ({
                    ...prevPrompts,
                    [newFiles.length - 1]: ""
                }));
                return newFiles;
            });
        } catch (error) {
            console.error("Error selecting image:", error);
            alert("Failed to select image. Please try again.");
        }
    };

    const [isListening, setIsListening] = useState(false);

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Voice input is not supported in this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    // const handleCreateVideo = async (imageUrl) => {
    //     try {
    //         setIsLoading(true);

    //         const response = await api.post(`${API_BASE_URL}/api/create_video`, {
    //             image_url: imageUrl
    //         });

    //         console.log("Video generation started:", response.data);

    //         if (response.data.data && response.data.data.task_id) {
    //             const taskId = response.data.data.task_id;
    //             setMessages(prev => [...prev, {
    //                 role: 'assistant',
    //                 taskId: taskId,
    //                 isLoadingVideo: true,
    //                 content: `🎥 Video generation started! Please wait while we generate your video...`
    //             }]);
    //             setActiveTaskIds(prev => [...prev, taskId]);
    //         } else {
    //             setMessages(prev => [...prev, {
    //                 role: 'assistant',
    //                 content: "Video generation request sent successfully, but no Task ID was returned."
    //             }]);
    //         }

    //     } catch (error) {
    //         console.error("Error creating video:", error);
    //         const errorMessage = error.response?.data?.error || "Failed to start video generation.";
    //         setMessages(prev => [...prev, {
    //             role: 'assistant',
    //             content: `❌ Error creating video: ${errorMessage}`
    //         }]);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    /* --- Right panel helpers --- */
    const updatePanel = (field, value) => {
        setPanel(prev => ({ ...prev, [field]: value }));
    };

    const handlePanelLogoChange = (e) => {
        const file = e.target.files?.[0] || null;
        updatePanel('logoFile', file);
    };

    const handlePanelReferenceChange = (e) => {
        const newFiles = Array.from(e.target.files || []);
        if (newFiles.length === 0) return;
        setPanel(prev => ({
            ...prev,
            referenceFiles: [...prev.referenceFiles, ...newFiles].slice(0, 3)
        }));
    };

    const removePanelReference = (index) => {
        setPanel(prev => ({
            ...prev,
            referenceFiles: prev.referenceFiles.filter((_, i) => i !== index)
        }));
    };

    const handleCustomSculpture = (e) => {
        const file = e.target.files?.[0] || null;
        updatePanel('customSculptureFile', file);
        if (file) updatePanel('selectedSculpture', null);
    };
    const handleCustomBase = (e) => {
        const file = e.target.files?.[0] || null;
        updatePanel('customBaseFile', file);
        if (file) updatePanel('selectedBase', null);
    };
    const handleCustomTopper = (e) => {
        const file = e.target.files?.[0] || null;
        updatePanel('customTopperFile', file);
        if (file) updatePanel('selectedTopper', null);
    };

    const selectSculpture = (item) => {
        updatePanel('selectedSculpture', item);
        updatePanel('customSculptureFile', null);
    };
    const selectBase = (item) => {
        updatePanel('selectedBase', item);
        updatePanel('customBaseFile', null);
    };
    const selectTopper = (item) => {
        updatePanel('selectedTopper', item);
        updatePanel('customTopperFile', null);
    };

    // Detect which luge sub-type is selected (if any)
    const selectedLugeType = useMemo(() => {
        if (sculptureCategory !== 'Luges') return null;
        const name = (panel.selectedSculpture?.name || '').toLowerCase();
        if (name.includes('double') || name.includes('martini')) return 'double-martini';
        if (name.includes('tube')) return 'tube';
        if (name.includes('mini')) return 'mini';
        return null;
    }, [sculptureCategory, panel.selectedSculpture]);

    const buildPanelPrompt = () => {
        const parts = [];
        if (sculptureCategory) {
            const catLabel = sculptureCategoryMap.find(c => c.key === sculptureCategory)?.label || sculptureCategory;
            parts.push(`Sculpture category: ${catLabel}`);
        }
        if (panel.selectedSculpture) parts.push(`Sculpture design: ${panel.selectedSculpture.name}`);
        if (panel.customSculptureFile) parts.push(`Sculpture: custom upload (${panel.customSculptureFile.name})`);

        // Standard Showpiece: base is the primary selection
        if (sculptureCategory === 'Standard Showpiece') {
            if (panel.selectedBase) parts.push(`Base: ${panel.selectedBase.name}`);
            if (standardLogoShape && standardLogoShape !== 'none') {
                const shapeLabel = { round: 'round/circular', square: 'square/rectangular', shape: 'custom shape (matches uploaded item)' }[standardLogoShape];
                parts.push(`Add-on logo shape: ${shapeLabel}`);
                if (panel.logoFile) parts.push(`Logo file: ${panel.logoFile.name}`);
            }
            if (standardTextOption && standardTextOption !== 'none') {
                const textLabel = { names: 'engrave names / words', images: 'add image element', both: 'engrave names/words AND add image element' }[standardTextOption];
                parts.push(`Text / content: ${textLabel}`);
                if (standardText) parts.push(`Text to engrave: "${standardText}"`);
            }
        }

        // 3D Showpiece / Seafood Display: optional logo with style
        if ((sculptureCategory === '3D Showpiece' || sculptureCategory === 'Seafood Display') && wantLogo && threeDLogoStyle) {
            parts.push(`Logo style: ${threeDLogoStyle} effect`);
            if (panel.logoFile) parts.push(`Logo file: ${panel.logoFile.name}`);
        }

        // Ice Cubes: logo embedding
        if (sculptureCategory === 'Ice Cubes' && panel.logoFile) {
            const effectType = panel.selectedSculpture?.name || 'Paper';
            parts.push(`Logo: uploaded file (${panel.logoFile.name}) — embed this EXACT logo into the ice cube using "${effectType}" effect`);
        }

        // All luge types: logo placement
        if (selectedLugeType && lugeLogoOption) {
            const posLabel = { top: 'top surface only', addon: 'side/front (add-on) only', both: 'top surface AND side/front (add-on)' }[lugeLogoOption];
            parts.push(`Logo placement: ${posLabel}`);
            if (panel.logoFile) parts.push(`Logo file: ${panel.logoFile.name}`);
        }

        // All luge types: ice finish
        if (selectedLugeType && lugeFinish) {
            const finishLabel = {
                'snowfilled':       'Snowfilled (frosted white interior)',
                'color':            'Color (tinted colored ice)',
                'paper':            'Paper (printed paper label on ice)',
                'paper-snowfilled': 'Paper + Snowfilled (paper label combined with snofilled effect)',
            }[lugeFinish];
            parts.push(`Ice finish: ${finishLabel}`);
        }

        // All luge types: front decorative piece
        if (selectedLugeType && wantFrontPiece) {
            parts.push(`Front decorative piece: ${lugeFrontPieceDesc || 'yes (no description provided)'}`);
        }

        // All luge types: topper style
        if (selectedLugeType && lugeTopperOption) {
            const topperLabel = {
                'round': 'round/oval logo holder on top',
                'crown': 'crown-shaped topper with logo space',
                'custom': 'custom logo outline shape as topper (client logo outline with white background and blue ice outline following the logo shape)',
            }[lugeTopperOption];
            parts.push(`Top logo/topper style: ${topperLabel}`);
        }

        // All luge types: add-on logo shape
        if (selectedLugeType && (lugeLogoOption === 'addon' || lugeLogoOption === 'both') && lugeAddonLogoShape) {
            const shapeLabel = {
                'square': 'square/rectangular ice holder',
                'round': 'circular ice holder',
                'custom': 'custom outline (logo shape with white background and blue ice outline following the logo contour)',
            }[lugeAddonLogoShape];
            parts.push(`Add-on logo shape: ${shapeLabel}`);
        }

        // Standard base/topper/logo (non-special categories)
        const isSpecialCategory = ['Ice Cubes', '3D Showpiece', 'Seafood Display', 'Standard Showpiece'].includes(sculptureCategory) || selectedLugeType;
        if (!isSpecialCategory) {
            if (wantBase && panel.selectedBase) parts.push(`Base: ${panel.selectedBase.name}`);
            if (wantBase && panel.customBaseFile) parts.push(`Base: custom upload (${panel.customBaseFile.name})`);
            if (wantTopper && panel.selectedTopper) parts.push(`Topper: ${panel.selectedTopper.name}`);
            if (wantTopper && panel.customTopperFile) parts.push(`Topper: custom upload (${panel.customTopperFile.name})`);
            if (wantLogo && panel.logoFile) parts.push(`Logo: uploaded file (${panel.logoFile.name})`);
        }
        if (panel.referenceNotes) parts.push(`Reference notes: ${panel.referenceNotes}`);
        if (panel.additionalPrompt) parts.push(panel.additionalPrompt);

        return parts.length > 0
            ? `Create an ice sculpture render based on this brief:\n${parts.join('\n')}`
            : 'Create an ice sculpture render';
    };

    const handlePanelGenerate = async () => {
        setWizardOpen(false);
        setWizardGalleryOpen(false);
        const filesToSend = [];
        const prompts = {};
        let idx = 0;

        // Helper: fetch a Cloudinary URL as a File object
        const fetchImageAsFile = async (url, filename) => {
            try {
                const resp = await fetch(url);
                const blob = await resp.blob();
                return new File([blob], filename, { type: blob.type || 'image/jpeg' });
            } catch (e) {
                console.error('Failed to fetch template image:', url, e);
                return null;
            }
        };

        // Standard Showpiece: base is primary; no sculpture template
        if (sculptureCategory === 'Standard Showpiece') {
            if (panel.selectedBase?.image) {
                const file = await fetchImageAsFile(panel.selectedBase.image, 'base_template.jpg');
                if (file) { filesToSend.push(file); prompts[idx] = 'BASE — this is the chosen base style. Build the showpiece on top of this base.'; idx++; }
            }
        } else {
            // All other categories: sculpture template first
            // For luge categories, tell Gemini to copy SHAPE only, not any branding from the reference
            const hasLogo = !!(panel.logoFile && selectedLugeType);
            const sculptureRefPrompt = hasLogo
                ? 'MAIN SCULPTURE REFERENCE — replicate ONLY the physical SHAPE, proportions, and channel structure of this luge as a clear photorealistic ice sculpture. COMPLETELY IGNORE and DO NOT copy any text, logos, or branding visible in this reference image. The sculpture must be plain transparent ice — the client logo will be added separately via a dedicated logo image.'
                : 'MAIN SCULPTURE REFERENCE — replicate this EXACT shape, proportions, and silhouette as a clear transparent ice sculpture';

            if (panel.customSculptureFile) {
                filesToSend.push(panel.customSculptureFile);
                prompts[idx] = sculptureRefPrompt;
                idx++;
            } else if (panel.selectedSculpture?.image) {
                const file = await fetchImageAsFile(panel.selectedSculpture.image, 'sculpture_template.jpg');
                if (file) { filesToSend.push(file); prompts[idx] = sculptureRefPrompt; idx++; }
            }
        }

        // Base image (standard extras, non-Standard-Showpiece)
        if (wantBase && sculptureCategory !== 'Standard Showpiece') {
            if (panel.customBaseFile) {
                filesToSend.push(panel.customBaseFile);
                prompts[idx] = 'BASE — place this base design at the bottom of the sculpture';
                idx++;
            } else if (panel.selectedBase?.image) {
                const file = await fetchImageAsFile(panel.selectedBase.image, 'base_template.jpg');
                if (file) { filesToSend.push(file); prompts[idx] = 'BASE — place this base design at the bottom of the sculpture'; idx++; }
            }
        }

        // Topper image
        if (wantTopper) {
            if (panel.customTopperFile) {
                filesToSend.push(panel.customTopperFile);
                prompts[idx] = 'TOPPER — place this topper decoration on top of the sculpture';
                idx++;
            } else if (panel.selectedTopper?.image) {
                const file = await fetchImageAsFile(panel.selectedTopper.image, 'topper_template.jpg');
                if (file) { filesToSend.push(file); prompts[idx] = 'TOPPER — place this topper decoration on top of the sculpture'; idx++; }
            }
        }

        // Logo — Ice Cubes
        if (panel.logoFile && sculptureCategory === 'Ice Cubes') {
            filesToSend.push(panel.logoFile);
            prompts[idx] = 'LOGO — this is the exact logo to embed inside the ice cube. Use THIS logo exactly as-is, do NOT create or invent a different logo';
            idx++;
        }
        // Logo — 3D Showpiece / Seafood Display
        if (panel.logoFile && (sculptureCategory === '3D Showpiece' || sculptureCategory === 'Seafood Display') && wantLogo && threeDLogoStyle) {
            filesToSend.push(panel.logoFile);
            prompts[idx] = threeDLogoStyle === 'paper'
                ? 'CLIENT LOGO — Place this logo as a PRINTED PAPER CARD element physically ON the surface of the ice sculpture. The logo MUST have a solid white or colored rectangular background card behind it. It should look exactly like a real printed paper sign or vinyl sticker placed flat against the ice surface — fully colored, clearly readable, with its white/colored background intact. Do NOT engrave or etch. Do NOT remove the background. Do NOT change the sculpture shape.'
                : 'CLIENT LOGO — Engrave and etch this exact logo into the ice surface as a carved snofilled/frosted effect. The logo should appear carved INTO the ice, with a frosted white carved appearance. Reproduce all fonts, graphics, and layout precisely. Do NOT change the sculpture shape in any way.';
            idx++;
        }
        // Logo — Standard Showpiece
        if (panel.logoFile && sculptureCategory === 'Standard Showpiece' && standardLogoShape && standardLogoShape !== 'none') {
            filesToSend.push(panel.logoFile);
            const shapePrompt = { round: 'round circular', square: 'square/rectangular', shape: 'custom shape matching this uploaded item silhouette' }[standardLogoShape];
            prompts[idx] = `CLIENT LOGO — Place this logo as a printed paper card element on the showpiece. The card must have a solid white or colored ${shapePrompt} background. It should look like a real printed paper label or sign physically attached to the ice surface — fully colored and clearly readable. Do NOT change the sculpture shape.`;
            idx++;
        }
        // Luge topper image
        if (selectedLugeType && lugeTopperOption) {
            if (lugeTopperOption === 'custom' && lugeTopperFile) {
                filesToSend.push(lugeTopperFile);
                prompts[idx] = 'CUSTOM TOPPER — place this logo as the top logo/topper on the luge, shaped as the logo outline with a white background like a sticker and a blue ice shape following the logo contour around it';
                idx++;
            } else if (lugeTopperOption === 'round') {
                const file = await fetchImageAsFile(
                    'https://res.cloudinary.com/daigcmtfz/image/upload/v1766237791/sidebar_images/Topper%20Logos/Oval%20logo%20for%20as%20topper.jpg',
                    'round_topper.jpg'
                );
                if (file) { filesToSend.push(file); prompts[idx] = 'TOPPER — place this round/oval topper on top of the luge'; idx++; }
            } else if (lugeTopperOption === 'crown') {
                const file = await fetchImageAsFile(
                    'https://res.cloudinary.com/daigcmtfz/image/upload/v1766237788/sidebar_images/Topper%20Logos/crown%20logo%20as%20topper.jpg',
                    'crown_topper.jpg'
                );
                if (file) { filesToSend.push(file); prompts[idx] = 'TOPPER — place this crown-shaped topper on top of the luge'; idx++; }
            }
        }

        // Logo — all luge types
        if (panel.logoFile && selectedLugeType && lugeLogoOption) {
            filesToSend.push(panel.logoFile);
            const pos = { top: 'the top flat surface', addon: 'the front face (side add-on position)', both: 'BOTH the top flat surface AND the front face' }[lugeLogoOption];
            const finishNote = lugeFinish === 'snowfilled' || lugeFinish === 'paper-snowfilled'
                ? ' Apply a snofilled/frosted effect to the engraved logo area.'
                : lugeFinish === 'paper' || lugeFinish === 'paper-snowfilled'
                ? ' The logo must appear as a PRINTED PAPER CARD with a solid white or colored background — like a real printed label physically attached to the ice.'
                : '';
            prompts[idx] = `CLIENT LOGO — This is the ONLY logo/branding to use. Place this logo on ${pos} of the ice luge.${finishNote} It should be fully colored, sharp, and clearly readable. Do NOT invent other logos. Do NOT modify the luge shape in any way.`;
            idx++;
        }
        // Logo — standard Ice Bar / Luge (no special sub-type) fallback
        const isSpecialLogoCategory = ['Ice Cubes', '3D Showpiece', 'Seafood Display', 'Standard Showpiece'].includes(sculptureCategory) || selectedLugeType;
        if (panel.logoFile && !isSpecialLogoCategory && wantLogo) {
            filesToSend.push(panel.logoFile);
            prompts[idx] = 'LOGO — engrave or embed this logo into the ice sculpture';
            idx++;
        }

        // Reference images
        panel.referenceFiles.forEach((f, i) => {
            filesToSend.push(f);
            prompts[idx] = `Additional reference image ${i + 1} for style and inspiration`;
            idx++;
        });

        // Any files from the main chat input area
        files.forEach((f, i) => {
            filesToSend.push(f);
            prompts[idx] = imagePrompts[i] || '';
            idx++;
        });

        const prompt = buildPanelPrompt();

        handleSubmit(null, {
            input: prompt,
            files: filesToSend,
            imagePrompts: prompts,
        });
    };

    const handlePanelReset = () => {
        setPanel(INITIAL_PANEL);
        setSculptureCategory('');
        setWantBase(false);
        setWantTopper(false);
        setWantLogo(false);
        setLugeLogoOption(null);
        setTubeLugeOption(null);
        setThreeDLogoStyle(null);
        setStandardLogoShape(null);
        setStandardTextOption(null);
        setStandardText('');
        setLugeTopperOption(null);
        setLugeTopperFile(null);
        setLugeAddonLogoShape(null);
        setTextPrompt('');
        setImgToImgFiles([]);
        setImgToImgPrompt('');
    };

    // Get the active steps array based on build mode
    const getSteps = () => {
        if (buildMode === 'text-to-image') return STEPS_TEXT;
        if (buildMode === 'image-to-image') return STEPS_IMAGE;
        if (buildMode === 'video') return STEPS_VIDEO;
        if (buildMode === 'edit') return STEPS_EDIT;
        return STEPS_CUSTOM;
    };

    // Video generate
    const handleVideoGenerate = () => {
        setWizardOpen(false);
        if (videoSourceType === 'text') {
            const prompt = videoPrompt.trim()
                ? `Create a rotating video of an ice sculpture based on this description:\n${videoPrompt}`
                : 'Create a rotating video of an ice sculpture';
            handleSubmit(null, { input: prompt, files: [], imagePrompts: {} });
        } else if (videoFile) {
            const prompt = 'Create a rotating 360° video from this ice sculpture image.';
            handleSubmit(null, { input: prompt, files: [videoFile], imagePrompts: { 0: 'Source image for video generation' } });
        }
    };

    // Edit/Refine generate
    const handleEditGenerate = () => {
        setWizardOpen(false);
        const prompt = editPrompt.trim()
            ? `Edit this ice sculpture image with the following changes:\n${editPrompt}`
            : 'Refine and enhance this ice sculpture image';
        const filesToSend = editFile ? [editFile] : [];
        const prompts = editFile ? { 0: 'Image to edit/refine' } : {};
        handleSubmit(null, { input: prompt, files: filesToSend, imagePrompts: prompts });
    };

    const currentSteps = getSteps();

    // Text-to-Image generate
    const handleTextToImageGenerate = () => {
        setWizardOpen(false);
        const prompt = textPrompt.trim()
            ? `Create an ice sculpture render based on this description:\n${textPrompt}${panel.additionalPrompt ? '\n' + panel.additionalPrompt : ''}`
            : 'Create an ice sculpture render';
        handleSubmit(null, { input: prompt, files: [], imagePrompts: {} });
    };

    // Image-to-Image generate
    const handleImageToImageGenerate = () => {
        setWizardOpen(false);
        const filesToSend = [...imgToImgFiles];
        const prompts = {};
        imgToImgFiles.forEach((_, i) => {
            prompts[i] = `Reference image ${i + 1} — recreate this as a clear transparent ice sculpture`;
        });
        const prompt = imgToImgPrompt.trim()
            ? `Transform these reference images into an ice sculpture render:\n${imgToImgPrompt}${panel.additionalPrompt ? '\n' + panel.additionalPrompt : ''}`
            : `Transform these reference images into a clear transparent ice sculpture render.${panel.additionalPrompt ? '\n' + panel.additionalPrompt : ''}`;
        handleSubmit(null, { input: prompt, files: filesToSend, imagePrompts: prompts });
    };

    const handleImgToImgFileChange = (e) => {
        if (e.target.files) {
            const selected = Array.from(e.target.files);
            setImgToImgFiles(prev => {
                const combined = [...prev, ...selected].slice(0, 3);
                return combined;
            });
        }
    };

    const removeImgToImgFile = (index) => {
        setImgToImgFiles(prev => prev.filter((_, i) => i !== index));
    };

    const renderDetailsStep = () => (
        <div className="wizard-step-content">
            <p className="wizard-hint">Configure output settings and add any additional instructions.</p>
            <div className="wizard-setting-group">
                <span className="wizard-setting-label">Frame Shape (Aspect Ratio)</span>
                <p className="wizard-setting-desc">Choose how your image will be shaped</p>
                <div className="wizard-ratio-grid">
                    {[
                        { label: '1:1', w: 1, h: 1, name: 'Square', desc: 'Social media posts' },
                        { label: '9:16', w: 9, h: 16, name: 'Portrait Tall', desc: 'Phone screens, stories' },
                        { label: '16:9', w: 16, h: 9, name: 'Landscape Wide', desc: 'Presentations, desktop' },
                        { label: '4:3', w: 4, h: 3, name: 'Classic', desc: 'Standard photos' },
                        { label: '3:4', w: 3, h: 4, name: 'Portrait', desc: 'Vertical photos' },
                        { label: '2:3', w: 2, h: 3, name: 'Tall Portrait', desc: 'Posters, prints' },
                        { label: '3:2', w: 3, h: 2, name: 'Wide Photo', desc: 'DSLR standard' },
                        { label: '4:5', w: 4, h: 5, name: 'Instagram', desc: 'Instagram portrait' },
                        { label: '5:4', w: 5, h: 4, name: 'Landscape', desc: 'Landscape photos' },
                        { label: '21:9', w: 21, h: 9, name: 'Ultra Wide', desc: 'Cinematic, banners' },
                    ].map((r) => (
                        <div key={r.label} className={`wizard-ratio-card ${aspectRatio === r.label ? 'selected' : ''}`} onClick={() => setAspectRatio(r.label)}>
                            <div className="wizard-ratio-preview" style={{ aspectRatio: `${r.w} / ${r.h}`, width: r.w >= r.h ? '100%' : 'auto', height: r.h > r.w ? '100%' : 'auto', maxWidth: '100%', maxHeight: '100%' }}>
                                <span className="wizard-ratio-value">{r.label}</span>
                            </div>
                            <span className="wizard-ratio-name">{r.name}</span>
                            <span className="wizard-ratio-desc">{r.desc}</span>
                            {aspectRatio === r.label && <div className="wizard-ratio-check"><Check size={12} /></div>}
                        </div>
                    ))}
                </div>
            </div>
            <div className="wizard-setting-group">
                <span className="wizard-setting-label">Image Quality (Resolution)</span>
                <p className="wizard-setting-desc">Higher resolution = more detail but slower generation</p>
                <div className="wizard-res-grid">
                    {[
                        { label: '1K', name: 'Standard', desc: 'Fast generation, good for previews', pixels: '1024px', icon: '🔵' },
                        { label: '2K', name: 'High Definition', desc: 'Recommended — great balance of quality & speed', pixels: '2048px', icon: '🟢', recommended: true },
                        { label: '4K', name: 'Ultra HD', desc: 'Maximum detail, best for final renders', pixels: '4096px', icon: '🟡' },
                    ].map((r) => (
                        <div key={r.label} className={`wizard-res-card ${resolution === r.label ? 'selected' : ''}`} onClick={() => setResolution(r.label)}>
                            {r.recommended && <span className="wizard-res-badge">Recommended</span>}
                            <div className="wizard-res-icon">{r.icon}</div>
                            <span className="wizard-res-label">{r.label}</span>
                            <span className="wizard-res-name">{r.name}</span>
                            <span className="wizard-res-desc">{r.desc}</span>
                            <span className="wizard-res-pixels">{r.pixels}</span>
                            {resolution === r.label && <div className="wizard-ratio-check"><Check size={12} /></div>}
                        </div>
                    ))}
                </div>
            </div>
            <div className="wizard-setting-group">
                <span className="wizard-setting-label">Additional Instructions</span>
                <p className="wizard-setting-desc">Any special requests for the AI? (Optional)</p>
                <textarea className="rp-textarea" value={panel.additionalPrompt} onChange={(e) => updatePanel('additionalPrompt', e.target.value)} placeholder="E.g. 'Make it 3 feet tall with blue lighting'" rows={4} />
            </div>
        </div>
    );

    const handleDeleteHistory = (id) => {
        setGeneratedHistory(prev => {
            const updated = prev.filter(h => h.id !== id);
            localStorage.setItem('cynx_image_history', JSON.stringify(updated));
            return updated;
        });
    };

    const handleClearHistory = () => {
        setGeneratedHistory([]);
        localStorage.removeItem('cynx_image_history');
    };

    const handleDownloadImage = async (url) => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `ice-sculpture-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch (err) {
            window.open(url, '_blank');
        }
    };

    const formatHistoryDate = (isoStr) => {
        const d = new Date(isoStr);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div id="chatbot-container">
            <div id="chat-header">
                <div className="header-left">
                    <a href="/">
                        <img src="/react.svg" alt="IceButcher" className="header-logo" />
                    </a>
                </div>
                <div className="header-right">
                    <button
                        className={`header-history-toggle header-sec-btn ${historyOpen ? 'active' : ''}`}
                        onClick={() => setHistoryOpen(p => !p)}
                        title={historyOpen ? 'Hide Generated Images' : 'Show Generated Images'}
                    >
                        <ImageIcon size={16} />
                        <span>My Images</span>
                    </button>
                    <button className="theme-toggle-btn header-sec-btn" onClick={toggleTheme} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'} aria-label="Toggle theme">
                        {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
                    </button>
                    <button className="header-tour-btn header-sec-btn" onClick={handleStartTour}>
                        <Eye size={16} />
                        <span>Quick Tour</span>
                    </button>
                    <button className="header-gallery-btn header-sec-btn" onClick={() => setGalleryOpen(true)}>
                        <LayoutGrid size={16} />
                        <span>Templates</span>
                    </button>
                    <button className="wizard-open-btn" onClick={() => { setBuildMode(''); setWizardOpen(true); setWizardStep(0); }}>
                        <Layers size={18} />
                        <span>Build Sculpture</span>
                    </button>
                    <button
                        className={`mobile-more-btn ${mobileMoreOpen ? 'active' : ''}`}
                        onClick={() => setMobileMoreOpen(p => !p)}
                        aria-label="More"
                    >
                        <Menu size={18} />
                    </button>
                </div>
            </div>
            {mobileMoreOpen && (
                <div className="mobile-more-row">
                    <button
                        className={`mobile-more-item ${historyOpen ? 'active' : ''}`}
                        onClick={() => { setHistoryOpen(p => !p); setMobileMoreOpen(false); }}
                    >
                        <ImageIcon size={15} /><span>My Images</span>
                    </button>
                    <button className="mobile-more-item" onClick={() => { setGalleryOpen(true); setMobileMoreOpen(false); }}>
                        <LayoutGrid size={15} /><span>Templates</span>
                    </button>
                    <button className="mobile-more-item" onClick={() => { handleStartTour(); setMobileMoreOpen(false); }}>
                        <Eye size={15} /><span>Quick Tour</span>
                    </button>
                    <button className="mobile-more-item" onClick={() => { toggleTheme(); setMobileMoreOpen(false); }}>
                        {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                        <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
                    </button>
                </div>
            )}

            <div className="chat-main">

            {/* -------- HISTORY SIDEBAR -------- */}
            <div className={`history-sidebar ${historyOpen ? 'open' : ''}`}>
                <div className="history-sidebar-header">
                    <div className="history-sidebar-title">
                        <Clock size={16} />
                        <span>Generated Images</span>
                    </div>
                    <div className="history-header-actions">
                        {generatedHistory.length > 0 && (
                            <button className="history-clear-btn" onClick={handleClearHistory} title="Clear All">
                                <Trash2 size={14} />
                            </button>
                        )}
                        <button className="history-collapse-btn" onClick={() => setHistoryOpen(false)} title="Hide panel">
                            <ChevronLeft size={15} />
                        </button>
                    </div>
                </div>
                <div className="history-sidebar-content">
                    {generatedHistory.length === 0 ? (
                        <div className="history-empty">
                            <ImageIcon size={32} />
                            <p>No images generated yet</p>
                            <span>Your generated sculptures will appear here</span>
                        </div>
                    ) : (
                        generatedHistory.map(item => (
                            <div key={item.id} className="history-card">
                                <div className="history-card-image">
                                    <LazyImage
                                        src={item.image.startsWith('/static') ? `${API_BASE_URL}${item.image}` : item.image}
                                        alt="Generated"
                                        onClick={() => openPreview(item.image)}
                                        style={{ borderRadius: '8px' }}
                                    />
                                    <div className="history-card-overlay">
                                        <button onClick={() => openPreview(item.image)} title="View">
                                            <Maximize2 size={14} />
                                        </button>
                                        <button onClick={() => handleDownloadImage(item.image.startsWith('/static') ? `${API_BASE_URL}${item.image}` : item.image)} title="Download">
                                            <Download size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteHistory(item.id)} title="Remove" className="history-delete-btn">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="history-card-info">
                                    <p className="history-card-prompt">{item.prompt || 'Ice sculpture'}</p>
                                    <span className="history-card-time">{formatHistoryDate(item.timestamp)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="chat-content-area">
            <div id="chat-messages" ref={messagesContainerRef}>
                {messages.length === 0 && (
                    <>
                        {/* Floating decorative elements */}
                        <div className="welcome-scene">
                            <div className="welcome-orb welcome-orb-1"></div>
                            <div className="welcome-orb welcome-orb-2"></div>
                            <div className="welcome-orb welcome-orb-3"></div>

                            <div className="welcome-hero">
                                <div className="welcome-badge">
                                    <Sparkles size={14} />
                                    <span>AI-Powered Ice Sculpture Design</span>
                                </div>
                                <h1 className="welcome-title animated-gradient-text">
                                    Imagine. Design.<br />Generate.
                                </h1>
                                <p className="welcome-subtitle-text">
                                    Transform your vision into stunning ice sculptures with our intelligent step-by-step builder and AI rendering engine.
                                </p>

                                {/* Primary CTAs */}
                                <div className="welcome-cta-row">
                                    <button className="welcome-build-btn" onClick={() => { setBuildMode(''); setWizardOpen(true); setWizardStep(0); }}>
                                        <div className="welcome-build-icon">
                                            <Layers size={24} />
                                        </div>
                                        <div className="welcome-build-text">
                                            <span className="welcome-build-title">Start Building Your Sculpture</span>
                                            <span className="welcome-build-desc">Step-by-step wizard with 70+ templates</span>
                                        </div>
                                        <ArrowRight size={20} className="welcome-build-arrow" />
                                    </button>
                                    <button className="welcome-tour-btn" onClick={handleStartTour}>
                                        <Eye size={18} />
                                        <span>Watch Tutorial</span>
                                    </button>
                                </div>
                            </div>

                            {/* Feature cards */}
                            <div className="welcome-features">
                                <div className="welcome-feature-card">
                                    <div className="welcome-feature-icon wf-blue">
                                        <Paintbrush size={20} />
                                    </div>
                                    <h3>70+ Templates</h3>
                                    <p>Luges, sculptures, bars, cubes & more</p>
                                </div>
                                <div className="welcome-feature-card fav-card" onClick={() => setShowcaseOpen(true)}>
                                    <div className="fav-card-pulse"></div>
                                    <div className="fav-card-pulse fav-card-pulse-2"></div>
                                    <div className="welcome-feature-icon wf-fav">
                                        <Heart size={20} fill="#ff4b6e" color="#ff4b6e" />
                                    </div>
                                    <h3>Favourites</h3>
                                    <p>Our team's best picks</p>
                                    <span className="fav-card-live-dot"></span>
                                </div>
                                <div className="welcome-feature-card">
                                    <div className="welcome-feature-icon wf-purple">
                                        <Video size={20} />
                                    </div>
                                    <h3>360° Video</h3>
                                    <p>Rotating video of your design</p>
                                </div>
                                <div className="welcome-feature-card">
                                    <div className="welcome-feature-icon wf-green">
                                        <Zap size={20} />
                                    </div>
                                    <h3>Chat Assistant</h3>
                                    <p>Ask anything about ice sculpting</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}>
                        <div className="message-avatar">
                            <img src={msg.role === 'user' ? userImage : "https://theicebutcher.com/wp-content/uploads/2023/08/icebutcherlogomi-1.webp"} alt={msg.role}
                                onError={(e) => e.target.src = 'https://placehold.co/40x40?text=U'} />
                        </div>
                        <div className="message-content">
                            {msg.content && <div className="message-bubble">{msg.content}</div>}

                            {msg.images && msg.images.map((img, i) => (
                                <LazyImage key={i} src={img} alt="User upload" className="chat-image" />
                            ))}

                            {msg.image && (
                                <div className="bot-image-container">
                                    <LazyImage
                                        src={msg.image.startsWith('/static') ? `${API_BASE_URL}${msg.image}` : msg.image}
                                        alt="Generated"
                                        className="chat-image"
                                        onClick={() => openPreview(msg.image)}
                                    />
                                    <div className="image-actions">
                                        <button className="action-btn" onClick={() => handleSelectImage(msg.image)}>
                                            <Edit2 size={14} /> <span>Select</span>
                                        </button>
                                        {/* <button className="action-btn" onClick={() => handleCreateVideo(msg.image)}>
                                            <Video size={14} /> <span>Create Video</span>
                                        </button> */}
                                        <button className="action-btn" onClick={() => openPreview(msg.image)}>
                                            <Wand2 size={14} /> <span>Expand/Edit</span>
                                        </button>
                                        <button className="action-btn" onClick={() => openFeedback(msg.image)}>
                                            <ThumbsUp size={14} /> <span>Rate</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {msg.isLoadingVideo && (
                                <div className="video-loading-container" style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <div className="loading-spinner" style={{ width: '20px', height: '20px', display: 'inline-block', verticalAlign: 'middle', marginRight: '10px' }}></div>
                                    <span>Creating video... This may take a few minutes.</span>
                                </div>
                            )}

                            {msg.videoUrl && (
                                <div className="bot-video-container" style={{ marginTop: '10px' }}>
                                    <video
                                        src={msg.videoUrl}
                                        controls
                                        style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '400px' }}
                                    />
                                    <div className="image-actions">
                                        <a href={msg.videoUrl} download="generated_video.mp4" className="action-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                                            <Video size={14} /> <span>Download Video</span>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {msg.role !== 'user' && (
                                <button className="generate-new-btn" onClick={() => { setBuildMode(''); setWizardOpen(true); setWizardStep(0); }}>
                                    <RotateCcw size={16} /> Build New Sculpture
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="message bot-message">
                        <div className="message-avatar"><img src="https://theicebutcher.com/wp-content/uploads/2023/08/icebutcherlogomi-1.webp" alt="Bot" /></div>
                        <div className="message-bubble">
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Favourites floating banner — visible when chat has messages */}
            {messages.length > 0 && (
                <div className="chat-fav-banner" onClick={() => setShowcaseOpen(true)}>
                    <div className="chat-fav-banner-pulse"></div>
                    <Heart size={16} fill="#ff4b6e" color="#ff4b6e" />
                    <span className="chat-fav-banner-text">Explore Our Best Ice Sculptures</span>
                    <ChevronRight size={14} className="chat-fav-banner-arrow" />
                </div>
            )}

            <div id="chat-input-container">
                {isTemplateLoading && (
                    <div className="template-loading-overlay">
                        <div className="spinner-container">
                            <div className="loading-spinner"></div>
                            <span>Loading Template...</span>
                        </div>
                    </div>
                )}
                <div className="input-wrapper">
                    {files.length > 0 && (
                        <div className="input-previews">
                            {files.map((file, index) => (
                                <div key={index} className="preview-thumb-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '10px' }}>
                                    <div className="preview-thumb">
                                        <img src={URL.createObjectURL(file)} alt="preview" />
                                        <div className="preview-remove" onClick={() => removeFile(index)}>×</div>
                                    </div>
                                    <input
                                        type="text"
                                        className="image-prompt-input"
                                        placeholder={`Prompt for Image ${index + 1}`}
                                        value={imagePrompts[index] || ''}
                                        onChange={(e) => handleImagePromptChange(index, e.target.value)}
                                        style={{
                                            marginTop: '5px',
                                            padding: '4px',
                                            fontSize: '10px',
                                            width: '80px',
                                            borderRadius: '4px',
                                            border: '1px solid #444',
                                            background: '#222',
                                            color: '#fff'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="input-top-row">
                        <Sparkles className="input-sparkle-icon" size={20} />
                        <textarea
                            className="input-field"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            placeholder="Describe your ice sculpture..."
                            rows={1}
                        />
                    </div>

                    <div className="input-bottom-row">
                        <div className="input-tools-left">
                            <button className="tool-btn" onClick={() => fileInputRef.current.click()} title="Upload Image">
                                <ImageIcon size={20} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                multiple
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className="input-tools-right">
                            <button
                                className={`tool-btn ${isListening ? 'listening' : ''}`}
                                onClick={handleVoiceInput}
                                title="Voice Input"
                                style={{ color: isListening ? '#ff4b4b' : 'inherit' }}
                            >
                                <Mic size={20} className={isListening ? 'pulse' : ''} />
                            </button>
                            <button
                                className="send-btn"
                                onClick={handleSubmit}
                                disabled={(!input.trim() && files.length === 0) || (currentIceCube && currentIceCube.toLowerCase() !== 'snofilled' && files.length < 2)}
                            >
                                <span>Send</span>
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </div>{/* end .chat-content-area */}

            </div>{/* end .chat-main */}


            {/* -------- WIZARD MODAL -------- */}
            {wizardOpen && (
                <div className="wizard-overlay" onClick={() => setWizardOpen(false)}>
                    <div className="wizard-card" onClick={(e) => e.stopPropagation()}>
                        {/* Close button */}
                        <button className="wizard-close" onClick={() => setWizardOpen(false)}><X size={20} /></button>

                        {/* Stepper graph */}
                        <div className="wizard-stepper">
                            {currentSteps.map((step, idx) => (
                                <React.Fragment key={step.id}>
                                    {idx > 0 && (
                                        <div className={`step-connector ${idx <= wizardStep ? 'active' : ''}`} />
                                    )}
                                    <div
                                        className={`step-node ${wizardStep === idx ? 'current' : ''} ${idx < wizardStep ? 'completed' : ''}`}
                                        onClick={() => { if (idx > 0 || buildMode) setWizardStep(idx); }}
                                        title={step.label}
                                    >
                                        {idx < wizardStep ? <Check size={14} /> : <span>{step.icon}</span>}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="wizard-step-labels">
                            {currentSteps.map((step, idx) => (
                                <span key={step.id} className={`step-label ${wizardStep === idx ? 'current' : ''}`}>
                                    {step.label}
                                </span>
                            ))}
                        </div>

                        {/* Step title */}
                        <div className="wizard-header">
                            <h2 className="wizard-title">{currentSteps[wizardStep]?.label || 'Build'}</h2>
                            <button className="wizard-reset" onClick={handlePanelReset}>Reset All</button>
                        </div>

                        {/* Body */}
                        <div className="wizard-body">

                            {/* ---- STEP 0: MODE SELECTION (all modes) ---- */}
                            {wizardStep === 0 && (
                                <div className="wizard-step-content">
                                    <p className="wizard-hint">How would you like to create your ice sculpture?</p>
                                    <div className="build-mode-grid">
                                        <div
                                            className={`build-mode-card ${buildMode === 'text-to-image' ? 'selected' : ''}`}
                                            onClick={() => { setBuildMode('text-to-image'); setWizardStep(1); }}
                                        >
                                            <div className="build-mode-icon bm-text"><Type size={28} /></div>
                                            <h3>Text to Image</h3>
                                            <p>Describe your sculpture in words and let AI generate it</p>
                                            <div className="build-mode-tags">
                                                <span>Quick</span><span>Easy</span><span>Creative</span>
                                            </div>
                                        </div>
                                        <div
                                            className={`build-mode-card ${buildMode === 'image-to-image' ? 'selected' : ''}`}
                                            onClick={() => { setBuildMode('image-to-image'); setWizardStep(1); }}
                                        >
                                            <div className="build-mode-icon bm-image"><ImagePlus size={28} /></div>
                                            <h3>Image to Image</h3>
                                            <p>Upload reference photos and transform them into ice sculptures</p>
                                            <div className="build-mode-tags">
                                                <span>Upload</span><span>Transform</span><span>Accurate</span>
                                            </div>
                                        </div>
                                        <div
                                            className={`build-mode-card ${buildMode === 'custom-build' ? 'selected' : ''}`}
                                            onClick={() => { setBuildMode('custom-build'); setWizardStep(1); }}
                                        >
                                            <div className="build-mode-icon bm-custom"><Hammer size={28} /></div>
                                            <h3>Custom Build</h3>
                                            <p>Step-by-step wizard with 70+ templates, bases, toppers & more</p>
                                            <div className="build-mode-tags">
                                                <span>Templates</span><span>Detailed</span><span>Full Control</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ============ TEXT TO IMAGE STEPS ============ */}
                            {buildMode === 'text-to-image' && wizardStep === 1 && (
                                <div className="wizard-step-content">
                                    <p className="wizard-hint">Describe the ice sculpture you want to create in detail.</p>
                                    <textarea
                                        className="rp-textarea rp-textarea-lg"
                                        value={textPrompt}
                                        onChange={(e) => setTextPrompt(e.target.value)}
                                        placeholder="E.g. 'A 4-foot tall swan ice sculpture with spread wings on a rectangular base, with blue LED lighting, for a wedding reception...'"
                                        rows={6}
                                    />
                                    <div className="text-prompt-tips">
                                        <h4><Lightbulb size={14} /> Tips for better results:</h4>
                                        <ul>
                                            <li>Mention the sculpture type (luge, showpiece, bar, cube)</li>
                                            <li>Describe size and proportions</li>
                                            <li>Include details about base, lighting, or setting</li>
                                            <li>Mention any text or logos you want embedded</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                            {buildMode === 'text-to-image' && wizardStep === 2 && (
                                <>
                                    {renderDetailsStep()}
                                </>
                            )}
                            {buildMode === 'text-to-image' && wizardStep === 3 && (
                                <div className="wizard-step-content wizard-review">
                                    <p className="wizard-hint">Review before generating.</p>
                                    <div className="review-grid">
                                        <div className="review-item">
                                            <span className="review-label">Mode</span>
                                            <span className="review-value">Text to Image</span>
                                        </div>
                                        <div className="review-item review-item-full">
                                            <span className="review-label">Description</span>
                                            <span className="review-value">{textPrompt || <em>No description</em>}</span>
                                        </div>
                                        <div className="review-item">
                                            <span className="review-label">Aspect Ratio</span>
                                            <span className="review-value">{aspectRatio}</span>
                                        </div>
                                        <div className="review-item">
                                            <span className="review-label">Resolution</span>
                                            <span className="review-value">{resolution}</span>
                                        </div>
                                        {panel.additionalPrompt && (
                                            <div className="review-item review-item-full">
                                                <span className="review-label">Additional Instructions</span>
                                                <span className="review-value">{panel.additionalPrompt}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ============ IMAGE TO IMAGE STEPS ============ */}
                            {buildMode === 'image-to-image' && wizardStep === 1 && (
                                <div className="wizard-step-content">
                                    <p className="wizard-hint">Upload up to 3 reference images to transform into ice sculptures.</p>
                                    <div className="rp-upload-zone" onClick={() => imgToImgInputRef.current?.click()}>
                                        <div className="rp-upload-placeholder">
                                            <Upload size={18} />
                                            <span>Click to upload reference images (up to 3)</span>
                                        </div>
                                    </div>
                                    <input type="file" ref={imgToImgInputRef} accept="image/*" multiple onChange={handleImgToImgFileChange} style={{ display: 'none' }} />
                                    {imgToImgFiles.length > 0 && (
                                        <div className="img-to-img-previews">
                                            {imgToImgFiles.map((file, i) => (
                                                <div key={i} className="img-to-img-preview-card">
                                                    <img src={URL.createObjectURL(file)} alt={`ref-${i}`} />
                                                    <button className="rp-remove" onClick={() => removeImgToImgFile(i)}><X size={12} /></button>
                                                    <span className="img-to-img-name">{file.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {buildMode === 'image-to-image' && wizardStep === 2 && (
                                <div className="wizard-step-content">
                                    <p className="wizard-hint">Describe how you want the images transformed into ice sculptures.</p>
                                    <textarea
                                        className="rp-textarea rp-textarea-lg"
                                        value={imgToImgPrompt}
                                        onChange={(e) => setImgToImgPrompt(e.target.value)}
                                        placeholder="E.g. 'Transform this into a clear transparent ice sculpture, keep the exact same proportions and shape...'"
                                        rows={5}
                                    />
                                </div>
                            )}
                            {buildMode === 'image-to-image' && wizardStep === 3 && (
                                <>
                                    {renderDetailsStep()}
                                </>
                            )}
                            {buildMode === 'image-to-image' && wizardStep === 4 && (
                                <div className="wizard-step-content wizard-review">
                                    <p className="wizard-hint">Review before generating.</p>
                                    <div className="review-grid">
                                        <div className="review-item">
                                            <span className="review-label">Mode</span>
                                            <span className="review-value">Image to Image</span>
                                        </div>
                                        <div className="review-item">
                                            <span className="review-label">Reference Images</span>
                                            <span className="review-value">{imgToImgFiles.length} file(s)</span>
                                        </div>
                                        <div className="review-item review-item-full">
                                            <span className="review-label">Description</span>
                                            <span className="review-value">{imgToImgPrompt || <em>No description</em>}</span>
                                        </div>
                                        <div className="review-item">
                                            <span className="review-label">Aspect Ratio</span>
                                            <span className="review-value">{aspectRatio}</span>
                                        </div>
                                        <div className="review-item">
                                            <span className="review-label">Resolution</span>
                                            <span className="review-value">{resolution}</span>
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* ============ CUSTOM BUILD STEPS ============ */}
                            {/* ---- CUSTOM STEP 1: SCULPTURE / BASE ---- */}
                            {buildMode === 'custom-build' && wizardStep === 1 && (
                                <div className="wizard-step-content">
                                    <p className="wizard-hint">
                                        {sculptureCategory === 'Standard Showpiece'
                                            ? 'Choose the base for your showpiece.'
                                            : 'Choose a category, then pick a template or upload your own.'}
                                    </p>
                                    <div className="rp-category-chips">
                                        {sculptureCategoryMap.map(({ label, key }) => (
                                            <button
                                                key={key}
                                                className={`rp-category-chip ${sculptureCategory === key ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (sculptureCategory === key) {
                                                        setSculptureCategory('');
                                                    } else {
                                                        setSculptureCategory(key);
                                                        updatePanel('selectedSculpture', null);
                                                        updatePanel('customSculptureFile', null);
                                                        updatePanel('selectedBase', null);
                                                    }
                                                }}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Standard Showpiece: show BASES first */}
                                    {sculptureCategory === 'Standard Showpiece' && (
                                        <div className="rp-picker-grid">
                                            {categoryItems.bases.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className={`rp-picker-item ${panel.selectedBase?.name === item.name ? 'selected' : ''}`}
                                                    onClick={() => selectBase(item)}
                                                >
                                                    <LazyImage src={item.image} alt={item.name} placeholderH="80px" />
                                                    <span className="rp-picker-label">{item.name}</span>
                                                    {panel.selectedBase?.name === item.name && <div className="rp-picker-check"><Check size={14}/></div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* All other categories: show sculpture gallery */}
                                    {sculptureCategory && sculptureCategory !== 'Standard Showpiece' && categoryItems.sculpturesByCategory[sculptureCategory] && (
                                        <>
                                            {/* Tracker above main grid — only when selected from main grid */}
                                            {panel.selectedSculpture && sculptureSelectedFrom === 'main' && (
                                                <div className="wiz-selected-tracker wiz-selected-tracker--top">
                                                    <div className="wiz-selected-tracker-left">
                                                        <div className="wiz-selected-check"><Check size={11}/></div>
                                                        <div className="wiz-selected-info">
                                                            <span className="wiz-selected-label">Selected Template</span>
                                                            <span className="wiz-selected-name">{panel.selectedSculpture.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="wiz-selected-tracker-right">
                                                        {panel.selectedSculpture.image && (
                                                            <img className="wiz-selected-thumb" src={panel.selectedSculpture.image} alt={panel.selectedSculpture.name} />
                                                        )}
                                                        <button className="wiz-selected-clear" title="Unselect" onClick={() => { updatePanel('selectedSculpture', null); setSculptureSelectedFrom(null); }}>
                                                            <X size={13}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="rp-picker-grid">
                                                {categoryItems.sculpturesByCategory[sculptureCategory].map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className={`rp-picker-item ${panel.selectedSculpture?.name === item.name ? 'selected' : ''}`}
                                                        onClick={() => { if (panel.selectedSculpture?.name === item.name) { updatePanel('selectedSculpture', null); setSculptureSelectedFrom(null); } else { selectSculpture(item); setSculptureSelectedFrom('main'); } }}
                                                    >
                                                        <LazyImage src={item.image} alt={item.name} placeholderH="80px" />
                                                        <span className="rp-picker-label">{item.name}</span>
                                                        {panel.selectedSculpture?.name === item.name && <div className="rp-picker-check"><Check size={14}/></div>}
                                                    </div>
                                                ))}
                                            </div>

                                            {sculptureCategory === 'Ice Cubes' && (
                                                <div className="rp-ice-cube-logo">
                                                    <p className="rp-hint">Upload your logo for the ice cube</p>
                                                    <div className="rp-upload-zone" onClick={() => logoInputRef.current?.click()}>
                                                        {panel.logoFile ? (
                                                            <div className="rp-file-preview">
                                                                <img src={URL.createObjectURL(panel.logoFile)} alt="logo" className="rp-thumb" />
                                                                <span className="rp-file-name">{panel.logoFile.name}</span>
                                                                <button className="rp-remove" onClick={(e) => { e.stopPropagation(); updatePanel('logoFile', null); }}><Trash2 size={14}/></button>
                                                            </div>
                                                        ) : (
                                                            <div className="rp-upload-placeholder">
                                                                <Upload size={18} />
                                                                <span>Upload logo</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input type="file" ref={logoInputRef} accept="image/*" onChange={handlePanelLogoChange} style={{ display: 'none' }} />
                                                </div>
                                            )}

                                            {sculptureCategory !== 'Ice Cubes' && (
                                                <>
                                                    {/* Selected template tracker — only when selected from gallery panel */}
                                                    {panel.selectedSculpture && sculptureSelectedFrom === 'gallery' && (
                                                        <div className="wiz-selected-tracker">
                                                            <div className="wiz-selected-tracker-left">
                                                                <div className="wiz-selected-check"><Check size={11}/></div>
                                                                <div className="wiz-selected-info">
                                                                    <span className="wiz-selected-label">Selected Template</span>
                                                                    <span className="wiz-selected-name">{panel.selectedSculpture.name}</span>
                                                                </div>
                                                            </div>
                                                            <div className="wiz-selected-tracker-right">
                                                                {panel.selectedSculpture.image && (
                                                                    <img className="wiz-selected-thumb" src={panel.selectedSculpture.image} alt={panel.selectedSculpture.name} />
                                                                )}
                                                                <button className="wiz-selected-clear" title="Unselect" onClick={() => { updatePanel('selectedSculpture', null); setSculptureSelectedFrom(null); }}>
                                                                    <X size={13}/>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* View All Templates inline panel */}
                                                    {!wizardGalleryOpen ? (
                                                        <button
                                                            className="wiz-view-all-btn"
                                                            onClick={() => { setWizardGalleryOpen(true); setWizardGallerySearch(''); setWizardGalleryPage(1); setWizardGalleryCategory('All'); }}
                                                        >
                                                            <LayoutGrid size={15} />
                                                            View All Templates
                                                            <span className="wiz-view-all-count">{(allTemplates?.standardSculptures || []).length.toLocaleString()}+</span>
                                                        </button>
                                                    ) : (
                                                        <div className="wiz-gallery-panel">
                                                            <div className="wiz-gallery-header">
                                                                <div className="wiz-gallery-title">
                                                                    <LayoutGrid size={15} />
                                                                    <span>All Templates</span>
                                                                </div>
                                                                <button className="wiz-gallery-close" onClick={() => setWizardGalleryOpen(false)}>
                                                                    <X size={16} />
                                                                    <span>Close</span>
                                                                </button>
                                                            </div>
                                                            <div className="wiz-gallery-search">
                                                                <Search size={14} />
                                                                <input
                                                                    autoFocus
                                                                    placeholder="Search all templates..."
                                                                    value={wizardGallerySearch}
                                                                    onChange={e => { setWizardGallerySearch(e.target.value); setWizardGalleryPage(1); }}
                                                                />
                                                                {wizardGallerySearch && (
                                                                    <button className="wiz-gallery-clear" onClick={() => { setWizardGallerySearch(''); setWizardGalleryPage(1); }}><X size={12}/></button>
                                                                )}
                                                            </div>
                                                            {(() => {
                                                                const WIZ_PAGE_SIZE = 18;
                                                                const WIZ_CATS = ['All', 'Luges', 'Seafood & Displays', 'Showpieces', 'Bars', 'Wedding', 'Other'];
                                                                const getCat = (name) => {
                                                                    const n = name.toLowerCase();
                                                                    if (/\bluge\b/.test(n)) return 'Luges';
                                                                    if (/\b(seafood|caviar|clam)\b/.test(n) || /\bdisplay\b/.test(n)) return 'Seafood & Displays';
                                                                    if (/\bshowpiece\b/.test(n)) return 'Showpieces';
                                                                    if (/\bbar\b/.test(n)) return 'Bars';
                                                                    if (/mr & mrs|wedding|bride/.test(n)) return 'Wedding';
                                                                    return 'Other';
                                                                };
                                                                const allItems = (allTemplates?.standardSculptures || []).map(i => ({ ...i, cat: getCat(i.name) }));
                                                                const catCounts = WIZ_CATS.reduce((acc, c) => { acc[c] = c === 'All' ? allItems.length : allItems.filter(i => i.cat === c).length; return acc; }, {});
                                                                let filtered = wizardGalleryCategory !== 'All' ? allItems.filter(i => i.cat === wizardGalleryCategory) : allItems;
                                                                if (wizardGallerySearch.trim()) filtered = filtered.filter(i => i.name.toLowerCase().includes(wizardGallerySearch.toLowerCase()));
                                                                const totalPages = Math.ceil(filtered.length / WIZ_PAGE_SIZE);
                                                                const paged = filtered.slice((wizardGalleryPage - 1) * WIZ_PAGE_SIZE, wizardGalleryPage * WIZ_PAGE_SIZE);
                                                                return (
                                                                    <>
                                                                        <div className="wiz-gallery-cats">
                                                                            {WIZ_CATS.map(cat => (
                                                                                <button
                                                                                    key={cat}
                                                                                    className={`wiz-gallery-cat-btn ${wizardGalleryCategory === cat ? 'active' : ''}`}
                                                                                    onClick={() => { setWizardGalleryCategory(cat); setWizardGalleryPage(1); }}
                                                                                >
                                                                                    {cat} <span className="wiz-gallery-cat-count">{catCounts[cat]}</span>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                        <div className="wiz-gallery-meta">{filtered.length.toLocaleString()} templates{wizardGallerySearch && ' found'}</div>
                                                                        <div className="wiz-gallery-grid">
                                                                            {paged.length === 0 ? (
                                                                                <div className="wiz-gallery-empty">No templates found</div>
                                                                            ) : paged.map((item, i) => (
                                                                                <div
                                                                                    key={i}
                                                                                    className={`wiz-gallery-item ${panel.selectedSculpture?.image === item.link ? 'selected' : ''}`}
                                                                                    onClick={() => { selectSculpture({ name: item.name, image: item.link, type: sculptureCategory }); setSculptureSelectedFrom('gallery'); }}
                                                                                >
                                                                                    <div className="wiz-gallery-img-wrap">
                                                                                        <LazyImage src={item.link} alt={item.name} placeholderH="90px" onError={e => { e.target.parentNode.parentNode.style.display='none'; }} />
                                                                                        {panel.selectedSculpture?.image === item.link && <div className="wiz-gallery-check"><Check size={12}/></div>}
                                                                                    </div>
                                                                                    <span className="wiz-gallery-name">{item.name}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        {totalPages > 1 && (
                                                                            <div className="wiz-gallery-pagination">
                                                                                <button disabled={wizardGalleryPage === 1} onClick={() => setWizardGalleryPage(p => p - 1)}><ChevronLeft size={14}/></button>
                                                                                <span>{wizardGalleryPage} / {totalPages}</span>
                                                                                <button disabled={wizardGalleryPage === totalPages} onClick={() => setWizardGalleryPage(p => p + 1)}><ChevronRight size={14}/></button>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}

                                                    <div className="rp-or-divider"><span>or</span></div>
                                                    <div className="rp-upload-zone" onClick={() => customSculptureInputRef.current?.click()}>
                                                        {panel.customSculptureFile ? (
                                                            <div className="rp-file-preview">
                                                                <img src={URL.createObjectURL(panel.customSculptureFile)} alt="custom" className="rp-thumb" />
                                                                <span className="rp-file-name">{panel.customSculptureFile.name}</span>
                                                                <button className="rp-remove" onClick={(e) => { e.stopPropagation(); updatePanel('customSculptureFile', null); }}><Trash2 size={14}/></button>
                                                            </div>
                                                        ) : (
                                                            <div className="rp-upload-placeholder">
                                                                <Upload size={18} />
                                                                <span>Upload custom sculpture image</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input type="file" ref={customSculptureInputRef} accept="image/*" onChange={handleCustomSculpture} style={{ display: 'none' }} />
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ---- CUSTOM STEP 2: EXTRAS ---- */}
                            {buildMode === 'custom-build' && wizardStep === 2 && (
                                <>
                                {/* ══ 3D SHOWPIECE / SEAFOOD DISPLAY — logo style ══ */}
                                {(sculptureCategory === '3D Showpiece' || sculptureCategory === 'Seafood Display') ? (
                                    <div className="wizard-step-content">
                                        <p className="wizard-hint">Would you like to add a logo to your sculpture?</p>
                                        <div className="rp-toggle-row">
                                            <span>Add a logo?</span>
                                            <div className="rp-toggle-btns">
                                                <button className={`rp-toggle-btn ${wantLogo ? 'active' : ''}`} onClick={() => setWantLogo(true)}>Yes</button>
                                                <button className={`rp-toggle-btn ${!wantLogo ? 'active' : ''}`} onClick={() => { setWantLogo(false); setThreeDLogoStyle(null); updatePanel('logoFile', null); }}>No</button>
                                            </div>
                                        </div>
                                        {wantLogo && (
                                            <>
                                                <div className="extras-section" style={{ marginTop: '1rem' }}>
                                                    <h3 className="extras-section-title">Logo style</h3>
                                                    <div className="luge-option-cards">
                                                        {[
                                                            { key: 'paper',      label: 'Paper',      desc: 'Coloured printed paper effect placed on the sculpture' },
                                                            { key: 'snowfilled', label: 'Snowfilled',  desc: 'Logo carved / etched into the ice with a frosted appearance' },
                                                        ].map(({ key, label, desc }) => (
                                                            <button
                                                                key={key}
                                                                className={`luge-option-card ${threeDLogoStyle === key ? 'active' : ''}`}
                                                                onClick={() => { setThreeDLogoStyle(key); updatePanel('logoFile', null); }}
                                                            >
                                                                <span className="luge-option-label">{label}</span>
                                                                <span className="luge-option-desc">{desc}</span>
                                                                {threeDLogoStyle === key && <div className="rp-picker-check" style={{position:'absolute',top:'0.5rem',right:'0.5rem'}}><Check size={14}/></div>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                {threeDLogoStyle && (
                                                    <div className="extras-section" style={{ marginTop: '1rem' }}>
                                                        <h3 className="extras-section-title">Upload your logo</h3>
                                                        <div className="rp-upload-zone" onClick={() => logoInputRef.current?.click()}>
                                                            {panel.logoFile ? (
                                                                <div className="rp-file-preview">
                                                                    <img src={URL.createObjectURL(panel.logoFile)} alt="logo" className="rp-thumb" />
                                                                    <span className="rp-file-name">{panel.logoFile.name}</span>
                                                                    <button className="rp-remove" onClick={(e) => { e.stopPropagation(); updatePanel('logoFile', null); }}><Trash2 size={14}/></button>
                                                                </div>
                                                            ) : (
                                                                <div className="rp-upload-placeholder"><Upload size={18} /><span>Upload logo</span></div>
                                                            )}
                                                        </div>
                                                        <input type="file" ref={logoInputRef} accept="image/*" onChange={handlePanelLogoChange} style={{ display: 'none' }} />
                                                        <p className="rp-hint" style={{ marginTop: '0.6rem' }}>Describe where to place the logo in the Details step under "Additional Notes".</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                ) : sculptureCategory === 'Standard Showpiece' ? (
                                /* ══ STANDARD SHOWPIECE — add-on logo shape + text/content ══ */
                                    <div className="wizard-step-content">
                                        <p className="wizard-hint">Customise your showpiece with a logo and text.</p>

                                        {/* Logo shape */}
                                        <div className="extras-section">
                                            <h3 className="extras-section-title">Add-on Logo</h3>
                                            <div className="luge-option-cards">
                                                {[
                                                    { key: 'round',  label: 'Round',         desc: 'Logo placed inside a circular shape' },
                                                    { key: 'square', label: 'Square',         desc: 'Logo placed inside a square / rectangular shape' },
                                                    { key: 'shape',  label: 'Custom Shape',   desc: 'Logo takes the shape of the item you upload' },
                                                    { key: 'none',   label: 'No Logo',        desc: 'Skip the add-on logo' },
                                                ].map(({ key, label, desc }) => (
                                                    <button
                                                        key={key}
                                                        className={`luge-option-card ${standardLogoShape === key ? 'active' : ''}`}
                                                        onClick={() => { setStandardLogoShape(key); updatePanel('logoFile', null); }}
                                                    >
                                                        <span className="luge-option-label">{label}</span>
                                                        <span className="luge-option-desc">{desc}</span>
                                                        {standardLogoShape === key && <div className="rp-picker-check" style={{position:'absolute',top:'0.5rem',right:'0.5rem'}}><Check size={14}/></div>}
                                                    </button>
                                                ))}
                                            </div>
                                            {standardLogoShape && standardLogoShape !== 'none' && (
                                                <div style={{ marginTop: '0.75rem' }}>
                                                    <div className="rp-upload-zone" onClick={() => logoInputRef.current?.click()}>
                                                        {panel.logoFile ? (
                                                            <div className="rp-file-preview">
                                                                <img src={URL.createObjectURL(panel.logoFile)} alt="logo" className="rp-thumb" />
                                                                <span className="rp-file-name">{panel.logoFile.name}</span>
                                                                <button className="rp-remove" onClick={(e) => { e.stopPropagation(); updatePanel('logoFile', null); }}><Trash2 size={14}/></button>
                                                            </div>
                                                        ) : (
                                                            <div className="rp-upload-placeholder">
                                                                <Upload size={18} />
                                                                <span>{standardLogoShape === 'shape' ? 'Upload item image for shape reference' : 'Upload logo'}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input type="file" ref={logoInputRef} accept="image/*" onChange={handlePanelLogoChange} style={{ display: 'none' }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Text / content */}
                                        <div className="extras-section">
                                            <h3 className="extras-section-title">Text &amp; Content</h3>
                                            <div className="luge-option-cards">
                                                {[
                                                    { key: 'names',  label: 'Names / Words', desc: 'Add text, names, or a message engraved on the showpiece' },
                                                    { key: 'images', label: 'Images Only',    desc: 'Add an additional image or graphic element' },
                                                    { key: 'both',   label: 'Both',           desc: 'Names / words AND an additional image together' },
                                                    { key: 'none',   label: 'None',           desc: 'No text or extra content' },
                                                ].map(({ key, label, desc }) => (
                                                    <button
                                                        key={key}
                                                        className={`luge-option-card ${standardTextOption === key ? 'active' : ''}`}
                                                        onClick={() => setStandardTextOption(key)}
                                                    >
                                                        <span className="luge-option-label">{label}</span>
                                                        <span className="luge-option-desc">{desc}</span>
                                                        {standardTextOption === key && <div className="rp-picker-check" style={{position:'absolute',top:'0.5rem',right:'0.5rem'}}><Check size={14}/></div>}
                                                    </button>
                                                ))}
                                            </div>
                                            {(standardTextOption === 'names' || standardTextOption === 'both') && (
                                                <textarea
                                                    className="wizard-textarea"
                                                    placeholder="Enter names, words, or message to engrave..."
                                                    value={standardText}
                                                    onChange={e => setStandardText(e.target.value)}
                                                    rows={3}
                                                    style={{ marginTop: '0.75rem' }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                ) : /* ══ LUGE OPTIONS (all types) ══ */
                                selectedLugeType ? (
                                    <div className="wizard-step-content wizard-extras-combined">
                                        <p className="wizard-hint">Customise your {panel.selectedSculpture?.name || 'luge'} below.</p>

                                        {/* ── TOPPER / TOP LOGO SECTION (Luge only — 3 options) ── */}
                                        <div className="extras-section">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <h3 className="extras-section-title" style={{ margin: 0 }}>Top Logo / Topper</h3>
                                                {lugeTopperOption && (
                                                    <button onClick={() => { setLugeTopperOption(null); setLugeTopperFile(null); }} style={{ fontSize: '0.7rem', color: 'var(--text-muted,#94a3b8)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}>
                                                        × Clear
                                                    </button>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                                Choose the style for the top of your luge
                                            </p>
                                            <div className="rp-picker-grid">
                                                <div
                                                    className={`rp-picker-item ${lugeTopperOption === 'round' ? 'selected' : ''}`}
                                                    onClick={() => { setLugeTopperOption('round'); setLugeTopperFile(null); }}
                                                >
                                                    <LazyImage src="https://res.cloudinary.com/daigcmtfz/image/upload/v1766237791/sidebar_images/Topper%20Logos/Oval%20logo%20for%20as%20topper.jpg" alt="Round" placeholderH="80px" />
                                                    <span className="rp-picker-label">Round</span>
                                                    {lugeTopperOption === 'round' && <div className="rp-picker-check"><Check size={14}/></div>}
                                                </div>
                                                <div
                                                    className={`rp-picker-item ${lugeTopperOption === 'crown' ? 'selected' : ''}`}
                                                    onClick={() => { setLugeTopperOption('crown'); setLugeTopperFile(null); }}
                                                >
                                                    <LazyImage src="https://res.cloudinary.com/daigcmtfz/image/upload/v1766237788/sidebar_images/Topper%20Logos/crown%20logo%20as%20topper.jpg" alt="Crown" placeholderH="80px" />
                                                    <span className="rp-picker-label">Crown</span>
                                                    {lugeTopperOption === 'crown' && <div className="rp-picker-check"><Check size={14}/></div>}
                                                </div>
                                                <div
                                                    className={`rp-picker-item ${lugeTopperOption === 'custom' ? 'selected' : ''}`}
                                                    onClick={() => setLugeTopperOption('custom')}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px', background: 'var(--surface-alt,#f0f4f8)', borderRadius: '8px', fontSize: '2rem' }}>✏️</div>
                                                    <span className="rp-picker-label">Custom</span>
                                                    {lugeTopperOption === 'custom' && <div className="rp-picker-check"><Check size={14}/></div>}
                                                </div>
                                            </div>

                                            {/* Custom topper: upload logo */}
                                            {lugeTopperOption === 'custom' && (
                                                <div style={{ marginTop: '0.75rem' }}>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                        Your logo outline shape will be used as the topper — white background with a blue ice border following the logo shape.
                                                    </p>
                                                    <div className="rp-upload-zone" onClick={() => lugeTopperInputRef.current?.click()}>
                                                        {lugeTopperFile ? (
                                                            <div className="rp-file-preview">
                                                                <img src={URL.createObjectURL(lugeTopperFile)} alt="custom topper" className="rp-thumb" />
                                                                <span className="rp-file-name">{lugeTopperFile.name}</span>
                                                                <button className="rp-remove" onClick={(e) => { e.stopPropagation(); setLugeTopperFile(null); }}><Trash2 size={14}/></button>
                                                            </div>
                                                        ) : (
                                                            <div className="rp-upload-placeholder">
                                                                <Upload size={18} /><span>Upload logo for custom topper</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input type="file" ref={lugeTopperInputRef} accept="image/*" onChange={e => { if (e.target.files[0]) setLugeTopperFile(e.target.files[0]); }} style={{ display: 'none' }} />
                                                </div>
                                            )}

                                            {/* Real-time demo preview */}
                                            {lugeTopperOption && lugeTopperOption !== 'custom' && (
                                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--surface-alt,#f0f4f8)', borderRadius: '12px', border: '1px solid var(--border,#e2e8f0)' }}>
                                                    <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary,#64748b)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                        How it looks on your luge
                                                    </p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        {panel.selectedSculpture?.image && (
                                                            <LazyImage
                                                                src={panel.selectedSculpture.image}
                                                                alt="Selected luge"
                                                                placeholderH="76px"
                                                                wrapStyle={{ width: '76px', height: '76px', borderRadius: '8px', background: 'var(--surface,#fff)', flexShrink: 0 }}
                                                                style={{ width: '76px', height: '76px', objectFit: 'contain' }}
                                                            />
                                                        )}
                                                        <span style={{ fontSize: '1.4rem', color: 'var(--text-muted,#94a3b8)', flexShrink: 0 }}>+</span>
                                                        <LazyImage
                                                            src={lugeTopperOption === 'round'
                                                                ? 'https://res.cloudinary.com/daigcmtfz/image/upload/v1766237791/sidebar_images/Topper%20Logos/Oval%20logo%20for%20as%20topper.jpg'
                                                                : 'https://res.cloudinary.com/daigcmtfz/image/upload/v1766237788/sidebar_images/Topper%20Logos/crown%20logo%20as%20topper.jpg'
                                                            }
                                                            alt="Topper"
                                                            placeholderH="76px"
                                                            wrapStyle={{ width: '76px', height: '76px', borderRadius: '8px', background: 'var(--surface,#fff)', flexShrink: 0 }}
                                                            style={{ width: '76px', height: '76px', objectFit: 'contain' }}
                                                        />
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted,#64748b)', margin: 0, flex: 1 }}>
                                                            The <strong>{lugeTopperOption}</strong> topper will sit on top of your {panel.selectedSculpture?.name || 'luge'}.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* ── LOGO PLACEMENT ── */}
                                        <div className="extras-section">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <h3 className="extras-section-title" style={{ margin: 0 }}>Logo</h3>
                                                {lugeLogoOption && (
                                                    <button onClick={() => { setLugeLogoOption(null); setLugeAddonLogoShape(null); updatePanel('logoFile', null); }} style={{ fontSize: '0.7rem', color: 'var(--text-muted,#94a3b8)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}>
                                                        × Clear
                                                    </button>
                                                )}
                                            </div>
                                            <div className="luge-option-cards">
                                                {[
                                                    { key: 'top',   label: 'Top Logo Only',   desc: 'Logo on the top surface of the luge' },
                                                    { key: 'addon', label: 'Add-on Logo Only', desc: 'Logo on the side / front face of the luge' },
                                                    { key: 'both',  label: 'Both',             desc: 'Top logo + add-on logo' },
                                                ].map(({ key, label, desc }) => (
                                                    <button
                                                        key={key}
                                                        className={`luge-option-card ${lugeLogoOption === key ? 'active' : ''}`}
                                                        onClick={() => { setLugeLogoOption(key); updatePanel('logoFile', null); }}
                                                    >
                                                        <span className="luge-option-label">{label}</span>
                                                        <span className="luge-option-desc">{desc}</span>
                                                        {lugeLogoOption === key && <div className="rp-picker-check" style={{position:'absolute',top:'0.5rem',right:'0.5rem'}}><Check size={14}/></div>}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Add-on logo shape selection — image cards */}
                                            {(lugeLogoOption === 'addon' || lugeLogoOption === 'both') && (
                                                <div style={{ marginTop: '0.75rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                        <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary,#475569)', margin: 0 }}>
                                                            Add-on Logo Shape
                                                        </p>
                                                        {lugeAddonLogoShape && (
                                                            <button onClick={() => setLugeAddonLogoShape(null)} style={{ fontSize: '0.7rem', color: 'var(--text-muted,#94a3b8)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}>
                                                                × Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                                        White area = where your logo goes
                                                    </p>
                                                    <div className="rp-picker-grid">
                                                        {/* Square */}
                                                        <div
                                                            className={`rp-picker-item ${lugeAddonLogoShape === 'square' ? 'selected' : ''}`}
                                                            onClick={() => setLugeAddonLogoShape('square')}
                                                        >
                                                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '80px' }}>
                                                                <rect width="100" height="100" fill="#0284c7"/>
                                                                <rect x="18" y="18" width="64" height="64" fill="white" rx="4"/>
                                                                <rect x="26" y="26" width="48" height="48" fill="#e0f2fe" rx="2" stroke="#7dd3fc" strokeWidth="1.5" strokeDasharray="4,2"/>
                                                                <text x="50" y="48" textAnchor="middle" fontSize="9" fill="#0ea5e9" fontFamily="sans-serif">YOUR</text>
                                                                <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#0ea5e9" fontFamily="sans-serif">LOGO</text>
                                                            </svg>
                                                            <span className="rp-picker-label">Square</span>
                                                            {lugeAddonLogoShape === 'square' && <div className="rp-picker-check"><Check size={14}/></div>}
                                                        </div>

                                                        {/* Round */}
                                                        <div
                                                            className={`rp-picker-item ${lugeAddonLogoShape === 'round' ? 'selected' : ''}`}
                                                            onClick={() => setLugeAddonLogoShape('round')}
                                                        >
                                                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '80px' }}>
                                                                <rect width="100" height="100" fill="#0284c7"/>
                                                                <circle cx="50" cy="50" r="38" fill="white"/>
                                                                <circle cx="50" cy="50" r="28" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1.5" strokeDasharray="4,2"/>
                                                                <text x="50" y="48" textAnchor="middle" fontSize="9" fill="#0ea5e9" fontFamily="sans-serif">YOUR</text>
                                                                <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#0ea5e9" fontFamily="sans-serif">LOGO</text>
                                                            </svg>
                                                            <span className="rp-picker-label">Round</span>
                                                            {lugeAddonLogoShape === 'round' && <div className="rp-picker-check"><Check size={14}/></div>}
                                                        </div>

                                                        {/* Custom Outline (Ice Butcher style) */}
                                                        <div
                                                            className={`rp-picker-item ${lugeAddonLogoShape === 'custom' ? 'selected' : ''}`}
                                                            onClick={() => setLugeAddonLogoShape('custom')}
                                                        >
                                                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '80px' }}>
                                                                <rect width="100" height="100" fill="#0284c7"/>
                                                                {/* outer blue ice shape following logo contour */}
                                                                <path d="M12,40 Q18,12 50,12 Q82,12 88,40 L90,68 Q84,90 50,90 Q16,90 10,68 Z" fill="#38bdf8"/>
                                                                {/* inner white sticker background */}
                                                                <path d="M20,42 Q24,20 50,20 Q76,20 80,42 L82,66 Q77,82 50,82 Q23,82 18,66 Z" fill="white"/>
                                                                <text x="50" y="48" textAnchor="middle" fontSize="9" fill="#0ea5e9" fontFamily="sans-serif">YOUR</text>
                                                                <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#0ea5e9" fontFamily="sans-serif">LOGO</text>
                                                            </svg>
                                                            <span className="rp-picker-label">Custom</span>
                                                            {lugeAddonLogoShape === 'custom' && <div className="rp-picker-check"><Check size={14}/></div>}
                                                        </div>
                                                    </div>

                                                    {/* Live preview when shape selected */}
                                                    {lugeAddonLogoShape && (
                                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--surface-alt,#f0f4f8)', borderRadius: '12px', border: '1px solid var(--border,#e2e8f0)' }}>
                                                            <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary,#64748b)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                                How it looks on your luge
                                                            </p>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                {panel.selectedSculpture?.image && (
                                                                    <LazyImage
                                                                        src={panel.selectedSculpture.image}
                                                                        alt="Luge"
                                                                        placeholderH="76px"
                                                                        wrapStyle={{ width: '76px', height: '76px', borderRadius: '8px', background: 'var(--surface,#fff)', flexShrink: 0 }}
                                                                        style={{ width: '76px', height: '76px', objectFit: 'contain' }}
                                                                    />
                                                                )}
                                                                <span style={{ fontSize: '1.4rem', color: 'var(--text-muted,#94a3b8)', flexShrink: 0 }}>+</span>
                                                                {/* Shape preview */}
                                                                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '64px', height: '64px', flexShrink: 0 }}>
                                                                    {lugeAddonLogoShape === 'square' && <>
                                                                        <rect width="100" height="100" fill="#0284c7" rx="8"/>
                                                                        <rect x="18" y="18" width="64" height="64" fill="white" rx="4"/>
                                                                        <rect x="26" y="26" width="48" height="48" fill="#e0f2fe" rx="2" stroke="#7dd3fc" strokeWidth="1.5" strokeDasharray="4,2"/>
                                                                    </>}
                                                                    {lugeAddonLogoShape === 'round' && <>
                                                                        <rect width="100" height="100" fill="#0284c7" rx="8"/>
                                                                        <circle cx="50" cy="50" r="38" fill="white"/>
                                                                        <circle cx="50" cy="50" r="28" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1.5" strokeDasharray="4,2"/>
                                                                    </>}
                                                                    {lugeAddonLogoShape === 'custom' && <>
                                                                        <rect width="100" height="100" fill="#0284c7" rx="8"/>
                                                                        <path d="M12,40 Q18,12 50,12 Q82,12 88,40 L90,68 Q84,90 50,90 Q16,90 10,68 Z" fill="#38bdf8"/>
                                                                        <path d="M20,42 Q24,20 50,20 Q76,20 80,42 L82,66 Q77,82 50,82 Q23,82 18,66 Z" fill="white"/>
                                                                    </>}
                                                                </svg>
                                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted,#64748b)', margin: 0, flex: 1 }}>
                                                                    {lugeAddonLogoShape === 'square' && 'Square ice holder on the front face — white background where your logo sits.'}
                                                                    {lugeAddonLogoShape === 'round' && 'Circular ice holder on the front face — white background where your logo sits.'}
                                                                    {lugeAddonLogoShape === 'custom' && 'Your logo outline shape — white sticker background with blue ice border following your logo contour.'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {lugeLogoOption && (
                                                <div style={{ marginTop: '0.75rem' }}>
                                                    <div className="rp-upload-zone" onClick={() => logoInputRef.current?.click()}>
                                                        {panel.logoFile ? (
                                                            <div className="rp-file-preview">
                                                                <img src={URL.createObjectURL(panel.logoFile)} alt="logo" className="rp-thumb" />
                                                                <span className="rp-file-name">{panel.logoFile.name}</span>
                                                                <button className="rp-remove" onClick={(e) => { e.stopPropagation(); updatePanel('logoFile', null); }}><Trash2 size={14}/></button>
                                                            </div>
                                                        ) : (
                                                            <div className="rp-upload-placeholder">
                                                                <Upload size={18} /><span>Upload logo</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input type="file" ref={logoInputRef} accept="image/*" onChange={handlePanelLogoChange} style={{ display: 'none' }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* ── ICE FINISH ── */}
                                        <div className="extras-section">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <h3 className="extras-section-title" style={{ margin: 0 }}>Ice Finish</h3>
                                                {lugeFinish && (
                                                    <button onClick={() => setLugeFinish(null)} style={{ fontSize: '0.7rem', color: 'var(--text-muted,#94a3b8)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}>
                                                        × Clear
                                                    </button>
                                                )}
                                            </div>
                                            <div className="luge-option-cards">
                                                {[
                                                    { key: 'snowfilled',       label: 'Snowfilled',         desc: 'Frosted white interior — snofilled effect' },
                                                    { key: 'color',            label: 'Color',              desc: 'Colored ice with a tinted look' },
                                                    { key: 'paper',            label: 'Paper',              desc: 'Printed paper label applied to the ice' },
                                                    { key: 'paper-snowfilled', label: 'Paper + Snowfilled', desc: 'Printed paper combined with snofilled effect' },
                                                ].map(({ key, label, desc }) => (
                                                    <button
                                                        key={key}
                                                        className={`luge-option-card ${lugeFinish === key ? 'active' : ''}`}
                                                        onClick={() => setLugeFinish(lugeFinish === key ? null : key)}
                                                    >
                                                        <span className="luge-option-label">{label}</span>
                                                        <span className="luge-option-desc">{desc}</span>
                                                        {lugeFinish === key && <div className="rp-picker-check" style={{position:'absolute',top:'0.5rem',right:'0.5rem'}}><Check size={14}/></div>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* ── FRONT DECORATIVE PIECE ── */}
                                        <div className="extras-section">
                                            <h3 className="extras-section-title">Front Decorative Piece</h3>
                                            <div className="rp-toggle-row">
                                                <span>Add a front decorative piece?</span>
                                                <div className="rp-toggle-btns">
                                                    <button className={`rp-toggle-btn ${wantFrontPiece ? 'active' : ''}`} onClick={() => setWantFrontPiece(true)}>Yes</button>
                                                    <button className={`rp-toggle-btn ${!wantFrontPiece ? 'active' : ''}`} onClick={() => { setWantFrontPiece(false); setLugeFrontPieceDesc(''); }}>No</button>
                                                </div>
                                            </div>
                                            {wantFrontPiece && (
                                                <textarea
                                                    className="wizard-textarea"
                                                    placeholder="Describe the front decorative piece (e.g. logo, motif, company name)..."
                                                    value={lugeFrontPieceDesc}
                                                    onChange={e => setLugeFrontPieceDesc(e.target.value)}
                                                    rows={3}
                                                    style={{ marginTop: '0.75rem' }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                ) : (
                                /* ══ STANDARD EXTRAS (non-luge sculptures) ══ */
                                    <div className="wizard-step-content wizard-extras-combined">
                                        <p className="wizard-hint">Customise your sculpture with a base, topper, and logo.</p>

                                        {/* ── BASE SECTION ── */}
                                        <div className="extras-section">
                                        <h3 className="extras-section-title">Base</h3>
                                        <div className="rp-toggle-row">
                                            <span>Add a base?</span>
                                            <div className="rp-toggle-btns">
                                                <button className={`rp-toggle-btn ${wantBase ? 'active' : ''}`} onClick={() => setWantBase(true)}>Yes</button>
                                                <button className={`rp-toggle-btn ${!wantBase ? 'active' : ''}`} onClick={() => { setWantBase(false); updatePanel('selectedBase', null); updatePanel('customBaseFile', null); }}>No</button>
                                            </div>
                                        </div>
                                        {wantBase && (
                                            <>
                                                <div className="rp-picker-grid">
                                                    {categoryItems.bases.map((item, i) => (
                                                        <div key={i} className={`rp-picker-item ${panel.selectedBase?.name === item.name ? 'selected' : ''}`} onClick={() => selectBase(item)}>
                                                            <LazyImage src={item.image} alt={item.name} placeholderH="80px" />
                                                            <span className="rp-picker-label">{item.name}</span>
                                                            {panel.selectedBase?.name === item.name && <div className="rp-picker-check"><Check size={14}/></div>}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="rp-or-divider"><span>or</span></div>
                                                <div className="rp-upload-zone" onClick={() => customBaseInputRef.current?.click()}>
                                                    {panel.customBaseFile ? (
                                                        <div className="rp-file-preview">
                                                            <img src={URL.createObjectURL(panel.customBaseFile)} alt="custom" className="rp-thumb" />
                                                            <span className="rp-file-name">{panel.customBaseFile.name}</span>
                                                            <button className="rp-remove" onClick={(e) => { e.stopPropagation(); updatePanel('customBaseFile', null); }}><Trash2 size={14}/></button>
                                                        </div>
                                                    ) : (
                                                        <div className="rp-upload-placeholder">
                                                            <Upload size={18} />
                                                            <span>Upload custom base image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <input type="file" ref={customBaseInputRef} accept="image/*" onChange={handleCustomBase} style={{ display: 'none' }} />
                                            </>
                                        )}
                                    </div>

                                    {/* ── TOPPER SECTION ── */}
                                    <div className="extras-section">
                                        <h3 className="extras-section-title">Topper</h3>
                                        <div className="rp-toggle-row">
                                            <span>Add a topper?</span>
                                            <div className="rp-toggle-btns">
                                                <button className={`rp-toggle-btn ${wantTopper ? 'active' : ''}`} onClick={() => setWantTopper(true)}>Yes</button>
                                                <button className={`rp-toggle-btn ${!wantTopper ? 'active' : ''}`} onClick={() => { setWantTopper(false); updatePanel('selectedTopper', null); updatePanel('customTopperFile', null); }}>No</button>
                                            </div>
                                        </div>
                                        {wantTopper && (
                                            <>
                                                <div className="rp-picker-grid">
                                                    {categoryItems.toppers.map((item, i) => (
                                                        <div key={i} className={`rp-picker-item ${panel.selectedTopper?.name === item.name ? 'selected' : ''}`} onClick={() => selectTopper(item)}>
                                                            <LazyImage src={item.image} alt={item.name} placeholderH="80px" />
                                                            <span className="rp-picker-label">{item.name}</span>
                                                            {panel.selectedTopper?.name === item.name && <div className="rp-picker-check"><Check size={14}/></div>}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="rp-or-divider"><span>or</span></div>
                                                <div className="rp-upload-zone" onClick={() => customTopperInputRef.current?.click()}>
                                                    {panel.customTopperFile ? (
                                                        <div className="rp-file-preview">
                                                            <img src={URL.createObjectURL(panel.customTopperFile)} alt="custom" className="rp-thumb" />
                                                            <span className="rp-file-name">{panel.customTopperFile.name}</span>
                                                            <button className="rp-remove" onClick={(e) => { e.stopPropagation(); updatePanel('customTopperFile', null); }}><Trash2 size={14}/></button>
                                                        </div>
                                                    ) : (
                                                        <div className="rp-upload-placeholder">
                                                            <Upload size={18} />
                                                            <span>Upload custom topper image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <input type="file" ref={customTopperInputRef} accept="image/*" onChange={handleCustomTopper} style={{ display: 'none' }} />
                                            </>
                                        )}
                                    </div>

                                    {/* ── LOGO SECTION ── */}
                                    <div className="extras-section">
                                        <h3 className="extras-section-title">Logo</h3>
                                        <div className="rp-toggle-row">
                                            <span>Add a logo?</span>
                                            <div className="rp-toggle-btns">
                                                <button className={`rp-toggle-btn ${wantLogo ? 'active' : ''}`} onClick={() => setWantLogo(true)}>Yes</button>
                                                <button className={`rp-toggle-btn ${!wantLogo ? 'active' : ''}`} onClick={() => { setWantLogo(false); updatePanel('logoFile', null); }}>No</button>
                                            </div>
                                        </div>
                                        {wantLogo && (
                                            <>
                                                <div className="rp-upload-zone" onClick={() => logoInputRef.current?.click()}>
                                                    {panel.logoFile ? (
                                                        <div className="rp-file-preview">
                                                            <img src={URL.createObjectURL(panel.logoFile)} alt="logo" className="rp-thumb" />
                                                            <span className="rp-file-name">{panel.logoFile.name}</span>
                                                            <button className="rp-remove" onClick={(e) => { e.stopPropagation(); updatePanel('logoFile', null); }}><Trash2 size={14}/></button>
                                                        </div>
                                                    ) : (
                                                        <div className="rp-upload-placeholder">
                                                            <Upload size={18} />
                                                            <span>Upload logo</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <input type="file" ref={logoInputRef} accept="image/*" onChange={handlePanelLogoChange} style={{ display: 'none' }} />
                                            </>
                                        )}
                                    </div>
                                    </div>
                                )}
                                </>
                            )}

                            {/* ---- CUSTOM STEP 3: REFERENCES ---- */}
                            {buildMode === 'custom-build' && wizardStep === 3 && (
                                <div className="wizard-step-content">
                                    <p className="wizard-hint">Add reference images and notes to guide the AI.</p>
                                    <div className="rp-upload-zone" onClick={() => referenceInputRef.current?.click()}>
                                        <div className="rp-upload-placeholder">
                                            <Upload size={18} />
                                            <span>Add reference images (up to 3)</span>
                                        </div>
                                    </div>
                                    <input type="file" ref={referenceInputRef} accept="image/*" multiple onChange={handlePanelReferenceChange} style={{ display: 'none' }} />
                                    {panel.referenceFiles.length > 0 && (
                                        <div className="rp-ref-list">
                                            {panel.referenceFiles.map((file, i) => (
                                                <div key={i} className="rp-ref-item">
                                                    <img src={URL.createObjectURL(file)} alt="ref" className="rp-thumb-sm" />
                                                    <span>{file.name}</span>
                                                    <button className="rp-remove" onClick={() => removePanelReference(i)}><Trash2 size={12}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <textarea className="rp-textarea" value={panel.referenceNotes} onChange={(e) => updatePanel('referenceNotes', e.target.value)} placeholder="Notes about references..." rows={3} />
                                </div>
                            )}

                            {/* ---- CUSTOM STEP 4: DETAILS ---- */}
                            {buildMode === 'custom-build' && wizardStep === 4 && (
                                <>
                                    {renderDetailsStep()}
                                </>
                            )}

                            {/* ---- CUSTOM STEP 5: REVIEW ---- */}
                            {buildMode === 'custom-build' && wizardStep === 5 && (
                                <div className="wizard-step-content wizard-review">
                                    <p className="wizard-hint">Review your selections before generating.</p>
                                    <div className="review-grid">
                                        {/* Category */}
                                        <div className="review-item">
                                            <span className="review-label">Category</span>
                                            <span className="review-value">{sculptureCategoryMap.find(c => c.key === sculptureCategory)?.label || <em>None</em>}</span>
                                        </div>

                                        {/* Sculpture (not shown for Standard Showpiece which uses base as primary) */}
                                        {sculptureCategory !== 'Standard Showpiece' && (
                                            <div className="review-item">
                                                <span className="review-label">Sculpture</span>
                                                <span className="review-value">
                                                    {panel.selectedSculpture ? panel.selectedSculpture.name
                                                        : panel.customSculptureFile ? `Custom: ${panel.customSculptureFile.name}`
                                                        : <em>None selected</em>}
                                                </span>
                                            </div>
                                        )}

                                        {/* 3D Showpiece / Seafood Display logo */}
                                        {(sculptureCategory === '3D Showpiece' || sculptureCategory === 'Seafood Display') && (
                                            <div className="review-item">
                                                <span className="review-label">Logo</span>
                                                <span className="review-value">
                                                    {!wantLogo ? 'No logo'
                                                     : threeDLogoStyle ? `${threeDLogoStyle} style${panel.logoFile ? ` — ${panel.logoFile.name}` : ''}`
                                                     : <em>Style not chosen</em>}
                                                </span>
                                            </div>
                                        )}

                                        {/* Standard Showpiece */}
                                        {sculptureCategory === 'Standard Showpiece' && (
                                            <>
                                                <div className="review-item">
                                                    <span className="review-label">Base</span>
                                                    <span className="review-value">{panel.selectedBase ? panel.selectedBase.name : <em>None selected</em>}</span>
                                                </div>
                                                <div className="review-item">
                                                    <span className="review-label">Add-on Logo</span>
                                                    <span className="review-value">
                                                        {!standardLogoShape || standardLogoShape === 'none' ? 'No logo'
                                                         : `${standardLogoShape} shape${panel.logoFile ? ` — ${panel.logoFile.name}` : ''}`}
                                                    </span>
                                                </div>
                                                <div className="review-item">
                                                    <span className="review-label">Text / Content</span>
                                                    <span className="review-value">
                                                        {!standardTextOption || standardTextOption === 'none' ? 'None'
                                                         : standardTextOption === 'names' ? `Names/words${standardText ? `: "${standardText}"` : ''}`
                                                         : standardTextOption === 'images' ? 'Image element'
                                                         : `Names + image${standardText ? `: "${standardText}"` : ''}`}
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        {/* Luge-specific */}
                                        {selectedLugeType && (
                                            <>
                                                <div className="review-item">
                                                    <span className="review-label">Logo Placement</span>
                                                    <span className="review-value">
                                                        {lugeLogoOption === 'top' ? 'Top only' : lugeLogoOption === 'addon' ? 'Add-on only' : lugeLogoOption === 'both' ? 'Top + add-on' : <em>None</em>}
                                                        {panel.logoFile && ` — ${panel.logoFile.name}`}
                                                    </span>
                                                </div>
                                                <div className="review-item">
                                                    <span className="review-label">Ice Finish</span>
                                                    <span className="review-value">
                                                        {lugeFinish === 'snowfilled' ? 'Snowfilled' : lugeFinish === 'color' ? 'Color' : lugeFinish === 'paper' ? 'Paper' : lugeFinish === 'paper-snowfilled' ? 'Paper + Snowfilled' : <em>None</em>}
                                                    </span>
                                                </div>
                                                <div className="review-item">
                                                    <span className="review-label">Front Piece</span>
                                                    <span className="review-value">
                                                        {wantFrontPiece ? (lugeFrontPieceDesc || 'Yes (no description)') : 'No'}
                                                    </span>
                                                </div>
                                                {lugeTopperOption && (
                                                    <div className="review-item">
                                                        <span className="review-label">Topper</span>
                                                        <span className="review-value">
                                                            {lugeTopperOption === 'round' ? 'Round'
                                                             : lugeTopperOption === 'crown' ? 'Crown'
                                                             : `Custom${lugeTopperFile ? ` (${lugeTopperFile.name})` : ' — no file uploaded'}`}
                                                        </span>
                                                    </div>
                                                )}
                                                {(lugeLogoOption === 'addon' || lugeLogoOption === 'both') && lugeAddonLogoShape && (
                                                    <div className="review-item">
                                                        <span className="review-label">Add-on Shape</span>
                                                        <span className="review-value">
                                                            {lugeAddonLogoShape === 'square' ? 'Square'
                                                             : lugeAddonLogoShape === 'round' ? 'Round'
                                                             : 'Custom Outline'}
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* Standard extras (Ice Bar / plain Luge) */}
                                        {!selectedLugeType && !['3D Showpiece','Seafood Display','Standard Showpiece','Ice Cubes'].includes(sculptureCategory) && (
                                            <>
                                                <div className="review-item">
                                                    <span className="review-label">Base</span>
                                                    <span className="review-value">{!wantBase ? 'No base' : panel.selectedBase?.name || panel.customBaseFile?.name || <em>None</em>}</span>
                                                </div>
                                                <div className="review-item">
                                                    <span className="review-label">Topper</span>
                                                    <span className="review-value">{!wantTopper ? 'No topper' : panel.selectedTopper?.name || panel.customTopperFile?.name || <em>None</em>}</span>
                                                </div>
                                                <div className="review-item">
                                                    <span className="review-label">Logo</span>
                                                    <span className="review-value">{!wantLogo ? 'No logo' : panel.logoFile?.name || <em>None uploaded</em>}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className="review-item">
                                            <span className="review-label">References</span>
                                            <span className="review-value">{panel.referenceFiles.length > 0 ? `${panel.referenceFiles.length} file(s)` : <em>None</em>}</span>
                                        </div>
                                        <div className="review-item">
                                            <span className="review-label">Notes</span>
                                            <span className="review-value">{panel.additionalPrompt || panel.referenceNotes || <em>None</em>}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>{/* end .wizard-body */}

                        {/* Footer */}
                        <div className="wizard-footer">
                            {wizardStep > 0 && (
                                <button className="wizard-btn wizard-btn-back" onClick={() => {
                                    if (wizardStep === 1) { setBuildMode(''); }
                                    setWizardStep(s => s - 1);
                                }}>
                                    <ArrowLeft size={16} /> Back
                                </button>
                            )}
                            <div className="wizard-footer-spacer" />
                            {wizardStep === 0 ? null : wizardStep < currentSteps.length - 1 ? (
                                <button className="wizard-btn wizard-btn-next" onClick={() => setWizardStep(s => s + 1)}>
                                    Next <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button className="wizard-btn wizard-btn-generate" onClick={() => {
                                    if (buildMode === 'text-to-image') handleTextToImageGenerate();
                                    else if (buildMode === 'image-to-image') handleImageToImageGenerate();
                                    else if (buildMode === 'video') handleVideoGenerate();
                                    else if (buildMode === 'edit') handleEditGenerate();
                                    else handlePanelGenerate();
                                }} disabled={isLoading}>
                                    <Sparkles size={16} /> Generate Preview
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <TemplateGalleryModal
                isOpen={galleryOpen}
                onClose={() => setGalleryOpen(false)}
            />

            <FeedbackModal
                isOpen={feedbackModalOpen}
                onClose={() => setFeedbackModalOpen(false)}
                imageUrl={selectedImage}
            />

            <ImagePreviewModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                imageUrl={selectedImage}
                onConfirmEdit={handleEditConfirm}
            />

            {showTour && (
                <GuidedTour
                    onComplete={() => setShowTour(false)}
                    setWizardOpen={setWizardOpen}
                    setWizardStep={setWizardStep}
                    setBuildMode={setBuildMode}
                    setSculptureCategory={setSculptureCategory}
                />
            )}

            <IceChatWidget />

            <ShowcaseGallery isOpen={showcaseOpen} onClose={() => setShowcaseOpen(false)} />

        </div >
    );
};

export default ChatInterface;
