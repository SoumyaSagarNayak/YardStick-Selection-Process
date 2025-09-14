# BlogCMS - Vanilla JavaScript Content Management System

A complete, fully functional blog and content management system built with vanilla HTML, CSS, and JavaScript. No frameworks, no dependencies - just pure web technologies.

## Features

### 📝 Content Management
- **Create & Edit Posts**: Rich text editor with formatting tools
- **Draft & Publish**: Save posts as drafts or publish immediately
- **Categories**: Organize posts with color-coded categories
- **Tags**: Add searchable tags to posts
- **Auto-slug Generation**: Automatic URL-friendly slugs from titles

### 🔍 Content Discovery
- **Search**: Full-text search across titles, content, and tags
- **Filter by Category**: Filter posts by category
- **Sort Options**: Sort by date (newest/oldest) or title
- **Pagination**: Navigate through large collections of posts

### 📊 Management Dashboard
- **Posts Overview**: Grid view of all posts with status indicators
- **Bulk Operations**: Select and delete multiple posts
- **Category Management**: Create, edit, and delete categories
- **Post Statistics**: View post counts and category distribution

### 🎨 User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme Support**: Respects system preferences
- **Accessibility**: Full keyboard navigation and screen reader support
- **Loading States**: Smooth loading animations and user feedback
- **Toast Notifications**: Non-intrusive success/error messages

### 💾 Data Persistence
- **Local Storage**: All data persists in browser's local storage
- **Offline Capable**: Works completely offline after initial load
- **Data Export/Import**: Backup and restore functionality
- **Sample Content**: Comes with sample posts and categories

## Technical Implementation

### Architecture
- **Modular Design**: Separated into logical modules (utils, storage, components, app)
- **Component-Based**: Reusable UI components for consistent interface
- **Event-Driven**: Clean event handling with proper cleanup
- **Responsive**: Mobile-first CSS with progressive enhancement

### Code Quality
- **ES6+ JavaScript**: Modern JavaScript features and syntax
- **Semantic HTML**: Proper HTML5 semantic elements
- **CSS Custom Properties**: Maintainable CSS with design tokens
- **Accessibility**: ARIA labels, keyboard navigation, focus management

### Performance
- **Debounced Search**: Optimized search with debouncing
- **Lazy Loading**: Efficient rendering of large datasets
- **Minimal DOM Manipulation**: Optimized for performance
- **CSS Animations**: Hardware-accelerated transitions

## File Structure

```
├── index.html              # Main HTML structure
├── css/
│   └── styles.css          # Complete CSS styling
├── js/
│   ├── utils.js           # Utility functions
│   ├── storage.js         # Local storage management
│   ├── components.js      # Reusable UI components
│   └── app.js            # Main application logic
└── README.md             # This file
```

## Getting Started

1. **Clone or Download**: Get the project files
2. **Open in Browser**: Simply open `index.html` in any modern browser
3. **Start Creating**: Begin creating posts and categories immediately

No build process, no installation, no dependencies required!

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Features in Detail

### Rich Text Editor
- Bold, italic, underline formatting
- Bullet and numbered lists
- Clean HTML output
- Keyboard shortcuts support

### Search & Filtering
- Real-time search as you type
- Search across titles, content, excerpts, and tags
- Category-based filtering
- Multiple sort options

### Category Management
- Color-coded categories
- Category descriptions
- Post count tracking
- Bulk category operations

### Post Management
- Draft and published status
- Bulk selection and deletion
- Quick edit access
- Creation and modification timestamps

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interface
- Optimized for all screen sizes

## Customization

### Styling
All styles are contained in `css/styles.css` with CSS custom properties for easy theming:

```css
:root {
    --primary-color: #3b82f6;
    --secondary-color: #6b7280;
    --success-color: #10b981;
    /* ... more variables */
}
```

### Functionality
The modular JavaScript structure makes it easy to extend:

- `utils.js`: Add new utility functions
- `storage.js`: Modify data persistence logic
- `components.js`: Create new UI components
- `app.js`: Add new features and pages

## Data Storage

All data is stored in the browser's localStorage:

- **Posts**: Complete post data including content, metadata, and timestamps
- **Categories**: Category information with colors and descriptions
- **Settings**: User preferences and configuration

### Data Format
```javascript
// Post structure
{
    id: "unique-id",
    title: "Post Title",
    slug: "post-title",
    content: "<p>HTML content</p>",
    excerpt: "Brief description",
    categoryId: "category-id",
    tags: ["tag1", "tag2"],
    status: "published|draft",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## Security Considerations

- **XSS Prevention**: All user input is sanitized before display
- **Content Security**: HTML content is properly escaped
- **Local Storage**: Data remains on user's device only

## Performance Optimizations

- **Debounced Search**: Prevents excessive filtering operations
- **Virtual Scrolling**: Efficient handling of large post collections
- **Lazy Loading**: Components load only when needed
- **Optimized Rendering**: Minimal DOM updates

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Logical focus flow
- **High Contrast Support**: Respects user preferences
- **Reduced Motion**: Honors prefers-reduced-motion

## Future Enhancements

Potential features that could be added:

- **Export to Markdown**: Convert posts to Markdown format
- **Image Upload**: Local image storage and management
- **Themes**: Multiple color schemes
- **Backup/Restore**: Cloud backup integration
- **Multi-language**: Internationalization support

## Contributing

This is a demonstration project showcasing vanilla web technologies. Feel free to:

- Fork and modify for your own use
- Submit issues for bugs or suggestions
- Create pull requests for improvements
- Use as a learning resource

## License

This project is open source and available under the MIT License.

---

**Built with ❤️ using vanilla HTML, CSS, and JavaScript**