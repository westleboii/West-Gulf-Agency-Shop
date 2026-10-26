import { type CatalogProduct, type UaeEmirate } from '../utils/shopLogic';

export interface UaeDropshipSupplier {
  id: string;
  name: string;
  website: string;
  headquarters: string;
  deliveryUae: string;
  codAvailable: boolean;
  categoriesCovered: string[];
  descriptionEn: string;
  descriptionAr: string;
  connected: boolean;
  autoSyncInventory: boolean;
  sampleFeedUrl: string;
}

export interface CustomerOrderRecord {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  emirate: UaeEmirate;
  shippingAddress: string;
  paymentMethod: 'PayTabs' | 'Telr' | 'ApplePay' | 'COD' | 'IntlCard';
  totalAed: number;
  itemSummary: string;
  itemCount: number;
  status:
    | 'pending_approval'
    | 'approved_processing'
    | 'dispatched_uae_hub'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  trackingCode: string;
  pointsEarned: number;
  createdAtIso: string;
}

export interface ProductReviewRecord {
  id: string;
  productId: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAtIso: string;
}

export interface SavedUaeAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  emirate: UaeEmirate;
  area: string;
  streetBuilding: string;
  isDefault: boolean;
}

export const INITIAL_CATALOG_PRODUCTS: CatalogProduct[] = [
  // 1. HIGH-END SEASONAL FASHION (Men, Women, Children)
  {
    id: 'prod-fashion-men-blazer',
    titleEn: 'Al-Bateen Desert Silk & Cashmere Men’s Seasonal Blazer',
    titleAr: 'بليزر رجالي موسمي فاخر من الحرير والكشمير - البطين',
    descriptionEn:
      'Unstructured double-vented seasonal blazer tailored from Italian mulberry silk and Mongolian cashmere. Breathable weave engineered for Dubai & Abu Dhabi evening receptions.',
    descriptionAr:
      'بليزر موسمي فاخر مصنوع من الحرير الإيطالي والكشمير المنغولي بتصميم عصري يناسب أمسيات دبي وأبوظبي.',
    category: 'fashion',
    subCategory: 'Men’s Luxury',
    priceAed: 1850,
    compareAtPriceAed: 2300,
    rating: 4.9,
    reviewCount: 42,
    supplierName: 'Waliqsa Luxury Apparel Hub (Dubai)',
    supplierUrl: 'https://waliqsa.com/uae-luxury-menswear',
    deliveryDaysUae: 'Same-Day Dubai · 24h UAE',
    codSupported: true,
    inStock: true,
    status: 'active',
    visualArchetype: 'fashion-mens',
    specs: ['65% Mulberry Silk, 35% Fine Cashmere', 'Sand Dune & Midnight Obsidian Shades', 'Complimentary Garment Bag'],
    badge: 'Seasonal Drop',
  },
  {
    id: 'prod-fashion-women-kaftan',
    titleEn: 'Jumeirah Couture Pleated Organza & Silk Abaya Kaftan Set',
    titleAr: 'طقم عباية وقفطان كوتور من الأورجانزا والحرير - جميرا',
    descriptionEn:
      'Hand-pleated silk organza couture kaftan and inner slip set with brushed gold thread embroidery along the cuffs. Designed for seasonal galas and resort dining.',
    descriptionAr:
      'طقم عباية وقفطان فاخر من الحرير والأورجانزا المطرزة بخيوط ذهبية ناعمة لإطلالة ملكية.',
    category: 'fashion',
    subCategory: 'Women’s Couture',
    priceAed: 2450,
    compareAtPriceAed: 2950,
    rating: 5.0,
    reviewCount: 67,
    supplierName: 'Waliqsa Luxury Apparel Hub (Dubai)',
    supplierUrl: 'https://waliqsa.com/uae-womens-couture',
    deliveryDaysUae: 'Same-Day Dubai · 24h UAE',
    codSupported: true,
    inStock: true,
    status: 'active',
    visualArchetype: 'fashion-womens',
    specs: ['100% Pure Crepe Silk & Organza', 'Hand-Finished Gold Thread Trim', 'Includes Matching Sheila'],
    badge: 'Best Seller',
  },
  {
    id: 'prod-fashion-kids-ensemble',
    titleEn: 'Royal Oasis Children’s Seasonal Organic Linen & Velvet Set',
    titleAr: 'طقم أطفال موسمي ملكي من الكتان العضوي والمخمل',
    descriptionEn:
      'Hypoallergenic organic Belgian linen and soft pearl velvet seasonal ceremonial outfit for boys and girls (ages 2–12), featuring mother-of-pearl buttons.',
    descriptionAr:
      'طقم أطفال موسمي أنيق من الكتان البلجيكي العضوي والمخمل الناعم مع أزرار من عرق اللؤلؤ (للأعمار 2–12 سنة).',
    category: 'fashion',
    subCategory: 'Children’s Collection',
    priceAed: 680,
    compareAtPriceAed: 850,
    rating: 4.8,
    reviewCount: 29,
    supplierName: 'Zambeel GCC Boutique Network',
    supplierUrl: 'https://zambeel.com/kids-seasonal',
    deliveryDaysUae: '1–2 Days (All 7 Emirates)',
    codSupported: true,
    inStock: true,
    status: 'active',
    visualArchetype: 'fashion-kids',
    specs: ['OEKO-TEX Certified Organic Linen', 'Ages 2–12 Sizing Available', 'Breathable Gulf Climate Lining'],
    badge: 'Limited Run',
  },

  // 2. ELECTRONICS & MOBILITY (E-Bikes, Golf Carts, Phones, Chargers, High-Selling Tech)
  {
    id: 'prod-elec-ebike-falcon',
    titleEn: 'Falcon Carbon Pro 1000W All-Terrain Desert & Marina E-Bike',
    titleAr: 'دراجة كهربائية فالكون كربون برو 1000 واط لجميع التضاريس',
    descriptionEn:
      'Monocoque T800 carbon-fiber frame electric bike with 1000W Bafang mid-drive motor, Samsung 48V 20Ah removable lithium battery (120km range), hydraulic disc brakes, and full color cockpit.',
    descriptionAr:
      'دراجة كهربائية بهيكل كربون متطور ومحرك 1000 واط وبطارية سامسونج ليثيوم بمدى 120 كم ومكابح هيدروليكية.',
    category: 'electronics',
    subCategory: 'E-Bikes & Mobility',
    priceAed: 8900,
    compareAtPriceAed: 10500,
    rating: 4.9,
    reviewCount: 84,
    supplierName: 'Shorages Dubai Mobility Warehouse',
    supplierUrl: 'https://shorages.com/uae-mobility/falcon-ebike',
    deliveryDaysUae: '1–2 Days White-Glove UAE',
    codSupported: true,
    inStock: true,
    status: 'active',
    visualArchetype: 'ebike',
    specs: ['1000W Brushless Motor · 120km Range', 'T800 Carbon Frame · Hydraulic Brakes', 'RTA & UAE Safety Compliant'],
    badge: 'Top Seller',
  },
  {
    id: 'prod-elec-golfcart-emirates',
    titleEn: 'Emirates Hills 4-Seater Lithium Lifted Luxury Electric Golf Cart',
    titleAr: 'عربة جولف كهربائية فاخرة 4 مقاعد ببطارية ليثيوم - تلال الإمارات',
    descriptionEn:
      'Street-ready estate and resort 4-seater electric golf cruiser featuring diamond-stitched marine leather seats, 10.1" Apple CarPlay touchscreen, soundbar, and 105Ah LiFePO4 battery.',
    descriptionAr:
      'عربة جولف كهربائية فاخرة بـ 4 مقاعد جلدية وشاشة لمس 10.1 بوصة تدعم CarPlay وبطارية ليثيوم طويلة العمر.',
    category: 'electronics',
    subCategory: 'Golf Carts & Cruisers',
    priceAed: 34500,
    compareAtPriceAed: 39000,
    rating: 5.0,
    reviewCount: 19,
    supplierName: 'Shorages Dubai Mobility Warehouse',
    supplierUrl: 'https://shorages.com/uae-mobility/luxury-golf-cart',
    deliveryDaysUae: '2–3 Days Flatbed UAE Delivery',
    codSupported: false,
    inStock: true,
    status: 'active',
    visualArchetype: 'golfcart',
    specs: ['72V LiFePO4 Fast-Charge System', '10.1" CarPlay Display & LED Roof', 'Free Villa Delivery Across UAE'],
    badge: 'Villa Edition',
  },
  {
    id: 'prod-elec-phone-titanium',
    titleEn: 'Apex Horizon Ultra 5G Titanium Flagship Smartphone (1TB, Dual eSIM)',
    titleAr: 'هاتف أبيكس هورايزن ألترا 5G تيتانيوم (1 تيرابايت - نسخة الإمارات)',
    descriptionEn:
      'TRA-certified UAE flagship smartphone crafted in Grade-5 aerospace titanium with 200MP periscope telephoto optics, satellite SOS, and 120Hz LTPO AMOLED sapphire glass.',
    descriptionAr:
      'هاتف ذكي رائد معتمد في الإمارات بهيكل تيتانيوم وكاميرا 200 ميجابكسل وشاشة 120 هرتز فائقة الوضوح.',
    category: 'electronics',
    subCategory: 'Phones & Chargers',
    priceAed: 4299,
    compareAtPriceAed: 4699,
    rating: 4.9,
    reviewCount: 112,
    supplierName: 'COD Dropshipping UAE Tech Hub',
    supplierUrl: 'https://coddropshipping.com/uae-electronics/apex-phone',
    deliveryDaysUae: 'Same-Day Dubai · 24h UAE',
    codSupported: true,
    inStock: true,
    status: 'active',
    visualArchetype: 'smartphone',
    specs: ['1TB NVMe Storage · 16GB RAM', 'UAE TRA Official Warranty', 'Includes 120W UK/UAE 3-Pin Adapter'],
    badge: 'High Velocity',
  },
  {
    id: 'prod-elec-charger-gan',
    titleEn: 'HyperVolt 240W GaN 6-Port Desktop & MagSafe Solid Brass Charging Hub',
    titleAr: 'منصة شحن فائقة السرعة 240 واط GaN بـ 6 منافذ وشحن لاسلكي مغناطيسي',
    descriptionEn:
      'Simultaneously fast-charge two MacBook Pros, iPhone, iPad, and Apple Watch with real-time OLED wattage telemetry and UK/UAE Type-G surge protection.',
    descriptionAr:
      'اشحن جهازين لابتوب وهاتفك وساعتك في وقت واحد بقدرة 240 واط مع شاشة OLED لعرض الطاقة ومقبس إماراتي.',
    category: 'electronics',
    subCategory: 'Phones & Chargers',
    priceAed: 440,
    compareAtPriceAed: 550,
    rating: 4.8,
    reviewCount: 95,
    supplierName: 'COD Dropshipping UAE Tech Hub',
    supplierUrl: 'https://coddropshipping.com/uae-electronics/gan-240w',
    deliveryDaysUae: '1–2 Days (All 7 Emirates)',
    codSupported: true,
    inStock: true,
    status: 'active',
    visualArchetype: 'charger',
    specs: ['240W Total GaN-III Output', 'Qi2 15W Cryo-Cooled MagSafe Pad', 'UAE Type-G Power Cord Included'],
  },

  // 3. HOUSEHOLD & WELLNESS CONSUMER GOODS (Portable Saunas, Shower Heads)
  {
    id: 'prod-wellness-sauna-zenith',
    titleEn: 'Zenith Full-Spectrum Red Light & Far-Infrared Cedar Portable Home Sauna',
    titleAr: 'ساونا منزلية متنقلة بالأشعة تحت الحمراء والضوء الأحمر - زينيث',
    descriptionEn:
      'Architectural fold-away & cabin-grade Canadian red cedar infrared home sauna with ultra-low EMF carbon panels, 660nm red-light therapy bar, and Bluetooth acoustic speakers.',
    descriptionAr:
      'ساونا منزلية متنقلة من خشب الأرز الكندي بالأشعة تحت الحمراء والعلاج بالضوء الأحمر مع سماعات بلوتوث.',
    category: 'wellness',
    subCategory: 'Portable Saunas',
    priceAed: 4850,
    compareAtPriceAed: 5900,
    rating: 4.9,
    reviewCount: 53,
    supplierName: 'CJ Dropshipping UAE Direct Line',
    supplierUrl: 'https://cjdropshipping.com/uae-warehouse/zenith-sauna',
    deliveryDaysUae: '2–3 Days (All 7 Emirates)',
    codSupported: true,
    inStock: true,
    status: 'active',
    visualArchetype: 'sauna',
    specs: ['65°C Rapid Warmup in 12 Mins', 'Ultra-Low EMF Carbon Heaters', 'Standard 220V UAE Plug-and-Play'],
    badge: 'Spa Grade',
  },
  {
    id: 'prod-wellness-shower-oasis',
    titleEn: 'Oasis Brushed Gold Vitamin-C & Desalinated Water Filter Spa Shower Head',
    titleAr: 'رأس دش سبا بفلتر فيتامين سي وتنقية المياه باللون الذهبي المطفي',
    descriptionEn:
      'Engineered specifically for Gulf desalinated water: removes 99% of chlorine and heavy minerals while infusing Vitamin-C & argan oil micro-mist at 2.5x water pressure.',
    descriptionAr:
      'مصمم خصيصاً لمياه الخليج لإزالة الكلور والأملاح بنسبة 99% مع كبسولة فيتامين سي وضغط مياه مضاعف.',
    category: 'wellness',
    subCategory: 'Shower Systems',
    priceAed: 790,
    compareAtPriceAed: 980,
    rating: 4.9,
    reviewCount: 148,
    supplierName: 'Waliqsa Home & Wellness UAE',
    supplierUrl: 'https://waliqsa.com/uae-home/oasis-shower-head',
    deliveryDaysUae: 'Same-Day Dubai · 24h UAE',
    codSupported: true,
    inStock: true,
    status: 'active',
    visualArchetype: 'showerhead',
    specs: ['15-Stage Mineral & Chlorine Filtration', '316 Marine Stainless Steel & Brass', 'Includes 3 Vitamin-C Aroma Cartridges'],
    badge: 'UAE Essential',
  },

  // 4. KITCHEN & LIVING CONSUMER GOODS (Whipped Cream Dispensers, Chairs & Sofas)
  {
    id: 'prod-kitchen-whip-crema',
    titleEn: 'ChefCrema Pro 1L Brushed Titanium & Brass Culinary Whipped Cream Dispenser',
    titleAr: 'موزع وصانع الكريمة الاحترافي للمطبخ 1 لتر من الفولاذ والنحاس',
    descriptionEn:
      'Commercial Michelin-grade 1-liter culinary whipped cream, cold-brew nitro foam, and saffron mousse dispenser with 3 stainless decorator nozzles and thermal insulation.',
    descriptionAr:
      'صانع وموزع الكريمة المخفوقة والرغوة الاحترافي بسعة 1 لتر مع 3 رؤوس تزيين من الفولاذ المقاوم للصدأ.',
    category: 'kitchen',
    subCategory: 'Kitchen Consumer Goods',
    priceAed: 360,
    compareAtPriceAed: 460,
    rating: 4.8,
    reviewCount: 76,
    supplierName: 'COD Dropshipping UAE Kitchen Hub',
    supplierUrl: 'https://coddropshipping.com/uae-kitchen/chefcrema-pro',
    deliveryDaysUae: '1–2 Days (All 7 Emirates)',
    codSupported: true,
    inStock: true,
    status: 'active',
    visualArchetype: 'whipped-cream',
    specs: ['100% Food-Grade 18/8 Stainless Steel', 'Hot & Cold Thermal Double Wall', '3 Sculpted Stainless Tips Included'],
  },
  {
    id: 'prod-kitchen-sofa-majlis',
    titleEn: 'Majlis Cloud Modular Italian Alabaster Bouclé 4-Seater Lounge Sofa',
    titleAr: 'أريكة مجلس كلاود الإيطالية المودولار من قماش البوكليه الفاخر (4 مقاعد)',
    descriptionEn:
      'Deep architectural modular sofa upholstered in spill-repellent Italian alabaster bouclé over kiln-dried solid oak and goose-down memory cushions.',
    descriptionAr:
      'أريكة مودولار فاخرة بـ 4 مقاعد من قماش البوكليه الإيطالي المقاوم للبقع وهيكل من خشب البلوط الطبيعي.',
    category: 'kitchen',
    subCategory: 'Sofas & Chairs',
    priceAed: 7400,
    compareAtPriceAed: 8900,
    rating: 4.9,
    reviewCount: 38,
    supplierName: 'Shorages Dubai Furniture Fulfillment',
    supplierUrl: 'https://shorages.com/uae-furniture/majlis-cloud-sofa',
    deliveryDaysUae: '2–3 Days White-Glove UAE',
    codSupported: true,
    inStock: true,
    status: 'active',
    visualArchetype: 'sofa',
    specs: ['320cm Width · Modular Reconfigurable', 'Nano-Protected Stain-Resistant Bouclé', 'Free In-Room Setup Across UAE'],
    badge: 'Architectural',
  },
  {
    id: 'prod-kitchen-chair-palms',
    titleEn: 'Palms Sculptural American Walnut & Saddle Leather Lounge Accent Chair',
    titleAr: 'كرسي استرخاء بالمز من خشب الجوز الأمريكي والجلد الطبيعي الفاخر',
    descriptionEn:
      'Mid-century meets Gulf modernism: hand-oiled solid American walnut shell paired with full-grain cognac saddle leather cushions and solid brass pivot hardware.',
    descriptionAr:
      'كرسي استرخاء بتصميم معماري من خشب الجوز الأمريكي الطبيعي والجلد الفاخر مع تفاصيل نحاسية.',
    category: 'kitchen',
    subCategory: 'Sofas & Chairs',
    priceAed: 2650,
    compareAtPriceAed: 3200,
    rating: 4.9,
    reviewCount: 44,
    supplierName: 'Shorages Dubai Furniture Fulfillment',
    supplierUrl: 'https://shorages.com/uae-furniture/palms-lounge-chair',
    deliveryDaysUae: '1–3 Days (All 7 Emirates)',
    codSupported: true,
    inStock: true,
    status: 'active',
    visualArchetype: 'chair',
    specs: ['Full-Grain Italian Aniline Leather', 'Solid Bent American Walnut Frame', 'Arrives Fully Assembled'],
  },
];

