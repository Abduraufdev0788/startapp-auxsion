export type Language = 'uz' | 'ru' | 'en';

export interface Translations {
  common: {
    appName: string;
    loading: string;
    save: string;
    saving: string;
    saved: string;
    cancel: string;
    close: string;
    delete: string;
    back: string;
    search: string;
    all: string;
    status: string;
    active: string;
    completed: string;
    expired: string;
    new: string;
    likeNew: string;
    used: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    dayShort: string;
    secShort: string;
    participants: string;
    currencyUZS: string;
  };
  nav: {
    searchPlaceholder: string;
    cabinet: string;
    login: string;
    register: string;
    logout: string;
    admin: string;
    lightMode: string;
    darkMode: string;
  };
  dashboard: {
    sidebarTitle: string;
    activeAuctions: string;
    participating: string;
    myAuctions: string;
    wonAuctions: string;
    favorites: string;
    deposits: string;
    notifications: string;
    settings: string;
    sellProduct: string;
    lockedDeposit: string;
    depositRefundGuarantee: string;
    noAuctionsFound: string;
    currentBid: string;
    depositAmount: string;
    submitBid: string;
    filterCategory: string;
    allCategories: string;
    allRegions: string;
    sortNewest: string;
    sortEndingSoon: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    emptySearchTitle: string;
    emptySearchDesc: string;
    emptyCreatedTitle: string;
    emptyCreatedDesc: string;
    emptyParticipatingTitle: string;
    emptyParticipatingDesc: string;
    emptyWonTitle: string;
    emptyWonDesc: string;
    emptyFavoritesTitle: string;
    emptyFavoritesDesc: string;
    depositHistoryTitle: string;
    depositHistoryDesc: string;
    notificationsTitle: string;
    notificationsDesc: string;
    markAsRead: string;
    noNotifications: string;
  };
  settings: {
    title: string;
    subtitle: string;
    appearanceTitle: string;
    appearanceSubtitle: string;
    lightTheme: string;
    lightThemeDesc: string;
    darkTheme: string;
    darkThemeDesc: string;
    languageTitle: string;
    languageSubtitle: string;
    uzbek: string;
    uzbekDesc: string;
    russian: string;
    russianDesc: string;
    english: string;
    englishDesc: string;
    profileTitle: string;
    fullName: string;
    phone: string;
    email: string;
    region: string;
    address: string;
    bio: string;
    saveProfile: string;
    profileUpdated: string;
    securityTitle: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    updatePassword: string;
    passwordUpdated: string;
    notifSettingsTitle: string;
    bidOutbidNotif: string;
    auctionEndNotif: string;
    depositRefundNotif: string;
  };
  auctionDetails: {
    endsIn: string;
    auctionEnded: string;
    startPrice: string;
    currentHighestBid: string;
    minNextBid: string;
    depositRequired: string;
    bidButton: string;
    payDeposit: string;
    bidHistory: string;
    rules: string;
    delivery: string;
    seller: string;
    condition: string;
  };
}

