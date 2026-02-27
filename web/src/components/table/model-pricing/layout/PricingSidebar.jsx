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
import { Button, Select } from '@douyinfe/semi-ui';

import { resetPricingFilters } from '../../../../helpers/utils';
import { usePricingFilterCounts } from '../../../../hooks/model-pricing/usePricingFilterCounts';

const PricingSidebar = ({
  showWithRecharge,
  setShowWithRecharge,
  currency,
  setCurrency,
  handleChange,
  setActiveKey,
  showRatio,
  setShowRatio,
  viewMode,
  setViewMode,
  filterGroup,
  setFilterGroup,
  handleGroupClick,
  filterQuotaType,
  setFilterQuotaType,
  filterEndpointType,
  setFilterEndpointType,
  filterVendor,
  setFilterVendor,
  filterTag,
  setFilterTag,
  currentPage,
  setCurrentPage,
  tokenUnit,
  setTokenUnit,
  loading,
  t,
  ...categoryProps
}) => {
  const {
    quotaTypeModels,
    endpointTypeModels,
    vendorModels,
    tagModels,
    groupCountModels,
  } = usePricingFilterCounts({
    models: categoryProps.models,
    filterGroup,
    filterQuotaType,
    filterEndpointType,
    filterVendor,
    filterTag,
    searchValue: categoryProps.searchValue,
  });

  const handleResetFilters = () =>
    resetPricingFilters({
      handleChange,
      setShowWithRecharge,
      setCurrency,
      setShowRatio,
      setViewMode,
      setFilterGroup,
      setFilterQuotaType,
      setFilterEndpointType,
      setFilterVendor,
      setFilterTag,
      setCurrentPage,
      setTokenUnit,
    });

  const allModels = categoryProps.models || [];

  const vendorOptions = React.useMemo(() => {
    const vendors = new Set();
    let hasUnknownVendor = false;
    allModels.forEach((model) => {
      if (model.vendor_name) vendors.add(model.vendor_name);
      else hasUnknownVendor = true;
    });

    const sortedVendors = Array.from(vendors).sort((a, b) =>
      a.localeCompare(b),
    );
    const options = [
      {
        label: `${t('全部供应商')} (${vendorModels.length})`,
        value: 'all',
      },
      ...sortedVendors.map((vendor) => {
        const count = vendorModels.filter(
          (m) => m.vendor_name === vendor,
        ).length;
        return {
          label: `${vendor} (${count})`,
          value: vendor,
          disabled: count === 0,
        };
      }),
    ];

    if (hasUnknownVendor) {
      const unknownCount = vendorModels.filter((m) => !m.vendor_name).length;
      options.push({
        label: `${t('未知供应商')} (${unknownCount})`,
        value: 'unknown',
        disabled: unknownCount === 0,
      });
    }
    return options;
  }, [allModels, vendorModels, t]);

  const tagOptions = React.useMemo(() => {
    const tags = new Set();
    allModels.forEach((model) => {
      if (!model.tags) return;
      model.tags
        .split(/[,;|]+/)
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .forEach((tag) => tags.add(tag));
    });
    const sortedTags = Array.from(tags).sort((a, b) => a.localeCompare(b));

    const countByTag = (targetTag) =>
      tagModels.filter((model) => {
        if (!model.tags) return false;
        return model.tags
          .split(/[,;|]+/)
          .map((tag) => tag.trim().toLowerCase())
          .includes(targetTag);
      }).length;

    return [
      {
        label: `${t('全部标签')} (${tagModels.length})`,
        value: 'all',
      },
      ...sortedTags.map((tag) => {
        const count = countByTag(tag);
        return {
          label: `${tag} (${count})`,
          value: tag,
          disabled: count === 0,
        };
      }),
    ];
  }, [allModels, tagModels, t]);

  const groupOptions = React.useMemo(() => {
    const groups = [
      'all',
      ...Object.keys(categoryProps.usableGroup || {}).filter(Boolean),
    ];
    return groups.map((group) => {
      const count =
        group === 'all'
          ? groupCountModels.length
          : groupCountModels.filter(
              (model) =>
                Array.isArray(model.enable_groups) &&
                model.enable_groups.includes(group),
            ).length;
      if (group === 'all') {
        return {
          label: `${t('全部分组')} (${count})`,
          value: group,
        };
      }
      const ratio = categoryProps.groupRatio?.[group];
      const ratioText =
        ratio !== undefined && ratio !== null ? `x${ratio}` : 'x1';
      return {
        label: `${group} (${ratioText})`,
        value: group,
        disabled: count === 0,
      };
    });
  }, [
    categoryProps.usableGroup,
    categoryProps.groupRatio,
    groupCountModels,
    t,
  ]);

  const quotaTypeOptions = React.useMemo(() => {
    const countAll = quotaTypeModels.length;
    const countByQuantity = quotaTypeModels.filter(
      (m) => m.quota_type === 0,
    ).length;
    const countByTimes = quotaTypeModels.filter(
      (m) => m.quota_type === 1,
    ).length;
    return [
      { label: `${t('全部类型')} (${countAll})`, value: 'all' },
      {
        label: `${t('按量计费')} (${countByQuantity})`,
        value: 0,
        disabled: countByQuantity === 0,
      },
      {
        label: `${t('按次计费')} (${countByTimes})`,
        value: 1,
        disabled: countByTimes === 0,
      },
    ];
  }, [quotaTypeModels, t]);

  const endpointTypeOptions = React.useMemo(() => {
    const endpointTypes = new Set();
    allModels.forEach((model) => {
      if (!Array.isArray(model.supported_endpoint_types)) return;
      model.supported_endpoint_types.forEach((endpoint) =>
        endpointTypes.add(endpoint),
      );
    });
    const sortedTypes = Array.from(endpointTypes).sort((a, b) =>
      a.localeCompare(b),
    );
    return [
      {
        label: `${t('全部端点')} (${endpointTypeModels.length})`,
        value: 'all',
      },
      ...sortedTypes.map((endpointType) => {
        const count = endpointTypeModels.filter(
          (m) =>
            Array.isArray(m.supported_endpoint_types) &&
            m.supported_endpoint_types.includes(endpointType),
        ).length;
        return {
          label: `${endpointType} (${count})`,
          value: endpointType,
          disabled: count === 0,
        };
      }),
    ];
  }, [allModels, endpointTypeModels, t]);

  return (
    <div className='market-premium__filter-panel p-2'>
      <div className='market-premium__filter-head flex items-center justify-between mb-6'>
        <div className='market-premium__filter-title text-lg font-semibold text-gray-800'>
          {t('筛选')}
        </div>
        <Button
          theme='outline'
          type='tertiary'
          onClick={handleResetFilters}
          className='market-premium__filter-reset text-gray-500 hover:text-gray-700'
        >
          {t('重置')}
        </Button>
      </div>

      <div className='market-premium__filter-rows'>
        <div className='market-premium__filter-row'>
          <span className='market-premium__filter-row-label'>
            {t('供应商')}
          </span>
          <div className='market-premium__filter-control'>
            <Select
              className='market-premium__filter-select'
              value={filterVendor}
              optionList={vendorOptions}
              onChange={(value) => setFilterVendor(value ?? 'all')}
              disabled={loading}
              showArrow={false}
              size='small'
            />
          </div>
        </div>

        <div className='market-premium__filter-row'>
          <span className='market-premium__filter-row-label'>{t('标签')}</span>
          <div className='market-premium__filter-control'>
            <Select
              className='market-premium__filter-select'
              value={filterTag}
              optionList={tagOptions}
              onChange={(value) => setFilterTag(value ?? 'all')}
              disabled={loading}
              showArrow={false}
              size='small'
            />
          </div>
        </div>

        <div className='market-premium__filter-row'>
          <span className='market-premium__filter-row-label'>
            {t('可用令牌分组')}
          </span>
          <div className='market-premium__filter-control'>
            <Select
              className='market-premium__filter-select'
              value={filterGroup}
              optionList={groupOptions}
              onChange={(value) => handleGroupClick(value ?? 'all')}
              disabled={loading}
              showArrow={false}
              size='small'
            />
          </div>
        </div>

        <div className='market-premium__filter-row'>
          <span className='market-premium__filter-row-label'>
            {t('计费类型')}
          </span>
          <div className='market-premium__filter-control'>
            <Select
              className='market-premium__filter-select'
              value={filterQuotaType}
              optionList={quotaTypeOptions}
              onChange={(value) => setFilterQuotaType(value ?? 'all')}
              disabled={loading}
              showArrow={false}
              size='small'
            />
          </div>
        </div>

        <div className='market-premium__filter-row'>
          <span className='market-premium__filter-row-label'>
            {t('端点类型')}
          </span>
          <div className='market-premium__filter-control'>
            <Select
              className='market-premium__filter-select'
              value={filterEndpointType}
              optionList={endpointTypeOptions}
              onChange={(value) => setFilterEndpointType(value ?? 'all')}
              disabled={loading}
              showArrow={false}
              size='small'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSidebar;
