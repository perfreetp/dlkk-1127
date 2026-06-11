import React, { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useStore } from '@/store/useStore';
import styles from './index.module.scss';

const typeMap = {
  adapt: { label: '适配问题', color: '#F59E0B', icon: '🔧' },
  bug: { label: 'Bug反馈', color: '#EF4444', icon: '🐛' },
  suggest: { label: '功能建议', color: '#3B82F6', icon: '💡' },
  infringement: { label: '侵权投诉', color: '#7C3AED', icon: '⚠️' }
};

const statusMap = {
  pending: { label: '待处理', color: '#F59E0B' },
  processing: { label: '处理中', color: '#3B82F6' },
  resolved: { label: '已处理', color: '#10B981' }
};

export default function FeedbackDetail() {
  const router = useRouter();
  const feedbackId = router.params.feedbackId as string;

  const feedbacks = useStore(s => s.feedbacks);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const feedback = useMemo(() => feedbacks.find(f => f.id === feedbackId), [feedbacks, feedbackId]);
  const typeInfo = feedback ? typeMap[feedback.type] : null;
  const statusInfo = feedback ? statusMap[feedback.status] : null;

  const handleGoTheme = () => {
    if (!feedback?.themeId) return;
    Taro.navigateTo({ url: `/pages/detail/index?id=${feedback.themeId}` });
  };

  const handlePreview = (src: string) => {
    setPreviewImg(src);
  };

  if (!feedback || !typeInfo || !statusInfo) {
    return (
      <View className={styles.page}>
        <View className={styles.header}>
          <Text className={styles.back} onClick={() => Taro.navigateBack()}>‹</Text>
          <Text className={styles.headerTitle}>反馈详情</Text>
        </View>
        <View style={{ padding: 100, textAlign: 'center', color: '#999' }}>反馈不存在</View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.back} onClick={() => Taro.navigateBack()}>‹</Text>
        <Text className={styles.headerTitle}>反馈详情</Text>
      </View>

      <ScrollView scrollY className={styles.scroll}>
        <View className={styles.statusCard} style={{ background: `linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}dd)` }}>
          <Text className={styles.statusIcon}>
            {feedback.status === 'resolved' ? '✅' : feedback.status === 'processing' ? '⏳' : '📨'}
          </Text>
          <Text className={styles.statusLabel}>{statusInfo.label}</Text>
          <Text className={styles.statusDesc}>
            {feedback.status === 'pending' && '您的反馈已提交，客服将尽快处理'}
            {feedback.status === 'processing' && '客服正在处理您的问题，请耐心等待'}
            {feedback.status === 'resolved' && '问题已处理完成，感谢您的反馈！'}
          </Text>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.typeHeader}>
            <View className={styles.typeTag} style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}>
              <Text className={styles.typeIcon}>{typeInfo.icon}</Text>
              <Text>{typeInfo.label}</Text>
            </View>
            <Text className={styles.rating}>
              {'⭐'.repeat(feedback.rating || 0)}
              <Text style={{ color: '#D1D5DB' }}>{'⭐'.repeat(Math.max(0, 5 - (feedback.rating || 0)))}</Text>
            </Text>
          </View>

          <Text className={styles.contentText}>{feedback.content}</Text>

          {feedback.images && feedback.images.length > 0 && (
            <View className={styles.imageGrid}>
              {feedback.images.map((img, idx) => (
                <Image
                  key={idx}
                  className={styles.imageItem}
                  src={img}
                  mode="aspectFill"
                  onClick={() => handlePreview(img)}
                />
              ))}
            </View>
          )}

          <Text className={styles.createTime}>提交时间：{feedback.createTime}</Text>
        </View>

        {feedback.themeId && (
          <View className={styles.themeCard} onClick={handleGoTheme}>
            {feedback.themeCover && (
              <Image className={styles.themeCover} src={feedback.themeCover} mode="aspectFill" />
            )}
            <View className={styles.themeInfo}>
              <Text className={styles.themeLabel}>关联主题</Text>
              <Text className={styles.themeTitle}>{feedback.themeTitle}</Text>
              {feedback.type === 'adapt' && (
                <Text className={styles.themeHint}>点击跳转到主题页面</Text>
              )}
            </View>
            <Text className={styles.themeArrow}>›</Text>
          </View>
        )}

        {feedback.reply && (
          <View className={styles.replyCard}>
            <View className={styles.replyHeader}>
              <View className={styles.avatar}>客</View>
              <Text className={styles.replyName}>官方客服</Text>
            </View>
            <Text className={styles.replyContent}>{feedback.reply}</Text>
            {feedback.replyTime && (
              <Text className={styles.replyTime}>{feedback.replyTime}</Text>
            )}
          </View>
        )}

        {feedback.nodes && feedback.nodes.length > 0 && (
          <View className={styles.sectionCard}>
            <Text className={styles.sectionTitle}>处理进度</Text>
            <View className={styles.timeline}>
              {feedback.nodes.map((node, idx) => (
                <View key={idx} className={styles.timelineItem}>
                  <View className={styles.timelineDot} style={{ background: idx === 0 ? '#3B82F6' : '#D1D5DB' }} />
                  {idx < feedback.nodes!.length - 1 && <View className={styles.timelineLine} />}
                  <View className={styles.timelineContent}>
                    <Text className={styles.timelineTitle}>{node.title}</Text>
                    {node.content && <Text className={styles.timelineDesc}>{node.content}</Text>}
                    <View className={styles.timelineMeta}>
                      {node.operator && <Text className={styles.timelineOperator}>{node.operator}</Text>}
                      <Text className={styles.timelineTime}>{node.time}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {previewImg && (
        <View className={styles.previewMask} onClick={() => setPreviewImg(null)}>
          <Image className={styles.previewImg} src={previewImg} mode="widthFix" />
          <Text className={styles.previewClose}>点击任意位置关闭</Text>
        </View>
      )}
    </View>
  );
}
