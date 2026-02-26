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

import React from 'react';
import {
  Avatar,
  Typography,
  Card,
  Button,
  Input,
  Badge,
  Space,
  Table,
  Empty,
} from '@douyinfe/semi-ui';
import { Copy, Gift } from 'lucide-react';

const { Text } = Typography;

const InvitationCard = ({
  t,
  affLink,
  handleAffLinkClick,
  inviteeTopupItems,
  inviteeTopupTotal,
  inviteeTopupPage,
  inviteeTopupPageSize,
  inviteeTopupKeyword,
  inviteeTopupLoading,
  inviteeTopupTotalMoney,
  setInviteeTopupPage,
  setInviteeTopupPageSize,
  setInviteeTopupKeyword,
}) => {
  const inviteeColumns = [
    {
      title: t('用户'),
      dataIndex: 'display_name',
      key: 'user',
      render: (_, record) => (
        <div className='flex flex-col'>
          <Text>{record.display_name || record.username || '-'}</Text>
          <Text type='tertiary' className='text-xs'>
            @{record.username || '-'}
          </Text>
        </div>
      ),
    },
    {
      title: t('支付金额'),
      dataIndex: 'total_topup_money',
      key: 'total_topup_money',
      render: (money) => {
        const amount = Number(money || 0);
        return <Text className='wallet-premium__money'>¥{amount.toFixed(2)}</Text>;
      },
    },
    {
      title: t('请求次数'),
      dataIndex: 'topup_count',
      key: 'topup_count',
      render: (count) => count || 0,
    },
  ];

  return (
    <Card className='wallet-premium__main-card !rounded-2xl shadow-sm border-0'>
      {/* 卡片头部 */}
      <div className='flex items-center mb-4'>
        <Avatar size='small' color='grey' className='mr-3 shadow-md'>
          <Gift size={16} />
        </Avatar>
        <div>
          <Typography.Text className='text-lg font-medium'>
            {t('邀请奖励')}
          </Typography.Text>
          <div className='text-xs'>{t('邀请好友获得额外奖励')}</div>
        </div>
      </div>

      {/* 邀请区域 */}
      <Space vertical style={{ width: '100%' }}>
        <Card className='wallet-premium__panel !rounded-xl w-full'>
          <Input
            value={affLink}
            readonly
            className='!rounded-lg'
            prefix={t('邀请链接')}
            suffix={
              <Button
                type='primary'
                theme='solid'
                className='wallet-premium__action-btn !rounded-lg'
                onClick={handleAffLinkClick}
                icon={<Copy size={14} />}
              >
                {t('复制')}
              </Button>
            }
          />
        </Card>

        {/* 奖励说明 */}
        <Card
          className='wallet-premium__panel !rounded-xl w-full'
          title={<Text type='tertiary'>{t('奖励说明')}</Text>}
        >
          <div className='space-y-3'>
            <div className='flex items-start gap-2'>
              <Badge dot type='success' />
              <Text type='tertiary' className='text-sm'>
                {t('通过邀请链接邀请好友注册，邀请明细可在下方查看')}
              </Text>
            </div>

            <div className='flex items-start gap-2'>
              <Badge dot type='success' />
              <Text type='tertiary' className='text-sm'>
                {t('邀请明细仅统计易支付的成功充值记录，金额为累计充值金额')}
              </Text>
            </div>

            <div className='flex items-start gap-2'>
              <Badge dot type='success' />
              <Text type='tertiary' className='text-sm'>
                {t('分成比例由老板与代理线下协商，平台仅提供邀请数据展示')}
              </Text>
            </div>
          </div>
        </Card>

        <Card
          className='wallet-premium__panel !rounded-xl w-full'
          title={<Text type='tertiary'>{t('邀请信息')}</Text>}
        >
          <div className='mb-3'>
            <Text type='tertiary'>
              {t('总充值金额')}：
              <Text className='wallet-premium__money'>¥{Number(inviteeTopupTotalMoney || 0).toFixed(2)}</Text>
            </Text>
          </div>
          <div className='mb-3'>
            <Input
              value={inviteeTopupKeyword}
              showClear
              placeholder={t('用户')}
              onChange={(value) => {
                setInviteeTopupKeyword(value);
                setInviteeTopupPage(1);
              }}
            />
          </div>
          <Table
            columns={inviteeColumns}
            dataSource={inviteeTopupItems || []}
            rowKey='invitee_id'
            loading={inviteeTopupLoading}
            size='small'
            pagination={{
              currentPage: inviteeTopupPage,
              pageSize: inviteeTopupPageSize,
              total: inviteeTopupTotal || 0,
              pageSizeOpts: [10, 20, 50],
              showSizeChanger: true,
              onPageChange: (page) => setInviteeTopupPage(page),
              onPageSizeChange: (size) => {
                setInviteeTopupPageSize(size);
                setInviteeTopupPage(1);
              },
            }}
            empty={<Empty description={t('暂无数据')} />}
          />
        </Card>
      </Space>
    </Card>
  );
};

export default InvitationCard;
