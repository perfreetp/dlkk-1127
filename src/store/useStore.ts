import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import { ThemeItem, OrderItem, CouponItem, FeedbackItem, DownloadState, RefundNode, FeedbackNode } from '@/types/theme';
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

const nowString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
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
  downloadStates: Record<string, DownloadState>;
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

  addTrial: (theme: ThemeItem, days?: number) => OrderItem | void;
  isTrial: (themeId: string) => boolean;
  convertTrialToPurchase: (orderId: string, couponId?: string) => {
    success: boolean;
    order?: OrderItem;
    orderId: string;
    finalPrice: number;
    savedAmount: number;
  };

  purchaseTheme: (theme: ThemeItem, couponId?: string) => {
    success: boolean;
    order?: OrderItem;
    finalPrice: number;
    savedAmount: number;
  };

  updateTheme: (themeId: string) => void;
  updateAllThemes: () => void;

  downloadTheme: (themeId: string) => void;
  removeLocalTheme: (themeId: string) => void;
  isLocalTheme: (themeId: string) => boolean;

  applyRefund: (orderId: string, reason: string) => void;
  requestInvoice: (orderId: string) => void;

  addFeedback: (feedback: Omit<FeedbackItem, 'id' | 'createTime' | 'status' | 'nodes'>) => FeedbackItem;

  setSearchFilters: (filters: Partial<UserState['searchFilters']>) => void;
  resetSearchFilters: () => void;

  setInvoiceInfo: (info: Partial<UserState['invoiceInfo']>) => void;
}

const initialDownloadStates: Record<string, DownloadState> = {};
themes.slice(0, 5).forEach(t => {
  initialDownloadStates[t.id] = {
    themeId: t.id,
    downloadedAt: '2026-06-10 12:00',
    isLocal: true,
    size: (Math.random() * 30 + 10).toFixed(1) + 'MB'
  };
});

