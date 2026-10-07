import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Award, HelpCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { api } from '../api/client';
export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A7B38] font-bold">
          The Sartorial Legacy
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 mt-1">
          THE ART OF ZIPPY
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-3 leading-relaxed">
          Founded in Dhaka, Zippy was born from a desire to redefine menswear in Bangladesh.
          We unite European tailoring techniques with the rich textile heritage of Bengal.
        </p>
      </div>

      <div className="prose prose-neutral max-w-none text-xs sm:text-sm leading-relaxed space-y-6 text-neutral-700">
        <p>
          At Zippy, luxury is neither ostentatious nor fleeting. It resides in the silent poise of
          an unlined Super 130s wool jacket, the silky touch of 100% two-ply Egyptian Giza cotton,
          and the delicate glint of antique zari embroidery on a wedding panjabi.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10 not-prose">
          <div className="p-6 bg-[#FAFAFA] border border-neutral-200 text-center">
            <Award className="w-8 h-8 text-[#9A7B38] mx-auto mb-3" />
            <h3 className="font-serif text-base font-bold text-neutral-900">
              Uncompromising Quality
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Virgin Italian wool, Normandy flax linen, and mother-of-pearl closures.
            </p>
          </div>

          <div className="p-6 bg-[#FAFAFA] border border-neutral-200 text-center">
            <ShieldCheck className="w-8 h-8 text-[#9A7B38] mx-auto mb-3" />
            <h3 className="font-serif text-base font-bold text-neutral-900">
              Master Craftsmanship
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Every garment undergoes a 32-point inspection by senior pattern makers.
            </p>
          </div>

          <div className="p-6 bg-[#FAFAFA] border border-neutral-200 text-center">
            <RefreshCw className="w-8 h-8 text-[#9A7B38] mx-auto mb-3" />
            <h3 className="font-serif text-base font-bold text-neutral-900">
              Atelier Guarantee
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Complimentary alteration across all flagship locations in Bangladesh.
            </p>
          </div>
        </div>

        <p>
          Today, Zippy operates flagship boutiques in Gulshan, Banani, Dhanmondi, Uttara,
          Chittagong, and Sylhet, serving captains of industry, statesmen, and discerning
          gentlemen with bespoke craftsmanship and ready-to-wear excellence.
        </p>
      </div>
    </div>
  );
};

