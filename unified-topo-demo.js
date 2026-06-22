// unified-topo-demo.js — 业务请求路径拓扑（演示版）重写
// 三种模式: fusion=全链路请求路径, span=网络拓扑, ebpf=服务依赖图

var unifiedState = { mode: 'fusion' };

function setUnifiedMode(mode) {
  unifiedState.mode = mode;
  document.querySelectorAll('.unified-mode-btn').forEach(function(b){b.classList.toggle('active',b.dataset.mode===mode);});
  updateCapabilityBadge(); renderUnifiedGraph();
}
function unifiedFilter() {}
function updateCapabilityBadge() {
  var t={fusion:'全栈融合视图',span:'SPAN · 网络拓扑',ebpf:'eBPF · 服务依赖'};
  var el=document.getElementById('capabilityText'); if(el) el.textContent=t[unifiedState.mode]||t.fusion;
}
function renderUnified() { closeUnifiedDetail(); renderUnifiedGraph(); }

function renderUnifiedGraph() {
  var el=document.getElementById('unifiedChart'); if(!el) return;
  if(typeof echarts!=='undefined'){
    ['unifiedChart','svcEChart','fusionSvcChart'].forEach(function(id){
      var dom=document.getElementById(id); if(dom){var i=echarts.getInstanceByDom(dom);if(i)i.dispose();}
    });
  }
  el.style.background='#070B14'; el.style.overflow='auto';
  el.innerHTML = unifiedState.mode==='span' ? buildNetwork() : unifiedState.mode==='ebpf' ? buildService() : buildFusion();
  el.querySelectorAll('[data-tid]').forEach(function(n){
    n.style.cursor='pointer';
    n.addEventListener('click',function(e){e.stopPropagation();showTopoDetail(this.getAttribute('data-tid'));});
  });
  if(unifiedState.mode==='ebpf') setTimeout(initSvcEChart, 30);
  if(unifiedState.mode==='fusion') setTimeout(initFusionSvcChart, 30);
}

// ──────────── 融合全链路视图：上层网络路径 + 下层服务图 ─────────────────
function buildFusion(){
  var zones = [
    {label:'客户端',sub:'DNS ⚠',tid:'browser',status:'warn',arrSlow:false},
    {label:'接入层',sub:'LB · WAF',tid:'lb1',status:'ok',arrSlow:false},
    {label:'WEB 层',sub:'IIS · TCP/IP',tid:'web-zone',status:'ok',arrSlow:false},
    {label:'内网',sub:'LB · 防火墙',tid:'fw2',status:'ok',arrSlow:true},
    {label:'APP 层',sub:'WAS · Thread Pool',tid:'app-zone',status:'warn',arrSlow:false},
    {label:'数据库',sub:'5种DB · InvDB✗',tid:'inv-db',status:'error',arrSlow:false},
  ];
  var strip = '<div class="topo-fusion-net"><div class="topo-fusion-net-strip">';
  zones.forEach(function(z, i){
    var c = z.status==='error'?'#F85149':z.status==='warn'?'#E3B341':'#3FB950';
    strip += '<div class="topo-fusion-zone-chip" data-tid="'+z.tid+'" style="border-color:'+c+'88;background:'+c+'12;">';
    strip += '<div class="topo-fusion-zone-chip-lbl" style="color:'+c+';">'+z.label+'</div>';
    strip += '<div class="topo-fusion-zone-chip-sub">'+z.sub+'</div></div>';
    if(i < zones.length-1){
      var ac = z.arrSlow?'#E3B341':'rgba(255,255,255,0.35)';
      strip += '<div class="topo-fusion-arr" style="color:'+ac+'">→</div>';
    }
  });
  strip += '</div></div>';
  var sep = '<div class="topo-fusion-sep"><div class="topo-fusion-sep-line"></div><span class="topo-fusion-sep-txt">↓ 服务调用依赖图（eBPF + SPAN）</span><div class="topo-fusion-sep-line"></div></div>';
  return d('topo-cvs', topBar('全链路追踪 · eBPF + SPAN 融合 · 告警: InventoryDB P99 1,200ms','warn') + strip + sep + '<div id="fusionSvcChart" style="flex:1;min-height:0;"></div>');
}

