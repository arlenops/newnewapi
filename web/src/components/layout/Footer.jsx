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

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@douyinfe/semi-ui';
import { getFooterHTML, getLogo, getSystemName } from '../../helpers';
import { StatusContext } from '../../context/Status';

const FooterBar = () => {
  const { t } = useTranslation();
  const [footer, setFooter] = useState(getFooterHTML());
  const systemName = getSystemName();
  const logo = getLogo();
  const [statusState] = useContext(StatusContext);
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;

  const loadFooter = () => {
    const footerHTML = localStorage.getItem('footer_html');
    if (footerHTML) {
      setFooter(footerHTML);
    }
  };

  const currentYear = new Date().getFullYear();

  const linkGroups = useMemo(
    () => [
      {
        title: t('关于我们'),
        links: [
          { label: t('关于项目'), href: 'https://docs.newapi.pro/wiki/project-introduction/' },
          { label: t('联系我们'), href: 'https://docs.newapi.pro/support/community-interaction/' },
          { label: t('功能特性'), href: 'https://docs.newapi.pro/wiki/features-introduction/' },
        ],
      },
      {
        title: t('文档'),
        links: [
          { label: t('快速开始'), href: 'https://docs.newapi.pro/getting-started/' },
          { label: t('安装指南'), href: 'https://docs.newapi.pro/installation/' },
          { label: t('API 文档'), href: 'https://docs.newapi.pro/api/' },
        ],
      },
      {
        title: t('相关项目'),
        links: [
          { label: 'One API', href: 'https://github.com/songquanpeng/one-api' },
          { label: 'Midjourney-Proxy', href: 'https://github.com/novicezk/midjourney-proxy' },
          { label: 'neko-api-key-tool', href: 'https://github.com/Calcium-Ion/neko-api-key-tool' },
        ],
      },
      {
        title: t('友情链接'),
        links: [
          { label: 'new-api-horizon', href: 'https://github.com/Calcium-Ion/new-api-horizon' },
          { label: 'CoAI', href: 'https://github.com/coaidev/coai' },
          { label: 'GPT-Load', href: 'https://www.gpt-load.com/' },
        ],
      },
    ],
    [t],
  );

  useEffect(() => {
    loadFooter();
  }, []);

  const attributionNode = (
    <div className='app-footer-attribution'>
      <span className='app-footer-meta-muted'>{t('设计与开发由')} </span>
      <a
        href='https://github.com/QuantumNous/new-api'
        target='_blank'
        rel='noopener noreferrer'
        className='!text-semi-color-primary font-medium'
      >
        New API
      </a>
    </div>
  );

  return (
    <div className='w-full app-footer-shell app-footer-surface'>
      {footer ? (
        <div className='app-footer-inner app-footer-inner--custom'>
          <div
            className='custom-footer'
            dangerouslySetInnerHTML={{ __html: footer }}
          ></div>
          <div className='app-footer-meta app-footer-meta--custom'>
            {attributionNode}
          </div>
        </div>
      ) : (
        <footer className='app-footer-inner'>
          {isDemoSiteMode && (
            <div className='app-footer-main'>
              <div className='app-footer-brand'>
                <img
                  src={logo}
                  alt={systemName}
                  className='w-16 h-16 rounded-full bg-gray-800 p-1.5 object-contain'
                />
              </div>

              <div className='app-footer-links-grid'>
                {linkGroups.map((group) => (
                  <div key={group.title} className='text-left'>
                    <p className='app-footer-group-title'>{group.title}</p>
                    <div className='app-footer-group-links'>
                      {group.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='app-footer-group-link'
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='app-footer-meta'>
            <div className='flex flex-wrap items-center gap-2'>
              <Typography.Text className='text-sm !text-semi-color-text-1'>
                © {currentYear} {systemName}. {t('版权所有')}
              </Typography.Text>
            </div>
            {attributionNode}
          </div>
        </footer>
      )}
    </div>
  );
};

export default FooterBar;
