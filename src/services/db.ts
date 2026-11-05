import {
  ref,
  get,
  set,
  update,
  remove,
  onValue,
  Unsubscribe,
} from 'firebase/database';
import { db } from '../lib/firebase';
import {
  Category,
  Product,
  HeroSlide,
  BlogPost,
  CustomerEnquiry,
  SiteSettings,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_HERO_SLIDES,
  INITIAL_BLOG_POSTS,
  INITIAL_SITE_SETTINGS,
} from '../data/seedData';
import { cleanDatabasePayload } from '../utils/sanitize';

// Local storage fallback keys for offline / instant-paint resilience
const STORAGE_PREFIX = 'artisancraft_';
function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch {
    // ignore
  }
}

/**
 * Helper to convert an object map (from Realtime Database snapshot.val())
 * or an array into a clean sorted array.
 */
function recordToArray<T extends { id?: string }>(val: any): T[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.filter(Boolean) as T[];
  }
  if (typeof val === 'object') {
    return Object.entries(val).map(([id, item]: [string, any]) => ({
      id,
      ...(item || {}),
    })) as T[];
  }
  return [];
}

// ================= HERO SLIDES (banners/) =================
export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const snapshot = await get(ref(db, 'banners'));
    if (snapshot.exists()) {
      const slides = recordToArray<HeroSlide>(snapshot.val()).map((s) => ({
        ...s,
        title: s.title ? s.title.replace(/\s*&\s*/g, ' and ') : '',
      }));
      slides.sort((a, b) => (a.displayOrder ?? 1) - (b.displayOrder ?? 1));
      if (slides.length > 0) {
        setLocal('hero_slides', slides);
        return slides;
      }
    }
  } catch (error) {
    console.warn('Realtime Database getHeroSlides fetch warning:', error);
  }
  const localSlides = getLocal('hero_slides', INITIAL_HERO_SLIDES);
  return localSlides.map((s) => ({
    ...s,
    title: s.title ? s.title.replace(/\s*&\s*/g, ' and ') : '',
  }));
}

export function subscribeToHeroSlides(
  onData: (slides: HeroSlide[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const bannerRef = ref(db, 'banners');
  return onValue(
    bannerRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const slides = recordToArray<HeroSlide>(snapshot.val()).map((s) => ({
          ...s,
          title: s.title ? s.title.replace(/\s*&\s*/g, ' and ') : '',
        }));
        slides.sort((a, b) => (a.displayOrder ?? 1) - (b.displayOrder ?? 1));
        setLocal('hero_slides', slides);
        onData(slides);
      } else {
        const local = getLocal('hero_slides', INITIAL_HERO_SLIDES);
        onData(local);
      }
    },
    (error) => {
      console.warn('Real-time hero slides listener error:', error);
      onError?.(error);
    }
  );
}

export async function saveHeroSlide(slide: Partial<HeroSlide> & { title: string }): Promise<HeroSlide> {
  const slideId = slide.id || `slide-${Date.now()}`;
  const payload: HeroSlide = {
    ...slide,
    id: slideId,
    title: slide.title,
    subtitle: slide.subtitle || '',
    imageUrl: slide.imageUrl || '',
    ctaText: slide.ctaText || 'Enquire on WhatsApp',
    ctaLink: slide.ctaLink || '/contact',
    displayOrder: slide.displayOrder ?? 1,
    isActive: slide.isActive ?? true,
    updatedAt: new Date().toISOString(),
  };

  // 1. Update local cache immediately
  const current = getLocal('hero_slides', INITIAL_HERO_SLIDES);
  const updated = current.some((s) => s.id === slideId)
    ? current.map((s) => (s.id === slideId ? payload : s))
    : [...current, payload];
  setLocal('hero_slides', updated);

  // 2. Persist to Realtime Database at banners/{slideId}
  const cleanData = cleanDatabasePayload(payload);
  await set(ref(db, `banners/${slideId}`), cleanData);

  return payload;
}

