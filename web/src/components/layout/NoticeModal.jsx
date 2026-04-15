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

import React, { useEffect, useMemo, useState, useContext } from 'react';
import {
  Button,
  Empty,
  Modal,
  SideSheet,
  Tabs,
  TabPane,
  Tag,
} from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { API, showError, getRelativeTime } from '../../helpers';
import { marked } from 'marked';
import {
  IllustrationNoContent,
  IllustrationNoContentDark,
} from '@douyinfe/semi-illustrations';
import { StatusContext } from '../../context/Status';
import { Bell, RefreshCw, Megaphone, ArrowRight } from 'lucide-react';
import './NoticeModal.css';

const NOTICE_READ_KEY = 'notice_read_keys';

const TYPE_META = {
  default: { color: 'grey', label: '通知' },
  ongoing: { color: 'blue', label: '进行中' },
  success: { color: 'green', label: '通知' },
  warning: { color: 'orange', label: '重要' },
  error: { color: 'red', label: '更新' },
};

const normalizeTabKey = (tabKey) => {
  if (tabKey === 'system') return 'history';
  if (tabKey === 'inApp') return 'notice';
  return tabKey || 'history';
};

const getAnnouncementKey = (item) =>
  `${item?.publishDate || ''}-${(item?.content || '').slice(0, 30)}`;

