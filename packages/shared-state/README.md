# Shared State Package

This package provides shared state management and API services for the Craft Apex monorepo.

## Environment Configuration

The shared-state package now supports environment variable configuration through a global Zustand store, providing both reactive state management and simple function-based access.

### Setup

1. **Initialize the shared-state package** in your app's main entry point (e.g., `main.tsx`):

```typescript
import { initializeSharedState } from '@repo/shared-state/config';

// Initialize shared-state with environment variables
initializeSharedState({
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:5050'
});
```

2. **Add Vite environment types** (for TypeScript apps) by creating `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_ENDPOINT: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

3. **Set environment variables** in your `.env` file at the project root:

```env
VITE_API_ENDPOINT=http://localhost:5050
```

### Usage

Once initialized, the shared-state package will automatically use the configured environment variables in all API services.

#### Reactive Access (Zustand Store)

For components that need to react to environment changes:

```typescript
import { useEnvironmentStore } from '@repo/shared-state/stores';

function MyComponent() {
  const { config, isInitialized } = useEnvironmentStore();
  
  if (!isInitialized) {
    return <div>Environment not initialized</div>;
  }
  
  return <div>API Endpoint: {config.apiEndpoint}</div>;
}
```

#### Function-based Access

For non-reactive access in services or utilities:

```typescript
import { getApiEndpoint, getEnvironmentConfig } from '@repo/shared-state/config';

// Get specific values
const apiEndpoint = getApiEndpoint();

// Get full config
const config = getEnvironmentConfig();
```

### API Reference

#### `initializeSharedState(config: EnvironmentConfig)`

Initializes the shared-state package with environment configuration.

**Parameters:**
- `config.apiEndpoint` (string): The API endpoint URL

#### `isSharedStateInitialized(): boolean`

Checks if the shared-state package has been initialized.

**Returns:** `true` if initialized, `false` otherwise.

#### `getApiEndpoint(): string`

Gets the configured API endpoint.

**Returns:** The API endpoint URL.

#### `getEnvironmentConfig(): EnvironmentConfig`

Gets the full environment configuration.

**Returns:** The complete environment configuration object.

#### `useEnvironmentStore`

Zustand store hook for reactive access to environment configuration.

**State:**
- `config`: The environment configuration object
- `isInitialized`: Whether the environment has been initialized

**Actions:**
- `initialize(config)`: Initialize with configuration
- `getApiEndpoint()`: Get API endpoint
- `getConfig()`: Get full configuration
- `reset()`: Reset the store

### Example Implementation

See the customer-portal app for a complete example of how to integrate the environment configuration.

### Migration from Direct `process.env` Access

If you were previously accessing `process.env` directly in the shared-state package, you should now:

1. Initialize the shared-state package in your app's entry point
2. Use the environment manager instead of direct `process.env` access
3. The package will handle environment variable access internally

This approach provides better type safety, centralized configuration, and works consistently across different build tools and environments.