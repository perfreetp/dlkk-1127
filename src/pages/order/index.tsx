import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { orders, coupons } from '@/data/mockData';
import { OrderItem, CouponItem } from '@/types/theme';
import EmptyState from '@/components/EmptyState';

type TabKey = 'all' | 'paid' | 'refunding' | 'refunded';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'paid', label: '已完成' },
  { key: 'refunding', label: '退款中' },
  { key: 'refunded', label: '已退款' }
];

const statusMap: Record<string, string> = {
  paid: '已完成',
  refunding: '退款中',
  refunded: '已退款',
  trial: '试用中'
};

const OrderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  useEffect(() => {
    console.log('[OrderPage] mounted, orders count:', orders.length);
  }, []);

  const filteredOrders: OrderItem[] = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter(o => o.status === activeTab);
  }, [activeTab]);

  const availableCoupons: CouponItem[] = coupons.filter(c => !c.isUsed);

  const goDetail = (themeId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${themeId}` });
  };

  const handleRefund = (order: OrderItem) => {
    Taro.showModal({
      title: '申请退款',
      content: '确定要申请退款吗？退款将在1-3个工作日内原路返回。',
      confirmText: '申请退款',
      confirmColor: '#F53F3F',
      success: res => {
        if (res.confirm) {
          Taro.showToast({ title: '退款申请已提交', icon: 'success' });
        }
      }
    });
  };

  const handleInvoice = () => {
    Taro.showToast({ title: '发票功能开发中', icon: 'none' });
  };

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.tabs}>
        {tabs.map(tab => (
          <Text
            key={tab.key}
            className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Text>
        ))}
      </View>

      <View className={styles.content}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <View key={order.id} className={styles.orderCard}>
              <View className={styles.orderHeader}>
                <Text className={styles.orderNo}>订单号: {order.orderNo}</Text>
                <Text className={`${styles.orderStatus} ${styles[order.status]}`}>
                  {statusMap[order.status]}
                </Text>
              </View>
              <View className={styles.orderBody} onClick={() => goDetail(order.themeId)}>
                <Image className={styles.cover} src={order.themeCover} mode="aspectFill" />
                <View className={styles.themeInfo}>
                  <Text className={styles.themeTitle}>{order.themeTitle}</Text>
                  <Text className={styles.themePrice}>¥{order.price}</Text>
                </View>
              </View>
              <View className={styles.orderFooter}>
                <Text className={styles.orderTime}>{order.createTime}</Text>
                <View className={styles.actionRow}>
                  {order.status === 'paid' && (
                    <Text className={`${styles.btn} ${styles.outline}`} onClick={() => handleRefund(order)}>
                      申请退款
                    </Text>
                  )}
                  <Text className={`${styles.btn} ${styles.primary}`} onClick={() => goDetail(order.themeId)}>
                    再次购买
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <EmptyState icon="📋" text="暂无订单" />
        )}

        <View className={styles.couponSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>🎫 我的优惠券</Text>
            <Text className={styles.sectionMore}>全部 ›</Text>
          </View>
          <View className={styles.couponList}>
            {availableCoupons.length > 0 ? (
              availableCoupons.slice(0, 3).map(c => (
                <View key={c.id} className={`${styles.couponItem} ${c.isUsed ? styles.used : ''}`}>
                  <View className={styles.couponLeft}>
                    <Text className={styles.couponAmount}>{c.discount}</Text>
                    <Text className={styles.couponCondition}>
                      {c.minAmount > 0 ? `满${c.minAmount}可用` : '无门槛'}
                    </Text>
                  </View>
                  <View className={styles.couponRight}>
                    <Text className={styles.couponName}>{c.title}</Text>
                    <Text className={styles.couponExpire}>有效期至 {c.expireTime}</Text>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState icon="🎟️" text="暂无优惠券" />
            )}
          </View>
        </View>

        <View className={styles.invoiceRow} onClick={handleInvoice}>
          <View className={styles.invoiceIcon}>🧾</View>
          <Text className={styles.invoiceText}>发票信息</Text>
          <Text className={styles.invoiceArrow}>›</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default OrderPage;
