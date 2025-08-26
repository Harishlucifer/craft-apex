# Authentication & State Persistence Guide

## Overview

This guide explains how user authentication and module data are persisted in the application using Zustand with localStorage and React Query for caching.

## Current Implementation

### 1. Zustand Store with Persistence

The auth store (`packages/shared-state/src/stores/auth.ts`) now uses Zustand's `persist` middleware to automatically save and restore authentication state from localStorage.

```typescript
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Store implementation
      }),
      {
        name: 'auth-storage', // localStorage key
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          setupData: state.setupData, // Includes modules
          platform: state.platform,
          tenantDomain: state.tenantDomain,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);
```

### 2. What Gets Persisted

- **User Data**: Complete user information including profile, permissions, and settings
- **Authentication Status**: Whether user is logged in
- **Setup Data**: Includes modules, system config, and tenant configuration
- **Platform & Tenant**: Current platform and tenant domain

### 3. React Query Integration

React Query is used for:
- **API Caching**: Setup and authentication API responses are cached
- **Background Refetching**: Automatic data synchronization
- **Optimistic Updates**: Better UX during state changes

## Benefits of This Approach

### ✅ Automatic Persistence
- No manual localStorage management
- Automatic serialization/deserialization
- Type-safe state restoration

### ✅ Performance Optimization
- React Query caches API responses
- Reduces unnecessary API calls
- Background data synchronization

### ✅ Better User Experience
- Instant app loading for returning users
- No re-authentication required
- Offline-first approach

### ✅ Developer Experience
- Redux DevTools integration
- Easy debugging and state inspection
- Consistent state management patterns

## Best Practices

### 1. Sensitive Data Handling

```typescript
// ❌ Don't persist sensitive data
partialize: (state) => ({
  accessToken: state.accessToken, // Avoid persisting tokens
  password: state.password,       // Never persist passwords
})

// ✅ Only persist necessary data
partialize: (state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  setupData: state.setupData,
})
```

### 2. Token Management

For security, access tokens should be:
- Stored in memory only (not localStorage)
- Refreshed automatically using React Query
- Cleared on logout or expiration

```typescript
// Example: Separate token management
const useTokenStore = create<TokenStore>((set) => ({
  accessToken: null,
  refreshToken: null,
  setTokens: (tokens) => set(tokens),
  clearTokens: () => set({ accessToken: null, refreshToken: null }),
}));
```

### 3. React Query Configuration

```typescript
// Optimized query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      gcTime: 10 * 60 * 1000,       // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 4. Logout Cleanup

```typescript
logout: () => {
  // Clear persisted state
  set({
    isAuthenticated: false,
    user: null,
    setupData: null,
    error: null,
  });
  
  // Clear React Query cache
  queryClient.clear();
  
  // Clear any in-memory tokens
  useTokenStore.getState().clearTokens();
},
```

## Migration from Old Implementation

If migrating from the old localStorage-based approach:

1. **Remove manual localStorage calls**:
   ```typescript
   // ❌ Old way
   localStorage.setItem('authUser', JSON.stringify(user));
   localStorage.setItem('module', JSON.stringify(modules));
   
   // ✅ New way - automatic with Zustand persist
   setUser(user);
   setSetupData(setupData);
   ```

2. **Update component usage**:
   ```typescript
   // ❌ Old way
   const user = JSON.parse(localStorage.getItem('authUser') || 'null');
   
   // ✅ New way
   const { user } = useAuthStore();
   ```

## Security Considerations

### 1. Data Encryption
For sensitive data, consider encrypting before storing:

```typescript
import CryptoJS from 'crypto-js';

const encryptedPersist = {
  name: 'auth-storage',
  serialize: (state) => {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(state),
      'your-secret-key'
    ).toString();
    return encrypted;
  },
  deserialize: (str) => {
    const decrypted = CryptoJS.AES.decrypt(str, 'your-secret-key');
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  },
};
```

### 2. Session Timeout
Implement automatic logout on inactivity:

```typescript
const useSessionTimeout = () => {
  const { logout } = useAuthStore();
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      logout();
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearTimeout(timeout);
  }, [logout]);
};
```

### 3. Cross-Tab Synchronization
Zustand persist automatically syncs across browser tabs, ensuring consistent state.

## Troubleshooting

### Common Issues

1. **State not persisting**:
   - Check if `partialize` includes the required fields
   - Verify localStorage is available
   - Check for JSON serialization errors

2. **Performance issues**:
   - Reduce the amount of data being persisted
   - Use React Query for frequently changing data
   - Implement proper cache invalidation

3. **Hydration mismatches**:
   - Use `hasHydrated` flag for SSR compatibility
   - Handle loading states properly

### Debugging

```typescript
// Check persisted data
console.log(localStorage.getItem('auth-storage'));

// Monitor store changes
const unsubscribe = useAuthStore.subscribe(
  (state) => console.log('Auth state changed:', state)
);
```

## Conclusion

This implementation provides a robust, secure, and performant solution for authentication persistence. The combination of Zustand's persist middleware and React Query's caching creates an optimal user experience while maintaining security best practices.

For questions or improvements, refer to the Zustand and React Query documentation or consult the development team.