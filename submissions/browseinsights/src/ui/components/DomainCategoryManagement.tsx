import React, { useState, useEffect } from 'react';
import { CategorySelector } from './CategorySelector';
import {CategoryName} from "../../types/categories";
import {categoryMetadata} from "../../analytics/utils";

interface UserCategory {
    domain: string;
    category: CategoryName;
}

interface DomainCategoryManagerProps {
    userCategories: UserCategory[];
    onUpdate: (domain: string, category: CategoryName) => Promise<void>;
    onDelete: (domain: string) => Promise<void>;
}

export const DomainCategoryManager: React.FC<DomainCategoryManagerProps> = ({
                                                                                userCategories,
                                                                                onUpdate,
                                                                                onDelete
                                                                            }) => {
    const [newDomain, setNewDomain] = useState('');
    const [newCategory, setNewCategory] = useState<CategoryName>('uncategorized');
    const [isAdding, setIsAdding] = useState(false);
    const [search, setSearch] = useState('');

    // Filter categories based on search
    const filteredCategories = search.trim() === ''
        ? userCategories
        : userCategories.filter(cat =>
            cat.domain.toLowerCase().includes(search.toLowerCase()) ||
            categoryMetadata[cat.category].name.toLowerCase().includes(search.toLowerCase())
        );

    const handleAddCategory = async () => {
        if (!newDomain) return;

        await onUpdate(newDomain, newCategory);
        setNewDomain('');
        setNewCategory('uncategorized');
        setIsAdding(false);
    };

    return (
        <div className="domain-category-manager">
            <h2>Custom Website Categories</h2>

    <div className="search-container">
    <input
        type="text"
    placeholder="Search domains..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="search-input"
        />
        </div>

        <div className="category-list">
        {filteredCategories.length === 0 ? (
                <div className="no-categories">
                    No custom categories found
                </div>
) : (
        <table className="category-table">
            <thead>
                <tr>
                    <th>Domain</th>
            <th>Category</th>
            <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {filteredCategories.map(({ domain, category }) => (
                    <tr key={domain}>
                    <td>{domain}</td>
                    <td>
                    <span
                        className="category-badge"
                style={{ backgroundColor: categoryMetadata[category].color }}
>
    {categoryMetadata[category].name}
    </span>
    </td>
    <td>
    <button
        onClick={() => onDelete(domain)}
    className="delete-button"
    title="Remove custom category"
        >
        &times;
    </button>
    </td>
    </tr>
))}
    </tbody>
    </table>
)}
    </div>

    <div className="add-category-section">
        {isAdding ? (
                    <div className="add-category-form">
                    <input
                        type="text"
                placeholder="Domain (e.g., example.com)"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
    className="domain-input"
    />

    <CategorySelector
        selectedCategory={newCategory}
    onChange={setNewCategory}
    showLabel={false}
    />

    <div className="form-actions">
    <button
        onClick={handleAddCategory}
    disabled={!newDomain}
    className="save-button"
        >
        Save
        </button>
        <button
    onClick={() => setIsAdding(false)}
    className="cancel-button"
        >
        Cancel
        </button>
        </div>
        </div>
) : (
        <button
            onClick={() => setIsAdding(true)}
    className="add-button"
        >
        Add Custom Category
    </button>
)}
    </div>
    </div>
);
};