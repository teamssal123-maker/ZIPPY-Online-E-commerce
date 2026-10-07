import { config } from '../config/index.ts';
import { loadDb, mutateDb } from '../store/db.ts';
import { appendAudit } from './audit.ts';
import { createProduct, getProduct, updateProduct } from './catalogService.ts';
import { createBanner, updateBanner, updateSettings, createPage, updatePage } from './cmsService.ts';
import { createId, slugify } from '../utils/ids.ts';
import type {
  AiChatResponse,
  AiChatMessage,
  AiInquiryReplyResponse,
  AiProductCopyResponse,
  AiRecommendationItem,
  AiReviewAnalysisResponse,
  AiSeoResponse,
  AiSettings,
  Product
} from '../types/index.ts';
import type {
  Banner,
  CmsPage,
  WebsiteSettings,
  AiUploadProductInput,
  AiUploadProductResponse,
  AiManageProductInput,
  AiManageProductResponse,
  AiUpdateContentInput,
  AiUpdateContentResponse,
  AiAdminCommandInput,
  AiAdminCommandResponse
} from '../types/cms.ts';

// ----------------- Model Registry & Higher Models -----------------

export const GEMINI_MODELS = [
  // Gemini 3.1 & Up (Pinnacle Frontier Generation)
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    tier: 'pinnacle_frontier',
    description: 'Pinnacle Frontier Generation — Autonomous Multi-Step Reasoning, Flawless Creative Direction & Sartorial Nuance'
  },
  {
    id: 'gemini-3.1-flash',
    name: 'Gemini 3.1 Flash',
    tier: 'pinnacle_fast',
    description: 'Pinnacle High-Speed Frontier — Real-Time Deep Intelligence & Complex Autonomous Actions'
  },
  {
    id: 'gemini-3.5-pro',
    name: 'Gemini 3.5 Pro (Future Horizon)',
    tier: 'future_horizon',
    description: 'Next-Evolution Cognitive Architecture & Ultra-Extended Autonomous Multimodal Reasoning'
  },
  {
    id: 'gemini-3.0-pro',
    name: 'Gemini 3.0 Pro',
    tier: 'frontier_pro_3',
    description: 'Gemini 3.0 Frontier Reasoning & Advanced Multimodal Cognitive Engine'
  },
  {
    id: 'gemini-3.0-flash',
    name: 'Gemini 3.0 Flash',
    tier: 'frontier_flash_3',
    description: 'Gemini 3.0 Real-Time High-Efficiency Multimodal Flagship'
  },
  // Gemini 2.5 Series
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    tier: 'flagship_highest',
    description: 'Google Flagship Frontier — Deep Multimodal Reasoning, Superior Nuance, Complex Thinking & Planning'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    tier: 'flagship_fast',
    description: 'Next-Generation High-Speed Flagship with Advanced Reasoning & Multimodal Precision'
  },
  // Gemini 2.0 Series
  {
    id: 'gemini-2.0-pro',
    name: 'Gemini 2.0 Pro',
    tier: 'frontier_pro',
    description: 'Frontier Multimodal & Multi-Turn Sartorial Agent Reasoning'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    tier: 'frontier_flash',
    description: 'Next-Gen Ultra-Fast Real-Time Stylist Engine'
  },
  // Gemini 1.5 Series
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    tier: 'high_pro',
    description: 'Long Context Window (up to 2M tokens) & Deep Multimodal Analysis'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    tier: 'standard_fast',
    description: 'High-Throughput Lightweight Baseline'
  }
] as const;

export const OPENAI_MODELS = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    tier: 'flagship_omni',
    description: 'Omni Flagship High Precision & Creative Luxury Copywriting'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    tier: 'standard_fast',
    description: 'Fast, Cost-Effective Everyday Production'
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    tier: 'reasoning_frontier',
    description: 'Frontier High-Speed Reasoning & Analytical Precision'
  },
  {
    id: 'o1',
    name: 'o1',
    tier: 'reasoning_deep',
    description: 'Frontier Complex Thought & Step-by-Step Logic'
  }
] as const;

// ----------------- Default Prompt & Settings -----------------

const DEFAULT_SYSTEM_PROMPT =
  'You are the Master Bespoke Stylist and Atelier Concierge for Zippy Bangladesh — the premier luxury gentleman fashion atelier located in Gulshan 1, Dhaka. You provide sophisticated, knowledgeable sartorial advice on fabric, fit, styling combinations, occasion wear (weddings, galas, executive meetings), and bespoke tailoring.';

export function getAiSettings(): AiSettings {
  const db = loadDb();
  const settings = db.settings.aiSettings || {
    enabled: true,
    provider: (config.aiProvider as 'gemini' | 'openai' | 'mock') || 'gemini',
    model: config.aiModel || 'gemini-3.1-pro',
    temperature: 0.7,
    maxTokens: 1024,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    features: {
      stylistChat: true,
      productCopy: true,
      seoGeneration: true,
      inquiryAutoReply: true,
      reviewAnalysis: true,
      recommendations: true,
      chatAutoReply: true
    }
  };

  // Mask API key if set
  const rawKey = settings.apiKey || (settings.provider === 'openai' ? config.openaiApiKey : config.geminiApiKey);
  const maskedKey = rawKey
    ? rawKey.length > 8
      ? `${rawKey.slice(0, 4)}...${rawKey.slice(-4)}`
      : '****'
    : undefined;

  return {
    ...settings,
    apiKey: maskedKey
  };
}

export async function updateAiSettings(updates: Partial<AiSettings>, actorId?: string): Promise<AiSettings> {
  return mutateDb((db) => {
    if (!db.settings.aiSettings) {
      db.settings.aiSettings = {
        enabled: true,
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        temperature: 0.7,
        maxTokens: 1024,
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        features: {
          stylistChat: true,
          productCopy: true,
          seoGeneration: true,
          inquiryAutoReply: true,
          reviewAnalysis: true,
          recommendations: true,
          chatAutoReply: true
        }
      };
    }

    // If apiKey is provided and not masked, update it
    if (updates.apiKey && !updates.apiKey.includes('...')) {
      db.settings.aiSettings.apiKey = updates.apiKey.trim();
    }

    if (typeof updates.enabled === 'boolean') db.settings.aiSettings.enabled = updates.enabled;
    if (updates.provider) db.settings.aiSettings.provider = updates.provider;
    if (updates.model) db.settings.aiSettings.model = updates.model;
    if (typeof updates.temperature === 'number') db.settings.aiSettings.temperature = updates.temperature;
    if (typeof updates.maxTokens === 'number') db.settings.aiSettings.maxTokens = updates.maxTokens;
    if (updates.systemPrompt) db.settings.aiSettings.systemPrompt = updates.systemPrompt;
    if (updates.features) {
      db.settings.aiSettings.features = {
        ...db.settings.aiSettings.features,
        ...updates.features
      };
    }

    appendAudit(db, {
      userId: actorId,
      action: 'update_ai_settings',
      module: 'settings',
      recordId: 'ai',
      newValue: { provider: db.settings.aiSettings.provider, model: db.settings.aiSettings.model }
    });
    return getAiSettings();
  });
}

