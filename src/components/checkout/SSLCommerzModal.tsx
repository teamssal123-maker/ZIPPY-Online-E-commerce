import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

interface SSLCommerzModalProps {
  isOpen: boolean;
  amount: number;
  orderNumber: string;
  onSuccess: (trxId: string) => void;
  onCancel: () => void;
}

export const SSLCommerzModal: React.FC<SSLCommerzModalProps> = ({
  isOpen,
  amount,
  orderNumber,
  onSuccess,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'mobile' | 'netbanking'>('cards');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('TAHMIDUR RAHMAN');
  const [expiry, setExpiry] = useState('08/28');
  const [cvv, setCvv] = useState('123');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      const generatedTrx = `SSL-${Math.floor(100000 + Math.random() * 900000)}`;
      onSuccess(generatedTrx);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white shadow-2xl rounded-lg overflow-hidden border border-neutral-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#023e8a] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-300" />
            <span className="font-bold tracking-wider text-sm">SSLCOMMERZ GATEWAY</span>
          </div>
          <button onClick={onCancel} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Bar */}
        <div className="bg-sky-50 px-6 py-3 border-b border-sky-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-neutral-500">Merchant: </span>
            <strong className="text-neutral-900">Zippy BD Ltd.</strong>
          </div>
          <div>
            <span className="text-neutral-500">Payable: </span>
            <strong className="text-sm text-neutral-900 font-bold tabular-nums">
              ৳{amount.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 border-b border-neutral-200 text-xs font-semibold text-center">
          <button
            onClick={() => setActiveTab('cards')}
            className={`py-3 transition-colors ${
              activeTab === 'cards'
                ? 'border-b-2 border-[#023e8a] text-[#023e8a] bg-white'
                : 'text-neutral-500 hover:text-neutral-900 bg-neutral-50'
            }`}
          >
            Credit / Debit Card
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`py-3 transition-colors ${
              activeTab === 'mobile'
                ? 'border-b-2 border-[#023e8a] text-[#023e8a] bg-white'
                : 'text-neutral-500 hover:text-neutral-900 bg-neutral-50'
            }`}
          >
            Mobile Banking
          </button>
          <button
            onClick={() => setActiveTab('netbanking')}
            className={`py-3 transition-colors ${
              activeTab === 'netbanking'
                ? 'border-b-2 border-[#023e8a] text-[#023e8a] bg-white'
                : 'text-neutral-500 hover:text-neutral-900 bg-neutral-50'
            }`}
          >
            Internet Banking
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {processing ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#023e8a] border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-neutral-900">
                Authorizing with Payment Network...
              </h4>
              <p className="text-xs text-neutral-500">
                Please do not refresh or close the browser window.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-3">
              {activeTab === 'cards' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded text-xs font-mono tracking-wider focus:outline-none focus:border-[#023e8a]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded text-xs uppercase focus:outline-none focus:border-[#023e8a]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded text-xs font-mono focus:outline-none focus:border-[#023e8a]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded text-xs font-mono focus:outline-none focus:border-[#023e8a]"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'mobile' && (
                <div className="space-y-3 py-2">
                  <p className="text-xs text-neutral-600">
                    Select your preferred Mobile Financial Service provider:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="border-2 border-[#023e8a] p-3 rounded font-bold text-orange-600 bg-orange-50 cursor-pointer">
                      Nagad
                    </div>
                    <div className="border border-neutral-200 p-3 rounded font-bold text-purple-700 hover:bg-neutral-50 cursor-pointer">
                      Rocket
                    </div>
                    <div className="border border-neutral-200 p-3 rounded font-bold text-sky-600 hover:bg-neutral-50 cursor-pointer">
                      Upay
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'netbanking' && (
                <div className="space-y-3 py-2">
                  <p className="text-xs text-neutral-600">Supported Bangladeshi partner banks:</p>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="border-2 border-[#023e8a] p-2.5 rounded font-medium bg-sky-50">
                      City Bank Citytouch
                    </div>
                    <div className="border border-neutral-200 p-2.5 rounded font-medium">
                      BRAC Bank Astha
                    </div>
                    <div className="border border-neutral-200 p-2.5 rounded font-medium">
                      Dutch-Bangla Nexus
                    </div>
                    <div className="border border-neutral-200 p-2.5 rounded font-medium">
                      EBL Skybanking
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#023e8a] hover:bg-[#002b66] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-sm cursor-pointer"
                >
                  Pay ৳{amount.toLocaleString()} Securely
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 px-6 py-2.5 border-t border-neutral-200 text-center text-[10px] text-neutral-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
          <span>PCI-DSS Certified 3D Secure Verification by SSLCommerz</span>
        </div>
      </div>
    </div>
  );
};
