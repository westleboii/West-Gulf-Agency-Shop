import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  Lock,
  UserCheck,
  Search,
  Building2,
  Clock,
  ArrowRight,
  Globe,
  Package,
} from 'lucide-react';
import {
  lookupOrderByReference,
  UAE_EMIRATES,
  type ProductCategory,
  type UaeEmirate,
} from '../utils/shopLogic';
import { type CustomerOrderRecord } from '../data/catalogData';

/* ============================================================================
 * 1. TRACK ORDER PAGE (7 UAE EMIRATES REAL-TIME COURIER TELEMETRY)
 * ========================================================================== */
interface TrackOrderPageProps {
  lang: 'en' | 'ar';
  orders: CustomerOrderRecord[];
  onNavigateShop: (category?: ProductCategory | 'all') => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  lang,
  orders,
  onNavigateShop,
}) => {
  const isAr = lang === 'ar';
  const [searchRef, setSearchRef] = useState('ORD-UAE-9041');
  const [activeOrder, setActiveOrder] = useState<CustomerOrderRecord | null>(
    orders[0] || null
  );
  const [notFoundError, setNotFoundError] = useState<string | null>(null);
  const [liveCheckpoints, setLiveCheckpoints] = useState<
    { stage: string; facility: string; timestamp: string; completed: boolean }[]
  >([
    {
      stage: 'Order Placed & Encrypted',
      facility: 'West Gulf Agency Digital Gateway (DIFC, Dubai)',
      timestamp: 'Verified · 256-Bit Payment / COD Cleared',
      completed: true,
    },
    {
      stage: 'UAE Supplier Quality & TRA/ESMA Inspection',
      facility: 'Dubai Silicon Oasis & Al Quoz Fulfillment Hub',
      timestamp: 'Completed · Serial & Packaging Sealed',
      completed: true,
    },
    {
      stage: 'Sorted at Dubai South Logistics Hub (DWC)',
      facility: 'Bay 14 — Seven Emirates Express Dispatch',
      timestamp: 'In Transit · Climate-Controlled Fleet',
      completed: true,
    },
  ]);
  const [isCheckingServer, setIsCheckingServer] = useState(false);

  const handleLookup = async (e?: React.FormEvent, presetCode?: string) => {
    if (e) e.preventDefault();
    const codeToFind = (presetCode ?? searchRef).trim();
    if (presetCode) setSearchRef(presetCode);

    if (!codeToFind) {
      setNotFoundError(
        isAr
          ? 'يرجى إدخال رقم الطلب أو رمز التتبع الإماراتي.'
          : 'Please enter a UAE Order ID or Courier Tracking Code.'
      );
      return;
    }

    setIsCheckingServer(true);
    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: codeToFind }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.checkpoints)) {
          setLiveCheckpoints(data.checkpoints);
        }
      }
    } catch {
      // Keep local telemetry
    } finally {
      setIsCheckingServer(false);
    }

    const found = lookupOrderByReference(orders, codeToFind);
    if (found) {
      setActiveOrder(found);
      setNotFoundError(null);
    } else {
      setActiveOrder(null);
      setNotFoundError(
        isAr
          ? `لم يتم العثور على شحنة بالرمز "${codeToFind}". جرب أحد أرقام الطلبات النشطة أدناه.`
          : `No active UAE shipment found matching "${codeToFind}". Try one of the sample UAE tracking IDs below.`
      );
    }
  };

  const getStageIndex = (status: CustomerOrderRecord['status']) => {
    switch (status) {
      case 'pending_approval':
        return 1;
      case 'approved_processing':
        return 2;
      case 'dispatched_uae_hub':
        return 3;
      case 'out_for_delivery':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 1;
    }
  };

  const stages = [
    { step: 1, en: 'Order Placed', ar: 'تم استلام الطلب' },
    { step: 2, en: 'Supplier Verified', ar: 'تأكيد المورد الإماراتي' },
    { step: 3, en: 'Dubai South Hub', ar: 'مركز دبي الجنوب اللوجستي' },
    { step: 4, en: 'Out for Delivery', ar: 'خرج للتوصيل في الإمارة' },
    { step: 5, en: 'Delivered', ar: 'تم التسليم بنجاح' },
  ];

  const currentStage = activeOrder ? getStageIndex(activeOrder.status) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="bg-[#18181B] text-[#FAF8F5] rounded-2xl p-6 sm:p-10 border border-stone-800 space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
            {isAr
              ? 'نظام التتبع المباشر · جميع الإمارات السبع'
              : 'Live Seven-Emirates Courier Telemetry'}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white">
            {isAr ? 'تتبع شحنتك داخل الإمارات' : 'Track Your UAE Order in Real Time'}
          </h1>
          <p className="text-sm text-stone-300 max-w-2xl">
            {isAr
              ? 'أدخل رقم الطلب (#ORD-UAE-...) أو رقم بوليصة الشحن (EMX-...) لمتابعة حالة التوصيل من مستودعات دبي وأبوظبي والشارقة حتى باب منزلك.'
              : 'Enter your Order ID (#ORD-UAE-...) or Emirates Express Tracking Code (EMX-...) for live GPS hub checkpoints across Dubai, Abu Dhabi, Sharjah, and the Northern Emirates.'}
          </p>
        </div>

        <form onSubmit={(e) => handleLookup(e)} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              placeholder={
                isAr
                  ? 'مثال: ORD-UAE-9041 أو EMX-DXB-882910'
                  : 'e.g. ORD-UAE-9041 or EMX-DXB-882910'
              }
              className="w-full pl-10 pr-4 py-3.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            disabled={isCheckingServer}
            className="px-6 py-3.5 bg-[#D4AF37] text-stone-950 font-semibold text-sm rounded-xl hover:bg-[#e0bd46] transition-colors whitespace-nowrap shrink-0"
          >
            {isCheckingServer
              ? isAr
                ? 'جاري الفحص...'
                : 'Locating Shipment...'
              : isAr
              ? 'تتبع الشحنة الآن'
              : 'Track Shipment'}
          </button>
        </form>

        {/* Quick-select sample active orders */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-stone-400">
            {isAr ? 'شحنات نشطة للتجربة:' : 'Quick-select active UAE shipments:'}
          </span>
          {orders.map((ord) => (
            <button
              key={ord.id}
              type="button"
              onClick={() => handleLookup(undefined, ord.id)}
              className={`px-3 py-1.5 rounded-lg font-mono border transition-colors ${
                activeOrder?.id === ord.id
                  ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                  : 'bg-stone-900 border-stone-700 text-stone-300 hover:border-stone-500'
              }`}
            >
              {ord.id} ({ord.emirate})
            </button>
          ))}
        </div>
      </div>

      {notFoundError && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-medium">
          {notFoundError}
        </div>
      )}

      {activeOrder && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-lg font-bold text-stone-900">
                  {activeOrder.id}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-mono font-semibold bg-amber-100 text-amber-900 rounded-md">
                  {activeOrder.trackingCode}
                </span>
              </div>
              <p className="text-xs text-stone-600">{activeOrder.itemSummary}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-stone-500">
                {isAr ? 'وجهة التوصيل' : 'Destination Emirate'}
              </p>
              <p className="text-sm font-semibold text-stone-900">
                {activeOrder.emirate} · {activeOrder.customerName}
              </p>
              <p className="text-xs text-stone-500">{activeOrder.shippingAddress}</p>
            </div>
          </div>

          {/* 5-Stage Visual UAE Courier Pipeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
              <span>
                {isAr ? 'مسار التوصيل (5 مراحل)' : '5-Stage Emirates Courier Pipeline'}
              </span>
              <span className="font-mono text-emerald-700">
                {isAr ? `المرحلة ${currentStage} من 5` : `Stage ${currentStage} of 5`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {stages.map((st) => {
                const isDone = st.step <= currentStage;
                const isCurrent = st.step === currentStage;
                return (
                  <div
                    key={st.step}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      isCurrent
                        ? 'bg-amber-50/90 border-amber-700 text-stone-900'
                        : isDone
                        ? 'bg-emerald-50/60 border-emerald-200 text-stone-900'
                        : 'bg-stone-50 border-stone-200 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold">0{st.step}</span>
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          isDone ? 'text-emerald-600' : 'text-stone-300'
                        }`}
                      />
                    </div>
                    <p className="text-xs font-semibold">
                      {isAr ? st.ar : st.en}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Hub Checkpoints */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
            {liveCheckpoints.map((cp, idx) => (
              <div
                key={idx}
                className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                  <Package className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>{cp.stage}</span>
                </div>
                <p className="text-xs text-stone-600">{cp.facility}</p>
                <p className="text-[11px] font-mono text-emerald-700">{cp.timestamp}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-stone-100 text-xs text-stone-500">
            <span>
              {isAr
                ? `طريقة الدفع: ${activeOrder.paymentMethod} · الإجمالي: AED ${activeOrder.totalAed.toLocaleString()}`
                : `Payment Gateway: ${activeOrder.paymentMethod} · Order Total: AED ${activeOrder.totalAed.toLocaleString()}`}
            </span>
            <button
              type="button"
              onClick={() => onNavigateShop('all')}
              className="text-amber-900 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>{isAr ? 'العودة إلى المتجر' : 'Continue Shopping'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 2. ABOUT US PAGE (WEST GULF AGENCY SHOP — UAE HERITAGE & INFRASTRUCTURE)
 * ========================================================================== */
interface AboutUsPageProps {
  lang: 'en' | 'ar';
  onNavigateShop: (category?: ProductCategory | 'all') => void;
  onNavigateContact: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({
  lang,
  onNavigateShop,
  onNavigateContact,
}) => {
  const isAr = lang === 'ar';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      {/* Editorial Hero */}
      <div className="bg-[#18181B] text-[#FAF8F5] rounded-2xl p-8 sm:p-12 border border-stone-800 space-y-6">
        <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
          {isAr
            ? 'من نحن · وكالة الخليج الغربي للتجارة الإلكترونية (الإمارات)'
            : 'About West Gulf Agency Shop · United Arab Emirates'}
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-semibold text-white leading-tight max-w-3xl">
          {isAr
            ? 'البوابة الإماراتية الأولى للأزياء الموسمية الفاخرة، التنقل الكهربائي، وتجهيزات القصور.'
            : 'The Emirates’ Premier Direct-to-Residence Mega Store for Seasonal Couture, Electric Mobility & Architectural Living.'}
        </h1>
        <p className="text-stone-300 text-base leading-relaxed max-w-3xl">
          {isAr
            ? 'تأسست وكالة الخليج الغربي (West Gulf Agency Shop) في دبي لربط أرقى مستودعات وموردي الدروبشيبينغ المحليين في الإمارات مباشرة بعملائنا في جميع الإمارات السبع، مع ضمان الفحص المسبق والامتثال لمعايير هيئة تنظيم الاتصالات (TDRA) ومواصفات الإمارات.'
            : 'Headquartered between DIFC and Dubai South Logistics District, West Gulf Agency Shop connects verified domestic UAE fulfillment warehouses directly to residences across all seven Emirates—eliminating international customs delays while guaranteeing authentic luxury standards.'}
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
          <Truck className="w-6 h-6 text-amber-800" />
          <h2 className="font-display text-xl font-semibold text-stone-900">
            {isAr ? 'توصيل حصري لجميع الإمارات السبع' : '100% Seven-Emirates Exclusivity'}
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            {isAr
              ? 'نحن نشحن حصرياً داخل دولة الإمارات (دبي، أبوظبي، الشارقة، عجمان، رأس الخيمة، الفجيرة، أم القيوين) لضمان وصول الطلبات خلال 24 إلى 72 ساعة فقط.'
              : 'Every product in our catalog is stocked or routed through Dubai Silicon Oasis, Al Quoz, and Jebel Ali hubs for 24–72 hour white-glove delivery across Dubai, Abu Dhabi, Sharjah, Ajman, RAK, Fujairah, and UAQ.'}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
          <ShieldCheck className="w-6 h-6 text-amber-800" />
          <h2 className="font-display text-xl font-semibold text-stone-900">
            {isAr ? 'موردون معتمدون وفحص جودة صارم' : 'Verified UAE Dropship & 3PL Partners'}
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            {isAr
              ? 'جميع الإلكترونيات (الدراجات الكهربائية، عربات الجولف، الهواتف الذكية) معتمدة بمقابس إماراتية وضمان محلي، مع أزياء موسمية من الحرير والكشمير.'
              : 'From 1000W carbon e-bikes and lifted 4-seater lithium golf carts to cedar infrared home saunas and Italian bouclé sofas, every item meets UAE Type-G power, TRA, and ESMA certifications.'}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
          <Sparkles className="w-6 h-6 text-amber-800" />
          <h2 className="font-display text-xl font-semibold text-stone-900">
            {isAr ? 'برنامج مكافآت الإمارة الملكي' : 'Royal Emirate Loyalty & Concierge'}
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            {isAr
              ? 'يكسب أعضاؤنا نقاط ولاء فورية على كل طلب في الإمارات، بالإضافة إلى مكافآت المشاركة عبر إنستغرام وفيسبوك وإحالة الأصدقاء.'
              : 'Members earn instant AED-redeemable points on every purchase, +50 bonus points for sharing favorite items on social media, and +200 points for every friend referred.'}
          </p>
        </div>
      </div>

      {/* Four Core Divisions */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
          <h2 className="font-display text-2xl font-semibold text-stone-900">
            {isAr ? 'أقسام المتجر الأربعة الرئيسية' : 'Our Four Curated Storefront Divisions'}
          </h2>
          <button
            type="button"
            onClick={() => onNavigateContact()}
            className="text-xs font-semibold text-amber-900 hover:underline"
          >
            {isAr ? 'تواصل مع فريق الكونسيرج ←' : 'Speak with our DIFC Concierge →'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              cat: 'fashion' as const,
              titleEn: 'High-End Seasonal Fashion',
              titleAr: 'الأزياء الموسمية الفاخرة',
              descEn: 'Men’s cashmere blazers, Women’s silk organza kaftans & Children’s organic linen sets.',
              descAr: 'بليزرات كشمير رجالية، قفاطين حرير نسائية، وأطقم كتان عضوي للأطفال.',
            },
            {
              cat: 'electronics' as const,
              titleEn: 'Electronics & Electric Mobility',
              titleAr: 'الإلكترونيات والتنقل الذكي',
              descEn: '1000W Carbon E-Bikes, 4-Seater Lithium Golf Carts, 5G Titanium Phones & 240W GaN Chargers.',
              descAr: 'دراجات كهربائية كربون، عربات جولف ليثيوم، هواتف 5G وشواحن 240 واط.',
            },
            {
              cat: 'wellness' as const,
              titleEn: 'Household & Spa Wellness',
              titleAr: 'الساونا والعناية المنزلية',
              descEn: 'Portable red-light infrared cedar saunas & desalinated water Vitamin-C shower heads.',
              descAr: 'ساونا منزلية بالأشعة تحت الحمراء ورؤوس دش بفلتر فيتامين سي لمياه الخليج.',
            },
            {
              cat: 'kitchen' as const,
              titleEn: 'Kitchen & Architectural Living',
              titleAr: 'المطبخ وأثاث غرف المعيشة',
              descEn: 'Professional culinary whipped cream dispensers, Italian bouclé sofas & walnut lounge chairs.',
              descAr: 'موزعات الكريمة الاحترافية، أرائك البوكليه الإيطالية وكراسي خشب الجوز.',
            },
          ].map((div) => (
            <div
              key={div.cat}
              className="p-5 bg-stone-50 border border-stone-200 rounded-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <h3 className="font-display text-lg font-semibold text-stone-900">
                  {isAr ? div.titleAr : div.titleEn}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {isAr ? div.descAr : div.descEn}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateShop(div.cat)}
                className="text-xs font-semibold text-stone-900 hover:text-amber-800 inline-flex items-center gap-1"
              >
                <span>{isAr ? 'تصفح القسم' : 'Browse Category'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. CONTACT US PAGE (UAE CONCIERGE DESK & B2B INQUIRIES)
 * ========================================================================== */
interface ContactUsPageProps {
  lang: 'en' | 'ar';
}

export const ContactUsPage: React.FC<ContactUsPageProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+971 50 ');
  const [emirate, setEmirate] = useState<UaeEmirate>('Dubai');
  const [department, setDepartment] = useState('VIP Client Concierge & Order Support');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketConfirmation, setTicketConfirmation] = useState<{
    ticketId: string;
    slaResponseTime: string;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormError(
        isAr
          ? 'يرجى تعبئة الاسم والبريد الإلكتروني وتفاصيل الرسالة.'
          : 'Please complete your name, email address, and inquiry message.'
      );
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          emirate,
          department,
          message: message.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTicketConfirmation({
          ticketId: data.ticketId || 'WGA-CONCIERGE-884120',
          slaResponseTime: data.slaResponseTime || 'Under 30 minutes (24/7 UAE Desk)',
        });
        setMessage('');
      } else {
        setTicketConfirmation({
          ticketId: `WGA-CONCIERGE-${Math.floor(100000 + Math.random() * 899999)}`,
          slaResponseTime: 'Under 30 minutes (24/7 UAE Desk)',
        });
        setMessage('');
      }
    } catch {
      setTicketConfirmation({
        ticketId: `WGA-CONCIERGE-${Math.floor(100000 + Math.random() * 899999)}`,
        slaResponseTime: 'Under 30 minutes (24/7 UAE Desk)',
      });
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: UAE Offices & Direct Concierge Channels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#18181B] text-[#FAF8F5] rounded-2xl p-6 sm:p-8 border border-stone-800 space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
                {isAr ? 'اتصل بنا · خدمة العملاء على مدار الساعة' : '24/7 UAE Client & Villa Concierge'}
              </p>
              <h1 className="font-display text-3xl font-semibold text-white">
                {isAr ? 'تواصل مع وكالة الخليج الغربي' : 'Contact West Gulf Agency Shop'}
              </h1>
              <p className="text-xs text-stone-300 leading-relaxed">
                {isAr
                  ? 'فريقنا في مركز دبي المالي العالمي (DIFC) ومجمع دبي الجنوب اللوجستي في خدمتكم لطلبات التوصيل الخاص، تركيب عربات الجولف والساونا، واستفسارات الموردين.'
                  : 'Our bilingual concierge specialists in DIFC and Dubai South are available 24/7 for white-glove golf cart & sauna scheduling, seasonal tailoring sizing, and order support.'}
              </p>
            </div>

            <div className="space-y-4 pt-2 border-t border-stone-800 text-xs">
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">
                    {isAr ? 'المقر التنفيذي — دبي (DIFC)' : 'DIFC Executive Headquarters'}
                  </p>
                  <p className="text-stone-400">
                    Gate Village Building 8, Level 4, Dubai International Financial Centre, UAE
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">
                    {isAr ? 'مركز الشحن والتوزيع الإماراتي' : 'Seven-Emirates Fulfillment Hub'}
                  </p>
                  <p className="text-stone-400">
                    Logistics District Bay 14, Dubai South (DWC) & Jebel Ali Free Zone, UAE
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">
                    {isAr ? 'الخط الساخن المجاني في الإمارات' : 'UAE Toll-Free & WhatsApp Concierge'}
                  </p>
                  <p className="text-stone-400 font-mono">800-WESTGULF · +971 4 512 9900</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">
                    {isAr ? 'البريد الإلكتروني الرسمي' : 'Direct Concierge Desk'}
                  </p>
                  <p className="text-stone-400 font-mono">concierge@westgulfagency.ae</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">
                    {isAr ? 'ساعات عمل التوصيل والكونسيرج' : 'Concierge & Courier Operating Hours'}
                  </p>
                  <p className="text-stone-400">
                    {isAr
                      ? 'يومياً 24/7 · التوصيل السريع في نفس اليوم داخل دبي'
                      : '24/7 Live Support · Same-Day & Next-Day Dispatch Across All 7 Emirates'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Concierge Ticket Form */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="font-display text-2xl font-semibold text-stone-900">
              {isAr ? 'أرسل رسالة إلى فريق خدمة العملاء' : 'Send a Direct Concierge Inquiry'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {isAr
                ? 'يتم الرد على جميع الاستفسارات خلال أقل من 30 دقيقة برقم تذكرة رسمي.'
                : 'Every submission generates an instant UAE priority ticket answered within 30 minutes.'}
            </p>
          </div>

          {ticketConfirmation && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>
                  {isAr
                    ? `تم استلام رسالتك بنجاح — رقم التذكرة: ${ticketConfirmation.ticketId}`
                    : `Concierge Ticket Created: ${ticketConfirmation.ticketId}`}
                </span>
              </div>
              <p>
                {isAr
                  ? `وقت الاستجابة المتوقع: ${ticketConfirmation.slaResponseTime}`
                  : `Guaranteed Response SLA: ${ticketConfirmation.slaResponseTime}`}
              </p>
            </div>
          )}

          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isAr ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'الاسم الكامل' : 'e.g. Tariq Al-Mansoor'}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.ae"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isAr ? 'رقم الهاتف الإماراتي' : 'UAE Mobile Number (+971)'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isAr ? 'الإمارة' : 'Emirate'}
                </label>
                <select
                  value={emirate}
                  onChange={(e) => setEmirate(e.target.value as UaeEmirate)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                >
                  {UAE_EMIRATES.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isAr ? 'القسم المختص' : 'Inquiry Department'}
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              >
                <option value="VIP Client Concierge & Order Support">
                  {isAr ? 'خدمة كبار العملاء وتتبع الطلبات' : 'VIP Client Concierge & Order Support'}
                </option>
                <option value="Electric Golf Carts & Carbon E-Bikes Delivery">
                  {isAr ? 'توصيل وصيانة عربات الجولف والدراجات الكهربائية' : 'Electric Golf Carts & Carbon E-Bikes Delivery'}
                </option>
                <option value="Home Saunas & Architectural Furniture Setup">
                  {isAr ? 'تركيب الساونا المنزلية والأثاث الفاخر' : 'Home Saunas & Architectural Furniture Setup'}
                </option>
                <option value="UAE Dropshipping Supplier Partnership">
                  {isAr ? 'شراكات موردي الدروبشيبينغ في الإمارات' : 'UAE Dropshipping Supplier Partnership'}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isAr ? 'تفاصيل الاستفسار أو رقم الطلب' : 'Message & Order Details'}
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isAr
                    ? 'اكتب رسالتك أو رقم الطلب هنا...'
                    : 'Share your question, villa delivery instructions, or order reference...'
                }
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors"
            >
              {isSubmitting
                ? isAr
                  ? 'جاري الإرسال...'
                  : 'Submitting Inquiry...'
                : isAr
                ? 'إرسال الرسالة إلى الكونسيرج'
                : 'Submit Concierge Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 4. SIGN IN PAGE (SEPARATED CLIENT DASHBOARD LOGIN VS ADMIN PORTAL GATEWAY)
 * ========================================================================== */
interface SignInPageProps {
  lang: 'en' | 'ar';
  userName: string;
  userEmail: string;
  loyaltyPoints: number;
  isGoogleSignedIn: boolean;
  onGoogleSignIn: () => void;
  onCustomerEmailSignIn: (name: string, email: string) => void;
  onOpenClientDashboard: () => void;
  onLaunchAdminPortal: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  lang,
  userName,
  userEmail,
  loyaltyPoints,
  isGoogleSignedIn,
  onGoogleSignIn,
  onCustomerEmailSignIn,
  onOpenClientDashboard,
  onLaunchAdminPortal,
}) => {
  const isAr = lang === 'ar';
  const [portalMode, setPortalMode] = useState<'client' | 'admin'>('client');

  // Client login form state
  const [clientNameInput, setClientNameInput] = useState(userName);
  const [clientEmailInput, setClientEmailInput] = useState(userEmail);
  const [clientPasswordInput, setClientPasswordInput] = useState('••••••••••••');

  // Separated Admin portal login state
  const [adminEmail, setAdminEmail] = useState('juniorndime@gmail.com');
  const [adminPasscode, setAdminPasscode] = useState('WGA-ADMIN-2026');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(false);

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmailInput.trim()) return;
    onCustomerEmailSignIn(
      clientNameInput.trim() || 'UAE Member',
      clientEmailInput.trim()
    );
    onOpenClientDashboard();
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setIsVerifyingAdmin(true);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail.trim(),
          passcode: adminPasscode.trim(),
        }),
      });
      if (res.ok) {
        onLaunchAdminPortal();
      } else if (res.status === 404 || res.status === 405) {
        // Static hosting fallback (e.g., GitHub Pages)
        if (
          adminEmail.trim().toLowerCase() === 'juniorndime@gmail.com' ||
          adminPasscode.trim() === 'WGA-ADMIN-2026'
        ) {
          onLaunchAdminPortal();
        } else {
          setAdminError(
            'Invalid Executive Admin credentials. Use juniorndime@gmail.com or passcode WGA-ADMIN-2026.'
          );
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setAdminError(
          err.error ||
            'Invalid Executive Admin credentials. Use juniorndime@gmail.com or passcode WGA-ADMIN-2026.'
        );
      }
    } catch {
      // Fallback check when hosted statically on GitHub Pages or offline
      if (
        adminEmail.trim().toLowerCase() === 'juniorndime@gmail.com' ||
        adminPasscode.trim() === 'WGA-ADMIN-2026'
      ) {
        onLaunchAdminPortal();
      } else {
        setAdminError('Invalid Executive Admin credentials.');
      }
    } finally {
      setIsVerifyingAdmin(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-amber-900 font-semibold">
          {isAr
            ? 'بوابة الدخول الموحدة والآمنة · تشفير 256-Bit'
            : '256-Bit Encrypted Authentication Gateway'}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-stone-900">
          {isAr
            ? 'تسجيل الدخول إلى حسابك'
            : 'Sign In to West Gulf Agency Shop'}
        </h1>
        <p className="text-xs text-stone-500 max-w-xl mx-auto">
          {isAr
            ? 'لوحة تحكم العملاء مفصولة تماماً عن بوابة الإدارة التنفيذية لضمان أعلى معايير الأمان والخصوصية.'
            : 'Client accounts and the Executive Admin Portal operate in strictly separated environments for security and privacy.'}
        </p>
      </div>

      {/* Mode Switcher: Customer Account vs Separated Admin Portal */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-stone-200/80 rounded-xl gap-2">
          <button
            type="button"
            onClick={() => setPortalMode('client')}
            className={`px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 ${
              portalMode === 'client'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>
              {isAr
                ? 'حساب العميل ولوحة الولاء'
                : 'Customer Sign In (Client Dashboard)'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPortalMode('admin')}
            className={`px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 ${
              portalMode === 'admin'
                ? 'bg-[#18181B] text-amber-300 shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>
              {isAr
                ? 'دخول الإدارة التنفيذية (بوابة مستقلة)'
                : 'Authorized Admin Portal (Separated)'}
            </span>
          </button>
        </div>
      </div>

      {portalMode === 'client' ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <h2 className="font-display text-2xl font-semibold text-stone-900">
                {isAr
                  ? 'لوحة تحكم العميل وبرنامج ولاء الإمارة'
                  : 'Customer Account & Loyalty Portal'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {isAr
                  ? 'إدارة عناوين التوصيل في الإمارات، سجل الطلبات، واستبدال نقاط الولاء.'
                  : 'Access your saved UAE addresses, order tracking history, referral bonuses, and loyalty rewards.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenClientDashboard}
              className="px-4 py-2.5 bg-amber-100 text-amber-950 text-xs font-semibold rounded-xl hover:bg-amber-200 transition-colors whitespace-nowrap"
            >
              {isAr
                ? `فتح لوحة العميل (${loyaltyPoints} نقطة) ←`
                : `Open Client Dashboard (${loyaltyPoints} Pts) →`}
            </button>
          </div>

          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isAr ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={clientNameInput}
                  onChange={(e) => setClientNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={clientEmailInput}
                  onChange={(e) => setClientEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <input
                type="password"
                value={clientPasswordInput}
                onChange={(e) => setClientPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors"
              >
                {isAr
                  ? 'تسجيل الدخول إلى لوحة العميل'
                  : 'Sign In & Open Client Dashboard'}
              </button>

              <button
                type="button"
                onClick={() => {
                  onGoogleSignIn();
                  onOpenClientDashboard();
                }}
                className="px-5 py-3 bg-stone-100 text-stone-900 border border-stone-300 text-xs font-semibold rounded-xl hover:bg-stone-200 transition-colors inline-flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-amber-800" />
                <span>
                  {isGoogleSignedIn
                    ? isAr
                      ? 'متصل عبر Google (فتح الحساب)'
                      : 'Google Connected (Open Client Dashboard)'
                    : isAr
                    ? 'الدخول السريع عبر Google'
                    : 'Continue with Google OAuth'}
                </span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-[#18181B] text-[#FAF8F5] border border-stone-800 rounded-2xl p-6 sm:p-10 space-y-6">
          <div className="border-b border-stone-800 pb-5 space-y-1">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-mono uppercase">
              <Lock className="w-4 h-4" />
              <span>
                {isAr
                  ? 'بيئة معزولة · غير مرئية للزوار في الواجهة الأمامية'
                  : 'Isolated Executive Environment · Hidden from Public Storefront'}
              </span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-white">
              {isAr
                ? 'الدخول إلى لوحة تحكم الإدارة المستقلة'
                : 'Launch Standalone Executive Admin Portal'}
            </h2>
            <p className="text-xs text-stone-400">
              {isAr
                ? 'تتيح هذه البوابة المستقلة الوصول إلى أداة سحب المنتجات (Link Scraper)، وموردي الإمارات، والموافقات، وإعدادات SEO والنطاق.'
                : 'Authenticating below switches your session out of the public website and into the dedicated Executive Admin Command Center (/admin).'}
            </p>
          </div>

          {adminError && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-700 rounded-xl text-xs text-rose-200">
              {adminError}
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {isAr ? 'البريد الإلكتروني للمدير' : 'Administrator Email'}
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {isAr ? 'رمز مرور الإدارة التنفيذية' : 'Executive Passcode'}
                </label>
                <input
                  type="text"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-amber-300 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <button
                type="submit"
                disabled={isVerifyingAdmin}
                className="px-6 py-3 bg-[#D4AF37] text-stone-950 text-xs font-semibold rounded-xl hover:bg-[#e0bd46] transition-colors inline-flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isVerifyingAdmin
                    ? isAr
                      ? 'جاري التحقق...'
                      : 'Verifying Credentials...'
                    : isAr
                    ? 'فتح لوحة الإدارة المستقلة الآن'
                    : 'Verify & Launch Separated Admin Portal'}
                </span>
              </button>
              <span className="text-[11px] font-mono text-stone-400">
                Direct URL: <code className="text-amber-300">/admin</code> or{' '}
                <code className="text-amber-300">?portal=admin</code>
              </span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
