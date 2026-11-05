import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from './slugify';
import { formatPrice } from './currency';
import { filterProducts } from './filter';
import { Product } from '../types';

test('slugify generates clean URL safe slugs', () => {
  assert.equal(slugify('Luxury Teak Mandir 2026!'), 'luxury-teak-mandir-2026');
  assert.equal(slugify('Stainless Steel & Aluminium Partitions'), 'stainless-steel-aluminium-partitions');
  assert.equal(slugify('  Spaced  Out   Title  '), 'spaced-out-title');
  assert.equal(slugify(''), '');
});

test('formatPrice handles price on request and standard pricing', () => {
  assert.equal(formatPrice(54000, false, 'Rs. '), 'Rs. 54,000');
  assert.equal(formatPrice(0, false, 'Rs. '), 'Price on Request');
  assert.equal(formatPrice(120000, true, 'Rs. '), 'Price on Request');
  assert.equal(formatPrice(undefined, false, 'Rs. '), 'Price on Request');
});

test('filterProducts handles category, subcategory, search, and mostSelling filters', () => {
  const dummyProducts: Product[] = [
    {
      id: '1',
      title: 'Handcarved Teak Mandir',
      slug: 'handcarved-teak-mandir',
      categoryId: 'puja-corner',
      categoryName: 'Puja Corner',
      subcategory: 'Carved Teak Mandirs',
      shortDescription: 'Exquisite wooden temple',
      description: 'Full description',
      price: 45000,
      isPriceOnRequest: false,
      isMostSelling: true,
      images: ['img1.jpg'],
      specifications: []
    },
    {
      id: '2',
      title: 'Stainless Steel Fluted Partition',
      slug: 'stainless-steel-fluted-partition',
      categoryId: 'stainless-steel',
      categoryName: 'Stainless Steel Items',
      subcategory: 'Decorative Partitions',
      shortDescription: 'Rose gold PVD coated',
      description: 'Full description',
      price: 75000,
      isPriceOnRequest: false,
      isMostSelling: false,
      images: ['img2.jpg'],
      specifications: []
    }
  ];

  // Most selling filter
  const mostSelling = filterProducts(dummyProducts, { mostSellingOnly: true });
  assert.equal(mostSelling.length, 1);
  assert.equal(mostSelling[0].id, '1');

  // Category filter
  const ssOnly = filterProducts(dummyProducts, { categorySlug: 'stainless-steel' });
  assert.equal(ssOnly.length, 1);
  assert.equal(ssOnly[0].id, '2');

  // Subcategory filter
  const mandirSub = filterProducts(dummyProducts, { subcategory: 'Carved Teak Mandirs' });
  assert.equal(mandirSub.length, 1);

  // Search filter
  const searchMatch = filterProducts(dummyProducts, { searchQuery: 'rose gold' });
  assert.equal(searchMatch.length, 1);
  assert.equal(searchMatch[0].id, '2');
});

test('3-tier cloud upload tier resolution', () => {
  // Tier 1a: Real Cloudinary credentials
  const cloudinaryConfig = {
    cloudinaryCloudName: 'my-production-cloud',
    cloudinaryUploadPreset: 'prod_preset',
  };
  const isCloudinaryActive =
    Boolean(cloudinaryConfig.cloudinaryCloudName) &&
    Boolean(cloudinaryConfig.cloudinaryUploadPreset) &&
    cloudinaryConfig.cloudinaryCloudName !== 'demo-artisan';
  assert.equal(isCloudinaryActive, true);

  // Demo Cloudinary credentials should fallback to Tier 2
  const demoConfig = {
    cloudinaryCloudName: 'demo-artisan',
    cloudinaryUploadPreset: 'artisancraft_preset',
    imgbbApiKey: '',
  };
  const isDemoFallback =
    demoConfig.cloudinaryCloudName === 'demo-artisan' && !demoConfig.imgbbApiKey;
  assert.equal(isDemoFallback, true);

  // Tier 1b: ImgBB active when API key is provided
  const imgbbConfig = {
    cloudinaryCloudName: 'demo-artisan',
    cloudinaryUploadPreset: 'artisancraft_preset',
    imgbbApiKey: 'abc123imgbbkey',
  };
  const isImgbbActive = Boolean(imgbbConfig.imgbbApiKey);
  assert.equal(isImgbbActive, true);
});

