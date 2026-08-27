import {
  ChatMessage,
  HowItWorksStep,
  IndustryUseCase,
  PricingPlan,
  ProductItem,
  TestimonialItem,
  Language,
} from '../types';

export const TRILINGUAL_HERO_DEMO: Record<
  Language,
  { question: string; answer: string; confidence: string; intent: string }
> = {
  en: {
    question: 'What are your delivery times for Kandy, Galle, and Jaffna?',
    answer:
      'We deliver islandwide within 24–48 hours! Orders placed before 11:00 AM are dispatched on the same day via prompt local courier with Cash on Delivery (COD) and card payments supported.',
    confidence: '99.8%',
    intent: 'Delivery & Islandwide Logistics',
  },
  si: {
    question: 'කොළඹින් පිට ප්‍රදේශවලට Cash on Delivery (COD) මඟින් භාණ්ඩ ලබාගත හැකිද?',
    answer:
      'ඔව්, අප ආයතනය මුළු දිවයින පුරාම දින 1-2ක් තුළ COD (භාණ්ඩ ලැබුණු පසු මුදල් ගෙවීම) පහසුකම සහිතව ආරක්ෂිතව භාණ්ඩ බෙදාහරිනු ලබයි. රු. 5,000ට වැඩි ඇණවුම් සඳහා බෙදාහැරීම නොමිලේ!',
    confidence: '99.4%',
    intent: 'ගෙවීම් ක්‍රම සහ බෙදාහැරීම්',
  },
  ta: {
    question: 'கொழும்புக்கு வெளியே உள்ள இடங்களுக்கு டெலிவரி நேரம் மற்றும் கட்டணம் என்ன?',
    answer:
      'நாங்கள் இலங்கை முழுவதும் 1–2 நாட்களில் துரிதமாக விநியோகிக்கிறோம். Cash on Delivery (COD), Koko தவணை முறை மற்றும் கார்ட் மூலம் பணம் செலுத்தலாம். ரூ. 5,000க்கு மேல் இலவச டெலிவரி!',
    confidence: '99.6%',
    intent: 'விநியோக கட்டணம் மற்றும் முறை',
  },
};

export const TRUSTED_LOGOS = [
  { name: 'Cinnamon Grand', category: 'Resorts' },
  { name: 'Dilmah Ceylon', category: 'Export' },
  { name: 'Singer Logistics', category: 'Supply Chain' },
  { name: 'Fashion Bug LK', category: 'E-commerce' },
  { name: 'Asiri Hospital', category: 'Healthcare' },
  { name: 'Apex Institute', category: 'Education' },
];

export const PRODUCTS_LIST: ProductItem[] = [
  {
    id: 'support-ai',
    title: 'Ceyra Assist',
    tagline: 'Autonomous trilingual website & WhatsApp support agent.',
    description:
      'The flagship conversational AI platform that indexes your website catalog, PDFs, and business spreadsheets to resolve customer inquiries 24/7 in Sinhala, Tamil, and English with zero hallucination.',
    status: 'active',
    features: [
      'Native Sinhala, Tamil & English trilingual understanding',
      'Auto-sync with live Shopify catalogs & WordPress menus',
      'Instant human escalation to WhatsApp with full context',
      'Ultra-lightweight embed script with zero Google Lighthouse impact',
    ],
  },
  {
    id: 'voice-ai',
    title: 'Ceyra Voice',
    tagline: 'Inbound & outbound Sinhala & Tamil voice agents for telephone bookings and automated reminders.',
    description:
      'Natural phonetic voice agents tailored to Sri Lankan accents and languages for phone-based customer service.',
    status: 'coming_soon',
    features: [
      'Sub-500ms voice response latency',
      'Local telecom SIP & GSM line integration',
    ],
  },
  {
    id: 'crm-ai',
    title: 'Ceyra CRM',
    tagline: 'Unified customer intelligence converting raw chat streams into high-converting sales pipelines.',
    description:
      'Automatically captures, tags, scores, and updates customer purchase intent across WhatsApp and website conversations.',
    status: 'coming_soon',
    features: [
      'Automated high-intent lead qualification',
      'Unified omnichannel customer history',
    ],
  },
  {
    id: 'automations-ai',
    title: 'Ceyra Automations',
    tagline: 'Connect customer chat intents to LankaPay, local courier dispatches, and inventory systems.',
    description:
      'Trigger custom workflows, dispatch tracking numbers, and process payment links automatically from conversation intents.',
    status: 'coming_soon',
    features: [
      'Instant LankaPay & local payment gateway webhooks',
      'Automated courier consignment generation',
    ],
  },
];