// ──────────── 网络拓扑视图 ────────────────────
function buildNetwork(){
  return d('topo-cvs', topBar('网络拓扑 · SPAN 数据源 · DNS 解析抖动告警','warn')+
    d('topo-flow topo-flow-center', zoneClient()+conn('2.5k/s','RTT 8ms','')+
      nzone('接入安全层',[nd('lb1','LB','swap_horiz','#0969DA','ok'),nd('fw1','防火墙','security','#BC4C00','ok'),nd('waf1','WAF','shield','#BC4C00','ok')],[['丢包率','0%'],['带宽','2.1 Gbps']])+
      conn('1.8k/s','RTT 4ms','')+
      srvBox('web-net','WEB 集群',[nd('web1','web-01','dns','#6E40C9','ok'),nd('web2','web-02','dns','#6E40C9','ok')],[['P99','85ms'],['错误率','0.1%']])+
      conn('1.8k/s','RTT 3ms','')+
      nzone('内网安全',[nd('fw2','防火墙','security','#BC4C00','ok'),nd('lb2','内网LB','swap_horiz','#0969DA','ok')],[['丢包率','0%']])+
      conn('1.2k/s','RTT 5ms','slow')+
      srvBox('app-net','APP 集群',[nd('app1','app-01','dns','#6E40C9','warn'),nd('app2','app-02','dns','#6E40C9','ok')],[['P99','450ms ⚠'],['错误率','0.05%']])+
      conn('1.2k/s','RTT 2ms','')+zoneDb()));
}

// ──────────── 服务依赖拓扑（ECharts）────────────────────
function buildService(){
  return d('topo-cvs', topBar('服务依赖拓扑 · eBPF 数据源 · inv-svc → InventoryDB 异常','error') +
    '<div id="svcEChart" style="flex:1;min-height:0;"></div>');
}

// ──────────── ECharts 服务调用图数据和初始化 ───────────────
var SVC_TOPO = {
  nodes:[
    {id:'api-gw',  name:'API Gateway',    health:'ok',    p99:48,   rps:2500, x:420, y:40},
    {id:'order-svc',name:'Order Service', health:'ok',    p99:120,  rps:1800, x:240, y:160},
    {id:'user-svc', name:'User Service',  health:'ok',    p99:85,   rps:500,  x:600, y:160},
    {id:'inv-svc',  name:'Inventory Svc', health:'slow',  p99:450,  rps:1200, x:100, y:290},
    {id:'pay-svc',  name:'Payment Svc',   health:'ok',    p99:280,  rps:900,  x:310, y:290},
    {id:'redis',    name:'Redis Cache',   health:'ok',    p99:8,    rps:3000, x:480, y:290},
    {id:'user-db',  name:'UserDB',        health:'ok',    p99:18,   rps:800,  x:640, y:290},
    {id:'inv-db',   name:'InventoryDB',   health:'error', p99:1200, rps:1200, x:130, y:420},
    {id:'pay-db',   name:'PaymentDB',     health:'ok',    p99:22,   rps:900,  x:340, y:420},
  ],
  edges:[
    {src:'api-gw',   tgt:'order-svc', qps:1800, p99:120,  status:'ok'},
    {src:'api-gw',   tgt:'user-svc',  qps:500,  p99:85,   status:'ok'},
    {src:'order-svc',tgt:'inv-svc',   qps:1200, p99:450,  status:'slow'},
    {src:'order-svc',tgt:'pay-svc',   qps:900,  p99:280,  status:'ok'},
    {src:'order-svc',tgt:'redis',     qps:3000, p99:8,    status:'ok'},
    {src:'user-svc', tgt:'user-db',   qps:800,  p99:18,   status:'ok'},
    {src:'inv-svc',  tgt:'inv-db',    qps:1200, p99:1200, status:'error'},
    {src:'pay-svc',  tgt:'pay-db',    qps:900,  p99:22,   status:'ok'},
  ]
};