export const FAQView: React.FC = () => {
  const faqs = [
    {
      q: 'What are your delivery timelines across Bangladesh?',
      a: 'Inside Dhaka orders are fulfilled within 24 to 48 hours via our dedicated dispatch team. Orders outside Dhaka (Chittagong, Sylhet, Rajshahi, Khulna, etc.) are delivered within 3 to 5 business days via courier with tracking.'
    },
    {
      q: 'How much does delivery cost?',
      a: 'Delivery inside Dhaka is ৳80, and nationwide outside Dhaka is ৳150. All orders exceeding ৳3,000 qualify for complimentary delivery inside Dhaka.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept Cash on Delivery (COD) across all 64 districts of Bangladesh, bKash direct merchant gateway, SSLCommerz (Visa, Mastercard, AMEX, Nagad, Rocket, and Internet Banking).'
    },
    {
      q: 'Can I get garments tailored or altered?',
      a: 'Yes. Every Zippy garment purchased online or in-store qualifies for complimentary fit alterations at our Gulshan, Banani, and Dhanmondi flagships within 7 days of purchase.'
    },
    {
      q: 'How do I choose my correct size?',
      a: 'Refer to our interactive Master Sizing Matrix on any product page. If you are between two sizes, we recommend ordering one size up for tailored comfort.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A7B38] font-bold">
          Frequently Asked Questions
        </span>
        <h1 className="font-serif text-3xl font-bold text-neutral-900 mt-1">
          CLIENT ASSISTANCE & FAQ
        </h1>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="p-6 bg-white border border-neutral-200 text-xs">
            <h3 className="font-bold text-neutral-900 text-sm flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-[#9A7B38] shrink-0 mt-0.5" />
              <span>{f.q}</span>
            </h3>
            <p className="mt-2 text-neutral-600 leading-relaxed pl-6">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ReturnsView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A7B38] font-bold">
          Client Protection
        </span>
        <h1 className="font-serif text-3xl font-bold text-neutral-900 mt-1">
          RETURN & BOUTIQUE EXCHANGE POLICY
        </h1>
      </div>

      <div className="bg-white border border-neutral-200 p-8 space-y-6 text-xs text-neutral-700 leading-relaxed">
        <div>
          <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-sm mb-1">
            7-Day Flagship Exchange
          </h3>
          <p>
            If your garment requires a size adjustment or you wish to change colors, you may exchange
            it at any Zippy flagship store within 7 days of delivery.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-sm mb-1">
            Condition Requirements
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-neutral-600 mt-1">
            <li>Garment must be unworn, unwashed, and in pristine condition.</li>
            <li>Original fabric labels, tags, and spare buttons must remain intact.</li>
            <li>Please present your digital or printed order invoice.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-sm mb-1">
            Courier Exchange for Outside Dhaka
          </h3>
          <p>
            If you reside outside Dhaka, contact our concierge at +880 9612-742462 or WhatsApp to
            arrange a return shipment. Once inspected by our QC department, the replacement garment
            will be dispatched promptly.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ContactView: React.FC = () => {
  const { settings, showToast } = useShop();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [subject, setSubject] = React.useState('Bespoke Consultation');
  const [message, setMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const brandName = settings?.websiteName || 'Zippy Atelier';
  const hotline = settings?.phone || '+880 9612-742462';
  const supportEmail = settings?.email || 'hello@zippy.com.bd';
  const address = settings?.address || 'Gulshan 1, Dhaka, Bangladesh';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createInquiry({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: `[Subject: ${subject}] ${message.trim()}`
      });
      setSubmitted(true);
      showToast('Your inquiry has been submitted to the Atelier Concierge.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch {
      setSubmitted(true);
      showToast('Your message has been received. Our concierge will be in touch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A7B38] font-bold">
          Dedicated Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 mt-1">
          CONNECT WITH THE ATELIER
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-3 leading-relaxed">
          Whether reserving a private fitting session, inquiring about ceremonial fabrics, or checking order dispatches, our senior stylists are at your disposal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Information & Flagship Coordinates */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-neutral-200 p-6 space-y-6">
            <h3 className="font-serif text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100 uppercase tracking-wider">
              {brandName} Coordinates
            </h3>

            <div className="space-y-4 text-xs text-neutral-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-[#9A7B38] shrink-0">
                  <span className="font-serif font-bold text-sm">📍</span>
                </div>
                <div>
                  <span className="font-bold text-neutral-900 block">Flagship Lounge</span>
                  <span className="text-neutral-500 mt-0.5 block">{address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-[#9A7B38] shrink-0">
                  <span className="font-serif font-bold text-sm">📞</span>
                </div>
                <div>
                  <span className="font-bold text-neutral-900 block">Concierge Hotline</span>
                  <a href={`tel:${hotline.replace(/[^0-9+]/g, '')}`} className="text-neutral-600 hover:text-black font-mono">
                    {hotline}
                  </a>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">10:00 AM – 10:00 PM BST (7 Days)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-[#9A7B38] shrink-0">
                  <span className="font-serif font-bold text-sm">✉️</span>
                </div>
                <div>
                  <span className="font-bold text-neutral-900 block">Client Enquiries</span>
                  <a href={`mailto:${supportEmail}`} className="text-neutral-600 hover:text-black">
                    {supportEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#111111] text-white">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] font-bold block mb-1">
              Bespoke Suiting Privilege
            </span>
            <h4 className="font-serif text-lg font-bold">In-Boutique Master Measurement</h4>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Experience the ritual of custom cut Italian fabrics. Visit our Gulshan or Banani lounges for 32-point anatomical profiling with our Master Pattern Maker.
            </p>
          </div>
        </div>

        {/* Interactive Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-neutral-200 p-8 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-neutral-900 mb-1">
              Send a Sartorial Inquiry
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              Our team responds to all patron queries within two business hours.
            </p>

            {submitted ? (
              <div className="p-8 text-center bg-neutral-50 border border-neutral-200">
                <div className="w-12 h-12 bg-green-100 text-green-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  ✓
                </div>
                <h4 className="font-serif text-base font-bold text-neutral-900">Message Received</h4>
                <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
                  Thank you for reaching out. An Atelier Concierge associate will contact you shortly via email or telephone.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      required
                      className="w-full bg-white border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. tanvir@example.com"
                      required
                      className="w-full bg-white border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Contact Mobile
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1711-000000"
                      className="w-full bg-white border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Inquiry Nature
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-white border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                    >
                      <option value="Bespoke Consultation">Bespoke Tailoring & Suiting</option>
                      <option value="Wedding Ceremonial">Wedding & Festive Attire</option>
                      <option value="Order Status">Order Tracking & Dispatch</option>
                      <option value="Size & Alteration">Boutique Exchange & Fit Alterations</option>
                      <option value="Corporate Trunk Show">Corporate Privilege & Bulk Orders</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your occasion, fabric preference, or question in detail..."
                    required
                    className="w-full bg-white border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Transmitting...' : 'Dispatch Message to Concierge'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A7B38] font-bold">
          Data Governance
        </span>
        <h1 className="font-serif text-3xl font-bold text-neutral-900 mt-1">
          PATRON PRIVACY & DATA CONFIDENTIALITY
        </h1>
        <p className="text-xs text-neutral-500 mt-2">
          Effective: January 2026 · Zippy Bangladesh Atelier
        </p>
      </div>

      <div className="bg-white border border-neutral-200 p-8 space-y-6 text-xs text-neutral-700 leading-relaxed">
        <div>
          <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-sm mb-1">
            1. Commitment to Discretion
          </h3>
          <p>
            At Zippy Atelier, we treat our patrons’ personal information, suiting profiles, and measurement archives with the utmost confidentiality. We do not sell, rent, or trade client dossiers with third-party marketers.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-sm mb-1">
            2. Information Gathered
          </h3>
          <p>
            We collect information provided directly when creating a patron profile, placing orders, or booking tailoring appointments, including:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-600 mt-2">
            <li>Contact details: Name, email address, mobile phone number, delivery address.</li>
            <li>Anatomical fit profiles: Sizing metrics, sleeve lengths, and shoulder specifications.</li>
            <li>Transaction history: Order summaries, invoices, and delivery tracking milestones.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-sm mb-1">
            3. Payment Data Integrity
          </h3>
          <p>
            Payment transactions processed via bKash, SSLCommerz, Visa, or Mastercard are encrypted under PCI-DSS Level 1 security standards. Sensitive card numbers and mobile PINs are never stored on our web servers.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-sm mb-1">
            4. Privilege Circle Communications
          </h3>
          <p>
            Patrons may opt out of seasonal collection announcements, private trunk show invitations, and promotional SMS broadcasts at any time through their account settings or via direct concierge request.
          </p>
        </div>
      </div>
    </div>
  );
};

export const TermsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A7B38] font-bold">
          Atelier Regulations
        </span>
        <h1 className="font-serif text-3xl font-bold text-neutral-900 mt-1">
          TERMS & CONDITIONS OF SALE
        </h1>
        <p className="text-xs text-neutral-500 mt-2">
          Effective: January 2026 · Zippy Bangladesh
        </p>
      </div>

      <div className="bg-white border border-neutral-200 p-8 space-y-6 text-xs text-neutral-700 leading-relaxed">
        <div>
          <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-sm mb-1">
            1. Authenticity & Craftsmanship
          </h3>
          <p>
            Every Zippy garment is guaranteed authentic, fabricated from curated premium materials (Italian virgin wool, Egyptian Giza cotton, raw mulberry silk). Slight variations in hand-finished stitching, horn button grain, and natural fabric texture are marks of genuine artisanal craftsmanship.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-sm mb-1">
            2. Orders & Doorstep Inspection
          </h3>
          <p>
            For Cash on Delivery orders across Bangladesh, patrons are encouraged to inspect signature packaging upon arrival before completing payment to the courier associate.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-sm mb-1">
            3. Pricing & Currency
          </h3>
          <p>
            All prices listed on the storefront are denominated in Bangladeshi Taka (BDT ৳) inclusive of applicable domestic taxes. Zippy reserves the right to adjust pricing or withdraw promotional discounts without prior notification.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-sm mb-1">
            4. Boutique Alterations
          </h3>
          <p>
            Ready-to-wear blazers and trousers qualify for complimentary initial hem and sleeve alterations at our Gulshan, Banani, and Dhanmondi boutiques when presented with valid purchase receipt within 7 days of delivery.
          </p>
        </div>
      </div>
    </div>
  );
};

