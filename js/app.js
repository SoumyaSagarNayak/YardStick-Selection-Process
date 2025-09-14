/**
 * Main application logic for BlogCMS
 */

class BlogCMS {
    constructor() {
        this.currentPage = 'home';
        this.currentPostId = null;
        this.currentFilters = {
            search: '',
            category: '',
            status: '',
            sort: 'newest'
        };
        this.currentPagination = {
            page: 1,
            limit: 6
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadCategories();
        this.showPage('home');
        this.renderPosts();
    }
    
    setupEventListeners() {
        // Navigation
        Utils.$$('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.showPage(page);
            });
        });
        
        // Mobile navigation toggle
        const navToggle = Utils.$('#nav-toggle');
        const navMenu = Utils.$('#nav-menu');
        
        navToggle?.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Search and filters
        const searchInput = Utils.$('#search-input');
        const searchBtn = Utils.$('#search-btn');
        const categoryFilter = Utils.$('#category-filter');
        const sortFilter = Utils.$('#sort-filter');
        
        const handleSearch = Utils.debounce(() => {
            this.currentFilters.search = searchInput.value;
            this.currentPagination.page = 1;
            this.renderPosts();
        }, 300);
        
        searchInput?.addEventListener('input', handleSearch);
        searchBtn?.addEventListener('click', handleSearch);
        
        categoryFilter?.addEventListener('change', () => {
            this.currentFilters.category = categoryFilter.value;
            this.currentPagination.page = 1;
            this.renderPosts();
        });
        
        sortFilter?.addEventListener('change', () => {
            this.currentFilters.sort = sortFilter.value;
            this.currentPagination.page = 1;
            this.renderPosts();
        });
        
        // Post form
        const postForm = Utils.$('#post-form');
        postForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePost();
        });
        
        // Auto-generate slug from title
        const titleInput = Utils.$('#post-title');
        const slugInput = Utils.$('#post-slug');
        
        titleInput?.addEventListener('input', Utils.debounce(() => {
            if (!slugInput.value) {
                slugInput.value = Utils.generateSlug(titleInput.value);
            }
        }, 300));
        
        // Rich text editor
        this.setupEditor();
        
        // Category management
        const addCategoryBtn = Utils.$('#add-category-btn');
        addCategoryBtn?.addEventListener('click', () => {
            this.showCategoryModal();
        });
        
        const categoryForm = Utils.$('#category-form');
        categoryForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });
        
        // Manage page
        this.setupManagePage();
        
        // Modal close handlers
        Utils.$$('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                Components.hideModal(modal.id);
            });
        });
        
        // Click outside modal to close
        Utils.$$('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    Components.hideModal(modal.id);
                }
            });
        });
        
        // Page navigation buttons
        Utils.$$('[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!btn.classList.contains('nav-link')) {
                    e.preventDefault();
                    const page = btn.dataset.page;
                    this.showPage(page);
                }
            });
        });
    }
    
    setupEditor() {
        const editor = Utils.$('#post-content');
        const toolbar = Utils.$('.editor-toolbar');
        
        if (!editor || !toolbar) return;
        
        // Toolbar button handlers
        toolbar.addEventListener('click', (e) => {
            if (e.target.classList.contains('editor-btn')) {
                e.preventDefault();
                const command = e.target.dataset.command;
                
                editor.focus();
                document.execCommand(command, false, null);
                
                // Update button states
                this.updateEditorToolbar();
            }
        });
        
        // Update toolbar on selection change
        editor.addEventListener('keyup', () => this.updateEditorToolbar());
        editor.addEventListener('mouseup', () => this.updateEditorToolbar());
    }
    
    updateEditorToolbar() {
        const buttons = Utils.$$('.editor-btn');
        
        buttons.forEach(btn => {
            const command = btn.dataset.command;
            const isActive = document.queryCommandState(command);
            btn.classList.toggle('active', isActive);
        });
    }
    
    setupManagePage() {
        // Manage page search
        const manageSearch = Utils.$('#manage-search');
        const manageStatusFilter = Utils.$('#manage-status-filter');
        
        const handleManageFilter = Utils.debounce(() => {
            this.renderManagePosts();
        }, 300);
        
        manageSearch?.addEventListener('input', handleManageFilter);
        manageStatusFilter?.addEventListener('change', handleManageFilter);
        
        // Select all checkbox
        const selectAll = Utils.$('#select-all');
        selectAll?.addEventListener('change', (e) => {
            const checkboxes = Utils.$$('.post-checkbox');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
            this.updateDeleteButton();
        });
        
        // Delete selected button
        const deleteSelected = Utils.$('#delete-selected');
        deleteSelected?.addEventListener('click', () => {
            this.deleteSelectedPosts();
        });
    }
    
    showPage(pageName) {
        // Update navigation
        Utils.$$('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageName);
        });
        
        // Update pages
        Utils.$$('.page').forEach(page => {
            page.classList.toggle('active', page.id === `${pageName}-page`);
        });
        
        this.currentPage = pageName;
        
        // Load page-specific content
        switch (pageName) {
            case 'home':
                this.renderPosts();
                break;
            case 'create':
                this.resetPostForm();
                break;
            case 'manage':
                this.renderManagePosts();
                break;
            case 'categories':
                this.renderCategories();
                break;
        }
        
        // Close mobile menu
        const navMenu = Utils.$('#nav-menu');
        const navToggle = Utils.$('#nav-toggle');
        navMenu?.classList.remove('active');
        navToggle?.classList.remove('active');
    }
    
    loadCategories() {
        const categories = window.storage.getCategories();
        
        // Update category filters
        const categorySelects = Utils.$$('#category-filter, #post-category');
        categorySelects.forEach(select => {
            // Clear existing options (except first)
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            
            // Add category options
            categories.forEach(category => {
                const option = Utils.createElement('option', {
                    value: category.id,
                    textContent: category.name
                });
                select.appendChild(option);
            });
        });
    }
    
    renderPosts() {
        Components.showLoading('Loading posts...');
        
        setTimeout(() => {
            const posts = this.getFilteredPosts();
            const paginatedResult = Utils.paginate(posts, this.currentPagination.page, this.currentPagination.limit);
            
            const postsGrid = Utils.$('#posts-grid');
            const noPostsEl = Utils.$('#no-posts');
            
            // Clear existing posts
            postsGrid.innerHTML = '';
            
            if (paginatedResult.data.length === 0) {
                postsGrid.appendChild(noPostsEl);
            } else {
                paginatedResult.data.forEach(post => {
                    const postCard = Components.createPostCard(post);
                    postsGrid.appendChild(postCard);
                });
                
                // Add pagination
                const paginationEl = Utils.$('#pagination');
                paginationEl.innerHTML = '';
                
                if (paginatedResult.pagination.totalPages > 1) {
                    const pagination = Components.createPagination(
                        paginatedResult.pagination,
                        (page) => {
                            this.currentPagination.page = page;
                            this.renderPosts();
                        }
                    );
                    paginationEl.appendChild(pagination);
                }
            }
            
            Components.hideLoading();
        }, 500);
    }
    
    getFilteredPosts() {
        let posts = window.storage.getPosts();
        
        // Apply search filter
        if (this.currentFilters.search) {
            posts = posts.filter(post => {
                const searchText = `${post.title} ${post.content} ${post.excerpt} ${post.tags?.join(' ') || ''}`.toLowerCase();
                return searchText.includes(this.currentFilters.search.toLowerCase());
            });
        }
        
        // Apply category filter
        if (this.currentFilters.category) {
            posts = posts.filter(post => post.categoryId === this.currentFilters.category);
        }
        
        // Apply sorting
        switch (this.currentFilters.sort) {
            case 'oldest':
                posts = Utils.sortBy(posts, 'createdAt', 'asc');
                break;
            case 'title':
                posts = Utils.sortBy(posts, 'title', 'asc');
                break;
            case 'newest':
            default:
                posts = Utils.sortBy(posts, 'createdAt', 'desc');
                break;
        }
        
        return posts;
    }
    
    renderManagePosts() {
        const search = Utils.$('#manage-search')?.value || '';
        const statusFilter = Utils.$('#manage-status-filter')?.value || '';
        
        let posts = window.storage.getPosts();
        
        // Apply filters
        if (search) {
            posts = posts.filter(post => {
                const searchText = `${post.title} ${post.content}`.toLowerCase();
                return searchText.includes(search.toLowerCase());
            });
        }
        
        if (statusFilter) {
            posts = posts.filter(post => post.status === statusFilter);
        }
        
        // Sort by newest first
        posts = Utils.sortBy(posts, 'createdAt', 'desc');
        
        const tbody = Utils.$('#posts-table-body');
        tbody.innerHTML = '';
        
        if (posts.length === 0) {
            const row = Utils.createElement('tr', {
                className: 'no-posts-row',
                innerHTML: '<td colspan="6">No posts found</td>'
            });
            tbody.appendChild(row);
        } else {
            posts.forEach(post => {
                const row = Components.createPostTableRow(post);
                tbody.appendChild(row);
            });
            
            // Add event listeners
            this.setupManagePostEvents();
        }
    }
    
    setupManagePostEvents() {
        // Edit post buttons
        Utils.$$('.edit-post').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const postId = btn.dataset.postId;
                this.editPost(postId);
            });
        });
        
        // Delete post buttons
        Utils.$$('.delete-post').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const postId = btn.dataset.postId;
                const post = window.storage.getPost(postId);
                
                if (post && await Components.showConfirm(`Are you sure you want to delete "${post.title}"?`)) {
                    this.deletePost(postId);
                }
            });
        });
        
        // Checkbox change handlers
        Utils.$$('.post-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                this.updateDeleteButton();
            });
        });
    }
    
    updateDeleteButton() {
        const checkboxes = Utils.$$('.post-checkbox:checked');
        const deleteBtn = Utils.$('#delete-selected');
        
        if (deleteBtn) {
            deleteBtn.disabled = checkboxes.length === 0;
            deleteBtn.textContent = `Delete Selected (${checkboxes.length})`;
        }
    }
    
    async deleteSelectedPosts() {
        const checkboxes = Utils.$$('.post-checkbox:checked');
        const postIds = Array.from(checkboxes).map(cb => cb.value);
        
        if (postIds.length === 0) return;
        
        const confirmed = await Components.showConfirm(
            `Are you sure you want to delete ${postIds.length} post${postIds.length !== 1 ? 's' : ''}?`
        );
        
        if (confirmed) {
            window.storage.deletePosts(postIds);
            Components.showToast(`Deleted ${postIds.length} post${postIds.length !== 1 ? 's' : ''}`, 'success');
            this.renderManagePosts();
            
            // Update select all checkbox
            const selectAll = Utils.$('#select-all');
            if (selectAll) selectAll.checked = false;
        }
    }
    
    renderCategories() {
        const categories = window.storage.getCategories();
        const categoriesGrid = Utils.$('#categories-grid');
        const noCategoriesEl = Utils.$('#no-categories');
        
        categoriesGrid.innerHTML = '';
        
        if (categories.length === 0) {
            categoriesGrid.appendChild(noCategoriesEl);
        } else {
            categories.forEach(category => {
                const categoryCard = Components.createCategoryCard(category);
                categoriesGrid.appendChild(categoryCard);
            });
            
            // Add event listeners
            this.setupCategoryEvents();
        }
    }
    
    setupCategoryEvents() {
        // Edit category buttons
        Utils.$$('.edit-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const categoryId = btn.dataset.categoryId;
                this.editCategory(categoryId);
            });
        });
        
        // Delete category buttons
        Utils.$$('.delete-category').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const categoryId = btn.dataset.categoryId;
                const category = window.storage.getCategory(categoryId);
                
                if (category && await Components.showConfirm(`Are you sure you want to delete "${category.name}"?`)) {
                    this.deleteCategory(categoryId);
                }
            });
        });
    }
    
    editPost(postId) {
        const post = window.storage.getPost(postId);
        if (!post) return;
        
        this.currentPostId = postId;
        this.populatePostForm(post);
        this.showPage('create');
        
        // Update page title
        const createTitle = Utils.$('#create-title');
        if (createTitle) createTitle.textContent = 'Edit Post';
    }
    
    populatePostForm(post) {
        Utils.$('#post-title').value = post.title || '';
        Utils.$('#post-slug').value = post.slug || '';
        Utils.$('#post-category').value = post.categoryId || '';
        Utils.$('#post-status').value = post.status || 'draft';
        Utils.$('#post-excerpt').value = post.excerpt || '';
        Utils.$('#post-content').innerHTML = post.content || '';
        Utils.$('#post-tags').value = Utils.formatTags(post.tags) || '';
    }
    
    resetPostForm() {
        this.currentPostId = null;
        
        const form = Utils.$('#post-form');
        if (form) form.reset();
        
        Utils.$('#post-content').innerHTML = '';
        
        // Update page title
        const createTitle = Utils.$('#create-title');
        if (createTitle) createTitle.textContent = 'Create New Post';
        
        // Clear form errors
        Components.clearFormErrors(form);
    }
    
    async savePost() {
        const form = Utils.$('#post-form');
        const saveBtn = Utils.$('#save-btn');
        const btnText = saveBtn.querySelector('.btn-text');
        const btnLoading = saveBtn.querySelector('.btn-loading');
        
        // Show loading state
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        saveBtn.disabled = true;
        
        // Validate form
        const validation = Components.validateForm(form, {
            title: {
                required: true,
                minLength: 1,
                maxLength: 200,
                label: 'Title'
            }
        });
        
        // Validate content
        const contentEditor = Utils.$('#post-content');
        const content = contentEditor.innerHTML.trim();
        
        if (!content || content === '<br>' || Utils.stripHtml(content).trim() === '') {
            Components.showFieldError(contentEditor, 'Content is required');
            validation.isValid = false;
        } else {
            Components.hideFieldError(contentEditor);
        }
        
        if (!validation.isValid) {
            // Hide loading state
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
            saveBtn.disabled = false;
            
            Components.showToast('Please fix the errors and try again', 'error');
            return;
        }
        
        // Prepare post data
        const formData = new FormData(form);
        const postData = {
            id: this.currentPostId || Utils.generateId(),
            title: formData.get('title').trim(),
            slug: formData.get('slug').trim() || Utils.generateSlug(formData.get('title')),
            categoryId: formData.get('category') || '',
            status: formData.get('status') || 'draft',
            excerpt: formData.get('excerpt').trim(),
            content: content,
            tags: Utils.parseTags(formData.get('tags'))
        };
        
        // Simulate save delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Save post
        const success = window.storage.savePost(postData);
        
        if (success) {
            Components.showToast(
                this.currentPostId ? 'Post updated successfully!' : 'Post created successfully!',
                'success'
            );
            this.showPage('home');
        } else {
            Components.showToast('Failed to save post. Please try again.', 'error');
        }
        
        // Hide loading state
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        saveBtn.disabled = false;
    }
    
    deletePost(postId) {
        const success = window.storage.deletePost(postId);
        
        if (success) {
            Components.showToast('Post deleted successfully!', 'success');
            this.renderManagePosts();
            
            // If we're on home page, refresh posts
            if (this.currentPage === 'home') {
                this.renderPosts();
            }
        } else {
            Components.showToast('Failed to delete post. Please try again.', 'error');
        }
    }
    
    showCategoryModal(categoryId = null) {
        const modal = Utils.$('#category-modal');
        const title = Utils.$('#category-modal-title');
        const form = Utils.$('#category-form');
        
        if (categoryId) {
            const category = window.storage.getCategory(categoryId);
            if (category) {
                title.textContent = 'Edit Category';
                Utils.$('#category-name').value = category.name;
                Utils.$('#category-description').value = category.description || '';
                Utils.$('#category-color').value = category.color;
                form.dataset.categoryId = categoryId;
            }
        } else {
            title.textContent = 'Add Category';
            form.reset();
            Utils.$('#category-color').value = Utils.getRandomColor();
            delete form.dataset.categoryId;
        }
        
        Components.showModal('category-modal');
    }
    
    editCategory(categoryId) {
        this.showCategoryModal(categoryId);
    }
    
    async saveCategory() {
        const form = Utils.$('#category-form');
        const categoryId = form.dataset.categoryId;
        
        // Validate form
        const validation = Components.validateForm(form, {
            name: {
                required: true,
                minLength: 1,
                maxLength: 50,
                label: 'Category name'
            }
        });
        
        if (!validation.isValid) {
            Components.showToast('Please fix the errors and try again', 'error');
            return;
        }
        
        const formData = new FormData(form);
        const categoryData = {
            id: categoryId || Utils.generateId(),
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            color: formData.get('color')
        };
        
        const success = window.storage.saveCategory(categoryData);
        
        if (success) {
            Components.showToast(
                categoryId ? 'Category updated successfully!' : 'Category created successfully!',
                'success'
            );
            Components.hideModal('category-modal');
            this.loadCategories();
            this.renderCategories();
        } else {
            Components.showToast('Failed to save category. Please try again.', 'error');
        }
    }
    
    async deleteCategory(categoryId) {
        const success = window.storage.deleteCategory(categoryId);
        
        if (success) {
            Components.showToast('Category deleted successfully!', 'success');
            this.loadCategories();
            this.renderCategories();
            
            // Refresh posts if on home page
            if (this.currentPage === 'home') {
                this.renderPosts();
            }
        } else {
            Components.showToast('Failed to delete category. Please try again.', 'error');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BlogCMS();
});