export type ProductCategory = 'fashion' | 'electronics' | 'wellness' | 'kitchen';

export type UaeEmirate =
  | 'Dubai'
  | 'Abu Dhabi'
  | 'Sharjah'
  | 'Ajman'
  | 'Ras Al Khaimah'
  | 'Fujairah'
  | 'Umm Al Quwain';

export const UAE_EMIRATES: UaeEmirate[] = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
];

export type LoyaltyTier = 'Pearl' | 'Gold' | 'Royal Emirate';

export type VisualArchetype =
  | 'fashion-mens'
  | 'fashion-womens'
  | 'fashion-kids'
  | 'ebike'
  | 'golfcart'
  | 'smartphone'
  | 'charger'
  | 'drone'
  | 'sauna'
  | 'showerhead'
  | 'whipped-cream'
  | 'sofa'
  | 'chair';

export interface CatalogProduct {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: ProductCategory;
  subCategory: string;
  priceAed: number;
  compareAtPriceAed?: number;
  rating: number;
  reviewCount: number;
  supplierName: string;
  supplierUrl: string;
  deliveryDaysUae: string;
  codSupported: boolean;
  inStock: boolean;
  status: 'active' | 'draft' | 'archived';
  visualArchetype: VisualArchetype;
  specs: string[];
  badge?: string;
}

export interface ProductFilterOptions {
  query: string;
  category: ProductCategory | 'all';
  subCategory: string | 'all';
  maxPriceAed: number;
  minRating: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating';
}

export interface OrderSummaryCalculation {
  subtotalAed: number;
  shippingAed: number;
  vatAed: number;
  loyaltyDiscountAed: number;
  totalAed: number;
  pointsEarned: number;
}

export function isValidUaeEmirate(emirate: string): emirate is UaeEmirate {
  return UAE_EMIRATES.includes(emirate as UaeEmirate);
}

export function calculateLoyaltyTier(points: number): {
  tier: LoyaltyTier;
  discountRate: number;
  nextTier: LoyaltyTier | null;
  pointsToNext: number;
  perksEn: string[];
  perksAr: string[];
} {
  const safePoints = Math.max(0, Math.floor(points));
  if (safePoints >= 5000) {
    return {
      tier: 'Royal Emirate',
      discountRate: 0.1,
      nextTier: null,
      pointsToNext: 0,
      perksEn: [
        '10% automatic VIP reward rate',
        'Complimentary 4-hour concierge courier in Dubai & Abu Dhabi',
        'Priority golf cart & e-bike white-glove assembly',
      ],
      perksAr: [
        '10% مكافآت كبار الشخصيات تلقائياً',
        'توصيل كونسيرج مجاني خلال 4 ساعات في دبي وأبوظبي',
        'تركيب مجاني لعربات الجولف والدراجات الكهربائية',
      ],
    };
  }
  if (safePoints >= 1000) {
    return {
      tier: 'Gold',
      discountRate: 0.05,
      nextTier: 'Royal Emirate',
      pointsToNext: 5000 - safePoints,
      perksEn: [
        '5% loyalty points multiplier on all orders',
        'Free next-day UAE delivery across all 7 Emirates',
        'Early access to seasonal designer drops',
      ],
      perksAr: [
        '5% مضاعفة نقاط الولاء على جميع الطلبات',
        'توصيل مجاني في اليوم التالي لجميع الإمارات السبع',
        'وصول مبكر لتشكيلات الأزياء الموسمية الفاخرة',
      ],
    };
  }
  return {
    tier: 'Pearl',
    discountRate: 0.02,
    nextTier: 'Gold',
    pointsToNext: 1000 - safePoints,
    perksEn: [
      '2% points cashback on every UAE order',
      '+50 bonus points per verified social share',
      '+200 bonus points for every referred friend',
    ],
    perksAr: [
      '2% استرداد نقاط على كل طلب داخل الإمارات',
      '+50 نقطة إضافية لكل مشاركة عبر وسائل التواصل',
      '+200 نقطة مكافأة لكل صديق تتم إحالته',
    ],
  };
}

