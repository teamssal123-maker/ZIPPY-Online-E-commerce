import { Category, Product, StoreLocation, Coupon, Order } from '../types/index.ts';

export const CATEGORIES: Category[] = [
  {
    id: 'blazer',
    name: 'Blazer & Suits',
    slug: 'blazer',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
    description: 'Bespoke Italian wool, tailored slim jackets, double-breasted and dinner tuxedos.',
    itemCount: 14
  },
  {
    id: 'shirt',
    name: 'Executive Shirts',
    slug: 'shirt',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop',
    description: '100% Egyptian Giza cotton formal dress shirts, Oxford twills, and mandarin collars.',
    itemCount: 22
  },
  {
    id: 'polo',
    name: 'Luxury Polos',
    slug: 'polo',
    image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=80&w=1200&auto=format&fit=crop',
    description: 'Mercerized cotton, knit jacquards, tipped collar executive leisurewear.',
    itemCount: 18
  },
  {
    id: 'ethnic-wear',
    name: 'Ethnic & Festive',
    slug: 'ethnic-wear',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
    description: 'Royal embroidered silk jacquard panjabis, festive kabli sets, and velvet waistcoats.',
    itemCount: 16
  },
  {
    id: 'pant',
    name: 'Trousers & Chinos',
    slug: 'pant',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1200&auto=format&fit=crop',
    description: 'Tailored stretch wool trousers, smart flex chinos, and raw Japanese selvedge denim.',
    itemCount: 15
  },
  {
    id: 't-shirt',
    name: 'T-Shirts',
    slug: 't-shirt',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop',
    description: 'Supima & Pima heavyweight crewnecks and minimalist embroidered crest tees.',
    itemCount: 12
  },
  {
    id: 'accessories',
    name: 'Leather & Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1200&auto=format&fit=crop',
    description: 'Handcrafted full-grain leather oxfords, reversible belts, wallets, and silk ties.',
    itemCount: 19
  },
  {
    id: 'sale',
    name: 'Sale Collection',
    slug: 'sale',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
    description: 'Special seasonal privileges with up to 35% off on tailored classics.',
    itemCount: 11
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: 'Royal Navy Italian Wool Slim Blazer',
    slug: 'royal-navy-italian-wool-slim-blazer',
    sku: 'RM-BLZ-0921',
    styleCode: 'SS26-BZ-NVY',
    categoryId: 'blazer',
    categoryName: 'Blazer & Suits',
    price: 13500,
    salePrice: 11900,
    description: 'Hand-tailored from super 130s Italian wool, featuring soft shoulder construction, dual rear vents, horn buttons, and breathable cupro lining. An essential cornerstone for the distinguished modern gentleman.',
    shortDescription: 'Super 130s Italian virgin wool with soft shoulder structure.',
    fabric: '100% Italian Virgin Wool (Super 130s)',
    fit: 'Slim Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Navy Blue', hex: '#1B2A4A' },
      { name: 'Charcoal', hex: '#2C302E' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { S: 5, M: 8, L: 10, XL: 6, XXL: 3 },
    featured: true,
    newArrival: true,
    onSale: true,
    rating: 4.9,
    reviewCount: 34,
    careInstructions: ['Dry clean only by leather & suiting specialists', 'Steam press at low heat', 'Hang on contoured wooden hanger'],
    tags: ['blazer', 'wool', 'navy', 'formal', 'italian']
  },
  {
    id: 'prod-02',
    name: 'Charcoal Double-Breasted Herringbone Blazer',
    slug: 'charcoal-double-breasted-herringbone-blazer',
    sku: 'RM-BLZ-0944',
    styleCode: 'FW25-BZ-DBCH',
    categoryId: 'blazer',
    categoryName: 'Blazer & Suits',
    price: 15200,
    description: 'Impeccably cut 6x2 double-breasted jacket crafted with fine textured herringbone weave. High peak lapels and structured chest canvas provide unparalleled presence in the boardroom.',
    shortDescription: '6x2 Double-breasted with peak lapels and herringbone weave.',
    fabric: '90% Fine Wool, 10% Cashmere blend',
    fit: 'Tailored Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Charcoal Gray', hex: '#343434' },
      { name: 'Midnight', hex: '#141724' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    stock: { M: 4, L: 7, XL: 5, XXL: 2 },
    featured: true,
    newArrival: false,
    onSale: false,
    rating: 4.8,
    reviewCount: 22,
    careInstructions: ['Specialist dry clean only', 'Do not tumble dry'],
    tags: ['blazer', 'double-breasted', 'wool', 'herringbone']
  },
  {
    id: 'prod-03',
    name: 'Unstructured Sand Linen Summer Blazer',
    slug: 'unstructured-sand-linen-summer-blazer',
    sku: 'RM-BLZ-0883',
    styleCode: 'SS26-BZ-LIN',
    categoryId: 'blazer',
    categoryName: 'Blazer & Suits',
    price: 10500,
    salePrice: 8900,
    description: 'Crafted from pure Normandy linen with zero shoulder padding and quarter butterfly lining for effortless breathability during humid Dhaka summer evenings.',
    shortDescription: '100% Pure Normandy linen with quarter butterfly lining.',
    fabric: '100% Normandy Flax Linen',
    fit: 'Regular Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Sand Beige', hex: '#D2B48C' },
      { name: 'Sage Green', hex: '#687768' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 6, M: 9, L: 8, XL: 4 },
    featured: false,
    newArrival: true,
    onSale: true,
    rating: 4.7,
    reviewCount: 19,
    careInstructions: ['Dry clean or delicate cold hand wash', 'Iron inside out when slightly damp'],
    tags: ['blazer', 'linen', 'summer', 'casual']
  },
  {
    id: 'prod-04',
    name: 'Egyptian Giza 100s Royal Oxford Formal Shirt',
    slug: 'egyptian-giza-100s-royal-oxford-formal-shirt',
    sku: 'RM-SHT-1102',
    styleCode: 'SS26-SH-GZ100',
    categoryId: 'shirt',
    categoryName: 'Executive Shirts',
    price: 3650,
    description: 'Spun from genuine long-staple Egyptian Giza cotton yarns. Features semi-spread English collar, genuine mother-of-pearl buttons, and single needle tailoring for absolute comfort and pristine structure.',
    shortDescription: '100s two-ply long-staple Egyptian Giza cotton with English collar.',
    fabric: '100% Egyptian Giza Cotton (2-ply 100s)',
    fit: 'Slim Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Crisp White', hex: '#FFFFFF' },
      { name: 'Sky Blue', hex: '#87CEEB' },
      { name: 'Soft Pink', hex: '#FFB6C1' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { S: 12, M: 20, L: 25, XL: 15, XXL: 8 },
    featured: true,
    newArrival: true,
    onSale: false,
    rating: 4.9,
    reviewCount: 58,
    careInstructions: ['Machine wash warm 40°C', 'Warm iron while damp', 'Do not bleach'],
    tags: ['shirt', 'egyptian cotton', 'white', 'formal', 'oxford']
  },
  {
    id: 'prod-05',
    name: 'Sky Blue Herringbone Executive Shirt',
    slug: 'sky-blue-herringbone-executive-shirt',
    sku: 'RM-SHT-1138',
    styleCode: 'SS26-SH-HERBLU',
    categoryId: 'shirt',
    categoryName: 'Executive Shirts',
    price: 3450,
    salePrice: 2950,
    description: 'Subtle micro-herringbone weave lends luxurious sheen and drape. Specially treated with liquid ammonia finish for natural non-iron wrinkle resistance during long work days.',
    shortDescription: 'Wrinkle-resistant herringbone twill with cutaway collar.',
    fabric: '100% Fine Combed Cotton',
    fit: 'Tailored Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Sky Blue', hex: '#90CAF9' },
      { name: 'White', hex: '#FFFFFF' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    stock: { M: 14, L: 18, XL: 12, XXL: 6 },
    featured: true,
    newArrival: false,
    onSale: true,
    rating: 4.8,
    reviewCount: 41,
    careInstructions: ['Machine wash 30°C', 'Medium steam iron'],
    tags: ['shirt', 'herringbone', 'blue', 'wrinkle-free', 'executive']
  },
  {
    id: 'prod-06',
    name: 'Mandarin Collar Pure Irish Linen Shirt',
    slug: 'mandarin-collar-pure-irish-linen-shirt',
    sku: 'RM-SHT-1205',
    styleCode: 'SS26-SH-LINMAN',
    categoryId: 'shirt',
    categoryName: 'Executive Shirts',
    price: 3800,
    description: 'Airy, breathable pure Irish flax linen shirt with an impeccably structured band collar. Perfect when paired with our tailored chinos or linen shorts.',
    shortDescription: 'Pure Irish flax linen with clean mandarin band collar.',
    fabric: '100% Pure Irish Linen',
    fit: 'Regular Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Ivory Cream', hex: '#FDFBF7' },
      { name: 'Navy Blue', hex: '#1E293B' },
      { name: 'Olive Green', hex: '#556B2F' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { S: 7, M: 15, L: 14, XL: 9, XXL: 4 },
    featured: false,
    newArrival: true,
    onSale: false,
    rating: 4.9,
    reviewCount: 27,
    careInstructions: ['Gentle wash cycle', 'Line dry in shade', 'Warm iron'],
    tags: ['shirt', 'linen', 'mandarin', 'summer']
  },
  {
    id: 'prod-07',
    name: 'Mercerized Egyptian Cotton Luxury Polo',
    slug: 'mercerized-egyptian-cotton-luxury-polo',
    sku: 'RM-POL-2041',
    styleCode: 'SS26-PL-MRC',
    categoryId: 'polo',
    categoryName: 'Luxury Polos',
    price: 2750,
    description: 'Double-mercerized Egyptian cotton gives this polo a silk-like luster and drape that will never fade or pill. Finished with three genuine mother-of-pearl buttons and a stay-flat collar.',
    shortDescription: 'Double-mercerized silky finish cotton with stay-flat structured collar.',
    fabric: '100% Double-Mercerized Giza Cotton',
    fit: 'Slim Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Midnight Navy', hex: '#0B132B' },
      { name: 'Forest Green', hex: '#1C3122' },
      { name: 'Burgundy', hex: '#5C1D24' },
      { name: 'Jet Black', hex: '#111111' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { S: 10, M: 18, L: 20, XL: 12, XXL: 5 },
    featured: true,
    newArrival: true,
    onSale: false,
    rating: 4.9,
    reviewCount: 63,
    careInstructions: ['Cold machine wash', 'Wash inside out with similar colors', 'Do not tumble dry'],
    tags: ['polo', 'mercerized', 'luxury', 'navy']
  },
  {
    id: 'prod-08',
    name: 'Textured Knit Zip Placket Executive Polo',
    slug: 'textured-knit-zip-placket-executive-polo',
    sku: 'RM-POL-2089',
    styleCode: 'SS26-PL-ZIPKNT',
    categoryId: 'polo',
    categoryName: 'Luxury Polos',
    price: 3100,
    salePrice: 2650,
    description: 'A sophisticated contemporary knit polo featuring a gunmetal zip closure, ribbed cuffs and hem, and a micro-geometric birdseye knit pattern.',
    shortDescription: 'Fine-gauge knit with sleek gunmetal zipper closure.',
    fabric: '85% Pima Cotton, 15% Mulberry Silk',
    fit: 'Tailored Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Charcoal Taupe', hex: '#484441' },
      { name: 'Classic Navy', hex: '#1E2B3E' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    stock: { M: 11, L: 15, XL: 9, XXL: 4 },
    featured: false,
    newArrival: false,
    onSale: true,
    rating: 4.8,
    reviewCount: 30,
    careInstructions: ['Dry clean recommended or cold hand wash', 'Dry flat in shade'],
    tags: ['polo', 'knit', 'zip', 'silk-blend']
  },
  {
    id: 'prod-09',
    name: 'Royal Embroidered Silk Jacquard Panjabi',
    slug: 'royal-embroidered-silk-jacquard-panjabi',
    sku: 'RM-ETH-3011',
    styleCode: 'EID26-PJ-SLKEMB',
    categoryId: 'ethnic-wear',
    categoryName: 'Ethnic & Festive',
    price: 8900,
    salePrice: 7900,
    description: 'Exquisite Eid and wedding collection panjabi woven from pure silk jacquard. Features subtle tone-on-tone antique zari thread embroidery along the collar, placket, and cuffs with custom metal crest buttons.',
    shortDescription: 'Pure silk jacquard with hand-guided antique zari embroidery.',
    fabric: 'Pure Silk Jacquard with Cotton inner lining',
    fit: 'Regular Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Ivory Gold', hex: '#F5EFEB' },
      { name: 'Royal Emerald', hex: '#0B3B2B' },
      { name: 'Deep Midnight', hex: '#101524' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { S: 8, M: 16, L: 20, XL: 12, XXL: 6 },
    featured: true,
    newArrival: true,
    onSale: true,
    rating: 5.0,
    reviewCount: 47,
    careInstructions: ['Dry clean only', 'Do not spray perfume directly on embroidery'],
    tags: ['panjabi', 'ethnic', 'eid', 'silk', 'embroidery']
  },
  {
    id: 'prod-10',
    name: 'Platinum Heritage Kabli Suit with Waistcoat',
    slug: 'platinum-heritage-kabli-suit-with-waistcoat',
    sku: 'RM-ETH-3044',
    styleCode: 'EID26-KB-SET',
    categoryId: 'ethnic-wear',
    categoryName: 'Ethnic & Festive',
    price: 12500,
    description: 'A regal 3-piece ensemble consisting of an immaculate straight-cut kabli panjabi, matching churidar pajama, and an embroidered velvet contrast waistcoat.',
    shortDescription: 'Complete 3-piece kabli suit with structured velvet waistcoat.',
    fabric: 'Fine Cotton Viscose with Velvet Koti',
    fit: 'Tailored Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#1A1A1A' },
      { name: 'Deep Maroon', hex: '#4A0E17' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    stock: { M: 7, L: 12, XL: 8, XXL: 3 },
    featured: true,
    newArrival: true,
    onSale: false,
    rating: 4.9,
    reviewCount: 31,
    careInstructions: ['Dry clean only'],
    tags: ['kabli', 'ethnic', 'eid', 'waistcoat', 'koti']
  },
  {
    id: 'prod-11',
    name: 'Pure Fine Linen Minimalist Designer Panjabi',
    slug: 'pure-fine-linen-minimalist-designer-panjabi',
    sku: 'RM-ETH-3078',
    styleCode: 'SS26-PJ-LINMN',
    categoryId: 'ethnic-wear',
    categoryName: 'Ethnic & Festive',
    price: 6200,
    description: 'Designed for the modern gentleman who values understated luxury. 100% fine linen with subtle metallic loop buttons and clean minimalist neckline.',
    shortDescription: '100% breathable pure linen with minimalist stitch accents.',
    fabric: '100% Fine Irish Linen',
    fit: 'Regular Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Oatmeal White', hex: '#EBE6DD' },
      { name: 'Sky Ash', hex: '#B0B9C6' },
      { name: 'Dusty Mint', hex: '#9BB2A4' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { S: 9, M: 14, L: 16, XL: 10, XXL: 4 },
    featured: false,
    newArrival: true,
    onSale: false,
    rating: 4.8,
    reviewCount: 25,
    careInstructions: ['Gentle cold wash', 'Steam press inside out'],
    tags: ['panjabi', 'linen', 'minimalist', 'eid']
  },
  {
    id: 'prod-12',
    name: 'Tailored Stretch Wool Blend Formal Trousers',
    slug: 'tailored-stretch-wool-blend-formal-trousers',
    sku: 'RM-PNT-4015',
    styleCode: 'SS26-TR-WST',
    categoryId: 'pant',
    categoryName: 'Trousers & Chinos',
    price: 4200,
    description: 'Cut with a clean tapered leg, half lining, side adjusters, and a hint of elastane for all-day comfort during meetings and formal banquets.',
    shortDescription: 'Super 110s wool blend with side adjusters and tapered leg.',
    fabric: '70% Wool, 28% Polyester, 2% Elastane',
    fit: 'Tailored Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Charcoal Grey', hex: '#333333' },
      { name: 'Navy Blue', hex: '#18243B' },
      { name: 'Black', hex: '#111111' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { S: 8, M: 18, L: 22, XL: 14, XXL: 6 },
    featured: true,
    newArrival: false,
    onSale: false,
    rating: 4.8,
    reviewCount: 39,
    careInstructions: ['Dry clean recommended', 'Steam press'],
    tags: ['pant', 'trouser', 'formal', 'wool']
  },
  {
    id: 'prod-13',
    name: 'Signature Smart Flex Chino - Khaki',
    slug: 'signature-smart-flex-chino-khaki',
    sku: 'RM-PNT-4052',
    styleCode: 'SS26-CH-KHK',
    categoryId: 'pant',
    categoryName: 'Trousers & Chinos',
    price: 3200,
    salePrice: 2750,
    description: 'Woven from dense 280gsm combed cotton twill with peach finish. Features hidden interior phone pocket, reinforced pocket bags, and clean flat front.',
    shortDescription: 'Peached cotton twill with 4-way mechanical stretch.',
    fabric: '97% Combed Cotton, 3% Spandex',
    fit: 'Slim Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Classic Khaki', hex: '#C3B091' },
      { name: 'Olive Green', hex: '#556B2F' },
      { name: 'Navy', hex: '#1B2A4A' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { S: 14, M: 25, L: 30, XL: 18, XXL: 8 },
    featured: true,
    newArrival: true,
    onSale: true,
    rating: 4.9,
    reviewCount: 72,
    careInstructions: ['Machine wash cold 30°C', 'Wash inside out', 'Warm iron'],
    tags: ['chino', 'pant', 'khaki', 'stretch', 'casual']
  },
  {
    id: 'prod-14',
    name: '100% Pima Heavyweight Crewneck T-Shirt',
    slug: '100-pima-heavyweight-crewneck-t-shirt',
    sku: 'RM-TSH-5012',
    styleCode: 'SS26-TS-PIMA',
    categoryId: 't-shirt',
    categoryName: 'T-Shirts',
    price: 1650,
    description: 'Substantial 220 GSM Peruvian Pima cotton with bound ribbed collar that will never bacon or stretch out over time. Pre-shrunk for an enduring silhouette.',
    shortDescription: 'Heavyweight 220 GSM long-staple Pima cotton.',
    fabric: '100% Peruvian Pima Cotton',
    fit: 'Regular Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Pure White', hex: '#FFFFFF' },
      { name: 'Pitch Black', hex: '#111111' },
      { name: 'Heather Gray', hex: '#9E9E9E' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { S: 15, M: 30, L: 35, XL: 20, XXL: 10 },
    featured: false,
    newArrival: true,
    onSale: false,
    rating: 4.9,
    reviewCount: 45,
    careInstructions: ['Machine wash cold', 'Tumble dry low', 'Do not iron on prints'],
    tags: ['t-shirt', 'pima', 'crewneck', 'cotton']
  },
  {
    id: 'prod-15',
    name: 'Handcrafted Italian Full Grain Leather Oxfords',
    slug: 'handcrafted-italian-full-grain-leather-oxfords',
    sku: 'RM-ACC-6019',
    styleCode: 'SS26-SH-OXBRW',
    categoryId: 'accessories',
    categoryName: 'Leather & Accessories',
    price: 9800,
    salePrice: 8500,
    description: 'Artisanal closed-lacing Oxford shoes handcrafted from vegetable-tanned full-grain Tuscan calf leather. Goodyear welted leather sole with hand-burnished toe cap finish.',
    shortDescription: 'Goodyear welted Tuscan calf leather with burnished toe.',
    fabric: '100% Tuscan Calf Leather & Leather Sole',
    fit: 'Classic Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Cognac Brown', hex: '#8B4513' },
      { name: 'Onyx Black', hex: '#111111' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 3, M: 8, L: 9, XL: 4 },
    featured: true,
    newArrival: false,
    onSale: true,
    rating: 5.0,
    reviewCount: 38,
    careInstructions: ['Polish with beeswax shoe cream', 'Insert cedar shoe trees after every wear'],
    tags: ['shoes', 'oxford', 'leather', 'handcrafted']
  },
  {
    id: 'prod-16',
    name: 'Reversible Full-Grain Leather Formal Belt',
    slug: 'reversible-full-grain-leather-formal-belt',
    sku: 'RM-ACC-6041',
    styleCode: 'SS26-BLT-REV',
    categoryId: 'accessories',
    categoryName: 'Leather & Accessories',
    price: 2450,
    description: 'Versatile rotating brushed palladium buckle allows effortless transition between rich cognac brown and classic black leather. Beveled painted edges.',
    shortDescription: 'Dual-tone reversible calfskin with brushed palladium buckle.',
    fabric: '100% Full-Grain Cowhide Leather',
    fit: 'Classic Fit',
    gender: 'Men',
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Black / Cognac', hex: '#2A1B18' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    stock: { M: 15, L: 20, XL: 16, XXL: 8 },
    featured: false,
    newArrival: true,
    onSale: false,
    rating: 4.8,
    reviewCount: 52,
    careInstructions: ['Wipe clean with soft damp cloth', 'Condition periodically with leather balm'],
    tags: ['belt', 'leather', 'accessories', 'reversible']
  }
];

