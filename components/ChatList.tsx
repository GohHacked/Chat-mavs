import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User } from '../types';
import { storageService } from '../services/storage';
import { Search, User as UserIcon, Loader2, RefreshCw, ShieldCheck, Plus } from 'lucide-react';
import { Avatar } from './Avatar';
import { Unsubscribe } from 'firebase/database';

interface ChatListProps {
  currentUser: User;
  onSelectChat: (chatId: string, participant: User | null, isGroup?: boolean) => void;
  isOnline: boolean;
  t: (key: any) => string;
}

const SantaHatLogo = () => (
  <div className="flex items-center select-none ml-1">
    <div className="relative flex items-center justify-center mr-[1px]">
      <span className="text-xl font-extrabold tracking-tight text-black dark:text-white relative z-10">M</span>
      <svg 
        viewBox="0 0 120 120" 
        className="absolute -top-[16px] -left-[14px] w-[38px] h-[38px] z-20 pointer-events-none filter drop-shadow-sm"
        style={{ overflow: 'visible' }}
      >
        <path d="M28 80 C 35 20 85 30 95 60 L 80 70 C 70 50 45 50 48 80 Z" fill="#EF4444" />
        <path d="M15 78 Q 32 72 50 82 L 48 94 Q 30 84 12 90 Z" fill="#FFFFFF" />
        <circle cx="95" cy="60" r="10" fill="#FFFFFF" />
      </svg>
    </div>
    <span className="text-xl font-bold tracking-tight text-black dark:text-white">avisChat</span>
  </div>
);

const VerifiedBadge = () => (
  <div className="ml-1 flex items-center justify-center" title="Verified Account">
      <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] text-[#3B82F6] fill-current">
         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" transform="scale(0.0)"/> 
         <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.114-1.32.325C14.736 2.635 13.376 2 12 2s-2.736.635-3.452 1.827c-.4-.21-.85-.325-1.32-.325C5.036 3.502 3.326 5.29 3.326 7.5c0 .495.084.965.238 1.4-1.272.65-2.147 2.02-2.147 3.6 0 1.457.753 2.735 1.885 3.48-.063.328-.102.668-.102 1.02 0 2.627 2.13 4.75 4.75 4.75.875 0 1.68-.27 2.368-.737C11.107 21.683 12.015 22 13 22c.985 0 1.893-.317 2.68-.987.688.467 1.493.737 2.368.737 2.62 0 4.75-2.123 4.75-4.75 0-.352-.039-.692-.102-1.02 1.132-.745 1.885-2.023 1.885-3.48z" />
         <path d="M10 15.172l-3.293-3.293-1.414 1.414L10 18l8-8-1.414-1.414z" fill="white" />
      </svg>
  </div>
);

const DeveloperBadge = () => (
  <div className="ml-1 flex items-center justify-center" title="Developer & Admin">
      <div className="relative">
         <ShieldCheck className="w-[16px] h-[16px] text-amber-500 fill-amber-500/20" />
      </div>
  </div>
);

const ChatSkeleton = () => (
  <div className="flex items-center px-4 py-3 border-b border-gray-50 dark:border-darkborder/50">
    <div className="h-14 w-14 rounded-full skeleton-bg flex-shrink-0 mr-3"></div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-2">
        <div className="h-4 w-24 rounded skeleton-bg"></div>
        <div className="h-3 w-8 rounded skeleton-bg"></div>
      </div>
      <div className="h-3 w-48 rounded skeleton-bg"></div>
    </div>
  </div>
);

