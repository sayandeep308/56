import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Phone,
  Layers,
  ShoppingBag,
  BookOpen,
  Mail,
  MapPin,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Category, SiteSettings } from '../types';
import { TilakLogo } from './TilakLogo';
import { LuxuryButton } from './LuxuryButton';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  categories: Category[];
  settings?: SiteSettings | null;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  categories,
  settings,
  onOpenSearch,
}) => {
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [categoriesAccordionOpen, setCategoriesAccordionOpen] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll shrink listener: default 64px, shrinking smoothly to 50px when scrollY > 30px
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when sidebar drawer is open
  useEffect(() => {
    if (menuDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuDrawerOpen]);

  const handleNav = (path: string) => {
    onNavigate(path);
    setMenuDrawerOpen(false);
  };

  const rawPhone = settings?.phoneNumber || '+91 93821 76969';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '') || '919382176969';
  const mapsUrl = settings?.mapsUrl || 'https://share.google/NJPhQEXIVloDifYAW';
  const addressText = settings?.address || 'Madpur Station Bajar';

  // 5 Core Product Streams for the minimal desktop bar
  const mainStreams = [
    { label: 'Puja Mandirs', slug: 'puja-corner' },
    { label: 'Stainless Steel', slug: 'stainless-steel-items' },
    { label: 'Aluminium', slug: 'aluminium-items' },
    { label: 'Ceilings & Rafters', slug: 'ceiling-customisation' },
    { label: 'Furniture & Wood', slug: 'furniture-and-furnishings' },
  ];

  // Staggered drawer links array for BoAt cascade effect
  const drawerNavItems = [
    { label: '1. Home Showcase', path: '/', icon: Sparkles },
    { label: '2. All Products Catalog', path: '/products', icon: ShoppingBag },
    { label: '3. Categories Hub', path: '/categories', icon: Layers, isCategories: true },
    { label: '4. Craft Journal & Blogs', path: '/blog', icon: BookOpen },
    { label: '5. Contact & Custom Enquiry', path: '/contact', icon: Mail },
  ];

  return (
    <>
      {/* =========================================================================
          1. MINIMIZED LIQUID GLASS TOP NAVIGATION BAR
          - 64px default, shrinks smoothly to 50px on scrollY > 30px
          - Specular inner rim highlight & bottom border
          - Backdrop blur 20px saturate 180%
          - Minimal header micro-animations
          ========================================================================= */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ease-out select-none ${
          isScrolled ? 'py-1.5' : 'py-3'
        }`}
        style={{
          background: 'rgba(37, 28, 23, 0.82)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-300 ease-out ${
              isScrolled ? 'h-[50px]' : 'h-[64px]'
            }`}
          >
            {/* 1. Brand Logo & Title with smooth scroll-shrink */}
            <div
              onClick={() => handleNav('/')}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
            >
              <TilakLogo
                size="md"
                className={`transition-all duration-300 group-hover:scale-105 ${
                  isScrolled ? 'scale-90' : 'scale-100'
                }`}
              />
              <div className="flex flex-col">
                <span
                  className={`font-serif font-bold tracking-tight text-[#FAF6F0] group-hover:text-[#F4D9A0] transition-all duration-300 leading-none ${
                    isScrolled ? 'text-lg sm:text-xl lg:text-2xl' : 'text-xl sm:text-2xl lg:text-3xl'
                  }`}
                >
                  Satarupa <span className="text-[#F4D9A0]">Enterprise</span>
                </span>
              </div>
            </div>

            {/* 2. Main Product Streams: Micro-Animations & Active Glass Pill Highlight */}
            <nav
              className="hidden lg:flex items-center space-x-1 xl:space-x-2"
              aria-label="Main Product Streams Navigation"
            >
              {mainStreams.map((stream) => {
                const streamPath = `/products?category=${stream.slug}`;
                const isActive = currentPath === streamPath;

                return (
                  <button
                    key={stream.slug}
                    onClick={() => handleNav(streamPath)}
                    className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-medium cursor-pointer transition-all duration-200 hover:-translate-y-[1px] flex items-center ${
                      isActive
                        ? 'text-[#FAF6F0] bg-white/15 font-semibold border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
                        : 'text-[#FAF6F0]/85 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {stream.label}
                  </button>
                );
              })}
            </nav>

            {/* 3. Controls & Restructured 3-Line Hamburger Trigger */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {/* Search Trigger */}
              {onOpenSearch && (
                <button
                  onClick={onOpenSearch}
                  aria-label="Search showcase products"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-[#F4D9A0] hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center hover:-translate-y-[1px] shadow-sm"
                  title="Search items"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}

              {/* Get Quote (Liquid Glass Pill Button matching reference) */}
              <div className="hidden sm:inline-flex">
                <LuxuryButton
                  shape="compact"
                  size="sm"
                  onClick={() => handleNav('/contact')}
                >
                  Get Quote
                </LuxuryButton>
              </div>

              {/* =========================================================================
                  2. RESTRUCTURED 3-LINE HAMBURGER TRIGGER BUTTON
                  - Encased in circular liquid glass container (w-10 h-10, backdrop-blur-md)
                  - 3 crisp horizontal bars: middle bar is shorter (w-3.5) and expands on hover
                  - Morphs smoothly into an "X" when open
                  ========================================================================= */}
              <button
                type="button"
                onClick={() => setMenuDrawerOpen(!menuDrawerOpen)}
                aria-label={menuDrawerOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                title={menuDrawerOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 flex flex-col items-center justify-center gap-[4.5px] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-sm group shrink-0"
              >
                {/* Top bar */}
                <span
                  className={`h-[1.75px] rounded-full bg-[#FAF6F0] transition-all duration-300 ease-out transform origin-center ${
                    menuDrawerOpen ? 'w-5 rotate-45 translate-y-[6.25px]' : 'w-5'
                  }`}
                />
                {/* Middle bar (w-3.5, expands to w-5 on hover, hidden when open) */}
                <span
                  className={`h-[1.75px] rounded-full bg-[#F4D9A0] transition-all duration-300 ease-out ${
                    menuDrawerOpen
                      ? 'w-3.5 opacity-0 translate-x-2'
                      : 'w-3.5 group-hover:w-5 opacity-100'
                  }`}
                />
                {/* Bottom bar */}
                <span
                  className={`h-[1.75px] rounded-full bg-[#FAF6F0] transition-all duration-300 ease-out transform origin-center ${
                    menuDrawerOpen ? 'w-5 -rotate-45 -translate-y-[6.25px]' : 'w-5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. LIQUID GLASS SLIDE-OUT SIDEBAR (BoAt NAVIGATION PHYSICS)
          - Backdrop: fixed inset-0 bg-black/40 backdrop-blur-sm, 250ms fade-in
          - Drawer: fixed top-0 left-0 h-full w-[85%] max-w-[360px]
          - Liquid glass surface with 135deg gradient, blur 28px saturate 190%
          - Smooth spring entry: cubic-bezier(0.22, 1, 0.36, 1) over 320ms
          - Staggered link cascade (35ms delay per item) with gentle hover slide
          ========================================================================= */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-250 ease-out ${
          menuDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        aria-label="BoAt-Style Liquid Glass Navigation Drawer"
        className="fixed top-0 left-0 h-full w-[85%] max-w-[360px] z-50 flex flex-col justify-between p-6 overflow-hidden select-none"
        style={{
          background: 'linear-gradient(135deg, rgba(37, 28, 23, 0.92) 0%, rgba(20, 15, 12, 0.96) 100%)',
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '12px 0 40px rgba(0, 0, 0, 0.35), inset 1px 1px 0 rgba(255, 255, 255, 0.4)',
          transform: menuDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Drawer Header with Brand & Close Button */}
        <div className="flex items-center justify-between pb-5 border-b border-white/15">
          <div
            onClick={() => handleNav('/')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <TilakLogo size="sm" />
            <span className="font-serif font-bold text-lg text-[#FAF6F0] group-hover:text-[#F4D9A0] transition-colors">
              Satarupa <span className="text-[#F4D9A0]">Enterprise</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMenuDrawerOpen(false)}
            aria-label="Close navigation drawer"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 flex items-center justify-center text-[#F4D9A0] hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Nav Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          {/* Search Quick Action */}
          {onOpenSearch && (
            <button
              onClick={() => {
                setMenuDrawerOpen(false);
                onOpenSearch();
              }}
              className="w-full min-h-[42px] py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-left text-xs text-[#FAF6F0]/90 flex items-center justify-between transition-all duration-200 cursor-pointer shadow-sm"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#F4D9A0]" />
                <span className="truncate">Search Mandirs, Railings, Ceilings...</span>
              </span>
              <span className="text-[10px] text-[#F4D9A0] uppercase font-semibold shrink-0">Search</span>
            </button>
          )}

          {/* Staggered Cascade Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F4D9A0]/70 block px-2 mb-2">
              Explore Atelier
            </span>

            {drawerNavItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(item.path);

              if (item.isCategories) {
                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/15 bg-white/5 overflow-hidden transition-all duration-300"
                    style={{
                      opacity: menuDrawerOpen ? 1 : 0,
                      transform: menuDrawerOpen ? 'translateX(0)' : 'translateX(-16px)',
                      transition:
                        'opacity 280ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
                      transitionDelay: `${idx * 35}ms`,
                    }}
                  >
                    <div className="flex items-center justify-between p-3 min-h-[42px]">
                      <button
                        onClick={() => handleNav('/categories')}
                        className="flex items-center gap-2.5 text-sm text-left font-medium text-[#FAF6F0] hover:text-[#F4D9A0] transition-colors cursor-pointer flex-1"
                      >
                        <Layers className="w-4 h-4 text-[#F4D9A0]" />
                        <span>3. Categories Hub</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-[#F4D9A0] font-bold">
                          {categories.length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoriesAccordionOpen(!categoriesAccordionOpen)}
                        aria-label="Toggle categories accordion"
                        className="p-1 rounded-md text-[#F4D9A0] hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        {categoriesAccordionOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Expandable Categories List */}
                    {categoriesAccordionOpen && (
                      <div className="px-2.5 pb-2.5 pt-1 border-t border-white/10 space-y-1">
                        {categories.map((cat, catIdx) => (
                          <button
                            key={cat.id}
                            onClick={() => handleNav(`/products?category=${cat.slug}`)}
                            className="group flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-xs text-[#FAF6F0] hover:text-[#F4D9A0] hover:bg-white/10 hover:translate-x-1.5 transition-all duration-200 cursor-pointer"
                            style={{
                              opacity: menuDrawerOpen ? 1 : 0,
                              transform: menuDrawerOpen ? 'translateX(0)' : 'translateX(-12px)',
                              transition: 'all 240ms cubic-bezier(0.22, 1, 0.36, 1)',
                              transitionDelay: `${(idx + 1 + catIdx) * 30}ms`,
                            }}
                          >
                            <span className="font-serif font-semibold">{cat.name}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#F4D9A0] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.path)}
                  className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200 cursor-pointer hover:translate-x-1.5 hover:bg-white/10 ${
                    isActive
                      ? 'bg-white/15 text-[#F4D9A0] font-semibold border border-white/20 shadow-xs'
                      : 'text-[#FAF6F0]'
                  }`}
                  style={{
                    opacity: menuDrawerOpen ? 1 : 0,
                    transform: menuDrawerOpen ? 'translateX(0)' : 'translateX(-16px)',
                    transition:
                      'opacity 280ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
                    transitionDelay: `${idx * 35}ms`,
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#F4D9A0]" />
                    <span>{item.label}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#F4D9A0] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </button>
              );
            })}
          </div>

          {/* Workshop & Contact Summary */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/15 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F4D9A0]">
                Atelier Location
              </span>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#F4D9A0] underline flex items-center gap-1 hover:text-white"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-start gap-2 text-[#FAF6F0]/85">
              <MapPin className="w-3.5 h-3.5 text-[#C8792C] shrink-0 mt-0.5" />
              <span className="text-[11px] leading-tight">{addressText}</span>
            </div>
            <div className="flex items-center gap-2 text-[#FAF6F0]/85">
              <Phone className="w-3.5 h-3.5 text-[#F4D9A0] shrink-0" />
              <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" className="text-[11px] underline hover:text-white">
                {rawPhone}
              </a>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="pt-4 border-t border-white/15 space-y-2.5">
          <LuxuryButton
            shape="wide"
            size="md"
            onClick={() => handleNav('/contact')}
            className="w-full text-center justify-center min-h-[44px]"
          >
            Request Bespoke Quotation
          </LuxuryButton>

          <button
            onClick={() => handleNav('/admin')}
            className="w-full py-2.5 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-[#F4D9A0] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <ShieldCheck className="w-4 h-4 text-[#F4D9A0]" />
            <span>Open Admin Panel</span>
          </button>
        </div>
      </aside>
    </>
  );
};
