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

import React, { useMemo } from 'react';
import { Card, Checkbox, Empty, Skeleton, Typography } from '@douyinfe/semi-ui';
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';
import { getTokensColumns } from './TokensColumnDefs';
import { useIsMobile } from '../../../hooks/common/useIsMobile';

const { Text } = Typography;

const TokensTable = (tokensData) => {
  const {
    tokens,
    loading,
    selectedKeys,
    setSelectedKeys,
    showKeys,
    setShowKeys,
    copyText,
    manageToken,
    setEditingToken,
    setShowEdit,
    refresh,
    t,
  } = tokensData;
  const isMobile = useIsMobile();

  const columns = useMemo(() => {
    return getTokensColumns({
      t,
      showKeys,
      setShowKeys,
      copyText,
      manageToken,
      setEditingToken,
      setShowEdit,
      refresh,
    });
  }, [
    t,
    showKeys,
    setShowKeys,
    copyText,
    manageToken,
    setEditingToken,
    setShowEdit,
    refresh,
  ]);

  const columnMap = useMemo(() => {
    const byDataIndex = {};
    const byKey = {};
    columns.forEach((col) => {
      if (col.dataIndex) byDataIndex[col.dataIndex] = col;
      if (col.key) byKey[col.key] = col;
    });
    return { byDataIndex, byKey };
  }, [columns]);

  const selectedIdSet = useMemo(() => {
    return new Set((selectedKeys || []).map((item) => item.id));
  }, [selectedKeys]);

  const selectedCountOnPage = useMemo(() => {
    return (tokens || []).filter((item) => selectedIdSet.has(item.id)).length;
  }, [tokens, selectedIdSet]);

  const allSelectedOnPage =
    (tokens || []).length > 0 && selectedCountOnPage === tokens.length;
  const hasPartialSelection =
    selectedCountOnPage > 0 && selectedCountOnPage < (tokens || []).length;

  const renderColumnContent = (column, record, index) => {
    if (!column) return '-';
    const value =
      column.dataIndex !== undefined ? record[column.dataIndex] : undefined;
    const content = column.render ? column.render(value, record, index) : value;
    if (content === undefined || content === null || content === '') return '-';
    return content;
  };

  const toggleRowSelect = (record, checked) => {
    setSelectedKeys((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const existed = current.some((item) => item.id === record.id);
      if (checked) {
        if (existed) return current;
        return [...current, record];
      }
      return current.filter((item) => item.id !== record.id);
    });
  };

  const toggleSelectAllOnPage = (checked) => {
    const pageItems = Array.isArray(tokens) ? tokens : [];
    setSelectedKeys((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      if (checked) {
        const merged = new Map(current.map((item) => [item.id, item]));
        pageItems.forEach((item) => merged.set(item.id, item));
        return Array.from(merged.values());
      }
      const pageIdSet = new Set(pageItems.map((item) => item.id));
      return current.filter((item) => !pageIdSet.has(item.id));
    });
  };

  const nameColumn = columnMap.byDataIndex.name;
  const statusColumn = columnMap.byKey.status;
  const tokenKeyColumn = columnMap.byKey.token_key;
  const actionColumn = columnMap.byDataIndex.operate;

  const metaFields = [
    { key: 'quota_usage', label: t('剩余额度/总额度') },
    { key: 'group', label: t('分组') },
    { dataIndex: 'model_limits', label: t('可用模型') },
    { dataIndex: 'allow_ips', label: t('IP限制') },
    { dataIndex: 'created_time', label: t('创建时间') },
    { dataIndex: 'expired_time', label: t('过期时间') },
  ];

  if (loading) {
    return (
      <div className='token-premium-board'>
        <div className='token-premium-grid'>
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className='token-premium-item token-premium-item--loading'>
              <Skeleton
                loading={true}
                active
                placeholder={
                  <div className='token-premium-skeleton'>
                    <Skeleton.Title style={{ width: '36%', height: 18 }} />
                    <Skeleton.Paragraph rows={5} style={{ marginTop: 14 }} />
                  </div>
                }
              />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!tokens || tokens.length === 0) {
    return (
      <Empty
        image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
        darkModeImage={
          <IllustrationNoResultDark style={{ width: 150, height: 150 }} />
        }
        description={t('搜索无结果')}
        style={{ padding: 30 }}
      />
    );
  }

  return (
    <div className='token-premium-board'>
      <div className='token-premium-board__toolbar'>
        <Checkbox
          checked={allSelectedOnPage}
          indeterminate={hasPartialSelection}
          onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
        >
          {t('本页全选')}
        </Checkbox>
        <Text className='token-premium-board__selected'>
          {t('已选择')} {selectedKeys.length} {t('个')}
        </Text>
      </div>

      <div className='token-premium-grid'>
        {tokens.map((record, index) => {
          const selected = selectedIdSet.has(record.id);
          const disabled = record.status !== 1;
          return (
            <article
              key={record.id}
              className={[
                'token-premium-item',
                selected ? 'token-premium-item--selected' : '',
                disabled ? 'token-premium-item--disabled' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <header className='token-premium-item__head'>
                <div className='token-premium-item__head-left'>
                  <Checkbox
                    checked={selected}
                    onChange={(e) => toggleRowSelect(record, e.target.checked)}
                  />
                  <div className='token-premium-item__title-wrap'>
                    <div className='token-premium-item__title'>
                      {renderColumnContent(nameColumn, record, index)}
                    </div>
                    <Text className='token-premium-item__sub'>ID #{record.id}</Text>
                  </div>
                </div>
                <div className='token-premium-item__status'>
                  {renderColumnContent(statusColumn, record, index)}
                </div>
              </header>

              <div className='token-premium-item__key'>
                {renderColumnContent(tokenKeyColumn, record, index)}
              </div>

              <div className='token-premium-item__meta'>
                {metaFields.map((field) => {
                  const column = field.key
                    ? columnMap.byKey[field.key]
                    : columnMap.byDataIndex[field.dataIndex];
                  return (
                    <div key={field.key || field.dataIndex} className='token-premium-field'>
                      <div className='token-premium-field__label'>{field.label}</div>
                      <div className='token-premium-field__value'>
                        {renderColumnContent(column, record, index)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <footer className='token-premium-item__actions'>
                {renderColumnContent(actionColumn, record, index)}
              </footer>
            </article>
          );
        })}
      </div>

      {isMobile && (
        <Text className='token-premium-board__mobile-tip'>
          {t('提示：左右按钮保持原有功能，当前仅重构了展示方式')}
        </Text>
      )}
    </div>
  );
};

export default TokensTable;
