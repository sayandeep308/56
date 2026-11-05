import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LogOut,
  LogIn,
  Sliders,
  Layers,
  ShoppingBag,
  BookOpen,
  Inbox,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  Eye,
  CheckCircle,
  MessageCircle,
  Upload,
  AlertCircle,
  X,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  HeroSlide,
  Category,
  Product,
  BlogPost,
  CustomerEnquiry,
  SiteSettings,
  SpecificationItem,
} from '../types';
import {
  saveHeroSlide,
  deleteHeroSlide,
  saveCategory,
  deleteCategory,
  saveProduct,
  deleteProduct,
  saveBlogPost,
  deleteBlogPost,
  updateEnquiryStatus,
  getEnquiries,
  subscribeToEnquiries,
  saveSiteSettings,
  seedAllInitialDataToFirestore,
} from '../services/db';
import { uploadImageWithTieredFallback } from '../utils/imageUpload';
import { slugify } from '../utils/slugify';
import { formatPrice } from '../utils/currency';
import { TilakLogo } from '../components/TilakLogo';

interface AdminPageProps {
  slides: HeroSlide[];
  categories: Category[];
  products: Product[];
  blogPosts: BlogPost[];
  settings?: SiteSettings | null;
  onRefreshAllData: () => Promise<void>;
  onNavigate: (path: string) => void;
}

type AdminTab = 'slides' | 'categories' | 'products' | 'blog' | 'enquiries' | 'settings';

