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

// truncated backup intentionally kept only needed current version snapshot
