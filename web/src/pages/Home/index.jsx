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
import {
  Button,
  Input,
  ScrollList,
  ScrollItem,
} from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconPlay,
  IconFile,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import { createHomeReviewBarrageRows } from './barragePrompts';
import './home.css';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const isChinese = i18n.language.startsWith('zh');
  const heroTitlePrefix =
    statusState?.status?.home_hero_title_prefix || t('统一的');
  const heroTitleMain =
    statusState?.status?.home_hero_title_main || t('大模型接口网关');
  const heroTitleSub =
    statusState?.status?.home_hero_subtitle ||
    t('更好的价格，更好的稳定性，只需要将模型基址替换为：');
  const [typedHeroTitleMain, setTypedHeroTitleMain] = useState(heroTitleMain);
  const [isHeroTitleTyping, setIsHeroTitleTyping] = useState(false);
  const reviewBarrageRows = useMemo(
    () => createHomeReviewBarrageRows({ rowCount: 2, sampleSize: 24 }),
    [],
  );

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  useEffect(() => {
    const rawTexts = [heroTitleMain, heroTitleSub]
      .map((text) => (text || '').trim())
      .filter(Boolean);
    const loopTexts =
      rawTexts.length > 1 && rawTexts[0] === rawTexts[1]
        ? [rawTexts[0]]
        : rawTexts;
    const primaryText = loopTexts[0] || '';

    const shouldReduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (shouldReduceMotion || loopTexts.length <= 1) {
      const text = primaryText;
      if (!text) {
        setTypedHeroTitleMain('');
        setIsHeroTitleTyping(false);
        return;
      }

      const chars = Array.from(text);
      const step = Math.max(
        90,
        Math.min(180, Math.floor(1500 / Math.max(chars.length, 1))),
      );

      let index = 0;
      setTypedHeroTitleMain('');
      setIsHeroTitleTyping(!shouldReduceMotion);

      const timer = setInterval(() => {
        index += 1;
        setTypedHeroTitleMain(chars.slice(0, index).join(''));
        if (index >= chars.length) {
          clearInterval(timer);
          setIsHeroTitleTyping(false);
        }
      }, step);

      return () => clearInterval(timer);
    }

    let timeoutId = null;
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let stopped = false;

    setTypedHeroTitleMain('');
    setIsHeroTitleTyping(true);

    const typeStep = (length) =>
      Math.max(90, Math.min(180, Math.floor(1500 / Math.max(length, 1))));
    const deleteStep = 90;
    const holdTyped = 1200;
    const holdEmpty = 360;

    const schedule = (fn, ms) => {
      timeoutId = setTimeout(fn, ms);
    };

    const tick = () => {
      if (stopped) return;

      const phrase = loopTexts[phraseIndex];
      const chars = Array.from(phrase);

      if (!deleting) {
        charIndex += 1;
        setTypedHeroTitleMain(chars.slice(0, charIndex).join(''));

        if (charIndex >= chars.length) {
          deleting = true;
          schedule(tick, holdTyped);
          return;
        }

        schedule(tick, typeStep(chars.length));
        return;
      }

      charIndex -= 1;
      setTypedHeroTitleMain(chars.slice(0, Math.max(charIndex, 0)).join(''));

      if (charIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % loopTexts.length;
        schedule(tick, holdEmpty);
        return;
      }

      schedule(tick, deleteStep);
    };

    schedule(tick, 320);

    return () => {
      stopped = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [heroTitleMain, heroTitleSub]);

  return (
    <div className='w-full overflow-x-hidden home-page-root'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='home-premium'>
          <div className='home-premium__orb home-premium__orb--left' />
          <div className='home-premium__orb home-premium__orb--right' />
          <div className='home-premium__grain' />

          <div className='home-premium__container'>
            <section className='home-premium__stage'>
              <div className='home-premium__hero home-reveal' style={{ '--delay': '90ms' }}>
                <h1
                  className={`home-premium__title ${isChinese ? 'home-premium__title--cn' : ''}`}
                >
                  <span>{heroTitlePrefix}</span>
                  <strong
                    className='home-premium__title-main'
                    data-typing={isHeroTitleTyping ? 'true' : 'false'}
                  >
                    {typedHeroTitleMain || '\u00a0'}
                  </strong>
                </h1>

                <div className='home-premium__url-box home-reveal' style={{ '--delay': '180ms' }}>
                  <div className='home-premium__url-label'>BASE URL</div>
                  <Input
                    readonly
                    value={serverAddress}
                    className='home-premium__input'
                    size={isMobile ? 'default' : 'large'}
                    suffix={
                      <div className='home-premium__url-suffix'>
                        <ScrollList
                          bodyHeight={32}
                          style={{ border: 'unset', boxShadow: 'unset' }}
                        >
                          <ScrollItem
                            mode='wheel'
                            cycled={true}
                            list={endpointItems}
                            selectedIndex={endpointIndex}
                            onSelect={({ index }) => setEndpointIndex(index)}
                          />
                        </ScrollList>
                        <Button
                          type='primary'
                          onClick={handleCopyBaseURL}
                          className='home-copy-btn'
                        >
                          start
                        </Button>
                      </div>
                    }
                  />
                </div>

                <div className='home-premium__actions home-reveal' style={{ '--delay': '260ms' }}>
                  <Link to='/token'>
                    <Button
                      theme='solid'
                      type='primary'
                      size={isMobile ? 'default' : 'large'}
                      className='home-btn home-btn--primary'
                      icon={<IconPlay />}
                    >
                      {t('立即开始')}
                    </Button>
                  </Link>
                  {isDemoSiteMode && statusState?.status?.version ? (
                    <Button
                      size={isMobile ? 'default' : 'large'}
                      className='home-btn home-btn--ghost'
                      icon={<IconGithubLogo />}
                      onClick={() =>
                        window.open('https://github.com/QuantumNous/new-api', '_blank')
                      }
                    >
                      {statusState.status.version}
                    </Button>
                  ) : (
                    docsLink && (
                      <Button
                        size={isMobile ? 'default' : 'large'}
                        className='home-btn home-btn--ghost'
                        icon={<IconFile />}
                        onClick={() => window.open(docsLink, '_blank')}
                      >
                        {t('使用文档')}
                      </Button>
                    )
                  )}
                </div>

                <section
                  className='home-premium__reviews home-reveal'
                  style={{ '--delay': '320ms' }}
                  aria-label='user-reviews'
                >
                  {reviewBarrageRows.map((row, rowIndex) => (
                    <div
                      key={`review-row-${rowIndex}`}
                      className={`home-premium__reviews-row ${rowIndex % 2 === 1 ? 'home-premium__reviews-row--reverse' : ''}`}
                    >
                      <div className='home-premium__reviews-track'>
                        {[...row, ...row].map((review, index) => (
                          <span
                            key={`review-${rowIndex}-${index}`}
                            className='home-premium__review-pill'
                          >
                            {review}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