export function getAiStatus(): {
  status: 'active' | 'fallback_active' | 'disabled';
  provider: string;
  model: string;
  hasApiKey: boolean;
  capabilities: string[];
  supportedModels: {
    gemini: typeof GEMINI_MODELS;
    openai: typeof OPENAI_MODELS;
  };
} {
  const settings = getAiSettings();
  const db = loadDb();
  const rawKey = db.settings.aiSettings?.apiKey || (settings.provider === 'openai' ? config.openaiApiKey : config.geminiApiKey);
  const hasApiKey = Boolean(rawKey && rawKey.trim().length > 0);

  return {
    status: !settings.enabled ? 'disabled' : hasApiKey ? 'active' : 'fallback_active',
    provider: settings.provider,
    model: settings.model || 'gemini-3.1-pro',
    hasApiKey,
    capabilities: [
      'Bespoke Stylist Chat & Concierge',
      'Luxury Product Description Generator',
      'High-Conversion SEO Metadata Generator',
      'Inquiry Auto-Reply & Quoting Assistant',
      'Customer Review Sentiment & Response Generator',
      'Smart Garment Pairing & Occasion Recommendations',
      'Autonomous Product Upload & Auto-Cataloging',
      'Intelligent Catalog & Price/Stock Management',
      'Storefront Content, Banner & Settings Automation',
      'Universal AI Operations Command Dispatcher'
    ],
    supportedModels: {
      gemini: GEMINI_MODELS,
      openai: OPENAI_MODELS
    }
  };
}

// ----------------- Core LLM Gateway -----------------