function buildSvcChartOpt(bgTransparent){
  var sc = {ok:'#3FB950', slow:'#E3B341', error:'#F85149'};
  var nodes = SVC_TOPO.nodes.map(function(n){
    var c = sc[n.health];
    return {
      id:n.id, name:n.name, x:n.x, y:n.y, symbolSize:50,
      itemStyle:{
        color:'rgba(12,18,32,0.9)', borderColor:c, borderWidth:2.5,
        shadowBlur: n.health==='ok' ? 4 : 16,
        shadowColor: c + (n.health==='ok' ? '55' : 'CC')
      },
      label:{show:true, position:'bottom', distance:6, color:'#E8EFF7', fontSize:11, fontWeight:700},
      _n:n
    };
  });
  var links = SVC_TOPO.edges.map(function(e){
    var c = sc[e.status];
    var lbl = e.qps+'/s · '+e.p99+'ms';
    return {
      source:e.src, target:e.tgt,
      lineStyle:{color:c, width:e.status==='ok'?1.8:2.8, opacity:0.9, curveness:0.08},
      label:{show:true, formatter:lbl, fontSize:9, color:c, fontWeight:700,
        backgroundColor:'rgba(7,11,20,0.88)', padding:[2,5], borderRadius:3},
      emphasis:{lineStyle:{width:4, opacity:1}},
      _e:e
    };
  });
  return {
    backgroundColor: bgTransparent ? 'transparent' : '#070B14',
    tooltip:{trigger:'item', confine:true,
      backgroundColor:'rgba(12,18,32,0.95)', borderColor:'rgba(255,255,255,0.1)', borderWidth:1,
      textStyle:{color:'#E8EFF7', fontSize:12},
      formatter:function(p){
        if(p.dataType==='node'){var n=p.data._n; var c=sc[n.health]; return '<b>'+n.name+'</b><br>RPS '+n.rps+' · P99 <b style="color:'+c+'">'+n.p99+'ms</b>';}
        if(p.dataType==='edge'){var e=p.data._e; return '<b>'+e.src+' → '+e.tgt+'</b><br>QPS '+e.qps+'/s · P99 '+e.p99+'ms';}
      }
    },
    series:[{
      type:'graph', layout:'none', roam:true, draggable:false,
      edgeSymbol:['none','arrow'], edgeSymbolSize:9,
      data:nodes, links:links,
      emphasis:{focus:'adjacency', scale:false, lineStyle:{width:4}}
    }]
  };
}

function initSvcEChart(){
  var el = document.getElementById('svcEChart');
  if(!el || typeof echarts==='undefined') return;
  var c = echarts.init(el);
  c.setOption(buildSvcChartOpt(false));
  c.on('click',function(p){if(p.dataType==='node') showTopoDetail(p.data.id);});
}

function initFusionSvcChart(){
  var el = document.getElementById('fusionSvcChart');
  if(!el || typeof echarts==='undefined') return;
  var c = echarts.init(el);
  c.setOption(buildSvcChartOpt(true));
  c.on('click',function(p){if(p.dataType==='node') showTopoDetail(p.data.id);});
}

