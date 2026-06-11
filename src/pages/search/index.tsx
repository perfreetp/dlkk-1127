import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import TagFilter from '@/components/TagFilter';
import ThemeCard from '@/components/ThemeCard';
import EmptyState from '@/components/EmptyState';
import { themes, colorFilters, styleFilters, festivalFilters } from '@/data/mockData';

const SearchPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [color, setColor] = useState('全部');
  const [style, setStyle] = useState('全部');
  const [festival, setFestival] = useState('全部');
  const [freeOnly, setFreeOnly] = useState(false);
  const [dynamicOnly, setDynamicOnly] = useState(false);

  useEffect(() => {
    console.log('[SearchPage] mounted, total themes:', themes.length);
  }, []);

  const filteredThemes = useMemo(() => {
    let result = themes;
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(kw) ||
        t.author.toLowerCase().includes(kw) ||
        t.tags.some(tag => tag.toLowerCase().includes(kw))
      );
    }
    if (color !== '全部') result = result.filter(t => t.color === color);
    if (style !== '全部') result = result.filter(t => t.style === style);
    if (festival !== '全部') result = result.filter(t => t.festival === festival);
    if (freeOnly) result = result.filter(t => t.isFree);
    if (dynamicOnly) result = result.filter(t => t.isDynamic);
    console.log('[SearchPage] filtered count:', result.length);
    return result;
  }, [keyword, color, style, festival, freeOnly, dynamicOnly]);

  const clearKeyword = () => setKeyword('');

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder="搜索主题、作者、标签..."
          placeholderClass={styles.searchInput}
          value={keyword}
          onInput={e => setKeyword(e.detail.value)}
          confirmType="search"
        />
        {keyword && <Text className={styles.clearIcon} onClick={clearKeyword}>✕</Text>}
      </View>

      <View className={styles.filterSection}>
        <TagFilter label="颜色" tags={colorFilters} activeTag={color} onChange={setColor} />
        <TagFilter label="风格" tags={styleFilters} activeTag={style} onChange={setStyle} />
        <TagFilter label="节日" tags={festivalFilters} activeTag={festival} onChange={setFestival} />

        <View className={styles.toggleRow}>
          <Text className={styles.toggleLabel}>仅看免费</Text>
          <View
            className={`${styles.toggleSwitch} ${freeOnly ? styles.active : ''}`}
            onClick={() => setFreeOnly(!freeOnly)}
          />
        </View>

        <View className={styles.toggleRow}>
          <Text className={styles.toggleLabel}>仅看动态效果</Text>
          <View
            className={`${styles.toggleSwitch} ${dynamicOnly ? styles.active : ''}`}
            onClick={() => setDynamicOnly(!dynamicOnly)}
          />
        </View>
      </View>

      <View className={styles.resultHeader}>
        <Text className={styles.resultCount}>共找到 {filteredThemes.length} 个主题</Text>
      </View>

      {filteredThemes.length > 0 ? (
        <View className={styles.resultGrid}>
          {filteredThemes.map(t => (
            <ThemeCard key={t.id} theme={t} />
          ))}
        </View>
      ) : (
        <EmptyState icon="🔍" text="没有找到匹配的主题" />
      )}
    </ScrollView>
  );
};

export default SearchPage;
