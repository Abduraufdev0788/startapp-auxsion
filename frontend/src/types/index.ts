export type AuctionStatus =
  | 'DRAFT'
  | 'PENDING_MODERATION'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'FINALIZING'
  | 'COMPLETED'
  | 'NO_WINNER'
  | 'CANCELLED'
  | 'DISPUTED';

export type UserRole = 'GUEST' | 'USER' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email?: string;
  phone: string;
  full_name: string;
  roles: string[];
  is_active: boolean;
  is_verified: boolean;
  avatar_url?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order: number;
  parent_id?: string;
  children?: Category[];
}

export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  description: string;
  condition: string;
  is_approved: boolean;
  created_at: string;
  images: ProductImage[];
}

export interface Auction {
  id: string;
  seller_id: string;
  product_id: string;
  starting_price: number; // in tiyin
  reserve_price: number; // in tiyin
  min_bid_increment: number; // in tiyin
  deposit_amount: number; // in tiyin
  current_highest_bid: number; // in tiyin
  highest_bidder_id?: string;
  bid_count: number;
  participant_count: number;
  start_time: string;
  end_time: string;
  status: AuctionStatus;
  delivery_info?: string;
  rules?: string;
  product?: Product;
}

export interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  amount: number; // in tiyin
  amount_uzs: number; // in whole UZS
  created_at: string;
  bidder_name?: string;
}

export interface ParticipationStatus {
  is_eligible: boolean;
  is_seller: boolean;
  deposit_status: string;
  participant_status: string;
  deposit_amount: number;
}

export interface Deposit {
  id: string;
  auction_id: string;
  amount: number; // in tiyin
  currency: string;
  status: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
