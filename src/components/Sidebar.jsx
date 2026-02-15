import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Menu, X, Wand2, PanelLeft } from 'lucide-react';
import sidebarImages from '../assets/sidebar_images.json';

const SidebarImage = ({ src, alt }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <>
            {!loaded && <div className="image-skeleton"></div>}
            <img
                src={src}
                alt={alt}
                className={`sidebar-image ${!loaded ? 'hidden' : ''}`}
                onLoad={() => setLoaded(true)}
                onError={(e) => {
                    e.target.src = 'https://placehold.co/60x80?text=No+Image';
                    setLoaded(true);
                }}
            />
        </>
    );
};

const Sidebar = ({ onSelectTemplate, isOpen, toggleSidebar, selectedTemplate }) => {
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeSubCategory, setActiveSubCategory] = useState(null);
    const [templateCategories, setTemplateCategories] = useState([]);

    useEffect(() => {
        // Transform flat data from JSON into nested structure
        const categoriesMap = {};

        sidebarImages.forEach(item => {
            // Map database categories to UI structure
            let mainCategory = "Other";
            let subCategory = null;

            if (["Ludges", "Sculptures", "Mini Showpieces", "3d", "Ice Bars", "Ice Cubes"].includes(item.category)) {
                mainCategory = "Sculpture Type";
                if (item.category === "Ludges") subCategory = "Luges";
                else if (item.category === "Sculptures") subCategory = "Showpiece";
                else subCategory = item.category;
            } else if (item.category === "Bases") {
                mainCategory = "Bases";
            } else if (item.category === "Toppers") {
                mainCategory = "Toppers";
            } else if (item.category === "Topper Logos") {
                mainCategory = "Logos";
            } else if (item.category === "Wedding Showpieces") {
                mainCategory = "Sculpture Type";
                subCategory = "Wedding";
            }

            // Initialize Main Category
            if (!categoriesMap[mainCategory]) {
                categoriesMap[mainCategory] = {
                    name: mainCategory,
                    subCategories: {},
                    items: []
                };
            }

            const newItem = {
                type: item.label,
                name: item.label,
                image: item.url,
                category: item.category
            };

            if (subCategory) {
                // Initialize Sub Category
                if (!categoriesMap[mainCategory].subCategories[subCategory]) {
                    categoriesMap[mainCategory].subCategories[subCategory] = {
                        name: subCategory,
                        items: []
                    };
                }
                categoriesMap[mainCategory].subCategories[subCategory].items.push(newItem);
            } else {
                categoriesMap[mainCategory].items.push(newItem);
            }
        });

        // Convert map to array
        const formattedCategories = Object.values(categoriesMap).map(cat => ({
            name: cat.name,
            items: cat.items,
            subCategories: Object.keys(cat.subCategories).length > 0
                ? Object.values(cat.subCategories)
                : undefined
        }));

        // Sort categories
        const order = ["Sculpture Type", "Bases", "Toppers", "Logos", "Size"];
        formattedCategories.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

        setTemplateCategories(formattedCategories);
    }, []);

    const toggleCategory = (categoryName) => {
        setActiveCategory(activeCategory === categoryName ? null : categoryName);
        setActiveSubCategory(null); // Reset subcategory when switching main category
    };

    const toggleSubCategory = (e, subCategoryName) => {
        e.stopPropagation(); // Prevent triggering parent toggle
        setActiveSubCategory(activeSubCategory === subCategoryName ? null : subCategoryName);
    };

    return (
        <>
            <div id="sidebar" className={`${!isOpen ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">

                    <button
                        id="toggleSidebarBtn"
                        onClick={toggleSidebar}
                        title="Collapse Sidebar"
                    >
                        {isOpen ? <PanelLeft size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <div className="sidebar-content">
                    <button className="new-rendering-btn" onClick={() => window.location.reload()}>
                        <Wand2 size={18} />
                        <span>New Rendering</span>
                    </button>

                    {templateCategories.map((category) => (
                        <div key={category.name} className="menu-item-container">
                            <div
                                className={`menu-category ${activeCategory === category.name ? 'active' : ''}`}
                                onClick={() => toggleCategory(category.name)}
                            >
                                <div className="category-info">
                                    {isOpen && <span>{category.name}</span>}
                                </div>
                                {isOpen && (activeCategory === category.name ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                            </div>

                            {isOpen && activeCategory === category.name && (
                                <div className="category-content">
                                    {category.subCategories ? (
                                        category.subCategories.map((sub) => (
                                            <div key={sub.name} className="sub-category-container">
                                                <div
                                                    className={`sub-category ${activeSubCategory === sub.name ? 'active' : ''}`}
                                                    onClick={(e) => toggleSubCategory(e, sub.name)}
                                                >
                                                    <span>{sub.name}</span>
                                                </div>
                                                {activeSubCategory === sub.name && (
                                                    <div className="dropdown-content">
                                                        {sub.items.length > 0 ? (
                                                            sub.items.map((item) => (
                                                                <div
                                                                    key={item.type}
                                                                    className={`dropdown-item ${selectedTemplate?.type === item.type ? 'active' : ''}`}
                                                                    onClick={() => onSelectTemplate(item)}
                                                                >
                                                                    <SidebarImage src={item.image} alt={item.name} />
                                                                    <span>{item.name}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="no-items">No items</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="dropdown-content">
                                            {category.items && category.items.length > 0 ? (
                                                category.items.map((item) => (
                                                    <div
                                                        key={item.type}
                                                        className={`dropdown-item ${selectedTemplate?.type === item.type ? 'active' : ''}`}
                                                        onClick={() => onSelectTemplate(item)}
                                                    >
                                                        <SidebarImage src={item.image} alt={item.name} />
                                                        <span>{item.name}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-items">No items</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
