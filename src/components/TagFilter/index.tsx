import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface TagFilterProps {
  label?: string;
  tags: string[];
  activeTag: string;
  onChange: (tag: string) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ label, tags, activeTag, onChange }) => {
  return (
    <View className={styles.wrap}>
      {label && <Text className={styles.label}>{label}</Text>}
      <View className={styles.tags}>
        {tags.map(tag => (
          <Text
            key={tag}
            className={`${styles.tag} ${activeTag === tag ? styles.active : ''}`}
            onClick={() => onChange(tag)}
          >
            {tag}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default TagFilter;
