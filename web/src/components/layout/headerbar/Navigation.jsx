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
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown } from '@douyinfe/semi-ui';
import { IconChevronDown } from '@douyinfe/semi-icons';
import SkeletonWrapper from '../components/SkeletonWrapper';

const Navigation = ({
  mainNavLinks,
  isMobile,
  isLoading,
  userState,
  pricingRequireAuth,
}) => {
  const navigate = useNavigate();

  const resolveTargetPath = (item, parentItem = null) => {
    const requiresAuth =
      item?.requiresAuth === true || parentItem?.requiresAuth === true;
    const pricingNeedsAuth =
      (item?.itemKey === 'pricing' || parentItem?.itemKey === 'pricing') &&
      pricingRequireAuth;
    const needLogin = (requiresAuth || pricingNeedsAuth) && !userState.user;
    if (needLogin) {
      return '/login';
    }
    return item?.to;
  };

  const renderNavLinks = () => {
    const baseClasses =
      'flex-shrink-0 flex items-center gap-1 font-semibold rounded-md transition-all duration-200 ease-in-out';
    const hoverClasses = 'hover:text-semi-color-primary';
    const spacingClasses = isMobile ? 'p-1' : 'p-2';

    const commonLinkClasses = `${baseClasses} ${spacingClasses} ${hoverClasses}`;

    return mainNavLinks.map((link) => {
      const linkContent = <span>{link.text}</span>;

      if (link.isExternal) {
        return (
          <a
            key={link.itemKey}
            href={link.externalLink}
            target='_blank'
            rel='noopener noreferrer'
            className={commonLinkClasses}
          >
            {linkContent}
          </a>
        );
      }

      if (Array.isArray(link.children) && link.children.length > 0) {
        return (
          <Dropdown
            key={link.itemKey}
            trigger={isMobile ? 'click' : 'hover'}
            position='bottom'
            render={
              <Dropdown.Menu>
                {link.children.map((child) => {
                  if (child.isExternal) {
                    return (
                      <Dropdown.Item
                        key={child.itemKey || child.text}
                        onClick={() => {
                          window.open(
                            child.externalLink,
                            '_blank',
                            'noopener,noreferrer',
                          );
                        }}
                      >
                        {child.text}
                      </Dropdown.Item>
                    );
                  }

                  const childTargetPath = resolveTargetPath(child, link);
                  return (
                    <Dropdown.Item
                      key={child.itemKey || child.to || child.text}
                      onClick={() => {
                        if (childTargetPath) {
                          navigate(childTargetPath);
                        }
                      }}
                    >
                      {child.text}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            }
          >
            <button
              type='button'
              className={`${commonLinkClasses} !border-0 !bg-transparent`}
            >
              <span>{link.text}</span>
              <IconChevronDown size='small' />
            </button>
          </Dropdown>
        );
      }

      const targetPath = resolveTargetPath(link);
      return (
        <Link key={link.itemKey} to={targetPath} className={commonLinkClasses}>
          {linkContent}
        </Link>
      );
    });
  };

  const navContainerClasses = isMobile
    ? 'flex flex-1 min-w-0 items-center gap-1 lg:gap-2 mx-2 md:mx-4 overflow-x-auto whitespace-nowrap scrollbar-hide'
    : 'flex flex-1 min-w-0 items-center justify-center gap-1 lg:gap-2 mx-2 md:mx-4 overflow-x-auto whitespace-nowrap scrollbar-hide';

  return (
    <nav className={navContainerClasses}>
      <SkeletonWrapper
        loading={isLoading}
        type='navigation'
        count={4}
        width={60}
        height={16}
        isMobile={isMobile}
      >
        {renderNavLinks()}
      </SkeletonWrapper>
    </nav>
  );
};

export default Navigation;
