import React, { useState, useEffect } from 'react';
import { CategoryClassifier } from '../../analytics/categories';
import { CategorySelector } from '../components/CategorySelector';
import './QuickCategorize.css';
import {categoryMetadata} from "../../analytics/utils";
import {CategoryName} from "../../types/categories";

export const QuickCategorize: React.FC = () => {
    const [currentDomain, setCurrentDomain] = useState('');
    const [currentUrl, setCurrentUrl] = useState('');
    const [currentCategory, setCurrentCategory] = useState<CategoryName>('uncategorized');
    const [classifier, setClassifier] = useState<CategoryClassifier | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updated, setUpdated] = useState(false);

    useEffect(() => {
        // Get current tab info
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tab = tabs[0];
            if (tab && tab.url) {
                const url = new URL(tab.url);
                const domain = url.hostname;

                setCurrentUrl(tab.url);
                setCurrentDomain(domain);

                // Initialize classifier and get current category
                const newClassifier = new CategoryClassifier();
                setClassifier(newClassifier);

                // Wait a moment for the classifier to load user data
                setTimeout(async () => {
                    const category = await newClassifier.classifyUrl(domain, tab.url, tab.title);
                    setCurrentCategory(category);
                }, 100);
            }
        });
    }, []);

    const handleCategoryChange = async (category: CategoryName) => {
        if (!classifier || !currentDomain) return;

        setIsUpdating(true);

        try {
            await classifier.updateCategoryForDomain(currentDomain, category);
            setCurrentCategory(category);
            setUpdated(true);

            // Reset updated flag after 2 seconds
            setTimeout(() => setUpdated(false), 2000);
        } catch (error) {
            console.error('Failed to update category:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="quick-categorize">
            <header className="quick-header">
                <h1>Categorize Website</h1>
            </header>

            <main className="quick-content">
                <div className="current-site">
                    <div className="site-icon">
                        {currentDomain && (
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${currentDomain}&sz=32`}
                                alt="Site icon"
                            />
                        )}
                    </div>
                    <div className="site-info">
                        <div className="site-domain">{currentDomain}</div>
                        <div className="site-url">{currentUrl}</div>
                    </div>
                </div>

                <div className="current-category">
                    <span className="category-label">Current Category:</span>
                    <span
                        className="category-value"
                        style={{ backgroundColor: categoryMetadata[currentCategory].color }}
                    >
            {categoryMetadata[currentCategory].name}
          </span>
                </div>

                <div className="category-selection">
                    <h3>Set Custom Category</h3>
                    <CategorySelector
                        selectedCategory={currentCategory}
                        onChange={handleCategoryChange}
                        showLabel={false}
                    />
                </div>
            </main>

            {isUpdating && (
                <div className="update-notification">Updating...</div>
            )}
            {updated && (
                <div className="update-notification">Category updated!</div>
            )}
        </div>
    );
}