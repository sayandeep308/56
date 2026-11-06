import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import {
  Category,
  Product,
  HeroSlide,
  BlogPost,
  SiteSettings,
} from './types';
import {
  getCategories,
  getProducts,
  getHeroSlides,
  getBlogPosts,
  getSiteSettings,
  subscribeToCategories,
  subscribeToProducts,
  subscribeToHeroSlides,
  subscribeToBlogPosts,
  subscribeToSiteSettings,
} from './services/db';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_HERO_SLIDES,
  INITIAL_BLOG_POSTS,
  INITIAL_SITE_SETTINGS,
} from './data/seedData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { CategoriesHubPage } from './pages/CategoriesHubPage';
import { ProductsCatalogPage } from './pages/ProductsCatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { BlogListPage } from './pages/BlogListPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [slides, setSlides] = useState<HeroSlide[]>(INITIAL_HERO_SLIDES);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);

  // Sync with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const refreshAllData = useCallback(async () => {
    try {
      const [cats, prods, slds, blogs, stt] = await Promise.all([
        getCategories(),
        getProducts(),
        getHeroSlides(),
        getBlogPosts(),
        getSiteSettings(),
      ]);
      setCategories(cats);
      setProducts(prods);
      setSlides(slds);
      setBlogPosts(blogs);
      setSettings(stt);
    } catch (err) {
      console.warn('Initial data load notice:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    // 1. Initial fast load
    refreshAllData();

    // 2. Real-time subscriptions across all collections
    const unsubCats = subscribeToCategories((cats) => {
      setCategories(cats);
      setLoadingData(false);
    });
    const unsubProds = subscribeToProducts((prods) => {
      setProducts(prods);
      setLoadingData(false);
    });
    const unsubSlides = subscribeToHeroSlides((slds) => {
      setSlides(slds);
    });
    const unsubBlogs = subscribeToBlogPosts((blogs) => {
      setBlogPosts(blogs);
    });
    const unsubSettings = subscribeToSiteSettings((stt) => {
      setSettings(stt);
    });

    return () => {
      unsubCats();
      unsubProds();
      unsubSlides();
      unsubBlogs();
      unsubSettings();
    };
  }, [refreshAllData]);

  // Route matching logic
  const renderCurrentView = () => {
    const pathWithoutQuery = currentPath.split('?')[0];
    const searchParams = new URLSearchParams(currentPath.includes('?') ? currentPath.split('?')[1] : '');

    // Product Detail: /product/:slug
    if (pathWithoutQuery.startsWith('/product/')) {
      const slug = pathWithoutQuery.replace('/product/', '').trim();
      const product = products.find((p) => p.slug === slug || p.id === slug);

      if (!product) {
        return (
          <div className="py-20 text-center">
            <h2 className="text-xl font-bold text-[#2C221E]">Product Not Found</h2>
            <button onClick={() => navigate('/products')} className="mt-4 btn-wood text-xs px-4 py-2">
              Back to Catalog
            </button>
          </div>
        );
      }

      const related = products.filter(
        (p) => p.id !== product.id && p.categoryId === product.categoryId
      );

      return (
        <ProductDetailPage
          product={product}
          relatedProducts={related}
          settings={settings}
          onNavigate={navigate}
        />
      );
    }

    // Blog Post Detail: /blog/:slug
    if (pathWithoutQuery.startsWith('/blog/') && pathWithoutQuery !== '/blog') {
      const slug = pathWithoutQuery.replace('/blog/', '').trim();
      const post = blogPosts.find((b) => b.slug === slug || b.id === slug);

      if (!post) {
        return (
          <div className="py-20 text-center">
            <h2 className="text-xl font-bold text-[#2C221E]">Article Not Found</h2>
            <button onClick={() => navigate('/blog')} className="mt-4 btn-wood text-xs px-4 py-2">
              Back to Craft Journal
            </button>
          </div>
        );
      }

      return (
        <BlogPostPage
          post={post}
          recentPosts={blogPosts}
          settings={settings}
          onNavigate={navigate}
        />
      );
    }

    // Products Catalog: /products
    if (pathWithoutQuery === '/products') {
      const categoryParam = searchParams.get('category') || undefined;
      const subcategoryParam = searchParams.get('subcategory') || undefined;
      const mostSellingParam = searchParams.get('mostSelling') === '1';

      return (
        <ProductsCatalogPage
          products={products}
          categories={categories}
          settings={settings}
          initialCategory={categoryParam}
          initialSubcategory={subcategoryParam}
          initialMostSelling={mostSellingParam}
          onNavigate={navigate}
        />
      );
    }

    // Categories Hub: /categories
    if (pathWithoutQuery === '/categories') {
      return (
        <CategoriesHubPage
          categories={categories}
          products={products}
          onNavigate={navigate}
        />
      );
    }

    // Blog List: /blog
    if (pathWithoutQuery === '/blog') {
      return (
        <BlogListPage
          posts={blogPosts}
          onNavigate={navigate}
        />
      );
    }

    // Contact / Custom Enquiry: /contact
    if (pathWithoutQuery === '/contact') {
      return <ContactPage settings={settings} />;
    }

    // Admin Panel: /admin
    if (pathWithoutQuery === '/admin') {
      return (
        <AdminPage
          slides={slides}
          categories={categories}
          products={products}
          blogPosts={blogPosts}
          settings={settings}
          onRefreshAllData={refreshAllData}
          onNavigate={navigate}
        />
      );
    }

    // Default: Home Page ('/')
    return (
      <HomePage
        slides={slides}
        categories={categories}
        products={products}
        blogPosts={blogPosts}
        settings={settings}
        onNavigate={navigate}
      />
    );
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#2C221E] selection:bg-[#F4D9A0] selection:text-[#2C221E] overflow-x-hidden max-w-full w-full">
        {/* Navigation Centre */}
        <Header
          currentPath={currentPath}
          onNavigate={navigate}
          categories={categories}
          settings={settings}
          onOpenSearch={() => setSearchModalOpen(true)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-x-hidden max-w-full">
          {renderCurrentView()}
        </main>

        {/* Footer */}
        <Footer
          categories={categories}
          settings={settings}
          onNavigate={navigate}
        />

        {/* Global Floating WhatsApp Contact Action */}
        <FloatingWhatsApp settings={settings} />

        {/* Search Modal */}
        <SearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          products={products}
          categories={categories}
          blogPosts={blogPosts}
          onNavigate={navigate}
        />
      </div>
    </AuthProvider>
  );
}