const toPlainText = (markdownContent) =>
  marked
    .parse(markdownContent || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const deriveTitleAndSummary = (item) => {
  const contentText = toPlainText(item?.content || '');
  const extraText = toPlainText(item?.extra || '');
  const [firstLine, ...restLines] = contentText
    .split(/\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const title = (firstLine || contentText || '').slice(0, 72);
  const fallbackSummary = restLines.join(' ').trim() || contentText;
  const summary = (extraText || fallbackSummary || '').slice(0, 140);

  return {
    title: title || 'Untitled',
    summary,
  };
};

const NoticeModal = ({
  visible,
  onClose,
  isMobile,
  defaultTab = 'history',
  unreadKeys = [],
  onMarkAllRead,
}) => {
  const { t } = useTranslation();
  const [noticeContent, setNoticeContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(normalizeTabKey(defaultTab));
  const [selectedAnnouncementKey, setSelectedAnnouncementKey] = useState('');
  const [localUnreadKeys, setLocalUnreadKeys] = useState(unreadKeys);

  const [statusState] = useContext(StatusContext);
  const announcements = statusState?.status?.announcements || [];

  const unreadSet = useMemo(() => new Set(localUnreadKeys), [localUnreadKeys]);

  const processedAnnouncements = useMemo(() => {
    return [...(announcements || [])]
      .slice(0, 20)
      .sort((a, b) => {
        const dateA = new Date(a?.publishDate || 0).getTime();
        const dateB = new Date(b?.publishDate || 0).getTime();
        return dateB - dateA;
      })
      .map((item) => {
        const publishDate = item?.publishDate ? new Date(item.publishDate) : null;
        const absoluteTime =
          publishDate && !isNaN(publishDate.getTime())
            ? `${publishDate.getFullYear()}-${String(
                publishDate.getMonth() + 1,
              ).padStart(2, '0')}-${String(publishDate.getDate()).padStart(
                2,
                '0',
              )}`
            : item?.publishDate || '';
        const { title, summary } = deriveTitleAndSummary(item);
        return {
          ...item,
          key: getAnnouncementKey(item),
          type: item.type || 'default',
          time: absoluteTime,
          relative: getRelativeTime(item.publishDate),
          title,
          summary,
          isUnread: unreadSet.has(getAnnouncementKey(item)),
          htmlContent: marked.parse(item?.content || ''),
        };
      });
  }, [announcements, unreadSet]);

  useEffect(() => {
    setLocalUnreadKeys(unreadKeys);
  }, [unreadKeys]);

  useEffect(() => {
    if (visible) {
      setActiveTab(normalizeTabKey(defaultTab));
      setSelectedAnnouncementKey('');
    }
  }, [defaultTab, visible]);

  useEffect(() => {
    if (!selectedAnnouncementKey) {
      return;
    }
    const exists = processedAnnouncements.some(
      (item) => item.key === selectedAnnouncementKey,
    );
    if (!exists) {
      setSelectedAnnouncementKey('');
    }
  }, [processedAnnouncements, selectedAnnouncementKey]);

  const selectedAnnouncement = useMemo(
    () =>
      processedAnnouncements.find((item) => item.key === selectedAnnouncementKey) ||
      null,
    [processedAnnouncements, selectedAnnouncementKey],
  );

  const persistReadKeys = (announcementItems) => {
    let existingKeys = [];
    try {
      existingKeys = JSON.parse(localStorage.getItem(NOTICE_READ_KEY)) || [];
    } catch (_) {
      existingKeys = [];
    }
    const merged = Array.from(
      new Set([...existingKeys, ...announcementItems.map(getAnnouncementKey)]),
    );
    localStorage.setItem(NOTICE_READ_KEY, JSON.stringify(merged));
    return merged;
  };

  const handleMarkAllRead = () => {
    if (!announcements.length) return;
    persistReadKeys(announcements);
    setLocalUnreadKeys([]);
    onMarkAllRead?.();
  };

  const handleSelectAnnouncement = (item) => {
    const key = getAnnouncementKey(item);
    persistReadKeys([item]);
    setLocalUnreadKeys((prev) => prev.filter((unreadKey) => unreadKey !== key));
    setSelectedAnnouncementKey(key);
  };

  const handleCloseTodayNotice = () => {
    const today = new Date().toDateString();
    localStorage.setItem('notice_close_date', today);
    onClose();
  };

  const displayNotice = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/notice');
      const { success, message, data } = res.data;
      if (success) {
        setNoticeContent(data ? marked.parse(data) : '');
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      displayNotice();
    }
  }, [visible]);

  const renderAnnouncementHistory = () => {
    if (processedAnnouncements.length === 0) {
      return (
        <div className='notice-history__empty'>
          <Empty
            image={<IllustrationNoContent style={{ width: 150, height: 150 }} />}
            darkModeImage={
              <IllustrationNoContentDark style={{ width: 150, height: 150 }} />
            }
            description={t('暂无系统公告')}
          />
        </div>
      );
    }

    return (
      <div className='notice-history'>
        <div className='notice-history__list card-content-scroll'>
          {processedAnnouncements.map((item) => {
            const typeMeta = TYPE_META[item.type] || TYPE_META.default;
            const isActive = selectedAnnouncement?.key === item.key;
            return (
              <button
                key={item.key}
                type='button'
                className={`notice-history__item ${
                  isActive ? 'notice-history__item--active' : ''
                }`}
                onClick={() => handleSelectAnnouncement(item)}
              >
                <div className='notice-history__item-main'>
                  <div className='notice-history__item-top'>
                    <div className='notice-history__item-title-wrap'>
                      <span
                        className={`notice-history__item-dot ${
                          item.isUnread ? 'notice-history__item-dot--unread' : ''
                        }`}
                      />
                      <span className='notice-history__item-title'>{item.title}</span>
                    </div>
                    <span className='notice-history__item-time'>
                      {item.relative || item.time}
                    </span>
                  </div>
                  {item.summary ? (
                    <p className='notice-history__item-summary'>{item.summary}</p>
                  ) : null}
                  <div className='notice-history__item-meta'>
                    <Tag color={typeMeta.color} shape='circle' size='small'>
                      {t(typeMeta.label)}
                    </Tag>
                    <span className='notice-history__item-date'>{item.time}</span>
                  </div>
                </div>
                <ArrowRight size={16} className='notice-history__item-arrow' />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderInAppNotice = () => {
    if (loading) {
      return (
        <div className='notice-history__empty'>
          <Empty description={t('加载中...')} />
        </div>
      );
    }

    if (!noticeContent) {
      return (
        <div className='notice-history__empty'>
          <Empty
            image={<IllustrationNoContent style={{ width: 150, height: 150 }} />}
            darkModeImage={
              <IllustrationNoContentDark style={{ width: 150, height: 150 }} />
            }
            description={t('暂无公告')}
          />
        </div>
      );
    }

    return (
      <div
        dangerouslySetInnerHTML={{ __html: noticeContent }}
        className='notice-history__markdown notice-content-scroll'
      />
    );
  };

  return (
    <>
      <SideSheet
        title={
          <div className='notice-sheet__title'>
            <div className='notice-sheet__title-main'>
              <Bell size={18} />
              <span>{t('系统公告')}</span>
              <Tag color='blue' shape='circle'>
                {processedAnnouncements.length}
              </Tag>
            </div>
          </div>
        }
        visible={visible}
        onCancel={onClose}
        placement='right'
        width={isMobile ? '100%' : 520}
        bodyStyle={{ padding: 0 }}
        footer={
          <div className='notice-sheet__footer'>
            <Button
              theme='borderless'
              type='tertiary'
              icon={<RefreshCw size={15} />}
              onClick={displayNotice}
            >
              {t('刷新')}
            </Button>
            <div className='notice-sheet__footer-actions'>
              <Button theme='light' type='tertiary' onClick={handleCloseTodayNotice}>
                {t('今日关闭')}
              </Button>
              <Button
                type='primary'
                onClick={handleMarkAllRead}
                disabled={localUnreadKeys.length === 0}
              >
                {t('全部已读')} ({localUnreadKeys.length})
              </Button>
            </div>
          </div>
        }
      >
        <div className='notice-sheet'>
          <div className='notice-sheet__tabs'>
            <Tabs activeKey={activeTab} onChange={setActiveTab} type='button'>
              <TabPane
                tab={
                  <span className='notice-sheet__tab-label'>
                    <Megaphone size={14} />
                    {t('公告历史')}
                  </span>
                }
                itemKey='history'
              />
              <TabPane
                tab={
                  <span className='notice-sheet__tab-label'>
                    <Bell size={14} />
                    {t('通知')}
                  </span>
                }
                itemKey='notice'
              />
            </Tabs>
          </div>
          <div className='notice-sheet__body'>
            {activeTab === 'history' ? renderAnnouncementHistory() : renderInAppNotice()}
          </div>
        </div>
      </SideSheet>

      <Modal
        title={selectedAnnouncement?.title || t('系统公告')}
        visible={Boolean(selectedAnnouncement)}
        onCancel={() => setSelectedAnnouncementKey('')}
        footer={null}
        size={isMobile ? 'full-width' : 'medium'}
      >
        {selectedAnnouncement ? (
          <div className='notice-history__detail notice-history__detail--modal'>
            <div className='notice-history__detail-head'>
              <div>
                <h3 className='notice-history__detail-title'>
                  {selectedAnnouncement.title}
                </h3>
                <div className='notice-history__detail-subtitle'>
                  <span>{selectedAnnouncement.relative || selectedAnnouncement.time}</span>
                  <span>·</span>
                  <span>{selectedAnnouncement.time}</span>
                </div>
              </div>
              <Tag
                color={(TYPE_META[selectedAnnouncement.type] || TYPE_META.default).color}
                shape='circle'
              >
                {t(
                  (TYPE_META[selectedAnnouncement.type] || TYPE_META.default).label,
                )}
              </Tag>
            </div>
            <div
              className='notice-history__detail-content'
              dangerouslySetInnerHTML={{ __html: selectedAnnouncement.htmlContent }}
            />
            {selectedAnnouncement.extra ? (
              <div className='notice-history__detail-extra'>
                {selectedAnnouncement.extra}
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default NoticeModal;
