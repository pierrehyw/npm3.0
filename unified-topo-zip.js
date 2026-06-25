// unified-topo-demo.js — 业务请求路径拓扑（整合 eBPF L7 + SPAN L4）

var unifiedState = { mode: 'fusion', query: '', selectedNode: null, selectedEdge: null };
var unifiedDepState = { system: 'orders', view: 'health', layout: 'layered', query: '', showIdc: true };
var unifiedDepChart = null;
// 融合视图节点拖拽位置缓存：{ nodeId: { x, y } }，用于重渲染时恢复用户拖拽后的位置
var fusionNodePositions = {};

function setUnifiedMode(mode) {
  unifiedState.mode = mode;
  // 切换离开融合视图时清空位置缓存，下次进入融合视图还原默认布局
  if (mode !== 'fusion') {
    fusionNodePositions = {};
  }
  document.querySelectorAll('.unified-mode-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  updateCapabilityBadge();
  updateUnifiedToolbar();
  renderUnifiedGraph();
}

function updateUnifiedToolbar() {
  var badge = document.getElementById('unifiedCapabilityBadge');
  var searchWrap = document.getElementById('unifiedSearchWrap');
  var depToolbar = document.getElementById('unifiedDepToolbar');
  var chartEl = document.getElementById('unifiedChart');
  var depChartEl = document.getElementById('unifiedDepGraph');

  if (unifiedState.mode === 'dep') {
    if (badge) badge.style.display = 'none';
    if (searchWrap) searchWrap.style.display = 'none';
    if (depToolbar) depToolbar.style.display = 'flex';
    if (chartEl) chartEl.style.display = 'none';
    if (depChartEl) depChartEl.style.display = 'block';
  } else {
    if (badge) badge.style.display = 'flex';
    if (searchWrap) searchWrap.style.display = 'flex';
    if (depToolbar) depToolbar.style.display = 'none';
    if (chartEl) chartEl.style.display = 'block';
    if (depChartEl) depChartEl.style.display = 'none';
  }
}

function unifiedFilter(query) {
  if (unifiedState.mode === 'dep') {
    unifiedDepState.query = (query || '').trim().toLowerCase();
    unifiedDepRenderGraph();
  } else {
    unifiedState.query = (query || '').toLowerCase();
    renderUnifiedGraph();
  }
}

function updateCapabilityBadge() {
  var t = {
    fusion: '全栈融合视图 (L7 + L4)',
    span: '网络物理拓扑 (SPAN)',
    dep: '服务依赖拓扑 (APM)'
  };
  var el = document.getElementById('capabilityText');
  if (el) el.textContent = t[unifiedState.mode] || t.fusion;
}

function renderUnified(context) {
  closeUnifiedDetail();
  renderUnifiedGraph();
}

var unifiedChart = null;

var IconPaths = {
  client: 'path://M19,2h-14c-1.1,0-2,0.9-2,2v12c0,1.1,0.9,2,2,2h4v2h2v-2h2v2h2v-2h4c1.1,0,2-0.9,2-2v-12c0-1.1-0.9-2-2-2z m0,14h-14v-10h14v10z',
  net: 'path://M12,1l-9,4v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12v-6l-9-4z m0,10.99h7c-0.53,4.12-3.28,7.79-7,8.94v-8.94h-7v-5.6l7-3.11v8.71z',
  net_warn: 'path://M12,1l-9,4v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12v-6l-9-4z',
  os: 'path://M4,1h16c1.1,0,2,0.9,2,2v4c0,1.1-0.9,2-2,2h-16c-1.1,0-2-0.9-2-2v-4c0-1.1,0.9-2,2-2z m0,8h16c1.1,0,2,0.9,2,2v4c0,1.1-0.9,2-2,2h-16c-1.1,0-2-0.9-2-2v-4c0-1.1,0.9-2,2-2z m0,8h16c1.1,0,2,0.9,2,2v4c0,1.1-0.9,2-2,2h-16c-1.1,0-2-0.9-2-2v-4c0-1.1,0.9-2,2-2z',
  runtime: 'path://M12,2l-10,5l10,5l10-5l-10-5z m0,12l-10-5v6l10,5l10-5v-6l-10,5z',
  service: 'path://M9.4,16.6L4.8,12l4.6-4.6L8,6l-6,6l6,6L9.4,16.6z M14.6,16.6l4.6-4.6l-4.6-4.6L16,6l6,6l-6,6L14.6,16.6z',
  db: 'path://M12,3c-4.97,0-9,1.79-9,4s4.03,4,9,4s9-1.79,9-4s-4.03-4-9-4z m0,10c-4.97,0-9-1.79-9-4v3c0,2.21,4.03,4,9,4s9-1.79,9-4v-3c0,2.21-4.03,4-9,4z m0,6c-4.97,0-9-1.79-9-4v3c0,2.21,4.03,4,9,4s9-1.79,9-4v-3c0,2.21-4.03,4-9,4z'
};

function isNgpmDarkTheme() {
  return document && document.documentElement && document.documentElement.getAttribute('data-theme') === 'dark';
}

function hexToRgb(hex) {
  if(!hex) return '255,255,255';
  var c = hex.substring(1).split('');
  if(c.length == 3) { c= [c[0], c[0], c[1], c[1], c[2], c[2]]; }
  c = '0x' + c.join('');
  return [(c>>16)&255, (c>>8)&255, c&255].join(',');
}

function renderUnifiedGraph() {
  if (unifiedState.mode === 'dep') {
    unifiedDepInit();
    unifiedDepRenderGraph();
    return;
  }

  var el = document.getElementById('unifiedChart');
  if (!el || typeof echarts === 'undefined') return;
  if (!unifiedChart) unifiedChart = echarts.init(el, null, { renderer: 'svg' });

  var opt = null;
  if (unifiedState.mode === 'fusion') {
    opt = buildFusionOpt();
  } else if (unifiedState.mode === 'span') {
    opt = buildSpanOpt();
  } else {
    opt = buildEbpfOpt();
  }

  unifiedChart.clear();
  unifiedChart.setOption(opt, true);

  unifiedChart.off('click');
  unifiedChart.on('click', function(p) {
    if (p.dataType === 'node' && p.data._n && p.data._n.category !== 'label') {
      showTopoDetail(p.data._n);
    } else if (p.dataType === 'edge') {
      showTopoDetail(p.data._l, true);
    }
  });

  // 融合视图节点区域约束：上半部分应用层 (Y≤260)，下半部分网络层 (Y≥320)
  // 分区背景由 CSS overlay 实现，约束逻辑基于 ECharts 数据坐标系
  if (unifiedState.mode === 'fusion') {
    // 应用层节点（service/runtime）约束：数据 Y ∈ [60, 260]
    var LAYER_MIN_TOP = 60;
    var LAYER_MAX_TOP = 260;
    // 网络层节点（net/os/client）约束：数据 Y ∈ [320, 520]
    var LAYER_MIN_BOTTOM = 320;
    var LAYER_MAX_BOTTOM = 520;
    // DB 节点：数据 Y ∈ [230, 350]（跨层区域）
    var DB_MIN_Y = 230;
    var DB_MAX_Y = 350;

    unifiedChart.off('dragend');
    unifiedChart.on('dragend', function(params) {
      if (params.dataType !== 'node' || !params.data || !params.data._n) return;

      var n = params.data._n;
      var nodeId = params.data.id;

      // 节点类型判断
      var isAppNode = n.category === 'service' || n.category === 'runtime';
      var isNetNode = n.category === 'net' || n.category === 'net_warn' || n.category === 'os' || n.category === 'client';
      var isDbNode = n.category === 'db';

      // 从 ECharts 内部 layout 读取真实拖拽后坐标（getData().getItemLayout() 才是真实值）
      // params.data.x/y 返回的是 option 里的原始值，不反映拖拽后位置
      var currentX = n.x;
      var currentY = n.y;
      try {
        var _seriesData = unifiedChart.getModel().getSeries()[0].getData();
        for (var _di = 0; _di < _seriesData.count(); _di++) {
          if (_seriesData.getId(_di) === nodeId) {
            var _layout = _seriesData.getItemLayout(_di);
            if (_layout && typeof _layout[0] === 'number') currentX = _layout[0];
            if (_layout && typeof _layout[1] === 'number') currentY = _layout[1];
            break;
          }
        }
      } catch(e) {}
      var clampedY = currentY;
      var viewName = '';

      // 应用层节点：限制在上半部分
      if (isAppNode) {
        if (currentY < LAYER_MIN_TOP) clampedY = LAYER_MIN_TOP;
        if (currentY > LAYER_MAX_TOP) clampedY = LAYER_MAX_TOP;
        viewName = '应用逻辑视图 (上半区)';
      }
      // 网络层节点：限制在下半部分
      else if (isNetNode) {
        if (currentY < LAYER_MIN_BOTTOM) clampedY = LAYER_MIN_BOTTOM;
        if (currentY > LAYER_MAX_BOTTOM) clampedY = LAYER_MAX_BOTTOM;
        viewName = '物理拓扑视图 (下半区)';
      }
      // DB 节点：可以在中间区域活动
      else if (isDbNode) {
        if (currentY < DB_MIN_Y) clampedY = DB_MIN_Y;
        if (currentY > DB_MAX_Y) clampedY = DB_MAX_Y;
        viewName = '数据存储层 (中间区域)';
      }

      // 始终保存节点当前位置（含 X），供下次重渲染时恢复
      fusionNodePositions[nodeId] = { x: currentX, y: clampedY };

      // 如果需要矫正位置（差异超过 1px 才回弹）
      if (Math.abs(clampedY - currentY) > 1) {
        // 重建选项时 buildFusionOpt() 会读取已更新的 fusionNodePositions，
        // 因此所有节点（含之前拖拽过的）都会恢复到各自最后位置
        unifiedChart.setOption(buildFusionOpt(), true);

        console.log('⚠️ 节点 [' + n.name + '] 越界，已限制在 [' + viewName + '] 内');
        console.log('   原位置 Y=' + Math.round(currentY) + ' → 修正至 Y=' + Math.round(clampedY));
      } else {
        console.log('✅ 节点 [' + n.name + '] 在 [' + viewName + '] 区域内正常 (Y=' + Math.round(currentY) + ')');
      }
    });
  }

  unifiedChart.resize();

  // 融合视图：CSS 分区背景 overlay（始终与画布高度精准对齐 50/50，不受 ECharts 坐标系影响）
  var _chartEl = document.getElementById('unifiedChart');
  if (_chartEl) {
    var dark = isNgpmDarkTheme();
    _chartEl.style.position = 'relative';
    var _oldOverlay = _chartEl.querySelector('.fusion-zone-overlay');
    if (_oldOverlay) _oldOverlay.remove();
    if (unifiedState.mode === 'fusion') {
      _chartEl.style.background = dark
        ? 'linear-gradient(to bottom, rgba(44,102,176,0.32) 50%, rgba(126,88,210,0.32) 50%)'
        : 'linear-gradient(to bottom, rgba(9,105,218,0.04) 50%, rgba(110,64,201,0.04) 50%)';
      var _overlay = document.createElement('div');
      _overlay.className = 'fusion-zone-overlay';
      _overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;display:flex;flex-direction:column;';
      _overlay.innerHTML =
        '<div style="flex:1;display:flex;align-items:flex-start;padding:10px 16px 0;font-size:11px;font-weight:700;color:' + (dark ? 'rgba(163,203,255,0.95)' : 'rgba(5,80,174,0.55)') + ';letter-spacing:0.2px">L7 · 微服务与应用逻辑视图</div>' +
        '<div style="flex:1;display:flex;align-items:flex-start;padding:10px 16px 0;font-size:11px;font-weight:700;color:' + (dark ? 'rgba(201,176,255,0.95)' : 'rgba(110,64,201,0.55)') + ';letter-spacing:0.2px">L3/L4 · 基础设施与网络物理视图</div>';
      _chartEl.appendChild(_overlay);
    } else {
      _chartEl.style.background = dark ? 'rgba(20, 46, 74, 0.78)' : '';
    }
  }
}

function buildFusionOpt() {
  var dark = isNgpmDarkTheme();
  var textMain = dark ? '#E6F7FF' : '#1F2328';
  var textSubtle = dark ? '#A9C6E6' : '#8C959F';
  var nodeFill = dark ? 'rgba(10, 30, 52, 0.92)' : '#fff';

  // 上下 50% 布局：上半部分应用层 (Y=50~270)，下半部分网络层 (Y=310~530)
  // 中间分界线 Y=290（红色虚线）
  var Y_SVC = 130,   // service 节点（上半部分中间）
      Y_RT = 200,    // runtime 节点（上半部分偏下）
      Y_OS = 380,    // OS 节点（下半部分中间）
      Y_NET = 450;   // network 节点（下半部分偏下）

  var rawNodes = [
    { id: 'user', name: 'Browser/App\n(Client)', category: 'client', x: 50, y: Y_NET - 40, symbolSize: 50 },
    { id: 'fw_ext', name: '边界防火墙\n(SPAN)', category: 'net', x: 200, y: Y_NET, status: 'ok' },
    { id: 'lb_ext', name: '公网 LB\n(SPAN)', category: 'net', x: 330, y: Y_NET, status: 'ok' },
    { id: 'lbl_gw', name: 'API 网关节点', category: 'label', x: 470, y: Y_SVC - 60 },
    { id: 'gw_os', name: 'TCP/IP (OS)', category: 'os', x: 470, y: Y_OS },
    { id: 'gw_rt', name: 'Envoy', category: 'runtime', x: 470, y: Y_RT },
    { id: 'api_gw', name: 'api-gateway', category: 'service', x: 470, y: Y_SVC, status: 'warn', p99: 1250, rps: 3200 },
    { id: 'waf', name: '内网 WAF\n(SPAN)', category: 'net', x: 610, y: Y_NET, status: 'ok' },
    { id: 'sw_core', name: '核心交换\n(SPAN)', category: 'net', x: 740, y: Y_NET, status: 'ok' },
    { id: 'lbl_ord', name: '订单节点 (VM)', category: 'label', x: 880, y: Y_SVC - 60 },
    { id: 'ord_os', name: 'TCP/IP (OS)', category: 'os', x: 880, y: Y_OS },
    { id: 'ord_rt', name: 'JVM', category: 'runtime', x: 880, y: Y_RT },
    { id: 'ord_svc', name: 'order-service', category: 'service', x: 880, y: Y_SVC, status: 'error', p99: 1230, rps: 1284 },
    { id: 'idc_link', name: '跨机房专线\n(BJ→SH)\nRTT 210ms ⚠', category: 'net_warn', x: 1040, y: Y_NET, status: 'error' },
    { id: 'lbl_inv', name: '库存节点 (K8s)', category: 'label', x: 1200, y: Y_SVC - 60 },
    { id: 'inv_os', name: 'TCP/IP (OS)', category: 'os', x: 1200, y: Y_OS },
    { id: 'inv_rt', name: 'Node.js', category: 'runtime', x: 1200, y: Y_RT },
    { id: 'inv_svc', name: 'inventory-svc', category: 'service', x: 1200, y: Y_SVC, status: 'error', p99: 870, rps: 1180 },
    { id: 'mysql', name: 'Order DB\n(MySQL)', category: 'db', x: 1360, y: Y_RT, status: 'ok', p99: 45 },
    { id: 'redis', name: 'Cache\n(Redis)', category: 'db', x: 1360, y: Y_OS, status: 'ok', p99: 8 }
  ];

  var rawLinks = [
    { source: 'user', target: 'fw_ext', type: 'L4' },
    { source: 'fw_ext', target: 'lb_ext', type: 'L4' },
    { source: 'lb_ext', target: 'gw_os', type: 'L4' },
    { source: 'gw_os', target: 'waf', type: 'L4' },
    { source: 'waf', target: 'sw_core', type: 'L4' },
    { source: 'sw_core', target: 'ord_os', type: 'L4' },
    { source: 'ord_os', target: 'idc_link', type: 'L4_warn' },
    { source: 'idc_link', target: 'inv_os', type: 'L4_warn' },
    { source: 'ord_os', target: 'mysql', type: 'L4' },
    { source: 'ord_os', target: 'redis', type: 'L4' },
    { source: 'gw_os', target: 'gw_rt', type: 'stack' },
    { source: 'gw_rt', target: 'api_gw', type: 'stack' },
    { source: 'api_gw', target: 'gw_rt', type: 'stack', lineStyle: { type: 'dotted' } },
    { source: 'gw_rt', target: 'gw_os', type: 'stack', lineStyle: { type: 'dotted' } },
    { source: 'ord_os', target: 'ord_rt', type: 'stack' },
    { source: 'ord_rt', target: 'ord_svc', type: 'stack' },
    { source: 'ord_svc', target: 'ord_rt', type: 'stack', lineStyle: { type: 'dotted' } },
    { source: 'ord_rt', target: 'ord_os', type: 'stack', lineStyle: { type: 'dotted' } },
    { source: 'inv_os', target: 'inv_rt', type: 'stack' },
    { source: 'inv_rt', target: 'inv_svc', type: 'stack' },
    { source: 'inv_svc', target: 'inv_rt', type: 'stack', lineStyle: { type: 'dotted' } },
    { source: 'inv_rt', target: 'inv_os', type: 'stack', lineStyle: { type: 'dotted' } },
    { source: 'api_gw', target: 'ord_svc', type: 'L7_ok', label: '1250ms' },
    { source: 'ord_svc', target: 'inv_svc', type: 'L7_warn', label: '870ms (Timeout)' },
    { source: 'ord_svc', target: 'mysql', type: 'L7_db', label: '45ms' },
    { source: 'ord_svc', target: 'redis', type: 'L7_db', label: '8ms' }
  ];

  var filterQ = unifiedState.query;
  var Colors = {
    client: '#2DE6FF', net: '#66B9FF', net_warn: '#FF6B7A',
    os: '#7FA2C7', runtime: '#B78CFF', service: '#57D9FF',
    db: '#6AF4B4', label: 'transparent'
  };

  var nodes = rawNodes.map(function(n) {
    if (n.category === 'label') {
      return {
        id: n.id, name: n.name, x: n.x, y: n.y, symbolSize: 1, _n: n,
        draggable: false,
        itemStyle: { color: 'transparent' },
        label: { show: true, position: 'center', color: textSubtle, fontSize: 13, fontWeight: 700 }
      };
    }

    // 使用缓存的拖拽位置（若存在），否则使用默认位置
    var _pos = fusionNodePositions[n.id];
    var posX = _pos ? _pos.x : n.x;
    var posY = _pos ? _pos.y : n.y;

    var dimmed = filterQ && n.name.toLowerCase().indexOf(filterQ) < 0;
    var color = n.status === 'error' ? '#FF6B7A' : n.status === 'warn' ? '#FFB347' : Colors[n.category];

    if (n.category === 'service' || n.category === 'runtime') {
      var w = n.category === 'service' ? 140 : 100;
      return {
        id: n.id, name: n.name, x: posX, y: posY, symbol: 'roundRect',
        symbolSize: [w, 52], _n: n,
        itemStyle: {
          color: 'rgba(' + hexToRgb(color) + ', ' + (dark ? '0.15' : '0.08') + ')',
          borderColor: color,
          borderWidth: dark ? 2.2 : 1.5,
          borderType: 'dashed',
          shadowColor: color,
          shadowBlur: dimmed ? 0 : (dark ? 6 : 8),
          opacity: dimmed ? (dark ? 0.45 : 0.2) : 1
        },
        label: {
          show: true, position: 'inside',
          formatter: '{badge|L7}\n{icon|☁}\n{name|' + n.name + '}',
          rich: {
            badge: { color: '#EAF9FF', backgroundColor: dark ? '#0B3150' : '#0550AE', fontSize: 9, fontWeight: 800, align: 'center', padding: [1, 6, 1, 6], borderRadius: 4 },
            icon: { color: color, fontSize: 14, align: 'center', padding: [2, 0, 1, 0] },
            name: { color: dimmed ? textSubtle : textMain, fontSize: dark ? 12 : 11, fontWeight: 700, align: 'center', width: w }
          }
        }
      };
    } else {
      var sym = IconPaths[n.category] || 'path://M12,2...';
      if (n.category === 'net_warn') sym = IconPaths.net_warn;
      if (n.category === 'client') sym = IconPaths.client;
      if (n.category === 'db') sym = IconPaths.db;
      var sz = n.category === 'db' ? 44 : 40;
      // 为网络/基础设施节点添加 L4 徽章
      var isL4Node = n.category === 'net' || n.category === 'net_warn' || n.category === 'os' || n.category === 'client';
      var isDbNode = n.category === 'db';
      var badgeText = isL4Node ? '{badge|L4}\n' : (isDbNode ? '{badge|DB}\n' : '');
      var labelFormatter = badgeText + n.name;
      var labelRich = {
        badge: { color: '#fff', backgroundColor: isL4Node ? '#6E40C9' : '#1A7F37', fontSize: 8, fontWeight: 800, align: 'center', padding: [1, 5, 1, 5], borderRadius: 3 },
        name: { color: dimmed ? textSubtle : textMain, fontSize: dark ? 11 : 10, fontWeight: 700, align: 'center', padding: [2, 0, 0, 0] }
      };
      return {
        id: n.id, name: n.name, x: posX, y: posY, symbol: sym,
        symbolSize: sz, _n: n,
        itemStyle: { color: dark ? 'rgba(' + hexToRgb(color) + ', 0.34)' : nodeFill, borderColor: color, borderWidth: dark ? 2.8 : 2, shadowColor: color, shadowBlur: dimmed ? 0 : (dark ? 10 : 6), opacity: dimmed ? (dark ? 0.45 : 0.2) : 1 },
        label: {
          show: true, position: 'bottom',
          formatter: isL4Node || isDbNode ? labelFormatter : n.name,
          rich: (isL4Node || isDbNode) ? labelRich : undefined,
          color: dimmed ? textSubtle : textMain,
          fontSize: dark ? 11 : 10,
          fontWeight: 700,
          align: 'center',
          textBorderColor: dark ? '#071427' : 'transparent',
          textBorderWidth: dark ? 2 : 0
        }
      };
    }
  });

  var links = rawLinks.map(function(l) {
    var isL7 = l.type.indexOf('L7') >= 0;
    var isWarn = l.type.indexOf('warn') >= 0;
    var isStack = l.type === 'stack';
    var isL4 = l.type.indexOf('L4') >= 0;
    var color = isWarn ? '#FF7886' : isL7 ? (dark ? '#53D1FF' : '#0969DA') : (isStack ? (dark ? 'rgba(179,138,255,0.86)' : 'rgba(110,64,201,0.35)') : (dark ? '#8BAFFF' : (isL4 ? '#4B2DBA' : '#6E40C9')));
    var width = isL7 ? (isWarn ? (dark ? 4.2 : 3.5) : (dark ? 3.2 : 2.5)) : (dark ? 2.1 : (isL4 ? 1.9 : 1.5));
    var opacity = isL7 ? (dark ? 1 : 0.82) : (dark ? 0.96 : (isL4 ? 0.84 : 0.6));
    var type = (l.lineStyle && l.lineStyle.type) ? l.lineStyle.type : (isWarn ? 'dashed' : 'solid');
    var curveness = 0;
    if (isL7) { curveness = -0.25; }
    else if (l.type.indexOf('L4') >= 0) { curveness = 0.12; }
    return {
      source: l.source, target: l.target, _l: l,
      lineStyle: { color: color, shadowColor: color, shadowBlur: dark ? 4.2 : (isWarn ? 6 : 3), width: dark ? (width + 0.2) : width, type: type, curveness: curveness, opacity: Math.max(opacity, 0.4) },
      label: {
        show: !!l.label,
        formatter: l.label,
        color: textMain,
        backgroundColor: dark ? 'rgba(9,28,48,0.9)' : 'rgba(255,255,255,0.95)',
        borderColor: dark ? 'rgba(110, 201, 255, 0.38)' : '#D0D7DE',
        borderWidth: 1,
        padding: [3, 7],
        borderRadius: 4,
        fontSize: dark ? 11 : 10,
        fontWeight: 800
      }
    };
  });

  return {
    backgroundColor: 'transparent',
    title: [
      { text: '全栈融合视图 (Request Lifecycle)', right: 20, top: 16, textStyle: { color: textMain, fontSize: 16, fontWeight: 700 } }
    ],
    graphic: [],
    // 分区背景通过 HTML CSS overlay 实现（见 renderUnifiedGraph），避免 ECharts 坐标系与 graphic 像素坐标不对齐的问题
    tooltip: {
      trigger: 'item', confine: true,
      backgroundColor: dark ? 'rgba(8,19,33,0.96)' : 'rgba(255,255,255,0.98)',
      borderColor: dark ? 'rgba(128,169,211,0.34)' : '#D0D7DE',
      borderWidth: 1,
      textStyle: { color: textMain, fontSize: 12 },
      formatter: function(p) {
        if (p.dataType === 'node') {
          var n = p.data._n;
          if (n.category === 'label') return '';
          // 视图分类判断
          var isL7Node = n.category === 'service' || n.category === 'runtime';
          var isL4Node = n.category === 'net' || n.category === 'net_warn' || n.category === 'os' || n.category === 'client';
          var viewLabel = '';
          var viewColor = '';
          if (isL7Node) {
            viewLabel = '微服务与应用逻辑视图 (L7)';
            viewColor = '#0550AE';
          } else if (isL4Node) {
            viewLabel = '基础设施与网络物理视图 (L3/L4)';
            viewColor = '#6E40C9';
          } else if (n.category === 'db') {
            viewLabel = '数据存储层 (跨视图)';
            viewColor = '#1A7F37';
          }
          return '<b>' + n.name + '</b><hr style="border:0;border-top:1px solid #E1E4E8;margin:6px 0">' + '所属视图: <b style="color:' + viewColor + '">' + viewLabel + '</b><br>' + '节点类型: <b style="color:#0969DA">' + n.category.toUpperCase() + '</b><br>' + '健康状态: <b style="color:' + (n.status==='error'?'#CF222E':n.status==='warn'?'#9A6700':'#1A7F37') + '">' + (n.status ? n.status.toUpperCase() : 'OK') + '</b><br>' + (n.p99 ? 'P99 延迟: ' + n.p99 + ' ms<br>' : '') + (n.rps ? '并发频次: ' + n.rps + ' req/s<br>' : '');
        }
        if (p.dataType === 'edge') {
          var l = p.data._l;
          return '<b>' + l.source + ' → ' + l.target + '</b><br>通信层级: <b style="color:#0969DA">' + l.type + '</b><br>' + (l.label ? '核心指标: ' + l.label : '');
        }
      }
    },
    series: [{ type: 'graph', layout: 'none', roam: true, draggable: true, edgeSymbol: ['none', 'arrow'], edgeSymbolSize: [0, 9], data: nodes, links: links, emphasis: { focus: 'adjacency', scale: true } }]
  };
}

function buildSpanOpt() {
  var nodes = [
    {id:'user', name:'公网客户端', x:100, y:200, category:'client'},
    {id:'ext_fw', name:'边界防火墙', x:300, y:200, category:'net'},
    {id:'lb', name:'公网 LB', x:500,y:200, category:'net'},
    {id:'sw', name:'核心交换', x:700, y:200, category:'net'},
    {id:'app_host', name:'应用宿主机\nBJ-App-01', x:900, y:200, category:'os'},
    {id:'db_host', name:'数据库宿主\nSH-DB-02', x:1100,y:200, category:'os'}
  ];
  var links = [
    {source:'user',target:'ext_fw'},{source:'ext_fw',target:'lb'},{source:'lb',target:'sw'},{source:'sw',target:'app_host'},{source:'app_host',target:'db_host'}
  ];
  return {
    backgroundColor: 'transparent',
    title: { text: '网络物理拓扑 (SPAN 流量映射)', left: 20, top: 20, textStyle: { color: '#1F2328', fontSize: 16, fontWeight: 700 } },
    graphic: [
      { type: 'rect', z: -10, shape: { x: 50, y: 100, width: 1150, height: 200 }, style: { fill: 'rgba(9, 105, 218, 0.03)', stroke: 'rgba(9, 105, 218, 0.2)', lineWidth: 1, lineDash: [5, 5], radius: [8] } },
      { type: 'text', z: -9, style: { text: '物理设备及 OS 通信矩阵', x: 60, y: 110, fill: '#0550AE', font: 'bold 12px sans-serif' } }
    ],
    series: [{
      type: 'graph', layout: 'none', roam: true, edgeSymbol: ['none','arrow'], edgeSymbolSize: 10,
      data: nodes.map(function(n){
        return { id:n.id, name:n.name, x:n.x, y:n.y, symbol: IconPaths[n.category] || IconPaths.net, itemStyle:{color:'#fff', borderColor:'#0969DA', borderWidth:2, shadowColor:'rgba(9,105,218,0.3)', shadowBlur:10}, symbolSize:42, label:{show:true,position:'bottom',color:'#1F2328',fontWeight:700} };
      }),
      links: links.map(function(l){ return { source:l.source, target:l.target, lineStyle:{color:'#0969DA',width:2,shadowColor:'rgba(9,105,218,0.3)',shadowBlur:6} }; })
    }]
  };
}

function buildEbpfOpt() {
  var nodes = [
    {id:'gw', name:'api-gateway', x:200, y:250},
    {id:'ord', name:'order-svc', x:500, y:250},
    {id:'inv', name:'inv-svc', x:800, y:150},
    {id:'pay', name:'pay-svc', x:800, y:350},
    {id:'redis', name:'redis-cache', x:1100, y:250},
    {id:'db', name:'mysql-db', x:1100, y:150}
  ];
  var links = [
    {source:'gw',target:'ord'},{source:'ord',target:'inv'},{source:'ord',target:'pay'},{source:'ord',target:'redis'},{source:'inv',target:'db'}
  ];
  return {
    backgroundColor: 'transparent',
    title: { text: '微服务依赖拓扑 (eBPF L7 解析)', left: 20, top: 20, textStyle: { color: '#1F2328', fontSize: 16, fontWeight: 700 } },
    graphic: [
      { type: 'rect', z: -10, shape: { x: 50, y: 70, width: 1200, height: 360 }, style: { fill: 'rgba(110, 64, 201, 0.03)', stroke: 'rgba(110, 64, 201, 0.2)', lineWidth: 1, lineDash: [5, 5], radius: [8] } },
      { type: 'text', z: -9, style: { text: '应用逻辑集群边界 (App Containerized Envelope)', x: 60, y: 85, fill: '#6E40C9', font: 'bold 12px sans-serif' } }
    ],
    series: [{
      type: 'graph', layout: 'none', roam: true, edgeSymbol: ['none','arrow'], edgeSymbolSize: 12,
      data: nodes.map(function(n){
        return { id:n.id, name:n.name, x:n.x, y:n.y, symbol: 'roundRect', itemStyle: { color: '#F5F0FF', borderColor: '#6E40C9', borderWidth: 1.5, shadowColor: 'rgba(110,64,201,0.2)', shadowBlur: 10 }, symbolSize: [140, 60], label: { show: true, position: 'inside', formatter: '{top|📦 逻辑容器节点}\n{name|' + n.name + '}', rich: { top: { color: '#6E40C9', fontSize: 10, align: 'left', width: 120, padding: [0, 0, 8, 0] }, name: { color: '#1F2328', fontSize: 14, fontWeight: 'bold', align: 'center', width: 120 } } } };
      }),
      links: links.map(function(l){ return { source:l.source, target:l.target, lineStyle:{color:'#0969DA',width:2.5,curveness:0.1,shadowColor:'rgba(9,105,218,0.2)',shadowBlur:6} }; })
    }]
  };
}

function showTopoDetail(data, isEdge) {
  var panel = document.getElementById('unifiedDetailPanel');
  var content = document.getElementById('unifiedDetailContent');
  if (!panel || !content) return;

  var html = '';

  if (!isEdge) {
    var n = data;
    if (n.category === 'label') return;

    var statusLabels = { 'ok': '健康 (Healthy)', 'warn': '告警 (Warning)', 'error': '故障点 (Critical)' };
    var statusColors = { 'ok': 'ok', 'warn': 'warn', 'error': 'error' };
    var st = n.status || 'ok';

    // 视图分类判断
    var isL7Node = n.category === 'service' || n.category === 'runtime';
    var isL4Node = n.category === 'net' || n.category === 'net_warn' || n.category === 'os' || n.category === 'client';
    var viewLabel = '';
    var viewBadgeClass = '';
    if (isL7Node) {
      viewLabel = '微服务与应用逻辑视图 (L7)';
      viewBadgeClass = 'l7-view';
    } else if (isL4Node) {
      viewLabel = '基础设施与网络物理视图 (L3/L4)';
      viewBadgeClass = 'l4-view';
    } else if (n.category === 'db') {
      viewLabel = '数据存储层 (跨视图)';
      viewBadgeClass = 'db-view';
    }

    html += '<div class="unified-dt-name">' + n.name + '</div>';
    html += '<div class="unified-dt-row"><div class="unified-dt-label">所属视图画布</div><div class="unified-dt-badge ' + viewBadgeClass + '">' + viewLabel + '</div></div>';
    html += '<div class="unified-dt-row"><div class="unified-dt-label">分层节点角色 (OSI)</div><div class="unified-dt-value" style="color:#0969DA;font-weight:700">' + n.category.toUpperCase() + '</div></div>';
    html += '<div class="unified-dt-row"><div class="unified-dt-label">运行健康度</div><div class="unified-dt-badge ' + statusColors[st] + '">' + (statusLabels[st] || '正常') + '</div></div>';

    if (n.p99) {
      html += '<div class="unified-dt-row"><div class="unified-dt-label">P99 延迟情况</div><div class="unified-dt-value">' + n.p99 + ' ms</div></div>';
    }
    if (n.rps) {
      html += '<div class="unified-dt-row"><div class="unified-dt-label">实时吞吐 (RPS)</div><div class="unified-dt-value">' + n.rps + ' req/s</div></div>';
    }
  } else {
    var l = data;
    html += '<div class="unified-dt-name">' + l.source + ' → ' + l.target + '</div>';
    html += '<div class="unified-dt-row"><div class="unified-dt-label">流量通信层级</div><div class="unified-dt-value" style="color:#0969DA;font-weight:700">' + l.type + '</div></div>';
    if (l.label) {
      html += '<div class="unified-dt-row"><div class="unified-dt-label">核心时延指标</div><div class="unified-dt-value" style="color:' + (l.type.indexOf('warn') >= 0 ? '#CF222E' : '#1F2328') + ';font-weight:700">' + l.label + '</div></div>';
    }
    if (l.type.indexOf('L7') >= 0) {
      html += '<div class="unified-dt-row"><div class="unified-dt-label">探针数据来源</div><div class="unified-dt-value">eBPF Uprobe (应用协议层)</div></div>';
    } else if (l.type.indexOf('L4') >= 0) {
      html += '<div class="unified-dt-row"><div class="unified-dt-label">探针数据来源</div><div class="unified-dt-value">SPAN / eBPF Kprobe<br>(网络协议层 TCP/IP)</div></div>';
    } else if (l.type === 'stack') {
      html += '<div class="unified-dt-row"><div class="unified-dt-label">生命周期途径</div><div class="unified-dt-value">进程内部宿主机调用栈</div></div>';
    }
  }

  content.innerHTML = html;
  panel.classList.remove('unified-detail-hidden');
  panel.classList.add('unified-detail-visible');
}

function closeUnifiedDetail() {
  var panel = document.getElementById('unifiedDetailPanel');
  if (!panel) return;
  panel.classList.add('unified-detail-hidden');
  panel.classList.remove('unified-detail-visible');
}

// ===== 依赖视图功能 =====

function unifiedDepInit() {
  var sysEl = document.getElementById('unifiedDepSysSelect');
  if (sysEl) {
    sysEl.innerHTML = '<option value="orders">订单系统</option><option value="inventory">库存系统</option><option value="payment">支付系统</option>';
  }
}

function unifiedDepSetSystem(id) {
  unifiedDepState.system = id;
  unifiedDepRenderGraph();
}

function unifiedDepSetView(v) {
  unifiedDepState.view = v;
  document.querySelectorAll('#unifiedDepViewSeg .dep-seg-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.view === v);
  });
  unifiedDepRenderGraph();
}

