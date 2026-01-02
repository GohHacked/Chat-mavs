import React, { useState, useEffect, useRef } from 'react';
import { User, Message, MessageType, FontSize } from '../types';
import { storageService } from '../services/storage';
import { ArrowLeft, Send, WifiOff, Smile, Check, CheckCheck, Bell, AlertCircle, Image as ImageIcon, Bot, Ban, ShieldCheck, Code, Users } from 'lucide-react';
import { Avatar } from './Avatar';

interface ChatScreenProps {
  chatId: string;
  currentUser: User;
  partner?: User; // Optional now, as groups don't have a single partner
  onBack: () => void;
  isOnline: boolean;
  t: (key: any) => string;
  fontSize?: FontSize;
}

// Badges
const VerifiedBadge = () => (
  <div className="ml-1.5 flex items-center justify-center" title="Verified Account">
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-[#3B82F6] fill-current">
         <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.114-1.32.325C14.736 2.635 13.376 2 12 2s-2.736.635-3.452 1.827c-.4-.21-.85-.325-1.32-.325C5.036 3.502 3.326 5.29 3.326 7.5c0 .495.084.965.238 1.4-1.272.65-2.147 2.02-2.147 3.6 0 1.457.753 2.735 1.885 3.48-.063.328-.102.668-.102 1.02 0 2.627 2.13 4.75 4.75 4.75.875 0 1.68-.27 2.368-.737C11.107 21.683 12.015 22 13 22c.985 0 1.893-.317 2.68-.987.688.467 1.493.737 2.368.737 2.62 0 4.75-2.123 4.75-4.75 0-.352-.039-.692-.102-1.02 1.132-.745 1.885-2.023 1.885-3.48z" />
         <path d="M10 15.172l-3.293-3.293-1.414 1.414L10 18l8-8-1.414-1.414z" fill="white" />
      </svg>
  </div>
);

const DeveloperBadge = () => (
  <div className="ml-1.5 flex items-center justify-center" title="Developer & Admin">
      <div className="relative">
         <ShieldCheck className="w-[18px] h-[18px] text-amber-500 fill-amber-500/20" />
         <div className="absolute inset-0 bg-amber-400 blur-sm opacity-30 rounded-full animate-pulse"></div>
      </div>
  </div>
);

const STICKERS = ['😀', '😂', '😍', '😎', '😭', '😡', '👍', '👎', '🎉', '❤️', '🔥', '💩', '👻', '🤖', '🐱', '🐶'];
const ANIMATED_GIFS = [
  { id: 'g1', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODhiMzY2d2F5Y2I2eG5wZXl4Z3Z0enZ5Y3Z5Y3Z5Y3Z5Y3Z5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKSjRrfIPjeiVyM/giphy.gif', alt: 'Hi' },
  { id: 'g2', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnh4Z3Z0enZ5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/26Bbu8bxdXkF68qJi/giphy.gif', alt: 'Laugh' },
  { id: 'g3', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXg0eG5wZXl4Z3Z0enZ5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/l4pTfx2qLSznacZ2w/giphy.gif', alt: 'Love' },
  { id: 'g4', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExam94Z3Z0enZ5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKDkDbIDJieKbVm/giphy.gif', alt: 'Cool' },
  { id: 'g5', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaG94Z3Z0enZ5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/l2JHRhAtnJzhOPbSo/giphy.gif', alt: 'Sad' },
  { id: 'g6', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDV4Z3Z0enZ5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5Y3Z5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKYM2pL2f7YqW0o/giphy.gif', alt: 'Party' }
];

export const ChatScreen: React.FC<ChatScreenProps> = ({ chatId, currentUser, partner: initialPartner, onBack, isOnline, t, fontSize = 'normal' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'GIF' | 'STICKER'>('GIF');
  const [showProfile, setShowProfile] = useState(false);
  
  // Real-time partner data (for status)
  const [partner, setPartner] = useState<User | undefined>(initialPartner);
  
  // Group Logic
  const [isGroup, setIsGroup] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const textSizeClass = fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-[15px]';
  const isDeveloper = partner?.email === 'anuk@gmail.com';

  // Listen to Messages
  useEffect(() => {
    const unsubscribe = storageService.subscribeToMessages(chatId, (newMessages) => {
        setMessages(newMessages);
        storageService.markMessagesAsRead(chatId, currentUser.id);
    });
    return () => unsubscribe();
  }, [chatId, currentUser.id]);

  // Listen to Partner Status (if 1-on-1)
  useEffect(() => {
      if (initialPartner) {
          const unsubscribe = storageService.subscribeToUser(initialPartner.id, (updatedUser) => {
              if (updatedUser) setPartner(updatedUser);
          });
          return () => unsubscribe();
      }
  }, [initialPartner]);

  // Check Group Status
  useEffect(() => {
    storageService.getPublicGroups().then(publicGroups => {
        const currentChat = publicGroups.find(c => c.id === chatId);
        // Also check if we are in private chat list (not needed if we just check id format or flag)
        if (currentChat || chatId.includes('group')) {
            setIsGroup(true);
            
            // Check if joined
            if (currentChat) {
                let parts = currentChat.participants || [];
                if (!Array.isArray(parts)) parts = Object.keys(parts);
                setHasJoined(parts.includes(currentUser.id));
                setParticipantsCount(parts.length);
            }
        }
    });
  }, [chatId, currentUser.id]);

  useEffect(() => {
    if (!showProfile) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, showPicker, showProfile, hasJoined]);

  const handleJoinGroup = async () => {
      if (await storageService.joinGroup(chatId, currentUser.id)) {
          setHasJoined(true);
          // Send system message
          const sysText = `${currentUser.displayName} ${t('joined_group_msg')}`;
          storageService.sendMessage(chatId, 'system', sysText, 'system');
      }
  };

  const handleSend = async (e?: React.FormEvent, content?: string, type: MessageType = 'text') => {
    if (e) e.preventDefault();
    if (currentUser.isBanned) return;
    if (isGroup && !hasJoined) return;
    
    const textToSend = content || inputText;
    if (!textToSend.trim()) return;

    await storageService.sendMessage(chatId, currentUser.id, textToSend, type);
    
    if (type === 'text') {
      setInputText('');
    } else {
      setShowPicker(false);
    }

    if (partner?.isBot) {
        handleBotResponse(textToSend);
    }
  };

  const handleBotResponse = (userMessage: string) => {
      if (!partner) return;
      const cmd = userMessage.trim().toLowerCase();
      let responseText = '';
      let delay = 600;

      if (cmd === '/start') {
          responseText = t('support_greeting');
      } else if (cmd === '/help') {
          responseText = t('support_help');
      } else {
          responseText = t('support_received');
          delay = 1000;
      }

      setTimeout(() => {
          storageService.sendMessage(chatId, partner.id, responseText, 'text');
      }, delay);
  };

  const formatLastSeen = (user: User) => {
    if (user.isBot) return t('bot');
    if (user.isOnline) return t('online');
    if (!user.lastSeen) return t('last_seen');
    
    const date = new Date(user.lastSeen);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) return `${t('last_seen_at')} ${timeStr}`;
    return `${t('last_seen')} ${date.toLocaleDateString()}`;
  };

  const renderMessageContent = (msg: Message, isMe: boolean) => {
    if (msg.type === 'system') {
        return (
            <div className="w-full flex justify-center my-2">
                <span className="bg-gray-100 dark:bg-darksurface text-gray-500 text-[10px] px-2 py-1 rounded-full">{msg.text}</span>
            </div>
        );
    }

    if (msg.type === 'sticker') {
      return (
        <div className="relative">
          <div className="text-6xl leading-none p-2 animate-message-enter transform hover:scale-110 transition-transform cursor-pointer">
            {msg.text}
          </div>
          {renderTimeAndStatus(msg, isMe, false)}
        </div>
      );
    }

    if (msg.type === 'gif') {
      return (
        <div className="relative p-1 animate-message-enter">
          <img 
            src={msg.text} 
            alt="GIF" 
            className="w-32 h-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300" 
            loading="lazy"
          />
           {renderTimeAndStatus(msg, isMe, false)}
        </div>
      );
    }

    // Text Message
    // Identify sender in groups
    let senderName = null;
    if (isGroup && !isMe) {
        // This is tricky without loading all users, but good enough for now if we don't display names inside bubble for DM
        // Ideally we'd have a user cache
        // For now, let's just show a placeholder if we don't have the user object handy, or fetch it
    }

    return (
      <div 
        className={`px-3 py-1.5 ${textSizeClass} leading-snug shadow-sm relative group transition-all flex flex-col min-w-[60px]
          ${isMe 
            ? 'bg-black dark:bg-white text-white dark:text-black rounded-2xl rounded-tr-md rounded-br-md items-end' 
            : 'bg-gray-100 dark:bg-darksurface text-black dark:text-white rounded-2xl rounded-tl-md rounded-bl-md items-start'
          }
          ${isMe && !msg.type ? 'rounded-br-none' : ''}
          ${!isMe && !msg.type ? 'rounded-bl-none' : ''}
        `}
      >
        <span className="break-words whitespace-pre-wrap">
           {msg.text.split('\n').map((item, key) => <React.Fragment key={key}>{item}<br/></React.Fragment>)}
        </span>
        
        <div className={`flex items-center space-x-1 h-3 select-none mt-1 ${isMe ? 'ml-auto' : ''}`}>
           <span className={`text-[9px] ${isMe ? 'text-gray-300 dark:text-gray-400' : 'text-gray-400'}`}>
             {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </span>
           {isMe && (
             <span className={msg.type === 'text' ? 'text-gray-300 dark:text-gray-400' : 'text-black dark:text-white'}>
               {msg.status === 'read' ? <CheckCheck className="h-2.5 w-2.5" /> : <Check className="h-2.5 w-2.5" />}
             </span>
           )}
        </div>
      </div>
    );
  };

  const renderTimeAndStatus = (msg: Message, isMe: boolean, isText: boolean) => {
    return (
      <div className={`flex items-center space-x-1 select-none absolute bottom-1 right-2 px-1 py-0.5 rounded-full ${!isText ? 'bg-black/20 backdrop-blur-sm text-white' : ''}`}>
        <span className="text-[10px]">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isMe && (
          <span>{msg.status === 'read' ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}</span>
        )}
      </div>
    );
  }

  // Profile View Logic (Simplified for Group)
  if (showProfile) {
      if (isGroup) {
          return (
            <div className="flex flex-col h-full bg-white dark:bg-black relative z-50 animate-fade-in">
                <div className="px-2 h-[56px] flex items-center sticky top-0 z-10 bg-white dark:bg-black">
                    <button onClick={() => setShowProfile(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-darksurface mr-1">
                        <ArrowLeft className="h-6 w-6 text-black dark:text-white" />
                    </button>
                    <span className="font-semibold text-lg text-black dark:text-white">{t('info')}</span>
                </div>
                <div className="flex flex-col items-center pt-8">
                    <Avatar isGroup={true} size="xxl" className="mb-4 shadow-lg" />
                    <h1 className="text-2xl font-bold text-black dark:text-white">{t('friends_group')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">{participantsCount} {t('group_participants')}</p>
                </div>
            </div>
          )
      }

      if (partner) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-black relative z-50 animate-fade-in">
                <div className="px-2 h-[56px] flex items-center sticky top-0 z-10 bg-white dark:bg-black">
                <button onClick={() => setShowProfile(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-darksurface mr-1 transition-colors">
                    <ArrowLeft className="h-6 w-6 text-black dark:text-white" />
                </button>
                <span className="font-semibold text-lg text-black dark:text-white">{t('info')}</span>
                </div>

                <div className="flex-1 overflow-y-auto pb-4">
                <div className="flex flex-col items-center pt-4 pb-6 border-b border-gray-100 dark:border-darkborder">
                    <Avatar user={partner} size="xxl" className="mb-4 shadow-lg" />
                    <h1 className="text-2xl font-bold text-black dark:text-white mb-1 flex items-center">
                        {partner.displayName || partner.username}
                        {partner.isBot && <VerifiedBadge />}
                        {isDeveloper && <DeveloperBadge />}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{formatLastSeen(partner)}</p>
                </div>

                <div className="p-4 space-y-6">
                    {isDeveloper && (
                    <div className="mx-0 p-1 rounded-2xl bg-gradient-to-r from-amber-200 via-orange-300 to-amber-200 dark:from-amber-900 dark:via-orange-900 dark:to-amber-900 animate-shimmer bg-[length:200%_100%]">
                        <div className="bg-white dark:bg-black rounded-xl p-4 flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5 dark:opacity-10">
                                <Code className="h-24 w-24 text-black dark:text-white" />
                            </div>
                            <ShieldCheck className="h-10 w-10 text-amber-500 mb-2" />
                            <h3 className="font-bold text-lg text-amber-600 dark:text-amber-400">{t('official_account')}</h3>
                            <p className="text-sm font-semibold mb-2 text-black dark:text-white">{t('admin_role')}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('dev_info_desc')}</p>
                        </div>
                    </div>
                    )}

                    <div>
                    <h3 className="text-blue-500 text-sm font-semibold mb-1 uppercase tracking-wide">{t('account_info')}</h3>
                    <p className="text-black dark:text-white text-lg">@{partner.username}</p>
                    <p className="text-gray-400 text-xs">{t('username')}</p>
                    </div>

                    <div>
                    <h3 className="text-blue-500 text-sm font-semibold mb-1 uppercase tracking-wide">{t('bio')}</h3>
                    <p className="text-black dark:text-white text-[16px] leading-relaxed">{partner.bio || t('bio_placeholder')}</p>
                    </div>
                    
                    {partner.isBot && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-200">
                            Mavis Technical Support Bot. Automated responses available 24/7.
                        </div>
                    )}
                </div>
                </div>
            </div>
        );
      }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black relative z-20 transition-colors">
      {/* Header */}
      <div className="px-2 h-[56px] bg-white dark:bg-black border-b border-gray-100 dark:border-darkborder flex items-center sticky top-0 z-30 shadow-sm transition-colors">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-darksurface mr-1 transition-colors">
          <ArrowLeft className="h-6 w-6 text-black dark:text-white" />
        </button>
        <div 
          onClick={() => setShowProfile(true)}
          className="flex items-center flex-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-darksurface p-1 rounded-lg transition-colors"
        >
          {isGroup ? <Avatar isGroup={true} size="md" /> : (partner && <Avatar user={partner} size="md" />)}
          <div className="ml-3">
            <h2 className="font-bold text-sm leading-tight text-black dark:text-white flex items-center">
                {isGroup ? t('friends_group') : (partner?.displayName || partner?.username)}
                {partner?.isBot && <VerifiedBadge />}
                {isDeveloper && <DeveloperBadge />}
            </h2>
            {isGroup ? (
                <p className="text-xs text-gray-500">{participantsCount} {t('group_participants')}</p>
            ) : (
                <p className="text-xs text-gray-500 leading-tight">{partner ? formatLastSeen(partner) : ''}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-white dark:bg-black relative transition-colors" onClick={() => setShowPicker(false)}>
        
        {messages.map((msg, index) => {
          if (msg.type === 'system') return renderMessageContent(msg, false);

          const isMe = msg.senderId === currentUser.id;
          // Only show avatars in groups for others, or in DM for partner
          // Logic: Show avatar if: not me AND (group OR (DM and sequence logic))
          const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId);
          const isFirst = index === 0 || messages[index - 1].senderId !== msg.senderId;
          
          return (
            <div key={msg.id} className={`flex w-full animate-message-enter ${isMe ? 'justify-end' : 'justify-start'}`}>
               {!isMe && (
                 <div className="w-8 mr-2 flex flex-col justify-end">
                   {showAvatar ? (
                     // If it's a group, we need to fetch user data for avatar, currently placeholder or cache lookup in real app
                     isGroup ? 
                        <Avatar isGroup={false} size="sm" /> : 
                        (partner && <Avatar user={partner} size="sm" />)
                   ) : <div className="w-7" />}
                 </div>
               )}

              <div className={`relative max-w-[85%] md:max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isFirst ? 'mt-3' : 'mt-0.5'}`}>
                {renderMessageContent(msg, isMe)}
              </div>
            </div>
          );
        })}
        
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Group Join Overlay */}
      {isGroup && !hasJoined && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black pb-8 pt-20 flex justify-center items-center z-50">
              <button 
                onClick={handleJoinGroup}
                className="bg-black dark:bg-white text-white dark:text-black font-bold py-3 px-8 rounded-full shadow-xl transform transition-transform active:scale-95 flex items-center gap-2"
              >
                  <Users className="w-5 h-5" />
                  {t('join_group')}
              </button>
          </div>
      )}

      {/* Input Area */}
      {currentUser.isBanned ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 text-center text-sm font-semibold border-t border-red-100 dark:border-red-900/30">
              <Ban className="h-4 w-4 inline-block mr-2" />
              {t('banned_msg')}
          </div>
      ) : (
      (!isGroup || hasJoined) && (
      <div className="bg-white dark:bg-black border-t border-gray-100 dark:border-darkborder pb-safe transition-colors relative z-40">
        
        {/* Picker Panel */}
        {showPicker && (
          <div className="h-64 border-t border-gray-100 dark:border-darkborder bg-gray-50 dark:bg-darksurface animate-slide-in-up flex flex-col">
             {/* Picker Tabs */}
             <div className="flex border-b border-gray-200 dark:border-darkborder bg-white dark:bg-black">
              <button 
                onClick={() => setPickerTab('GIF')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${pickerTab === 'GIF' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-400 border-transparent'}`}
              >
                {t('gifs')}
              </button>
              <button 
                onClick={() => setPickerTab('STICKER')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${pickerTab === 'STICKER' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-400 border-transparent'}`}
              >
                {t('stickers')}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {pickerTab === 'STICKER' ? (
                <div className="grid grid-cols-4 gap-4">
                  {STICKERS.map(sticker => (
                    <button 
                      key={sticker} 
                      onClick={() => handleSend(undefined, sticker, 'sticker')}
                      className="text-4xl hover:scale-125 transition-transform p-2 cursor-pointer"
                    >
                      {sticker}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {ANIMATED_GIFS.map(gif => (
                    <button 
                      key={gif.id}
                      onClick={() => handleSend(undefined, gif.url, 'gif')} 
                      className="aspect-square flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <img src={gif.url} alt={gif.alt} className="w-full h-full object-contain pointer-events-none" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!isOnline && (
           <div className="flex items-center justify-center py-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 mx-2 mt-2 rounded-lg">
             <WifiOff className="h-3 w-3 mr-1" />
             <span>{t('waiting_network')}</span>
           </div>
        )}

        <form onSubmit={(e) => handleSend(e)} className="flex items-end gap-2 p-2">
          <div className="flex-1 bg-gray-100 dark:bg-darksurface rounded-3xl px-2 py-2 flex items-center focus-within:ring-1 focus-within:ring-black/10 dark:focus-within:ring-white/20 transition-all">
             <button 
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className={`p-2 rounded-full transition-colors ${showPicker ? 'text-black dark:text-white bg-white dark:bg-black shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
             >
               <Smile className="h-6 w-6" />
             </button>

             <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => setShowPicker(false)}
              placeholder={partner?.isBot ? '/start, /help...' : t('message_placeholder')}
              disabled={!isOnline}
              className="flex-1 bg-transparent border-none outline-none text-[15px] py-1 px-2 max-h-32 disabled:opacity-50 text-black dark:text-white placeholder-gray-500"
            />
          </div>
          
          <button 
            type="submit"
            disabled={!inputText.trim() || !isOnline}
            className={`h-10 w-10 flex items-center justify-center rounded-full transition-all duration-300 ${
               inputText.trim() ? 'bg-black dark:bg-white text-white dark:text-black scale-100 rotate-0' : 'bg-transparent text-gray-300 dark:text-gray-600 scale-90'
            }`}
          >
            <Send className="h-5 w-5 ml-0.5" />
          </button>
        </form>
      </div>
      )
      )}
    </div>
  );
};