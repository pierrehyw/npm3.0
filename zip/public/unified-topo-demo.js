// unified-topo-demo.js — 业务请求路径拓扑（整合 eBPF L7 + SPAN L4）

var unifiedState = { mode: 'fusion', query: '', selectedNode: null, selectedEdge: null };

function setUnifiedMode(mode) {
  unifiedState.mode = mode;
  document.querySelectorAll('.unified-mode-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  updateCapabilityBadge();
  renderUnifiedGraph();
}

function unifiedFilter(query) {
  unifiedState.query = (query || '').toLowerCase();
  renderUnifiedGraph();
}

function updateCapabilityBadge() {
  var t = {
    fusion: '全栈融合视图 (L7 + L4)',
    span: '网络物理拓扑 (SPAN)',
    ebpf: '服务依赖拓扑 (eBPF)'
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
  net: 'path://M12,1l-9,4v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12v-6l-9-4z m0,10.99h7c-0.53,4.12-3.28,7.79-7,8.94v-8.94h-7v-5.6l7-3.11v8.71z', // shield
  net_warn: 'path://M12,1l-9,4v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12v-6l-9-4z',
  os: 'path://M4,1h16c1.1,0,2,0.9,2,2v4c0,1.1-0.9,2-2,2h-16c-1.1,0-2-0.9-2-2v-4c0-1.1,0.9-2,2-2z m0,8h16c1.1,0,2,0.9,2,2v4c0,1.1-0.9,2-2,2h-16c-1.1,0-2-0.9-2-2v-4c0-1.1,0.9-2,2-2z m0,8h16c1.1,0,2,0.9,2,2v4c0,1.1-0.9,2-2,2h-16c-1.1,0-2-0.9-2-2v-4c0-1.1,0.9-2,2-2z', // server rack
  runtime: 'path://M12,2l-10,5l10,5l10-5l-10-5z m0,12l-10-5v6l10,5l10-5v-6l-10,5z', // cube
  service: 'path://M9.4,16.6L4.8,12l4.6-4.6L8,6l-6,6l6,6L9.4,16.6z M14.6,16.6l4.6-4.6l-4.6-4.6L16,6l6,6l-6,6L14.6,16.6z', // code
  db: 'path://M12,3c-4.97,0-9,1.79-9,4s4.03,4,9,4s9-1.79,9-4s-4.03-4-9-4z m0,10c-4.97,0-9-1.79-9-4v3c0,2.21,4.03,4,9,4s9-1.79,9-4v-3c0,2.21-4.03,4-9,4z m0,6c-4.97,0-9-1.79-9-4v3c0,2.21,4.03,4,9,4s9-1.79,9-4v-3c0,2.21-4.03,4-9,4z'
};

function hexToRgb(hex) {
  if(!hex) return '255,255,255';
  var c = hex.substring(1).split('');
  if(c.length == 3) { c= [c[0], c[0], c[1], c[1], c[2], c[2]]; }
  c = '0x' + c.join('');
  return [(c>>16)&255, (c>>8)&255, c&255].join(',');
}

function renderUnifiedGraph() {
  var el = document.getElementById('unifiedChart');
  if (!el || typeof echarts === 'undefined') return;
  if (!unifiedChart) unifiedChart = echarts.init(el);
  
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
  
  unifiedChart.resize();
}

function buildFusionOpt() {
  var Y_SVC = 160, Y_RT = 260, Y_OS = 360, Y_NET = 460;
  
  var rawNodes = [
    { id: 'user', name: 'Browser/App\n(Client)', category: 'client', x: 50, y: Y_NET - 40, symbolSize: 50 },
    
    // Physical / Net Devices
    { id: 'fw_ext', name: '边界防火墙\n(SPAN)', category: 'net', x: 200, y: Y_NET, status: 'ok' },
    { id: 'lb_ext', name: '公网 LB\n(SPAN)', category: 'net', x: 330, y: Y_NET, status: 'ok' },
    
    // Gateway Stack
    { id: 'lbl_gw', name: 'API 网关节点', category: 'label', x: 470, y: Y_SVC - 60 },
    { id: 'gw_os', name: 'TCP/IP (OS)', category: 'os', x: 470, y: Y_OS },
    { id: 'gw_rt', name: 'Envoy', category: 'runtime', x: 470, y: Y_RT },
    { id: 'api_gw', name: 'api-gateway', category: 'service', x: 470, y: Y_SVC, status: 'warn', p99: 1250, rps: 3200 },

    // Internal Network
    { id: 'waf', name: '内网 WAF\n(SPAN)', category: 'net', x: 610, y: Y_NET, status: 'ok' },
    { id: 'sw_core', name: '核心交换\n(SPAN)', category: 'net', x: 740, y: Y_NET, status: 'ok' },

    // Order Stack
    { id: 'lbl_ord', name: '订单节点 (VM)', category: 'label', x: 880, y: Y_SVC - 60 },
    { id: 'ord_os', name: 'TCP/IP (OS)', category: 'os', x: 880, y: Y_OS },
    { id: 'ord_rt', name: 'JVM', category: 'runtime', x: 880, y: Y_RT },
    { id: 'ord_svc', name: 'order-service', category: 'service', x: 880, y: Y_SVC, status: 'error', p99: 1230, rps: 1284 },

    // Cross IDC Link
    { id: 'idc_link', name: '跨机房专线\n(BJ→SH)\nRTT 210ms ⚠', category: 'net_warn', x: 1040, y: Y_NET, status: 'error' },

    // Inventory Stack
    { id: 'lbl_inv', name: '库存节点 (K8s)', category: 'label', x: 1200, y: Y_SVC - 60 },
    { id: 'inv_os', name: 'TCP/IP (OS)', category: 'os', x: 1200, y: Y_OS },
    { id: 'inv_rt', name: 'Node.js', category: 'runtime', x: 1200, y: Y_RT },
    { id: 'inv_svc', name: 'inventory-svc', category: 'service', x: 1200, y: Y_SVC, status: 'error', p99: 870, rps: 1180 },

    // DB Layer
    { id: 'mysql', name: 'Order DB\n(MySQL)', category: 'db', x: 1360, y: Y_RT, status: 'ok', p99: 45 },
    { id: 'redis', name: 'Cache\n(Redis)', category: 'db', x: 1360, y: Y_OS, status: 'ok', p99: 8 }
  ];

  var rawLinks = [
    // Bottom: Physical Flow (L4/L3)
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

    // Middle: Node Traversal Up/Down Stacks
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

    // Top: Logical Service Dependencies (L7 eBPF / APM)
    { source: 'api_gw', target: 'ord_svc', type: 'L7_ok', label: '1250ms' },
    { source: 'ord_svc', target: 'inv_svc', type: 'L7_warn', label: '870ms (Timeout)' },
    { source: 'ord_svc', target: 'mysql', type: 'L7_db', label: '45ms' },
    { source: 'ord_svc', target: 'redis', type: 'L7_db', label: '8ms' }
  ];

  var filterQ = unifiedState.query;
  
  // Design system mapped to NGPM dark theme
  var Colors = {
    client: '#06b6d4', net: '#3b82f6', net_warn: '#ef4444',
    os: '#64748b', runtime: '#a855f7', service: '#22d3ee',
    db: '#4ade80', label: 'transparent'
  };
  
  var nodes = rawNodes.map(function(n) {
    if (n.category === 'label') {
      return {
        id: n.id, name: n.name, x: n.x, y: n.y, symbolSize: 1, _n: n,
        itemStyle: { color: 'transparent' }, 
        label: { show: true, position: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 700 }
      };
    }
    
    var dimmed = filterQ && n.name.toLowerCase().indexOf(filterQ) < 0;
    var color = n.status === 'error' ? '#ef4444' : n.status === 'warn' ? '#f97316' : Colors[n.category];

    // Logical Service Nodes
    if (n.category === 'service' || n.category === 'runtime') {
      var w = n.category === 'service' ? 140 : 100;
      return {
        id: n.id, name: n.name, x: n.x, y: n.y, symbol: 'roundRect',
        symbolSize: [w, 48], _n: n,
        itemStyle: { color: 'rgba(' + hexToRgb(color) + ', 0.1)', borderColor: color, borderWidth: 1.5, borderType: 'dashed', shadowColor: color, shadowBlur: dimmed ? 0 : 15, opacity: dimmed ? 0.2 : 1 },
        label: {
          show: true, position: 'inside',
          formatter: '{icon|☁}\n{name|' + n.name + '}',
          rich: {
            icon: { color: color, fontSize: 14, align: 'center', padding: [0, 0, 2, 0] },
            name: { color: dimmed ? '#475569' : '#e2e8f0', fontSize: 11, fontWeight: 700, align: 'center', width: w }
          }
        }
      };
    } 
    // Physical Infra Nodes (net, os, db, client)
    else {
      var sym = IconPaths[n.category] || 'path://M12,2...';
      if (n.category === 'net_warn') sym = IconPaths.net_warn;
      if (n.category === 'client') sym = IconPaths.client;
      if (n.category === 'db') sym = IconPaths.db;
      
      var sz = n.category === 'db' ? 44 : 40;
      return {
        id: n.id, name: n.name, x: n.x, y: n.y, symbol: sym,
        symbolSize: sz, _n: n,
        itemStyle: { color: '#0f172a', borderColor: color, borderWidth: 2, shadowColor: color, shadowBlur: dimmed ? 0 : 12, opacity: dimmed ? 0.2 : 1 },
        label: { show: true, position: 'bottom', color: dimmed ? '#64748b' : '#e2e8f0', fontSize: 10, fontWeight: 700 }
      };
    }
  });

  var links = rawLinks.map(function(l) {
    var isL7 = l.type.indexOf('L7') >= 0;
    var isWarn = l.type.indexOf('warn') >= 0;
    var isStack = l.type === 'stack';
    
    var color = isWarn ? '#ef4444' : isL7 ? '#22d3ee' : (isStack ? 'rgba(255,255,255,0.1)' : '#3b82f6');
    var width = isL7 ? (isWarn ? 3.5 : 2.5) : 1.5;
    var opacity = isL7 ? 0.9 : 0.6;
    var type = (l.lineStyle && l.lineStyle.type) ? l.lineStyle.type : (isWarn ? 'dashed' : 'solid');
    
    var curveness = 0;
    if (isL7) { curveness = -0.25; }
    else if (l.type.indexOf('L4') >= 0) { curveness = 0.12; }
    
    return {
      source: l.source, target: l.target, _l: l,
      lineStyle: { color: color, shadowColor: color, shadowBlur: isWarn ? 8 : 4, width: width, type: type, curveness: curveness, opacity: Math.max(opacity, 0.4) },
      label: { show: !!l.label, formatter: l.label, color: color, backgroundColor: 'rgba(7,11,20,0.95)', padding: [3, 6], borderRadius: 4, fontSize: 10, fontWeight: 800 }
    };
  });

  return {
    backgroundColor: 'transparent',
    title: [
      {
        text: '全栈融合视图 (Request Lifecycle)', left: 20, top: 16,
        textStyle: { color: '#e2e8f0', fontSize: 16, fontWeight: 700, textShadow: '0 0 10px rgba(255,255,255,0.3)' }
      },
      {
        text: '上层曲线：基于 eBPF / APM 解析的微服务之间 L7 逻辑调用关系\n下层折线：基于 SPAN 镜像分析的底层 L4/L3 物理数据流通路及 OS 网络栈开销\n\n⚠ 分析摘要：API 网关 504 错误源于 order-service 等待 inventory-svc 返回，深入物理链路层发现\n跨机房专线拥塞导致 RTT 高达 210ms，属底层基础设施瓶颈，微服务逻辑及容器资源均正常。',
        left: 20, top: 48,
        textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 18, fontWeight: 400 }
      }
    ],
    graphic: [
      {
        type: 'rect', z: -10,
        shape: { x: 20, y: 110, width: 1400, height: 200 },
        style: { fill: 'rgba(34, 211, 238, 0.02)', stroke: 'rgba(34, 211, 238, 0.2)', lineWidth: 1, lineDash: [5, 5], radius: [8] }
      },
      {
        type: 'text', z: -9,
        style: { text: "微服务与应用逻辑视图 (L7)", x: 30, y: 120, fill: 'rgba(34, 211, 238, 0.6)', font: 'bold 12px sans-serif' }
      },
      {
        type: 'rect', z: -10,
        shape: { x: 20, y: 320, width: 1400, height: 200 },
        style: { fill: 'rgba(59, 130, 246, 0.02)', stroke: 'rgba(59, 130, 246, 0.2)', lineWidth: 1, lineDash: [5, 5], radius: [8] }
      },
      {
        type: 'text', z: -9,
        style: { text: "基础设施与网络物理视图 (L3/L4)", x: 30, y: 330, fill: 'rgba(59, 130, 246, 0.6)', font: 'bold 12px sans-serif' }
      }
    ],
    tooltip: {
      trigger: 'item', confine: true,
      backgroundColor: 'rgba(12,18,32,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
      textStyle: { color: '#E8EFF7', fontSize: 12 },
      formatter: function(p) {
        if (p.dataType === 'node') {
          var n = p.data._n;
          if (n.category === 'label') return '';
          return '<b>' + n.name + '</b><hr style="border:0;border-top:1px solid rgba(255,255,255,0.1);margin:6px 0">'
               + '层级分类: <b style="color:#22d3ee">' + n.category.toUpperCase() + '</b><br>'
               + '健康状态: <b style="color:' + (n.status==='error'?'#ef4444':n.status==='warn'?'#f97316':'#4ade80') + '">' + (n.status ? n.status.toUpperCase() : 'OK') + '</b><br>'
               + (n.p99 ? 'P99 延迟: ' + n.p99 + ' ms<br>' : '')
               + (n.rps ? '并发频次: ' + n.rps + ' req/s<br>' : '');
        }
        if (p.dataType === 'edge') {
          var l = p.data._l;
          return '<b>' + l.source + ' → ' + l.target + '</b><br>通信层级: <b style="color:#22d3ee">' + l.type + '</b><br>' + (l.label ? '核心指标: ' + l.label : '');
        }
      }
    },
    series: [{
      type: 'graph', layout: 'none', roam: true, draggable: false,
      edgeSymbol: ['none', 'arrow'], edgeSymbolSize: [0, 9],
      data: nodes, links: links,
      emphasis: { focus: 'adjacency', scale: true }
    }]
  };
}

function buildSpanOpt() {
  var IconPaths = {
    client: 'path://M19,2h-14c-1.1,0-2,0.9-2,2v12c0,1.1,0.9,2,2,2h4v2h2v-2h2v2h2v-2h4c1.1,0,2-0.9,2-2v-12c0-1.1-0.9-2-2-2z m0,14h-14v-10h14v10z',
    net: 'path://M12,1l-9,4v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12v-6l-9-4z m0,10.99h7c-0.53,4.12-3.28,7.79-7,8.94v-8.94h-7v-5.6l7-3.11v8.71z', // shield
    os: 'path://M4,1h16c1.1,0,2,0.9,2,2v4c0,1.1-0.9,2-2,2h-16c-1.1,0-2-0.9-2-2v-4c0-1.1,0.9-2,2-2z m0,8h16c1.1,0,2,0.9,2,2v4c0,1.1-0.9,2-2,2h-16c-1.1,0-2-0.9-2-2v-4c0-1.1,0.9-2,2-2z m0,8h16c1.1,0,2,0.9,2,2v4c0,1.1-0.9,2-2,2h-16c-1.1,0-2-0.9-2-2v-4c0-1.1,0.9-2,2-2z'
  };
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
    title: { text: '网络物理拓扑 (SPAN 流量映射)', left: 20, top: 20, textStyle: { color: '#e2e8f0', fontSize: 16, textShadow: '0 0 10px rgba(255,255,255,0.3)' } },
    graphic: [
      {
        type: 'rect', z: -10,
        shape: { x: 50, y: 100, width: 1150, height: 200 },
        style: { fill: 'rgba(59, 130, 246, 0.02)', stroke: 'rgba(59, 130, 246, 0.2)', lineWidth: 1, lineDash: [5, 5], radius: [8] }
      },
      {
        type: 'text', z: -9,
        style: { text: "物理设备及 OS 通信矩阵", x: 60, y: 110, fill: 'rgba(59, 130, 246, 0.6)', font: 'bold 12px sans-serif' }
      }
    ],
    series: [{
      type: 'graph', layout: 'none', roam: true, edgeSymbol: ['none','arrow'], edgeSymbolSize: 10,
      data: nodes.map(function(n){ 
        return { 
          id:n.id, name:n.name, x:n.x, y:n.y, 
          symbol: IconPaths[n.category] || IconPaths.net, 
          itemStyle:{color:'#0f172a', borderColor:'#3b82f6', borderWidth:2, shadowColor:'#3b82f6', shadowBlur:15}, 
          symbolSize:42, 
          label:{show:true,position:'bottom',color:'#e2e8f0',fontWeight:700} 
        };
      }),
      links: links.map(function(l){ return { source:l.source, target:l.target, lineStyle:{color:'#3b82f6',width:2,shadowColor:'#3b82f6',shadowBlur:8} } })
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
    title: { text: '微服务依赖拓扑 (eBPF L7 解析)', left: 20, top: 20, textStyle: { color: '#e2e8f0', fontSize: 16, textShadow: '0 0 10px rgba(255,255,255,0.3)' } },
    graphic: [
      {
        type: 'rect', z: -10,
        shape: { x: 50, y: 70, width: 1200, height: 360 },
        style: { fill: 'rgba(168, 85, 247, 0.02)', stroke: 'rgba(168, 85, 247, 0.2)', lineWidth: 1, lineDash: [5, 5], radius: [8] }
      },
      {
        type: 'text', z: -9,
        style: { text: "应用逻辑集群边界 (App Containerized Envelope)", x: 60, y: 85, fill: 'rgba(168, 85, 247, 0.6)', font: 'bold 12px sans-serif' }
      }
    ],
    series: [{
      type: 'graph', layout: 'none', roam: true, edgeSymbol: ['none','arrow'], edgeSymbolSize: 12,
      data: nodes.map(function(n){ 
        return { 
          id:n.id, name:n.name, x:n.x, y:n.y, 
          symbol: 'roundRect',
          itemStyle: { color: 'rgba(168,85,247,0.1)', borderColor: '#a855f7', borderWidth: 1.5, shadowColor: 'rgba(168,85,247,0.5)', shadowBlur: 15 },
          symbolSize: [140, 60], 
          label: {
            show: true, position: 'inside',
            formatter: '{top|📦 逻辑容器节点}\n{name|' + n.name + '}',
            rich: {
              top: { color: '#c084fc', fontSize: 10, align: 'left', width: 120, padding: [0, 0, 8, 0] },
              name: { color: '#E8EFF7', fontSize: 14, fontWeight: 'bold', align: 'center', width: 120 }
            }
          } 
        }; 
      }),
      links: links.map(function(l){ return { source:l.source, target:l.target, lineStyle:{color:'#22d3ee',width:2.5,curveness:0.1,shadowColor:'#22d3ee',shadowBlur:8} } })
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
    
    html += '<div class="unified-dt-name">' + n.name + '</div>';
    html += '<div class="unified-dt-row"><div class="unified-dt-label">分层节点角色 (OSI)</div><div class="unified-dt-value" style="color:#22d3ee;font-weight:700">' + n.category.toUpperCase() + '</div></div>';
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
    html += '<div class="unified-dt-row"><div class="unified-dt-label">流量通信层级</div><div class="unified-dt-value" style="color:#22d3ee;font-weight:700">' + l.type + '</div></div>';
    if (l.label) {
        html += '<div class="unified-dt-row"><div class="unified-dt-label">核心时延指标</div><div class="unified-dt-value" style="color:' + (l.type.indexOf('warn') >= 0 ? '#ef4444' : '#e2e8f0') + ';font-weight:700">' + l.label + '</div></div>';
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
