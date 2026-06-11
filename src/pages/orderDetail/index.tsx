import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useStore } from '@/store/useStore';
import { CouponPicker } from '@/components/CouponPicker';
import styles from './index.module.scss';

const statusMap = {
  paid: { label: '购买成功', color: '#10B981', desc: '感谢您的购买，主题已加入您的账户' },
  refunding: { label: '退款中', color: '#F59E0B', desc: '客服正在审核您的退款申请' },
  refunded: { label: '已退款', color: '#6B7280', desc: '退款已完成，金额原路退回' },
  trial: { label: '试用中', color: '#7C3AED', desc: '您可以体验完整功能，到期可转为正式购买' }
};

const invoiceMap = {
  none: { label: '未申请', action: '申请发票' },
  requested: { label: '已申请', action: '处理中' },
  issued: { label: '已开具', action: '查看发票' }
};

export default function OrderDetail() {
  const router = useRouter();
  const orderId = router.params.orderId as string;

  const orders = useStore(s => s.orders);
  const coupons = useStore(s => s.coupons);
  const convertTrialToPurchase = useStore(s => s.convertTrialToPurchase);
  const applyRefund = useStore(s => s.applyRefund);
  const requestInvoice = useStore(s => s.requestInvoice);

  const [showCoupon, setShowCoupon] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [selectedCouponId, setSelectedCouponId] = useState<string | undefined>(undefined);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const order = useMemo(() => orders.find(o => o.id === orderId), [orders, orderId]);

  useDidShow(() => {
    if (!order) {
      Taro.showToast({ title: '订单不存在', icon: 'none' });
    }
  });

  if (!order) {
    return (
      <View className={styles.page}>
        <View className={styles.header}>
          <Text className={styles.back} onClick={() => Taro.navigateBack()}>‹</Text>
          <Text className={styles.headerTitle}>订单详情</Text>
        </View>
        <View style={{ padding: 100, textAlign: 'center', color: '#999' }}>订单不存在</View>
      </View>
    );
  }

  const statusInfo = statusMap[order.status];
  const invoiceInfo = invoiceMap[order.invoiceStatus];

  const calcTrialRemaining = () => {
    if (!order.trialStartDate || !order.trialDays) return { days: 0, expired: true };
    const start = new Date(order.trialStartDate).getTime();
    const end = start + order.trialDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const remain = Math.max(0, end - now);
    const days = Math.ceil(remain / (24 * 60 * 60 * 1000));
    return { days, expired: remain <= 0 };
  };

  const { days: trialDays, expired: trialExpired } = calcTrialRemaining();

  const openCoupon = () => setShowCoupon(true);
  const closeCoupon = () => setShowCoupon(false);
  const onSelectCoupon = (couponId?: string) => {
    setSelectedCouponId(couponId);
    closeCoupon();
    // 选完券后打开确认弹窗
    if (order && order.status === 'trial') {
      setShowConfirmModal(true);
    }
  };

  const getConfirmInfo = () => {
    if (!order) return { originalPrice: 0, finalPrice: 0, savedAmount: 0, couponName: '' };
    const original = order.originalPrice || 0;
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

  const handleConfirmPurchase = () => {
    setShowConfirmModal(false);
    handleConvertPurchase();
  };

  const handleConvertPurchase = () => {
    if (!order) return;
    if (!order.originalPrice || order.originalPrice <= 0) {
      Taro.showToast({ title: '免费主题无需购买', icon: 'none' });
      return;
    }
    const res = convertTrialToPurchase(order.id, selectedCouponId);
    setSelectedCouponId(undefined);
    if (res.success) {
      Taro.showToast({ title: `购买成功 ¥${res.finalPrice}`, icon: 'success' });
    }
  };

  const handleApplyRefund = () => {
    if (!refundReason.trim()) {
      Taro.showToast({ title: '请输入退款原因', icon: 'none' });
      return;
    }
    applyRefund(order.id, refundReason.trim());
    setShowRefundModal(false);
    Taro.showToast({ title: '申请已提交', icon: 'success' });
  };

  const handleRequestInvoice = () => {
    if (order.invoiceStatus === 'none') {
      requestInvoice(order.id);
      Taro.showToast({ title: '发票申请已提交', icon: 'success' });
    } else if (order.invoiceStatus === 'issued') {
      Taro.showToast({ title: '发票已发送至邮箱', icon: 'none' });
    }
  };

  const handleGoTheme = () => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${order.themeId}` });
  };

  const handleConvertPurchaseNoCoupon = () => {
    // 没选优惠券直接转购买，也打开确认弹窗
    setSelectedCouponId(undefined);
    setShowConfirmModal(true);
  };

  const availableCoupons = coupons.filter(c => !c.isUsed && c.minAmount <= (order.originalPrice || 0));
  const displayPrice = confirmInfo.finalPrice > 0 ? confirmInfo.finalPrice : (order.originalPrice || 0);

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.back} onClick={() => Taro.navigateBack()}>‹</Text>
        <Text className={styles.headerTitle}>订单详情</Text>
      </View>

      <ScrollView scrollY className={styles.scroll}>
        <View className={styles.statusCard} style={{ background: `linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}dd)` }}>
          <Text className={styles.statusIcon}>
            {order.status === 'refunded' ? '↩️' : order.status === 'refunding' ? '⏳' : order.status === 'trial' ? '🎁' : '✅'}
          </Text>
          <Text className={styles.statusLabel}>{statusInfo.label}</Text>
          <Text className={styles.statusDesc}>{statusInfo.desc}</Text>
          {order.status === 'trial' && (
            <View className={styles.trialInfo}>
              <Text className={styles.trialText}>
                {trialExpired ? '试用已结束' : `剩余 ${trialDays} 天`}
              </Text>
            </View>
          )}
        </View>

        <View className={styles.themeCard} onClick={handleGoTheme}>
          <Image className={styles.themeCover} src={order.themeCover} mode="aspectFill" />
          <View className={styles.themeInfo}>
            <Text className={styles.themeTitle}>{order.themeTitle}</Text>
            <Text className={styles.themeMeta}>
              {order.status === 'trial' ? '试用订单' : '购买订单'}
            </Text>
          </View>
          <Text className={styles.themePrice}>
            {order.status === 'trial'
              ? trialExpired ? `¥${order.originalPrice}` : '试用中'
              : `¥${order.price}`}
          </Text>
        </View>

        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>费用明细</Text>
          <View className={styles.priceRow}>
            <Text className={styles.priceLabel}>主题原价</Text>
            <Text className={styles.priceValue}>¥{order.originalPrice}</Text>
          </View>
          {order.couponDiscount && order.couponDiscount > 0 && (
            <View className={styles.priceRow}>
              <Text className={styles.priceLabel}>
                优惠券抵扣
                <Text className={styles.couponTag}>{order.couponTitle}</Text>
              </Text>
              <Text className={styles.priceValueDiscount}>-¥{order.couponDiscount}</Text>
            </View>
          )}
          <View className={styles.priceDivider} />
          <View className={styles.priceRow}>
            <Text className={styles.priceLabelBold}>实付金额</Text>
            <Text className={styles.priceFinal}>¥{order.price}</Text>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.invoiceRow}>
            <View>
              <Text className={styles.sectionTitle}>发票状态</Text>
              <Text className={styles.invoiceStatus} style={{ color: order.invoiceStatus === 'issued' ? '#10B981' : '#6B7280' }}>
                {invoiceInfo.label}
              </Text>
            </View>
            <Text
              className={styles.invoiceAction}
              onClick={handleRequestInvoice}
            >
              {invoiceInfo.action}
            </Text>
          </View>
        </View>

        {(order.status === 'refunding' || order.status === 'refunded') && order.refundNodes && order.refundNodes.length > 0 && (
          <View className={styles.sectionCard}>
            <Text className={styles.sectionTitle}>退款进度</Text>
            {order.refundReason && (
              <View className={styles.refundReasonBox}>
                <Text className={styles.refundReasonLabel}>退款原因：</Text>
                <Text className={styles.refundReasonText}>{order.refundReason}</Text>
              </View>
            )}
            <View className={styles.timeline}>
              {order.refundNodes.map((node, idx) => (
                <View key={idx} className={styles.timelineItem}>
                  <View className={styles.timelineDot} style={{ background: idx === 0 ? '#F59E0B' : '#D1D5DB' }} />
                  {idx < order.refundNodes!.length - 1 && <View className={styles.timelineLine} />}
                  <View className={styles.timelineContent}>
                    <Text className={styles.timelineTitle}>{node.title}</Text>
                    {node.description && <Text className={styles.timelineDesc}>{node.description}</Text>}
                    <Text className={styles.timelineTime}>{node.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>订单信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>订单编号</Text>
            <Text className={styles.infoValue}>{order.orderNo}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>创建时间</Text>
            <Text className={styles.infoValue}>{order.createTime}</Text>
          </View>
          {order.trialStartDate && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>试用开始</Text>
              <Text className={styles.infoValue}>{order.trialStartDate}</Text>
            </View>
          )}
          {order.trialDays && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>试用时长</Text>
              <Text className={styles.infoValue}>{order.trialDays} 天</Text>
            </View>
          )}
        </View>

        <View style={{ height: 180 }} />
      </ScrollView>

      <View className={styles.bottomBar}>
        {order.status === 'trial' && !trialExpired && (
          <>
            <Text className={styles.secondaryBtn} onClick={openCoupon}>
              选择优惠券
              {selectedCouponId ? ' (已选)' : ''}
            </Text>
            <Text className={styles.primaryBtn} onClick={handleConvertPurchaseNoCoupon}>
              转购买 ¥{displayPrice}
            </Text>
          </>
        )}
        {order.status === 'trial' && trialExpired && (
          <>
            <Text className={styles.secondaryBtn} onClick={openCoupon}>
              选择优惠券
            </Text>
            <Text className={styles.primaryBtn} onClick={handleConvertPurchaseNoCoupon}>
              立即购买 ¥{displayPrice}
            </Text>
          </>
        )}
        {order.status === 'paid' && (
          <>
            <Text className={styles.secondaryBtn} onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${order.themeId}` })}>
              查看主题
            </Text>
            <Text className={styles.primaryBtnDanger} onClick={() => setShowRefundModal(true)}>
              申请退款
            </Text>
          </>
        )}
        {order.status === 'refunding' && (
          <Text className={styles.primaryBtn} style={{ background: '#F59E0B' }}>
            客服审核中...
          </Text>
        )}
        {order.status === 'refunded' && (
          <Text className={styles.primaryBtn} style={{ background: '#6B7280' }}>
            退款已完成
          </Text>
        )}
      </View>

      {showCoupon && (
        <CouponPicker
          visible={showCoupon}
          coupons={coupons}
          amount={order.originalPrice || 0}
          selectedCouponId={selectedCouponId}
          onSelect={onSelectCoupon}
          onClose={closeCoupon}
        />
      )}

      {showConfirmModal && order && order.status === 'trial' && (
        <View className={styles.modalMask} onClick={() => setShowConfirmModal(false)}>
          <View className={styles.modalPanel} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>确认购买</Text>
            <View className={styles.confirmThemeInfo}>
              <Image className={styles.confirmCover} src={order.themeCover} mode="aspectFill" />
              <Text className={styles.confirmThemeName}>{order.themeTitle}</Text>
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

      {showRefundModal && (
        <View className={styles.modalMask} onClick={() => setShowRefundModal(false)}>
          <View className={styles.modalPanel} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>申请退款</Text>
            <Text className={styles.modalDesc}>请填写退款原因，客服将在1-2个工作日内审核</Text>
            <Textarea
              className={styles.refundTextarea}
              value={refundReason}
              onInput={(e) => setRefundReason(e.detail.value)}
              placeholder="请输入退款原因（如：与描述不符、重复购买、不想要了等）"
              placeholder-class="placeholder"
              maxlength={200}
            />
            <View className={styles.modalActions}>
              <Text className={styles.modalCancel} onClick={() => setShowRefundModal(false)}>取消</Text>
              <Text className={styles.modalConfirm} onClick={handleApplyRefund}>提交申请</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
