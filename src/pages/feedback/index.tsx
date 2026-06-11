import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { FeedbackItem, ThemeItem } from '@/types/theme';
import EmptyState from '@/components/EmptyState';
import { useStore } from '@/store/useStore';
import { themes } from '@/data/mockData';

type FeedbackType = 'adapt' | 'bug' | 'suggest' | 'infringement';

const typeOptions: { key: FeedbackType; label: string }[] = [
  { key: 'adapt', label: '📱 适配问题' },
  { key: 'bug', label: '🐛 功能异常' },
  { key: 'suggest', label: '💡 意见建议' },
  { key: 'infringement', label: '⚖️ 侵权投诉' }
];

const statusMap: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决'
};

const FeedbackPage: React.FC = () => {
  const [type, setType] = useState<FeedbackType>('adapt');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeItem | null>(null);
  const [themePickerVisible, setThemePickerVisible] = useState(false);

  const feedbacks = useStore(s => s.feedbacks);
  const addFeedback = useStore(s => s.addFeedback);
  const purchased = useStore(s => s.purchased);
  const downloaded = useStore(s => s.downloaded);

  useDidShow(() => {
    console.log('[FeedbackPage] page show, feedbacks count:', feedbacks.length);
  });

  const needTheme = type === 'adapt' || type === 'infringement';

  const selectableThemes = useMemo(() => {
    if (purchased.length > 0 || downloaded.length > 0) {
      const ids = new Set<string>();
      const result: ThemeItem[] = [];
      [...purchased, ...downloaded].forEach(t => {
        if (!ids.has(t.id)) {
          ids.add(t.id);
          result.push(t);
        }
      });
      return result;
    }
    return themes.slice(0, 6);
  }, [purchased, downloaded]);

  const handleQuickClick = (quickType: FeedbackType) => {
    setType(quickType);
    if (quickType !== 'adapt' && quickType !== 'infringement') {
      setSelectedTheme(null);
    }
  };

  const handleUpload = () => {
    if (images.length >= 6) {
      Taro.showToast({ title: '最多上传6张图片', icon: 'none' });
      return;
    }
    Taro.chooseImage({
      count: 6 - images.length,
      success: res => {
        console.log('[FeedbackPage] upload images:', res.tempFilePaths.length);
        setImages([...images, ...res.tempFilePaths]);
      },
      fail: err => {
        console.error('[FeedbackPage] chooseImage failed:', err);
      }
    });
  };

  const handleRemoveImg = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSelectTheme = (theme: ThemeItem) => {
    setSelectedTheme(theme);
    setThemePickerVisible(false);
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      Taro.showToast({ title: '请输入反馈内容', icon: 'none' });
      return;
    }
    if (needTheme && !selectedTheme) {
      Taro.showToast({ title: '请选择关联主题', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      addFeedback({
        type,
        content: content.trim(),
        images,
        rating,
        themeId: selectedTheme?.id,
        themeTitle: selectedTheme?.title
      });
      Taro.showToast({ title: '提交成功', icon: 'success' });
      setContent('');
      setImages([]);
      setRating(5);
      setSelectedTheme(null);
    }, 500);
  };

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.quickCard}>
        {typeOptions.map(opt => (
          <View key={opt.key} className={styles.quickItem} onClick={() => handleQuickClick(opt.key)}>
            <View className={styles.quickIcon}>
              <Text>{opt.label.split(' ')[0]}</Text>
            </View>
            <Text className={styles.quickText}>{opt.label.split(' ')[1]}</Text>
          </View>
        ))}
      </View>

      <View className={styles.formCard}>
        <View className={styles.formSection}>
          <Text className={styles.formLabel}>问题类型</Text>
          <View className={styles.typeList}>
            {typeOptions.map(opt => (
              <Text
                key={opt.key}
                className={`${styles.typeItem} ${type === opt.key ? styles.active : ''}`}
                onClick={() => setType(opt.key)}
              >
                {opt.label}
              </Text>
            ))}
          </View>
        </View>

        {needTheme && (
          <View className={styles.formSection}>
            <Text className={styles.formLabel}>关联主题</Text>
            <View
              className={styles.themeSelector}
              onClick={() => setThemePickerVisible(true)}
            >
              {selectedTheme ? (
                <View className={styles.selectedTheme}>
                  <Image className={styles.selectedThemeCover} src={selectedTheme.cover} mode="aspectFill" />
                  <Text className={styles.selectedThemeName}>{selectedTheme.title}</Text>
                </View>
              ) : (
                <Text className={styles.selectPlaceholder}>请选择要反馈的主题</Text>
              )}
              <Text className={styles.selectArrow}>›</Text>
            </View>
          </View>
        )}

        <View className={styles.formSection}>
          <Text className={styles.formLabel}>问题描述</Text>
          <Textarea
            className={styles.textarea}
            placeholder="请详细描述您遇到的问题或建议..."
            placeholderStyle="color: #86909C;"
            value={content}
            onInput={e => setContent(e.detail.value)}
            maxlength={500}
          />
        </View>

        <View className={styles.formSection}>
          <Text className={styles.formLabel}>上传截图（最多6张）</Text>
          <View className={styles.uploadGrid}>
            {images.map((img, i) => (
              <View key={i} className={styles.uploadItem} onClick={() => handleRemoveImg(i)}>
                <Image className={styles.uploadImg} src={img} mode="aspectFill" />
              </View>
            ))}
            {images.length < 6 && (
              <View className={styles.uploadItem} onClick={handleUpload}>
                <View className={styles.uploadAdd}>
                  <Text className={styles.uploadAddIcon}>+</Text>
                  <Text className={styles.uploadAddText}>上传</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View className={styles.formSection}>
          <Text className={styles.formLabel}>整体评分</Text>
          <View className={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <Text
                key={n}
                className={`${styles.star} ${n <= rating ? styles.active : ''}`}
                onClick={() => setRating(n)}
              >
                ★
              </Text>
            ))}
          </View>
        </View>

        <View
          className={`${styles.submitBtn} ${!content.trim() ? styles.disabled : ''}`}
          onClick={handleSubmit}
        >
          提交反馈
        </View>
      </View>

      <View className={styles.historySection}>
        <View className={styles.historyHeader}>
          <Text className={styles.historyTitle}>历史反馈</Text>
          <Text className={styles.historyCount}>共 {feedbacks.length} 条</Text>
        </View>
        {feedbacks.length > 0 ? (
          feedbacks.map((f: FeedbackItem) => (
            <View key={f.id} className={styles.historyCard}>
              <Text className={styles.historyType}>
                {typeOptions.find(o => o.key === f.type)?.label || f.type}
              </Text>
              {f.themeTitle && (
                <Text className={styles.historyTheme}>关联主题：{f.themeTitle}</Text>
              )}
              <Text className={styles.historyText}>{f.content}</Text>
              <View className={styles.historyMeta}>
                <Text className={styles.historyTime}>{f.createTime}</Text>
                <Text className={`${styles.historyStatus} ${styles[f.status]}`}>
                  {statusMap[f.status]}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState icon="📝" text="暂无反馈记录" />
        )}
      </View>

      {themePickerVisible && (
        <View className={styles.pickerMask} onClick={() => setThemePickerVisible(false)}>
          <View className={styles.pickerPanel} onClick={e => e.stopPropagation()}>
            <View className={styles.pickerHeader}>
              <Text className={styles.pickerTitle}>选择主题</Text>
              <Text className={styles.pickerClose} onClick={() => setThemePickerVisible(false)}>✕</Text>
            </View>
            <ScrollView className={styles.pickerList} scrollY enhanced showScrollbar={false}>
              {selectableThemes.map(theme => (
                <View
                  key={theme.id}
                  className={`${styles.pickerItem} ${selectedTheme?.id === theme.id ? styles.pickerItemActive : ''}`}
                  onClick={() => handleSelectTheme(theme)}
                >
                  <Image className={styles.pickerItemCover} src={theme.cover} mode="aspectFill" />
                  <Text className={styles.pickerItemName}>{theme.title}</Text>
                  {selectedTheme?.id === theme.id && <Text className={styles.pickerCheck}>✓</Text>}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default FeedbackPage;
