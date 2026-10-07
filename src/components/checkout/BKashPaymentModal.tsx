import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, Smartphone, KeyRound, CheckCircle } from 'lucide-react';

interface BKashPaymentModalProps {
  isOpen: boolean;
  amount: number;
  orderNumber: string;
  onSuccess: (trxId: string) => void;
  onCancel: () => void;
}

export const BKashPaymentModal: React.FC<BKashPaymentModalProps> = ({
  isOpen,
  amount,
  orderNumber,
  onSuccess,
  onCancel
}) => {
  const [step, setStep] = useState<'number' | 'otp' | 'pin' | 'processing'>('number');
  const [phone, setPhone] = useState('01712345678');
  const [otp, setOtp] = useState('123456');
  const [pin, setPin] = useState('12345');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 11) {
      setError('Please provide a valid 11-digit bKash account number.');
      return;
    }
    setError('');
    setStep('otp');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setError('');
    setStep('pin');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setError('Please enter your 5-digit bKash PIN.');
      return;
    }
    setError('');
    setStep('processing');

    setTimeout(() => {
      const generatedTrx = `BK${Math.floor(10000000 + Math.random() * 90000000)}`;
      onSuccess(generatedTrx);
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-white shadow-2xl rounded-lg overflow-hidden border border-neutral-200 animate-in zoom-in-95 duration-150">
        {/* bKash Header */}
        <div className="bg-[#E2136E] text-white p-5 text-center relative">
          <button
            onClick={onCancel}
            className="absolute top-3 right-3 text-white/80 hover:text-white p-1"
            aria-label="Cancel bKash payment"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-block bg-white text-[#E2136E] font-black text-xl px-3 py-1 rounded tracking-tighter shadow-sm mb-2">
            bKash
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-pink-100">
            Zippy Bangladesh · Official Merchant
          </p>

          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="text-pink-100">Order: {orderNumber}</span>
            <span className="font-bold text-base tabular-nums">৳{amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {step === 'number' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="text-center">
                <Smartphone className="w-8 h-8 text-[#E2136E] mx-auto mb-2 stroke-[1.5]" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Enter your bKash Account number
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  11-digit mobile number linked with your personal wallet
                </p>
              </div>

              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full text-center text-lg font-mono tracking-widest py-2.5 border-2 border-neutral-300 focus:border-[#E2136E] focus:outline-none rounded"
                  maxLength={11}
                  required
                />
                {error && <p className="text-xs text-red-600 mt-1 text-center">{error}</p>}
              </div>

              <div className="text-[11px] text-neutral-500 text-center">
                By clicking Confirm, you agree to the bKash terms and conditions.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2.5 border border-neutral-300 text-neutral-700 text-xs font-semibold uppercase rounded hover:bg-neutral-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E2136E] hover:bg-[#c2105e] text-white text-xs font-bold uppercase rounded shadow-sm transition-colors"
                >
                  Confirm
                </button>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="text-center">
                <KeyRound className="w-8 h-8 text-[#E2136E] mx-auto mb-2 stroke-[1.5]" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Verification Code (OTP)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Enter 6-digit code sent to <strong className="text-neutral-900">{phone}</strong>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center text-xl font-mono tracking-[0.3em] py-2.5 border-2 border-neutral-300 focus:border-[#E2136E] focus:outline-none rounded"
                  maxLength={6}
                  required
                />
                <p className="text-[11px] text-neutral-400 text-center mt-1">
                  Demo code auto-filled: 123456
                </p>
                {error && <p className="text-xs text-red-600 mt-1 text-center">{error}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('number')}
                  className="flex-1 py-2.5 border border-neutral-300 text-neutral-700 text-xs font-semibold uppercase rounded hover:bg-neutral-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E2136E] hover:bg-[#c2105e] text-white text-xs font-bold uppercase rounded shadow-sm transition-colors"
                >
                  Verify
                </button>
              </div>
            </form>
          )}

          {step === 'pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="text-center">
                <ShieldCheck className="w-8 h-8 text-[#E2136E] mx-auto mb-2 stroke-[1.5]" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Enter bKash PIN
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  To authorize payment of <strong className="text-neutral-900">৳{amount.toLocaleString()}</strong>
                </p>
              </div>

              <div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="•••••"
                  className="w-full text-center text-2xl tracking-[0.4em] py-2.5 border-2 border-neutral-300 focus:border-[#E2136E] focus:outline-none rounded font-mono"
                  maxLength={5}
                  required
                />
                <p className="text-[11px] text-neutral-400 text-center mt-1">
                  Simulated sandbox PIN: 12345
                </p>
                {error && <p className="text-xs text-red-600 mt-1 text-center">{error}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('otp')}
                  className="flex-1 py-2.5 border border-neutral-300 text-neutral-700 text-xs font-semibold uppercase rounded hover:bg-neutral-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E2136E] hover:bg-[#c2105e] text-white text-xs font-bold uppercase rounded shadow-sm transition-colors"
                >
                  Authorize Payment
                </button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#E2136E] border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-neutral-900">
                Processing Secure Transaction...
              </h4>
              <p className="text-xs text-neutral-500">
                Contacting Bangladesh Bank settlement network...
              </p>
            </div>
          )}
        </div>

        {/* Footer Security */}
        <div className="bg-neutral-50 px-4 py-2.5 border-t border-neutral-200 text-center text-[10px] text-neutral-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
          <span>256-bit SSL Encrypted bKash Payment Gateway</span>
        </div>
      </div>
    </div>
  );
};
