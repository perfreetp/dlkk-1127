import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { ThemeItem } from '@/types/theme';

interface ThemeCardProps {
  theme: ThemeItem;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme }) => {
  const handleClick = () => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${theme.id}` });
  };

  const formatNum = (n: number) => {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
    return n.toString();
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.coverWrap}>
        <Image className={styles.cover} src={theme.cover} mode="aspectFill" />
        {theme.isDynamic && <Text className={`${styles.tag} ${styles.dynamic}`}>动态</Text>}
        {theme.isNew && !theme.isDynamic && <Text className={`${styles.tag} ${styles.new}`}>新品</Text>}
        {theme.isFree && !theme.isDynamic && !theme.isNew && <Text className={`${styles.tag} ${styles.free}`}>免费</Text>}
      </View>
      <View className={styles.info}>
        <Text className={styles.title}>{theme.title}</Text>
        <Text className={styles.author}>{theme.author}</Text>
        <View className={styles.bottom}>
          <Text className={`${styles.price} ${theme.isFree ? styles.free : ''}`}>
            {theme.isFree ? '免费' : `¥${theme.price}`}
          </Text>
          <View className={styles.stats}>
            <Text>↓{formatNum(theme.downloads)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ThemeCard;
