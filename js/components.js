/**
 * Reusable UI components for BlogCMS
 */

class Components {
    // Show loading overlay
    static showLoading(message = 'Loading...') {
        const overlay = Utils.$('#loading-overlay');
        const text = overlay.querySelector('p');
        if (text) text.textContent = message;
        overlay.classList.remove('hidden');
    }
    
    // Hide loading overlay
    static hideLoading() {
        const overlay = Utils.$('#loading-overlay');
        overlay.classList.add('hidden');
    }
    
    // Show toast notification
    static showToast(message, type = 'info', duration = 5000) {
        const container = Utils.$('#toast-container');
        const toastId = Utils.generateId();
        
        const toast = Utils.createElement('div', {
            className: `toast ${type}`,
            id: toastId
        });
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${icons[type]} ${titles[type]}</span>
                <button class="toast-close" onclick="Components.hideToast('${toastId}')">&times;</button>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => this.hideToast(toastId), duration);
        }
        
        return toastId;
    }
    
    // Hide toast notification
    static hideToast(toastId) {
        const toast = Utils.$(`#${toastId}`);
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }
    
    // Show confirmation modal
    static showConfirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const modal = Utils.$('#confirm-modal');
            const titleEl = Utils.$('#confirm-modal-title');
            const messageEl = Utils.$('#confirm-message');
            const okBtn = Utils.$('#confirm-ok');
            const cancelBtn = Utils.$('#confirm-cancel');
            
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            const handleOk = () => {
                this.hideModal('confirm-modal');
                cleanup();
                resolve(true);
            };
            
            const handleCancel = () => {
                this.hideModal('confirm-modal');
                cleanup();
                resolve(false);
            };
            
            const cleanup = () => {
                okBtn.removeEventListener('click', handleOk);
                cancelBtn.removeEventListener('click', handleCancel);
            };
            
            okBtn.addEventListener('click', handleOk);
            cancelBtn.addEventListener('click', handleCancel);
            
            this.showModal('confirm-modal');
        });
    }
    
    // Show modal
    static showModal(modalId) {
        const modal = Utils.$(`#${modalId}`);
        if (modal) {
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            
            // Focus first focusable element
            const focusable = modal.querySelector('input, textarea, select, button');
            if (focusable) focusable.focus();
            
            // Trap focus within modal
            this.trapFocus(modal);
        }
    }
    
    // Hide modal
    static hideModal(modalId) {
        const modal = Utils.$(`#${modalId}`);
        if (modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
        }
    }
    
    // Trap focus within element
    static trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
            
            if (e.key === 'Escape') {
                this.hideModal(element.id);
            }
        };
        
        element.addEventListener('keydown', handleTabKey);
        
        // Remove listener when modal is hidden
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && !element.classList.contains('show')) {
                    element.removeEventListener('keydown', handleTabKey);
                    observer.disconnect();
                }
            });
        });
        
        observer.observe(element, { attributes: true });
    }
    
    // Create post card
    static createPostCard(post) {
        const category = window.storage.getCategory(post.categoryId);
        const categoryName = category ? category.name : 'Uncategorized';
        const categoryColor = category ? category.color : '#6b7280';
        
        const card = Utils.createElement('article', {
            className: 'post-card',
            'data-post-id': post.id
        });
        
        card.innerHTML = `
            <header class="post-card-header">
                <h3 class="post-card-title">${Utils.sanitizeHtml(post.title)}</h3>
                <div class="post-card-meta">
                    <span class="post-category" style="background-color: ${categoryColor}">
                        ${Utils.sanitizeHtml(categoryName)}
                    </span>
                    <span class="post-status ${post.status}">${post.status}</span>
                    <time datetime="${post.createdAt}">${Utils.formatRelativeTime(post.createdAt)}</time>
                </div>
            </header>
            <div class="post-card-content">
                <p class="post-excerpt">${Utils.sanitizeHtml(post.excerpt || Utils.truncateText(Utils.stripHtml(post.content)))}</p>
                ${post.tags && post.tags.length > 0 ? `
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="post-tag">${Utils.sanitizeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add click handler to edit post
        card.addEventListener('click', () => {
            window.app.editPost(post.id);
        });
        
        return card;
    }
    
    // Create category card
    static createCategoryCard(category) {
        const stats = window.storage.getStats();
        const categoryStats = stats.categoryStats.find(c => c.id === category.id);
        const postCount = categoryStats ? categoryStats.postCount : 0;
        
        const card = Utils.createElement('div', {
            className: 'category-card',
            'data-category-id': category.id
        });
        
        card.style.borderLeftColor = category.color;
        
        card.innerHTML = `
            <div class="category-header">
                <div>
                    <h3 class="category-name">${Utils.sanitizeHtml(category.name)}</h3>
                    <p class="category-count">${postCount} post${postCount !== 1 ? 's' : ''}</p>
                </div>
                <div class="category-actions">
                    <button class="btn btn-secondary edit-category" data-category-id="${category.id}" title="Edit category">
                        ✏️
                    </button>
                    <button class="btn btn-danger delete-category" data-category-id="${category.id}" title="Delete category">
                        🗑️
                    </button>
                </div>
            </div>
            ${category.description ? `<p class="category-description">${Utils.sanitizeHtml(category.description)}</p>` : ''}
        `;
        
        return card;
    }
    
    // Create table row for post management
    static createPostTableRow(post) {
        const category = window.storage.getCategory(post.categoryId);
        const categoryName = category ? category.name : 'Uncategorized';
        
        const row = Utils.createElement('tr', {
            'data-post-id': post.id
        });
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="post-checkbox" value="${post.id}" aria-label="Select post">
            </td>
            <td>
                <strong>${Utils.sanitizeHtml(post.title)}</strong>
                <br>
                <small class="text-secondary">${Utils.formatRelativeTime(post.createdAt)}</small>
            </td>
            <td>${Utils.sanitizeHtml(categoryName)}</td>
            <td>
                <span class="post-status ${post.status}">${post.status}</span>
            </td>
            <td>${Utils.formatDate(post.createdAt, { month: 'short', day: 'numeric' })}</td>
            <td class="actions">
                <button class="btn btn-secondary edit-post" data-post-id="${post.id}" title="Edit post">
                    ✏️
                </button>
                <button class="btn btn-danger delete-post" data-post-id="${post.id}" title="Delete post">
                    🗑️
                </button>
            </td>
        `;
        
        return row;
    }
    
    // Create pagination
    static createPagination(pagination, onPageChange) {
        const container = Utils.createElement('div', { className: 'pagination' });
        
        if (pagination.totalPages <= 1) {
            return container;
        }
        
        // Previous button
        const prevBtn = Utils.createElement('button', {
            textContent: '← Previous',
            disabled: !pagination.hasPrev
        });
        prevBtn.addEventListener('click', () => {
            if (pagination.hasPrev) onPageChange(pagination.currentPage - 1);
        });
        container.appendChild(prevBtn);
        
        // Page info
        const info = Utils.createElement('span', {
            className: 'pagination-info',
            textContent: `${pagination.startIndex}-${pagination.endIndex} of ${pagination.totalItems}`
        });
        container.appendChild(info);
        
        // Page numbers (show max 5 pages)
        const startPage = Math.max(1, pagination.currentPage - 2);
        const endPage = Math.min(pagination.totalPages, startPage + 4);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = Utils.createElement('button', {
                textContent: i.toString(),
                className: i === pagination.currentPage ? 'active' : ''
            });
            pageBtn.addEventListener('click', () => onPageChange(i));
            container.appendChild(pageBtn);
        }
        
        // Next button
        const nextBtn = Utils.createElement('button', {
            textContent: 'Next →',
            disabled: !pagination.hasNext
        });
        nextBtn.addEventListener('click', () => {
            if (pagination.hasNext) onPageChange(pagination.currentPage + 1);
        });
        container.appendChild(nextBtn);
        
        return container;
    }
    
    // Form validation
    static validateForm(form, rules) {
        let isValid = true;
        const errors = {};
        
        Object.entries(rules).forEach(([fieldName, fieldRules]) => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            const value = field ? field.value.trim() : '';
            const fieldErrors = [];
            
            // Required validation
            if (fieldRules.required && !value) {
                fieldErrors.push(`${fieldRules.label || fieldName} is required`);
            }
            
            // Min length validation
            if (fieldRules.minLength && value.length < fieldRules.minLength) {
                fieldErrors.push(`${fieldRules.label || fieldName} must be at least ${fieldRules.minLength} characters`);
            }
            
            // Max length validation
            if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
                fieldErrors.push(`${fieldRules.label || fieldName} must be no more than ${fieldRules.maxLength} characters`);
            }
            
            // Email validation
            if (fieldRules.email && value && !Utils.isValidEmail(value)) {
                fieldErrors.push(`${fieldRules.label || fieldName} must be a valid email address`);
            }
            
            // URL validation
            if (fieldRules.url && value && !Utils.isValidUrl(value)) {
                fieldErrors.push(`${fieldRules.label || fieldName} must be a valid URL`);
            }
            
            // Custom validation
            if (fieldRules.custom && typeof fieldRules.custom === 'function') {
                const customError = fieldRules.custom(value);
                if (customError) fieldErrors.push(customError);
            }
            
            if (fieldErrors.length > 0) {
                isValid = false;
                errors[fieldName] = fieldErrors;
                this.showFieldError(field, fieldErrors[0]);
            } else {
                this.hideFieldError(field);
            }
        });
        
        return { isValid, errors };
    }
    
    // Show field error
    static showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        const errorEl = formGroup.querySelector('.error-message');
        
        formGroup.classList.add('error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
    }
    
    // Hide field error
    static hideFieldError(field) {
        const formGroup = field.closest('.form-group');
        const errorEl = formGroup.querySelector('.error-message');
        
        formGroup.classList.remove('error');
        if (errorEl) {
            errorEl.classList.remove('show');
        }
    }
    
    // Clear all form errors
    static clearFormErrors(form) {
        const errorElements = form.querySelectorAll('.error-message.show');
        const errorGroups = form.querySelectorAll('.form-group.error');
        
        errorElements.forEach(el => el.classList.remove('show'));
        errorGroups.forEach(group => group.classList.remove('error'));
    }
}

// Make Components available globally
window.Components = Components;