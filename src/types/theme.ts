export interface ThemeItem {
  id: string;
  title: string;
  cover: string;
  previews: string[];
  author: string;
  authorId: string;
  authorAvatar: string;
  price: number;
  isFree: boolean;
  isDynamic: boolean;
  isNew: boolean;
  style: string;
  color: string;
  festival?: string;
  downloads: number;
  likes: number;
  rating: number;
  description: string;
  compatibleModels: string[];
  resources: {
    wallpapers: number;
    icons: number;
    lockScreen: boolean;
    widgets: number;
  };
  tags: string[];
}

export interface StyleChannel {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface BannerItem {
  id: string;
  title: string;
  image: string;
  themeId?: string;
}

export interface RankingItem {
  id: string;
  rank: number;
  theme: ThemeItem;
  trend: 'up' | 'down' | 'flat';
}

export interface CreatorInfo {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  worksCount: number;
  totalDownloads: number;
  rating: number;
}

export interface RefundNode {
  time: string;
  status: 'applied' | 'reviewing' | 'approved' | 'rejected' | 'completed';
  title: string;
  description?: string;
}

export interface OrderItem {
  id: string;
  themeId: string;
  themeTitle: string;
  themeCover: string;
  price: number;
  originalPrice: number;
  status: 'paid' | 'refunding' | 'refunded' | 'trial';
  createTime: string;
  orderNo: string;
  couponId?: string;
  couponTitle?: string;
  couponDiscount?: number;
  invoiceStatus: 'none' | 'requested' | 'issued';
  trialStartDate?: string;
  trialDays?: number;
  refundReason?: string;
  refundNodes?: RefundNode[];
}

export interface CouponItem {
  id: string;
  title: string;
  discount: number;
  minAmount: number;
  expireTime: string;
  isUsed: boolean;
}

export interface FeedbackNode {
  time: string;
  title: string;
  content?: string;
  operator?: string;
}

export interface FeedbackItem {
  id: string;
  type: 'adapt' | 'bug' | 'suggest' | 'infringement';
  content: string;
  images: string[];
  rating: number;
  createTime: string;
  status: 'pending' | 'processing' | 'resolved';
  themeId?: string;
  themeTitle?: string;
  themeCover?: string;
  reply?: string;
  replyTime?: string;
  nodes?: FeedbackNode[];
}

export interface DownloadState {
  themeId: string;
  downloadedAt?: string;
  isLocal: boolean;
  size?: string;
}