function unifiedDepSetLayout(l) {
  unifiedDepState.layout = l;
  document.querySelectorAll('#unifiedDepLayoutSeg .dep-seg-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.layout === l);
  });
  unifiedDepRenderGraph();
}

function unifiedDepRenderGraph() {
  var dark = isNgpmDarkTheme();
  var textMain = dark ? '#E6F7FF' : '#1F2328';
  var textSubtle = dark ? '#A9C6E6' : '#C0C0C0';

  var el = document.getElementById('unifiedDepGraph');
  if (!el || typeof echarts === 'undefined') return;
  if (!unifiedDepChart) unifiedDepChart = echarts.init(el, null, { renderer: 'svg' });

  var idcOn = (document.getElementById('unifiedDepIdcChk') || {}).checked;
  var view = unifiedDepState.view;
  var layered = unifiedDepState.layout === 'layered';
  var q = unifiedDepState.query;

  // 使用统一拓扑的节点数据
  var rawNodes = [
    { id: 'api-gw', name: 'api-gateway', role: '入口网关', idc: 'BJ', status: 'ok', rps: 2840, errRate: 0.2, p99: 156, sat: 45, x: 150, y: 250 },
    { id: 'order-svc', name: 'order-service', role: '订单服务', idc: 'BJ', status: 'slow', rps: 1860, errRate: 0.8, p99: 520, sat: 78, x: 400, y: 250 },
    { id: 'inv-svc', name: 'inventory-service', role: '库存服务', idc: 'SH', status: 'error', rps: 920, errRate: 2.1, p99: 680, sat: 92, x: 650, y: 150 },
    { id: 'pay-svc', name: 'payment-service', role: '支付服务', idc: 'BJ', status: 'ok', rps: 650, errRate: 0.1, p99: 85, sat: 35, x: 650, y: 350 },
    { id: 'db-order', name: 'order-db', role: '订单库', idc: 'BJ', status: 'ok', rps: 420, errRate: 0, p99: 12, sat: 25, x: 900, y: 180 },
    { id: 'db-inv', name: 'inventory-db', role: '库存库', idc: 'SH', status: 'slow', rps: 380, errRate: 0.5, p99: 180, sat: 65, x: 900, y: 320 },
    { id: 'cache', name: 'redis-cluster', role: '缓存集群', idc: 'BJ', status: 'ok', rps: 5600, errRate: 0, p99: 2, sat: 18, x: 400, y: 450 }
  ];

  var rawEdges = [
    { source: 'api-gw', target: 'order-svc', qps: 1284, errRate: 0.3, p99: 145, status: 'slow', crossIdc: false, note: '网关到订单服务网络延迟正常，瓶颈在订单服务内部处理' },
    { source: 'order-svc', target: 'inv-svc', qps: 890, errRate: 2.1, p99: 620, status: 'error', crossIdc: true, note: '⚠ 跨 IDC 调用导致延迟高，建议启用熔断降级' },
    { source: 'order-svc', target: 'pay-svc', qps: 420, errRate: 0.1, p99: 68, status: 'ok', crossIdc: false, note: '调用正常，无性能问题' },
    { source: 'order-svc', target: 'db-order', qps: 680, errRate: 0, p99: 8, status: 'ok', crossIdc: false, note: '数据库查询优化良好' },
    { source: 'inv-svc', target: 'db-inv', qps: 520, errRate: 0.8, p99: 165, status: 'slow', crossIdc: false, note: '库存查询存在慢 SQL，建议添加索引' },
    { source: 'order-svc', target: 'cache', qps: 2100, errRate: 0, p99: 1.5, status: 'ok', crossIdc: false, note: '缓存命中率 98%' }
  ];

  var DEP_STATUS_COLOR = { ok: '#1A7F37', slow: '#9A6700', error: '#CF222E' };

  var nodes = rawNodes.map(function(n) {
    var dim = q && n.name.toLowerCase().indexOf(q) < 0;
    var color = DEP_STATUS_COLOR[n.status];
    var size = Math.min(54, Math.max(26, 22 + n.rps / 120));
    var borderColor = idcOn ? (n.idc === 'SH' ? '#BC4C00' : '#0969DA') : '#fff';
    return {
      id: n.id, name: n.name, x: n.x, y: n.y, symbolSize: size,
      itemStyle: {
        color: color, borderColor: borderColor, borderWidth: idcOn ? 2.5 : 2, opacity: dim ? (dark ? 0.45 : 0.22) : 1,
        shadowBlur: dark ? 0 : 0
      },
      label: {
        show: true, position: 'bottom', distance: 6, fontSize: 11, fontWeight: n.status === 'ok' ? 500 : 700,
        color: dim ? textSubtle : textMain,
        formatter: n.name,
        textBorderColor: dark ? '#071427' : 'transparent',
        textBorderWidth: dark ? 2 : 0
      },
      _node: n
    };
  });

  var maxQps = 1284;
  var links = rawEdges.map(function(e) {
    var ecolor = view === 'latency' ? (e.p99 >= 500 ? '#FF6B7A' : e.p99 >= 150 ? '#FFB347' : '#6AF4B4')
           : view === 'traffic' ? (dark ? '#A78BFA' : '#6E40C9')
               : DEP_STATUS_COLOR[e.status];
    var w = view === 'traffic' ? (1.5 + e.qps / maxQps * 8) : (1.2 + e.qps / maxQps * 5);
    var lbl = view === 'latency' ? e.p99 + 'ms' : view === 'traffic' ? (e.qps >= 1000 ? (e.qps / 1000).toFixed(1) + 'k' : e.qps) : (e.errRate > 0 ? e.errRate + '%' : '');
    return {
      source: e.source, target: e.target,
      lineStyle: { color: ecolor, width: dark ? (w + 0.9) : w, opacity: e.status === 'ok' ? (dark ? 0.9 : 0.55) : 0.95, type: e.crossIdc ? 'dashed' : 'solid', curveness: 0.08 },
      label: { show: !!lbl, formatter: lbl, fontSize: 9, color: ecolor, fontWeight: 700,
        backgroundColor: dark ? 'rgba(10,22,38,0.9)' : 'rgba(255,255,255,0.85)', padding: [1, 3], borderRadius: 3 },
      emphasis: { lineStyle: { width: w + 1.5 } },
      _edge: e
    };
  });

  var graphic = [];
  if (idcOn) {
    graphic = [
      { type: 'text', right: 16, top: 10, style: { text: '● BJ 机房', fill: dark ? '#7EC8FF' : '#0969DA', font: '700 11px Inter' } },
      { type: 'text', right: 16, top: 28, style: { text: '● SH 机房', fill: dark ? '#FFC890' : '#BC4C00', font: '700 11px Inter' } }
    ];
  }

  unifiedDepChart.setOption({
    animationDuration: 400,
    graphic: graphic,
    tooltip: {
      trigger: 'item', confine: true,
      backgroundColor: dark ? 'rgba(8,19,33,0.96)' : 'rgba(255,255,255,0.98)',
      borderColor: dark ? 'rgba(128,169,211,0.34)' : '#D0D7DE',
      borderWidth: 1,
      textStyle: { color: textMain, fontSize: 12 },
      extraCssText: 'box-shadow:0 4px 16px rgba(31,35,40,0.14);border-radius:8px;',
      formatter: function(p) {
        if (p.dataType === 'node') {
          var n = p.data._node;
          return '<b>' + n.name + '</b><br>' + n.role + ' · ' + n.idc + ' 机房<br>RPS ' + n.rps + ' · 错误率 <b style="color:' + (n.errRate > 1 ? '#CF222E' : '#1A7F37') + '">' + n.errRate + '%</b> · P99 ' + n.p99 + 'ms';
        }
        if (p.dataType === 'edge') {
          var e = p.data._edge;
          return '<b>' + e.source + ' → ' + e.target + '</b><br>QPS ' + e.qps + ' · 错误率 <b style="color:' + (e.errRate > 1 ? '#CF222E' : '#1A7F37') + '">' + e.errRate + '%</b> · P99 ' + e.p99 + 'ms' + (e.crossIdc ? '<br><span style="color:#BC4C00">⚠ 跨 IDC 调用</span>' : '');
        }
        return '';
      }
    },
    series: [{
      type: 'graph', layout: layered ? 'none' : 'force',
      roam: true, draggable: true,
      zoom: layered ? 0.76 : 1, center: layered ? [510, 250] : undefined,
      force: { repulsion: 420, edgeLength: 130, gravity: 0.08 },
      edgeSymbol: ['none', 'arrow'], edgeSymbolSize: 8,
      data: nodes, links: links,
      lineStyle: { curveness: 0.08 },
      emphasis: { focus: 'adjacency', scale: false }
    }]
  }, true);

  unifiedDepChart.off('click');
  unifiedDepChart.on('click', function(p) {
    if (p.dataType === 'node') {
      showUnifiedDepDetail(p.data._node);
    } else if (p.dataType === 'edge') {
      showUnifiedDepEdgeDetail(p.data._edge);
    }
  });

  unifiedDepChart.resize();
}

