import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { themes, creators } from '@/data/mockData';
import { ThemeItem, CreatorInfo } from '@/types/theme';
import { useStore } from '@/store/useStore';
import CouponPicker from '@/components/CouponPicker';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFollowed, setIsFollowed] = useState(false);
  const [couponPickerVisible, setCouponPickerVisible] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | undefined>();

  const favorite = useStore(s => s.favorite);
  const addFavorite = useStore(s => s.addFavorite);
  const removeFavorite = useStore(s => s.removeFavorite);
  const addTrial = useStore(s => s.addTrial);
  const trial = useStore(s => s.trial);
  const purchaseTheme = useStore(s => s.purchaseTheme);
  const coupons = useStore(s => s.coupons);

  const theme: ThemeItem | undefined = useMemo(() => {
    const id = router.params.id;
    const t = themes.find(th => th.id === id);
    console.log('[DetailPage] themeId:', id, 'found:', !!t);
    return t || themes[0];
  }, [router.params.id]);

  const creator: CreatorInfo | undefined = useMemo(() => {
    return creators.find(c => c.id === theme?.authorId) || creators[0];
  }, [theme]);

  const isFavorite = useMemo(() => {
    return favorite.some(f => f.id === theme?.id);
  }, [favorite, theme]);

  const isTrial = useMemo(() => {
    return trial.some(t => t.id === theme?.id);
  }, [trial, theme]);

  const finalPrice = useMemo(() => {
    if (!theme) return 0;
    if (theme.isFree) return 0;
    if (!selectedCouponId) return theme.price;
    const coupon = coupons.find(c => c.id === selectedCouponId && !c.isUsed);
    if (coupon && theme.price >= coupon.minAmount) {
      return Math.max(0, theme.price - coupon.discount);
    }
    return theme.price;
  }, [theme, selectedCouponId, coupons]);

  const savedAmount = useMemo(() => {
    if (!theme || theme.isFree) return 0;
    return theme.price - finalPrice;
  }, [theme, finalPrice]);

  useDidShow(() => {
    console.log('[DetailPage] page show, themeId:', theme?.id);
  });

  useEffect(() => {
    console.log('[DetailPage] mounted');
  }, []);

  const formatNum = (n: number) => {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
    return n.toString();
  };

  const handleFavorite = () => {
    if (!theme) return;
    if (isFavorite) {
      removeFavorite(theme.id);
      Taro.showToast({ title: '已取消收藏', icon: 'success' });
    } else {
      addFavorite(theme);
      Taro.showToast({ title: '收藏成功', icon: 'success' });
    }
  };

  const handleFollow = () => {
    setIsFollowed(!isFollowed);
    Taro.showToast({ title: isFollowed ? '已取消关注' : '关注成功', icon: 'success' });
  };

  const handleTrial = () => {
    if (!theme) return;
    if (isTrial) {
      Taro.showToast({ title: '已在试用中', icon: 'none' });
      return;
    }
    addTrial(theme);
    Taro.showToast({ title: '开始试用', icon: 'success' });
  };

  const handleBuy = () => {
    if (!theme) return;
    if (theme.isFree) {
      purchaseTheme(theme);
      Taro.showToast({ title: '下载成功', icon: 'success' });
      return;
    }
    const priceText = selectedCouponId && savedAmount > 0
      ? `原价 ¥${theme.price}，优惠券抵扣 ¥${savedAmount}，实付 ¥${finalPrice}`
      : `确定支付 ¥${theme.price} 购买该主题吗？`;
    Taro.showModal({
      title: '确认购买',
      content: priceText,
      confirmText: '立即支付',
      confirmColor: '#7C3AED',
      success: res => {
        if (res.confirm) {
          const result = purchaseTheme(theme, selectedCouponId);
          if (result.success) {
            setSelectedCouponId(undefined);
            Taro.showToast({ title: '购买成功', icon: 'success' });
          }
        }
      }
    });
  };

  const handleCouponConfirm = (couponId?: string) => {
    setSelectedCouponId(couponId);
    setCouponPickerVisible(false);
  };

  const goCreator = () => {
    if (creator) {
      Taro.navigateTo({ url: `/pages/creator/index?id=${creator.id}` });
    }
  };

  if (!theme) return null;

  return (
    <View className={styles.page}>
      <Swiper
        className={styles.previewSwiper}
        current={currentIdx}
        onChange={e => setCurrentIdx(e.detail.current)}
        circular
      >
        {theme.previews.map((p, i) => (
          <SwiperItem key={i}>
            <View className={styles.previewItem}>
              <Image className={styles.previewImg} src={p} mode="aspectFill" />
            </View>
          </SwiperItem>
        ))}
      </Swiper>
      <Text className={styles.previewIndicator}>
        {currentIdx + 1}/{theme.previews.length}
      </Text>

      <View className={styles.infoCard}>
        <View className={styles.titleRow}>
          <View className={styles.titleWrap}>
            <Text className={styles.title}>{theme.title}</Text>
            <View className={styles.tagRow}>
              {theme.isDynamic && <Text className={`${styles.tag} ${styles.dynamic}`}>✨ 动态</Text>}
              {theme.isFree && <Text className={`${styles.tag} ${styles.free}`}>免费</Text>}
              {!theme.isFree && <Text className={styles.tag}>付费</Text>}
              {theme.tags.slice(0, 2).map(tag => (
                <Text key={tag} className={styles.tag}>{tag}</Text>
              ))}
            </View>
          </View>
          <View className={styles.priceBox}>
            <Text className={`${styles.price} ${theme.isFree ? styles.free : ''}`}>
              {theme.isFree ? '免费' : `¥${finalPrice}`}
            </Text>
            {!theme.isFree && savedAmount > 0 && (
              <Text className={styles.priceLabel}>已省 ¥{savedAmount}</Text>
            )}
            {!theme.isFree && savedAmount === 0 && (
              <Text className={styles.priceLabel}>限时特惠</Text>
            )}
          </View>
        </View>

        <View className={styles.authorRow} onClick={goCreator}>
          <Image className={styles.authorAvatar} src={creator?.avatar || theme.authorAvatar} mode="aspectFill" />
          <View className={styles.authorInfo}>
            <Text className={styles.authorName}>{theme.author}</Text>
            <Text className={styles.authorStats}>
              {formatNum(creator?.followers || 0)} 粉丝 · {creator?.worksCount || 0} 作品
            </Text>
          </View>
          <Text
            className={`${styles.followBtn} ${isFollowed ? styles.followed : ''}`}
            onClick={e => { e.stopPropagation(); handleFollow(); }}
          >
            {isFollowed ? '已关注' : '+ 关注'}
          </Text>
        </View>

        <View className={styles.metaRow}>
          <View className={styles.metaItem}>
            <Text className={styles.metaNum}>{formatNum(theme.downloads)}</Text>
            <Text className={styles.metaLabel}>下载</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaNum}>{formatNum(theme.likes)}</Text>
            <Text className={styles.metaLabel}>点赞</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaNum}>{theme.rating.toFixed(1)}</Text>
            <Text className={styles.metaLabel}>评分</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaNum}>{theme.resources.icons}</Text>
            <Text className={styles.metaLabel}>图标</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📦 包含资源</Text>
        <View className={styles.resourceGrid}>
          <View className={styles.resourceItem}>
            <Text className={styles.resourceIcon}>🖼️</Text>
            <Text className={styles.resourceNum}>{theme.resources.wallpapers}</Text>
            <Text className={styles.resourceLabel}>壁纸</Text>
          </View>
          <View className={styles.resourceItem}>
            <Text className={styles.resourceIcon}>🔲</Text>
            <Text className={styles.resourceNum}>{theme.resources.icons}</Text>
            <Text className={styles.resourceLabel}>图标</Text>
          </View>
          <View className={styles.resourceItem}>
            <Text className={styles.resourceIcon}>🔒</Text>
            <Text className={styles.resourceNum}>{theme.resources.lockScreen ? '✓' : '✗'}</Text>
            <Text className={styles.resourceLabel}>锁屏</Text>
          </View>
          <View className={styles.resourceItem}>
            <Text className={styles.resourceIcon}>🧩</Text>
            <Text className={styles.resourceNum}>{theme.resources.widgets}</Text>
            <Text className={styles.resourceLabel}>组件</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📱 适配机型</Text>
        <View className={styles.modelTags}>
          {theme.compatibleModels.map(m => (
            <Text key={m} className={styles.modelTag}>{m}</Text>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📝 作者说明</Text>
        <Text className={styles.sectionText}>{theme.description}</Text>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.actionBtn} onClick={handleFavorite}>
          <Text className={styles.actionIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          <Text className={styles.actionText}>{isFavorite ? '已收藏' : '收藏'}</Text>
        </View>
        {!theme.isFree && (
          <View className={styles.actionBtn} onClick={() => setCouponPickerVisible(true)}>
            <Text className={styles.actionIcon}>🎫</Text>
            <Text className={styles.actionText}>
              {selectedCouponId ? '已选券' : '优惠券'}
            </Text>
          </View>
        )}
        <View className={styles.trialBtn} onClick={handleTrial}>
          {isTrial ? '试用中' : '试用'}
        </View>
        <View className={`${styles.buyBtn} ${theme.isFree ? styles.free : ''}`} onClick={handleBuy}>
          {theme.isFree ? '免费下载' : `¥${finalPrice} 购买`}
        </View>
      </View>

      <CouponPicker
        visible={couponPickerVisible}
        coupons={coupons}
        selectedId={selectedCouponId}
        price={theme.price}
        onConfirm={handleCouponConfirm}
        onClose={() => setCouponPickerVisible(false)}
      />
    </View>
  );
};

export default DetailPage;
