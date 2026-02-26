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

import { useMemo } from 'react';

export const useNavigation = (t, docsLink, headerNavModules, userState) => {
  const mainNavLinks = useMemo(() => {
    const isAdminUser = Number(userState?.user?.role || 0) >= 10;

    // 默认配置，如果没有传入配置则显示所有模块
    const defaultModules = {
      home: true,
      console: true,
      token: true,
      wallet: true,
      account: true,
      logs: true,
      pricing: true,
      docs: true,
      about: true,
    };

    const rawPricingConfig = headerNavModules?.pricing;
    const normalizedPricing =
      typeof rawPricingConfig === 'boolean'
        ? {
            enabled: rawPricingConfig,
            requireAuth: false,
          }
        : {
            enabled: rawPricingConfig?.enabled ?? defaultModules.pricing,
            requireAuth: rawPricingConfig?.requireAuth ?? false,
          };

    // 使用传入配置并补齐默认值，兼容旧配置缺少字段的场景
    const modules = {
      ...defaultModules,
      ...(headerNavModules || {}),
      pricing: normalizedPricing,
    };

    const allLinks = [
      {
        text: t('首页'),
        itemKey: 'home',
        to: '/',
      },
      {
        text: t('控制台'),
        itemKey: 'console',
        to: '/console',
        requiresAuth: true,
      },
      {
        text: t('令牌'),
        itemKey: 'token',
        to: '/token',
        requiresAuth: true,
      },
      {
        text: t('钱包'),
        itemKey: 'wallet',
        to: '/wallet',
        requiresAuth: true,
      },
      {
        text: t('账户'),
        itemKey: 'account',
        to: '/account',
        requiresAuth: true,
      },
      {
        text: t('日志'),
        itemKey: 'logs',
        requiresAuth: true,
        children: [
          {
            text: t('使用日志'),
            itemKey: 'usage-log',
            to: '/log',
            requiresAuth: true,
          },
          {
            text: t('绘图日志'),
            itemKey: 'drawing-log',
            to: '/midjourney',
            requiresAuth: true,
          },
          {
            text: t('任务日志'),
            itemKey: 'task-log',
            to: '/task',
            requiresAuth: true,
          },
        ],
      },
      {
        text: t('模型'),
        itemKey: 'pricing',
        to: '/pricing',
      },
      ...(docsLink
        ? [
            {
              text: t('文档'),
              itemKey: 'docs',
              isExternal: true,
              externalLink: docsLink,
            },
          ]
        : []),
      {
        text: t('关于'),
        itemKey: 'about',
        to: '/about',
      },
    ];

    // 根据配置过滤导航链接
    return allLinks.filter((link) => {
      if (link.itemKey === 'docs') {
        return docsLink && modules.docs;
      }
      if (link.itemKey === 'console') {
        return modules.console === true && isAdminUser;
      }
      if (link.itemKey === 'pricing') {
        return modules.pricing.enabled;
      }
      return modules[link.itemKey] === true;
    });
  }, [t, docsLink, headerNavModules, userState?.user?.role]);

  return {
    mainNavLinks,
  };
};
