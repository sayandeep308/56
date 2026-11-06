import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { HeroSlide } from '../types';
import { LuxuryButton } from './LuxuryButton';

interface HeroSliderProps {
  slides: HeroSlide[];
  onNavigate: (path: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ slides, onNavigate }) => {
  const activeSlides = slides.filter((s) => s.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSlides.length, isPaused]);

  if (activeSlides.length === 0) return null;

  const currentSlide = activeSlides[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  return (
    <section
      aria-label="Hero Showcase Slider"
      className="relative w-full h-[55vh] min-h-[460px] md:h-[80vh] md:min-h-[580px] overflow-hidden bg-[#2C221E] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Background Images with Smooth Crossfade */}
      {activeSlides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000"
          />
          {/* Multi-layered Vignette & Dark Gradient Overlay for Maximum Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C221E]/95 via-[#463525]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C221E] via-transparent to-black/30" />
        </div>
      ))}

      {/* Slide Content Box */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center pb-8 sm:pb-0">
        <div className="max-w-2xl text-[#FAF6F0] space-y-3.5 sm:space-y-6 animate-fadeIn">
          {/* Subtle Champagne Gold Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B4632]/80 border border-[#F4D9A0]/50 text-[11px] sm:text-xs text-[#F4D9A0] font-semibold tracking-wide backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F4D9A0]" />
            <span>Mastercrafted Luxury Architecture</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#FAF6F0] leading-tight tracking-tight drop-shadow-md">
            {currentSlide.title?.replace(/\s*&\s*/g, ' and ')}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#FAF6F0]/90 leading-relaxed font-light drop-shadow line-clamp-2 sm:line-clamp-none">
            {currentSlide.subtitle?.replace(/\s*&\s*/g, ' and ')}
          </p>

          {/* CTA Buttons with 3D Inner-Beveled Metallic Rim LuxuryButton */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <LuxuryButton
              variant="burnt-amber"
              shape="wide"
              size="lg"
              onClick={() => onNavigate(currentSlide.ctaLink || '/products')}
              iconRight={<ArrowRight className="w-4 h-4 text-[#1E2433]" />}
              className="text-center justify-center min-h-[44px]"
            >
              {currentSlide.ctaText || 'Explore Catalog'}
            </LuxuryButton>

            <LuxuryButton
              variant="champagne-pearl"
              shape="wide"
              size="lg"
              onClick={() => onNavigate('/contact')}
              className="text-center justify-center min-h-[44px]"
            >
              Request Custom Estimate
            </LuxuryButton>
          </div>
        </div>
      </div>

      {/* Manual Prev / Next Controls (Hidden on mobile to avoid overlapping content, visible on md+) */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#5B4632]/70 hover:bg-[#5B4632] border border-[#F4D9A0]/40 text-[#F4D9A0] hover:text-white items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-xs shadow-lg hover:scale-105 min-w-[44px] min-h-[44px]"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#5B4632]/70 hover:bg-[#5B4632] border border-[#F4D9A0]/40 text-[#F4D9A0] hover:text-white items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-xs shadow-lg hover:scale-105 min-w-[44px] min-h-[44px]"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-[#463525]/70 px-3.5 py-1.5 rounded-full backdrop-blur-xs border border-[#F4D9A0]/20">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Jump to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer min-w-[12px] min-h-[12px] ${
                idx === currentIndex
                  ? 'w-7 sm:w-8 h-2 sm:h-2.5 bg-[#F4D9A0] shadow-sm'
                  : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[#FAF6F0]/40 hover:bg-[#FAF6F0]'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
