import React, { useState } from 'react';
import {
  Award,
  MapPin,
  Package,
  Bell,
  Copy,
  Check,
  Plus,
  Trash2,
  LogIn,
  LogOut,
  Gift,
  Truck,
} from 'lucide-react';
import {
  UAE_EMIRATES,
  calculateLoyaltyTier,
  type UaeEmirate,
} from '../utils/shopLogic';
import {
  type CustomerOrderRecord,
  type SavedUaeAddress,
} from '../data/catalogData';

interface ProfileLoyaltyViewProps {
  lang: 'en' | 'ar';
  userName: string;
  userEmail: string;
  isGoogleSignedIn: boolean;
  loyaltyPoints: number;
  referralCode: string;
  pushEnabled: boolean;
  promoEnabled: boolean;
  orders: CustomerOrderRecord[];
  addresses: SavedUaeAddress[];
  pointsLedger: { id: string; reason: string; points: number; date: string }[];
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onToggleNotifications: (type: 'push' | 'promo', value: boolean) => void;
  onAddAddress: (addr: Omit<SavedUaeAddress, 'id'>) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefaultAddress: (id: string) => void;
  onSimulateReferralSignup: () => void;
}

export const ProfileLoyaltyView: React.FC<ProfileLoyaltyViewProps> = ({
  lang,
  userName,
  userEmail,
  isGoogleSignedIn,
  loyaltyPoints,
  referralCode,
  pushEnabled,
  promoEnabled,
  orders,
  addresses,
  pointsLedger,
  onGoogleSignIn,
  onSignOut,
  onToggleNotifications,
  onAddAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onSimulateReferralSignup,
}) => {
  const isAr = lang === 'ar';
  const tierInfo = calculateLoyaltyTier(loyaltyPoints);

  const [copiedReferral, setCopiedReferral] = useState(false);
  const [referralToast, setReferralToast] = useState<string | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<string>(
    orders[0]?.id || ''
  );

  // New Address Form State
  const [label, setLabel] = useState('');
  const [recipientName, setRecipientName] = useState(userName);
  const [phone, setPhone] = useState('+971 50 ');
  const [emirate, setEmirate] = useState<UaeEmirate>('Dubai');
  const [area, setArea] = useState('');
  const [streetBuilding, setStreetBuilding] = useState('');
  const [addressError, setAddressError] = useState<string | null>(null);

  const handleCopyReferral = () => {
    const shareUrl = `${window.location.origin}/?ref=${referralCode}`;
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const handleTriggerReferralBonus = () => {
    onSimulateReferralSignup();
    setReferralToast(
      isAr
        ? 'تم تسجيل إحالة صديق جديد! تمت إضافة +200 نقطة ولاء إلى رصيدك.'
        : 'New UAE referral verified! +200 Loyalty Points credited to your balance.'
    );
    setTimeout(() => setReferralToast(null), 3500);
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !recipientName.trim() || !area.trim() || !streetBuilding.trim()) {
      setAddressError(
        isAr
          ? 'يرجى تعبئة جميع حقول العنوان داخل الإمارات'
          : 'Please complete all required UAE address fields.'
      );
      return;
    }
    setAddressError(null);
    onAddAddress({
      label: label.trim(),
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      emirate,
      area: area.trim(),
      streetBuilding: streetBuilding.trim(),
      isDefault: addresses.length === 0,
    });
    setLabel('');
    setArea('');
    setStreetBuilding('');
  };

  const activeOrder =
    orders.find((o) => o.id === selectedOrderForTracking) || orders[0] || null;

  const trackingStages: {
    key: CustomerOrderRecord['status'];
    labelEn: string;
    labelAr: string;
  }[] = [
    { key: 'pending_approval', labelEn: '1. Order Placed & Verified', labelAr: '1. تأكيد الطلب' },
    { key: 'approved_processing', labelEn: '2. Admin Approved & Packed', labelAr: '2. موافقة الإدارة والتجهيز' },
    { key: 'dispatched_uae_hub', labelEn: '3. Dispatched UAE Logistics Hub', labelAr: '3. الخروج من مستودع الإمارات' },
    { key: 'out_for_delivery', labelEn: '4. Out for Emirate Courier Delivery', labelAr: '4. خرج للتوصيل مع المندوب' },
    { key: 'delivered', labelEn: '5. Delivered to UAE Address', labelAr: '5. تم التسليم بنجاح' },
  ];

  const getStageIndex = (status: CustomerOrderRecord['status']) => {
    const idx = trackingStages.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header & Account Security Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider">
            <span>{isAr ? 'الملف الشخصي الموحد' : 'Verified UAE Member Account'}</span>
            <span aria-hidden="true">·</span>
            <span>{userEmail}</span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-stone-900">{userName}</h1>
          <p className="text-xs text-stone-500">
            {isAr
              ? 'إدارة نقاط الولاء، تتبع الطلبات الفوري، عناوين الشحن في الإمارات، وتفضيلات الإشعارات.'
              : 'Manage your Emirate loyalty rewards, real-time courier tracking, saved UAE addresses, and notification preferences.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isGoogleSignedIn ? (
            <button
              type="button"
              onClick={onGoogleSignIn}
              className="px-4 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span>{isAr ? 'ربط حساب Google الرسمي' : 'Sign In with Google (Cloud Sync)'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignOut}
              className="px-4 py-2.5 bg-stone-100 text-stone-800 text-xs font-semibold rounded-lg hover:bg-stone-200 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ROW 1: Loyalty Tier Card + Referral Bonus Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-[#18181B] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 border border-stone-800">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-amber-300">
                {isAr ? 'برنامج مكافآت الخليج الغربي' : 'West Gulf Loyalty Rewards'}
              </p>
              <h2 className="font-display text-3xl font-semibold text-white">
                {tierInfo.tier} Tier Member
              </h2>
            </div>
            <div className="text-right font-mono tabular-nums">
              <p className="text-3xl font-bold text-[#D4AF37]">{loyaltyPoints.toLocaleString()}</p>
              <p className="text-xs text-stone-400">
                {isAr
                  ? `تساوي ${(loyaltyPoints / 10).toFixed(0)} درهم خصم فوري`
                  : `Worth AED ${(loyaltyPoints / 10).toFixed(0)} in Checkout Credit`}
              </p>
            </div>
          </div>

          {tierInfo.nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-stone-300 font-mono tabular-nums">
                <span>
                  {isAr
                    ? `التقدم نحو فئة ${tierInfo.nextTier}`
                    : `Progress to ${tierInfo.nextTier} Tier`}
                </span>
                <span>{tierInfo.pointsToNext.toLocaleString()} pts remaining</span>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D4AF37]"
                  style={{
                    width: `${Math.min(100, Math.round((loyaltyPoints / 5000) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-stone-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              {isAr ? 'مزايا عضويتك الحالية' : 'Active Tier Privileges'}
            </p>
            <ul className="space-y-1.5 text-xs text-stone-200">
              {(isAr ? tierInfo.perksAr : tierInfo.perksEn).map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Referral Bonus & Social Engagement Card */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-900">
              <Gift className="w-4 h-4" />
              <span>{isAr ? 'مكافآت الإحالة والمشاركة' : 'Referral & Growth Bonus'}</span>
            </div>
            <h3 className="font-display text-2xl font-semibold text-stone-900">
              {isAr
                ? 'ادعُ صديقاً في الإمارات واكسب +200 نقطة'
                : 'Invite Friends in the UAE · Earn +200 Points'}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isAr
                ? 'يحصل صديقك على خصم ترحيبي بقيمة 50 درهم عند التسجيل بكود الإحالة الخاص بك، وتحصل أنت على 200 نقطة ولاء فورية.'
                : 'Share your personal referral code. New members receive 250 welcome points on signup, and you earn +200 bonus points (AED 20 value) per verified referral.'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5">
              <span className="font-mono text-sm font-semibold text-stone-900">{referralCode}</span>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="text-xs font-medium text-stone-700 hover:text-stone-900 inline-flex items-center gap-1.5"
              >
                {copiedReferral ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReferral ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ الرابط' : 'Copy Link'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleTriggerReferralBonus}
              className="w-full py-2.5 px-4 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
            >
              {isAr
                ? 'محاكاة تسجيل صديق عبر رابط الإحالة (+200 نقطة)'
                : 'Claim Verified Referral Bonus (+200 Points)'}
            </button>

            {referralToast && (
              <p role="status" className="text-xs text-emerald-700 font-medium">
                {referralToast}
              </p>
            )}
          </div>

          {/* Recent Points Activity */}
          <div className="border-t border-stone-100 pt-4 space-y-2">
            <p className="text-xs font-semibold text-stone-700">
              {isAr ? 'سجل نقاط الولاء الأخير' : 'Recent Points Activity Ledger'}
            </p>
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {pointsLedger.slice(0, 4).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 truncate pr-2">{entry.reason}</span>
                  <span className="font-mono tabular-nums font-semibold text-emerald-700 shrink-0">
                    +{entry.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Real-Time UAE Order Tracking & Order History */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-stone-900" />
            <h2 className="font-display text-2xl font-semibold text-stone-900">
              {isAr ? 'سجل الطلبات والتتبع الفوري داخل الإمارات' : 'Order History & Real-Time UAE Courier Tracking'}
            </h2>
          </div>
          <span className="text-xs font-mono tabular-nums text-stone-500">
            {orders.length} {isAr ? 'طلبات مسجلة' : 'Total Orders'}
          </span>
        </div>

        {/* Live Tracking Visualizer for Selected Order */}
        {activeOrder && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 font-mono tabular-nums">
                  <span>{activeOrder.id}</span>
                  <span aria-hidden="true">·</span>
                  <span>Tracking: {activeOrder.trackingCode}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeOrder.emirate}</span>
                </div>
                <p className="text-sm font-semibold text-stone-900 mt-1">
                  {activeOrder.itemSummary}
                </p>
              </div>
              <div className="text-right font-mono tabular-nums">
                <p className="text-sm font-bold text-stone-900">
                  AED {activeOrder.totalAed.toLocaleString()}
                </p>
                <p className="text-xs text-stone-500">
                  Via {activeOrder.paymentMethod} · +{activeOrder.pointsEarned} Pts
                </p>
              </div>
            </div>

            {/* 5-Stage Progress Stepper */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
              {trackingStages.map((stage, idx) => {
                const currentIdx = getStageIndex(activeOrder.status);
                const completed = idx <= currentIdx && activeOrder.status !== 'cancelled';
                return (
                  <div
                    key={stage.key}
                    className={`p-3 rounded-lg border text-xs ${
                      completed
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-400 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Truck className="w-3.5 h-3.5" />
                      {completed && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    </div>
                    <p className="font-medium leading-snug">
                      {isAr ? stage.labelAr : stage.labelEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-xs uppercase text-stone-500">
                <th className="py-3 pr-4">{isAr ? 'رقم الطلب' : 'Order ID'}</th>
                <th className="py-3 px-4">{isAr ? 'المنتجات' : 'Items'}</th>
                <th className="py-3 px-4">{isAr ? 'الإمارة والعنوان' : 'UAE Emirate'}</th>
                <th className="py-3 px-4">{isAr ? 'طريقة الدفع' : 'Gateway'}</th>
                <th className="py-3 px-4 text-right">{isAr ? 'الإجمالي' : 'Total (AED)'}</th>
                <th className="py-3 pl-4 text-right">{isAr ? 'التتبع' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-50/80">
                  <td className="py-3.5 pr-4 font-mono tabular-nums font-semibold text-stone-900">
                    {ord.id}
                  </td>
                  <td className="py-3.5 px-4 text-stone-700 max-w-xs truncate">
                    {ord.itemSummary}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {ord.emirate} · {ord.shippingAddress.slice(0, 28)}...
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-600">{ord.paymentMethod}</td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-stone-900">
                    AED {ord.totalAed.toLocaleString()}
                  </td>
                  <td className="py-3.5 pl-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForTracking(ord.id)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        selectedOrderForTracking === ord.id
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {isAr ? 'تتبع الشحنة' : 'Track Live'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROW 3: Saved UAE Shipping Addresses + Notification Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Saved UAE Shipping Addresses */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-stone-200 pb-4">
            <MapPin className="w-5 h-5 text-stone-900" />
            <h2 className="font-display text-2xl font-semibold text-stone-900">
              {isAr ? 'عناوين الشحن المحفوظة في الإمارات' : 'Saved UAE Shipping Addresses'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  addr.isDefault ? 'border-stone-900 bg-stone-50/70' : 'border-stone-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-900">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-[11px] uppercase tracking-wider text-amber-800 font-semibold">
                        {isAr ? 'الافتراضي' : 'Default'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-700 font-medium">{addr.recipientName}</p>
                  <p className="text-xs text-stone-500">
                    {addr.streetBuilding}, {addr.area}, {addr.emirate}, UAE
                  </p>
                  <p className="text-xs font-mono text-stone-500">{addr.phone}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      onClick={() => onSetDefaultAddress(addr.id)}
                      className="text-stone-700 hover:text-stone-900 font-medium"
                    >
                      {isAr ? 'تعيين كافتراضي' : 'Set as Default'}
                    </button>
                  ) : (
                    <span className="text-stone-400">{isAr ? 'عنوان التوصيل النشط' : 'Active Checkout Address'}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteAddress(addr.id)}
                    aria-label={`Delete address ${addr.label}`}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New UAE Address Form */}
          <form onSubmit={handleCreateAddress} className="pt-4 border-t border-stone-200 space-y-4">
            <h3 className="text-sm font-semibold text-stone-900">
              {isAr ? 'إضافة عنوان توصيل جديد داخل الإمارات' : 'Add New UAE Delivery Address'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="addr-label" className="block text-xs text-stone-600 mb-1">
                  {isAr ? 'اسم العنوان (المنزل / المكتب)' : 'Address Label (e.g. Marina Penthouse)'}
                </label>
                <input
                  id="addr-label"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Palm Villa / DIFC Office"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="addr-emirate" className="block text-xs text-stone-600 mb-1">
                  {isAr ? 'الإمارة (حصرياً داخل الإمارات)' : 'UAE Emirate (UAE Only)'}
                </label>
                <select
                  id="addr-emirate"
                  value={emirate}
                  onChange={(e) => setEmirate(e.target.value as UaeEmirate)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg"
                >
                  {UAE_EMIRATES.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="addr-area" className="block text-xs text-stone-600 mb-1">
                  {isAr ? 'المنطقة / المجتمع' : 'Community / District'}
                </label>
                <input
                  id="addr-area"
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Dubai Hills Estate / Al Reem Island"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="addr-street" className="block text-xs text-stone-600 mb-1">
                  {isAr ? 'الفيلا / البرج ورقم الشقة' : 'Villa / Building & Unit Number'}
                </label>
                <input
                  id="addr-street"
                  type="text"
                  value={streetBuilding}
                  onChange={(e) => setStreetBuilding(e.target.value)}
                  placeholder="e.g. Villa 42, Street 7"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg"
                />
              </div>
            </div>

            {addressError && <p className="text-xs text-red-600">{addressError}</p>}

            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'حفظ العنوان في الحساب' : 'Save UAE Address'}</span>
            </button>
          </form>
        </div>

        {/* Notification & Privacy Preferences */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-stone-200 pb-4">
            <Bell className="w-5 h-5 text-stone-900" />
            <h2 className="font-display text-2xl font-semibold text-stone-900">
              {isAr ? 'تفضيلات الإشعارات الفورية' : 'Push & Order Alert Preferences'}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <p className="text-sm font-semibold text-stone-900">
                  {isAr ? 'إشعارات تتبع الشحنات الفورية' : 'Real-Time UAE Courier Push Alerts'}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isAr
                    ? 'تنبيهات فورية عند خروج الطلب للتوصيل في إمارتك'
                    : 'Instant browser & SMS alerts when your driver is 15 mins away'}
                </p>
              </div>
              <input
                type="checkbox"
                aria-label="Real-Time UAE Courier Push Alerts"
                checked={pushEnabled}
                onChange={(e) => onToggleNotifications('push', e.target.checked)}
                className="w-4 h-4 accent-stone-900 mt-1"
              />
            </div>

            <div className="flex items-start justify-between gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <p className="text-sm font-semibold text-stone-900">
                  {isAr ? 'عروض المواسم ومضاعفة نقاط الولاء' : 'Seasonal Couture & VIP Drops'}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isAr
                    ? 'إشعارات حصرية عند توفر منتجات جديدة وعروض مضاعفة النقاط'
                    : 'Early notifications for new e-bike models, seasonal fashion, and 2x points'}
                </p>
              </div>
              <input
                type="checkbox"
                aria-label="Seasonal Couture & VIP Drops"
                checked={promoEnabled}
                onChange={(e) => onToggleNotifications('promo', e.target.checked)}
                className="w-4 h-4 accent-stone-900 mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
