import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import EmptyState from '@/components/EmptyState';
import { ThemeItem } from '@/types/theme';
import { useStore } from '@/store/useStore';

type TabKey = 'purchased' | 'downloaded' | 'trial' | 'favorite';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'purchased', label: '已购' },
  { key: 'downloaded', label: '已下载' },
  { key: 'trial', label: '试用中' },
  { key: 'favorite', label: '收藏夹' }
];

const MinePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('purchased');

  const purchased = useStore(s => s.purchased);
  const downloaded = useStore(s => s.downloaded);
  const trial = useStore(s => s.trial);
  const favorite = useStore(s => s.favorite);
  const updateAvailable = useStore(s => s.updateAvailable);

  useDidShow(() => {
    console.log('[MinePage] page show, purchased:', purchased.length, 'favorite:', favorite.length);
  });

  useEffect(() => {
    console.log('[MinePage] mounted');
  }, []);

  const goDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  const goCreator = () => {
    Taro.navigateTo({ url: '/pages/creator/index?id=a1' });
  };

  const goOrder = () => {
    Taro.navigateTo({ url: '/pages/order/index' });
  };

  const goFeedback = () => {
    Taro.navigateTo({ url: '/pages/feedback/index' });
  };

  const goUpdate = () => {
    Taro.navigateTo({ url: '/pages/update/index' });
  };

  const getListByTab = (): ThemeItem[] => {
    switch (activeTab) {
      case 'purchased': return purchased;
      case 'downloaded': return downloaded;
      case 'trial': return trial;
      case 'favorite': return favorite;
      default: return [];
    }
  };

  const currentList = getListByTab();

  const getCountByTab = (key: TabKey) => {
    switch (key) {
      case 'purchased': return purchased.length;
      case 'downloaded': return downloaded.length;
      case 'trial': return trial.length;
      case 'favorite': return favorite.length;
      default: return 0;
    }
  };

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image className={styles.avatar} src="https://picsum.photos/id/64/200/200" mode="aspectFill" />
          <View className={styles.userText}>
            <Text className={styles.userName}>主题爱好者</Text>
            <Text className={styles.userId}>ID: TM_10086</Text>
          </View>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{getCountByTab('purchased')}</Text>
            <Text className={styles.statLabel}>已购</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{getCountByTab('downloaded')}</Text>
            <Text className={styles.statLabel}>已下载</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{getCountByTab('trial')}</Text>
            <Text className={styles.statLabel}>试用中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{getCountByTab('favorite')}</Text>
            <Text className={styles.statLabel}>收藏</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        {updateAvailable.length > 0 && (
          <View className={styles.sectionCard} onClick={goUpdate}>
            <View className={styles.menuItem}>
              <View className={styles.menuIcon}>🔄</View>
              <Text className={styles.menuText}>
                {updateAvailable.length} 个主题可更新
              </Text>
              <View className={styles.badge}>{updateAvailable.length}</View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        )}

        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>我的主题</Text>
          <View className={styles.tabs}>
            {tabs.map(tab => (
              <Text
                key={tab.key}
                className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </Text>
            ))}
          </View>
          {currentList.length > 0 ? (
            <View className={styles.listContent}>
              {currentList.map(theme => (
                <View key={theme.id} className={styles.miniCard} onClick={() => goDetail(theme.id)}>
                  <Image className={styles.miniCover} src={theme.cover} mode="aspectFill" />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState icon="📂" text="暂无主题" />
          )}
        </View>

        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>常用功能</Text>
          <View className={styles.menuItem} onClick={goCreator}>
            <View className={styles.menuIcon}>🎨</View>
            <Text className={styles.menuText}>创作者中心</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={goOrder}>
            <View className={styles.menuIcon}>📋</View>
            <Text className={styles.menuText}>我的订单</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={goFeedback}>
            <View className={styles.menuIcon}>💬</View>
            <Text className={styles.menuText}>客服与反馈</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
