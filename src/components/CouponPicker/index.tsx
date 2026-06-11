import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import { CouponItem } from '@/types/theme';
import classnames from 'classnames';

interface CouponPickerProps {
  visible: boolean;
  coupons: CouponItem[];
  selectedCouponId?: string;
  amount: number;
  onSelect: (couponId?: string) => void;
  onClose: () => void;
  hasFooter?: boolean;
}

const CouponPicker: React.FC<CouponPickerProps> = ({
  visible,
  coupons,
  selectedCouponId,
  amount,
  onSelect,
  onClose,
  hasFooter = true
}) => {
  const availableCoupons = useMemo(() => {
    return coupons.filter(c => !c.isUsed && amount >= c.minAmount);
  }, [coupons, amount]);

  const unavailableCoupons = useMemo(() => {
    return coupons.filter(c => c.isUsed || amount < c.minAmount);
  }, [coupons, amount]);

  const allCoupons = [...availableCoupons, ...unavailableCoupons];

  if (!visible) return null;

  return (
    <View className={classnames(styles.mask, { [styles.hidden]: !visible })} onClick={onClose}>
      <View className={styles.panel} onClick={e => e.stopPropagation()}>
        <View className={styles.header}>
          <Text className={styles.title}>选择优惠券</Text>
          <Text className={styles.close} onClick={onClose}>✕</Text>
        </View>

        <ScrollView className={styles.list} scrollY enhanced showScrollbar={false}>
          {allCoupons.length > 0 ? (
            allCoupons.map(c => {
              const isAvailable = !c.isUsed && amount >= c.minAmount;
              const isSelected = selectedCouponId === c.id;
              return (
                <View
                  key={c.id}
                  className={classnames(
                    styles.couponItem,
                    { [styles.disabled]: !isAvailable },
                    { [styles.selected]: isSelected }
                  )}
                  onClick={() => isAvailable && onSelect(isSelected ? undefined : c.id)}
                >
                  <View className={styles.couponLeft}>
                    <Text className={styles.couponAmount}>{c.discount}</Text>
                    <Text className={styles.couponCondition}>
                      {c.minAmount > 0 ? `满${c.minAmount}可用` : '无门槛'}
                    </Text>
                  </View>
                  <View className={styles.couponRight}>
                    <Text className={styles.couponName}>{c.title}</Text>
                    <Text className={styles.couponExpire}>
                      有效期至 {c.expireTime}
                      {!isAvailable && ` · ${c.isUsed ? '已使用' : '不满足使用条件'}`}
                    </Text>
                  </View>
                  {isSelected && <Text className={styles.selectedBadge}>✓</Text>}
                </View>
              );
            })
          ) : (
            <View className={styles.noCoupon}>暂无可用优惠券</View>
          )}
        </ScrollView>

        {hasFooter && (
          <View className={styles.footer}>
            <View className={styles.confirmBtn} onClick={() => onSelect(selectedCouponId)}>
              确认使用
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default CouponPicker;
