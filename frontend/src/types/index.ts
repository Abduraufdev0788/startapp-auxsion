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
  fullName: string;
  avatarUrl?: string;
  roles: UserRole[];
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  currentHighestBid: number; // in tiyin
  startingPrice: number; // in tiyin
  minIncrement: number; // in tiyin
  depositAmount: number; // in tiyin
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  participantCount: number;
  bidCount: number;
  isFavorite?: boolean;
}

