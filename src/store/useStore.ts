import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import { ThemeItem, OrderItem, CouponItem, FeedbackItem } from '@/types/theme';
import { themes, coupons as mockCoupons, orders as mockOrders, feedbacks as mockFeedbacks } from '@/data/mockData';

const taroStorage = {
  getItem: (name: string) => {
    try {
      const val = Taro.getStorageSync(name);
      return val || null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      Taro.setStorageSync(name, value);
    } catch (e) {
      console.error('[Store] setStorage error:', e);
    }
  },
  removeItem: (name: string) => {
    try {
      Taro.removeStorageSync(name);
    } catch (e) {
      console.error('[Store] removeStorage error:', e);
    }
  }
};

interface UserState {
  purchased: ThemeItem[];
  downloaded: ThemeItem[];
  trial: ThemeItem[];
  favorite: ThemeItem[];
  updateAvailable: ThemeItem[];
  orders: OrderItem[];
  coupons: CouponItem[];
  feedbacks: FeedbackItem[];
  searchFilters: {
    keyword: string;
    color: string;
    style: string;
    festival: string;
    freeOnly: boolean;
    dynamicOnly: boolean;
  };
  invoiceInfo: {
    type: 'personal' | 'company';
    title: string;
    taxNo?: string;
    email: string;
  };
}

interface UserActions {
  addFavorite: (theme: ThemeItem) => void;
  removeFavorite: (themeId: string) => void;
  isFavorite: (themeId: string) => boolean;

  addTrial: (theme: ThemeItem) => void;
  isTrial: (themeId: string) => boolean;

  purchaseTheme: (theme: ThemeItem, couponId?: string) => {
    success: boolean;
    order?: OrderItem;
    finalPrice: number;
    savedAmount: number;
  };

  updateTheme: (themeId: string) => void;
  updateAllThemes: () => void;

  applyRefund: (orderId: string, reason?: string) => void;

  addFeedback: (feedback: Omit<FeedbackItem, 'id' | 'createTime' | 'status'>) => FeedbackItem;

  setSearchFilters: (filters: Partial<UserState['searchFilters']>) => void;
  resetSearchFilters: () => void;

  setInvoiceInfo: (info: Partial<UserState['invoiceInfo']>) => void;
}

const initialState: UserState = {
  purchased: themes.slice(0, 3),
  downloaded: themes.slice(0, 5),
  trial: [themes[1], themes[3]],
  favorite: [themes[0], themes[2], themes[5], themes[7]],
  updateAvailable: [themes[4], themes[9]],
  orders: mockOrders,
  coupons: mockCoupons,
  feedbacks: mockFeedbacks,
  searchFilters: {
    keyword: '',
    color: '全部',
    style: '全部',
    festival: '全部',
    freeOnly: false,
    dynamicOnly: false
  },
  invoiceInfo: {
    type: 'personal',
    title: '个人',
    email: ''
  }
};

export const useStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addFavorite: (theme) => {
        const { favorite } = get();
        if (favorite.some(f => f.id === theme.id)) return;
        set({ favorite: [...favorite, theme] });
      },

      removeFavorite: (themeId) => {
        const { favorite } = get();
        set({ favorite: favorite.filter(f => f.id !== themeId) });
      },

      isFavorite: (themeId) => {
        return get().favorite.some(f => f.id === themeId);
      },

      addTrial: (theme) => {
        const { trial } = get();
        if (trial.some(t => t.id === theme.id)) return;
        set({ trial: [...trial, theme] });
      },

      isTrial: (themeId) => {
        return get().trial.some(t => t.id === themeId);
      },

      purchaseTheme: (theme, couponId) => {
        const { purchased, downloaded, orders, coupons } = get();
        let finalPrice = theme.price;
        let savedAmount = 0;
        let usedCoupon: CouponItem | undefined;

        if (couponId) {
          usedCoupon = coupons.find(c => c.id === couponId && !c.isUsed);
          if (usedCoupon && theme.price >= usedCoupon.minAmount) {
            finalPrice = Math.max(0, theme.price - usedCoupon.discount);
            savedAmount = usedCoupon.discount;
          }
        }

        const orderNo = 'TM' + Date.now().toString().slice(-14) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const now = new Date();
        const createTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const newOrder: OrderItem = {
          id: 'o' + Date.now(),
          themeId: theme.id,
          themeTitle: theme.title,
          themeCover: theme.cover,
          price: finalPrice,
          status: 'paid',
          createTime,
          orderNo
        };

        const newPurchased = purchased.some(p => p.id === theme.id)
          ? purchased
          : [...purchased, theme];

        const newDownloaded = downloaded.some(d => d.id === theme.id)
          ? downloaded
          : [...downloaded, theme];

        const newCoupons = usedCoupon
          ? coupons.map(c => c.id === couponId ? { ...c, isUsed: true } : c)
          : coupons;

        set({
          purchased: newPurchased,
          downloaded: newDownloaded,
          orders: [newOrder, ...orders],
          coupons: newCoupons
        });

        console.log('[Store] purchase success:', { orderNo, finalPrice, savedAmount });
        return { success: true, order: newOrder, finalPrice, savedAmount };
      },

      updateTheme: (themeId) => {
        const { updateAvailable, downloaded } = get();
        const theme = updateAvailable.find(t => t.id === themeId);
        if (!theme) return;

        set({
          updateAvailable: updateAvailable.filter(t => t.id !== themeId),
          downloaded: downloaded.some(d => d.id === themeId)
            ? downloaded.map(d => d.id === themeId ? { ...d, downloads: d.downloads + 1 } : d)
            : [...downloaded, theme]
        });
      },

      updateAllThemes: () => {
        const { updateAvailable, downloaded } = get();
        const newDownloaded = [...downloaded];
        updateAvailable.forEach(theme => {
          if (!newDownloaded.some(d => d.id === theme.id)) {
            newDownloaded.push(theme);
          }
        });
        set({
          updateAvailable: [],
          downloaded: newDownloaded
        });
      },

      applyRefund: (orderId, reason) => {
        const { orders } = get();
        set({
          orders: orders.map(o =>
            o.id === orderId ? { ...o, status: 'refunding' as const } : o
          )
        });
        console.log('[Store] refund applied:', { orderId, reason });
      },

      addFeedback: (feedback) => {
        const { feedbacks } = get();
        const newFeedback: FeedbackItem = {
          ...feedback,
          id: 'f' + Date.now(),
          createTime: new Date().toLocaleString('zh-CN'),
          status: 'pending'
        };
        set({ feedbacks: [newFeedback, ...feedbacks] });
        console.log('[Store] feedback added:', newFeedback.id);
        return newFeedback;
      },

      setSearchFilters: (filters) => {
        const { searchFilters } = get();
        set({ searchFilters: { ...searchFilters, ...filters } });
      },

      resetSearchFilters: () => {
        set({
          searchFilters: {
            keyword: '',
            color: '全部',
            style: '全部',
            festival: '全部',
            freeOnly: false,
            dynamicOnly: false
          }
        });
      },

      setInvoiceInfo: (info) => {
        const { invoiceInfo } = get();
        set({ invoiceInfo: { ...invoiceInfo, ...info } });
      }
    }),
    {
      name: 'theme-market-storage',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        purchased: state.purchased,
        downloaded: state.downloaded,
        trial: state.trial,
        favorite: state.favorite,
        updateAvailable: state.updateAvailable,
        orders: state.orders,
        coupons: state.coupons,
        feedbacks: state.feedbacks,
        searchFilters: state.searchFilters,
        invoiceInfo: state.invoiceInfo
      })
    }
  )
);
