import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    updateProfile,
    onAuthStateChanged,
    User as FirebaseUser
} from "firebase/auth";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    child, 
    push, 
    update, 
    onValue, 
    off, 
    onDisconnect, 
    serverTimestamp,
    query,
    orderByChild,
    limitToLast
} from "firebase/database";
import { User, Message, ChatSession, Language, Theme, MessageType, FontSize } from '../types';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbDB8Upzp9Xg9jHJCmeVSwmKZ1UAw_8HA",
  authDomain: "messchat-c135c.firebaseapp.com",
  databaseURL: "https://messchat-c135c-default-rtdb.firebaseio.com",
  projectId: "messchat-c135c",
  storageBucket: "messchat-c135c.firebasestorage.app",
  messagingSenderId: "1081871657810",
  appId: "1:1081871657810:web:acf3e1673b122a442a288b",
  measurementId: "G-F8H1M3VLBQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Constants
const FRIENDS_GROUP_ID = 'group_friends_global';
const SUPPORT_BOT_ID = 'mavis_support_bot_official';

// Local Settings Keys
const LANGUAGE_KEY = 'mavischat_language';
const THEME_KEY = 'mavischat_theme';
const FONT_SIZE_KEY = 'mavischat_font_size';
const NOTIFICATIONS_KEY = 'mavischat_notifications';

