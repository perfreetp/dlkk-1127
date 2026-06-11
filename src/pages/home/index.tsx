import React, { useState, useEffect } from 'react';
import { View, Text, Image, Swiper, SwiperItem, ScrollView, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import SectionHeader from '@/components/SectionHeader';
import ThemeCard from '@/components/ThemeCard';
import { banners, styleChannels, rankingList, dynamicThemes, newArrivals, themes } from '@/data/mockData';
import { ThemeItem } from '@/types/theme';
import { useStore } from '@/store/useStore';

const HomePage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const setSearchFilters = useStore(s => s.setSearchFilters);

  useDidShow(() => {
    console.log('[HomePage] page show');
  });

  useEffect(() => {
    console.log('[HomePage] mounted, themes count:', themes.length);
  }, []);

  const handleSearch = () => {
    Taro.switchTab({ url: '/pages/search/index' });
  };

  const handleChannelClick = (channelId: string, channelName: string) => {
    if (channelName === '全部') {
      setSearchFilters({ style: '全部' });
    } else {
      setSearchFilters({ style: channelName });
    }
    Taro.switchTab({ url: '/pages/search/index' });
  };

  const handleRankingClick = (theme: ThemeItem) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${theme.id}` });
  };

  const formatNum = (n: number) => {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
    return n.toString();
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  };

  useEffect(() => {
    if (refreshing) onRefresh();
  }, [refreshing]);

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <Text className={styles.logo}>🎨 主题市场</Text>
        </View>
        <View className={styles.searchBar} onClick={handleSearch}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索主题、风格、作者..."
            placeholderClass={styles.searchInput}
            value={searchText}
            onInput={e => setSearchText(e.detail.value)}
            onConfirm={handleSearch}
          />
        </View>
      </View>

      <View className={styles.content}>
        <Swiper
          className={styles.banner}
          indicatorDots
          autoplay
          circular
          indicatorColor="rgba(255,255,255,0.5)"
          indicatorActiveColor="#FFFFFF"
        >
          {banners.map(b => (
            <SwiperItem key={b.id} onClick={() => b.themeId && handleRankingClick(themes.find(t => t.id === b.themeId)!)}>
              <View className={styles.bannerItem}>
                <Image className={styles.bannerImg} src={b.image} mode="aspectFill" />
                <Text className={styles.bannerTitle}>{b.title}</Text>
              </View>
            </SwiperItem>
          ))}
        </Swiper>

        <View className={styles.channels}>
          {styleChannels.map(c => (
            <View key={c.id} className={styles.channelItem} onClick={() => handleChannelClick(c.id, c.name)}>
              <View className={styles.channelIcon} style={{ background: `${c.color}15` }}>
                <Text>{c.icon}</Text>
              </View>
              <Text className={styles.channelName}>{c.name}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="套装榜单" subTitle="TOP 8" moreText="查看全部" />
        <View className={styles.ranking}>
          {rankingList.slice(0, 5).map(item => (
            <View
              key={item.id}
              className={styles.rankingItem}
              onClick={() => handleRankingClick(item.theme)}
            >
              <Text className={`${styles.rankNum} ${item.rank <= 3 ? `top${item.rank}` : ''}`}>
                {item.rank}
              </Text>
              <Image className={styles.rankCover} src={item.theme.cover} mode="aspectFill" />
              <View className={styles.rankInfo}>
                <Text className={styles.rankTitle}>{item.theme.title}</Text>
                <View className={styles.rankMeta}>
                  <Text>{item.theme.author}</Text>
                  <Text>↓{formatNum(item.theme.downloads)}</Text>
                  <Text className={`${styles.trend} ${item.trend}`}>
                    {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '—'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <SectionHeader title="🔥 动态主题" subTitle="炫酷动效" moreText="更多" />
        <ScrollView className={styles.horizScroll} scrollX enhanced showScrollbar={false}>
          <View className={styles.scrollWrap}>
            {dynamicThemes.map(t => (
              <View key={t.id} className={styles.scrollItem}>
                <ThemeCard theme={t} />
              </View>
            ))}
          </View>
        </ScrollView>

        <SectionHeader title="✨ 新品上架" subTitle="每日更新" moreText="更多" />
        <ScrollView className={styles.horizScroll} scrollX enhanced showScrollbar={false}>
          <View className={styles.scrollWrap}>
            {newArrivals.map(t => (
              <View key={t.id} className={styles.scrollItem}>
                <ThemeCard theme={t} />
              </View>
            ))}
          </View>
        </ScrollView>

        <SectionHeader title="为你推荐" subTitle="个性化精选" />
        <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24rpx' }}>
          {themes.slice(0, 6).map(t => (
            <ThemeCard key={t.id} theme={t} />
          ))}
        </View>
      </View>
    </View>
  );
};

export default HomePage;
