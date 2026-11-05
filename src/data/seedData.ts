import { Category, Product, HeroSlide, BlogPost, SiteSettings } from '../types';

export const INITIAL_SITE_SETTINGS: SiteSettings = {
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
  welcomeMessage: 'Welcome to Satarupa Steel Enterprise. Inquire about stainless steel items, aluminium fabrications, bespoke interior woodwork, custom ceilings, and temples.',
};

export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    title: 'Architectural Woodcraft and Bespoke Living',
    subtitle: 'Handcrafted luxury interior furnishings, custom ceiling rafters, and bespoke artisanal sanctuaries tailored to your spaces.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Explore Collection',
    ctaLink: '/products',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'slide-2',
    title: 'Sacred Temples and Sculpted Puja Corners',
    subtitle: 'Reverent handcarved teakwood, brass inlay mandirs, and backlit jali architecture built with devotional mastery.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Discover Mandirs',
    ctaLink: '/products?category=puja-corner',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'slide-3',
    title: 'Precision Metalwork and Stainless Steel Accents',
    subtitle: 'PVD rose gold partitions, laser-crafted designer railings, and architectural aluminium spatial systems.',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'View Metal Craft',
    ctaLink: '/products?category=stainless-steel-items',
    displayOrder: 3,
    isActive: true,
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'interior',
    name: 'Interior',
    slug: 'interior',
    description: 'Bespoke residential & executive architectural interiors, decorative acoustic wall paneling, and curated spaces.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    displayOrder: 1,
    subcategories: ['Living Room Paneling', 'Bedroom Spatial Styling', 'Architectural Mouldings', 'Luxury Foyer Consoles'],
  },
  {
    id: 'furniture-and-furnishings',
    name: 'Furniture and Furnishings',
    slug: 'furniture-and-furnishings',
    description: 'Masterfully built solid teakwood sofas, heirloom dining sets, upholstered armchairs, and credenzas.',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    displayOrder: 2,
    subcategories: ['Solid Wood Sofas', 'Luxury Dining Sets', 'Handcrafted Consoles', 'Custom Wardrobes'],
  },
  {
    id: 'stainless-steel-items',
    name: 'Stainless Steel Items',
    slug: 'stainless-steel-items',
    description: 'High-grade SS 304/316 laser-cut decorative railings, PVD titanium gold privacy screens, and modular fixtures.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    displayOrder: 3,
    subcategories: ['SS Decorative Railings', 'PVD Gold Partitions', 'Designer Architectural Gates', 'Modular Kitchen SS Fittings'],
  },
  {
    id: 'aluminium-items',
    name: 'Aluminium Items',
    slug: 'aluminium-items',
    description: 'Slimline thermal-break glazed partitions, architectural aluminium pergolas, and facade louvers.',
    imageUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
    displayOrder: 4,
    subcategories: ['Slimline Glazed Partitions', 'Aluminium Pergolas', 'Sliding Window Profiles', 'Architectural Louvers'],
  },
  {
    id: 'puja-corner',
    name: 'Puja Corner',
    slug: 'puja-corner',
    description: 'Devotional temple sanctuaries crafted in seasoned teak, marble inlays, brass bells, and warm ambient backlighting.',
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    displayOrder: 5,
    subcategories: ['Carved Teak Mandirs', 'Brass Inlay Devalayas', 'Laser Cut Backlit Mandir', 'Wall Mounted Shrines'],
  },
  {
    id: 'ceiling-customisation',
    name: 'Ceiling Customisation',
    slug: 'ceiling-customisation',
    description: 'Statement wooden rafter ceilings, CNC coffered panels, indirect cove lighting, and acoustic wooden grids.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    displayOrder: 6,
    subcategories: ['Wooden Rafter Ceilings', 'CNC Cut Coffered Panels', 'Cove Lighting Profiles', 'Acoustic Ceiling Clouds'],
  },
  {
    id: 'wooden-items',
    name: 'Wooden Items',
    slug: 'wooden-items',
    description: 'Exquisite handcarved jali screens, natural live-edge tables, artisanal wall clocks, and sculpted accents.',
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
    displayOrder: 7,
    subcategories: ['Handcarved Jaali Screens', 'Live Edge Dining Tables', 'Custom Wooden Artefacts', 'Artisanal Wall Clocks'],
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Puja Corner (Most Selling)
  {
    id: 'prod-mandir-heritage',
    title: 'Royal Teakwood Heritage Mandir with Brass Inlay',
    slug: 'royal-teakwood-heritage-mandir',
    categoryId: 'puja-corner',
    categoryName: 'Puja Corner',
    subcategory: 'Carved Teak Mandirs',
    shortDescription: 'Grand Burma Teak shrine featuring hand-carved pillars, floral gopuram, solid brass bells, and pull-out prasad tray.',
    description: 'The Royal Teakwood Heritage Mandir is hand-sculpted by master artisans from sustainably seasoned Burma teakwood. Featuring traditional shikhar architecture, intricately fluted pillars, and embedded brass bells that resonate with devotion. Includes two soft-close storage drawers for pooja samagri, a concealed LED ambient cove system, and a brass-inlaid pull-out prasad platform.',
    price: 88500,
    isPriceOnRequest: false,
    isMostSelling: true,
    images: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: [
      { key: 'Primary Material', value: '100% Grade-A Seasoned Burma Teak Wood' },
      { key: 'Dimensions', value: '48" W x 24" D x 66" H (Customizable)' },
      { key: 'Finish', value: 'Hand-Rubbed Natural Walnut PU Satin' },
      { key: 'Lighting', value: 'Concealed 3000K Warm Glow Waterproof LED Cove' },
      { key: 'Hardware', value: 'Antique Brass Drawer Pulls & Heavy-Duty Telescopic Runners' },
      { key: 'Customization', value: 'Full height, drawer configuration & wood tones available' },
    ],
    metaTitle: 'Royal Teakwood Heritage Mandir with Brass Inlay | ArtisanCraft',
    metaDescription: 'Shop our luxury Burma teakwood mandir with hand-carved pillars, ambient warm lighting, and traditional brass bells. Customizable.',
    featured: true,
  },
  // 2. Puja Corner
  {
    id: 'prod-mandir-backlit',
    title: 'Aura Backlit Laser-Cut Modern Mandir',
    slug: 'aura-backlit-laser-cut-modern-mandir',
    categoryId: 'puja-corner',
    categoryName: 'Puja Corner',
    subcategory: 'Laser Cut Backlit Mandir',
    shortDescription: 'Contemporary minimalist shrine with Corian sacred geometric backlighting and warm natural ash wood frame.',
    description: 'Designed for luxury urban apartments, the Aura Backlit Mandir merges ancient spiritual geometry with sleek architectural minimalism. The illuminated back panel features an Om and Gayatri mantra motif precision-machined in white stone Corian, bordered by warm natural ash wood cabinetry.',
    price: 52000,
    isPriceOnRequest: false,
    isMostSelling: true,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: [
      { key: 'Materials', value: 'Natural White Ash & DuPont Corian Solid Surface' },
      { key: 'Dimensions', value: '36" W x 18" D x 54" H' },
      { key: 'Backlighting', value: 'Dimmable Warm White LED Sheet (50,000h rating)' },
      { key: 'Mounting', value: 'Wall-Mounted or Floor-Standing with Concealed Brackets' },
    ],
    metaTitle: 'Aura Modern Backlit Mandir | ArtisanCraft',
    metaDescription: 'Modern minimalist home temple with laser-cut illuminated sacred motifs and premium natural ash woodwork.',
    featured: true,
  },
  // 3. Furniture and Furnishings (Most Selling)
  {
    id: 'prod-dining-liveedge',
    title: 'Artesia 8-Seater Live Edge Solid Rosewood Dining Set',
    slug: 'artesia-live-edge-rosewood-dining-set',
    categoryId: 'furniture-and-furnishings',
    categoryName: 'Furniture and Furnishings',
    subcategory: 'Luxury Dining Sets',
    shortDescription: 'Monumental single-slab Sheesham table with brass butterfly bowties and 8 hand-stitched leatherette dining chairs.',
    description: 'Each Artesia table is uniquely shaped by nature, using a continuous 3-inch thick live edge natural wood slab kiln-dried for longevity. Inlaid with polished brass bowties that celebrate organic grain patterns. Paired with 8 ergonomic dining chairs upholstered in stain-resistant cognac leatherette.',
    price: 145000,
    isPriceOnRequest: false,
    isMostSelling: true,
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: [
      { key: 'Tabletop', value: 'Single-Slab Kiln-Dried Solid Rosewood (3" Thickness)' },
      { key: 'Base', value: 'Matte Charcoal Powder-Coated Architectural Steel Spider Base' },
      { key: 'Seating', value: '8 Armless Ergonomic Sculpted Chairs' },
      { key: 'Sealer', value: 'Food-Safe Scratch-Resistant Hardwax Oil Finish' },
    ],
    metaTitle: 'Live Edge Rosewood Dining Table Set | ArtisanCraft',
    metaDescription: 'Handcrafted 8-seater live edge rosewood dining table with architectural steel base and brass butterfly joints.',
    featured: true,
  },
  // 4. Furniture and Furnishings
  {
    id: 'prod-sofa-chesterfield',
    title: 'Montclair Solid Teak & Caramel Velvet Sectional',
    slug: 'montclair-solid-teak-velvet-sectional',
    categoryId: 'furniture-and-furnishings',
    categoryName: 'Furniture and Furnishings',
    subcategory: 'Solid Wood Sofas',
    shortDescription: 'Deep-seat luxury L-shaped sectional sofa with exposed teakwood plinth and high-resilience memory down cushions.',
    description: 'A benchmark in hospitality-grade residential luxury. Built upon an exposed fluted teak plinth with champagne gold leg sleeves. The plush cushions combine 40-density HR foam with micro-fibre wrap for cloud-like support that never sags.',
    price: 168000,
    isPriceOnRequest: false,
    isMostSelling: false,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: [
      { key: 'Frame', value: '100% Solid Teak Internal & External Framework' },
      { key: 'Fabric', value: 'Water-Repellent Velvet in Caramel Spice' },
      { key: 'Configuration', value: 'Reversible Left / Right Corner Sectional' },
      { key: 'Warranty', value: '10-Year Structural Frame Guarantee' },
    ],
    metaTitle: 'Montclair Teak Plinth Velvet Sectional Sofa | ArtisanCraft',
    metaDescription: 'Order luxury solid teak framed sectional sofa in velvet fabric with champagne gold metal accents.',
  },
  // 5. Stainless Steel Items (Most Selling)
  {
    id: 'prod-ss-fluted-pvd',
    title: 'Titanium Rose Gold PVD Fluted Room Divider',
    slug: 'titanium-rose-gold-pvd-fluted-room-divider',
    categoryId: 'stainless-steel-items',
    categoryName: 'Stainless Steel Items',
    subcategory: 'PVD Gold Partitions',
    shortDescription: 'Grade 304 SS floor-to-ceiling architectural screen with vertical fluted fins and mirror champagne gold finish.',
    description: 'Elevate open-plan spaces with architectural grandeur. This bespoke partition is fabricated using heavy-gauge grade 304 stainless steel tubing treated with physical vapor deposition (PVD) titanium coating that is scratch-proof and corrosion-resistant. Offers elegant spatial delineation while allowing light to cascade through.',
    price: 92000,
    isPriceOnRequest: false,
    isMostSelling: true,
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: [
      { key: 'Steel Grade', value: 'SS 304 Austenitic Heavy Gauge (1.5mm wall)' },
      { key: 'Coating', value: 'Multi-Arc PVD Titanium Ion Plating (Rose Gold / Champagne Gold)' },
      { key: 'Dimensions', value: 'Custom engineered per ceiling height (Up to 12 Feet)' },
      { key: 'Installation', value: 'Concealed Floor & Ceiling Anchor Bolt System' },
    ],
    metaTitle: 'Rose Gold PVD SS Fluted Room Divider | ArtisanCraft',
    metaDescription: 'Custom SS 304 titanium PVD gold fluted partitions and luxury screens for living rooms and luxury lobbies.',
    featured: true,
  },
  // 6. Stainless Steel Items
  {
    id: 'prod-ss-balustrade-glass',
    title: 'Aero-Line Seamless SS 316 Glass Balustrade System',
    slug: 'aeroline-ss316-glass-balustrade',
    categoryId: 'stainless-steel-items',
    categoryName: 'Stainless Steel Items',
    subcategory: 'SS Decorative Railings',
    shortDescription: 'Frameless toughened laminated glass with satin-brushed marine grade SS 316 shoe base and slimline top rail.',
    description: 'Engineered for luxury staircases, mezzanines, and seaside balconies. Incorporates 15mm PVB laminated safety glass clamped seamlessly in a structural base profile, capped by a tactile wooden or stainless steel handrail.',
    price: 0,
    isPriceOnRequest: true,
    isMostSelling: false,
    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: [
      { key: 'Alloy', value: 'Marine-Grade SS 316 Satin Brushed / Mirror' },
      { key: 'Glass Specs', value: '15.52mm Toughened SentryGlass Laminated' },
      { key: 'Load Rating', value: 'Compliant with International 1.5kN/m impact standards' },
      { key: 'Pricing', value: 'Per running foot calculated based on site layout' },
    ],
    metaTitle: 'Marine Grade SS 316 Glass Railing System | ArtisanCraft',
    metaDescription: 'Frameless glass staircase and balcony railing systems with grade SS 316 fittings and slimline profiles.',
  },
  // 7. Ceiling Customisation (Most Selling)
  {
    id: 'prod-ceiling-teakrafter',
    title: 'Sculpted Solid Teak Rafter Ceiling with Integrated Magnetic Track Lighting',
    slug: 'sculpted-teak-rafter-ceiling-track-light',
    categoryId: 'ceiling-customisation',
    categoryName: 'Ceiling Customisation',
    subcategory: 'Wooden Rafter Ceilings',
    shortDescription: 'Architectural fluted wood beams spanning living & dining spaces with recessed flush-mounted LED downlights.',
    description: 'Transform mundane flat gypsum ceilings into an architectural showpiece. Crafted from finger-jointed seasoned teakwood rafters suspended on precision aluminium channels. Channels feature integrated 48V magnetic track rails supporting movable spot and linear ambient luminaires.',
    price: 110000,
    isPriceOnRequest: false,
    isMostSelling: true,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: [
      { key: 'Wood Species', value: 'Kiln-Dried African / Burma Teak Wood' },
      { key: 'Rafter Dimensions', value: '50mm W x 100mm D spaced at custom intervals' },
      { key: 'Lighting System', value: 'Integrated 48V Low-Voltage Magnetic Slim Track' },
      { key: 'Acoustic Rating', value: 'Reduces room flutter echo by up to 35%' },
    ],
    metaTitle: 'Teak Wooden Rafter Ceiling System | ArtisanCraft',
    metaDescription: 'Custom architectural wooden ceiling rafters with integrated flush magnetic track lighting systems.',
    featured: true,
  },
  // 8. Ceiling Customisation
  {
    id: 'prod-ceiling-coffered',
    title: 'Baroque Meets Modern Geometric CNC Coffered Ceiling Paneling',
    slug: 'geometric-cnc-coffered-ceiling-paneling',
    categoryId: 'ceiling-customisation',
    categoryName: 'Ceiling Customisation',
    subcategory: 'CNC Cut Coffered Panels',
    shortDescription: 'Multi-tiered recessed modular ceiling tiles with Champagne Gold border inlays and ambient cove lighting.',
    description: 'Adds monumental depth and neoclassical elegance to dining rooms, penthouses, and home theatres. Built in precision CNC-carved moisture-resistant MDF or high-density veneer with gold foil highlights.',
    price: 0,
    isPriceOnRequest: true,
    isMostSelling: false,
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: [
      { key: 'Substrate', value: 'High-Density Moisture-Resistant HDHMR with Natural Teak Veneer' },
      { key: 'Grid Size', value: '24" x 24" or 36" x 36" Modular Units' },
      { key: 'Lighting', value: 'Concealed Perimeter Dual-CCT Indirect Glow' },
    ],
    metaTitle: 'CNC Coffered Luxury Ceiling Panels | ArtisanCraft',
    metaDescription: 'Geometric custom coffered ceiling panels with champagne gold accents and warm perimeter lighting.',
  },
  // 9. Aluminium Items (Most Selling)
  {
    id: 'prod-aluminium-slimline',
    title: 'AuraView Ultra-Slim Thermal Break Aluminium Sliding Partition',
    slug: 'auraview-slimline-aluminium-sliding-partition',
    categoryId: 'aluminium-items',
    categoryName: 'Aluminium Items',
    subcategory: 'Slimline Glazed Partitions',
    shortDescription: 'Barely-there 18mm sightline architectural aluminium profiles with European hardware and acoustic double glazing.',
    description: 'Designed for seamless transitions between indoor living rooms and outdoor verandas. The 18mm ultra-slim sightlines maximize panoramic views, while heavy-duty stainless steel bearing rollers allow effortless gliding with the push of a finger.',
    price: 135000,
    isPriceOnRequest: false,
    isMostSelling: true,
    images: [
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: [
      { key: 'Sightline Profile', value: '18mm Ultra-Slim Interlock' },
      { key: 'Alloy & Temper', value: 'Architectural Grade 6063-T6 Extrusion' },
      { key: 'Finish', value: 'Qualicoat Class 2 Architectural Powder Coat (Anthracite / Bronze)' },
      { key: 'Glass', value: '24mm Double Glazed Argon Gas Filled Toughened Unit' },
    ],
    metaTitle: 'Ultra-Slim Aluminium Sliding Glass Doors | ArtisanCraft',
    metaDescription: 'Architectural 18mm sightline aluminium sliding door systems with high acoustic damping and thermal performance.',
    featured: true,
  },
  // 10. Aluminium Items
  {
    id: 'prod-aluminium-pergola',
    title: 'Automated Motorized Aluminium Louvered Pergola',
    slug: 'motorized-aluminium-louvered-pergola',
    categoryId: 'aluminium-items',
    categoryName: 'Aluminium Items',
    subcategory: 'Aluminium Pergolas',
    shortDescription: 'Weatherproof outdoor living pavilion with 140-degree rotating louvers, integrated rain sensors, and warm perimeter LEDs.',
    description: 'Engineered for luxury rooftop terraces, private villas, and garden courtyards. Louvers rotate smoothly via remote or smartphone app to regulate sunlight or seal completely against tropical rainstorms.',
    price: 0,
    isPriceOnRequest: true,
    isMostSelling: false,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: [
      { key: 'Extrusions', value: 'Heavy Duty Structural Aluminium (2.5mm wall)' },
      { key: 'Motor', value: 'Somfy Smart Automation System with Rain Sensor' },
      { key: 'Wind Resistance', value: 'Class 6 (Up to 120 km/h gusts)' },
      { key: 'Drainage', value: 'Internal concealed guttering inside structural uprights' },
    ],
    metaTitle: 'Motorized Aluminium Louvered Pergola | ArtisanCraft',
    metaDescription: 'Weatherproof automated architectural aluminium pergolas with remote rotation and integrated rain drainage.',
  },
  // 11. Wooden Items (Most Selling)
  {
    id: 'prod-wood-jaali-screen',
    title: 'Heirloom Handcarved Teakwood Moroccan Jaali Room Divider',
    slug: 'heirloom-handcarved-teak-jaali-divider',
    categoryId: 'wooden-items',
    categoryName: 'Wooden Items',
    subcategory: 'Handcarved Jaali Screens',
    shortDescription: 'Four-panel folding architectural screen carved with intricate geometric Arabesque filigree in seasoned teak.',
    description: 'A tribute to centuries of artisanal Indian woodcraft. Each perforated lattice panel is hand-chiselled with fine gouges from selected solid teak planks, then oil-rubbed by hand to bring out rich golden amber undertones. Functions as an evocative room divider, headboard, or backdrop.',
    price: 38000,
    isPriceOnRequest: false,
    isMostSelling: true,
    images: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: [
      { key: 'Material', value: 'Seasoned Natural Teakwood' },
      { key: 'Panels', value: '4 Folding Leaves (Total span: 80" W x 72" H)' },
      { key: 'Hinges', value: 'Heavy Duty Solid Cast Brass Double Action Hinges' },
      { key: 'Finish', value: 'Matte Danish Oil & Carnauba Wax Blend' },
    ],
    metaTitle: 'Handcarved Teak Jaali Partition Screen | ArtisanCraft',
    metaDescription: 'Authentic 4-panel hand-carved teakwood jaali room divider screen with Arabesque lattice motifs.',
    featured: true,
  },
  // 12. Wooden Items
  {
    id: 'prod-wood-liveedge-console',
    title: 'Organic Live Edge Burl Wood Entryway Console Table',
    slug: 'organic-live-edge-burl-wood-console',
    categoryId: 'wooden-items',
    categoryName: 'Wooden Items',
    subcategory: 'Live Edge Dining Tables',
    shortDescription: 'Exotic wild grain burl timber with smoked glass inlays and hand-hammered brass architectural legs.',
    description: 'A striking focal point for luxury foyers and gallery walls. Features deep natural fissures stabilized with clear resin and liquid brass fills, floating atop tapered hand-beaten brass hairpin legs.',
    price: 48000,
    isPriceOnRequest: false,
    isMostSelling: false,
    images: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: [
      { key: 'Wood', value: 'Single Wild Olive Wood / Padauk Burl Slab' },
      { key: 'Dimensions', value: '54" L x 16" D x 32" H' },
      { key: 'Legs', value: 'Hand-Hammered Antique Brass Coated Steel' },
    ],
    metaTitle: 'Live Edge Burl Wood Entryway Console Table | ArtisanCraft',
    metaDescription: 'Organic live edge solid timber console table with liquid brass inlay highlights and custom metal base.',
  },
  // 13. Interior (Most Selling)
  {
    id: 'prod-interior-fluted-wall',
    title: 'Fluted Acoustic Natural White Oak & Charcoal Felt Wall Paneling',
    slug: 'fluted-acoustic-white-oak-wall-paneling',
    categoryId: 'interior',
    categoryName: 'Interior',
    subcategory: 'Living Room Paneling',
    shortDescription: 'Pre-assembled architectural acoustic slat panels delivering warm Scandinavian minimalism and sound dampening.',
    description: 'Impart serene hotel-suite sophistication to master bedrooms, home theatres, and executive suites. Natural white oak veneer slats bonded to high-density recycled acoustic felt absorb flutter echoes while creating mesmerizing vertical rhythm.',
    price: 24000,
    isPriceOnRequest: false,
    isMostSelling: true,
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: [
      { key: 'Slat Material', value: 'Real White Oak Wood Veneer over MDF core' },
      { key: 'Backing', value: '9mm Recycled Sound Absorbing Acoustic Felt' },
      { key: 'Panel Size', value: '96" H x 24" W (Covers 16 sq. ft. per box)' },
      { key: 'Noise Reduction', value: 'NRC 0.85 when installed with air gap' },
    ],
    metaTitle: 'Fluted Acoustic White Oak Wall Slat Panels | ArtisanCraft',
    metaDescription: 'Architectural fluted wood wall panels with sound dampening acoustic backing for luxury living and media rooms.',
    featured: true,
  },
  // 14. Interior
  {
    id: 'prod-interior-moulding-suite',
    title: 'Neoclassical Wainsoting & Architectural Cornice Moulding Suite',
    slug: 'neoclassical-wainscoting-architectural-moulding',
    categoryId: 'interior',
    categoryName: 'Interior',
    subcategory: 'Architectural Mouldings',
    shortDescription: 'Precision-milled hardwood wall panelling, chair rails, baseboards, and stepped ceiling cornices.',
    description: 'Transform blank drywall into timeless Parisian elegance. Our custom moulding assemblies are computer-milled from seasoned hardwood or high-density polymer, primed and painted on-site in soft ivory tones with subtle champagne gold leaf trim.',
    price: 0,
    isPriceOnRequest: true,
    isMostSelling: false,
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
    ],
    specifications: [
      { key: 'Wood', value: 'Seasoned Canadian Maple / High Density Composite' },
      { key: 'Profile Height', value: 'Wainscot up to 42" height with 6" crown cornice' },
      { key: 'Customization', value: 'Bespoke grid layout designed to exact room dimensions' },
    ],
    metaTitle: 'Neoclassical Wall Wainscoting & Crown Mouldings | ArtisanCraft',
    metaDescription: 'Custom architectural hardwood wainscoting panels, chair rails, and ceiling cornice suites.',
  },
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-modern-puja-corner',
    title: 'How to Design a Sacred & Serene Modern Puja Corner in Your Home',
    slug: 'how-to-design-sacred-serene-modern-puja-corner',
    summary: 'A comprehensive interior design guide on Vastu orientation, choosing seasoned teakwood, ambient LED backlighting, and acoustic sanctity.',
    featuredImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    content: `
### The Sacred Axis: Crafting Devotion in Contemporary Homes

In contemporary architectural design, the **Puja Corner** (or home temple) has evolved from a closed utility room into the spiritual heart of the home. Blending timeless Vedic Vastu principles with modern minimalist interior sensibilities creates a tranquil sanctuary where mindfulness thrives.

#### 1. Ideal Vastu Orientation & Sacred Directions
According to sacred architecture, the northeast corner (**Ishanya**) is the ideal sector for placing your home mandir. When praying, your face should ideally orient toward the **East or North**. Ensure that the temple is placed in an elevated position—the deity idols should be at your heart level when seated in meditation.

#### 2. The Superiority of Burma Teakwood
When commissioning a permanent mandir, timber choice defines longevity:
- **Resilience against humidity:** Seasoned Burma teak (*Tectona grandis*) possesses natural oils that repel moisture, incense smoke, and termites.
- **Dimensional stability:** Unlike low-grade composite woods, solid teak does not swell or warp under oil lamp heat.
- **Acoustic resonance:** The wood produces a grounded, sacred tactile feel that enhances meditation.

#### 3. Ambient Backlighting & Architectural Jaali
Rather than harsh overhead spotlights, contemporary mandirs use **3000K warm diffused backlighting** behind intricate laser-cut jali or Corian stone panels. Incorporating sacred sacred geometry such as the Sri Yantra or floral mandala motifs casts serene silhouettes that calm the wandering mind.

#### 4. Prasad Platforms & Storage Architecture
A truly functional shrine requires intelligent concealment:
- Soft-close telescopic pull-out trays for aarti lamps and prasad offerings.
- Felt-lined drawers for puja bells, holy books, camphor, and agarbattis.
- Concealed wire management ensuring zero visible power adapters.

*Explore ArtisanCraft's bespoke collection of handcarved teak mandirs and backlit sanctuaries built to custom dimensions for your residence.*
    `,
    metaTitle: 'Modern Puja Corner Design Guide: Vastu & Teakwood | ArtisanCraft',
    metaDescription: 'Discover how to design a modern home mandir combining Vastu orientation, seasoned teakwood craft, and serene warm backlighting.',
    keywords: ['Puja corner design', 'modern home mandir', 'Vastu temple direction', 'teakwood pooja mandir', 'backlit jali mandir'],
    isPublished: true,
    publishedAt: '2026-03-15',
    author: 'Rajesh Sharma, Senior Architectural Craftsman',
    readTimeMinutes: 5,
  },
  {
    id: 'blog-solid-teak-vs-engineered-wood',
    title: 'Solid Teak Wood vs Engineered Wood: The Definitive Interior Buyer\'s Guide',
    slug: 'solid-teak-vs-engineered-wood-buyers-guide',
    summary: 'Analyze structural longevity, moisture tolerance, refinishing potential, and real-world resale value between heirloom solid timber and modern veneers.',
    featuredImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    content: `
### The Great Timber Dilemma: Heirloom vs Commodity

When investing in luxury furniture and architectural customisation, one question stands above all: **should you invest in solid seasoned teak wood, or opt for engineered alternatives?** Here is the unvarnished engineering breakdown.

#### 1. Tensile Strength and Structural Weight
- **Solid Teak:** Capable of supporting heavy continuous loads over decades without deflection. Mortise-and-tenon joinery expands and contracts uniformly with seasonal humidity.
- **Engineered Wood (MDF/Plywood):** While dense, moisture penetration can break the resin binder, causing irreversible delamination or bowing in long shelf spans.

#### 2. Restoration & Generational Value
A solid teak dining table or sofa frame can be sanded down, re-stained, and re-rubbed with natural PU or linseed oil every 10 to 15 years, looking pristine for well over a century. Engineered wood veneers, typically only 0.5mm to 1.5mm thick, cannot survive multiple deep sanding sessions.

#### 3. Where Engineered Wood Outperforms
There is one distinct domain where high-grade engineered substrate (such as moisture-resistant HDHMR) shines: **large flat wall paneling and seamless ceiling rafters**. Massive uninterrupted spans of solid timber are prone to natural expansion gaps; high-density engineered panels faced with natural timber veneers offer perfect millimeter precision across expansive architectural feature walls.

*At ArtisanCraft, our structural master-furniture is crafted from 100% seasoned teak, while expansive wall and ceiling paneling utilizes hybrid engineered timber with genuine hardwood veneers.*
    `,
    metaTitle: 'Solid Teak Wood vs Engineered Wood Furniture Guide | ArtisanCraft',
    metaDescription: 'Heirloom solid teak vs engineered wood furniture: compare longevity, water resistance, joinery, and long-term value.',
    keywords: ['teak wood vs engineered wood', 'solid wood furniture', 'furniture buying guide', 'heirloom dining tables'],
    isPublished: true,
    publishedAt: '2026-04-02',
    author: 'Sunil Patel, Master Joiner',
    readTimeMinutes: 6,
  },
  {
    id: 'blog-architectural-metalwork',
    title: 'Architectural Metalwork: Integrating Stainless Steel & Aluminium in Luxury Homes',
    slug: 'architectural-metalwork-stainless-steel-aluminium-luxury-homes',
    summary: 'Discover how PVD titanium gold stainless steel screens and ultra-slim aluminium glazed partitions create breathtaking spatial flow in open-plan villas.',
    featuredImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    content: `
### The Fusion of Warmth and Precision: Metal in Modern Interiors

In elite residential architecture, metal is no longer confined to concealed structural beams. Today, **PVD titanium stainless steel** and **thermal-break aluminium** serve as jewel-like design elements that interact magnificently with natural daylight.

#### 1. What is PVD Coating?
Physical Vapor Deposition (PVD) vaporizes titanium in a high-vacuum chamber, depositing a molecular bonded ceramic-metal layer over grade 304 stainless steel:
- **Tarnish-free:** Never oxidizes or tarnishes like raw brass.
- **Scratch resistance:** Superior hardness compared to electroplating or liquid paint.
- **Lustrous tones:** Available in Champagne Gold, Rose Gold, Titanium Black, and Brushed Antique Bronze.

#### 2. Spatial Dividers That Preserve Light
Instead of solid masonry partition walls that chop up floor plans, architectural fluted metal dividers allow natural sunlight to filter between formal living spaces and dining halls while maintaining acoustic and spatial intimacy.

#### 3. Slimline Aluminium Profiles
Aluminium delivers immense structural strength in featherweight cross-sections. In sliding partitions, profile sightlines as slim as **18mm** permit floor-to-ceiling glass expanses that frame exterior gardens like living landscape paintings.
    `,
    metaTitle: 'Stainless Steel & Aluminium in Luxury Interiors | ArtisanCraft',
    metaDescription: 'Explore titanium PVD gold stainless steel partitions and ultra-slim aluminium glass systems for modern residential interiors.',
    keywords: ['PVD stainless steel', 'rose gold partition', 'architectural aluminium', 'luxury room divider', 'metal interior screens'],
    isPublished: true,
    publishedAt: '2026-04-18',
    author: 'Elena Gomez, Architectural Metal Stylist',
    readTimeMinutes: 4,
  },
  {
    id: 'blog-ceiling-customisation-trends',
    title: 'Ceiling Customisation Trends: Transforming Plain Spaces with Wooden Rafters & Lighting',
    slug: 'ceiling-customisation-trends-wooden-rafters-lighting',
    summary: 'Stop ignoring your fifth wall. Learn how suspended teak rafters, coffered grids, and indirect warm LED coves transform room volume and acoustic comfort.',
    featuredImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    content: `
### Elevating the "Fifth Wall"

While homeowners obsess over floor rugs and wall paint, the ceiling—often called the **fifth wall**—remains plain white plasterboard in 90% of residences. Incorporating architectural ceiling woodwork creates immediate visual warmth, psychological grounding, and superior sound absorption.

#### 1. Floating Wooden Rafter Systems
Linear wooden beams running parallel across high ceilings draw the eye along the longitudinal axis of a room, creating an illusion of vast space. By leaving a 2-inch shadow gap above the rafters and embedding a concealed **48V low-voltage track lighting system**, you achieve both ambient illumination and focused art spotlighting without cluttering the ceiling surface.

#### 2. Coffered Geometries for Dining & Formal Salons
Coffered ceilings, featuring intersecting beam grids, evoke timeless classical grandeur. In modern designs, crisp champagne gold inner inlays paired with hidden LED perimeter coves create an ethereal floating effect during evening dinner parties.

#### 3. Acoustic Optimization
Hard polished marble or porcelain floors bounce audio signals, resulting in unpleasant reverberation during social gatherings. Wooden ceiling rafters and micro-perforated acoustic panels absorb high-frequency flutter echoes, making conversations warm and intelligible.
    `,
    metaTitle: 'Ceiling Customisation Trends: Wooden Rafters & Coves | ArtisanCraft',
    metaDescription: 'Discover the latest ceiling interior trends including suspended teak rafters, coffered panels, and indirect cove lighting systems.',
    keywords: ['wooden ceiling rafters', 'coffered ceiling design', 'fifth wall interior design', 'acoustic ceiling woodwork'],
    isPublished: true,
    publishedAt: '2026-05-01',
    author: 'Rajesh Sharma, Senior Architectural Craftsman',
    readTimeMinutes: 5,
  },
];
