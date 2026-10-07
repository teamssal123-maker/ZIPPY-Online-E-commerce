import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Phone,
  ExternalLink,
  Volume2,
  VolumeX,
  Clock,
  Check,
  CheckCheck,
  RotateCcw,
  ShoppingBag,
  User as UserIcon,
  ChevronRight,
  ShieldCheck,
  Scissors,
  Package
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { api } from '../../api/client';
import type { ChatMessage, ChatThread, Product, ChatInstantInquiry } from '../../types';

const STARTER_CHIPS = [
  { label: '📦 Track Order', prompt: 'Could you help me check the delivery status of my order?' },
  { label: '✂️ Bespoke Fitting', prompt: 'I would like to reserve a bespoke tailoring consultation at Gulshan 1.' },
  { label: '📏 Size & Fit Advice', prompt: 'Could you advise on the fit difference between Slim Fit and Tailored Fit?' },
  { label: '📍 Atelier Locations', prompt: 'What are the boutique hours and address of your Gulshan flagship?' }
];

const AI_STARTER_PROMPTS = [
  'What should I wear to an evening gala in Dhaka?',
  'Recommend a bespoke blazer with Super 130s wool',
  'What are the advantages of Egyptian Giza cotton shirts?',
  'Suggest a complete regal Panjabi set for Eid celebration'
];

interface AiStylistMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  suggestedProducts?: Product[];
  suggestedQuestions?: string[];
}

