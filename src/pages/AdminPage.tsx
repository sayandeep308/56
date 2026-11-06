import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LogOut,
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
  ImageIcon,
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

/** Default admin password — overridable via Settings → saved in RTDB */
const DEFAULT_ADMIN_PASSWORD = 'admin123';

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
  const { isAdmin, loginWithPassword, logout } = useAuth();

  // ── Login form state ───────────────────────────────────────────────────
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Dashboard state ────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AdminTab>('enquiries');
  const [enquiriesList, setEnquiriesList] = useState<CustomerEnquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; msg: string; isError?: boolean }>({
    loading: false,
    msg: '',
  });

  // ── Editing state ──────────────────────────────────────────────────────
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);

  const getDefaultPassword = () =>
    (settings as any)?.adminPassword || DEFAULT_ADMIN_PASSWORD;

  const [settingsForm, setSettingsForm] = useState<SiteSettings & { adminPassword?: string }>(
    settings
      ? { ...(settings as any) }
      : {
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
          imgbbApiKey: '7bae973fc21e5a2cc665dbe3411995a4',
          defaultCurrency: 'Rs. ',
          welcomeMessage: 'Welcome to Satarupa Steel Enterprise.',
          adminPassword: 'admin123',
        }
  );

  const [newSubcategoryInput, setNewSubcategoryInput] = useState('');
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');

  // ── Sync settings form when prop changes ──────────────────────────────
  useEffect(() => {
    if (settings) setSettingsForm({ ...(settings as any) });
  }, [settings]);

  // ── Load enquiries when logged in ──────────────────────────────────────
  useEffect(() => {
    if (isAdmin) {
      loadEnquiries();
      const unsub = subscribeToEnquiries((items) => {
        setEnquiriesList(items);
        setLoadingEnquiries(false);
      });
      return () => unsub();
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

  // ── Password login handler ─────────────────────────────────────────────
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = getDefaultPassword();
    const success = loginWithPassword(enteredPassword.trim(), correct);
    if (!success) {
      setPasswordError('Incorrect password. Please try again.');
    } else {
      setPasswordError('');
    }
  };

  // ── Image upload helper ────────────────────────────────────────────────
  const handleTieredImageUpload = async (file: File, onSuccess: (url: string) => void) => {
    setUploadingImage(true);
    setUploadProgressMsg('Uploading to ImgBB...');
    try {
      const result = await uploadImageWithTieredFallback(file, settingsForm);
      onSuccess(result.url);
      setUploadProgressMsg(result.message);
      setTimeout(() => setUploadProgressMsg(''), 4000);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      alert(`Upload error: ${err.message || 'Failed to process image'}`);
      setUploadProgressMsg('');
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Seed all data ──────────────────────────────────────────────────────
  const handleSeedAllToFirestore = async () => {
    if (!confirm('This will seed all core categories, products, slides, blogs, and settings into Firebase Realtime Database. Proceed?')) return;
    setSyncStatus({ loading: true, msg: 'Syncing initial data to Realtime Database...' });
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

  // ── Hero slide actions ─────────────────────────────────────────────────
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
    } catch (err: any) {
      alert(`Save slide notice: ${err.message}`);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm('Delete this hero slide?')) return;
    try {
      await deleteHeroSlide(id);
      await onRefreshAllData();
    } catch (err: any) {
      alert(`Delete notice: ${err.message}`);
    }
  };

  // ── Category actions ───────────────────────────────────────────────────
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) { alert('Please provide a Category Name'); return; }
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
    } catch (err: any) {
      alert(`Save category notice: ${err.message}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      await onRefreshAllData();
    } catch (err: any) {
      alert(`Delete notice: ${err.message}`);
    }
  };

  // ── Product actions ────────────────────────────────────────────────────
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
      metaTitle: editingProduct.metaTitle || `${editingProduct.title} | Satarupa Steel`,
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
    } catch (err: any) {
      alert(`Save product notice: ${err?.message || 'Saved locally'}`);
      setEditingProduct(null);
      await onRefreshAllData();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      await deleteProduct(id);
      await onRefreshAllData();
    } catch (err: any) {
      alert(`Delete product notice: ${err.message}`);
    }
  };

  // ── Blog actions ───────────────────────────────────────────────────────
  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost?.title) { alert('Please provide Blog Title'); return; }
    const postSlug = editingPost.slug || slugify(editingPost.title);
    const payload: BlogPost = {
      id: editingPost.id || `blog-${Date.now()}`,
      title: editingPost.title,
      slug: postSlug,
      summary: editingPost.summary || '',
      content: editingPost.content || '',
      featuredImage: editingPost.featuredImage || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
      metaTitle: editingPost.metaTitle || `${editingPost.title} | Satarupa Journal`,
      metaDescription: editingPost.metaDescription || editingPost.summary || '',
      keywords: editingPost.keywords || [],
      isPublished: editingPost.isPublished ?? true,
      publishedAt: editingPost.publishedAt || new Date().toISOString().split('T')[0],
      author: editingPost.author || 'Satarupa Steel Enterprise',
      readTimeMinutes: Number(editingPost.readTimeMinutes) || 5,
    };
    try {
      await saveBlogPost(payload);
      await onRefreshAllData();
      setEditingPost(null);
      setNewKeywordInput('');
    } catch (err: any) {
      alert(`Save blog notice: ${err.message}`);
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await deleteBlogPost(id);
      await onRefreshAllData();
    } catch (err: any) {
      alert(`Delete blog notice: ${err.message}`);
    }
  };

  // ── Enquiry actions ────────────────────────────────────────────────────
  const handleUpdateStatus = async (id: string, status: CustomerEnquiry['status']) => {
    try {
      await updateEnquiryStatus(id, status);
      setEnquiriesList((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    } catch (err: any) {
      alert(`Status update notice: ${err.message}`);
    }
  };

  // ── Settings actions ───────────────────────────────────────────────────
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSiteSettings(settingsForm as SiteSettings);
      await onRefreshAllData();
      alert('Settings saved and synced to Realtime Database!');
    } catch (err: any) {
      alert(`Save settings notice: ${err.message}`);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // AUTH GATE — Password Login Screen
  // ═══════════════════════════════════════════════════════════════════════
  if (!isAdmin) {
    return (
      <div className="py-16 bg-[#FAF6F0] min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-3xl p-8 border border-[#E8DFD5] shadow-xl text-center space-y-6">
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
              Restricted Administration Area. Enter your password to manage the product catalog, categories, banners, and customer enquiries.
            </p>
          </div>

          {passwordError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordLogin} className="space-y-3 text-left">
            <label className="block text-xs font-bold text-[#2C221E] mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                placeholder="Enter administrator password..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] bg-[#FAF6F0]/40 text-sm text-[#2C221E] focus:outline-none focus:border-[#C8792C] pr-14"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full btn-gold-pill py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-[#241403]" />
              <span>Unlock Admin Portal</span>
            </button>
          </form>

          <div className="pt-2 border-t border-[#FAF6F0] text-center">
            <button
              onClick={() => onNavigate('/')}
              className="text-xs text-[#5B4632] hover:underline"
            >
              ← Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN ADMIN DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════
  const imgbbActive = !!(settingsForm.imgbbApiKey?.trim() || '7bae973fc21e5a2cc665dbe3411995a4');

  return (
    <div className="py-8 bg-[#FAF6F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ── Top Admin Bar ─────────────────────────────────────────── */}
        <div className="bg-[#5B4632] text-white rounded-2xl p-6 border border-[#F4D9A0]/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TilakLogo size="md" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#FAF6F0]">
                  Satarupa Steel Enterprise Administration
                </h1>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <CheckCircle className="w-3 h-3 text-emerald-200" />
                  <span>Admin Authenticated</span>
                </span>
              </div>
              <p className="text-xs text-[#F4D9A0]/80 mt-0.5">
                Madpur Station Bajar • Firebase Realtime Database Connected
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSeedAllToFirestore}
              disabled={syncStatus.loading}
              className="px-3.5 py-2.5 rounded-lg bg-[#463525] hover:bg-[#6B523B] border border-[#F4D9A0]/40 text-xs font-semibold text-[#F4D9A0] flex items-center gap-1.5 transition-colors shadow-sm"
              title="Populates all seed data into Realtime Database"
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
              onClick={logout}
              className="p-2.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Lock Admin Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ImgBB status pill */}
        {imgbbActive && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
            <ImageIcon className="w-4 h-4 text-blue-500" />
            <span>ImgBB Cloud Upload Active — all images upload to permanent HTTPS URLs</span>
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
            <button onClick={() => setSyncStatus({ loading: false, msg: '' })} className="text-gray-500 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Dashboard Navigation Tabs ─────────────────────────────── */}
        <div className="flex overflow-x-auto border-b border-[#E8DFD5] gap-2 pb-1 text-sm font-semibold">
          {[
            { id: 'enquiries', label: `Enquiries (${enquiriesList.length})`, icon: Inbox },
            { id: 'products', label: `Products (${products.length})`, icon: ShoppingBag },
            { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
            { id: 'slides', label: `Hero Slides (${slides.length})`, icon: Sliders },
            { id: 'blog', label: `Blog (${blogPosts.length})`, icon: BookOpen },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
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

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB: CUSTOMER ENQUIRIES INBOX                               */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'enquiries' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8DFD5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2C221E] flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-[#C8792C]" />
                  <span>Customer Enquiries Inbox</span>
                </h2>
                <p className="text-xs text-[#5A4E46] mt-0.5">
                  Real-time product inquiries with direct WhatsApp reply action.
                </p>
              </div>
              <button onClick={loadEnquiries} className="btn-wood text-xs px-4 py-2 flex items-center gap-1.5 self-start sm:self-auto">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingEnquiries ? 'animate-spin' : ''}`} />
                <span>Refresh Inbox</span>
              </button>
            </div>

            {loadingEnquiries ? (
              <div className="py-12 text-center text-xs text-[#5A4E46]">Loading enquiries...</div>
            ) : enquiriesList.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#5A4E46] border border-dashed border-[#E8DFD5] rounded-xl">
                No customer enquiries yet. Submit an inquiry from any product page to test!
              </div>
            ) : (
              <>
                {/* Mobile stacked cards */}
                <div className="sm:hidden space-y-3">
                  {enquiriesList.map((enq) => {
                    const cleanPhone = enq.phone.replace(/[^0-9]/g, '');
                    const replyMsg = `Hello ${enq.customerName}! Thank you for your inquiry regarding "${enq.productTitle || 'bespoke architectural furnishings'}" on Satarupa Enterprise.`;
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
                          <span className="font-semibold text-[#2C221E] block">{enq.productTitle || 'Custom Commission'}</span>
                          <p className="line-clamp-3 leading-relaxed">{enq.message}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-[#5A4E46]">
                            {new Date(enq.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <a href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(replyMsg)}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#25D366] text-white font-semibold text-xs min-h-[44px]">
                            <MessageCircle className="w-4 h-4" />
                            <span>Reply WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#E8DFD5] rounded-xl overflow-hidden min-w-[700px]">
                    <thead className="bg-[#FAF6F0] text-[#5B4632] uppercase tracking-wider font-semibold border-b border-[#E8DFD5]">
                      <tr>
                        <th className="p-3.5">Customer</th>
                        <th className="p-3.5">Product / Project</th>
                        <th className="p-3.5">Message</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">WhatsApp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DFD5]">
                      {enquiriesList.map((enq) => {
                        const cleanPhone = enq.phone.replace(/[^0-9]/g, '');
                        const replyMsg = `Hello ${enq.customerName}! Thank you for your inquiry regarding "${enq.productTitle || 'bespoke furnishings'}". How may we assist?`;
                        return (
                          <tr key={enq.id} className="hover:bg-[#FAF6F0]/50 transition-colors">
                            <td className="p-3.5 align-top">
                              <span className="font-bold text-[#2C221E] block">{enq.customerName}</span>
                              <span className="text-[#5B4632] block font-mono">{enq.phone}</span>
                              {enq.email && <span className="text-[#5A4E46] block">{enq.email}</span>}
                            </td>
                            <td className="p-3.5 align-top">
                              <span className="font-semibold text-[#2C221E] block">{enq.productTitle || 'Custom Commission'}</span>
                              <span className="text-[10px] text-[#C8792C] uppercase font-bold">{enq.type || 'Product'}</span>
                            </td>
                            <td className="p-3.5 align-top max-w-xs">
                              <p className="text-[#5A4E46] line-clamp-3 leading-relaxed">{enq.message}</p>
                            </td>
                            <td className="p-3.5 align-top text-[#5A4E46] whitespace-nowrap">
                              {new Date(enq.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="p-3.5 align-top">
                              <select
                                value={enq.status}
                                onChange={(e) => handleUpdateStatus(enq.id, e.target.value as any)}
                                className={`px-2 py-1 rounded-md text-xs font-semibold border ${
                                  enq.status === 'new' ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : enq.status === 'contacted' ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : 'bg-green-100 text-green-800 border-green-300'
                                }`}
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="closed">Closed</option>
                              </select>
                            </td>
                            <td className="p-3.5 align-top text-right">
                              <a href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(replyMsg)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-semibold text-xs hover:bg-[#20bd5a] transition-colors">
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

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB: PRODUCTS MANAGER                                       */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8DFD5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2C221E] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#C8792C]" />
                  <span>Showcase Product Catalog Manager</span>
                </h2>
                <p className="text-xs text-[#5A4E46]">Manage showcase designs, images, specifications, and Most Selling tags.</p>
              </div>
              <button
                onClick={() => setEditingProduct({
                  title: '', slug: '',
                  categoryId: categories[0]?.slug || 'interior',
                  categoryName: categories[0]?.name || 'Interior',
                  subcategory: categories[0]?.subcategories?.[0] || 'General',
                  shortDescription: '', description: '',
                  price: 45000, isPriceOnRequest: false, isMostSelling: false,
                  images: [],
                  specifications: [{ key: 'Material', value: 'Stainless Steel' }],
                })}
                className="btn-wood text-xs px-4 py-2.5 font-semibold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#F4D9A0]" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {products.map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl border border-[#E8DFD5] bg-[#FAF6F0]/40 flex items-center justify-between gap-3 shadow-xs">
                  <img src={p.images?.[0] || ''} alt={p.title} className="w-14 h-14 rounded-lg object-cover border border-[#E8DFD5] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-xs text-[#2C221E] block truncate">{p.title}</span>
                    <span className="text-[11px] text-[#C8792C] block truncate">{p.categoryName} • {p.subcategory}</span>
                    <span className="text-xs font-semibold text-[#2C221E] block mt-0.5">{formatPrice(p.price, p.isPriceOnRequest, settings?.defaultCurrency || 'Rs. ')}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditingProduct({ ...p })} className="p-2 rounded-lg bg-amber-50 text-[#C8792C] hover:bg-amber-100 min-w-[40px] min-h-[40px] flex items-center justify-center"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 min-w-[40px] min-h-[40px] flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#E8DFD5] rounded-xl overflow-hidden min-w-[680px]">
                <thead className="bg-[#FAF6F0] text-[#5B4632] uppercase tracking-wider font-semibold border-b border-[#E8DFD5]">
                  <tr>
                    <th className="p-3.5">Image & Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Bestseller</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFD5]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF6F0]/50">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0] || ''} alt={p.title} className="w-12 h-12 rounded-lg object-cover border border-[#E8DFD5] shrink-0" />
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
                      <td className="p-3.5 font-semibold text-[#2C221E]">{formatPrice(p.price, p.isPriceOnRequest, settings?.defaultCurrency || 'Rs. ')}</td>
                      <td className="p-3.5">
                        {p.isMostSelling ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C8792C] text-white text-[10px] font-bold">
                            <Flame className="w-3 h-3 fill-current" /> Most Selling
                          </span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => onNavigate(`/product/${p.slug}`)} className="p-1.5 rounded-md hover:bg-gray-100 text-[#5B4632]" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => setEditingProduct({ ...p })} className="p-1.5 rounded-md hover:bg-gray-100 text-blue-600" title="Edit"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB: CATEGORIES MANAGER                                     */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8DFD5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2C221E] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#C8792C]" />
                  <span>Category & Subcategory Architecture</span>
                </h2>
                <p className="text-xs text-[#5A4E46]">Preloaded with the 7 core categories. Create new ones or edit nested subcategories.</p>
              </div>
              <button
                onClick={() => setEditingCategory({ name: '', slug: '', description: '', imageUrl: '', displayOrder: categories.length + 1, subcategories: [] })}
                className="btn-wood text-xs px-4 py-2.5 font-semibold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#F4D9A0]" />
                <span>Create New Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="rounded-xl border border-[#E8DFD5] overflow-hidden bg-[#FAF6F0]/40 flex flex-col justify-between">
                  <div className="relative aspect-video bg-[#5B4632]">
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#5B4632]/85 text-[#F4D9A0] text-[10px] font-bold">Order #{cat.displayOrder}</div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#2C221E]">{cat.name}</h3>
                      <p className="text-xs text-[#5A4E46] line-clamp-2 mt-1">{cat.description}</p>
                      <div className="mt-3">
                        <span className="text-[10px] font-bold uppercase text-[#C8792C] block mb-1">Subcategories ({cat.subcategories?.length || 0}):</span>
                        <div className="flex flex-wrap gap-1">
                          {cat.subcategories?.map((sub) => (
                            <span key={sub} className="px-2 py-0.5 rounded-sm bg-white border border-[#E8DFD5] text-[10px] text-[#5B4632]">{sub}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-[#E8DFD5] flex items-center justify-between">
                      <button onClick={() => onNavigate(`/products?category=${cat.slug}`)} className="text-xs text-[#5B4632] hover:text-[#C8792C] font-semibold flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /><span>View Products</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingCategory({ ...cat })} className="p-1.5 rounded-md hover:bg-white text-blue-600"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 rounded-md hover:bg-white text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB: HERO SLIDER MANAGER                                    */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'slides' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8DFD5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2C221E] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#C8792C]" />
                  <span>Homepage Hero Banner Slides</span>
                </h2>
                <p className="text-xs text-[#5A4E46]">Configure title, subtitle, background image, CTA buttons, and display order.</p>
              </div>
              <button
                onClick={() => setEditingSlide({ title: '', subtitle: '', imageUrl: '', ctaText: 'Explore Collection', ctaLink: '/products', displayOrder: slides.length + 1, isActive: true })}
                className="btn-wood text-xs px-4 py-2.5 font-semibold flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#F4D9A0]" />
                <span>Add Hero Slide</span>
              </button>
            </div>

            <div className="space-y-4">
              {slides.map((slide) => (
                <div key={slide.id} className="rounded-xl border border-[#E8DFD5] p-4 flex flex-col md:flex-row items-center gap-5 bg-[#FAF6F0]/30">
                  <img src={slide.imageUrl} alt={slide.title} className="w-full md:w-48 h-28 rounded-lg object-cover border border-[#E8DFD5]" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#5B4632]">Order #{slide.displayOrder}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${slide.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {slide.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#2C221E]">{slide.title}</h3>
                    <p className="text-xs text-[#5A4E46] line-clamp-1">{slide.subtitle}</p>
                    <div className="text-[11px] text-[#C8792C] font-semibold">CTA: "{slide.ctaText}" → {slide.ctaLink}</div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button onClick={() => setEditingSlide({ ...slide })} className="btn-wood text-xs px-3 py-1.5">Edit</button>
                    <button onClick={() => handleDeleteSlide(slide.id)} className="p-2 rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB: SEO BLOG PUBLISHER                                     */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'blog' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8DFD5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2C221E] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#C8792C]" />
                  <span>SEO Craft Blog Publisher</span>
                </h2>
                <p className="text-xs text-[#5A4E46]">Write and publish SEO articles with custom slugs, keywords, and meta tags.</p>
              </div>
              <button
                onClick={() => setEditingPost({ title: '', slug: '', summary: '', content: '### Introduction\n\nWrite your article here...', featuredImage: '', metaTitle: '', metaDescription: '', keywords: ['steel', 'fabrication'], isPublished: true, publishedAt: new Date().toISOString().split('T')[0], author: 'Satarupa Steel Enterprise', readTimeMinutes: 5 })}
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
                    <th className="p-3.5">Title / Slug</th>
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
                            <span key={k} className="px-2 py-0.5 rounded-xs bg-[#FAF6F0] text-[10px] text-[#5B4632]">#{k}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${post.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => onNavigate(`/blog/${post.slug}`)} className="p-1.5 rounded-md hover:bg-gray-100 text-[#5B4632]" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => setEditingPost({ ...post })} className="p-1.5 rounded-md hover:bg-gray-100 text-blue-600" title="Edit"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteBlogPost(post.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB: SITE SETTINGS                                          */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DFD5] shadow-xs space-y-6 max-w-3xl">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#2C221E] flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-[#C8792C]" />
                <span>Site Settings & Image Upload Configuration</span>
              </h2>
              <p className="text-xs text-[#5A4E46] mt-0.5">
                Configure WhatsApp number, ImgBB cloud upload, and admin password. All settings are synced to Realtime Database.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">Business Name</label>
                  <input type="text" required value={settingsForm.businessName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] text-xs sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">WhatsApp Number <span className="text-red-500">*</span></label>
                  <input type="text" required value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="+919876543210"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] text-xs sm:text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">Phone Number</label>
                  <input type="text" value={settingsForm.phoneNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] text-xs sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C221E] mb-1">Contact Email</label>
                  <input type="email" value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] text-xs sm:text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C221E] mb-1">Physical Address</label>
                <textarea rows={2} value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] text-xs sm:text-sm" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C221E] mb-1">Google Maps URL</label>
                <input type="url" value={settingsForm.mapsUrl || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, mapsUrl: e.target.value })}
                  placeholder="https://share.google/..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] text-xs sm:text-sm" />
              </div>

              {/* ImgBB Config */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-xs text-blue-800 uppercase tracking-wide">ImgBB Cloud Image Upload (Primary)</span>
                  {settingsForm.imgbbApiKey && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">● Active</span>
                  )}
                </div>
                <p className="text-[11px] text-blue-700">
                  All uploaded images are posted to <code className="bg-white px-1 rounded">api.imgbb.com/1/upload</code> and stored as permanent HTTPS URLs in the Realtime Database.
                </p>
                <div>
                  <label className="block text-[11px] font-semibold text-[#2C221E] mb-1">ImgBB API Key</label>
                  <input type="text" value={(settingsForm as any).imgbbApiKey || '7bae973fc21e5a2cc665dbe3411995a4'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, imgbbApiKey: e.target.value } as any)}
                    placeholder="7bae973fc21e5a2cc665dbe3411995a4"
                    className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white text-xs font-mono" />
                  <span className="text-[10px] text-blue-600 mt-0.5 block">Get a free key at imgbb.com/account/api</span>
                </div>
              </div>

              {/* Cloudinary (optional secondary) */}
              <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#F4D9A0] space-y-3">
                <span className="font-bold text-xs text-[#5B4632] uppercase tracking-wide block">Cloudinary (Optional Secondary)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#2C221E] mb-1">Cloud Name</label>
                    <input type="text" value={settingsForm.cloudinaryCloudName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cloudinaryCloudName: e.target.value })}
                      placeholder="your_cloud_name"
                      className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] bg-white text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#2C221E] mb-1">Upload Preset</label>
                    <input type="text" value={settingsForm.cloudinaryUploadPreset}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cloudinaryUploadPreset: e.target.value })}
                      placeholder="ml_default"
                      className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] bg-white text-xs" />
                  </div>
                </div>
              </div>

              {/* Admin Password */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                <span className="font-bold text-xs text-amber-800 uppercase tracking-wide block">Admin Portal Password</span>
                <div>
                  <label className="block text-[11px] font-semibold text-[#2C221E] mb-1">Admin Password (saved in Realtime Database)</label>
                  <input type="text" value={(settingsForm as any).adminPassword || 'admin123'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, adminPassword: e.target.value } as any)}
                    placeholder="admin123"
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-xs font-mono" />
                  <span className="text-[10px] text-amber-700 mt-0.5 block">
                    After saving, use the new password on the login screen. Current session stays active.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-wood text-xs sm:text-sm px-6 py-3 font-semibold flex items-center gap-2">
                  <Save className="w-4 h-4 text-[#F4D9A0]" />
                  <span>Save All Settings to Realtime Database</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: HERO SLIDE EDIT / CREATE                              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingSlide(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl p-6 border border-[#F4D9A0] shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD5] mb-4">
              <h3 className="font-serif font-bold text-lg text-[#2C221E]">
                {editingSlide.id ? 'Edit Hero Banner Slide' : 'Create Hero Banner Slide'}
              </h3>
              <button onClick={() => setEditingSlide(null)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Slide Title *</label>
                <input type="text" required value={editingSlide.title || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Subtitle</label>
                <textarea rows={2} value={editingSlide.subtitle || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Background Image *</label>
                <input type="url" value={editingSlide.imageUrl || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, imageUrl: e.target.value })}
                  placeholder="https://... or upload below"
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-[11px] font-semibold cursor-pointer hover:bg-blue-100 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>{uploadingImage ? (uploadProgressMsg || 'Uploading to ImgBB...') : 'Upload to ImgBB'}</span>
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingImage}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTieredImageUpload(f, (url) => setEditingSlide({ ...editingSlide, imageUrl: url })); }} />
                  </label>
                  {uploadProgressMsg && <span className="text-[11px] text-blue-700 font-medium">{uploadProgressMsg}</span>}
                </div>
                {editingSlide.imageUrl && (
                  <img src={editingSlide.imageUrl} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-[#E8DFD5]" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">CTA Text</label>
                  <input type="text" value={editingSlide.ctaText || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">CTA Link</label>
                  <input type="text" value={editingSlide.ctaLink || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaLink: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Display Order</label>
                  <input type="number" value={editingSlide.displayOrder || 1}
                    onChange={(e) => setEditingSlide({ ...editingSlide, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
                </div>
                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                    <input type="checkbox" checked={editingSlide.isActive ?? true}
                      onChange={(e) => setEditingSlide({ ...editingSlide, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C8792C]" />
                    <span>Active on Homepage</span>
                  </label>
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8DFD5]">
                <button type="button" onClick={() => setEditingSlide(null)} className="px-4 py-2 rounded-lg border border-gray-300">Cancel</button>
                <button type="submit" className="btn-wood px-5 py-2">Save Slide</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: CATEGORY EDIT / CREATE                                */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingCategory(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl p-6 border border-[#F4D9A0] shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD5] mb-4">
              <h3 className="font-serif font-bold text-lg text-[#2C221E]">
                {editingCategory.id ? `Edit: ${editingCategory.name}` : 'Create New Category'}
              </h3>
              <button onClick={() => setEditingCategory(null)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Category Name *</label>
                <input type="text" required value={editingCategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditingCategory({ ...editingCategory, name, slug: editingCategory.id ? editingCategory.slug : slugify(name) });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
              </div>
              <div>
                <label className="block font-semibold mb-1">URL Slug</label>
                <input type="text" value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: slugify(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] font-mono text-[11px]" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea rows={2} value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Cover Image</label>
                <input type="url" value={editingCategory.imageUrl || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, imageUrl: e.target.value })}
                  placeholder="https://... or upload below"
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-[11px] font-semibold cursor-pointer hover:bg-blue-100">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>{uploadingImage ? (uploadProgressMsg || 'Uploading...') : 'Upload to ImgBB'}</span>
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingImage}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTieredImageUpload(f, (url) => setEditingCategory({ ...editingCategory, imageUrl: url })); }} />
                  </label>
                  {uploadProgressMsg && <span className="text-[11px] text-blue-700 font-medium">{uploadProgressMsg}</span>}
                </div>
                {editingCategory.imageUrl && (
                  <img src={editingCategory.imageUrl} alt="preview" className="mt-2 w-full h-28 object-cover rounded-lg border border-[#E8DFD5]" />
                )}
              </div>
              <div>
                <label className="block font-semibold mb-1">Display Order</label>
                <input type="number" value={editingCategory.displayOrder || 1}
                  onChange={(e) => setEditingCategory({ ...editingCategory, displayOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
              </div>

              {/* Subcategories */}
              <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD5] space-y-2">
                <span className="font-bold text-[#5B4632] block">Subcategories ({editingCategory.subcategories?.length || 0})</span>
                <div className="flex gap-2">
                  <input type="text" value={newSubcategoryInput} onChange={(e) => setNewSubcategoryInput(e.target.value)}
                    placeholder="Subcategory name..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#E8DFD5] bg-white text-xs" />
                  <button type="button" className="btn-wood px-3 py-1.5 text-xs font-semibold"
                    onClick={() => { if (newSubcategoryInput.trim()) { setEditingCategory({ ...editingCategory, subcategories: [...(editingCategory.subcategories || []), newSubcategoryInput.trim()] }); setNewSubcategoryInput(''); } }}>
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {editingCategory.subcategories?.map((sub, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-white border border-[#E8DFD5] text-xs flex items-center gap-1.5 text-[#5B4632]">
                      <span>{sub}</span>
                      <button type="button" onClick={() => setEditingCategory({ ...editingCategory, subcategories: (editingCategory.subcategories || []).filter((_, i) => i !== idx) })} className="text-red-500 hover:text-red-700">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8DFD5]">
                <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 rounded-lg border border-gray-300">Cancel</button>
                <button type="submit" className="btn-wood px-5 py-2">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: PRODUCT EDIT / CREATE                                 */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingProduct(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 border border-[#F4D9A0] shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD5] mb-4">
              <h3 className="font-serif font-bold text-lg text-[#2C221E]">
                {editingProduct.id ? `Edit: ${editingProduct.title}` : 'Add New Product'}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Product Title *</label>
                  <input type="text" required value={editingProduct.title || ''}
                    onChange={(e) => { const t = e.target.value; setEditingProduct({ ...editingProduct, title: t, slug: editingProduct.id ? editingProduct.slug : slugify(t) }); }}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">SEO URL Slug *</label>
                  <input type="text" required value={editingProduct.slug || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: slugify(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] font-mono text-[11px]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Category *</label>
                  <select value={editingProduct.categoryId || ''}
                    onChange={(e) => { const id = e.target.value; const m = categories.find((c) => c.id === id || c.slug === id); setEditingProduct({ ...editingProduct, categoryId: id, categoryName: m?.name || id, subcategory: m?.subcategories?.[0] || 'General' }); }}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]">
                    {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Subcategory</label>
                  {(() => {
                    const m = categories.find((c) => c.id === editingProduct.categoryId || c.slug === editingProduct.categoryId);
                    return (
                      <select value={editingProduct.subcategory || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]">
                        {(m?.subcategories || []).map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    );
                  })()}
                </div>
              </div>

              {/* Price */}
              <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD5] grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block font-semibold mb-1">Price (Rs. INR)</label>
                  <input type="number" disabled={editingProduct.isPriceOnRequest} value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] bg-white disabled:opacity-50" />
                </div>
                <div className="pt-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-[#5B4632]">
                    <input type="checkbox" checked={Boolean(editingProduct.isPriceOnRequest)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isPriceOnRequest: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C8792C]" />
                    <span>Price on Request</span>
                  </label>
                </div>
                <div className="pt-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-[#C8792C]">
                    <input type="checkbox" checked={Boolean(editingProduct.isMostSelling)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isMostSelling: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C8792C]" />
                    <Flame className="w-4 h-4 fill-current" />
                    <span>Most Selling</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Short Summary</label>
                <input type="text" value={editingProduct.shortDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Full Description</label>
                <textarea rows={4} value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
              </div>

              {/* Images */}
              <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD5] space-y-2">
                <span className="font-bold text-[#5B4632] block">Product Images ({editingProduct.images?.length || 0})</span>
                <div className="flex gap-2">
                  <input type="url" value={newImageUrlInput} onChange={(e) => setNewImageUrlInput(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#E8DFD5] bg-white text-xs" />
                  <button type="button" className="btn-wood px-3 py-1.5 text-xs font-semibold"
                    onClick={() => { if (newImageUrlInput.trim()) { setEditingProduct({ ...editingProduct, images: [...(editingProduct.images || []), newImageUrlInput.trim()] }); setNewImageUrlInput(''); } }}>
                    Add URL
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-[11px] font-semibold cursor-pointer hover:bg-blue-100">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>{uploadingImage ? (uploadProgressMsg || 'Uploading...') : 'Upload to ImgBB'}</span>
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingImage}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTieredImageUpload(f, (url) => setEditingProduct({ ...editingProduct, images: [...(editingProduct.images || []), url] })); }} />
                  </label>
                  {uploadProgressMsg && <span className="text-[11px] text-blue-700 font-medium">{uploadProgressMsg}</span>}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {editingProduct.images?.map((img, idx) => (
                    <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-[#E8DFD5]">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, images: (editingProduct.images || []).filter((_, i) => i !== idx) })}
                        className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD5] space-y-2">
                <span className="font-bold text-[#5B4632] block">Technical Specifications ({editingProduct.specifications?.length || 0})</span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <input type="text" value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} placeholder="Spec (e.g. Material)" className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-[#E8DFD5] bg-white text-xs" />
                  <input type="text" value={newSpecVal} onChange={(e) => setNewSpecVal(e.target.value)} placeholder="Value (e.g. SS 304)" className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-[#E8DFD5] bg-white text-xs" />
                  <button type="button" className="btn-wood px-3 py-1.5 text-xs font-semibold"
                    onClick={() => { if (newSpecKey.trim() && newSpecVal.trim()) { setEditingProduct({ ...editingProduct, specifications: [...(editingProduct.specifications || []), { key: newSpecKey.trim(), value: newSpecVal.trim() }] }); setNewSpecKey(''); setNewSpecVal(''); } }}>
                    Add
                  </button>
                </div>
                <div className="space-y-1.5 pt-2">
                  {editingProduct.specifications?.map((spec: SpecificationItem, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E8DFD5] text-xs">
                      <span><strong className="text-[#5B4632]">{spec.key}:</strong> {spec.value}</span>
                      <button type="button" onClick={() => setEditingProduct({ ...editingProduct, specifications: (editingProduct.specifications || []).filter((_, i) => i !== idx) })} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">SEO Meta Title</label>
                  <input type="text" value={editingProduct.metaTitle || ''} onChange={(e) => setEditingProduct({ ...editingProduct, metaTitle: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">SEO Meta Description</label>
                  <input type="text" value={editingProduct.metaDescription || ''} onChange={(e) => setEditingProduct({ ...editingProduct, metaDescription: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8DFD5]">
                <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2 rounded-lg border border-gray-300">Cancel</button>
                <button type="submit" className="btn-wood px-5 py-2">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: BLOG EDIT / CREATE                                    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingPost(null)} />
          <div className="relative w-full max-w-3xl bg-white rounded-2xl p-6 border border-[#F4D9A0] shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD5] mb-4">
              <h3 className="font-serif font-bold text-lg text-[#2C221E]">
                {editingPost.id ? `Edit: ${editingPost.title}` : 'Compose New SEO Blog Post'}
              </h3>
              <button onClick={() => setEditingPost(null)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveBlogPost} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Article Title *</label>
                  <input type="text" required value={editingPost.title || ''}
                    onChange={(e) => { const t = e.target.value; setEditingPost({ ...editingPost, title: t, slug: editingPost.id ? editingPost.slug : slugify(t) }); }}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">SEO URL Slug *</label>
                  <input type="text" required value={editingPost.slug || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: slugify(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] font-mono text-[11px]" />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Summary / Lead</label>
                <textarea rows={2} value={editingPost.summary || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
              </div>

              <div>
                <label className="block font-semibold mb-1">Featured Image</label>
                <input type="url" value={editingPost.featuredImage || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, featuredImage: e.target.value })}
                  placeholder="https://... or upload below"
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-[11px] font-semibold cursor-pointer hover:bg-blue-100">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>{uploadingImage ? (uploadProgressMsg || 'Uploading...') : 'Upload to ImgBB'}</span>
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingImage}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTieredImageUpload(f, (url) => setEditingPost({ ...editingPost, featuredImage: url })); }} />
                  </label>
                  {uploadProgressMsg && <span className="text-[11px] text-blue-700 font-medium">{uploadProgressMsg}</span>}
                </div>
                {editingPost.featuredImage && (
                  <img src={editingPost.featuredImage} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-[#E8DFD5]" />
                )}
              </div>

              <div>
                <label className="block font-semibold mb-1">Article Content (Markdown) *</label>
                <textarea rows={8} required value={editingPost.content || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  placeholder="### Section Heading&#10;&#10;Write your article here..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5] font-mono text-xs" />
              </div>

              {/* Keywords */}
              <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DFD5] space-y-2">
                <span className="font-bold text-[#5B4632] block">SEO Keywords</span>
                <div className="flex gap-2">
                  <input type="text" value={newKeywordInput} onChange={(e) => setNewKeywordInput(e.target.value)}
                    placeholder="e.g. stainless steel, fabrication"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#E8DFD5] bg-white text-xs" />
                  <button type="button" className="btn-wood px-3 py-1.5 text-xs font-semibold"
                    onClick={() => { if (newKeywordInput.trim()) { setEditingPost({ ...editingPost, keywords: [...(editingPost.keywords || []), newKeywordInput.trim()] }); setNewKeywordInput(''); } }}>
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {editingPost.keywords?.map((k, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-sm bg-white border border-[#E8DFD5] text-[11px] text-[#5B4632] flex items-center gap-1">
                      <span>#{k}</span>
                      <button type="button" onClick={() => setEditingPost({ ...editingPost, keywords: (editingPost.keywords || []).filter((_, i) => i !== idx) })} className="text-red-500 hover:text-red-700">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block font-semibold mb-1">Author</label>
                  <input type="text" value={editingPost.author || ''} onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Read Time (min)</label>
                  <input type="number" value={editingPost.readTimeMinutes || 5} onChange={(e) => setEditingPost({ ...editingPost, readTimeMinutes: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-[#E8DFD5]" />
                </div>
                <div className="pt-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-green-700">
                    <input type="checkbox" checked={editingPost.isPublished ?? true} onChange={(e) => setEditingPost({ ...editingPost, isPublished: e.target.checked })} className="w-4 h-4 rounded text-green-600" />
                    <span>Publish Immediately</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8DFD5]">
                <button type="button" onClick={() => setEditingPost(null)} className="px-4 py-2 rounded-lg border border-gray-300">Cancel</button>
                <button type="submit" className="btn-wood px-5 py-2">Save Article</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
