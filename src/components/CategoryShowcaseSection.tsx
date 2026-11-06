import React from 'react';
import { ArrowRight, Layers, Tag } from 'lucide-react';
import { Category, Product, SiteSettings } from '../types';
import { ProductCard } from './ProductCard';
import { LuxuryButton } from './LuxuryButton';

interface CategoryShowcaseSectionProps {
  categories: Category[];
  products: Product[];
  settings?: SiteSettings | null;
  onNavigate: (path: string) => void;
}

export const CategoryShowcaseSection: React.FC<CategoryShowcaseSectionProps> = ({
  categories,
  products,
  settings,
  onNavigate,
}) => {
  return (
    <div className="space-y-16 py-12">
      {categories.map((category, index) => {
        // Products belonging to this category
        const categoryProducts = products.filter(
          (p) =>
            p.categoryId === category.id ||
            p.categoryId === category.slug ||
            p.categoryName.toLowerCase() === category.name.toLowerCase()
        );

        const displayedProducts = categoryProducts.slice(0, 4);

        const isEven = index % 2 === 0;

        return (
          <section
            key={category.id}
            aria-label={`${category.name} Showcase`}
            className={`py-12 ${
              isEven ? 'bg-white/70' : 'bg-[#FAF6F0]'
            } border-y border-[#E8DFD5]/50 transition-colors`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Category Header Row */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6 pb-6 border-b border-[#E8DFD5]">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-0.5 bg-[#C8792C]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#5B4632]">
                      Category #{category.displayOrder || index + 1}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C221E] tracking-tight">
                    {category.name}
                  </h2>

                  <p className="mt-2 text-sm text-[#5A4E46] leading-relaxed">
                    {category.description}
                  </p>

                  {/* Subcategory Pills */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#5B4632] flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#C8792C]" />
                        Subcategories:
                      </span>
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub}
                          onClick={() =>
                            onNavigate(
                              `/products?category=${category.slug}&subcategory=${encodeURIComponent(
                                sub
                              )}`
                            )
                          }
                          className="px-3 py-1 rounded-full text-xs bg-[#F3ECE2] hover:bg-[#F4D9A0] hover:text-[#2C221E] text-[#5B4632] font-medium transition-colors border border-[#E8DFD5] cursor-pointer"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Explore All LuxuryButton */}
                <LuxuryButton
                  variant="burnt-amber"
                  shape="wide"
                  size="sm"
                  onClick={() => onNavigate(`/products?category=${category.slug}`)}
                  iconRight={<ArrowRight className="w-4 h-4 text-[#1E2433]" />}
                  className="self-start lg:self-auto shrink-0"
                >
                  Explore All {category.name}
                </LuxuryButton>
              </div>

              {/* Products Grid or Empty Fallback */}
              {displayedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayedProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      settings={settings}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl p-8 bg-white border border-dashed border-[#E8DFD5] text-center">
                  <Layers className="w-8 h-8 text-[#5B4632]/50 mx-auto mb-2" />
                  <p className="text-sm text-[#5A4E46]">
                    Curating new bespoke designs for {category.name}.
                  </p>
                  <button
                    onClick={() => onNavigate('/contact')}
                    className="mt-3 btn-wood-gold text-xs px-4 py-2"
                  >
                    Inquire for Custom Commissions
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};
