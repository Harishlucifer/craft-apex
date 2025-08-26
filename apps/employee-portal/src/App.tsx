import { useState } from 'react'
import { Card } from '@repo/ui/card'
import { useAuthStore, useThemeStore, useNotificationStore } from '@repo/shared-state/store'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const { user, isAuthenticated, login, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { notifications, addNotification, clearNotifications } = useNotificationStore()

  const handleLogin = () => {
    login({
      id: '2',
      name: 'Jane Employee',
      email: 'jane@company.com',
      role: 'employee'
    })
    addNotification({
      type: 'success',
      message: 'Welcome back, Jane!'
    })
  }

  const handleLogout = () => {
    logout()
    addNotification({
      type: 'info',
      message: 'See you tomorrow!'
    })
  }

  return (
    <>
      <div className={`min-h-screen p-8 transition-colors ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
          : 'bg-gradient-to-br from-green-50 to-emerald-100 text-gray-900'
      }`}>
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-4xl font-bold">Employee Portal</h1>
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
                {isAuthenticated ? (
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Logout ({user?.name})
                  </button>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
            <p className="text-xl opacity-80">Manage your tasks and collaborate with your team</p>
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
              <p className="opacity-80">View your daily tasks and team updates</p>
            </Card>
            
            <Card title="Tasks" className="hover:shadow-lg transition-shadow">
              <p className="opacity-80">Manage your assigned tasks and deadlines</p>
            </Card>
            
            <Card title="Team" className="hover:shadow-lg transition-shadow">
              <p className="opacity-80">Collaborate with team members and projects</p>
            </Card>
            
            <Card title="Calendar" className="hover:shadow-lg transition-shadow">
              <p className="opacity-80">View meetings and important dates</p>
            </Card>
            
            <Card title="Reports" className="hover:shadow-lg transition-shadow">
              <p className="opacity-80">Submit timesheets and progress reports</p>
            </Card>
            
            <Card title="Resources" className="hover:shadow-lg transition-shadow">
              <p className="opacity-80">Access company resources and documents</p>
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
                    message: `Task counter: ${count + 1}`
                  })
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Count is {count}
              </button>
              <button 
                onClick={() => addNotification({ type: 'success', message: 'Clocked in successfully!' })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Clock In
              </button>
              <button 
                onClick={() => addNotification({ type: 'info', message: 'Report submitted for review' })}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App