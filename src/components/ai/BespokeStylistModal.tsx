import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Eye,
  Bot,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { api } from '../../api/client';
import { Product } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  suggestedProducts?: Product[];
  suggestedQuestions?: string[];
}

const STARTER_PROMPTS = [
  'What should I wear to an evening gala in Dhaka?',
  'Recommend a bespoke blazer with Super 130s wool',
  'What are the advantages of Egyptian Giza cotton shirts?',
  'Suggest a complete regal Panjabi set for Eid celebration'
];

export const BespokeStylistModal: React.FC = () => {
  const {
    isStylistOpen,
    setIsStylistOpen,
    user,
    setQuickViewProduct,
    addToCart,
    navigateToProduct,
    showToast
  } = useShop();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        'Greetings and welcome to the Zippy Atelier. I am your Master Sartorial Stylist and Concierge. How may I assist you today? I can advise you on fine fabrics (Super 130s Italian wool, 100% Egyptian Giza cotton, raw mulberry silk), recommend complete occasion ensembles, or arrange bespoke tailoring consultations in Gulshan.',
      time: 'Just now',
      suggestedQuestions: STARTER_PROMPTS
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiStatusInfo, setAiStatusInfo] = useState<{ provider?: string; model?: string }>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStylistOpen) {
      api.aiStatus().then((s) => {
        if (s) setAiStatusInfo({ provider: s.provider, model: s.model });
      }).catch(() => {});
    }
  }, [isStylistOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

      const res = await api.aiChat({
        message: query,
        history,
        customerName: user?.fullName || 'Gentleman'
      });

      const assistantMessage: ChatMessage = {
        id: `msg-res-${Date.now()}`,
        role: 'assistant',
        content: res.reply || 'Our Master Tailor is pleased to guide your wardrobe selection.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: res.suggestedProducts,
        suggestedQuestions: res.suggestedQuestions
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      // Fallback response
      const fallbackMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content:
          'For a distinguished look, we recommend our signature Super 130s Italian Wool Double-Breasted Blazer paired with an Egyptian Giza 87 Two-Ply Cotton Shirt and tailored trousers. Complimentary alterations and fittings are available at our Gulshan 1 boutique.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'Can I reserve an in-person measurement at Gulshan 1?',
          'What are the care instructions for Italian wool blazers?'
        ]
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        content:
          'Conversation reset. I am ready to advise on your bespoke wardrobe requirements, wedding attire, or seasonal privileges.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: STARTER_PROMPTS
      }
    ]);
  };

  const handleQuickAdd = (product: Product) => {
    const size = product.sizes[0] || 'L';
    const color = product.colors[0];
    addToCart(product, size, color, 1);
    showToast(`Added ${product.name} to your shopping bag.`);
  };

  const handleViewProduct = (product: Product) => {
    setIsStylistOpen(false);
    navigateToProduct(product.slug || product.id);
  };

  return (
    <>
      {/* Floating Trigger Button in bottom-right */}
      {!isStylistOpen && (
        <button
          onClick={() => setIsStylistOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#111111] text-[#D4AF37] hover:text-white border border-[#D4AF37]/50 rounded-full shadow-2xl hover:scale-105 hover:bg-black transition-all cursor-pointer group"
          aria-label="Open AI Bespoke Stylist"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full ring-2 ring-black" />
          </div>
          <span className="font-serif text-xs font-bold tracking-widest uppercase text-white group-hover:text-[#D4AF37] transition-colors hidden sm:inline">
            Atelier Stylist
          </span>
          <span className="text-[10px] bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] px-2 py-0.5 rounded font-mono font-bold">
            AI CONCIERGE
          </span>
        </button>
      )}

      {/* Slide-Over Drawer / Modal */}
      {isStylistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsStylistOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-lg bg-[#FAF8F5] shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-250 border-l border-neutral-300">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#111111] text-white flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-900 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-sm sm:text-base font-bold tracking-wider text-white">
                      BESPOKE STYLIST & CONCIERGE
                    </h2>
                    <span className="text-[9px] bg-neutral-800 text-[#D4AF37] border border-[#D4AF37]/30 px-1.5 py-0.2 rounded font-mono">
                      {aiStatusInfo.model || 'Gemini 3.1 Pro'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Artisanal Sartorial Intelligence · Dhaka Atelier
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetConversation}
                  className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsStylistOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                  aria-label="Close stylist"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Label */}
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1 px-1">
                    {msg.role === 'user' ? (user?.fullName || 'You') : 'Master Stylist'} · {msg.time}
                  </span>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[88%] p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-neutral-900 text-white rounded-t-lg rounded-bl-lg'
                        : 'bg-white text-neutral-800 border border-neutral-200 shadow-xs rounded-t-lg rounded-br-lg'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Render Recommended Garments */}
                    {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2.5">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#9A7B38] block">
                          Curated Garment Selections
                        </span>
                        <div className="space-y-2">
                          {msg.suggestedProducts.map((prod) => (
                            <div
                              key={prod.id}
                              className="flex items-center gap-3 p-2 bg-[#F9F9F8] border border-neutral-200 rounded hover:border-neutral-400 transition-colors"
                            >
                              <div className="w-12 h-14 bg-neutral-200 shrink-0 overflow-hidden rounded">
                                <ImageWithFallback
                                  src={prod.images?.[0] || ''}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-neutral-900 truncate">
                                  {prod.name}
                                </h4>
                                <p className="text-[11px] text-neutral-500 font-semibold tabular-nums mt-0.5">
                                  ৳{(prod.salePrice ?? prod.price).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setQuickViewProduct(prod)}
                                  className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-200 rounded"
                                  title="Quick View"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickAdd(prod)}
                                  className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-200 rounded"
                                  title="Add to Bag"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleViewProduct(prod)}
                                  className="p-1.5 text-neutral-900 hover:text-[#9A7B38]"
                                  title="View Full Details"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Questions Pills */}
                    {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap gap-1.5">
                        {msg.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(q)}
                            className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2.5 py-1 rounded transition-colors text-left flex items-center gap-1 cursor-pointer"
                          >
                            <span>{q}</span>
                            <ChevronRight className="w-3 h-3 opacity-60 shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="p-3 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-500 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
                    <span>Stylist is curating sartorial recommendations...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-3 sm:p-4 bg-white border-t border-neutral-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask regarding fabrics, fit, or wedding attire..."
                  className="flex-1 bg-neutral-100 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-500 rounded focus:outline-none focus:border-neutral-900 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="px-4 py-2.5 bg-neutral-900 text-white rounded hover:bg-black transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ask</span>
                </button>
              </form>
              <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-2 px-1">
                <span>Direct styling intelligence via Google Gemini</span>
                <span>Atelier Gulshan 1, Dhaka</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