function showUnifiedDepDetail(n) {
  var DEP_STATUS_LABEL = { ok: '正常', slow: '性能退化', error: '异常' };
  var DEP_STATUS_COLOR = { ok: '#1A7F37', slow: '#9A6700', error: '#CF222E' };

  var col = DEP_STATUS_COLOR[n.status];
  var detailHtml =
    '<div class="unified-dt-name">' + n.name + '</div>' +
    '<div class="unified-dt-row"><div class="unified-dt-label">服务角色</div><div class="unified-dt-value">' + n.role + '</div></div>' +
    '<div class="unified-dt-row"><div class="unified-dt-label">运行状态</div><div class="unified-dt-badge ' + n.status + '">' + DEP_STATUS_LABEL[n.status] + '</div></div>' +
    '<div class="unified-dt-row"><div class="unified-dt-label">机房</div><div class="unified-dt-value">' + n.idc + ' 机房</div></div>' +
    '<div class="unified-dt-row"><div class="unified-dt-label">RPS</div><div class="unified-dt-value">' + n.rps + '</div></div>' +
    '<div class="unified-dt-row"><div class="unified-dt-label">错误率</div><div class="unified-dt-value" style="color:' + (n.errRate > 1 ? '#CF222E' : '#1A7F37') + ';font-weight:700">' + n.errRate + '%</div></div>' +
    '<div class="unified-dt-row"><div class="unified-dt-label">P99 延迟</div><div class="unified-dt-value" style="color:' + (n.p99 >= 500 ? '#CF222E' : n.p99 >= 150 ? '#9A6700' : '#1A7F37') + ';font-weight:700">' + n.p99 + ' ms</div></div>' +
    '<div class="unified-dt-row"><div class="unified-dt-label">饱和度</div><div class="unified-dt-value">' + n.sat + '%</div></div>';

  var panel = document.getElementById('unifiedDetailPanel');
  var content = document.getElementById('unifiedDetailContent');
  if (panel && content) {
    content.innerHTML = detailHtml;
    panel.classList.remove('unified-detail-hidden');
    panel.classList.add('unified-detail-visible');
  }
}

