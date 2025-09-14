/**
 * Local storage management for BlogCMS
 */

class Storage {
    constructor() {
        this.keys = {
            POSTS: 'blogcms_posts',
            CATEGORIES: 'blogcms_categories',
            SETTINGS: 'blogcms_settings'
        };
        
        // Initialize default data if not exists
        this.initializeDefaults();
    }
    
    // Initialize default data
    initializeDefaults() {
        if (!this.getCategories().length) {
            this.saveCategories([
                {
                    id: Utils.generateId(),
                    name: 'Technology',
                    description: 'Posts about technology and programming',
                    color: '#3b82f6',
                    createdAt: new Date().toISOString()
                },
                {
                    id: Utils.generateId(),
                    name: 'Lifestyle',
                    description: 'Posts about lifestyle and personal experiences',
                    color: '#10b981',
                    createdAt: new Date().toISOString()
                },
                {
                    id: Utils.generateId(),
                    name: 'Business',
                    description: 'Posts about business and entrepreneurship',
                    color: '#f59e0b',
                    createdAt: new Date().toISOString()
                }
            ]);
        }
        
        if (!this.getPosts().length) {
            this.createSamplePosts();
        }
    }
    
    // Create sample posts for demonstration
    createSamplePosts() {
        const categories = this.getCategories();
        const samplePosts = [
            {
                id: Utils.generateId(),
                title: 'Getting Started with Modern Web Development',
                slug: 'getting-started-modern-web-development',
                content: '<p>Web development has evolved significantly over the past few years. Modern frameworks and tools have made it easier than ever to build powerful, responsive web applications.</p><p>In this post, we\'ll explore the latest trends and best practices in web development, including:</p><ul><li>Modern JavaScript frameworks</li><li>Responsive design principles</li><li>Performance optimization techniques</li><li>Accessibility considerations</li></ul><p>Whether you\'re a beginner or an experienced developer, these insights will help you stay current with the rapidly evolving web development landscape.</p>',
                excerpt: 'Explore the latest trends and best practices in modern web development, from frameworks to performance optimization.',
                categoryId: categories.find(c => c.name === 'Technology')?.id || '',
                tags: ['web development', 'javascript', 'frontend'],
                status: 'published',
                createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
                updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
            },
            {
                id: Utils.generateId(),
                title: 'Building a Productive Morning Routine',
                slug: 'building-productive-morning-routine',
                content: '<p>A well-structured morning routine can set the tone for your entire day. Research shows that successful people often have consistent morning habits that help them stay focused and energized.</p><p>Here are some key elements of an effective morning routine:</p><ol><li><strong>Wake up early:</strong> Give yourself time to start the day without rushing</li><li><strong>Hydrate:</strong> Drink water to rehydrate your body after sleep</li><li><strong>Exercise:</strong> Even light movement can boost energy and mood</li><li><strong>Plan your day:</strong> Review your priorities and schedule</li><li><strong>Eat a healthy breakfast:</strong> Fuel your body and brain for the day ahead</li></ol><p>Remember, the best morning routine is one that works for your lifestyle and goals. Start small and gradually build habits that stick.</p>',
                excerpt: 'Discover how to create a morning routine that boosts productivity and sets you up for success throughout the day.',
                categoryId: categories.find(c => c.name === 'Lifestyle')?.id || '',
                tags: ['productivity', 'habits', 'wellness'],
                status: 'published',
                createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
                updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
            },
            {
                id: Utils.generateId(),
                title: 'The Future of Remote Work',
                slug: 'future-of-remote-work',
                content: '<p>The pandemic has fundamentally changed how we think about work. Remote work, once considered a perk, has become a necessity for many organizations worldwide.</p><p>As we look to the future, several trends are emerging:</p><h3>Hybrid Work Models</h3><p>Many companies are adopting hybrid approaches that combine remote and in-office work, giving employees flexibility while maintaining team collaboration.</p><h3>Digital-First Culture</h3><p>Organizations are investing in digital tools and processes that support remote collaboration and communication.</p><h3>Focus on Results</h3><p>There\'s a shift from measuring hours worked to measuring outcomes and results, leading to more autonomous work environments.</p><p>The future of work is likely to be more flexible, technology-driven, and focused on work-life balance than ever before.</p>',
                excerpt: 'Explore how remote work is reshaping the business landscape and what the future holds for distributed teams.',
                categoryId: categories.find(c => c.name === 'Business')?.id || '',
                tags: ['remote work', 'future', 'business trends'],
                status: 'draft',
                createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                updatedAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
        
        this.savePosts(samplePosts);
    }
    
    // Generic storage methods
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }
    
    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }
    
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
    
