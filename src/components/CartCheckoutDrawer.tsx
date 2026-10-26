import React, { useState } from 'react';
import { X, Trash2, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import {
  UAE_EMIRATES,
  calculateUaeOrderSummary,
  type CatalogProduct,
  type UaeEmirate,
} from '../utils/shopLogic';
import {
  type CustomerOrderRecord,
  type SavedUaeAddress,
} from '../data/catalogData';

export interface CartItem {
  product: CatalogProduct;
  quantity: number;
}

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  lang: 'en' | 'ar';
  cart: CartItem[];
  loyaltyPoints: number;
  savedAddresses: SavedUaeAddress[];
  defaultCustomerName: string;
  defaultCustomerEmail: string;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onCompleteOrder: (
    orderData: {
      customerName: string;
      customerEmail: string;
      emirate: UaeEmirate;
      shippingAddress: string;
      paymentMethod: CustomerOrderRecord['paymentMethod'];
      totalAed: number;
      itemSummary: string;
      itemCount: number;
      pointsEarned: number;
      pointsRedeemed: number;
    }
  ) => CustomerOrderRecord;
}

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  lang,
  cart,
  loyaltyPoints,
  savedAddresses,
  defaultCustomerName,
  defaultCustomerEmail,
  onClose,
  onUpdateQuantity,
  onCompleteOrder,
}) => {
  const isAr = lang === 'ar';
  const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  const [customerName, setCustomerName] = useState(defaultCustomerName);
  const [customerEmail, setCustomerEmail] = useState(defaultCustomerEmail);
  const [emirate, setEmirate] = useState<UaeEmirate>(defaultAddr?.emirate || 'Dubai');
  const [shippingAddress, setShippingAddress] = useState(
    defaultAddr ? `${defaultAddr.streetBuilding}, ${defaultAddr.area}` : ''
  );
  const [paymentMethod, setPaymentMethod] =
    useState<CustomerOrderRecord['paymentMethod']>('PayTabs');
  const [redeemPointsToggle, setRedeemPointsToggle] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<CustomerOrderRecord | null>(null);

  if (!isOpen) return null;

  const pointsToUse = redeemPointsToggle ? loyaltyPoints : 0;
  const summary = calculateUaeOrderSummary(
    cart.map((c) => ({ priceAed: c.product.priceAed, quantity: c.quantity })),
    emirate,
    pointsToUse
  );

  const handleSelectSavedAddress = (addrId: string) => {
    const found = savedAddresses.find((a) => a.id === addrId);
    if (found) {
      setEmirate(found.emirate);
      setShippingAddress(`${found.streetBuilding}, ${found.area}`);
      setCustomerName(found.recipientName);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (customerName.trim().length < 2 || shippingAddress.trim().length < 4) {
      setCheckoutError(
        isAr
          ? 'يرجى إدخال الاسم الكامل وعنوان التوصيل داخل الإمارات.'
          : 'Please enter your full recipient name and valid UAE delivery address.'
      );
      return;
    }
    setCheckoutError(null);
    const itemSummary = cart
      .map((c) => `${c.product.titleEn.slice(0, 38)} (x${c.quantity})`)
      .join(', ');
    const itemCount = cart.reduce((acc, c) => acc + c.quantity, 0);

    const created = onCompleteOrder({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || 'vip@westgulfagency.ae',
      emirate,
      shippingAddress: shippingAddress.trim(),
      paymentMethod,
      totalAed: summary.totalAed,
      itemSummary,
      itemCount,
      pointsEarned: summary.pointsEarned,
      pointsRedeemed: summary.loyaltyDiscountAed * 10,
    });
    setConfirmedOrder(created);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'سلة التسوق والدفع الآمن' : 'Shopping Bag & Secure UAE Checkout'}
      className="fixed inset-0 z-50 bg-black/60 flex justify-end"
    >
      <div className="bg-[#FAF8F5] w-full max-w-lg h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between shadow-2xl border-l border-stone-300">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-stone-900">
                {isAr ? 'حقيبة التسوق والدفع الإماراتي' : 'Shopping Bag & UAE Checkout'}
              </h2>
              <p className="text-xs text-stone-500">
                {isAr
                  ? 'شحن حصري لجميع الإمارات السبع · بوابات دفع مشفرة'
                  : 'Ships Exclusively Within the 7 UAE Emirates'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setConfirmedOrder(null);
                onClose();
              }}
              aria-label="Close shopping bag"
              className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {confirmedOrder ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-3 text-emerald-700">
                <CheckCircle2 className="w-7 h-7 shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-stone-900">
                    {isAr
                      ? `تم تأكيد الطلب ${confirmedOrder.id}`
                      : `Order ${confirmedOrder.id} Confirmed`}
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">
                    UAE Tracking Code: {confirmedOrder.trackingCode}
                  </p>
                </div>
              </div>

              <div className="text-xs text-stone-600 space-y-1.5 border-t border-b border-stone-100 py-4">
                <p>
                  <strong>{isAr ? 'المستلم:' : 'Recipient:'}</strong> {confirmedOrder.customerName}
                </p>
                <p>
                  <strong>{isAr ? 'العنوان في الإمارات:' : 'UAE Destination:'}</strong>{' '}
                  {confirmedOrder.emirate} — {confirmedOrder.shippingAddress}
                </p>
                <p>
                  <strong>{isAr ? 'بوابة الدفع:' : 'Payment Gateway:'}</strong>{' '}
                  {confirmedOrder.paymentMethod}
                </p>
                <p className="font-mono tabular-nums font-semibold text-stone-900 pt-1">
                  Total Paid: AED {confirmedOrder.totalAed.toLocaleString()} (+
                  {confirmedOrder.pointsEarned} Loyalty Points Earned)
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  onClose();
                }}
                className="w-full py-3 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800"
              >
                {isAr ? 'متابعة التسوق وتتبع الطلب' : 'Continue Shopping & View Live Tracking'}
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-3">
              <p className="text-base font-medium text-stone-900">
                {isAr ? 'حقيبة التسوق فارغة حالياً' : 'Your UAE Shopping Bag is Empty'}
              </p>
              <p className="text-xs text-stone-500">
                {isAr
                  ? 'أضف منتجات من قسم الأزياء الموسمية أو الدراجات الكهربائية أو الساونا المنزلية.'
                  : 'Explore our seasonal fashion, carbon e-bikes, golf carts, and home wellness collections.'}
              </p>
            </div>
          ) : (
            <>
              {/* Itemized Cart List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-white border border-stone-200 rounded-xl p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {isAr ? item.product.titleAr : item.product.titleEn}
                      </p>
                      <p className="text-xs font-mono tabular-nums text-stone-500 mt-0.5">
                        AED {item.product.priceAed.toLocaleString()} × {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.product.titleEn}`}
                        className="px-2 py-1 text-xs border border-stone-200 rounded hover:bg-stone-100 font-mono"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono tabular-nums w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.product.titleEn}`}
                        className="px-2 py-1 text-xs border border-stone-200 rounded hover:bg-stone-100 font-mono"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, 0)}
                        aria-label={`Remove ${item.product.titleEn}`}
                        className="p-1 text-stone-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Form */}
              <form onSubmit={handlePlaceOrder} className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-stone-900">
                    {isAr ? 'بيانات التوصيل داخل الإمارات' : 'UAE Delivery & Payment'}
                  </h3>
                  {savedAddresses.length > 0 && (
                    <select
                      aria-label="Fill from saved UAE address"
                      onChange={(e) => handleSelectSavedAddress(e.target.value)}
                      className="text-xs border border-stone-200 rounded px-2 py-1 bg-stone-50"
                    >
                      <option value="">{isAr ? 'اختر عنواناً محفوظاً' : 'Saved Addresses...'}</option>
                      {savedAddresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label} ({a.emirate})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="checkout-name" className="block text-xs text-stone-600 mb-1">
                      {isAr ? 'اسم المستلم' : 'Recipient Full Name'}
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label htmlFor="checkout-emirate" className="block text-xs text-stone-600 mb-1">
                      {isAr ? 'الإمارة (الإمارات فقط)' : 'Destination Emirate (UAE)'}
                    </label>
                    <select
                      id="checkout-emirate"
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
                </div>

                <div>
                  <label htmlFor="checkout-address" className="block text-xs text-stone-600 mb-1">
                    {isAr ? 'العنوان التفصيلي (الفيلا / البرج / الشارع)' : 'Full UAE Street, Building / Villa Address'}
                  </label>
                  <input
                    id="checkout-address"
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Villa 14, Palm Jumeirah / Burj Crown Apt 2804"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg"
                  />
                </div>

                {/* Payment Gateway Selection */}
                <div>
                  <label className="block text-xs text-stone-600 mb-1.5">
                    {isAr ? 'بوابة الدفع الآمنة' : 'Secure Payment Gateway'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'PayTabs', label: 'PayTabs UAE' },
                      { id: 'Telr', label: 'Telr 3DS' },
                      { id: 'ApplePay', label: 'Apple Pay' },
                      { id: 'IntlCard', label: 'Intl Visa/MC' },
                      { id: 'COD', label: 'Cash on Delivery' },
                    ].map((gw) => (
                      <button
                        key={gw.id}
                        type="button"
                        onClick={() =>
                          setPaymentMethod(gw.id as CustomerOrderRecord['paymentMethod'])
                        }
                        className={`px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
                          paymentMethod === gw.id
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {gw.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loyalty Points Redemption Toggle */}
                {loyaltyPoints >= 100 && (
                  <label className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer text-xs">
                    <span className="font-medium text-stone-800">
                      {isAr
                        ? `استخدام نقاط الولاء (${loyaltyPoints} نقطة)`
                        : `Redeem ${loyaltyPoints.toLocaleString()} Loyalty Points (-AED ${Math.floor(
                            loyaltyPoints / 10
                          )})`}
                    </span>
                    <input
                      type="checkbox"
                      checked={redeemPointsToggle}
                      onChange={(e) => setRedeemPointsToggle(e.target.checked)}
                      className="w-4 h-4 accent-stone-900"
                    />
                  </label>
                )}

                {/* Order Breakdown */}
                <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs font-mono tabular-nums">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span>AED {summary.subtotalAed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>UAE Courier ({emirate})</span>
                    <span>
                      {summary.shippingAed === 0 ? 'FREE' : `AED ${summary.shippingAed}`}
                    </span>
                  </div>
                  {summary.loyaltyDiscountAed > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Loyalty Discount</span>
                      <span>-AED {summary.loyaltyDiscountAed.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-600">
                    <span>UAE VAT (5%)</span>
                    <span>AED {summary.vatAed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-stone-900 pt-1.5 border-t border-stone-100">
                    <span>Total (AED)</span>
                    <span>AED {summary.totalAed.toLocaleString()}</span>
                  </div>
                </div>

                {checkoutError && <p className="text-xs text-red-600">{checkoutError}</p>}

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>
                    {isAr
                      ? `تأكيد الطلب والدفع · ${summary.totalAed.toLocaleString()} درهم`
                      : `Authorize & Place UAE Order · AED ${summary.totalAed.toLocaleString()}`}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
            <span>256-Bit SSL UAE Payment Gateway</span>
          </span>
          <span>+{summary.pointsEarned} Loyalty Pts on Order</span>
        </div>
      </div>
    </div>
  );
};
