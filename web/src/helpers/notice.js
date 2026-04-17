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

import { API } from './api';

const NOTICE_CACHE_TTL = 60 * 1000;

let cachedNoticeResponse = null;
let cachedAt = 0;
let inflightNoticePromise = null;

export const fetchNoticeContent = async ({ force = false } = {}) => {
  const now = Date.now();
  if (
    !force &&
    cachedNoticeResponse &&
    now - cachedAt < NOTICE_CACHE_TTL
  ) {
    return cachedNoticeResponse;
  }

  if (!force && inflightNoticePromise) {
    return inflightNoticePromise;
  }

  inflightNoticePromise = API.get('/api/notice', {
    skipErrorHandler: true,
    disableDuplicate: true,
  })
    .then((res) => {
      const { success, message, data } = res.data || {};
      const normalized = {
        success: Boolean(success),
        message: message || '',
        data: data || '',
      };

      if (normalized.success) {
        cachedNoticeResponse = normalized;
        cachedAt = Date.now();
      }

      return normalized;
    })
    .finally(() => {
      inflightNoticePromise = null;
    });

  return inflightNoticePromise;
};
