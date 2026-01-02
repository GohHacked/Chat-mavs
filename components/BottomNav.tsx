import React from 'react';
import { Tab } from '../types';
import { MessageCircle, Settings as SettingsIcon } from 'lucide-react';

interface BottomNavProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  t: (key: any) => string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange, t }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 z-40 pb-safe">
      <div className="flex justify-around items-center h-[60px] pb-2 pt-1">
        <button
          onClick={() => onTabChange(Tab.CHATS)}
          className={`flex-1 flex flex-col items-center justify-center space-y-1 active:scale-95 transition-transform duration-200 group ${
            currentTab === Tab.CHATS ? 'text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${currentTab === Tab.CHATS ? 'bg-gray-100 dark:bg-white/10' : 'bg-transparent'}`}>
             <MessageCircle className={`h-6 w-6 ${currentTab === Tab.CHATS ? 'fill-current' : 'stroke-[2px]'}`} />
          </div>
          <span className="text-[10px] font-medium tracking-wide">
            {t('tab_chats')}
          </span>
        </button>

        <button
          onClick={() => onTabChange(Tab.SETTINGS)}
          className={`flex-1 flex flex-col items-center justify-center space-y-1 active:scale-95 transition-transform duration-200 group ${
            currentTab === Tab.SETTINGS ? 'text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${currentTab === Tab.SETTINGS ? 'bg-gray-100 dark:bg-white/10' : 'bg-transparent'}`}>
             <SettingsIcon className={`h-6 w-6 ${currentTab === Tab.SETTINGS ? 'fill-current' : 'stroke-[2px]'}`} />
          </div>
          <span className="text-[10px] font-medium tracking-wide">
            {t('tab_settings')}
          </span>
        </button>
      </div>
    </div>
  );
};