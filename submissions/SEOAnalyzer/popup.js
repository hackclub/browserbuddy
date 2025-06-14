// Initialize the popup
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize UI elements
    const elements = {
        score: document.querySelector('.score'),
        metaTitleScore: document.getElementById('meta-title-score'),
        metaTitleContent: document.getElementById('meta-title-content'),
        metaTitleLength: document.getElementById('meta-title-length'),
        metaTitleRecommendation: document.getElementById('meta-title-recommendation'),
        metaDescScore: document.getElementById('meta-desc-score'),
        metaDescContent: document.getElementById('meta-desc-content'),
        metaDescLength: document.getElementById('meta-desc-length'),
        metaDescRecommendation: document.getElementById('meta-desc-recommendation'),
        socialPreviewContainer: document.getElementById('social-preview-container'),
        sitemapStatus: document.getElementById('sitemap-status'),
        sitemapMetrics: document.getElementById('sitemap-metrics'),
        sitemapRecommendations: document.getElementById('sitemap-recommendations'),
        exportButton: document.getElementById('export-csv')
    };

    // Verify all elements exist
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Missing element: ${key}`);
            return; // Exit if any required element is missing
        }
    }

    try {
        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            throw new Error('No active tab found');
        }

        // Execute the analysis
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: analyzePage
        });

        if (!results || !results[0] || !results[0].result) {
            throw new Error('Failed to analyze page');
        }

        const data = results[0].result;
        
        // Update UI with results
        displayResults(data, elements);
        updateSocialPreview('facebook', data, elements);
        analyzeSitemap(new URL(tab.url).origin, elements);

        // Initialize social media preview tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                updateSocialPreview(tab.dataset.platform, data, elements);
            });
        });

        // Initialize export button
        elements.exportButton.addEventListener('click', () => exportToCSV(data));

    } catch (error) {
        console.error('SEO Analysis Error:', error);
        elements.score.parentElement.innerHTML = `
            <div class="error-card">
                <span class="material-icons error-icon">error_outline</span>
                <h2>Analysis Error</h2>
                <p>${error.message}</p>
                <button class="retry-button" onclick="window.location.reload()">
                    <span class="material-icons">refresh</span>
                    Retry Analysis
                </button>
            </div>
        `;
    }
});

// Function to analyze the current page
function analyzePage() {
    // Get meta tags
    const metaTags = {};
    document.querySelectorAll('meta').forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        if (name) {
            metaTags[name] = meta.getAttribute('content');
        }
    });

    // Get all headings
    const headings = {
        h1: Array.from(document.getElementsByTagName('h1')),
        h2: Array.from(document.getElementsByTagName('h2')),
        h3: Array.from(document.getElementsByTagName('h3'))
    };

    // Get all images
    const images = Array.from(document.getElementsByTagName('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        hasAlt: img.hasAttribute('alt')
    }));

    // Get all links
    const links = Array.from(document.getElementsByTagName('a')).map(link => ({
        href: link.href,
        text: link.textContent.trim(),
        isInternal: link.href.includes(window.location.hostname)
    }));

    return {
        url: window.location.href,
        title: document.title,
        description: metaTags['description'] || '',
        ogTitle: metaTags['og:title'] || '',
        ogDescription: metaTags['og:description'] || '',
        ogImage: metaTags['og:image'] || '',
        twitterCard: metaTags['twitter:card'] || '',
        twitterTitle: metaTags['twitter:title'] || '',
        twitterDescription: metaTags['twitter:description'] || '',
        twitterImage: metaTags['twitter:image'] || '',
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        viewport: metaTags['viewport'] || '',
        robots: metaTags['robots'] || '',
        headings,
        images,
        links
    };
}

// Scoring functions
function calculateTitleScore(title) {
    if (!title) return 0;
    const length = title.length;
    if (length >= 50 && length <= 60) return 10;
    if (length >= 40 && length <= 70) return 8;
    if (length >= 30 && length <= 80) return 6;
    return 4;
}

function calculateDescriptionScore(description) {
    if (!description) return 0;
    const length = description.length;
    if (length >= 150 && length <= 160) return 10;
    if (length >= 140 && length <= 170) return 8;
    if (length >= 120 && length <= 180) return 6;
    return 4;
}

function calculateHeadingsScore(headings) {
    let score = 0;
    if (headings.h1.length === 1) score += 4;
    if (headings.h2.length > 0) score += 3;
    if (headings.h3.length > 0) score += 3;
    return score;
}

function calculateImagesScore(images) {
    if (images.length === 0) return 10;
    const withAlt = images.filter(img => img.hasAlt).length;
    return Math.round((withAlt / images.length) * 10);
}

function calculateTechnicalScore(data) {
    let score = 0;
    if (data.canonical) score += 2;
    if (data.viewport) score += 2;
    if (data.robots) score += 2;
    if (data.ogTitle && data.ogDescription) score += 2;
    if (data.twitterCard && data.twitterTitle) score += 2;
    return score;
}

// Recommendation functions
function getTitleRecommendation(title) {
    if (!title) return '❌ No title tag found';
    const length = title.length;
    if (length < 30) return '❌ Title is too short (recommended: 50-60 characters)';
    if (length > 80) return '❌ Title is too long (recommended: 50-60 characters)';
    if (length >= 50 && length <= 60) return '✅ Title length is optimal';
    return '❌ Title length is not optimal (recommended: 50-60 characters)';
}

function getDescriptionRecommendation(description) {
    if (!description) return '❌ No meta description found';
    const length = description.length;
    if (length < 120) return '❌ Description is too short (recommended: 150-160 characters)';
    if (length > 180) return '❌ Description is too long (recommended: 150-160 characters)';
    if (length >= 150 && length <= 160) return '✅ Description length is optimal';
    return '❌ Description length is not optimal (recommended: 150-160 characters)';
}

function getSocialRecommendations(platform, preview) {
    const recommendations = [];
    
    if (!preview.title) {
        recommendations.push(`Add a ${platform}-specific title tag`);
    }
    if (!preview.description) {
        recommendations.push(`Add a ${platform}-specific description`);
    }
    if (!preview.image) {
        recommendations.push(`Add a ${platform}-specific image`);
    }
    
    return recommendations.map(rec => `<li>${rec}</li>`).join('') || 
           '<li>✅ All required social media tags are present!</li>';
}

// UI update functions
function displayResults(data, elements) {
    const scores = {
        title: calculateTitleScore(data.title),
        description: calculateDescriptionScore(data.description),
        headings: calculateHeadingsScore(data.headings),
        images: calculateImagesScore(data.images),
        technical: calculateTechnicalScore(data)
    };

    const overallScore = Math.round(
        (scores.title + scores.description + scores.headings + 
         scores.images + scores.technical) * 2
    );

    elements.score.textContent = overallScore;
    elements.metaTitleScore.textContent = `${scores.title}/10`;
    elements.metaDescScore.textContent = `${scores.description}/10`;
    
    elements.metaTitleContent.textContent = data.title || 'No title found';
    elements.metaTitleLength.textContent = `Length: ${data.title?.length || 0} characters`;
    elements.metaTitleRecommendation.textContent = getTitleRecommendation(data.title);

    elements.metaDescContent.textContent = data.description || 'No description found';
    elements.metaDescLength.textContent = `Length: ${data.description?.length || 0} characters`;
    elements.metaDescRecommendation.textContent = getDescriptionRecommendation(data.description);

    // Add heading analysis display
    const headingAnalysis = document.getElementById('heading-analysis');
    if (headingAnalysis) {
        const h1Count = data.headings.h1.length;
        const h2Count = data.headings.h2.length;
        const h3Count = data.headings.h3.length;
        
        headingAnalysis.innerHTML = `
            <div class="analysis-section">
                <h3>Heading Structure Analysis</h3>
                <div class="metric-grid">
                    <div class="metric">
                        <div class="metric-label">H1 Headings</div>
                        <div class="metric-value ${h1Count === 1 ? 'good' : 'bad'}">${h1Count}</div>
                        <div class="metric-status">${h1Count === 1 ? '✅' : '❌'}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">H2 Headings</div>
                        <div class="metric-value ${h2Count > 0 ? 'good' : 'warning'}">${h2Count}</div>
                        <div class="metric-status">${h2Count > 0 ? '✅' : '⚠️'}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">H3 Headings</div>
                        <div class="metric-value">${h3Count}</div>
                    </div>
                </div>
                <div class="recommendations">
                    <h4>Recommendations:</h4>
                    <ul>
                        ${getHeadingRecommendations(data.headings)}
                    </ul>
                </div>
            </div>
        `;
    }

    // Add image analysis display
    const imageAnalysis = document.getElementById('image-analysis');
    if (imageAnalysis) {
        const totalImages = data.images.length;
        const imagesWithAlt = data.images.filter(img => img.hasAlt).length;
        const altPercentage = totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : 0;
        
        imageAnalysis.innerHTML = `
            <div class="analysis-section">
                <h3>Image Analysis</h3>
                <div class="metric-grid">
                    <div class="metric">
                        <div class="metric-label">Total Images</div>
                        <div class="metric-value">${totalImages}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Images with Alt Text</div>
                        <div class="metric-value ${altPercentage === 100 ? 'good' : altPercentage >= 80 ? 'warning' : 'bad'}">
                            ${imagesWithAlt}/${totalImages}
                        </div>
                        <div class="metric-status">${altPercentage === 100 ? '✅' : '❌'}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Alt Text Coverage</div>
                        <div class="metric-value ${altPercentage === 100 ? 'good' : altPercentage >= 80 ? 'warning' : 'bad'}">
                            ${altPercentage}%
                        </div>
                    </div>
                </div>
                <div class="recommendations">
                    <h4>Recommendations:</h4>
                    <ul>
                        ${getImageRecommendations(data.images)}
                    </ul>
                </div>
            </div>
        `;
    }
}

function getHeadingRecommendations(headings) {
    const recommendations = [];
    const h1Count = headings.h1.length;
    const h2Count = headings.h2.length;
    const h3Count = headings.h3.length;

    if (h1Count === 0) {
        recommendations.push('❌ Add an H1 heading - every page should have exactly one main heading');
    } else if (h1Count > 1) {
        recommendations.push('❌ Multiple H1 headings found - consolidate into a single main heading');
    }

    if (h2Count === 0) {
        recommendations.push('⚠️ Consider adding H2 headings to structure your content');
    }

    if (h1Count === 1 && h2Count > 0) {
        recommendations.push('✅ Good heading structure with one H1 and supporting H2s');
    }

    if (h2Count > 0 && h3Count === 0) {
        recommendations.push('⚠️ Consider adding H3 headings under relevant H2 sections');
    }

    return recommendations.map(rec => `<li>${rec}</li>`).join('');
}

function getImageRecommendations(images) {
    const recommendations = [];
    const totalImages = images.length;
    const imagesWithAlt = images.filter(img => img.hasAlt).length;
    const imagesWithoutAlt = images.filter(img => !img.hasAlt);

    if (totalImages === 0) {
        recommendations.push('⚠️ No images found on the page - consider adding relevant images to enhance content');
    } else {
        if (imagesWithoutAlt.length > 0) {
            recommendations.push(`❌ ${imagesWithoutAlt.length} image(s) missing alt text - add descriptive alt text for accessibility and SEO`);
            imagesWithoutAlt.slice(0, 3).forEach(img => {
                recommendations.push(`   • Missing alt text for image: ${img.src.split('/').pop()}`);
            });
        }

        if (imagesWithAlt.length === totalImages) {
            recommendations.push('✅ All images have alt text - great job!');
        }
    }

    return recommendations.map(rec => `<li>${rec}</li>`).join('');
}

function updateSocialPreview(platform, data, elements) {
    let previewData = {
        title: data.title,
        description: data.description,
        image: '',
        url: data.url
    };

    switch (platform) {
        case 'facebook':
            previewData.title = data.ogTitle || data.title;
            previewData.description = data.ogDescription || data.description;
            previewData.image = data.ogImage;
            break;
        case 'twitter':
            previewData.title = data.twitterTitle || data.ogTitle || data.title;
            previewData.description = data.twitterDescription || data.ogDescription || data.description;
            previewData.image = data.twitterImage || data.ogImage;
            break;
        case 'linkedin':
            previewData.title = data.ogTitle || data.title;
            previewData.description = data.ogDescription || data.description;
            previewData.image = data.ogImage;
            break;
    }

    elements.socialPreviewContainer.innerHTML = `
        <div class="social-preview ${platform}-preview">
            ${previewData.image ? `
                <div class="preview-image">
                    <img src="${previewData.image}" alt="Preview image" onerror="this.src='icons/default-image.png'">
                </div>
            ` : ''}
            <div class="preview-content">
                <div class="preview-title">${previewData.title || 'No title'}</div>
                <div class="preview-description">${previewData.description || 'No description'}</div>
                <div class="preview-url">${previewData.url}</div>
            </div>
        </div>
        <div class="recommendations">
            <h3>Recommendations</h3>
            <ul>
                ${getSocialRecommendations(platform, previewData)}
            </ul>
        </div>
    `;
}

async function analyzeSitemap(baseUrl, elements) {
    try {
        const sitemapUrl = `${baseUrl}/sitemap.xml`;
        elements.sitemapStatus.innerHTML = `
            <div class="loading-spinner small"></div>
            Analyzing sitemap...
        `;

        const response = await fetch(sitemapUrl);
        if (!response.ok) {
            throw new Error(`Sitemap not found (${response.status})`);
        }

        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        
        if (!xmlDoc || !xmlDoc.getElementsByTagName('url')) {
            throw new Error('Invalid sitemap format');
        }

        const urls = xmlDoc.getElementsByTagName('url');
        const totalUrls = urls.length;
        
        const priorityDistribution = {high: 0, medium: 0, low: 0};
        const changefreqDistribution = {};
        const lastModDates = [];
        
        Array.from(urls).forEach(url => {
            const priority = parseFloat(url.querySelector('priority')?.textContent || '0.5');
            if (priority >= 0.8) priorityDistribution.high++;
            else if (priority >= 0.5) priorityDistribution.medium++;
            else priorityDistribution.low++;
            
            const changefreq = url.querySelector('changefreq')?.textContent;
            if (changefreq) {
                changefreqDistribution[changefreq] = (changefreqDistribution[changefreq] || 0) + 1;
            }
            
            const lastmod = url.querySelector('lastmod')?.textContent;
            if (lastmod) lastModDates.push(new Date(lastmod));
        });

        const now = new Date();
        const freshnessScore = lastModDates.length ? 
            Math.round(lastModDates.reduce((acc, date) => {
                const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
                return acc + (daysDiff < 30 ? 100 : daysDiff < 90 ? 70 : daysDiff < 180 ? 40 : 20);
            }, 0) / lastModDates.length) : 0;

        // Clear loading state
        elements.sitemapStatus.innerHTML = `
            <div class="success-message">
                <span class="material-icons">check_circle</span>
                Sitemap analysis complete
            </div>
        `;

        elements.sitemapMetrics.innerHTML = `
            <div class="metric">
                <div class="metric-label">Total URLs</div>
                <div class="metric-value">${totalUrls}</div>
            </div>
            <div class="metric">
                <div class="metric-label">High Priority Pages</div>
                <div class="metric-value">${priorityDistribution.high}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Content Freshness</div>
                <div class="metric-value">${freshnessScore}/100</div>
            </div>
            <div class="metric">
                <div class="metric-label">Last Updated</div>
                <div class="metric-value">${lastModDates.length ? new Date(Math.max(...lastModDates)).toLocaleDateString() : 'Unknown'}</div>
            </div>
        `;

        const recommendations = [];
        if (totalUrls === 0) {
            recommendations.push('❌ Your sitemap is empty. Add URLs to help search engines discover your content.');
        }
        if (priorityDistribution.high < totalUrls * 0.2) {
            recommendations.push(`⚠️ Consider increasing the priority of your most important pages (only ${Math.round(priorityDistribution.high/totalUrls*100)}% have high priority).`);
        }
        if (freshnessScore < 60) {
            recommendations.push('⚠️ Your content might be getting stale. Consider updating your pages more frequently.');
        }

        elements.sitemapRecommendations.innerHTML = 
            recommendations.length ? recommendations.map(rec => `<li>${rec}</li>`).join('') : 
            '<li>✅ Your sitemap appears to be well-optimized!</li>';

    } catch (error) {
        elements.sitemapStatus.innerHTML = `
            <div class="error-message">
                <span class="material-icons">error_outline</span>
                ${error.message}
            </div>
        `;
        
        // Clear metrics and recommendations if there's an error
        elements.sitemapMetrics.innerHTML = '';
        elements.sitemapRecommendations.innerHTML = '';
    }
}

function exportToCSV(data) {
    const scores = {
        title: calculateTitleScore(data.title),
        description: calculateDescriptionScore(data.description),
        headings: calculateHeadingsScore(data.headings),
        images: calculateImagesScore(data.images),
        technical: calculateTechnicalScore(data)
    };

    const overallScore = Math.round(
        (scores.title + scores.description + scores.headings + 
         scores.images + scores.technical) * 2
    );

    const formatScore = (score) => `${score} out of 10`;

    const csvRows = [
        ['SEO Analysis Report'],
        [`Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
        [''],
        ['Overall Score', `${overallScore} out of 100`],
        [''],
        ['1. Page Information'],
        ['URL', data.url],
        ['Title', data.title || 'Not found'],
        ['Meta Description', data.description || 'Not found'],
        [''],
        ['2. Content Analysis'],
        ['Title Length', `${data.title?.length || 0} characters`, formatScore(scores.title)],
        ['Description Length', `${data.description?.length || 0} characters`, formatScore(scores.description)],
        ['H1 Headings', data.headings.h1.length],
        ['H2 Headings', data.headings.h2.length],
        ['H3 Headings', data.headings.h3.length],
        ['Total Images', data.images.length],
        ['Images with Alt Text', `${data.images.filter(img => img.hasAlt).length} of ${data.images.length}`],
        [''],
        ['3. Technical SEO'],
        ['Canonical URL', data.canonical ? 'Present' : 'Missing'],
        ['Viewport Meta Tag', data.viewport ? 'Present' : 'Missing'],
        ['Robots Meta Tag', data.robots ? 'Present' : 'Missing'],
        [''],
        ['4. Social Media Tags'],
        ['Open Graph Title', data.ogTitle ? 'Present' : 'Missing'],
        ['Open Graph Description', data.ogDescription ? 'Present' : 'Missing'],
        ['Open Graph Image', data.ogImage ? 'Present' : 'Missing'],
        ['Twitter Card', data.twitterCard || 'Missing'],
        ['Twitter Title', data.twitterTitle ? 'Present' : 'Missing'],
        ['Twitter Description', data.twitterDescription ? 'Present' : 'Missing'],
        ['Twitter Image', data.twitterImage ? 'Present' : 'Missing'],
        [''],
        ['5. Recommendations'],
        [getTitleRecommendation(data.title).replace(/[❌✅]/g, '').trim()],
        [getDescriptionRecommendation(data.description).replace(/[❌✅]/g, '').trim()]
    ];

    // Add heading recommendations
    const headingRecs = getHeadingRecommendations(data.headings)
        .replace(/<li>|<\/li>/g, '')
        .split('\n')
        .filter(rec => rec.trim())
        .map(rec => [rec.replace(/[❌✅⚠️]/g, '').trim()]);
    csvRows.push(...headingRecs);

    // Add image recommendations
    const imageRecs = getImageRecommendations(data.images)
        .replace(/<li>|<\/li>/g, '')
        .split('\n')
        .filter(rec => rec.trim())
        .map(rec => [rec.replace(/[❌✅⚠️]/g, '').trim()]);
    csvRows.push(...imageRecs);

    // Add technical recommendations
    if (!data.canonical) csvRows.push(['Add a canonical URL to prevent duplicate content issues']);
    if (!data.viewport) csvRows.push(['Add a viewport meta tag for better mobile optimization']);
    if (!data.robots) csvRows.push(['Add a robots meta tag to control search engine crawling']);

    // Filter out any empty rows and join with commas
    const csvContent = csvRows
        .filter(row => row.length > 0 && row.some(cell => cell.trim()))
        .map(row => row.map(cell => `"${cell}"`).join(',')) // Wrap each cell in quotes to handle commas
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `seo-analysis-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function initializeKeyboardNavigation() {
    const focusableElements = 'button, [href], [tabindex]:not([tabindex="-1"])';
    const elements = document.querySelectorAll(focusableElements);
    
    elements.forEach(element => {
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                element.click();
            }
        });
    });
}

function initializeCopyButtons() {
    const sections = ['seo-score', 'technical-analysis', 'sitemap-analysis'];
    
    sections.forEach(section => {
        const container = document.getElementById(section);
        if (!container) return;
        
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '<span class="material-icons">content_copy</span>';
        copyButton.title = 'Copy to clipboard';
        
        copyButton.addEventListener('click', async () => {
            const content = container.innerText;
            try {
                await navigator.clipboard.writeText(content);
                copyButton.innerHTML = '<span class="material-icons">check</span>';
                setTimeout(() => {
                    copyButton.innerHTML = '<span class="material-icons">content_copy</span>';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
        
        container.querySelector('h2').appendChild(copyButton);
    });
}