export async function deleteHeroSlide(slideId: string): Promise<void> {
  await remove(ref(db, `banners/${slideId}`));
  const current = getLocal('hero_slides', INITIAL_HERO_SLIDES);
  setLocal(
    'hero_slides',
    current.filter((s) => s.id !== slideId)
  );
}

// ================= CATEGORIES (categories/) =================
export async function getCategories(): Promise<Category[]> {
  try {
    const snapshot = await get(ref(db, 'categories'));
    if (snapshot.exists()) {
      const categories = recordToArray<Category>(snapshot.val());
      categories.sort((a, b) => (a.displayOrder ?? 1) - (b.displayOrder ?? 1));
      if (categories.length > 0) {
        setLocal('categories', categories);
        return categories;
      }
    }
  } catch (error) {
    console.warn('Realtime Database getCategories fetch warning:', error);
  }
  return getLocal('categories', INITIAL_CATEGORIES);
}

export function subscribeToCategories(
  onData: (categories: Category[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const catRef = ref(db, 'categories');
  return onValue(
    catRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const categories = recordToArray<Category>(snapshot.val());
        categories.sort((a, b) => (a.displayOrder ?? 1) - (b.displayOrder ?? 1));
        setLocal('categories', categories);
        onData(categories);
      } else {
        const local = getLocal('categories', INITIAL_CATEGORIES);
        onData(local);
      }
    },
    (error) => {
      console.warn('Real-time categories listener error:', error);
      onError?.(error);
    }
  );
}

export async function saveCategory(category: Category): Promise<Category> {
  const catId = category.id || category.slug;
  const payload: Category = {
    ...category,
    id: catId,
    updatedAt: new Date().toISOString(),
  };

  // 1. Update local cache immediately
  const current = getLocal('categories', INITIAL_CATEGORIES);
  const updated = current.some((c) => c.id === catId)
    ? current.map((c) => (c.id === catId ? payload : c))
    : [...current, payload];
  setLocal('categories', updated);

  // 2. Persist to Realtime Database at categories/{catId}
  const cleanData = cleanDatabasePayload(payload);
  await set(ref(db, `categories/${catId}`), cleanData);

  return payload;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await remove(ref(db, `categories/${categoryId}`));
  const current = getLocal('categories', INITIAL_CATEGORIES);
  setLocal(
    'categories',
    current.filter((c) => c.id !== categoryId)
  );
}

// ================= PRODUCTS (products/) =================
export async function getProducts(): Promise<Product[]> {
  try {
    const snapshot = await get(ref(db, 'products'));
    if (snapshot.exists()) {
      const products = recordToArray<Product>(snapshot.val());
      if (products.length > 0) {
        setLocal('products', products);
        return products;
      }
    }
  } catch (error) {
    console.warn('Realtime Database getProducts fetch warning:', error);
  }
  return getLocal('products', INITIAL_PRODUCTS);
}

export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const prodRef = ref(db, 'products');
  return onValue(
    prodRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const products = recordToArray<Product>(snapshot.val());
        setLocal('products', products);
        onData(products);
      } else {
        const local = getLocal('products', INITIAL_PRODUCTS);
        onData(local);
      }
    },
    (error) => {
      console.warn('Real-time products listener error:', error);
      onError?.(error);
    }
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getProducts();
  const found = all.find((p) => p.slug === slug || p.id === slug);
  return found || null;
}

export async function saveProduct(product: Product): Promise<Product> {
  const prodId = product.id || `prod-${Date.now()}`;
  const payload: Product = {
    ...product,
    id: prodId,
    updatedAt: new Date().toISOString(),
  };

  // 1. Immediately cache in local storage so user data is never lost
  const current = getLocal('products', INITIAL_PRODUCTS);
  const updated = current.some((p) => p.id === prodId)
    ? current.map((p) => (p.id === prodId ? payload : p))
    : [...current, payload];
  setLocal('products', updated);

  // 2. Persist to Realtime Database at products/{prodId}
  const cleanData = cleanDatabasePayload(payload);
  await set(ref(db, `products/${prodId}`), cleanData);

  return payload;
}

