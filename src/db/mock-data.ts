/**
 * Myvelora Store — Mock & Seed Data
 * Designed according to Myvelora_Brand_Identity_PRD.pdf
 * Currency: MYR (RM) | Photo-First 4:5 ratio imagery
 */

export interface MockProductVersion {
  id: number;
  versionName: string;
  sku: string;
  priceRm: string;
  stock: number;
  imageUrl?: string;
  isBundle?: boolean;
  bundleMode?: "standalone" | "linked";
  linkedVersionIds?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface MockProduct {
  id: number;
  slug: string;
  name: string;
  groupArtist: string;
  category: "Album" | "Photocard" | "Lightstick" | "Merch" | "Photobook" | "Fashion" | "Stationery" | string;
  description: string;
  primaryImageUrl: string;
  isPreOrder: boolean;
  preOrderDeadline?: string | null;
  preOrderQuotaMode?: "finite" | "open";
  isNewArrival: boolean;
  isBestSeller: boolean;
  isPublished: boolean;
  sortOrder: number;
  versions: MockProductVersion[];
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 1,
    slug: "newjeans-get-up-2nd-ep-bunny-beach-bag-ver",
    name: "NewJeans - 2nd EP 'Get Up' (Bunny Beach Bag Ver.)",
    groupArtist: "NewJeans",
    category: "Album",
    description: `1. OUTBOX : 215 x 227 x 38mm / 1EA\n2. BAG : 210 x 220 x 35mm / 1EA (By Version)\n3. INNER BOX : 200 x 135 x 29mm / 1EA\n4. PHOTOBOOK : 129 x 194mm / 84P / 3EA\n5. LYRIC BOOK : 129 x 194mm / 24P / 1EA\n6. POSTCARD : 100 x 150mm / 5EA (1 SET)\n7. BOOKMARK : 100 x 70mm / 1EA\n8. STICKER : 124 x 189mm / 3EA (1 SET)\n9. PHOTOCARD : 55 x 85mm / 5EA (1 SET)\n10. CD-R : 125 x 125mm / 1EA`,
    primaryImageUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=1000&q=80",
    isPreOrder: false,
    preOrderDeadline: null,
    isNewArrival: true,
    isBestSeller: true,
    isPublished: true,
    sortOrder: 1,
    versions: [
      {
        id: 101,
        versionName: "NewJeans (Group Ver.)",
        sku: "NJ-GU-BAG-GRP",
        priceRm: "115.00",
        stock: 12,
        imageUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 102,
        versionName: "Minji Ver.",
        sku: "NJ-GU-BAG-MJ",
        priceRm: "118.00",
        stock: 6,
        imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 103,
        versionName: "Hanni Ver.",
        sku: "NJ-GU-BAG-HN",
        priceRm: "118.00",
        stock: 4,
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 3,
      },
      {
        id: 104,
        versionName: "Haerin Ver.",
        sku: "NJ-GU-BAG-HR",
        priceRm: "120.00",
        stock: 3,
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 4,
      },
      {
        id: 105,
        versionName: "Danielle Ver.",
        sku: "NJ-GU-BAG-DN",
        priceRm: "115.00",
        stock: 5,
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 5,
      },
      {
        id: 106,
        versionName: "Hyein Ver.",
        sku: "NJ-GU-BAG-HI",
        priceRm: "115.00",
        stock: 7,
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 6,
      },
    ],
  },
  {
    id: 2,
    slug: "aespa-armageddon-the-1st-album-superbeing-ver",
    name: "aespa - The 1st Album 'Armageddon' (Superbeing Ver.)",
    groupArtist: "aespa",
    category: "Album",
    description: `1. COVER : 220 x 290mm / 1EA\n2. PHOTOBOOK : 220 x 290mm / 104P\n3. CD-R : 118 x 118mm / 1EA\n4. POSTCARD : 100 x 150mm / RANDOM 2EA OUT OF 4\n5. STICKER : 120 x 160mm / 2EA\n6. FOLDED POSTER : 390 x 530mm / RANDOM 1EA OUT OF 2\n7. PHOTOCARD : 55 x 85mm / RANDOM 1EA OUT OF 4`,
    primaryImageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
    isPreOrder: true,
    preOrderDeadline: "Tuesday, 17 November 2026 09:00",
    isNewArrival: true,
    isBestSeller: false,
    isPublished: true,
    sortOrder: 2,
    versions: [
      {
        id: 201,
        versionName: "Ver. A (Supernova)",
        sku: "AES-ARM-V-A",
        priceRm: "92.00",
        stock: 14,
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 202,
        versionName: "Ver. B (Armageddon)",
        sku: "AES-ARM-V-B",
        priceRm: "92.00",
        stock: 8,
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 203,
        versionName: "Full 2-Album Set",
        sku: "AES-ARM-SET",
        priceRm: "180.00",
        stock: 5,
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
        isBundle: true,
        bundleMode: "linked",
        linkedVersionIds: "[201, 202]",
        isActive: true,
        sortOrder: 3,
      },
    ],
  },
  {
    id: 3,
    slug: "ive-ive-switch-the-2nd-ep-photobook",
    name: "IVE - The 2nd EP 'IVE SWITCH' (Photobook Ver.)",
    groupArtist: "IVE",
    category: "Album",
    description: `1.HARD COVER PHOTOBOOK : 148 x 210mm / 72P\n2. CD-R : 1EA (By Version)\n3. PHOTOCARD : 55 x 85mm / RANDOM 1EA OUT OF 6\n4. FOLDED HEART CARD : 95 x 100mm / RANDOM 1EA OUT OF 6\n5. LENTICULAR PHOTOCARD : 55 x 85mm / RANDOM 1EA OUT OF 6`,
    primaryImageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80",
    isPreOrder: true,
    preOrderDeadline: "Friday, 20 November 2026 11:00",
    isNewArrival: true,
    isBestSeller: false,
    isPublished: true,
    sortOrder: 3,
    versions: [
      {
        id: 301,
        versionName: "ON Ver.",
        sku: "IVE-SW-ON",
        priceRm: "88.00",
        stock: 9,
        imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 302,
        versionName: "OFF Ver.",
        sku: "IVE-SW-OFF",
        priceRm: "88.00",
        stock: 7,
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 303,
        versionName: "SPIN-OFF Ver.",
        sku: "IVE-SW-SPIN",
        priceRm: "88.00",
        stock: 4,
        imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 3,
      },
    ],
  },
  {
    id: 4,
    slug: "seventeen-17-is-right-here-best-album-deluxe",
    name: "SEVENTEEN - Best Album '17 IS RIGHT HERE' (Here Ver.)",
    groupArtist: "SEVENTEEN",
    category: "Album",
    description: `1. OUTBOX : W160 x H220mm / 1EA\n2. PHOTOBOOK : W148 x H208mm / 88P + 44P (2EA)\n3. ARCHIVING BOOK : W148 x H208mm / 44P\n4. LYRIC BOOK : W148 x H208mm / 28P\n5. TEAM PHOTOBOOK : W148 x H208mm / 12P\n6. CD-R : 2CD\n7. FOLDED POSTER : W296 x H416mm / 1EA\n8. PHOTOCARD SET : W55 x H85mm / 13EA 1SET\n9. RANDOM PHOTOCARD : W55 x H85mm / 2EA OUT OF 26`,
    primaryImageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80",
    isPreOrder: false,
    preOrderDeadline: null,
    isNewArrival: false,
    isBestSeller: true,
    isPublished: true,
    sortOrder: 4,
    versions: [
      {
        id: 401,
        versionName: "HERE Ver.",
        sku: "SVT-RH-HERE",
        priceRm: "145.00",
        stock: 5,
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 402,
        versionName: "HEAR Ver.",
        sku: "SVT-RH-HEAR",
        priceRm: "145.00",
        stock: 0, // Mock Sold Out state
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 403,
        versionName: "Dear Ver. (Random Member Binder)",
        sku: "SVT-RH-DEAR",
        priceRm: "79.00",
        stock: 11,
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 3,
      },
    ],
  },
  {
    id: 5,
    slug: "stray-kids-ate-mini-album-chhk-chhk-boom",
    name: "Stray Kids - Mini Album 'ATE' (Standard Photobook)",
    groupArtist: "Stray Kids",
    category: "Album",
    description: `1. OUTBOX : 164 x 224 x 14mm / 1EA\n2. PHOTOBOOK : 160 x 220mm / 64P\n3. CD-R : 1EA\n4. MINI PHOTOBOOK : 70 x 100mm / 1EA\n5. 4-CUT PHOTO : 150 x 100mm / 1EA\n6. PHOTOCARD : 55 x 85mm / RANDOM 1EA OUT OF 16\n7. UNIT PHOTOCARD : 55 x 85mm / RANDOM 1EA OUT OF 8`,
    primaryImageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
    isPreOrder: true,
    preOrderDeadline: "Sunday, 22 November 2026 18:00",
    isNewArrival: true,
    isBestSeller: false,
    isPublished: true,
    sortOrder: 5,
    versions: [
      {
        id: 501,
        versionName: "Chk Chk Ver.",
        sku: "SKZ-ATE-CHK",
        priceRm: "85.00",
        stock: 16,
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 502,
        versionName: "Boom Ver.",
        sku: "SKZ-ATE-BOOM",
        priceRm: "85.00",
        stock: 12,
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 503,
        versionName: "Limited ATE Ver.",
        sku: "SKZ-ATE-LTD",
        priceRm: "95.00",
        stock: 4,
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 3,
      },
    ],
  },
  {
    id: 6,
    slug: "le-sserafim-easy-3rd-mini-album",
    name: "LE SSERAFIM - 3rd Mini Album 'EASY'",
    groupArtist: "LE SSERAFIM",
    category: "Album",
    description: `Official sealed album featuring 'EASY' and 'Smart'. Outer box, photobook (104p), CD, photocard (1 of 5), postcard, and sticker.`,
    primaryImageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
    isPreOrder: false,
    isNewArrival: false,
    isBestSeller: false,
    isPublished: true,
    sortOrder: 6,
    versions: [
      {
        id: 601,
        versionName: "Vol. 1 (BALMY FLEX)",
        sku: "LSF-ESY-V1",
        priceRm: "84.00",
        stock: 8,
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 602,
        versionName: "Vol. 2 (FEATHERLY LOTUS)",
        sku: "LSF-ESY-V2",
        priceRm: "84.00",
        stock: 6,
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 603,
        versionName: "Vol. 3 (SHEER MYRRH)",
        sku: "LSF-ESY-V3",
        priceRm: "84.00",
        stock: 5,
        imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 3,
      },
    ],
  },
  {
    id: 7,
    slug: "twice-official-lightstick-candybong-infinity",
    name: "TWICE - Official Lightstick 'CANDYBONG ∞'",
    groupArtist: "TWICE",
    category: "Lightstick",
    description: `Official authentic TWICE CandyBong Infinity light stick with multi-color LED, Bluetooth app sync capability, strap, and manual. Sealed original packaging.`,
    primaryImageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80",
    isPreOrder: false,
    isNewArrival: false,
    isBestSeller: true,
    isPublished: true,
    sortOrder: 7,
    versions: [
      {
        id: 701,
        versionName: "Standard Lightstick Set",
        sku: "TW-CB-INF",
        priceRm: "245.00",
        stock: 6,
        imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 1,
      },
    ],
  },
  {
    id: 8,
    slug: "enhypen-romance-untold-2nd-studio-album",
    name: "ENHYPEN - 2nd Studio Album 'ROMANCE : UNTOLD'",
    groupArtist: "ENHYPEN",
    category: "Album",
    description: `1. OUTBOX : W140 x H180 x T25mm / 1EA\n2. LETTER : W80 x H100mm / 1EA\n3. PHOTOBOOK : W130 x H170mm / 92P\n4. CD-R : W120 x H120mm / 1EA\n5. PHOTOCARD A : W54 x H86mm / RANDOM 1EA OUT OF 7\n6. PHOTOCARD B : W54 x H86mm / RANDOM 1EA OUT OF 7\n7. STICKER : W110 x H150mm / 1EA\n8. POSTCARD : W120 x H160mm / RANDOM 1EA OUT OF 7`,
    primaryImageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
    isPreOrder: true,
    preOrderDeadline: "Tuesday, 24 November 2026 09:00",
    isNewArrival: true,
    isBestSeller: false,
    isPublished: true,
    sortOrder: 8,
    versions: [
      {
        id: 801,
        versionName: "INCEPTIO Ver.",
        sku: "EN-RU-INC",
        priceRm: "89.00",
        stock: 9,
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 802,
        versionName: "ARCANUM Ver.",
        sku: "EN-RU-ARC",
        priceRm: "89.00",
        stock: 8,
        imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 803,
        versionName: "CONCESSIO Ver.",
        sku: "EN-RU-CON",
        priceRm: "89.00",
        stock: 4,
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 3,
      },
    ],
  },
  {
    id: 9,
    slug: "txt-yeonjun-mixtape-figure-album",
    name: "TXT YEONJUN - 'GGUM' Mixtape Figure Ver.",
    groupArtist: "TOMORROW X TOGETHER",
    category: "Merch",
    description: `- Total 1 type\n- Outbox: 1 type / W140 X H140(mm)\n- Figure: 1 type / W40 X H100(mm)\n- Envelope: 1 type / W140 X H140(mm)\n- Booklet: 1 type / W130 X H130(mm), 20p\n- Sticker: 1 type / W100 X H50(mm)\n- Photocard envelope: 1 type / W62 X H90(mm)\n- Photocard: 4 types / W55 X H85(mm)\n- CD-R: 1 type / W80 X H80(mm)`,
    primaryImageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80",
    isPreOrder: false,
    preOrderDeadline: null,
    isNewArrival: false,
    isBestSeller: true,
    isPublished: true,
    sortOrder: 9,
    versions: [
      {
        id: 901,
        versionName: "Figure Package Ver.",
        sku: "TXT-YJ-FIG",
        priceRm: "128.00",
        stock: 0, // Mock Out of Stock matching user reference
        imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 1,
      },
    ],
  },
  {
    id: 10,
    slug: "blackpink-official-lightstick-ver-2-limited",
    name: "BLACKPINK - Official Lightstick Ver. 2",
    groupArtist: "BLACKPINK",
    category: "Lightstick",
    description: `Official sealed BLACKPINK lightstick with Bluetooth sync capability, strap, and cradle.`,
    primaryImageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
    isPreOrder: false,
    isNewArrival: false,
    isBestSeller: true,
    isPublished: true,
    sortOrder: 10,
    versions: [
      {
        id: 1001,
        versionName: "Standard Ver.",
        sku: "BP-LS-V2-STD",
        priceRm: "215.00",
        stock: 0, // Mock Out of Stock matching user reference
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 1002,
        versionName: "Limited Edition Set",
        sku: "BP-LS-V2-LTD",
        priceRm: "235.00",
        stock: 0,
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        sortOrder: 2,
      },
    ],
  },
];

