import React, { useState, useMemo } from 'react';
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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const purchased = useStore(s => s.purchased);
  const downloaded = useStore(s => s.downloaded);
  const trial = useStore(s => s.trial);
  const favorite = useStore(s => s.favorite);
  const updateAvailable = useStore(s => s.updateAvailable);
  const downloadStates = useStore(s => s.downloadStates);
  const downloadTheme = useStore(s => s.downloadTheme);
  const removeLocalTheme = useStore(s => s.removeLocalTheme);
  const isFavorite = useStore(s => s.isFavorite);
  const removeFavorite = useStore(s => s.removeFavorite);
  const addFavorite = useStore(s => s.addFavorite);

  useDidShow(() => {
    console.log('[MinePage] page show');
  });

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

  const handleDownload = (theme: ThemeItem) => {
    setDownloadingId(theme.id);
    setTimeout(() => {
      downloadTheme(theme.id);
      setDownloadingId(null);
      Taro.showToast({ title: '下载成功', icon: 'success' });
    }, 800);
  };

  const handleRemoveLocal = (theme: ThemeItem) => {
    Taro.showModal({
      title: '删除本地资源',
      content: `确定要删除「${theme.title}」的本地资源吗？已购记录不会丢失，需要时可重新下载。`,
      confirmText: '删除',
      confirmColor: '#EF4444',
      success: res => {
        if (res.confirm) {
          removeLocalTheme(theme.id);
          Taro.showToast({ title: '已删除本地资源', icon: 'none' });
        }
      }
    });
  };

  const handleToggleFavorite = (theme: ThemeItem) => {
    if (isFavorite(theme.id)) {
      removeFavorite(theme.id);
      Taro.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      addFavorite(theme);
      Taro.showToast({ title: '已加入收藏', icon: 'success' });
    }
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

  const localCount = useMemo(() => {
    return Object.values(downloadStates).filter(s => s.isLocal).length;
  }, [downloadStates]);

  const getCountByTab = (key: TabKey) => {
    switch (key) {
      case 'purchased': return purchased.length;
      case 'downloaded': return localCount;
      case 'trial': return trial.length;
      case 'favorite': return favorite.length;
      default: return 0;
    }
  };

  const getDownloadState = (themeId: string) => downloadStates[themeId];

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
            <Text className={styles.statLabel}>本地</Text>
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
                <Text className={styles.tabCount}>({getCountByTab(tab.key)})</Text>
              </Text>
            ))}
          </View>

          {currentList.length > 0 ? (
            <View className={styles.themeList}>
              {currentList.map(theme => {
                const ds = getDownloadState(theme.id);
                const isLocal = ds?.isLocal;
                const isDownloading = downloadingId === theme.id;
                const fav = isFavorite(theme.id);
                const isPurchased = purchased.some(p => p.id === theme.id);
                return (
                  <View key={theme.id} className={styles.themeRow}>
                    <View
                      className={styles.themeRowMain}
                      onClick={() => goDetail(theme.id)}
                    >
                      <Image className={styles.rowCover} src={theme.cover} mode="aspectFill" />
                      <View className={styles.rowInfo}>
                        <Text className={styles.rowTitle}>{theme.title}</Text>
                        <Text className={styles.rowMeta}>
                          {theme.author} · {theme.style}
                        </Text>
                        <View className={styles.rowTags}>
                          {theme.isDynamic && <Text className={styles.rowTag}>动态</Text>}
                          {theme.isFree ? (
                            <Text className={styles.rowTagFree}>免费</Text>
                          ) : (
                            <Text className={styles.rowTagPrice}>¥{theme.price}</Text>
                          )}
                          {isLocal && (
                            <Text className={styles.rowTagLocal}>本地 {ds?.size || ''}</Text>
                          )}
                          {activeTab === 'trial' && (
                            <Text className={styles.rowTagTrial}>试用中</Text>
                          )}
                        </View>
                      </View>
                    </View>

                    <View className={styles.rowActions}>
                      {(activeTab === 'purchased' || activeTab === 'downloaded') && (
                        <>
                          {!isLocal ? (
                            <Text
                              className={`${styles.actionBtn} ${styles.actionPrimary}`}
                              onClick={() => handleDownload(theme)}
                            >
                              {isDownloading ? '下载中...' : activeTab === 'downloaded' ? '重新下载' : '下载'}
                            </Text>
                          ) : (
                            <Text
                              className={`${styles.actionBtn} ${styles.actionDanger}`}
                              onClick={() => handleRemoveLocal(theme)}
                            >
                              删除本地
                            </Text>
                          )}
                        </>
                      )}

                      {activeTab === 'favorite' && (
                        <Text
                          className={`${styles.actionBtn} ${fav ? styles.actionWarn : styles.actionPrimary}`}
                          onClick={() => handleToggleFavorite(theme)}
                        >
                          {fav ? '取消收藏' : '加入收藏'}
                        </Text>
                      )}

                      {activeTab === 'trial' && !isPurchased && (
                        <Text
                          className={`${styles.actionBtn} ${styles.actionPrimary}`}
                          onClick={() => goDetail(theme.id)}
                        >
                          立即购买
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
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
