import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { OrderItem, CouponItem } from '@/types/theme';
import EmptyState from '@/components/EmptyState';
import InvoiceForm from '@/components/InvoiceForm';
import CouponPicker from '@/components/CouponPicker';
import { useStore } from '@/store/useStore';

type TabKey = 'all' | 'trial' | 'paid' | 'refunding' | 'refunded';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'trial', label: '试用中' },
  { key: 'paid', label: '已完成' },
  { key: 'refunding', label: '退款中' },
  { key: 'refunded', label: '已退款' }
];

const statusMap: Record<string, { label: string; cls: string }> = {
  paid: { label: '已完成', cls: 'paid' },
  refunding: { label: '退款中', cls: 'refunding' },
  refunded: { label: '已退款', cls: 'refunded' },
  trial: { label: '试用中', cls: 'trial' }
};

const calcTrialRemaining = (order: OrderItem) => {
  if (!order.trialStartDate || !order.trialDays) return { days: 0, expired: true, percent: 0 };
  const start = new Date(order.trialStartDate).getTime();
  const end = start + order.trialDays * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const remain = Math.max(0, end - now);
  const total = end - start;
  const days = Math.ceil(remain / (24 * 60 * 60 * 1000));
  const percent = Math.max(0, Math.min(100, Math.round((remain / total) * 100)));
  return { days, expired: remain <= 0, percent };
};

const OrderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [invoiceVisible, setInvoiceVisible] = useState(false);
  const [showCouponPicker, setShowCouponPicker] = useState(false);
  const [currentTrialOrder, setCurrentTrialOrder] = useState<OrderItem | null>(null);
  const [selectedCouponId, setSelectedCouponId] = useState<string | undefined>(undefined);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const orders = useStore(s => s.orders);
  const coupons = useStore(s => s.coupons);
  const invoiceInfo = useStore(s => s.invoiceInfo);
  const applyRefund = useStore(s => s.applyRefund);
  const setInvoiceInfo = useStore(s => s.setInvoiceInfo);
  const convertTrialToPurchase = useStore(s => s.convertTrialToPurchase);

  useDidShow(() => {
    console.log('[OrderPage] page show, orders count:', orders.length);
  });

  const filteredOrders: OrderItem[] = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter(o => o.status === activeTab);
  }, [activeTab, orders]);

  const availableCoupons: CouponItem[] = coupons.filter(c => !c.isUsed);

  const goOrderDetail = (orderId: string) => {
    Taro.navigateTo({ url: `/pages/orderDetail/index?orderId=${orderId}` });
  };

  const goDetail = (themeId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${themeId}` });
  };

  const handleRefund = (order: OrderItem) => {
    goOrderDetail(order.id);
  };

  const openCouponForTrial = (order: OrderItem) => {
    setCurrentTrialOrder(order);
    setSelectedCouponId(undefined);
    setShowCouponPicker(true);
  };

  const handleSelectCoupon = (couponId?: string) => {
    setSelectedCouponId(couponId);
    setShowCouponPicker(false);
    // 选完券后打开确认支付弹窗
    if (currentTrialOrder) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmPurchase = () => {
    if (!currentTrialOrder) return;
    const order = currentTrialOrder;
    setShowConfirmModal(false);
    handleConvertTrial(order);
  };

  const getConfirmInfo = () => {
    if (!currentTrialOrder) return { originalPrice: 0, finalPrice: 0, savedAmount: 0, couponName: '' };
    const original = currentTrialOrder.originalPrice || 0;
    let final = original;
    let saved = 0;
    let couponName = '';
    if (selectedCouponId) {
      const c = coupons.find(x => x.id === selectedCouponId && !x.isUsed);
      if (c && original >= c.minAmount) {
        final = Math.max(0, original - c.discount);
        saved = c.discount;
        couponName = c.title;
      }
    }
    return { originalPrice: original, finalPrice: final, savedAmount: saved, couponName };
  };

  const confirmInfo = getConfirmInfo();

  const handleConvertTrial = (order: OrderItem) => {
    if (!order.originalPrice || order.originalPrice <= 0) {
      Taro.showToast({ title: '免费主题无需购买', icon: 'none' });
      return;
    }
    const res = convertTrialToPurchase(order.id, selectedCouponId);
    setSelectedCouponId(undefined);
    setCurrentTrialOrder(null);
    if (res.success) {
      Taro.showToast({ title: `购买成功 ¥${res.finalPrice}`, icon: 'success' });
    }
  };

  const handleInvoiceSave = (data: {
    type: 'personal' | 'company';
    title: string;
    taxNo?: string;
    email: string;
  }) => {
    setInvoiceInfo(data);
    setInvoiceVisible(false);
    Taro.showToast({ title: '保存成功', icon: 'success' });
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
          filteredOrders.map(order => {
            const info = statusMap[order.status];
            const trialInfo = order.status === 'trial' ? calcTrialRemaining(order) : null;
            return (
              <View key={order.id} className={styles.orderCard}>
                <View className={styles.orderHeader}>
                  <Text className={styles.orderNo}>订单号: {order.orderNo}</Text>
                  <Text className={`${styles.orderStatus} ${styles[info.cls]}`}>
                    {info.label}
                  </Text>
                </View>

                <View className={styles.orderBody} onClick={() => goOrderDetail(order.id)}>
                  <Image className={styles.cover} src={order.themeCover} mode="aspectFill" />
                  <View className={styles.themeInfo}>
                    <Text className={styles.themeTitle}>{order.themeTitle}</Text>
                    <View className={styles.priceRow}>
                      {order.status === 'trial' ? (
                        <>
                          <Text className={styles.originalPrice}>¥{order.originalPrice}</Text>
                          <Text className={styles.trialBadge}>免费试用</Text>
                        </>
                      ) : order.couponDiscount ? (
                        <>
                          <Text className={styles.originalPriceCross}>¥{order.originalPrice}</Text>
                          <Text className={styles.themePrice}>¥{order.price}</Text>
                        </>
                      ) : (
                        <Text className={styles.themePrice}>¥{order.price}</Text>
                      )}
                    </View>
                    {order.status === 'trial' && trialInfo && (
                      <View className={styles.trialProgressBar}>
                        <View
                          className={styles.trialProgressInner}
                          style={{
                            width: `${trialInfo.percent}%`,
                            background: trialInfo.expired ? '#EF4444' : '#7C3AED'
                          }}
                        />
                        <Text className={styles.trialProgressText}>
                          {trialInfo.expired ? '试用已结束' : `剩余 ${trialInfo.days} 天`}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className={styles.orderFooter}>
                  <Text className={styles.orderTime}>{order.createTime}</Text>
                  <View className={styles.actionRow}>
                    {order.status === 'trial' && (
                      <>
                        <Text
                          className={`${styles.btn} ${styles.outline}`}
                          onClick={() => openCouponForTrial(order)}
                        >
                          用优惠券购买
                        </Text>
                        <Text
                          className={`${styles.btn} ${styles.primary}`}
                          onClick={() => handleConvertTrial(order)}
                        >
                          {trialInfo?.expired ? '立即购买' : '转购买'}
                        </Text>
                      </>
                    )}
                    {order.status === 'paid' && (
                      <>
                        <Text
                          className={`${styles.btn} ${styles.outline}`}
                          onClick={() => handleRefund(order)}
                        >
                          申请退款
                        </Text>
                        <Text
                          className={`${styles.btn} ${styles.primary}`}
                          onClick={() => goOrderDetail(order.id)}
                        >
                          查看详情
                        </Text>
                      </>
                    )}
                    {order.status === 'refunding' && (
                      <Text
                        className={`${styles.btn} ${styles.primary}`}
                        style={{ background: '#F59E0B' }}
                        onClick={() => goOrderDetail(order.id)}
                      >
                        查看进度
                      </Text>
                    )}
                    {order.status === 'refunded' && (
                      <Text
                        className={`${styles.btn} ${styles.primary}`}
                        style={{ background: '#6B7280' }}
                        onClick={() => goOrderDetail(order.id)}
                      >
                        查看详情
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <EmptyState
            icon={activeTab === 'trial' ? '🎁' : activeTab === 'refunding' ? '⏳' : '📋'}
            text={activeTab === 'trial' ? '暂无试用记录' : activeTab === 'refunding' ? '暂无退款申请' : '暂无订单'}
          />
        )}

        <View className={styles.couponSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>🎫 我的优惠券</Text>
            <Text className={styles.sectionMore}>
              {availableCoupons.length} 张可用 ›
            </Text>
          </View>
          <View className={styles.couponList}>
            {availableCoupons.length > 0 ? (
              availableCoupons.map(c => (
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

        <View className={styles.invoiceRow} onClick={() => setInvoiceVisible(true)}>
          <View className={styles.invoiceIcon}>🧾</View>
          <View style={{ flex: 1 }}>
            <Text className={styles.invoiceText}>发票信息</Text>
            {invoiceInfo.title && (
              <Text style={{ fontSize: '24rpx', color: '#86909C', marginTop: '8rpx' }}>
                {invoiceInfo.type === 'personal' ? '个人' : '企业'} · {invoiceInfo.title}
              </Text>
            )}
          </View>
          <Text className={styles.invoiceArrow}>›</Text>
        </View>
      </View>

      <InvoiceForm
        visible={invoiceVisible}
        initialType={invoiceInfo.type}
        initialTitle={invoiceInfo.title}
        initialTaxNo={invoiceInfo.taxNo}
        initialEmail={invoiceInfo.email}
        onSave={handleInvoiceSave}
        onClose={() => setInvoiceVisible(false)}
      />

      {showCouponPicker && currentTrialOrder && (
        <CouponPicker
          visible={showCouponPicker}
          coupons={coupons}
          amount={currentTrialOrder.originalPrice || 0}
          selectedCouponId={selectedCouponId}
          onSelect={handleSelectCoupon}
          onClose={() => { setShowCouponPicker(false); setCurrentTrialOrder(null); }}
          hasFooter={true}
        />
      )}

      {showConfirmModal && currentTrialOrder && (
        <View className={styles.modalMask} onClick={() => setShowConfirmModal(false)}>
          <View className={styles.modalPanel} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>确认购买</Text>
            <View className={styles.confirmThemeInfo}>
              <Image className={styles.confirmCover} src={currentTrialOrder.themeCover} mode="aspectFill" />
              <Text className={styles.confirmThemeName}>{currentTrialOrder.themeTitle}</Text>
            </View>

            <View className={styles.confirmPriceBox}>
              <View className={styles.confirmPriceRow}>
                <Text className={styles.confirmPriceLabel}>主题原价</Text>
                <Text className={styles.confirmPriceValue}>¥{confirmInfo.originalPrice}</Text>
              </View>
              {confirmInfo.savedAmount > 0 && (
                <View className={styles.confirmPriceRow}>
                  <Text className={styles.confirmPriceLabel}>
                    优惠券抵扣
                    <Text className={styles.confirmCouponTag}>{confirmInfo.couponName}</Text>
                  </Text>
                  <Text className={styles.confirmPriceDiscount}>-¥{confirmInfo.savedAmount}</Text>
                </View>
              )}
              <View className={styles.confirmPriceDivider} />
              <View className={styles.confirmPriceRow}>
                <Text className={styles.confirmPriceLabelBold}>实付金额</Text>
                <Text className={styles.confirmPriceFinal}>¥{confirmInfo.finalPrice}</Text>
              </View>
            </View>

            <View className={styles.modalActions}>
              <Text className={styles.modalCancel} onClick={() => setShowConfirmModal(false)}>取消</Text>
              <Text className={styles.modalConfirm} onClick={handleConfirmPurchase}>确认支付</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default OrderPage;
