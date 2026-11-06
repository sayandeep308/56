import React from 'react';
import { Sparkles, MessageCircle, ArrowUpRight, Flame } from 'lucide-react';
import { Product, SiteSettings } from '../types';
import { formatPrice } from '../utils/currency';
import { LuxuryButton } from './LuxuryButton';

interface ProductCardProps {
  product: Product;
  settings?: SiteSettings | null;
  onNavigate: (path: string) => void;
  onQuickInquire?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  onNavigate,
  onQuickInquire,
}) => {
  const rawNumber = settings?.whatsappNumber || '919382176969';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '') || '919382176969';

  const whatsappMessage = `Hello Satarupa Steel Enterprise! I would like to inquire about "${product.title}" (${product.slug}). Please provide customization and availability details.`;
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group rounded-xl overflow-hidden bg-white border border-[#E8DFD5] hover:border-[#F4D9A0] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-[#FAF6F0]">
        <img
          src={mainImage}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {product.isMostSelling ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#C8792C] text-white text-xs font-bold tracking-wide shadow-md">
              <Flame className="w-3.5 h-3.5 fill-current" />
              Most Selling
            </span>
          ) : (
            <span />
          )}

          <span className="px-2.5 py-1 rounded-md bg-[#5B4632]/85 text-[#F4D9A0] text-[11px] font-semibold backdrop-blur-xs border border-[#F4D9A0]/30 shadow-xs">
            {product.subcategory || product.categoryName}
          </span>
        </div>

        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-[#2C221E]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <LuxuryButton
            variant="burnt-amber"
            shape="wide"
            size="sm"
            onClick={() => onNavigate(`/product/${product.slug}`)}
            iconRight={<ArrowUpRight className="w-3.5 h-3.5 ml-1 text-[#1E2433]" />}
          >
            Full Specifications
          </LuxuryButton>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#C8792C] mb-1">
            {product.categoryName}
          </div>

          <h3
            onClick={() => onNavigate(`/product/${product.slug}`)}
            className="font-serif text-lg font-bold text-[#2C221E] group-hover:text-[#5B4632] transition-colors line-clamp-1 cursor-pointer"
            title={product.title}
          >
            {product.title}
          </h3>

          <p className="mt-1.5 text-xs text-[#5A4E46] line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-4 border-t border-[#FAF6F0] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-[#5A4E46]/80 uppercase block font-medium">Estimated Pricing</span>
            <span className="text-sm font-bold text-[#2C221E]">
              {formatPrice(product.price, product.isPriceOnRequest, settings?.defaultCurrency || '₹')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Quick WhatsApp inquiry"
              className="p-2 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            <LuxuryButton
              variant="burnt-amber"
              shape="compact"
              size="sm"
              onClick={() => onNavigate(`/product/${product.slug}`)}
            >
              Explore
            </LuxuryButton>
          </div>
        </div>
      </div>
    </div>
  );
};