// ──────────── Zone 构建 ───────────────────────
function zoneClient(){
  return d('topo-zone', nd('browser','浏览器','computer','#8B949E','ok')+nd('mobile','手机','smartphone','#8B949E','ok')+'<div class="topo-zone-sep"></div>'+nd('dns','DNS','dns','#E3B341','warn','<div class="topo-warn-tag">!</div>'));
}
function zoneAccess(){return nzone('接入层',[nd('lb1','LB','swap_horiz','#0969DA','ok'),nd('fw1','防火墙','security','#BC4C00','ok'),nd('waf1','WAF','shield','#BC4C00','ok')],[]);}
function zoneMidNet(){return nzone('内网',[nd('fw2','防火墙','security','#BC4C00','ok'),nd('lb2','LB','swap_horiz','#0969DA','ok')],[]);}
function zoneWebSvr(){
  return '<div class="topo-zone topo-zone-srv" data-tid="web-zone"><div class="topo-zone-lbl">WEB 服务器</div><div class="topo-srv-layers">'+
    codeLyr(['函数2','函数1','函数3','函数4'],'ok')+layer('IIS Native Pipeline','ok')+layer('TCP/IP 协议栈','ok')+
    '</div><div class="topo-zone-nics">'+nic()+nic()+'</div></div>';
}
function zoneAppSvr(){
  return '<div class="topo-zone topo-zone-srv" data-tid="app-zone"><div class="topo-zone-lbl">APP 服务器</div><div class="topo-srv-layers">'+
    codeLyr(['函数2','函数1','函数3'],'warn')+layer('WAS JVM','warn')+layer('WAS Thread Pool','warn')+layer('Apache','ok')+layer('TCP/IP 协议栈','ok')+
    '</div><div class="topo-zone-nics">'+nic()+nic()+'</div></div>';
}
function zoneDb(){
  return '<div class="topo-zone topo-zone-db"><div class="topo-zone-lbl">数据库</div><div class="topo-db-list">'+
    dbi('pg-db','PostgreSQL','ok','25ms')+dbi('mssql-db','SQL Server','ok','22ms')+dbi('mysql-db','MySQL','ok','18ms')+dbi('oracle-db','Oracle','ok','28ms')+dbi('inv-db','InventoryDB','error','1,200ms')+
    '</div></div>';
}

