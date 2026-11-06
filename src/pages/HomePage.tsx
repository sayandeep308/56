import React from 'react';
import { HeroSlide, Category, Product, BlogPost, SiteSettings } from '../types';
import { HeroSlider } from '../components/HeroSlider';
import { MostSellingSection } from '../components/MostSellingSection';
import { CategoryShowcaseSection } from '../components/CategoryShowcaseSection';
import { LuxuryButton } from '../components/LuxuryButton';
import { ArrowRight, Sparkles, Shield, Hammer, Compass, BookOpen } from 'lucide-react';

interface HomePageProps {
  slides: HeroSlide[];
  categories: Category[];
  products: Product[];
  blogPosts: BlogPost[];
  settings?: SiteSettings | null;
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  slides,
  categories,
  products,
  blogPosts,
  settings,
  onNavigate,
}) => {
  return (
    <div className="space-y-0">
      {/* 1. Full-Width Auto-Sliding Hero Banner */}
      <HeroSlider slides={slides} onNavigate={onNavigate} />

      {/* 2. Most Selling Products Section (Immediately Below Hero) */}
      <MostSellingSection
        products={products}
        settings={settings}
        onNavigate={onNavigate}
      />

      {/* 3. Core Architectural Disciplines (Showcasing all 4 LuxuryButton variants in square-tile format) */}
      <section className="py-12 bg-[#FAF6F0] border-b border-[#E8DFD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C8792C] block">
              Architectural Streams
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C221E]">
              Core Fabrication Disciplines
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <LuxuryButton
              variant="burnt-amber"
              shape="square-tile"
              onClick={() => onNavigate('/products?category=puja-corner')}
              className="group"
            >
              <div className="flex flex-col items-center justify-center h-full space-y-2 text-[#1E2433]">
                <Sparkles className="w-6 h-6 text-[#1E2433]" />
                <span className="font-bold text-xs tracking-wider">Puja Corner</span>
                <span className="text-[10px] text-[#4A5162] normal-case font-medium">Mandirs &amp; Devalayas</span>
              </div>
            </LuxuryButton>

            <LuxuryButton
              variant="dark-espresso"
              shape="square-tile"
              onClick={() => onNavigate('/products?category=stainless-steel-items')}
              className="group"
            >
              <div className="flex flex-col items-center justify-center h-full space-y-2 text-[#1E2433]">
                <Shield className="w-6 h-6 text-[#1E2433]" />
                <span className="font-bold text-xs tracking-wider">Stainless Steel</span>
                <span className="text-[10px] text-[#4A5162] normal-case font-medium">PVD Gold &amp; Railings</span>
              </div>
            </LuxuryButton>

            <LuxuryButton
              variant="brushed-taupe"
              shape="square-tile"
              onClick={() => onNavigate('/products?category=aluminium-items')}
              className="group"
            >
              <div className="flex flex-col items-center justify-center h-full space-y-2 text-[#1E2433]">
                <Compass className="w-6 h-6 text-[#1E2433]" />
                <span className="font-bold text-xs tracking-wider">Aluminium</span>
                <span className="text-[10px] text-[#4A5162] normal-case font-medium">Slimline Partitions</span>
              </div>
            </LuxuryButton>

            <LuxuryButton
              variant="champagne-pearl"
              shape="square-tile"
              onClick={() => onNavigate('/products?category=ceiling-customisation')}
              className="group"
            >
              <div className="flex flex-col items-center justify-center h-full space-y-2 text-[#1E2433]">
                <Hammer className="w-6 h-6 text-[#1E2433]" />
                <span className="font-bold text-xs tracking-wider">Ceilings</span>
                <span className="text-[10px] text-[#4A5162] normal-case font-medium">Wooden Rafters</span>
              </div>
            </LuxuryButton>

            <LuxuryButton
              variant="burnt-amber"
              shape="square-tile"
              onClick={() => onNavigate('/products?category=furniture-and-furnishings')}
              className="group"
            >
              <div className="flex flex-col items-center justify-center h-full space-y-2 text-[#1E2433]">
                <BookOpen className="w-6 h-6 text-[#1E2433]" />
                <span className="font-bold text-xs tracking-wider">Furniture</span>
                <span className="text-[10px] text-[#4A5162] normal-case font-medium">Solid Teak Wood</span>
              </div>
            </LuxuryButton>
          </div>
        </div>
      </section>

      {/* Atelier Craftsmanship Highlights */}
      <section className="py-12 bg-white border-b border-[#E8DFD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#FAF6F0] border border-[#F4D9A0]/40">
              <div className="w-12 h-12 rounded-lg bg-[#5B4632] text-[#F4D9A0] flex items-center justify-center shrink-0">
                <Hammer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#2C221E]">
                  True Joinery &amp; Seasoned Teak
                </h3>
                <p className="text-xs text-[#5A4E46] mt-1 leading-relaxed">
                  Kiln-dried hardwoods hand-jointed with traditional mortise-and-tenon craftsmanship to withstand generations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#FAF6F0] border border-[#F4D9A0]/40">
              <div className="w-12 h-12 rounded-lg bg-[#5B4632] text-[#C8792C] flex items-center justify-center shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#2C221E]">
                  PVD Metal &amp; Slimline Aluminium
                </h3>
                <p className="text-xs text-[#5A4E46] mt-1 leading-relaxed">
                  Precision laser-cut SS 304 screens, titanium gold ion coatings, and thermal-break glass partition systems.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#FAF6F0] border border-[#F4D9A0]/40">
              <div className="w-12 h-12 rounded-lg bg-[#5B4632] text-[#F4D9A0] flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#2C221E]">
                  Bespoke Architectural Rafters
                </h3>
                <p className="text-xs text-[#5A4E46] mt-1 leading-relaxed">
                  Custom wooden ceiling rafters with concealed 48V magnetic tracks for serene, luxury interior acoustics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dedicated Category Sections (7 Core Categories + Any New) */}
      <CategoryShowcaseSection
        categories={categories}
        products={products}
        settings={settings}
        onNavigate={onNavigate}
      />

      {/* Craft Journal / SEO Blog Section */}
      <section className="py-16 bg-[#FAF6F0] border-t border-[#E8DFD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5B4632]/10 text-[#5B4632] text-xs font-bold tracking-wide mb-2">
                <BookOpen className="w-3.5 h-3.5 text-[#C8792C]" />
                <span>Craft Journal &amp; Architectural Insights</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C221E] tracking-tight">
                Latest From The Atelier Blog
              </h2>
              <p className="mt-1 text-sm text-[#5A4E46]">
                Expert advice on temple Vastu, seasoned teak comparisons, ceiling acoustics, and architectural metals.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/blog')}
              className="btn-gold-pill text-xs sm:text-sm px-6 py-2.5 font-bold shrink-0 group flex items-center gap-2 self-start sm:self-auto shadow-md"
            >
              <span>Read All Articles</span>
              <ArrowRight className="w-4 h-4 text-[#241403] group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(0, 3).map((post) => (
              <article
                key={post.id}
                onClick={() => onNavigate(`/blog/${post.slug}`)}
                className="group rounded-xl overflow-hidden bg-white border border-[#E8DFD5] hover:border-[#F4D9A0] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div className="aspect-16/10 overflow-hidden bg-[#FAF6F0] relative">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#5B4632]/85 text-[#F4D9A0] px-2.5 py-1 rounded-md text-[11px] font-semibold backdrop-blur-xs">
                    {post.readTimeMinutes || 5} min read
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[#C8792C] uppercase tracking-wider block mb-1.5">
                      {post.author}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#2C221E] group-hover:text-[#5B4632] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-xs text-[#5A4E46] line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#FAF6F0] flex items-center justify-between text-xs font-semibold text-[#5B4632] group-hover:text-[#C8792C] transition-colors">
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Project Call To Action Banner */}
      <section className="py-16 bg-gradient-to-r from-[#5B4632] via-[#463525] to-[#2C221E] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#F4D9A0]/40 text-xs text-[#F4D9A0] font-semibold backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-[#F4D9A0]" />
            <span>Have a Unique Floor Plan or Mandir Specification?</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF6F0]">
            Crafting Bespoke Residences &amp; Temples for Discerning Spaces
          </h2>

          <p className="text-sm sm:text-base text-[#FAF6F0]/85 max-w-2xl mx-auto leading-relaxed">
            Satarupa Steel Enterprise at Madpur Station Bajar collaborates with homeowners, architects, and builders for precision stainless steel items, aluminium fabrications, teak shrines, and custom ceilings.
          </p>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
            <LuxuryButton
              variant="champagne-pearl"
              shape="wide"
              size="lg"
              onClick={() => onNavigate('/contact')}
            >
              Consult with Senior Craftsman
            </LuxuryButton>
            <LuxuryButton
              variant="burnt-amber"
              shape="wide"
              size="lg"
              onClick={() => onNavigate('/categories')}
            >
              Explore Category Hub
            </LuxuryButton>
          </div>
        </div>
      </section>
    </div>
  );
};
