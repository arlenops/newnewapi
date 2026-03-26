/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Empty,
  Input,
  Table,
  Tag,
  Toast,
  Typography,
} from '@douyinfe/semi-ui';
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';
import { IconSearch } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import CardPro from '../../common/ui/CardPro';
import { API, timestamp2string } from '../../../helpers';
import { useIsMobile } from '../../../hooks/common/useIsMobile';
import { createCardProPagination } from '../../../helpers/utils';

const { Text } = Typography;

const PAYMENT_METHOD_MAP = {
  stripe: 'Stripe',
  creem: 'Creem',
  alipay: '支付宝',
  wxpay: '微信',
};

const PAYMENT_STATUS_MAP = {
  success: { label: '成功', color: 'green' },
  pending: { label: '处理中', color: 'orange' },
  expired: { label: '已过期', color: 'grey' },
};

const getDisplayUserName = (record) => {
  const username = (record?.username || '').trim();
  const displayName = (record?.display_name || '').trim();

  if (displayName && username && displayName !== username) {
    return `${displayName} (${username})`;
  }

  return displayName || username || `ID #${record?.user_id || '-'}`;
};

const formatPaidMoney = (record) => {
  const symbol =
    record?.payment_method === 'stripe' || record?.payment_method === 'creem'
      ? '$'
      : '¥';
  const money = Number(record?.money || 0);
  return `${symbol}${money.toFixed(2)}`;
};

const PaymentRecordsPage = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [recordCount, setRecordCount] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');

  const loadRecords = useCallback(
    async (currentPage = activePage, currentPageSize = pageSize) => {
      setLoading(true);
      try {
        const res = await API.get('/api/user/admin/payment_records', {
          params: {
            p: currentPage,
            page_size: currentPageSize,
            keyword: keyword || undefined,
            _ts: Date.now(),
          },
          disableDuplicate: true,
        });
        const { success, message, data } = res.data;
        if (success) {
          setRecords(data.items || []);
          setRecordCount(data.total || 0);
        } else {
          Toast.error({ content: message || t('加载失败') });
        }
      } catch (error) {
        Toast.error({ content: t('加载付款记录失败') });
      } finally {
        setLoading(false);
      }
    },
    [activePage, keyword, pageSize, t],
  );

  useEffect(() => {
    loadRecords(activePage, pageSize);
  }, [activePage, loadRecords, pageSize]);

  const columns = useMemo(
    () => [
      {
        title: t('付款记录'),
        key: 'payment_record',
        render: (_, record) => (
          <div className='flex flex-col gap-1 py-1'>
            <div className='text-sm font-medium text-semi-color-text-0'>
              <span>{getDisplayUserName(record)}</span>
              <span className='mx-1 text-semi-color-text-2'>{t('付款了')}</span>
              <span className='font-semibold text-rose-600'>
                {formatPaidMoney(record)}
              </span>
            </div>
            <Text type='tertiary' size='small'>
              {t('订单号')}: {record.trade_no}
            </Text>
          </div>
        ),
      },
      {
        title: t('支付方式'),
        dataIndex: 'payment_method',
        key: 'payment_method',
        width: 120,
        render: (value) => (
          <Tag color='white' shape='circle'>
            {PAYMENT_METHOD_MAP[value] ? t(PAYMENT_METHOD_MAP[value]) : value}
          </Tag>
        ),
      },
      {
        title: t('订单状态'),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (value) => {
          const statusConfig = PAYMENT_STATUS_MAP[value] || {
            label: value || '-',
            color: 'white',
          };
          return (
            <Tag color={statusConfig.color} shape='circle'>
              {t(statusConfig.label)}
            </Tag>
          );
        },
      },
      {
        title: t('用户 ID'),
        dataIndex: 'user_id',
        key: 'user_id',
        width: 110,
      },
      {
        title: t('邮箱'),
        dataIndex: 'email',
        key: 'email',
        width: 220,
        render: (value) => value || '-',
      },
      {
        title: t('支付完成时间'),
        dataIndex: 'complete_time',
        key: 'complete_time',
        width: 180,
        render: (value, record) => timestamp2string(value || record.create_time),
      },
    ],
    [t],
  );

  return (
    <CardPro
      type='type1'
      descriptionArea={
        <Text type='secondary'>
          {t('查看用户成功付款记录，快速确认谁付了多少钱')}
        </Text>
      }
      actionsArea={
        <div className='w-full md:max-w-sm'>
          <Input
            prefix={<IconSearch />}
            placeholder={t('搜索用户名或订单号')}
            value={keyword}
            onChange={(value) => {
              setKeyword(value);
              setActivePage(1);
            }}
            showClear
          />
        </div>
      }
      paginationArea={createCardProPagination({
        currentPage: activePage,
        pageSize,
        total: recordCount,
        onPageChange: setActivePage,
        onPageSizeChange: (size) => {
          setPageSize(size);
          setActivePage(1);
        },
        isMobile,
        t,
      })}
      t={t}
    >
      <Table
        columns={columns}
        dataSource={records}
        loading={loading}
        rowKey='id'
        pagination={false}
        empty={
          <Empty
            image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
            darkModeImage={
              <IllustrationNoResultDark style={{ width: 150, height: 150 }} />
            }
            description={t('暂无付款记录')}
            style={{ padding: 30 }}
          />
        }
      />
    </CardPro>
  );
};

export default PaymentRecordsPage;