    // Posts management
    getPosts() {
        return this.getItem(this.keys.POSTS, []);
    }
    
    savePosts(posts) {
        return this.setItem(this.keys.POSTS, posts);
    }
    
    getPost(id) {
        const posts = this.getPosts();
        return posts.find(post => post.id === id);
    }
    
    savePost(post) {
        const posts = this.getPosts();
        const existingIndex = posts.findIndex(p => p.id === post.id);
        
        if (existingIndex >= 0) {
            posts[existingIndex] = { ...post, updatedAt: new Date().toISOString() };
        } else {
            const newPost = {
                ...post,
                id: post.id || Utils.generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            posts.push(newPost);
        }
        
        return this.savePosts(posts);
    }
    
    deletePost(id) {
        const posts = this.getPosts();
        const filteredPosts = posts.filter(post => post.id !== id);
        return this.savePosts(filteredPosts);
    }
    
    deletePosts(ids) {
        const posts = this.getPosts();
        const filteredPosts = posts.filter(post => !ids.includes(post.id));
        return this.savePosts(filteredPosts);
    }
    
    // Categories management
    getCategories() {
        return this.getItem(this.keys.CATEGORIES, []);
    }
    
    saveCategories(categories) {
        return this.setItem(this.keys.CATEGORIES, categories);
    }
    
    getCategory(id) {
        const categories = this.getCategories();
        return categories.find(category => category.id === id);
    }
    
    saveCategory(category) {
        const categories = this.getCategories();
        const existingIndex = categories.findIndex(c => c.id === category.id);
        
        if (existingIndex >= 0) {
            categories[existingIndex] = { ...category, updatedAt: new Date().toISOString() };
        } else {
            const newCategory = {
                ...category,
                id: category.id || Utils.generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            categories.push(newCategory);
        }
        
        return this.saveCategories(categories);
    }
    
    deleteCategory(id) {
        const categories = this.getCategories();
        const filteredCategories = categories.filter(category => category.id !== id);
        
        // Also remove category from posts
        const posts = this.getPosts();
        const updatedPosts = posts.map(post => {
            if (post.categoryId === id) {
                return { ...post, categoryId: '', updatedAt: new Date().toISOString() };
            }
            return post;
        });
        
        this.savePosts(updatedPosts);
        return this.saveCategories(filteredCategories);
    }
    
    // Settings management
    getSettings() {
        return this.getItem(this.keys.SETTINGS, {
            postsPerPage: 6,
            defaultStatus: 'draft',
            autoSave: true,
            theme: 'light'
        });
    }
    
    saveSettings(settings) {
        const currentSettings = this.getSettings();
        const updatedSettings = { ...currentSettings, ...settings };
        return this.setItem(this.keys.SETTINGS, updatedSettings);
    }
    
    // Search and filter methods
    searchPosts(query, filters = {}) {
        let posts = this.getPosts();
        
        // Apply text search
        if (query) {
            posts = posts.filter(post => {
                const searchText = `${post.title} ${post.content} ${post.excerpt} ${post.tags?.join(' ') || ''}`.toLowerCase();
                return searchText.includes(query.toLowerCase());
            });
        }
        
        // Apply filters
        if (filters.category) {
            posts = posts.filter(post => post.categoryId === filters.category);
        }
        
        if (filters.status) {
            posts = posts.filter(post => post.status === filters.status);
        }
        
        if (filters.tag) {
            posts = posts.filter(post => post.tags?.includes(filters.tag));
        }
        
        return posts;
    }
    
    // Statistics
    getStats() {
        const posts = this.getPosts();
        const categories = this.getCategories();
        
        const publishedPosts = posts.filter(post => post.status === 'published');
        const draftPosts = posts.filter(post => post.status === 'draft');
        
        const categoryStats = categories.map(category => ({
            ...category,
            postCount: posts.filter(post => post.categoryId === category.id).length
        }));
        
        return {
            totalPosts: posts.length,
            publishedPosts: publishedPosts.length,
            draftPosts: draftPosts.length,
            totalCategories: categories.length,
            categoryStats
        };
    }
    
    // Export/Import functionality
    exportData() {
        return {
            posts: this.getPosts(),
            categories: this.getCategories(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }
    
    importData(data) {
        try {
            if (data.posts) this.savePosts(data.posts);
            if (data.categories) this.saveCategories(data.categories);
            if (data.settings) this.saveSettings(data.settings);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
    
    // Clear all data
    clearAll() {
        this.removeItem(this.keys.POSTS);
        this.removeItem(this.keys.CATEGORIES);
        this.removeItem(this.keys.SETTINGS);
        this.initializeDefaults();
    }
}

// Create global storage instance
window.storage = new Storage();