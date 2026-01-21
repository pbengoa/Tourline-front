# Tourline Logo & Icon Generation Guide

## 🎨 Brand Colors
- **Primary (Forest Green)**: `#2D5A45`
- **Accent (Sunset Orange)**: `#E86A33`
- **Light Green**: `#4A7A62`
- **Background**: `#FAF8F5`

## 📐 Logo Concept
The Tourline logo combines:
- A **location pin** (representing destinations)
- A **mountain silhouette** (adventure/outdoors)
- A **journey line** in orange (the path/route)

## 🖼️ Required Icon Files

### 1. App Icon (`icon.png`) - 1024x1024px
- Used for iOS App Store and home screen
- Square with rounded corners applied by OS
- Use `icon.svg` as source

### 2. Adaptive Icon (`adaptive-icon.png`) - 1024x1024px
- Used for Android (with safe zone)
- Foreground only, background color set in app.json
- Logo should be centered with padding

### 3. Splash Icon (`splash-icon.png`) - 1284x2778px (or smaller)
- Used during app loading
- Use `splash.svg` as source

### 4. Favicon (`favicon.png`) - 48x48px
- Used for web version
- Simplified version of the icon

## 🔧 Generation Commands

### Option 1: Using Figma
1. Open Figma
2. Import the SVG files
3. Export as PNG at required sizes

### Option 2: Using Command Line (with rsvg-convert)
```bash
# Install rsvg-convert (macOS)
brew install librsvg

# Generate icon.png (1024x1024)
rsvg-convert -w 1024 -h 1024 assets/icon.svg > assets/icon.png

# Generate adaptive-icon.png
rsvg-convert -w 1024 -h 1024 assets/icon.svg > assets/adaptive-icon.png

# Generate splash-icon.png
rsvg-convert -w 1284 -h 2778 assets/splash.svg > assets/splash-icon.png

# Generate favicon.png
rsvg-convert -w 48 -h 48 assets/logo.svg > assets/favicon.png
```

### Option 3: Using Online Tools
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Set dimensions to 1024x1024
4. Download and save as `icon.png`

### Option 4: Using Expo (generates all sizes)
```bash
npx expo-optimize
# or
npx @expo/ngrok@4 --asset-upload
```

## 📱 Using the Logo in the App

```tsx
import { Logo } from '../components';

// Full logo (icon + text)
<Logo size="large" variant="full" />

// Icon only
<Logo size="medium" variant="icon" />

// Text only
<Logo variant="text" color="white" />

// On dark backgrounds
<Logo color="white" />
```

## ✅ Checklist

- [ ] `assets/icon.png` - 1024x1024px
- [ ] `assets/adaptive-icon.png` - 1024x1024px  
- [ ] `assets/splash-icon.png` - Logo centered on brand color
- [ ] `assets/favicon.png` - 48x48px

## 🎯 Quick SVG to PNG (Browser Method)

1. Open `assets/icon.svg` in a browser
2. Right-click → "Save Image As" → `icon.png`
3. Or use browser dev tools to screenshot at exact dimensions

