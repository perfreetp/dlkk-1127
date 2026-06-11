import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import EmptyState from '@/components/EmptyState';
import { myThemes } from '@/data/mockData';
import { ThemeItem } from '@/types/theme';

type TabKey = 'purchased' | 'downloaded' | 'trial' | 'favorite';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'purchased', label: '已购' },
  { key: 'downloaded', label: '已下载' },
  { key: 'trial', label: '试用中' },
  { key: 'favorite', label: '收藏夹' }
];

const MinePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('purchased');

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

  const currentList: ThemeItem[] = myThemes[activeTab];

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
            <Text className={styles.statNum}>{myThemes.purchased.length}</Text>
            <Text className={styles.statLabel}>已购</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{myThemes.downloaded.length}</Text>
            <Text className={styles.statLabel}>已下载</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{myThemes.trial.length}</Text>
            <Text className={styles.statLabel}>试用中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{myThemes.favorite.length}</Text>
            <Text className={styles.statLabel}>收藏</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        {myThemes.updateAvailable.length > 0 && (
          <View className={styles.sectionCard} onClick={goDetail}>
            <View className={styles.menuItem}>
              <View className={styles.menuIcon}>🔄</View>
              <Text className={styles.menuText}>
                {myThemes.updateAvailable.length} 个主题可更新
              </Text>
              <View className={styles.badge}>{myThemes.updateAvailable.length}</View>
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