export const CHAT_DEMO_SCRIPT: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    text: 'Do you have the Ceylon Spiced Cinnamon in 250g tins in stock?',
    timestamp: '10:42 AM',
    lang: 'en',
  },
  {
    id: 'msg-2',
    sender: 'bot',
    text: 'Yes! We have 42 units of Ceylon Spiced Cinnamon 250g currently in stock at LKR 2,450 each. Orders placed now dispatch today for tomorrow delivery in Colombo.',
    timestamp: '10:42 AM',
    lang: 'en',
    intent: 'Product Availability',
    confidence: 99.8,
  },
  {
    id: 'msg-3',
    sender: 'user',
    text: 'මහනුවරට ඩිලිවරි කරන්න කීයක් යනවද? Cash on delivery තියෙනවද?',
    timestamp: '10:43 AM',
    lang: 'si',
  },
  {
    id: 'msg-4',
    sender: 'bot',
    text: 'මහනුවර සඳහා බෙදාහැරීම් ගාස්තුව රු. 350 කි (දින 2ක් ඇතුළත). ඔව්, Cash on Delivery (COD) පහසුකම ඇත. රු. 5,000ට වැඩි ඇණවුම් සඳහා බෙදාහැරීම නොමිලේ!',
    timestamp: '10:43 AM',
    lang: 'si',
    intent: 'Delivery Pricing & COD',
    confidence: 99.4,
  },
  {
    id: 'msg-5',
    sender: 'user',
    text: 'யாழ்ப்பாணத்திற்கு டெலிவரி எத்தனை நாட்களில் கிடைக்கும்?',
    timestamp: '10:44 AM',
    lang: 'ta',
  },
  {
    id: 'msg-6',
    sender: 'bot',
    text: 'யாழ்ப்பாணத்திற்கு 2–3 வணிக நாட்களில் உங்கள் இல்லத்திற்கே பாதுகாப்பாக வந்து சேரும். தபால் அல்லது கூரியர் மூலம் டிராக்கிங் எண் வழங்கப்படும்.',
    timestamp: '10:44 AM',
    lang: 'ta',
    intent: 'Regional Shipping Time',
    confidence: 99.5,
  },
];

export const CAPABILITIES_LIST = [
  {
    id: 'training',
    title: 'Website & FAQ Training',
    desc: 'Ceyra crawls your online store, knowledge base, PDF catalogs, and Google Sheets to absorb exact product specs, prices, and policies.',
  },
  {
    id: 'nlp',
    title: 'Sinhala, Tamil & English Native',
    desc: 'Handles colloquial nuances, polite local honorifics, and Singlish/Tanglish queries with conversational fluency.',
  },
  {
    id: 'handover',
    title: 'Intelligent Human Handover',
    desc: 'Escalates VIP questions, disputes, or custom order requests directly to your human support agents on WhatsApp or web inbox.',
  },
  {
    id: 'inbox',
    title: 'Unified Conversation Inbox',
    desc: 'Filter conversations by sentiment, language, or resolution status. Inspect chat histories and jump into active sessions anytime.',
  },
  {
    id: 'branding',
    title: 'Brand Customization',
    desc: 'Tailor primary accent colors, widget launcher icons, welcome greeting messages, and bot avatar to seamlessly blend into your company website.',
  },
  {
    id: 'embed',
    title: 'Simple Website Embed',
    desc: 'One asynchronous script tag. Compatible with Shopify, WooCommerce, WordPress, Wix, Squarespace, Webflow, and custom codebases.',
  },
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: '01',
    badge: 'Instant Ingestion',
    title: 'Connect Business Data',
    subtitle: 'Feed URLs, PDFs, and Spreadsheets',
    description:
      'Enter your website address, upload product catalogs, pricing PDFs, or policy spreadsheets. Ceyra automatically reads and vectorizes your business intelligence in minutes.',
    metrics: 'Vectorized in < 90 seconds',
    icon: 'DatabaseZap',
  },
  {
    step: '02',
    badge: 'Persona Tuning',
    title: 'Configure Tone & Rules',
    subtitle: 'Customize Languages & Human Routing',
    description:
      'Choose your preferred tone of voice (friendly, formal, warm), select primary languages (Sinhala, Tamil, English), and define your WhatsApp handover trigger number.',
    metrics: 'Sri Lanka warm business tone',
    icon: 'SlidersHorizontal',
  },
  {
    step: '03',
    badge: 'Deploy Live',
    title: 'Embed 1-Line Widget',
    subtitle: 'Shopify, WordPress, Webflow, React',
    description:
      'Paste a single lightweight script tag into your website. Your AI assistant immediately starts answering customer queries 24/7 with zero lag or upkeep.',
    metrics: '< 22KB asynchronous bundle',
    icon: 'Code2',
  },
];