export const STORES: StoreLocation[] = [
  {
    id: 'store-gulshan',
    name: 'Zippy Flagship Atelier - Gulshan',
    city: 'Dhaka',
    area: 'Gulshan 1',
    address: 'Plot 14, Road 11, Gulshan Avenue, Dhaka 1212',
    phone: '+880 1711-234567',
    hours: '10:00 AM - 10:00 PM (Open 7 Days)',
    featured: true
  },
  {
    id: 'store-banani',
    name: 'Zippy Premium Boutique - Banani',
    city: 'Dhaka',
    area: 'Banani',
    address: 'House 54, Road 11, Block D, Banani, Dhaka 1213',
    phone: '+880 1711-234568',
    hours: '10:00 AM - 10:00 PM (Open 7 Days)',
    featured: true
  },
  {
    id: 'store-dhanmondi',
    name: 'Zippy Heritage Store - Dhanmondi',
    city: 'Dhaka',
    area: 'Dhanmondi',
    address: 'Shimanto Square, Level 2, Dhanmondi 27, Dhaka 1209',
    phone: '+880 1711-234569',
    hours: '10:00 AM - 09:30 PM (Closed Tuesday)',
    featured: true
  },
  {
    id: 'store-uttara',
    name: 'Zippy Executive Studio - Uttara',
    city: 'Dhaka',
    area: 'Uttara',
    address: 'Sector 3, Rabindra Sarani, Uttara, Dhaka 1230',
    phone: '+880 1711-234570',
    hours: '10:00 AM - 10:00 PM (Open 7 Days)',
    featured: false
  },
  {
    id: 'store-jamuna',
    name: 'Zippy Jamuna Future Park',
    city: 'Dhaka',
    area: 'Kuril',
    address: 'Shop GB-024, Ground Floor, Jamuna Future Park, Dhaka',
    phone: '+880 1711-234571',
    hours: '11:00 AM - 09:00 PM (Closed Wednesday)',
    featured: true
  },
  {
    id: 'store-chittagong',
    name: 'Zippy Chittagong Flagship',
    city: 'Chittagong',
    area: 'GEC Circle',
    address: 'Sanmar Ocean City, Level 3, GEC Circle, Nasirabad, Chittagong',
    phone: '+880 1711-234572',
    hours: '10:30 AM - 09:30 PM (Open 7 Days)',
    featured: true
  },
  {
    id: 'store-sylhet',
    name: 'Zippy Sylhet Boutique',
    city: 'Sylhet',
    area: 'Zindabazar',
    address: 'Al Hamra Shopping City, Level 2, Zindabazar, Sylhet',
    phone: '+880 1711-234573',
    hours: '10:00 AM - 09:30 PM (Open 7 Days)',
    featured: false
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'ZIPPY10',
    discountPercent: 10,
    minOrder: 2500,
    description: '10% off on all orders above ৳2,500',
    expiresAt: '2026-12-31'
  },
  {
    code: 'RICHMAN10',
    discountPercent: 10,
    minOrder: 2500,
    description: '10% off on all orders above ৳2,500 (Legacy)',
    expiresAt: '2026-12-31'
  },
  {
    code: 'EID2026',
    discountAmount: 500,
    minOrder: 4000,
    description: '৳500 flat discount on Eid Collections above ৳4,000',
    expiresAt: '2026-06-30'
  },
  {
    code: 'GENTLEMAN',
    discountPercent: 15,
    minOrder: 8000,
    description: '15% privilege discount on bespoke orders above ৳8,000',
    expiresAt: '2026-12-31'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'RM-2026-8942',
    orderNumber: 'RM-2026-8942',
    createdAt: '2026-09-22T14:30:00Z',
    items: [
      {
        id: 'item-1',
        productId: 'prod-01',
        product: INITIAL_PRODUCTS[0],
        size: 'L',
        color: { name: 'Navy Blue', hex: '#1B2A4A' },
        quantity: 1,
        price: 11900
      }
    ],
    subtotal: 11900,
    discount: 1190,
    shippingFee: 0,
    total: 10710,
    status: 'OUT_FOR_DELIVERY',
    paymentStatus: 'PAID',
    paymentMethod: 'BKASH',
    paymentId: 'TRX-BK7849310',
    customer: {
      fullName: 'Tahmidur Rahman',
      email: 'tahmid.rahman@example.com',
      phone: '+880 1712-345678',
      division: 'Dhaka',
      district: 'Dhaka City',
      address: 'House 18, Road 7, Sector 4, Uttara, Dhaka'
    },
    trackingHistory: [
      {
        status: 'PENDING',
        title: 'Order Placed',
        description: 'Customer order RM-2026-8942 placed successfully.',
        time: 'Sep 22, 02:30 PM',
        done: true
      },
      {
        status: 'CONFIRMED',
        title: 'Payment & Order Confirmed',
        description: 'bKash merchant payment verified.',
        time: 'Sep 22, 02:32 PM',
        done: true
      },
      {
        status: 'PROCESSING',
        title: 'Atelier Quality Inspection',
        description: 'Italian wool jacket inspected and packed in garment bag.',
        time: 'Sep 22, 05:45 PM',
        done: true
      },
      {
        status: 'SHIPPED',
        title: 'Handed Over to Courier',
        description: 'Dispatched via Pathao Express Courier.',
        time: 'Sep 23, 08:30 AM',
        done: true
      },
      {
        status: 'OUT_FOR_DELIVERY',
        title: 'Out for Delivery',
        description: 'Rider is on the way to Uttara Sector 4.',
        time: 'Sep 23, 10:15 AM',
        done: true,
        current: true
      },
      {
        status: 'DELIVERED',
        title: 'Delivered',
        description: 'Delivered with signature.',
        time: 'Estimated by 03:00 PM',
        done: false
      }
    ]
  },
  {
    id: 'RM-2026-7814',
    orderNumber: 'RM-2026-7814',
    createdAt: '2026-09-20T11:20:00Z',
    items: [
      {
        id: 'item-2',
        productId: 'prod-04',
        product: INITIAL_PRODUCTS[3],
        size: 'XL',
        color: { name: 'Crisp White', hex: '#FFFFFF' },
        quantity: 2,
        price: 3650
      },
      {
        id: 'item-3',
        productId: 'prod-07',
        product: INITIAL_PRODUCTS[6],
        size: 'XL',
        color: { name: 'Midnight Navy', hex: '#0B132B' },
        quantity: 1,
        price: 2750
      }
    ],
    subtotal: 10050,
    discount: 500,
    shippingFee: 0,
    total: 9550,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'SSLCOMMERZ',
    paymentId: 'SSL-TXN-99824',
    customer: {
      fullName: 'Kamran Hossain',
      email: 'kamran.h@example.com',
      phone: '+880 1819-456789',
      division: 'Dhaka',
      district: 'Dhaka City',
      address: 'Apartment 4B, Road 28, Gulshan 1, Dhaka'
    },
    trackingHistory: [
      {
        status: 'PENDING',
        title: 'Order Placed',
        description: 'Order registered in system.',
        time: 'Sep 20, 11:20 AM',
        done: true
      },
      {
        status: 'CONFIRMED',
        title: 'Payment Confirmed',
        description: 'Card payment processed.',
        time: 'Sep 20, 11:22 AM',
        done: true
      },
      {
        status: 'SHIPPED',
        title: 'Dispatched',
        description: 'Express dispatch from Gulshan Hub.',
        time: 'Sep 20, 04:00 PM',
        done: true
      },
      {
        status: 'DELIVERED',
        title: 'Delivered',
        description: 'Delivered to customer Kamran Hossain.',
        time: 'Sep 21, 01:45 PM',
        done: true,
        current: true
      }
    ]
  }
];

