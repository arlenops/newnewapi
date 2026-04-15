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
import { Button } from '@douyinfe/semi-ui';

import { getLobeHubIcon } from '../../../../helpers';
import { resetPricingFilters } from '../../../../helpers/utils';
import { usePricingFilterCounts } from '../../../../hooks/model-pricing/usePricingFilterCounts';
import PricingGroups from '../filter/PricingGroups';

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

  const vendorCards = React.useMemo(() => {
    const vendors = new Map();
    let hasUnknownVendor = false;

    allModels.forEach((model) => {
      if (model.vendor_name) {
        const existing = vendors.get(model.vendor_name);
        if (existing) {
          if (!existing.icon && model.vendor_icon) {
            existing.icon = model.vendor_icon;
          }
        } else {
          vendors.set(model.vendor_name, {
            value: model.vendor_name,
            label: model.vendor_name,
            icon: model.vendor_icon || '',
          });
        }
      } else {
        hasUnknownVendor = true;
      }
    });

    const sortedVendors = Array.from(vendors.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );

    const items = [
      {
        value: 'all',
        label: t('全部供应商'),
        icon: '',
        count: vendorModels.length,
        disabled: vendorModels.length === 0,
      },
      ...sortedVendors.map((vendor) => {
        const count = vendorModels.filter(
          (model) => model.vendor_name === vendor.value,
        ).length;
        return {
          ...vendor,
          count,
          disabled: count === 0,
        };
      }),
    ];

    if (hasUnknownVendor) {
      const unknownCount = vendorModels.filter((model) => !model.vendor_name)
        .length;
      items.push({
        value: 'unknown',
        label: t('未知供应商'),
        icon: '',
        count: unknownCount,
        disabled: unknownCount === 0,
      });
    }

    return items;
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

  const renderNativeOptions = React.useCallback(
    (options) =>
      options.map((option) => (
        <option
          key={String(option.value)}
          value={String(option.value)}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      )),
    [],
  );

  return (
    <div className='market-premium__filter-panel'>
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
        <div className='market-premium__vendor-section'>
          <div className='market-premium__vendor-section-head'>
            <span className='market-premium__filter-row-label'>
              {t('供应商')}
            </span>
          </div>
          <div className='market-premium__vendor-list'>
            {vendorCards.map((vendor) => {
              const isActive = (filterVendor ?? 'all') === vendor.value;
              const hasIcon = Boolean(vendor.icon);

              return (
                <button
                  key={vendor.value}
                  type='button'
                  className={`market-premium__vendor-item ${
                    isActive ? 'market-premium__vendor-item--active' : ''
                  }`}
                  onClick={() => setFilterVendor(vendor.value)}
                  disabled={loading || vendor.disabled}
                  aria-pressed={isActive}
                >
                  <span className='market-premium__vendor-main'>
                    <span
                      className={`market-premium__vendor-icon ${
                        hasIcon ? 'market-premium__vendor-icon--logo' : ''
                      }`}
                    >
                      {hasIcon ? (
                        getLobeHubIcon(vendor.icon, 18)
                      ) : (
                        <span className='market-premium__vendor-fallback'>
                          {vendor.value === 'all'
                            ? 'A'
                            : vendor.value === 'unknown'
                              ? '?'
                              : vendor.label.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className='market-premium__vendor-meta'>
                      <span className='market-premium__vendor-name'>
                        {vendor.label}
                      </span>
                    </span>
                  </span>
                  <span className='market-premium__vendor-count'>
                    {vendor.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className='market-premium__filter-row'>
          <span className='market-premium__filter-row-label'>{t('标签')}</span>
          <div className='market-premium__filter-control'>
            <select
              className='market-premium__filter-native-select'
              value={String(filterTag ?? 'all')}
              onChange={(event) => setFilterTag(event.target.value || 'all')}
              disabled={loading}
              aria-label={t('标签')}
            >
              {renderNativeOptions(tagOptions)}
            </select>
          </div>
        </div>

        <div className='market-premium__filter-row'>
          <PricingGroups
            filterGroup={filterGroup}
            setFilterGroup={handleGroupClick}
            usableGroup={categoryProps.usableGroup}
            groupRatio={categoryProps.groupRatio}
            models={groupCountModels}
            loading={loading}
            t={t}
          />
        </div>

        <div className='market-premium__filter-row'>
          <span className='market-premium__filter-row-label'>
            {t('计费类型')}
          </span>
          <div className='market-premium__filter-control'>
            <select
              className='market-premium__filter-native-select'
              value={String(filterQuotaType ?? 'all')}
              onChange={(event) =>
                setFilterQuotaType(
                  event.target.value === 'all' ? 'all' : Number(event.target.value),
                )
              }
              disabled={loading}
              aria-label={t('计费类型')}
            >
              {renderNativeOptions(quotaTypeOptions)}
            </select>
          </div>
        </div>

        <div className='market-premium__filter-row'>
          <span className='market-premium__filter-row-label'>
            {t('端点类型')}
          </span>
          <div className='market-premium__filter-control'>
            <select
              className='market-premium__filter-native-select'
              value={String(filterEndpointType ?? 'all')}
              onChange={(event) =>
                setFilterEndpointType(event.target.value || 'all')
              }
              disabled={loading}
              aria-label={t('端点类型')}
            >
              {renderNativeOptions(endpointTypeOptions)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSidebar;
