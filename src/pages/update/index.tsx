import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useStore } from '@/store/useStore';
import { ThemeItem } from '@/types/theme';
import EmptyState from '@/components/EmptyState';

const UpdatePage: React.FC = () => {
  const updateAvailable = useStore(s => s.updateAvailable);
  const updateTheme = useStore(s => s.updateTheme);
  const updateAllThemes = useStore(s => s.updateAllThemes);

  const [updatingIds, setUpdatingIds] = useState<string[]>([]);

  useEffect(() => {
    console.log('[UpdatePage] mounted, update count:', updateAvailable.length);
  }, [updateAvailable.length]);

  const handleUpdateOne = (theme: ThemeItem) => {
    if (updatingIds.includes(theme.id)) return;

    setUpdatingIds(prev => [...prev, theme.id]);
    Taro.showLoading({ title: '更新中...' });

    setTimeout(() => {
      Taro.hideLoading();
      updateTheme(theme.id);
      setUpdatingIds(prev => prev.filter(id => id !== theme.id));
      Taro.showToast({ title: '更新成功', icon: 'success' });
    }, 800);
  };

  const handleUpdateAll = () => {
    if (updateAvailable.length === 0) return;

    const ids = updateAvailable.map(t => t.id);
    setUpdatingIds(ids);
    Taro.showLoading({ title: '正在批量更新...' });

    setTimeout(() => {
      Taro.hideLoading();
      updateAllThemes();
      setUpdatingIds([]);
      Taro.showToast({ title: '全部更新完成', icon: 'success' });
    }, 1200);
  };

  const goDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.headerCard}>
        <View className={styles.headerInfo}>
          <Text className={styles.headerTitle}>
            {updateAvailable.length > 0
              ? `有 ${updateAvailable.length} 个主题可更新`
              : '暂无主题更新'}
          </Text>
          <Text className={styles.headerDesc}>
            更新后可体验最新功能和优化
          </Text>
        </View>
        {updateAvailable.length > 0 && (
          <View className={styles.updateAllBtn} onClick={handleUpdateAll}>
            全部更新
          </View>
        )}
      </View>

      {updateAvailable.length > 0 ? (
        <View className={styles.updateList}>
          {updateAvailable.map(theme => (
            <View
              key={theme.id}
              className={styles.updateItem}
              onClick={() => goDetail(theme.id)}
            >
              <Image className={styles.themeCover} src={theme.cover} mode="aspectFill" />
              <View className={styles.themeInfo}>
                <Text className={styles.themeName}>{theme.title}</Text>
                <Text className={styles.themeDesc}>{theme.author}</Text>
                <Text className={styles.updateInfo}>新版优化性能表现</Text>
              </View>
              <View
                className={`${styles.updateBtn} ${updatingIds.includes(theme.id) ? styles.updating : ''}`}
                onClick={e => { e.stopPropagation(); handleUpdateOne(theme); }}
              >
                {updatingIds.includes(theme.id) ? '更新中' : '更新'}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <EmptyState icon="✅" text="所有主题都是最新版" />
      )}
    </ScrollView>
  );
};

export default UpdatePage;
