# mixamo2three

A browser-based tool for converting Mixamo FBX files to GLB format for use in Three.js applications. Load character models, preview animations, and export optimized files for your 3D web projects.

## Live Demo

Try it out: [https://vibe-stack.github.io/mixamo23](https://vibe-stack.github.io/mixamo23)

## Features

- **FBX Import**: Load Mixamo character models and animations in FBX format
- **Real-time Preview**: View models and animations in an interactive 3D viewport
- **Animation Management**: Browse, select, and preview multiple animations
- **GLB Export**: Export models with animations to optimized GLB format
- **Mixamo Fixes**: Automatic fixes for common Mixamo FBX quirks
- **Settings Control**: Adjust playback speed, lighting, and viewer settings

## Installation

### Prerequisites

- Node.js 18+ and npm installed

### Setup

```bash
# Clone the repository
git clone https://github.com/vibe-stack/mixamo23.git
cd mixamo23

# Install dependencies
npm install

# Start development server
npm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload Model**: Drag and drop or select a Mixamo FBX character model
2. **Add Animations**: Upload additional FBX animation files
3. **Preview**: Click animations in the list to preview them
4. **Adjust Settings**: Configure playback speed, lighting, and other options
5. **Export**: Download your model with animations as a GLB file

## Tech Stack

- Next.js 16
- React Three Fiber
- Three.js
- Zustand (state management)
- TypeScript
- Tailwind CSS

## Building for Production

```bash
npm build
npm start
```

## License

MIT License - see [LICENSE](LICENSE) file for details.
