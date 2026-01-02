
export interface User {
  id: string;
  username: string; // @handle
  displayName?: string; // Nickname
  email: string;
  bio?: string;
  avatarColor?: string; // hex code for avatar bg
  avatarUrl?: string; // Base64 string of image
  isOnline?: boolean;
  lastSeen?: number; // timestamp
  isAdmin?: boolean;
  isBot?: boolean;
  isBanned?: boolean;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'sticker' | 'gif' | 'system';
export type FontSize = 'small' | 'normal' | 'large';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string; // Contains text or URL for sticker/gif
  timestamp: number;
  status: MessageStatus;
  type: MessageType;
}

export interface ChatSession {
  id: string;
  participants: string[]; // User IDs
  lastMessage?: Message;
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export enum Tab {
  CHATS = 'CHATS',
  SETTINGS = 'SETTINGS',
}

export enum AuthView {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
}

export type Language = 'en' | 'ru';
export type Theme = 'light' | 'dark';

export const TRANSLATIONS = {
  en: {
    app_name: 'MavisChat',
    login: 'Log In',
    signup: 'Sign Up',
    username: 'Username',
    displayName: 'Name',
    email: 'Email',
    password: 'Password',
    processing: 'Processing...',
    no_account: "Don't have an account?",
    has_account: "Already have an account?",
    search_placeholder: 'Search',
    global_search: 'Global Search',
    no_users: 'No users found.',
    no_chats: 'No chats yet',
    no_chats_sub: 'Use search to find people by @username',
    tap_write: 'Tap to write',
    you: 'You',
    connecting: 'Connecting...',
    updating: 'Updating...',
    waiting_network: 'Waiting for network...',
    online: 'online',
    last_seen: 'last seen',
    last_seen_at: 'last seen at',
    messages_stored: 'Messages are stored locally.',
    message_placeholder: 'Message...',
    settings: 'Settings',
    edit_profile: 'Edit Profile',
    logout: 'Log Out',
    save: 'Save',
    cancel: 'Cancel',
    bio: 'Bio',
    bio_placeholder: 'Write something about yourself...',
    language: 'Language',
    theme: 'Theme',
    theme_light: 'Light',
    theme_dark: 'Dark',
    tab_chats: 'Chats',
    tab_settings: 'Settings',
    error_fields: 'All fields are required',
    error_exists: 'User already exists',
    error_not_found: 'User not found',
    error_permission: 'Database access denied. Please check Firebase Rules in Console.',
    done: 'Done',
    change_avatar_color: 'Tap to change color',
    upload_photo: 'Upload Photo',
    remove_photo: 'Remove Photo',
    profile_details: 'Profile Details',
    account_info: 'Account Info',
    gifs: 'GIFs',
    stickers: 'Stickers',
    typing: 'typing...',
    info: 'Info',
    notifications: 'Notifications',
    media: 'Media, links, and docs',
    at: 'at',
    bot: 'bot',
    start: 'START',
    admin_panel: 'Admin Panel',
    admin_bots: 'My Bots',
    admin_tickets: 'Active Tickets',
    reply_as_bot: 'Reply as Support',
    ban_user: 'Ban User',
    unban_user: 'Unban User',
    close_ticket: 'Close Ticket',
    ticket_closed: 'Ticket closed.',
    banned_msg: 'You have been banned.',
    support_greeting: "👋 **Welcome to Mavis Support!**\n\nI am the official automated assistant for MavisChat. I'm here to help you navigate the app and resolve common issues.\n\n**What can I do?**\n🔹 Reset passwords\n🔹 Troubleshoot connection issues\n🔹 Forward complex requests to human operators\n\nPress **START** to begin!",
    support_help: "🛠 **Mavis Support Commands**\n\nHere is a list of available commands:\n\n/start - Restart the conversation\n/help - View this help menu\n\nIf you have a specific question, simply type it below and a support agent will be notified.",
    support_received: "✅ **Request Received**\n\nThank you for contacting support. Your message has been logged.\n\nTicket ID: #REQ-8492\n\nAn available operator will review your inquiry and respond shortly.",
    error_banned: 'Your account has been banned.',
    chat_settings: 'Chat Settings',
    font_size: 'Font Size',
    size_small: 'Small',
    size_normal: 'Normal',
    size_large: 'Large',
    enable_notifications: 'Enable Notifications',
    optimize_storage: 'Optimize Storage',
    optimize_desc: 'Clear cache and free up space',
    optimizing: 'Cleaning...',
    optimized: 'Optimized!',
    storage_cleared: 'Storage cleared successfully',
    official_channel: 'Official Channel',
    rules_support: 'Rules & Support',
    rules_title: 'Rules & Terms',
    privacy_title: 'Privacy Policy',
    help_title: 'Help Center',
    manage_users: 'Manage Users',
    manage_admins: 'Manage Admins',
    enter_username_ban: 'Enter @username to ban/unban',
    enter_username_admin: 'Enter @username to promote',
    action_ban: 'BAN USER',
    action_unban: 'UNBAN',
    action_promote: 'MAKE ADMIN',
    action_demote: 'REVOKE',
    user_banned_success: 'User has been banned.',
    user_unbanned_success: 'User has been unbanned.',
    user_not_found_short: 'User not found.',
    official_account: 'Official Account',
    admin_role: 'Administrator & Developer',
    dev_info_desc: 'This user is a verified MavisChat developer and administrator. They monitor system stability and ensure community safety.',
    friends_group: 'Friends Group',
    join_group: 'Join Group',
    join_group_desc: 'Join the conversation to start chatting.',
    joined_group_msg: 'joined the group',
    group_participants: 'participants'
  },
  ru: {
    app_name: 'MavisChat',
    login: 'Войти',
    signup: 'Регистрация',
    username: 'Юзернейм',
    displayName: 'Имя',
    email: 'Почта',
    password: 'Пароль',
    processing: 'Обработка...',
    no_account: "Нет аккаунта?",
    has_account: "Есть аккаунт?",
    search_placeholder: 'Поиск',
    global_search: 'Глобальный поиск',
    no_users: 'Пользователи не найдены.',
    no_chats: 'Чатов пока нет',
    no_chats_sub: 'Найдите людей через поиск @username',
    tap_write: 'Нажмите, чтобы написать',
    you: 'Вы',
    connecting: 'Соединение...',
    updating: 'Обновление...',
    waiting_network: 'Ожидание сети...',
    online: 'в сети',
    last_seen: 'был(а) недавно',
    last_seen_at: 'был(а) в',
    messages_stored: 'Сообщения хранятся локально.',
    message_placeholder: 'Сообщение...',
    settings: 'Настройки',
    edit_profile: 'Изменить профиль',
    logout: 'Выйти',
    save: 'Сохранить',
    cancel: 'Отмена',
    bio: 'О себе',
    bio_placeholder: 'Напишите что-нибудь о себе...',
    language: 'Язык',
    theme: 'Тема',
    theme_light: 'Яркая',
    theme_dark: 'Тёмная',
    tab_chats: 'Чаты',
    tab_settings: 'Настройки',
    error_fields: 'Все поля обязательны',
    error_exists: 'Пользователь уже существует',
    error_not_found: 'Пользователь не найден',
    error_permission: 'Ошибка доступа. Проверьте Правила (Rules) в консоли Firebase.',
    done: 'Готово',
    change_avatar_color: 'Нажми, чтобы сменить цвет',
    upload_photo: 'Загрузить фото',
    remove_photo: 'Удалить фото',
    profile_details: 'Детали профиля',
    account_info: 'Аккаунт',
    gifs: 'GIFs',
    stickers: 'Стикеры',
    typing: 'печатает...',
    info: 'Информация',
    notifications: 'Уведомления',
    media: 'Медиа, ссылки и файлы',
    at: 'в',
    bot: 'бот',
    start: 'НАЧАТЬ',
    admin_panel: 'Админ Панель',
    admin_bots: 'Мои Боты',
    admin_tickets: 'Активные Тикеты',
    reply_as_bot: 'Ответить как Поддержка',
    ban_user: 'Забанить',
    unban_user: 'Разбанить',
    close_ticket: 'Закрыть диалог',
    ticket_closed: 'Диалог завершен.',
    banned_msg: 'Вы были заблокированы.',
    support_greeting: "👋 **Добро пожаловать в Mavis Support!**\n\nЯ официальный автоматический ассистент MavisChat. Я помогу вам освоиться в приложении и решить возникшие вопросы.\n\n**Что я умею?**\n🔹 Восстанавливать доступ\n🔹 Решать проблемы с подключением\n🔹 Передавать запросы операторам\n\nНажмите **НАЧАТЬ**, чтобы продолжить!",
    support_help: "🛠 **Команды Поддержки**\n\nСписок доступных команд:\n\n/start - Перезапустить диалог\n/help - Показать это меню\n\nЕсли у вас есть конкретный вопрос, просто напишите его ниже, и оператор получит уведомление.",
    support_received: "✅ **Запрос принят**\n\nСпасибо за обращение. Ваше сообщение зарегистрировано.\n\nID Тикета: #REQ-8492\n\nСвободный оператор рассмотрит ваш вопрос и ответит в ближайшее время.",
    error_banned: 'Ваш аккаунт заблокирован.',
    chat_settings: 'Настройки чата',
    font_size: 'Размер текста',
    size_small: 'Мелкий',
    size_normal: 'Обычный',
    size_large: 'Крупный',
    enable_notifications: 'Уведомления',
    optimize_storage: 'Оптимизация',
    optimize_desc: 'Очистить кэш и освободить память',
    optimizing: 'Очистка...',
    optimized: 'Готово!',
    storage_cleared: 'Память успешно очищена',
    official_channel: 'Официальный канал',
    rules_support: 'Правила и Помощь',
    rules_title: 'Правила и Условия',
    privacy_title: 'Политика конфиденциальности',
    help_title: 'Помощь и Поддержка',
    manage_users: 'Управление пользователями',
    manage_admins: 'Управление Админами',
    enter_username_ban: 'Введите @username для бана',
    enter_username_admin: 'Введите @username для прав',
    action_ban: 'ЗАБАНИТЬ',
    action_unban: 'РАЗБАНИТЬ',
    action_promote: 'ВЫДАТЬ',
    action_demote: 'СНЯТЬ',
    user_banned_success: 'Пользователь забанен.',
    user_unbanned_success: 'Пользователь разбанен.',
    user_not_found_short: 'Пользователь не найден.',
    official_account: 'Официальный аккаунт',
    admin_role: 'Администратор и Разработчик',
    dev_info_desc: 'Этот пользователь является верифицированным разработчиком и администратором MavisChat. Он следит за стабильностью системы и безопасностью.',
    friends_group: 'Группа Друзья',
    join_group: 'Присоединиться',
    join_group_desc: 'Вступите в группу, чтобы начать общение.',
    joined_group_msg: 'присоединился к группе',
    group_participants: 'участников'
  }
};