export const INDUSTRY_USE_CASES: IndustryUseCase[] = [
  {
    id: 'hospitality',
    title: 'Travel & Hospitality',
    tag: 'Boutique Villas, Resorts & Tour Operators',
    icon: 'Palmtree',
    summary:
      'Answer international and local guest inquiries 24/7 regarding room rates, airport pickup, safari excursions, and dining menus in their native language.',
    keyMetric: '+42% Direct Bookings',
    metricLabel: 'Reduction in third-party OTA commission dependency',
    sampleQuestion: {
      en: 'What is included in the Mirissa Whale Watching excursion and sunset villa package?',
      si: 'මිරිස්සේ තල්මසුන් නැරඹීමේ පැකේජය සහ හෝටල් කාමර ගාස්තු පිළිබඳ විස්තර දැනගත හැකිද?',
      ta: 'மிரிஸ்ஸ திமிங்கல பார்வை மற்றும் இரவு தங்குமிட கட்டண விபரங்கள் என்ன?',
    },
    sampleAnswer: {
      en: 'Our Ocean Suite package includes breakfast, airport transfers, and private boat charter for LKR 48,000/night. Would you like to reserve dates?',
      si: 'Ocean Suite පැකේජයට උදෑසන ආහාරය, ප්‍රවාහන පහසුකම් සහ බෝට්ටු චාරිකාව ඇතුළත් වේ (දිනකට රු. 48,000). වෙන්කරවා ගැනීමට සහය වන්නද?',
      ta: 'எங்கள் Ocean Suite தொகுப்பில் காலை உணவு, போக்குவரத்து மற்றும் படகு சவாரி அடங்கும் (இரவுக்கு ரூ. 48,000). முன்பதிவு செய்யவா?',
    },
  },
  {
    id: 'ecommerce',
    title: 'E-commerce & Retail',
    tag: 'Clothing Brands, Electronics & Specialty Goods',
    icon: 'ShoppingBag',
    summary:
      'Instantly answer product sizing queries, check real-time stock levels, provide islandwide delivery estimates, and process Cash on Delivery (COD) inquiries.',
    keyMetric: '88% First-Contact Resolution',
    metricLabel: 'Zero unanswered inquiries during late-night shopping hours',
    sampleQuestion: {
      en: 'Is the Linen Shirt in Olive Green size L available with islandwide COD?',
      si: 'ඔලිව් කොළ පැහැති Linen Shirt (Size L) තොග තිබේද? COD මඟින් ලබාගත හැකිද?',
      ta: 'ஒலிவ் பச்சை லினன் சட்டை (Size L) கையிருப்பில் உள்ளதா? COD வசதி உண்டா?',
    },
    sampleAnswer: {
      en: 'Yes, we have 6 units in Olive Green (Size L). Cash on Delivery is available islandwide with 2-day delivery!',
      si: 'ඔව්, ඔලිව් කොළ පැහැති Linen Shirt (Size L) තොග තිබේ. දිවයින පුරා දින 2ක් තුළ COD මඟින් ලබාගත හැක.',
      ta: 'ஆம், 6 சட்டைகள் கையிருப்பில் உள்ளன. இலங்கை முழுவதும் 2 நாட்களில் COD வசதியுடன் பெற்றுக்கொள்ளலாம்!',
    },
  },
  {
    id: 'healthcare',
    title: 'Clinics & Healthcare',
    tag: 'Dental Practices, Diagnostic Labs & Wellness Centers',
    icon: 'Stethoscope',
    summary:
      'Assist patients with doctor appointment scheduling, test preparation guidelines, clinic hours, and location directions with clinical care.',
    keyMetric: '< 1.1s Response Time',
    metricLabel: 'Eliminating telephone wait times for anxious patients',
    sampleQuestion: {
      en: 'What are the fasting guidelines for a lipid profile blood test tomorrow morning?',
      si: 'හෙට උදෑසන සිදුකරන රුධිර පරීක්ෂාව සඳහා ආහාර නොගෙන සිටිය යුතු කාලය කොපමණද?',
      ta: 'நாளை காலை செய்யப்படும் இரத்த பரிசோதனைக்கு எத்தனை மணி நேரம் சாப்பிடாமல் இருக்க வேண்டும்?',
    },
    sampleAnswer: {
      en: 'Please fast for 10–12 hours prior to the test. Plain water is permitted. Our lab opens at 6:30 AM in Colombo 05.',
      si: 'කරුණාකර පරීක්ෂාවට පෙර පැය 10-12ක් ආහාර ගැනීමෙන් වළකින්න. ජලය පානය කළ හැක. අපගේ රසායනාගාරය උදෑසන 6:30ට විවෘත වේ.',
      ta: 'தயவுசெய்து பரிசோதனைக்கு 10-12 மணி நேரம் முன்னதாக உணவு உட்கொள்ள வேண்டாம். தண்ணீர் அருந்தலாம். காலை 6:30க்கு திறக்கப்படும்.',
    },
  },
  {
    id: 'education',
    title: 'Tuition & Institutes',
    tag: 'Higher Education, Professional Certifications & Academies',
    icon: 'GraduationCap',
    summary:
      'Guide students and parents through course curriculums, intake deadlines, fee installment plans, and lecturer profiles 24/7.',
    keyMetric: '3.4x Student Enrollments',
    metricLabel: 'Capturing prospective student leads across WhatsApp & web',
    sampleQuestion: {
      en: 'What are the entry qualifications and weekend timetable for the AI Diploma intake?',
      si: 'AI ඩිප්ලෝමා පාඨමාලාවට ඇතුළත්වීමේ සුදුසුකම් සහ සති අන්ත දේශන වේලාවන් මොනවාද?',
      ta: 'AI டிப்ளோமா படிப்பிற்கான தகுதிகள் மற்றும் வார இறுதி வகுப்பு நேரங்கள் என்ன?',
    },
    sampleAnswer: {
      en: 'Applicants require G.C.E. A/L or relevant ICT foundations. Classes are held Sundays 9:00 AM – 4:00 PM with flexible payment installments.',
      si: 'අ.පො.ස. උසස් පෙළ හෝ මූලික ICT දැනුම අවශ්‍ය වේ. දේශන ඉරිදා පෙ.ව. 9:00 සිට ප.ව. 4:00 දක්වා පැවැත්වේ.',
      ta: 'க.பொ.த உயர்தரம் அல்லது அடிப்படை ICT அறிவு தேவை. வகுப்புகள் ஞாயிறு காலை 9:00 முதல் மாலை 4:00 வரை நடைபெறும்.',
    },
  },
  {
    id: 'services',
    title: 'Local Enterprises & Legal',
    tag: 'Accounting, Real Estate & Corporate Services',
    icon: 'Store',
    summary:
      'Qualify high-value client inquiries, gather initial project requirements, and schedule consultations automatically.',
    keyMetric: '100% Lead Qualification',
    metricLabel: 'Structured client briefs delivered directly to partner inboxes',
    sampleQuestion: {
      en: 'How can we register a private limited company in Sri Lanka with foreign shareholders?',
      si: 'ශ්‍රී ලංකාවේ පුද්ගලික සමාගමක් ලියාපදිංචි කිරීමේ ක්‍රමවේදය කුමක්ද?',
      ta: 'இலங்கையில் ஒரு தனியார் நிறுவனத்தை பதிவு செய்வதற்கான நடைமுறைகள் என்ன?',
    },
    sampleAnswer: {
      en: 'We handle e-ROC name approval, Form 1/18/19 documentation, and TIN registration within 4–5 working days. Would you like our corporate checklist?',
      si: 'අපි e-ROC නාම අනුමැතිය, ආකෘති පත්‍ර සහ TIN ලියාපදිංචිය දින 4-5ක් තුළ සම්පූර්ණ කරමු. උපදෙස් පත්‍රිකාවක් ලබාගැනීමට අවශ්‍යද?',
      ta: 'நாங்கள் e-ROC பெயர் அனுமதி மற்றும் பதிவு ஆவணங்களை 4-5 வேலை நாட்களில் செய்து தருகிறோம். விபரங்களை மின்னஞ்சல் செய்யவா?',
    },
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    badge: 'Free Forever',
    tagline: 'Ideal for testing trilingual AI on small websites and personal shops.',
    priceLKRMonthly: 0,
    priceLKRAnnual: 0,
    priceUSDMonthly: 0,
    priceUSDAnnual: 0,
    limits: {
      conversations: '100 / month',
      languages: 'Sinhala + Tamil + English',
      sources: 'Up to 2 URLs or PDFs',
    },
    features: [
      '100 resolved conversations / mo',
      'Native Trilingual NLP (EN / SI / TA)',
      '1 Website or PDF data source',
      'Standard website embed widget',
      'Community support',
    ],
    ctaText: 'Start for free',
  },
  {
    id: 'pro',
    name: 'Pro Business',
    badge: 'Most Popular',
    tagline: 'Engineered for growing e-commerce brands, hotels, and active stores.',
    priceLKRMonthly: 12500,
    priceLKRAnnual: 10000,
    priceUSDMonthly: 39,
    priceUSDAnnual: 31,
    highlight: true,
    limits: {
      conversations: '2,500 / month',
      languages: 'Full Trilingual + Dialects',
      sources: 'Unlimited URLs + 25 PDFs',
    },
    features: [
      '2,500 resolved conversations / mo',
      'Full Trilingual + Singlish / Tanglish NLP',
      'Unlimited website pages & 25 PDFs',
      'Intelligent WhatsApp human handover',
      'Full Brand Customization & White-labeling',
      'Conversation Analytics & CSV exports',
      'Priority Colombo WhatsApp support',
    ],
    ctaText: 'Deploy Pro Assistant',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: 'Dedicated SLA',
    tagline: 'For high-volume enterprises requiring custom integrations and private cloud.',
    priceLKRMonthly: 45000,
    priceLKRAnnual: 36000,
    priceUSDMonthly: 149,
    priceUSDAnnual: 119,
    limits: {
      conversations: '15,000+ / month',
      languages: 'Custom Vocabularies',
      sources: 'Real-time ERP / DB Sync',
    },
    features: [
      '15,000+ resolved conversations / mo',
      'Custom ERP, SQL & Inventory Sync',
      'Dedicated Sri Lanka local cloud instance',
      'Voice AI & Phone agent beta access',
      'Custom SLAs (99.99% uptime guarantee)',
      'Dedicated Account Manager in Colombo',
    ],
    ctaText: 'Contact Enterprise Team',
  },
];