export const BANGLADESH_DIVISIONS = [
  'Dhaka',
  'Chittagong',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barisal',
  'Rangpur',
  'Mymensingh'
];

export const STORE_LOCATIONS: StoreLocation[] = [
  {
    id: 'store-gulshan',
    name: 'Gulshan 1 Flagship Atelier',
    city: 'Dhaka',
    address: 'House 14, Road 11, Gulshan 1, Dhaka-1212',
    phone: '+880 9612-742462',
    hours: '10:00 AM - 10:00 PM',
    mapUrl: 'https://maps.google.com/?q=Gulshan+1+Dhaka',
    services: [
      'Master Tailor Fitting',
      'VIP Styling Lounge',
      'Bespoke Suit Customization',
      'Complimentary Alterations'
    ]
  },
  {
    id: 'store-banani',
    name: 'Banani 11 Heritage Boutique',
    city: 'Dhaka',
    address: 'Plot 72, Road 11, Block D, Banani, Dhaka-1213',
    phone: '+880 1713-248901',
    hours: '10:00 AM - 10:00 PM',
    mapUrl: 'https://maps.google.com/?q=Banani+Road+11+Dhaka',
    services: ['Festive Panjabi Gallery', 'Executive Dress Shirts', 'Express Hemming']
  },
  {
    id: 'store-dhanmondi',
    name: 'Dhanmondi 27 Executive Store',
    city: 'Dhaka',
    address: 'Concord Royal Court, Road 27 (Old), Dhanmondi, Dhaka',
    phone: '+880 1713-248902',
    hours: '10:00 AM - 10:00 PM',
    mapUrl: 'https://maps.google.com/?q=Dhanmondi+27+Dhaka',
    services: ['Formalwear Consultations', 'Ready-to-wear Tuxedos', 'Size Exchange Hub']
  },
  {
    id: 'store-uttara',
    name: 'Uttara Sector 4 Boutique',
    city: 'Dhaka',
    address: 'House 22, Road 7, Sector 4, Uttara Model Town, Dhaka',
    phone: '+880 1713-248903',
    hours: '10:00 AM - 10:00 PM',
    mapUrl: 'https://maps.google.com/?q=Uttara+Sector+4+Dhaka',
    services: ['Complete Menswear Collection', 'Fast Express Pickup', 'Gift Wrapping']
  },
  {
    id: 'store-chittagong',
    name: 'Chittagong GEC Circle Flagship',
    city: 'Chittagong',
    address: 'Central Plaza, O.R. Nizam Road, GEC Circle, Chattogram',
    phone: '+880 1713-248904',
    hours: '10:00 AM - 10:00 PM',
    mapUrl: 'https://maps.google.com/?q=GEC+Circle+Chattogram',
    services: ['Bespoke Consultations', 'Festive Panjabi Collection', 'On-site Tailoring']
  },
  {
    id: 'store-sylhet',
    name: 'Sylhet Kumarpara Royal Store',
    city: 'Sylhet',
    address: 'Sylhet Millennium Tower, Kumarpara Main Road, Sylhet',
    phone: '+880 1713-248905',
    hours: '10:00 AM - 10:00 PM',
    mapUrl: 'https://maps.google.com/?q=Kumarpara+Sylhet',
    services: ['Wedding Ensembles', 'Italian Blazer Tailoring', 'VIP Client Lounge']
  }
];