export const MOCK_REVIEWS = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80",
    caption: "Aina R. — Parcel arrived safely in Penang! Super thick bubble wrap, zero dents on the album corners.",
    isPublished: true,
    sortOrder: 1,
    createdAt: new Date(),
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    caption: "Chloe T. — Fast WhatsApp confirmation. My aespa Armageddon album arrived sealed with all inclusions!",
    isPublished: true,
    sortOrder: 2,
    createdAt: new Date(),
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
    caption: "Syafiqah M. — Got my NewJeans Haerin bag version! Pulled my bias photocard too, thank you!",
    isPublished: true,
    sortOrder: 3,
    createdAt: new Date(),
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    caption: "Mei Ling — Delivered in 2 days to KL. Tracking number updated quickly and packaging was super neat.",
    isPublished: true,
    sortOrder: 4,
    createdAt: new Date(),
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    caption: "Nadia H. — CandyBong Infinity synced with the app right out of the box. Ready for the concert!",
    isPublished: true,
    sortOrder: 5,
    createdAt: new Date(),
  },
];

export const MOCK_STORE_SETTINGS: {
  id: number;
  brandLogoUrl: string | null;
  heroBannerImageUrl: string | null;
  heroBannerBadge: string | null;
  heroBannerTitle: string | null;
  heroBannerLink: string | null;
  shippingEnabled: boolean;
  flatShippingFeeRm: string;
  freeShippingMinRm: string | null;
  paymentEnabled: boolean;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  duitnowQrImageUrl: string | null;
  paymentInstructions: string | null;
  adminWhatsappNumber: string | null;
  instagramUrl: string | null;
  botProvider: "none" | "telegram" | "whatsapp_api";
  botApiEndpointOrToken: string | null;
  botTargetChatId: string | null;
  faqEnabled: boolean;
  faqItems: Array<{ id: string; question: string; answer: string }>;
  returnPolicyEnabled: boolean;
  returnPolicyText: string | null;
  promoDiscountEnabled: boolean;
  promoDiscountPercent: number;
  promoDiscountScope: string;
  promoDiscountBadge: string;
  updatedAt: Date;
} = {
  id: 1,
  brandLogoUrl: "/brand/myvelora-logo.png",
  heroBannerImageUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=1200&q=80",
  heroBannerBadge: "New Drop",
  heroBannerTitle: "NewJeans - 2nd EP 'Get Up' (Bunny Beach Bag Ver.)",
  heroBannerLink: "/products/newjeans-get-up-2nd-ep-bunny-beach-bag-ver",
  shippingEnabled: true,
  flatShippingFeeRm: "8.00",
  freeShippingMinRm: "150.00",
  paymentEnabled: true,
  bankName: "Maybank",
  bankAccountNumber: "5140 1234 5678",
  bankAccountHolder: "MYVELORA STORE ENTERPRISE",
  duitnowQrImageUrl: "https://images.unsplash.com/photo-1595079672139-545c0255a1ca?auto=format&fit=crop&w=600&q=80",
  paymentInstructions: "Please scan the DuitNow QR or transfer directly to our Maybank account. Upload your payment slip/screenshot below and confirm with our admin on WhatsApp.",
  adminWhatsappNumber: "601123456789",
  instagramUrl: "https://instagram.com/myvelorastore",
  botProvider: "none" as const,
  botApiEndpointOrToken: null,
  botTargetChatId: null,
  faqEnabled: true,
  faqItems: [
    {
      id: "faq-1",
      question: "What is the difference between Ready Stock and Pre-Order (PO) items?",
      answer:
        "• Ready Stock items are physically stored in our local warehouse and dispatched within 1-2 business days after payment verification.\n• Pre-Order (PO) items are advance orders for upcoming official releases or restocks. Each Pre-Order item specifies an 'Available until' order closing deadline, and packages are dispatched as soon as the overseas shipment arrives at our warehouse.",
    },
    {
      id: "faq-2",
      question: "Can I combine Ready Stock and Pre-Order items in a single order?",
      answer:
        "To receive your Ready Stock items without delay, we strongly recommend placing separate orders for Ready Stock and Pre-Order items. If ordered together in one transaction, your entire parcel will be held and dispatched together once all Pre-Order items have arrived.",
    },
    {
      id: "faq-3",
      question: "How does the ordering and payment process work?",
      answer:
        "Browse our catalog, select your favorite album or merchandise version (or select 'Buy All Versions / Full Set'), and proceed to checkout. Complete your payment via DuitNow QR or manual Instant Bank Transfer, upload your payment receipt directly on the confirmation page, and click 'Confirm via WhatsApp' to notify our admin team.",
    },
    {
      id: "faq-4",
      question: "What are the shipping fees and delivery estimates?",
      answer:
        "We provide standard flat-rate shipping across Malaysia, with Free Shipping on eligible qualifying orders. After dispatch, courier delivery typically takes 1-3 business days within Peninsular Malaysia and 3-5 business days to Sabah & Sarawak.",
    },
    {
      id: "faq-5",
      question: "Will I receive courier tracking information for my order?",
      answer:
        "Yes! As soon as your order is packed and picked up by our courier partner, we will provide your tracking number via WhatsApp. You can also monitor your live fulfillment status 24/7 on our 'Track Order' page using your Order Code and phone number.",
    },
    {
      id: "faq-6",
      question: "How are albums, photocards, and lightsticks packaged?",
      answer:
        "We know the importance of pristine album outboxes and collectibles. Every order is protected with multi-layer shock-absorbing bubble wrap, placed inside sturdy corrugated cartons, and labeled with fragile tape to ensure safe transit.",
    },
  ],
  returnPolicyEnabled: false,
  returnPolicyText: null,
  promoDiscountEnabled: false,
  promoDiscountPercent: 0,
  promoDiscountScope: "all",
  promoDiscountBadge: "SALE",
  updatedAt: new Date(),
};
