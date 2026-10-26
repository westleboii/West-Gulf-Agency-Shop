import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Star,
  ShoppingBag,
  Share2,
  Check,
  Truck,
  ShieldCheck,
  Sparkles,
  X,
  ArrowUpRight,
} from 'lucide-react';
import {
  filterAndSortProducts,
  type CatalogProduct,
  type ProductCategory,
  type ProductFilterOptions,
} from '../utils/shopLogic';
import { type ProductReviewRecord } from '../data/catalogData';
import { ProductVisual } from './ProductVisual';

interface StorefrontViewProps {
  lang: 'en' | 'ar';
  products: CatalogProduct[];
  reviews: ProductReviewRecord[];
  externalCategory?: ProductCategory | 'all';
  externalSubCategory?: string | 'all';
  onAddToCart: (product: CatalogProduct, quantity?: number) => void;
  onShareProduct: (product: CatalogProduct, platform: 'Instagram' | 'Facebook' | 'Pinterest' | 'X') => void;
  onSubmitReview: (productId: string, rating: number, comment: string, authorName: string) => void;
  onNavigateTrackOrder: () => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  lang,
  products,
  reviews,
  externalCategory = 'all',
  externalSubCategory = 'all',
  onAddToCart,
  onShareProduct,
  onSubmitReview,
  onNavigateTrackOrder,
}) => {
  const isAr = lang === 'ar';

  const [filters, setFilters] = useState<ProductFilterOptions>({
    query: '',
    category: externalCategory,
    subCategory: externalSubCategory,
    maxPriceAed: 40000,
    minRating: 0,
    sortBy: 'featured',
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: externalCategory,
      subCategory: externalSubCategory,
    }));
  }, [externalCategory, externalSubCategory]);

  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [pdpQuantity, setPdpQuantity] = useState<number>(1);
  const [selectedVariant, setSelectedVariant] = useState<string>('Standard UAE Specification');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Review form state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const subCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (filters.category === 'all' || p.category === filters.category) {
        set.add(p.subCategory);
      }
    });
    return Array.from(set);
  }, [products, filters.category]);

  const filteredProducts = useMemo(
    () => filterAndSortProducts(products, filters),
    [products, filters]
  );

  const productReviews = useMemo(() => {
    if (!selectedProduct) return [];
    return reviews.filter(
      (r) => r.productId === selectedProduct.id && r.status === 'approved'
    );
  }, [reviews, selectedProduct]);

  const handleOpenPdp = (product: CatalogProduct) => {
    setSelectedProduct(product);
    setPdpQuantity(1);
    setSelectedVariant(product.specs[0] || 'Standard UAE Specification');
    setReviewError(null);
    setReviewSuccess(false);
  };

  const handleShareClick = (
    product: CatalogProduct,
    platform: 'Instagram' | 'Facebook' | 'Pinterest' | 'X'
  ) => {
    onShareProduct(product, platform);
    setShareFeedback(
      isAr
        ? `تمت المشاركة على ${platform} (+50 نقطة ولاء)`
        : `Shared to ${platform} · +50 Loyalty Points added`
    );
    setTimeout(() => setShareFeedback(null), 3500);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (reviewAuthor.trim().length < 2) {
      setReviewError(isAr ? 'يرجى إدخال اسمك الكامل' : 'Please enter your name (min 2 characters).');
      return;
    }
    if (reviewComment.trim().length < 5) {
      setReviewError(
        isAr ? 'يرجى كتابة تقييم واضح (5 أحرف على الأقل)' : 'Please write a detailed review (min 5 characters).'
      );
      return;
    }
    setReviewError(null);
    onSubmitReview(selectedProduct.id, reviewRating, reviewComment.trim(), reviewAuthor.trim());
    setReviewComment('');
    setReviewSuccess(true);
  };

  const categoryTabs: { id: ProductCategory | 'all'; labelEn: string; labelAr: string }[] = [
    { id: 'all', labelEn: 'All Collections', labelAr: 'جميع المجموعات' },
    { id: 'fashion', labelEn: 'Seasonal Fashion', labelAr: 'الأزياء الموسمية الفاخرة' },
    { id: 'electronics', labelEn: 'Mobility & Electronics', labelAr: 'الإلكترونيات والتنقل' },
    { id: 'wellness', labelEn: 'Home & Saunas', labelAr: 'الساونا والعناية المنزلية' },
    { id: 'kitchen', labelEn: 'Kitchen & Living', labelAr: 'المطبخ وغرف المعيشة' },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* SECTION 1: Storefront Split Hero + Full-Width 4-Column UAE Trust Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#18181B] text-[#FAF8F5] rounded-2xl overflow-hidden border border-stone-800">
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-xs tracking-wider uppercase text-amber-300/90">
                <span>{isAr ? 'توصيل حصري لجميع إمارات الدولة السبع' : 'Exclusive UAE Fulfillment Network'}</span>
                <span aria-hidden="true">·</span>
                <span>{isAr ? 'دبي · أبوظبي · الشارقة' : 'Dubai · Abu Dhabi · Sharjah & Northern Emirates'}</span>
              </div>

              <h1
                className="font-display font-semibold text-white leading-[1.08]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.6rem)', textWrap: 'balance' }}
              >
                {isAr
                  ? 'الفخامة الموسمية والتنقل الذكي ومستلزمات القصور في متجر إماراتي واحد'
                  : 'Curated Gulf Luxury, Electric Mobility & Architectural Living.'}
              </h1>

              <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                {isAr
                  ? 'تسوق أرقى الأزياء الموسمية للرجال والنساء والأطفال، الدراجات الكهربائية وعربات الجولف الفاخرة، الساونا المنزلية، وأثاث البوكليه الإيطالي مع شحن مباشر داخل الإمارات.'
                  : 'From silk seasonal couture and lifted 4-seater lithium golf carts to cedar infrared home saunas and culinary instrumentation—direct from verified UAE dropshipping warehouses to your residence.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#catalog-section"
                className="px-6 py-3.5 bg-[#D4AF37] text-stone-950 font-semibold text-sm rounded-lg hover:bg-[#e0bd46] transition-colors whitespace-nowrap shrink-0"
              >
                {isAr ? 'استكشف الكتالوج الكامل' : 'Explore UAE Catalog'}
              </a>
              <button
                type="button"
                onClick={onNavigateTrackOrder}
                className="px-5 py-3.5 bg-stone-800/90 text-stone-100 font-medium text-sm rounded-lg border border-stone-700 hover:bg-stone-700 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>{isAr ? 'تتبع طلبك في الإمارات مباشرة' : 'Track UAE Order Live'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-stone-900 flex flex-col justify-between p-6 border-t lg:border-t-0 lg:border-l border-stone-800">
            <div className="rounded-xl overflow-hidden border border-stone-700/70 h-56 sm:h-64">
              <ProductVisual archetype="ebike" title="Falcon Carbon Pro 1000W E-Bike & Dubai Showroom" />
            </div>
            <div className="pt-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>{isAr ? 'إصدار خاص — دبي مارينا وتلال الإمارات' : 'Featured Flagship · Dubai Marina & Emirates Hills'}</span>
                <span className="font-mono tabular-nums text-amber-300">AED 8,900</span>
              </div>
              <p className="text-sm font-medium text-stone-100">
                {isAr
                  ? 'دراجة فالكون كربون 1000 واط + عربة جولف تلال الإمارات متوفرة للتوصيل خلال 24-48 ساعة'
                  : 'Falcon Carbon 1000W E-Bike & Lithium Golf Cruisers — 24–48h UAE Villa Delivery'}
              </p>
            </div>
          </div>
        </div>

        {/* Full-width 4-Column KPI / UAE Service Strip below the Hero Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-white border border-stone-200/90 rounded-xl p-5 flex items-start gap-3.5">
            <Truck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-stone-900">
                {isAr ? 'شحن حصري داخل الإمارات' : 'UAE-Exclusive Fulfillment'}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {isAr
                  ? 'توصيل خلال 24-72 ساعة لجميع الإمارات السبع ومجاني فوق 500 درهم'
                  : '24–72h courier across all 7 Emirates · Free over AED 500'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-xl p-5 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-stone-900">
                {isAr ? 'بوابات دفع إماراتية وعالمية آمنة' : 'PayTabs, Telr, Apple Pay & COD'}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {isAr
                  ? 'تشفير كامل 256-bit مع دعم الدفع عند الاستلام في الإمارات'
                  : '3D-Secure UAE checkout plus verified Cash on Delivery'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-xl p-5 flex items-start gap-3.5">
            <Sparkles className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-stone-900">
                {isAr ? 'برنامج ولاء ومكافآت الإمارة' : 'Emirate Loyalty & Social Rewards'}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {isAr
                  ? 'اكسب نقاطاً على كل عملية شراء ومشاركة اجتماعية وإحالة'
                  : 'Earn up to 10% points back + 50 pts per social share'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-xl p-5 flex items-start gap-3.5">
            <SlidersHorizontal className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-stone-900">
                {isAr ? 'موردو دروبشيبينغ معتمدون' : '5 Verified UAE Dropship Hubs'}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {isAr
                  ? 'ربط مباشر مع Waliqsa و COD UAE و Shorages و CJ'
                  : 'Waliqsa · COD Dropshipping UAE · Shorages · CJ Direct'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Real-Time Search & Multi-Facet Filter Bar + Featured Catalog Grid */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500">
              {isAr ? 'الكتالوج الرسمي · تسليم داخل الإمارات' : 'Curated Storefront · Ships Exclusively to UAE'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-stone-900 mt-1">
              {isAr ? 'تشكيلة الخليج الغربي المختارة' : 'Signature UAE Dropship Collections'}
            </h2>
          </div>

          <div className="text-xs text-stone-500 font-mono tabular-nums">
            {isAr
              ? `عرض ${filteredProducts.length} من أصل ${products.length} منتج`
              : `Showing ${filteredProducts.length} of ${products.length} items`}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Real-time Search Input */}
            <div className="md:col-span-5 relative">
              <label htmlFor="catalog-search-input" className="sr-only">
                {isAr ? 'ابحث عن المنتجات' : 'Search products'}
              </label>
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="catalog-search-input"
                type="search"
                value={filters.query}
                onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
                placeholder={
                  isAr
                    ? 'ابحث عن دراجة كهربائية، عربة جولف، ساونا، عباية، أريكة...'
                    : 'Search e-bikes, golf carts, silk kaftans, saunas, whipped cream...'
                }
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            {/* Subcategory Filter */}
            <div className="md:col-span-3">
              <label htmlFor="subcategory-select" className="sr-only">
                {isAr ? 'القسم الفرعي' : 'Subcategory'}
              </label>
              <select
                id="subcategory-select"
                value={filters.subCategory}
                onChange={(e) => setFilters((prev) => ({ ...prev, subCategory: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              >
                <option value="all">{isAr ? 'جميع الأقسام الفرعية' : 'All Subcategories'}</option>
                {subCategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Ceiling Filter */}
            <div className="md:col-span-2">
              <label htmlFor="max-price-select" className="sr-only">
                {isAr ? 'الحد الأقصى للسعر' : 'Maximum Price'}
              </label>
              <select
                id="max-price-select"
                value={filters.maxPriceAed}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxPriceAed: Number(e.target.value) }))
                }
                className="w-full px-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-stone-900"
              >
                <option value={40000}>{isAr ? 'السعر: الكل' : 'Max: AED 40,000'}</option>
                <option value={10000}>{isAr ? 'حتى 10,000 درهم' : 'Under AED 10,000'}</option>
                <option value={5000}>{isAr ? 'حتى 5,000 درهم' : 'Under AED 5,000'}</option>
                <option value={1500}>{isAr ? 'حتى 1,500 درهم' : 'Under AED 1,500'}</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="md:col-span-2">
              <label htmlFor="sort-by-select" className="sr-only">
                {isAr ? 'ترتيب حسب' : 'Sort by'}
              </label>
              <select
                id="sort-by-select"
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value as ProductFilterOptions['sortBy'],
                  }))
                }
                className="w-full px-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              >
                <option value="featured">{isAr ? 'الأكثر تميزاً' : 'Sort: Featured'}</option>
                <option value="price-asc">{isAr ? 'السعر: من الأقل' : 'Price: Low to High'}</option>
                <option value="price-desc">{isAr ? 'السعر: من الأعلى' : 'Price: High to Low'}</option>
                <option value="rating">{isAr ? 'الأعلى تقييماً' : 'Highest Rated'}</option>
              </select>
            </div>
          </div>

          {/* Interactive Category Segmented Filter Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg overflow-x-auto max-w-full">
              {categoryTabs.map((tab) => {
                const active = filters.category === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, category: tab.id, subCategory: 'all' }))
                    }
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {isAr ? tab.labelAr : tab.labelEn}
                  </button>
                );
              })}
            </div>

            {(filters.query ||
              filters.category !== 'all' ||
              filters.subCategory !== 'all' ||
              filters.maxPriceAed < 40000) && (
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    query: '',
                    category: 'all',
                    subCategory: 'all',
                    maxPriceAed: 40000,
                    minRating: 0,
                    sortBy: 'featured',
                  })
                }
                className="text-xs font-medium text-amber-900 hover:underline whitespace-nowrap shrink-0"
              >
                {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
              </button>
            )}
          </div>
        </div>

        {/* Share Toast Notification */}
        {shareFeedback && (
          <div
            role="status"
            className="bg-stone-900 text-amber-300 px-4 py-3 rounded-lg text-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{shareFeedback}</span>
            </div>
          </div>
        )}

        {/* 3-Column Uniform Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-4">
            <p className="text-lg font-medium text-stone-900">
              {isAr ? 'لا توجد منتجات مطابقة لبحثك الحالي' : 'No products match your current filter criteria'}
            </p>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              {isAr
                ? 'جرب تغيير الفئة أو الحد الأقصى للسعر، أو استخدم أداة سحب الروابط في لوحة التحكم لإضافة منتجات جديدة.'
                : 'Try clearing your search filter or import new multi-category items via the Admin Product Link Scraper.'}
            </p>
            <button
              type="button"
              onClick={() =>
                setFilters({
                  query: '',
                  category: 'all',
                  subCategory: 'all',
                  maxPriceAed: 40000,
                  minRating: 0,
                  sortBy: 'featured',
                })
              }
              className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors"
            >
              {isAr ? 'عرض جميع المنتجات' : 'Show All Products'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group bg-white border border-stone-200/90 rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  {/* Product Visual Container (65-75% height visual lead) */}
                  <div
                    onClick={() => handleOpenPdp(product)}
                    className="relative h-60 w-full bg-stone-100 cursor-pointer overflow-hidden"
                  >
                    <ProductVisual
                      archetype={product.visualArchetype}
                      title={isAr ? product.titleAr : product.titleEn}
                    />
                    {product.badge && (
                      <span className="absolute top-3 left-3 text-[11px] font-medium tracking-wide uppercase text-stone-900 bg-white/90 px-2.5 py-1 rounded">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Clean Unboxed Metadata with Typographic Separators */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <div className="flex items-center gap-1.5 uppercase tracking-wider">
                        <span>{product.subCategory}</span>
                        <span aria-hidden="true">·</span>
                        <span>{product.codSupported ? 'COD Ready' : 'Prepaid Freight'}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono tabular-nums text-stone-700">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{product.rating.toFixed(1)}</span>
                        <span className="text-stone-400">({product.reviewCount})</span>
                      </div>
                    </div>

                    <h3 className="text-base font-semibold text-stone-900 leading-snug line-clamp-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPdp(product)}
                        className="text-left hover:text-amber-900 transition-colors"
                      >
                        {isAr ? product.titleAr : product.titleEn}
                      </button>
                    </h3>

                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {isAr ? product.descriptionAr : product.descriptionEn}
                    </p>

                    <div className="text-xs text-stone-500 pt-1 flex items-center gap-1.5">
                      <span>{product.supplierName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{product.deliveryDaysUae}</span>
                    </div>
                  </div>
                </div>

                {/* Price & Action Footer */}
                <div className="px-5 pb-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                  <div className="font-mono tabular-nums">
                    <span className="text-base font-semibold text-stone-900">
                      AED {product.priceAed.toLocaleString()}
                    </span>
                    {product.compareAtPriceAed && (
                      <span className="block text-xs text-stone-400 line-through">
                        AED {product.compareAtPriceAed.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleShareClick(product, 'Instagram')}
                      aria-label={`Share ${product.titleEn}`}
                      title={isAr ? 'شارك واكسب 50 نقطة ولاء' : 'Share & Earn +50 Loyalty Points'}
                      className="p-2 text-stone-500 hover:text-stone-900 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddToCart(product, 1)}
                      className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isAr ? 'أضف للسلة' : 'Add to Bag'}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: UAE Dropshipping Architecture & Craftsmanship Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs uppercase tracking-widest text-amber-900 font-semibold">
              {isAr ? 'شبكة التوريد المباشر في الإمارات' : 'Direct UAE Dropshipping Architecture'}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900">
              {isAr
                ? 'من مستودعات دبي والمنطقة الحرة إلى باب منزلك في جميع الإمارات السبع'
                : 'Zero-Friction Gulf Fulfillment Across Fashion, Mobility & Home Wellness.'}
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              {isAr
                ? 'يتكامل متجر وكالة الخليج الغربي مباشرة مع كبار موردي الدروبشيبينغ في الإمارات لضمان فحص الجودة والتوصيل السريع مع خدمة الدفع عند الاستلام أو البطاقات الائتمانية.'
                : 'Every item in West Gulf Agency Shop is linked directly to vetted Dubai South, Al Quoz, and Jebel Ali supplier inventories. High-ticket items like 4-seater lithium golf carts, carbon e-bikes, and infrared saunas include white-glove villa installation.'}
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-l border-stone-200 pt-6 lg:pt-0 lg:pl-8">
            <div>
              <p className="font-mono tabular-nums text-2xl font-semibold text-stone-900">7 / 7</p>
              <p className="text-xs text-stone-500 mt-1">
                {isAr ? 'تغطية شاملة لجميع الإمارات' : 'UAE Emirates Covered (DXB to FUJ)'}
              </p>
            </div>
            <div>
              <p className="font-mono tabular-nums text-2xl font-semibold text-stone-900">24–48h</p>
              <p className="text-xs text-stone-500 mt-1">
                {isAr ? 'متوسط سرعة التوصيل في دبي وأبوظبي' : 'Median Dispatch to Dubai & Abu Dhabi'}
              </p>
            </div>
            <div>
              <p className="font-mono tabular-nums text-2xl font-semibold text-stone-900">100%</p>
              <p className="text-xs text-stone-500 mt-1">
                {isAr ? 'معتمد من هيئة تنظيم الاتصالات والبلدية' : 'TRA & Emirates Authority Compliant'}
              </p>
            </div>
            <div>
              <p className="font-mono tabular-nums text-2xl font-semibold text-stone-900">+50 Pts</p>
              <p className="text-xs text-stone-500 mt-1">
                {isAr ? 'مكافأة فورية لكل مشاركة اجتماعية' : 'Instant Reward per Social Share'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTIGUOUS PURCHASE MODULE (PDP MODAL) */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? selectedProduct.titleAr : selectedProduct.titleEn}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#FAF8F5] border border-stone-300 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider">
                <span>{selectedProduct.subCategory}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedProduct.supplierName}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                aria-label="Close product details"
                className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Gallery */}
              <div className="md:col-span-6 space-y-4">
                <div className="h-72 rounded-xl overflow-hidden border border-stone-200 bg-white">
                  <ProductVisual
                    archetype={selectedProduct.visualArchetype}
                    title={selectedProduct.titleEn}
                  />
                </div>

                {/* Social Sharing Bar (+50 Loyalty Points) */}
                <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-900">
                      {isAr ? 'شارك المنتج مع أصدقائك' : 'Share Item to Social Platforms'}
                    </span>
                    <span className="text-amber-800 font-mono tabular-nums">+50 Loyalty Pts</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Instagram', 'Facebook', 'Pinterest', 'X'] as const).map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => handleShareClick(selectedProduct, platform)}
                        className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-50 hover:bg-stone-900 hover:text-white border border-stone-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Contiguous Purchase Module */}
              <div className="md:col-span-6 space-y-5 bg-white border border-stone-200 rounded-xl p-6">
                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-semibold text-stone-900">
                    {isAr ? selectedProduct.titleAr : selectedProduct.titleEn}
                  </h2>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className="text-2xl font-bold text-stone-900">
                      AED {selectedProduct.priceAed.toLocaleString()}
                    </span>
                    {selectedProduct.compareAtPriceAed && (
                      <span className="text-sm text-stone-400 line-through">
                        AED {selectedProduct.compareAtPriceAed.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-stone-600 leading-relaxed">
                  {isAr ? selectedProduct.descriptionAr : selectedProduct.descriptionEn}
                </p>

                {/* Variant / Specification Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
                    {isAr ? 'المواصفات والنسخة المعتمدة' : 'Selected Specification'}
                  </label>
                  <div className="space-y-1.5">
                    {selectedProduct.specs.map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => setSelectedVariant(spec)}
                        className={`w-full text-left px-3.5 py-2 text-xs rounded-lg border transition-colors flex items-center justify-between ${
                          selectedVariant === spec
                            ? 'border-stone-900 bg-stone-900 text-white font-medium'
                            : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span>{spec}</span>
                        {selectedVariant === spec && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity & Primary Add to Bag CTA */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center border border-stone-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setPdpQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      className="px-3 py-2 text-sm font-mono hover:bg-stone-100"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 text-sm font-mono tabular-nums">{pdpQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setPdpQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                      className="px-3 py-2 text-sm font-mono hover:bg-stone-100"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(selectedProduct, pdpQuantity);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 py-2.5 px-5 bg-stone-900 text-white text-sm font-semibold rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    {isAr
                      ? `أضف للسلة · ${(selectedProduct.priceAed * pdpQuantity).toLocaleString()} درهم`
                      : `Add to Bag · AED ${(selectedProduct.priceAed * pdpQuantity).toLocaleString()}`}
                  </button>
                </div>

                <div className="text-xs text-stone-500 pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span>{selectedProduct.deliveryDaysUae}</span>
                  <span>
                    {selectedProduct.codSupported
                      ? isAr
                        ? 'يدعم الدفع عند الاستلام'
                        : 'Cash on Delivery Eligible'
                      : isAr
                      ? 'شحن خاص مؤمن'
                      : 'Insured Villa Freight'}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Reviews & Ratings Section */}
            <div className="border-t border-stone-200 pt-6 grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-7 space-y-4">
                <h3 className="text-base font-semibold text-stone-900">
                  {isAr
                    ? `تقييمات العملاء الموثقة (${productReviews.length})`
                    : `Verified UAE Customer Reviews (${productReviews.length})`}
                </h3>

                {productReviews.length === 0 ? (
                  <p className="text-xs text-stone-500">
                    {isAr
                      ? 'كن أول من يقيّم هذا المنتج في الإمارات.'
                      : 'Be the first verified UAE shopper to review this item.'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {productReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-white border border-stone-200 rounded-xl p-4 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-stone-900">{rev.authorName}</span>
                          <span className="font-mono tabular-nums text-amber-700">
                            {'★'.repeat(rev.rating)} ({rev.rating}/5)
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Write a Review Form */}
              <form onSubmit={handleReviewSubmit} className="md:col-span-5 bg-white border border-stone-200 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-stone-900">
                  {isAr ? 'أضف تقييمك للمنتج' : 'Submit a Verified Review'}
                </h4>

                <div>
                  <label htmlFor="review-author" className="block text-xs text-stone-600 mb-1">
                    {isAr ? 'الاسم والإمارة' : 'Your Name & Emirate'}
                  </label>
                  <input
                    id="review-author"
                    type="text"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder={isAr ? 'مثال: راشد · دبي' : 'e.g. Rashid · Dubai'}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg"
                  />
                </div>

                <div>
                  <label htmlFor="review-rating" className="block text-xs text-stone-600 mb-1">
                    {isAr ? 'التقييم' : 'Rating'}
                  </label>
                  <select
                    id="review-rating"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg font-mono"
                  >
                    <option value={5}>5 ★ — Exceptional UAE Quality</option>
                    <option value={4}>4 ★ — Very Good</option>
                    <option value={3}>3 ★ — Satisfactory</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="review-comment" className="block text-xs text-stone-600 mb-1">
                    {isAr ? 'تجربتك مع المنتج' : 'Review Comment'}
                  </label>
                  <textarea
                    id="review-comment"
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={
                      isAr
                        ? 'اكتب رأيك حول جودة المنتج وسرعة التوصيل...'
                        : 'Share your experience with build quality and UAE delivery speed...'
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg"
                  />
                </div>

                {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}
                {reviewSuccess && (
                  <p className="text-xs text-emerald-700">
                    {isAr
                      ? 'تم إرسال تقييمك بنجاح وإضافة +75 نقطة ولاء لحسابك!'
                      : 'Review submitted! +75 Loyalty Points added to your profile.'}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
                >
                  {isAr ? 'إرسال التقييم (+75 نقطة)' : 'Post Review (+75 Loyalty Pts)'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
