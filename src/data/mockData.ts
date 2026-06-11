import { ThemeItem, StyleChannel, BannerItem, RankingItem, CreatorInfo, OrderItem, CouponItem, FeedbackItem } from '@/types/theme';

const picIds = {
  wallpaper: [1015, 1018, 1036, 1039, 1044, 292, 312, 326, 401, 431, 570, 580],
  tech: [1, 2, 3, 6, 8, 9, 119, 160, 201],
  avatar: [64, 91, 177, 338, 1027]
};

const getPic = (id: number, w: number, h: number) => `https://picsum.photos/id/${id}/${w}/${h}`;

export const banners: BannerItem[] = [
  { id: '1', title: '夏日限定·清凉系列', image: getPic(picIds.wallpaper[0], 750, 400), themeId: 't1' },
  { id: '2', title: '赛博朋克2077主题', image: getPic(picIds.tech[0], 750, 400), themeId: 't2' },
  { id: '3', title: '极简黑白质感', image: getPic(picIds.wallpaper[1], 750, 400), themeId: 't3' }
];

export const styleChannels: StyleChannel[] = [
  { id: 's1', name: '简约', icon: '◇', color: '#7C3AED' },
  { id: 's2', name: '清新', icon: '🌿', color: '#10B981' },
  { id: 's3', name: '暗黑', icon: '🌙', color: '#1F2937' },
  { id: 's4', name: '可爱', icon: '🎀', color: '#EC4899' },
  { id: 's5', name: '科技', icon: '⚡', color: '#3B82F6' },
  { id: 's6', name: '复古', icon: '📻', color: '#F59E0B' },
  { id: 's7', name: '国风', icon: '🏮', color: '#EF4444' },
  { id: 's8', name: '全部', icon: '⊕', color: '#6B7280' }
];

const baseThemes: Partial<ThemeItem>[] = [
  { title: '夏日薄荷绿', style: '清新', color: '绿色', isFree: true, isDynamic: false, isNew: true, price: 0, author: '小清新工作室', description: '清凉夏日，薄荷绿意盎然，让你的手机焕然一新。适合夏季使用，护眼舒适。' },
  { title: '赛博朋克之夜', style: '科技', color: '紫色', isFree: false, isDynamic: true, isNew: true, price: 6, author: 'FutureLab', description: '霓虹灯光下的未来都市，动态效果炫酷十足。赛博朋克爱好者必备。' },
  { title: '极简黑白', style: '简约', color: '黑白', isFree: true, isDynamic: false, isNew: false, price: 0, author: '极简美学', description: '纯粹的黑白灰调，简约而不简单。商务人士首选。' },
  { title: '樱花物语', style: '可爱', color: '粉色', isFree: false, isDynamic: true, isNew: false, price: 4, author: '樱花少女', description: '粉色樱花飘落，浪漫唯美。动态效果让樱花轻轻飞舞。', festival: '春季' },
  { title: '深夜食堂', style: '复古', color: '暖黄', isFree: false, isDynamic: false, isNew: true, price: 3, author: '怀旧时光', description: '温暖的黄色灯光，复古胶片质感。陪你度过每一个深夜。' },
  { title: '国风水墨', style: '国风', color: '青色', isFree: false, isDynamic: false, isNew: false, price: 5, author: '丹青墨客', description: '山水写意，墨色丹青。传统东方美学，尽显雅致。' },
  { title: '星夜物语', style: '暗黑', color: '深蓝', isFree: true, isDynamic: true, isNew: false, price: 0, author: '星空猎人', description: '深邃星空，流星划过。动态效果让星座缓缓转动。' },
  { title: '糖果乐园', style: '可爱', color: '彩色', isFree: false, isDynamic: false, isNew: true, price: 2, author: 'SweetDream', description: '五彩缤纷的糖果世界，甜蜜治愈每一天。' },
  { title: '都市霓虹', style: '科技', color: '蓝紫', isFree: false, isDynamic: true, isNew: false, price: 8, author: 'FutureLab', description: '都市夜晚的霓虹灯光，流光溢彩。适合追求潮流的年轻人。' },
  { title: '森林秘境', style: '清新', color: '绿色', isFree: true, isDynamic: false, isNew: false, price: 0, author: '自然之声', description: '郁郁葱葱的森林，阳光透过树叶洒下。亲近自然，治愈心灵。' },
  { title: '圣诞欢乐', style: '可爱', color: '红色', isFree: false, isDynamic: true, isNew: true, price: 3, author: '节日工坊', description: '圣诞老人、麋鹿、雪花，浓浓的圣诞节日氛围。', festival: '圣诞节' },
  { title: '中秋月圆', style: '国风', color: '金色', isFree: false, isDynamic: false, isNew: false, price: 4, author: '丹青墨客', description: '皓月当空，桂花飘香。传统中秋佳节主题。', festival: '中秋节' }
];

