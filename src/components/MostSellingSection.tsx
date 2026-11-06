import React from 'react';
import { Flame, Sparkles, ArrowRight } from 'lucide-react';
import { Product, SiteSettings } from '../types';
import { ProductCard } from './ProductCard';
import { LuxuryButton } from './LuxuryButton';

interface MostSellingSectionProps {
  products: Product[];
  settings?: SiteSettings | null;
  onNavigate: (path: string) => void;
}

export const MostSellingSection: React.FC<MostSellingSectionProps> = ({
  products,
  settings,
  onNavigate,
}) => {
  const mostSellingItems = products.filter((p) => p.isMostSelling);

  if (mostSellingItems.length === 0) return null;

  return (
    <section className="py-14 bg-[#FAF6F0] border-b border-[#E8DFD5]/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8792C]/10 border border-[#C8792C]/30 text-[#C8792C] text-xs font-bold tracking-wide mb-2.5">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Patron Favorites &amp; Signature Creations</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C221E] tracking-tight">
              Most Selling Architectural Pieces
            </h2>
            <p className="mt-2 text-sm text-[#5A4E46] max-w-2xl leading-relaxed">
              Our most commissioned bespoke sanctums, hand-finished solid teak dining suites, PVD gold partitions, and custom ceiling rafters.
            </p>
          </div>

          <LuxuryButton
            variant="burnt-amber"
            shape="wide"
            size="sm"
            onClick={() => onNavigate('/products?mostSelling=1')}
            iconRight={<ArrowRight className="w-4 h-4 text-[#1E2433]" />}
            className="shrink-0 self-start md:self-auto"
          >
            View All Bestsellers
          </LuxuryButton>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mostSellingItems.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              settings={settings}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
