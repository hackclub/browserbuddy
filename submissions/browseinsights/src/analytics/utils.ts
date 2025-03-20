// Create a map for faster lookup
import domainCategories from "../data/categorization";
import {CategoryName} from "../types/categories";

const domainCategoryMap = new Map<string, string[]>();

domainCategories.forEach(entry => {
    domainCategoryMap.set(entry.domain, entry.categories);
});

// Function to normalize domains for matching
function normalizeDomain(domain: string): string {
    // Remove protocol, www, and trailing slashes
    return domain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
}

export function getCategoriesForDomain(domain: string): string[] {
    const normalizedDomain = normalizeDomain(domain);

    // Exact match
    if (domainCategoryMap.has(normalizedDomain)) {
        return domainCategoryMap.get(normalizedDomain) || [];
    }

    // Try to match parent domain
    const parts = normalizedDomain.split(".");
    if (parts.length > 2) {
        const parentDomain = parts.slice(-2).join(".");
        if (domainCategoryMap.has(parentDomain)) {
            return domainCategoryMap.get(parentDomain) || [];
        }
    }

    return [];
}

// Helper function to map from IAB categories to our simplified categories
export function mapToInternalCategory(iabCategories: string[]): CategoryName {
    // Check each IAB category and map to our internal category
    for (const category of iabCategories) {
        const lowerCategory = category.toLowerCase();

        if (lowerCategory.includes("social media") || lowerCategory.includes("social networking") || lowerCategory.includes("networking")) {
            return "social";
        }

        if (lowerCategory.includes("shopping") || lowerCategory.includes("retail")) {
            return "shopping";
        }

        if (lowerCategory.includes("education") || lowerCategory.includes("reference")) {
            return "education";
        }

        if (lowerCategory.includes("business") || lowerCategory.includes("careers") || lowerCategory.includes("finance")) {
            return "work";
        }

        if (lowerCategory.includes("news") || lowerCategory.includes("weather")) {
            return "news";
        }

        if (lowerCategory.includes("entertainment") || lowerCategory.includes("arts")) {
            return "entertainment";
        }

        if (lowerCategory.includes("video") || lowerCategory.includes("television") || lowerCategory.includes("movie")) {
            return "video";
        }

        if (lowerCategory.includes("game") || lowerCategory.includes("gaming")) {
            return "games";
        }

        if (lowerCategory.includes("technology") || lowerCategory.includes("computing") || lowerCategory.includes("programming")) {
            return "technology";
        }

        if (lowerCategory.includes("health") || lowerCategory.includes("medicine")) {
            return "health";
        }

        if (lowerCategory.includes("travel") || lowerCategory.includes("tourism")) {
            return "travel";
        }

        if (lowerCategory.includes("real estate")) {
            return "work";
        }
    }

    // Default case
    return "uncategorized";
}



export const categoryMetadata: Record<CategoryName, {name: string, color: string}> = {
    productivity: { name: 'Productivity', color: '#4285F4' }, // Blue
    work: { name: 'Work', color: '#34A853' },                 // Green
    education: { name: 'Education', color: '#FBBC05' },       // Yellow
    shopping: { name: 'Shopping', color: '#EA4335' },         // Red
    social: { name: 'Social', color: '#673AB7' },             // Purple
    news: { name: 'News', color: '#FF9800' },                 // Orange
    entertainment: { name: 'Entertainment', color: '#FF5722' },// Deep Orange
    video: { name: 'Video', color: '#F44336' },               // Red
    games: { name: 'Games', color: '#E91E63' },               // Pink
    technology: { name: 'Technology', color: '#00BCD4' },      // Cyan
    finance: { name: 'Finance', color: '#009688' },           // Teal
    travel: { name: 'Travel', color: '#8BC34A' },             // Light Green
    health: { name: 'Health', color: '#CDDC39' },             // Lime
    reference: { name: 'Reference', color: '#795548' },       // Brown
    uncategorized: { name: 'Uncategorized', color: '#9E9E9E' } // Grey
};