export const themes: ThemeItem[] = baseThemes.map((t, i) => ({
  id: `t${i + 1}`,
  title: t.title!,
  cover: getPic(picIds.wallpaper[i % picIds.wallpaper.length], 300, 300),
  previews: [
    getPic(picIds.wallpaper[(i + 2) % picIds.wallpaper.length], 750, 1334),
    getPic(picIds.wallpaper[(i + 4) % picIds.wallpaper.length], 750, 1334),
    getPic(picIds.wallpaper[(i + 1) % picIds.wallpaper.length], 750, 1334)
  ],
  author: t.author!,
  authorId: `a${(i % 5) + 1}`,
  authorAvatar: getPic(picIds.avatar[i % picIds.avatar.length], 200, 200),
  price: t.price!,
  isFree: t.isFree!,
  isDynamic: t.isDynamic!,
  isNew: t.isNew!,
  style: t.style!,
  color: t.color!,
  festival: t.festival,
  downloads: Math.floor(Math.random() * 50000) + 1000,
  likes: Math.floor(Math.random() * 10000) + 500,
  rating: 4 + Math.random(),
  description: t.description!,
  compatibleModels: ['iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 14', '华为 Mate 60', '小米 14'],
  resources: {
    wallpapers: Math.floor(Math.random() * 10) + 1,
    icons: Math.floor(Math.random() * 100) + 20,
    lockScreen: Math.random() > 0.3,
    widgets: Math.floor(Math.random() * 5)
  },
  tags: [t.style!, t.color!, t.isDynamic ? '动态' : '静态', t.isFree ? '免费' : '付费']
}));

export const rankingList: RankingItem[] = themes.slice(0, 8).map((theme, i) => ({
  id: `r${i + 1}`,
  rank: i + 1,
  theme,
  trend: (['up', 'down', 'flat'] as const)[Math.floor(Math.random() * 3)]
}));

export const newArrivals: ThemeItem[] = themes.filter(t => t.isNew);

export const dynamicThemes: ThemeItem[] = themes.filter(t => t.isDynamic);

export const creators: CreatorInfo[] = [
  { id: 'a1', name: 'FutureLab', avatar: getPic(picIds.avatar[0], 200, 200), bio: '专注科技风主题创作，未来感十足。', followers: 25680, worksCount: 42, totalDownloads: 1580000, rating: 4.8 },
  { id: 'a2', name: '小清新工作室', avatar: getPic(picIds.avatar[1], 200, 200), bio: '自然清新风格，治愈系主题。', followers: 18920, worksCount: 36, totalDownloads: 890000, rating: 4.9 },
  { id: 'a3', name: '丹青墨客', avatar: getPic(picIds.avatar[2], 200, 200), bio: '传统国风美学，水墨丹青。', followers: 32100, worksCount: 58, totalDownloads: 2100000, rating: 4.7 },
  { id: 'a4', name: '极简美学', avatar: getPic(picIds.avatar[3], 200, 200), bio: 'Less is more，简约至上。', followers: 15800, worksCount: 28, totalDownloads: 760000, rating: 4.6 },
  { id: 'a5', name: '樱花少女', avatar: getPic(picIds.avatar[4 % picIds.avatar.length], 200, 200), bio: '粉色少女心，浪漫甜美。', followers: 28900, worksCount: 45, totalDownloads: 1320000, rating: 4.8 }
];

export const myThemes = {
  purchased: themes.slice(0, 3),
  downloaded: themes.slice(0, 5),
  trial: [themes[1], themes[3]],
  favorite: [themes[0], themes[2], themes[5], themes[7]],
  updateAvailable: [themes[4], themes[9]]
};

export const orders: OrderItem[] = [
  { id: 'o1', themeId: 't2', themeTitle: '赛博朋克之夜', themeCover: themes[1].cover, price: 6, status: 'paid', createTime: '2026-06-08 14:30', orderNo: 'TM2026060814300001' },
  { id: 'o2', themeId: 't4', themeTitle: '樱花物语', themeCover: themes[3].cover, price: 4, status: 'refunding', createTime: '2026-06-05 10:15', orderNo: 'TM2026060510150023' },
  { id: 'o3', themeId: 't6', themeTitle: '国风水墨', themeCover: themes[5].cover, price: 5, status: 'paid', createTime: '2026-06-01 20:45', orderNo: 'TM2026060120450078' },
  { id: 'o4', themeId: 't9', themeTitle: '都市霓虹', themeCover: themes[8].cover, price: 8, status: 'refunded', createTime: '2026-05-28 16:20', orderNo: 'TM2026052816200045' }
];

export const coupons: CouponItem[] = [
  { id: 'c1', title: '新人专享券', discount: 2, minAmount: 0, expireTime: '2026-12-31', isUsed: false },
  { id: 'c2', title: '满10减3', discount: 3, minAmount: 10, expireTime: '2026-07-31', isUsed: false },
  { id: 'c3', title: '节日特惠券', discount: 5, minAmount: 15, expireTime: '2026-06-30', isUsed: false },
  { id: 'c4', title: '满5减1', discount: 1, minAmount: 5, expireTime: '2026-06-15', isUsed: true }
];

export const colorFilters = ['全部', '红色', '蓝色', '绿色', '紫色', '粉色', '黄色', '黑白', '金色', '青色'];
export const styleFilters = ['全部', '简约', '清新', '暗黑', '可爱', '科技', '复古', '国风'];
export const festivalFilters = ['全部', '春节', '情人节', '清明节', '劳动节', '端午节', '中秋节', '国庆节', '圣诞节'];

export const feedbacks: FeedbackItem[] = [
  { id: 'f1', type: 'adapt', content: '小米14机型适配有问题，图标显示不完整。', images: [], rating: 3, createTime: '2026-06-10 09:30', status: 'processing' },
  { id: 'f2', type: 'suggest', content: '希望增加更多动态效果选项。', images: [], rating: 5, createTime: '2026-06-08 15:20', status: 'resolved' }
];
