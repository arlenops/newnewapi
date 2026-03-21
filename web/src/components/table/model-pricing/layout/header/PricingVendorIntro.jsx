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

import React, { useCallback, useMemo, memo } from 'react';
import { Card, Tooltip } from '@douyinfe/semi-ui';
import { getLobeHubIcon } from '../../../../../helpers';
import SearchActions from './SearchActions';

const UNKNOWN_VENDOR = 'unknown';
const ALL_VENDOR = 'all';

const PricingVendorIntro = memo(
  ({
    filterVendor = ALL_VENDOR,
    models = [],
    allModels = [],
    t,
    selectedRowKeys = [],
    copyText,
    handleChange,
    handleCompositionStart,
    handleCompositionEnd,
    isMobile = false,
    searchValue = '',
    setShowFilterModal,
  }) => {
    const vendorMap = useMemo(() => {
      const map = new Map();
      const sourceModels =
        Array.isArray(allModels) && allModels.length > 0 ? allModels : models;

      sourceModels.forEach((model) => {
        if (!model.vendor_name) {
          return;
        }

        if (!map.has(model.vendor_name)) {
          map.set(model.vendor_name, {
            name: model.vendor_name,
            icon: model.vendor_icon || '',
          });
          return;
        }

        const existing = map.get(model.vendor_name);
        if (!existing.icon && model.vendor_icon) {
          existing.icon = model.vendor_icon;
        }
      });

      return map;
    }, [allModels, models]);

    const currentVendor = useMemo(() => {
      if (filterVendor === ALL_VENDOR) {
        return {
          name: ALL_VENDOR,
          icon: '',
        };
      }

      if (filterVendor === UNKNOWN_VENDOR) {
        return {
          name: UNKNOWN_VENDOR,
          icon: '',
        };
      }

      return (
        vendorMap.get(filterVendor) || {
          name: filterVendor,
          icon: '',
        }
      );
    }, [filterVendor, vendorMap]);

    const renderVendorBadge = useCallback(
      (vendor) => {
        if (!vendor) {
          return null;
        }

        const displayName =
          vendor.name === ALL_VENDOR
            ? t('全部供应商')
            : vendor.name === UNKNOWN_VENDOR
              ? t('未知供应商')
              : vendor.name;

        const fallback =
          vendor.name === ALL_VENDOR
            ? 'A'
            : vendor.name === UNKNOWN_VENDOR
              ? '?'
              : vendor.name.slice(0, 1).toUpperCase();

        return (
          <Tooltip content={displayName} position='top'>
            <div className='market-premium__hero-vendor-badge'>
              <span
                className={`market-premium__hero-vendor-icon ${
                  vendor.icon ? 'market-premium__hero-vendor-icon--logo' : ''
                }`}
              >
                {vendor.icon ? (
                  getLobeHubIcon(vendor.icon, 26)
                ) : (
                  <span className='market-premium__hero-vendor-fallback'>
                    {fallback}
                  </span>
                )}
              </span>
            </div>
          </Tooltip>
        );
      },
      [t],
    );

    const renderSearchActions = useCallback(
      () => (
        <SearchActions
          selectedRowKeys={selectedRowKeys}
          copyText={copyText}
          handleChange={handleChange}
          handleCompositionStart={handleCompositionStart}
          handleCompositionEnd={handleCompositionEnd}
          isMobile={isMobile}
          searchValue={searchValue}
          setShowFilterModal={setShowFilterModal}
          showCopyButton={false}
          trailingContent={renderVendorBadge(currentVendor)}
          t={t}
        />
      ),
      [
        selectedRowKeys,
        copyText,
        handleChange,
        handleCompositionStart,
        handleCompositionEnd,
        isMobile,
        searchValue,
        setShowFilterModal,
        renderVendorBadge,
        currentVendor,
        t,
      ],
    );

    return (
      <Card className='market-premium__hero-card market-premium__hero-card--minimal !rounded-2xl shadow-sm border-0'>
        <div className='market-premium__hero-minimal market-premium__hero-minimal--search-only'>
          <div className='market-premium__hero-search'>
            {renderSearchActions()}
          </div>
        </div>
      </Card>
    );
  },
);

PricingVendorIntro.displayName = 'PricingVendorIntro';

export default PricingVendorIntro;
