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
    scheduled: string;
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
    verified: string;
    standard: string;
  };
  nav: {
    home: string;
    auctions: string;
    searchPlaceholder: string;
    cabinet: string;
    login: string;
    register: string;
    logout: string;
    admin: string;
    lightMode: string;
    darkMode: string;
    myWallet: string;
    notifications: string;
  };
  home: {
    badge: string;
    heroTitle1: string;
    heroTitle2: string;
    heroDesc: string;
    searchPlaceholder: string;
    exploreBtn: string;
    sellBtn: string;
    featuredTitle: string;
    featuredSubtitle: string;
    viewAllAuctions: string;
    howItWorksTitle: string;
    howItWorksSubtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    trustTitle: string;
    trustDesc: string;
  };
  auctions: {
    breadcrumbHome: string;
    breadcrumbMarket: string;
    pageTitle: string;
    pageSubtitle: string;
    liveBadge: string;
    activeLotsCount: string;
    searchPlaceholder: string;
    allCategories: string;
    conditionAll: string;
    conditionNew: string;
    conditionLikeNew: string;
    conditionUsed: string;
    allRegions: string;
    sortNewest: string;
    sortEndingSoon: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortBids: string;
    currentBid: string;
    startPrice: string;
    deposit: string;
    bidBtn: string;
    bidsCount: string;
    participantsCount: string;
    videoLot: string;
    emptyTitle: string;
    emptyDesc: string;
    clearFilters: string;
  };
  dashboard: {
    sidebarTitle: string;
    activeAuctions: string;
    participating: string;
    myAuctions: string;
    wonAuctions: string;
    favorites: string;
    allMyAuctions: string;
    deposits: string;
    notifications: string;
    settings: string;
    sellProduct: string;
    postNewLot: string;
    lockedDeposit: string;
    depositRefundGuarantee: string;
    noAuctionsFound: string;
    currentBid: string;
    depositAmount: string;
    submitBid: string;
    filterCategory: string;
    allCategories: string;
    allRegions: string;
    allStatuses: string;
    scheduledStatus: string;
    filterCondition: string;
    sortNewest: string;
    sortEndingSoon: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortBidsCount: string;
    activeFilters: string;
    clearFilters: string;
    viewLot: string;
    startPrice: string;
    withdraw: string;
    walletTitle: string;
    lockedDeposits: string;
    availableBalance: string;
    walletTransactions: string;
    withdrawHistory: string;
    auctionDeposits: string;
    bidsCount: string;
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
    markAllAsRead: string;
    noNotifications: string;
    newBadge: string;
    marketTitle: string;
    marketSubtitle: string;
    participatingTitle: string;
    participatingSubtitle: string;
    createdTitle: string;
    createdSubtitle: string;
    wonTitle: string;
    wonSubtitle: string;
    favoritesTitle: string;
    favoritesSubtitle: string;
    allAuctionsTitle: string;
    allAuctionsSubtitle: string;
    depositsPageTitle: string;
    depositsPageSubtitle: string;
    withdrawable: string;
    walletCardDesc: string;
    frozen: string;
    lockedCardDesc: string;
    completedTx: string;
    sentTx: string;
    receiptNum: string;
    auctionNum: string;
    lockedStatus: string;
    refundedStatus: string;
    paidStatus: string;
    videoLot: string;
    addToFavorites: string;
    removeFromFavorites: string;
    emptyTransactionsTitle: string;
    emptyTransactionsDesc: string;
    emptyWithdrawalsTitle: string;
    emptyWithdrawalsDesc: string;
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
    backToAuctions: string;
    participants: string;
    totalBids: string;
    bidInputPlaceholder: string;
    placeBid: string;
    depositPrompt: string;
    depositSuccess: string;
    verifiedSeller: string;
  };
  modal: {
    sellProductTitle: string;
    sellProductSubtitle: string;
    mediaStep: string;
    mediaCount: string;
    mediaFormatHint: string;
    uploadAreaTitle: string;
    uploadAreaSubtitle: string;
    mainPhotoBadge: string;
    detailsStep: string;
    titleLabel: string;
    titlePlaceholder: string;
    categoryLabel: string;
    addNewCategory: string;
    cancelNewCategory: string;
    newCategoryNamePlaceholder: string;
    newCategoryDescPlaceholder: string;
    saveNewCategory: string;
    conditionLabel: string;
    descLabel: string;
    descPlaceholder: string;
    financialStep: string;
    startPriceLabel: string;
    reservePriceLabel: string;
    minIncrementLabel: string;
    depositLabel: string;
    durationLabel: string;
    daysUnit: string;
    deliveryStep: string;
    regionLabel: string;
    deliveryInfoLabel: string;
    publishBtn: string;
    publishing: string;
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
      scheduled: 'Kutilmoqda',
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
      verified: 'Tasdiqlangan',
      standard: 'Standart',
    },
    nav: {
      home: 'Bosh sahifa',
      auctions: 'Auksionlar',
      searchPlaceholder: "Lot nomi yoki tavsifi bo'yicha qidirish...",
      cabinet: 'Kabinet',
      login: 'Kirish',
      register: "Ro'yxatdan o'tish",
      logout: 'Chiqish',
      admin: 'Admin',
      lightMode: 'Kunduzgi rejim',
      darkMode: 'Tungi rejim',
      myWallet: 'Hisobim',
      notifications: 'Bildirishnomalar',
    },
    home: {
      badge: "O'zbekistondagi 1-raqamli kafolatli auksion maydoni",
      heroTitle1: 'Shaffof raqobat. Haqiqiy narxlar.',
      heroTitle2: 'Kafolatlangan xarid.',
      heroDesc: "AuctionHub orqali mahsulotingizni eng yuqori narxda soting yoki orzuingizdagi buyumni arzonroq narxda yutib oling.",
      searchPlaceholder: "Qidirayotgan mahsulotingiz nomini kiriting...",
      exploreBtn: "Auksionlarni ko'rish",
      sellBtn: "Mahsulot sotish",
      featuredTitle: 'Faol savdodagi auksionlar',
      featuredSubtitle: "Hozirda eng qizg'in narx talashuvi kechayotgan mashhur lotlar",
      viewAllAuctions: "Barcha auksionlarni ko'rish",
      howItWorksTitle: 'Qanday ishlaydi?',
      howItWorksSubtitle: "AuctionHub platformasi 4 ta oddiy va xavfsiz qadamdan iborat",
      step1Title: "1. Ro'yxatdan o'ting",
      step1Desc: "Telefon raqamingiz orqali soniyalar ichida ro'yxatdan o'ting va shaxsiy hisobingizga kiring.",
      step2Title: "2. Kafolat depoziti to'lang",
      step2Desc: "O'zingizga yoqqan lotni tanlang va qatnashish uchun qaytariladigan kafolat depozitini to'lang.",
      step3Title: "3. Narx taklifini bering",
      step3Desc: "Raqobatchilardan balandroq narx taklif qiling va auksion tugashini kuting.",
      step4Title: "4. Mahsulotni qabul qiling",
      step4Desc: "Yutsangiz qolgan summani to'lab buyumni oling. Yutqazsangiz depozit 100% balansingizga qaytadi.",
      trustTitle: "Xavfsizlik va Kafolat",
      trustDesc: "Barcha moliyaviy amaliyotlar ikki tomonlama hisob-kitob (double-entry ledger) orqali to'liq kafolatlangan.",
    },
    auctions: {
      breadcrumbHome: 'Bosh sahifa',
      breadcrumbMarket: 'Auksionlar bozori',
      pageTitle: 'Faol Auksionlar Bozori',
      pageSubtitle: 'Tekshirilgan tovarlar, real raqobat va 100% qaytariluvchi depozit kafolati',
      liveBadge: 'Jonli savdo',
      activeLotsCount: 'ta lot faol',
      searchPlaceholder: "Lot nomi yoki parametr bo'yicha qidirish...",
      allCategories: 'Barcha toifalar',
      conditionAll: 'Barchasi',
      conditionNew: 'Yangi',
      conditionLikeNew: 'Deyarli yangi',
      conditionUsed: 'Ishlatilgan',
      allRegions: 'Barcha hududlar',
      sortNewest: "Yangi qo'shilganlar",
      sortEndingSoon: 'Tugash vaqti yaqin',
      sortPriceAsc: 'Narx: arzonroq',
      sortPriceDesc: 'Narx: qimmatroq',
      sortBids: "Takliflar ko'p",
      currentBid: 'Joriy narx',
      startPrice: "Boshlang'ich",
      deposit: 'Depozit',
      bidBtn: 'Taklif kiritish',
      bidsCount: 'ta taklif',
      participantsCount: 'ishtirokchi',
      videoLot: 'Video lot',
      emptyTitle: 'Mos keluvchi lotlar topilmadi',
      emptyDesc: "Filtr parametrlarini o'zgartiring yoki qidiruv so'zini tozalang.",
      clearFilters: 'Filtrlarni tozalash',
    },
    dashboard: {
      sidebarTitle: "Bo'limlar",
      activeAuctions: 'Bozordagi lotlar',
      participating: 'Ishtiroklarim',
      myAuctions: 'Sotuvdagi lotlarim',
      wonAuctions: 'Yutib olingan lotlar',
      favorites: 'Sevimlilar',
      allMyAuctions: 'Barcha auksionlarim',
      deposits: 'Kafolat depozitlari',
      notifications: 'Bildirishnomalar',
      settings: 'Sozlamalar',
      sellProduct: 'Mahsulot sotish',
      postNewLot: '+ Yangi lot joylash',
      lockedDeposit: 'Band qilingan depozit',
      depositRefundGuarantee: 'Yutqazilgan auksionlarda kafolat depoziti 100% qaytariladi.',
      noAuctionsFound: "Mos keluvchi auksionlar topilmadi",
      currentBid: 'Joriy narx',
      depositAmount: 'Depozit',
      submitBid: 'Taklif kiritish',
      filterCategory: 'Barcha toifalar',
      allCategories: 'Barcha toifalar',
      allRegions: 'Barcha hududlar',
      allStatuses: 'Barcha holatlar',
      scheduledStatus: 'Kutilayotgan',
      filterCondition: 'Holati',
      sortNewest: "Yangi qo'shilganlar",
      sortEndingSoon: "Tugash vaqti yaqin",
      sortPriceAsc: "Narx: arzonroq",
      sortPriceDesc: "Narx: qimmatroq",
      sortBidsCount: "Takliflar ko'p",
      activeFilters: 'Faol filtrlar:',
      clearFilters: 'Filtrlarni tozalash',
      viewLot: "Lotni ko'rish",
      startPrice: "Boshlang'ich",
      withdraw: "Pulni chiqarib olish",
      walletTitle: "Mening hisobim (Hamyon)",
      lockedDeposits: "Band depozitlar",
      availableBalance: "Mening hamyonim (Mavjud balans)",
      walletTransactions: "Hisob amaliyotlari",
      withdrawHistory: "Kartaga chiqarib olishlar",
      auctionDeposits: "Auksion depozitlari",
      bidsCount: "ta taklif",
      emptySearchTitle: "Filtr parametrlariga mos lotlar topilmadi",
      emptySearchDesc: "Filtrlarni tozalab ko'ring yoki boshqa so'z orqali qidiring.",
      emptyCreatedTitle: "Siz hali sotuvga mahsulot qo'ymadingiz",
      emptyCreatedDesc: "Yangi lot e'lon qiling va auksion orqali mahsulotingizni qulay narxda soting.",
      emptyParticipatingTitle: "Siz hali birorta auksionda ishtirok etmadingiz",
      emptyParticipatingDesc: "Bozordagi faol auksionlarni ko'rib chiqing va kafolat depozitini to'lab taklif bering.",
      emptyWonTitle: "Hozircha yutib olingan lotlar mavjud emas",
      emptyWonDesc: "Savdolarda faol qatnashing va orzuingizdagi mahsulotlarni yutib oling.",
      emptyFavoritesTitle: "Sevimli auksionlar ro'yxati bo'sh",
      emptyFavoritesDesc: "Sizga yoqqan lotlarni yurakcha tugmasi orqali saqlab qo'yishingiz mumkin.",
      depositHistoryTitle: 'Kafolat depozitlari va Shaxsiy hisob',
      depositHistoryDesc: 'Auksionlarda ishtirok etish uchun to\'langan va qaytarilgan kafolat mablag\'lari',
      notificationsTitle: 'Bildirishnomalar',
      notificationsDesc: 'Hisobingiz va lotlaringizga doir barcha bildirishnomalar',
      markAsRead: "O'qildi",
      markAllAsRead: "Barchasini o'qilgan qilish",
      noNotifications: "Sizda yangi bildirishnomalar mavjud emas.",
      newBadge: 'yangi',
      marketTitle: 'Bozordagi faol auksionlar',
      marketSubtitle: 'Platformadagi hozirda ochiq barcha tekshirilgan lotlar va savdolar',
      participatingTitle: 'Ishtirok etayotgan auksionlarim',
      participatingSubtitle: "Siz kafolat depozitini to'lab taklif kiritgan barcha lotlar",
      createdTitle: 'Mening auksionlarim (Sotuvdagi lotlar)',
      createdSubtitle: "O'zingiz sotuvga qo'ygan va faol savdoda bo'lgan auksionlar",
      wonTitle: 'Yutib olingan auksionlar',
      wonSubtitle: 'Siz eng yuqori narx taklifi berib yutib olgan lotlar',
      favoritesTitle: 'Sevimli auksionlarim',
      favoritesSubtitle: "Sizga yoqqan va saqlab qo'yilgan sevimli lotlar",
      allAuctionsTitle: 'Barcha auksionlarim tarixi',
      allAuctionsSubtitle: "Barcha ishtiroklar va sotuvdagi auksionlarning umumiy ro'yxati",
      depositsPageTitle: 'Shaxsiy hisob va Kafolat depozitlari',
      depositsPageSubtitle: 'Yutqazilgan auksion depozitlari, hamyon balansi va bank kartasiga chiqarib olishlar',
      withdrawable: 'Yechib olish mumkin',
      walletCardDesc: "Yutqazilgan auksionlarning barcha kafolat depozitlari to'g'ridan-to'g'ri shu yerga qaytadi.",
      frozen: 'Muzlatilgan',
      lockedCardDesc: "Auksion yakunlangach g'olib bo'lmagan taqdiringizda mablag' 100% hamyon balansingizga qaytadi.",
      completedTx: 'Bajarildi',
      sentTx: "O'tkazildi",
      receiptNum: 'Chek',
      auctionNum: 'Auksion',
      lockedStatus: 'Band qilingan',
      refundedStatus: 'Hisobga qaytarilgan',
      paidStatus: "To'langan",
      videoLot: 'Video lot',
      addToFavorites: "Sevimlilarga qo'shish",
      removeFromFavorites: "Sevimlilardan o'chirish",
      emptyTransactionsTitle: 'Hozircha hisob amaliyotlari mavjud emas.',
      emptyTransactionsDesc: "Yutqazilgan auksion depozitlari qaytarilganda shu yerda ko'rinadi.",
      emptyWithdrawalsTitle: 'Hozircha pul yechib olinmagan',
      emptyWithdrawalsDesc: "Balansingizdagi mablag'ni Uzcard, Humo yoki Visa kartangizga chiqarib oling.",
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
      startPrice: "Boshlang'ich narx",
      currentHighestBid: 'Joriy eng yuqori taklif',
      minNextBid: 'Keyingi minimal taklif',
      depositRequired: 'Ishtirok depoziti',
      bidButton: 'Taklif berish',
      payDeposit: "Depozit to'lash",
      bidHistory: 'Takliflar tarixi',
      rules: 'Qoidalar',
      delivery: 'Yetkazib berish',
      seller: 'Sotuvchi',
      condition: 'Holati',
      backToAuctions: "Auksionlarga qaytish",
      participants: 'ishtirokchi',
      totalBids: 'ta taklif',
      bidInputPlaceholder: 'Taklif miqdorini kiriting',
      placeBid: 'Taklif kiritish',
      depositPrompt: "Ushbu auksionda taklif berish uchun kafolat depozitini to'lashingiz lozim.",
      depositSuccess: "Depozit to'landi, endi taklif kiritishingiz mumkin!",
      verifiedSeller: 'Tasdiqlangan sotuvchi',
    },
    modal: {
      sellProductTitle: 'Mahsulot sotish (OLX uslubida lot joylash)',
      sellProductSubtitle: "Mahsulot parametrlarini to'ldiring va raqobatli auksionni boshlang",
      mediaStep: '1. Fotosuratlar va Video yuklash',
      mediaCount: 'ta yuklandi',
      mediaFormatHint: "JPG, PNG, WebP, MP4, WebM (ko'pi bilan 50MB)",
      uploadAreaTitle: 'Suratlarni yuklash uchun bosing yoki shu yerga sudrab tashlang',
      uploadAreaSubtitle: "Birinchi yuklangan rasm asosiy muqova bo'ladi. Shuningdek mahsulot videosini ham qo'shishingiz mumkin",
      mainPhotoBadge: 'Asosiy',
      detailsStep: '2. Mahsulot tavsifi va Holati',
      titleLabel: "E'lon sarlavhasi (Nomi) *",
      titlePlaceholder: 'Masalan: Apple iPhone 15 Pro Max 256GB Natural Titanium (Ochilgan quti)',
      categoryLabel: 'Rukn / Toifa *',
      addNewCategory: "+ Yangi toifa qo'shish",
      cancelNewCategory: 'Bekor qilish',
      newCategoryNamePlaceholder: 'Toifa nomi (masalan: Geyming)',
      newCategoryDescPlaceholder: "Toifa tavsifi (ixtiyoriy)...",
      saveNewCategory: 'Saqlash',
      conditionLabel: 'Mahsulot holati *',
      descLabel: "To'liq tavsifi (Holati, defektlari, afzalliklari) *",
      descPlaceholder: "Mahsulot haqida to'liq va haqqoniy ma'lumot bering...",
      financialStep: '3. Auksion narxlari va Depozit shartlari',
      startPriceLabel: "Boshlang'ich narx (UZS) *",
      reservePriceLabel: "Minimal sotish narxi (Reserve Price - UZS) *",
      minIncrementLabel: "Minimal qadam oshirish (UZS) *",
      depositLabel: "Kafolat depoziti (UZS) *",
      durationLabel: 'Auksion davomiyligi *',
      daysUnit: 'kun',
      deliveryStep: '4. Hudud va Yetkazib berish ma\'lumotlari',
      regionLabel: 'Mahsulot joylashgan hudud *',
      deliveryInfoLabel: "Yetkazib berish shartlari *",
      publishBtn: "Auksionni darhol e'lon qilish",
      publishing: "Auksion yaratilmoqda...",
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
      scheduled: 'Ожидается',
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
      verified: 'Подтвержден',
      standard: 'Стандарт',
    },
    nav: {
      home: 'Главная',
      auctions: 'Аукционы',
      searchPlaceholder: 'Поиск по названию или описанию...',
      cabinet: 'Кабинет',
      login: 'Войти',
      register: 'Регистрация',
      logout: 'Выйти',
      admin: 'Админ',
      lightMode: 'Светлая тема',
      darkMode: 'Темная тема',
      myWallet: 'Мой счет',
      notifications: 'Уведомления',
    },
    home: {
      badge: 'Аукционная площадка №1 с гарантией в Узбекистане',
      heroTitle1: 'Честная конкуренция. Реальные цены.',
      heroTitle2: 'Гарантированная сделка.',
      heroDesc: 'Продайте свой товар по максимальной рыночной цене или выиграйте желаемую вещь со скидкой через AuctionHub.',
      searchPlaceholder: 'Введите название искомого товара...',
      exploreBtn: 'Смотреть аукционы',
      sellBtn: 'Продать товар',
      featuredTitle: 'Горячие активные аукционы',
      featuredSubtitle: 'Популярные лоты с наиболее активными торгами прямо сейчас',
      viewAllAuctions: 'Все аукционы',
      howItWorksTitle: 'Как это работает?',
      howItWorksSubtitle: 'Платформа AuctionHub основана на 4 простых и безопасных шагах',
      step1Title: '1. Быстрая регистрация',
      step1Desc: 'Зарегистрируйтесь по номеру телефона за секунды и войдите в личный кабинет.',
      step2Title: '2. Гарантийный депозит',
      step2Desc: 'Выберите понравившийся лот и внесите возвратный гарантийный депозит для участия.',
      step3Title: '3. Делайте ставки',
      step3Desc: 'Предлагайте цену выше оппонентов и следите за ходом торгов до конца таймера.',
      step4Title: '4. Получите товар',
      step4Desc: 'В случае победы доплатите остаток. В случае проигрыша 100% депозита возвращается на баланс.',
      trustTitle: 'Безопасность и Гарантия',
      trustDesc: 'Все финансовые операции ведутся через двойную бухгалтерию (double-entry ledger) с полной прозрачностью.',
    },
    auctions: {
      breadcrumbHome: 'Главная',
      breadcrumbMarket: 'Рынок аукционов',
      pageTitle: 'Рынок Активных Аукционов',
      pageSubtitle: 'Проверенные товары, честная конкуренция и 100% возврат депозита',
      liveBadge: 'Живые торги',
      activeLotsCount: 'активных лотов',
      searchPlaceholder: 'Поиск по названию или характеристикам...',
      allCategories: 'Все категории',
      conditionAll: 'Все',
      conditionNew: 'Новый',
      conditionLikeNew: 'Как новый',
      conditionUsed: 'Б/у',
      allRegions: 'Все регионы',
      sortNewest: 'Сначала новые',
      sortEndingSoon: 'Скоро завершаются',
      sortPriceAsc: 'Цена: дешевле',
      sortPriceDesc: 'Цена: дороже',
      sortBids: 'Много ставок',
      currentBid: 'Текущая цена',
      startPrice: 'Начальная',
      deposit: 'Депозит',
      bidBtn: 'Сделать ставку',
      bidsCount: 'ставок',
      participantsCount: 'участников',
      videoLot: 'Видео лот',
      emptyTitle: 'Подходящих лотов не найдено',
      emptyDesc: 'Измените параметры фильтра или очистите поисковый запрос.',
      clearFilters: 'Сбросить фильтры',
    },
    dashboard: {
      sidebarTitle: 'Разделы',
      activeAuctions: 'Рынок аукционов',
      participating: 'Мои участия',
      myAuctions: 'Мои аукционы',
      wonAuctions: 'Выигранные лоты',
      favorites: 'Избранное',
      allMyAuctions: 'Все мои аукционы',
      deposits: 'Гарантийные депозиты',
      notifications: 'Уведомления',
      settings: 'Настройки',
      sellProduct: 'Продать товар',
      postNewLot: '+ Новый лот',
      lockedDeposit: 'Заблокированный депозит',
      depositRefundGuarantee: 'В случае проигрыша гарантийный депозит возвращается на 100%.',
      noAuctionsFound: 'Подходящих аукционов не найдено',
      currentBid: 'Текущая цена',
      depositAmount: 'Депозит',
      submitBid: 'Сделать ставку',
      filterCategory: 'Все категории',
      allCategories: 'Все категории',
      allRegions: 'Все регионы',
      allStatuses: 'Все статусы',
      scheduledStatus: 'Ожидаемые',
      filterCondition: 'Состояние',
      sortNewest: 'Сначала новые',
      sortEndingSoon: 'Скоро завершаются',
      sortPriceAsc: 'Цена: дешевле',
      sortPriceDesc: 'Цена: дороже',
      sortBidsCount: 'Много ставок',
      activeFilters: 'Активные фильтры:',
      clearFilters: 'Сбросить фильтры',
      viewLot: 'Посмотреть лот',
      startPrice: 'Начальная',
      withdraw: 'Вывести средства',
      walletTitle: 'Мой счет (Кошелек)',
      lockedDeposits: 'Заблокировано',
      availableBalance: 'Мой кошелек (Доступный баланс)',
      walletTransactions: 'Операции по счету',
      withdrawHistory: 'Выводы на карту',
      auctionDeposits: 'Депозиты аукционов',
      bidsCount: 'ставок',
      emptySearchTitle: 'По вашему запросу ничего не найдено',
      emptySearchDesc: 'Попробуйте сбросить фильтры или ввести другое ключевое слово.',
      emptyCreatedTitle: 'Вы еще не выставили товары на продажу',
      emptyCreatedDesc: 'Опубликуйте лот и продайте его по лучшей рыночной цене.',
      emptyParticipatingTitle: 'Вы пока не участвуете в торгах',
      emptyParticipatingDesc: 'Выберите лот из списка и внесите гарантийный депозит.',
      emptyWonTitle: 'Пока нет выигранных аукционов',
      emptyWonDesc: 'Участвуйте активнее и выигрывайте нужные товары по отличной цене.',
      emptyFavoritesTitle: 'Список избранного пуст',
      emptyFavoritesDesc: 'Нажмите на сердечко на карточке, чтобы сохранить лот.',
      depositHistoryTitle: 'Баланс и история депозитов',
      depositHistoryDesc: 'Статус внесенных гарантийных депозитов для участия',
      notificationsTitle: 'Уведомления',
      notificationsDesc: 'Все важные оповещения по вашим торгам и операциям',
      markAsRead: 'Прочитано',
      markAllAsRead: 'Отметить все как прочитанные',
      noNotifications: 'Нет новых уведомлений',
      newBadge: 'новых',
      marketTitle: 'Активные аукционы на рынке',
      marketSubtitle: 'Все проверенные открытые торги на платформе в реальном времени',
      participatingTitle: 'Аукционы с моим участием',
      participatingSubtitle: 'Лоты, по которым внесен депозит и сделаны ставки',
      createdTitle: 'Мои аукционы (На продаже)',
      createdSubtitle: 'Созданные вами лоты, которые находятся на торгах',
      wonTitle: 'Выигранные аукционы',
      wonSubtitle: 'Лоты, в которых вы стали победителем с наивысшей ставкой',
      favoritesTitle: 'Избранные лоты',
      favoritesSubtitle: 'Сохраненные лоты, за которыми вы следите',
      allAuctionsTitle: 'История всех моих аукционов',
      allAuctionsSubtitle: 'Общий список всех участий и продаж',
      depositsPageTitle: 'Личный счет и гарантийные депозиты',
      depositsPageSubtitle: 'Депозиты с завершенных аукционов, баланс кошелька и выводы на карту',
      withdrawable: 'Доступно к выводу',
      walletCardDesc: 'Все депозиты с непрошедших аукционов возвращаются прямо сюда.',
      frozen: 'Заморожено',
      lockedCardDesc: 'После окончания аукциона в случае проигрыша сумма 100% вернется на баланс.',
      completedTx: 'Выполнено',
      sentTx: 'Отправлено',
      receiptNum: 'Чек',
      auctionNum: 'Аукцион',
      lockedStatus: 'Заблокирован',
      refundedStatus: 'Возвращен на баланс',
      paidStatus: 'Оплачен',
      videoLot: 'Видео лот',
      addToFavorites: 'Добавить в избранное',
      removeFromFavorites: 'Удалить из избранного',
      emptyTransactionsTitle: 'Операций по счету пока нет',
      emptyTransactionsDesc: 'Когда депозиты вернутся с торгов, они отобразятся здесь.',
      emptyWithdrawalsTitle: 'Выводов на карту еще не было',
      emptyWithdrawalsDesc: 'Выводите средства со своего баланса на карты Uzcard, Humo или Visa.',
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
      backToAuctions: 'Назад к аукционам',
      participants: 'участников',
      totalBids: 'ставок',
      bidInputPlaceholder: 'Введите сумму ставки',
      placeBid: 'Подтвердить ставку',
      depositPrompt: 'Для участия в данном аукционе необходимо внести гарантийный депозит.',
      depositSuccess: 'Депозит успешно внесен, теперь вы можете делать ставки!',
      verifiedSeller: 'Проверенный продавец',
    },
    modal: {
      sellProductTitle: 'Продать товар (Размещение лота)',
      sellProductSubtitle: 'Заполните характеристики товара и начните торги',
      mediaStep: '1. Загрузка фото и видео',
      mediaCount: 'загружено',
      mediaFormatHint: 'JPG, PNG, WebP, MP4, WebM (до 50МБ)',
      uploadAreaTitle: 'Нажмите для выбора файлов или перетащите их сюда',
      uploadAreaSubtitle: 'Первое фото будет обложкой. Вы также можете прикрепить видео обзор',
      mainPhotoBadge: 'Главное',
      detailsStep: '2. Описание и Состояние товара',
      titleLabel: 'Название объявления *',
      titlePlaceholder: 'Например: Apple iPhone 15 Pro Max 256GB Natural Titanium (Открытая коробка)',
      categoryLabel: 'Категория *',
      addNewCategory: '+ Добавить категорию',
      cancelNewCategory: 'Отмена',
      newCategoryNamePlaceholder: 'Название категории (напр.: Гейминг)',
      newCategoryDescPlaceholder: 'Описание категории (необязательно)...',
      saveNewCategory: 'Сохранить',
      conditionLabel: 'Состояние товара *',
      descLabel: 'Полное описание (состояние, дефекты, комплектация) *',
      descPlaceholder: 'Опишите товар честно и подробно...',
      financialStep: '3. Цены аукциона и Условия депозита',
      startPriceLabel: 'Начальная цена (UZS) *',
      reservePriceLabel: 'Резервная минимальная цена (UZS) *',
      minIncrementLabel: 'Минимальный шаг ставки (UZS) *',
      depositLabel: 'Гарантийный депозит (UZS) *',
      durationLabel: 'Длительность аукциона *',
      daysUnit: 'дн',
      deliveryStep: '4. Регион и Условия доставки',
      regionLabel: 'Местонахождение товара *',
      deliveryInfoLabel: 'Условия доставки *',
      publishBtn: 'Опубликовать аукцион',
      publishing: 'Создание аукциона...',
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
      scheduled: 'Scheduled',
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
      verified: 'Verified',
      standard: 'Standard',
    },
    nav: {
      home: 'Home',
      auctions: 'Auctions',
      searchPlaceholder: 'Search lot by name or description...',
      cabinet: 'Dashboard',
      login: 'Log In',
      register: 'Sign Up',
      logout: 'Log Out',
      admin: 'Admin',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      myWallet: 'My Wallet',
      notifications: 'Notifications',
    },
    home: {
      badge: 'Uzbekistan’s #1 Guaranteed Online Auction Platform',
      heroTitle1: 'Fair competition. Real market prices.',
      heroTitle2: 'Guaranteed transactions.',
      heroDesc: 'Sell your items at top market value or win your dream product at competitive prices through AuctionHub.',
      searchPlaceholder: 'Search product by name or keyword...',
      exploreBtn: 'Explore Auctions',
      sellBtn: 'Sell a Product',
      featuredTitle: 'Live Bidding Marketplace',
      featuredSubtitle: 'Trending items with active real-time bidding right now',
      viewAllAuctions: 'View All Auctions',
      howItWorksTitle: 'How It Works',
      howItWorksSubtitle: 'AuctionHub operates on 4 transparent and secure steps',
      step1Title: '1. Fast Sign Up',
      step1Desc: 'Create an account in seconds with your phone number and access your personalized dashboard.',
      step2Title: '2. Pay Participation Deposit',
      step2Desc: 'Pick your preferred lot and pay a 100% refundable security deposit to enter bidding.',
      step3Title: '3. Place Competing Bids',
      step3Desc: 'Outbid other participants and watch the live countdown timer on the auction page.',
      step4Title: '4. Complete & Receive',
      step4Desc: 'If you win, pay the remaining amount and receive the item. Non-winners get 100% of their deposit back.',
      trustTitle: 'Security & Integrity',
      trustDesc: 'All financial settlements are secured by an immutable double-entry ledger with bank-grade safety.',
    },
    auctions: {
      breadcrumbHome: 'Home',
      breadcrumbMarket: 'Auction Marketplace',
      pageTitle: 'Active Auction Marketplace',
      pageSubtitle: 'Verified goods, live competition, and 100% refundable deposit protection',
      liveBadge: 'Live Bidding',
      activeLotsCount: 'active lots',
      searchPlaceholder: 'Search lot by name or specifications...',
      allCategories: 'All Categories',
      conditionAll: 'All',
      conditionNew: 'New',
      conditionLikeNew: 'Like New',
      conditionUsed: 'Used',
      allRegions: 'All Regions',
      sortNewest: 'Newest First',
      sortEndingSoon: 'Ending Soonest',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      sortBids: 'Most Bids',
      currentBid: 'Current Bid',
      startPrice: 'Starting Price',
      deposit: 'Deposit',
      bidBtn: 'Place Bid',
      bidsCount: 'bids',
      participantsCount: 'bidders',
      videoLot: 'Video Lot',
      emptyTitle: 'No matching lots found',
      emptyDesc: 'Try adjusting your filters or clear the search query.',
      clearFilters: 'Clear Filters',
    },
    dashboard: {
      sidebarTitle: 'Navigation',
      activeAuctions: 'Marketplace Lots',
      participating: 'Participating',
      myAuctions: 'My Listings',
      wonAuctions: 'Won Lots',
      favorites: 'Favorites',
      allMyAuctions: 'All My Auctions',
      deposits: 'Escrow Deposits',
      notifications: 'Notifications',
      settings: 'Settings',
      sellProduct: 'Sell Product',
      postNewLot: '+ Post New Lot',
      lockedDeposit: 'Locked Deposit',
      depositRefundGuarantee: 'Non-winning bidders get 100% of their participation deposit refunded.',
      noAuctionsFound: 'No matching auctions found',
      currentBid: 'Current Bid',
      depositAmount: 'Deposit',
      submitBid: 'Place Bid',
      filterCategory: 'All Categories',
      allCategories: 'All Categories',
      allRegions: 'All Regions',
      allStatuses: 'All Statuses',
      scheduledStatus: 'Scheduled',
      filterCondition: 'Condition',
      sortNewest: 'Newest First',
      sortEndingSoon: 'Ending Soonest',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      sortBidsCount: 'Most Bids',
      activeFilters: 'Active Filters:',
      clearFilters: 'Clear Filters',
      viewLot: 'View Lot',
      startPrice: 'Starting Price',
      withdraw: 'Withdraw Funds',
      walletTitle: 'My Account (Wallet)',
      lockedDeposits: 'Locked Deposits',
      availableBalance: 'My Wallet (Available Balance)',
      walletTransactions: 'Account Operations',
      withdrawHistory: 'Card Withdrawals',
      auctionDeposits: 'Auction Deposits',
      bidsCount: 'bids',
      emptySearchTitle: 'No lots found matching your filters',
      emptySearchDesc: 'Try clearing your filters or search using different keywords.',
      emptyCreatedTitle: 'You have not listed any items yet',
      emptyCreatedDesc: 'Publish a new lot and sell your item at the highest market bid.',
      emptyParticipatingTitle: 'You are not participating in any auctions',
      emptyParticipatingDesc: 'Explore active auctions in the marketplace and pay refundable deposit to bid.',
      emptyWonTitle: 'No won auctions yet',
      emptyWonDesc: 'Participate actively in auctions to win great products.',
      emptyFavoritesTitle: 'Your favorites list is empty',
      emptyFavoritesDesc: 'Click the heart icon on any lot card to save it for later.',
      depositHistoryTitle: 'Deposit Balances & History',
      depositHistoryDesc: 'Track status of your refundable auction deposits',
      notificationsTitle: 'Notifications',
      notificationsDesc: 'Important alerts regarding your bids, deposits, and sales',
      markAsRead: 'Mark as read',
      markAllAsRead: 'Mark all as read',
      noNotifications: 'You have no new notifications.',
      newBadge: 'new',
      marketTitle: 'Live Marketplace Auctions',
      marketSubtitle: 'All verified lots currently open for bidding across the platform',
      participatingTitle: 'Auctions I am Participating In',
      participatingSubtitle: 'All lots where you have placed a refundable deposit and submitted bids',
      createdTitle: 'My Listed Auctions (For Sale)',
      createdSubtitle: 'Auctions that you have published and are currently running',
      wonTitle: 'Won Auctions',
      wonSubtitle: 'Lots where you placed the winning bid',
      favoritesTitle: 'Favorite Auctions',
      favoritesSubtitle: 'Lots you have saved to your favorites list',
      allAuctionsTitle: 'All My Auction History',
      allAuctionsSubtitle: 'Complete overview of all your participations and listings',
      depositsPageTitle: 'Account Balance & Escrow Deposits',
      depositsPageSubtitle: 'Refunded auction deposits, wallet balance, and bank card withdrawals',
      withdrawable: 'Withdrawable',
      walletCardDesc: 'All deposits from non-winning auctions are instantly returned here.',
      frozen: 'Locked',
      lockedCardDesc: 'When the auction ends, if you do not win, 100% of your deposit returns to your wallet.',
      completedTx: 'Completed',
      sentTx: 'Transferred',
      receiptNum: 'Receipt',
      auctionNum: 'Auction',
      lockedStatus: 'Locked',
      refundedStatus: 'Refunded to Wallet',
      paidStatus: 'Paid',
      videoLot: 'Video Lot',
      addToFavorites: 'Add to favorites',
      removeFromFavorites: 'Remove from favorites',
      emptyTransactionsTitle: 'No transactions yet',
      emptyTransactionsDesc: 'Refunded deposits and withdrawals will appear here.',
      emptyWithdrawalsTitle: 'No card withdrawals yet',
      emptyWithdrawalsDesc: 'Withdraw funds from your balance to your Uzcard, Humo, or Visa card.',
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
      backToAuctions: 'Back to Auctions',
      participants: 'bidders',
      totalBids: 'bids',
      bidInputPlaceholder: 'Enter bid amount',
      placeBid: 'Submit Bid',
      depositPrompt: 'You must pay a refundable deposit to participate in this auction.',
      depositSuccess: 'Deposit paid successfully, you can now place your bids!',
      verifiedSeller: 'Verified Seller',
    },
    modal: {
      sellProductTitle: 'Sell a Product (List Lot)',
      sellProductSubtitle: 'Fill in product specifications and launch your competitive auction',
      mediaStep: '1. Photos & Video Upload',
      mediaCount: 'uploaded',
      mediaFormatHint: 'JPG, PNG, WebP, MP4, WebM (up to 50MB)',
      uploadAreaTitle: 'Click to select files or drag and drop here',
      uploadAreaSubtitle: 'The first uploaded image will be the primary cover. You can also attach a video',
      mainPhotoBadge: 'Primary',
      detailsStep: '2. Product Description & Condition',
      titleLabel: 'Listing Title (Name) *',
      titlePlaceholder: 'e.g. Apple iPhone 15 Pro Max 256GB Natural Titanium (Open Box)',
      categoryLabel: 'Category *',
      addNewCategory: '+ Add New Category',
      cancelNewCategory: 'Cancel',
      newCategoryNamePlaceholder: 'Category name (e.g. Gaming)',
      newCategoryDescPlaceholder: 'Category description (optional)...',
      saveNewCategory: 'Save',
      conditionLabel: 'Item Condition *',
      descLabel: 'Full Description (Condition, defects, included accessories) *',
      descPlaceholder: 'Provide thorough and accurate details about the product...',
      financialStep: '3. Auction Prices & Deposit Terms',
      startPriceLabel: 'Starting Price (UZS) *',
      reservePriceLabel: 'Reserve / Minimum Price (UZS) *',
      minIncrementLabel: 'Minimum Bid Increment (UZS) *',
      depositLabel: 'Refundable Security Deposit (UZS) *',
      durationLabel: 'Auction Duration *',
      daysUnit: 'days',
      deliveryStep: '4. Location & Delivery Terms',
      regionLabel: 'Item Location *',
      deliveryInfoLabel: 'Delivery Details *',
      publishBtn: 'Publish Auction Now',
      publishing: 'Publishing auction...',
    },
  },
};
