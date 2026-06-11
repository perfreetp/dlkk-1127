import React, { useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import TagFilter from '@/components/TagFilter';
import ThemeCard from '@/components/ThemeCard';
import EmptyState from '@/components/EmptyState';
import { themes, colorFilters, styleFilters, festivalFilters } from '@/data/mockData';
import { useStore } from '@/store/useStore';

const SearchPage: React.FC = () => {
  const searchFilters = useStore(s => s.searchFilters);
  const setSearchFilters = useStore(s => s.setSearchFilters);

  const { keyword, color, style, festival, freeOnly, dynamicOnly } = searchFilters;

  useDidShow(() => {
    console.log('[SearchPage] page show, current filters:', searchFilters);
  });

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

  const hasActiveFilter = keyword || color !== '全部' || style !== '全部' || festival !== '全部' || freeOnly || dynamicOnly;

  const activeTags = [];
  if (style !== '全部') activeTags.push({ label: `风格:${style}`, key: 'style', value: style });
  if (color !== '全部') activeTags.push({ label: `颜色:${color}`, key: 'color', value: color });
  if (festival !== '全部') activeTags.push({ label: `节日:${festival}`, key: 'festival', value: festival });
  if (freeOnly) activeTags.push({ label: '免费', key: 'freeOnly', value: true });
  if (dynamicOnly) activeTags.push({ label: '动态', key: 'dynamicOnly', value: true });

  const handleRemoveTag = (key: string) => {
    switch (key) {
      case 'style': setSearchFilters({ style: '全部' }); break;
      case 'color': setSearchFilters({ color: '全部' }); break;
      case 'festival': setSearchFilters({ festival: '全部' }); break;
      case 'freeOnly': setSearchFilters({ freeOnly: false }); break;
      case 'dynamicOnly': setSearchFilters({ dynamicOnly: false }); break;
    }
  };

  const handleKeywordChange = (val: string) => {
    setSearchFilters({ keyword: val });
  };

  const handleColorChange = (tag: string) => {
    setSearchFilters({ color: tag });
  };

  const handleStyleChange = (tag: string) => {
    setSearchFilters({ style: tag });
  };

  const handleFestivalChange = (tag: string) => {
    setSearchFilters({ festival: tag });
  };

  const handleFreeToggle = () => {
    setSearchFilters({ freeOnly: !freeOnly });
  };

  const handleDynamicToggle = () => {
    setSearchFilters({ dynamicOnly: !dynamicOnly });
  };

  const clearKeyword = () => {
    setSearchFilters({ keyword: '' });
  };

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder="搜索主题、作者、标签..."
          placeholderClass={styles.searchInput}
          value={keyword}
          onInput={e => handleKeywordChange(e.detail.value)}
          confirmType="search"
        />
        {keyword && <Text className={styles.clearIcon} onClick={clearKeyword}>✕</Text>}
      </View>

      {hasActiveFilter && activeTags.length > 0 && (
        <View className={styles.activeFilters}>
          {activeTags.map(tag => (
            <Text key={tag.key} className={styles.activeTag} onClick={() => handleRemoveTag(tag.key)}>
              {tag.label} ✕
            </Text>
          ))}
          <Text className={styles.clearAll} onClick={() => useStore.getState().resetSearchFilters()}>
            清空全部
          </Text>
        </View>
      )}

      <View className={styles.filterSection}>
        <TagFilter label="颜色" tags={colorFilters} activeTag={color} onChange={handleColorChange} />
        <TagFilter label="风格" tags={styleFilters} activeTag={style} onChange={handleStyleChange} />
        <TagFilter label="节日" tags={festivalFilters} activeTag={festival} onChange={handleFestivalChange} />

        <View className={styles.toggleRow}>
          <Text className={styles.toggleLabel}>仅看免费</Text>
          <View
            className={`${styles.toggleSwitch} ${freeOnly ? styles.active : ''}`}
            onClick={handleFreeToggle}
          />
        </View>

        <View className={styles.toggleRow}>
          <Text className={styles.toggleLabel}>仅看动态效果</Text>
          <View
            className={`${styles.toggleSwitch} ${dynamicOnly ? styles.active : ''}`}
            onClick={handleDynamicToggle}
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
