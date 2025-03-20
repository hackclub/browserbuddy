import React, { useState, useEffect } from 'react';
import {categoryMetadata} from "../../analytics/utils";
import {CategoryName} from "../../types/categories";

interface CategorySelectorProps {
    selectedCategory: CategoryName;
    onChange: (category: CategoryName) => void;
    showLabel?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
                                                                      selectedCategory,
                                                                      onChange,
                                                                      showLabel = true
                                                                  }) => {
    const categories = Object.entries(categoryMetadata) as [CategoryName, {name: string, color: string}][];

    return (
        <div className="category-selector">
            {showLabel && <label className="category-label">Category:</label>}
            <div className="category-options">
                {categories.map(([category, meta]) => (
                    <button
                        key={category}
                        className={`category-option ${selectedCategory === category ? 'selected' : ''}`}
                        style={{
                            backgroundColor: selectedCategory === category ? meta.color : 'transparent',
                            borderColor: meta.color,
                            color: selectedCategory === category ? '#fff' : '#333'
                        }}
                        onClick={() => onChange(category)}
                        title={meta.name}
                    >
                        {meta.name}
                    </button>
                ))}
            </div>
        </div>
    );
};