// ──────────── 组件辅助 ─────────────────────────
function d(cls,inner){return '<div class="'+cls+'">'+inner+'</div>';}
function sp(w){return '<span style="display:inline-block;width:'+w+'px;flex-shrink:0"></span>';}
function topBar(msg,level){
  var c=level==='error'?'#F85149':'#E3B341';
  return '<div class="topo-topbar"><span class="topo-topbar-title">业务请求路径</span><span class="topo-topbar-alert" style="color:'+c+'"><span style="width:7px;height:7px;border-radius:50%;background:'+c+';display:inline-block;margin-right:6px;vertical-align:middle;"></span>'+msg+'</span><div class="topo-legend"><span class="topo-leg topo-leg-req">请求 →</span><span class="topo-leg topo-leg-res">← 响应</span></div></div>';
}
function conn(qps,lat,status){
  var cls=status==='slow'?'topo-conn-slow':status==='error'?'topo-conn-error':'';
  return '<div class="topo-conn '+cls+'"><div class="topo-conn-req">▶</div><div class="topo-conn-metrics">'+qps+'<br>'+lat+'</div><div class="topo-conn-res">◀</div></div>';
}
function nd(id,label,icon,color,status,extra){
  var sc=status==='error'?'#F85149':status==='warn'?'#E3B341':'#3FB950';
  return '<div class="topo-nd" data-tid="'+id+'"><div class="topo-nd-ico" style="background:'+color+'22;border:1.5px solid '+color+';box-shadow:0 0 8px '+color+'44;"><span class="material-symbols-rounded" style="color:'+color+';font-size:16px">'+icon+'</span></div><div class="topo-nd-lbl">'+label+'</div><div class="topo-nd-dot" style="background:'+sc+';box-shadow:0 0 4px '+sc+'"></div>'+(extra||'')+'</div>';
}
function nzone(title,nodes,kpis){
  var kh=kpis.map(function(k){return '<span class="topo-kpi">'+k[0]+' <b>'+k[1]+'</b></span>';}).join('');
  return '<div class="topo-zone">'+(title?'<div class="topo-zone-lbl">'+title+'</div>':'')+
    '<div class="topo-zone-nodes">'+nodes.join('')+'</div>'+(kpis.length?'<div class="topo-kpi-row">'+kh+'</div>':'')+
    '</div>';
}
function srvBox(id,title,nodes,kpis){
  var kh=kpis.map(function(k){var w=k[1].indexOf('⚠')>-1;return '<span class="topo-kpi">'+k[0]+' <b'+(w?' class="warn"':'')+'>'+k[1]+'</b></span>';}).join('');
  return '<div class="topo-zone" data-tid="'+id+'"><div class="topo-zone-lbl">'+title+'</div><div class="topo-zone-nodes topo-zone-nodes-row">'+nodes.join('')+'</div><div class="topo-kpi-row">'+kh+'</div></div>';
}
function layer(label,status){
  var sc={ok:'#3FB950',warn:'#E3B341',error:'#F85149'}[status]||'#3FB950';
  return '<div class="topo-layer" style="border-left-color:'+sc+'"><span class="topo-layer-lbl">'+label+'</span><span class="topo-layer-dot" style="background:'+sc+'"></span></div>';
}
function codeLyr(fns,status){
  var sc=status==='ok'?'#3FB950':'#E3B341';
  var fh=fns.map(function(f,i){return (i>0?'<span class="topo-fn-arr">→</span>':'')+'<div class="topo-fn">'+f+'</div>';}).join('');
  return '<div class="topo-layer topo-layer-code" style="border-left-color:'+sc+'"><div class="topo-layer-lbl">代码执行</div><div class="topo-fn-row">'+fh+'</div></div>';
}
function nic(){return '<div class="topo-nic"><span class="material-symbols-rounded">settings_ethernet</span></div>';}
function dbi(id,name,status,p99){
  var sc=status==='error'?'#F85149':'#3FB950';
  return '<div class="topo-dbi '+(status==='error'?'topo-dbi-err':'')+'" data-tid="'+id+'" style="border-color:'+sc+'33"><span class="material-symbols-rounded" style="color:'+sc+';font-size:14px">storage</span><span class="topo-dbi-name">'+name+'</span><span class="topo-dbi-p99" style="color:'+sc+'">'+p99+'</span></div>';
}
function svcNd(id,name,status,qps,p99,err,src){
  var sc={ok:'#3FB950',slow:'#E3B341',error:'#F85149'}[status]||'#8B949E';
  var p99n=parseFloat(p99.replace(',',''));
  var p99c=p99n>500?'#F85149':p99n>200?'#E3B341':'#3FB950';
  var ec=parseFloat(err)>1?'#F85149':parseFloat(err)>0?'#E3B341':'#8B949E';
  return '<div class="topo-svc-nd" data-tid="'+id+'" style="border-color:'+sc+'55;box-shadow:0 0 10px '+sc+'20"><div class="topo-svc-ndname">'+name+'</div><div class="topo-svc-ndmetrics"><span class="topo-svc-qps">'+qps+'/s</span><span style="color:'+p99c+'">'+p99+'</span><span style="color:'+ec+'">'+err+' err</span></div><span class="topo-src '+src+'">'+src+'</span></div>';
}
function svcArr(qps,status){
  var c={error:'#F85149',slow:'#E3B341'}[status]||'#3FB950';
  return '<div class="topo-svc-arr"><span class="topo-svc-arrlbl" style="color:'+c+'">'+qps+'/s</span><span class="topo-svc-arricon" style="color:'+c+'">↓</span></div>';
}