async function callLlm(params: {
  systemPrompt?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string | null> {
  const db = loadDb();
  const current = db.settings.aiSettings;
  if (current && current.enabled === false) {
    return null;
  }

  const provider = current?.provider || config.aiProvider || 'gemini';
  const temperature = params.temperature ?? current?.temperature ?? 0.7;
  const maxTokens = params.maxTokens ?? current?.maxTokens ?? 1024;
  const sysPrompt = params.systemPrompt || current?.systemPrompt || DEFAULT_SYSTEM_PROMPT;

  // 1. Google Gemini API (Gemini 3.1 & Up, 2.5, 2.0, 1.5 supported)
  if (provider === 'gemini') {
    const apiKey = current?.apiKey || config.geminiApiKey;
    if (apiKey) {
      try {
        const model = current?.model || config.aiModel || 'gemini-3.1-pro';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${sysPrompt}\n\nTask:\n${params.prompt}` }]
              }
            ],
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens
            }
          }),
          signal: AbortSignal.timeout(25000)
        });

        if (res.ok) {
          const json = (await res.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text.trim();
        }
      } catch {
        // Fall through to domain fallback
      }
    }
  }

  // 2. OpenAI API (gpt-4o, o3-mini, o1, gpt-4o-mini)
  if (provider === 'openai') {
    const apiKey = current?.apiKey || config.openaiApiKey;
    if (apiKey) {
      try {
        const model = current?.model || 'gpt-4o-mini';
        const isReasoning = model.startsWith('o1') || model.startsWith('o3');
        const bodyPayload: Record<string, any> = {
          model,
          messages: [
            {
              role: isReasoning ? 'user' : 'system',
              content: isReasoning ? `${sysPrompt}\n\nTask:\n${params.prompt}` : sysPrompt
            },
            ...(isReasoning ? [] : [{ role: 'user', content: params.prompt }])
          ]
        };

        if (isReasoning) {
          bodyPayload.max_completion_tokens = maxTokens;
        } else {
          bodyPayload.temperature = temperature;
          bodyPayload.max_tokens = maxTokens;
        }

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify(bodyPayload),
          signal: AbortSignal.timeout(25000)
        });

        if (res.ok) {
          const json = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const text = json.choices?.[0]?.message?.content;
          if (text) return text.trim();
        }
      } catch {
        // Fall through to domain fallback
      }
    }
  }

  return null; // Signals to use intelligent domain fallback
}

// ----------------- Domain Fallback & Catalog Knowledge -----------------

function getCatalogContext(): {
  productSummary: string;
  catalog: Product[];
} {
  const db = loadDb();
  const catalog = db.products.filter(
    (p) => p.status === 'published' || p.status === 'active' || p.isActive !== false || !p.status
  );
  const topItems = catalog.slice(0, 15).map(
    (p) => `- ${p.name || p.title || 'Garment'} (${p.categoryName || 'Menswear'}, ৳${p.price.toLocaleString()}): ${p.shortDescription || p.description?.slice(0, 80) || ''}`
  );
  return {
    productSummary: topItems.join('\n'),
    catalog
  };
}

// ----------------- 1. Bespoke Stylist Chat & Concierge -----------------

export async function chatWithStylist(input: {
  message: string;
  history?: AiChatMessage[];
  customerName?: string;
  occasion?: string;
  budget?: number;
}): Promise<AiChatResponse> {
  const { catalog, productSummary } = getCatalogContext();
  const msgLower = input.message.toLowerCase();

  // Try calling LLM first
  const conversationContext = (input.history || [])
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'Patron' : 'Stylist'}: ${m.content}`)
    .join('\n');

  const prompt = `
Patron Name: ${input.customerName || 'Gentleman'}
Occasion: ${input.occasion || 'General Wardrobe / Atelier Consulting'}
Budget: ${input.budget ? `৳${input.budget}` : 'Flexible'}

Atelier Catalog Preview:
${productSummary}

Recent Conversation:
${conversationContext}

Patron Inquiry: "${input.message}"

Please respond as Zippy's master bespoke stylist. Be elegant, polite, and sartorially precise. Mention relevant fabrics (Super 130s wool, Egyptian Giza cotton, raw silk), cut silhouettes, and complimentary showroom services at Gulshan 1, Dhaka. If suggesting garments, pick from the atelier catalog.`;

  const llmResult = await callLlm({ prompt });
  const settings = getAiSettings();

  // Find relevant product matches from catalog
  let matchedProducts = catalog.filter((p) => {
    const text = `${p.name || ''} ${p.title || ''} ${p.categoryName || ''} ${p.tags?.join(' ') || ''} ${p.description || ''}`.toLowerCase();
    const words = msgLower.split(/\s+/).filter((w) => w.length > 3);
    return words.some((w) => text.includes(w));
  });

  if (matchedProducts.length === 0) {
    matchedProducts = catalog.slice(0, 3);
  } else {
    matchedProducts = matchedProducts.slice(0, 3);
  }

  if (llmResult) {
    return {
      reply: llmResult,
      provider: settings.provider,
      model: settings.model || 'gemini-1.5-flash',
      suggestedProducts: matchedProducts,
      suggestedQuestions: [
        'Can I book a bespoke master tailoring session in Gulshan?',
        'What shoes and cufflinks best pair with this ensemble?',
        'What are the standard delivery timelines for tailored garments?'
      ]
    };
  }

  // --- Domain Fallback Generation Engine ---
  let reply = '';
  const greeting = input.customerName ? `Greetings, ${input.customerName}. ` : 'A very warm welcome to Zippy Atelier. ';

  if (msgLower.includes('wedding') || msgLower.includes('marriage') || msgLower.includes('groom') || msgLower.includes('reception')) {
    reply = `${greeting}For matrimonial celebrations and grand galas, our atelier recommends an immaculate royal ensemble. A hand-embroidered raw silk Panjabi adorned with antique zardozi work, paired with our tailored Churidar and a regal jacquard Nehru jacket, commands timeless authority. Alternatively, our bespoke Super 140s Italian Wool Black-Tie Tuxedo with satin peak lapels offers pinnacle black-tie sophistication. Our master tailors at our Gulshan 1 showroom ensure an exquisite drape tailored to your exact posture.`;
  } else if (msgLower.includes('size') || msgLower.includes('fit') || msgLower.includes('measurement') || msgLower.includes('bespoke')) {
    reply = `${greeting}At Zippy, impeccable silhouette is our hallmark. We offer structured Slim Fits, European Modern Cuts, and Classic Comfort Drapes. For tailored blazers, we balance the jacket drop, shoulder pitch, and waist suppression precisely. If you are ordering online, please refer to our curated chest and collar sizing chart, or schedule a bespoke appointment where our master tailor will take your 18-point anatomical measurements at our Gulshan atelier.`;
  } else if (msgLower.includes('shipping') || msgLower.includes('deliver') || msgLower.includes('track') || msgLower.includes('days')) {
    reply = `${greeting}We offer complimentary courier delivery across Dhaka for all orders exceeding ৳3,000. Standard dispatch within Dhaka arrives in 24 to 48 hours (৳80 fee for orders under threshold). For nationwide delivery outside Dhaka, transit is typically 2 to 4 business days via premium secured courier (৳150). Customized bespoke tailoring requires an artisanal crafting window of 5 to 7 business days.`;
  } else if (msgLower.includes('fabric') || msgLower.includes('cotton') || msgLower.includes('wool') || msgLower.includes('wash') || msgLower.includes('care')) {
    reply = `${greeting}We source exclusively from heritage mills — Super 120s to Super 150s Merino wool, 100% two-ply Egyptian Giza cotton, and pure Mulberry silk. For wool blazers and festive panjabis, professional dry cleaning preserves the internal canvas and hand-stitched pick lapels. Our executive dress shirts should be laundered gently with mild detergent and steam-pressed inside out to preserve cotton luster.`;
  } else {
    reply = `${greeting}It is our privilege to assist with your wardrobe refinement. Whether you are dressing for high-stakes executive boardroom sessions, festive occasions, or curated weekend elegance, our artisans combine traditional Savile Row cutting techniques with contemporary South Asian grandeur. May I recommend exploring our latest handcrafted blazers or bespoke Panjabi collections?`;
  }

  return {
    reply,
    provider: 'Atelier Domain Engine',
    model: 'bespoke-menswear-v1',
    suggestedProducts: matchedProducts,
    suggestedQuestions: [
      'What accessories match well with an Italian wool blazer?',
      'How does the bespoke tailoring process work?',
      'Can you recommend an outfit for an executive evening gala?'
    ]
  };
}

// ----------------- 2. Luxury Product Copy Generator -----------------

export async function generateProductCopy(input: {
  title: string;
  category?: string;
  fabric?: string;
  fit?: string;
  tone?: string;
  occasion?: string;
  keyFeatures?: string[];
}): Promise<AiProductCopyResponse> {
  const fabric = input.fabric || 'Super 130s Merino Wool & Egyptian Giza Cotton';
  const fit = input.fit || 'Tailored Modern Silhouette';
  const occasion = input.occasion || 'Formal Evenings, Gala Receptions, Executive Meetings';
  const keyFeaturesText = input.keyFeatures?.length ? input.keyFeatures.join(', ') : 'Hand-finished pick stitching, breathable horsehair canvas, horn buttons';

  const prompt = `
Generate a luxurious, prestigious e-commerce product description for:
Product Title: ${input.title}
Category: ${input.category || 'Menswear'}
Fabric: ${fabric}
Fit Profile: ${fit}
Occasion: ${occasion}
Key Features: ${keyFeaturesText}

Format your response as valid JSON with the following keys:
{
  "description": "2-3 paragraphs of exquisite, evocative brand storytelling celebrating craftsmanship, heritage, and sophistication.",
  "shortDescription": "A compelling 1-2 sentence luxury summary for collection cards.",
  "highlights": ["4-5 distinctive craftsmanship bullet points"],
  "stylingNotes": "Curated advice on what trousers, shirt, shoes, or pocket square to style this with.",
  "careInstructions": "Precise textile care and preservation guidance."
}
`;

  const llmResult = await callLlm({
    prompt,
    temperature: 0.7
  });

  if (llmResult) {
    try {
      // Find JSON block if wrapped in markdown fences
      const jsonMatch = llmResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Partial<AiProductCopyResponse>;
        return {
          description: parsed.description || '',
          shortDescription: parsed.shortDescription || '',
          highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
          stylingNotes: parsed.stylingNotes || '',
          careInstructions: parsed.careInstructions || ''
        };
      }
    } catch {
      // Fall through to fallback
    }
  }

  // --- Fallback Domain Copy Generator ---
  return {
    description: `Imbued with the timeless dignity of master tailoring, the ${input.title} exemplifies sartorial excellence. Handcrafted from premium ${fabric}, this garment is cut to a refined ${fit} that contours naturally to the wearer's anatomy while preserving unconstrained comfort.\n\nEvery seam reflects our devotion to artisanal prestige, featuring hand-finished detailing, reinforced stress points, and custom-milled internal linings. Designed specifically for ${occasion}, it conveys effortless authority and understated luxury in every setting.\n\nInvest in an heirloom addition to your distinguished wardrobe that marries continental aesthetics with bespoke Bengali craftsmanship.`,
    shortDescription: `Artisanal ${input.title} meticulously tailored from ${fabric} with a commanding ${fit}.`,
    highlights: [
      `Milled from heritage-grade ${fabric}`,
      `Precision-cut ${fit} with hand-finished pick stitching`,
      `Breathable floating interior canvas for natural drape and movement`,
      `Bespoke horn button detailing with reinforced functional buttonholes`,
      `Engineered for ${occasion}`
    ],
    stylingNotes: `Pair with crisp double-cuff Egyptian cotton shirts, silk pocket squares in contrasting jewel tones, and handcrafted leather oxfords for quintessential evening distinction.`,
    careInstructions: `Professional dry clean only. Store on wide contoured wooden hangers and steam lightly between wears. Do not tumble dry.`
  };
}

// ----------------- 3. SEO Metadata Generator -----------------

export async function generateSeoMetadata(input: {
  title: string;
  category?: string;
  description?: string;
  brand?: string;
  keywords?: string[];
}): Promise<AiSeoResponse> {
  const brand = input.brand || 'Zippy';
  const category = input.category || 'Menswear';

  const prompt = `
Generate high-conversion SEO metadata for a luxury fashion product:
Title: ${input.title}
Category: ${category}
Brand: ${brand}
Summary: ${input.description?.slice(0, 150) || ''}

Return JSON with:
{
  "metaTitle": "Title tag under 60 characters with brand and primary keyword",
  "metaDescription": "Engaging search meta description under 155 characters with USP and call to action",
  "metaKeywords": "10-12 targeted comma-separated search keywords"
}
`;

  const llmResult = await callLlm({ prompt, temperature: 0.5 });
  if (llmResult) {
    try {
      const jsonMatch = llmResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Partial<AiSeoResponse>;
        return {
          metaTitle: parsed.metaTitle || `${input.title} | ${brand} Bangladesh`,
          metaDescription: parsed.metaDescription || '',
          metaKeywords: parsed.metaKeywords || ''
        };
      }
    } catch {
      // Fall through to fallback
    }
  }

  // --- Fallback Domain SEO Generator ---
  return {
    metaTitle: `${input.title} | Premium ${category} - ${brand}`,
    metaDescription: `Discover the bespoke ${input.title} at ${brand} Bangladesh. Handcrafted from luxury fabrics with complimentary delivery across Dhaka. Shop now.`,
    metaKeywords: `${input.title.toLowerCase()}, ${category.toLowerCase()}, ${brand.toLowerCase()}, bespoke menswear, luxury fashion dhaka, designer blazers bangladesh, groom wedding panjabi, gentleman atelier`
  };
}

// ----------------- 4. Inquiry Auto-Reply & Quoting Assistant -----------------

export async function suggestInquiryReply(input: {
  inquiryId?: string;
  customerName?: string;
  customerEmail?: string;
  customerMessage: string;
  productName?: string;
  productPrice?: number;
}): Promise<AiInquiryReplyResponse> {
  const name = input.customerName || 'Honored Patron';
  const product = input.productName ? `regarding "${input.productName}"` : '';

  const prompt = `
You are the Chief Concierge at Zippy Atelier. Draft a polite, prompt, and bespoke customer support reply:
Customer: ${name} (${input.customerEmail || 'Guest'})
Product: ${input.productName || 'Bespoke Collection'} (Price: ৳${input.productPrice || 'N/A'})
Inquiry: "${input.customerMessage}"

Return JSON:
{
  "reply": "Warm, formal, informative reply answering customer question, offering tailoring modifications if applicable, and inviting to showroom",
  "actionSuggestion": "Recommended administrative action (e.g. Schedule Fitting, Confirm Stock, Send Quotation)",
  "suggestedPriceQuotation": estimated numerical BDT price if custom work requested
}
`;

  const llmResult = await callLlm({ prompt, temperature: 0.6 });
  if (llmResult) {
    try {
      const jsonMatch = llmResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Partial<AiInquiryReplyResponse>;
        return {
          reply: parsed.reply || '',
          actionSuggestion: parsed.actionSuggestion || 'Follow up with customer via phone or WhatsApp',
          suggestedPriceQuotation: parsed.suggestedPriceQuotation
        };
      }
    } catch {
      // Fall through
    }
  }

  // --- Fallback Domain Inquiry Assistant ---
  return {
    reply: `Dear ${name},\n\nThank you for contacting Zippy Atelier ${product}. It is our pleasure to attend to your bespoke styling needs.\n\nIn response to your inquiry regarding custom craftsmanship and availability, our master tailors can certainly accommodate personalized modifications (including sleeve pitch adjustment, monogramming, and hand-selected antique metal buttons). Custom tailoring requests typically require 5 to 7 crafting days.\n\nWe cordially invite you to visit our flagship boutique in Gulshan 1, Dhaka for a private measurement consultation. Alternatively, our concierge team can finalize your order details over WhatsApp at +880 1711-000001.\n\nWith warm regards,\nThe Master Tailor\nZippy Atelier Bangladesh`,
    actionSuggestion: 'Schedule Fitting or Follow Up via WhatsApp Concierge',
    suggestedPriceQuotation: input.productPrice ? Math.round(input.productPrice * 1.15) : undefined
  };
}

// ----------------- 5. Customer Review Sentiment & Reply -----------------

export async function analyzeReviewSentiment(input: {
  rating: number;
  comment: string;
  authorName?: string;
  productName?: string;
}): Promise<AiReviewAnalysisResponse> {
  const isPositive = input.rating >= 4;
  const isNegative = input.rating <= 2;
  const sentiment = isPositive ? 'positive' : isNegative ? 'negative' : 'neutral';
  const name = input.authorName || 'Patron';

  const prompt = `
Analyze this customer review for Zippy Atelier:
Author: ${name}
Rating: ${input.rating} / 5
Product: ${input.productName || 'Menswear'}
Comment: "${input.comment}"

Return JSON:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": numerical score between 0.0 (very negative) and 1.0 (very positive),
  "keyThemes": ["array of 2-4 keywords e.g. Fabric Quality, Delivery, Fit"],
  "requiresUrgentAttention": boolean (true if negative or complaint),
  "suggestedReply": "Gracious, personalized official atelier reply to publish under the review"
}
`;

  const llmResult = await callLlm({ prompt, temperature: 0.5 });
  if (llmResult) {
    try {
      const jsonMatch = llmResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Partial<AiReviewAnalysisResponse>;
        return {
          sentiment: parsed.sentiment || sentiment,
          score: typeof parsed.score === 'number' ? parsed.score : input.rating / 5,
          keyThemes: Array.isArray(parsed.keyThemes) ? parsed.keyThemes : ['Craftsmanship', 'Fitting'],
          requiresUrgentAttention: Boolean(parsed.requiresUrgentAttention ?? isNegative),
          suggestedReply: parsed.suggestedReply || ''
        };
      }
    } catch {
      // Fall through
    }
  }

  // --- Fallback Domain Sentiment Engine ---
  let suggestedReply = '';
  if (isPositive) {
    suggestedReply = `Dear ${name}, thank you for your generous praise. We are delighted that your Zippy garment met your sartorial expectations. It remains our highest honor to craft pieces that accompany you on life's finest occasions.`;
  } else if (isNegative) {
    suggestedReply = `Dear ${name}, we sincerely apologize that your experience did not meet the rigorous standards of our atelier. Excellence is our unwavering commitment, and our Client Relations Director would like to personally address your concerns and arrange an exchange or complimentary alteration. Please reach out to us directly at hello@zippy.com.bd.`;
  } else {
    suggestedReply = `Dear ${name}, thank you for sharing your thoughtful feedback. We continually refine our patterns and fabrics to deliver the finest menswear in Bangladesh. We look forward to dressing you again soon.`;
  }

  return {
    sentiment,
    score: input.rating / 5,
    keyThemes: ['Quality & Finish', 'Sizing & Drape', 'Atelier Service'],
    requiresUrgentAttention: isNegative,
    suggestedReply
  };
}