export const translations: Record<Language, Translations> = {
  uz: {
    common: {
      appName: 'AuctionHub',
      loading: 'Yuklanmoqda...',
      save: 'Saqlash',
      saving: 'Saqlanmoqda...',
      saved: 'Saqlandi',
      cancel: 'Bekor qilish',
      close: 'Yopish',
      delete: "O'chirish",
      back: 'Orqaga',
      search: 'Qidirish',
      all: 'Barchasi',
      status: 'Holati',
      active: 'Faol',
      completed: 'Yakunlangan',
      expired: 'Muddati tugagan',
      new: 'Yangi',
      likeNew: 'Deyarli yangi',
      used: 'Ishlatilgan',
      days: 'kun',
      hours: 'soat',
      minutes: 'daq',
      seconds: 'son',
      dayShort: 'k',
      secShort: 'son',
      participants: 'ishtirokchi',
      currencyUZS: 'UZS',
    },
    nav: {
      searchPlaceholder: "Lot nomi yoki tavsifi bo'yicha qidirish...",
      cabinet: 'Kabinet',
      login: 'Kirish',
      register: "Ro'yxatdan o'tish",
      logout: 'Chiqish',
      admin: 'Admin',
      lightMode: 'Kunduzgi rejim',
      darkMode: 'Tungi rejim',
    },
    dashboard: {
      sidebarTitle: "Bo'limlar",
      activeAuctions: 'Auksionlar bozori',
      participating: "Men qo'shilganlar",
      myAuctions: 'Mening auksionlarim',
      wonAuctions: 'Yutib olinganlar',
      favorites: 'Tanlanganlar',
      deposits: 'Kafolat depozitlari',
      notifications: 'Bildirishnomalar',
      settings: 'Sozlamalar',
      sellProduct: 'Mahsulot sotish',
      lockedDeposit: 'Band qilingan depozit',
      depositRefundGuarantee: 'Yutqazilgan auksionlarda kafolat depoziti 100% qaytariladi.',
      noAuctionsFound: "Mos keluvchi auksionlar topilmadi",
      currentBid: 'Joriy narx',
      depositAmount: 'Depozit',
      submitBid: 'Taklif kiritish',
      filterCategory: 'Barcha toifalar',
      allCategories: 'Barcha toifalar',
      allRegions: 'Barcha hududlar',
      sortNewest: "Yangi qo'shilganlar",
      sortEndingSoon: "Tugash vaqti bo'yicha",
      sortPriceAsc: "Narx: arzondan qimmatga",
      sortPriceDesc: "Narx: qimmatdan arzonga",
      emptySearchTitle: "Hech qanday auksion topilmadi",
      emptySearchDesc: "Qidiruv so'zini yoki filtrlarni o'zgartirib ko'ring.",
      emptyCreatedTitle: "Siz hali auksion joylashtirmadingiz",
      emptyCreatedDesc: "O'z mahsulotingizni auksionga qo'ying va eng yuqori narxda soting.",
      emptyParticipatingTitle: "Ishtirok etayotgan auksionlaringiz yo'q",
      emptyParticipatingDesc: "Bozordan o'zingizga ma'qul lotni tanlab kafolat depoziti to'lang.",
      emptyWonTitle: "Hozircha yutilgan auksionlar yo'q",
      emptyWonDesc: "Savdolarda faol qatnashing va orzuingizdagi mahsulotlarni yutib oling.",
      emptyFavoritesTitle: "Tanlanganlar ro'yxati bo'sh",
      emptyFavoritesDesc: "Auksion kartasidagi yurakcha belgisini bosib sevimli lotlarni saqlang.",
      depositHistoryTitle: 'Kafolat depozitlari balansi va tarixi',
      depositHistoryDesc: 'Auksionlarda qatnashish uchun to\'langan depozitlar holati',
      notificationsTitle: 'Bildirishnomalar markazi',
      notificationsDesc: 'Savdolar, depozitlar va g\'oliblik haqida muhim eslatmalar',
      markAsRead: "O'qildi",
      noNotifications: "Yangi bildirishnomalar yo'q",
    },
    settings: {
      title: 'Profil va Tizim sozlamalari',
      subtitle: "Shaxsiy ma'lumotlaringizni tahrirlang, dizayn va tilni o'zingizga moslang",
      appearanceTitle: "Tizim ko'rinishi (Mavzu)",
      appearanceSubtitle: "Kunduzgi yoki tungi rejimni tanlang. Tanlovingiz saqlanadi.",
      lightTheme: 'Kunduzgi rejim (Light)',
      lightThemeDesc: "Yorug' va tiniq interfeys (standart)",
      darkTheme: 'Tungi rejim (Dark)',
      darkThemeDesc: "Ko'zga qulay, energiyani tejovchi qorong'u rejim",
      languageTitle: 'Tizim tili (Language)',
      languageSubtitle: "Dastur interfeysi uchun qulay tilni tanlang.",
      uzbek: "O'zbekcha",
      uzbekDesc: "O'zbek tili (asosiy)",
      russian: 'Русский',
      russianDesc: 'Русский язык',
      english: 'English',
      englishDesc: 'English language',
      profileTitle: "Shaxsiy profil ma'lumotlari",
      fullName: "To'liq ism-sharif (F.I.O) *",
      phone: 'Telefon raqami (Asosiy identifikator)',
      email: 'Elektron pochta (Email)',
      region: 'Hudud / Shahar *',
      address: 'Yetkazib berish manzili',
      bio: "O'zingiz haqingizda qisqacha (Bio)",
      saveProfile: 'Profilni saqlash',
      profileUpdated: "Profil ma'lumotlari muvaffaqiyatli saqlandi",
      securityTitle: 'Xavfsizlik va Parolni yangilash',
      currentPassword: 'Joriy parol *',
      newPassword: 'Yangi parol (kamida 8 belgi) *',
      confirmPassword: 'Yangi parolni tasdiqlash *',
      updatePassword: 'Parolni yangilash',
      passwordUpdated: "Parolingiz muvaffaqiyatli o'zgartirildi",
      notifSettingsTitle: 'Bildirishnoma sozlamalari',
      bidOutbidNotif: "Boshqa ishtirokchi yuqoriroq narx taklif qilganda xabar berish",
      auctionEndNotif: "Auksion yakunlanishiga 1 soat qolganda eslatma yuborish",
      depositRefundNotif: "Kafolat depoziti qaytarilganda bildirishnoma olish",
    },
    auctionDetails: {
      endsIn: 'Tugashiga qoldi:',
      auctionEnded: 'Auksion yakunlangan',
      startPrice: 'Boshlang\'ich narx',
      currentHighestBid: 'Joriy eng yuqori taklif',
      minNextBid: 'Keyingi minimal taklif',
      depositRequired: 'Ishtirok depoziti',
      bidButton: 'Taklif berish',
      payDeposit: 'Depozit to\'lash',
      bidHistory: 'Takliflar tarixi',
      rules: 'Qoidalar',
      delivery: 'Yetkazib berish',
      seller: 'Sotuvchi',
      condition: 'Holati',
    },
  },
  ru: {
    common: {
      appName: 'AuctionHub',
      loading: 'Загрузка...',
      save: 'Сохранить',
      saving: 'Сохранение...',
      saved: 'Сохранено',
      cancel: 'Отмена',
      close: 'Закрыть',
      delete: 'Удалить',
      back: 'Назад',
      search: 'Поиск',
      all: 'Все',
      status: 'Статус',
      active: 'Активный',
      completed: 'Завершен',
      expired: 'Истек',
      new: 'Новый',
      likeNew: 'Как новый',
      used: 'Б/у',
      days: 'дн',
      hours: 'ч',
      minutes: 'мин',
      seconds: 'сек',
      dayShort: 'д',
      secShort: 'сек',
      participants: 'участников',
      currencyUZS: 'UZS',
    },
    nav: {
      searchPlaceholder: 'Поиск по названию или описанию...',
      cabinet: 'Кабинет',
      login: 'Войти',
      register: 'Регистрация',
      logout: 'Выйти',
      admin: 'Админ',
      lightMode: 'Светлая тема',
      darkMode: 'Темная тема',
    },
    dashboard: {
      sidebarTitle: 'Разделы',
      activeAuctions: 'Рынок аукционов',
      participating: 'Мои участия',
      myAuctions: 'Мои аукционы',
      wonAuctions: 'Выигранные',
      favorites: 'Избранное',
      deposits: 'Гарантийные депозиты',
      notifications: 'Уведомления',
      settings: 'Настройки',
      sellProduct: 'Продать товар',
      lockedDeposit: 'Заблокированный депозит',
      depositRefundGuarantee: 'В случае проигрыша гарантийный депозит возвращается на 100%.',
      noAuctionsFound: 'Подходящих аукционов не найдено',
      currentBid: 'Текущая цена',
      depositAmount: 'Депозит',
      submitBid: 'Сделать ставку',
      filterCategory: 'Все категории',
      allCategories: 'Все категории',
      allRegions: 'Все регионы',
      sortNewest: 'Сначала новые',
      sortEndingSoon: 'Скоро завершаются',
      sortPriceAsc: 'Цена: от низкой к высокой',
      sortPriceDesc: 'Цена: от высокой к низкой',
      emptySearchTitle: 'Ничего не найдено',
      emptySearchDesc: 'Попробуйте изменить поисковый запрос или фильтры.',
      emptyCreatedTitle: 'Вы еще не создали аукционы',
      emptyCreatedDesc: 'Выставите товар на аукцион и продайте по максимальной цене.',
      emptyParticipatingTitle: 'Вы пока не участвуете в аукционах',
      emptyParticipatingDesc: 'Выберите лот из списка и внесите гарантийный депозит.',
      emptyWonTitle: 'Пока нет выигранных аукционов',
      emptyWonDesc: 'Участвуйте в торгах и побеждайте в аукционах.',
      emptyFavoritesTitle: 'Список избранного пуст',
      emptyFavoritesDesc: 'Нажмите сердечко на карточке товара, чтобы сохранить его.',
      depositHistoryTitle: 'Баланс и история депозитов',
      depositHistoryDesc: 'Статус внесенных гарантийных депозитов для участия',
      notificationsTitle: 'Центр уведомлений',
      notificationsDesc: 'Важные оповещения о торгах, депозитах и победах',
      markAsRead: 'Прочитано',
      noNotifications: 'Нет новых уведомлений',
    },
    settings: {
      title: 'Настройки профиля и системы',
      subtitle: 'Редактируйте личные данные, настраивайте оформление и язык',
      appearanceTitle: 'Внешний вид (Тема)',
      appearanceSubtitle: 'Выберите светлый или темный режим. Ваш выбор сохранится.',
      lightTheme: 'Светлая тема (Light)',
      lightThemeDesc: 'Яркий и четкий интерфейс (по умолчанию)',
      darkTheme: 'Темная тема (Dark)',
      darkThemeDesc: 'Комфортный для глаз темный интерфейс',
      languageTitle: 'Язык системы (Language)',
      languageSubtitle: 'Выберите удобный язык для работы с приложением.',
      uzbek: "O'zbekcha",
      uzbekDesc: 'Узбекский язык',
      russian: 'Русский',
      russianDesc: 'Русский язык (основной)',
      english: 'English',
      englishDesc: 'Английский язык',
      profileTitle: 'Личные данные профиля',
      fullName: 'Ф.И.О. *',
      phone: 'Номер телефона (Основной ID)',
      email: 'Электронная почта (Email)',
      region: 'Регион / Город *',
      address: 'Адрес доставки',
      bio: 'Кратко о себе (Био)',
      saveProfile: 'Сохранить профиль',
      profileUpdated: 'Данные профиля успешно сохранены',
      securityTitle: 'Безопасность и смена пароля',
      currentPassword: 'Текущий пароль *',
      newPassword: 'Новый пароль (минимум 8 знаков) *',
      confirmPassword: 'Подтверждение нового пароля *',
      updatePassword: 'Обновить пароль',
      passwordUpdated: 'Пароль успешно изменен',
      notifSettingsTitle: 'Настройки уведомлений',
      bidOutbidNotif: 'Оповещать, если ставку перебили',
      auctionEndNotif: 'Напоминать за 1 час до окончания аукциона',
      depositRefundNotif: 'Уведомлять о возврате депозита',
    },
    auctionDetails: {
      endsIn: 'До завершения осталось:',
      auctionEnded: 'Аукцион завершен',
      startPrice: 'Начальная цена',
      currentHighestBid: 'Текущая максимальная ставка',
      minNextBid: 'Следующая мин. ставка',
      depositRequired: 'Гарантийный депозит',
      bidButton: 'Сделать ставку',
      payDeposit: 'Внести депозит',
      bidHistory: 'История ставок',
      rules: 'Правила',
      delivery: 'Доставка',
      seller: 'Продавец',
      condition: 'Состояние',
    },
  },
  en: {
    common: {
      appName: 'AuctionHub',
      loading: 'Loading...',
      save: 'Save',
      saving: 'Saving...',
      saved: 'Saved',
      cancel: 'Cancel',
      close: 'Close',
      delete: 'Delete',
      back: 'Back',
      search: 'Search',
      all: 'All',
      status: 'Status',
      active: 'Active',
      completed: 'Completed',
      expired: 'Expired',
      new: 'New',
      likeNew: 'Like New',
      used: 'Used',
      days: 'days',
      hours: 'hrs',
      minutes: 'min',
      seconds: 'sec',
      dayShort: 'd',
      secShort: 's',
      participants: 'bidders',
      currencyUZS: 'UZS',
    },
    nav: {
      searchPlaceholder: 'Search lot by name or description...',
      cabinet: 'Dashboard',
      login: 'Log In',
      register: 'Sign Up',
      logout: 'Log Out',
      admin: 'Admin',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
    },
    dashboard: {
      sidebarTitle: 'Menu',
      activeAuctions: 'Live Marketplace',
      participating: 'Participating',
      myAuctions: 'My Auctions',
      wonAuctions: 'Won Lots',
      favorites: 'Favorites',
      deposits: 'Escrow Deposits',
      notifications: 'Notifications',
      settings: 'Settings',
      sellProduct: 'Sell Product',
      lockedDeposit: 'Locked Deposit',
      depositRefundGuarantee: 'Non-winning bidders get 100% of their participation deposit refunded.',
      noAuctionsFound: 'No matching auctions found',
      currentBid: 'Current Bid',
      depositAmount: 'Deposit',
      submitBid: 'Place Bid',
      filterCategory: 'All Categories',
      allCategories: 'All Categories',
      allRegions: 'All Regions',
      sortNewest: 'Newest First',
      sortEndingSoon: 'Ending Soonest',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      emptySearchTitle: 'No auctions found',
      emptySearchDesc: 'Try adjusting your search terms or filters.',
      emptyCreatedTitle: 'No auctions listed yet',
      emptyCreatedDesc: 'List your items on auction and get the best market value.',
      emptyParticipatingTitle: 'Not participating in any auctions',
      emptyParticipatingDesc: 'Explore available lots and place refundable deposits to bid.',
      emptyWonTitle: 'No won auctions yet',
      emptyWonDesc: 'Participate actively and win your favorite products.',
      emptyFavoritesTitle: 'Your favorites list is empty',
      emptyFavoritesDesc: 'Click the heart icon on any auction card to bookmark it.',
      depositHistoryTitle: 'Deposit Balances & History',
      depositHistoryDesc: 'Track status of your refundable auction deposits',
      notificationsTitle: 'Notification Center',
      notificationsDesc: 'Important alerts regarding bids, deposits, and wins',
      markAsRead: 'Mark as read',
      noNotifications: 'No new notifications',
    },
    settings: {
      title: 'Profile & System Settings',
      subtitle: 'Manage your profile details, customize system theme and language',
      appearanceTitle: 'Appearance (Theme)',
      appearanceSubtitle: 'Choose light or dark mode. Your preference will be saved.',
      lightTheme: 'Light Mode',
      lightThemeDesc: 'Crisp and bright display (default)',
      darkTheme: 'Dark Mode',
      darkThemeDesc: 'Comfortable dark colors for low-light environments',
      languageTitle: 'System Language',
      languageSubtitle: 'Select your preferred language for the application.',
      uzbek: "O'zbekcha",
      uzbekDesc: 'Uzbek language (default)',
      russian: 'Русский',
      russianDesc: 'Russian language',
      english: 'English',
      englishDesc: 'English language',
      profileTitle: 'Personal Profile Details',
      fullName: 'Full Name *',
      phone: 'Phone Number (Primary ID)',
      email: 'Email Address',
      region: 'Region / City *',
      address: 'Delivery Address',
      bio: 'About Yourself (Bio)',
      saveProfile: 'Save Profile',
      profileUpdated: 'Profile settings saved successfully',
      securityTitle: 'Security & Change Password',
      currentPassword: 'Current Password *',
      newPassword: 'New Password (min 8 chars) *',
      confirmPassword: 'Confirm New Password *',
      updatePassword: 'Update Password',
      passwordUpdated: 'Password changed successfully',
      notifSettingsTitle: 'Notification Preferences',
      bidOutbidNotif: 'Alert me when another bidder places a higher bid',
      auctionEndNotif: 'Send reminder 1 hour before auction ends',
      depositRefundNotif: 'Notify when refundable deposit is processed',
    },
    auctionDetails: {
      endsIn: 'Ends in:',
      auctionEnded: 'Auction ended',
      startPrice: 'Starting Price',
      currentHighestBid: 'Current Highest Bid',
      minNextBid: 'Minimum Next Bid',
      depositRequired: 'Required Deposit',
      bidButton: 'Place Bid',
      payDeposit: 'Pay Deposit',
      bidHistory: 'Bid History',
      rules: 'Rules',
      delivery: 'Delivery',
      seller: 'Seller',
      condition: 'Condition',
    },
  },
};
