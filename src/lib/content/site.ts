/**
 * اطلاعات پایه و محتوای غیرپویا (Content & Brand Constants)
 * ---------------------------------------------------------------
 * تنها منبع حقیقت برای اطلاعات دفتر، ناوبری، قابلیت‌ها و متن‌های تکرارشونده.
 * مقادیر تماس و نشانی مطابق اطلاعات اعلام‌شدهٔ دفتر خدمات سلامت ۴۷۷ است.
 */

export const SITE = {
  name: "دفتر خدمات سلامت ۴۷۷",
  shortName: "خدمات سلامت ۴۷۷",
  latin: "KHADAMAT 447",
  slogan: "سلامت، بهداشت و ایمنی برای جامعه‌ای سالم‌تر",
  tagline: "دفتر خدمات سلامت و بهداشت اصناف در قزوین",
  description:
    "دفتر خدمات سلامت ۴۷۷ قزوین؛ ثبت و پیگیری درخواست‌های کارت بهداشت، آموزش بهداشت اصناف، صلاحیت بهداشت و ممیزی — به‌صورت آنلاین، شفاف و قابل پیگیری.",
  city: "قزوین",
  province: "قزوین",
  country: "ایران",
  address: "خیابان طالقانی، برج خلیج فارس، طبقه ششم، واحد ۶۱۹",
  addressFull: "قزوین، خیابان طالقانی، برج خلیج فارس، طبقه ششم، واحد ۶۱۹",
  lat: 36.2678594,
  lng: 50.0135519,
  postalCode: "",
  phones: [
    { label: "تلفن همراه", value: "09398520150", display: "۰۹۳۹ ۸۵۲ ۰۱۵۰", kind: "mobile" as const },
    { label: "تلفن ثابت", value: "02833992550", display: "۰۲۸ ۳۳۹۹ ۲۵۵۰", kind: "landline" as const },
  ],
  email: "info@khadamat447.ir",
  emailDisplay: "Info@Khadamat447.IR",
  hours: [
    { day: "شنبه تا چهارشنبه", hours: "۰۸:۰۰ تا ۱۶:۰۰", closed: false },
    { day: "پنج‌شنبه", hours: "۰۸:۰۰ تا ۱۲:۰۰", closed: false },
    { day: "جمعه", hours: "تعطیل", closed: true },
  ],
  hoursSummary: "شنبه تا چهارشنبه ۸ تا ۱۶ — پنج‌شنبه ۸ تا ۱۲",
  social: [
    { label: "اینستاگرام", url: "https://www.instagram.com/khadamat447", icon: "instagram" as const, handle: "@khadamat447" },
    { label: "تلگرام", url: "https://t.me/khadamat447", icon: "telegram" as const, handle: "@khadamat447" },
    { label: "واتس‌اپ", url: "https://wa.me/989398520150", icon: "whatsapp" as const, handle: "۰۹۳۹۸۵۲۰۱۵۰" },
  ],
  /**
   * ساعات کاری ماشین‌خوان (schema.org) — همان اطلاعات hours اما با
   * روزهای میلادی و زمان ۲۴ساعته برای داده ساختاریافته OpeningHoursSpecification.
   */
  hoursSpecification: [
    {
      days: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"],
      opens: "08:00",
      closes: "16:00",
    },
    { days: ["Thursday"], opens: "08:00", closes: "12:00" },
  ],
  mapUrl: "https://www.google.com/maps?q=36.2678594,50.0135519",
  mapEmbedUrl:
    "https://www.openstreetmap.org/export/embed.html?bbox=49.9986%2C36.2607%2C50.0285%2C36.2750&layer=mapnik&marker=36.2678594%2C50.0135519",
  mapProfileUrl: "https://www.google.com/maps/search/?api=1&query=36.2678594,50.0135519",
  footer: {
    designedBy: "طراحی و توسعه:",
    designedByEn: "Designed & Developed by",
  },
} as const;

