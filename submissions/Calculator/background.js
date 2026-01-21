class BackgroundTabManager {
    constructor() {
        this.tabGroups = {};
        this.timeTracking = {};
        this.currentMode = 'work';
        this.activeTabStartTime = {};
        this.timeTrackingInterval = null;
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupMessageListener();
            this.setupTabListeners();
            this.startTimeTracking();
        } catch (error) {
            console.error('Failed to initialize BackgroundTabManager:', error);
        }
    }

    async loadData() {
        try {
            const result = await chrome.storage.sync.get(['tabGroups', 'currentMode', 'timeTracking']);
            this.tabGroups = result.tabGroups || {};
            this.currentMode = result.currentMode || 'work';
            this.timeTracking = result.timeTracking || {};
        } catch (error) {
            console.error('Failed to load data:', error);
            this.tabGroups = {};
            this.currentMode = 'work';
            this.timeTracking = {};
        }
    }

    async saveData() {
        try {
            await chrome.storage.sync.set({
                tabGroups: this.tabGroups,
                currentMode: this.currentMode,
                timeTracking: this.timeTracking
            });
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true;
        });
    }

    setupTabListeners() {
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.handleTabActivated(activeInfo).catch(error => {
                console.error('Error handling tab activation:', error);
            });
        });


        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete') {
                this.updateTabInGroups(tab).catch(error => {
                    console.error('Error updating tab in groups:', error);
                });
            }
        });

        chrome.tabs.onRemoved.addListener((tabId) => {
            this.removeTabFromGroups(tabId).catch(error => {
                console.error('Error removing tab from groups:', error);
            });
        });

        chrome.windows.onFocusChanged.addListener((windowId) => {
            if (windowId !== chrome.windows.WINDOW_ID_NONE) {
                this.handleWindowFocusChanged(windowId).catch(error => {
                    console.error('Error handling window focus change:', error);
                });
            }
        });
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'switchMode':
                    await this.switchMode(message.mode);
                    sendResponse({ success: true });
                    break;

                case 'addTabToGroup':
                    await this.addTabToGroup(message.tabId, message.groupKey, message.groupName, message.groupColor);
                    sendResponse({ success: true });
                    break;

                case 'openGroupTabs':
                    await this.openGroupTabs(message.tabs);
                    sendResponse({ success: true });
                    break;

                case 'closeGroupTabs':
                    await this.closeGroupTabs(message.groupKey);
                    sendResponse({ success: true });
                    break;

                case 'getTimeTracking':
                    sendResponse({ timeTracking: this.timeTracking });
                    break;

                case 'trackPageTime':
                    await this.trackPageTime(message.url, message.title, message.timeSpent);
                    sendResponse({ success: true });
                    break;

                case 'getTabGroups':
                    sendResponse({ tabGroups: this.tabGroups, currentMode: this.currentMode });
                    break;
                
                case 'deleteTabGroup':
                    await this.deleteTabGroup(message.groupKey);
                    sendResponse({ success: true });
                    break;    

                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async deleteTabGroup(groupKey) {
        try {
            if (!this.tabGroups[groupKey]) {
                console.log(`Group ${groupKey} not found`);
                return;
            }


            const tabs = await chrome.tabs.query({ currentWindow: true });
            
 
            const groups = await chrome.tabGroups.query({});
            const targetGroup = groups.find(group => group.title === this.tabGroups[groupKey].name);
            
            if (targetGroup) {

                const groupTabs = tabs.filter(tab => tab.groupId === targetGroup.id);
                
                if (groupTabs.length > 0) {

                    const tabIds = groupTabs.map(tab => tab.id);
                    await chrome.tabs.ungroup(tabIds);
                }
            }
            delete this.tabGroups[groupKey];
            await this.saveData();
            
            console.log(`Successfully deleted group: ${groupKey}`);
        } catch (error) {
            console.error('Error deleting tab group:', error);
            throw error;
        }
    }

    async switchMode(mode) {
        try {
            this.currentMode = mode;
            await this.saveData();
            await this.organizeTabsByMode(mode);
        } catch (error) {
            console.error('Error switching mode:', error);
            throw error;
        }
    }

    async organizeTabsByMode(mode) {
        try {
            const tabs = await chrome.tabs.query({ currentWindow: true });
            const modeKeywords = {
                work: ['linkedin', 'email', 'slack', 'teams', 'zoom', 'calendar', 'docs', 'sheets', 'office', 'notion'],
                code: ['github', 'stackoverflow', 'codepen', 'repl', 'dev.to', 'coding', 'programming', 'vscode', 'ide'],
                creativity: ['dribbble', 'behance', 'figma', 'canva', 'adobe', 'design', 'art', 'creative'],
                fun: ['youtube', 'netflix', 'gaming', 'reddit', 'social', 'entertainment', 'memes', 'twitter', 'instagram']
            };

            const keywords = modeKeywords[mode] || [];
            
            for (const tab of tabs) {
                const tabUrl = (tab.url || '').toLowerCase();
                const tabTitle = (tab.title || '').toLowerCase();
                
                const isRelevant = keywords.some(keyword => 
                    tabUrl.includes(keyword) || tabTitle.includes(keyword)
                );
                
                if (isRelevant) {
                    const groupColors = {
                        work: '#3b82f6',
                        code: '#10b981',
                        creativity: '#8b5cf6',
                        fun: '#f59e0b'
                    };
                    
                    await this.addTabToGroup(
                        tab.id,
                        mode,
                        mode.charAt(0).toUpperCase() + mode.slice(1),
                        groupColors[mode] || '#3b82f6'
                    );
                }
            }
        } catch (error) {
            console.error('Error organizing tabs by mode:', error);
        }
    }

    async addTabToGroup(tabId, groupKey, groupName, groupColor) {
        try {
            const tab = await chrome.tabs.get(tabId);
            let groupId = await this.getOrCreateTabGroup(groupName, groupColor);
            await chrome.tabs.group({ tabIds: [tabId], groupId: groupId });
            if (!this.tabGroups[groupKey]) {
                this.tabGroups[groupKey] = { 
                    tabs: [], 
                    color: groupColor, 
                    name: groupName,
                    created: Date.now() 
                };
            }
            
            const existingIndex = this.tabGroups[groupKey].tabs.findIndex(t => t.id === tabId);
            
            if (existingIndex === -1) {
                this.tabGroups[groupKey].tabs.push({
                    id: tabId,
                    url: tab.url,
                    title: tab.title,
                    favIconUrl: tab.favIconUrl,
                    added: Date.now()
                });
            } else {
                this.tabGroups[groupKey].tabs[existingIndex] = {
                    ...this.tabGroups[groupKey].tabs[existingIndex],
                    url: tab.url,
                    title: tab.title,
                    favIconUrl: tab.favIconUrl
                };
            }
            
            await this.saveData();
        } catch (error) {
            console.error('Error adding tab to group:', error);
            throw error;
        }
    }

    async getOrCreateTabGroup(groupName, groupColor) {
        try {
            const groups = await chrome.tabGroups.query({});
            let existingGroup = groups.find(group => group.title === groupName);
            
            if (existingGroup) {
                return existingGroup.id;
            }
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!activeTab) {
                throw new Error('No active tab to create group with');
            }
            
            const groupId = await chrome.tabs.group({ tabIds: [activeTab.id] });
            
            await chrome.tabGroups.update(groupId, {
                title: groupName,
                color: this.getGroupColor(groupColor)
            });
            
            return groupId;
        } catch (error) {
            console.error('Error creating/getting tab group:', error);
            throw error;
        }
    }

    getGroupColor(hexColor) {
        const colorMap = {
            '#3b82f6': 'blue',
            '#10b981': 'green',
            '#f59e0b': 'yellow',
            '#ef4444': 'red',
            '#8b5cf6': 'purple',
            '#06b6d4': 'cyan',
            '#ec4899': 'pink',
            '#64748b': 'grey'
        };
        
        return colorMap[hexColor] || 'blue';
    }

    async openGroupTabs(tabs) {
        try {
            for (const tabData of tabs) {
                await chrome.tabs.create({
                    url: tabData.url,
                    active: false
                });
            }
        } catch (error) {
            console.error('Error opening group tabs:', error);
            throw error;
        }
    }

    async closeGroupTabs(groupKey) {
        try {
            if (!this.tabGroups[groupKey]) return;
            
            const tabIds = this.tabGroups[groupKey].tabs.map(tab => tab.id);
            
            for (const tabId of tabIds) {
                try {
                    await chrome.tabs.remove(tabId);
                } catch (error) {
                    console.log('Tab already closed:', tabId);
                }
            }
            
            this.tabGroups[groupKey].tabs = [];
            await this.saveData();
        } catch (error) {
            console.error('Error closing group tabs:', error);
            throw error;
        }
    }

    async handleTabActivated(activeInfo) {
        try {
            const tab = await chrome.tabs.get(activeInfo.tabId);
            this.activeTabStartTime[activeInfo.tabId] = Date.now();
            const groupKey = this.findTabGroup(activeInfo.tabId);
            if (groupKey) {
                this.currentMode = groupKey;
                await this.saveData();
            }
        } catch (error) {
            console.error('Error handling tab activation:', error);
        }
    }

    findTabGroup(tabId) {
        for (const [groupKey, group] of Object.entries(this.tabGroups)) {
            if (group.tabs && group.tabs.some(tab => tab.id === tabId)) {
                return groupKey;
            }
        }
        return null;
    }

    async updateTabInGroups(tab) {
        try {
            let updated = false;
            
            for (const [groupKey, group] of Object.entries(this.tabGroups)) {
                if (!group.tabs) continue;
                
                const tabIndex = group.tabs.findIndex(t => t.id === tab.id);
                if (tabIndex !== -1) {
                    this.tabGroups[groupKey].tabs[tabIndex] = {
                        ...this.tabGroups[groupKey].tabs[tabIndex],
                        url: tab.url,
                        title: tab.title,
                        favIconUrl: tab.favIconUrl,
                        updated: Date.now()
                    };
                    updated = true;
                }
            }
            
            if (updated) {
                await this.saveData();
            }
        } catch (error) {
            console.error('Error updating tab in groups:', error);
        }
    }

    async removeTabFromGroups(tabId) {
        try {
            let removed = false;
            
            for (const [groupKey, group] of Object.entries(this.tabGroups)) {
                if (!group.tabs) continue;
                
                const originalLength = group.tabs.length;
                this.tabGroups[groupKey].tabs = group.tabs.filter(tab => tab.id !== tabId);
                
                if (this.tabGroups[groupKey].tabs.length !== originalLength) {
                    removed = true;
                }
            }
            delete this.activeTabStartTime[tabId];
            
            if (removed) {
                await this.saveData();
            }
        } catch (error) {
            console.error('Error removing tab from groups:', error);
        }
    }

    async trackPageTime(url, title, timeSpent) {
        try {
            const domain = new URL(url).hostname;
            
            if (!this.timeTracking.pages) {
                this.timeTracking.pages = {};
            }
            
            if (!this.timeTracking.pages[domain]) {
                this.timeTracking.pages[domain] = {
                    totalTime: 0,
                    visits: 0,
                    title: title
                };
            }
            
            this.timeTracking.pages[domain].totalTime += timeSpent;
            this.timeTracking.pages[domain].visits += 1;
            this.timeTracking.pages[domain].lastVisit = Date.now();
            
            await this.saveData();
        } catch (error) {
            console.error('Error tracking page time:', error);
        }
    }

    startTimeTracking() {
        if (this.timeTrackingInterval) {
            clearInterval(this.timeTrackingInterval);
        }
        

        this.timeTrackingInterval = setInterval(async () => {
            try {
                const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
                
                if (activeTab) {
                    const groupKey = this.findTabGroup(activeTab.id) || this.currentMode;
                    if (groupKey) {
                        if (!this.timeTracking.groups) {
                            this.timeTracking.groups = {};
                        }
                        
                        this.timeTracking.groups[groupKey] = (this.timeTracking.groups[groupKey] || 0) + 1;
                        await this.saveData();
                    }
                }
            } catch (error) {
                console.error('Error in time tracking interval:', error);
            }
        }, 60000); 
    }

    async handleWindowFocusChanged(windowId) {
        try {
            if (windowId !== chrome.windows.WINDOW_ID_NONE) {
                const [activeTab] = await chrome.tabs.query({ active: true, windowId: windowId });
                if (activeTab) {
                    this.activeTabStartTime[activeTab.id] = Date.now();
                }
            }
        } catch (error) {
            console.error('Error handling window focus change:', error);
        }
    }

    cleanup() {
        if (this.timeTrackingInterval) {
            clearInterval(this.timeTrackingInterval);
            this.timeTrackingInterval = null;
        }
    }
}

let backgroundManager;

try {
    backgroundManager = new BackgroundTabManager();
} catch (error) {
    console.error('Failed to initialize BackgroundTabManager:', error);
}

chrome.runtime.onSuspend.addListener(() => {
    if (backgroundManager) {
        backgroundManager.cleanup();
    }
});