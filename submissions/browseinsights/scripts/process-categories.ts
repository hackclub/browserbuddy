/**
 * This script processes the IAB categories CSV by fetching it from websitecategorizationapi.com
 * and generates a TypeScript data file
 */

import * as path from 'node:path';
import * as https from 'node:https';
import * as fs from "node:fs";

interface DomainCategory {
    domain: string;
    categories: string[];
}

const CSV_URL = 'https://websitecategorizationapi.com/iab_results_10k_domains.csv';
const OUTPUT_FILE = path.join(__dirname, '../src/data/categorization.ts');
const CURRENT_DATE = new Date().toISOString();
const CURRENT_USER = 'JasonLovesDoggo';

// Template for the generated file
const fileTemplate = `/**
 * Statify - Website Categorization Data
 * Generated on ${CURRENT_DATE}
 * Data source: ${CSV_URL}
 * 
 * @author ${CURRENT_USER}
 */

import {DomainCategory} from "../types/categories";

export const domainCategories: DomainCategory[] = %%DATA%%;

export default domainCategories;
`;

// Fetch the CSV file from the web
function fetchCsvFromWeb(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        console.log(`Fetching CSV from: ${CSV_URL}`);

        https.get(CSV_URL, (response) => {
            // Check for redirection
            if (response.statusCode === 301 || response.statusCode === 302) {
                if (response.headers.location) {
                    console.log(`Following redirect to: ${response.headers.location}`);
                    fetchCsvFromUrl(response.headers.location)
                        .then(resolve)
                        .catch(reject);
                    return;
                }
            }

            // Check for successful response
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to fetch CSV. Status code: ${response.statusCode}`));
                return;
            }

            // Collect data
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                console.log(`Successfully fetched CSV data (${data.length} bytes)`);
                resolve(data);
            });

        }).on('error', (error) => {
            reject(new Error(`Error fetching CSV: ${error.message}`));
        });
    });
}

// Helper function to handle redirects
function fetchCsvFromUrl(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to fetch CSV from redirect. Status code: ${response.statusCode}`));
                return;
            }

            // Collect data
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                resolve(data);
            });

        }).on('error', (error) => {
            reject(new Error(`Error fetching CSV from redirect: ${error.message}`));
        });
    });
}

// Function to split category path into individual tags
function expandCategoryTags(categoryPath: string): string[] {
    // Split by ">" and trim each tag
    return categoryPath.split('>').map(tag => tag.trim());
}

// Advanced function to clean and normalize category data
function cleanCategory(category: string): string {
    // Remove any surrounding quotes and brackets
    return category
        .replace(/^["'\[\s]+|["'\]\s]+$/g, '')
        .trim();
}

// Parse CSV data with improved handling of complex entries
function parseCsvManually(csvData: string): DomainCategory[] {
    const results: DomainCategory[] = [];

    // Split by lines
    const lines = csvData.split('\n');
    console.log(`CSV contains ${lines.length} lines`);

    // Handle each line separately
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('domain,result_iab')) continue;

        try {
            // Find position of first comma that separates domain from categories
            const firstCommaPos = line.indexOf(',');
            if (firstCommaPos === -1) continue;

            // Extract domain and raw category data
            const domain = line.substring(0, firstCommaPos).trim();
            let rawCategoryData = line.substring(firstCommaPos + 1).trim();

            // Process the domain (remove www. prefix)
            const cleanDomain = domain.replace(/^www\./, '');

            // Handle special case for badly formatted data
            if (rawCategoryData.includes("\"['") || rawCategoryData.includes("']\"")) {
                // This is a badly quoted entry, clean it properly
                rawCategoryData = rawCategoryData.replace(/^"|"$/g, ''); // Remove outer quotes
                rawCategoryData = rawCategoryData.replace(/\\'/g, "'"); // Handle escaped quotes
            }

            // Extract categories using more robust method
            const categories: string[] = [];

            // Check if we have a list format (starts with [ and ends with ])
            if (rawCategoryData.startsWith('[') && rawCategoryData.endsWith(']')) {
                // Remove the brackets
                const innerContent = rawCategoryData.substring(1, rawCategoryData.length - 1);

                // Try to split by apparent category boundaries
                // Pattern matches either 'text', "text", or bare text between commas
                const categoryRegex = /'([^']+)'|"([^"]+)"|([^,]+)/g;
                let match;

                while ((match = categoryRegex.exec(innerContent)) !== null) {
                    const categoryText = (match[1] || match[2] || match[3]).trim();

                    if (categoryText) {
                        // Further split by ">" to get individual tags
                        const tags = expandCategoryTags(categoryText);
                        tags.forEach(tag => {
                            const cleanTag = cleanCategory(tag);
                            if (cleanTag && !categories.includes(cleanTag)) {
                                categories.push(cleanTag);
                            }
                        });
                    }
                }
            } else {
                // Single category case
                const tags = expandCategoryTags(rawCategoryData);
                tags.forEach(tag => {
                    const cleanTag = cleanCategory(tag);
                    if (cleanTag && !categories.includes(cleanTag)) {
                        categories.push(cleanTag);
                    }
                });
            }

            // Only add entries with valid domain and at least one category
            if (cleanDomain && cleanDomain.includes('.') && categories.length > 0) {
                results.push({
                    domain: cleanDomain,
                    categories: categories
                });
            }
        } catch (err) {
            console.warn(`Error parsing line ${i+1}: ${line}`);
            console.warn(err);
        }
    }

    return results;
}

