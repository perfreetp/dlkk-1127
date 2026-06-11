import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface SectionHeaderProps {
  title: string;
  subTitle?: string;
  moreText?: string;
  moreUrl?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subTitle, moreText, moreUrl }) => {
  const handleMore = () => {
    if (moreUrl) {
      Taro.navigateTo({ url: moreUrl });
    }
  };

  return (
    <View className={styles.header}>
      <View className={styles.left}>
        <Text className={styles.title}>{title}</Text>
        {subTitle && <Text className={styles.subTitle}>{subTitle}</Text>}
      </View>
      {moreText && (
        <View className={styles.more} onClick={handleMore}>
          <Text>{moreText}</Text>
          <Text className={styles.arrow}>›</Text>
        </View>
      )}
    </View>
  );
};

export default SectionHeader;
