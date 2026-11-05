import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
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

// ================= HERO SLIDES =================
export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const q = query(collection(db, 'hero_slides'), orderBy('displayOrder', 'asc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const slides = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Omit<HeroSlide, 'id'>;
        return {
          id: docSnap.id,
          ...data,
          title: data.title ? data.title.replace(/\s*&\s*/g, ' and ') : '',
        };
      });
      setLocal('hero_slides', slides);
      return slides;
    }
  } catch (error) {
    console.warn('Firestore getHeroSlides fetch warning:', error);
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
  const q = query(collection(db, 'hero_slides'), orderBy('displayOrder', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const slides = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Omit<HeroSlide, 'id'>;
          return {
            id: docSnap.id,
            ...data,
            title: data.title ? data.title.replace(/\s*&\s*/g, ' and ') : '',
          };
        });
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
  const payload = {
    ...slide,
    id: slideId,
    displayOrder: slide.displayOrder ?? 1,
    isActive: slide.isActive ?? true,
    updatedAt: new Date().toISOString(),
  };

  // 1. Update local cache immediately
  const current = getLocal('hero_slides', INITIAL_HERO_SLIDES);
  const updated = current.some((s) => s.id === slideId)
    ? current.map((s) => (s.id === slideId ? (payload as HeroSlide) : s))
    : [...current, payload as HeroSlide];
  setLocal('hero_slides', updated);

  // 2. Persist to Firestore
  try {
    await setDoc(doc(db, 'hero_slides', slideId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `hero_slides/${slideId}`);
  }

  return payload as HeroSlide;
}

export async function deleteHeroSlide(slideId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'hero_slides', slideId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `hero_slides/${slideId}`);
  }
  const current = getLocal('hero_slides', INITIAL_HERO_SLIDES);
  setLocal(
    'hero_slides',
    current.filter((s) => s.id !== slideId)
  );
}

// ================= CATEGORIES =================
export async function getCategories(): Promise<Category[]> {
  try {
    const q = query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const categories = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Category, 'id'>),
      }));
      setLocal('categories', categories);
      return categories;
    }
  } catch (error) {
    console.warn('Firestore getCategories fetch warning:', error);
  }
  return getLocal('categories', INITIAL_CATEGORIES);
}

export function subscribeToCategories(
  onData: (categories: Category[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const categories = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Category, 'id'>),
        }));
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
  const payload = {
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

  // 2. Persist to Firestore
  try {
    await setDoc(doc(db, 'categories', catId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `categories/${catId}`);
  }

  return payload;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `categories/${categoryId}`);
  }
  const current = getLocal('categories', INITIAL_CATEGORIES);
  setLocal(
    'categories',
    current.filter((c) => c.id !== categoryId)
  );
}

// ================= PRODUCTS =================
export async function getProducts(): Promise<Product[]> {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    if (!snapshot.empty) {
      const products = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Product, 'id'>),
      }));
      setLocal('products', products);
      return products;
    }
  } catch (error) {
    console.warn('Firestore getProducts fetch warning:', error);
  }
  return getLocal('products', INITIAL_PRODUCTS);
}