export const UAE_DROPSHIPPING_SUPPLIERS: UaeDropshipSupplier[] = [
  {
    id: 'sup-waliqsa',
    name: 'Waliqsa Dropship Program (UAE)',
    website: 'https://waliqsa.com',
    headquarters: 'Dubai Silicon Oasis, UAE',
    deliveryUae: '1–2 Days across all 7 Emirates',
    codAvailable: true,
    categoriesCovered: ['High-End Seasonal Fashion', 'Shower Systems & Wellness', 'Home Goods'],
    descriptionEn:
      'UAE-native zero-inventory dropshipping platform with local Dubai warehousing, automated order syncing, and weekly Cash on Delivery (COD) settlements.',
    descriptionAr:
      'منصة دروبشيبينغ إماراتية بمستودعات محلية في دبي وتوصيل خلال يومين مع تحصيل الدفع عند الاستلام.',
    connected: true,
    autoSyncInventory: true,
    sampleFeedUrl: 'https://waliqsa.com/collections/uae-bestsellers',
  },
  {
    id: 'sup-coddropshipping',
    name: 'COD Dropshipping UAE',
    website: 'https://coddropshipping.com',
    headquarters: 'Al Quoz Logistics Park, Dubai, UAE',
    deliveryUae: 'Same-Day Dubai · 24–48h UAE',
    codAvailable: true,
    categoriesCovered: ['Smartphones & GaN Chargers', 'Kitchen Whipped Cream Dispensers', 'Consumer Tech'],
    descriptionEn:
      'Built specifically for GCC & UAE merchants. Holds local high-velocity electronics and kitchen stock in Dubai with full COD collection.',
    descriptionAr:
      'شبكة إمداد محلية في القوز دبي متخصصة في الإلكترونيات ومستلزمات المطبخ مع خدمة الدفع عند الاستلام.',
    connected: true,
    autoSyncInventory: true,
    sampleFeedUrl: 'https://coddropshipping.com/uae-trending-catalog',
  },
  {
    id: 'sup-shorages',
    name: 'Shorages B2B Fulfillment & Dropship',
    website: 'https://shorages.com',
    headquarters: 'Dubai South Free Zone, UAE',
    deliveryUae: '1–3 Days White-Glove & Heavy Freight',
    codAvailable: true,
    categoriesCovered: ['Carbon E-Bikes', 'Luxury Electric Golf Carts', 'Bouclé Sofas & Walnut Chairs'],
    descriptionEn:
      'Dubai-based multichannel B2B warehouse and heavy-item micro-fulfillment partner ideal for electric golf carts, e-bikes, and architectural furniture.',
    descriptionAr:
      'شريك تخزين وشحن B2B في دبي الجنوب متخصص في عربات الجولف والدراجات الكهربائية والأثاث الفاخر.',
    connected: true,
    autoSyncInventory: true,
    sampleFeedUrl: 'https://shorages.com/catalog/mobility-and-living',
  },
  {
    id: 'sup-cjdropshipping',
    name: 'CJ Dropshipping (Middle East Direct Line)',
    website: 'https://cjdropshipping.com',
    headquarters: 'Jebel Ali Hub / International Direct',
    deliveryUae: '3–6 Days UAE Direct Line',
    codAvailable: true,
    categoriesCovered: ['Portable Infrared Saunas', 'Smart Gadgets', 'Children’s Seasonal Apparel'],
    descriptionEn:
      'Global sourcing powerhouse offering dedicated UAE Direct Line air freight and GCC warehouse stocking for high-margin wellness and electronics.',
    descriptionAr:
      'منصة عالمية توفر خط شحن مباشر وسريع إلى الإمارات لمعدات الساونا المنزلية والإلكترونيات الحديثة.',
    connected: true,
    autoSyncInventory: false,
    sampleFeedUrl: 'https://cjdropshipping.com/uae-direct-wellness',
  },
  {
    id: 'sup-zambeel',
    name: 'Zambeel UAE Dropshipping',
    website: 'https://zambeel.com',
    headquarters: 'Business Bay, Dubai, UAE',
    deliveryUae: '1–3 Days UAE Courier',
    codAvailable: true,
    categoriesCovered: ['Men, Women & Kids Apparel', 'Home & Kitchen', 'Lifestyle Accessories'],
    descriptionEn:
      'Gulf-focused dropshipping network enabling instant product linking, custom packaging, and high-approval COD delivery across all Emirates.',
    descriptionAr:
      'شبكة دروبشيبينغ خليجية في الخليج التجاري بدبي تتيح ربط المنتجات الفوري والتغليف المخصص.',
    connected: false,
    autoSyncInventory: false,
    sampleFeedUrl: 'https://zambeel.com/uae-fashion-feed',
  },
];

