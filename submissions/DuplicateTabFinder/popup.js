document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const html = document.documentElement;
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        chrome.storage.local.set({ theme: newTheme });
    });

    chrome.storage.local.get('theme', ({ theme }) => {
        if (theme) {
            html.setAttribute('data-theme', theme);
        }
    });

    const searchBox = document.querySelector('.search-box');
    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('#tab-list > li').forEach(li => {
            const url = li.querySelector('.url').textContent.toLowerCase();
            const title = Array.from(li.querySelectorAll('.tab-title'))
                .map(el => el.textContent.toLowerCase())
                .join(' ');
            li.style.display = (url.includes(searchTerm) || title.includes(searchTerm)) ? '' : 'none';
        });
    });

    const tabList = document.getElementById("tab-list");

    function updateStats(duplicates) {
        const statsPanel = document.querySelector('.stats-panel');
        const totalStats = document.getElementById('total-stats');
        const domainStats = document.getElementById('domain-stats');
        
        if (!duplicates || duplicates.size === 0) {
            statsPanel.style.display = 'none';
            totalStats.textContent = '';
            domainStats.innerHTML = '';
            return;
        }

        const totalDuplicates = Array.from(duplicates.values())
            .reduce((sum, tabs) => sum + tabs.length, 0);
        
        if (totalDuplicates === 0) {
            statsPanel.style.display = 'none';
            totalStats.textContent = '';
            domainStats.innerHTML = '';
            return;
        }

        statsPanel.style.display = 'block';
        
        const domainCounts = new Map();
        duplicates.forEach((tabs, url) => {
            const domain = new URL(url).hostname;
            domainCounts.set(domain, (domainCounts.get(domain) || 0) + tabs.length);
        });

        totalStats.textContent = `Total ${totalDuplicates === 1 ? 'duplicate' : 'duplicates'}: ${totalDuplicates}`;
        domainStats.innerHTML = Array.from(domainCounts)
            .map(([domain, count]) => `${domain}: ${count}`)
            .join('<br>');
    }

    function groupByDomain(duplicates) {
        const grouped = new Map();
        duplicates.forEach((tabs, url) => {
            const domain = new URL(url).hostname;
            if (!grouped.has(domain)) {
                grouped.set(domain, new Map());
            }
            grouped.get(domain).set(url, tabs);
        });
        return grouped;
    }

    const settings = {
        autoClose: false,
        groupByDomain: false
    };

    chrome.storage.local.get(['settings'], (result) => {
        if (result.settings) {
            Object.assign(settings, result.settings);
        }
        document.getElementById('auto-close').checked = settings.autoClose;
        document.getElementById('group-by-domain').checked = settings.groupByDomain;
        
        chrome.tabs.query({}, (tabs) => handleTabs(tabs));
    });

    function saveSettings() {
        chrome.storage.local.set({ settings });
    }

    document.getElementById('auto-close').addEventListener('change', (e) => {
        settings.autoClose = e.target.checked;
        saveSettings();
    });

    document.getElementById('group-by-domain').addEventListener('change', (e) => {
        settings.groupByDomain = e.target.checked;
        saveSettings();
        tabList.innerHTML = '';
        chrome.tabs.query({}, (tabs) => handleTabs(tabs));
    });

    document.getElementById('export-settings').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(settings)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,
            filename: 'duplicate-tab-finder-settings.json'
        });
    });

    document.getElementById('import-settings').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = event => {
                const importedSettings = JSON.parse(event.target.result);
                Object.assign(settings, importedSettings);
                saveSettings();
                location.reload();
            };
            reader.readAsText(file);
        };
        input.click();
    });

    function handleTabs(tabs) {
        tabList.innerHTML = '';
        
        const seenUrls = new Map();
        const duplicates = new Map();

        tabs.forEach((tab) => {
            const existing = seenUrls.get(tab.url);
            if (existing) {
                duplicates.set(tab.url, [...(duplicates.get(tab.url) || []), tab]);
            } else {
                seenUrls.set(tab.url, tab);
            }
        });

        if (duplicates.size === 0) {
            tabList.innerHTML = "<li class='no-duplicates'>No duplicate tabs found!</li>";
            return;
        }

        updateStats(duplicates);

        if (settings.groupByDomain) {
            const groupedDuplicates = groupByDomain(duplicates);
            
            groupedDuplicates.forEach((domainDuplicates, domain) => {
                const domainLi = document.createElement("li");
                const domainHeader = document.createElement("div");
                domainHeader.className = "domain-header";
                domainHeader.innerHTML = `<h3>${domain}</h3>`;
                domainLi.appendChild(domainHeader);

                const domainTabsContainer = document.createElement("div");
                domainTabsContainer.className = "domain-tabs-container";

                let totalDuplicatesInDomain = 0;

                domainDuplicates.forEach((dupTabs, url) => {
                    totalDuplicatesInDomain += dupTabs.length;
                    
                    const urlDiv = document.createElement("div");
                    urlDiv.className = "url-group";
                    
                    const urlHeader = document.createElement("div");
                    urlHeader.className = "url-info";
                    
                    const closeAllBtn = document.createElement("button");
                    closeAllBtn.textContent = "Close All";
                    closeAllBtn.className = "close-all";
                    closeAllBtn.onclick = () => {
                        const tabIds = dupTabs.map(tab => tab.id);
                        chrome.tabs.remove(tabIds);
                        urlDiv.remove();
                        
                        if (domainTabsContainer.children.length === 0) {
                            domainLi.remove();
                        }
                    };

                    urlHeader.innerHTML = `
                        <div class="url">${url}</div>
                        <div class="duplicate-count">${dupTabs.length} ${dupTabs.length === 1 ? 'duplicate' : 'duplicates'}</div>
                    `;
                    
                    urlDiv.appendChild(urlHeader);
                    urlDiv.appendChild(closeAllBtn);

                    const tabsDiv = document.createElement("div");
                    tabsDiv.className = "tab-list";
                    
                    dupTabs.forEach((tab) => {
                        const tabDiv = document.createElement("div");
                        tabDiv.className = "tab-item";
                        tabDiv.innerHTML = `
                            <img src="${tab.favIconUrl || 'icons/icon16.png'}" alt="favicon">
                            <span class="tab-title">${tab.title}</span>
                            <button class="keep-tab">Keep</button>
                            <button class="close-tab">✕</button>
                        `;
                        
                        tabDiv.addEventListener('click', (e) => {
                            if (!e.target.classList.contains('close-tab') && 
                                !e.target.classList.contains('keep-tab')) {
                                chrome.tabs.update(tab.id, { active: true });
                                chrome.windows.update(tab.windowId, { focused: true });
                            }
                        });

                        const keepButton = tabDiv.querySelector('.keep-tab');
                        keepButton.addEventListener('click', () => {
                            const tabsToClose = dupTabs
                                .filter(t => t.id !== tab.id)
                                .map(t => t.id);
                            chrome.tabs.remove(tabsToClose);
                            urlDiv.remove();
                            
                            if (domainTabsContainer.children.length === 0) {
                                domainLi.remove();
                            }
                        });

                        const closeButton = tabDiv.querySelector('.close-tab');
                        closeButton.addEventListener('click', () => {
                            chrome.tabs.remove(tab.id);
                            tabDiv.remove();
                            
                            if (tabsDiv.children.length === 0) {
                                urlDiv.remove();
                                
                                if (domainTabsContainer.children.length === 0) {
                                    domainLi.remove();
                                }
                            }
                        });

                        tabsDiv.appendChild(tabDiv);
                    });

                    urlDiv.appendChild(tabsDiv);
                    domainTabsContainer.appendChild(urlDiv);
                });

                domainHeader.innerHTML += `<span class="domain-count">(${totalDuplicatesInDomain} total ${totalDuplicatesInDomain === 1 ? 'duplicate' : 'duplicates'})</span>`;
                
                domainLi.appendChild(domainTabsContainer);
                tabList.appendChild(domainLi);
            });
        } else {
            duplicates.forEach((dupTabs, url) => {
                const li = document.createElement("li");
                const urlDiv = document.createElement("div");
                urlDiv.className = "url-info";
                
                const closeAllBtn = document.createElement("button");
                closeAllBtn.textContent = "Close All";
                closeAllBtn.className = "close-all";
                closeAllBtn.onclick = () => {
                    const tabIds = dupTabs.map(tab => tab.id);
                    chrome.tabs.remove(tabIds);
                    li.remove();
                };

                urlDiv.innerHTML = `
                    <div class="url">${url}</div>
                    <div class="duplicate-count">${dupTabs.length} ${dupTabs.length === 1 ? 'duplicate' : 'duplicates'}</div>
                `;
                
                li.appendChild(urlDiv);
                li.appendChild(closeAllBtn);

                const tabsDiv = document.createElement("div");
                tabsDiv.className = "tab-list";
                
                dupTabs.forEach((tab) => {
                    const tabDiv = document.createElement("div");
                    tabDiv.className = "tab-item";
                    tabDiv.innerHTML = `
                        <img src="${tab.favIconUrl || 'icons/icon16.png'}" alt="favicon">
                        <span class="tab-title">${tab.title}</span>
                        <button class="keep-tab">Keep</button>
                        <button class="close-tab">✕</button>
                    `;
                    
                    tabDiv.addEventListener('click', (e) => {
                        if (!e.target.classList.contains('close-tab') && 
                            !e.target.classList.contains('keep-tab')) {
                            chrome.tabs.update(tab.id, { active: true });
                            chrome.windows.update(tab.windowId, { focused: true });
                        }
                    });

                    const keepButton = tabDiv.querySelector('.keep-tab');
                    keepButton.addEventListener('click', () => {
                        const tabsToClose = dupTabs
                            .filter(t => t.id !== tab.id)
                            .map(t => t.id);
                        chrome.tabs.remove(tabsToClose);
                        li.remove();
                    });

                    const closeButton = tabDiv.querySelector('.close-tab');
                    closeButton.addEventListener('click', () => {
                        chrome.tabs.remove(tab.id);
                        tabDiv.remove();
                        
                        if (tabsDiv.children.length === 1) {
                            li.remove();
                        }
                    });

                    tabsDiv.appendChild(tabDiv);
                });

                li.appendChild(tabsDiv);
                tabList.appendChild(li);
            });
        }
    }

    chrome.tabs.query({}, handleTabs);

    function updateShortcutsDisplay() {
        const shortcutsList = document.getElementById('shortcuts-list');
        chrome.commands.getAll(commands => {
            shortcutsList.innerHTML = commands
                .map(cmd => {
                    const shortcut = cmd.shortcut || 'Not set';
                    const description = cmd.description;
                    return `${description}: <b>${shortcut}</b><br>`;
                })
                .join('');
        });
    }

    updateShortcutsDisplay();
});
