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

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@douyinfe/semi-ui';
import { API, showError } from '../../helpers';
import { fetchNoticeContent } from '../../helpers/notice';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconBookOpenStroked,
  IconGithubLogo,
  IconSend,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import './home.css';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const rainbowCanvasRef = useRef(null);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const announcements = statusState?.status?.announcements || [];
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
  const typewriterTexts = useMemo(() => {
    const mainText = [heroTitlePrefix, heroTitleMain]
      .map((text) => (text || '').trim())
      .filter(Boolean)
      .join(isChinese ? '' : ' ');
    const normalize = (text) => text.replace(/\s+/g, '').toLowerCase();
    return [heroTitleSub, mainText]
      .map((text) => (text || '').trim())
      .filter((text) => text && normalize(text) !== 'oioiart');
  }, [heroTitlePrefix, heroTitleMain, heroTitleSub, isChinese]);

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

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      // When system announcements exist, let users open them explicitly
      // from the header instead of blocking the homepage on first load.
      if (announcements.length > 0) {
        return;
      }

      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const { success, data } = await fetchNoticeContent();
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (_) {}
      }
    };

    checkNoticeAndShow();
  }, [announcements]);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    const loopTexts =
      typewriterTexts.length > 1 && typewriterTexts[0] === typewriterTexts[1]
        ? [typewriterTexts[0]]
        : typewriterTexts;
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
  }, [typewriterTexts]);

  useEffect(() => {
    if (!homePageContentLoaded || homePageContent !== '') return;

    const canvas = rainbowCanvasRef.current;
    if (!canvas) return;

    const shouldReduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (shouldReduceMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let mouseX = 0;
    let mouseY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let hue = 0;
    let frameId = 0;
    const trail = [];
    const particles = [];
    const maxTrailLength = 60;

    const getCanvasPoint = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, window.innerWidth || 1);
      height = Math.max(rect.height, window.innerHeight || 1);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (mouseX === 0 && mouseY === 0) {
        mouseX = width / 2;
        mouseY = height / 2;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
      }
    };

    class Particle {
      constructor(x, y, particleHue) {
        this.x = x + (Math.random() - 0.5) * 10;
        this.y = y + (Math.random() - 0.5) * 10;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.size = Math.random() * 4 + 1.5;
        this.hue = particleHue + (Math.random() - 0.5) * 50;
        this.life = 1;
        this.decay = Math.random() * 0.03 + 0.015;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.92;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 65%, ${this.life})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `hsla(${this.hue}, 100%, 65%, ${this.life})`;
        ctx.fill();
      }
    }

    const drawTrail = () => {
      if (trail.length <= 1) return;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < trail.length; i += 1) {
        const pt1 = trail[i - 1];
        const pt2 = trail[i];
        const progress = i / trail.length;
        const currentHue = (hue + i * 2) % 360;

        ctx.beginPath();
        ctx.lineWidth = 18 * progress;
        ctx.strokeStyle = `hsla(${currentHue}, 100%, 55%, ${progress})`;
        ctx.shadowBlur = 15 * progress;
        ctx.shadowColor = `hsla(${currentHue}, 100%, 55%, ${progress})`;
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.shadowBlur = 0;

      trail.push({ x: mouseX, y: mouseY });
      if (trail.length > maxTrailLength) {
        trail.shift();
      }

      hue = (hue + 3) % 360;

      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 1 || Math.random() > 0.85) {
        const particleCount = Math.min(Math.floor(distance / 2) + 2, 10);
        for (let i = 0; i < particleCount; i += 1) {
          particles.push(new Particle(mouseX, mouseY, hue));
        }
      }

      lastMouseX = mouseX;
      lastMouseY = mouseY;
      drawTrail();

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        particles[i].update();
        if (particles[i].life <= 0 || particles[i].size <= 0.1) {
          particles.splice(i, 1);
        } else {
          particles[i].draw();
        }
      }

      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 8, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${(hue + trail.length * 2) % 360}, 100%, 70%, 0.8)`;
      ctx.shadowBlur = 30;
      ctx.shadowColor = `hsla(${(hue + trail.length * 2) % 360}, 100%, 60%, 1)`;
      ctx.fill();

      frameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (event) => {
      const point = getCanvasPoint(event.clientX, event.clientY);
      mouseX = point.x;
      mouseY = point.y;
    };

    const handleTouchMove = (event) => {
      if (!event.touches.length) return;
      const point = getCanvasPoint(
        event.touches[0].clientX,
        event.touches[0].clientY,
      );
      mouseX = point.x;
      mouseY = point.y;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [homePageContentLoaded, homePageContent]);

  return (
    <div className='w-full overflow-x-hidden home-page-root'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='home-premium'>
          <canvas
            ref={rainbowCanvasRef}
            className='home-rainbow-canvas'
            aria-hidden='true'
          />
          <div className='home-premium__grain' />

          <div className='home-premium__container'>
            <section className='home-premium__stage'>
              <div className='home-premium__hero home-reveal' style={{ '--delay': '90ms' }}>
                <div className='home-premium__title-wrap'>
                  <h1 className='home-premium__title noise-text'>
                    OiOi ART
                  </h1>
                  <span className='home-premium__handwriting'>
                    Your eyes, your rules
                  </span>
                </div>

                <p
                  className={`home-premium__typewriter ${isChinese ? 'home-premium__typewriter--cn' : ''}`}
                >
                  <span
                    className='home-premium__typed-text'
                    data-typing={isHeroTitleTyping ? 'true' : 'false'}
                  >
                    {typedHeroTitleMain || '\u00a0'}
                  </span>
                </p>

                <div className='home-premium__actions home-reveal' style={{ '--delay': '180ms' }}>
                  <Link to='/token' reloadDocument>
                    <Button
                      theme='solid'
                      type='primary'
                      size={isMobile ? 'default' : 'large'}
                      className='home-btn home-btn--primary'
                      icon={<IconSend />}
                    >
                      {t('开始创作')}
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
                        icon={<IconBookOpenStroked />}
                        onClick={() => window.open(docsLink, '_blank')}
                      >
                        {t('使用教程')}
                      </Button>
                    )
                  )}
                </div>

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