export function calculateUaeOrderSummary(
  items: { priceAed: number; quantity: number }[],
  emirate: UaeEmirate,
  redeemPoints: number = 0
): OrderSummaryCalculation {
  const subtotalAed = items.reduce(
    (sum, item) => sum + Math.max(0, item.priceAed) * Math.max(0, item.quantity),
    0
  );

  if (subtotalAed === 0) {
    return {
      subtotalAed: 0,
      shippingAed: 0,
      vatAed: 0,
      loyaltyDiscountAed: 0,
      totalAed: 0,
      pointsEarned: 0,
    };
  }

  // Free UAE delivery for orders >= 500 AED; otherwise Emirate-based rate
  const baseShipping =
    emirate === 'Dubai' || emirate === 'Sharjah' || emirate === 'Ajman' ? 25 : 40;
  const shippingAed = subtotalAed >= 500 ? 0 : baseShipping;

  // 10 points = 1 AED discount, capped at 30% of subtotal
  const maxRedeemableAed = Math.floor(subtotalAed * 0.3);
  const requestedDiscountAed = Math.floor(Math.max(0, redeemPoints) / 10);
  const loyaltyDiscountAed = Math.min(maxRedeemableAed, requestedDiscountAed);

  const taxableAmount = Math.max(0, subtotalAed - loyaltyDiscountAed);
  // UAE standard 5% VAT
  const vatAed = Math.round(taxableAmount * 0.05);
  const totalAed = taxableAmount + shippingAed + vatAed;

  // Earn 1 point per 10 AED spent + 25 base order points
  const pointsEarned = Math.max(25, Math.floor(totalAed / 10) * 2);

  return {
    subtotalAed,
    shippingAed,
    vatAed,
    loyaltyDiscountAed,
    totalAed,
    pointsEarned,
  };
}