// ──────────── 详情面板 ─────────────────────────
var TOPO_DETAIL = {
  'browser':   ['浏览器',             [['并发用户','2,450'],['协议','HTTPS/H2'],['状态','正常']]],
  'mobile':    ['手机客户端',          [['并发用户','1,200'],['协议','HTTPS/H2'],['状态','正常']]],
  'dns':       ['DNS 解析器 ⚠',        [['状态','告警'],['P99 延迟','45ms (正常 <5ms)'],['根因','BJ 递归节点高负载'],['影响','首次连接延迟 +40ms']]],
  'lb1':       ['公网负载均衡',        [['QPS','2,500/s'],['P99','12ms'],['活跃连接','18,450']]],
  'fw1':       ['防火墙 (公网)',        [['状态','正常'],['今日拦截','1,250 次'],['规则版本','v4.2']]],
  'waf1':      ['WAF',                 [['状态','正常'],['CC 防护','启用'],['今日拦截','320 次']]],
  'fw2':       ['防火墙 (内网)',        [['状态','正常'],['策略','ACL + 微隔离']]],
  'lb2':       ['内网负载均衡',        [['QPS','1,800/s'],['P99','8ms'],['状态','正常']]],
  'web-zone':  ['WEB 服务器',          [['CPU','35%'],['内存','2.1G/4G'],['P99','85ms'],['错误率','0.1%']]],
  'app-zone':  ['APP 服务器 ⚠',        [['CPU','72% ⚠'],['内存','6.8G/8G ⚠'],['P99','450ms ⚠'],['WAS 线程','85/100 ⚠'],['根因推测','WAS 线程池接近饱和']]],
  'inv-db':    ['InventoryDB ✕',       [['状态','异常'],['P99','1,200ms'],['错误率','8.5%'],['磁盘 I/O','98% (饱和)'],['活跃连接','48/50'],['根因','磁盘 I/O 瓶颈']]],
  'pg-db':     ['PostgreSQL',          [['P99','25ms'],['连接池','18/50'],['状态','正常']]],
  'mssql-db':  ['SQL Server',          [['P99','22ms'],['状态','正常']]],
  'mysql-db':  ['MySQL',               [['P99','18ms'],['状态','正常']]],
  'oracle-db': ['Oracle',              [['P99','28ms'],['状态','正常']]],
  'api-gw':    ['API Gateway',         [['QPS','2,500/s'],['P99','48ms'],['错误率','0%']]],
  'order-svc': ['Order Service',       [['QPS','1,800/s'],['P99','120ms'],['错误率','0.1%'],['数据源','SPAN']]],
  'inv-svc':   ['Inventory Service ⚠', [['QPS','1,200/s'],['P99','450ms ⚠'],['下游异常','InventoryDB P99 1,200ms']]],
  'pay-svc':   ['Payment Service',     [['QPS','900/s'],['P99','280ms'],['错误率','0.02%']]],
  'user-svc':  ['User Service',        [['QPS','500/s'],['P99','85ms'],['错误率','0%']]],
  'redis':     ['Redis Cache',         [['QPS','3,000/s'],['P99','8ms'],['命中率','98.2%']]],
  'user-db':   ['UserDB',              [['QPS','800/s'],['P99','18ms'],['状态','正常']]],
  'pay-db':    ['PaymentDB',           [['QPS','900/s'],['P99','22ms'],['状态','正常']]],
  'web-net':   ['WEB 服务器集群',      [['节点数','2'],['P99','85ms'],['CPU 均值','35%']]],
  'app-net':   ['APP 服务器集群 ⚠',    [['节点数','2'],['P99','450ms ⚠'],['CPU 均值','72% ⚠']]],
};

function showTopoDetail(id){
  var data=TOPO_DETAIL[id],panel=document.getElementById('unifiedDetailPanel'),content=document.getElementById('unifiedDetailContent');
  if(!panel||!content)return;
  if(!data){content.innerHTML='<div style="color:rgba(255,255,255,0.35);font-size:12px">暂无数据</div>';}
  else{
    var html='<div class="unified-dt-name">'+data[0]+'</div>';
    data[1].forEach(function(m){html+='<div class="unified-dt-row"><div class="unified-dt-label">'+m[0]+'</div><div class="unified-dt-value">'+m[1]+'</div></div>';});
    content.innerHTML=html;
  }
  panel.classList.remove('unified-detail-hidden'); panel.classList.add('unified-detail-visible');
}
function closeUnifiedDetail(){
  var panel=document.getElementById('unifiedDetailPanel'); if(!panel)return;
  panel.classList.add('unified-detail-hidden'); panel.classList.remove('unified-detail-visible');
}

// ──── 占位变量（兼容旧版 resize handler） ────
var unifiedChart = null;
var unifiedData = {};

// 以下旧版函数保留签名供 app.html 兼容调用，实际由上面函数接管
function selectUnifiedNode() {}
function selectUnifiedEdge() {}
// END OF FILE