export const INITIAL_ORDERS: CustomerOrderRecord[] = [
  {
    id: 'ORD-UAE-9041',
    userId: 'demo-user-uae',
    customerName: 'Sheikh Rashid Al-Nuaimi',
    customerEmail: 'rashid.nuaimi@emirates-concierge.ae',
    emirate: 'Dubai',
    shippingAddress: 'Villa 14, Frond K, Palm Jumeirah, Dubai',
    paymentMethod: 'PayTabs',
    totalAed: 9345,
    itemSummary: 'Falcon Carbon Pro 1000W E-Bike (x1)',
    itemCount: 1,
    status: 'out_for_delivery',
    trackingCode: 'EMX-DXB-882910',
    pointsEarned: 1868,
    createdAtIso: '2026-10-25T11:30:00Z',
  },
  {
    id: 'ORD-UAE-9042',
    userId: 'demo-user-uae',
    customerName: 'Amira Al-Hashemi',
    customerEmail: 'amira.h@abudhabi-capital.ae',
    emirate: 'Abu Dhabi',
    shippingAddress: 'Penthouse 3202, Mamsha Al Saadiyat, Saadiyat Island, Abu Dhabi',
    paymentMethod: 'ApplePay',
    totalAed: 3392,
    itemSummary: 'Jumeirah Couture Silk Kaftan Set (x1), Oasis Brushed Gold Shower Head (x1)',
    itemCount: 2,
    status: 'pending_approval',
    trackingCode: 'EMX-AUH-774120',
    pointsEarned: 678,
    createdAtIso: '2026-10-26T04:15:00Z',
  },
  {
    id: 'ORD-UAE-9038',
    userId: 'demo-user-uae',
    customerName: 'Tariq Al-Mansoor',
    customerEmail: 'juniorndime@gmail.com',
    emirate: 'Sharjah',
    shippingAddress: 'Aljada Boulevard Residence Tower 4, Apt 904, Sharjah',
    paymentMethod: 'COD',
    totalAed: 5093,
    itemSummary: 'Zenith Full-Spectrum Red Light Portable Sauna (x1)',
    itemCount: 1,
    status: 'delivered',
    trackingCode: 'EMX-SHJ-661904',
    pointsEarned: 1018,
    createdAtIso: '2026-10-21T09:00:00Z',
  },
];