export const storageService = {
  init: () => {
    // Listen for connection state to manage presence
    const connectedRef = ref(db, ".info/connected");
    onValue(connectedRef, (snap) => {
      if (snap.val() === true && auth.currentUser) {
        const userStatusDatabaseRef = ref(db, '/users/' + auth.currentUser.uid);
        // We're connected (or reconnected)! Set user online
        // Catch permission errors here to avoid unhandled promise rejections
        update(userStatusDatabaseRef, {
            isOnline: true,
            lastSeen: serverTimestamp()
        }).catch(err => console.warn("Failed to set online status (likely rules):", err.code));

        // When I disconnect, update the last time I was seen connected
        onDisconnect(userStatusDatabaseRef).update({
            isOnline: false,
            lastSeen: serverTimestamp()
        }).catch(err => console.warn("Failed to set disconnect status:", err.code));
      }
    });

    // Ensure Global Group Exists
    const groupRef = ref(db, `chats/${FRIENDS_GROUP_ID}`);
    get(groupRef).then((snapshot) => {
        if (!snapshot.exists()) {
            set(groupRef, {
                id: FRIENDS_GROUP_ID,
                isGroup: true,
                groupName: 'Friends Group',
                participants: {} // Map of userIds
            }).catch(err => console.error("Failed to create group (PERMISSION_DENIED):", err.code));
        }
    }).catch(err => console.error("Failed to check group (PERMISSION_DENIED):", err.code));
  },

  // --- Auth Methods ---

  register: async (email: string, username: string, password: string): Promise<User> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const cleanUsername = username.replace('@', '');

        // Update Auth Profile
        await updateProfile(fbUser, { displayName: cleanUsername });
        
        // AUTO ADMIN LOGIC FOR goh@gmail.com
        const isAdmin = email.toLowerCase() === 'goh@gmail.com' || email === 'anuk@gmail.com';

        const newUser: User = {
            id: fbUser.uid,
            username: cleanUsername,
            displayName: cleanUsername,
            email: email,
            bio: 'New to MavisChat',
            avatarColor: randomColor,
            isOnline: true,
            lastSeen: Date.now(),
            isAdmin: isAdmin,
            isBot: false,
            isBanned: false
        };

        // Save to Database
        await set(ref(db, 'users/' + fbUser.uid), newUser);
        return newUser;
    } catch (error: any) {
        // Throw raw error to preserve 'code' property for Auth component handling
        throw error;
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const uid = fbUser.uid;
        
        // Fetch user data
        const snapshot = await get(ref(db, `users/${uid}`));
        
        // AUTO ADMIN CHECK FOR goh@gmail.com
        const shouldBeAdmin = email.toLowerCase() === 'goh@gmail.com';

        if (snapshot.exists()) {
             const userData = snapshot.val();
             
             // Update admin status if it's missing for special user
             if (shouldBeAdmin && !userData.isAdmin) {
                 userData.isAdmin = true;
                 await update(ref(db, `users/${uid}`), { isAdmin: true });
             }

             if (userData.isBanned) {
                 await signOut(auth);
                 throw new Error("Your account has been banned.");
             }
             return userData;
        } else {
             // Self-healing: Create missing profile
             const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];
             const randomColor = colors[Math.floor(Math.random() * colors.length)];
             const cleanUsername = email.split('@')[0];
             
             const newUser: User = {
                id: uid,
                username: cleanUsername,
                displayName: fbUser.displayName || cleanUsername,
                email: email,
                bio: 'Recovered Account',
                avatarColor: randomColor,
                isOnline: true,
                lastSeen: Date.now(),
                isAdmin: shouldBeAdmin, // Set admin if matches
                isBot: false,
                isBanned: false
             };
             await set(ref(db, 'users/' + uid), newUser);
             return newUser;
        }
    } catch (error: any) {
        throw error;
    }
  },

  logout: async () => {
    if (auth.currentUser) {
        // Set offline manually before signing out
        const userStatusRef = ref(db, 'users/' + auth.currentUser.uid);
        try {
            await update(userStatusRef, {
                isOnline: false,
                lastSeen: serverTimestamp()
            });
        } catch (e) {
            // Ignore permission errors on logout
        }
    }
    await signOut(auth);
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
      onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
              try {
                const snapshot = await get(ref(db, `users/${fbUser.uid}`));
                if (snapshot.exists()) {
                    callback(snapshot.val());
                } else {
                    callback(null); 
                }
              } catch (e) {
                  // If permission denied, we can't get the user, so treat as null/logged out
                  console.error("Auth Listener Error:", e);
                  callback(null);
              }
          } else {
              callback(null);
          }
      });
  },

  // --- User Methods ---

  getUsers: async (): Promise<User[]> => {
      const snapshot = await get(ref(db, 'users'));
      if (snapshot.exists()) {
          return Object.values(snapshot.val());
      }
      return [];
  },
  
  // Real-time listener for a user
  subscribeToUser: (userId: string, callback: (user: User | null) => void) => {
      const userRef = ref(db, `users/${userId}`);
      return onValue(userRef, (snapshot) => {
          callback(snapshot.exists() ? snapshot.val() : null);
      }, (error) => {
          console.warn("Subscribe User Error:", (error as any).code);
      });
  },

  getCurrentUser: (): User | null => {
      // Note: This is synchronous and might not be ready immediately. 
      // Components should prefer onAuthStateChanged or subscribeToUser
      // But we will fetch from local cache or null
      return null; // Force components to use async loading
  },
  
  getUserById: async (id: string): Promise<User | null> => {
      const snapshot = await get(ref(db, `users/${id}`));
      return snapshot.exists() ? snapshot.val() : null;
  },

  updateUser: async (updatedUser: User) => {
      await update(ref(db, `users/${updatedUser.id}`), updatedUser);
  },

  setUserStatus: async (userId: string, isOnline: boolean) => {
      // Managed automatically by .info/connected but can be forced
      await update(ref(db, `users/${userId}`), {
          isOnline,
          lastSeen: serverTimestamp()
      });
  },

  toggleBanUser: async (userId: string): Promise<boolean> => {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
          const isBanned = !snapshot.val().isBanned;
          await update(userRef, { isBanned });
          return isBanned;
      }
      return false;
  },

  setBanStatusByUsername: async (username: string, isBanned: boolean): Promise<{ success: boolean, user?: User }> => {
      const snapshot = await get(ref(db, 'users'));
      if (snapshot.exists()) {
          const users = Object.values(snapshot.val()) as User[];
          const target = users.find(u => u.username.toLowerCase() === username.toLowerCase().replace('@', ''));
          
          if (target) {
              await update(ref(db, `users/${target.id}`), { isBanned });
              return { success: true, user: target };
          }
      }
      return { success: false };
  },

  setAdminStatusByUsername: async (username: string, isAdmin: boolean): Promise<{ success: boolean, user?: User }> => {
      const snapshot = await get(ref(db, 'users'));
      if (snapshot.exists()) {
          const users = Object.values(snapshot.val()) as User[];
          const target = users.find(u => u.username.toLowerCase() === username.toLowerCase().replace('@', ''));
          
          if (target) {
              await update(ref(db, `users/${target.id}`), { isAdmin });
              return { success: true, user: target };
          }
      }
      return { success: false };
  },

  findUserByUsername: async (queryStr: string): Promise<User[]> => {
      const cleanQuery = queryStr.toLowerCase().replace('@', '');
      const snapshot = await get(ref(db, 'users'));
      if (!snapshot.exists()) return [];
      
      const users = Object.values(snapshot.val()) as User[];
      return users.filter(u => u.username.toLowerCase().includes(cleanQuery));
  },

  getSupportBot: async (): Promise<User> => {
      // 1. Try to fetch by Fixed ID first (Fastest)
      try {
          const botSnap = await get(ref(db, `users/${SUPPORT_BOT_ID}`));
          if (botSnap.exists()) {
              return botSnap.val();
          }
      } catch (e) {
          console.warn("Direct bot fetch failed, trying scan", e);
      }

      // 2. Fallback: Scan (in case legacy bot exists or permission issue with specific path)
      const snapshot = await get(ref(db, 'users'));
      if (snapshot.exists()) {
          const users = Object.values(snapshot.val()) as User[];
          const existingBot = users.find(u => u.isBot);
          if (existingBot) return existingBot;
      }

      // 3. Create if completely missing (Auto-Healing)
      const newBot: User = {
          id: SUPPORT_BOT_ID,
          username: 'MavisSupport',
          displayName: 'Mavis Support',
          email: 'support@mavischat.com',
          bio: 'Official Automated Support Assistant',
          avatarColor: '#3B82F6',
          isOnline: true,
          lastSeen: Date.now(),
          isAdmin: true,
          isBot: true,
          isBanned: false
      };
      
      // Save to DB
      try {
         await set(ref(db, `users/${SUPPORT_BOT_ID}`), newBot);
      } catch (e: any) {
          console.error("Failed to create support bot:", e);
          // If we can't write, we can't create. Return the object anyway so UI doesn't crash.
          // This will work in memory but fail on reload if DB is strictly read-only.
      }
      return newBot;
  },

  // --- Settings (Local Storage is fine for these) ---
  getLanguage: (): Language => (localStorage.getItem(LANGUAGE_KEY) as Language) || 'en',
  setLanguage: (lang: Language) => localStorage.setItem(LANGUAGE_KEY, lang),
  getTheme: (): Theme => (localStorage.getItem(THEME_KEY) as Theme) || 'light',
  setTheme: (theme: Theme) => localStorage.setItem(THEME_KEY, theme),
  getFontSize: (): FontSize => (localStorage.getItem(FONT_SIZE_KEY) as FontSize) || 'normal',
  setFontSize: (size: FontSize) => localStorage.setItem(FONT_SIZE_KEY, size),
  getNotifications: (): boolean => localStorage.getItem(NOTIFICATIONS_KEY) !== 'false',
  setNotifications: (enabled: boolean) => localStorage.setItem(NOTIFICATIONS_KEY, String(enabled)),


  // --- Chats & Messages ---

  // Real-time chat list
  subscribeToChats: (userId: string, callback: (chats: ChatSession[]) => void) => {
      const chatsRef = ref(db, 'chats');
      return onValue(chatsRef, (snapshot) => {
          if (!snapshot.exists()) {
              callback([]);
              return;
          }
          
          const allChats = Object.values(snapshot.val()) as any[];
          // Filter chats where user is participant
          const myChats = allChats.filter(c => {
              if (c.id === FRIENDS_GROUP_ID) return true; // Always show group
              // Check participants map or array
              if (Array.isArray(c.participants)) {
                  return c.participants.includes(userId);
              }
              return c.participants && c.participants[userId];
          });
          
          callback(myChats);
      }, (error) => {
           console.warn("Subscribe Chats Error:", (error as any).code);
      });
  },

  createChat: async (participantIds: string[]): Promise<ChatSession> => {
      participantIds.sort();
      const chatId = `chat_${participantIds.join('_')}`;
      
      const chatRef = ref(db, `chats/${chatId}`);
      const snapshot = await get(chatRef);
      
      if (snapshot.exists()) {
          return snapshot.val();
      }

      const newChat: ChatSession = {
          id: chatId,
          participants: participantIds
      };

      await set(chatRef, newChat);
      return newChat;
  },

  getPublicGroups: async (): Promise<ChatSession[]> => {
      const snapshot = await get(ref(db, `chats/${FRIENDS_GROUP_ID}`));
      return snapshot.exists() ? [snapshot.val()] : [];
  },

  joinGroup: async (chatId: string, userId: string): Promise<boolean> => {
      const chatRef = ref(db, `chats/${chatId}`);
      const snapshot = await get(chatRef);
      
      if (snapshot.exists()) {
          const chat = snapshot.val();
          let participants = chat.participants || [];
          
          // Handle old structure array vs new structure
          if (!Array.isArray(participants)) {
              participants = Object.keys(participants); // fallback if map
          }
          
          if (!participants.includes(userId)) {
              participants.push(userId);
              await update(chatRef, { participants });
              return true;
          }
      }
      return false;
  },

  // Real-time messages
  subscribeToMessages: (chatId: string, callback: (messages: Message[]) => void) => {
      const messagesRef = ref(db, `messages/${chatId}`);
      // Remove query ordering to fix "Index not defined" error. We sort client-side.
      
      return onValue(messagesRef, (snapshot) => {
          if (snapshot.exists()) {
              const msgs = Object.values(snapshot.val()) as Message[];
              callback(msgs.sort((a, b) => a.timestamp - b.timestamp));
          } else {
              callback([]);
          }
      }, (error) => {
          console.warn("Subscribe Messages Error:", (error as any).code);
      });
  },

  getUnreadCount: async (chatId: string, currentUserId: string): Promise<number> => {
     // For RTDB, fetching all messages to count unread is heavy. 
     // In a real app, we'd store a counter. For now, doing it crudely.
     const snapshot = await get(ref(db, `messages/${chatId}`));
     if (!snapshot.exists()) return 0;
     const msgs = Object.values(snapshot.val()) as Message[];
     return msgs.filter(m => m.senderId !== currentUserId && m.status !== 'read').length;
  },
  
  subscribeToUnreadCount: (chatId: string, currentUserId: string, callback: (count: number) => void) => {
      const messagesRef = ref(db, `messages/${chatId}`);
      return onValue(messagesRef, (snapshot) => {
          if (!snapshot.exists()) { callback(0); return; }
          const msgs = Object.values(snapshot.val()) as Message[];
          const count = msgs.filter(m => m.senderId !== currentUserId && m.status !== 'read').length;
          callback(count);
      });
  },

  sendMessage: async (chatId: string, senderId: string, text: string, type: MessageType = 'text'): Promise<Message> => {
      const messageId = push(child(ref(db), 'messages')).key;
      if (!messageId) throw new Error("Failed to generate key");

      const newMessage: Message = {
          id: messageId,
          chatId,
          senderId,
          text,
          timestamp: Date.now(), // Client time estimate, serverTimestamp better but harder to optimistically render
          status: 'sent',
          type
      };

      // 1. Save message
      await set(ref(db, `messages/${chatId}/${messageId}`), newMessage);

      // 2. Update chat lastMessage
      await update(ref(db, `chats/${chatId}`), {
          lastMessage: newMessage
      });

      return newMessage;
  },

  markMessagesAsRead: async (chatId: string, readerId: string) => {
      const messagesRef = ref(db, `messages/${chatId}`);
      const snapshot = await get(messagesRef);
      if (!snapshot.exists()) return;

      const updates: any = {};
      const msgs = snapshot.val();
      
      Object.keys(msgs).forEach(key => {
          const m = msgs[key];
          if (m.senderId !== readerId && m.status !== 'read') {
              updates[`${key}/status`] = 'read';
          }
      });

      if (Object.keys(updates).length > 0) {
          await update(messagesRef, updates);
      }
  },

  // --- Admin / Bot Methods ---

  getBotChats: async (botId: string): Promise<ChatSession[]> => {
      const snapshot = await get(ref(db, 'chats'));
      if (!snapshot.exists()) return [];
      
      const allChats = Object.values(snapshot.val()) as any[];
      return allChats.filter(c => {
          if (c.id === FRIENDS_GROUP_ID) return false;
          
          if (Array.isArray(c.participants)) {
              return c.participants.includes(botId);
          }
          // @ts-ignore
          return c.participants && c.participants[botId];
      }) as ChatSession[];
  },

  getMessages: async (chatId: string): Promise<Message[]> => {
      const messagesRef = ref(db, `messages/${chatId}`);
      // Remove query ordering to fix "Index not defined" error. We sort client-side.
      const snapshot = await get(messagesRef);
      
      if (snapshot.exists()) {
          const msgs = Object.values(snapshot.val()) as Message[];
          // Client-side sort
          return msgs.sort((a, b) => a.timestamp - b.timestamp);
      }
      return [];
  }
};