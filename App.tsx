import React, { useState, useEffect } from 'react';
import { User, Tab, Language, Theme, TRANSLATIONS, FontSize } from './types';
import { storageService } from './services/storage';
import { Auth } from './components/Auth';
import { ChatList } from './components/ChatList';
import { Settings } from './components/Settings';
import { ChatScreen } from './components/ChatScreen';
import { BottomNav } from './components/BottomNav';
import { AdminPanel } from './components/AdminPanel';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatPartner, setActiveChatPartner] = useState<User | null>(null); // For DM
  const [initializing, setInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  
  // Chat Settings State
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Admin View State
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    // Initialize storage/firebase
    storageService.init();
    
    // Auth Listener
    storageService.onAuthStateChanged((user) => {
        if (user) {
            if (user.isBanned) {
                storageService.logout();
                setCurrentUser(null);
                alert(TRANSLATIONS[language].error_banned);
            } else {
                setCurrentUser(user);
            }
        } else {
            setCurrentUser(null);
        }
        setInitializing(false);
    });

    const savedLang = storageService.getLanguage();
    const savedTheme = storageService.getTheme();
    const savedFontSize = storageService.getFontSize();
    const savedNotifs = storageService.getNotifications();
    
    setLanguage(savedLang);
    setTheme(savedTheme);
    setFontSize(savedFontSize);
    setNotificationsEnabled(savedNotifs);

    // Network Listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = (user: User) => {
    // onAuthStateChanged will handle this, but setting state here speeds up UI transition
    setCurrentUser(user);
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setActiveChatId(null);
    setActiveTab(Tab.CHATS);
    setShowAdminPanel(false);
  };

  const handleChatSelect = (chatId: string, partner: User | null, isGroup?: boolean) => {
    setActiveChatId(chatId);
    setActiveChatPartner(partner);
  };

  const handleBackToChats = () => {
    setActiveChatId(null);
    setActiveChatPartner(null);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    storageService.setLanguage(lang);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    storageService.setTheme(newTheme);
  };

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    storageService.setFontSize(size);
  };

  const handleNotificationsChange = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    storageService.setNotifications(enabled);
  };

  // Helper for translations
  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[language][key] || key;
  };

  // Splash Screen
  if (initializing) {
      return (
          <div className={`${theme === 'dark' ? 'dark' : ''} h-full w-full bg-white dark:bg-black flex items-center justify-center`}>
              <div className="flex flex-col items-center animate-fade-in">
                  <div className="relative mb-4">
                       <span className="text-6xl font-extrabold tracking-tight text-black dark:text-white">M</span>
                       <div className="absolute -top-3 -right-3 w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
                  </div>
                  <h1 className="text-xl font-bold text-black dark:text-white mb-2">MavisChat</h1>
                  <p className="text-xs text-gray-400">Connecting...</p>
                  
                  <div className="mt-8 flex space-x-2">
                       <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                       <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                       <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
              </div>
          </div>
      );
  }

  // Render Auth without theme wrapper logic inside (it has its own bg)
  if (!currentUser) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
         <Auth onLogin={handleLogin} t={t} />
      </div>
    );
  }

  // Admin Panel Full Screen Overlay
  if (showAdminPanel && currentUser.isAdmin) {
      return (
        <div className={`${theme === 'dark' ? 'dark' : ''} h-full w-full`}>
            <div className="h-full w-full bg-white dark:bg-black relative overflow-hidden">
                <AdminPanel onBack={() => setShowAdminPanel(false)} t={t} />
            </div>
        </div>
      );
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} h-full w-full`}>
      <div className="h-full w-full bg-white dark:bg-black relative overflow-hidden transition-colors duration-300">
        {/* Main Content Layer */}
        <div className={`h-full flex flex-col transition-transform duration-300 ${activeChatId ? 'scale-95 opacity-90' : 'scale-100 opacity-100'}`}>
          <div className="flex-1 overflow-hidden relative">
            {activeTab === Tab.CHATS && (
              <ChatList 
                currentUser={currentUser} 
                onSelectChat={handleChatSelect} 
                isOnline={isOnline}
                t={t}
              />
            )}
            {activeTab === Tab.SETTINGS && (
              <Settings 
                user={currentUser} 
                onUpdateUser={setCurrentUser} 
                onLogout={handleLogout}
                language={language}
                onLanguageChange={handleLanguageChange}
                theme={theme}
                onThemeChange={handleThemeChange}
                fontSize={fontSize}
                onFontSizeChange={handleFontSizeChange}
                notificationsEnabled={notificationsEnabled}
                onNotificationsChange={handleNotificationsChange}
                t={t}
                onOpenAdmin={() => setShowAdminPanel(true)}
              />
            )}
          </div>
          <BottomNav currentTab={activeTab} onTabChange={setActiveTab} t={t} />
        </div>

        {/* Chat Screen Layer - Slides over the top */}
        {activeChatId && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-black animate-slide-in-right shadow-2xl">
            <ChatScreen 
              chatId={activeChatId} 
              currentUser={currentUser} 
              partner={activeChatPartner || undefined} 
              onBack={handleBackToChats} 
              isOnline={isOnline}
              t={t}
              fontSize={fontSize}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;