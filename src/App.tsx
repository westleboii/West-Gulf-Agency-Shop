import React, { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import {
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
  User as UserIcon,
  Lock,
  ArrowLeft,
  Globe,
} from 'lucide-react';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  generateReferralCode,
  sanitizeId,
  SHOP_CATEGORY_SUBMENUS,
  type CatalogProduct,
  type ProductCategory,
} from './utils/shopLogic';
import {
  INITIAL_ADDRESSES,
  INITIAL_CATALOG_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  UAE_DROPSHIPPING_SUPPLIERS,
  type CustomerOrderRecord,
  type ProductReviewRecord,
  type SavedUaeAddress,
  type UaeDropshipSupplier,
} from './data/catalogData';
import { StorefrontView } from './components/StorefrontView';
import { ProfileLoyaltyView } from './components/ProfileLoyaltyView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { CartCheckoutDrawer, type CartItem } from './components/CartCheckoutDrawer';
import { LiveChatWidget } from './components/LiveChatWidget';
import {
  TrackOrderPage,
  AboutUsPage,
  ContactUsPage,
  SignInPage,
} from './components/PublicPagesView';

export type PublicPageId =
  | 'shop'
  | 'track-order'
  | 'about'
  | 'contact'
  | 'sign-in'
  | 'client-dashboard';

function detectInitialEnvironment(): 'public' | 'admin' {
  if (typeof window === 'undefined') return 'public';
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    search.includes('portal=admin') ||
    hash === '#admin'
  ) {
    return 'admin';
  }
  return 'public';
}