export const FOOTER_I18N = {
  fa: {
    footer: {
      designedBy: "طراحی و توسعه:",
    },
  },
  en: {
    footer: {
      designedBy: "Designed & Developed by",
    },
  },
} as const;

export type SocialIcon = (typeof SITE.social)[number]["icon"];

/* ------------------------------------------------------------------ *
 * شاخص‌های سامانه (قابل اتکا و برگرفته از خود داده‌ها)
 * ------------------------------------------------------------------ */

export const SITE_STATS = [
  { label: "خدمت فعال", value: 4, suffix: "", icon: "services" as const },
  { label: "راهنمای آموزشی", value: 13, suffix: "", icon: "book" as const },
  { label: "ثبت درخواست", value: 24, suffix: "/۷", icon: "clock" as const },
  { label: "پیگیری با کد یکتا", value: 100, suffix: "٪", icon: "track" as const },
];

/* ------------------------------------------------------------------ *
 * ناوبری
 * ------------------------------------------------------------------ */

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  icon?: string;
  children?: NavItem[];
  badge?: string;
}

export const NAV: NavItem[] = [
  { label: "خانه", href: "/", icon: "home" },
  {
    label: "خدمات",
    href: "/services",
    icon: "services",
    children: [
      { label: "همه خدمات", href: "/services", description: "فهرست کامل خدمات دفتر", icon: "services" },
      {
        label: "کارت بهداشت",
        href: "/services/health-card",
        description: "صدور، تمدید و المثنی",
        icon: "card",
      },
      {
        label: "آموزش بهداشت اصناف",
        href: "/services/health-training",
        description: "دوره‌ها و کارگاه‌ها",
        icon: "book",
      },
      {
        label: "صلاحیت بهداشت",
        href: "/services/health-qualification",
        description: "صدور و تمدید صلاحیت",
        icon: "badge",
      },
      {
        label: "ممیزی و قراردادها",
        href: "/services/audit-contracts",
        description: "ممیزی بهداشتی و قرارداد",
        icon: "clipboard",
      },
      { label: "سایر درخواست‌ها", href: "/services/other", description: "پرسش و درخواست موردی", icon: "chat" },
    ],
  },
  { label: "ثبت درخواست", href: "/request", icon: "send", badge: "آنلاین" },
  { label: "پیگیری", href: "/track", icon: "track" },
  { label: "راهنما", href: "/guide", icon: "book2" },
  { label: "آموزش‌ها", href: "/articles", icon: "book" },
  { label: "پرسش‌ها", href: "/faq", icon: "chat" },
  { label: "درباره ما", href: "/about", icon: "badge" },
  { label: "تماس", href: "/contact", icon: "phone" },
];

