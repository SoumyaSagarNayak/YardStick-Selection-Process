/**
 * Utility functions for the BlogCMS application
 */

// DOM utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Create element with attributes and content
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, value);
        } else {
            element[key] = value;
        }
    });
    
    if (content) {
        element.innerHTML = content;
    }
    
    return element;
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Generate URL slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Format date for display
function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

// Format relative time (e.g., "2 hours ago")
function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    return `${years} year${years !== 1 ? 's' : ''} ago`;
}

// Truncate text to specified length
function truncateText(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
}

// Strip HTML tags from text
function stripHtml(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

// Debounce function to limit function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function to limit function calls
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate URL format
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Sanitize HTML content
function sanitizeHtml(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

// Get random color
function getRandomColor() {
    const colors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
        '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
        '#ec4899', '#6366f1', '#14b8a6', '#eab308'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Parse tags from string
function parseTags(tagsString) {
    if (!tagsString) return [];
    return tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => tag.toLowerCase());
}

// Format tags for display
function formatTags(tags) {
    if (!Array.isArray(tags)) return '';
    return tags.join(', ');
}

// Search text in content
function searchInText(text, query) {
    if (!query) return true;
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    const content = text.toLowerCase();
    return searchTerms.every(term => content.includes(term));
}

// Sort array of objects by property
function sortBy(array, property, direction = 'asc') {
    return [...array].sort((a, b) => {
        let aVal = a[property];
        let bVal = b[property];
        
        // Handle dates
        if (property.includes('date') || property.includes('time')) {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        
        // Handle strings
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (direction === 'desc') {
            return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });
}

// Filter array of objects by multiple criteria
function filterBy(array, filters) {
    return array.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (!value) return true;
            
            if (key === 'search') {
                const searchableText = `${item.title} ${item.content} ${item.excerpt}`.toLowerCase();
                return searchableText.includes(value.toLowerCase());
            }
            
            if (Array.isArray(item[key])) {
                return item[key].includes(value);
            }
            
            return item[key] === value;
        });
    });
}

// Paginate array
function paginate(array, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
        data: array.slice(startIndex, endIndex),
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(array.length / limit),
            totalItems: array.length,
            hasNext: endIndex < array.length,
            hasPrev: startIndex > 0,
            startIndex: startIndex + 1,
            endIndex: Math.min(endIndex, array.length)
        }
    };
}

// Export functions for use in other modules
window.Utils = {
    $,
    $$,
    createElement,
    generateId,
    generateSlug,
    formatDate,
    formatRelativeTime,
    truncateText,
    stripHtml,
    debounce,
    throttle,
    isValidEmail,
    isValidUrl,
    sanitizeHtml,
    copyToClipboard,
    getRandomColor,
    parseTags,
    formatTags,
    searchInText,
    sortBy,
    filterBy,
    paginate
};