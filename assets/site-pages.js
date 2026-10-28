(function () {
  'use strict';

  var DATA_URL = '/site-pages.json';
  var VALID_SLUG = /^[a-z][a-z0-9-]{1,49}$/;
  var BLOCK_TYPES = ['hero', 'heading', 'text', 'image', 'button', 'cards', 'list', 'notice', 'divider', 'spacer', 'downloads', 'download'];
  var MAX_PAGES = 100;
  var MAX_BLOCKS = 60;

  function validLink(url) {
    if (typeof url !== 'string' || !url || url.length > 1200 ||
        /[\u0000-\u001f\u007f]/.test(url) || url.indexOf('\\') !== -1) return false;
    if (url[0] === '/' && url[1] !== '/') return true;
    try {
      var parsed = new URL(url);
      return parsed.protocol === 'https:' && !!parsed.hostname && !parsed.username && !parsed.password;
    } catch (_) { return false; }
  }

  function validBlock(block) {
    if (!block || typeof block !== 'object' || !BLOCK_TYPES.includes(block.type) ||
        typeof block.id !== 'string' || !/^[a-zA-Z0-9_-]{1,70}$/.test(block.id)) return false;
    if (block.title !== undefined && (typeof block.title !== 'string' || block.title.length > 160)) return false;
    if (block.text !== undefined && (typeof block.text !== 'string' || block.text.length > 12000)) return false;
    if (block.url !== undefined && (typeof block.url !== 'string' || (block.url && !validLink(block.url)))) return false;
    if (block.label !== undefined && (typeof block.label !== 'string' || block.label.length > 100)) return false;
    if (block.alt !== undefined && (typeof block.alt !== 'string' || block.alt.length > 180)) return false;
    if (block.caption !== undefined && (typeof block.caption !== 'string' || block.caption.length > 250)) return false;
    if (block.align !== undefined && !['left', 'center'].includes(block.align)) return false;
    if (block.items !== undefined && (!Array.isArray(block.items) || block.items.length > 12 ||
        block.items.some(function (item) {
          return !item || typeof item !== 'object' || typeof item.title !== 'string' ||
            item.title.length > 100 || typeof item.text !== 'string' || item.text.length > 750;
        }))) return false;
    if (block.width !== undefined && ![4,6,8,12].includes(block.width)) return false;
    if (block.variant !== undefined && !['plain','panel','accent'].includes(block.variant)) return false;
    if (block.releaseRepo !== undefined && (typeof block.releaseRepo !== 'string' ||
      !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(block.releaseRepo) || block.releaseRepo.length > 160)) return false;
    if (block.type === 'download' && (
      !['folder','release'].includes(block.source) ||
      typeof block.filename !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,199}$/.test(block.filename) ||
      (block.source === 'release' && (typeof block.releaseTag !== 'string' ||
       !/^(latest|[a-zA-Z0-9][a-zA-Z0-9._-]{0,119})$/.test(block.releaseTag)))
    )) return false;
    if (block.type === 'image' && (!block.url || !validLink(block.url))) return false;
    if (block.type === 'button' && (!block.url || !validLink(block.url))) return false;
    return true;
  }

  function validPage(page) {
    if (!page || typeof page !== 'object' || typeof page.slug !== 'string' ||
        !VALID_SLUG.test(page.slug) || typeof page.title !== 'string' ||
        !page.title.trim() || page.title.length > 60 ||
        typeof page.summary !== 'string' || page.summary.length > 240 ||
        typeof page.visible !== 'boolean') return false;
    if (page.content !== undefined && (typeof page.content !== 'string' || page.content.length > 30000)) return false;
    if (page.linkLabel !== undefined && (typeof page.linkLabel !== 'string' || page.linkLabel.length > 60)) return false;
    if (page.linkUrl !== undefined && (typeof page.linkUrl !== 'string' || (page.linkUrl && !validLink(page.linkUrl)))) return false;
    if (page.linkLabel && !page.linkUrl) return false;
    if (page.blocks !== undefined) {
      if (!Array.isArray(page.blocks) || page.blocks.length > MAX_BLOCKS || !page.blocks.every(validBlock)) return false;
      var ids = new Set();
      for (var i = 0; i < page.blocks.length; i++) {
        if (ids.has(page.blocks[i].id)) return false;
        ids.add(page.blocks[i].id);
      }
    }
    return true;
  }

  function sanitizeRegistry(data) {
    if (!data || data.schema !== 1 || !Array.isArray(data.pages) ||
        data.pages.length > MAX_PAGES) throw new Error('메뉴 데이터 형식이 올바르지 않습니다.');
    var seen = new Set();
    return data.pages.filter(function (page) {
      if (!validPage(page) || seen.has(page.slug)) return false;
      seen.add(page.slug);
      return true;
    });
  }

  function el(tag, className, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }

  function appendLink(host, url, label, className) {
    if (!label || !validLink(url)) return;
    var a = el('a', className, label);
    a.href = url;
    if (url.indexOf('https://') === 0) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    host.appendChild(a);
  }

  function renderContent(host, content) {
    host.replaceChildren();
    var lines = String(content || '').replace(/\r\n?/g, '\n').split('\n');
    var pending = [];
    var list = null;
    function flush() {
      if (!pending.length) return;
      host.appendChild(el('p', '', pending.join('\n')));
      pending = [];
    }
    lines.forEach(function (raw) {
      var line = raw.trim();
      if (!line) { flush(); list = null; return; }
      var heading = line.match(/^(#{1,3})\s+(.+)$/);
      var bullet = line.match(/^[-*]\s+(.+)$/);
      if (heading) {
        flush(); list = null;
        host.appendChild(el(heading[1].length === 1 ? 'h2' : 'h3', '', heading[2]));
      } else if (bullet) {
        flush();
        if (!list) { list = el('ul'); host.appendChild(list); }
        list.appendChild(el('li', '', bullet[1]));
      } else { list = null; pending.push(line); }
    });
    flush();
  }

  function renderBlock(block) {
    var box = el('section', 'site-block site-block-' + block.type);
    if (block.align === 'center') box.classList.add('centered');
    box.classList.add('block-width-'+(block.width||12));
    box.classList.add('block-variant-'+(block.variant||'plain'));
    var title = block.title || '';
    var text = block.text || '';
    if (block.type === 'download') {
      if (title) box.appendChild(el('h2', '', title));
      if (text) box.appendChild(el('p', '', text));
      var action = el('a', 'site-block-button', block.label || 'ZIP 다운로드');
      var repository = block.releaseRepo || 'P-JSL/P-JSL.github.io';
      var releaseBase = 'https://github.com/' + repository + '/releases/download/';
      if (block.source === 'folder') {
        action.href = '/downloads/' + encodeURIComponent(block.filename);
      } else if (block.releaseTag === 'latest') {
        // GitHub's release asset URL is stable across version changes if filenames are stable.
        action.href = 'https://github.com/' + repository + '/releases/latest/download/' + encodeURIComponent(block.filename);
      } else {
        action.href = releaseBase + encodeURIComponent(block.releaseTag) + '/' + encodeURIComponent(block.filename);
      }
      if (block.source === 'release') {
        action.rel = 'noopener noreferrer';
      }
      box.appendChild(action);return box;
    }
    if (block.type === 'downloads') {
      if (title) box.appendChild(el('h2', '', title));
      if (text) box.appendChild(el('p', '', text));
      var grid = el('div', 'site-card-grid');
      var extension = el('article', 'site-content-card');
      extension.appendChild(el('h3', '', 'Chrome Extension'));
      appendLink(extension, '/downloads/latest-extension.zip', '확장 프로그램 ZIP 다운로드', 'site-block-button');
      var desktop = el('article', 'site-content-card');
      desktop.appendChild(el('h3', '', 'Windows Desktop x64'));
      var desktopLink = el('a', 'site-block-button', 'Windows x64 ZIP 다운로드');
      desktopLink.href = 'https://github.com/P-JSL/P-JSL.github.io/releases/download/desktop_v1.18/my-video-app-desktop-windows-x64.zip';
      desktopLink.rel = 'noopener noreferrer';
      desktop.appendChild(desktopLink);
      if (!document.getElementById('inspector-fields')) {
        fetch('https://api.github.com/repos/P-JSL/P-JSL.github.io/releases?per_page=30')
          .then(function(r){if(!r.ok)throw Error('release lookup');return r.json();})
          .then(function(releases){
            for(var i=0;i<releases.length;i++){
              if(releases[i].draft||releases[i].prerelease)continue;
              var asset=(releases[i].assets||[]).find(function(a){return /desktop[-_ ]windows|windows[-_ ]x64/i.test(a.name)&&a.state==='uploaded';});
              if(asset&&asset.browser_download_url&&asset.browser_download_url.indexOf('https://github.com/P-JSL/P-JSL.github.io/releases/download/')===0){
                desktopLink.href=asset.browser_download_url;return;
              }
            }
          }).catch(function(){});
      }
      grid.appendChild(extension); grid.appendChild(desktop); box.appendChild(grid);
      return box;
    }
    if (block.type === 'divider') {
      box.appendChild(el('hr')); return box;
    }
    if (block.type === 'spacer') return box;
    if (block.type === 'image') {
      var img = el('img', 'site-content-image');
      img.loading = 'lazy'; img.decoding = 'async'; img.alt = block.alt || title || '페이지 이미지';
      img.referrerPolicy = 'no-referrer'; img.src = block.url;
      box.appendChild(img);
      if (block.caption) box.appendChild(el('p', 'image-caption', block.caption));
      return box;
    }
    if (block.type === 'cards') {
      if (title) box.appendChild(el('h2', '', title));
      var grid = el('div', 'site-card-grid');
      (block.items || []).forEach(function (item) {
        var card = el('article', 'site-content-card');
        card.appendChild(el('h3', '', item.title));
        card.appendChild(el('p', '', item.text));
        grid.appendChild(card);
      });
      box.appendChild(grid); return box;
    }
    if (block.type === 'list') {
      if (title) box.appendChild(el('h2', '', title));
      var ul = el('ul');
      (block.items || []).forEach(function (item) {
        var li = el('li');
        if (item.title) li.appendChild(el('strong', '', item.title + (item.text ? ' — ' : '')));
        if (item.text) li.appendChild(document.createTextNode(item.text));
        ul.appendChild(li);
      });
      box.appendChild(ul); return box;
    }
    if (block.type === 'heading') { box.appendChild(el('h2', '', title)); return box; }
    if (block.type === 'hero' || block.type === 'notice') {
      if (title) box.appendChild(el('h2', '', title));
      if (text) box.appendChild(el('p', '', text));
      return box;
    }
    if (block.type === 'button') {
      appendLink(box, block.url, block.label || '자세히 보기', 'site-block-button'); return box;
    }
    if (block.type === 'text') {
      if (title) box.appendChild(el('h2', '', title));
      renderContent(box, text);
    }
    return box;
  }

  function renderBlocks(host, blocks) {
    host.replaceChildren();
    host.classList.add('site-layout-grid');
    blocks.forEach(function (block) {
      if (validBlock(block)) host.appendChild(renderBlock(block));
    });
  }

  function renderPublicPage(pages) {
    var target = document.getElementById('managed-page');
    if (!target) return;
    var slug = new URLSearchParams(window.location.search).get('slug') || '';
    var page = pages.find(function (p) { return p.visible && p.slug === slug; });
    var title = document.getElementById('page-title');
    var summary = document.getElementById('page-summary');
    var body = document.getElementById('page-content');
    var link = document.getElementById('page-link');
    if (!page) {
      title.textContent = '페이지를 찾을 수 없습니다';
      summary.textContent = '삭제되었거나 공개되지 않은 메뉴입니다.';
      document.title = '페이지를 찾을 수 없습니다 | P-JSL';
      return;
    }
    title.textContent = page.title;
    summary.textContent = page.summary;
    document.title = page.title + ' | P-JSL';
    if (Array.isArray(page.blocks) && page.blocks.length) renderBlocks(body, page.blocks);
    else renderContent(body, page.content || '');
    if (link) {
      link.hidden = true;
      if (page.linkLabel && validLink(page.linkUrl)) {
        link.hidden = false; link.textContent = page.linkLabel; link.href = page.linkUrl;
        if (page.linkUrl.startsWith('https://')) {
          link.target = '_blank'; link.rel = 'noopener noreferrer';
        } else { link.removeAttribute('target'); link.removeAttribute('rel'); }
      }
    }
  }

  function loadPages() {
    return fetch(DATA_URL, {cache: 'no-store', credentials: 'omit'}).then(function (response) {
      if (!response.ok) throw new Error('메뉴 데이터를 불러올 수 없습니다.');
      return response.json();
    }).then(sanitizeRegistry);
  }

  function buildNav(nav, pages, currentSlug) {
    nav.replaceChildren();
    pages.forEach(function (page) {
      if (!page.visible) return;
      var a = el('a', '', page.title);
      a.href = '/pages/?slug=' + encodeURIComponent(page.slug);
      if (currentSlug === page.slug) a.setAttribute('aria-current', 'page');
      nav.appendChild(a);
    });
  }

  function applySiteTheme(theme) {
    if (!theme || typeof theme !== 'object') return;
    var hex=/^#[0-9a-fA-F]{6}$/;
    if (typeof theme.accent==='string' && hex.test(theme.accent)) document.documentElement.style.setProperty('--blue',theme.accent);
    if (typeof theme.secondary==='string' && hex.test(theme.secondary)) document.documentElement.style.setProperty('--mint',theme.secondary);
    if ([960,1080,1200,1360].includes(theme.maxWidth)) document.documentElement.style.setProperty('--site-max-width',theme.maxWidth+'px');
    if (['small','medium','large'].includes(theme.radius)) document.documentElement.dataset.radius=theme.radius;
  }

  function renderHome(home) {
    if (!validPage(home) || home.slug !== 'home') return;
    var host = document.getElementById('managed-home');
    if (!host) return;
    document.title = home.title + ' | P-JSL';
    var link = document.getElementById('home-menu-link');
    if (link) link.textContent = home.title;
    var heading = document.getElementById('managed-home-title');
    if (heading) heading.textContent = home.title;
    renderBlocks(host, home.blocks || []);
  }

  var nav = document.getElementById('custom-menu');
  var holder = document.getElementById('managed-page');
  if (nav || holder || document.getElementById('managed-home')) {
    fetch(DATA_URL, {cache:'no-store'}).then(function(response){if(!response.ok)throw Error('site data unavailable');return response.json();}).then(function(data){
      var pages=sanitizeRegistry(data);
      applySiteTheme(data.theme);
      if (data.home) renderHome(data.home);
      if (nav) buildNav(nav, pages,
        holder ? new URLSearchParams(window.location.search).get('slug') : null);
      if (holder) renderPublicPage(pages);
    }).catch(function () {
      if (holder) {
        document.getElementById('page-title').textContent = '메뉴 정보를 불러오지 못했습니다';
        document.getElementById('page-summary').textContent = '잠시 후 새로고침해 주세요.';
      }
    });
  }

  window.SitePages = {
    validLink: validLink,
    validPage: validPage,
    validBlock: validBlock,
    sanitizeRegistry: sanitizeRegistry,
    renderContent: renderContent,
    renderBlocks: renderBlocks,
    renderBlock: renderBlock
  };
}());