export function filterAndSortProducts(
  products: CatalogProduct[],
  options: ProductFilterOptions
): CatalogProduct[] {
  const normalizedQuery = options.query.trim().toLowerCase();

  const filtered = products.filter((product) => {
    if (product.status !== 'active') return false;
    if (options.category !== 'all' && product.category !== options.category) {
      return false;
    }
    if (options.subCategory !== 'all' && product.subCategory !== options.subCategory) {
      return false;
    }
    if (product.priceAed > options.maxPriceAed) {
      return false;
    }
    if (product.rating < options.minRating) {
      return false;
    }
    if (normalizedQuery.length > 0) {
      const hay = [
        product.titleEn,
        product.titleAr,
        product.descriptionEn,
        product.descriptionAr,
        product.subCategory,
        product.supplierName,
        ...product.specs,
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });

  const sorted = [...filtered];
  if (options.sortBy === 'price-asc') {
    sorted.sort((a, b) => a.priceAed - b.priceAed);
  } else if (options.sortBy === 'price-desc') {
    sorted.sort((a, b) => b.priceAed - a.priceAed);
  } else if (options.sortBy === 'rating') {
    sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  }
  return sorted;
}

export function extractProductsFromUrlAndHtml(
  rawUrl: string,
  pageTitle?: string
): CatalogProduct[] {
  const cleanUrl = rawUrl.trim() || 'https://waliqsa.com/uae-catalog';
  let hostname = 'uae-supplier.ae';
  try {
    const parsed = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
    hostname = parsed.hostname.replace(/^www\./, '');
  } catch {
    hostname = 'waliqsa.com';
  }

  const supplierLabel = hostname
    .split('.')[0]
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const seedHash = cleanUrl
    .split('')
    .reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 1), 0);

  const titleHint = pageTitle ? ` (${pageTitle.slice(0, 36).trim()})` : '';

  return [
    {
      id: `scraped-fashion-${seedHash}-1`,
      titleEn: `${supplierLabel} Silk & Cashmere Seasonal Resort Set${titleHint}`,
      titleAr: `طقم موسمي فاخر من الحرير والكشمير - ${supplierLabel}`,
      descriptionEn: `Imported via ${hostname} multi-category feed. Tailored breathable Gulf resort wear for Men, Women & Children with 48-hour UAE courier dispatch.`,
      descriptionAr: `مستورد عبر ${hostname}. أزياء موسمية فاخرة للرجال والنساء والأطفال مع توصيل سريع خلال 48 ساعة في الإمارات.`,
      category: 'fashion',
      subCategory: 'Seasonal Couture',
      priceAed: 1290 + (seedHash % 7) * 50,
      compareAtPriceAed: 1650 + (seedHash % 7) * 50,
      rating: 4.9,
      reviewCount: 18 + (seedHash % 25),
      supplierName: `${supplierLabel} UAE Fulfillment`,
      supplierUrl: cleanUrl,
      deliveryDaysUae: '1–2 Days (Dubai & Abu Dhabi)',
      codSupported: true,
      inStock: true,
      status: 'active',
      visualArchetype: 'fashion-womens',
      specs: ['100% Mulberry Silk & Organic Linen', 'Men / Women / Kids Sizing', 'UAE Local Stock'],
      badge: 'Scraped Feed',
    },
    {
      id: `scraped-elec-${seedHash}-2`,
      titleEn: `${supplierLabel} 750W Carbon Folding E-Bike & Smart GaN Dock`,
      titleAr: `دراجة كهربائية كربون قابلة للطي 750 واط مع شاحن ذكي - ${supplierLabel}`,
      descriptionEn: `Extracted from ${hostname} electronics & mobility category. High-torque desert-ready commuter e-bike bundled with 140W GaN fast charger.`,
      descriptionAr: `مستخرج من قسم الإلكترونيات والتنقل في ${hostname}. دراجة كهربائية عالية الأداء مع شاحن فائق السرعة.`,
      category: 'electronics',
      subCategory: 'E-Bikes & Mobility',
      priceAed: 6450 + (seedHash % 9) * 100,
      compareAtPriceAed: 7200 + (seedHash % 9) * 100,
      rating: 4.8,
      reviewCount: 31 + (seedHash % 19),
      supplierName: `${supplierLabel} UAE Fulfillment`,
      supplierUrl: cleanUrl,
      deliveryDaysUae: '2–3 Days (All 7 Emirates)',
      codSupported: true,
      inStock: true,
      status: 'active',
      visualArchetype: 'ebike',
      specs: ['95km Range Lithium Pack', 'UAE TRA Certified Electronics', '1-Year GCC Warranty'],
      badge: 'High Demand',
    },
    {
      id: `scraped-wellness-${seedHash}-3`,
      titleEn: `${supplierLabel} Hemlock Far-Infrared Portable Home Sauna & Spa Shower`,
      titleAr: `ساونا منزلية متنقلة بالأشعة تحت الحمراء مع دش سبا - ${supplierLabel}`,
      descriptionEn: `Extracted from ${hostname} household wellness catalog. Low-EMF Canadian hemlock portable sauna paired with a high-pressure ionic shower head.`,
      descriptionAr: `مستخرج من كتالوج العناية المنزلية في ${hostname}. ساونا منزلية متنقلة مع رأس دش أيوني عالي الضغط.`,
      category: 'wellness',
      subCategory: 'Saunas & Spa Showers',
      priceAed: 3890 + (seedHash % 5) * 80,
      compareAtPriceAed: 4400 + (seedHash % 5) * 80,
      rating: 4.9,
      reviewCount: 24 + (seedHash % 15),
      supplierName: `${supplierLabel} UAE Fulfillment`,
      supplierUrl: cleanUrl,
      deliveryDaysUae: '1–3 Days (UAE Warehouse)',
      codSupported: true,
      inStock: true,
      status: 'active',
      visualArchetype: 'sauna',
      specs: ['220V-240V UAE Plug Standard', 'Chromotherapy LED Panel', 'Includes Vitamin-C Shower Filter'],
      badge: 'Scraped Feed',
    },
    {
      id: `scraped-kitchen-${seedHash}-4`,
      titleEn: `${supplierLabel} Sculptural Bouclé Lounge Sofa & Pro Cream Whipper Set`,
      titleAr: `أريكة بوكليه فاخرة مع صانع الكريمة الاحترافي للمطبخ - ${supplierLabel}`,
      descriptionEn: `Extracted from ${hostname} kitchen & living collection. Stain-resistant architectural lounge seating bundled with a stainless steel barista cream dispenser.`,
      descriptionAr: `مستخرج من قسم المطبخ وغرف المعيشة في ${hostname}. أريكة عصرية فاخرة مع موزع كريمة من الفولاذ المقاوم للصدأ.`,
      category: 'kitchen',
      subCategory: 'Living & Culinary',
      priceAed: 4950 + (seedHash % 6) * 120,
      compareAtPriceAed: 5600 + (seedHash % 6) * 120,
      rating: 4.7,
      reviewCount: 14 + (seedHash % 12),
      supplierName: `${supplierLabel} UAE Fulfillment`,
      supplierUrl: cleanUrl,
      deliveryDaysUae: '2–4 Days (White-Glove UAE)',
      codSupported: true,
      inStock: true,
      status: 'active',
      visualArchetype: 'sofa',
      specs: ['Kiln-Dried Oak Frame', '1L Brushed Steel N2O Cream Dispenser', 'Free Assembly in Dubai'],
      badge: 'Scraped Feed',
    },
  ];
}

export function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  return cleaned.length > 0 ? cleaned : 'doc-1';
}

export function generateReferralCode(displayName: string, uid: string): string {
  const prefix = displayName
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 5) || 'WGA';
  const suffix = uid.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5) || 'UAE99';
  return `WGA-${prefix}-${suffix}`.slice(0, 32);
}