// ----------------- 6. Smart Garment Recommendations -----------------

export async function getSmartRecommendations(input: {
  productId?: string;
  query?: string;
  occasion?: string;
  categoryId?: string;
  limit?: number;
}): Promise<{ recommendations: AiRecommendationItem[]; total: number }> {
  const db = loadDb();
  const catalog = db.products.filter(
    (p) => p.status === 'published' || p.status === 'active' || p.isActive !== false || !p.status
  );
  const targetProduct = input.productId ? catalog.find((p) => p.id === input.productId) : null;
  const limit = input.limit || 4;

  const results: AiRecommendationItem[] = [];

  for (const prod of catalog) {
    if (targetProduct && prod.id === targetProduct.id) continue;

    // Check pairing affinity
    let matchReason = '';
    let stylingTip = '';

    const targetCat = (targetProduct?.categoryName || '').toLowerCase();
    const currentCat = (prod.categoryName || '').toLowerCase();

    if (targetCat.includes('blazer') || targetCat.includes('suit')) {
      if (currentCat.includes('shirt')) {
        matchReason = 'Essential Formal Layering';
        stylingTip = 'Provides crisp collar roll and cuffs beneath structured wool lapels.';
      } else if (currentCat.includes('pant') || currentCat.includes('trouser')) {
        matchReason = 'Harmonious Tonal Contrast';
        stylingTip = 'Complements jacket structure with a sharp, unbroken leg line.';
      } else if (currentCat.includes('accessories')) {
        matchReason = 'Atelier Finishing Accent';
        stylingTip = 'Adds subtle sophistication to peak or notch lapels.';
      }
    } else if (targetCat.includes('ethnic') || targetCat.includes('panjabi')) {
      if (currentCat.includes('accessories')) {
        matchReason = 'Traditional Matrimonial Ensemble';
        stylingTip = 'Pair with handcrafted footwear or matching stole for celebrations.';
      } else if (currentCat.includes('blazer') || currentCat.includes('jacket')) {
        matchReason = 'Contemporary Indo-Western Fusion';
        stylingTip = 'Layer a textured Nehru jacket over this panjabi for regal stature.';
      }
    }

    if (!matchReason && input.occasion) {
      matchReason = `Curated for ${input.occasion}`;
      stylingTip = 'Chosen for refined comfort and commanding silhouette.';
    } else if (!matchReason) {
      matchReason = 'Complementary Atelier Piece';
      stylingTip = 'Pairs seamlessly with seasonal wardrobe essentials.';
    }

    results.push({
      productId: prod.id,
      title: prod.name || prod.title || 'Zippy Garment',
      slug: prod.slug,
      price: prod.price,
      image: prod.images?.[0] || prod.featuredImage,
      category: prod.categoryName,
      matchReason,
      stylingTip
    });

    if (results.length >= limit) break;
  }

  return {
    recommendations: results,
    total: results.length
  };
}