export const INITIAL_REVIEWS: ProductReviewRecord[] = [
  {
    id: 'rev-101',
    productId: 'prod-elec-ebike-falcon',
    authorId: 'demo-user-1',
    authorName: 'Khalid Al-Maktoum · Dubai Marina',
    rating: 5,
    comment:
      'Delivered to Dubai Marina in 28 hours. The carbon frame is featherlight and the 1000W mid-drive handles Kite Beach and desert tracks effortlessly.',
    status: 'approved',
    createdAtIso: '2026-10-19T14:20:00Z',
  },
  {
    id: 'rev-102',
    productId: 'prod-wellness-shower-oasis',
    authorId: 'demo-user-2',
    authorName: 'Layla Al-Qasimi · Saadiyat Island',
    rating: 5,
    comment:
      'Absolute game changer for UAE desalinated water. Water pressure doubled and the Vitamin-C cartridge completely stopped hair dryness.',
    status: 'approved',
    createdAtIso: '2026-10-20T16:45:00Z',
  },
  {
    id: 'rev-103',
    productId: 'prod-fashion-women-kaftan',
    authorId: 'demo-user-3',
    authorName: 'Noora Al-Suwaidi · Jumeirah 1',
    rating: 5,
    comment:
      'The silk organza drape and gold embroidery look identical to DIFC couture houses at half the price. Arrived in a luxury garment box.',
    status: 'approved',
    createdAtIso: '2026-10-22T18:10:00Z',
  },
  {
    id: 'rev-104',
    productId: 'prod-kitchen-whip-crema',
    authorId: 'demo-user-4',
    authorName: 'Chef Matteo Rossi · DIFC',
    rating: 4,
    comment:
      'Heavy-gauge stainless body holds saffron cold foam chilled for 14 hours in our pastry kitchen. Pending second batch order.',
    status: 'pending',
    createdAtIso: '2026-10-26T05:00:00Z',
  },
];

export const INITIAL_ADDRESSES: SavedUaeAddress[] = [
  {
    id: 'addr-dxb-1',
    label: 'Primary Residence (Dubai)',
    recipientName: 'Tariq Al-Mansoor',
    phone: '+971 50 842 9910',
    emirate: 'Dubai',
    area: 'Downtown Dubai — Burj Crown Boulevard',
    streetBuilding: 'Tower B, Residence 2804',
    isDefault: true,
  },
  {
    id: 'addr-auh-2',
    label: 'Weekend Villa (Abu Dhabi)',
    recipientName: 'Tariq Al-Mansoor',
    phone: '+971 52 319 4402',
    emirate: 'Abu Dhabi',
    area: 'Saadiyat Beach Villas',
    streetBuilding: 'Cluster 3, Villa 19',
    isDefault: false,
  },
];