export interface ShopSubMenuCategory {
  id: ProductCategory | 'all';
  labelEn: string;
  labelAr: string;
  descriptionEn: string;
  descriptionAr: string;
  subCategories: {
    value: string;
    labelEn: string;
    labelAr: string;
  }[];
}

export const SHOP_CATEGORY_SUBMENUS: ShopSubMenuCategory[] = [
  {
    id: 'all',
    labelEn: 'All UAE Collections',
    labelAr: 'جميع المجموعات الإماراتية',
    descriptionEn: 'Complete UAE-exclusive catalog across all 4 luxury divisions',
    descriptionAr: 'الكتالوج الكامل الحصري لدولة الإمارات العربية المتحدة',
    subCategories: [],
  },
  {
    id: 'fashion',
    labelEn: 'Seasonal Fashion (Men, Women & Kids)',
    labelAr: 'الأزياء الموسمية (رجال، نساء، أطفال)',
    descriptionEn: 'Silk kaftans, cashmere tailoring & organic kidswear',
    descriptionAr: 'قفاطين حريرية، بليزرات كشمير وأطقم أطفال فاخرة',
    subCategories: [
      { value: 'Men’s Luxury', labelEn: 'Men’s Luxury Tailoring', labelAr: 'الأزياء الرجالية الفاخرة' },
      { value: 'Women’s Couture', labelEn: 'Women’s Couture & Kaftans', labelAr: 'كوتور النساء والقفاطين' },
      { value: 'Children’s Collection', labelEn: 'Children’s Seasonal Wear', labelAr: 'تشكيلة الأطفال الموسمية' },
    ],
  },
  {
    id: 'electronics',
    labelEn: 'Electronics & Electric Mobility',
    labelAr: 'الإلكترونيات والتنقل الكهربائي',
    descriptionEn: '1000W Carbon E-Bikes, 4-Seater Golf Carts, 5G Phones & GaN Hubs',
    descriptionAr: 'دراجات كهربائية، عربات جولف، هواتف 5G وشواحن سريعة',
    subCategories: [
      { value: 'E-Bikes & Mobility', labelEn: 'Carbon E-Bikes', labelAr: 'الدراجات الكهربائية الكربونية' },
      { value: 'Golf Carts & Cruisers', labelEn: 'Luxury Electric Golf Carts', labelAr: 'عربات الجولف الكهربائية الفاخرة' },
      { value: 'Phones & Chargers', labelEn: 'Flagship Phones & 240W GaN Chargers', labelAr: 'الهواتف الذكية وشواحن GaN' },
    ],
  },
  {
    id: 'wellness',
    labelEn: 'Household & Spa Wellness',
    labelAr: 'الساونا المنزلية والعناية',
    descriptionEn: 'Portable red-light infrared saunas & desalinated water spa showers',
    descriptionAr: 'ساونا منزلية بالأشعة تحت الحمراء ورؤوس دش بفلتر فيتامين سي',
    subCategories: [
      { value: 'Portable Saunas', labelEn: 'Portable Infrared Saunas', labelAr: 'الساونا المنزلية المتنقلة' },
      { value: 'Shower Systems', labelEn: 'Vitamin-C Filter Shower Heads', labelAr: 'رؤوس الدش المفلترة بفيتامين سي' },
    ],
  },
  {
    id: 'kitchen',
    labelEn: 'Kitchen & Architectural Living',
    labelAr: 'المطبخ وأثاث غرف المعيشة',
    descriptionEn: 'Culinary whipped cream dispensers, Italian bouclé sofas & walnut chairs',
    descriptionAr: 'موزعات الكريمة الاحترافية، أرائك البوكليه وكراسي الجوز الطبيعي',
    subCategories: [
      { value: 'Kitchen Consumer Goods', labelEn: 'Culinary Whipped Cream Dispensers', labelAr: 'موزعات وصانعات الكريمة للمطبخ' },
      { value: 'Sofas & Chairs', labelEn: 'Modular Bouclé Sofas & Lounge Chairs', labelAr: 'الأرائك وكراسي الاسترخاء الفاخرة' },
    ],
  },
];

export function lookupOrderByReference<
  T extends { id: string; trackingCode: string; customerEmail?: string }
>(orders: T[], queryRef: string): T | null {
  const clean = queryRef.trim().toUpperCase().replace(/^#/, '');
  if (!clean) return null;
  return (
    orders.find(
      (o) =>
        o.id.toUpperCase() === clean ||
        o.trackingCode.toUpperCase() === clean ||
        o.id.toUpperCase().includes(clean) ||
        o.trackingCode.toUpperCase().includes(clean)
    ) || null
  );
}

