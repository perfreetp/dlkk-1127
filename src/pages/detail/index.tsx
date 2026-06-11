import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { themes, creators } from '@/data/mockData';
import { ThemeItem, CreatorInfo } from '@/types/theme';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  const theme: ThemeItem | undefined = useMemo(() => {
    const id = router.params.id;
    const t = themes.find(th => th.id === id);
    console.log('[DetailPage] themeId:', id, 'found:', !!t);
    return t || themes[0];
  }, [router.params.id]);

  const creator: CreatorInfo | undefined = useMemo(() => {
    return creators.find(c => c.id === theme?.authorId) || creators[0];
  }, [theme]);

  const formatNum = (n: number) => {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
    return n.toString();
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    Taro.showToast({ title: isFavorite ? '已取消收藏' : '收藏成功', icon: 'success' });
  };

  const handleFollow = () => {
    setIsFollowed(!isFollowed);
    Taro.showToast({ title: isFollowed ? '已取消关注' : '关注成功', icon: 'success' });
  };

  const handleTrial = () => {
    Taro.showToast({ title: '开始试用', icon: 'success' });
  };

  const handleBuy = () => {
    if (theme?.isFree) {
      Taro.showToast({ title: '下载成功', icon: 'success' });
    } else {
      Taro.showModal({
        title: '确认购买',
        content: `确定支付 ¥${theme?.price} 购买该主题吗？`,
        confirmText: '立即支付',
        confirmColor: '#7C3AED',
        success: res => {
          if (res.confirm) {
            Taro.showToast({ title: '购买成功', icon: 'success' });
          }
        }
      });
    }
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
              {theme.isFree ? '免费' : `¥${theme.price}`}
            </Text>
            <Text className={styles.priceLabel}>{theme.isFree ? '立即下载' : '限时特惠'}</Text>
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
        <View className={styles.trialBtn} onClick={handleTrial}>试用</View>
        <View className={`${styles.buyBtn} ${theme.isFree ? styles.free : ''}`} onClick={handleBuy}>
          {theme.isFree ? '免费下载' : `¥${theme.price} 购买`}
        </View>
      </View>
    </View>
  );
};

export default DetailPage;