export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'products'),
    (snapshot) => {
      if (!snapshot.empty) {
        const products = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Product, 'id'>),
        }));
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
  const payload = {
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

  // 2. Persist to live Firestore
  try {
    await setDoc(doc(db, 'products', prodId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${prodId}`);
  }

  return payload;
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }
  const current = getLocal('products', INITIAL_PRODUCTS);
  setLocal(
    'products',
    current.filter((p) => p.id !== productId)
  );
}

// ================= BLOG POSTS =================
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const snapshot = await getDocs(collection(db, 'blog_posts'));
    if (!snapshot.empty) {
      const posts = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<BlogPost, 'id'>),
      }));
      setLocal('blog_posts', posts);
      return posts;
    }
  } catch (error) {
    console.warn('Firestore getBlogPosts fetch warning:', error);
  }
  return getLocal('blog_posts', INITIAL_BLOG_POSTS);
}

export function subscribeToBlogPosts(
  onData: (posts: BlogPost[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'blog_posts'),
    (snapshot) => {
      if (!snapshot.empty) {
        const posts = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<BlogPost, 'id'>),
        }));
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
  const payload = {
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

  // 2. Persist to Firestore
  try {
    await setDoc(doc(db, 'blog_posts', postId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `blog_posts/${postId}`);
  }

  return payload;
}

export async function deleteBlogPost(postId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'blog_posts', postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `blog_posts/${postId}`);
  }
  const current = getLocal('blog_posts', INITIAL_BLOG_POSTS);
  setLocal(
    'blog_posts',
    current.filter((b) => b.id !== postId)
  );
}

// ================= CUSTOMER ENQUIRIES =================
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

  try {
    await setDoc(doc(db, 'enquiries', enquiryId), payload);
  } catch (error) {
    console.warn('Firestore submitEnquiry error, caching locally:', error);
    try {
      handleFirestoreError(error, OperationType.CREATE, `enquiries/${enquiryId}`);
    } catch {
      // Allow fallback caching
    }
  }

  const current = getLocal<CustomerEnquiry[]>('enquiries', []);
  setLocal('enquiries', [payload, ...current]);
  return payload;
}

export async function getEnquiries(): Promise<CustomerEnquiry[]> {
  try {
    const snapshot = await getDocs(collection(db, 'enquiries'));
    if (!snapshot.empty) {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<CustomerEnquiry, 'id'>),
      }));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLocal('enquiries', items);
      return items;
    }
  } catch (error) {
    console.warn('Firestore getEnquiries fetch notice:', error);
  }
  return getLocal<CustomerEnquiry[]>('enquiries', []);
}

export function subscribeToEnquiries(
  onData: (enquiries: CustomerEnquiry[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'enquiries'),
    (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<CustomerEnquiry, 'id'>),
        }));
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
  try {
    const ref = doc(db, 'enquiries', enquiryId);
    const updateData: Record<string, any> = { status, updatedAt: new Date().toISOString() };
    if (notes !== undefined) updateData.notes = notes;
    await updateDoc(ref, updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `enquiries/${enquiryId}`);
  }

  const current = getLocal<CustomerEnquiry[]>('enquiries', []);
  setLocal(
    'enquiries',
    current.map((e) => (e.id === enquiryId ? { ...e, status, ...(notes !== undefined ? { notes } : {}) } : e))
  );
}

// ================= SITE SETTINGS (SYNCED TO settings/globalConfig & site_settings/default) =================
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    // 1. Primary check: settings/globalConfig (per production sync specification)
    const snapGlobal = await getDoc(doc(db, 'settings', 'globalConfig'));
    if (snapGlobal.exists()) {
      const data = { id: snapGlobal.id, ...(snapGlobal.data() as Omit<SiteSettings, 'id'>) };
      setLocal('site_settings', data);
      return data;
    }

    // 2. Secondary check: site_settings/default
    const snap = await getDoc(doc(db, 'site_settings', 'default'));
    if (snap.exists()) {
      const data = { id: snap.id, ...(snap.data() as Omit<SiteSettings, 'id'>) };
      setLocal('site_settings', data);
      return data;
    }
  } catch (error) {
    console.warn('Firestore getSiteSettings fetch notice:', error);
  }
  return getLocal('site_settings', INITIAL_SITE_SETTINGS);
}

export function subscribeToSiteSettings(
  onData: (settings: SiteSettings) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  // Listen to primary settings/globalConfig document
  return onSnapshot(
    doc(db, 'settings', 'globalConfig'),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...(snapshot.data() as Omit<SiteSettings, 'id'>) };
        setLocal('site_settings', data);
        onData(data);
      } else {
        // Fall back to checking site_settings/default once if globalConfig doesn't exist yet
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
  const payload = {
    ...settings,
    id: 'globalConfig',
    updatedAt: new Date().toISOString(),
  };

  // 1. Immediately cache in local storage
  setLocal('site_settings', payload);

  // 2. Persist to Firestore
  try {
    // Write atomically to both settings/globalConfig and site_settings/default
    await Promise.all([
      setDoc(doc(db, 'settings', 'globalConfig'), payload),
      setDoc(doc(db, 'site_settings', 'default'), { ...payload, id: 'default' }),
    ]);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/globalConfig');
  }

  return payload;
}

// ================= SEED ALL DATA HELPER =================
export async function seedAllInitialDataToFirestore(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Site Settings (both locations)
    await Promise.all([
      setDoc(doc(db, 'settings', 'globalConfig'), { ...INITIAL_SITE_SETTINGS, id: 'globalConfig' }),
      setDoc(doc(db, 'site_settings', 'default'), INITIAL_SITE_SETTINGS),
    ]);

    // 2. Hero Slides
    for (const slide of INITIAL_HERO_SLIDES) {
      await setDoc(doc(db, 'hero_slides', slide.id), slide);
    }

    // 3. Categories
    for (const cat of INITIAL_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), cat);
    }

    // 4. Products
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, 'products', prod.id), prod);
    }

    // 5. Blog Posts
    for (const post of INITIAL_BLOG_POSTS) {
      await setDoc(doc(db, 'blog_posts', post.id), post);
    }

    // Refresh local cache
    setLocal('hero_slides', INITIAL_HERO_SLIDES);
    setLocal('categories', INITIAL_CATEGORIES);
    setLocal('products', INITIAL_PRODUCTS);
    setLocal('blog_posts', INITIAL_BLOG_POSTS);
    setLocal('site_settings', INITIAL_SITE_SETTINGS);

    return {
      success: true,
      message: 'All core categories, products, slides, blogs, and settings/globalConfig synced to Firestore successfully!',
    };
  } catch (error) {
    console.error('Error seeding data to Firestore:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error syncing to Firestore',
    };
  }
}
