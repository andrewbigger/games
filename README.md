# Games

A monorepo containing Electron-based desktop games built with React, TypeScript, and Vite.

## Overview

This repository contains two educational games:

- **Guessing Game** - A guessing game with player and character selection
- **Letter Quest** - A typing game for improving typing skills

Both games share common components and utilities through a shared package, making it easy to maintain consistency across games.

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Desktop Framework**: Electron
- **Package Manager**: pnpm (workspaces)
- **Icons**: Lucide React

## Project Structure

```
games/
├── apps/
│   ├── guessing/          # Guessing Game application
│   └── letter-quest/      # Letter Quest typing game
├── packages/
│   └── shared/            # Shared components and utilities
└── pnpm-workspace.yaml    # pnpm workspace configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (install with `npm install -g pnpm`)

### Installation

Install all dependencies:

```bash
pnpm install
```

### Development

Run all apps in development mode:

```bash
pnpm dev
```

Or run a specific app:

```bash
# Guessing Game
cd apps/guessing
pnpm electron-dev

# Letter Quest
cd apps/letter-quest
pnpm electron-dev
```

### Building

Build all packages:

```bash
pnpm build
```

Build a specific app:

```bash
cd apps/guessing
pnpm build
```

### Distribution

Create distributable packages for each platform:

**Guessing Game:**
```bash
cd apps/guessing
pnpm dist-mac      # macOS (DMG)
pnpm dist-linux    # Linux (AppImage, DEB)
pnpm dist-windows  # Windows (NSIS installer)
```

**Letter Quest:**
```bash
cd apps/letter-quest
pnpm dist-mac      # macOS (DMG)
pnpm dist-linux    # Linux (AppImage, DEB)
pnpm dist-windows  # Windows (NSIS installer)
```

## Available Scripts

### Root Level

- `pnpm dev` - Run all apps in development mode
- `pnpm build` - Build all packages
- `pnpm clean` - Clean all dist and node_modules directories

### App Level

Each app (`guessing` and `letter-quest`) has the following scripts:

- `pnpm dev` - Start Vite dev server
- `pnpm build` - Build the app for production
- `pnpm preview` - Preview the production build
- `pnpm electron` - Run Electron with the built app
- `pnpm electron-dev` - Run Electron in development mode (with hot reload)
- `pnpm electron-build` - Build and run Electron
- `pnpm type-check` - Run TypeScript type checking
- `pnpm dist-mac` - Build macOS distribution
- `pnpm dist-linux` - Build Linux distribution
- `pnpm dist-windows` - Build Windows distribution

## Shared Package

The `@games/shared` package provides:

- **PlayerModal** - Component for managing players
- **CharacterModal** - Component for managing characters
- **Configuration utilities** - Functions for managing game configuration and avatars
- **Type definitions** - Shared TypeScript types for players and characters

## Keyboard Shortcuts

Both games support the following keyboard shortcuts:

- `Ctrl/Cmd + Shift + P` - Open/close player management modal
- `Ctrl/Cmd + Shift + C` - Open/close character management modal (Guessing Game only)

## Platform Support

Both games support:

- **macOS**: x64 and ARM64 (Apple Silicon)
- **Linux**: x64 (AppImage and DEB packages)
- **Windows**: x64 and ia32 (NSIS installer)

## Author

Andrew Bigger - [biggerconcept.com](https://biggerconcept.com)

## License

Private project - All rights reserved

