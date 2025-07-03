
import React, { useState, useCallback, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { User } from './types';
import { mockUsers } from './services/mockData';

const APP_ICON_STORAGE_KEY = 'drug_inventory_app_icon';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const [appIcon, setAppIcon] = useState<string>(() => {
    try {
        const storedIcon = localStorage.getItem(APP_ICON_STORAGE_KEY);
        return storedIcon || 'capsule'; // default icon
    } catch (error) {
        console.error("Failed to parse app icon from localStorage", error);
        return 'capsule';
    }
  });

  useEffect(() => {
    localStorage.setItem(APP_ICON_STORAGE_KEY, appIcon);
  }, [appIcon]);

  const handleUpdateAppIcon = useCallback((iconIdentifier: string) => {
    setAppIcon(iconIdentifier);
  }, []);

  const handleLogin = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
  }, []);


  return (
    <div className="min-h-screen bg-gray-100">
      {user ? (
        <Dashboard 
            user={user} 
            onLogout={handleLogout} 
            appIcon={appIcon}
            onUpdateAppIcon={handleUpdateAppIcon}
        />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;