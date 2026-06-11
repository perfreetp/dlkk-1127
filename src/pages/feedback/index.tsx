import React, { useState, useEffect } from 'react';
import { View, Text, Image, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { feedbacks } from '@/data/mockData';
import { FeedbackItem } from '@/types/theme';
import EmptyState from '@/components/EmptyState';

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

  useEffect(() => {
    console.log('[FeedbackPage] mounted, history count:', feedbacks.length);
  }, []);

  const handleQuickClick = (quickType: FeedbackType) => {
    setType(quickType);
    Taro.showToast({ title: `已选择${typeOptions.find(o => o.key === quickType)?.label}`, icon: 'none' });
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

  const handleSubmit = () => {
    if (!content.trim()) {
      Taro.showToast({ title: '请输入反馈内容', icon: 'none' });
      return;
    }
    console.log('[FeedbackPage] submit:', { type, content, rating, images });
    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '提交成功', icon: 'success' });
      setContent('');
      setImages([]);
      setRating(5);
    }, 1000);
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
        </View>
        {feedbacks.length > 0 ? (
          feedbacks.map((f: FeedbackItem) => (
            <View key={f.id} className={styles.historyCard}>
              <Text className={styles.historyType}>
                {typeOptions.find(o => o.key === f.type)?.label || f.type}
              </Text>
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
    </ScrollView>
  );
};

export default FeedbackPage;
