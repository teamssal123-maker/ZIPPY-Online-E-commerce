import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  ExternalLink,
  Trash2,
  Check,
  Bot,
  Flame,
  Volume2,
  VolumeX,
  Copy,
  ChevronRight,
  SlidersHorizontal,
  Plus,
  X,
  Settings2,
  RotateCcw,
  HelpCircle
} from 'lucide-react';
import { api } from '../api';
import type {
  ChatMessage,
  ChatThread,
  ChatThreadStatus,
  ChatSettings,
  ChatCannedReply,
  ChatAutoReplyRule,
  ChatInstantInquiry
} from '../types';

interface LiveChatAdminViewProps {
  onRefreshBadge?: () => void;
}

const CANNED_REPLIES = [
  {
    label: 'Bespoke Appointment',
    text: 'Good day. Our Master Tailor Maestro Kabir has consultation slots available at our Gulshan 1 flagship this week. Would morning (11 AM) or late afternoon (4:30 PM) suit your schedule best?'
  },
  {
    label: 'Order Delivery Update',
    text: 'Your order is currently being inspected and hand-packaged with our signature garment dust bag. Complimentary express courier within Dhaka typically arrives within 24–48 hours with signature confirmation.'
  },
  {
    label: 'Sizing & Alteration',
    text: 'Our garments feature tailored Italian cuts calibrated for Bangladeshi gentlemen. We offer complimentary alteration and sleeve tapering at any of our ateliers to guarantee your immaculate fit.'
  },
  {
    label: 'WhatsApp Priority Link',
    text: 'You may also reach our senior bespoke director directly via WhatsApp at +880 1711-000001 for real-time fabric swatches, bespoke measurements, and instant order updates.'
  }
];