export default function App() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [environmentMode, setEnvironmentMode] = useState<'public' | 'admin'>(
    detectInitialEnvironment
  );
  const [activePage, setActivePage] = useState<PublicPageId>('shop');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Navigation & Sub-Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileShopExpanded, setIsMobileShopExpanded] = useState(true);
  const [isDesktopShopDropdownOpen, setIsDesktopShopDropdownOpen] = useState(false);
  const [selectedShopCategory, setSelectedShopCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedShopSubCategory, setSelectedShopSubCategory] = useState<string | 'all'>('all');

  // Auth & Client Profile State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('Tariq Al-Mansoor');
  const [userEmail, setUserEmail] = useState('juniorndime@gmail.com');
  const [loyaltyPoints, setLoyaltyPoints] = useState(1450);
  const [referralCode, setReferralCode] = useState('WGA-TARIQ-UAE99');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [promoEnabled, setPromoEnabled] = useState(true);

  // Store Data State
  const [products, setProducts] = useState<CatalogProduct[]>(INITIAL_CATALOG_PRODUCTS);
  const [orders, setOrders] = useState<CustomerOrderRecord[]>(INITIAL_ORDERS);
  const [reviews, setReviews] = useState<ProductReviewRecord[]>(INITIAL_REVIEWS);
  const [addresses, setAddresses] = useState<SavedUaeAddress[]>(INITIAL_ADDRESSES);
  const [suppliers, setSuppliers] = useState<UaeDropshipSupplier[]>(
    UAE_DROPSHIPPING_SUPPLIERS
  );
  const [cart, setCart] = useState<CartItem[]>([
    { product: INITIAL_CATALOG_PRODUCTS[5], quantity: 1 }, // Apex Horizon Ultra 5G Smartphone
  ]);
  const [pointsLedger, setPointsLedger] = useState([
    {
      id: 'led-1',
      reason: 'Order #ORD-UAE-9038 (Zenith Infrared Sauna)',
      points: 1018,
      date: '2026-10-21',
    },
    {
      id: 'led-2',
      reason: 'Welcome UAE Member Bonus',
      points: 250,
      date: '2026-10-15',
    },
    {
      id: 'led-3',
      reason: 'Instagram Product Share Reward',
      points: 182,
      date: '2026-10-24',
    },
  ]);

  // Sync URL history when switching between Public Website and Separated Admin Portal
  useEffect(() => {
    const handlePopState = () => {
      setEnvironmentMode(detectInitialEnvironment());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const launchSeparatedAdminPortal = () => {
    try {
      window.history.pushState({}, '', '/admin');
    } catch {
      // Ignore history error in sandboxed frames
    }
    setEnvironmentMode('admin');
    setIsMobileMenuOpen(false);
    setIsDesktopShopDropdownOpen(false);
  };

  const exitAdminPortalToStorefront = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch {
      // Ignore history error
    }
    setEnvironmentMode('public');
    setActivePage('shop');
  };

  const handleNavigateShopCategory = (
    category: ProductCategory | 'all' = 'all',
    subCategory: string | 'all' = 'all'
  ) => {
    setSelectedShopCategory(category);
    setSelectedShopSubCategory(subCategory);
    setActivePage('shop');
    setIsDesktopShopDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleNavigatePage = (page: PublicPageId) => {
    setActivePage(page);
    setIsDesktopShopDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Listen to Firebase Auth state & sync Firestore orders when authenticated
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        const display = (user.displayName || 'UAE Member').slice(0, 100);
        const mail = (user.email || 'member@westgulfagency.ae').slice(0, 150);
        setUserName(display);
        setUserEmail(mail);
        setReferralCode(generateReferralCode(display, user.uid));
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    const ordersPath = 'orders';
    const q = query(collection(db, ordersPath), where('userId', '==', firebaseUser.uid));
    const unsubscribeOrders = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudOrders: CustomerOrderRecord[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: data.userId,
              customerName: data.customerName,
              customerEmail: data.customerEmail,
              emirate: data.emirate,
              shippingAddress: data.shippingAddress,
              paymentMethod: data.paymentMethod,
              totalAed: data.totalAed,
              itemSummary: data.itemSummary,
              itemCount: data.itemCount,
              status: data.status,
              trackingCode: data.trackingCode,
              pointsEarned: data.pointsEarned,
              createdAtIso: new Date().toISOString(),
            };
          });
          setOrders((prev) => {
            const existingIds = new Set(cloudOrders.map((o) => o.id));
            return [...cloudOrders, ...prev.filter((o) => !existingIds.has(o.id))];
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, ordersPath);
      }
    );
    return () => unsubscribeOrders();
  }, [firebaseUser]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      // Popup closed or blocked in preview environment; keep interactive profile active
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignore signout error
    }
  };

  const handleAddToCart = (product: CatalogProduct, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + quantity } : c
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((c) => c.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((c) => (c.product.id === productId ? { ...c, quantity } : c))
      );
    }
  };

  const handleShareProduct = (
    product: CatalogProduct,
    platform: 'Instagram' | 'Facebook' | 'Pinterest' | 'X'
  ) => {
    setLoyaltyPoints((pts) => pts + 50);
    setPointsLedger((prev) => [
      {
        id: `share-${Date.now()}`,
        reason: `Shared "${product.titleEn.slice(0, 28)}" on ${platform}`,
        points: 50,
        date: 'Today',
      },
      ...prev,
    ]);
  };

  const handleSubmitReview = (
    productId: string,
    rating: number,
    comment: string,
    authorName: string
  ) => {
    const newRev: ProductReviewRecord = {
      id: `rev-${Date.now()}`,
      productId,
      authorId: firebaseUser ? sanitizeId(firebaseUser.uid) : 'demo-user-uae',
      authorName: authorName.slice(0, 100),
      rating: Math.min(5, Math.max(1, rating)),
      comment: comment.slice(0, 600),
      status: 'approved',
      createdAtIso: new Date().toISOString(),
    };
    setReviews((prev) => [newRev, ...prev]);
    setLoyaltyPoints((pts) => pts + 75);
    setPointsLedger((prev) => [
      {
        id: `rev-pts-${Date.now()}`,
        reason: 'Verified Product Review Published',
        points: 75,
        date: 'Today',
      },
      ...prev,
    ]);
  };

  const handleCompleteOrder = (orderData: {
    customerName: string;
    customerEmail: string;
    emirate: CustomerOrderRecord['emirate'];
    shippingAddress: string;
    paymentMethod: CustomerOrderRecord['paymentMethod'];
    totalAed: number;
    itemSummary: string;
    itemCount: number;
    pointsEarned: number;
    pointsRedeemed: number;
  }): CustomerOrderRecord => {
    const orderId = `ORD-UAE-${Math.floor(1000 + Math.random() * 8999)}`;
    const trackingCode = `EMX-${orderData.emirate.slice(0, 3).toUpperCase()}-${Math.floor(
      100000 + Math.random() * 899999
    )}`;

    const newOrder: CustomerOrderRecord = {
      id: orderId,
      userId: firebaseUser ? sanitizeId(firebaseUser.uid) : 'demo-user-uae',
      customerName: orderData.customerName.slice(0, 100),
      customerEmail: orderData.customerEmail.slice(0, 150),
      emirate: orderData.emirate,
      shippingAddress: orderData.shippingAddress.slice(0, 300),
      paymentMethod: orderData.paymentMethod,
      totalAed: orderData.totalAed,
      itemSummary: orderData.itemSummary.slice(0, 500),
      itemCount: orderData.itemCount,
      status: 'pending_approval',
      trackingCode,
      pointsEarned: orderData.pointsEarned,
      createdAtIso: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLoyaltyPoints((pts) =>
      Math.max(0, pts - orderData.pointsRedeemed + orderData.pointsEarned)
    );
    setPointsLedger((prev) => [
      {
        id: `ord-pts-${Date.now()}`,
        reason: `Order ${orderId} (${orderData.emirate})`,
        points: orderData.pointsEarned,
        date: 'Today',
      },
      ...prev,
    ]);
    setCart([]);

    if (firebaseUser?.emailVerified) {
      const path = `orders/${orderId}`;
      setDoc(doc(db, 'orders', orderId), {
        userId: sanitizeId(firebaseUser.uid),
        customerName: newOrder.customerName,
        customerEmail: newOrder.customerEmail,
        emirate: newOrder.emirate,
        shippingAddress: newOrder.shippingAddress,
        paymentMethod: newOrder.paymentMethod,
        totalAed: newOrder.totalAed,
        itemSummary: newOrder.itemSummary,
        itemCount: newOrder.itemCount,
        status: 'pending_approval',
        trackingCode: newOrder.trackingCode,
        pointsEarned: newOrder.pointsEarned,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch((err) => handleFirestoreError(err, OperationType.CREATE, path));
    }

    return newOrder;
  };

  const handleImportProducts = (newItems: CatalogProduct[]) => {
    setProducts((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const uniqueNew = newItems.filter((item) => !existingIds.has(item.id));
      return [...uniqueNew, ...prev];
    });
  };

  const totalBagCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isAr = lang === 'ar';

  /* ==========================================================================
   * SEPARATED STANDALONE EXECUTIVE ADMIN PORTAL ENVIRONMENT (/admin)
   * Completely isolated from the public customer website header, menu & footer
   * ======================================================================== */
  if (environmentMode === 'admin') {
    return (
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="min-h-screen flex flex-col bg-[#F4F3EF] text-stone-900"
      >
        <header className="sticky top-0 z-40 bg-[#18181B] text-[#FAF8F5] border-b border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-amber-400/15 text-amber-300 border border-amber-400/30">
                <Lock className="w-4 h-4" />
              </span>
              <div>
                <p className="font-display text-lg font-semibold text-white leading-none">
                  {isAr
                    ? 'بوابة الإدارة التنفيذية المستقلة'
                    : 'West Gulf Agency · Executive Admin Portal'}
                </p>
                <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                  {isAr
                    ? 'بيئة معزولة عن الموقع الأمامي · /admin'
                    : 'Isolated Back-Office Environment · /admin'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
                className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-stone-900 border border-stone-700 rounded-lg hover:bg-stone-800"
              >
                {isAr ? 'English (EN)' : 'العربية (AR)'}
              </button>

              <button
                type="button"
                onClick={exitAdminPortalToStorefront}
                className="px-4 py-2 text-xs font-semibold bg-[#D4AF37] text-stone-950 rounded-lg hover:bg-[#e0bd46] transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>
                  {isAr ? 'العودة إلى واجهة المتجر' : 'Return to Public Storefront'}
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <AdminDashboardView
            lang={lang}
            products={products}
            orders={orders}
            reviews={reviews}
            suppliers={suppliers}
            onImportProducts={handleImportProducts}
            onUpdateOrderStatus={(orderId, status) =>
              setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status } : o))
              )
            }
            onUpdateReviewStatus={(reviewId, status) =>
              setReviews((prev) =>
                prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
              )
            }
            onToggleSupplierConnection={(supId) =>
              setSuppliers((prev) =>
                prev.map((s) =>
                  s.id === supId ? { ...s, connected: !s.connected } : s
                )
              )
            }
          />
        </main>
      </div>
    );
  }

  /* ==========================================================================
   * PUBLIC FRONT-END STOREFRONT & CLIENT DASHBOARD ENVIRONMENT
   * Zero Admin Dashboard links on the public navigation, hero, or mobile menu
   * ======================================================================== */
  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900"
    >
      {/* PUBLIC TOP HEADER WITH DESKTOP SHOP SUB-MENU & MOBILE MENU BUTTON */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-xs border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Mobile Menu Button (on mobile/tablet) + Brand Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs font-semibold hover:bg-stone-100 transition-colors shrink-0"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-stone-900" />
              ) : (
                <Menu className="w-4 h-4 text-stone-900" />
              )}
              <span>{isAr ? 'القائمة' : 'Menu'}</span>
            </button>

            <a
              href="#shop"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateShopCategory('all', 'all');
              }}
              className="font-display text-base sm:text-2xl font-bold tracking-tight text-stone-900 truncate"
            >
              West Gulf Agency Shop
            </a>
          </div>

          {/* Center: Desktop Navigation Links with "Shop" Mega Sub-Menu Dropdown */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600"
          >
            {/* SHOP MENU WITH ALL CATEGORIES AS SUB-MENUS */}
            <div
              className="relative"
              onMouseLeave={() => setIsDesktopShopDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsDesktopShopDropdownOpen((prev) => !prev)}
                aria-expanded={isDesktopShopDropdownOpen}
                className={`inline-flex items-center gap-1.5 py-2 hover:text-stone-900 transition-colors whitespace-nowrap ${
                  activePage === 'shop'
                    ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-2 decoration-amber-800'
                    : ''
                }`}
              >
                <span>{isAr ? 'المتجر والأقسام' : 'Shop'}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isDesktopShopDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isDesktopShopDropdownOpen && (
                <div className="absolute left-0 top-full pt-2 w-[620px] z-50">
                  <div className="bg-white border border-stone-200 rounded-2xl shadow-xl p-6 grid grid-cols-2 gap-4">
                    {SHOP_CATEGORY_SUBMENUS.map((cat) => (
                      <div
                        key={cat.id}
                        className={`p-3.5 rounded-xl border border-stone-100 hover:border-amber-800/40 bg-stone-50/70 space-y-2 ${
                          cat.id === 'all' ? 'col-span-2 bg-stone-900 text-white' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleNavigateShopCategory(cat.id, 'all')}
                          className={`text-left w-full font-display text-base font-semibold flex items-center justify-between ${
                            cat.id === 'all'
                              ? 'text-amber-300 hover:text-white'
                              : 'text-stone-900 hover:text-amber-800'
                          }`}
                        >
                          <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                          <span className="text-xs font-mono">→</span>
                        </button>
                        <p
                          className={`text-xs ${
                            cat.id === 'all' ? 'text-stone-300' : 'text-stone-500'
                          }`}
                        >
                          {isAr ? cat.descriptionAr : cat.descriptionEn}
                        </p>

                        {cat.subCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {cat.subCategories.map((sub) => (
                              <button
                                key={sub.value}
                                type="button"
                                onClick={() =>
                                  handleNavigateShopCategory(
                                    cat.id as ProductCategory,
                                    sub.value
                                  )
                                }
                                className="px-2.5 py-1 text-[11px] font-medium bg-white border border-stone-200 rounded-md text-stone-700 hover:border-amber-800 hover:text-amber-900 transition-colors"
                              >
                                {isAr ? sub.labelAr : sub.labelEn}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleNavigatePage('track-order')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap py-1 ${
                activePage === 'track-order'
                  ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-2 decoration-amber-800'
                  : ''
              }`}
            >
              {isAr ? 'تتبع الطلب' : 'Track Order'}
            </button>

            <button
              type="button"
              onClick={() => handleNavigatePage('about')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap py-1 ${
                activePage === 'about'
                  ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-2 decoration-amber-800'
                  : ''
              }`}
            >
              {isAr ? 'من نحن' : 'About Us'}
            </button>

            <button
              type="button"
              onClick={() => handleNavigatePage('contact')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap py-1 ${
                activePage === 'contact'
                  ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-2 decoration-amber-800'
                  : ''
              }`}
            >
              {isAr ? 'اتصل بنا' : 'Contact Us'}
            </button>

            <button
              type="button"
              onClick={() => handleNavigatePage('sign-in')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap py-1 ${
                activePage === 'sign-in'
                  ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-2 decoration-amber-800'
                  : ''
              }`}
            >
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => handleNavigatePage('client-dashboard')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap py-1 inline-flex items-center gap-1.5 ${
                activePage === 'client-dashboard'
                  ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-2 decoration-amber-800'
                  : ''
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-amber-800" />
              <span>
                {isAr ? `حسابي (${loyaltyPoints})` : `Client Dashboard (${loyaltyPoints} Pts)`}
              </span>
            </button>
          </nav>

          {/* Right: Language Toggle & Shopping Bag */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
              aria-label="Switch Language English or Arabic"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-amber-900 hover:text-stone-900 transition-colors whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isAr ? 'English (EN)' : 'العربية (AR)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 font-mono tabular-nums inline-flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isAr ? `السلة (${totalBagCount})` : `Bag (${totalBagCount})`}</span>
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION DRAWER (OPENED VIA MENU BUTTON ON MOBILE DEVICES) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-stone-200 shadow-xl px-4 py-5 space-y-4 max-h-[82vh] overflow-y-auto">
            {/* Expandable "Shop" Menu with All Categories & Sub-Categories */}
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setIsMobileShopExpanded((prev) => !prev)}
                className="w-full px-4 py-3 bg-stone-100 flex items-center justify-between text-sm font-semibold text-stone-900"
              >
                <span>{isAr ? 'المتجر وجميع الأقسام (Shop)' : 'Shop Categories'}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isMobileShopExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isMobileShopExpanded && (
                <div className="p-3 space-y-3 bg-white">
                  {SHOP_CATEGORY_SUBMENUS.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 space-y-2"
                    >
                      <button
                        type="button"
                        onClick={() => handleNavigateShopCategory(cat.id, 'all')}
                        className="w-full text-left text-xs font-bold text-stone-900 flex items-center justify-between"
                      >
                        <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                        <span className="text-amber-800 font-mono">→</span>
                      </button>

                      {cat.subCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {cat.subCategories.map((sub) => (
                            <button
                              key={sub.value}
                              type="button"
                              onClick={() =>
                                handleNavigateShopCategory(
                                  cat.id as ProductCategory,
                                  sub.value
                                )
                              }
                              className="px-2.5 py-1 text-[11px] bg-white border border-stone-200 rounded-md text-stone-700 font-medium"
                            >
                              {isAr ? sub.labelAr : sub.labelEn}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main Mobile Menu Pages */}
            <div className="grid grid-cols-1 gap-1.5 text-sm font-medium">
              <button
                type="button"
                onClick={() => handleNavigatePage('track-order')}
                className={`w-full text-left px-4 py-2.5 rounded-lg ${
                  activePage === 'track-order'
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'text-stone-800 hover:bg-stone-100'
                }`}
              >
                {isAr ? 'تتبع الطلب (Track Order)' : 'Track Order'}
              </button>

              <button
                type="button"
                onClick={() => handleNavigatePage('about')}
                className={`w-full text-left px-4 py-2.5 rounded-lg ${
                  activePage === 'about'
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'text-stone-800 hover:bg-stone-100'
                }`}
              >
                {isAr ? 'من نحن (About Us)' : 'About Us'}
              </button>

              <button
                type="button"
                onClick={() => handleNavigatePage('contact')}
                className={`w-full text-left px-4 py-2.5 rounded-lg ${
                  activePage === 'contact'
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'text-stone-800 hover:bg-stone-100'
                }`}
              >
                {isAr ? 'اتصل بنا (Contact Us)' : 'Contact Us'}
              </button>

              <button
                type="button"
                onClick={() => handleNavigatePage('sign-in')}
                className={`w-full text-left px-4 py-2.5 rounded-lg ${
                  activePage === 'sign-in'
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'text-stone-800 hover:bg-stone-100'
                }`}
              >
                {isAr ? 'تسجيل الدخول (Sign In)' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => handleNavigatePage('client-dashboard')}
                className={`w-full text-left px-4 py-2.5 rounded-lg ${
                  activePage === 'client-dashboard'
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'text-stone-800 hover:bg-stone-100'
                }`}
              >
                {isAr
                  ? `لوحة العميل والولاء (${loyaltyPoints} نقطة)`
                  : `Client Dashboard & Loyalty (${loyaltyPoints} Pts)`}
              </button>
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
                  setIsMobileMenuOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-amber-100 text-amber-950 rounded-lg"
              >
                {isAr ? 'Switch to English (EN)' : 'التبديل إلى العربية (AR)'}
              </button>
              <span className="text-[11px] text-stone-500">
                {isAr ? 'شحن حصري للإمارات السبع' : '7 UAE Emirates Exclusive'}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* MAIN PUBLIC VIEWPORT */}
      <main className="flex-1">
        {activePage === 'shop' && (
          <StorefrontView
            lang={lang}
            products={products}
            reviews={reviews}
            externalCategory={selectedShopCategory}
            externalSubCategory={selectedShopSubCategory}
            onAddToCart={handleAddToCart}
            onShareProduct={handleShareProduct}
            onSubmitReview={handleSubmitReview}
            onNavigateTrackOrder={() => handleNavigatePage('track-order')}
          />
        )}

        {activePage === 'track-order' && (
          <TrackOrderPage
            lang={lang}
            orders={orders}
            onNavigateShop={(cat) => handleNavigateShopCategory(cat || 'all', 'all')}
          />
        )}

        {activePage === 'about' && (
          <AboutUsPage
            lang={lang}
            onNavigateShop={(cat) => handleNavigateShopCategory(cat || 'all', 'all')}
            onNavigateContact={() => handleNavigatePage('contact')}
          />
        )}

        {activePage === 'contact' && <ContactUsPage lang={lang} />}

        {activePage === 'sign-in' && (
          <SignInPage
            lang={lang}
            userName={userName}
            userEmail={userEmail}
            loyaltyPoints={loyaltyPoints}
            isGoogleSignedIn={Boolean(firebaseUser)}
            onGoogleSignIn={handleGoogleSignIn}
            onCustomerEmailSignIn={(name, email) => {
              setUserName(name);
              setUserEmail(email);
            }}
            onOpenClientDashboard={() => handleNavigatePage('client-dashboard')}
            onLaunchAdminPortal={launchSeparatedAdminPortal}
          />
        )}

        {activePage === 'client-dashboard' && (
          <ProfileLoyaltyView
            lang={lang}
            userName={userName}
            userEmail={userEmail}
            isGoogleSignedIn={Boolean(firebaseUser)}
            loyaltyPoints={loyaltyPoints}
            referralCode={referralCode}
            pushEnabled={pushEnabled}
            promoEnabled={promoEnabled}
            orders={orders}
            addresses={addresses}
            pointsLedger={pointsLedger}
            onGoogleSignIn={handleGoogleSignIn}
            onSignOut={handleSignOut}
            onToggleNotifications={(type, val) => {
              if (type === 'push') setPushEnabled(val);
              else setPromoEnabled(val);
            }}
            onAddAddress={(addr) =>
              setAddresses((prev) => [
                ...prev.map((a) => (addr.isDefault ? { ...a, isDefault: false } : a)),
                { ...addr, id: `addr-${Date.now()}` },
              ])
            }
            onDeleteAddress={(id) =>
              setAddresses((prev) => prev.filter((a) => a.id !== id))
            }
            onSetDefaultAddress={(id) =>
              setAddresses((prev) =>
                prev.map((a) => ({ ...a, isDefault: a.id === id }))
              )
            }
            onSimulateReferralSignup={() => {
              setLoyaltyPoints((pts) => pts + 200);
              setPointsLedger((prev) => [
                {
                  id: `ref-${Date.now()}`,
                  reason: `Referral Bonus (${referralCode})`,
                  points: 200,
                  date: 'Today',
                },
                ...prev,
              ]);
            }}
          />
        )}
      </main>

      {/* PUBLIC EDITORIAL FOOTER (NO PUBLIC ADMIN LINKS) */}
      <footer className="bg-white border-t border-stone-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            <span className="font-semibold text-stone-900">West Gulf Agency Shop</span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span>
              {isAr
                ? 'شحن حصري لجميع الإمارات السبع (دبي، أبوظبي، الشارقة، عجمان، رأس الخيمة، الفجيرة، أم القيوين)'
                : 'Exclusively Serving All 7 UAE Emirates · Dubai South & DIFC Logistics Network'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => handleNavigateShopCategory('all', 'all')}
              className="hover:text-stone-900"
            >
              {isAr ? 'المتجر' : 'Shop'}
            </button>
            <button
              type="button"
              onClick={() => handleNavigatePage('track-order')}
              className="hover:text-stone-900"
            >
              {isAr ? 'تتبع الطلب' : 'Track Order'}
            </button>
            <button
              type="button"
              onClick={() => handleNavigatePage('about')}
              className="hover:text-stone-900"
            >
              {isAr ? 'من نحن' : 'About Us'}
            </button>
            <button
              type="button"
              onClick={() => handleNavigatePage('contact')}
              className="hover:text-stone-900"
            >
              {isAr ? 'اتصل بنا' : 'Contact Us'}
            </button>
            <button
              type="button"
              onClick={() => handleNavigatePage('sign-in')}
              className="hover:text-stone-900"
            >
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          </div>
        </div>
      </footer>

      {/* SLIDE-OVER CART & UAE CHECKOUT */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        lang={lang}
        cart={cart}
        loyaltyPoints={loyaltyPoints}
        savedAddresses={addresses}
        defaultCustomerName={userName}
        defaultCustomerEmail={userEmail}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onCompleteOrder={handleCompleteOrder}
      />

      {/* LIVE SUPPORT CONCIERGE WIDGET */}
      <LiveChatWidget lang={lang} />
    </div>
  );
}
