# Fish Profit - Copilot Instructions

## Project Overview

**Tech Stack:** React 19 + Vite 7 + Tailwind CSS 4 + ESLint 9

Fish Profit is a React-based web application built with Vite for fast development and production builds. The project uses functional components with hooks and is configured for modern JavaScript (ES2020+) with JSX support.

## Architecture & Key Files

### Entry Points

- [index.html](index.html) - HTML template with root div
- [src/main.jsx](src/main.jsx) - React app initialization with StrictMode
- [src/App.jsx](src/App.jsx) - Main application component (currently template demo)

### Build & Development

- **Vite Config:** [vite.config.js](vite.config.js) - Uses `@vitejs/plugin-react` for React Fast Refresh
- **ESLint:** [eslint.config.js](eslint.config.js) - Flat config with React hooks + refresh linting
- **Styling:** [tailwind.config.js](tailwind.config.js) + [postcss.config.js](postcss.config.js) - Tailwind CSS 4 fully initialized
- **Package Manager:** npm (node_modules expected)

## Development Workflow

### Essential Commands

```bash
npm run dev      # Start Vite dev server (HMR enabled)
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
npm run lint     # ESLint check on all .js/.jsx files
```

### Tailwind CSS Setup

**Status:** Tailwind CSS 4 is fully initialized with:

- Content scanning configured for `./src/**/*.{js,jsx}`
- @tailwind directives in [src/index.css](src/index.css)
- PostCSS pipeline with autoprefixer enabled

All utility classes are available for immediate use in components.

## Code Conventions

### Component Structure

- Use **functional components** with React hooks (useState, useEffect, etc.)
- React components must be named with **PascalCase** (e.g., `MyComponent.jsx`)
- Default export for components: `export default App`

### Naming Rules (ESLint)

- Unused variables ignored if start with uppercase or underscore: `const [_unused, setVar]` or `const UnusedVar`
- This accommodates unused imports and placeholder variables

### Styling Approach

- Primary: **Tailwind CSS** utility classes (once initialized)
- Fallback: CSS Modules or inline `<style>` (see [src/App.css](src/App.css), [src/index.css](src/index.css))
- Avoid duplicate styling methods in same component

## ESLint Rules & React Best Practices

- **React Hooks Rules:** Enforced (dependency arrays, hook usage)
- **React Refresh:** Fast Refresh compatible patterns only
- **No Unused Variables:** Except uppercase/underscore prefixed
- **JSX in .jsx files only**

## Common Patterns

- **Hooks:** useState for local state, custom hooks in separate files if reusable
- **Props:** No prop drilling; consider context API for deeply nested state
- **Events:** Inline onClick with arrow functions: `onClick={() => setCount(count + 1)}`

## Deployment Considerations

- Build output: `dist/` directory (gitignored)
- Base path configurable in [vite.config.js](vite.config.js) if needed for subdirectory hosting
- No backend API configured; pure frontend app

## Next Steps for New Developers

1. Run `npm install` to install dependencies
2. Initialize Tailwind CSS: `npx tailwindcss init -p`
3. Start dev server: `npm run dev`
4. Replace template code in [src/App.jsx](src/App.jsx) with actual components