function showUnifiedDepEdgeDetail(e) {
  var DEP_STATUS_LABEL = { ok: '正常', slow: '性能退化', error: '异常' };

  var detailHtml =
    '<div class="unified-dt-name">' + e.source + ' → ' + e.target + '</div>' +
    '<div class="unified-dt-row"><div class="unified-dt-label">调用状态</div><div class="unified-dt-badge ' + e.status + '">' + DEP_STATUS_LABEL[e.status] + '</div></div>' +
    '<div class="unified-dt-row"><div class="unified-dt-label">跨机房</div><div class="unified-dt-value">' + (e.crossIdc ? '是 (BJ↔SH)' : '否') + '</div></div>' +
    '<div class="unified-dt-row"><div class="unified-dt-label">QPS</div><div class="unified-dt-value">' + e.qps + '</div></div>' +
    '<div class="unified-dt-row"><div class="unified-dt-label">错误率</div><div class="unified-dt-value" style="color:' + (e.errRate > 1 ? '#CF222E' : '#1A7F37') + ';font-weight:700">' + e.errRate + '%</div></div>' +
    '<div class="unified-dt-row"><div class="unified-dt-label">P99 延迟</div><div class="unified-dt-value" style="color:' + (e.p99 >= 500 ? '#CF222E' : e.p99 >= 150 ? '#9A6700' : '#1A7F37') + ';font-weight:700">' + e.p99 + ' ms</div></div>' +
    '<div class="unified-dt-row" style="margin-top:12px"><div class="unified-dt-label">分析</div><div class="unified-dt-value" style="font-size:11px;line-height:1.6">' + e.note + '</div></div>';

  var panel = document.getElementById('unifiedDetailPanel');
  var content = document.getElementById('unifiedDetailContent');
  if (panel && content) {
    content.innerHTML = detailHtml;
    panel.classList.remove('unified-detail-hidden');
    panel.classList.add('unified-detail-visible');
  }
}