export const AdminPage: React.FC<AdminPageProps> = ({
  slides,
  categories,
  products,
  blogPosts,
  settings,
  onRefreshAllData,
  onNavigate,
}) => {
  const { currentUser, isAdmin, isDemoAdmin, loginWithGoogle, logout, enableDemoAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('enquiries');
  const [enquiriesList, setEnquiriesList] = useState<CustomerEnquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; msg: string; isError?: boolean }>({
    loading: false,
    msg: '',
  });

  // Password Authentication Gate (Password: Satarupa9908)
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('satarupa_admin_password_unlocked') === 'true';
  });

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword.trim() === 'Satarupa9908') {
      setIsPasswordUnlocked(true);
      sessionStorage.setItem('satarupa_admin_password_unlocked', 'true');
      setPasswordError('');
      enableDemoAdmin();
    } else {
      setPasswordError('Incorrect password. Please enter the authorized administrator password.');
    }
  };

  const handleAdminLogout = () => {
    setIsPasswordUnlocked(false);
    sessionStorage.removeItem('satarupa_admin_password_unlocked');
    logout();
  };

  // Modal / Editing States
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(
    settings || {
      id: 'default',
      businessName: 'Satarupa Steel Enterprise',
      whatsappNumber: '+919382176969',
      phoneNumber: '+91 93821 76969',
      email: 'satarupasteelenterprise@gmail.com',
      adminEmail: 'deep.007.sayan@gmail.com',
      address: 'Madpur Station Bajar, West Bengal, India',
      mapsUrl: 'https://share.google/NJPhQEXIVloDifYAW',
      cloudinaryCloudName: 'demo-artisan',
      cloudinaryUploadPreset: 'artisancraft_preset',
      imgbbApiKey: '',
      defaultCurrency: 'Rs. ',
      welcomeMessage: 'Welcome to Satarupa Steel Enterprise.',
    }
  );

  // New subcategory input in Category editor
  const [newSubcategoryInput, setNewSubcategoryInput] = useState('');
  // New image URL input in Product editor
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  // New spec key/value in Product editor
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');
  // New keyword in Blog editor
  const [newKeywordInput, setNewKeywordInput] = useState('');

  // 3-Tier Image Upload Helper state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');

  useEffect(() => {
    if (settings) setSettingsForm(settings);
  }, [settings]);

  useEffect(() => {
    if (isAdmin) {
      loadEnquiries();
      const unsubEnquiries = subscribeToEnquiries((items) => {
        setEnquiriesList(items);
        setLoadingEnquiries(false);
      });
      return () => unsubEnquiries();
    }
  }, [isAdmin]);

  const loadEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const items = await getEnquiries();
      setEnquiriesList(items);
    } catch (e) {
      console.warn('Load enquiries error:', e);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  const handleTieredImageUpload = async (file: File, onSuccess: (url: string) => void) => {
    setUploadingImage(true);
    setUploadProgressMsg('Uploading image...');
    try {
      const result = await uploadImageWithTieredFallback(file, settingsForm);
      onSuccess(result.url);
      setUploadProgressMsg(result.message);
      setTimeout(() => setUploadProgressMsg(''), 4500);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      alert(`Upload error: ${err.message || 'Failed to process image'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSeedAllToFirestore = async () => {
    if (!currentUser) {
      await ensureCloudAuth();
    }
    if (!confirm('This will seed/sync all 7 core categories, products, slides, blogs, and settings into your live Firestore database. Proceed?')) {
      return;
    }
    setSyncStatus({ loading: true, msg: 'Syncing initial data to Firestore...' });
    const res = await seedAllInitialDataToFirestore();
    if (res.success) {
      await onRefreshAllData();
      await loadEnquiries();
      setSyncStatus({ loading: false, msg: res.message, isError: false });
    } else {
      setSyncStatus({ loading: false, msg: res.message, isError: true });
    }
    setTimeout(() => setSyncStatus({ loading: false, msg: '' }), 5000);
  };

  // Cloud Authentication Check
  const ensureCloudAuth = async (): Promise<boolean> => {
    if (currentUser) return true;
    const proceed = confirm(
      'Live Firestore Cloud Authentication:\n\n' +
      'Saving directly to your live Firebase database requires Google Admin authentication (deep.007.sayan@gmail.com).\n\n' +
      'Click OK to Sign In with Google now to sync to live Firestore, or Cancel to save in local session cache.'
    );
    if (proceed) {
      try {
        await loginWithGoogle();
        return true;
      } catch (err) {
        console.warn('Google sign-in cancelled or failed:', err);
        return false;
      }
    }
    return false;
  };

  // -------------------------------------------------------------
  // HERO SLIDE ACTIONS
  // -------------------------------------------------------------
  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide?.title || !editingSlide?.imageUrl) {
      alert('Please provide Slide Title and Image URL');
      return;
    }
    try {
      await saveHeroSlide(editingSlide as any);
      await onRefreshAllData();
      setEditingSlide(null);
      alert('Hero banner slide saved and synced successfully!');
    } catch (err: any) {
      if (err.message && err.message.includes('insufficient permissions')) {
        alert('Slide preserved in local cache! Your live Firestore rules may still be restricting writes. Please ensure rules are deployed in Firebase Console or sign in with Google Admin (deep.007.sayan@gmail.com).');
        setEditingSlide(null);
        await onRefreshAllData();
      } else {
        alert(`Save slide notice: ${err.message}`);
      }
    }
  };


  const handleDeleteSlide = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero slide?')) return;
    if (!currentUser) {
      await ensureCloudAuth();
    }
    try {
      await deleteHeroSlide(id);
      await onRefreshAllData();
    } catch (err: any) {
      alert(`Delete notice: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // CATEGORY ACTIONS
  // -------------------------------------------------------------
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) {
      alert('Please provide a Category Name');
      return;
    }
    const catSlug = editingCategory.slug || slugify(editingCategory.name);
    const payload: Category = {
      id: editingCategory.id || catSlug,
      name: editingCategory.name,
      slug: catSlug,
      description: editingCategory.description || '',
      imageUrl: editingCategory.imageUrl || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
      displayOrder: Number(editingCategory.displayOrder) || 1,
      subcategories: editingCategory.subcategories || [],
    };

    try {
      await saveCategory(payload);
      await onRefreshAllData();
      setEditingCategory(null);
      setNewSubcategoryInput('');
      alert('Category saved and synced successfully!');
    } catch (err: any) {
      if (err.message && err.message.includes('insufficient permissions')) {
        alert('Category saved to local cache! If live Firestore rejects the write, please deploy rules in Firebase Console or sign in with Google Admin (deep.007.sayan@gmail.com).');
        setEditingCategory(null);
        await onRefreshAllData();
      } else {
        alert(`Save category notice: ${err.message}`);
      }
    }
  };


  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category and its subcategories?')) return;
    if (!currentUser) {
      await ensureCloudAuth();
    }
    try {
      await deleteCategory(id);
      await onRefreshAllData();
    } catch (err: any) {
      alert(`Delete notice: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // PRODUCT ACTIONS
  // -------------------------------------------------------------
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.title || !editingProduct?.categoryId) {
      alert('Please provide Product Title and select a Category');
      return;
    }

    const matchedCat = categories.find((c) => c.id === editingProduct.categoryId || c.slug === editingProduct.categoryId);
    const prodSlug = editingProduct.slug || slugify(editingProduct.title);

    const payload: Product = {
      id: editingProduct.id || `prod-${Date.now()}`,
      title: editingProduct.title,
      slug: prodSlug,
      categoryId: editingProduct.categoryId,
      categoryName: matchedCat?.name || editingProduct.categoryName || 'General',
      subcategory: editingProduct.subcategory || matchedCat?.subcategories?.[0] || 'General',
      shortDescription: editingProduct.shortDescription || '',
      description: editingProduct.description || '',
      price: editingProduct.price ? Number(editingProduct.price) : 0,
      isPriceOnRequest: Boolean(editingProduct.isPriceOnRequest),
      isMostSelling: Boolean(editingProduct.isMostSelling),
      images: editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images
        : ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'],
      specifications: editingProduct.specifications || [],
      metaTitle: editingProduct.metaTitle || `${editingProduct.title} | ArtisanCraft`,
      metaDescription: editingProduct.metaDescription || editingProduct.shortDescription,
      featured: Boolean(editingProduct.featured),
    };

    try {
      await saveProduct(payload);
      await onRefreshAllData();
      setEditingProduct(null);
      setNewImageUrlInput('');
      setNewSpecKey('');
      setNewSpecVal('');
      alert('Product saved and synced successfully!');
    } catch (err: any) {
      if (err.message && err.message.includes('insufficient permissions')) {
        alert('Product safely preserved in local browser cache! Note: Your live Firebase project has not applied the open Firestore rules yet. You can deploy rules in Firebase Console or click "Sign In with Google for Cloud Writes" at the top.');
        setEditingProduct(null);
        await onRefreshAllData();
      } else {
        alert(`Save product notice: ${err.message}`);
      }
    }
  };


  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    if (!currentUser) {
      await ensureCloudAuth();
    }
    try {
      await deleteProduct(id);
      await onRefreshAllData();
    } catch (err: any) {
      alert(`Delete product notice: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // BLOG ACTIONS
  // -------------------------------------------------------------
  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost?.title) {
      alert('Please provide Blog Title');
      return;
    }

    const postSlug = editingPost.slug || slugify(editingPost.title);
    const payload: BlogPost = {
      id: editingPost.id || `blog-${Date.now()}`,
      title: editingPost.title,
      slug: postSlug,
      summary: editingPost.summary || '',
      content: editingPost.content || '',
      featuredImage: editingPost.featuredImage || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
      metaTitle: editingPost.metaTitle || `${editingPost.title} | ArtisanCraft Journal`,
      metaDescription: editingPost.metaDescription || editingPost.summary || '',
      keywords: editingPost.keywords || [],
      isPublished: editingPost.isPublished ?? true,
      publishedAt: editingPost.publishedAt || new Date().toISOString().split('T')[0],
      author: editingPost.author || 'ArtisanCraft Senior Architect',
      readTimeMinutes: Number(editingPost.readTimeMinutes) || 5,
    };

    try {
      await saveBlogPost(payload);
      await onRefreshAllData();
      setEditingPost(null);
      setNewKeywordInput('');
      alert('Blog article saved and synced successfully!');
    } catch (err: any) {
      if (err.message && err.message.includes('insufficient permissions')) {
        alert('Blog post saved to local cache! If live Firestore rejects the write, please deploy rules in Firebase Console or sign in with Google Admin (deep.007.sayan@gmail.com).');
        setEditingPost(null);
        await onRefreshAllData();
      } else {
        alert(`Save blog notice: ${err.message}`);
      }
    }
  };


  const handleDeleteBlogPost = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    if (!currentUser) {
      await ensureCloudAuth();
    }
    try {
      await deleteBlogPost(id);
      await onRefreshAllData();
    } catch (err: any) {
      alert(`Delete blog notice: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // ENQUIRY STATUS ACTIONS
  // -------------------------------------------------------------
  const handleUpdateStatus = async (id: string, status: CustomerEnquiry['status']) => {
    try {
      await updateEnquiryStatus(id, status);
      setEnquiriesList((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e))
      );
    } catch (err: any) {
      alert(`Status update notice: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // SITE SETTINGS ACTIONS
  // -------------------------------------------------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSiteSettings(settingsForm);
      await onRefreshAllData();
      alert('Settings saved and synced successfully! Active across all domains.');
    } catch (err: any) {
      if (err.message && err.message.includes('insufficient permissions')) {
        alert('Settings saved to local cache! If live Firestore rejects the write, please deploy rules in Firebase Console or sign in with Google Admin (deep.007.sayan@gmail.com).');
      } else {
        alert(`Save settings notice: ${err.message}`);
      }
    }
  };


  // =============================================================
  // AUTH GUARD VIEW (Password Satarupa9908 Gate)
  // =============================================================
  if (!isPasswordUnlocked && !isAdmin) {
    return (
      <div className="py-16 bg-[#FAF6F0] min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E8DFD5] shadow-xl text-center space-y-6">
          <div className="flex justify-center mx-auto">
            <TilakLogo size="lg" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8792C] block mb-1">
              Madpur Station Bajar
            </span>
            <h1 className="font-serif text-2xl font-bold text-[#2C221E]">
              Satarupa Steel Enterprise
            </h1>
            <p className="text-xs text-[#5A4E46] mt-1.5 leading-relaxed">
              Restricted Administration Area. Enter the authorized master password to manage product catalog, categories, hero slides, and customer enquiries.
            </p>
          </div>

          {passwordError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {/* Primary Recommended: Google Admin Sign In */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-[#F4D9A0] text-left space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C8792C] text-white">
                Recommended
              </span>
              <span className="text-xs font-bold text-[#2C221E]">
                Direct Live Firestore Access
              </span>
            </div>
            <p className="text-[11px] text-[#5A4E46] leading-relaxed">
              Sign in with your authorized Google Admin account (<strong className="text-[#2C221E]">deep.007.sayan@gmail.com</strong>) to immediately read, create, and edit products directly in the live Firestore cloud database.
            </p>
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full btn-wood-gold py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <LogIn className="w-4 h-4 text-[#5B4632]" />
              <span>Sign In with Google Admin</span>
            </button>
          </div>

          <div className="relative py-1 flex items-center justify-center">
            <span className="h-px bg-[#E8DFD5] w-full" />
            <span className="text-[10px] text-[#5A4E46] bg-white px-2 absolute uppercase font-bold tracking-wider">
              Or Master Password (Local Admin)
            </span>
          </div>

          {/* Password Form */}
          <form onSubmit={handlePasswordLogin} className="space-y-3 pt-1">
            <div className="text-left">
              <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                Administrator Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  placeholder="Enter administrator password..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] bg-[#FAF6F0]/40 text-sm text-[#2C221E] focus:outline-hidden focus:border-[#C8792C] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-gold-pill py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <ShieldCheck className="w-4 h-4 text-[#241403]" />
              <span>Unlock with Password (Satarupa9908)</span>
            </button>
          </form>

          <div className="pt-2 border-t border-[#FAF6F0] text-center">
            <button
              onClick={() => onNavigate('/')}
              className="text-xs text-[#5B4632] hover:underline"
            >
              &larr; Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // MAIN ADMIN DASHBOARD
  // =============================================================
  return (
    <div className="py-8 bg-[#FAF6F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Admin Bar */}
        <div className="bg-[#5B4632] text-white rounded-2xl p-6 border border-[#F4D9A0]/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TilakLogo size="md" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#FAF6F0]">
                  Satarupa Steel Enterprise Administration
                </h1>
                {currentUser ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <CheckCircle className="w-3 h-3 text-emerald-200" />
                    <span>Cloud Admin: {currentUser.email}</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider">
                    Local Session (Password Unlocked)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#F4D9A0]/80 mt-0.5">
                Madpur Station Bajar &bull; Master Protected &bull; {currentUser ? 'Live Firestore Cloud Connected' : 'Google Login Recommended for Cloud Writes'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!currentUser && (
              <button
                onClick={loginWithGoogle}
                className="btn-wood-gold text-xs px-3.5 py-2.5 font-bold flex items-center gap-1.5 shadow-sm animate-pulse"
                title="Sign in with Google so your product additions and edits write directly to live Firestore"
              >
                <LogIn className="w-3.5 h-3.5 text-[#5B4632]" />
                <span>Sign In with Google for Cloud Writes</span>
              </button>
            )}

            <button
              onClick={handleSeedAllToFirestore}
              disabled={syncStatus.loading}
              className="px-3.5 py-2.5 rounded-lg bg-[#463525] hover:bg-[#6B523B] border border-[#F4D9A0]/40 text-xs font-semibold text-[#F4D9A0] flex items-center gap-1.5 transition-colors shadow-sm"
              title="Populates all categories, products, slides, blogs, and settings into Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.loading ? 'animate-spin' : ''}`} />
              <span>{syncStatus.loading ? 'Syncing...' : 'Sync All Seed Data'}</span>
            </button>

            <button
              onClick={() => onNavigate('/')}
              className="px-3.5 py-2.5 rounded-lg bg-[#463525] hover:bg-[#6B523B] border border-[#F4D9A0]/40 text-xs font-semibold text-[#F4D9A0] flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Site</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="p-2.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Lock Admin Portal & Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Local Session Warning Banner */}
        {!currentUser && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-sm">
                  Local Session Mode Active (Live Firestore Cloud writes require Google Admin login)
                </p>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  You are currently authenticated via password (<code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">Satarupa9908</code>). Any products you create are safely saved in your browser cache. To publish and sync directly to live Firestore, please sign in with your authorized Google Admin account (<strong className="font-mono text-amber-950">deep.007.sayan@gmail.com</strong>).
                </p>
              </div>
            </div>
            <button
              onClick={loginWithGoogle}
              className="btn-wood text-xs px-4 py-2.5 font-bold whitespace-nowrap flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-md"
            >
              <LogIn className="w-4 h-4 text-[#F4D9A0]" />
              <span>Sign In with Google</span>
            </button>
          </div>
        )}

        {/* Sync Status Banner */}
        {syncStatus.msg && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center justify-between gap-2 ${
              syncStatus.isError
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}
          >
            <span>{syncStatus.msg}</span>
            <button
              onClick={() => setSyncStatus({ loading: false, msg: '' })}
              className="text-gray-500 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-[#E8DFD5] gap-2 pb-1 text-sm font-semibold">
          {[
            { id: 'enquiries', label: `Customer Enquiries (${enquiriesList.length})`, icon: Inbox },
            { id: 'products', label: `Products (${products.length})`, icon: ShoppingBag },
            { id: 'categories', label: `Categories Hub (${categories.length})`, icon: Layers },
            { id: 'slides', label: `Hero Slider (${slides.length})`, icon: Sliders },
            { id: 'blog', label: `SEO Blog (${blogPosts.length})`, icon: BookOpen },
            { id: 'settings', label: 'Site Settings', icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-4 py-3 rounded-t-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border-t-2 min-h-[44px] ${
                  isActive
                    ? 'bg-white text-[#5B4632] border-[#C8792C] shadow-xs'
                    : 'text-[#5A4E46] border-transparent hover:text-[#2C221E] hover:bg-white/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C8792C]' : 'text-[#5B4632]/60'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: CUSTOMER ENQUIRIES INBOX                           */}
        {/* ========================================================= */}
        {activeTab === 'enquiries' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8DFD5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2C221E] flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-[#C8792C]" />
                  <span>Customer Enquiries Inbox</span>
                </h2>
                <p className="text-xs text-[#5A4E46] mt-0.5">
                  Real-time product inquiries and bespoke quotes submitted by clients with direct WhatsApp reply action.
                </p>
              </div>

              <button
                onClick={loadEnquiries}
                className="btn-wood text-xs px-4 py-2 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingEnquiries ? 'animate-spin' : ''}`} />
                <span>Refresh Inbox</span>
              </button>
            </div>

            {loadingEnquiries ? (
              <div className="py-12 text-center text-xs text-[#5A4E46]">Loading enquiries...</div>
            ) : enquiriesList.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#5A4E46] border border-dashed border-[#E8DFD5] rounded-xl">
                No customer enquiries yet. Test by submitting an inquiry from any product page or contact form!
              </div>
            ) : (
              <>
                {/* Mobile Stacked Cards for Enquiries */}
                <div className="sm:hidden space-y-3">
                  {enquiriesList.map((enq) => {
                    const cleanPhone = enq.phone.replace(/[^0-9]/g, '');
                    const replyMessage = `Hello ${enq.customerName}! Thank you for your inquiry regarding "${enq.productTitle || 'bespoke architectural furnishings'}" on Satarupa Enterprise. How may we assist with your specifications?`;
                    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(replyMessage)}`;

                    return (
                      <div key={enq.id} className="p-4 rounded-xl border border-[#E8DFD5] bg-[#FAF6F0]/40 space-y-3 shadow-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-sm text-[#2C221E] block">{enq.customerName}</span>
                            <span className="text-xs text-[#5B4632] block font-mono">{enq.phone}</span>
                            {enq.email && <span className="text-xs text-[#5A4E46] block">{enq.email}</span>}
                          </div>
                          <select
                            value={enq.status}
                            onChange={(e) => handleUpdateStatus(enq.id, e.target.value as any)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border bg-white min-h-[38px]"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>

                        <div className="text-xs text-[#5A4E46] bg-white p-3 rounded-lg border border-[#E8DFD5]/70 space-y-1">
                          <span className="font-semibold text-[#2C221E] block">
                            {enq.productTitle || 'Custom Commission'}
                          </span>
                          <p className="line-clamp-3 leading-relaxed">{enq.message}</p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-[#5A4E46]">
                            {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#25D366] text-white font-semibold text-xs min-h-[44px]"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Reply WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop & Tablet Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#E8DFD5] rounded-xl overflow-hidden min-w-[700px]">
                    <thead className="bg-[#FAF6F0] text-[#5B4632] uppercase tracking-wider font-semibold border-b border-[#E8DFD5]">
                      <tr>
                        <th className="p-3.5">Customer and Contact</th>
                        <th className="p-3.5">Product / Project</th>
                        <th className="p-3.5">Inquiry Message</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Instant WhatsApp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DFD5]">
                      {enquiriesList.map((enq) => {
                        const cleanPhone = enq.phone.replace(/[^0-9]/g, '');
                        const replyMessage = `Hello ${enq.customerName}! Thank you for your inquiry regarding "${enq.productTitle || 'bespoke architectural furnishings'}" on Satarupa Enterprise. How may we assist with your specifications?`;
                      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(replyMessage)}`;

                      return (
                        <tr key={enq.id} className="hover:bg-[#FAF6F0]/50 transition-colors">
                          <td className="p-3.5 align-top">
                            <span className="font-bold text-[#2C221E] block">{enq.customerName}</span>
                            <span className="text-[#5B4632] block font-mono">{enq.phone}</span>
                            {enq.email && <span className="text-[#5A4E46] block">{enq.email}</span>}
                          </td>
                          <td className="p-3.5 align-top">
                            <span className="font-semibold text-[#2C221E] block">
                              {enq.productTitle || 'Custom Commission'}
                            </span>
                            <span className="text-[10px] text-[#C8792C] uppercase font-bold">
                              {enq.type || 'Product'}
                            </span>
                          </td>
                          <td className="p-3.5 align-top max-w-xs">
                            <p className="text-[#5A4E46] line-clamp-3 leading-relaxed">
                              {enq.message}
                            </p>
                          </td>
                          <td className="p-3.5 align-top text-[#5A4E46] whitespace-nowrap">
                            {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="p-3.5 align-top">
                            <select
                              value={enq.status}
                              onChange={(e) => handleUpdateStatus(enq.id, e.target.value as any)}
                              className={`px-2 py-1 rounded-md text-xs font-semibold border ${
                                enq.status === 'new'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : enq.status === 'contacted'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : 'bg-green-100 text-green-800 border-green-300'
                              }`}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                          <td className="p-3.5 align-top text-right">
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-semibold text-xs hover:bg-[#20bd5a] transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Reply on WhatsApp</span>
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRODUCTS MANAGER                                   */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8DFD5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2C221E] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#C8792C]" />
                  <span>Showcase Product Catalog Manager</span>
                </h2>
                <p className="text-xs text-[#5A4E46]">
                  Manage showcase designs, images, technical specifications, and Most Selling tags.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingProduct({
                    title: '',
                    slug: '',
                    categoryId: categories[0]?.slug || 'interior',
                    categoryName: categories[0]?.name || 'Interior',
                    subcategory: categories[0]?.subcategories?.[0] || 'General',
                    shortDescription: '',
                    description: '',
                    price: 45000,
                    isPriceOnRequest: false,
                    isMostSelling: false,
                    images: [],
                    specifications: [
                      { key: 'Material', value: 'Seasoned Burma Teak Wood' },
                      { key: 'Finish', value: 'Natural PU Satin' },
                    ],
                  })
                }
                className="btn-wood text-xs px-4 py-2.5 font-semibold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#F4D9A0]" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Mobile Stacked Cards for Products */}
            <div className="sm:hidden space-y-3">
              {products.map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl border border-[#E8DFD5] bg-[#FAF6F0]/40 flex items-center justify-between gap-3 shadow-xs">
                  <img
                    src={p.images?.[0] || ''}
                    alt={p.title}
                    className="w-14 h-14 rounded-lg object-cover border border-[#E8DFD5] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-xs text-[#2C221E] block truncate">{p.title}</span>
                    <span className="text-[11px] text-[#C8792C] block truncate">{p.categoryName} &bull; {p.subcategory}</span>
                    <span className="text-xs font-semibold text-[#2C221E] block mt-0.5">
                      {formatPrice(p.price, p.isPriceOnRequest, settings?.defaultCurrency || '₹')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingProduct({ ...p })}
                      title="Edit product"
                      className="p-2 rounded-lg bg-amber-50 text-[#C8792C] hover:bg-amber-100 min-w-[40px] min-h-[40px] flex items-center justify-center"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      title="Delete product"
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 min-w-[40px] min-h-[40px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Products Table on Desktop/Tablet */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#E8DFD5] rounded-xl overflow-hidden min-w-[680px]">
                <thead className="bg-[#FAF6F0] text-[#5B4632] uppercase tracking-wider font-semibold border-b border-[#E8DFD5]">
                  <tr>
                    <th className="p-3.5">Image and Title</th>
                    <th className="p-3.5">Category and Subcategory</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Bestseller Badge</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFD5]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF6F0]/50">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || ''}
                            alt={p.title}
                            className="w-12 h-12 rounded-lg object-cover border border-[#E8DFD5] shrink-0"
                          />
                          <div>
                            <span className="font-bold text-[#2C221E] block line-clamp-1">{p.title}</span>
                            <span className="text-[11px] text-[#5A4E46] font-mono">/product/{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-[#5B4632] block">{p.categoryName}</span>
                        <span className="text-[#C8792C]">{p.subcategory}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-[#2C221E]">
                        {formatPrice(p.price, p.isPriceOnRequest, settings?.defaultCurrency || '₹')}
                      </td>
                      <td className="p-3.5">
                        {p.isMostSelling ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C8792C] text-white text-[10px] font-bold">
                            <Flame className="w-3 h-3 fill-current" />
                            Most Selling
                          </span>
                        ) : (
                          <span className="text-gray-400">&mdash;</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onNavigate(`/product/${p.slug}`)}
                            title="View product"
                            className="p-1.5 rounded-md hover:bg-gray-100 text-[#5B4632]"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingProduct({ ...p })}
                            title="Edit product"
                            className="p-1.5 rounded-md hover:bg-gray-100 text-blue-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Delete product"
                            className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CATEGORIES & SUBCATEGORIES MANAGER                 */}
        {/* ========================================================= */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8DFD5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2C221E] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#C8792C]" />
                  <span>Category and Subcategory Architecture</span>
                </h2>
                <p className="text-xs text-[#5A4E46]">
                  Preloaded with the 7 core categories. Create new ones or edit nested subcategories and display orders.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingCategory({
                    name: '',
                    slug: '',
                    description: '',
                    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
                    displayOrder: categories.length + 1,
                    subcategories: ['Custom Line Item 1', 'Custom Line Item 2'],
                  })
                }
                className="btn-wood text-xs px-4 py-2.5 font-semibold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#F4D9A0]" />
                <span>Create New Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-xl border border-[#E8DFD5] overflow-hidden bg-[#FAF6F0]/40 flex flex-col justify-between"
                >
                  <div className="relative aspect-16/9 bg-[#5B4632]">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#5B4632]/85 text-[#F4D9A0] text-[10px] font-bold">
                      Order #{cat.displayOrder}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#2C221E]">{cat.name}</h3>
                      <p className="text-xs text-[#5A4E46] line-clamp-2 mt-1">{cat.description}</p>

                      <div className="mt-3">
                        <span className="text-[10px] font-bold uppercase text-[#C8792C] block mb-1">
                          Nested Subcategories ({cat.subcategories?.length || 0}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {cat.subcategories?.map((sub) => (
                            <span
                              key={sub}
                              className="px-2 py-0.5 rounded-sm bg-white border border-[#E8DFD5] text-[10px] text-[#5B4632]"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8DFD5] flex items-center justify-between">
                      <button
                        onClick={() => onNavigate(`/products?category=${cat.slug}`)}
                        className="text-xs text-[#5B4632] hover:text-[#C8792C] font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Products</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingCategory({ ...cat })}
                          className="p-1.5 rounded-md hover:bg-white text-blue-600"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 rounded-md hover:bg-white text-red-600"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: HERO SLIDER MANAGER                                */}
        {/* ========================================================= */}
        {activeTab === 'slides' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8DFD5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2C221E] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#C8792C]" />
                  <span>Homepage Hero Banner Slides</span>
                </h2>
                <p className="text-xs text-[#5A4E46]">
                  Configure title, subtitle, background image, CTA buttons, display order, and active toggle.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingSlide({
                    title: 'New Luxury Architectural Feature',
                    subtitle: 'Bespoke handcrafting tailored to your luxury villa or residential sanctum.',
                    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80',
                    ctaText: 'Explore Collection',
                    ctaLink: '/products',
                    displayOrder: slides.length + 1,
                    isActive: true,
                  })
                }
                className="btn-wood text-xs px-4 py-2.5 font-semibold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#F4D9A0]" />
                <span>Add Hero Slide</span>
              </button>
            </div>

            <div className="space-y-4">
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  className="rounded-xl border border-[#E8DFD5] p-4 flex flex-col md:flex-row items-center gap-5 bg-[#FAF6F0]/30"
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full md:w-48 h-28 rounded-lg object-cover border border-[#E8DFD5]"
                  />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#5B4632]">Order #{slide.displayOrder}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          slide.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {slide.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#2C221E]">{slide.title}</h3>
                    <p className="text-xs text-[#5A4E46] line-clamp-1">{slide.subtitle}</p>
                    <div className="text-[11px] text-[#C8792C] font-semibold">
                      CTA: "{slide.ctaText}" &rarr; {slide.ctaLink}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => setEditingSlide({ ...slide })}
                      className="btn-wood text-xs px-3 py-1.5"
                    >
                      Edit Slide
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SEO BLOG PUBLISHER                                 */}
        {/* ========================================================= */}
        {activeTab === 'blog' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8DFD5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2C221E] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#C8792C]" />
                  <span>SEO Craft Blog Publisher</span>
                </h2>
                <p className="text-xs text-[#5A4E46]">
                  Write and publish SEO articles with custom URL slugs, keywords, and meta tags.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingPost({
                    title: '',
                    slug: '',
                    summary: '',
                    content: '### Introduction\n\nWrite your craft article details here...',
                    featuredImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
                    metaTitle: '',
                    metaDescription: '',
                    keywords: ['woodcraft', 'interior design'],
                    isPublished: true,
                    publishedAt: new Date().toISOString().split('T')[0],
                    author: 'ArtisanCraft Senior Architect',
                    readTimeMinutes: 5,
                  })
                }
                className="btn-wood text-xs px-4 py-2.5 font-semibold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#F4D9A0]" />
                <span>Write New Article</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#E8DFD5] rounded-xl overflow-hidden">
                <thead className="bg-[#FAF6F0] text-[#5B4632] uppercase tracking-wider font-semibold border-b border-[#E8DFD5]">
                  <tr>
                    <th className="p-3.5">Article Title / Slug</th>
                    <th className="p-3.5">Author</th>
                    <th className="p-3.5">Keywords</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFD5]">
                  {blogPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-[#FAF6F0]/50">
                      <td className="p-3.5">
                        <span className="font-bold text-[#2C221E] block line-clamp-1">{post.title}</span>
                        <span className="text-[11px] text-[#5B4632] font-mono">/blog/{post.slug}</span>
                      </td>
                      <td className="p-3.5 text-[#5A4E46]">{post.author}</td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {post.keywords?.slice(0, 3).map((k) => (
                            <span key={k} className="px-2 py-0.5 rounded-xs bg-[#FAF6F0] text-[10px] text-[#5B4632]">
                              #{k}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            post.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onNavigate(`/blog/${post.slug}`)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-[#5B4632]"
                            title="View article"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingPost({ ...post })}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-blue-600"
                            title="Edit article"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlogPost(post.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
                            title="Delete article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: SITE SETTINGS & CLOUDINARY                         */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DFD5] shadow-xs space-y-6 max-w-3xl">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#2C221E] flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-[#C8792C]" />
                <span>Site Settings and Cloudinary Configuration</span>
              </h2>
              <p className="text-xs text-[#5A4E46] mt-0.5">
                Configure your business WhatsApp number for floating action and inquiry redirects, plus Cloudinary upload credentials.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.businessName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                    Business WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="+919876543210 (include country code)"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                    Phone Number (Display)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.phoneNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                    Concierge Email
                  </label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                  Atelier Physical Address
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={settingsForm.mapsUrl || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, mapsUrl: e.target.value })}
                  placeholder="https://share.google/..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C221E] mb-1">
                  Administrator / Super-Admin Email
                </label>
                <input
                  type="email"
                  value={settingsForm.adminEmail || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, adminEmail: e.target.value })}
                  placeholder="e.g. deep.007.sayan@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] text-xs sm:text-sm"
                />
                <span className="text-[11px] text-[#5A4E46] mt-0.5 block">
                  Users authenticated with this email receive immediate master administrator access.
                </span>
              </div>

              {/* 3-Tier Image Cloud Storage Configuration Box */}
              <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#F4D9A0] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#5B4632] block">
                      3-Tier Image Cloud Storage Architecture
                    </span>
                    <p className="text-xs text-[#5A4E46] mt-0.5">
                      Persisted across all domains in Firestore (<code className="bg-[#F3ECE2] px-1 py-0.5 rounded text-[11px]">settings/globalConfig</code>). Never lost when deploying to Vercel.
                    </p>
                  </div>
                  <div>
                    {settingsForm.cloudinaryCloudName &&
                    settingsForm.cloudinaryUploadPreset &&
                    settingsForm.cloudinaryCloudName !== 'demo-artisan' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ● Tier 1: Cloudinary CDN Active
                      </span>
                    ) : settingsForm.imgbbApiKey ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                        ● Tier 1: ImgBB Cloud Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                        ● Tier 2: Zero-Config Auto Compression (&lt;150KB Free)
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-white/80 p-3 rounded-lg border border-[#E8DFD5] text-xs text-[#5A4E46] space-y-1.5">
                  <p className="font-semibold text-[#2C221E]">How image uploads work across Vercel & Mobile:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li><strong>Tier 1 (Cloudinary / ImgBB):</strong> Uploads directly to external cloud bucket and saves the CDN URL into Firestore.</li>
                    <li><strong>Tier 2 (Zero-Config Auto Fallback):</strong> If no external keys are configured, images are automatically compressed in-browser via HTML5 Canvas (max 1000px, &lt;150KB WebP) and stored in Firestore for 100% free hosting on Vercel out-of-the-box.</li>
                    <li><strong>Tier 3 (Direct Link):</strong> Any direct public image URL can be pasted into any manager.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-[#5B4632] uppercase tracking-wide block">
                    Option A: Cloudinary Credentials (Unsigned)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2C221E] mb-1">
                        Cloud Name
                      </label>
                      <input
                        type="text"
                        value={settingsForm.cloudinaryCloudName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, cloudinaryCloudName: e.target.value })}
                        placeholder="e.g. your_cloud_name"
                        className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2C221E] mb-1">
                        Unsigned Upload Preset
                      </label>
                      <input
                        type="text"
                        value={settingsForm.cloudinaryUploadPreset}
                        onChange={(e) => setSettingsForm({ ...settingsForm, cloudinaryUploadPreset: e.target.value })}
                        placeholder="e.g. ml_default"
                        className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-[#E8DFD5]">
                  <span className="text-[11px] font-bold text-[#5B4632] uppercase tracking-wide block">
                    Option B: ImgBB Cloud API Key (Optional Alternative)
                  </span>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#2C221E] mb-1">
                      ImgBB API Key (from api.imgbb.com)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.imgbbApiKey || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, imgbbApiKey: e.target.value })}
                      placeholder="e.g. 7c9a8b1... (leave empty if using Cloudinary or Tier 2 auto-compression)"
                      className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-wood text-xs sm:text-sm px-6 py-3 font-semibold flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-[#F4D9A0]" />
                  <span>Save All Settings to Firestore (settings/globalConfig)</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* MODAL: HERO SLIDE EDIT / CREATE                               */}
      {/* ============================================================= */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingSlide(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl p-6 border border-[#F4D9A0] shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD5] mb-4">
              <h3 className="font-serif font-bold text-lg text-[#2C221E]">
                {editingSlide.id ? 'Edit Hero Banner Slide' : 'Create Hero Banner Slide'}
              </h3>
              <button onClick={() => setEditingSlide(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Slide Title *</label>
                <input
                  type="text"
                  required
                  value={editingSlide.title || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Subtitle / Architectural Narrative</label>
                <textarea
                  rows={2}
                  value={editingSlide.subtitle || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Background Image URL *</label>
                <input
                  type="url"
                  required
                  value={editingSlide.imageUrl || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                />
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FAF6F0] border border-[#E8DFD5] text-[11px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#5B4632]" />
                    <span>{uploadingImage ? (uploadProgressMsg || 'Uploading...') : 'Upload Image (Auto 3-Tier)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleTieredImageUpload(file, (url) => {
                            setEditingSlide({ ...editingSlide, imageUrl: url });
                          });
                        }
                      }}
                    />
                  </label>
                  {uploadProgressMsg && (
                    <span className="text-[11px] text-amber-800 font-medium">{uploadProgressMsg}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={editingSlide.ctaText || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">CTA Link Path</label>
                  <input
                    type="text"
                    value={editingSlide.ctaLink || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaLink: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingSlide.displayOrder || 1}
                    onChange={(e) => setEditingSlide({ ...editingSlide, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={editingSlide.isActive ?? true}
                      onChange={(e) => setEditingSlide({ ...editingSlide, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C8792C]"
                    />
                    <span>Active on Homepage</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8DFD5]">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-wood px-5 py-2">
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: CATEGORY EDIT / CREATE                                 */}
      {/* ============================================================= */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingCategory(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl p-6 border border-[#F4D9A0] shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD5] mb-4">
              <h3 className="font-serif font-bold text-lg text-[#2C221E]">
                {editingCategory.id ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
              </h3>
              <button onClick={() => setEditingCategory(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditingCategory({
                      ...editingCategory,
                      name,
                      slug: editingCategory.id ? editingCategory.slug : slugify(name),
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">URL Slug</label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: slugify(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category Description</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Cover Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editingCategory.imageUrl || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... or upload below"
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                  />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FAF6F0] border border-[#E8DFD5] text-[11px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#5B4632]" />
                    <span>{uploadingImage ? (uploadProgressMsg || 'Uploading...') : 'Upload Image (Auto 3-Tier)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleTieredImageUpload(file, (url) => {
                            setEditingCategory({ ...editingCategory, imageUrl: url });
                          });
                        }
                      }}
                    />
                  </label>
                  {uploadProgressMsg && (
                    <span className="text-[11px] text-amber-800 font-medium">{uploadProgressMsg}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Display Order</label>
                <input
                  type="number"
                  value={editingCategory.displayOrder || 1}
                  onChange={(e) => setEditingCategory({ ...editingCategory, displayOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                />
              </div>

              {/* Subcategories Editor */}
              <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD5] space-y-2">
                <span className="font-bold text-[#5B4632] block">
                  Manage Nested Subcategories ({editingCategory.subcategories?.length || 0})
                </span>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubcategoryInput}
                    onChange={(e) => setNewSubcategoryInput(e.target.value)}
                    placeholder="Enter subcategory name..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#E8DFD5] bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubcategoryInput.trim()) {
                        const currentSubs = editingCategory.subcategories || [];
                        setEditingCategory({
                          ...editingCategory,
                          subcategories: [...currentSubs, newSubcategoryInput.trim()],
                        });
                        setNewSubcategoryInput('');
                      }
                    }}
                    className="btn-wood px-3 py-1.5 text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {editingCategory.subcategories?.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-white border border-[#E8DFD5] text-xs flex items-center gap-1.5 text-[#5B4632]"
                    >
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingCategory.subcategories || []).filter((_, i) => i !== idx);
                          setEditingCategory({ ...editingCategory, subcategories: updated });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8DFD5]">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-wood px-5 py-2">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: PRODUCT EDIT / CREATE                                  */}
      {/* ============================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingProduct(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 border border-[#F4D9A0] shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD5] mb-4">
              <h3 className="font-serif font-bold text-lg text-[#2C221E]">
                {editingProduct.id ? `Edit Product: ${editingProduct.title}` : 'Add New Showcase Product'}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingProduct({
                        ...editingProduct,
                        title,
                        slug: editingProduct.id ? editingProduct.slug : slugify(title),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">SEO URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.slug || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: slugify(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Category *</label>
                  <select
                    value={editingProduct.categoryId || ''}
                    onChange={(e) => {
                      const catId = e.target.value;
                      const matched = categories.find((c) => c.id === catId || c.slug === catId);
                      setEditingProduct({
                        ...editingProduct,
                        categoryId: catId,
                        categoryName: matched?.name || catId,
                        subcategory: matched?.subcategories?.[0] || 'General',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subcategory</label>
                  {(() => {
                    const matched = categories.find(
                      (c) => c.id === editingProduct.categoryId || c.slug === editingProduct.categoryId
                    );
                    const subList = matched?.subcategories || [];
                    return (
                      <select
                        value={editingProduct.subcategory || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                      >
                        {subList.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </div>

              {/* Price & Most Selling Row */}
              <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD5] grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block font-semibold mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    disabled={editingProduct.isPriceOnRequest}
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] bg-white disabled:opacity-50"
                  />
                </div>

                <div className="pt-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-[#5B4632]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.isPriceOnRequest)}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, isPriceOnRequest: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#C8792C]"
                    />
                    <span>Price on Request</span>
                  </label>
                </div>

                <div className="pt-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-[#C8792C]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.isMostSelling)}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, isMostSelling: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#C8792C]"
                    />
                    <Flame className="w-4 h-4 fill-current" />
                    <span>Most Selling Product</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Short Summary (Card View)</label>
                <input
                  type="text"
                  value={editingProduct.shortDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Full Architectural Description</label>
                <textarea
                  rows={4}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                />
              </div>

              {/* Multi-Image URLs Manager */}
              <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD5] space-y-2">
                <span className="font-bold text-[#5B4632] block">
                  Product Image Gallery URLs ({editingProduct.images?.length || 0})
                </span>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrlInput}
                    onChange={(e) => setNewImageUrlInput(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#E8DFD5] bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newImageUrlInput.trim()) {
                        const cur = editingProduct.images || [];
                        setEditingProduct({ ...editingProduct, images: [...cur, newImageUrlInput.trim()] });
                        setNewImageUrlInput('');
                      }
                    }}
                    className="btn-wood px-3 py-1.5 text-xs font-semibold"
                  >
                    Add URL
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#E8DFD5] text-[11px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#5B4632]" />
                    <span>{uploadingImage ? (uploadProgressMsg || 'Uploading...') : 'Upload Image (Auto 3-Tier)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleTieredImageUpload(file, (url) => {
                            const cur = editingProduct.images || [];
                            setEditingProduct({ ...editingProduct, images: [...cur, url] });
                          });
                        }
                      }}
                    />
                  </label>
                  {uploadProgressMsg && (
                    <span className="text-[11px] text-amber-800 font-medium">{uploadProgressMsg}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {editingProduct.images?.map((img, idx) => (
                    <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-[#E8DFD5]">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingProduct.images || []).filter((_, i) => i !== idx);
                          setEditingProduct({ ...editingProduct, images: updated });
                        }}
                        className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications Manager */}
              <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD5] space-y-2">
                <span className="font-bold text-[#5B4632] block">
                  Technical Specifications ({editingProduct.specifications?.length || 0})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <input
                    type="text"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    placeholder="Spec (e.g. Material)"
                    className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-[#E8DFD5] bg-white text-xs"
                  />
                  <input
                    type="text"
                    value={newSpecVal}
                    onChange={(e) => setNewSpecVal(e.target.value)}
                    placeholder="Value (e.g. Solid Teak)"
                    className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-[#E8DFD5] bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSpecKey.trim() && newSpecVal.trim()) {
                        const cur = editingProduct.specifications || [];
                        setEditingProduct({
                          ...editingProduct,
                          specifications: [...cur, { key: newSpecKey.trim(), value: newSpecVal.trim() }],
                        });
                        setNewSpecKey('');
                        setNewSpecVal('');
                      }
                    }}
                    className="btn-wood px-3 py-1.5 text-xs font-semibold"
                  >
                    Add Spec
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  {editingProduct.specifications?.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E8DFD5] text-xs"
                    >
                      <span>
                        <strong className="text-[#5B4632]">{spec.key}:</strong> {spec.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingProduct.specifications || []).filter((_, i) => i !== idx);
                          setEditingProduct({ ...editingProduct, specifications: updated });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO Meta Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">SEO Meta Title</label>
                  <input
                    type="text"
                    value={editingProduct.metaTitle || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, metaTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">SEO Meta Description</label>
                  <input
                    type="text"
                    value={editingProduct.metaDescription || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, metaDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8DFD5]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-wood px-5 py-2">
                  Save Product to Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: BLOG EDIT / CREATE                                     */}
      {/* ============================================================= */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingPost(null)} />
          <div className="relative w-full max-w-3xl bg-white rounded-2xl p-6 border border-[#F4D9A0] shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD5] mb-4">
              <h3 className="font-serif font-bold text-lg text-[#2C221E]">
                {editingPost.id ? `Edit SEO Article: ${editingPost.title}` : 'Compose New SEO Blog Post'}
              </h3>
              <button onClick={() => setEditingPost(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlogPost} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={editingPost.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingPost({
                        ...editingPost,
                        title,
                        slug: editingPost.id ? editingPost.slug : slugify(title),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Custom SEO URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={editingPost.slug || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: slugify(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Article Summary / Lead</label>
                <textarea
                  rows={2}
                  value={editingPost.summary || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Featured Hero Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editingPost.featuredImage || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, featuredImage: e.target.value })}
                    placeholder="https://images.unsplash.com/... or upload below"
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                  />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FAF6F0] border border-[#E8DFD5] text-[11px] font-semibold cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#5B4632]" />
                    <span>{uploadingImage ? (uploadProgressMsg || 'Uploading...') : 'Upload Image (Auto 3-Tier)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleTieredImageUpload(file, (url) => {
                            setEditingPost({ ...editingPost, featuredImage: url });
                          });
                        }
                      }}
                    />
                  </label>
                  {uploadProgressMsg && (
                    <span className="text-[11px] text-amber-800 font-medium">{uploadProgressMsg}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Article Markdown / Rich Content *</label>
                <textarea
                  rows={8}
                  required
                  value={editingPost.content || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  placeholder="### Section Heading&#10;&#10;Write detailed craft advice...&#10;&#10;- Bullet point 1"
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] font-mono text-xs"
                />
              </div>

              {/* Keywords Tag Manager */}
              <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DFD5] space-y-2">
                <span className="font-bold text-[#5B4632] block">SEO Keywords Tags</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeywordInput}
                    onChange={(e) => setNewKeywordInput(e.target.value)}
                    placeholder="e.g. mandir design, vastu"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#E8DFD5] bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newKeywordInput.trim()) {
                        const cur = editingPost.keywords || [];
                        setEditingPost({ ...editingPost, keywords: [...cur, newKeywordInput.trim()] });
                        setNewKeywordInput('');
                      }
                    }}
                    className="btn-wood px-3 py-1.5 text-xs font-semibold"
                  >
                    Add Keyword
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {editingPost.keywords?.map((k, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-sm bg-white border border-[#E8DFD5] text-[11px] text-[#5B4632] flex items-center gap-1"
                    >
                      <span>#{k}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingPost.keywords || []).filter((_, i) => i !== idx);
                          setEditingPost({ ...editingPost, keywords: updated });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block font-semibold mb-1">Author Name</label>
                  <input
                    type="text"
                    value={editingPost.author || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Est. Read Time (Minutes)</label>
                  <input
                    type="number"
                    value={editingPost.readTimeMinutes || 5}
                    onChange={(e) => setEditingPost({ ...editingPost, readTimeMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]"
                  />
                </div>

                <div className="pt-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-green-700">
                    <input
                      type="checkbox"
                      checked={editingPost.isPublished ?? true}
                      onChange={(e) => setEditingPost({ ...editingPost, isPublished: e.target.checked })}
                      className="w-4 h-4 rounded text-green-600"
                    />
                    <span>Publish Immediately</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8DFD5]">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-wood px-5 py-2">
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
