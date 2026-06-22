# 统一拓扑视角 - 科技感高级原型开发计划

**目标**：一套 UI + 数据模型支持三种部署形态（span_only / ebpf_only / fusion）  
**工期**：8 天（4 天 P0 + 2 天 P1 + 2 天 P2）  
**技术栈**：G6 WebGL + Motion One + CSS Variables  

---

## 阶段 0：基础准备（0.5 天）

### 任务 0-1：技术环保（1 小时）
- [ ] 确认 ECharts 可用且无版本冲突
- [ ] 在 ngpm-prototype 根目录新建 `vendor/g6-webgl.min.js`（从 G6 4.x 复制 WebGL 版本）
- [ ] 在 ngpm-prototype 根目录新建 `vendor/motion-one.min.js`（GSAP 轻量替代）
- [ ] 在 ngpm-prototype 新建 `unified-topo.css`（样式主文件）
- [ ] 在 ngpm-prototype 新建 `unified-topo.data.js`（数据与映射器）

**验收**：浏览器 console 无加载错误

### 任务 0-2：设计 Token 定义（30 分钟）
在 `unified-topo.css` 顶部新增：
```css
:root {
  /* === 颜色系统 === */
  --color-ok: #1A7F37;
  --color-slow: #D09B00;
  --color-error: #CF222E;
  --color-neutral: #57606A;
  
  /* === 发光/阴影 === */
  --glow-ok: 0 0 12px rgba(26,127,55,0.4);
  --glow-error: 0 0 12px rgba(207,34,46,0.4);
  --shadow-card: 0 4px 16px rgba(31,35,40,0.14);
  --shadow-hover: 0 8px 24px rgba(31,35,40,0.18);
  
  /* === 玻璃态 === */
  --glass-bg: rgba(255,255,255,0.8);
  --glass-border: 1px solid rgba(208,215,222,0.4);
  
  /* === 过渡 === */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --easing-smooth: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**验收**：Token 可在后续 CSS 中通过 var() 引用

---

## 阶段 P0：最小闭环（4 天）

### 任务 P0-1：统一拓扑容器与工具栏（4 小时）

**目标**：在 app.html 新增 unified tab，搭基础布局  

在 app.html `<style>` 末尾新增：
```css
/* ===================== 统一拓扑视角 ===================== */
.unified-layout { display:flex; height:calc(100vh - 142px); overflow:hidden; background:#F6F8FA; }
.unified-main { flex:1; display:flex; flex-direction:column; min-width:0; }
.unified-detail { width:360px; flex-shrink:0; background:#fff; border-left:1px solid #E1E4E8; overflow-y:auto; }

/* 工具栏 */
.unified-toolbar { 
  display:flex; align-items:center; gap:10px; padding:12px 16px;
  flex-shrink:0; flex-wrap:wrap; background:#fff; border-bottom:1px solid #D0D7DE;
}
.unified-mode-seg { display:inline-flex; background:#EAEEF2; border-radius:7px; padding:2px; gap:2px; }
.unified-mode-btn {
  border:none; background:transparent; font-size:11px; font-weight:600;
  color:#636C76; padding:5px 11px; border-radius:5px; cursor:pointer;
  transition:all var(--duration-fast);
}
.unified-mode-btn:hover { color:#1F2328; }
.unified-mode-btn.active { background:#fff; color:#6E40C9; box-shadow:0 1px 2px rgba(0,0,0,0.08); }

/* 能力提示条 */
.unified-capability-badge {
  display:inline-flex; align-items:center; gap:6px;
  font-size:11px; font-weight:600; color:#6E40C9;
  background:#F5F0FF; border:1px solid #E2D6F7;
  border-radius:6px; padding:5px 10px;
  animation:pulse-badge 2s infinite;
}
@keyframes pulse-badge {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 图容器 */
.unified-graph-wrap {
  flex:1; position:relative; margin:10px 16px; background:#fff;
  border:1px solid #E1E4E8; border-radius:10px; overflow:hidden; min-height:0;
}
#unifiedGraph { width:100%; height:100%; }

/* 详情面板 */
.unified-dt-head { padding:14px 16px; border-bottom:1px solid #E1E4E8; }
.unified-dt-name { font-size:14px; font-weight:700; color:#1F2328; }
.unified-dt-body { padding:14px 16px; }
```

在 app.html main 内，depLayout 后面新增 HTML：
```html
<!-- unified-topo tab -->
<div class="app-tab-content" id="app-tab-unified" style="display:none">
  <div class="unified-layout">
    <div class="unified-main">
      <div class="unified-toolbar">
        <div class="unified-mode-seg" id="unifiedModeSeg">
          <button class="unified-mode-btn active" data-mode="span_only">网络视角</button>
          <button class="unified-mode-btn" data-mode="ebpf_only">服务视角</button>
          <button class="unified-mode-btn" data-mode="fusion">融合视角</button>
        </div>
        <span class="unified-capability-badge" id="capabilityBadge">
          <span class="material-symbols-rounded" style="font-size:13px">check_circle</span>
          <span id="badgeText">融合数据源</span>
        </span>
        <div style="flex:1"></div>
        <button class="btn-secondary" id="unifiedSearchBtn" style="font-size:12px">
          <span class="material-symbols-rounded">search</span>搜索
        </button>
      </div>
      <div class="unified-graph-wrap">
        <div id="unifiedGraph"></div>
      </div>
    </div>
    <div class="unified-detail" id="unifiedDetail">
      <div class="unified-dt-head">
        <div class="unified-dt-name" id="unifiedDtName">选择节点或边查看详情</div>
      </div>
      <div class="unified-dt-body" id="unifiedDtBody"></div>
    </div>
  </div>
</div>
```

在 app.html 顶部 page-tabs 里新增：
```html
<button class="page-tab" id="ptab-unified" onclick="showAppTab('unified')">
  <span class="material-symbols-rounded">account_tree</span>统一拓扑
</button>
```

**验收**：
- 能看到三个模式切换按钮
- 能看到图容器和右侧详情面板
- 切换模式按钮有样式反馈

---

### 任务 P0-2：统一状态机与能力检测（3 小时）

**目标**：在 app.html script 内新增统一拓扑管理对象  

在 app.html `<script>` 末尾，`showAppTab` 函数前新增：

```javascript
// ===================== 统一拓扑（Unified Topo） =====================
var unifiedState = {
  mode: 'fusion',  // span_only / ebpf_only / fusion
  selectedNode: null,
  selectedEdge: null,
  query: '',
  capabilities: { span: true, ebpf: true },  // P0 假设都有
  initialized: false
};

var unifiedChart = null;

// 能力检测（后续接后端，P0 先写死）
function detectCapabilities() {
  return { span: true, ebpf: true };  // 演示用：都启用
}

// 能力到模式的自动推导
function inferModeFromCapabilities(cap) {
  if (cap.span && cap.ebpf) return 'fusion';
  if (cap.span) return 'span_only';
  if (cap.ebpf) return 'ebpf_only';
  return 'fusion';  // 默认
}

// 设置模式
function setUnifiedMode(mode) {
  unifiedState.mode = mode;
  document.querySelectorAll('.unified-mode-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  renderUnifiedGraph();
}

// 初始化统一拓扑视图
function renderUnified(context) {
  if (unifiedState.initialized) return;
  unifiedState.capabilities = detectCapabilities();
  unifiedState.mode = inferModeFromCapabilities(unifiedState.capabilities);
  
  // 绑定模式切换
  document.querySelectorAll('.unified-mode-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      setUnifiedMode(this.dataset.mode);
    });
  });
  
  // 更新能力条
  updateCapabilityBadge();
  
  // 首次渲染图
  renderUnifiedGraph();
  
  unifiedState.initialized = true;
}

// 更新能力提示条
function updateCapabilityBadge() {
  var cap = unifiedState.capabilities;
  var badge = document.getElementById('capabilityBadge');
  var text = document.getElementById('badgeText');
  
  if (cap.span && cap.ebpf) {
    text.innerText = '融合数据源（span + eBPF）';
    badge.style.background = '#F5F0FF';
  } else if (cap.span) {
    text.innerText = '仅网络数据（span）- 服务链为推断';
    badge.style.background = '#E5F0FF';
  } else if (cap.ebpf) {
    text.innerText = '仅应用数据（eBPF）- 物理路径未接入';
    badge.style.background = '#FFF8C5';
  }
}
```

**验收**：
- console 里能看到 unifiedState 对象
- 切换模式按钮能改变 unifiedState.mode
- 能力条文案会根据能力变化

---

### 任务 P0-3：统一数据模型与映射器（4 小时）

**目标**：新建 `unified-topo.data.js`，定义三种数据映射  

创建 `d:\coding\页面设计-pencil\ngpm-prototype\unified-topo.data.js`：

```javascript
// ===================== 统一拓扑数据模型 =====================

// P0 假数据：融合视角（模拟电商链路）
var UNIFIED_TOPO_DATA = {
  capabilities: { span: true, ebpf: true },
  timeWindow: '1m',
  
  // 统一节点定义
  nodes: [
    // 网络层
    { id: 'wan-01', name: 'WAN-01', type: 'gateway', layer: 'network', zone: 'internet', 
      health: 'slow', rps: 1200, p99: 45, errRate: 0, source: ['ebpf'] },
    { id: 'waf-01', name: 'WAF-01', type: 'waf', layer: 'network', zone: 'dc-a',
      health: 'ok', rps: 1200, p99: 8, errRate: 0, source: ['ebpf'] },
    
    // 服务层
    { id: 'api-gw', name: 'api-gateway', type: 'service', layer: 'service', zone: 'dc-a',
      health: 'slow', rps: 1200, p99: 380, errRate: 2.1, source: ['span', 'ebpf'] },
    { id: 'order-svc', name: 'order-service', type: 'service', layer: 'service', zone: 'dc-a',
      health: 'error', rps: 850, p99: 1230, errRate: 7.8, source: ['span'] },
    { id: 'pay-svc', name: 'payment-service', type: 'service', layer: 'service', zone: 'dc-a',
      health: 'slow', rps: 450, p99: 680, errRate: 0.4, source: ['span'] },
    { id: 'inv-svc', name: 'inventory-service', type: 'service', layer: 'service', zone: 'dc-b',
      health: 'error', rps: 800, p99: 870, errRate: 12.4, source: ['span'] },
    
    // 数据库
    { id: 'db-bj', name: 'db-bj (MySQL)', type: 'db', layer: 'infra', zone: 'dc-a',
      health: 'slow', rps: 1200, p99: 630, errRate: 0, source: ['span'] },
    { id: 'db-sh', name: 'db-sh (MySQL)', type: 'db', layer: 'infra', zone: 'dc-b',
      health: 'ok', rps: 800, p99: 38, errRate: 0, source: ['span'] }
  ],
  
  // 统一边定义
  edges: [
    // 网络 -> 服务
    { source: 'wan-01', target: 'waf-01', type: 'l3_path', qps: 1200, p99: 28, errRate: 0, 
      sourceType: 'ebpf', crossZone: false, status: 'ok' },
    { source: 'waf-01', target: 'api-gw', type: 'l4_flow', qps: 1200, p99: 15, errRate: 0.1,
      sourceType: 'ebpf', crossZone: false, status: 'ok' },
    
    // 服务调用
    { source: 'api-gw', target: 'order-svc', type: 'l7_call', qps: 850, p99: 1230, errRate: 7.8,
      sourceType: 'span', crossZone: false, status: 'error' },
    { source: 'api-gw', target: 'pay-svc', type: 'l7_call', qps: 450, p99: 85, errRate: 0.4,
      sourceType: 'span', crossZone: false, status: 'slow' },
    { source: 'order-svc', target: 'inv-svc', type: 'l7_call', qps: 800, p99: 870, errRate: 12.4,
      sourceType: 'span', crossZone: true, status: 'error' },
    
    // 服务 -> 数据库
    { source: 'order-svc', target: 'db-bj', type: 'l7_call', qps: 850, p99: 45, errRate: 0,
      sourceType: 'span', crossZone: false, status: 'ok' },
    { source: 'inv-svc', target: 'db-sh', type: 'l7_call', qps: 800, p99: 38, errRate: 0,
      sourceType: 'span', crossZone: true, status: 'ok' },
    { source: 'pay-svc', target: 'db-bj', type: 'l7_call', qps: 450, p99: 630, errRate: 0,
      sourceType: 'span', crossZone: false, status: 'slow' }
  ]
};

// 模式到数据映射器
function mapToGraphData(topoData, mode) {
  var graphData = { nodes: [], links: [] };
  
  if (mode === 'span_only') {
    // 仅 span：只显示服务 + 数据库 + 网关
    graphData.nodes = topoData.nodes.filter(function(n) {
      return n.source && n.source.indexOf('span') >= 0;
    });
    graphData.links = topoData.edges.filter(function(e) {
      return e.sourceType === 'span';
    });
  } else if (mode === 'ebpf_only') {
    // 仅 eBPF：只显示网络层 + 部分基础设施
    graphData.nodes = topoData.nodes.filter(function(n) {
      return n.layer === 'network' || n.layer === 'infra';
    });
    graphData.links = topoData.edges.filter(function(e) {
      return e.sourceType === 'ebpf';
    });
  } else {
    // 融合：全部
    graphData.nodes = topoData.nodes;
    graphData.links = topoData.edges;
  }
  
  // 转换为 ECharts 格式
  var ecNodes = graphData.nodes.map(function(n) {
    var color = n.health === 'ok' ? '#1A7F37' : n.health === 'slow' ? '#D09B00' : '#CF222E';
    var size = 40;
    return {
      id: n.id, name: n.name, x: 0, y: 0, symbolSize: size,
      itemStyle: { color: color, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, position: 'bottom', fontSize: 10, color: '#1F2328' },
      _node: n
    };
  });
  
  var ecLinks = graphData.links.map(function(e) {
    var color = e.status === 'ok' ? '#1A7F37' : e.status === 'slow' ? '#D09B00' : '#CF222E';
    var lineType = e.crossZone ? 'dashed' : 'solid';
    var label = e.status === 'ok' ? '' : (e.p99 + 'ms');
    return {
      source: e.source, target: e.target,
      lineStyle: { color: color, width: 1.5, type: lineType, opacity: 0.7 },
      label: { show: !!label, formatter: label, fontSize: 9, color: color },
      _edge: e
    };
  });
  
  return { nodes: ecNodes, links: ecLinks };
}
```

在 app.html `<head>` 添加：
```html
<script src="unified-topo.data.js"></script>
<link rel="stylesheet" href="unified-topo.css">
```

**验收**：
- `unified-topo.data.js` 能加载无错
- 三种模式的数据映射能返回正确结构

---

### 任务 P0-4：拓扑渲染与交互（4 小时）

**目标**：在 app.html 内新增 renderUnifiedGraph() 与选择逻辑  

在 app.html script 内，`renderUnified` 函数后新增：

```javascript
// 渲染统一拓扑图
function renderUnifiedGraph() {
  var el = document.getElementById('unifiedGraph');
  if (!el || typeof echarts === 'undefined') return;
  
  if (!unifiedChart) {
    unifiedChart = echarts.init(el);
  }
  
  // 获取当前模式的数据
  var graphData = mapToGraphData(UNIFIED_TOPO_DATA, unifiedState.mode);
  
  // 简单分层布局（P0 先用固定坐标）
  var layerPos = { network: 100, service: 400, infra: 700 };
  var layerCount = {};
  graphData.nodes.forEach(function(n) {
    var layer = n._node.layer;
    var y = layerPos[layer] || 300;
    var x = (layerCount[layer] || 0) * 120 + 100;
    layerCount[layer] = (layerCount[layer] || 0) + 1;
    n.x = x;
    n.y = y;
  });
  
  unifiedChart.setOption({
    animation: true,
    animationDuration: 500,
    series: [{
      type: 'graph',
      layout: 'none',  // 使用自定义坐标
      roam: true,
      data: graphData.nodes,
      links: graphData.links,
      lineStyle: { curveness: 0.1 },
      emphasis: { focus: 'adjacency', scale: true },
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: 8
    }]
  }, true);
  
  // 绑定点击事件
  unifiedChart.off('click');
  unifiedChart.on('click', function(p) {
    if (p.dataType === 'node') {
      selectUnifiedNode(p.data.id);
    } else if (p.dataType === 'edge') {
      selectUnifiedEdge(p.data._edge);
    }
  });
  
  unifiedChart.resize();
}

// 选择节点
function selectUnifiedNode(nodeId) {
  unifiedState.selectedNode = nodeId;
  unifiedState.selectedEdge = null;
  
  var node = UNIFIED_TOPO_DATA.nodes.find(function(n) { return n.id === nodeId; });
  if (!node) return;
  
  var dtName = document.getElementById('unifiedDtName');
  var dtBody = document.getElementById('unifiedDtBody');
  
  dtName.innerText = node.name + ' (' + node.type + ')';
  dtBody.innerHTML = 
    '<div style="font-size:12px;color:#636C76;margin-bottom:10px"><strong>指标</strong></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">' +
    '<div><div style="font-size:10px;color:#8B949E">RPS</div><div style="font-size:18px;font-weight:700;color:#1F2328">' + node.rps + '</div></div>' +
    '<div><div style="font-size:10px;color:#8B949E">P99</div><div style="font-size:18px;font-weight:700;color:' + (node.health === 'ok' ? '#1A7F37' : node.health === 'slow' ? '#D09B00' : '#CF222E') + '">' + node.p99 + 'ms</div></div>' +
    '<div><div style="font-size:10px;color:#8B949E">错误率</div><div style="font-size:18px;font-weight:700;color:#1A7F37">' + node.errRate + '%</div></div>' +
    '<div><div style="font-size:10px;color:#8B949E">可用区</div><div style="font-size:12px;font-weight:600;color:#636C76">' + node.zone + '</div></div>' +
    '</div>' +
    '<div style="font-size:12px;color:#636C76;margin-bottom:10px"><strong>数据源</strong></div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
    (node.source.indexOf('span') >= 0 ? '<span style="display:inline-block;background:#DDF4FF;color:#0550AE;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:600">span</span>' : '') +
    (node.source.indexOf('ebpf') >= 0 ? '<span style="display:inline-block;background:#FFF8C5;color:#7D4E00;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:600">eBPF</span>' : '') +
    '</div>';
}

// 选择边
function selectUnifiedEdge(edge) {
  unifiedState.selectedEdge = edge;
  unifiedState.selectedNode = null;
  
  var dtName = document.getElementById('unifiedDtName');
  var dtBody = document.getElementById('unifiedDtBody');
  
  dtName.innerText = edge.source + ' → ' + edge.target;
  dtBody.innerHTML = 
    '<div style="font-size:12px;color:#636C76;margin-bottom:10px"><strong>指标</strong></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">' +
    '<div><div style="font-size:10px;color:#8B949E">QPS</div><div style="font-size:18px;font-weight:700;color:#1F2328">' + edge.qps + '</div></div>' +
    '<div><div style="font-size:10px;color:#8B949E">P99</div><div style="font-size:18px;font-weight:700;color:' + (edge.status === 'ok' ? '#1A7F37' : edge.status === 'slow' ? '#D09B00' : '#CF222E') + '">' + edge.p99 + 'ms</div></div>' +
    '<div><div style="font-size:10px;color:#8B949E">错误率</div><div style="font-size:18px;font-weight:700;color:#1A7F37">' + edge.errRate + '%</div></div>' +
    '<div><div style="font-size:10px;color:#8B949E">类型</div><div style="font-size:12px;font-weight:600;color:#636C76">' + edge.type + '</div></div>' +
    '</div>' +
    '<div style="font-size:12px;color:#636C76;margin-bottom:10px"><strong>数据源</strong></div>' +
    '<div style="display:flex;gap:6px">' +
    '<span style="display:inline-block;background:' + (edge.sourceType === 'span' ? '#DDF4FF' : '#FFF8C5') + ';color:' + (edge.sourceType === 'span' ? '#0550AE' : '#7D4E00') + ';border-radius:4px;padding:2px 6px;font-size:10px;font-weight:600">' + edge.sourceType + '</span>' +
    '</div>' +
    (edge.crossZone ? '<div style="margin-top:10px;padding:8px;background:#FFF8C5;border-left:3px solid #D09B00;font-size:11px;color:#7D4E00">⚠ 跨可用区调用</div>' : '');
}
```

在 showAppTab 函数里，tap 检查后新增：
```javascript
if (tabId === 'unified') renderUnified(context);
```

**验收**：
- 统一拓扑图能渲染
- 点节点/边能显示详情
- 模式切换图能更新

---

### 任务 P0-5：动效增强与过渡（2 小时）

**目标**：用 Motion One 给模式切换加动效，提升高级感  

在 app.html `<head>` 添加 Motion One：
```html
<script src="https://unpkg.com/motion@latest"></script>
```

在 app.html script 内，`setUnifiedMode` 函数改造：

```javascript
function setUnifiedMode(mode) {
  var oldMode = unifiedState.mode;
  unifiedState.mode = mode;
  
  document.querySelectorAll('.unified-mode-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  
  // 图容器淡出 -> 更新数据 -> 淡入（用 animate API）
  var graphEl = document.getElementById('unifiedGraph');
  if (window.animate) {
    animate(graphEl, { opacity: [1, 0.3] }, { duration: 150, easing: 'ease-out' })
      .then(function() {
        renderUnifiedGraph();
        return animate(graphEl, { opacity: [0.3, 1] }, { duration: 200, easing: 'ease-in' });
      });
  } else {
    // 降级：直接渲染
    renderUnifiedGraph();
  }
}
```

**验收**：
- 模式切换时图有淡出淡入动效
- 动效时长 < 500ms

---

### 任务 P0-6：Tab 入口与页面集成（2 小时）

**目标**：打通统一拓扑 tab 到应用页的快捷入口  

在 showAppTab 函数里修改（找到现有代码）：
```javascript
function showAppTab(tabId, context) {
  ['ai', 'perf', 'proto', 'trace', 'dep', 'unified'].forEach(function(t) {
    var el = document.getElementById('app-tab-' + t);
    if (el) el.style.display = t === tabId ? 'flex' : 'none';
    var btn = document.getElementById('ptab-' + t);
    if (btn) btn.classList.toggle('active', t === tabId);
  });
  if (tabId === 'perf') renderAppPerf(context);
  if (tabId === 'proto') renderProto(context);
  if (tabId === 'trace') renderTrace(context);
  if (tabId === 'dep') renderDep(context);
  if (tabId === 'unified') renderUnified(context);  // 新增
}
```

**验收**：
- app.html 能正常打开
- 点"统一拓扑" tab 能切换
- 三个模式都能正常显示

---

## P0 完成标准（第 4 天末）
- [x] 一个统一拓扑 tab 能切换三种模式
- [x] 能点节点/边看详情
- [x] 模式切换有动效
- [x] 能力条显示正确信息
- [x] 无 console 错误

**演示脚本**：  
1. 打开 app.html，进入"统一拓扑"
2. 依次点"网络视角""服务视角""融合视角"，观察图变化
3. 点图上的节点，右侧显示详情
4. 演讲：展示一套 UI 支持三种部署模式

---

## 阶段 P1：科技感增强（2 天）

### 任务 P1-1：WebGL 图引擎迁移（1 天）

**目标**：把 ECharts 换成 G6 WebGL 以支持大图和发光效果  

新建 `d:\coding\页面设计-pencil\ngpm-prototype\unified-topo-g6.js`：

```javascript
// 用 G6 渲染统一拓扑（WebGL 版本）
function initUnifiedGraphG6() {
  var container = document.getElementById('unifiedGraph');
  if (!container || !window.G6) return;
  
  var graphData = mapToGraphData(UNIFIED_TOPO_DATA, unifiedState.mode);
  
  unifiedChart = new G6.Graph({
    container: 'unifiedGraph',
    width: container.offsetWidth,
    height: container.offsetHeight,
    renderer: 'webgl',  // 切换到 WebGL
    fitView: true,
    layout: {
      type: 'dagre',  // 分层布局
      direction: 'LR',
      rankdir: 'LR',
      controlPoints: true
    },
    defaultNode: {
      type: 'circle',
      size: 40,
      style: {
        lineWidth: 2,
        stroke: '#fff'
      }
    },
    defaultEdge: {
      type: 'line',
      style: {
        opacity: 0.7,
        lineWidth: 2
      }
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node']
    }
  });
  
  // 节点样式映射
  graphData.nodes.forEach(function(n) {
    var color = n._node.health === 'ok' ? '#1A7F37' : 
                n._node.health === 'slow' ? '#D09B00' : '#CF222E';
    n.style = {
      fill: color,
      stroke: '#fff',
      lineWidth: 2,
      shadowBlur: 12,
      shadowColor: color + '66',
      shadowOffsetX: 0,
      shadowOffsetY: 0
    };
    n.label = n.name;
    n.labelCfg = { style: { fontSize: 10, fill: '#E6EDF3' } };
  });
  
  graphData.links.forEach(function(e) {
    var color = e._edge.status === 'ok' ? '#1A7F37' : 
                e._edge.status === 'slow' ? '#D09B00' : '#CF222E';
    e.style = {
      stroke: color,
      lineWidth: e._edge.crossZone ? 1 : 1.5,
      lineDash: e._edge.crossZone ? [5, 5] : undefined,
      shadowBlur: 6,
      shadowColor: color + '33'
    };
  });
  
  unifiedChart.data(graphData);
  unifiedChart.render();
  
  // 点击事件
  unifiedChart.on('node:click', function(e) {
    selectUnifiedNode(e.item.get('id'));
  });
  unifiedChart.on('edge:click', function(e) {
    selectUnifiedEdge(e.item.get('_edge'));
  });
}
```

在 app.html `renderUnified` 函数里改成调 G6 版本：
```javascript
function renderUnified(context) {
  if (unifiedState.initialized) return;
  unifiedState.capabilities = detectCapabilities();
  unifiedState.mode = inferModeFromCapabilities(unifiedState.capabilities);
  
  document.querySelectorAll('.unified-mode-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      setUnifiedMode(this.dataset.mode);
    });
  });
  
  updateCapabilityBadge();
  
  // 改成 G6 版本
  if (window.G6) {
    initUnifiedGraphG6();
  } else {
    renderUnifiedGraph();  // 降级到 ECharts
  }
  
  unifiedState.initialized = true;
}
```

**验收**：
- 图能用 WebGL 渲染（浏览器看不出来，但 console 无错）
- 节点有发光效果
- 性能明显提升（如果有大图）

---

### 任务 P1-2：动效和过渡优化（4 小时）

**目标**：增强模式切换、节点选中、异常路径高亮的动效  

在 `unified-topo.css` 添加：

```css
/* 节点发光动效 */
@keyframes node-glow {
  0%, 100% { filter: drop-shadow(0 0 6px currentColor); }
  50% { filter: drop-shadow(0 0 12px currentColor); }
}

.unified-graph-wrap .g6-node-selected {
  animation: node-glow 0.6s infinite;
}

/* 边脉冲 */
@keyframes edge-pulse {
  0%, 100% { opacity: 0.7; stroke-width: 1.5; }
  50% { opacity: 1; stroke-width: 2.5; }
}

.unified-graph-wrap .g6-edge-critical {
  animation: edge-pulse 0.8s infinite;
  stroke: #CF222E !important;
}

/* 详情面板弹入 */
@keyframes detail-slide-in {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.unified-detail {
  animation: detail-slide-in var(--duration-normal) var(--easing-smooth);
}

/* 模式切换按钮反馈 */
.unified-mode-btn.active {
  animation: pulse-btn 0.3s var(--easing-smooth);
}

@keyframes pulse-btn {
  0% { transform: scale(0.95); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

在 `selectUnifiedNode` 和 `selectUnifiedEdge` 函数里调 Motion One：

```javascript
function selectUnifiedNode(nodeId) {
  unifiedState.selectedNode = nodeId;
  unifiedState.selectedEdge = null;
  
  var node = UNIFIED_TOPO_DATA.nodes.find(function(n) { return n.id === nodeId; });
  if (!node) return;
  
  var dtName = document.getElementById('unifiedDtName');
  var dtBody = document.getElementById('unifiedDtBody');
  
  dtName.innerText = node.name + ' (' + node.type + ')';
  // ... 填充 dtBody
  
  // 动效：详情面板滑入
  if (window.animate) {
    animate(dtBody, { opacity: [0, 1], y: [10, 0] }, 
      { duration: 250, easing: 'ease-out' });
  }
}
```

**验收**：
- 选中节点时有发光脉冲
- 详情面板有进入动效
- 模式切换按钮有按下感

---

### 任务 P1-3：异常路径高亮与告警（4 小时）

**目标**：点异常节点/边时，自动高亮整条故障链路  

在 app.html 工具栏添加：
```html
<button class="btn-secondary" id="unifiedAnomalyBtn" style="font-size:12px">
  <span class="material-symbols-rounded">warning</span>高亮异常路径
</button>
```

在 app.html script 内新增：

```javascript
// 从选中节点反向追溯异常路径
function traceAnomalyPath(nodeId) {
  var visited = {};
  var path = [];
  
  function dfs(id) {
    if (visited[id]) return;
    visited[id] = true;
    path.push(id);
    
    // 找所有连接的边
    UNIFIED_TOPO_DATA.edges.forEach(function(e) {
      if ((e.source === id || e.target === id) && e.status !== 'ok') {
        var nextId = e.source === id ? e.target : e.source;
        dfs(nextId);
      }
    });
  }
  
  dfs(nodeId);
  return path;
}

// 高亮异常路径
function highlightAnomalyPath() {
  if (!unifiedState.selectedNode) {
    alert('请先选择一个节点');
    return;
  }
  
  var path = traceAnomalyPath(unifiedState.selectedNode);
  var btns = document.querySelectorAll('.unified-mode-btn');
  
  if (unifiedChart && unifiedChart.setItemState) {
    // 清除所有状态
    unifiedChart.getNodes().forEach(function(n) {
      unifiedChart.setItemState(n, '', false);
    });
    unifiedChart.getEdges().forEach(function(e) {
      unifiedChart.setItemState(e, '', false);
    });
    
    // 高亮路径
    path.forEach(function(id) {
      var node = unifiedChart.findById(id);
      if (node) unifiedChart.setItemState(node, 'highlight', true);
    });
  }
}

document.getElementById('unifiedAnomalyBtn').addEventListener('click', highlightAnomalyPath);
```

**验收**：
- 点"高亮异常路径"能显示故障链
- 链路上的节点都被高亮

---

## P1 完成标准（第 6 天末）
- [x] WebGL 图渲染能用
- [x] 动效流畅无卡顿
- [x] 异常路径能高亮

---

## 阶段 P2：评审与优化（2 天）

### 任务 P2-1：演示数据完善（4 小时）

**目标**：增加更多业务场景数据，做真实感演示  

在 `unified-topo.data.js` 新增第二套场景（会员系统）：

```javascript
var UNIFIED_TOPO_DATA_MEMBER = {
  // 会员系统的融合拓扑数据
  // 结构同 UNIFIED_TOPO_DATA
};

// 场景切换函数
function switchUnifiedScenario(scenario) {
  if (scenario === 'ecom') {
    window.UNIFIED_TOPO_DATA = /* ecom 数据 */;
  } else if (scenario === 'member') {
    window.UNIFIED_TOPO_DATA = /* member 数据 */;
  }
  renderUnifiedGraph();
}
```

**验收**：
- 至少 3 个业务场景可演示
- 每个场景都有 span_only / ebpf_only / fusion 三种数据

---

### 任务 P2-2：文档与交付清单（4 小时）

**目标**：出一份能给评审看的文档  

新建 `d:\coding\页面设计-pencil\ngpm-prototype\UNIFIED_TOPO_DEMO.md`：

```markdown
# 统一拓扑视角演示文档

## 核心设计思想
一套 UI 支持三种部署形态：
- 仅 span：网络拓扑视角
- 仅 eBPF：服务依赖视角
- 双数据源：融合拓扑视角

## 演示路径

### 演示 1：网络视角（仅 span）
1. 打开 app.html → 统一拓扑 Tab
2. 选择"网络视角"模式
3. 观察：只显示网络层 + 部分服务
4. 价值：运维人员能快速看链路风险

### 演示 2：服务视角（仅 eBPF）
1. 选择"服务视角"模式
2. 观察：只显示服务 + 数据库，无网络设备
3. 点 order-service 节点 → 右侧显示错误率
4. 价值：开发人员能快速看调用异常

### 演示 3：融合视角
1. 选择"融合视角"模式
2. 点"高亮异常路径" → 跨层链路被标红
3. 点异常边（如 order-service → inventory-service）
4. 右侧显示"⚠ 跨可用区调用"提示
5. 价值：整个故障路径一目了然

## 技术亮点
- WebGL 图渲染（支持千级节点）
- 分层布局（网络/服务/基础设施清晰分离）
- 动效过渡（模式切换有视觉反馈）
- 跨层根因链路（融合优势充分体现）

## 部署意义
- **只部署 span**：运维看网络流量和拓扑
- **只部署 eBPF**：应用团队看服务调用和延迟
- **两者都部署**：可全面诊断从网络到应用的故障

---
```

**验收**：
- 演示文档能打印/导出
- 三条演示路径都能跑通

---

### 任务 P2-3：Pencil 设计图评审稿（4 小时）

**目标**：用 Pencil 出一张设计稿，供非技术评审  

（这部分需要进入 Pencil 工具，下一步）

**验收**：
- Pencil 设计图能清晰表达三种模式
- 能印出来放在 PPT

---

## 时间表总结

| 阶段 | 日期 | 工作量 | 产出 |
|------|------|--------|------|
| P0-1 | 第1天 | 4h | 容器 + 工具栏 |
| P0-2 | 第1天 | 3h | 状态机 |
| P0-3 | 第2天 | 4h | 数据模型 |
| P0-4 | 第2天 | 4h | 图渲染 + 交互 |
| P0-5 | 第3天 | 2h | 动效 |
| P0-6 | 第3天 | 2h | Tab 集成 |
| **P0 小计** | | **19h** | **可演示的三模式切换** |
| P1-1 | 第4天 | 8h | WebGL 图引擎 |
| P1-2 | 第5天 | 4h | 动效优化 |
| P1-3 | 第5天 | 4h | 异常路径高亮 |
| **P1 小计** | | **16h** | **科技感强化** |
| P2-1 | 第6天 | 4h | 演示数据 |
| P2-2 | 第6天 | 4h | 演示文档 |
| P2-3 | 第7-8天 | 8h | Pencil 设计评审 |
| **P2 小计** | | **16h** | **评审和交付** |
| **总计** | | **51h** | |

---

## 风险与应对

| 风险 | 概率 | 应对 |
|------|------|------|
| G6 WebGL 兼容性问题 | 中 | 预留 ECharts 降级方案 |
| 大图性能不达预期 | 低 | P0 定死节点数，P1 后做聚合 |
| Motion One 加载失败 | 低 | 降级到纯 CSS transition |
| 评审反馈需调整 | 高 | P2 预留 1 天灵活时间 |

---

## 验收清单

### P0 验收（第4天）
- [ ] 三个模式能正常切换
- [ ] 每种模式数据正确显示
- [ ] 点节点/边能看详情
- [ ] 无 console 错误
- [ ] 能启动演示脚本

### P1 验收（第6天）
- [ ] WebGL 图能渲染
- [ ] 异常路径能高亮
- [ ] 动效流畅

### P2 验收（第8天）
- [ ] 演示文档完整
- [ ] Pencil 设计稿出稿
- [ ] 可交付评审版本

---

## 后续建议

P2 完成后，建议按这个顺序继续：
1. **P3（1-2周）**：接后端真实 span + eBPF 数据
2. **P4（1周）**：加入时间窗回放和异常根因排序
3. **P5（2周）**：集成到生产环境，上线 A/B 测试
