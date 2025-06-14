import React, { useState, useEffect } from 'react';
import { CategoryClassifier } from '../../analytics/categories';
import './Settings.css';
import '../components/CategoryManager.css';
import {CategoryName} from "../../types/categories";
import { DomainCategoryManager } from '../components/DomainCategoryManagement';

interface UserCategory {
    domain: string;
    category: CategoryName;
}

export const Settings = () => {
    const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
    const [classifier, setClassifier] = useState<CategoryClassifier | null>(null);
    const [settingsUpdated, setSettingsUpdated] = useState(false);

    useEffect(() => {
        const initClassifier = async () => {
            const newClassifier = new CategoryClassifier();
            setClassifier(newClassifier);

            // Load existing categories
            setTimeout(() => {
                const userDefined = newClassifier.getUserDefinedCategories();
                setUserCategories(userDefined);
            }, 100); // Small delay to ensure storage is loaded
        };

        initClassifier();
    }, []);

    const handleCategoryUpdate = async (domain: string, category: CategoryName) => {
        if (!classifier) return;

        await classifier.updateCategoryForDomain(domain, category);

        // Update the UI
        const updatedCategories = classifier.getUserDefinedCategories();
        setUserCategories(updatedCategories);
        setSettingsUpdated(true);

        // Reset notification after 2 seconds
        setTimeout(() => setSettingsUpdated(false), 2000);
    };

    const handleCategoryDelete = async (domain: string) => {
        if (!classifier) return;

        await classifier.deleteUserDefinedCategory(domain);

        // Update the UI
        const updatedCategories = classifier.getUserDefinedCategories();
        setUserCategories(updatedCategories);
        setSettingsUpdated(true);

        // Reset notification after 2 seconds
        setTimeout(() => setSettingsUpdated(false), 2000);
    };

    return (
        <div className="settings-container">
            <header className="settings-header">
                <h1>BrowseInsight Settings</h1>
            </header>

            <main className="settings-content">
                <section className="settings-section">
                    <DomainCategoryManager
                        userCategories={userCategories}
                        onUpdate={handleCategoryUpdate}
                        onDelete={handleCategoryDelete}
                    />
                </section>

                {/* todo: add more categories */}

                {settingsUpdated && (
                    <div className="settings-notification">
                        Settings updated successfully!
                    </div>
                )}
            </main>
        </div>
    );
};