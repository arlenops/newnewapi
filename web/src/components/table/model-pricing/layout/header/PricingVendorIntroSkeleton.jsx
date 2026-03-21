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

import React, { memo } from 'react';
import { Card, Skeleton } from '@douyinfe/semi-ui';

const rect = (style, key) => (
  <div key={key} className='animate-pulse' style={style} />
);

const baseBlock = {
  backgroundColor: 'rgba(17, 17, 17, 0.11)',
  borderRadius: 12,
};

const PricingVendorIntroSkeleton = memo(() => {
  const placeholder = (
    <Card className='market-premium__hero-card market-premium__hero-card--minimal !rounded-2xl shadow-sm border-0'>
      <div className='market-premium__hero-minimal market-premium__hero-minimal--search-only'>
        <div className='market-premium__hero-search'>
          <div className='market-premium__search-actions flex items-center w-full'>
            <div className='market-premium__search-input-wrap flex-1'>
              {rect(
                {
                  ...baseBlock,
                  width: '100%',
                  height: 48,
                },
                'search',
              )}
            </div>
            <div className='market-premium__search-extra'>
              {rect(
                {
                  ...baseBlock,
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                },
                'logo',
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return <Skeleton loading={true} active placeholder={placeholder}></Skeleton>;
});

PricingVendorIntroSkeleton.displayName = 'PricingVendorIntroSkeleton';

export default PricingVendorIntroSkeleton;
