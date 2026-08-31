export type Category = string;

export type CategoryFieldSet = "painting" | "print";

export type VocabularyCategory = {
  slug: string;
  label: string;
  fieldSet: CategoryFieldSet;
  active: boolean;
};

export type VocabularyStringEntry = {
  value: string;
  active: boolean;
};

export type Vocabulary = {
  categories: VocabularyCategory[];
  mediums: VocabularyStringEntry[];
  dimensions: VocabularyStringEntry[];
  years: VocabularyStringEntry[];
  collections: VocabularyStringEntry[];
};

export const PRINT_SIZES = [
  '8" × 10"',
  '11" × 14"',
  '16" × 20"',
  '18" × 24"',
  '24" × 36"',
  "A4",
  "A3",
] as const;

export const PRINT_SURFACES = [
  "Fine art paper",
  "Canvas",
  "Metal",
  "Acrylic",
  "Wood",
] as const;

export type PrintSize = (typeof PRINT_SIZES)[number];
export type PrintSurface = (typeof PRINT_SURFACES)[number];

export type ArtworkStatus = "available" | "sold" | "not_for_sale";

export type ItemPhoto = {
  id: string;
  thumbKey: string;
  fullKey: string;
};

export type GalleryImage = {
  id: string;
  slug: string;
  category: Category;
  caption?: string;
  title: string;
  medium?: string;
  dimensions?: string;
  year?: number;
  price?: number;
  priceOnRequest?: boolean;
  status: ArtworkStatus;
  featured?: boolean;
  homepageHero?: boolean;
  collection?: string;
  printSizes?: string[];
  printSurfaces?: string[];
  /** Primary thumbnail — mirrors photos[0] */
  thumbKey: string;
  /** Primary full image — mirrors photos[0] */
  fullKey: string;
  photos: ItemPhoto[];
  uploadedAt: string;
};

export type Manifest = {
  images: GalleryImage[];
};

export const MAX_PHOTOS_PER_ITEM = 12;

export type InquiryType = "general" | "purchase" | "commission";

export type Inquiry = {
  id: string;
  type: InquiryType;
  name: string;
  email: string;
  message: string;
  artworkSlug?: string;
  artworkTitle?: string;
  createdAt: string;
  archived?: boolean;
  archivedAt?: string;
};

export const ARTWORK_STATUSES: { value: ArtworkStatus | "all"; label: string }[] =
  [
    { value: "all", label: "All" },
    { value: "available", label: "Available" },
    { value: "sold", label: "Sold" },
  ];
