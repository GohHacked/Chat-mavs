import React, { useState, useEffect } from 'react';
import { User, ChatSession, Message } from '../types';
import { storageService } from '../services/storage';
import { ArrowLeft, Bot, MessageSquare, Ban, CheckCircle, XCircle, Send, UserX, UserCheck, Shield, ShieldAlert, Loader2 } from 'lucide-react';
import { Avatar } from './Avatar';

interface AdminPanelProps {
  onBack: () => void;
  t: (key: any) => string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, t }) => {
  const [selectedBot, setSelectedBot] = useState<User | null>(null);
  const [activeTickets, setActiveTickets] = useState<ChatSession[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketUser, setTicketUser] = useState<User | null>(null);
  const [ticketMessages, setTicketMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // Ban Section State
  const [banUsername, setBanUsername] = useState('');
  const [banStatusMsg, setBanStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Admin Grant Section State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminStatusMsg, setAdminStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Initial Load: Users
  useEffect(() => {
    const fetchUsers = async () => {
        const users = await storageService.getUsers();
        setAllUsers(users);
    };
    fetchUsers();
    
    // Periodically refresh users list
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  // Initial Load: Find the Support Bot
  useEffect(() => {
    const initBot = async () => {
        try {
            const bot = await storageService.getSupportBot();
            setSelectedBot(bot);
        } catch (e) {
            console.error("Failed to load/create bot", e);
        }
    };
    initBot();
  }, []);

  // When bot is selected, load tickets (chats involving the bot)
  useEffect(() => {
    if (selectedBot) {
        loadTickets();
        const interval = setInterval(loadTickets, 3000);
        return () => clearInterval(interval);
    }
  }, [selectedBot]);

  // When ticket is selected, load messages
  useEffect(() => {
    if (selectedTicketId) {
        loadMessages();
        const interval = setInterval(loadMessages, 2000);
        return () => clearInterval(interval);
    }
  }, [selectedTicketId]);

  const loadTickets = async () => {
      if (!selectedBot) return;
      const chats = await storageService.getBotChats(selectedBot.id);
      // Sort by newest
      const sorted = chats.sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
      setActiveTickets(sorted);
  };

  const loadMessages = async () => {
      if (!selectedTicketId) return;
      const msgs = await storageService.getMessages(selectedTicketId);
      setTicketMessages(msgs);
  };

  const handleSelectTicket = (chat: ChatSession) => {
      // Find the user who is NOT the bot
      if (!selectedBot) return;
      const userId = chat.participants.find(p => p !== selectedBot.id);
      if (userId) {
          const user = allUsers.find(u => u.id === userId);
          if (user) {
              setTicketUser(user);
              setSelectedTicketId(chat.id);
          }
      }
  };

  const handleReply = (e: React.FormEvent) => {
      e.preventDefault();
      if (!replyText.trim() || !selectedTicketId || !selectedBot) return;

      storageService.sendMessage(selectedTicketId, selectedBot.id, replyText);
      setReplyText('');
      loadMessages();
  };

  const handleBanUserByInput = async (isBan: boolean) => {
      if (!banUsername.trim()) return;
      const result = await storageService.setBanStatusByUsername(banUsername, isBan);
      
      if (result.success && result.user) {
          setBanStatusMsg({
              type: 'success', 
              text: isBan ? `${result.user.username} banned` : `${result.user.username} unbanned`
          });
          setBanUsername('');
          
          // If we are currently viewing this user's ticket, update UI
          if (ticketUser && ticketUser.id === result.user.id) {
              setTicketUser({...ticketUser, isBanned: isBan});
          }
          
          // Refresh user list to reflect ban status
          const updatedUsers = await storageService.getUsers();
          setAllUsers(updatedUsers);
      } else {
          setBanStatusMsg({type: 'error', text: t('user_not_found_short')});
      }

      setTimeout(() => setBanStatusMsg(null), 3000);
  };

  const handleSetAdminByInput = async (makeAdmin: boolean) => {
      if (!adminUsername.trim()) return;
      const result = await storageService.setAdminStatusByUsername(adminUsername, makeAdmin);

      if (result.success && result.user) {
          setAdminStatusMsg({
              type: 'success',
              text: makeAdmin ? `${result.user.username} is now Admin` : `${result.user.username} is no longer Admin`
          });
          setAdminUsername('');
          const updatedUsers = await storageService.getUsers();
          setAllUsers(updatedUsers);
      } else {
          setAdminStatusMsg({ type: 'error', text: t('user_not_found_short') });
      }
      setTimeout(() => setAdminStatusMsg(null), 3000);
  };

  const handleBanUserInTicket = async () => {
      if (!ticketUser) return;
      const isNowBanned = await storageService.toggleBanUser(ticketUser.id);
      setTicketUser({ ...ticketUser, isBanned: isNowBanned });
      
      // Refresh user list
      const updatedUsers = await storageService.getUsers();
      setAllUsers(updatedUsers);
  };

  const handleCloseTicket = () => {
     if (!selectedTicketId || !selectedBot) return;
     storageService.sendMessage(selectedTicketId, selectedBot.id, t('ticket_closed'));
     setSelectedTicketId(null);
     setTicketUser(null);
  };

  // VIEW 1: No Bot Selected (Shouldn't happen with hardcoded bot, but good safety)
  if (!selectedBot) {
      return (
          <div className="flex flex-col h-full bg-white dark:bg-black text-black dark:text-white items-center justify-center animate-fade-in">
              <div className="flex flex-col items-center">
                  <div className="relative">
                    <Bot className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin absolute -bottom-1 -right-1" />
                  </div>
                  <h2 className="font-bold text-lg mb-1">Initializing Admin Panel</h2>
                  <p className="text-sm text-gray-500">Connecting to Support Bot...</p>
              </div>
          </div>
      );
  }

  // VIEW 2: Ticket List (Bot Selected)
  if (!selectedTicketId) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-black transition-colors animate-fade-in">
        <div className="px-4 h-[56px] flex items-center border-b border-gray-100 dark:border-darkborder bg-white dark:bg-black sticky top-0 z-10">
           <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-darksurface mr-1">
             <ArrowLeft className="h-6 w-6 text-black dark:text-white" />
           </button>
           <h1 className="font-bold text-lg text-black dark:text-white">{t('admin_panel')}</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
            
            {/* Manage Users Section */}
            <div className="bg-white dark:bg-darksurface p-4 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3">{t('manage_users')}</h3>
                <div className="flex flex-col space-y-3">
                    <input 
                       type="text" 
                       value={banUsername}
                       onChange={(e) => setBanUsername(e.target.value)}
                       placeholder={t('enter_username_ban')}
                       className="p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-darkborder rounded-xl text-sm outline-none focus:ring-1 focus:ring-red-500 transition-all dark:text-white"
                    />
                    
                    <div className="flex gap-2">
                        <button 
                          onClick={() => handleBanUserByInput(true)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                            <UserX className="h-4 w-4" /> {t('action_ban')}
                        </button>
                        <button 
                          onClick={() => handleBanUserByInput(false)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                            <UserCheck className="h-4 w-4" /> {t('action_unban')}
                        </button>
                    </div>

                    {banStatusMsg && (
                        <div className={`text-xs text-center font-bold p-2 rounded-lg animate-fade-in ${banStatusMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {banStatusMsg.text}
                        </div>
                    )}
                </div>
            </div>

            {/* Manage Admins Section */}
            <div className="bg-white dark:bg-darksurface p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">{t('manage_admins')}</h3>
                <div className="flex flex-col space-y-3">
                    <input 
                       type="text" 
                       value={adminUsername}
                       onChange={(e) => setAdminUsername(e.target.value)}
                       placeholder={t('enter_username_admin')}
                       className="p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-darkborder rounded-xl text-sm outline-none focus:ring-1 focus:ring-amber-500 transition-all dark:text-white"
                    />
                    
                    <div className="flex gap-2">
                        <button 
                          onClick={() => handleSetAdminByInput(true)}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                            <Shield className="h-4 w-4" /> {t('action_promote')}
                        </button>
                        <button 
                          onClick={() => handleSetAdminByInput(false)}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                            <ShieldAlert className="h-4 w-4" /> {t('action_demote')}
                        </button>
                    </div>

                    {adminStatusMsg && (
                        <div className={`text-xs text-center font-bold p-2 rounded-lg animate-fade-in ${adminStatusMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {adminStatusMsg.text}
                        </div>
                    )}
                </div>
            </div>

            {/* Tickets Section */}
            <div>
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center">
                    <Avatar user={selectedBot} size="md" className="mr-3" />
                    <div>
                        <h2 className="font-bold text-sm dark:text-white">{selectedBot.displayName}</h2>
                        <p className="text-xs text-blue-600 dark:text-blue-300">@{selectedBot.username}</p>
                    </div>
                </div>

                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('admin_tickets')}</h3>
                {activeTickets.length === 0 ? (
                    <p className="text-gray-400 text-center py-10 text-sm">No active tickets.</p>
                ) : (
                    <div className="space-y-2">
                        {activeTickets.map(chat => {
                            const otherUserId = chat.participants.find(p => p !== selectedBot.id);
                            const otherUser = allUsers.find(u => u.id === otherUserId);
                            if (!otherUser) return null;

                            return (
                                <div 
                                    key={chat.id} 
                                    onClick={() => handleSelectTicket(chat)}
                                    className="bg-gray-50 dark:bg-darksurface p-3 rounded-xl flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Avatar user={otherUser} size="md" className="mr-3" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-sm text-black dark:text-white truncate">{otherUser.displayName}</h4>
                                            <span className="text-[10px] text-gray-400">
                                                {chat.lastMessage ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {chat.lastMessage?.text || 'No messages'}
                                        </p>
                                    </div>
                                    {otherUser.isBanned && <Ban className="h-4 w-4 text-red-500 ml-2" />}
                                    {otherUser.isAdmin && <Shield className="h-4 w-4 text-amber-500 ml-2" />}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  }

  // VIEW 3: Chat/Ticket Detail
  return (
      <div className="flex flex-col h-full bg-white dark:bg-black transition-colors animate-slide-in-right">
          {/* Admin Header */}
          <div className="px-2 h-[56px] flex items-center border-b border-gray-100 dark:border-darkborder bg-white dark:bg-black sticky top-0 z-10">
              <button onClick={() => setSelectedTicketId(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-darksurface mr-1">
                  <ArrowLeft className="h-6 w-6 text-black dark:text-white" />
              </button>
              {ticketUser && (
                  <div className="flex items-center flex-1">
                      <Avatar user={ticketUser} size="sm" />
                      <div className="ml-2">
                          <h2 className="font-bold text-sm text-black dark:text-white">
                              {ticketUser.displayName} 
                              {ticketUser.isBanned && <span className="text-red-500 ml-2 text-xs">({t('banned_msg')})</span>}
                          </h2>
                          <p className="text-[10px] text-gray-500">@{ticketUser.username}</p>
                      </div>
                  </div>
              )}
              <div className="flex gap-1">
                  <button onClick={handleBanUserInTicket} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full" title={t('ban_user')}>
                      <Ban className="h-5 w-5" />
                  </button>
                  <button onClick={handleCloseTicket} className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full" title={t('close_ticket')}>
                      <CheckCircle className="h-5 w-5" />
                  </button>
              </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white dark:bg-black">
              {ticketMessages.map((msg) => {
                  const isBot = msg.senderId === selectedBot.id;
                  return (
                      <div key={msg.id} className={`flex w-full ${isBot ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                              isBot 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-gray-100 dark:bg-darksurface text-black dark:text-white rounded-tl-none'
                          }`}>
                              <p>{msg.text}</p>
                              <span className={`text-[10px] block text-right mt-1 ${isBot ? 'text-blue-200' : 'text-gray-400'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                          </div>
                      </div>
                  );
              })}
          </div>

          {/* Reply Area */}
          <form onSubmit={handleReply} className="p-2 border-t border-gray-100 dark:border-darkborder bg-white dark:bg-black">
             <div className="bg-gray-50 dark:bg-darksurface rounded-2xl flex items-center px-2 py-1">
                 <Bot className="h-5 w-5 text-blue-500 mx-2" />
                 <input 
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t('reply_as_bot')}
                    className="flex-1 bg-transparent border-none outline-none p-2 text-sm text-black dark:text-white"
                 />
                 <button type="submit" disabled={!replyText.trim()} className="p-2 text-blue-600 disabled:text-gray-400">
                     <Send className="h-5 w-5" />
                 </button>
             </div>
          </form>
      </div>
  );
};