export const TESTIMONIALS_LIST: TestimonialItem[] = [
  {
    id: 't-1',
    quote:
      'Before Ceyra Assist, our villa reservations team was overwhelmed with late-night inquiries in Sinhala and English. Now, 80% of booking questions are resolved in under 2 seconds, and our direct bookings jumped by 35%.',
    author: 'Dulantha Senanayake',
    role: 'Managing Director',
    company: 'Southern Coast Heritage Villas',
    city: 'Galle, Sri Lanka',
    rating: 5,
    avatarColor: 'bg-violet-600',
  },
  {
    id: 't-2',
    quote:
      'Our e-commerce store gets thousands of messages asking for Cash on Delivery and size availability. Ceyra Assist answers in fluent Sinhala and Tamil, which our customers adore. Setup took literally 10 minutes.',
    author: 'Nimalka Perera',
    role: 'Head of Growth',
    company: 'Lanka Apparel Hub',
    city: 'Colombo 03',
    rating: 5,
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 't-3',
    quote:
      'We automated student intake inquiries across our 4 branches. Parents love getting immediate answers in Tamil or Sinhala even on Sundays. Ceyra Assist has easily saved our team 20+ hours every week.',
    author: 'K. Sivakumaran',
    role: 'Director of Admissions',
    company: 'Apex Higher Education Academy',
    city: 'Kandy, Sri Lanka',
    rating: 5,
    avatarColor: 'bg-emerald-600',
  },
];