// Helper component for reactive user data in list
const ChatRow: React.FC<{
    chat: ChatSession; 
    currentUser: User; 
    onSelect: any; 
    t: any;
}> = ({ chat, currentUser, onSelect, t }) => {
    const [partner, setPartner] = useState<User | null>(null);
    const [unread, setUnread] = useState(0);

    useEffect(() => {
        if (!chat.isGroup) {
            const partnerId = chat.participants.find(p => p !== currentUser.id);
            if (partnerId) {
                const unsub = storageService.subscribeToUser(partnerId, setPartner);
                return () => unsub();
            }
        }
    }, [chat, currentUser.id]);

    useEffect(() => {
        const unsub = storageService.subscribeToUnreadCount(chat.id, currentUser.id, setUnread);
        return () => unsub();
    }, [chat.id, currentUser.id]);

    if (chat.isGroup) {
        return (
            <div 
                onClick={() => onSelect(chat.id, null, true)}
                className="flex items-center px-4 hover:bg-gray-50 dark:hover:bg-darksurface cursor-pointer active:bg-gray-100 dark:active:bg-gray-800 transition-colors group animate-slide-up"
            >
                <Avatar isGroup={true} size="lg" className="mr-3 my-2" />
                <div className="flex-1 min-w-0 border-b border-gray-50 dark:border-darkborder group-last:border-0 py-3.5">
                    <div className="flex justify-between items-center mb-0.5">
                        <div className="flex items-center">
                            <h3 className="font-bold text-[15px] text-black dark:text-white truncate">
                                {t('friends_group')}
                            </h3>
                        </div>
                        {chat.lastMessage && (
                            <span className="text-[11px] flex-shrink-0 ml-2 text-gray-400">
                                {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-[13px] truncate h-5 leading-snug flex-1 mr-4 text-gray-500 dark:text-gray-400">
                            {chat.lastMessage ? (
                                    chat.lastMessage.type === 'system' ? 
                                    <span className="italic text-gray-400">{chat.lastMessage.text}</span> :
                                    chat.lastMessage.text
                            ) : (
                                <span className="text-indigo-500 font-medium">{t('join_group_desc')}</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!partner) return null; // Loading...

    const isMe = chat.lastMessage?.senderId === currentUser.id;
    const isDeveloper = (u: User) => u.email === 'anuk@gmail.com';

    return (
        <div 
        onClick={() => onSelect(chat.id, partner, false)}
        className="flex items-center px-4 hover:bg-gray-50 dark:hover:bg-darksurface cursor-pointer active:bg-gray-100 dark:active:bg-gray-800 transition-colors group animate-slide-up"
        >
        <Avatar user={partner} size="lg" className="mr-3 my-2" />
        <div className="flex-1 min-w-0 border-b border-gray-50 dark:border-darkborder group-last:border-0 py-3.5">
            <div className="flex justify-between items-center mb-0.5">
                <div className="flex items-center">
                    <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 truncate">
                    {partner.displayName || partner.username}
                    </h3>
                    {partner.isBot && <VerifiedBadge />}
                    {isDeveloper(partner) && <DeveloperBadge />}
                </div>
                {chat.lastMessage && (
                <span className={`text-[11px] flex-shrink-0 ml-2 ${unread > 0 ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
                    {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                )}
            </div>
            <div className="flex justify-between items-center">
            <p className={`text-[13px] truncate h-5 leading-snug flex-1 mr-4 ${unread > 0 ? 'text-black dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                {chat.lastMessage ? (
                <>
                    {isMe && <span className="text-black dark:text-white font-medium">{t('you')}: </span>}
                    <span className={isMe ? "text-gray-500 dark:text-gray-400 font-normal" : ""}>{chat.lastMessage.text}</span>
                </>
                ) : (
                <span className="text-blue-500 italic">{t('tap_write')}</span>
                )}
            </p>
            {unread > 0 && (
                <div className="min-w-[18px] h-[18px] px-1 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-white leading-none">{unread}</span>
                </div>
            )}
            </div>
        </div>
        </div>
    );
};

export const ChatList: React.FC<ChatListProps> = ({ currentUser, onSelectChat, isOnline, t }) => {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    // Real-time listener for chats
    const unsubscribe = storageService.subscribeToChats(currentUser.id, (updatedChats) => {
        const sortedChats = updatedChats.sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
        setChats(sortedChats);
        setLoadingInitial(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.startsWith('@') && query.length > 1) {
      const results = await storageService.findUserByUsername(query);
      setSearchResults(results.filter(u => u.id !== currentUser.id));
    } else {
      setSearchResults([]);
    }
  };

  const startChat = async (targetUser: User) => {
    const chat = await storageService.createChat([currentUser.id, targetUser.id]);
    onSelectChat(chat.id, targetUser, false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const isDeveloper = (user: User) => user.email === 'anuk@gmail.com';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black animate-fade-in transition-colors">
      
      {/* Dynamic Header & Search Layer */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-darkborder transition-colors">
          <div className="px-4 h-[56px] flex items-center justify-between">
             {!isOnline ? (
               <div className="flex items-center space-x-2">
                 <SantaHatLogo />
                 <span className="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">OFFLINE</span>
               </div>
            ) : (
                <SantaHatLogo />
            )}
            
            {/* Add Chat Button */}
            <button className="p-2 rounded-full bg-gray-100 dark:bg-darksurface hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                <Plus className="h-5 w-5 text-black dark:text-white" />
            </button>
          </div>

          <div className="px-4 pb-3">
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-darksurface/50 dark:text-white rounded-xl focus:outline-none focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 transition-all text-sm h-9 placeholder-gray-500"
              />
            </div>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {loadingInitial ? (
            <div className="animate-fade-in pt-2">
                <ChatSkeleton />
                <ChatSkeleton />
                <ChatSkeleton />
            </div>
        ) : searchQuery.startsWith('@') ? (
          <div className="px-2 py-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">{t('global_search')}</h3>
            {searchResults.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">{t('no_users')}</p>
            ) : (
              searchResults.map(user => (
                <div 
                  key={user.id}
                  onClick={() => startChat(user)}
                  className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-darksurface rounded-xl cursor-pointer transition-colors active:scale-[0.99] animate-slide-up"
                >
                  <Avatar user={user} size="lg" className="mr-3" />
                  <div className="border-b border-gray-50 dark:border-darkborder flex-1 py-3 flex items-center">
                    <div>
                      <div className="flex items-center">
                        <p className="font-semibold text-sm text-black dark:text-white">@{user.username}</p>
                        {user.isBot && <VerifiedBadge />}
                        {isDeveloper(user) && <DeveloperBadge />}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{user.bio}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 px-6 text-center animate-fade-in">
                    <div className="bg-gray-50 dark:bg-darksurface p-4 rounded-full mb-4">
                        <UserIcon className="h-8 w-8 opacity-40" />
                    </div>
                    <p className="dark:text-gray-300 font-medium">{t('no_chats')}</p>
                    <p className="text-xs mt-2 opacity-60">{t('no_chats_sub')}</p>
                </div>
            ) : (
                <div className="py-2">
                    {chats.map((chat) => (
                        <ChatRow 
                            key={chat.id} 
                            chat={chat} 
                            currentUser={currentUser} 
                            onSelect={onSelectChat} 
                            t={t} 
                        />
                    ))}
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};