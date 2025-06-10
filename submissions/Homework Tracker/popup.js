// Homework Tracker Chrome Extension - Main JavaScript

class HomeworkTracker {
    constructor() {
        this.assignments = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.loadAssignments();
        this.setupEventListeners();
        this.renderAssignments();
        this.setTodayAsDefault();
    }

    setupEventListeners() {
        // Add assignment button
        document.getElementById('addBtn').addEventListener('click', () => this.addAssignment());

        // Enter key in input fields
        ['assignmentTitle', 'assignmentSubject'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addAssignment();
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
    }

    setTodayAsDefault() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('assignmentDate').value = today;
    }

    async loadAssignments() {
        try {
            const result = await chrome.storage.local.get(['assignments']);
            this.assignments = result.assignments || [];
        } catch (error) {
            console.error('Error loading assignments:', error);
            this.assignments = [];
        }
    }

    async saveAssignments() {
        try {
            await chrome.storage.local.set({ assignments: this.assignments });
        } catch (error) {
            console.error('Error saving assignments:', error);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async addAssignment() {
        const title = document.getElementById('assignmentTitle').value.trim();
        const subject = document.getElementById('assignmentSubject').value.trim();
        const date = document.getElementById('assignmentDate').value;
        const description = document.getElementById('assignmentDescription').value.trim();

        if (!title || !subject || !date) {
            this.showError('Please fill in title, subject, and due date');
            return;
        }

        const assignment = {
            id: this.generateId(),
            title,
            subject,
            date,
            description,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.assignments.push(assignment);
        await this.saveAssignments();
        
        // Clear form
        document.getElementById('assignmentTitle').value = '';
        document.getElementById('assignmentSubject').value = '';
        document.getElementById('assignmentDescription').value = '';
        this.setTodayAsDefault();

        this.renderAssignments();
        this.showSuccess('Assignment added successfully!');
    }

    async toggleComplete(id) {
        const assignment = this.assignments.find(a => a.id === id);
        if (assignment) {
            assignment.completed = !assignment.completed;
            await this.saveAssignments();
            this.renderAssignments();
        }
    }

    async deleteAssignment(id) {
        if (confirm('Are you sure you want to delete this assignment?')) {
            this.assignments = this.assignments.filter(a => a.id !== id);
            await this.saveAssignments();
            this.renderAssignments();
            this.showSuccess('Assignment deleted');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.renderAssignments();
    }

    getFilteredAssignments() {
        let filtered = [...this.assignments];

        // Apply filter
        switch (this.currentFilter) {
            case 'pending':
                filtered = filtered.filter(a => !a.completed);
                break;
            case 'completed':
                filtered = filtered.filter(a => a.completed);
                break;
        }

        // Sort by due date (earliest first)
        filtered.sort((a, b) => {
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            return new Date(a.date) - new Date(b.date);
        });

        return filtered;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Reset time for comparison
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        if (date.getTime() === today.getTime()) {
            return 'Today';
        } else if (date.getTime() === tomorrow.getTime()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    }

    getDateStatus(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Reset time for comparison
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        if (date < today) {
            return 'overdue';
        } else if (date.getTime() === today.getTime() || date.getTime() === tomorrow.getTime()) {
            return 'due-soon';
        }
        return '';
    }

    renderAssignments() {
        const container = document.getElementById('assignmentsList');
        const emptyState = document.getElementById('emptyState');
        const filtered = this.getFilteredAssignments();

        if (filtered.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        container.innerHTML = filtered.map(assignment => {
            const dateStatus = this.getDateStatus(assignment.date);
            const formattedDate = this.formatDate(assignment.date);
            
            return `
                <div class="assignment-item ${assignment.completed ? 'completed' : ''}" data-id="${assignment.id}">
                    <div class="assignment-header">
                        <h3 class="assignment-title">${this.escapeHtml(assignment.title)}</h3>
                        <div class="assignment-actions">
                            <button class="action-btn complete-btn" onclick="tracker.toggleComplete('${assignment.id}')" title="${assignment.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                                ${assignment.completed ? '↶' : '✓'}
                            </button>
                            <button class="action-btn delete-btn" onclick="tracker.deleteAssignment('${assignment.id}')" title="Delete assignment">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div class="assignment-meta">
                        <span class="assignment-subject">${this.escapeHtml(assignment.subject)}</span>
                        <span class="assignment-date ${dateStatus}">${formattedDate}</span>
                    </div>
                    ${assignment.description ? `<div class="assignment-description">${this.escapeHtml(assignment.description)}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: type === 'success' ? '#28a745' : '#dc3545',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '1000',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideDown 0.3s ease-out'
        });

        // Add animation keyframes
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideDown {
                    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideDown 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
}

// Initialize the tracker when the popup loads
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new HomeworkTracker();
});
