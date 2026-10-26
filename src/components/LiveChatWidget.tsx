import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  time: string;
}

interface LiveChatWidgetProps {
  lang: 'en' | 'ar';
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text:
        'Marhaba! Welcome to West Gulf Agency Shop UAE Concierge. Ask us about same-day Dubai courier, 4-seater golf cart freight, or Cash on Delivery across all 7 Emirates.',
      time: 'Just now',
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: 'Now',
    };

    const lower = trimmed.toLowerCase();
    let replyText = isAr
      ? 'شكراً لتواصلك مع خدمة عملاء وكالة الخليج الغربي! جميع طلبات الإمارات تُشحن خلال 24 إلى 48 ساعة مع دعم الدفع عند الاستلام وبطاقات PayTabs.'
      : 'Thank you for contacting West Gulf Agency UAE Support! All orders ship exclusively within the 7 UAE Emirates in 24–48 hours with full PayTabs, Telr, Apple Pay, and Cash on Delivery support.';

    if (lower.includes('golf') || lower.includes('bike') || lower.includes('جولف')) {
      replyText = isAr
        ? 'يتم توصيل عربات الجولف والدراجات الكهربائية عبر شاحنات خاصة مع تركيب مجاني في دبي وأبوظبي والشارقة خلال 48 ساعة.'
        : 'Our Falcon Carbon E-Bikes and Emirates Hills 4-Seater Golf Carts include complimentary white-glove assembly across Dubai, Abu Dhabi, and Sharjah within 48 hours.';
    } else if (lower.includes('track') || lower.includes('order') || lower.includes('طلب')) {
      replyText = isAr
        ? 'يمكنك تتبع شحنتك لحظة بلحظة من قسم "حسابي والولاء" باستخدام رمز التتبع الإماراتي EMX.'
        : 'You can track your shipment in real time under the "Profile & Loyalty" view using your EMX-UAE courier tracking number.';
    }

    const agentMsg: ChatMessage = {
      id: `agent-${Date.now() + 1}`,
      sender: 'agent',
      text: replyText,
      time: 'Now',
    };

    setMessages((prev) => [...prev, userMsg, agentMsg]);
    setInput('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {isOpen ? (
        <div
          role="dialog"
          aria-label="Live Customer Support Chat"
          className="w-80 sm:w-96 bg-white border border-stone-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="bg-[#18181B] text-white px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">
                {isAr ? 'الدعم المباشر · كونسيرج الإمارات' : 'UAE Live Support Concierge'}
              </p>
              <p className="text-[11px] text-stone-400">
                {isAr ? 'متاح 24/7 باللغتين العربية والإنجليزية' : 'Dubai Hub · Typical reply under 1 min'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close live chat"
              className="p-1 text-stone-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-72 overflow-y-auto bg-[#FAF8F5]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                    m.sender === 'user'
                      ? 'bg-stone-900 text-white'
                      : 'bg-white border border-stone-200 text-stone-800'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-stone-400 mt-1 px-1">{m.time}</span>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <label htmlFor="live-chat-input" className="sr-only">
              {isAr ? 'اكتب رسالتك' : 'Type support message'}
            </label>
            <input
              id="live-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isAr ? 'اسأل عن التوصيل أو المنتجات...' : 'Ask about UAE delivery, COD, or products...'
              }
              className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
            <button
              type="submit"
              aria-label="Send chat message"
              className="p-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Live Support Chat"
          className="px-4 py-3 bg-[#18181B] text-white text-xs font-semibold rounded-full shadow-lg hover:bg-stone-800 transition-colors inline-flex items-center gap-2 border border-stone-700"
        >
          <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
          <span>{isAr ? 'محادثة الدعم المباشر' : 'UAE Live Support'}</span>
        </button>
      )}
    </div>
  );
};
