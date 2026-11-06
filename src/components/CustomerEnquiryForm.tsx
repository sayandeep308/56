import React, { useState } from 'react';
import { Send, CheckCircle2, MessageCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Product, SiteSettings } from '../types';
import { submitEnquiry } from '../services/db';
import { LuxuryButton } from './LuxuryButton';

interface CustomerEnquiryFormProps {
  product?: Product | null;
  settings?: SiteSettings | null;
  onSuccess?: () => void;
  titleOverride?: string;
  subtitleOverride?: string;
}

export const CustomerEnquiryForm: React.FC<CustomerEnquiryFormProps> = ({
  product,
  settings,
  onSuccess,
  titleOverride,
  subtitleOverride,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    product
      ? `I would like to inquire about "${product.title}" (${product.categoryName} - ${product.subcategory}). Please provide customized sizing options, lead time, and pricing.`
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const rawNumber = settings?.whatsappNumber || '919382176969';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '') || '919382176969';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please provide your phone or WhatsApp number.');
      return;
    }

    setLoading(true);
    try {
      await submitEnquiry({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        productId: product?.id,
        productTitle: product?.title || 'General Custom Project',
        message: message.trim() || 'Inquiry submitted from showcase website',
        type: product ? 'product' : 'custom_project',
        status: 'new',
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Enquiry submission error:', err);
      // Still show success since it is cached locally in our db service fallback
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const directWhatsAppUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    `Hello Satarupa Steel Enterprise! My name is ${customerName || 'a customer'}. ${message || (product ? `I'm interested in ${product.title}` : 'I would like to request a bespoke quote.')}`
  )}`;

  if (submitted) {
    return (
      <div className="rounded-xl p-8 bg-[#FAF6F0] border border-[#F4D9A0] text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h4 className="font-serif text-xl font-bold text-[#2C221E]">
          Enquiry Received Successfully!
        </h4>
        <p className="text-sm text-[#5A4E46] max-w-md mx-auto leading-relaxed">
          Thank you, <span className="font-semibold text-[#2C221E]">{customerName}</span>. Our senior craft concierge will reach out to you at <span className="font-semibold text-[#2C221E]">{phone}</span> shortly.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20bd5a] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Connect on WhatsApp Now</span>
          </a>
          <LuxuryButton
            variant="champagne-pearl"
            shape="wide"
            size="sm"
            onClick={() => {
              setSubmitted(false);
              setCustomerName('');
              setPhone('');
              setEmail('');
            }}
          >
            Submit Another Enquiry
          </LuxuryButton>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <h4 className="font-serif text-lg sm:text-xl font-bold text-[#2C221E] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C8792C]" />
          <span>{titleOverride || (product ? `Inquire About ${product.title}` : 'Request Bespoke Architectural Quote')}</span>
        </h4>
        <p className="text-xs text-[#5A4E46] mt-1">
          {subtitleOverride || 'Share your room dimensions, wood species preferences, or project specs for a direct consultation.'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#2C221E] mb-1">
            Your Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g. Sayan Mukherjee"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] bg-white text-sm text-[#2C221E] focus:outline-hidden focus:border-[#C8792C] focus:ring-1 focus:ring-[#C8792C]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#2C221E] mb-1">
            Phone / WhatsApp Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] bg-white text-sm text-[#2C221E] focus:outline-hidden focus:border-[#C8792C] focus:ring-1 focus:ring-[#C8792C]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#2C221E] mb-1">
          Email Address (Optional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] bg-white text-sm text-[#2C221E] focus:outline-hidden focus:border-[#C8792C] focus:ring-1 focus:ring-[#C8792C]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#2C221E] mb-1">
          Customisation Requirements &amp; Message
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Specify required dimensions, finish preferences (e.g. Natural Teak, Walnut, Rose Gold PVD, Antique Brass), installation city, or site timeline..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] bg-white text-sm text-[#2C221E] focus:outline-hidden focus:border-[#C8792C] focus:ring-1 focus:ring-[#C8792C]"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <LuxuryButton
          type="submit"
          disabled={loading}
          variant="burnt-amber"
          shape="wide"
          size="md"
          icon={<Send className="w-4 h-4 text-[#1E2433]" />}
        >
          {loading ? 'Submitting Enquiry...' : 'Submit Official Enquiry'}
        </LuxuryButton>

        <a
          href={directWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors text-xs font-semibold"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Instant WhatsApp Chat</span>
        </a>
      </div>
    </form>
  );
};