const mergeMessages = (existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] => {
  const map = new Map<string, ChatMessage>();
  for (const m of existing) {
    if (m && m.id) map.set(m.id, m);
  }
  for (const m of incoming) {
    if (m && m.id) map.set(m.id, m);
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

export const LiveChatWidget: React.FC = () => {
  const {
    isStylistOpen,
    setIsStylistOpen,
    user,
    setQuickViewProduct,
    addToCart,
    navigateToProduct,
    showToast
  } = useShop();

  const [activeTab, setActiveTab] = useState<'concierge' | 'stylist'>('concierge');
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadBadge, setUnreadBadge] = useState<number>(0);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [instantInquiries, setInstantInquiries] = useState<ChatInstantInquiry[]>([]);

  // Load customized instant inquiries from chat settings
  useEffect(() => {
    api
      .getChatSettings()
      .then((res) => {
        if (Array.isArray(res?.instantInquiries) && res.instantInquiries.length > 0) {
          setInstantInquiries(res.instantInquiries);
        }
      })
      .catch(() => {});
  }, []);

  // AI Stylist tab state
  const [aiMessages, setAiMessages] = useState<AiStylistMessage[]>([
    {
      id: 'ai-welcome',
      role: 'assistant',
      content:
        'Greetings and welcome to the Zippy Atelier. I am your Master Sartorial Stylist. How may I assist you with fine fabrics, occasion styling, or lookbook pairing today?',
      time: 'Just now',
      suggestedQuestions: AI_STARTER_PROMPTS
    }
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const [aiIsTyping, setAiIsTyping] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const aiMessagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef<number>(0);

  // Pleasant audio chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext requires interaction
    }
  };

  // Initialize or fetch active thread
  const initThread = async () => {
    try {
      const storedGuestKey = localStorage.getItem('zippy_guest_key') || undefined;
      const res = await api.createOrGetChatThread({
        customerName: user?.fullName || guestName || undefined,
        customerEmail: user?.email || undefined,
        customerPhone: user?.phone || guestPhone || undefined,
        guestKey: storedGuestKey
      });

      if (res?.thread) {
        setThread(res.thread);
        if (res.thread.id) {
          const msgs = await api.getChatMessages(res.thread.id);
          setMessages(msgs || []);
          previousMessageCountRef.current = (msgs || []).length;
        }
      }
    } catch (err) {
      console.error('Failed to initialize chat thread:', err);
    }
  };

  useEffect(() => {
    initThread();
  }, [user]);

  // Polling for live chat updates
  useEffect(() => {
    if (!thread?.id) return;

    const poll = async () => {
      try {
        const msgs = await api.getChatMessages(thread.id);
        if (Array.isArray(msgs)) {
          if (msgs.length > previousMessageCountRef.current) {
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg.senderRole !== 'customer') {
              playChime();
              if (!isStylistOpen) {
                setUnreadBadge((prev) => prev + 1);
              }
            }
            previousMessageCountRef.current = msgs.length;
          }
          setMessages((prev) => mergeMessages(prev, msgs));
        }
      } catch {
        // network polling failure ignored
      }
    };

    const interval = setInterval(poll, isStylistOpen ? 2500 : 8000);
    return () => clearInterval(interval);
  }, [thread?.id, isStylistOpen, soundEnabled]);

  // When drawer opens, clear unread badge and scroll
  useEffect(() => {
    if (isStylistOpen) {
      setUnreadBadge(0);
      if (thread?.id) {
        api.markChatRead(thread.id, 'customer').catch(() => {});
      }
    }
  }, [isStylistOpen, thread?.id]);

  useEffect(() => {
    if (activeTab === 'concierge' && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    } else if (activeTab === 'stylist' && aiMessagesContainerRef.current) {
      aiMessagesContainerRef.current.scrollTop = aiMessagesContainerRef.current.scrollHeight;
    }
  }, [messages.length, aiMessages.length, isTyping, aiIsTyping, activeTab]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    if (!thread) {
      await initThread();
    }
    if (!thread?.id) return;

    setInputText('');
    setIsTyping(true);

    try {
      const res = await api.sendChatMessage(thread.id, {
        message: textToSend,
        senderRole: 'customer',
        senderName: user?.fullName || guestName || 'Esteemed Patron'
      });

      if (res?.message) {
        setMessages((prev) => mergeMessages(prev, [res.message]));
        if (res.autoReply) {
          setTimeout(() => {
            setMessages((prev) => mergeMessages(prev, [res.autoReply!]));
            setIsTyping(false);
            playChime();
          }, 800);
        } else {
          setIsTyping(false);
        }
      }
    } catch (err) {
      console.error('Failed to send chat message:', err);
      setIsTyping(false);
    }
  };

  // AI Stylist Chat handler
  const handleSendAiMessage = async (promptText?: string) => {
    const messageContent = (promptText || aiInputText).trim();
    if (!messageContent || aiIsTyping) return;

    const userMsg: AiStylistMessage = {
      id: `ai-user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      time: 'Just now'
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setAiInputText('');
    setAiIsTyping(true);

    try {
      const history = aiMessages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.aiChat({
        message: messageContent,
        history,
        customerName: user?.fullName || undefined
      });

      const assistantMsg: AiStylistMessage = {
        id: `ai-agent-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        time: 'Just now',
        suggestedProducts: res.suggestedProducts,
        suggestedQuestions: res.suggestedQuestions
      };

      setAiMessages((prev) => [...prev, assistantMsg]);
      playChime();
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content:
            'I apologize, our atelier sartorial connection experienced a brief delay. Our master concierges in Gulshan are also available directly on WhatsApp at +880 1711-000001.',
          time: 'Just now'
        }
      ]);
    } finally {
      setAiIsTyping(false);
    }
  };

  const handleViewProduct = (product: Product) => {
    setIsStylistOpen(false);
    navigateToProduct(product.slug || product.id);
  };

  return (
    <>
      {/* Floating Bottom-Right Trigger Launcher */}
      {!isStylistOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
          {/* Subtle tooltip pulse when unread */}
          {unreadBadge > 0 && (
            <div className="bg-[#111111] text-[#D4AF37] border border-[#D4AF37]/40 px-3 py-1 rounded-full text-xs font-serif font-bold shadow-xl animate-bounce flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>New Concierge Reply</span>
            </div>
          )}

          <button
            onClick={() => {
              setActiveTab('concierge');
              setIsStylistOpen(true);
            }}
            className="flex items-center gap-3 px-4 py-3.5 bg-[#111111] text-[#D4AF37] hover:text-white border border-[#D4AF37]/50 rounded-full shadow-2xl hover:scale-105 hover:bg-black transition-all cursor-pointer group active:scale-95"
            aria-label="Open Live Concierge Chat"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-black animate-pulse" />
            </div>

            <div className="text-left hidden sm:block">
              <div className="font-serif text-xs font-bold tracking-wider uppercase text-white group-hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                <span>Atelier Live Chat</span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">Gulshan Concierge Online</p>
            </div>

            {unreadBadge > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadBadge}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Slide-Over Drawer Modal */}
      {isStylistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsStylistOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-lg bg-[#FAF8F5] shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-250 border-l border-neutral-300">
            {/* Header with Luxury Brand & Tab Switcher */}
            <div className="bg-[#111111] text-white border-b border-neutral-800">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
                    {activeTab === 'concierge' ? <MessageSquare className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-sm sm:text-base font-bold tracking-wider text-white">
                        ZIPPY ATELIER CONCIERGE
                      </h2>
                      <span className="flex items-center gap-1 text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400">
                      Gulshan 1 Flagship · Dhaka, Bangladesh
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Audio Chime Toggle */}
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title={soundEnabled ? 'Mute sound chime' : 'Enable sound chime'}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-[#D4AF37]" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  {/* Close */}
                  <button
                    onClick={() => setIsStylistOpen(false)}
                    className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close concierge"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Dual Mode Tab Selector */}
              <div className="flex border-t border-neutral-800/80 bg-neutral-950 text-xs">
                <button
                  onClick={() => setActiveTab('concierge')}
                  className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-2 font-medium transition cursor-pointer border-b-2 ${
                    activeTab === 'concierge'
                      ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5 font-semibold'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Live Concierge Desk</span>
                </button>
                <button
                  onClick={() => setActiveTab('stylist')}
                  className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-2 font-medium transition cursor-pointer border-b-2 ${
                    activeTab === 'stylist'
                      ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5 font-semibold'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Sartorial Stylist</span>
                </button>
              </div>
            </div>

            {/* TAB 1: LIVE ATELIER CONCIERGE DESK */}
            {activeTab === 'concierge' && (
              <>
                {/* Fast-Track WhatsApp Ribbon */}
                <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-neutral-300 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Average reply time: <strong className="text-white font-mono">&lt; 2 minutes</strong></span>
                  </div>
                  <a
                    href="https://wa.me/8801711000001?text=Hello%20Zippy%20Concierge,%20I%20am%20inquiring%20about..."
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold transition"
                  >
                    <span>WhatsApp VIP</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Message Stream */}
                <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FDFBF7]">
                  {messages.map((msg) => {
                    const isUser = msg.senderRole === 'customer';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] text-neutral-500 font-medium">
                            {msg.senderName}
                          </span>
                          <span className="text-[9px] text-neutral-400 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                            isUser
                              ? 'bg-[#111111] text-white rounded-tr-none'
                              : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-none'
                          }`}
                        >
                          <p>{msg.message}</p>
                        </div>

                        {isUser && (
                          <div className="flex items-center gap-1 text-[9px] text-neutral-400 mt-0.5 px-1 font-mono">
                            <span>Delivered</span>
                            <CheckCheck className="w-3 h-3 text-[#9A7B38]" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Concierge Typing Animation */}
                  {isTyping && (
                    <div className="flex items-center gap-2 p-3 bg-white border border-neutral-200 rounded-2xl w-fit rounded-tl-none shadow-xs">
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[10px] text-neutral-400 font-serif italic ml-1">
                        Zippy Concierge is drafting...
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Assistance Chips */}
                <div className="px-4 py-2 border-t border-neutral-200 bg-white">
                  <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1.5">
                    Instant Inquiries:
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {(instantInquiries.length > 0
                      ? instantInquiries.filter((chip) => chip.enabled !== false)
                      : STARTER_CHIPS
                    ).map((chip, idx) => (
                      <button
                        key={(chip as any).id || idx}
                        onClick={() => handleSendMessage(chip.prompt)}
                        className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-neutral-100 border border-neutral-200 rounded-full text-[11px] text-neutral-800 font-medium whitespace-nowrap transition cursor-pointer active:scale-95"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Input Bar */}
                <div className="p-3.5 border-t border-neutral-200 bg-[#FAF8F5]">
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
                      placeholder="Type your message or inquiry..."
                      className="flex-1 bg-white border border-neutral-300 rounded-xl px-4 py-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#9A7B38] shadow-xs"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-3 bg-[#111111] hover:bg-black disabled:opacity-40 text-[#D4AF37] rounded-xl transition cursor-pointer shrink-0 shadow-sm"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* TAB 2: AI SARTORIAL STYLIST */}
            {activeTab === 'stylist' && (
              <>
                {/* AI Stylist Message Stream */}
                <div ref={aiMessagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FDFBF7]">
                  {aiMessages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] text-neutral-500 font-medium">
                            {isUser ? (user?.fullName || 'Esteemed Patron') : 'AI Master Stylist'}
                          </span>
                          <span className="text-[9px] text-neutral-400 font-mono">{msg.time}</span>
                        </div>

                        <div
                          className={`max-w-[88%] rounded-2xl px-4 py-3.5 text-xs leading-relaxed shadow-sm ${
                            isUser
                              ? 'bg-[#111111] text-white rounded-tr-none'
                              : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.content}</p>

                          {/* Curated Products recommendations */}
                          {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                            <div className="mt-3.5 pt-3 border-t border-neutral-100 space-y-2">
                              <p className="text-[10px] uppercase font-bold text-[#9A7B38] tracking-wider">
                                Curated Ensembles from the Atelier:
                              </p>
                              <div className="space-y-2">
                                {msg.suggestedProducts.map((p) => (
                                  <div
                                    key={p.id}
                                    className="flex items-center justify-between gap-3 p-2 bg-[#FAF8F5] rounded-xl border border-neutral-200/80 hover:border-neutral-300 transition"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      {p.images?.[0] && (
                                        <img
                                          src={p.images[0]}
                                          alt={p.name}
                                          className="w-10 h-12 object-cover rounded shrink-0 bg-neutral-200"
                                        />
                                      )}
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-neutral-900 truncate">
                                          {p.name}
                                        </p>
                                        <p className="text-[11px] text-[#9A7B38] font-bold">
                                          ৳{p.price.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleViewProduct(p)}
                                      className="px-2.5 py-1 bg-[#111111] hover:bg-black text-[#D4AF37] text-[10px] font-medium rounded-lg whitespace-nowrap cursor-pointer transition shrink-0"
                                    >
                                      View Piece
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Suggested Follow-up Questions */}
                        {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5 max-w-[88%]">
                            {msg.suggestedQuestions.map((q, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSendAiMessage(q)}
                                className="px-2.5 py-1 bg-white hover:bg-[#FAF8F5] border border-neutral-200 text-neutral-700 rounded-full text-[10px] transition cursor-pointer text-left shadow-2xs"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* AI Typing Indicator */}
                  {aiIsTyping && (
                    <div className="flex items-center gap-2 p-3 bg-white border border-neutral-200 rounded-2xl w-fit rounded-tl-none shadow-xs">
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[10px] text-neutral-400 font-serif italic ml-1">
                        Sartorial Intelligence is curating...
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Chat Input */}
                <div className="p-3.5 border-t border-neutral-200 bg-[#FAF8F5]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendAiMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={aiInputText}
                      onChange={(e) => setAiInputText(e.target.value)}
                      placeholder="Ask about fabrics, bespoke cuts, styling..."
                      className="flex-1 bg-white border border-neutral-300 rounded-xl px-4 py-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#9A7B38] shadow-xs"
                    />
                    <button
                      type="submit"
                      disabled={!aiInputText.trim() || aiIsTyping}
                      className="p-3 bg-[#111111] hover:bg-black disabled:opacity-40 text-[#D4AF37] rounded-xl transition cursor-pointer shrink-0 shadow-sm"
                      aria-label="Send prompt"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
