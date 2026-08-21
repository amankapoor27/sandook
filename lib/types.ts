export type Category = "painting" | "diy";

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
  collection?: string;
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
};

export const CATEGORIES: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "painting", label: "Paintings" },
  { value: "diy", label: "DIY" },
];

export const ARTWORK_STATUSES: { value: ArtworkStatus | "all"; label: string }[] =
  [
    { value: "all", label: "All" },
    { value: "available", label: "Available" },
    { value: "sold", label: "Sold" },
  ];