// ----------------- Autonomous AI Operations Subsystem -----------------

/**
 * 1. AI Product Uploader
 * Parses natural language description, raw specifications, or supplier notes,
 * crafts luxury sartorial copy, sizes, stock, fabric, colors, tags, and category,
 * and directly uploads and publishes the product into the catalog.
 */
export async function aiUploadProduct(
  input: AiUploadProductInput,
  actorId?: string
): Promise<AiUploadProductResponse> {
  const db = loadDb();
  const prompt = (input.prompt || '').trim();

  // Step 1: Attempt LLM Extraction
  let parsed: any = null;
  const llmSysPrompt =
    'You are the Master Atelier Catalog Director for Zippy Bangladesh — premier luxury gentlemen fashion house. Parse user specifications into rich, refined product details. Return ONLY valid JSON with no markdown code fences.';

  const userPrompt = `Input: "${prompt}"

Required JSON schema:
{
  "name": "Refined product name with luxury phrasing",
  "categoryName": "Panjabi / Suits & Blazers / Shirts / Trousers / Sherwani / Accessories / Footwear",
  "price": 14500,
  "salePrice": null,
  "fabric": "Luxury fabric (e.g. 100% Giza Cotton, Italian Tropical Wool, Mulberry Raw Silk)",
  "fit": "Tailored Fit",
  "gender": "Men",
  "description": "Eloquent 2-paragraph atelier description highlighting silhouette, drape, and tailoring",
  "shortDescription": "1-2 sentence memorable overview",
  "highlights": ["3 to 4 artisan bullet points"],
  "careInstructions": ["Dry clean only", "Cool iron on reverse"],
  "colors": [{"name": "Royal Emerald", "hex": "#064e3b"}],
  "sizes": ["38", "40", "42", "44"],
  "stock": {"38": 15, "40": 20, "42": 20, "44": 15},
  "tags": ["panjabi", "festive", "luxury", "atelier"]
}`;

  try {
    const raw = await callLlm({
      systemPrompt: llmSysPrompt,
      prompt: userPrompt,
      temperature: 0.3,
      maxTokens: 2048
    });
    if (raw) {
      const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(clean);
    }
  } catch {
    parsed = null;
  }

  // Step 2: Intelligent Domain Parser Fallback
  if (!parsed || !parsed.name || typeof parsed.price !== 'number') {
    const pLower = prompt.toLowerCase();

    // Price & Sale Price
    const saleMatch = prompt.match(/(?:sale\s*(?:price)?|discount|offer|promo)\s*[:=]?\s*(\d+[\d,]*)/i);
    const salePrice = saleMatch ? Number(saleMatch[1].replace(/,/g, '')) : null;

    // Main price should not match the sale price
    const priceMatch =
      prompt.match(/(?<!sale\s*)price\s*[:=]?\s*(\d+[\d,]*)/i) ||
      prompt.match(/(?:tk|bdt|৳|cost|at)\s*[:=]?\s*(\d+[\d,]*)/i) ||
      prompt.match(/\b(\d{3,6})\b/);
    const rawPrice = priceMatch ? Number(priceMatch[1].replace(/,/g, '')) : 12500;

    // Category detection
    let detectedCat = db.categories.find(
      (c) => pLower.includes(c.name.toLowerCase()) || pLower.includes(c.slug.toLowerCase())
    );
    if (!detectedCat) {
      if (pLower.includes('panjabi') || pLower.includes('punjabi') || pLower.includes('kurta')) {
        detectedCat = db.categories.find((c) => c.name.toLowerCase().includes('panjabi'));
      } else if (pLower.includes('suit') || pLower.includes('blazer') || pLower.includes('tuxedo')) {
        detectedCat = db.categories.find((c) => c.name.toLowerCase().includes('suit') || c.name.toLowerCase().includes('blazer'));
      } else if (pLower.includes('sherwani')) {
        detectedCat = db.categories.find((c) => c.name.toLowerCase().includes('sherwani'));
      } else if (pLower.includes('shirt')) {
        detectedCat = db.categories.find((c) => c.name.toLowerCase().includes('shirt'));
      } else if (pLower.includes('pant') || pLower.includes('trouser') || pLower.includes('chino')) {
        detectedCat = db.categories.find((c) => c.name.toLowerCase().includes('trouser') || c.name.toLowerCase().includes('pant'));
      } else {
        detectedCat = db.categories[0];
      }
    }

    // Fabric
    let fabric = 'Luxury Atelier Blend';
    if (pLower.includes('silk') || pLower.includes('raw silk')) fabric = '100% Mulberry Silk';
    else if (pLower.includes('cotton') || pLower.includes('giza')) fabric = '100% Egyptian Giza Cotton';
    else if (pLower.includes('wool') || pLower.includes('cashmere')) fabric = 'Super 140s Italian Wool & Cashmere';
    else if (pLower.includes('linen')) fabric = 'Pure Irish Linen';
    else if (pLower.includes('velvet')) fabric = 'Plush Royal Velvet';
    else if (pLower.includes('jamdani')) fabric = 'Handloom Jamdani Cotton-Silk';

    // Fit
    let fit = 'Tailored Fit';
    if (pLower.includes('slim')) fit = 'Slim Fit';
    else if (pLower.includes('classic')) fit = 'Classic Fit';
    else if (pLower.includes('regular')) fit = 'Regular Fit';

    // Name extraction & cleaning
    let cleanName = prompt
      .replace(/(?:upload|create|add|new|product|item)\s*(?:a|an)?/gi, '')
      .replace(/(?:price|tk|bdt|৳|cost|at)\s*[:=]?\s*(\d+[\d,]*)/gi, '')
      .replace(/(?:sale|discount|offer|promo)\s*[:=]?\s*(\d+[\d,]*)/gi, '')
      .replace(/(?:sizes?|stock|qty)\s*[:=]?\s*[\w\s,]+/gi, '')
      .replace(/[":;]/g, '')
      .trim();

    if (cleanName.length < 3) {
      cleanName = `${fabric} ${detectedCat?.name || 'Garment'}`;
    }
    cleanName = cleanName.replace(/\b\w/g, (l) => l.toUpperCase());

    const isNumberedSizes =
      detectedCat?.name.toLowerCase().includes('panjabi') || detectedCat?.name.toLowerCase().includes('suit');
    const defaultSizes = isNumberedSizes ? ['38', '40', '42', '44'] : ['S', 'M', 'L', 'XL'];
    const stockMap: Record<string, number> = {};
    for (const s of defaultSizes) stockMap[s] = 12;

    parsed = {
      name: cleanName,
      categoryName: detectedCat?.name || 'Panjabi',
      price: rawPrice,
      salePrice: salePrice && salePrice < rawPrice ? salePrice : null,
      fabric,
      fit,
      gender: 'Men',
      description: `Meticulously handcrafted in the Zippy Dhaka atelier, this ${cleanName} embodies pinnacle sartorial elegance. Cut from exquisite ${fabric} with an immaculate ${fit} silhouette, it features hand-finished seams, bespoke buttoning, and an effortless drape suited for elite celebrations and commanding presence.`,
      shortDescription: `Artisan handcrafted ${cleanName} in ${fabric}.`,
      highlights: [
        `Tailored from ${fabric}`,
        `Modern ${fit} silhouette`,
        'Hand-finished bespoke detailing',
        'Signature Zippy Dhaka Atelier craftsmanship'
      ],
      careInstructions: [
        'Dry clean only by fine garment specialists',
        'Steam press with low heat',
        'Store on contoured atelier hanger in breathable garment bag'
      ],
      colors: [{ name: 'Atelier Classic', hex: '#1e293b' }],
      sizes: defaultSizes,
      stock: stockMap,
      tags: [detectedCat?.slug || 'menswear', 'atelier', 'luxury', 'exclusive']
    };
  }

  // Step 3: Match Category
  const matchedCategory =
    db.categories.find(
      (c) =>
        c.name.toLowerCase() === parsed.categoryName?.toLowerCase() ||
        c.slug.toLowerCase() === parsed.categoryName?.toLowerCase()
    ) ||
    db.categories.find((c) => c.name.toLowerCase().includes((parsed.categoryName || '').toLowerCase())) ||
    db.categories[0];

  const categoryId = matchedCategory ? matchedCategory.id : 'cat-panjabi';
  const categoryName = matchedCategory ? matchedCategory.name : 'Panjabi';

  // Step 4: Images
  let images: string[] = [];
  if (input.overrides?.images && input.overrides.images.length > 0) {
    images = input.overrides.images;
  } else {
    const sibling = db.products.find((p) => p.categoryId === categoryId && p.images && p.images.length > 0);
    if (sibling && sibling.images[0]) {
      images = [sibling.images[0]];
    } else {
      images = ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1200'];
    }
  }

  // Step 5: Construct Product Payload
  const shortSlug = slugify(parsed.name || 'zippy-product');
  const catCode = categoryName.slice(0, 3).toUpperCase();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const sku = input.overrides?.sku || `RM-${catCode}-${randNum}`;

  const stockMap: Record<string, number> = parsed.stock || { M: 10, L: 10, XL: 10 };
  const totalStock = Object.values(stockMap).reduce((a, b) => a + Number(b || 0), 0);

  const productDraft: Product = {
    id: input.overrides?.id || createId('prod'),
    name: parsed.name,
    slug: shortSlug,
    sku,
    styleCode: `ST-${catCode}-${randNum}`,
    categoryId,
    categoryName,
    price: Number(parsed.price) || 12500,
    salePrice: parsed.salePrice ? Number(parsed.salePrice) : undefined,
    description: parsed.description,
    shortDescription: parsed.shortDescription,
    fabric: parsed.fabric || 'Luxury Blend',
    fit: parsed.fit || 'Tailored Fit',
    gender: parsed.gender || 'Men',
    images,
    colors: parsed.colors || [{ name: 'Atelier Classic', hex: '#1e293b' }],
    sizes: parsed.sizes || Object.keys(stockMap),
    stock: stockMap,
    stockQuantity: totalStock,
    featured: input.overrides?.featured ?? true,
    newArrival: input.overrides?.newArrival ?? true,
    onSale: Boolean(parsed.salePrice && parsed.salePrice < parsed.price),
    rating: 5.0,
    reviewCount: 0,
    careInstructions: parsed.careInstructions || ['Dry clean only'],
    tags: parsed.tags || ['atelier', 'luxury'],
    status: input.overrides?.status || 'published',
    isActive: true,
    ...input.overrides
  };

  if (input.dryRun) {
    return {
      success: true,
      dryRun: true,
      product: productDraft,
      summary: `[Preview] Product drafted: "${productDraft.name}" (SKU: ${productDraft.sku}) in ${productDraft.categoryName} at ৳${productDraft.price.toLocaleString()}.`
    };
  }

  // Step 6: Persist in Store
  const created = await createProduct(productDraft);
  appendAudit(loadDb(), {
    userId: actorId || 'ai-agent',
    action: 'ai_product_uploaded',
    module: 'products',
    recordId: created.id,
    newValue: created
  });

  return {
    success: true,
    dryRun: false,
    product: created,
    summary: `Successfully uploaded and published "${created.name}" (SKU: ${created.sku}) in category "${created.categoryName}" at ৳${created.price.toLocaleString()} with ${totalStock} units across sizes [${created.sizes.join(', ')}].`
  };
}

/**
 * 2. AI Product & Catalog Manager
 * Performs natural language catalog actions: updates price, sale discounts,
 * restocks inventory, sets featured/published status, and updates product tags.
 */
export async function aiManageProduct(
  input: AiManageProductInput,
  actorId?: string
): Promise<AiManageProductResponse> {
  const db = loadDb();
  const command = (input.command || '').trim();
  const cLower = command.toLowerCase();

  // Locate target product
  let target: Product | undefined;
  if (input.productId) {
    target = db.products.find((p) => p.id === input.productId && !p.deletedAt);
  }
  if (!target && input.targetQuery) {
    const q = input.targetQuery.toLowerCase();
    target = db.products.find(
      (p) => !p.deletedAt && (p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.sku.toLowerCase() === q)
    );
  }
  if (!target) {
    for (const p of db.products) {
      if (p.deletedAt) continue;
      if (cLower.includes(p.name.toLowerCase()) || cLower.includes(p.slug.toLowerCase()) || cLower.includes(p.sku.toLowerCase())) {
        target = p;
        break;
      }
    }
  }
  if (!target) {
    const catWords = ['panjabi', 'sherwani', 'suit', 'blazer', 'shirt', 'trouser', 'polo'];
    for (const w of catWords) {
      if (cLower.includes(w)) {
        target = db.products.find((p) => !p.deletedAt && p.categoryName.toLowerCase().includes(w));
        if (target) break;
      }
    }
  }
  if (!target) {
    target = db.products.find((p) => !p.deletedAt);
  }
  if (!target) {
    return {
      success: false,
      dryRun: false,
      changes: {},
      summary: 'No active catalog product was found to update.'
    };
  }

  const updates: Partial<Product> = {};
  const changesSummary: string[] = [];

  // Price updates
  const priceMatch = command.match(/(?:set\s+)?price\s*(?:to|is|=)?\s*(\d+[\d,]*)/i);
  if (priceMatch) {
    const newPrice = Number(priceMatch[1].replace(/,/g, ''));
    if (!isNaN(newPrice) && newPrice > 0) {
      updates.price = newPrice;
      changesSummary.push(`Price set to ৳${newPrice.toLocaleString()}`);
    }
  }

  // Sale Price
  const saleMatch = command.match(/(?:sale|discount|offer)\s*(?:price)?\s*(?:to|is|=)?\s*(\d+[\d,]*)/i);
  if (saleMatch) {
    const newSale = Number(saleMatch[1].replace(/,/g, ''));
    if (!isNaN(newSale) && newSale > 0) {
      updates.salePrice = newSale;
      updates.onSale = true;
      changesSummary.push(`Sale Price set to ৳${newSale.toLocaleString()}`);
    }
  }

  // Percentage discount
  const pctMatch = command.match(/(\d+)%\s*(?:discount|off)/i) || command.match(/(?:discount|off)\s*(?:by\s*)?(\d+)%/i);
  if (pctMatch) {
    const pct = Number(pctMatch[1]);
    if (pct > 0 && pct < 100) {
      const basePrice = updates.price || target.price;
      const calculatedSale = Math.round(basePrice * (1 - pct / 100));
      updates.salePrice = calculatedSale;
      updates.onSale = true;
      changesSummary.push(`Applied ${pct}% discount (Sale Price: ৳${calculatedSale.toLocaleString()})`);
    }
  }

  if (cLower.includes('remove discount') || cLower.includes('end sale') || cLower.includes('remove sale')) {
    updates.salePrice = null;
    updates.onSale = false;
    changesSummary.push('Removed promotional sale price');
  }

  // Stock
  const stockMatch =
    command.match(/stock\s*(?:of\s*(?:size\s*)?([A-Za-z0-9]+))?\s*(?:to|is|=)?\s*(\d+)/i) ||
    command.match(/restock\s*(?:size\s*)?([A-Za-z0-9]+)?\s*(?:to|by|=)?\s*(\d+)/i);
  if (stockMatch) {
    const size = stockMatch[1]?.toUpperCase();
    const qty = Number(stockMatch[2]);
    const nextStock = { ...(target.stock || {}) };
    if (size && nextStock[size] !== undefined) {
      nextStock[size] = qty;
      changesSummary.push(`Size ${size} stock set to ${qty}`);
    } else if (size) {
      nextStock[size] = qty;
      changesSummary.push(`Added size ${size} with stock ${qty}`);
    } else {
      for (const s of Object.keys(nextStock)) {
        nextStock[s] = qty;
      }
      changesSummary.push(`All sizes restocked to ${qty}`);
    }
    updates.stock = nextStock;
    updates.stockQuantity = Object.values(nextStock).reduce((a, b) => a + Number(b || 0), 0);
  }

  // Status & Visibility
  if (cLower.includes('publish')) {
    updates.status = 'published';
    updates.isActive = true;
    changesSummary.push('Status set to Published');
  } else if (cLower.includes('draft') || cLower.includes('unpublish')) {
    updates.status = 'draft';
    changesSummary.push('Status set to Draft');
  } else if (cLower.includes('archive')) {
    updates.status = 'archived';
    changesSummary.push('Status set to Archived');
  }

  if (cLower.includes('mark as featured') || cLower.includes('featured')) {
    updates.featured = true;
    changesSummary.push('Marked as Featured');
  } else if (cLower.includes('unfeature')) {
    updates.featured = false;
    changesSummary.push('Unmarked from Featured');
  }

  // Tags
  const tagMatch = command.match(/(?:add\s+)?tags?\s*[:=]?\s*([a-zA-Z0-9,\s-]+)/i);
  if (tagMatch) {
    const newTags = tagMatch[1].split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    const mergedTags = Array.from(new Set([...(target.tags || []), ...newTags]));
    updates.tags = mergedTags;
    changesSummary.push(`Tags updated: [${newTags.join(', ')}]`);
  }

  if (changesSummary.length === 0) {
    changesSummary.push('Verified inventory and refreshed catalog timestamp');
    updates.updatedAt = new Date().toISOString();
  }

  if (input.dryRun) {
    return {
      success: true,
      dryRun: true,
      product: { ...target, ...updates },
      changes: updates,
      summary: `[Preview] Changes prepared for "${target.name}": ${changesSummary.join('; ')}.`
    };
  }

  const updated = await updateProduct(target.id, updates);
  appendAudit(loadDb(), {
    userId: actorId || 'ai-agent',
    action: 'ai_product_managed',
    module: 'products',
    recordId: target.id,
    oldValue: target,
    newValue: updated
  });

  return {
    success: true,
    dryRun: false,
    product: updated,
    changes: updates,
    summary: `Successfully updated "${target.name}" (SKU: ${target.sku}): ${changesSummary.join('; ')}.`
  };
}

/**
 * 3. AI Content & CMS Updater
 * Updates storefront announcement ticker, creates/updates promotional banners,
 * modifies website settings (hotlines, footers), or updates luxury CMS pages.
 */
export async function aiUpdateContent(
  input: AiUpdateContentInput,
  actorId?: string
): Promise<AiUpdateContentResponse> {
  const db = loadDb();
  const prompt = (input.prompt || '').trim();
  const pLower = prompt.toLowerCase();

  let target = input.target || 'auto';
  if (target === 'auto') {
    if (pLower.includes('announcement') || pLower.includes('top bar') || pLower.includes('ticker')) {
      target = 'announcement';
    } else if (pLower.includes('banner') || pLower.includes('hero') || pLower.includes('slider')) {
      target = 'banner';
    } else if (pLower.includes('page') || pLower.includes('about us') || pLower.includes('faq')) {
      target = 'page';
    } else {
      target = 'settings';
    }
  }

  // 1. Announcement Bar
  if (target === 'announcement') {
    let text = prompt
      .replace(/(?:update|set|change)?\s*(?:the)?\s*announcement\s*(?:bar)?\s*(?:to|is|=)?/gi, '')
      .replace(/^["':\s]+|["'\s]+$/g, '')
      .trim();

    if (!text || text.length < 5) {
      text =
        'Complimentary Bespoke Tailoring & Concierge Styling at Gulshan 1 Atelier | Free Express Nationwide Delivery over ৳3,000';
    }

    if (input.dryRun) {
      return {
        success: true,
        target: 'announcement',
        dryRun: true,
        updatedRecord: { headerAnnouncementText: text, headerAnnouncementEnabled: true },
        summary: `[Preview] Announcement bar text will be updated to: "${text}".`
      };
    }

    const updated = await updateSettings(
      {
        headerAnnouncementEnabled: true,
        headerAnnouncementText: text,
        announcementBanner: {
          enabled: true,
          text,
          link: '/shop'
        }
      } as any,
      actorId
    );

    return {
      success: true,
      target: 'announcement',
      dryRun: false,
      updatedRecord: updated,
      summary: `Storefront announcement banner updated to: "${text}".`
    };
  }

  // 2. Promotional Banners
  if (target === 'banner') {
    let title = 'Royal Autumn & Festive Bespoke Collection';
    let subtitle = 'Mastercrafted Panjabis, Italian Wool Suits & Embroidered Sherwanis.';
    let buttonText = 'Explore Collection';
    let buttonUrl = '/shop';

    const quoteMatches = prompt.match(/"([^"]+)"/g);
    if (quoteMatches && quoteMatches.length >= 2) {
      title = quoteMatches[0].replace(/"/g, '');
      subtitle = quoteMatches[1].replace(/"/g, '');
    } else if (quoteMatches && quoteMatches.length === 1) {
      title = quoteMatches[0].replace(/"/g, '');
    }

    const bannerDraft: Partial<Banner> = {
      title,
      subtitle,
      buttonText,
      buttonUrl,
      imageDesktop: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1920',
      imageMobile: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
      position: 'hero_main',
      sortOrder: 1,
      status: 'published'
    };

    if (input.dryRun) {
      return {
        success: true,
        target: 'banner',
        dryRun: true,
        updatedRecord: bannerDraft,
        summary: `[Preview] Hero Banner drafted: "${title}" — ${subtitle}.`
      };
    }

    let resultBanner: Banner;
    if (input.bannerId) {
      resultBanner = await updateBanner(input.bannerId, bannerDraft, actorId);
    } else {
      resultBanner = await createBanner(bannerDraft, actorId);
    }

    return {
      success: true,
      target: 'banner',
      dryRun: false,
      updatedRecord: resultBanner,
      summary: `Hero banner "${resultBanner.title}" published successfully.`
    };
  }

  // 3. Website Settings
  if (target === 'settings') {
    const updates: Partial<WebsiteSettings> = {};
    const sumParts: string[] = [];

    const phoneMatch = prompt.match(/(?:phone|hotline|contact)\s*(?:to|is|=)?\s*([+0-9\s-]+)/i);
    if (phoneMatch) {
      updates.phone = phoneMatch[1].trim();
      updates.headerHotline = phoneMatch[1].trim();
      sumParts.push(`Hotline set to ${updates.phone}`);
    }

    const shipMatch = prompt.match(/(?:free\s+shipping|shipping\s+threshold)\s*(?:to|is|=)?\s*(\d+)/i);
    if (shipMatch) {
      const val = Number(shipMatch[1]);
      (updates as any).freeShippingThreshold = val;
      sumParts.push(`Free shipping threshold set to ৳${val}`);
    }

    const footerMatch = prompt.match(/(?:footer|copyright)\s*(?:to|is|=)?\s*["']?([^"']+)["']?/i);
    if (footerMatch) {
      updates.footerCopyright = footerMatch[1].trim();
      sumParts.push(`Footer copyright updated`);
    }

    if (sumParts.length === 0) {
      updates.footerTagline = 'Gulshan 1, Dhaka — Refined Luxury Menswear & Bespoke Sartorial Tailoring';
      sumParts.push('Updated brand tagline and atelier presence');
    }

    if (input.dryRun) {
      return {
        success: true,
        target: 'settings',
        dryRun: true,
        updatedRecord: updates,
        summary: `[Preview] Settings changes: ${sumParts.join('; ')}.`
      };
    }

    const updated = await updateSettings(updates, actorId);
    return {
      success: true,
      target: 'settings',
      dryRun: false,
      updatedRecord: updated,
      summary: `Website settings updated: ${sumParts.join('; ')}.`
    };
  }

  // 4. CMS Page
  const pageTitle = 'Bespoke Sartorial Tailoring Protocol';
  const pageSlug = input.pageSlug || 'bespoke-tailoring';
  const pageContent = `## Zippy Atelier Bespoke Experience\n\nEvery Zippy garment is individually drafted from body contours in our Gulshan 1, Dhaka atelier. From canvas construction to master lapel hand-stitching, we guarantee an immaculate, commanding fit.`;

  if (input.dryRun) {
    return {
      success: true,
      target: 'page',
      dryRun: true,
      updatedRecord: { title: pageTitle, slug: pageSlug, content: pageContent },
      summary: `[Preview] CMS Page drafted: "${pageTitle}".`
    };
  }

  const existingPage = db.pages.find((p) => p.slug === pageSlug && !p.deletedAt);
  let savedPage: CmsPage;
  if (existingPage) {
    savedPage = await updatePage(existingPage.id, { title: pageTitle, content: pageContent }, actorId);
  } else {
    savedPage = await createPage({ title: pageTitle, slug: pageSlug, content: pageContent, status: 'published' }, actorId);
  }

  return {
    success: true,
    target: 'page',
    dryRun: false,
    updatedRecord: savedPage,
    summary: `CMS Page "${savedPage.title}" updated and published at /page/${savedPage.slug}.`
  };
}

/**
 * 4. Universal AI Operations Command Dispatcher
 * Dispatches arbitrary natural language admin instructions to upload products,
 * manage catalog items, or update storefront content and settings.
 */
export async function executeAiAdminCommand(
  input: AiAdminCommandInput,
  actorId?: string
): Promise<AiAdminCommandResponse> {
  const cmd = (input.command || '').trim();
  const cLower = cmd.toLowerCase();

  // 1. Detect Upload Intent
  if (
    cLower.startsWith('upload') ||
    cLower.startsWith('add product') ||
    cLower.startsWith('create product') ||
    cLower.startsWith('new product') ||
    cLower.includes('upload product') ||
    cLower.includes('upload new') ||
    cLower.includes('add a new product')
  ) {
    const res = await aiUploadProduct({ prompt: cmd, dryRun: input.dryRun }, actorId);
    return {
      success: res.success,
      actionType: 'product_upload',
      summary: res.summary,
      result: res.product,
      dryRun: Boolean(input.dryRun)
    };
  }

  // 2. Detect Content / Banner / Settings Intent
  if (
    cLower.includes('announcement') ||
    cLower.includes('banner') ||
    cLower.includes('hero banner') ||
    cLower.includes('footer') ||
    cLower.includes('shipping threshold') ||
    cLower.includes('hotline') ||
    cLower.includes('about page')
  ) {
    const res = await aiUpdateContent({ prompt: cmd, dryRun: input.dryRun }, actorId);
    return {
      success: res.success,
      actionType: 'content_update',
      summary: res.summary,
      result: res.updatedRecord,
      dryRun: Boolean(input.dryRun)
    };
  }

  // 3. Fallback to Catalog & Product Management
  const res = await aiManageProduct({ command: cmd, dryRun: input.dryRun }, actorId);
  return {
    success: res.success,
    actionType: 'product_manage',
    summary: res.summary,
    result: res.product,
    dryRun: Boolean(input.dryRun)
  };
}