// Another parsing approach for complex entries
function parseComplexCsvLine(line: string): DomainCategory | null {
    try {
        // Extract the domain (everything before the first comma)
        const domainEndPos = line.indexOf(',');
        if (domainEndPos === -1) return null;

        const domain = line.substring(0, domainEndPos).trim().replace(/^www\./, '');

        // Get everything after the domain
        let categoryPart = line.substring(domainEndPos + 1).trim();


        // Remove outer quotes and brackets
        categoryPart = categoryPart.replace(/^["'\[\s]+|["'\]\s]+$/g, '');

        // Split on visible category separators (look for pattern: ', ')
        const rawCategories = categoryPart.split(/'\s*,\s*'/);

        // Clean up each category and extract individual tags
        const allTags: string[] = [];
        rawCategories.forEach(rawCat => {
            const cleanCat = rawCat.replace(/^['"\[\s]+|['"\]\s]+$/g, '').trim();
            if (!cleanCat) return;

            // Split by ">" to get individual tags
            const tags = cleanCat.split('>').map(t => t.trim());
            tags.forEach(tag => {
                if (tag && !allTags.includes(tag)) {
                    allTags.push(tag);
                }
            });
        });

        if (domain && domain.includes('.') && allTags.length > 0) {
            return { domain, categories: allTags };
        }
        return null;

    } catch (err) {
        console.warn(`Error in parseComplexCsvLine: ${err}`);
        return null;
    }
}

// Process the CSV data
async function processCsv(): Promise<DomainCategory[]> {
    try {

        // Fetch CSV from web (or use example for testing)
        const csvData = await fetchCsvFromWeb();

        let results: DomainCategory[] = [];

        // Process line by line using the complex parser
        const lines = csvData.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('domain,result_iab')) continue;

            // Try different parsing strategies
            const result = parseComplexCsvLine(line);
            if (result) {
                results.push(result);
            }
        }

        // Fall back to regular parser if needed
        if (results.length === 0) {
            results = parseCsvManually(csvData);
        }

        console.log(`Successfully parsed ${results.length} domains`);

        // Logging the first few entries for verification
        if (results.length > 0) {
            console.log('First few entries:');
            results.slice(0, 3).forEach(entry => {
                console.log(`Domain: ${entry.domain}, Categories: ${JSON.stringify(entry.categories)}`);
            });
        }

        return results;
    } catch (error) {
        console.error('Error processing CSV:', error);
        throw error;
    }
}

// Main function
async function main(): Promise<void> {
    try {
        console.log(`Processing domain categories from ${CSV_URL}...`);
        console.log(`Current date: ${CURRENT_DATE}`);
        console.log(`Current user: ${CURRENT_USER}`);

        const data = await processCsv();

        if (data.length === 0) {
            console.error('Error: No domain data was parsed. Cannot continue without data.');
            process.exit(1);
        }

        // Generate TypeScript file content
        const formattedData = JSON.stringify(data, null, 2);
        const fileContent = fileTemplate.replace('%%DATA%%', formattedData);

        // Ensure directory exists
        const dirPath = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Write the file
        fs.writeFileSync(OUTPUT_FILE, fileContent);
        console.log(`Generated categorization data at: ${OUTPUT_FILE}`);
        console.log(`Data contains ${data.length} domain entries.`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Run the script
main();