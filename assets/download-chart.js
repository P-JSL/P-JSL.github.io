(function () {
  'use strict';
  var DATA_URL = '/assets/download-stats.json';
  var COLORS = ['#82c8ff', '#99e1be', '#f6c888', '#c5b2ff', '#ff9db2', '#8bdedc', '#d9e19a'];
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function element(tag, className, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function svgElement(tag, attributes, value) {
    var node = document.createElementNS(SVG_NS, tag);
    Object.keys(attributes || {}).forEach(function (name) {
      node.setAttribute(name, String(attributes[name]));
    });
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function count(value) { return Number(value).toLocaleString('ko-KR') + '회'; }
  function createButton(label, onClick) {
    var button = element('button', 'stats-tab', label);
    button.type = 'button';
    button.addEventListener('click', onClick);
    return button;
  }
  function validate(data) {
    if (!data || data.schema !== 1 || !Array.isArray(data.series) ||
        !Array.isArray(data.history) || typeof data.captured_at !== 'string') {
      throw new Error('통계 데이터 형식이 올바르지 않습니다.');
    }
    return data;
  }
  function samples(data, days) {
    if (days === 'all') return data.history.slice();
    return data.history.slice(-Number(days));
  }
  function valueAt(row, id) {
    var v = row && row.counts ? row.counts[id] : null;
    return Number.isInteger(v) && v >= 0 ? v : null;
  }
  function changes(rows, id, index) {
    if (index === 0) return null;
    var current = valueAt(rows[index], id), previous = valueAt(rows[index - 1], id);
    // A drop means a removed/replaced Release asset, not a negative download.
    return current !== null && previous !== null && current >= previous
      ? current - previous : null;
  }
  function detail(data, series, mode, range) {
    var all = samples(data, range);
    return all.map(function (row, i) {
      return {
        date: row.date,
        value: mode === 'daily' ? changes(data.history, series.id,
          data.history.indexOf(row)) : valueAt(row, series.id)
      };
    });
  }
  function showBars(host, series) {
    var list = element('div', 'stats-bars');
    var available = series.filter(function (s) { return Number.isInteger(s.total); });
    var max = Math.max(1, ...available.map(function (s) { return s.total; }));
    available.sort(function (a, b) { return b.total - a.total; });
    available.forEach(function (s, i) {
      var row = element('div', 'stats-bar-row');
      var heading = element('div', 'stats-bar-heading');
      heading.appendChild(element('span', '', s.label));
      heading.appendChild(element('strong', '', count(s.total)));
      var track = element('div', 'stats-bar-track');
      var fill = element('div', 'stats-bar-fill');
      fill.style.width = (100 * s.total / max).toFixed(2) + '%';
      fill.style.backgroundColor = COLORS[series.indexOf(s) % COLORS.length];
      fill.setAttribute('role', 'img');
      fill.setAttribute('aria-label', s.label + ': ' + count(s.total));
      track.appendChild(fill);row.appendChild(heading);row.appendChild(track);
      list.appendChild(row);
    });
    var missing = series.filter(function (s) { return !Number.isInteger(s.total); });
    missing.forEach(function (s) {
      var row = element('p', 'stats-untracked',
        s.label + ' — ' + (s.status === 'not_measured'
          ? 'GitHub Pages 직접 다운로드: 집계 불가'
          : s.status === 'unpublished' ? '공개 Release 자산 없음' : '통계 조회 불가'));
      list.appendChild(row);
    });
    if (!available.length) list.appendChild(element('p', 'stats-empty', '측정 가능한 Release 다운로드가 없습니다.'));
    host.appendChild(list);
  }
  function showLines(host, series, history, mode, days, chosen) {
    var rows = samples({history: history}, days);
    if (history.length < 2 || rows.length < 2) {
      host.appendChild(element('p', 'stats-empty',
        '추이 그래프는 날짜별 수집 기록이 두 번 이상 쌓인 후 표시됩니다. 현재는 첫 기준값만 수집된 상태입니다.'));
      return;
    }
    var selected = chosen === 'all' ? series.filter(function (s) { return Number.isInteger(s.total); })
      : series.filter(function (s) { return s.id === chosen && Number.isInteger(s.total); });
    if (!selected.length) {
      host.appendChild(element('p', 'stats-empty', '해당 항목은 다운로드 횟수를 집계할 수 없습니다.'));
      return;
    }
    var WIDTH = 860, HEIGHT = 310, LEFT = 57, RIGHT = 24, TOP = 24, BOTTOM = 48;
    var innerWidth = WIDTH - LEFT - RIGHT, innerHeight = HEIGHT - TOP - BOTTOM;
    var svg = svgElement('svg', {
      viewBox: '0 0 ' + WIDTH + ' ' + HEIGHT, role: 'img',
      'aria-label': 'GitHub Release 다운로드 ' +
        (mode === 'daily' ? '관측 기간별 증가량' : '누적 다운로드') + ' 추이',
      preserveAspectRatio: 'xMidYMid meet'
    });
    var ymax = 1;
    var lines = selected.map(function (s) {
      var points = rows.map(function (row) {
        var i = history.indexOf(row), value = mode === 'daily' ?
          changes(history, s.id, i) : valueAt(row, s.id);
        if (value !== null) ymax = Math.max(ymax, value);
        return {date: row.date, value: value};
      });
      return {series: s, points: points};
    });
    ymax = Math.ceil(ymax * 1.12);
    for (var g = 0; g <= 4; g++) {
      var y = TOP + (g / 4) * innerHeight;
      svg.appendChild(svgElement('line', {
        x1: LEFT, y1: y, x2: WIDTH - RIGHT, y2: y,
        stroke: '#486078', 'stroke-opacity': 0.45, 'stroke-width': 1
      }));
      svg.appendChild(svgElement('text', {
        x: LEFT - 10, y: y + 5, fill: '#b4c2d5', 'font-size': 12, 'text-anchor': 'end'
      }, (ymax * (4 - g) / 4).toFixed(0)));
    }
    var n = rows.length;
    var xPosition = function (i) { return LEFT + innerWidth * (n === 1 ? 0.5 : i / (n - 1)); };
    var yPosition = function (v) { return TOP + innerHeight * (1 - v / ymax); };
    var ticks = [0, Math.floor((n - 1) / 2), n - 1].filter(function (x, i, a) { return a.indexOf(x) === i; });
    ticks.forEach(function (i) {
      svg.appendChild(svgElement('text', {
        x: xPosition(i), y: HEIGHT - 19, fill: '#b4c2d5',
        'font-size': 12, 'text-anchor': i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'
      }, rows[i].date.slice(5)));
    });
    lines.forEach(function (item) {
      var color = COLORS[series.indexOf(item.series) % COLORS.length];
      var path = '', drawing = false;
      item.points.forEach(function (p, i) {
        if (p.value === null) { drawing = false; return; }
        path += (drawing ? 'L' : 'M') + xPosition(i).toFixed(2) + ',' + yPosition(p.value).toFixed(2);
        drawing = true;
      });
      if (path) svg.appendChild(svgElement('path', {
        d: path, fill: 'none', stroke: color, 'stroke-width': 2.6,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round'
      }));
      item.points.forEach(function (p, i) {
        if (p.value === null) return;
        var circle = svgElement('circle', {
          cx: xPosition(i), cy: yPosition(p.value), r: 4,
          fill: color, stroke: '#102035', 'stroke-width': 1.5,
          tabindex: 0, 'aria-label': item.series.label + ', ' + p.date + ', ' + count(p.value)
        });
        circle.appendChild(svgElement('title', {}, item.series.label + '\n' + p.date + ': ' + count(p.value)));
        svg.appendChild(circle);
      });
    });
    host.appendChild(svg);
    var legend = element('div', 'stats-legend');
    selected.forEach(function (s) {
      var item = element('span', 'stats-legend-item');
      var dot = element('i', 'stats-dot');
      dot.style.backgroundColor = COLORS[series.indexOf(s) % COLORS.length];
      item.appendChild(dot);item.appendChild(element('span', '', s.label));legend.appendChild(item);
    });
    host.appendChild(legend);
  }
  function mount(host) {
    if (!host || host.dataset.statsMounted === 'yes') return;
    host.dataset.statsMounted = 'yes';
    var loading = element('p', 'stats-loading', 'GitHub Release 다운로드 통계를 불러오는 중입니다.');
    host.appendChild(loading);
    fetch(DATA_URL, {cache:'no-store', credentials:'omit'}).then(function (response) {
      if (!response.ok) throw new Error('GitHub Pages 통계 파일을 읽지 못했습니다.');
      return response.json();
    }).then(validate).then(function (data) {
      host.replaceChildren();
      var series = data.series;
      var available = series.filter(function (x) { return Number.isInteger(x.total); });
      var total = available.reduce(function (sum, s) { return sum + s.total; }, 0);
      var top = element('div', 'stats-summary');
      [['GitHub Release 전체 누적', count(total)],
       ['집계 가능한 파일 유형', available.length + '개'],
       ['수집된 날짜', data.history.length + '일']].forEach(function (pair) {
        var box = element('div', 'stats-kpi');
        box.appendChild(element('span', '', pair[0]));box.appendChild(element('strong', '', pair[1]));
        top.appendChild(box);
      });
      host.appendChild(top);
      var toolbar = element('div', 'stats-toolbar');
      var modes = element('div', 'stats-modes');
      var range = element('select', 'stats-select'), selection = element('select', 'stats-select');
      [['all','전체 기록'],['7','최근 7회 수집'],['30','최근 30회 수집'],['90','최근 90회 수집']].forEach(function (x) {
        var option = element('option', '', x[1]);option.value = x[0];range.appendChild(option);
      });
      var allOption = element('option', '', '전체 항목');allOption.value = 'all';selection.appendChild(allOption);
      series.forEach(function (s) {
        var o = element('option', '', s.label);o.value = s.id;selection.appendChild(o);
      });
      var chosen = 'all', view = data.history.length > 1 ? 'cumulative' : 'bar';
      var plot = element('div', 'stats-plot');
      var entries = [
        {id:'bar',label:'누적 비교'},
        {id:'cumulative',label:'누적 추이'},
        {id:'daily',label:'수집 간 증가'}
      ];
      var buttons = [];
      function redraw() {
        buttons.forEach(function (button) {
          var active = button.dataset.mode === view;
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', String(active));
        });
        plot.replaceChildren();
        if (view === 'bar') showBars(plot, series);
        else showLines(plot, series, data.history, view, range.value, selection.value);
      }
      entries.forEach(function (item) {
        var button = createButton(item.label, function () {view=item.id;redraw();});
        button.dataset.mode=item.id;buttons.push(button);modes.appendChild(button);
      });
      toolbar.appendChild(modes);
      var filters = element('div', 'stats-filters');
      filters.appendChild(selection);filters.appendChild(range);
      toolbar.appendChild(filters);host.appendChild(toolbar);host.appendChild(plot);
      selection.addEventListener('change', redraw);
      range.addEventListener('change', redraw);
      redraw();
      var foot = element('div', 'stats-foot');
      var timestamp = new Date(data.captured_at);
      var stampText = Number.isNaN(timestamp.getTime()) ? data.captured_at :
        new Intl.DateTimeFormat('ko-KR', {
          timeZone:'Asia/Seoul', year:'numeric',month:'2-digit',day:'2-digit',
          hour:'2-digit',minute:'2-digit'
        }).format(timestamp);
      foot.appendChild(element('p', '', '마지막 수집: ' + stampText +
        ' (한국시간) · GitHub Release 파일별 download_count 집계'));
      foot.appendChild(element('p', '',
        '과거 일자별 실제 다운로드 기록은 제공되지 않습니다. 추이는 통계 수집을 시작한 시점부터 기록한 스냅샷 기준입니다.'));
      foot.appendChild(element('p', '',
        'GitHub Pages 내부 downloads/ ZIP은 통계 대상이 아니며, 제거·재게시된 Release 파일은 누적 수치가 달라질 수 있습니다.'));
      host.appendChild(foot);
    }).catch(function () {
      loading.textContent = '다운로드 통계를 불러오지 못했습니다. GitHub Pages 배포 상태를 확인해 주세요.';
    });
  }

  window.DownloadTrends = {mount: mount};
}());
