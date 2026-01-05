/**
 * DonateForm Component - PayPal Donation Integration
 * Uses @paypal/react-paypal-js for payment processing
 */
import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface DonateFormProps {
  onSuccess?: (details: { orderID: string; payerID?: string }) => void;
}

const donationAmounts = [25, 50, 100, 250, 500, 1000];

export function DonateForm({ onSuccess }: DonateFormProps) {
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const effectiveAmount = isCustom ? parseFloat(customAmount) || 0 : amount;
  const isValidAmount = effectiveAmount >= 1;

  // Get PayPal Client ID from environment (fallback to sandbox for demo)
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';
  const isConfigured = clientId !== 'test';

  const handleAmountClick = (value: number) => {
    setAmount(value);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-shs-forest-800 mb-2">Thank You!</h3>
        <p className="text-shs-text-body">
          Your donation of <strong>${effectiveAmount.toFixed(2)}</strong> has been received. 
          Kukwstsétsemc (thank you) for supporting our community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Amount Selection */}
      <div>
        <label className="block text-sm font-medium text-shs-forest-700 mb-3">
          Select Donation Amount
        </label>
        <div className="grid grid-cols-3 gap-3">
          {donationAmounts.map((value) => (
            <button
              key={value}
              onClick={() => handleAmountClick(value)}
              className={`py-3 px-4 rounded-xl font-semibold text-lg transition-all ${
                !isCustom && amount === value
                  ? 'bg-shs-forest-600 text-white shadow-lg scale-105'
                  : 'bg-white border-2 border-shs-stone text-shs-forest-700 hover:border-shs-forest-300'
              }`}
            >
              ${value}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div>
        <label className="block text-sm font-medium text-shs-forest-700 mb-2">
          Or enter a custom amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-shs-text-muted text-lg">$</span>
          <input
            type="number"
            min="1"
            step="1"
            value={customAmount}
            onChange={(e) => handleCustomChange(e.target.value)}
            onFocus={() => setIsCustom(true)}
            className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-shs-forest-500 ${
              isCustom ? 'border-shs-forest-600' : 'border-shs-stone'
            }`}
            placeholder="Enter amount"
          />
        </div>
      </div>

      {/* Selected Amount Display */}
      {isValidAmount && (
        <div className="bg-shs-sand rounded-xl p-4 text-center">
          <span className="text-sm text-shs-text-muted">Your donation:</span>
          <div className="text-3xl font-bold text-shs-forest-800">${effectiveAmount.toFixed(2)} CAD</div>
        </div>
      )}

      {/* PayPal Button or Setup Message */}
      {isConfigured ? (
        <PayPalScriptProvider
          options={{
            clientId,
            currency: 'CAD',
            intent: 'capture',
          }}
        >
          {isValidAmount && (
            <PayPalButtons
              style={{
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'donate',
              }}
              disabled={!isValidAmount || paymentStatus === 'processing'}
              createOrder={(_data, actions) => {
                setPaymentStatus('processing');
                return actions.order.create({
                  intent: 'CAPTURE',
                  purchase_units: [
                    {
                      amount: {
                        value: effectiveAmount.toFixed(2),
                        currency_code: 'CAD',
                      },
                      description: 'Donation to Secwépemc Hunting Society',
                    },
                  ],
                });
              }}
              onApprove={async (_data, actions) => {
                if (actions.order) {
                  const details = await actions.order.capture();
                  setPaymentStatus('success');
                  onSuccess?.({ orderID: details.id || '', payerID: details.payer?.payer_id });
                }
              }}
              onError={(err) => {
                console.error('PayPal error:', err);
                setPaymentStatus('error');
                setErrorMessage('Payment failed. Please try again.');
              }}
              onCancel={() => {
                setPaymentStatus('idle');
              }}
            />
          )}
        </PayPalScriptProvider>
      ) : (
        <div className="bg-shs-amber-50 border border-shs-amber-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-shs-amber-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-shs-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h4 className="font-semibold text-shs-amber-800 mb-2">PayPal Setup Required</h4>
          <p className="text-sm text-shs-amber-700 mb-4">
            PayPal integration is ready but requires a client ID. Contact the administrator to enable online donations.
          </p>
          <a
            href="mailto:info@secwepemchuntingsociety.ca"
            className="inline-flex items-center gap-2 text-shs-amber-700 font-medium hover:underline"
          >
            Contact Us to Donate Directly
          </a>
        </div>
      )}

      {/* Error Message */}
      {paymentStatus === 'error' && errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Security Note */}
      <p className="text-xs text-center text-shs-text-muted">
        🔒 Payments are securely processed through PayPal. We never store your payment information.
      </p>
    </div>
  );
}