const initialState: UserState = {
  purchased: themes.slice(0, 3),
  downloaded: themes.slice(0, 5),
  trial: [themes[1], themes[3]],
  favorite: [themes[0], themes[2], themes[5], themes[7]],
  updateAvailable: [themes[4], themes[9]],
  orders: mockOrders,
  coupons: mockCoupons,
  feedbacks: mockFeedbacks,
  downloadStates: initialDownloadStates,
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

      addTrial: (theme, days = 7) => {
        const { trial, orders } = get();
        if (trial.some(t => t.id === theme.id)) return;

        const createTime = nowString();
        const orderNo = 'TR' + Date.now().toString().slice(-14) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        const trialOrder: OrderItem = {
          id: 'o' + Date.now(),
          themeId: theme.id,
          themeTitle: theme.title,
          themeCover: theme.cover,
          price: 0,
          originalPrice: theme.price,
          status: 'trial',
          createTime,
          orderNo,
          invoiceStatus: 'none',
          trialStartDate: createTime,
          trialDays: days
        };

        set({
          trial: [...trial, theme],
          orders: [trialOrder, ...orders]
        });

        console.log('[Store] trial added:', orderNo);
        return trialOrder;
      },

      isTrial: (themeId) => {
        return get().trial.some(t => t.id === themeId);
      },

      convertTrialToPurchase: (orderId, couponId) => {
        const { orders, purchased, downloaded, coupons, trial } = get();
        const trialOrder = orders.find(o => o.id === orderId && o.status === 'trial');
        if (!trialOrder) {
          return { success: false, finalPrice: 0, savedAmount: 0, orderId: '' };
        }

        const theme = themes.find(t => t.id === trialOrder.themeId);
        if (!theme) {
          return { success: false, finalPrice: 0, savedAmount: 0, orderId: '' };
        }

        // 检查同主题是否已有正式购买记录
        const existingPaidOrder = orders.find(o => o.themeId === theme.id && o.status === 'paid');

        // 已有购买记录：直接删除试用订单，不新增，返回已有订单ID
        if (existingPaidOrder) {
          const newOrders = orders.filter(o => o.id !== orderId); // 删除试用订单
          const newTrial = trial.filter(t => t.id !== theme.id);

          set({
            orders: newOrders,
            trial: newTrial
          });

          console.log('[Store] trial converted (existing order found):', {
            themeId: theme.id,
            existingOrderId: existingPaidOrder.id
          });

          return {
            success: true,
            order: existingPaidOrder,
            orderId: existingPaidOrder.id,
            finalPrice: existingPaidOrder.price,
            savedAmount: 0
          };
        }

        // 没有购买记录：创建新订单
        let finalPrice = theme.price;
        let savedAmount = 0;
        let usedCoupon: CouponItem | undefined;
        let usedCouponTitle: string | undefined;
        let usedCouponDiscount: number | undefined;

        if (couponId) {
          usedCoupon = coupons.find(c => c.id === couponId && !c.isUsed);
          if (usedCoupon && theme.price >= usedCoupon.minAmount) {
            finalPrice = Math.max(0, theme.price - usedCoupon.discount);
            savedAmount = usedCoupon.discount;
            usedCouponTitle = usedCoupon.title;
            usedCouponDiscount = usedCoupon.discount;
          }
        }

        const orderNo = 'TM' + Date.now().toString().slice(-14) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const createTime = nowString();

        const newOrder: OrderItem = {
          id: 'o' + (Date.now() + 1),
          themeId: theme.id,
          themeTitle: theme.title,
          themeCover: theme.cover,
          price: finalPrice,
          originalPrice: theme.price,
          status: 'paid',
          createTime,
          orderNo,
          couponId: usedCoupon?.id,
          couponTitle: usedCouponTitle,
          couponDiscount: usedCouponDiscount,
          invoiceStatus: 'none'
        };

        const newPurchased = purchased.some(p => p.id === theme.id) ? purchased : [...purchased, theme];
        const newDownloaded = downloaded.some(d => d.id === theme.id) ? downloaded : [...downloaded, theme];
        const newCoupons = usedCoupon ? coupons.map(c => c.id === couponId ? { ...c, isUsed: true } : c) : coupons;
        const newOrders = orders.filter(o => o.id !== orderId); // 彻底删除旧的试用订单
        const newTrial = trial.filter(t => t.id !== theme.id);

        const { downloadStates } = get();
        const newDownloadStates = {
          ...downloadStates,
          [theme.id]: {
            themeId: theme.id,
            downloadedAt: createTime,
            isLocal: true,
            size: (Math.random() * 30 + 10).toFixed(1) + 'MB'
          }
        };

        set({
          orders: [newOrder, ...newOrders],
          purchased: newPurchased,
          downloaded: newDownloaded,
          coupons: newCoupons,
          trial: newTrial,
          downloadStates: newDownloadStates
        });

        console.log('[Store] trial converted (new order):', { orderNo, finalPrice, savedAmount, orderId: newOrder.id });
        return { success: true, order: newOrder, orderId: newOrder.id, finalPrice, savedAmount };
      },

      purchaseTheme: (theme, couponId) => {
        const { purchased, downloaded, orders, coupons } = get();
        let finalPrice = theme.price;
        let savedAmount = 0;
        let usedCoupon: CouponItem | undefined;
        let usedCouponTitle: string | undefined;
        let usedCouponDiscount: number | undefined;

        if (couponId) {
          usedCoupon = coupons.find(c => c.id === couponId && !c.isUsed);
          if (usedCoupon && theme.price >= usedCoupon.minAmount) {
            finalPrice = Math.max(0, theme.price - usedCoupon.discount);
            savedAmount = usedCoupon.discount;
            usedCouponTitle = usedCoupon.title;
            usedCouponDiscount = usedCoupon.discount;
          }
        }

        const orderNo = 'TM' + Date.now().toString().slice(-14) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const createTime = nowString();

        const newOrder: OrderItem = {
          id: 'o' + Date.now(),
          themeId: theme.id,
          themeTitle: theme.title,
          themeCover: theme.cover,
          price: finalPrice,
          originalPrice: theme.price,
          status: 'paid',
          createTime,
          orderNo,
          couponId: usedCoupon?.id,
          couponTitle: usedCouponTitle,
          couponDiscount: usedCouponDiscount,
          invoiceStatus: 'none'
        };

        const newPurchased = purchased.some(p => p.id === theme.id) ? purchased : [...purchased, theme];
        const newDownloaded = downloaded.some(d => d.id === theme.id) ? downloaded : [...downloaded, theme];
        const newCoupons = usedCoupon ? coupons.map(c => c.id === couponId ? { ...c, isUsed: true } : c) : coupons;

        const { downloadStates } = get();
        const newDownloadStates = {
          ...downloadStates,
          [theme.id]: {
            themeId: theme.id,
            downloadedAt: createTime,
            isLocal: true,
            size: (Math.random() * 30 + 10).toFixed(1) + 'MB'
          }
        };

        set({
          purchased: newPurchased,
          downloaded: newDownloaded,
          orders: [newOrder, ...orders],
          coupons: newCoupons,
          downloadStates: newDownloadStates
        });

        console.log('[Store] purchase success:', { orderNo, finalPrice, savedAmount });
        return { success: true, order: newOrder, finalPrice, savedAmount };
      },

      updateTheme: (themeId) => {
        const { updateAvailable, downloaded, downloadStates } = get();
        const theme = updateAvailable.find(t => t.id === themeId);
        if (!theme) return;

        const newDownloaded = downloaded.some(d => d.id === themeId)
          ? downloaded.map(d => d.id === themeId ? { ...d, downloads: d.downloads + 1 } : d)
          : [...downloaded, theme];

        const newDownloadStates = {
          ...downloadStates,
          [themeId]: {
            themeId,
            downloadedAt: nowString(),
            isLocal: true,
            size: downloadStates[themeId]?.size || (Math.random() * 30 + 10).toFixed(1) + 'MB'
          }
        };

        set({
          updateAvailable: updateAvailable.filter(t => t.id !== themeId),
          downloaded: newDownloaded,
          downloadStates: newDownloadStates
        });
      },

      updateAllThemes: () => {
        const { updateAvailable, downloaded, downloadStates } = get();
        const newDownloaded = [...downloaded];
        const newDownloadStates = { ...downloadStates };
        const createTime = nowString();

        updateAvailable.forEach(theme => {
          if (!newDownloaded.some(d => d.id === theme.id)) {
            newDownloaded.push(theme);
          }
          newDownloadStates[theme.id] = {
            themeId: theme.id,
            downloadedAt: createTime,
            isLocal: true,
            size: newDownloadStates[theme.id]?.size || (Math.random() * 30 + 10).toFixed(1) + 'MB'
          };
        });

        set({
          updateAvailable: [],
          downloaded: newDownloaded,
          downloadStates: newDownloadStates
        });
      },

      downloadTheme: (themeId) => {
        const { downloadStates, downloaded } = get();
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return;

        const newDownloadStates = {
          ...downloadStates,
          [themeId]: {
            themeId,
            downloadedAt: nowString(),
            isLocal: true,
            size: (Math.random() * 30 + 10).toFixed(1) + 'MB'
          }
        };

        const newDownloaded = downloaded.some(d => d.id === themeId) ? downloaded : [...downloaded, theme];

        set({ downloadStates: newDownloadStates, downloaded: newDownloaded });
        console.log('[Store] theme downloaded:', themeId);
      },

      removeLocalTheme: (themeId) => {
        const { downloadStates } = get();
        const newDownloadStates = { ...downloadStates };
        if (newDownloadStates[themeId]) {
          newDownloadStates[themeId] = {
            ...newDownloadStates[themeId],
            isLocal: false
          };
        }
        set({ downloadStates: newDownloadStates });
        console.log('[Store] local theme removed:', themeId);
      },

      isLocalTheme: (themeId) => {
        const { downloadStates } = get();
        return downloadStates[themeId]?.isLocal || false;
      },

      applyRefund: (orderId, reason) => {
        const { orders } = get();
        const createTime = nowString();

        const firstNode: RefundNode = {
          time: createTime,
          status: 'applied',
          title: '退款申请提交',
          description: '用户提交退款申请'
        };

        const secondNode: RefundNode = {
          time: createTime,
          status: 'reviewing',
          title: '客服审核中',
          description: '客服将在1-2个工作日内处理您的申请'
        };

        set({
          orders: orders.map(o =>
            o.id === orderId ? {
              ...o,
              status: 'refunding' as const,
              refundReason: reason,
              refundNodes: [firstNode, secondNode]
            } : o
          )
        });
        console.log('[Store] refund applied:', { orderId, reason });
      },

      requestInvoice: (orderId) => {
        const { orders } = get();
        set({
          orders: orders.map(o =>
            o.id === orderId ? { ...o, invoiceStatus: 'requested' as const } : o
          )
        });
        console.log('[Store] invoice requested:', orderId);
      },

      addFeedback: (feedback) => {
        const { feedbacks } = get();
        const createTime = nowString();

        const theme = themes.find(t => t.id === feedback.themeId);

        const firstNode: FeedbackNode = {
          time: createTime,
          title: '反馈提交',
          content: '问题已提交，系统将尽快为您处理',
          operator: '系统'
        };

        const newFeedback: FeedbackItem = {
          ...feedback,
          themeCover: theme?.cover,
          id: 'f' + Date.now(),
          createTime,
          status: 'pending',
          nodes: [firstNode]
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
        downloadStates: state.downloadStates,
        searchFilters: state.searchFilters,
        invoiceInfo: state.invoiceInfo
      })
    }
  )
);
