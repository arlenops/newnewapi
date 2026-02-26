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

const SIZES = {
  title: { width: { all: 120, specific: 100 }, height: 24 },
  tag: { width: 80, height: 20 },
  description: { height: 14 },
  avatar: { width: 40, height: 40 },
  searchInput: { height: 32 },
  button: { width: 80, height: 32 },
};

const SKELETON_STYLES = {
  cover: {
    background:
      'linear-gradient(138deg, rgba(255,255,255,0.94) 0%, rgba(247,249,252,0.9) 54%, rgba(244,248,255,0.88) 100%)',
    borderBottom: '1px solid rgba(17, 17, 17, 0.12)',
  },
  title: {
    backgroundColor: 'rgba(17, 17, 17, 0.14)',
    borderRadius: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    borderRadius: 9999,
    border: '1px solid rgba(17, 17, 17, 0.12)',
  },
  description: {
    backgroundColor: 'rgba(17, 17, 17, 0.11)',
    borderRadius: 4,
  },
  avatar: {
    background:
      'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(240,243,247,0.92) 100%)',
    borderRadius: 12,
    border: '1px solid rgba(17, 17, 17, 0.12)',
    boxShadow: '0 6px 14px -10px rgba(0, 0, 0, 0.35)',
  },
  avatarWrap: {
    borderRadius: 16,
    border: '1px solid rgba(17, 17, 17, 0.1)',
    background: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 12px 24px -18px rgba(0, 0, 0, 0.28)',
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    border: '1px solid rgba(17, 17, 17, 0.12)',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    border: '1px solid rgba(17, 17, 17, 0.16)',
  },
};

const createSkeletonRect = (style = {}, key = null) => (
  <div key={key} className='animate-pulse' style={style} />
);

const PricingVendorIntroSkeleton = memo(
  ({ isAllVendors = false, isMobile = false }) => {
    const placeholder = (
      <Card
        className='market-premium__hero-card !rounded-2xl shadow-sm border-0'
        cover={
          <div
            className='market-premium__hero-cover relative h-full'
            style={SKELETON_STYLES.cover}
          >
            <div className='relative z-10 h-full flex items-center justify-between p-4'>
              <div className='flex-1 min-w-0 mr-4'>
                <div className='flex flex-row flex-wrap items-center gap-2 sm:gap-3 mb-2'>
                  {createSkeletonRect(
                    {
                      ...SKELETON_STYLES.title,
                      width: isAllVendors
                        ? SIZES.title.width.all
                        : SIZES.title.width.specific,
                      height: SIZES.title.height,
                    },
                    'title',
                  )}
                  {createSkeletonRect(
                    {
                      ...SKELETON_STYLES.tag,
                      width: SIZES.tag.width,
                      height: SIZES.tag.height,
                    },
                    'tag',
                  )}
                </div>
                <div className='space-y-2'>
                  {createSkeletonRect(
                    {
                      ...SKELETON_STYLES.description,
                      width: '100%',
                      height: SIZES.description.height,
                    },
                    'desc1',
                  )}
                  {createSkeletonRect(
                    {
                      ...SKELETON_STYLES.description,
                      backgroundColor: 'rgba(17, 17, 17, 0.09)',
                      width: '75%',
                      height: SIZES.description.height,
                    },
                    'desc2',
                  )}
                </div>
              </div>

              <div
                className='flex-shrink-0 w-16 h-16 flex items-center justify-center market-premium__vendor-avatar'
                style={SKELETON_STYLES.avatarWrap}
              >
                {createSkeletonRect(
                  {
                    ...SKELETON_STYLES.avatar,
                    width: SIZES.avatar.width,
                    height: SIZES.avatar.height,
                  },
                  'avatar',
                )}
              </div>
            </div>
          </div>
        }
      >
        <div className='flex items-center gap-2 w-full'>
          <div className='flex-1'>
            {createSkeletonRect(
              {
                ...SKELETON_STYLES.searchInput,
                width: '100%',
                height: SIZES.searchInput.height,
              },
              'search',
            )}
          </div>

          {createSkeletonRect(
            {
              ...SKELETON_STYLES.button,
              width: SIZES.button.width,
              height: SIZES.button.height,
            },
            'copy-button',
          )}

          {isMobile &&
            createSkeletonRect(
              {
                ...SKELETON_STYLES.button,
                width: SIZES.button.width,
                height: SIZES.button.height,
              },
              'filter-button',
            )}
        </div>
      </Card>
    );

    return (
      <Skeleton loading={true} active placeholder={placeholder}></Skeleton>
    );
  },
);

PricingVendorIntroSkeleton.displayName = 'PricingVendorIntroSkeleton';

export default PricingVendorIntroSkeleton;
