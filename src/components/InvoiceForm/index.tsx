import React, { useState, useEffect } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';

interface InvoiceFormProps {
  visible: boolean;
  initialType: 'personal' | 'company';
  initialTitle: string;
  initialTaxNo?: string;
  initialEmail: string;
  onSave: (data: {
    type: 'personal' | 'company';
    title: string;
    taxNo?: string;
    email: string;
  }) => void;
  onClose: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  visible,
  initialType,
  initialTitle,
  initialTaxNo = '',
  initialEmail,
  onSave,
  onClose
}) => {
  const [type, setType] = useState<'personal' | 'company'>(initialType);
  const [title, setTitle] = useState(initialTitle);
  const [taxNo, setTaxNo] = useState(initialTaxNo);
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    if (visible) {
      setType(initialType);
      setTitle(initialTitle);
      setTaxNo(initialTaxNo);
      setEmail(initialEmail);
    }
  }, [visible, initialType, initialTitle, initialTaxNo, initialEmail]);

  const handleSave = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请填写发票抬头', icon: 'none' });
      return;
    }
    if (type === 'company' && !taxNo.trim()) {
      Taro.showToast({ title: '请填写税号', icon: 'none' });
      return;
    }
    if (!email.trim()) {
      Taro.showToast({ title: '请填写邮箱', icon: 'none' });
      return;
    }
    onSave({
      type,
      title: title.trim(),
      taxNo: type === 'company' ? taxNo.trim() : undefined,
      email: email.trim()
    });
  };

  if (!visible) return null;

  return (
    <View className={classnames(styles.mask, { [styles.hidden]: !visible })} onClick={onClose}>
      <View className={styles.panel} onClick={e => e.stopPropagation()}>
        <View className={styles.header}>
          <Text className={styles.title}>发票信息</Text>
          <Text className={styles.close} onClick={onClose}>✕</Text>
        </View>

        <View className={styles.form}>
          <View className={styles.typeRow}>
            <Text
              className={`${styles.typeBtn} ${type === 'personal' ? styles.active : ''}`}
              onClick={() => setType('personal')}
            >
              个人
            </Text>
            <Text
              className={`${styles.typeBtn} ${type === 'company' ? styles.active : ''}`}
              onClick={() => setType('company')}
            >
              企业
            </Text>
          </View>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>
              {type === 'personal' ? '发票抬头' : '企业名称'}
            </Text>
            <Input
              className={styles.input}
              placeholder={type === 'personal' ? '请输入个人姓名' : '请输入企业名称'}
              placeholderStyle="color: #86909C;"
              value={title}
              onInput={e => setTitle(e.detail.value)}
            />
          </View>

          {type === 'company' && (
            <View className={styles.formRow}>
              <Text className={styles.formLabel}>纳税人识别号</Text>
              <Input
                className={styles.input}
                placeholder="请输入纳税人识别号"
                placeholderStyle="color: #86909C;"
                value={taxNo}
                onInput={e => setTaxNo(e.detail.value)}
              />
              <Text className={styles.tips}>企业发票需提供纳税人识别号</Text>
            </View>
          )}

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>接收邮箱</Text>
            <Input
              className={styles.input}
              placeholder="请输入接收电子发票的邮箱"
              placeholderStyle="color: #86909C;"
              value={email}
              onInput={e => setEmail(e.detail.value)}
            />
            <Text className={styles.tips}>电子发票将发送到该邮箱</Text>
          </View>
        </View>

        <View className={styles.footer}>
          <View className={styles.saveBtn} onClick={handleSave}>
            保存
          </View>
        </View>
      </View>
    </View>
  );
};

export default InvoiceForm;