export const LiveChatAdminView: React.FC<LiveChatAdminViewProps> = ({ onRefreshBadge }) => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting_admin' | 'active' | 'resolved'>('all');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiDrafting, setAiDrafting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [aiAutoReply, setAiAutoReply] = useState<boolean>(true);
  const [togglingAi, setTogglingAi] = useState<boolean>(false);
  const [chatSettings, setChatSettings] = useState<ChatSettings | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [customizeTab, setCustomizeTab] = useState<'templates' | 'rules' | 'canned' | 'inquiries'>('templates');
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states for customize modal
  const [greetingMessage, setGreetingMessage] = useState('');
  const [defaultAutoReply, setDefaultAutoReply] = useState('');
  const [offlineMessage, setOfflineMessage] = useState('');
  const [aiSystemPrompt, setAiSystemPrompt] = useState('');
  const [rulesList, setRulesList] = useState<ChatAutoReplyRule[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleKeywords, setNewRuleKeywords] = useState('');
  const [newRuleReply, setNewRuleReply] = useState('');
  const [cannedList, setCannedList] = useState<ChatCannedReply[]>([]);
  const [newCannedLabel, setNewCannedLabel] = useState('');
  const [newCannedCategory, setNewCannedCategory] = useState('');
  const [newCannedText, setNewCannedText] = useState('');
  const [inquiriesList, setInquiriesList] = useState<ChatInstantInquiry[]>([]);
  const [newInquiryLabel, setNewInquiryLabel] = useState('');
  const [newInquiryPrompt, setNewInquiryPrompt] = useState('');
  const [newInquiryCategory, setNewInquiryCategory] = useState('');

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousUnreadTotalRef = useRef<number>(-1);

  // Play audio chime on new customer messages
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext not allowed before user gesture
    }
  };

  const fetchThreads = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.chatThreads({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery
      });
      const threadList = Array.isArray(data) ? data : [];
      setThreads(threadList);

      // Check for incoming unread messages (only after initial load)
      const totalUnread = threadList.reduce((acc, t) => acc + (t.unreadCountAdmin || 0), 0);
      if (previousUnreadTotalRef.current !== -1 && totalUnread > previousUnreadTotalRef.current) {
        playChime();
      }
      previousUnreadTotalRef.current = totalUnread;

      // Auto-select first thread if none selected or invalid
      if (!selectedThreadId && threadList.length > 0) {
        setSelectedThreadId(threadList[0].id);
      } else if (selectedThreadId && !threadList.some((t) => t.id === selectedThreadId)) {
        if (threadList.length > 0) setSelectedThreadId(threadList[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch chat threads:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchMessages = async (threadId: string, silent = false) => {
    try {
      const msgs = await api.chatMessages(threadId);
      const list = Array.isArray(msgs) ? msgs : [];
      setMessages((prev) => {
        if (prev.length === list.length && prev[prev.length - 1]?.id === list[list.length - 1]?.id) {
          return prev;
        }
        return list;
      });

      // Mark as read only if thread currently has unread messages
      const found = threads.find((t) => t.id === threadId);
      if (found && found.unreadCountAdmin > 0) {
        await api.markChatRead(threadId, 'admin');
        if (onRefreshBadge) onRefreshBadge();
      }
    } catch (err) {
      console.error('Failed to fetch thread messages:', err);
    }
  };

  const loadChatSettings = async () => {
    try {
      const res = await api.chatSettings();
      if (res) {
        setChatSettings(res);
        if (typeof res.autoReply === 'boolean') {
          setAiAutoReply(res.autoReply);
        }
      }
    } catch (err) {
      console.error('Failed to load chat settings:', err);
    }
  };

  // Fetch initial chat settings
  useEffect(() => {
    loadChatSettings();
  }, []);

  const openCustomizeModal = (tab: 'templates' | 'rules' | 'canned' | 'inquiries' = 'templates') => {
    setCustomizeTab(tab);
    if (chatSettings) {
      setGreetingMessage(chatSettings.greetingMessage || '');
      setDefaultAutoReply(chatSettings.defaultAutoReply || '');
      setOfflineMessage(chatSettings.offlineMessage || '');
      setAiSystemPrompt(chatSettings.aiSystemPrompt || '');
      setRulesList(chatSettings.autoReplyRules || []);
      setCannedList(chatSettings.cannedReplies || []);
      setInquiriesList(chatSettings.instantInquiries || []);
    }
    setIsCustomizeModalOpen(true);
    setSaveSuccess(false);
  };

  const handleSaveCustomizeSettings = async () => {
    setSavingSettings(true);
    try {
      const updated = await api.updateChatSettings({
        autoReply: aiAutoReply,
        greetingMessage,
        defaultAutoReply,
        offlineMessage,
        aiSystemPrompt,
        autoReplyRules: rulesList,
        cannedReplies: cannedList,
        instantInquiries: inquiriesList
      });
      setChatSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsCustomizeModalOpen(false);
      }, 700);
    } catch (err) {
      console.error('Failed to save chat settings:', err);
      alert('Failed to save customized settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddRule = () => {
    if (!newRuleName.trim() || !newRuleReply.trim()) return;
    const keywordsArray = newRuleKeywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0);
    const newRule: ChatAutoReplyRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName.trim(),
      keywords: keywordsArray.length > 0 ? keywordsArray : [newRuleName.trim().toLowerCase()],
      reply: newRuleReply.trim(),
      enabled: true
    };
    setRulesList([newRule, ...rulesList]);
    setNewRuleName('');
    setNewRuleKeywords('');
    setNewRuleReply('');
  };

  const handleToggleRule = (ruleId: string) => {
    setRulesList(
      rulesList.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setRulesList(rulesList.filter((r) => r.id !== ruleId));
  };

  const handleAddCannedReply = () => {
    if (!newCannedLabel.trim() || !newCannedText.trim()) return;
    const newCanned: ChatCannedReply = {
      id: `canned-${Date.now()}`,
      label: newCannedLabel.trim(),
      category: newCannedCategory.trim() || 'General',
      text: newCannedText.trim()
    };
    setCannedList([newCanned, ...cannedList]);
    setNewCannedLabel('');
    setNewCannedCategory('');
    setNewCannedText('');
  };

  const handleDeleteCannedReply = (cannedId: string) => {
    setCannedList(cannedList.filter((c) => c.id !== cannedId));
  };

  const handleAddInquiry = () => {
    if (!newInquiryLabel.trim() || !newInquiryPrompt.trim()) return;
    const newInquiry: ChatInstantInquiry = {
      id: `inquiry-${Date.now()}`,
      label: newInquiryLabel.trim(),
      prompt: newInquiryPrompt.trim(),
      category: newInquiryCategory.trim() || 'General',
      enabled: true
    };
    setInquiriesList([newInquiry, ...inquiriesList]);
    setNewInquiryLabel('');
    setNewInquiryPrompt('');
    setNewInquiryCategory('');
  };

  const handleToggleInquiry = (inquiryId: string) => {
    setInquiriesList(
      inquiriesList.map((i) =>
        i.id === inquiryId ? { ...i, enabled: i.enabled === false ? true : false } : i
      )
    );
  };

  const handleDeleteInquiry = (inquiryId: string) => {
    setInquiriesList(inquiriesList.filter((i) => i.id !== inquiryId));
  };

  const handleResetToDefaults = () => {
    if (!window.confirm('Reset all templates, trigger rules, and canned responses to atelier defaults?')) return;
    setGreetingMessage('Greetings from Zippy Atelier. Our bespoke concierges are at your service. How may we assist with fine fabrics, occasion styling, or tailoring today?');
    setDefaultAutoReply("Thank you for contacting Zippy Gentleman's Atelier, {name}. A member of our concierge team has received your message and will review your request shortly. If your inquiry requires immediate priority, feel free to connect via WhatsApp at +880 1711-000001.");
    setOfflineMessage('Our Gulshan boutique stylists are currently away from the desk (open daily 10 AM – 10 PM). Please leave your inquiry and contact number, and we will contact you first thing in the morning.');
    setAiSystemPrompt('You are the Senior Atelier Concierge for Zippy Dhaka, the premier gentleman menswear brand in Bangladesh. Provide polite, ultra-luxurious, concise answers about bespoke suits, panjabis, shirts, fittings, and delivery.');
    setRulesList([
      {
        id: 'rule-order',
        name: 'Order Tracking & Delivery',
        keywords: ['order', 'track', 'delivery', 'courier', 'status'],
        reply: 'Greetings, {name}. For order tracking, you may provide your Order ID (e.g., ZP-1001) or check our Track Order portal. We offer complimentary 24–48 hour delivery inside Dhaka and 48–72 hours nationwide via express courier with signature verification.',
        enabled: true
      },
      {
        id: 'rule-bespoke',
        name: 'Bespoke & Tailoring Consultation',
        keywords: ['bespoke', 'tailor', 'fitting', 'custom', 'alteration', 'appointment'],
        reply: 'Delighted to assist, {name}. Our Master Tailors at the Zippy Gulshan 1 flagship atelier offer private fitting consultations for suits, sherwanis, and formal blazers. We would be pleased to reserve a 45-minute bespoke appointment for you this week. Would morning or late afternoon suit you best?',
        enabled: true
      },
      {
        id: 'rule-size',
        name: 'Sizing & Measurements',
        keywords: ['size', 'fit', 'measurement', 'chart'],
        reply: 'Our garments follow precise European sartorial grading with tailored Dhaka proportions: Slim Fit for a tapered contour and Classic Fit for ease. We also provide complimentary alteration services at any of our ateliers to achieve your immaculate fit.',
        enabled: true
      },
      {
        id: 'rule-store',
        name: 'Boutique Locations & Hours',
        keywords: ['store', 'location', 'atelier', 'hours', 'gulshan', 'dhanmondi', 'uttara'],
        reply: 'Our flagship atelier is located at Gulshan 1, Dhaka, open daily from 10:00 AM to 10:00 PM. We also welcome you at our Dhanmondi and Uttara locations. You may also reach our Senior Concierge directly on WhatsApp at +880 1711-000001.',
        enabled: true
      },
      {
        id: 'rule-offers',
        name: 'Privileges & Promotional Offers',
        keywords: ['price', 'discount', 'coupon', 'offer', 'promo', 'sale'],
        reply: 'We currently offer a welcoming privilege: use code VIPGENTLEMAN for 10% off your purchase above ৳5,000, along with complimentary expedited delivery across Dhaka.',
        enabled: true
      }
    ]);
    setCannedList([
      {
        id: 'canned-1',
        label: 'Bespoke Appointment',
        text: 'Good day. Our Master Tailor Maestro Kabir has consultation slots available at our Gulshan 1 flagship this week. Would morning (11 AM) or late afternoon (4:30 PM) suit your schedule best?',
        category: 'Appointments'
      },
      {
        id: 'canned-2',
        label: 'Order Delivery Update',
        text: 'Your order is currently being inspected and hand-packaged with our signature garment dust bag. Complimentary express courier within Dhaka typically arrives within 24–48 hours with signature confirmation.',
        category: 'Shipping'
      },
      {
        id: 'canned-3',
        label: 'Sizing & Alteration',
        text: 'Our garments feature tailored Italian cuts calibrated for Bangladeshi gentlemen. We offer complimentary alteration and sleeve tapering at any of our ateliers to guarantee your immaculate fit.',
        category: 'Fitting'
      },
      {
        id: 'canned-4',
        label: 'WhatsApp Priority Link',
        text: 'You may also reach our senior bespoke director directly via WhatsApp at +880 1711-000001 for real-time fabric swatches, bespoke measurements, and instant order updates.',
        category: 'Contact'
      }
    ]);
    setInquiriesList([
      {
        id: 'inquiry-order',
        label: '📦 Track Order',
        prompt: 'Could you help me check the delivery status of my order?',
        category: 'Orders',
        enabled: true
      },
      {
        id: 'inquiry-bespoke',
        label: '✂️ Bespoke Fitting',
        prompt: 'I would like to reserve a bespoke tailoring consultation at Gulshan 1.',
        category: 'Tailoring',
        enabled: true
      },
      {
        id: 'inquiry-size',
        label: '📏 Size & Fit Advice',
        prompt: 'Could you advise on the fit difference between Slim Fit and Tailored Fit?',
        category: 'Sizing',
        enabled: true
      },
      {
        id: 'inquiry-locations',
        label: '📍 Atelier Locations',
        prompt: 'What are the boutique hours and address of your Gulshan flagship?',
        category: 'Stores',
        enabled: true
      }
    ]);
  };

  const handleToggleAiAutoReply = async () => {
    if (togglingAi) return;
    const nextState = !aiAutoReply;
    setTogglingAi(true);
    setAiAutoReply(nextState);
    try {
      const res = await api.updateChatSettings({ autoReply: nextState });
      if (typeof res?.autoReply === 'boolean') {
        setAiAutoReply(res.autoReply);
      }
    } catch (err) {
      console.error('Failed to update AI auto-reply setting:', err);
      setAiAutoReply(!nextState);
    } finally {
      setTogglingAi(false);
    }
  };

  // Initial load and filter change
  useEffect(() => {
    fetchThreads();
  }, [statusFilter, searchQuery]);

  // Polling for threads every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchThreads(true);
      if (selectedThreadId) {
        fetchMessages(selectedThreadId, true);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [selectedThreadId, statusFilter, searchQuery]);

  // When selected thread changes, fetch messages
  useEffect(() => {
    if (selectedThreadId) {
      fetchMessages(selectedThreadId);
    } else {
      setMessages([]);
    }
  }, [selectedThreadId]);

  // Scroll ONLY the message container internally without touching window/parent
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length, selectedThreadId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedThreadId || !inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      await api.sendChatMessage(selectedThreadId, {
        message: textToSend,
        senderRole: 'concierge',
        senderName: 'Atelier Concierge'
      });
      await fetchMessages(selectedThreadId, true);
      await fetchThreads(true);
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleAiDraft = async () => {
    if (!selectedThreadId || aiDrafting) return;
    setAiDrafting(true);
    try {
      const res = await api.chatAiDraft(selectedThreadId);
      if (res?.draft) {
        setInputText(res.draft);
      }
    } catch (err) {
      console.error('Failed to get AI draft:', err);
    } finally {
      setAiDrafting(false);
    }
  };

  const handleStatusChange = async (newStatus: ChatThreadStatus) => {
    if (!selectedThreadId) return;
    try {
      await api.updateChatStatus(selectedThreadId, newStatus);
      await fetchThreads(true);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!window.confirm('Are you sure you want to delete this live chat thread and its entire history?')) return;
    try {
      await api.deleteChatThread(threadId);
      setSelectedThreadId(null);
      await fetchThreads();
    } catch (err) {
      console.error('Failed to delete thread:', err);
    }
  };

  const selectedThread = threads.find((t) => t.id === selectedThreadId);
  const totalUnreadAdmin = threads.reduce((acc, t) => acc + (t.unreadCountAdmin || 0), 0);
  const waitingAdminCount = threads.filter((t) => t.status === 'waiting_admin' || t.unreadCountAdmin > 0).length;

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <span>Live Atelier Concierge Console</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE DESK
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Real-time guest & VIP patron conversations from Zippy Dhaka storefront
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* AI Auto-Reply Switch Button */}
          <button
            type="button"
            onClick={handleToggleAiAutoReply}
            disabled={togglingAi}
            className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 transition cursor-pointer font-medium ${
              aiAutoReply
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
            title={aiAutoReply ? 'AI Auto-Reply is ON (Click to turn OFF)' : 'AI Auto-Reply is OFF (Click to turn ON)'}
          >
            <Bot className={`w-4 h-4 ${aiAutoReply ? 'text-emerald-400' : 'text-neutral-500'}`} />
            <span className="hidden sm:inline">AI Auto-Reply</span>
            <span className="sm:hidden">AI</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                aiAutoReply ? 'bg-emerald-500 text-neutral-950 shadow-xs' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {togglingAi ? '...' : aiAutoReply ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Customize Replies Modal Launcher */}
          <button
            type="button"
            onClick={() => openCustomizeModal('templates')}
            className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-amber-400 text-xs flex items-center gap-1.5 transition cursor-pointer font-medium hover:border-amber-500/40"
            title="Configure Custom Auto-Replies, Keyword Rules, and Canned Responses"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Customize Replies</span>
            <span className="sm:hidden">Replies</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
              soundEnabled
                ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
            title={soundEnabled ? 'Sound alert enabled' : 'Sound alert muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px]">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          <button
            onClick={() => fetchThreads()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium border border-neutral-700 transition cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[750px] min-h-[600px]">
        {/* Left Column: Thread List (4 cols) */}
        <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col overflow-hidden">
          {/* Search & Tabs */}
          <div className="p-3 border-b border-neutral-800 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patrons, messages, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All ({threads.length})
              </button>
              <button
                onClick={() => setStatusFilter('waiting_admin')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  statusFilter === 'waiting_admin'
                    ? 'bg-red-500 text-white font-semibold'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>Needs Reply</span>
                {waitingAdminCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold">
                    {waitingAdminCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                  statusFilter === 'active'
                    ? 'bg-neutral-700 text-white font-semibold'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                  statusFilter === 'resolved'
                    ? 'bg-neutral-700 text-white font-semibold'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Threads Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60">
            {threads.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs">No conversations match the current criteria.</p>
              </div>
            ) : (
              threads.map((thread) => {
                const isSelected = thread.id === selectedThreadId;
                const hasUnread = (thread.unreadCountAdmin || 0) > 0;
                return (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`p-3.5 transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-neutral-800/80 border-l-4 border-amber-500'
                        : hasUnread
                          ? 'bg-red-500/5 hover:bg-neutral-800/40'
                          : 'hover:bg-neutral-800/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {thread.customerName?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-neutral-200 truncate flex items-center gap-1.5">
                            <span>{thread.customerName}</span>
                            {thread.userId && (
                              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded font-mono">
                                VIP
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate">
                            {thread.customerPhone || thread.customerEmail || 'Guest Patron'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                        {hasUnread && (
                          <span className="block mt-1 ml-auto w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                            {thread.unreadCountAdmin}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-1.5 font-normal">
                      {thread.lastMessageText || 'No messages yet'}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          thread.status === 'waiting_admin'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : thread.status === 'resolved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {thread.status.replace('_', ' ')}
                      </span>
                      {thread.tags?.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-[9px] text-neutral-500 bg-neutral-950 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Live Conversation Stream (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col overflow-hidden">
          {selectedThread ? (
            <>
              {/* Conversation Header */}
              <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between gap-3 bg-neutral-950/60">
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-neutral-100 flex items-center gap-2 truncate">
                    <span>{selectedThread.customerName}</span>
                    <span className="text-[10px] text-neutral-400 font-normal truncate">
                      • {selectedThread.subject || 'Atelier Inquiry'}
                    </span>
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-mono truncate">
                    {selectedThread.customerPhone || selectedThread.customerEmail || 'Guest'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={selectedThread.status}
                    onChange={(e) => handleStatusChange(e.target.value as ChatThreadStatus)}
                    className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-[11px] px-2 py-1 rounded-lg focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="waiting_admin">Needs Reply</option>
                    <option value="waiting_customer">Waiting Patron</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <button
                    onClick={() => handleDeleteThread(selectedThread.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition cursor-pointer"
                    title="Delete thread"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Message History Feed */}
              <div
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-950/30"
              >
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500 text-xs">
                    Start conversation with {selectedThread.customerName}
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isConcierge = msg.senderRole === 'concierge' || msg.senderRole === 'admin';
                    const isAi = msg.senderRole === 'ai';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isConcierge ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] text-neutral-400 font-medium">
                            {msg.senderName}
                          </span>
                          <span className="text-[9px] text-neutral-600 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                            isConcierge
                              ? 'bg-neutral-800 border border-amber-500/30 text-neutral-100 rounded-tr-none'
                              : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none'
                          }`}
                        >
                          {msg.message}
                        </div>

                        {isConcierge && (
                          <div className="flex items-center gap-1 text-[9px] text-neutral-500 mt-0.5 px-1 font-mono">
                            <span>Sent as Atelier Concierge</span>
                            <Check className="w-2.5 h-2.5 text-amber-500" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Canned Responses Chips */}
              <div className="px-3 py-2 border-t border-neutral-800/80 bg-neutral-950/80">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                      Canned Luxury Responses:
                    </span>
                    <button
                      type="button"
                      onClick={() => openCustomizeModal('canned')}
                      className="text-[10px] text-amber-500 hover:text-amber-400 underline font-medium cursor-pointer"
                    >
                      + Customize
                    </button>
                  </div>
                  <button
                    onClick={handleAiDraft}
                    disabled={aiDrafting}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                  >
                    <Sparkles className={`w-3 h-3 ${aiDrafting ? 'animate-spin' : ''}`} />
                    <span>{aiDrafting ? 'Drafting via Gemini...' : '✨ AI Sartorial Draft'}</span>
                  </button>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {(chatSettings?.cannedReplies && chatSettings.cannedReplies.length > 0
                    ? chatSettings.cannedReplies
                    : CANNED_REPLIES
                  ).map((canned, idx) => (
                    <button
                      key={(canned as any).id || idx}
                      type="button"
                      onClick={() => setInputText(canned.text)}
                      className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded-md text-[10px] whitespace-nowrap transition cursor-pointer"
                      title={canned.text}
                    >
                      {canned.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-800 bg-neutral-900 flex gap-2">
                <textarea
                  rows={2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type concierge reply (Enter to send, Shift+Enter for newline)..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 resize-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-semibold rounded-xl text-xs flex items-center justify-center transition cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-500 space-y-2">
              <MessageSquare className="w-10 h-10 opacity-30" />
              <p className="text-xs">Select a patron conversation to view history and respond.</p>
            </div>
          )}
        </div>

        {/* Right Column: Patron Dossier & Context (3 cols) */}
        <div className="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col overflow-y-auto space-y-4">
          {/* AI Auto-Reply Automation Card */}
          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Auto-Reply</span>
              </div>
              <button
                type="button"
                onClick={handleToggleAiAutoReply}
                disabled={togglingAi}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  aiAutoReply ? 'bg-emerald-500' : 'bg-neutral-700'
                }`}
                title="Toggle AI Auto-Reply ON / OFF"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    aiAutoReply ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {aiAutoReply
                ? 'AI Concierge automatically replies to incoming inquiries with tailored atelier suggestions.'
                : 'AI Auto-Reply is off. Incoming patron messages will wait for manual concierge response.'}
            </p>
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => openCustomizeModal('templates')}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Configure Rules & Templates</span>
              </button>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Patron Information
          </h3>

          {selectedThread ? (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-sm font-bold">
                    {selectedThread.customerName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-100">{selectedThread.customerName}</h4>
                    <span className="text-[10px] text-neutral-400">
                      {selectedThread.userId ? 'Registered VIP Patron' : 'Guest Shopper'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 space-y-1.5 text-xs">
                  {selectedThread.customerPhone && (
                    <div className="flex items-center justify-between text-neutral-300">
                      <div className="flex items-center gap-1.5 text-neutral-400">
                        <Phone className="w-3 h-3" />
                        <span className="text-[11px]">{selectedThread.customerPhone}</span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedThread.customerPhone || '');
                          setCopiedPhone(true);
                          setTimeout(() => setCopiedPhone(false), 2000);
                        }}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                      >
                        {copiedPhone ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}

                  {selectedThread.customerEmail && (
                    <div className="flex items-center gap-1.5 text-neutral-300 truncate">
                      <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span className="text-[11px] truncate">{selectedThread.customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct WhatsApp Escalation */}
              {selectedThread.customerPhone && (
                <a
                  href={`https://wa.me/${selectedThread.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedThread.customerName)},%20this%20is%20Zippy%20Atelier%20Concierge...`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-medium transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open WhatsApp Direct</span>
                </a>
              )}

              {/* Thread Metadata */}
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-2 text-xs">
                <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  Session Details
                </p>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-neutral-400">
                    <span>Thread ID:</span>
                    <span className="font-mono text-neutral-300 text-[10px]">{selectedThread.id}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Initiated:</span>
                    <span className="font-mono text-neutral-300 text-[10px]">
                      {new Date(selectedThread.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Total Unread:</span>
                    <span className="font-bold text-amber-400">{selectedThread.unreadCountAdmin}</span>
                  </div>
                </div>
              </div>

              {/* Quick Tailor Notes */}
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-2 text-xs">
                <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  Atelier Concierge Notes
                </p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Complimentary fittings are hosted at our Gulshan 1 private salon. Standard alterations take 24–48 hours.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500">No active thread selected.</p>
          )}
        </div>
      </div>

      {/* Customize Replies Modal */}
      {isCustomizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                    Customize Live Chat & Automated Replies
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Fine-tune default response templates, keyword trigger rules, and concierge quick-reply buttons.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-neutral-800 bg-neutral-950 px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto">
              <button
                type="button"
                onClick={() => setCustomizeTab('templates')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  customizeTab === 'templates'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Reply Templates</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomizeTab('rules')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  customizeTab === 'rules'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Keyword Trigger Rules ({rulesList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomizeTab('canned')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  customizeTab === 'canned'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Canned Quick Responses ({cannedList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomizeTab('inquiries')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  customizeTab === 'inquiries'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Instant Inquiries ({inquiriesList.length})</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* TAB 1: Auto-Reply Templates */}
              {customizeTab === 'templates' && (
                <div className="space-y-5">
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Patron Name Dynamic Placeholder:</span>
                      <p className="text-amber-200/80 mt-0.5">
                        Include <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300 font-mono">{"{name}"}</code> in your templates. When replying, the concierge will automatically address the patron by name (e.g. &ldquo;Greetings, Kabir...&rdquo;).
                      </p>
                    </div>
                  </div>

                  {/* Default Auto-Reply Template */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-200 flex items-center justify-between">
                      <span>Default Automated Concierge Reply</span>
                      <span className="text-[10px] text-neutral-400">Triggered on initial inquiry if AI Auto-Reply is active</span>
                    </label>
                    <textarea
                      rows={3}
                      value={defaultAutoReply}
                      onChange={(e) => setDefaultAutoReply(e.target.value)}
                      placeholder="Thank you for contacting Zippy Gentleman's Atelier, {name}..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 resize-y"
                    />
                  </div>

                  {/* Welcome Greeting */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-200 flex items-center justify-between">
                      <span>Storefront Welcome Greeting</span>
                      <span className="text-[10px] text-neutral-400">Displayed in chat widget when patron opens the conversation</span>
                    </label>
                    <textarea
                      rows={2}
                      value={greetingMessage}
                      onChange={(e) => setGreetingMessage(e.target.value)}
                      placeholder="Greetings from Zippy Atelier. Our bespoke concierges are at your service..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 resize-y"
                    />
                  </div>

                  {/* Offline Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-200 flex items-center justify-between">
                      <span>After-Hours / Boutique Offline Notice</span>
                      <span className="text-[10px] text-neutral-400">Communicated outside active desk hours</span>
                    </label>
                    <textarea
                      rows={2}
                      value={offlineMessage}
                      onChange={(e) => setOfflineMessage(e.target.value)}
                      placeholder="Our Gulshan boutique stylists are currently away from the desk..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 resize-y"
                    />
                  </div>

                  {/* AI Persona Prompt */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-200 flex items-center justify-between">
                      <span>AI Sartorial Persona & Tone Instructions</span>
                      <span className="text-[10px] text-neutral-400">Directs tone and voice for AI-generated drafts & responses</span>
                    </label>
                    <textarea
                      rows={3}
                      value={aiSystemPrompt}
                      onChange={(e) => setAiSystemPrompt(e.target.value)}
                      placeholder="You are the Senior Atelier Concierge for Zippy Dhaka..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 resize-y"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Keyword Trigger Rules */}
              {customizeTab === 'rules' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                        Active Keyword Trigger Rules
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        When a customer inquiry matches these keywords, the concierge engine sends the tailored response instantly.
                      </p>
                    </div>
                  </div>

                  {/* Rules List */}
                  <div className="space-y-3">
                    {rulesList.map((rule) => (
                      <div
                        key={rule.id}
                        className={`p-4 rounded-xl border transition ${
                          rule.enabled
                            ? 'bg-neutral-950 border-neutral-800'
                            : 'bg-neutral-950/40 border-neutral-800/50 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-neutral-100">{rule.name}</h5>
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase ${
                                  rule.enabled
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-neutral-800 text-neutral-400'
                                }`}
                              >
                                {rule.enabled ? 'ACTIVE' : 'MUTED'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {rule.keywords.map((kw, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleRule(rule.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                rule.enabled
                                  ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              }`}
                            >
                              {rule.enabled ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                              title="Delete Rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-300 bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800/80 leading-relaxed font-sans">
                          {rule.reply}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Add New Rule Section */}
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3 mt-4">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Trigger Rule</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Rule Name</label>
                        <input
                          type="text"
                          value={newRuleName}
                          onChange={(e) => setNewRuleName(e.target.value)}
                          placeholder="e.g. Wedding & Sherwani Inquiries"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">
                          Trigger Keywords (comma separated)
                        </label>
                        <input
                          type="text"
                          value={newRuleKeywords}
                          onChange={(e) => setNewRuleKeywords(e.target.value)}
                          placeholder="e.g. sherwani, wedding, groom, bridal, prince coat"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Tailored Response (supports <code className="text-amber-400">{"{name}"}</code>)
                      </label>
                      <textarea
                        rows={2}
                        value={newRuleReply}
                        onChange={(e) => setNewRuleReply(e.target.value)}
                        placeholder="Greetings {name}, our ceremonial sherwani appointments include personal master tailor fittings..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 resize-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddRule}
                      disabled={!newRuleName.trim() || !newRuleReply.trim()}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-semibold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Trigger Rule</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Canned Quick Responses */}
              {customizeTab === 'canned' && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                      Desk Canned Responses
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      These pre-composed replies appear above the live chat composer, enabling stylists to dispatch polished responses with one click.
                    </p>
                  </div>

                  {/* Canned List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cannedList.map((canned) => (
                      <div
                        key={canned.id}
                        className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 flex flex-col justify-between space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-neutral-100 block">
                              {canned.label}
                            </span>
                            {canned.category && (
                              <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-mono bg-neutral-800 text-neutral-300">
                                {canned.category}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteCannedReply(canned.id)}
                            className="p-1 rounded text-neutral-500 hover:text-red-400 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-neutral-300 bg-neutral-900 p-2 rounded-lg border border-neutral-800/80 leading-relaxed font-sans line-clamp-3">
                          {canned.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Add New Canned Reply */}
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3 mt-4">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Quick Canned Reply</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Button Chip Title</label>
                        <input
                          type="text"
                          value={newCannedLabel}
                          onChange={(e) => setNewCannedLabel(e.target.value)}
                          placeholder="e.g. Gulshan Fitting Slot"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Category</label>
                        <input
                          type="text"
                          value={newCannedCategory}
                          onChange={(e) => setNewCannedCategory(e.target.value)}
                          placeholder="e.g. Appointments / Shipping / Alterations"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Full Response Text</label>
                      <textarea
                        rows={2}
                        value={newCannedText}
                        onChange={(e) => setNewCannedText(e.target.value)}
                        placeholder="Type response body here..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 resize-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCannedReply}
                      disabled={!newCannedLabel.trim() || !newCannedText.trim()}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-semibold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Canned Response</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: Instant Inquiries (Storefront Quick Starter Chips) */}
              {customizeTab === 'inquiries' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                        Storefront Instant Inquiries (Quick Starter Chips)
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        These clickable inquiry chips appear directly above the message box in the storefront live chat. Clicking a chip automatically dispatches the prompt to the atelier concierge.
                      </p>
                    </div>
                  </div>

                  {/* Instant Inquiries List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {inquiriesList.map((inquiry) => (
                      <div
                        key={inquiry.id}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 transition ${
                          inquiry.enabled !== false
                            ? 'bg-neutral-950 border-neutral-800'
                            : 'bg-neutral-950/40 border-neutral-800/50 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                              <span>{inquiry.label}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                                  inquiry.enabled !== false
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-neutral-800 text-neutral-400'
                                }`}
                              >
                                {inquiry.enabled !== false ? 'ACTIVE' : 'MUTED'}
                              </span>
                            </span>
                            {inquiry.category && (
                              <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-mono bg-neutral-800 text-neutral-400">
                                {inquiry.category}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleInquiry(inquiry.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                                inquiry.enabled !== false
                                  ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              }`}
                            >
                              {inquiry.enabled !== false ? 'Mute' : 'Enable'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInquiry(inquiry.id)}
                              className="p-1 rounded text-neutral-500 hover:text-red-400 transition cursor-pointer"
                              title="Delete Inquiry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                            Prompt sent by customer:
                          </span>
                          <p className="text-[11px] text-neutral-300 bg-neutral-900 p-2 rounded-lg border border-neutral-800/80 leading-relaxed font-sans line-clamp-3">
                            &ldquo;{inquiry.prompt}&rdquo;
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Instant Inquiry */}
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3 mt-4">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Instant Inquiry Chip</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">
                          Chip Button Title (includes emoji)
                        </label>
                        <input
                          type="text"
                          value={newInquiryLabel}
                          onChange={(e) => setNewInquiryLabel(e.target.value)}
                          placeholder="e.g. 👔 Egyptian Giza Cotton"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Category</label>
                        <input
                          type="text"
                          value={newInquiryCategory}
                          onChange={(e) => setNewInquiryCategory(e.target.value)}
                          placeholder="e.g. Shirts / Tailoring / Fabrics"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Inquiry Message Prompt Sent to Concierge
                      </label>
                      <textarea
                        rows={2}
                        value={newInquiryPrompt}
                        onChange={(e) => setNewInquiryPrompt(e.target.value)}
                        placeholder="e.g. What are the collar styling options and fabric counts for your bespoke Egyptian cotton shirts?"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 resize-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddInquiry}
                      disabled={!newInquiryLabel.trim() || !newInquiryPrompt.trim()}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-semibold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Instant Inquiry Chip</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                <span>Reset to Atelier Defaults</span>
              </button>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsCustomizeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomizeSettings}
                  disabled={savingSettings}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {savingSettings ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