export async function deleteProduct(productId: string): Promise<void> {
  await remove(ref(db, `products/${productId}`));
  const current = getLocal('products', INITIAL_PRODUCTS);
  setLocal(
    'products',
    current.filter((p) => p.id !== productId)
  );
}

// ================= BLOG POSTS (blogs/) =================
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const snapshot = await get(ref(db, 'blogs'));
    if (snapshot.exists()) {
      const posts = recordToArray<BlogPost>(snapshot.val());
      if (posts.length > 0) {
        setLocal('blog_posts', posts);
        return posts;
      }
    }
  } catch (error) {
    console.warn('Realtime Database getBlogPosts fetch warning:', error);
  }
  return getLocal('blog_posts', INITIAL_BLOG_POSTS);
}

export function subscribeToBlogPosts(
  onData: (posts: BlogPost[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const blogRef = ref(db, 'blogs');
  return onValue(
    blogRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const posts = recordToArray<BlogPost>(snapshot.val());
        setLocal('blog_posts', posts);
        onData(posts);
      } else {
        const local = getLocal('blog_posts', INITIAL_BLOG_POSTS);
        onData(local);
      }
    },
    (error) => {
      console.warn('Real-time blog posts listener error:', error);
      onError?.(error);
    }
  );
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function saveBlogPost(post: BlogPost): Promise<BlogPost> {
  const postId = post.id || `blog-${Date.now()}`;
  const payload: BlogPost = {
    ...post,
    id: postId,
    updatedAt: new Date().toISOString(),
  };

  // 1. Update local cache immediately
  const current = getLocal('blog_posts', INITIAL_BLOG_POSTS);
  const updated = current.some((b) => b.id === postId)
    ? current.map((b) => (b.id === postId ? payload : b))
    : [...current, payload];
  setLocal('blog_posts', updated);

  // 2. Persist to Realtime Database at blogs/{postId}
  const cleanData = cleanDatabasePayload(payload);
  await set(ref(db, `blogs/${postId}`), cleanData);

  return payload;
}

export async function deleteBlogPost(postId: string): Promise<void> {
  await remove(ref(db, `blogs/${postId}`));
  const current = getLocal('blog_posts', INITIAL_BLOG_POSTS);
  setLocal(
    'blog_posts',
    current.filter((b) => b.id !== postId)
  );
}

// ================= CUSTOMER ENQUIRIES (enquiries/) =================
export async function submitEnquiry(
  enquiry: Omit<CustomerEnquiry, 'id' | 'createdAt' | 'status'> & { status?: CustomerEnquiry['status'] }
): Promise<CustomerEnquiry> {
  const enquiryId = `enq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const payload: CustomerEnquiry = {
    ...enquiry,
    id: enquiryId,
    status: enquiry.status || 'new',
    createdAt: new Date().toISOString(),
  };

  // Cache locally
  const current = getLocal<CustomerEnquiry[]>('enquiries', []);
  setLocal('enquiries', [payload, ...current]);

  try {
    const cleanData = cleanDatabasePayload(payload);
    await set(ref(db, `enquiries/${enquiryId}`), cleanData);
  } catch (error) {
    console.warn('Realtime Database submitEnquiry notice:', error);
  }

  return payload;
}

export async function getEnquiries(): Promise<CustomerEnquiry[]> {
  try {
    const snapshot = await get(ref(db, 'enquiries'));
    if (snapshot.exists()) {
      const items = recordToArray<CustomerEnquiry>(snapshot.val());
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLocal('enquiries', items);
      return items;
    }
  } catch (error) {
    console.warn('Realtime Database getEnquiries fetch notice:', error);
  }
  return getLocal<CustomerEnquiry[]>('enquiries', []);
}

export function subscribeToEnquiries(
  onData: (enquiries: CustomerEnquiry[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const enqRef = ref(db, 'enquiries');
  return onValue(
    enqRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const items = recordToArray<CustomerEnquiry>(snapshot.val());
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLocal('enquiries', items);
        onData(items);
      } else {
        onData([]);
      }
    },
    (error) => {
      console.warn('Real-time enquiries listener notice:', error);
      onError?.(error);
    }
  );
}

export async function updateEnquiryStatus(
  enquiryId: string,
  status: CustomerEnquiry['status'],
  notes?: string
): Promise<void> {
  const updateData: Record<string, any> = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (notes !== undefined) updateData.notes = notes;

  try {
    await update(ref(db, `enquiries/${enquiryId}`), cleanDatabasePayload(updateData));
  } catch (error) {
    console.warn('Realtime Database updateEnquiryStatus notice:', error);
  }

  const current = getLocal<CustomerEnquiry[]>('enquiries', []);
  setLocal(
    'enquiries',
    current.map((e) => (e.id === enquiryId ? { ...e, status, ...(notes !== undefined ? { notes } : {}) } : e))
  );
}

// ================= SITE SETTINGS (settings/globalConfig) =================
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snapshot = await get(ref(db, 'settings/globalConfig'));
    if (snapshot.exists()) {
      const data = { id: 'globalConfig', ...(snapshot.val() || {}) };
      setLocal('site_settings', data);
      return data;
    }
  } catch (error) {
    console.warn('Realtime Database getSiteSettings fetch notice:', error);
  }
  return getLocal('site_settings', INITIAL_SITE_SETTINGS);
}

export function subscribeToSiteSettings(
  onData: (settings: SiteSettings) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const settingsRef = ref(db, 'settings/globalConfig');
  return onValue(
    settingsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: 'globalConfig', ...(snapshot.val() || {}) };
        setLocal('site_settings', data);
        onData(data);
      } else {
        getSiteSettings().then(onData).catch(() => {});
      }
    },
    (error) => {
      console.warn('Real-time settings listener notice:', error);
      onError?.(error);
    }
  );
}

export async function saveSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  const payload: SiteSettings = {
    ...settings,
    id: 'globalConfig',
    updatedAt: new Date().toISOString(),
  };

  // 1. Immediately cache in local storage
  setLocal('site_settings', payload);

  // 2. Persist to Realtime Database at settings/globalConfig
  const cleanData = cleanDatabasePayload(payload);
  await set(ref(db, 'settings/globalConfig'), cleanData);

  return payload;
}

// ================= SEED ALL DATA HELPER =================
export async function seedAllInitialDataToFirestore(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Site Settings
    await set(ref(db, 'settings/globalConfig'), cleanDatabasePayload({ ...INITIAL_SITE_SETTINGS, id: 'globalConfig' }));

    // 2. Hero Slides (banners/)
    const bannerMap: Record<string, any> = {};
    for (const slide of INITIAL_HERO_SLIDES) {
      bannerMap[slide.id] = cleanDatabasePayload(slide);
    }
    await set(ref(db, 'banners'), bannerMap);

    // 3. Categories (categories/)
    const catMap: Record<string, any> = {};
    for (const cat of INITIAL_CATEGORIES) {
      catMap[cat.id] = cleanDatabasePayload(cat);
    }
    await set(ref(db, 'categories'), catMap);

    // 4. Products (products/)
    const prodMap: Record<string, any> = {};
    for (const prod of INITIAL_PRODUCTS) {
      prodMap[prod.id] = cleanDatabasePayload(prod);
    }
    await set(ref(db, 'products'), prodMap);

    // 5. Blog Posts (blogs/)
    const blogMap: Record<string, any> = {};
    for (const post of INITIAL_BLOG_POSTS) {
      blogMap[post.id] = cleanDatabasePayload(post);
    }
    await set(ref(db, 'blogs'), blogMap);

    // Refresh local cache
    setLocal('hero_slides', INITIAL_HERO_SLIDES);
    setLocal('categories', INITIAL_CATEGORIES);
    setLocal('products', INITIAL_PRODUCTS);
    setLocal('blog_posts', INITIAL_BLOG_POSTS);
    setLocal('site_settings', INITIAL_SITE_SETTINGS);

    return {
      success: true,
      message: 'All core categories, products, slides, blogs, and settings synced to Firebase Realtime Database successfully!',
    };
  } catch (error) {
    console.error('Error syncing to Realtime Database:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error syncing to Realtime Database',
    };
  }
}