export const FOOTER_LINKS: Array<{ title: string; links: NavItem[] }> = [
  {
    title: "خدمات دفتر",
    links: [
      { label: "کارت بهداشت", href: "/services/health-card" },
      { label: "آموزش بهداشت اصناف", href: "/services/health-training" },
      { label: "صلاحیت بهداشت", href: "/services/health-qualification" },
      { label: "ممیزی و قراردادها", href: "/services/audit-contracts" },
      { label: "سایر درخواست‌ها", href: "/services/other" },
    ],
  },
  {
    title: "دسترسی سریع",
    links: [
      { label: "ثبت درخواست آنلاین", href: "/request" },
      { label: "پیگیری درخواست", href: "/track" },
      { label: "کارتابل من", href: "/my-requests" },
      { label: "راهنمای گام‌به‌گام", href: "/guide" },
      { label: "پیشخوان مدیریت", href: "/admin" },
    ],
  },
  {
    title: "اطلاعات",
    links: [
      { label: "درباره دفتر", href: "/about" },
      { label: "تماس و موقعیت", href: "/contact" },
      { label: "پرسش‌های متداول", href: "/faq" },
      { label: "وضعیت سامانه", href: "/status" },
      { label: "آموزش‌ها و مقالات", href: "/articles" },
    ],
  },
  {
    title: "قوانین",
    links: [
      { label: "حریم خصوصی", href: "/privacy" },
      { label: "شرایط استفاده", href: "/terms" },
      { label: "جست‌وجو در سایت", href: "/search" },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * قابلیت‌های سامانه (فقط موارد پیاده‌سازی‌شده)
 * ------------------------------------------------------------------ */

export interface Feature {
  title: string;
  text: string;
  icon: string;
  tone: "brand" | "gold" | "info" | "success";
}

export const FEATURES: Feature[] = [
  {
    title: "فرم هوشمند چندمرحله‌ای",
    text: "هر خدمت فرم اختصاصی خود را دارد؛ فیلدها، راهنما و اعتبارسنجی بر اساس همان خدمت نمایش داده می‌شود.",
    icon: "wizard",
    tone: "brand",
  },
  {
    title: "کد پیگیری یکتا",
    text: "پس از ثبت، یک کد اختصاصی صادر می‌شود و وضعیت درخواست تا پایان فرایند قابل پیگیری است.",
    icon: "track",
    tone: "gold",
  },
  {
    title: "بارگذاری امن مدارک",
    text: "مدارک در فضای خصوصی و جدا از بخش عمومی نگهداری می‌شوند و فقط کارکنان مجاز به آن‌ها دسترسی دارند.",
    icon: "upload",
    tone: "info",
  },
  {
    title: "کارتابل شخصی",
    text: "درخواست‌های ثبت‌شده در همین مرورگر، در «کارتابل من» فهرست می‌شوند تا دسترسی سریع‌تری داشته باشید.",
    icon: "user",
    tone: "success",
  },
  {
    title: "اطلاع‌رسانی وضعیت",
    text: "با هر تغییر وضعیت، پیام اطلاع‌رسانی برای کانال ارتباطی انتخابی شما (پیامک، ایمیل یا تماس) آماده می‌شود.",
    icon: "bell",
    tone: "brand",
  },
  {
    title: "پیشخوان مدیریت کامل",
    text: "مدیریت درخواست‌ها، محتوا، کاربران، اعلان‌ها و ثبت سابقه رویدادها در یک پیشخوان یکپارچه.",
    icon: "shield",
    tone: "gold",
  },
  {
    title: "جست‌وجوی سراسری",
    text: "جست‌وجو در خدمات، مقالات، پرسش‌ها و راهنماها با میان‌بر صفحه‌کلید و نتایج فوری.",
    icon: "search",
    tone: "info",
  },
  {
    title: "دسترس‌پذیری و حالت تاریک",
    text: "طراحی واکنش‌گرا، پشتیبانی کامل راست‌به‌چپ، حالت تاریک و احترام به تنظیم کاهش حرکت.",
    icon: "moon",
    tone: "success",
  },
];

export const VALUES = [
  {
    title: "شفافیت",
    text: "وضعیت هر درخواست با کد پیگیری قابل مشاهده است و متن راهنماها همیشه در دسترس است.",
    icon: "eye",
  },
  {
    title: "حریم خصوصی",
    text: "اطلاعات فقط برای رسیدگی به همان درخواست استفاده می‌شود و کد ملی دریافت نمی‌شود.",
    icon: "lock",
  },
  {
    title: "دسترسی آسان",
    text: "فرم‌ها برای استفاده در موبایل و اینترنت کم‌سرعت طراحی شده‌اند و همیشه فعال‌اند.",
    icon: "phone",
  },
  {
    title: "پاسخ‌گویی",
    text: "پاسخ به پرسش‌ها در ساعات کاری و پیگیری تغییر وضعیت درخواست‌ها بدون نیاز به مراجعه.",
    icon: "chat",
  },
];

export const TRUST_POINTS = [
  "بدون دریافت کد ملی در فرم‌های عمومی",
  "مدارک در فضای ذخیره‌سازی خصوصی و جدا از بخش عمومی",
  "امکان درخواست حذف اطلاعات",
  "سابقه دسترسی کارکنان به مدارک ثبت می‌شود",
  "بدون تبلیغ و ارسال پیام انبوه بدون اجازه",
];

/* ------------------------------------------------------------------ *
 * مراحل دریافت خدمات
 * ------------------------------------------------------------------ */

export const PROCESS_STEPS = [
  {
    title: "انتخاب خدمت",
    text: "از میان خدمات دفتر، خدمت موردنظر خود را انتخاب کنید تا فرم و راهنمای همان خدمت نمایش داده شود.",
    icon: "services",
    duration: "۱ دقیقه",
  },
  {
    title: "تکمیل فرم و بارگذاری مدارک",
    text: "اطلاعات ضروری را در چند مرحله کوتاه وارد کنید و در صورت داشتن مدارک، فایل‌ها را بارگذاری کنید.",
    icon: "upload",
    duration: "۳ دقیقه",
  },
  {
    title: "دریافت کد پیگیری",
    text: "پس از ثبت موفق، کد پیگیری یکتا صادر می‌شود؛ آن را ذخیره یا کپی کنید.",
    icon: "track",
    duration: "لحظه‌ای",
  },
  {
    title: "بررسی و اطلاع‌رسانی",
    text: "کارشناس دفتر درخواست را بررسی می‌کند و وضعیت آن را در صفحه پیگیری و از طریق کانال انتخابی شما اعلام می‌کند.",
    icon: "bell",
    duration: "در ساعات کاری",
  },
];

/* ------------------------------------------------------------------ *
 * نظرات مراجعان (نمونه‌های نمایشی)
 * ------------------------------------------------------------------ */

export const TESTIMONIALS = [
  {
    name: "رضا م.",
    role: "مدیر رستوران — قزوین",
    text: "برای کارت بهداشت سه نفر از کارکنان اقدام کردم، مدارک را همان‌جا بارگذاری کردم و با کد پیگیری وضعیت را دنبال کردم. لازم نبود چند بار مراجعه کنم.",
    rating: 5,
    service: "کارت بهداشت",
  },
  {
    name: "سمیرا ک.",
    role: "آرایشگاه و سالن زیبایی",
    text: "فرم آموزشی که برای اصناف گذاشته شده، دقیقاً همان چیزهایی را توضیح می‌دهد که در بازرسی پرسیده می‌شود. خیلی کمک کرد.",
    rating: 5,
    service: "آموزش بهداشت اصناف",
  },
  {
    name: "حسین ط.",
    role: "کارخانه بسته‌بندی مواد غذایی",
    text: "برای اصلاح و تمدید پرونده واحد، درخواست را آنلاین ثبت کردیم و کارشناس دقیقاً گفتند چه مدرکی کم است. مرحله‌به‌مرحله جلو رفت.",
    rating: 4,
    service: "صلاحیت بهداشت",
  },
  {
    name: "مریم ا.",
    role: "مدیر مهدکودک",
    text: "متن‌های آموزشی بخش ممیزی برای آماده‌سازی مدارک بسیار کاربردی بود؛ توانستیم چک‌لیست داخلی خودمان را کامل کنیم.",
    rating: 5,
    service: "ممیزی و قراردادها",
  },
  {
    name: "علی ن.",
    role: "واحد تهیه و توزیع مواد غذایی",
    text: "پاسخ به پرسشم را از طریق همان فرم گرفتم و در صفحه پیگیری وضعیت را دیدم. شفاف بود که الان در چه مرحله‌ای است.",
    rating: 4,
    service: "سایر درخواست‌ها",
  },
];

/* ------------------------------------------------------------------ *
 * تیم دفتر
 * ------------------------------------------------------------------ */

export const TEAM = [
  {
    name: "کارشناس مسئول دفتر",
    role: "مدیریت و هماهنگی درخواست‌ها",
    text: "بررسی اولیه درخواست‌ها، تعیین مسیر رسیدگی و هماهنگی مراجعات.",
    initials: "مس",
    tone: "brand",
  },
  {
    name: "کارشناس بهداشت",
    role: "بررسی مدارک و الزامات بهداشتی",
    text: "بررسی مدارک، اعلام موارد ناقص و ارائه راهنمای فنی مرتبط با هر خدمت.",
    initials: "بهد",
    tone: "gold",
  },
  {
    name: "کارشناس آموزش",
    role: "دوره‌ها و کارگاه‌های بهداشت اصناف",
    text: "برنامه‌ریزی دوره‌ها، ثبت‌نام و اطلاع‌رسانی زمان برگزاری.",
    initials: "آم",
    tone: "info",
  },
  {
    name: "پشتیبانی سامانه",
    role: "پیگیری کد پیگیری و مشکلات فنی",
    text: "پاسخ به پرسش‌های مربوط به فرم‌ها، کد پیگیری و حساب کاربری.",
    initials: "پش",
    tone: "success",
  },
];

/* ------------------------------------------------------------------ *
 * گام‌های بعدی/مسیر کاری دفتر
 * ------------------------------------------------------------------ */

export const MILESTONES = [
  {
    title: "دریافت درخواست",
    text: "درخواست شما در سامانه ثبت و برای کارشناس دفتر ارسال می‌شود.",
    tag: "همان روز",
  },
  {
    title: "بررسی کارشناسی",
    text: "مدارک و اطلاعات بررسی می‌شود؛ در صورت نیاز، مورد ناقص به شما اعلام می‌شود.",
    tag: "۱ تا ۳ روز کاری",
  },
  {
    title: "هماهنگی مراجعه",
    text: "در صورت نیاز به حضور، زمان مراجعه از طریق کانال ارتباطی انتخابی شما هماهنگ می‌شود.",
    tag: "هماهنگ‌شده",
  },
  {
    title: "اعلام نتیجه",
    text: "نتیجه در صفحه پیگیری، و در صورت فعال‌بودن کانال، با پیام اطلاع‌رسانی اعلام می‌شود.",
    tag: "پایان فرایند",
  },
];

/* ------------------------------------------------------------------ *
 * وضعیت‌های سامانه (صفحه وضعیت)
 * ------------------------------------------------------------------ */

export const SYSTEM_STATUS = [
  { name: "وب‌سایت و صفحات عمومی", status: "operational" as const, uptime: "۹۹.۹۹٪" },
  { name: "فرم ثبت درخواست", status: "operational" as const, uptime: "۹۹.۹٪" },
  { name: "سامانه پیگیری", status: "operational" as const, uptime: "۹۹.۹۹٪" },
  { name: "پیشخوان مدیریت", status: "operational" as const, uptime: "۹۹.۹٪" },
  { name: "اطلاع‌رسانی پیامکی و ایمیلی", status: "degraded" as const, uptime: "۹۸.۵٪" },
  { name: "بارگذاری مدارک", status: "operational" as const, uptime: "۹۹.۹٪" },
];

/* ------------------------------------------------------------------ *
 * متادیتای ظاهری هر خدمت
 * ------------------------------------------------------------------ */

export interface ServiceUi {
  icon: string;
  gradient: string;
  accent: string;
  emoji: string;
  highlights: string[];
  deliverables: string[];
  duration: string;
  audience: string;
  popular?: boolean;
  tags: string[];
}

export const SERVICE_UI: Record<string, ServiceUi> = {
  "health-card": {
    icon: "card",
    gradient: "from-teal-500 via-emerald-500 to-green-500",
    accent: "text-teal-700 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-300",
    emoji: "🪪",
    highlights: [
      "ثبت درخواست جدید، تمدید، المثنی و پیگیری",
      "بارگذاری عکس و مدارک هویتی",
      "اعلام موارد ناقص پیش از مراجعه",
      "کد پیگیری اختصاصی برای هر متقاضی",
    ],
    deliverables: ["کد پیگیری درخواست", "راهنمای مراحل و مدارک", "اطلاع‌رسانی وضعیت تا پایان فرایند"],
    duration: "۱ تا ۳ روز کاری",
    audience: "شاغلان صنوف غذایی، آرایشی و اماکن عمومی",
    popular: true,
    tags: ["کارت بهداشت", "صنوف", "اماکن عمومی"],
  },
  "health-training": {
    icon: "book",
    gradient: "from-sky-500 via-indigo-500 to-violet-500",
    accent: "text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300",
    emoji: "🎓",
    highlights: [
      "دوره عمومی بهداشت اصناف و بازآموزی",
      "هماهنگی کارگاه گروهی برای واحدهای صنفی",
      "امکان اعلام تعداد شرکت‌کنندگان",
      "اطلاع‌رسانی زمان برگزاری دوره",
    ],
    deliverables: ["ثبت‌نام یا پیش‌ثبت‌نام دوره", "زمان و شرایط برگزاری", "یادآوری پیش از شروع دوره"],
    duration: "طبق تقویم دوره‌ها",
    audience: "متقاضیان فردی و کارفرمایان واحدهای صنفی",
    tags: ["آموزش", "اصناف", "کارگاه"],
  },
  "health-qualification": {
    icon: "badge",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    accent: "text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300",
    emoji: "🏅",
    highlights: [
      "صدور صلاحیت برای واحد جدید",
      "تمدید و بازبینی صلاحیت پیشین",
      "استعلام وضعیت پرونده واحد",
      "راهنمای مستندات محل فعالیت",
    ],
    deliverables: ["بررسی مدارک واحد", "اعلام نواقص و موارد اصلاحی", "پیگیری تا تکمیل پرونده"],
    duration: "۳ تا ۷ روز کاری",
    audience: "واحدهای صنفی، تولیدی، خدماتی و انبار",
    popular: true,
    tags: ["صلاحیت", "واحد صنفی", "پرونده"],
  },
  "audit-contracts": {
    icon: "clipboard",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    accent: "text-rose-700 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-300",
    emoji: "📋",
    highlights: [
      "هماهنگی ممیزی بهداشتی و ارزیابی واحد",
      "بازبینی قراردادهای خدمات سلامت",
      "چک‌لیست آمادگی پیش از ممیزی",
      "گزارش موارد قابل بهبود",
    ],
    deliverables: ["زمان‌بندی ممیزی", "چک‌لیست آمادگی", "جمع‌بندی موارد اصلاحی"],
    duration: "طبق زمان‌بندی توافقی",
    audience: "واحدهای تولیدی، بیمارستان‌ها و مراکز خدماتی",
    tags: ["ممیزی", "قرارداد", "ایمنی"],
  },
  other: {
    icon: "chat",
    gradient: "from-slate-500 via-slate-600 to-brand-600",
    accent: "text-slate-700 bg-slate-100 dark:bg-white/10 dark:text-slate-200",
    emoji: "✉️",
    highlights: [
      "ارسال پرسش موردی و درخواست‌های خاص",
      "پیوست اختیاری مدارک مرتبط",
      "پاسخ کارشناس از کانال انتخابی شما",
      "پیگیری پاسخ با کد اختصاصی",
    ],
    deliverables: ["ثبت موضوع درخواست", "پاسخ کارشناس", "پیگیری با کد اختصاصی"],
    duration: "۱ تا ۲ روز کاری",
    audience: "همه متقاضیان و واحدهای صنفی",
    tags: ["پرسش", "مشاوره"],
  },
};

export const DEMO_NOTICE =
  "این نسخه یک نمونهٔ کاملاً کاربردی است: داده‌ها در مرورگر شما ذخیره می‌شوند و هیچ اطلاعاتی به سرور ارسال نمی‌شود.";
