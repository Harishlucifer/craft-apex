import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card } from '@repo/ui/card';
import { useAuthStore, useThemeStore, useNotificationStore } from '@repo/shared-state/store';
import { usePlatformConfig } from '@repo/shared-state/hooks';
import { applyTenantBranding } from '../utils/branding';

export function DashboardPage() {
  const [count, setCount] = useState(0);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { notifications, addNotification, clearNotifications } = useNotificationStore();
  const platformConfig = usePlatformConfig('CUSTOMER_PORTAL');

  // Apply tenant branding when platform config is loaded
  useEffect(() => {
    if (platformConfig?.branding) {
      applyTenantBranding({
        tenantName: platformConfig.branding.tenantName,
        logoUrl: platformConfig.branding.logoUrl,
        primaryColor: platformConfig.branding.primaryColor,
        loginBackgroundUrl: platformConfig.branding.loginBackgroundUrl,
      });
    }
  }, [platformConfig]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    addNotification({
      type: 'info',
      message: 'Thanks for visiting! Come back soon.'
    });
  };

  return (
    <div className={`min-h-screen p-8 transition-colors ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-purple-50 to-pink-100 text-gray-900'
    }`}>
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              {platformConfig?.branding.tenantLogo && (
                <img 
                  src={platformConfig.branding.tenantLogo} 
                  alt={platformConfig.branding.tenantName}
                  className="h-8"
                />
              )}
              <h1 className="text-4xl font-bold">
                {platformConfig?.branding.tenantName || 'Customer'} Portal
              </h1>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={toggleTheme}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-white hover:bg-gray-100 text-gray-900'
                }`}
              >
                {theme === 'dark' ? '☀️' : '🌙'} {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout ({user?.name})
              </button>
            </div>
          </div>
          <p className="text-xl opacity-80">Manage your orders and explore our products</p>
          {notifications.length > 0 && (
            <div className="mt-4 space-y-2">
              {notifications.slice(-3).map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded-lg ${
                    notification.type === 'success' ? 'bg-green-100 text-green-800' :
                    notification.type === 'error' ? 'bg-red-100 text-red-800' :
                    notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}
                >
                  {notification.message}
                </div>
              ))}
              {notifications.length > 0 && (
                <button 
                  onClick={clearNotifications}
                  className="text-sm underline opacity-70 hover:opacity-100"
                >
                  Clear notifications ({notifications.length})
                </button>
              )}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card title="Dashboard" className="hover:shadow-lg transition-shadow">
            <p className="opacity-80">View your account overview and recent activity</p>
          </Card>
          
          <Card title="Orders" className="hover:shadow-lg transition-shadow">
            <p className="opacity-80">Track your current and past orders</p>
          </Card>
          
          <Card title="Products" className="hover:shadow-lg transition-shadow">
            <p className="opacity-80">Browse our latest products and offers</p>
          </Card>
          
          <Card title="Wishlist" className="hover:shadow-lg transition-shadow">
            <p className="opacity-80">Save your favorite items for later</p>
          </Card>
          
          <Card title="Support" className="hover:shadow-lg transition-shadow">
            <p className="opacity-80">Get help and contact customer service</p>
          </Card>
          
          <Card title="Account" className="hover:shadow-lg transition-shadow">
            <p className="opacity-80">Manage your profile and preferences</p>
          </Card>
        </div>

        <div className={`rounded-lg shadow-md p-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => {
                setCount((count) => count + 1)
                addNotification({
                  type: 'info',
                  message: `Cart items: ${count + 1}`
                })
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Count is {count}
            </button>
            <button 
              onClick={() => addNotification({ type: 'success', message: 'Happy shopping! New items added to cart.' })}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Shop Now
            </button>
            <button 
              onClick={() => addNotification({ type: 'info', message: 'Your order is on the way!' })}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}