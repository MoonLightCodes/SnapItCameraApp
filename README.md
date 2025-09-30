# 📸 SnapIt - Smart Camera App

<div align="center">

![SnapIt Banner]([https://via.placeholder.com/800x200/007AFF/ffffff?text=SnapIt+Smart+Camera+App](https://th.bing.com/th?q=Snapchat+iOS+Logo&w=120&h=120&c=1&rs=1&qlt=90&cb=1&dpr=1.9&pid=InlineBlock&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247))

**A modern, feature-rich camera application built with React Native and Expo**

[![Expo](https://img.shields.io/badge/Expo-40.0.0-blue.svg)](https://expo.io/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73.0-61dafb.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## ✨ Features

### 🎥 Media Capture
- **High-quality Video Recording** - Record videos in multiple resolutions (720p, 1080p, 4K)
- **Photo Capture** - Take stunning photos with automatic metadata tagging
- **Dual Camera Support** - Switch between front and rear cameras seamlessly
- **Real-time Preview** - Live camera feed with intuitive controls

### 📍 Smart Location Tagging
- **GPS Integration** - Automatically tag media with location data
- **Address Resolution** - Convert coordinates to human-readable addresses
- **Interactive Maps** - Tap locations to open in maps app
- **Privacy-First** - Location tagging can be disabled in settings

### 🎨 Customizable Experience
- **Dark/Light Themes** - Beautiful theme system with automatic switching
- **Customizable Settings** - Tailor the app to your preferences
- **Multiple Resolutions** - Choose video quality based on your needs
- **Timestamp Formats** - 12-hour or 24-hour time display

### 📱 Modern UI/UX
- **Sleek Interface** - Clean, intuitive design following modern standards
- **Smooth Navigation** - Fluid transitions between camera, gallery, and settings
- **Gesture Controls** - Swipeable bottom sheets and intuitive interactions
- **Responsive Design** - Optimized for various screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/snapit-camera-app.git
cd snapit-camera-app

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running the App

```bash
# For Android
npx expo run:android

# For iOS (macOS only)
npx expo run:ios

# For web
npx expo start --web
```

## 📸 Screenshots

<div align="center">

| Camera Screen | Video Gallery | Settings |
|:---:|:---:|:---:|
| ![Camera](https://via.placeholder.com/250x500/000000/ffffff?text=Camera+Screen) | ![Gallery](https://via.placeholder.com/250x500/1e1e1e/ffffff?text=Video+Gallery) | ![Settings](https://via.placeholder.com/250x500/1e1e1e/ffffff?text=Settings) |

</div>

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and SDK
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based navigation

### Camera & Media
- **Expo Camera** - Advanced camera capabilities
- **Expo AV** - Video playback and recording
- **Expo Media Library** - Media storage and management

### Location & Permissions
- **Expo Location** - GPS and location services
- **Expo Permissions** - Runtime permission handling

### Storage & State
- **Async Storage** - Local data persistence
- **React Context** - Global state management

## 📁 Project Structure

```
snapit-camera-app/
├── app/                    # App router directory
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Camera screen
│   ├── videos.tsx         # Video gallery
│   └── settings.tsx       # Settings screen
├── components/            # Reusable components
│   └── CameraView.tsx     # Main camera component
├── contexts/              # React contexts
│   └── SettingsContext.tsx # App settings management
├── utils/                 # Utility functions
│   └── storage.ts         # Data storage utilities
├── types/                 # TypeScript type definitions
│   └── index.ts          # App-wide type definitions
└── assets/               # Static assets
    ├── icon.png          # App icon
    └── splash.png        # Splash screen
```

## ⚙️ Configuration

### App Settings
The app supports extensive customization through settings:

- **Theme**: System, Light, or Dark mode
- **Default Mode**: Video or Photo mode on startup
- **Video Resolution**: 720p, 1080p, 4K, or Auto
- **Timestamp Format**: 12-hour or 24-hour
- **Location Tagging**: Enable/disable GPS metadata
- **Auto-delete**: Automatic cleanup of old videos

### Permissions
The app requests the following permissions:

- **Camera** - For capturing photos and videos
- **Microphone** - For recording audio with videos
- **Location** - For geotagging media (optional)
- **Media Library** - For saving and managing media files

## 🎯 Usage

### Recording Videos
1. Open the app to camera view
2. Ensure video mode is selected
3. Tap the red record button to start recording
4. Tap again to stop - video saves automatically
5. View recordings in the Videos tab

### Taking Photos
1. Switch to photo mode in settings or camera
2. Tap the white shutter button
3. Photo saves automatically with metadata

### Managing Media
1. Navigate to Videos tab
2. Tap any video to play and view details
3. Swipe up for more information
4. Delete unwanted videos with trash icon

## 🚀 Deployment

### Building for Production

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android --profile production

# Build for iOS (requires Apple Developer account)
eas build --platform ios --profile production
```

### App Store Deployment

1. **Google Play Store**
   - Build production APK/AAB
   - Create store listing in Google Play Console
   - Upload build and submit for review

2. **Apple App Store**
   - Build iOS app with EAS
   - Create app in App Store Connect
   - Upload via Transporter and submit for review

## 🤝 Contributing

We love contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful component and variable names
- Add comments for complex logic
- Test on both iOS and Android devices
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** - For the amazing development platform
- **React Native Community** - For continuous improvements
- **Contributors** - Everyone who helped improve SnapIt

## 📞 Support

If you encounter any issues or have questions:

- **Create an Issue** - [GitHub Issues](https://github.com/MoonLightCodes/SnapItCameraApp/issues)
- **Email Support** - poornachander00015@gmail.com

---

<div align="center">

**Made with ❤️ and ☕ by POORNA **

[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/yourusername)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/yourusername)

</div>
