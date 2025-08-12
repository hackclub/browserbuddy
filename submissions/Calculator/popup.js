class TabOrganizer {
    constructor() {
        this.groups = {};
        this.currentMode = 'work';
        this.timeTracking = {};
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.renderGroups();
            this.updateStats();
            this.startTimeTracking();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('INITIALIZATION ERROR');
        }
    }

    showNotification(message) {
        const existingNotifications = document.querySelectorAll('.tab-organizer-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = 'tab-organizer-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #000000;
            color: #ffffff;
            border: 3px solid #ffffff;
            padding: 12px 16px;
            font-family: 'Courier New', monospace;
            font-weight: 900;
            font-size: 14px;
            text-transform: uppercase;
            z-index: 10000;
            transform: translateX(400px);
            transition: all 0.3s ease;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);


        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 100);
            }
        }, 1000);
    }

    async loadData() {
        try {

            if (!chrome || !chrome.storage || !chrome.storage.sync) {
                throw new Error('Chrome storage API not available');
            }

            const result = await chrome.storage.sync.get(['tabGroups', 'currentMode', 'timeTracking']);
            

            this.groups = result.tabGroups || {};
            

            const defaultGroups = {
                WORK: { name: 'WORK', tabs: [], color: '#ffffff', created: Date.now() },
                CODE: { name: 'CODE', tabs: [], color: '#ffffff', created: Date.now() },
                CREATIVITY: { name: 'CREATIVE', tabs: [], color: '#ffffff', created: Date.now() },
                FUN: { name: 'FUN', tabs: [], color: '#ffffff', created: Date.now() }
            };

            for (const [key, defaultGroup] of Object.entries(defaultGroups)) {
                if (!this.groups[key]) {
                    this.groups[key] = { ...defaultGroup };
                }
            }
            
            this.currentMode = result.currentMode || 'work';
            this.timeTracking = result.timeTracking || {};
            

            await this.saveData();
        } catch (error) {
            console.error('Error loading data:', error);
            this.initializeDefaults();
        }
    }

    initializeDefaults() {
        this.groups = {
            WORK: { name: 'WORK', tabs: [], color: '#ffffff', created: Date.now() },
            CODE: { name: 'CODE', tabs: [], color: '#ffffff', created: Date.now() },
            CREATIVITY: { name: 'CREATIVE', tabs: [], color: '#ffffff', created: Date.now() },
            FUN: { name: 'FUN', tabs: [], color: '#ffffff', created: Date.now() }
        };
        this.currentMode = 'work';
        this.timeTracking = {};
    }

    async saveData() {
        try {
            if (chrome && chrome.storage && chrome.storage.sync) {
                await chrome.storage.sync.set({
                    tabGroups: this.groups,
                    currentMode: this.currentMode,
                    timeTracking: this.timeTracking
                });
            }
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    setupEventListeners() {
        
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                if (mode) {
                    this.switchMode(mode);
                }
            });
        });


        const addGroupBtn = document.getElementById('add-group-btn');
        if (addGroupBtn) {
            addGroupBtn.addEventListener('click', () => {
                this.createNewGroup();
            });
        }

        const newGroupInput = document.getElementById('new-group-name');
        if (newGroupInput) {
            newGroupInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.createNewGroup();
                }
            });
        }

        this.updateModeDisplay();
    }

    async switchMode(mode) {
        if (!mode || !this.groups[mode]) {
            console.error('Invalid mode:', mode);
            return;
        }

        this.currentMode = mode;
        await this.saveData();
        this.updateModeDisplay();

        try {
            if (chrome && chrome.runtime) {
                chrome.runtime.sendMessage({
                    action: 'switchMode',
                    mode: mode
                });
            }
        } catch (error) {
            console.error('Error sending message to background script:', error);
        }
        
        this.showNotification(`SWITCHED TO ${mode.toUpperCase()} MODE`);
    }

    updateModeDisplay() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === this.currentMode) {
                btn.classList.add('active');
            }
        });
    }

    async createNewGroup() {
        const input = document.getElementById('new-group-name');
        if (!input) {
            console.error('New group input not found');
            return;
        }

        const groupName = input.value.trim().toUpperCase();
        
        if (!groupName) {
            this.showNotification('PLEASE ENTER A GROUP NAME');
            return;
        }
        
        if (groupName.length > 20) {
            this.showNotification('GROUP NAME TOO LONG');
            return;
        }

        const groupKey = groupName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        if (this.groups[groupKey]) {
            this.showNotification('GROUP ALREADY EXISTS!');
            return;
        }

        this.groups[groupKey] = {
            name: groupName,
            tabs: [],
            color: '#ffffff',
            created: Date.now()
        };

        await this.saveData();
        this.renderGroups();
        input.value = '';
        

        this.showNotification(`GROUP "${groupName}" CREATED`);
    }

    async renderGroups() {
        const container = document.getElementById('groups-container');
        if (!container) {
            console.error('Groups container not found');
            return;
        }

        container.innerHTML = '';

        for (const [key, group] of Object.entries(this.groups)) {
            try {
                const groupElement = this.createGroupElement(key, group);
                container.appendChild(groupElement);
            } catch (error) {
                console.error('Error creating group element:', error);
            }
        }
    }

    createGroupElement(key, group) {
        const div = document.createElement('div');
        div.className = 'group-item';
        
        const groupName = group.name || key.toUpperCase();
        const tabCount = Array.isArray(group.tabs) ? group.tabs.length : 0;
        const timeSpent = this.formatTime(this.timeTracking[key] || 0);

        div.innerHTML = `
            <div class="group-header">
                <div class="group-name">${this.escapeHtml(groupName)}</div>
                <div class="tab-count">${tabCount}</div>
            </div>
            <div class="group-time">TIME: ${timeSpent}</div>
            <div class="drop-zone" data-group="${key}">
                DROP TABS HERE
            </div>
            <div class="group-actions">
                <button class="action-btn" data-action="open" data-group="${key}">OPEN</button>
                <button class="action-btn" data-action="close" data-group="${key}">CLOSE</button>
                <button class="action-btn delete" data-action="delete" data-group="${key}">DELETE</button>
            </div>
        `;

        this.setupGroupActions(div, key);
        return div;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupGroupActions(element, groupKey) {

        const actionButtons = element.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.dataset.action;
                if (action) {
                    this.handleGroupAction(action, groupKey);
                }
            });
        });


        const dropZone = element.querySelector('.drop-zone');
        if (!dropZone) return;
        
        dropZone.addEventListener('click', () => {
            this.addCurrentTabToGroup(groupKey);
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            this.handleTabDrop(e, groupKey);
        });
    }

    async addCurrentTabToGroup(groupKey) {
        try {
            if (!chrome || !chrome.tabs) {
                throw new Error('Chrome tabs API not available');
            }

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                this.showNotification('NO ACTIVE TAB FOUND');
                return;
            }

            if (!this.groups[groupKey]) {
                console.error('Group not found:', groupKey);
                return;
            }


            if (!Array.isArray(this.groups[groupKey].tabs)) {
                this.groups[groupKey].tabs = [];
            }


            const existingTab = this.groups[groupKey].tabs.find(t => t.id === tab.id || t.url === tab.url);
            if (existingTab) {
                this.showNotification('TAB ALREADY IN GROUP');
                return;
            }

            this.groups[groupKey].tabs.push({
                id: tab.id,
                url: tab.url,
                title: tab.title || 'Untitled',
                favIconUrl: tab.favIconUrl || '',
                added: Date.now()
            });
            
            await this.saveData();
            

            try {
                if (chrome && chrome.runtime) {
                    chrome.runtime.sendMessage({
                        action: 'addTabToGroup',
                        tabId: tab.id,
                        groupKey: groupKey,
                        groupName: this.groups[groupKey].name || groupKey,
                        groupColor: this.groups[groupKey].color
                    });
                }
            } catch (error) {
                console.error('Error sending message to background:', error);
            }
            
            this.renderGroups();
            this.showNotification(`TAB ADDED TO ${this.groups[groupKey].name || groupKey.toUpperCase()}`);
        } catch (error) {
            console.error('Error adding tab to group:', error);
            this.showNotification('ERROR ADDING TAB');
        }
    }

    async handleGroupAction(action, groupKey) {
        if (!this.groups[groupKey]) {
            console.error('Group not found:', groupKey);
            return;
        }

        const isDefaultGroup = ['work', 'code', 'creativity', 'fun'].includes(groupKey);
        
        try {
            switch (action) {
                case 'open':
                    if (this.groups[groupKey] && Array.isArray(this.groups[groupKey].tabs) && this.groups[groupKey].tabs.length > 0) {
                        if (chrome && chrome.runtime) {
                            chrome.runtime.sendMessage({
                                action: 'openGroupTabs',
                                groupKey: groupKey,
                                tabs: this.groups[groupKey].tabs
                            });
                        }
                        this.showNotification(`OPENED ${this.groups[groupKey].name || groupKey.toUpperCase()} TABS`);
                    } else {
                        this.showNotification('NO TABS IN GROUP');
                    }
                    break;
                    
                case 'close':
                    if (chrome && chrome.runtime) {
                        chrome.runtime.sendMessage({
                            action: 'closeGroupTabs',
                            groupKey: groupKey
                        });
                    }
                    this.groups[groupKey].tabs = [];
                    await this.saveData();
                    this.renderGroups();
                    this.showNotification(`CLOSED ${this.groups[groupKey].name || groupKey.toUpperCase()} TABS`);
                    break;
                    
                case 'delete':
                    if (isDefaultGroup) {
                        this.showNotification('CANNOT DELETE DEFAULT GROUPS');
                        return;
                    }
                    
                    if (confirm(`DELETE GROUP "${this.groups[groupKey].name || groupKey.toUpperCase()}"?\n\nNote: Tabs will remain open, only the group will be removed.`)) {

                        if (chrome && chrome.runtime) {
                            chrome.runtime.sendMessage({
                                action: 'deleteTabGroup',
                                groupKey: groupKey,
                                groupName: this.groups[groupKey].name || groupKey,
                                tabIds: this.groups[groupKey].tabs.map(tab => tab.id)
                            });
                        }
                        

                        delete this.groups[groupKey];
                        delete this.timeTracking[groupKey];
                        

                        if (this.currentMode === groupKey) {
                            this.currentMode = 'work';
                        }
                        
                        await this.saveData();
                        this.renderGroups();
                        this.updateModeDisplay();
                        this.showNotification('GROUP PERMANENTLY DELETED');
                    }
                    break;

                default:
                    console.error('Unknown action:', action);
            }
        } catch (error) {
            console.error('Error handling group action:', error);
            this.showNotification('ACTION FAILED');
        }
    }

    async handleTabDrop(event, groupKey) {
        try {
            const tabData = event.dataTransfer.getData('text/plain');
            if (tabData) {
                const tab = JSON.parse(tabData);
                await this.addTabToGroup(tab, groupKey);
            }
        } catch (error) {
            console.error('Error parsing dropped tab data:', error);
            this.showNotification('INVALID TAB DATA');
        }
    }

    async addTabToGroup(tab, groupKey) {
        if (!this.groups[groupKey] || !tab) {
            return;
        }

        // Ensure tabs array exists
        if (!Array.isArray(this.groups[groupKey].tabs)) {
            this.groups[groupKey].tabs = [];
        }

        // Check if tab already exists
        const existingTab = this.groups[groupKey].tabs.find(t => t.id === tab.id || t.url === tab.url);
        if (!existingTab) {
            this.groups[groupKey].tabs.push({
                id: tab.id,
                url: tab.url,
                title: tab.title || 'Untitled',
                favIconUrl: tab.favIconUrl || '',
                added: Date.now()
            });
            
            await this.saveData();
            this.renderGroups();
            this.showNotification(`TAB ADDED TO ${this.groups[groupKey].name || groupKey.toUpperCase()}`);
        }
    }

    startTimeTracking() {
        if (this.timeTrackingInterval) {
            clearInterval(this.timeTrackingInterval);
        }

        this.timeTrackingInterval = setInterval(async () => {
            if (this.currentMode && this.groups[this.currentMode]) {
                this.timeTracking[this.currentMode] = (this.timeTracking[this.currentMode] || 0) + 1;
                await this.saveData();
                this.updateTimeDisplay();
            }
        }, 60000); 
    }

    updateTimeDisplay() {

        Object.keys(this.groups).forEach(mode => {
            const timeEl = document.getElementById(`${mode}-time`);
            if (timeEl) {
                timeEl.textContent = this.formatTime(this.timeTracking[mode] || 0);
            }
        });
    }

    async updateStats() {
        try {
            let totalTabs = 0;
            if (chrome && chrome.tabs) {
                const tabs = await chrome.tabs.query({});
                totalTabs = tabs.length;
            }

            const totalTime = Object.values(this.timeTracking).reduce((sum, time) => sum + (time || 0), 0);
            
            const totalTimeEl = document.getElementById('total-time');
            const activeTabsEl = document.getElementById('active-tabs');
            
            if (totalTimeEl) {
                totalTimeEl.textContent = this.formatTime(totalTime);
            }
            if (activeTabsEl) {
                activeTabsEl.textContent = totalTabs;
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    formatTime(minutes) {
        const mins = parseInt(minutes) || 0;
        if (mins < 60) {
            return `${mins}m`;
        } else {
            const hours = Math.floor(mins / 60);
            const remainingMins = mins % 60;
            return `${hours}h ${remainingMins}m`;
        }
    }


    destroy() {
        if (this.timeTrackingInterval) {
            clearInterval(this.timeTrackingInterval);
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    try {
        window.tabOrganizer = new TabOrganizer();
    } catch (error) {
        console.error('Failed to initialize TabOrganizer:', error);
    }
});


window.addEventListener('beforeunload', () => {
    if (window.tabOrganizer && window.tabOrganizer.destroy) {
        window.tabOrganizer.destroy();
    }
});