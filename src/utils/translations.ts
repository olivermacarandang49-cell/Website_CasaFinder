export type Language = "tagalog" | "english";

export const translations = {
  tagalog: {
    // Header & Nav
    appName: "CasaFinder",
    tagline: "Gumaca Housing & Rental Portal",
    hello: "Kumusta,",
    studentRole: "TENANT / UMUUPA 🎓",
    landlordRole: "LANDLORD 🏠",
    studentAccount: "TENANT ACCOUNT",
    landlordAccount: "LANDLORD ACCOUNT",
    postProperty: "Mag-post ng Tuluyan",
    profileSettings: "Profile & Settings",
    logOut: "Mag-log Out",

    // Quick Nav Tabs
    tabList: "📋 Listahan ng Tuluyan",
    tabMap: "🗺️ Interactive Map",
    tabChecklist: "📝 Tenant Checklist",
    tabFare: "🚕 Fare Calculator",
    tabBudget: "💰 Budget Splitter",

    // Search & Filters
    searchPlaceholder: "Mag-search ng pangalan (e.g. Nena, SLSU, Aircon)...",
    allBarangays: "Lahat ng Barangay (All)",
    allTypes: "Lahat ng Uri (All Types)",
    filterBarangay: "Barangay / Lokasyon",
    filterType: "Uri ng Tuluyan",
    filterBudget: "Maximum Badyet",
    searchBtn: "Maghanap 🔍",
    resetFilters: "I-reset 🔄",
    showingResults: "Ipinapakita:",
    boardingHouse: "boarding house",
    boardingHouses: "boarding houses",
    filterOptions: "Filter Options",
    collapse: "Liitan",
    sortBy: "Pagsunod-sunod:",
    sortRecommended: "Inirerekomenda",
    sortPriceAsc: "Pinakamura Muna",
    sortPriceDesc: "Pinakamahal Muna",
    sortSlots: "Maraming Bakante",

    typeBoardingHouse: "Boarding House",
    typeApartment: "Apartment",
    typeOthers: "Iba pa (Others)",

    // Main Sections
    featuredHeading: "✨ Mga Inirerekomendang Boarding House sa Gumaca",
    featuredSub: "Ligtas, rehistrado, at malapit sa SLSU, Eastern Quezon College, at Gumaca National High School.",
    noResultsTitle: "Walang Nahanap na Tuluyan",
    noResultsSub: "Subukang baguhin ang iyong mga filter o mag-search sa ibang barangay sa Gumaca.",
    clearFiltersBtn: "Alisin ang Filters",

    // Property Card
    viewDetails: "Tingnan ang Detalye",
    contactLandlord: "Mag-message / Tawag",
    landlordProfile: "Profile ng Landlord",
    verifiedOperator: "Rehistradong Operator",
    perMonth: "/ buwan",
    slotsAvailable: "slot natitira",
    slotsFull: "Punong-puno na",
    inclusiveUtilities: "Kuryente at Tubig Kasama",

    // Modal Titles
    propertyModalTitle: "Detalye ng Tuluyan",
    postModalTitle: "Mag-post ng Bagong Tuluyan / Boarding House",
    profileModalTitle: "User Profile & Account Settings",
    landlordModalTitle: "Profile at Mga Tuluyan ng Landlord",

    // Profile & Settings
    tabProfileInfo: "Profile Info 👤",
    tabSecurity: "Security & Password 🔒",
    tabPreferences: "Preferences & Display ⚙️",
    tabAbout: "Tungkol sa App ℹ️",
    
    fullName: "Pangalan",
    username: "Username",
    schoolOrBusiness: "Eskwelahan / Negosyo",
    bioNote: "Maikling Pagpapakilala / Bio",
    accountSecurity: "Proteksyon ng Password sa Account",
    changePasswordNote: "Maaari mong baguhin ang iyong password anumang oras para sa seguridad ng iyong account.",
    newPassword: "Bagong Password",
    
    langLabel: "Language / Wika",
    themeLabel: "Theme / Tema",
    lightMode: "Light Mode ☀️",
    darkMode: "Dark Mode 🌙",
    saveSettings: "I-save ang Settings 💾",
    closeBtn: "Isara",

    // Auth & Login
    loginSubTitle: "Mag-log in upang maghanap o mag-post ng ligtas at abot-kayang boarding house sa Gumaca.",
    signupSubTitle: "Gumawa ng account para sa paghahanap o pagpopost ng tuluyan malapit sa iyong eskwelahan.",
    forgotSubTitle: "I-reset ang iyong password para muling ma-access ang iyong CasaFinder account.",
    selectRole: "Pumili ng Uri ng Account:",
    loginTab: "Mag-log In",
    signupTab: "Mag-sign Up",
    quickAccessDemo: "Quick Access (Demo Logins)",
    loginBtn: "Mag-log In 🚀",
    signupBtn: "Gumawa ng Account 🎉",
    forgotPasswordLink: "Nakalimutan ang password?",
    backToLogin: "Bumalik sa Log In",
    findAccount: "Hanapin ang Account 🔍",
    saveNewPassword: "I-save ang Bagong Password 🔒",

    // Post / Upload Property Modal
    postHeading: "Mag-post ng Bagong Boarding House / Apartment sa Gumaca",
    propertyTitleLabel: "Pangalan ng Boarding House o Apartment *",
    propertyTypeLabel: "Uri ng Tuluyan *",
    barangayLabel: "Barangay sa Gumaca, Quezon *",
    landmarkLabel: "Lugar / Landmark sa Gumaca *",
    genderPolicyLabel: "Uri ng Kasarian *",
    monthlyPriceLabel: "Buwanang Upa (₱) *",
    availableSlotsLabel: "Bilang ng Bakanteng Slot *",
    utilitiesIncludedLabel: "Kasama na ba ang Kuryente at Tubig?",
    uploadPhotosLabel: "Mag-upload ng mga Larawan ng Property",
    cancelBtn: "Kanselahin",
    cancel: "Kanselahin",
    submitPropertyBtn: "Isumite at I-post ang Listing 🚀",
    modalPostTitle: "Mag-post ng Boarding House / Apartment",
    profileTitle: "Profile at Mga Setting ng Account",
    prefLanguageLabel: "Wika (Language)",
    prefThemeLabel: "Tema (Theme)",
    close: "Isara",
    saveProfile: "I-save ang Profile at Settings 💾",
  },

  english: {
    // Header & Nav
    appName: "CasaFinder",
    tagline: "Gumaca Housing & Rental Portal",
    hello: "Hello,",
    studentRole: "TENANT 🎓",
    landlordRole: "LANDLORD 🏠",
    studentAccount: "TENANT ACCOUNT",
    landlordAccount: "LANDLORD ACCOUNT",
    postProperty: "Post Housing",
    profileSettings: "Profile & Settings",
    logOut: "Log Out",

    // Quick Nav Tabs
    tabList: "📋 Property Listings",
    tabMap: "🗺️ Interactive Map",
    tabChecklist: "📝 Tenant Checklist",
    tabFare: "🚕 Fare Calculator",
    tabBudget: "💰 Budget Splitter",

    // Search & Filters
    searchPlaceholder: "Search by name (e.g. Nena, SLSU, Aircon)...",
    allBarangays: "All Barangays",
    allTypes: "All Property Types",
    filterBarangay: "Barangay / Location",
    filterType: "Property Type",
    filterBudget: "Maximum Budget",
    searchBtn: "Search 🔍",
    resetFilters: "Reset 🔄",
    showingResults: "Showing:",
    boardingHouse: "boarding house",
    boardingHouses: "boarding houses",
    filterOptions: "Filter Options",
    collapse: "Collapse",
    sortBy: "Sort By:",
    sortRecommended: "Recommended",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    sortSlots: "Most Vacancies",

    typeBoardingHouse: "Boarding House",
    typeApartment: "Apartment",
    typeOthers: "Others",

    // Main Sections
    featuredHeading: "✨ Recommended Boarding Houses in Gumaca",
    featuredSub: "Safe, registered, and near SLSU, Eastern Quezon College, and Gumaca National High School.",
    noResultsTitle: "No Properties Found",
    noResultsSub: "Try adjusting your search filters or choosing a different barangay in Gumaca.",
    clearFiltersBtn: "Clear Filters",

    // Property Card
    viewDetails: "View Details",
    contactLandlord: "Message / Call",
    landlordProfile: "Landlord Profile",
    verifiedOperator: "Verified Operator",
    perMonth: "/ month",
    slotsAvailable: "slots left",
    slotsFull: "Fully Occupied",
    inclusiveUtilities: "Utilities Included",

    // Modal Titles
    propertyModalTitle: "Property Details",
    postModalTitle: "Post New Housing Listing",
    profileModalTitle: "User Profile & Account Settings",
    landlordModalTitle: "Landlord Profile & Listings",

    // Profile & Settings
    tabProfileInfo: "Profile Info 👤",
    tabSecurity: "Security & Password 🔒",
    tabPreferences: "Preferences & Display ⚙️",
    tabAbout: "About CasaFinder ℹ️",

    fullName: "Full Name",
    username: "Username",
    schoolOrBusiness: "School / Business Name",
    bioNote: "Short Bio / Notes",
    accountSecurity: "Account Password Protection",
    changePasswordNote: "You can change your password anytime for account security.",
    newPassword: "New Password",

    langLabel: "Language",
    themeLabel: "Theme",
    lightMode: "Light Mode ☀️",
    darkMode: "Dark Mode 🌙",
    saveSettings: "Save Settings 💾",
    closeBtn: "Close",

    // Auth & Login
    loginSubTitle: "Log in to search or post safe and affordable boarding houses near your college.",
    signupSubTitle: "Sign up to create an account for searching or posting boarding houses near your college.",
    forgotSubTitle: "Reset your password to regain access to your CasaFinder account.",
    selectRole: "Select Account Type:",
    loginTab: "Log In",
    signupTab: "Sign Up",
    quickAccessDemo: "Quick Access (Demo Logins)",
    loginBtn: "Log In 🚀",
    signupBtn: "Create Account 🎉",
    forgotPasswordLink: "Forgot password?",
    backToLogin: "Back to Log In",
    findAccount: "Find Account 🔍",
    saveNewPassword: "Save New Password 🔒",

    // Post / Upload Property Modal
    postHeading: "Post New Boarding House / Apartment in Gumaca",
    propertyTitleLabel: "Boarding House or Apartment Name *",
    propertyTypeLabel: "Property Type *",
    barangayLabel: "Barangay in Gumaca, Quezon *",
    landmarkLabel: "Location / Landmark in Gumaca *",
    genderPolicyLabel: "Gender Type *",
    monthlyPriceLabel: "Monthly Rent (₱) *",
    availableSlotsLabel: "Available Slots *",
    utilitiesIncludedLabel: "Utilities (Electricity & Water) Included?",
    uploadPhotosLabel: "Upload Property Photos",
    cancelBtn: "Cancel",
    cancel: "Cancel",
    submitPropertyBtn: "Submit & Post Listing 🚀",
    modalPostTitle: "Post Your Boarding House / Apartment",
    profileTitle: "User Profile & Account Settings",
    prefLanguageLabel: "Language",
    prefThemeLabel: "Theme",
    close: "Close",
    saveProfile: "Save Profile & Settings 💾",
  },
};

export const getTranslation = (lang: Language, key: keyof typeof translations.tagalog): string => {
  return translations[lang]?.[key] || translations.tagalog[key] || key;
};
