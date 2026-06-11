import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { creators, themes } from '@/data/mockData';
import { CreatorInfo, ThemeItem } from '@/types/theme';

const mockComments = [
  { id: 'c1', name: '用户A', avatar: 'https://picsum.photos/id/91/100/100', rating: 5, text: '主题太美了！动态效果非常炫酷，身边朋友都在问在哪里买的~', time: '2天前' },
  { id: 'c2', name: '用户B', avatar: 'https://picsum.photos/id/177/100/100', rating: 4, text: '壁纸质量很高，图标也很精致，期待更多作品！', time: '5天前' },
  { id: 'c3', name: '用户C', avatar: 'https://picsum.photos/id/338/100/100', rating: 5, text: '已经是第三套了，每一套都超喜欢，支持！', time: '1周前' }
];

const CreatorPage: React.FC = () => {
  const router = useRouter();
  const [isFollowed, setIsFollowed] = useState(false);

  const creator: CreatorInfo = useMemo(() => {
    const id = router.params.id;
    const c = creators.find(x => x.id === id);
    console.log('[CreatorPage] creatorId:', id, 'found:', !!c);
    return c || creators[0];
  }, [router.params.id]);

  const works: ThemeItem[] = useMemo(() => {
    return themes.filter(t => t.authorId === creator.id);
  }, [creator]);

  useEffect(() => {
    console.log('[CreatorPage] mounted, creator:', creator.name);
  }, [creator]);

  const formatNum = (n: number) => {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
    return n.toString();
  };

  const handleFollow = () => {
    setIsFollowed(!isFollowed);
    Taro.showToast({ title: isFollowed ? '已取消关注' : '关注成功', icon: 'success' });
  };

  const handleReward = () => {
    Taro.showActionSheet({
      itemList: ['打赏 1 元', '打赏 5 元', '打赏 10 元', '打赏 50 元'],
      success: res => {
        Taro.showToast({ title: '打赏成功，感谢支持！', icon: 'success' });
      }
    });
  };

  const goDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.header}>
        <View className={styles.profile}>
          <Image className={styles.avatar} src={creator.avatar} mode="aspectFill" />
          <View className={styles.profileInfo}>
            <Text className={styles.name}>{creator.name}</Text>
            <Text className={styles.bio}>{creator.bio}</Text>
          </View>
          <Text
            className={`${styles.followBtn} ${isFollowed ? styles.followed : ''}`}
            onClick={handleFollow}
          >
            {isFollowed ? '已关注' : '+ 关注'}
          </Text>
        </View>
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{formatNum(creator.followers)}</Text>
            <Text className={styles.statLabel}>粉丝</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{creator.worksCount}</Text>
            <Text className={styles.statLabel}>作品</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{formatNum(creator.totalDownloads)}</Text>
            <Text className={styles.statLabel}>总下载</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.actionRow}>
          <View className={styles.actionItem}>
            <Text className={styles.actionIcon}>💬</Text>
            <Text className={styles.actionText}>私信</Text>
          </View>
          <View className={styles.actionItem} onClick={handleReward}>
            <Text className={styles.actionIcon}>💰</Text>
            <Text className={styles.actionText}>打赏</Text>
          </View>
          <View className={styles.actionItem}>
            <Text className={styles.actionIcon}>⭐</Text>
            <Text className={styles.actionText}>{creator.rating.toFixed(1)}分</Text>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>作品集</Text>
            <Text className={styles.sectionMore}>查看全部 ›</Text>
          </View>
          <View className={styles.worksGrid}>
            {works.slice(0, 6).map(w => (
              <View key={w.id} className={styles.workItem} onClick={() => goDetail(w.id)}>
                <Image className={styles.workCover} src={w.cover} mode="aspectFill" />
                <View className={styles.workInfo}>
                  <Text className={styles.workTitle}>{w.title}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>用户评论</Text>
            <Text className={styles.sectionMore}>查看全部 ›</Text>
          </View>
          <View className={styles.commentList}>
            {mockComments.map(c => (
              <View key={c.id} className={styles.commentItem}>
                <Image className={styles.commentAvatar} src={c.avatar} mode="aspectFill" />
                <View className={styles.commentContent}>
                  <View className={styles.commentTop}>
                    <Text className={styles.commentName}>{c.name}</Text>
                    <Text className={styles.commentRating}>{'★'.repeat(c.rating)}</Text>
                  </View>
                  <Text className={styles.commentText}>{c.text}</Text>
                  <Text className={styles.commentTime}>{c.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default CreatorPage;
