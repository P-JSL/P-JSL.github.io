(function () {
  'use strict';

  var DATA_URL = '/site-pages.json';
  var VALID_SLUG = /^[a-z][a-z0-9-]{1,49}$/;
  var MAX_PAGES = 100;

  function validLink(url) {
    if (typeof url !== 'string' || !url || url.length > 1000) return false;
    if (url[0] === '/' && url[1] !== '/' && !url.includes('\\')) return true;
    try {
      var parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch (_) { return false; }
  }

  function validPage(item) {
    return item && typeof item === 'object' &&
      typeof item.slug === 'string' && VALID_SLUG.test(item.slug) &&
      typeof item.title === 'string' && item.title.trim().length > 0 &&
      item.title.length <= 60 &&
      typeof item.summary === 'string' && item.summary.length <= 240 &&
      typeof item.content === 'string' && item.content.length <= 30000 &&
      typeof item.visible === 'boolean' &&
      typeof item.linkLabel === 'string' && item.linkLabel.length <= 60 &&
      typeof item.linkUrl === 'string' &&
      (!item.linkLabel || validLink(item.linkUrl));
  }

  function sanitizeRegistry(data) {
    if (!data || data.schema !== 1 || !Array.isArray(data.pages) ||
        data.pages.length > MAX_PAGES) {
      throw new Error('메뉴 데이터 형식이 올바르지 않습니다.');
    }
    var seen = new Set();
    return data.pages.filter(function (item) {
      if (!validPage(item) || seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    });
  }

  function loadPages() {
    return fetch(DATA_URL, { cache: 'no-store', credentials: 'omit' })
      .then(function (response) {
        if (!response.ok) throw new Error('메뉴 데이터를 불러올 수 없습니다.');
        return response.json();
      })
      .then(sanitizeRegistry);
  }

  function buildNav(element, pages, currentSlug) {
    pages.forEach(function (page) {
      if (!page.visible) return;
      var a = document.createElement('a');
      a.href = '/pages/?slug=' + encodeURIComponent(page.slug);
      a.textContent = page.title;
      if (currentSlug === page.slug) a.setAttribute('aria-current', 'page');
      element.appendChild(a);
    });
  }

  function renderContent(host, content) {
    host.replaceChildren();
    var lines = content.replace(/\r\n?/g, '\n').split('\n');
    var paragraph = [];
    var list = null;

    function flushParagraph() {
      if (!paragraph.length) return;
      var p = document.createElement('p');
      p.textContent = paragraph.join('\n');
      host.appendChild(p);
      paragraph = [];
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) {
        flushParagraph();
        list = null;
        continue;
      }
      var heading = line.match(/^(#{1,3})\s+(.+)$/);
      var bullet = line.match(/^[-*]\s+(.+)$/);
      if (heading) {
        flushParagraph();
        list = null;
        var h = document.createElement(heading[1].length === 1 ? 'h2' :
          heading[1].length === 2 ? 'h3' : 'h4');
        h.textContent = heading[2];
        host.appendChild(h);
      } else if (bullet) {
        flushParagraph();
        if (!list) {
          list = document.createElement('ul');
          host.appendChild(list);
        }
        var item = document.createElement('li');
        item.textContent = bullet[1];
        list.appendChild(item);
      } else {
        list = null;
        paragraph.push(line);
      }
    }
    flushParagraph();
  }

  function renderPublicPage(pages) {
    var target = document.getElementById('managed-page');
    if (!target) return;
    var slug = new URLSearchParams(window.location.search).get('slug') || '';
    if (!VALID_SLUG.test(slug)) return showMissing(target);
    var page = pages.find(function (item) { return item.visible && item.slug === slug; });
    if (!page) return showMissing(target);

    document.title = page.title + ' | P-JSL';
    var name = document.getElementById('page-title');
    var summary = document.getElementById('page-summary');
    if (name) name.textContent = page.title;
    if (summary) summary.textContent = page.summary;
    var body = document.getElementById('page-content');
    if (body) renderContent(body, page.content);

    var link = document.getElementById('page-link');
    if (link && page.linkLabel && validLink(page.linkUrl)) {
      link.href = page.linkUrl;
      link.textContent = page.linkLabel;
      if (page.linkUrl.startsWith('https://')) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      link.hidden = false;
    }
  }

  function showMissing(target) {
    var title = document.getElementById('page-title');
    var summary = document.getElementById('page-summary');
    if (title) title.textContent = '페이지를 찾을 수 없습니다';
    if (summary) summary.textContent = '삭제되었거나 공개되지 않은 메뉴입니다.';
    document.title = '페이지를 찾을 수 없습니다 | P-JSL';
  }

  var nav = document.getElementById('custom-menu');
  var pageHolder = document.getElementById('managed-page');
  if (nav || pageHolder) {
    loadPages().then(function (pages) {
      if (nav) {
        var slug = new URLSearchParams(window.location.search).get('slug');
        buildNav(nav, pages, pageHolder ? slug : null);
      }
      if (pageHolder) renderPublicPage(pages);
    }).catch(function () {
      if (pageHolder) showMissing(pageHolder);
    });
  }

  // Safe text renderer is also shared with the administrator's preview pane.
  window.SitePages = {
    renderContent: renderContent,
    validPage: validPage,
    sanitizeRegistry: sanitizeRegistry,
    validLink: validLink
  };
}());
