# Craft Apex - Multi-Portal Platform

A modern multi-portal platform built with Turborepo, featuring separate portals for customers, employees, and partners with shared state management and UI components.

## Quick Start

### Prerequisites
- Node.js >= 18
- Yarn package manager

### Installation

```sh
# Install all dependencies
yarn install

# Start all portals in development mode
yarn dev

# Or start individual portals
yarn dev:partner    # Partner portal on port 3001
yarn dev:employee   # Employee portal
yarn dev:customer   # Customer portal
```

## Project Structure

This Turborepo monorepo includes the following applications and packages:

### Applications

- **`partner-portal`**: Partner management interface built with React + Vite
- **`employee-portal`**: Employee dashboard built with React + Vite  
- **`customer-portal`**: Customer-facing application built with React + Vite
- **`docs`**: Documentation site
- **`web`**: Additional web application

### Shared Packages

- **`@repo/shared-state`**: Centralized state management using Zustand and React Query
- **`@repo/ui`**: Shared React component library with Tailwind CSS and Radix UI
- **`@repo/types`**: Shared TypeScript type definitions
- **`@repo/eslint-config`**: ESLint configurations for consistent code quality
- **`@repo/typescript-config`**: Shared TypeScript configurations
- **`@repo/tailwind-config`**: Shared Tailwind CSS configuration and styles

All applications and packages are built with [TypeScript](https://www.typescriptlang.org/) for type safety.

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI components
- **React Router**: Client-side routing

### State Management
- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching

### Development Tools
- **Turborepo**: Monorepo build system with caching
- **ESLint**: Code linting and quality checks
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## Available Scripts

```sh
# Development
yarn dev                 # Start all applications
yarn dev:partner         # Start partner portal only
yarn dev:employee        # Start employee portal only
yarn dev:customer        # Start customer portal only

# Building
yarn build               # Build all applications
yarn build:partner       # Build partner portal only
yarn build:employee      # Build employee portal only
yarn build:customer      # Build customer portal only

# Code Quality
yarn lint                # Lint all packages
yarn check-types         # Type check all packages
yarn format              # Format code with Prettier

# Maintenance
yarn clean               # Clean build artifacts
```

## Architecture

### Monorepo Structure
This project uses Turborepo to manage multiple applications and shared packages efficiently:

- **Shared Dependencies**: Common packages are shared across all applications
- **Build Caching**: Turborepo caches build outputs for faster subsequent builds
- **Parallel Execution**: Tasks run in parallel across packages when possible
- **Dependency Graph**: Automatic dependency resolution and build ordering

### State Management Architecture
The `@repo/shared-state` package provides:

- **Zustand Stores**: Lightweight, type-safe state management
- **React Query Integration**: Server state caching and synchronization
- **Shared Hooks**: Reusable state logic across applications
- **Type Safety**: Full TypeScript support for all state operations

### UI Component System
The `@repo/ui` package includes:

- **Design System**: Consistent styling with Tailwind CSS
- **Accessible Components**: Built on Radix UI primitives
- **Shared Components**: Reusable UI elements across all portals
- **Theme Support**: Centralized styling and theming

## Development Workflow

1. **Install Dependencies**: `yarn install`
2. **Start Development**: `yarn dev` or specific portal commands
3. **Make Changes**: Edit code in any app or package
4. **Hot Reload**: Changes automatically reflect in running applications
5. **Type Check**: `yarn check-types` before committing
6. **Lint & Format**: `yarn lint && yarn format`
7. **Build**: `yarn build` to create production builds

## Contributing

When adding new features:

1. **Shared Logic**: Add to appropriate package in `/packages`
2. **Portal-Specific**: Add to the relevant app in `/apps`
3. **Types**: Update `@repo/types` for shared type definitions
4. **Components**: Add reusable components to `@repo/ui`
5. **State**: Add shared state logic to `@repo/shared-state`
