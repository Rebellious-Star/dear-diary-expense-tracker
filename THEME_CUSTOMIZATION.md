# Theme Customization Feature

## Overview
The Dear Diary Expense Tracker now includes a comprehensive theme customization system that allows users to personalize their experience with custom backgrounds and color themes.

## Features

### 1. Custom Background Wallpaper
- **Upload your own image**: Users can upload any image (JPG, PNG, GIF) as a background
- **File size limit**: Maximum 3MB for optimal performance
- **Auto-optimization**: Large images (>1920px) are automatically compressed and resized
- **Elegant translucent overlay**: A gradient overlay (85-88% opacity) ensures text readability without being tacky
- **Persistent storage**: Background images are saved in localStorage and persist across sessions
- **Hardware accelerated**: Uses GPU acceleration for smooth rendering

### 2. Theme Presets
Seven beautiful pre-designed themes:

1. **🌾 Classic Farm** - The original farm aesthetic with warm beige and brown tones
2. **🌅 Sunset Farm** - Warm orange and sunset-inspired colors
3. **🌲 Forest Farm** - Green and earthy tones inspired by nature
4. **💜 Lavender Farm** - Purple and lavender color palette
5. **🌊 Ocean Farm** - Blue and aqua ocean-inspired theme
6. **🍂 Autumn Farm** - Orange and brown autumn colors
7. **🌙 Midnight Farm** - Dark theme with muted colors

### 3. Real-time Color Preview
- View all current theme colors in the customizer
- See changes instantly as you switch themes
- Colors are applied globally across the entire application

### 4. Easy Access
- Click the **"Theme"** button in the navigation bar
- Opens a slide-in panel from the right side
- Smooth animations and intuitive interface

### 5. Persistence
- All customizations are saved to localStorage
- Theme preferences persist across browser sessions
- Reset option available to return to default settings

## How to Use

### Accessing the Theme Customizer
1. Look for the **"Theme"** button in the navigation bar (with a palette icon 🎨)
2. Click it to open the theme customizer panel

### Uploading a Custom Background
1. Open the theme customizer
2. Click **"Upload Background Image"**
3. Select an image file (max 5MB)
4. The background will be applied immediately
5. To remove: Click **"Remove Background"**

### Changing Theme Presets
1. Open the theme customizer
2. Scroll to the **"Theme Presets"** section
3. Click on any theme to apply it
4. The active theme is highlighted with a green border and checkmark

### Resetting to Default
1. Open the theme customizer
2. Scroll to the bottom
3. Click **"Reset to Default Theme"**
4. This removes custom backgrounds and resets to Classic Farm theme

## Technical Details

### Components Created
- **ThemeContext.tsx**: Context provider for theme state management
- **ThemeCustomizer.tsx**: Main customizer UI component
- **CustomBackground.tsx**: Component that renders custom background images

### Storage
- Background images are stored as base64 data URLs in localStorage
- Theme preset selection is stored as a string
- Custom color configurations (if implemented) are stored as JSON

### Performance Optimizations
- **Image compression**: Large images are automatically resized to max 1920px and compressed to 85% quality
- **Hardware acceleration**: Uses CSS `transform: translateZ(0)` and `will-change` for GPU rendering
- **Memoization**: React.memo and useMemo prevent unnecessary re-renders
- **RequestAnimationFrame**: CSS variable updates are batched using requestAnimationFrame
- **Smooth transitions**: All color changes use optimized cubic-bezier timing (0.3s)
- **Backdrop filter optimization**: Uses both `-webkit-backdrop-filter` and `backdrop-filter` for cross-browser support
- **Lazy loading**: Background component only renders when an image is set
- **Translucent overlay**: Gradient overlay (85-88% opacity) with 3px blur maintains elegance without performance hit

## Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires localStorage support
- Requires FileReader API for image uploads

## Future Enhancements
Potential features for future versions:
- Custom color picker for individual colors
- Multiple background image support with slideshow
- Texture and pattern overlays
- Import/export theme configurations
- Community theme sharing
