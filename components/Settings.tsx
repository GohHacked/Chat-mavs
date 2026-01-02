import React, { useState, useRef } from 'react';
import { User, Language, Theme, FontSize } from '../types';
import { storageService } from '../services/storage';
import { Button } from './Button';
import { Input } from './Input';
import { Avatar } from './Avatar';
import { Camera, Globe, Moon, Sun, Palette, Trash2, AtSign, User as UserIcon, Type, ShieldCheck, MessageSquare, ChevronRight, ArrowLeft, Bell, Rocket, Sparkles, CheckCircle, Send, ExternalLink, BookOpen, Scale, LifeBuoy, LogOut, Info } from 'lucide-react';

interface SettingsProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  notificationsEnabled: boolean;
  onNotificationsChange: (enabled: boolean) => void;
  t: (key: any) => string;
  onOpenAdmin: () => void;
}

const SettingItem = ({ icon: Icon, color, label, value, onClick, isDestructive = false }: any) => (
  <div 
    onClick={onClick}
    className="w-full bg-white dark:bg-darksurface px-4 py-3.5 flex items-center justify-between cursor-pointer active:bg-gray-50 dark:active:bg-gray-800 transition-colors first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-100 dark:border-darkborder last:border-0"
  >
    <div className="flex items-center space-x-3">
      <div className={`p-1.5 rounded-lg ${color} text-white shadow-sm`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className={`text-[15px] font-medium ${isDestructive ? 'text-red-500' : 'text-black dark:text-white'}`}>{label}</span>
    </div>
    <div className="flex items-center space-x-2">
      {value && <span className="text-[13px] text-gray-400">{value}</span>}
      <ChevronRight className="h-4 w-4 text-gray-300" />
    </div>
  </div>
);

export const Settings: React.FC<SettingsProps> = ({ 
  user, onUpdateUser, onLogout, 
  language, onLanguageChange, 
  theme, onThemeChange,
  fontSize, onFontSizeChange,
  notificationsEnabled, onNotificationsChange,
  t, onOpenAdmin 
}) => {
  const [view, setView] = useState<'MAIN' | 'EDIT' | 'CHAT_SETTINGS' | 'RULES'>('MAIN');
  const [bio, setBio] = useState(user.bio || '');
  const [username, setUsername] = useState(user.username);
  const [displayName, setDisplayName] = useState(user.displayName || user.username);
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || '#000');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user.avatarUrl);
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setAvatarUrl(undefined);
  };

  const handleSave = () => {
    const updated = { ...user, bio, username: username.replace('@', ''), displayName, avatarColor, avatarUrl };
    storageService.updateUser(updated);
    onUpdateUser(updated);
    setView('MAIN');
  };

  const toggleLanguage = () => onLanguageChange(language === 'en' ? 'ru' : 'en');
  const toggleTheme = () => onThemeChange(theme === 'light' ? 'dark' : 'light');

  const cycleAvatarColor = () => {
    if (avatarUrl) return; 
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#111827'];
    const nextIdx = (colors.indexOf(avatarColor) + 1) % colors.length;
    setAvatarColor(colors[nextIdx]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
        setIsOptimizing(false);
        setIsOptimized(true);
        setTimeout(() => setIsOptimized(false), 2000);
    }, 2500);
  };

  // Preview object for Edit Mode
  const previewUser = { ...user, displayName, username, avatarColor, avatarUrl };

  // Sub-view: Chat Settings
  if (view === 'CHAT_SETTINGS') {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-black transition-colors animate-slide-in-right">
         <div className="px-2 h-[56px] flex items-center bg-white dark:bg-black sticky top-0 z-10 shadow-sm">
          <button onClick={() => setView('MAIN')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-darksurface mr-1">
            <ArrowLeft className="h-6 w-6 text-black dark:text-white" />
          </button>
          <span className="font-bold text-lg text-black dark:text-white">{t('chat_settings')}</span>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Font Size */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-4">{t('font_size')}</h3>
            <div className="bg-white dark:bg-darksurface p-2 rounded-2xl flex items-center justify-between shadow-sm">
               {['small', 'normal', 'large'].map((s) => (
                  <button
                    key={s}
                    onClick={() => onFontSizeChange(s as FontSize)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${fontSize === s ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-400'}`}
                  >
                     <span className={s === 'small' ? 'text-xs' : s === 'large' ? 'text-lg' : 'text-base'}>A</span>
                  </button>
               ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-4">{t('notifications')}</h3>
            <div onClick={() => onNotificationsChange(!notificationsEnabled)} className="bg-white dark:bg-darksurface p-4 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer">
                <span className="font-medium text-black dark:text-white">{t('enable_notifications')}</span>
                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
            </div>
          </div>

          {/* Optimization */}
          <div>
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-4">{t('optimize_storage')}</h3>
             {isOptimizing ? (
                 <div className="bg-white dark:bg-darksurface h-24 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                     <Rocket className="h-6 w-6 text-blue-500 animate-bounce mb-2" />
                     <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 animate-[slideInRight_2s_ease-out_forwards] w-full" /></div>
                 </div>
             ) : isOptimized ? (
                 <div className="bg-green-50 dark:bg-green-900/20 h-24 rounded-2xl flex flex-col items-center justify-center animate-fade-in border border-green-100 dark:border-green-900/30">
                     <CheckCircle className="h-8 w-8 text-green-500 mb-1" />
                     <span className="text-xs font-bold text-green-600">{t('optimized')}</span>
                 </div>
             ) : (
                 <div onClick={handleOptimize} className="bg-white dark:bg-darksurface p-4 rounded-2xl flex items-center justify-between cursor-pointer shadow-sm active:scale-[0.98] transition-transform">
                     <div className="flex items-center space-x-3">
                         <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-500"><Sparkles className="h-5 w-5" /></div>
                         <div className="flex flex-col">
                             <span className="font-medium text-black dark:text-white">{t('optimize_storage')}</span>
                             <span className="text-xs text-gray-400">{t('optimize_desc')}</span>
                         </div>
                     </div>
                 </div>
             )}
          </div>
        </div>
      </div>
    );
  }

  // Sub-view: Rules
  if (view === 'RULES') {
      return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-black transition-colors animate-slide-in-right">
           <div className="px-2 h-[56px] flex items-center bg-white dark:bg-black sticky top-0 z-10 shadow-sm">
            <button onClick={() => setView('MAIN')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-darksurface mr-1">
              <ArrowLeft className="h-6 w-6 text-black dark:text-white" />
            </button>
            <span className="font-bold text-lg text-black dark:text-white">{t('rules_support')}</span>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto">
              {[
                  { icon: Scale, color: 'text-blue-500', title: t('rules_title'), text: "Respect others. No harassment. No illegal content." },
                  { icon: ShieldCheck, color: 'text-green-500', title: t('privacy_title'), text: "Data is stored locally. End-to-end encryption concepts applied." },
                  { icon: LifeBuoy, color: 'text-orange-500', title: t('help_title'), text: "Contact @MavisSupport for any assistance." }
              ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-darksurface p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-darkborder/50">
                      <div className="flex items-center space-x-3 mb-3">
                          <item.icon className={`h-6 w-6 ${item.color}`} />
                          <h3 className="font-bold text-lg text-black dark:text-white">{item.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.text}</p>
                  </div>
              ))}
          </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-black transition-colors">
      <div className="px-4 py-3 bg-white dark:bg-black flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-extrabold text-black dark:text-white">{t('settings')}</h1>
        {view === 'EDIT' && (
          <button onClick={handleSave} className="text-sm font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
            {t('done')}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Profile Card */}
        <div className="bg-white dark:bg-darksurface pt-6 pb-6 px-4 mb-4 flex flex-col items-center border-b border-gray-100 dark:border-darkborder">
          <div className="relative mb-4 group">
            <Avatar 
              user={view === 'EDIT' ? previewUser : user} 
              size="xxl" 
              onClick={view === 'EDIT' && !avatarUrl ? cycleAvatarColor : undefined}
              className="shadow-xl"
            />
            {view === 'EDIT' && (
              <div className="absolute -bottom-1 -right-1 flex gap-2">
                 <button onClick={triggerFileUpload} className="p-2 bg-white dark:bg-darksurface rounded-full shadow-md border border-gray-200"><Camera className="h-4 w-4" /></button>
                 {avatarUrl && <button onClick={removePhoto} className="p-2 bg-red-500 rounded-full shadow-md"><Trash2 className="h-4 w-4 text-white" /></button>}
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          {view !== 'EDIT' ? (
              <div className="text-center animate-fade-in">
                  <h2 className="text-2xl font-bold text-black dark:text-white">{user.displayName}</h2>
                  <p className="text-gray-400 font-medium mb-2">@{user.username}</p>
                  <Button onClick={() => setView('EDIT')} variant="outline" className="py-1.5 px-6 text-xs rounded-full border-gray-300 dark:border-gray-700">
                    {t('edit_profile')}
                  </Button>
              </div>
          ) : (
              <div className="w-full max-w-sm space-y-4 animate-fade-in">
                 <Input label={t('displayName')} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                 <Input label={t('bio')} value={bio} onChange={(e) => setBio(e.target.value)} />
                 <div className="flex gap-2"><Button onClick={() => setView('MAIN')} variant="secondary" fullWidth>{t('cancel')}</Button><Button onClick={handleSave} fullWidth>{t('save')}</Button></div>
              </div>
          )}
        </div>

        {view !== 'EDIT' && (
            <div className="px-4 space-y-6">
                
                {/* Section 1: General */}
                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-4 mb-2">General</h3>
                    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-darkborder">
                        {user.isAdmin && <SettingItem icon={ShieldCheck} color="bg-blue-500" label={t('admin_panel')} onClick={onOpenAdmin} />}
                        <SettingItem icon={Send} color="bg-sky-500" label={t('official_channel')} onClick={() => window.open("https://t.me/MavisChatNews", "_blank")} />
                        <SettingItem icon={MessageSquare} color="bg-green-500" label={t('chat_settings')} onClick={() => setView('CHAT_SETTINGS')} />
                    </div>
                </div>

                {/* Section 2: Preferences */}
                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-4 mb-2">Preferences</h3>
                    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-darkborder">
                        <SettingItem icon={Globe} color="bg-indigo-500" label={t('language')} value={language === 'en' ? 'English' : 'Русский'} onClick={toggleLanguage} />
                        <SettingItem icon={theme === 'light' ? Sun : Moon} color="bg-purple-500" label={t('theme')} value={theme === 'light' ? t('theme_light') : t('theme_dark')} onClick={toggleTheme} />
                    </div>
                </div>

                {/* Section 3: Support & Danger */}
                <div className="space-y-1">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-4 mb-2">Support</h3>
                     <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-darkborder">
                        <SettingItem icon={BookOpen} color="bg-amber-500" label={t('rules_support')} onClick={() => setView('RULES')} />
                        <SettingItem icon={LogOut} color="bg-red-500" label={t('logout')} isDestructive onClick={onLogout} />
                     </div>
                </div>

                <div className="text-center text-xs text-gray-400 pb-4">
                    MavisChatWeb v0.1 • Crafted with ❤️
                </div>
            </div>
        )}
      </div>
    </div>
  );
};