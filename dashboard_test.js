/* ══════════════════════════════════════════════════════════
   NGPM Dashboard �?dashboard.js
   演示数据 · 角色切换 · 告警抽屉 · AI Copilot
══════════════════════════════════════════════════════════ */

// ── 演示数据 ─────────────────────────────────────────────

const RAW_ALERTS = [
  { time: '14:23:07', sev: 'CRIT', src: '网管系统', device: 'SW-Core-02', msg: 'CPU 利用�?89%（阈�?80%�? },
  { time: '14:23:09', sev: 'WARN', src: '网管系统', device: 'SW-Core-02', msg: 'Gi1/0/1 输出错误�?2.3%' },
  { time: '14:23:09', sev: 'WARN', src: '网管系统', device: 'SW-Core-02', msg: 'Gi1/0/2 输出错误�?1.8%' },
  { time: '14:23:09', sev: 'WARN', src: '网管系统', device: 'SW-Core-02', msg: 'Gi1/0/3 输出错误�?2.1%' },
  { time: '14:23:10', sev: 'WARN', src: '网管系统', device: 'SW-Core-02', msg: 'Gi1/0/4 输出错误�?1.6%' },
  { time: '14:23:11', sev: 'WARN', src: '云监�?, device: 'VM-047', msg: '心跳延迟超阈值（240ms > 100ms�? },
  { time: '14:23:11', sev: 'WARN', src: '云监�?, device: 'VM-051', msg: '心跳延迟超阈值（270ms > 100ms�? },
  { time: '14:23:11', sev: 'WARN', src: '云监�?, device: 'VM-063', msg: '心跳延迟超阈值（310ms > 100ms�? },
  { time: '14:23:12', sev: 'CRIT', src: '动环监控', device: 'PAC-B06', msg: '精密空调控制器失�? },
  { time: '14:23:12', sev: 'CRIT', src: '动环监控', device: 'TMP-B06-1', msg: '机柜温度 38.2°C（阈�?32°C�? },
  { time: '14:23:14', sev: 'WARN', src: '云监�?, device: 'VM-071', msg: '迁移任务超时' },
  { time: '14:23:14', sev: 'WARN', src: '云监�?, device: 'VM-082', msg: '迁移任务超时' },
  { time: '14:23:15', sev: 'WARN', src: '网管系统', device: 'ACC-B01', msg: 'VLAN100 转发延迟 +340ms' },
  { time: '14:23:15', sev: 'WARN', src: '网管系统', device: 'ACC-B02', msg: 'VLAN100 转发延迟 +340ms' },
  { time: '14:23:16', sev: 'WARN', src: '云监�?, device: 'VM-091', msg: '心跳延迟超阈�? },
  { time: '14:23:16', sev: 'WARN', src: '云监�?, device: 'VM-095', msg: '心跳延迟超阈�? },
  { time: '14:23:17', sev: 'WARN', src: '服务器监�?, device: 'APP-SRV-01', msg: 'ERP P99 响应时间 2,100ms' },
  { time: '14:23:18', sev: 'WARN', src: '服务器监�?, device: 'APP-SRV-02', msg: 'ERP 数据库连接池告警' },
  { time: '14:23:19', sev: 'INFO', src: '云监�?, device: 'VM-CLST-B', msg: '集群可用性进入告警状�? },
  { time: '14:23:21', sev: 'WARN', src: '网管系统', device: 'SW-Core-02', msg: '内存利用�?94%（基�?45%�? },
];

const AI_EVENTS = [
  {
    id: '#001', sev: '🔴', type: '根因', cls: 'aie-root',
    title: 'PAC-B06 精密空调制冷异常',
    conf: '96%',
    chain: [
      { icon: 'thermostat', text: '温度传感�?TMP-B06-1 �?38.2°C（阈�?32°C�?| 14:21:03' },
      { icon: 'power_off', text: '空调控制�?PAC-B06 停止响应 | 14:22:17' },
      { icon: 'device_thermostat', text: 'SW-Core-02 触发热降频保护，CPU 34%�?9% | 14:23:07' },
    ],
    impact: '影响�?台核心交换机 · VLAN100 · 14台VM · ERP系统',
  },
  {
    id: '#002', sev: '🟠', type: '影响', cls: 'aie-impact',
    title: 'SW-Core-02 热降频导�?VLAN100 转发能力下降',
    conf: '94%',
    chain: [
      { icon: 'trending_up', text: '关联于事�?#001（空调故障）' },
      { icon: 'network_check', text: 'VLAN100 转发延迟 +340ms · 3个接口错误率上升' },
    ],
    impact: '影响：ACC-B01 / ACC-B02 / 下联 VM 集群',
  },
  {
    id: '#003', sev: '�?, type: '影响', cls: 'aie-impact',
    title: '云平�?VM 集群迁移任务堆积',
    conf: '89%',
    chain: [
      { icon: 'link', text: '关联于事�?#002（VLAN100 延迟�? },
      { icon: 'warning', text: '14台VM迁移挂起 · ERP p99: 2,100ms' },
    ],
    impact: '业务影响：ERP 3个部门，响应超阈�?,
  },
  {
    id: '#004', sev: '🔴', type: '根因', cls: 'aie-root',
    title: 'CRM 集群 CPU 持续高负�?,
    conf: '91%',
    chain: [
      { icon: 'memory', text: 'APP-SRV-01/02 CPU 均�?94%，持续超 80% SLA 阈�?| 14:18:00' },
      { icon: 'database', text: 'CRM 数据库连接池达上限（500/500）| 14:19:33' },
      { icon: 'speed', text: 'CRM P99 响应时间 2,100ms（基�?65ms）| 14:20:10' },
    ],
    impact: '影响：CRM 业务 3 个部门，218ms 响应时间上升 3.2�?,
  },
  {
    id: '#005', sev: '🟡', type: '影响', cls: 'aie-impact',
    title: '存储�?IO 延迟升高',
    conf: '82%',
    chain: [
      { icon: 'link', text: '关联于事�?#004（CPU 高负载）' },
      { icon: 'storage', text: '存储�?IOPS 超阈�?· 平均延迟 45ms（基�?8ms�? },
    ],
    impact: '影响：VM-CLST-B 存储访问，数据库写入延迟',
  },
  {
    id: '#006', sev: '🟡', type: '预警', cls: 'aie-impact',
    title: '出口带宽 48h 容量预警',
    conf: '88%',
    chain: [
      { icon: 'show_chart', text: 'AI 预测出口带宽将于 48h 内达�?91% 利用�? },
      { icon: 'schedule', text: '当前峰�?82%，趋势持续上�?| 历史同期 +18%' },
    ],
    impact: '潜在影响：业务高峰期带宽瓶颈，建议提前扩�?,
  },
  {
    id: '#007', sev: '🔴', type: '安全', cls: 'aie-root',
    title: '疑似 DNS 隧道 C2 外连行为',
    conf: '93%',
    chain: [
      { icon: 'security', text: 'VM-Prod-047 向境�?IP 发起异常 DNS 查询 · 频率 420�?�?| 14:10:05' },
      { icon: 'block', text: 'AI 自动隔离 VM-Prod-047，切断外�?| 14:10:38' },
      { icon: 'policy', text: '同批次镜�?2 �?VM 待确认排�? },
    ],
    impact: '安全影响：高�?· 已隔离，待扩大排�?,
  },
  {
    id: '#008', sev: '🟡', type: '预警', cls: 'aie-impact',
    title: '存储池剩余空间预�?,
    conf: '95%',
    chain: [
      { icon: 'storage', text: '当前存储池剩�?26%�?.8TB / 10.8TB�? },
      { icon: 'trending_down', text: 'AI 预测 38 天后触警�?20%）�?增速加�?12%/�? },
    ],
    impact: '影响：VM 新建 / 快照操作受阻，建议本月申请扩�?,
  },
  {
    id: '#009~023', sev: '�?, type: '低级�?, cls: 'aie-info',
    title: '其余 15 个低级别事件（已自动处置�?,
    conf: '�?,
    chain: [
      { icon: 'check_circle', text: '接口 CRC 错误 × 4 · 日志量超阈�?× 3 · 性能基线偏移 × 8' },
      { icon: 'auto_fix_high', text: 'AI 已自动收敛，无业务影�? },
    ],
    impact: '无业务影响，系统已自动处�?,
  },
];

// ── AI Copilot 静态问答库 ────────────────────────────────

const COPILOT_QA = {
  executive: [
    {
      q: '今天有什么需要我关注的风险？',
      a: `今日�?2 项需要您关注�?

🔴 已发生：B区空调故障已�?47 分钟前处置完毕，ERP系统已恢复正常。本次故障从 AI 识别到根因仅用时 3 分钟，避免了传统方式�?2-4 小时的排查延迟�?

🟡 即将发生：季度末业务高峰将在 48 小时内到来，核心出口链路预计达到 91% 利用率。运维处已收�?AI 预警，建议今日确认备用链路配置方案是否已启动�?

其余 21 �?AI 识别事件均为低级别，已由系统自动处置。`,
    },
    {
      q: '本月 SLA 达成情况怎样�?,
      a: `本月�?-28日）SLA 达成率为 99.2%，高于目�?99% �?

故障时长统计�?
· 累计业务影响时长�?47 分钟
· 其中今日 B区空调事件：47 分钟
· MTTR 平均�?8 分钟（上�?142 分钟，↓ 73%�?

AI 贡献：本月共收敛告警 47,832 �?�?186 个有效事件，运维团队工单处理量减少约 86%。`,
    },
    {
      q: '生成本月运维报告',
      a: `📄 大数据中�?· 2026�?�?运维分析报告（AI 生成�?

── 整体评估 ──
综合健康评分�?8/100，较上月提升 3 �?
SLA 达成率：99.2%（目�?99%）✅

── 故障概览 ──
本月发生故障 3 次，较上月减�?2 次（-40%�?
MTTR �?142 分钟降至 38 分钟（AI 驱动 -73%�?

── AI 价�?──
告警收敛�?7,832 �?186 有效事件�?99.6%�?
跨系统根因关联：3 次准确定位，节省人工排查�?16 小时

── 建议 ──
�?B区机柜精密空调建议纳入本月维保计�?
�?核心出口链路 WAN-01 建议评估扩容（季度末风险�?
�?TLS 1.0 遗留 API�?%）建议联�?ERP 厂商升级`,
    },
  ],
  ops: [
    {
      q: 'B区空调故障现在处理好了吗�?,
      a: `PAC-B06 空调已于 15:10 完成应急处置（启用临时制冷），机柜温度已降�?29.4°C，恢复正常范围�?

后续需关注�?
1. SW-Core-02 降频保护已自动解除，CPU 恢复�?34%，但接口 Gi1/0/1~Gi1/0/3 错误率仍略偏高（0.12%），建议今晚低峰期检查接口物理状�?

2. 14�?VM 的迁移任务已全部完成，无数据丢失

3. 空调 PAC-B06 历史维保记录：上次维�?284 天前，建议纳入本月紧急维保计划`,
    },
    {
      q: '最�?0天哪条链路最值得关注�?,
      a: `基于 30 天趋势分析，以下 3 条链路需要关注：

🔴 WAN-01（核心出口）62% �?预测 91%
   季度末高峰风险，建议 48h 内完成备用链路配�?

🟠 DC-Core �?IDC-B 互联链路，平均利用率 78%
   过去 30 天持续上升（+23%），建议评估是否需要扩容至 400G

🟡 存储网络 iSCSI Fabric-02，错误率轻微上升趋势
   0.001% �?0.008%，建议检�?SFP 模块`,
    },
    {
      q: '当前最高优先级事件是什么？',
      a: `当前最高优先级：事�?#001（根因）

PAC-B06 精密空调故障（AI置信�?96%�?
已触发下游影响链�?
 SW-Core-02 �?VLAN100 �?VM集群-B �?ERP

�?建议立即操作�?
1. 联系机房部创建空调维修工�?
2. 确认 SW-Core-02 温度是否持续下降
3. 监控 14�?VM 迁移完成情况

其余 22 个事件均为衍生影响，处置根因后将自动消除。`,
    },
  ],
  security: [
    {
      q: '凌晨那个DNS异常是真实威胁还是误报？',
      a: `AI 判断为高置信度真实威胁（91%），主要依据�?

行为特征�?
· VM-Prod-047 �?02:17-02:43 共发�?21,840 �?DNS 查询
· 查询目标�?.cdn-updates.net（已�?C2 域名变种特征�?
· 查询载荷平均长度 187 字节（正�?DNS 平均 42 字节�?
· 查询间隔极度规律（每 72ms ±2ms），符合自动化工具特�?

为何排除设备故障误报�?
· 同时�?VM-089 的流量突增经对比�?rsync 备份（时间戳与备份策略吻合），AI 已标记为无威�?

建议立即操作�?
· 一键隔�?VM-Prod-047 网络
· 创建安全审计工单
· 导出取证数据包（.pcap）`,
    },
    {
      q: '我们的TLS合规情况如何�?,
      a: `当前 TLS 版本分布（基于过�?天流量分析）�?

�?TLS 1.3�?7%（目�?>80%，需持续优化�?
�?TLS 1.2�?1%（合规，等待迁移�?
�?TLS 1.0�?%（不合规，等保三级要求禁用）

TLS 1.0 来源定位�?
· 主要来自 ERP 系统对接�?2 个遗�?API 接口
· 建议联系 ERP 厂商升级，或在防火墙配置 TLS 降级拒绝策略

证书到期预警�?
· cert-api-gw�? 天后到期 �?建议立即续签
· cert-internal-ldap�?3 天后到期`,
    },
    {
      q: '今日安全事件与运维故障有关联吗？',
      a: `AI 跨域关联分析结论（置信度 97%）：

�?两个事件相互独立，无关联�?

1. B区空调故障（运维#001�?
   · 纯硬件故障，无异常外联，无攻击特�?
   · 来源：机房环境自然老化

2. VM-047 DNS 隧道（安�?001�?
   · 独立安全事件，发生在 02:17，与运维故障时间线（14:23）无重叠
   · 攻击目标：通过 DNS 隧道外联 C2 服务�?

关联分析依据�?
· 检查了两事件的来源IP、时间线、受影响设备集合，无任何重叠
· AI 排除"运维故障被利用作为掩�?的可能性`,
    },
  ],
};

const ROLE_SUGGESTIONS = {
  executive: ['今天有什么需要我关注的风险？', '本月 SLA 达成情况怎样�?, '生成本月运维报告'],
  ops: ['B区空调故障现在处理好了吗�?, '最�?0天哪条链路最值得关注�?, '当前最高优先级事件是什么？'],
  security: ['凌晨那个DNS异常是真实威胁还是误报？', '我们的TLS合规情况如何�?, '今日安全事件与运维故障有关联吗？'],
};

// ── 证据链详情数�?──────────────────────────────────────
const EVIDENCE_DATA = {
  '#001': {
    conf: 96, confColor: '#1A7F37',
    summary: 'B06 机柜精密空调制冷系统故障，导致物理温�?�?核心交换机热降频 �?VLAN100 转发延迟 �?上层业务响应升高。完整因果链�?AI �?2 分钟内完成跨域关联推断�?,
    timeline: [
      { time: '14:18:02', level: 'info', icon: 'sensors',
        title: '基线偏离检�?,
        metric: 'B06 机柜温度', val: '34.8°C',
        desc: '机房环境巡检传感器首次上�?B06 号机柜温度高于基线（均�?26.2°C），AI 标记为异常前兆，进入高频采样模式（每 30s�? },
      { time: '14:21:03', level: 'warn', icon: 'thermostat',
        title: '温度超告警阈�?,
        metric: 'TMP-B06-1', val: '38.2°C（阈�?36°C�?,
        desc: '温度传感器持续攀升跨越告警阈值。AI 对比历史：当前空调功率比正常值低 62%，判断制冷系统已实质失效' },
      { time: '14:22:17', level: 'crit', icon: 'power_off',
        title: '空调控制器失�?,
        metric: 'PAC-B06 控制总线', val: '无响�?>10s',
        desc: 'SNMP Trap 收到 PAC-B06 控制�?heartbeat 超时，压缩机转速传感器归零。AI 确认：精密空调完全停机（非软件重启）' },
      { time: '14:23:07', level: 'crit', icon: 'device_thermostat',
        title: '下游：交换机热降�?,
        metric: 'SW-Core-02 CPU', val: '34% �?89%',
        desc: 'SW-Core-02 内置温控触发保护机制，强制降频至 40% 主频。CPU 利用率骤升（相同业务流量、算力骤降导致）。AI 关联�?B06 温升原因�? },
      { time: '14:23:15', level: 'warn', icon: 'network_check',
        title: '下游：VLAN100 延迟',
        metric: 'VLAN100 转发延迟', val: '+340ms（基�?1.2ms�?,
        desc: 'ACC-B01 / ACC-B02 接入层上�?VLAN100 延迟告警。AI 关联：由 SW-Core-02 降频导致，排除网络配置变更（最近变�?72h 前）' },
      { time: '14:23:17', level: 'crit', icon: 'web_asset',
        title: '业务层：ERP 响应超阈�?,
        metric: 'ERP P99 延迟', val: '2,100ms（SLA 500ms�?,
        desc: 'ERP 前端监控上报响应超阈值。AI 关联完整链路：物理层（空调）�?网络层（SW-Core-02）→ VLAN �?应用层（ERP）。根因置信度升至 96%' },
    ],
    reasoning: `AI 按照"5-Why 跨域因果推断"方法，在 2 分钟内完成以下推理路径：

�?为何 ERP 响应慢？�?VLAN100 延迟骤升
�?为何 VLAN100 延迟高？�?SW-Core-02 转发能力下降
�?为何 SW-Core-02 性能下降？→ 热降频（CPU SLA 超限�?
�?为何 SW-Core-02 过热？→ B06 机柜温度升高
�?为何机柜温度升高？→ PAC-B06 精密空调停机

推断过程排除�?4 个竞争假设（见右侧），最终锁定根因。`,
    eliminated: [
      { hyp: '网络配置变更', reason: '最近变更记录为 72 小时前，变更内容�?OSPF metric 调整，与本次延迟无关�? },
      { hyp: '链路物理故障', reason: 'SW-Core-02 所有上/下行接口物理层状态正常，光功率在基线范围�? },
      { hyp: 'DDoS 流量冲击', reason: '流量入口总带宽未见异常（当前 62G，基�?58G），且延迟先于流量增加出�? },
      { hyp: '软件/固件 Bug', reason: 'SW-Core-02 进程表无异常，其他机房区域同型号设备运行正常，排除固件问�? },
    ],
    cascade: [
      { icon: 'ac_unit', label: 'PAC-B06 精密空调', detail: '制冷停止，机柜温�?+12.2°C', cls: 'cas-root' },
      { icon: 'router', label: 'SW-Core-02 核心交换�?, detail: '热降频，转发算力 �?0%', cls: 'cas-network' },
      { icon: 'hub', label: 'ACC-B01 / ACC-B02', detail: 'VLAN100 延迟 +340ms', cls: 'cas-network' },
      { icon: 'cloud', label: 'VM-CLST-B�?4台VM�?, detail: '迁移任务挂起', cls: 'cas-cloud' },
      { icon: 'apps', label: 'ERP 系统', detail: 'P99 2,100ms�?部门受影�?, cls: 'cas-biz' },
    ],
    suggestions: [
      { pri: '立即', pri_cls: 'sug-crit', action: '启用应急制�?PAC-B06-BAK', detail: '已完成，15:10 机柜温度恢复 29.4°C' },
      { pri: '今日', pri_cls: 'sug-warn', action: '创建 PAC-B06 紧急维保工�?, detail: '控制板返厂维修，预计 3 工作日恢�? },
      { pri: '本月', pri_cls: 'sug-info', action: '全机房精密空调预防性巡检', detail: 'B�?12 台空调，上次巡检均�?190 天前' },
    ],
  },
  '#004': {
    conf: 91, confColor: '#CF222E',
    summary: 'CRM 集群应用服务器因 ERP 批量数据导入触发 ORDER_FOLLOW_UP 表全表扫描，慢查询积压导致数据库连接池耗尽，响应时间上升至基线 32 倍。直接根因为缺失联合索引�?,
    timeline: [
      { time: '14:15:00', level: 'info', icon: 'trending_up',
        title: 'CPU 趋势异常检�?,
        metric: 'CRM APP-SRV CPU（趋势）', val: '62% �?78%',
        desc: 'AI 对比 14 天历史数据，识别当前 CPU 利用率偏离历史同时段基线�?33%），触发趋势预警，进入监控加强模�? },
      { time: '14:18:00', level: 'warn', icon: 'memory',
        title: 'CPU �?SLA 阈�?,
        metric: 'APP-SRV-01/02 CPU', val: '94%（SLA 80%�?,
        desc: 'APP-SRV-01 �?APP-SRV-02 CPU 均超 SLA 阈值。AI 热点分析�?8% 消耗集中在 CRM-DB-Worker 进程（MySQL 连接线程池）' },
      { time: '14:18:23', level: 'warn', icon: 'database',
        title: '慢查询激�?,
        metric: 'CRM DB 慢查�?, val: '2�?�?�?47�?�?,
        desc: 'MySQL 慢查询日志频率突�?23.5 倍。AI 定位：集中在 ORDER_FOLLOW_UP 表全表扫描（4.2M 行，缺失索引）。触发时间点�?ERP 导入订单数据重合' },
      { time: '14:19:33', level: 'crit', icon: 'link_off',
        title: '数据库连接池耗尽',
        metric: 'CRM DB 连接�?, val: '500/500（满载）',
        desc: '慢查询堆积导致连接不释放，连接池达上限（500/500）。新业务请求进入 30s 等待超时队列，应用层请求开始积�? },
      { time: '14:20:10', level: 'crit', icon: 'speed',
        title: '业务响应崩溃',
        metric: 'CRM P99 响应时间', val: '2,100ms（基�?65ms�?,
        desc: 'CRM 前端监控上报 P99 飙升 32.3 倍（SLA 基线 65ms）。影响：销售、客服、市场部共约 218 名用�? },
    ],
    reasoning: `AI 通过"指标关联图谱"方法，追踪以下因果路径：

�?ERP 批量导入 18,000 行订单数据（13:58，正常操作）
�?ORDER_FOLLOW_UP 表新增行触发全表扫描（缺失联合索引）
�?慢查询从 2�?�?�?47�?分，MySQL 线程 CPU 78%
�?连接等待时间�?50ms �?30,000ms（连接池满）
�?应用层请求积�?�?P99 响应 2,100ms

AI 识别�?缺失数据库索�?为直接技术根因，"ERP 数据导入"为触发条件。`,
    eliminated: [
      { hyp: '硬件故障（CPU/内存�?, reason: '硬件健康检测正常，内存利用�?56%，未�?ECC 错误' },
      { hyp: '网络带宽瓶颈', reason: 'CRM 内网流量 <200Mbps，带宽利用率 3%，排除网络问�? },
      { hyp: '外部 DDoS 或爬�?, reason: '访问来源 99.8% 为内�?IP，未见异常外部流�? },
      { hyp: '软件部署变更', reason: '最近部署记录为 3 天前（小版本更新），与本次慢查询触发时间无关�? },
    ],
    cascade: [
      { icon: 'table_rows', label: 'ERP 数据导入（触发）', detail: '18,000 行订单，13:58', cls: 'cas-trigger' },
      { icon: 'database', label: 'CRM MySQL 慢查�?, detail: 'ORDER_FOLLOW_UP 全表扫描', cls: 'cas-root' },
      { icon: 'memory', label: 'APP-SRV-01/02', detail: 'CPU 94%，连接池 500/500', cls: 'cas-server' },
      { icon: 'apps', label: 'CRM 业务系统', detail: 'P99 2,100ms�?18 人受影响', cls: 'cas-biz' },
    ],
    suggestions: [
      { pri: '立即', pri_cls: 'sug-crit', action: '�?ORDER_FOLLOW_UP 添加联合索引', detail: 'idx_crm_order_follow(order_id, created_at, status)，预计执�?8 分钟' },
      { pri: '今日', pri_cls: 'sug-warn', action: '临时扩大连接池上限至 800', detail: '修改 max_connections=800，等待慢查询积压清空' },
      { pri: '本周', pri_cls: 'sug-info', action: '建立 ERP-CRM 大批量同步限流机�?, detail: '大批量导入限制在业务低峰期（00:00�?6:00�? },
    ],
  },
  '#007': {
    conf: 93, confColor: '#CF222E',
    summary: 'VM-Prod-047 被检测到向境外已�?APT C2 IP 发起高频 DNS 查询，行为特征与 DNS 隧道外连高度匹配�? 维特征综合评�?93/100）。AI 在发现后 33 秒内自动隔离，威胁已收敛�?,
    timeline: [
      { time: '14:10:05', level: 'crit', icon: 'dns',
        title: 'DNS 查询频率异常',
        metric: 'VM-Prod-047 DNS 频率', val: '420�?分（基线 2�?分）',
        desc: 'DNS 流量监控检测到 VM-Prod-047 查询频率是正常基线的 210 倍。查询目标：多个随机子域名（长度均匀分布 32�?0 字符），子域名格式符�?Base64 编码特征' },
      { time: '14:10:12', level: 'crit', icon: 'security',
        title: '域名熵值异�?,
        metric: '目标域名香农熵�?, val: '7.8 bit（正�?<4.5�?,
        desc: 'AI �?DNS 查询目标域名做香农熵分析，熵�?7.8 高于正常域名�?4.5）。高熵值是 DNS 隧道/DGA 的典型特征。子域名�?== 填充符，确认 Base64 编码负载' },
      { time: '14:10:18', level: 'crit', icon: 'gpp_bad',
        title: '威胁情报命中',
        metric: 'IP 威胁情报匹配', val: 'TI 命中，匹配度 98%',
        desc: '目标 IP�?85.220.101.x/24）命中内部威胁情报库（TIP-Ext-02）。该 IP 段已被标记为 APT 组织 TA505 �?C2 服务器范围，历史 IOC 记录 47 �? },
      { time: '14:10:25', level: 'warn', icon: 'analytics',
        title: 'DNS 包长度异�?,
        metric: 'DNS 响应包大�?, val: '均�?489B（正�?<150B�?,
        desc: 'DNS 响应包远超正常应答大小。数据包分析：ANSWER 段包含大量编码数据，确认�?DNS 隧道数据外传行为，综合威胁评分达 93/100' },
      { time: '14:10:38', level: 'ok', icon: 'block',
        title: 'AI 自动隔离执行',
        metric: 'VM-Prod-047 网络策略', val: '已隔离至 VLAN-Quarantine',
        desc: 'AI 触发自动响应：调�?SDN 控制�?API，将 VM-Prod-047 隔离至安全隔离区，同时保留取证快照（内存 + 磁盘）。从检测到隔离�?33 �? },
      { time: '14:10:42', level: 'warn', icon: 'policy',
        title: '同源镜像扫描启动',
        metric: '同批镜像 VM', val: '2台待确认',
        desc: 'VM-Prod-047 创建记录：来源镜�?IMG-2026-0115-prod-v2.3。同批次部署还有 VM-Prod-048 / VM-Prod-051，建议扩大排查范�? },
    ],
    reasoning: `AI 使用"多特征融合威胁评�?模型，综�?6 项特征完成判断：

�?DNS 查询频率异常（权�?25%）：420�?分，偏离基线 +20,900%
�?域名熵值（权重 20%）：7.8 bit，高�?Base64 编码特征阈�?
�?威胁情报命中（权�?30%）：TA505 APT 已知 C2 IP �?
�?数据包长度分布（权重 15%）：DNS 响应 489B，典型隧道外�?
�?行为时序（权�?5%）：查询间隔极度规律（每 72ms ±2ms�?
�?横向移动（权�?5%）：未发现内网扫描，排除蠕虫传播

综合威胁评分 93/100，触发自动隔离（阈�?85）。`,
    eliminated: [
      { hyp: '正常业务 DNS 请求', reason: '业务系统 DNS 查询基线 <5�?分，420�?分超�?84 倍，且目标为随机化子域名而非固定业务域名' },
      { hyp: 'DNS 服务器故�?放大攻击', reason: 'DNS 服务器其�?VM 流量正常，查询方向为出向，排�?DNS 放大攻击' },
      { hyp: '杀毒软�?安全扫描�?, reason: 'VM-Prod-047 安装清单无已知安全工具，查询目标 IP 不在安全扫描范围数据�? },
      { hyp: '配置错误', reason: '应用程序 DNS 解析配置最近无变更，且域名格式为典型随机化 DGA 特征，非配置错误' },
    ],
    cascade: [
      { icon: 'computer', label: 'VM-Prod-047（已隔离�?, detail: 'DNS 隧道外连�?20�?�?, cls: 'cas-root' },
      { icon: 'cloud_upload', label: '境外 C2 服务�?, detail: 'TA505 APT 已知 IOC', cls: 'cas-threat' },
      { icon: 'hub', label: '同源镜像 VM × 2', detail: 'VM-048 / VM-051 待排�?, cls: 'cas-warn' },
      { icon: 'storage', label: '潜在数据外泄', detail: '隔离前外传估�?~23MB（已截断�?, cls: 'cas-biz' },
    ],
    suggestions: [
      { pri: '立即', pri_cls: 'sug-crit', action: '�?VM-048 / VM-051 执行流量审计', detail: '确认是否存在相同 DNS 外连行为，如发现则自动隔�? },
      { pri: '今日', pri_cls: 'sug-warn', action: '�?IMG-2026-0115-prod-v2.3 做恶意代码扫�?, detail: '使用 ClamAV + YARA 规则集确认镜像供应链安全' },
      { pri: '本周', pri_cls: 'sug-info', action: '取证分析 VM-Prod-047 内存快照', detail: 'AI 已保留快照，分析 C2 植入时间及潜在横向移动意�? },
    ],
  },
};

// ── 状�?──────────────────────────────────────────────────
let currentRole = 'executive';
let drawerOpen = false;
let copilotOpen = false;
let drawerTab = 'raw'; // 'raw' | 'ai'
let charts = {};

// ── 工具函数 ─────────────────────────────────────────────
function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

// ── 初始�?────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initRoleSelector();
  initAiProgressBar();
  initAlertDrawer();
  initCopilot();
  initTopoTooltip();
  initModals();
  initDcTabs();
  initEventDrawer();
  renderView('executive');
});

// ── AI 决策中心 Tab ────────────────────────────────────────
function initDcTabs() {
  document.querySelectorAll('.dc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tab.closest('.decision-center-card').querySelectorAll('.dc-tab').forEach(t => t.classList.remove('active'));
      tab.closest('.decision-center-card').querySelectorAll('.dc-tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });
}

// ── AI 决策中心 Tab ────────────────────────────────────────
function initDcTabs() {
  document.querySelectorAll('.dc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tab.closest('.decision-center-card').querySelectorAll('.dc-tab').forEach(t => t.classList.remove('active'));
      tab.closest('.decision-center-card').querySelectorAll('.dc-tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });
}

// ── 事件报告侧滑抽屉 ─────────────────────────────────────
const EVENT_REPORTS = {
  'ac-event': {
    icon: 'thermostat', iconColor: '#1A7F37',
    title: 'B �?06 号机柜精密空调故�?,
    meta: '事件 ID：INC-20260428-006 · 已关�?· 2026-04-28',
    badges: [
      { text: '已处�?, color: '#1A7F37', bg: '#DAFBE1' },
      { text: '机房基础设施', color: '#0969DA', bg: '#DDF4FF' }
    ],
    headerBg: '#F0FFF4',
    stats: [
      { num: '47�?, label: '故障持续时长', cls: 'stat-yellow' },
      { num: '1', label: '影响业务系统', cls: '' },
      { num: '98.6%', label: 'AI 处置效率', cls: 'stat-green' },
      { num: 'P2', label: '事件级别', cls: '' }
    ],
    timeline: [
      { dot: 'tl-dot-red', icon: 'emergency', time: '13:36', label: 'AI 检测到异常', desc: 'B �?06 号机柜温度传感器上报 34.2°C，超�?32°C 预警阈值，AI 识别为精密空调故障前�? },
      { dot: 'tl-dot-red', icon: 'warning', time: '13:38', label: '告警升级', desc: '温度持续攀升至 37.8°C，空调压缩机停止运转信号确认，触�?P2 故障告警' },
      { dot: 'tl-dot-yellow', icon: 'person', time: '13:41', label: '自动派单', desc: 'NGPM 自动生成工单 WO-2026-1124，分配至机房运维组（负责人：李建国），同步推送企业微信通知' },
      { dot: 'tl-dot-yellow', icon: 'build', time: '14:02', label: '现场响应', desc: '运维人员到达现场确认：空�?PAC-B06 控制板故障，启用备用精密空调 PAC-B06-BAK 临时接管' },
      { dot: 'tl-dot-green', icon: 'thermostat', time: '14:18', label: '温度恢复', desc: '机柜温度降至 27.3°C，ERP 系统响应时间恢复正常�?2ms），业务影响解除' },
      { dot: 'tl-dot-green', icon: 'check_circle', time: '14:23', label: '事件关闭', desc: '备用空调稳定运行，工单转维保计划，主空调预计 3 工作日内完成修复' }
    ],
    impact: ['ERP 系统（响应时间偶发升高）', 'B �?06-08 号机�?, 'PAC-B06 精密空调'],
    kv: [
      { k: '根因', v: 'PAC-B06 空调控制板故障，压缩机停�? },
      { k: '处置�?, v: '机房运维�?/ 李建�? },
      { k: '恢复方式', v: '切换备用空调 PAC-B06-BAK' },
      { k: '后续动作', v: '控制板返厂维修，预计 3 工作日恢复主�? },
      { k: '上次维保', v: '2025-07-04�?84 天前�? }
    ],
    aiAnalysis: 'AI 评估：该空调 MTBF 历史数据�?340 天，上次维保距今 284 天，已接近维保周期。建议将 B 区所有精密空调（�?12 台）纳入本季度预防性维保计划，可降低类似故障概率约 73%�?,
    footerBtns: [
      { text: '下载事件报告', cls: 'ev-btn-primary', icon: 'download' },
      { text: '查看维保计划', cls: 'ev-btn-secondary', icon: 'build_circle' }
    ],
    footerNote: 'NGPM AI 自动生成 · 2026-04-28 14:45'
  },

  'wan-event': {
    icon: 'router', iconColor: '#9A6700',
    title: '核心出口链路 WAN-01 带宽容量预警',
    meta: '事件 ID：RISK-20260428-002 · 预警�?· 2026-04-28',
    badges: [
      { text: '待处�?, color: '#9A6700', bg: '#FFF3CD' },
      { text: '网络容量', color: '#0969DA', bg: '#DDF4FF' }
    ],
    headerBg: '#FFFBF0',
    stats: [
      { num: '84%', label: '当前利用�?, cls: 'stat-yellow' },
      { num: '~2�?, label: '触警预计时间', cls: 'stat-red' },
      { num: '1G', label: '当前带宽', cls: '' },
      { num: '91%', label: '峰值预�?, cls: 'stat-red' }
    ],
    timeline: [
      { dot: 'tl-dot-blue', icon: 'trending_up', time: '04/22', label: 'AI 容量趋势预测', desc: 'AI 检测到 WAN-01 利用率近 7 天持续上升，建立预测模型：季度末�?/28-5/05）期间将出现流量高峰' },
      { dot: 'tl-dot-yellow', icon: 'warning', time: '04/26', label: '预警触发�?0%阈值）', desc: 'WAN-01 日峰值利用率首次突破 80% 预警线（�?82%），NGPM 自动生成容量预警工单' },
      { dot: 'tl-dot-yellow', icon: 'schedule', time: '04/28 今日', label: '当前状态：84% 运行', desc: '实时利用�?84%，AI 预测 4/30 前后将达 91%，超�?90% 高危阈�? },
      { dot: 'tl-dot-gray', icon: 'pending', time: '预计 04/30', label: '预计触警�?1%�?, desc: '如不干预，季度末业务高峰将导致出口拥塞，影响跨部门协同和远程办公访问质量' }
    ],
    impact: ['跨区域业务访�?, 'VPN 远程办公', '视频会议质量', '云备份传�?],
    kv: [
      { k: '链路标识', v: 'WAN-01（电�?1G 专线�? },
      { k: '峰值时�?, v: '工作�?9:00�?1:00�?4:00�?7:00' },
      { k: '备用链路', v: 'WAN-02（联�?500M）可临时切流' },
      { k: '扩容方案', v: '�?临时启用 WAN-02 分流；② 申请 1G�?G 升级（报价已就绪�? },
      { k: '决策截止', v: '2026-04-29（需 1 天提前审批）' }
    ],
    aiAnalysis: 'AI 建议：短期（今日）启�?WAN-02 进行流量均衡可将 WAN-01 峰值降至约 62%，可规避本次风险。中期建议启�?WAN-01 扩容�?2G 的采购流程，预计报价 ¥3.2�?年，可支撑未�?18 个月增长�?,
    footerBtns: [
      { text: '审批扩容方案', cls: 'ev-btn-primary', icon: 'approval' },
      { text: '启用备用链路', cls: 'ev-btn-secondary', icon: 'route' }
    ],
    footerNote: 'AI 预测置信�?92% · 需�?04/29 前决�?
  },

  'dns-event': {
    icon: 'security', iconColor: '#CF222E',
    title: '疑似 DNS 隧道 C2 外连行为',
    meta: '安全事件 ID：SEC-20260428-001 · 处置�?· 高危',
    badges: [
      { text: '🔴 高危', color: '#CF222E', bg: '#FFEBE9' },
      { text: 'APT 威胁', color: '#CF222E', bg: '#FFEBE9' },
      { text: '处置�?, color: '#9A6700', bg: '#FFF3CD' }
    ],
    headerBg: '#FFF0F0',
    stats: [
      { num: '1', label: '受控主机', cls: 'stat-red' },
      { num: '已隔�?, label: '当前状�?, cls: 'stat-green' },
      { num: 'C2', label: 'AI 判定威胁类型', cls: 'stat-red' },
      { num: '97%', label: 'AI 置信�?, cls: 'stat-red' }
    ],
    timeline: [
      { dot: 'tl-dot-red', icon: 'emergency', time: '11:23', label: 'AI 检测异�?DNS 请求', desc: 'AI 检测到 VM-Prod-047 向外�?IP�?85.220.xx.xx）发起大�?DNS TXT 查询，请求频�?47 �?分，远超正常基线' },
      { dot: 'tl-dot-red', icon: 'policy', time: '11:24', label: 'AI 自动研判：C2 通信特征', desc: '行为特征匹配 DNS Tunneling C2 通信模式（置信度 97%），确认为高危安全事件。目标域名已加入全局封锁名单' },
      { dot: 'tl-dot-red', icon: 'block', time: '11:24:30', label: '自动隔离执行', desc: 'NGPM 自动下发防火墙策略，隔离 VM-Prod-047�?0.12.4.47），切断其所有出站连接，业务流量自动切至 VM-Prod-048' },
      { dot: 'tl-dot-yellow', icon: 'manage_search', time: '11:30', label: '深度取证分析', desc: 'AI 对主机内存快照和进程树进行分析：发现恶意进程 svchost32.exe（PID 4892），疑似通过供应链植�? },
      { dot: 'tl-dot-yellow', icon: 'person_search', time: '持续�?, label: '溯源调查', desc: '安全团队正在排查同批次虚拟机镜像（共 8 台），已初步排除 6 台，剩余 2 台待确认' }
    ],
    impact: ['VM-Prod-047（已隔离�?, '潜在横向移动风险', '等保合规状�?],
    kv: [
      { k: '受控主机', v: 'VM-Prod-047�?0.12.4.47）�?CentOS 7.9' },
      { k: '恶意域名', v: '*.cdn-update-check[.]xyz（已封锁�? },
      { k: '恶意进程', v: 'svchost32.exe（PID 4892�? },
      { k: '感染方式', v: '疑似供应链镜像植入（待确认）' },
      { k: '主机业务', v: '内部报表服务（已切换至备机）' }
    ],
    aiAnalysis: 'AI 威胁评估：攻击者利�?DNS 协议隐蔽外连，属�?APT 常用手法（ATT&CK T1071.004）。当前已自动阻断，建议：�?对同镜像 8 台主机全量扫描；�?审查�?30 �?DNS 日志中同类特征；�?提前申报等保事件记录以避免复测影响�?,
    footerBtns: [
      { text: '查看完整取证报告', cls: 'ev-btn-primary', icon: 'policy' },
      { text: '扩大排查范围', cls: 'ev-btn-danger', icon: 'manage_search' }
    ],
    footerNote: '等保合规影响：需�?48h 内完成事件报告归�?
  },

  'vm-sg-event': {
    icon: 'shield_with_heart', iconColor: '#9A6700',
    title: '7 台虚拟机安全组策略过�?,
    meta: '安全合规 ID：COMP-20260428-004 · 整改截止 2026-05-15',
    badges: [
      { text: '中危', color: '#9A6700', bg: '#FFF3CD' },
      { text: '等保合规', color: '#0969DA', bg: '#DDF4FF' },
      { text: '待整�?, color: '#9A6700', bg: '#FFF3CD' }
    ],
    headerBg: '#FFFBF0',
    stats: [
      { num: '7�?, label: '需整改主机', cls: 'stat-yellow' },
      { num: '17�?, label: '距整改截�?, cls: 'stat-yellow' },
      { num: '3', label: '高危端口暴露', cls: 'stat-red' },
      { num: '84%', label: '等保当前评分', cls: 'stat-yellow' }
    ],
    timeline: [
      { dot: 'tl-dot-blue', icon: 'search', time: '04/20', label: 'AI 安全扫描发现', desc: 'NGPM 例行安全配置扫描发现 7 台虚拟机安全组规则存�?0.0.0.0/0 全开放策略，不符合等保三级访问控制要�? },
      { dot: 'tl-dot-yellow', icon: 'assignment', time: '04/21', label: '合规评估', desc: '安全团队确认�? 台主机暴露了 22（SSH）�?389（RDP）�?080 高危端口，等保评分受此影响扣 2 分（84% �?需�?86%�? },
      { dot: 'tl-dot-yellow', icon: 'event', time: '04/28 今日', label: '整改进度�?/7 完成', desc: '已完成整改：VM-Dev-012�?13�?21�?32（低优先级主机）。待完成�? 台生产主机（需停机维护窗口�? },
      { dot: 'tl-dot-gray', icon: 'event_upcoming', time: '05/15', label: '等保复测截止', desc: '需在此日前完成全部整改，并提交整改报告，否则影响等保三级证书续�? }
    ],
    impact: ['等保三级证书（复测风险）', 'VM-Prod-031�?44�?61�?台生产主机）', '信息安全评分（当�?84%，需�?6%�?],
    kv: [
      { k: '涉及主机', v: 'VM-Dev-012/013/021/032（已整改�? VM-Prod-031/044/061（待整改�? },
      { k: '高危端口', v: '22/SSH�?389/RDP�?080/HTTP（仅面向 0.0.0.0/0�? },
      { k: '整改方案', v: '收窄源地址白名单至运维跳板�?IP 段（10.0.1.0/24�? },
      { k: '停机窗口', v: '计划 2026-05-03 02:00�?4:00（已申请�? },
      { k: '负责�?, v: '安全运维�?/ 王晓�? }
    ],
    aiAnalysis: 'AI 合规建议�? 台待整改生产主机中，VM-Prod-031（ERP 数据库从库）风险最高，建议优先处置。整改方案已自动生成安全组规则变更脚本，审批后可一键部署。完成后预计等保评分恢复�?87%，超�?86% 合格线�?,
    footerBtns: [
      { text: '审批整改变更', cls: 'ev-btn-primary', icon: 'approval' },
      { text: '查看整改详情', cls: 'ev-btn-secondary', icon: 'list_alt' }
    ],
    footerNote: '整改截止 2026-05-15 · 当前进度 4/7�?7%�?
  },

  'djbh-event': {
    icon: 'verified_user', iconColor: '#0969DA',
    title: '等保三级复测准备状�?,
    meta: '合规追踪 ID：COMP-20260428-005 · 关注 · 复测预计 6�?,
    badges: [
      { text: '关注', color: '#0969DA', bg: '#DDF4FF' },
      { text: '等保三级', color: '#636C76', bg: '#F6F8FA' }
    ],
    headerBg: '#F0F8FF',
    stats: [
      { num: '84%', label: '当前综合评分', cls: 'stat-yellow' },
      { num: '86%', label: '合格�?, cls: '' },
      { num: '-2%', label: '差距', cls: 'stat-red' },
      { num: '6�?, label: '预计复测', cls: 'stat-blue' }
    ],
    timeline: [
      { dot: 'tl-dot-green', icon: 'check_circle', time: '2025-06', label: '等保三级通过', desc: '完成等保三级认证，综合评�?91 分，有效期至 2026-06' },
      { dot: 'tl-dot-blue', icon: 'trending_down', time: '2026-04', label: '评分下降�?84%', desc: 'DNS 隧道攻击事件�?3分）、VM 安全组问题（-2分）、TLS 遗留接口�?2分）导致评分下降' },
      { dot: 'tl-dot-yellow', icon: 'assignment_late', time: '现在', label: '整改进行�?, desc: 'VM 安全组整�?57% 完成，DNS 事件已处置，TLS 接口升级待排�? },
      { dot: 'tl-dot-gray', icon: 'event_upcoming', time: '2026-06', label: '复测目标', desc: '需在复测前将评分提升至 �?6%。AI 预测：完成剩余整改后可达 88-90 �? }
    ],
    impact: ['等保三级证书续期', '公司合规资质', '政府业务资质'],
    kv: [
      { k: '主要失分�?, v: '�?安全事件记录�?3分）�?访问控制�?2分）�?传输加密�?2分）' },
      { k: '已完成整�?, v: 'DNS 事件归档�? �?VM 安全组收�? },
      { k: '待完成整�?, v: '3 台生�?VM 安全组（05/15前）、TLS 1.0 升级（待排期�? },
      { k: '整改后预�?, v: '88�?0 分（超过 86% 合格线）' },
      { k: '负责�?, v: '信息安全�?/ 张磊' }
    ],
    aiAnalysis: 'AI 整改路径规划：优先级最高为 VM-Prod-031 安全组整改（+1.5分，05/03 维护窗口可完成）；其次为 TLS 接口升级�?2分，需联系 ERP 厂商，建议本月内启动）。两项完成后预测评分 88 分，复测通过概率 94%�?,
    footerBtns: [
      { text: '查看整改路线�?, cls: 'ev-btn-primary', icon: 'map' },
      { text: '导出合规报告', cls: 'ev-btn-secondary', icon: 'download' }
    ],
    footerNote: '复测预计 2026-06 · AI 预测通过概率 94%（完成整改后�?
  },

  'storage-event': {
    icon: 'storage', iconColor: '#9A6700',
    title: '存储池剩余空间不足预�?,
    meta: '容量预警 ID：CAP-20260428-003 · 关注 · 2026-04-28',
    badges: [
      { text: '关注', color: '#9A6700', bg: '#FFF3CD' },
      { text: '存储容量', color: '#0969DA', bg: '#DDF4FF' }
    ],
    headerBg: '#FFFBF0',
    stats: [
      { num: '26%', label: '剩余空间', cls: 'stat-yellow' },
      { num: '38�?, label: '触警预计时间', cls: 'stat-yellow' },
      { num: '74%', label: '当前使用�?, cls: 'stat-yellow' },
      { num: '1.2TB', label: '剩余可用', cls: '' }
    ],
    timeline: [
      { dot: 'tl-dot-blue', icon: 'analytics', time: '04/15', label: 'AI 增长趋势预测', desc: 'AI 分析�?90 天存储增长数据，建立线性预测模型：当前增速约 18GB/天（主因：虚拟机快照积累 + 日志未清理）' },
      { dot: 'tl-dot-yellow', icon: 'warning', time: '04/25', label: '存储使用率达 70%', desc: '触发 70% 一级预警，NGPM 自动清理 30 天以上过期快照（释放 180GB），预警暂时解除' },
      { dot: 'tl-dot-yellow', icon: 'storage', time: '04/28 今日', label: '当前 74%�?.2TB 剩余�?, desc: '过期快照清理效果递减，增速依然偏高，AI 预测 38 天后将再次达�?80% 预警阈�? },
      { dot: 'tl-dot-gray', icon: 'pending', time: '预计 06/05', label: '预计触警�?0%�?, desc: '建议在此之前完成扩容或策略优化，否则可能影响数据库备份和虚拟机快照策�? }
    ],
    impact: ['VM 快照策略', 'ERP/财务数据库备�?, '日志归档合规�?],
    kv: [
      { k: '存储�?, v: 'SAN-POOL-01（Dell EMC PowerStore 4TB�? },
      { k: '使用�?, v: '74%�?.96TB / 4TB），剩余 1.04TB' },
      { k: '增长速率', v: '�?18GB/天（快照积累为主要因素）' },
      { k: '扩容方案', v: '�?新增 2TB 扩展柜（报价 ¥6.8万）；② 迁移冷数据至 NAS（低成本方案�? },
      { k: '近期释放', v: '已清理过期快�?180GB，可再优化日志压缩约 120GB' }
    ],
    aiAnalysis: 'AI 优化建议：短期（本周）可通过调整快照保留策略�?天→3天）额外释放�?350GB，将预警时间延长�?65 天；中期建议启动 NAS 冷数据迁移方案（预计释放 600GB，成本约 ¥1.2万），无需采购硬件即可解决近期压力。扩容方案可延后�?Q3 评估�?,
    footerBtns: [
      { text: '审批快照策略变更', cls: 'ev-btn-primary', icon: 'approval' },
      { text: '查看存储详情', cls: 'ev-btn-secondary', icon: 'analytics' }
    ],
    footerNote: 'AI 预测触警时间�?8天（优化策略后可延长�?65 天）'
  }
};

function initEventDrawer() {
  const overlay = document.getElementById('evOverlay');
  const drawer = document.getElementById('evDrawer');
  const closeBtn = document.getElementById('evClose');

  function openDrawer(eventId) {
    const data = EVENT_REPORTS[eventId];
    if (!data) return;

    // Header
    const icon = document.getElementById('evTitleIcon');
    icon.textContent = data.icon;
    icon.style.color = data.iconColor;
    drawer.querySelector('.ev-drawer-header').style.background = data.headerBg || '#F6F8FA';
    document.getElementById('evTitle').textContent = data.title;
    document.getElementById('evMeta').textContent = data.meta;

    const badgesEl = document.getElementById('evHeaderBadges');
    badgesEl.innerHTML = data.badges.map(b =>
      `<span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;background:${b.bg};color:${b.color}">${b.text}</span>`
    ).join('');

    // Body
    const body = document.getElementById('evDrawerBody');
    body.innerHTML = `
      ${data.stats ? `
      <div class="ev-section">
        <div class="ev-stat-row">
          ${data.stats.map(s => `
            <div class="ev-stat-card ${s.cls}">
              <div class="ev-stat-num">${s.num}</div>
              <div class="ev-stat-label">${s.label}</div>
            </div>`).join('')}
        </div>
      </div>` : ''}

      <div class="ev-section">
        <div class="ev-section-title">事件时间�?/div>
        <div class="ev-timeline">
          ${data.timeline.map(t => `
            <div class="ev-tl-item">
              <div class="ev-tl-dot ${t.dot}"><span class="material-symbols-rounded" style="font-size:13px;font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24">${t.icon}</span></div>
              <div class="ev-tl-content">
                <div class="ev-tl-time">${t.time}</div>
                <div class="ev-tl-label">${t.label}</div>
                <div class="ev-tl-desc">${t.desc}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div class="ev-section">
        <div class="ev-section-title">影响范围</div>
        <div class="ev-impact-tags">
          ${data.impact.map(i => `<span class="ev-impact-tag">${i}</span>`).join('')}
        </div>
      </div>

      <div class="ev-section">
        <div class="ev-section-title">事件详情</div>
        <div class="ev-kv-list">
          ${data.kv.map(kv => `
            <div class="ev-kv">
              <span class="ev-kv-key">${kv.k}</span>
              <span class="ev-kv-val">${kv.v}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="ev-ai-block">
        <span class="material-symbols-rounded">neurology</span>
        <div class="ev-ai-content">
          <span class="ev-ai-label">AI 分析与建�?/span>
          <span class="ev-ai-text">${data.aiAnalysis}</span>
        </div>
      </div>
    `;

    // Footer
    const footer = document.getElementById('evDrawerFooter');
    footer.innerHTML = `
      ${data.footerBtns.map(b => `
        <button class="${b.cls}">
          <span class="material-symbols-rounded" style="font-size:15px;vertical-align:-3px;margin-right:4px">${b.icon}</span>${b.text}
        </button>`).join('')}
      <span class="ev-footer-note">${data.footerNote}</span>
    `;

    overlay.classList.add('open');
    drawer.classList.add('open');
  }

  function closeDrawer() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
  }

  document.querySelectorAll('.ev-clickable').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      openDrawer(el.dataset.event);
    });
  });

  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
}

// ── 角色选择�?────────────────────────────────────────────
function initRoleSelector() {
  const selector = qs('#roleSelector');
  const dropdown = qs('#roleDropdown');

  selector.addEventListener('click', (e) => {
    e.stopPropagation();
    selector.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    selector.classList.remove('open');
  });

  qsa('.rdrop-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const role = item.dataset.role;
      switchRole(role);
      selector.classList.remove('open');
    });
  });
}

const ROLE_META = {
  executive: { label: '数据中心总经�?, icon: 'manage_accounts' },
  ops:       { label: '网络运维�?, icon: 'engineering' },
  security:  { label: '网络安全�?, icon: 'shield' },
};

function switchRole(role) {
  currentRole = role;
  const meta = ROLE_META[role];
  qs('#roleLabel').textContent = meta.label;
  qs('#roleIcon').textContent = meta.icon;

  qsa('.rdrop-item').forEach(item => {
    item.classList.toggle('active', item.dataset.role === role);
  });

  renderView(role);

  if (copilotOpen) {
    renderCopilotSuggestions(role);
  }
}

function renderView(role) {
  qsa('.view').forEach(v => v.classList.add('hidden'));
  const target = qs(`#view-${role}`);
  if (target) target.classList.remove('hidden');

  // 延迟初始化图表（确保DOM可见�?
  requestAnimationFrame(() => {
    if (role === 'executive' && !charts.exec) initExecCharts();
    if (role === 'security' && !charts.heatmap) initSecurityCharts();
    if (role === 'ops') initOps();
  });
}

// ── AI 进度�?─────────────────────────────────────────────
function initAiProgressBar() {
  const btnRaw = qs('#btnRawAlerts');
  const btnAi = qs('#btnAiEvents');

  btnRaw.addEventListener('click', () => {
    openAlertDrawer('raw');
  });
  btnAi.addEventListener('click', () => {
    openAlertDrawer('ai');
  });

  // 进度动画（演示：�?87% 慢慢�?100%�?
  let pct = 87;
  const fill = qs('#apbFill');
  const pctEl = qs('#apbPct');

  setTimeout(() => {
    const timer = setInterval(() => {
      if (pct >= 100) {
        clearInterval(timer);
        pctEl.textContent = '100%';
        fill.style.width = '100%';
        fill.style.animation = 'none';
        fill.style.backgroundImage = 'none';
        fill.style.background = '#1A7F37';
        qs('.apb-text-row').innerHTML = qs('.apb-text-row').innerHTML.replace(
          'AI 已关联处理线索，进度',
          'AI 关联分析完成�?
        );
        return;
      }
      pct += 1;
      fill.style.width = pct + '%';
      pctEl.textContent = pct + '%';
    }, 800);
  }, 5000);
}

// ── 告警抽屉 ─────────────────────────────────────────────
let rawFilterSev = 'ALL';
let rawTrendChart = null;

// 今日24小时模拟告警分布（小�?-23），14时为事件爆发高峰
const RAW_HOURLY = [28,12,8,6,5,9,18,42,65,88,102,118,134,125,468,210,145,132,118,102,95,82,68,45];

function initRawTrendChart() {
  const canvas = qs('#rawTrendMini');
  if (!canvas) return;
  if (rawTrendChart) { rawTrendChart.destroy(); rawTrendChart = null; }
  rawTrendChart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: RAW_HOURLY.map((_, i) => i % 4 === 0 ? `${i}:00` : ''),
      datasets: [{
        data: RAW_HOURLY,
        backgroundColor: RAW_HOURLY.map((_, i) => i === 14 ? 'rgba(207,34,46,0.7)' : 'rgba(110,64,201,0.35)'),
        borderColor: RAW_HOURLY.map((_, i) => i === 14 ? '#CF222E' : '#6E40C9'),
        borderWidth: 1, borderRadius: 2,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1F2328', titleFont: { size: 10 }, bodyFont: { family: 'Geist Mono', size: 11 },
          padding: 6, cornerRadius: 5,
          callbacks: {
            title(items) { return `${items[0].dataIndex}:00 �?${items[0].dataIndex}:59`; },
            label(item) { return ` ${item.raw} 条告警`; },
            afterLabel(item) { return item.dataIndex === 14 ? '�?事件爆发时段' : ''; }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#8C959F', maxRotation: 0 } },
        y: { display: false, min: 0 }
      }
    }
  });
}

function bindRawFilters() {
  const chipsEl = qs('#rfChips');
  const srcEl = qs('#rawSrcFilter');
  if (!chipsEl || !srcEl) return;
  chipsEl.addEventListener('click', e => {
    const chip = e.target.closest('.rf-chip');
    if (!chip) return;
    chipsEl.querySelectorAll('.rf-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    rawFilterSev = chip.dataset.sev;
    renderRawAlerts();
  });
  srcEl.addEventListener('change', () => renderRawAlerts());
}

function openAlertDrawer(tab) {
  drawerOpen = true;
  drawerTab = tab;

  qs('#alertOverlay').classList.add('open');
  qs('#alertDrawer').classList.add('open');

  // 重置过滤状�?
  rawFilterSev = 'ALL';

  // 渲染内容
  renderRawAlerts();
  renderAiEvents();
  switchDrawerTab(tab);

  // 趋势图（切到 raw tab 时初始化�?
  if (tab === 'raw') {
    setTimeout(initRawTrendChart, 50);
    bindRawFilters();
  }
}

function closeAlertDrawer() {
  drawerOpen = false;
  qs('#alertOverlay').classList.remove('open');
  qs('#alertDrawer').classList.remove('open');
}

function switchDrawerTab(tab) {
  drawerTab = tab;
  qs('#dtabRaw').classList.toggle('active', tab === 'raw');
  qs('#dtabAi').classList.toggle('active', tab === 'ai');
  qs('#drawerBodyRaw').classList.toggle('hidden', tab !== 'raw');
  qs('#drawerBodyAi').classList.toggle('hidden', tab !== 'ai');

  qs('#btnRawAlerts').classList.toggle('apb-btn-active', tab === 'raw');
  qs('#btnAiEvents').classList.toggle('apb-btn-active', tab === 'ai');
}

function initAlertDrawer() {
  qs('#drawerClose').addEventListener('click', closeAlertDrawer);
  qs('#alertOverlay').addEventListener('click', closeAlertDrawer);
  qs('#dtabRaw').addEventListener('click', () => {
    openAlertDrawer('raw');
    setTimeout(initRawTrendChart, 50);
    bindRawFilters();
  });
  qs('#dtabAi').addEventListener('click', () => { openAlertDrawer('ai'); switchDrawerTab('ai'); });
}

function renderRawAlerts() {
  const tbody = qs('#rawAlertBody');
  const selSev = rawFilterSev;
  const selSrc = qs('#rawSrcFilter') ? qs('#rawSrcFilter').value : 'ALL';
  const filtered = RAW_ALERTS.filter(a => {
    const sevOk = selSev === 'ALL' || a.sev === selSev;
    const srcOk = selSrc === 'ALL' || a.src === selSrc;
    return sevOk && srcOk;
  });
  qs('#rawFilterCount').textContent = `�?${filtered.length} 条`;
  tbody.innerHTML = filtered.map(a => {
    const sevClass = a.sev === 'CRIT' ? 'sev-crit' : a.sev === 'WARN' ? 'sev-warn' : 'sev-info';
    return `<tr>
      <td class="raw-device">${a.time}</td>
      <td><span class="${sevClass}">${a.sev}</span></td>
      <td><span class="raw-src">${a.src}</span></td>
      <td class="raw-device">${a.device}</td>
      <td style="font-size:11px;color:#636C76">${a.msg}</td>
    </tr>`;
  }).join('');
}

function renderAiEvents() {
  const list = qs('#aiEventList2');
  if (!list) return;
  list.innerHTML = AI_EVENTS.map(ev => `
    <div class="aie-item ${ev.cls}">
      <div class="aie-hdr">
        <span class="aie-sev">${ev.sev}</span>
        <span style="font-size:10px;color:#8C959F;background:#F6F8FA;border:1px solid #D0D7DE;border-radius:4px;padding:1px 6px;">${ev.type}</span>
        <span class="aie-title">${ev.title}</span>
        <span class="aie-conf">置信�?<strong>${ev.conf}</strong></span>
      </div>
      <div class="aie-chain">
        ${ev.chain.map(c => `
          <div class="aie-chain-step">
            <span class="material-symbols-rounded">${c.icon}</span>
            <span>${c.text}</span>
          </div>`).join('')}
      </div>
      <div class="aie-footer">
        <span class="aie-impact-label">${ev.impact}</span>
        ${ev.type === '根因' ? `<button class="ef-btn ef-btn-primary">创建工单</button><button class="ef-btn evd-btn" data-evid="${ev.id}">证据链详�?/button>` : ''}
        ${ev.type === '影响' ? '<button class="ef-btn">查看关联</button>' : ''}
      </div>
    </div>
  `).join('');
}

// ── 拓扑�?Tooltip ────────────────────────────────────────
function initTopoTooltip() {
  const svg = qs('#topoSvg');
  const tooltip = qs('#topoTooltip');
  if (!svg || !tooltip) return;

  svg.addEventListener('mousemove', (e) => {
    const node = e.target.closest('[data-tip]');
    if (node) {
      tooltip.textContent = node.dataset.tip;
      tooltip.style.display = 'block';
      const rect = svg.getBoundingClientRect();
      tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
      tooltip.style.top = (e.clientY - rect.top - 10) + 'px';
    } else {
      tooltip.style.display = 'none';
    }
  });
  svg.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
}

// ── 总经理趋势图 ──────────────────────────────────────────
function initExecCharts() {
  const canvas = qs('#trendChartExec');
  if (!canvas) return;

  // 4/1 ~ 4/30，共30�?
  const labels = Array.from({length: 30}, (_, i) => `4/${i + 1}`);
  const alertData = [
    1820, 1950, 2100, 1880, 1760,  // 4/1�?/5
    1650, 1720, 1810, 1980, 2050,  // 4/6�?/10
    2200, 2350, 2300, 2180, 2420,  // 4/11�?/15
    5800, 3200, 2450, 2100, 1980,  // 4/16�?/20（峰�?4/16�?
    1870, 1920, 1990, 2080, 2150,  // 4/21�?/25
    2200, 2380, 2450, 2600, 2847,  // 4/26�?/30
  ];
  const faultData = [
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    0, 0, 0, 1, 0,
    2, 0, 0, 1, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 1,
  ];
  const peakIndex = 15; // 4/16

  charts.exec = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '告警�?�?,
          data: alertData,
          backgroundColor: alertData.map((_, i) => i === peakIndex ? 'rgba(207,34,46,0.5)' : 'rgba(5,80,174,0.3)'),
          borderColor: alertData.map((_, i) => i === peakIndex ? '#CF222E' : '#0550AE'),
          borderWidth: 1,
          yAxisID: 'y',
          order: 2,
        },
        {
          label: '故障次数',
          data: faultData,
          type: 'line',
          borderColor: '#CF222E',
          backgroundColor: 'rgba(207,34,46,0.1)',
          borderWidth: 2,
          pointRadius: faultData.map(v => v > 0 ? 5 : 2),
          pointBackgroundColor: '#CF222E',
          tension: 0.3,
          yAxisID: 'y1',
          order: 1,
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1F2328',
          titleFont: { family: 'Inter', size: 11 },
          bodyFont: { family: 'Geist Mono', size: 11 },
          padding: 8, cornerRadius: 6,
          callbacks: {
            afterTitle(items) {
              if (items[0].dataIndex === peakIndex) return '�?变更引发告警峰�?;
              return '';
            }
          }
        }
      },
      scales: {
        x: { grid: { color: '#F0F3F6' }, ticks: { font: { size: 10 }, color: '#8C959F', maxTicksLimit: 7, autoSkip: true } },
        y: {
          position: 'left', min: 0,
          grid: { color: '#F0F3F6' },
          ticks: { font: { family: 'Geist Mono', size: 10 }, color: '#8C959F', maxTicksLimit: 5 },
        },
        y1: {
          position: 'right', min: 0, max: 4,
          grid: { drawOnChartArea: false },
          ticks: { font: { family: 'Geist Mono', size: 10 }, color: '#CF222E', stepSize: 1 },
        },
      }
    }
  });
}

// ── 安全热力�?────────────────────────────────────────────
function initSecurityCharts() {
  initHeatmap();
  initTlsChart();
}

function initHeatmap() {
  const canvas = qs('#heatmapChart');
  if (!canvas) return;

  // �?scatter 散点图模拟热力图
  const hours = Array.from({length: 15}, (_, i) => i); // 00-14
  const protocols = ['HTTP', 'HTTPS', 'DNS', 'SSH', 'SMTP'];

  const baseData = [
    // normal traffic noise
    ...Array.from({length: 120}, () => ({
      x: Math.random() * 14,
      y: Math.floor(Math.random() * 5),
      r: Math.random() * 4 + 2,
      color: 'rgba(5,80,174,0.3)',
    })),
    // 02:17 DNS anomaly �?big red dots
    { x: 2.3, y: 2, r: 24, color: 'rgba(207,34,46,0.7)' },
    { x: 2.5, y: 2, r: 18, color: 'rgba(207,34,46,0.5)' },
    { x: 2.7, y: 2, r: 14, color: 'rgba(207,34,46,0.4)' },
  ];

  charts.heatmap = new Chart(canvas.getContext('2d'), {
    type: 'bubble',
    data: {
      datasets: protocols.map((p, pi) => ({
        label: p,
        data: baseData.filter(d => Math.floor(d.y) === pi).map(d => ({
          x: d.x, y: pi, r: d.r
        })),
        backgroundColor: baseData.filter(d => Math.floor(d.y) === pi).map(d => d.color),
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              if (ctx.raw.r > 15) return '�?异常流量峰值（AI 标注�?;
              return `${protocols[ctx.datasetIndex]} · ${Math.round(ctx.raw.x)}:00`;
            }
          }
        }
      },
      scales: {
        x: {
          min: 0, max: 14,
          grid: { color: '#F0F3F6' },
          ticks: {
            font: { family: 'Geist Mono', size: 9 }, color: '#8C959F',
            callback: v => `${String(Math.floor(v)).padStart(2,'0')}:00`
          },
          title: { display: false }
        },
        y: {
          min: -0.5, max: 4.5,
          grid: { color: '#F0F3F6' },
          ticks: {
            font: { size: 10 }, color: '#636C76',
            callback: v => protocols[v] || '',
            stepSize: 1,
          }
        }
      }
    }
  });
}

function initTlsChart() {
  const canvas = qs('#tlsChart');
  if (!canvas) return;

  charts.tls = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['TLS 1.3', 'TLS 1.2', 'TLS 1.0'],
      datasets: [{
        data: [67, 31, 2],
        backgroundColor: ['#1A7F37', '#D4A72C', '#CF222E'],
        borderWidth: 2,
        borderColor: '#fff',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` }
        }
      },
      cutout: '65%',
    }
  });
}

// ── AI Copilot ────────────────────────────────────────────
function initCopilot() {
  const btnCopilot = qs('#btnCopilot');
  const panel = qs('#copilotPanel');
  const btnClose = qs('#cpClose');
  const input = qs('#cpInput');
  const btnSend = qs('#cpSend');

  btnCopilot.addEventListener('click', () => {
    copilotOpen = !copilotOpen;
    panel.classList.toggle('open', copilotOpen);
    if (copilotOpen) {
      renderCopilotSuggestions(currentRole);
      input.focus();
    }
  });

  btnClose.addEventListener('click', () => {
    copilotOpen = false;
    panel.classList.remove('open');
  });

  btnSend.addEventListener('click', sendCopilotMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendCopilotMessage();
    }
  });
}

function renderCopilotSuggestions(role) {
  const container = qs('#cpSuggestions');
  const suggestions = ROLE_SUGGESTIONS[role] || [];
  container.innerHTML = suggestions.map(s =>
    `<button class="cp-suggest-btn" data-q="${s}">${s}</button>`
  ).join('');

  qsa('.cp-suggest-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      qs('#cpInput').value = btn.dataset.q;
      sendCopilotMessage();
    });
  });
}

function sendCopilotMessage() {
  const input = qs('#cpInput');
  const q = input.value.trim();
  if (!q) return;
  input.value = '';

  appendMessage('user', q);

  // 打字�?..
  const typingEl = document.createElement('div');
  typingEl.className = 'cp-msg cp-msg-ai';
  typingEl.innerHTML = `<div class="cp-typing"><span></span><span></span><span></span></div>`;
  qs('#cpMessages').appendChild(typingEl);
  scrollMessages();

  // 查找匹配答案
  const qas = COPILOT_QA[currentRole] || [];
  let answer = null;
  for (const qa of qas) {
    if (qa.q === q || q.includes(qa.q.slice(0,6))) {
      answer = qa.a;
      break;
    }
  }
  if (!answer) {
    answer = `正在分析�?{q}�?..\n\n基于当前数据中心实时数据，AI Copilot 将为您提供精准分析。（演示模式：请使用下方预设问题体验完整对话）`;
  }

  setTimeout(() => {
    typingEl.remove();
    appendMessage('ai', answer);
  }, 1200);
}

function appendMessage(role, text) {
  const msgs = qs('#cpMessages');
  const el = document.createElement('div');
  el.className = `cp-msg cp-msg-${role}`;
  el.innerHTML = `<div class="cp-bubble">${text}</div>`;
  msgs.appendChild(el);
  scrollMessages();
}

function scrollMessages() {
  const msgs = qs('#cpMessages');
  requestAnimationFrame(() => { msgs.scrollTop = msgs.scrollHeight; });
}

// ── 弹窗：云平台评分详情 + 完整报告 ─────────────────────────────
// ── 证据链详�?Modal ─────────────────────────────────────
function openEvidenceModal(eventId) {
  const ev = AI_EVENTS.find(e => e.id === eventId);
  const data = EVIDENCE_DATA[eventId];
  if (!ev || !data) return;

  // Header
  const icon = qs('#evidenceTitleIcon');
  icon.textContent = ev.type === '安全' ? 'security' : 'hub';
  icon.style.color = data.confColor;
  qs('#evidenceTitleText').textContent = `${ev.id} · ${ev.title}`;
  qs('#evidenceSubtitle').textContent = `AI ${ev.type}分析 · 置信�?${ev.conf} · 2026-04-28`;

  const levelCls = { crit: 'evd-tl-crit', warn: 'evd-tl-warn', info: 'evd-tl-info', ok: 'evd-tl-ok' };
  const valCls   = { crit: 'evd-tl-val-crit', warn: 'evd-tl-val-warn', info: 'evd-tl-val-info', ok: 'evd-tl-val-ok' };

  qs('#evidenceBody').innerHTML = `
    <div class="evd-conf-section">
      <span class="evd-conf-label">AI 置信�?/span>
      <div class="evd-conf-track">
        <div class="evd-conf-fill" style="width:${data.conf}%;background:${data.confColor}"></div>
      </div>
      <span class="evd-conf-val" style="color:${data.confColor}">${data.conf}%</span>
    </div>
    <div class="evd-summary">${data.summary}</div>
    <div class="evd-body-cols">
      <div>
        <div class="evd-sec-title">
          <span class="material-symbols-rounded">timeline</span>证据时间�?
        </div>
        <div class="evd-timeline">
          ${data.timeline.map((step, i) => `
            <div class="evd-tl-item">
              <div class="evd-tl-time">${step.time}</div>
              <div class="evd-tl-dot-col">
                <div class="evd-tl-dot ${levelCls[step.level] || 'evd-tl-info'}"></div>
                ${i < data.timeline.length - 1 ? '<div class="evd-tl-line"></div>' : ''}
              </div>
              <div class="evd-tl-content">
                <div class="evd-tl-title-row">
                  <span class="material-symbols-rounded" style="font-size:13px;color:#636C76;flex-shrink:0">${step.icon}</span>
                  <span class="evd-tl-title">${step.title}</span>
                  <span class="evd-tl-metric-chip">${step.metric}</span>
                  <span class="evd-tl-val ${valCls[step.level] || 'evd-tl-val-info'}">${step.val}</span>
                </div>
                <div class="evd-tl-desc">${step.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div>
          <div class="evd-sec-title">
            <span class="material-symbols-rounded">neurology</span>AI 推理过程
          </div>
          <div class="evd-reasoning">${data.reasoning}</div>
        </div>
        <div>
          <div class="evd-sec-title">
            <span class="material-symbols-rounded">block</span>已排除假�?
          </div>
          <div class="evd-elim-list">
            ${data.eliminated.map(e => `
              <div class="evd-elim-item">
                <div class="evd-elim-hyp">${e.hyp}</div>
                <div class="evd-elim-reason">${e.reason}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="evd-sec-title">
      <span class="material-symbols-rounded">account_tree</span>影响传导�?
    </div>
    <div class="evd-cascade">
      ${data.cascade.map((node, i) => `
        <div class="evd-cas-item ${node.cls}">
          <span class="material-symbols-rounded evd-cas-icon">${node.icon}</span>
          <span class="evd-cas-label">${node.label}</span>
          <span class="evd-cas-detail">${node.detail}</span>
        </div>
        ${i < data.cascade.length - 1 ? '<span class="evd-cas-arrow material-symbols-rounded">arrow_forward</span>' : ''}
      `).join('')}
    </div>
    <div class="evd-sec-title" style="margin-top:4px">
      <span class="material-symbols-rounded">lightbulb</span>处置建议
    </div>
    <div class="evd-sug-list">
      ${data.suggestions.map(s => `
        <div class="evd-sug-item">
          <span class="evd-sug-pri ${s.pri_cls}">${s.pri}</span>
          <div class="evd-sug-body">
            <span class="evd-sug-action">${s.action}</span>
            <span class="evd-sug-detail">${s.detail}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  qs('#evidenceOverlay').classList.add('open');
  qs('#evidenceModal').classList.add('open');
}

function initModals() {
  // 辅助函数：开�?modal
  function openModal(overlayId, panelId) {
    qs('#' + overlayId).classList.add('open');
    qs('#' + panelId).classList.add('open');
  }
  function closeModal(overlayId, panelId) {
    qs('#' + overlayId).classList.remove('open');
    qs('#' + panelId).classList.remove('open');
  }

  // 云平台扣分详情按�?
  qs('#btnCloudScore').addEventListener('click', () => {
    openModal('cloudScoreOverlay', 'cloudScoreModal');
  });

  // 查看完整报告按钮
  qs('#view-executive').addEventListener('click', (e) => {
    if (e.target.closest('.brief-btn-primary')) {
      openModal('fullReportOverlay', 'fullReportModal');
    }
  });

  // 关闭按钮
  qs('#cloudScoreClose').addEventListener('click', () => closeModal('cloudScoreOverlay', 'cloudScoreModal'));
  qs('#fullReportClose').addEventListener('click', () => closeModal('fullReportOverlay', 'fullReportModal'));

  // 点击遮罩关闭
  qs('#cloudScoreOverlay').addEventListener('click', () => closeModal('cloudScoreOverlay', 'cloudScoreModal'));
  qs('#fullReportOverlay').addEventListener('click', () => closeModal('fullReportOverlay', 'fullReportModal'));

  // 导出 PDF 占位交互
  qs('#exportReportBtn').addEventListener('click', () => {
    qs('#exportReportBtn').textContent = '正在生成...';
    setTimeout(() => {
      qs('#exportReportBtn').innerHTML = '<span class="material-symbols-rounded">picture_as_pdf</span> 导出 PDF';
      alert('PDF 生成完成（演示模式）');
    }, 1500);
  });

  // 证据链详情：事件代理（告警抽�?AI 面板�?
  qs('#drawerBodyAi').addEventListener('click', e => {
    const btn = e.target.closest('.evd-btn');
    if (btn) openEvidenceModal(btn.dataset.evid);
  });
  qs('#evidenceClose').addEventListener('click', () => closeModal('evidenceOverlay', 'evidenceModal'));
  qs('#evidenceOverlay').addEventListener('click', () => closeModal('evidenceOverlay', 'evidenceModal'));
}

// ══════════════════════════════════════════════════════════
//  网络运维处视�?JS
// ══════════════════════════════════════════════════════════

// ── ops 状�?─────────────────────────────────────────────
let opsInited = false;
let opsSubPage = 'ops-overview';
let opsCharts = {};
let topoLevel = 'global';      // global | dc | floor
let topoSelectedDC = null;
let topoSelectedFloor = null;
let topoFilter = 'all';
let topoHighlightNode = null;
let topoG6Graph = null;
let invAllDevices = [];
let faultFilterSev = 'ALL';
let selectedFaultId = null;

// ── 设备台账数据 ─────────────────────────────────────────
const INV_DEVICES = [
  { name:'SW-Core-01', type:'交换�?, model:'H3C S12508X-AF', ip:'10.0.0.1',  zone:'核心�?, room:'1号机房B�?, cpu:52, mem:61, portTotal:128, portUsed:87, health:'正常', alerts:0,  lastInsp:'1天前'  },
  { name:'SW-Core-02', type:'交换�?, model:'H3C S12508X-AF', ip:'10.0.0.2',  zone:'核心�?, room:'1号机房B�?, cpu:89, mem:74, portTotal:128, portUsed:88, health:'告警', alerts:3,  lastInsp:'2天前'  },
  { name:'SW-Core-03', type:'交换�?, model:'H3C S12508X-AF', ip:'10.0.0.3',  zone:'核心�?, room:'2号机房A�?, cpu:44, mem:55, portTotal:128, portUsed:72, health:'正常', alerts:0,  lastInsp:'1天前'  },
  { name:'SW-AGG-B01', type:'交换�?, model:'H3C S10508',     ip:'10.1.1.1',  zone:'汇聚�?, room:'1号机房B�?, cpu:38, mem:48, portTotal:48,  portUsed:36, health:'正常', alerts:0,  lastInsp:'3天前'  },
  { name:'SW-AGG-B02', type:'交换�?, model:'H3C S10508',     ip:'10.1.1.2',  zone:'汇聚�?, room:'1号机房B�?, cpu:41, mem:51, portTotal:48,  portUsed:38, health:'正常', alerts:0,  lastInsp:'3天前'  },
  { name:'ACC-B01',    type:'交换�?, model:'H3C S5560X',     ip:'10.2.1.1',  zone:'接入�?, room:'1号机房B�?, cpu:22, mem:35, portTotal:48,  portUsed:42, health:'正常', alerts:1,  lastInsp:'5天前'  },
  { name:'ACC-B02',    type:'交换�?, model:'H3C S5560X',     ip:'10.2.1.2',  zone:'接入�?, room:'1号机房B�?, cpu:19, mem:32, portTotal:48,  portUsed:40, health:'正常', alerts:1,  lastInsp:'5天前'  },
  { name:'ACC-A01',    type:'交换�?, model:'H3C S5560X',     ip:'10.2.2.1',  zone:'接入�?, room:'2号机房A�?, cpu:28, mem:41, portTotal:48,  portUsed:35, health:'正常', alerts:0,  lastInsp:'4天前'  },
  { name:'ACC-A02',    type:'交换�?, model:'H3C S5560X',     ip:'10.2.2.2',  zone:'接入�?, room:'2号机房A�?, cpu:31, mem:44, portTotal:48,  portUsed:37, health:'正常', alerts:0,  lastInsp:'4天前'  },
  { name:'FW-OUT-01',  type:'防火�?, model:'华为 USG6680',    ip:'10.0.10.1', zone:'出口�?, room:'1号机房A�?, cpu:67, mem:72, portTotal:16,  portUsed:12, health:'告警', alerts:1,  lastInsp:'1天前'  },
  { name:'FW-OUT-02',  type:'防火�?, model:'华为 USG6680',    ip:'10.0.10.2', zone:'出口�?, room:'1号机房A�?, cpu:63, mem:68, portTotal:16,  portUsed:12, health:'正常', alerts:0,  lastInsp:'1天前'  },
  { name:'RT-WAN-01',  type:'路由�?, model:'H3C CR16010',     ip:'10.0.20.1', zone:'出口�?, room:'1号机房A�?, cpu:58, mem:49, portTotal:8,   portUsed:6,  health:'告警', alerts:2,  lastInsp:'2天前'  },
  { name:'RT-WAN-02',  type:'路由�?, model:'H3C CR16010',     ip:'10.0.20.2', zone:'出口�?, room:'1号机房A�?, cpu:52, mem:47, portTotal:8,   portUsed:6,  health:'正常', alerts:0,  lastInsp:'2天前'  },
  { name:'LB-WEB-01',  type:'负载均衡', model:'F5 BIG-IP 2200', ip:'10.0.30.1', zone:'DMZ�?, room:'1号机房C�?, cpu:44, mem:58, portTotal:8,   portUsed:4,  health:'正常', alerts:0,  lastInsp:'7天前'  },
  { name:'LB-WEB-02',  type:'负载均衡', model:'F5 BIG-IP 2200', ip:'10.0.30.2', zone:'DMZ�?, room:'1号机房C�?, cpu:41, mem:55, portTotal:8,   portUsed:4,  health:'正常', alerts:0,  lastInsp:'7天前'  },
];

// ── 故障事件数据 ─────────────────────────────────────────
const FAULT_EVENTS = [
  {
    id:'F001', pri:'P1', status:'处置�?, title:'B�?6号机柜精密空调故�?, time:'14:21',
    domain:'物理层→网络�?, icon:'ac_unit', iconColor:'#CF222E',
    tags:['机房基础', 'SW-Core-02', 'VLAN100', 'ERP'],
    rca: {
      conf:96, color:'#1A7F37',
      rootCause:'PAC-B06 精密空调控制板故障，制冷停止导致 SW-Core-02 热降�?,
      chain:[
        { icon:'thermostat',      text:'TMP-B06-1: 38.2°C（阈�?32°C�?,          time:'14:21:03', sev:'crit' },
        { icon:'power_off',       text:'PAC-B06 控制器停止响�?,                  time:'14:22:17', sev:'crit' },
        { icon:'device_thermostat',text:'SW-Core-02 热降�?CPU 34%�?9%',          time:'14:23:07', sev:'crit' },
        { icon:'network_check',   text:'VLAN100 延迟 +340ms · 3接口错误率上�?,   time:'14:23:15', sev:'warn' },
        { icon:'web_asset',       text:'ERP P99 响应 2100ms（SLA 500ms�?,         time:'14:23:17', sev:'crit' },
      ],
      dataSources:['DCIM（温度传感器�?,'NMS（CPU/端口�?,'NTA（流量）','APM（ERP延迟�?],
      impact:'1台核心交换机 · 2台汇�?· VLAN100 · 14VM · ERP系统',
    }
  },
  {
    id:'F002', pri:'P2', status:'已关�?, title:'WAN-01 带宽持续超阈值告�?, time:'09:14',
    domain:'网络层→业务�?, icon:'router', iconColor:'#9A6700',
    tags:['出口�?, 'WAN-01', '带宽'],
    rca: {
      conf:88, color:'#D09B00',
      rootCause:'季度末业务高峰叠�?WAN-01 链路 1G 瓶颈，利用率 84% 并持续上�?,
      chain:[
        { icon:'trending_up',  text:'WAN-01 接口流量�?40Mbps（阈�?800Mbps�?, time:'09:14:22', sev:'warn' },
        { icon:'show_chart',   text:'AI 预测�?8h 内达�?91% 利用�?,             time:'09:15:00', sev:'warn' },
        { icon:'cloud_upload', text:'NTA 识别：ERP/OA 备份任务占用 18%',          time:'09:16:00', sev:'info' },
      ],
      dataSources:['NMS（接口计数器�?,'NTA（流量识别）'],
      impact:'出口带宽即将成为业务瓶颈，季度末高峰存在丢包风险',
    }
  },
  {
    id:'F003', pri:'P3', status:'已关�?, title:'ACC-B01/B02 接口错误率告�?, time:'08:02',
    domain:'网络�?, icon:'settings_input_component', iconColor:'#636C76',
    tags:['接入�?, 'ACC-B01', 'ACC-B02'],
    rca: {
      conf:79, color:'#636C76',
      rootCause:'SW-Core-02 热降频导致下联接入层接口错误帧增加（关联 F001�?,
      chain:[
        { icon:'error_outline',  text:'ACC-B01 Gi0/1~Gi0/3 错误�?2.1%',          time:'14:23:09', sev:'warn' },
        { icon:'link',           text:'关联 F001：SW-Core-02 降频，转发错误扩�?, time:'14:23:15', sev:'info' },
      ],
      dataSources:['NMS（接口错误计数器�?],
      impact:'下联 VM 集群部分接口质量下降，已�?F001 处置后恢�?,
    }
  },
];

// ── 关键链路数据 ─────────────────────────────────────────
const OPS_LINKS = [
  { name:'WAN-01 (出口互联�?', util:84, capacity:'1G',  status:'warn',  aiNote:'预测 48h �?91%' },
  { name:'WAN-02 (备用互联�?', util:12, capacity:'1G',  status:'ok',    aiNote:null },
  { name:'SW-Core-01 上行',     util:62, capacity:'100G', status:'ok',    aiNote:null },
  { name:'SW-Core-02 上行',     util:89, capacity:'100G', status:'crit',  aiNote:'热降频，转发能力�?60%' },
  { name:'DC互联 A-B',          util:44, capacity:'10G',  status:'ok',    aiNote:null },
  { name:'存储�?iSCSI-02',     util:78, capacity:'10G',  status:'warn',  aiNote:'错误率轻微上�? },
];

// ── 流量 Top10 主机 ──────────────────────────────────────
const TRF_TOP_HOSTS = [
  { ip:'10.10.2.47',   name:'VM-Prod-047', bps:'8.4Gbps', proto:'DNS异常', flag:'red'    },
  { ip:'10.10.5.101',  name:'APP-SRV-01',  bps:'4.2Gbps', proto:'TCP/8080', flag:'yellow' },
  { ip:'10.10.5.102',  name:'APP-SRV-02',  bps:'3.9Gbps', proto:'TCP/8080', flag:null     },
  { ip:'10.10.8.200',  name:'DB-CRM-01',   bps:'2.8Gbps', proto:'MySQL',   flag:null     },
  { ip:'10.10.8.201',  name:'DB-CRM-02',   bps:'2.6Gbps', proto:'MySQL',   flag:null     },
  { ip:'10.10.1.50',   name:'BACKUP-SRV',  bps:'2.1Gbps', proto:'rsync',   flag:null     },
  { ip:'10.10.3.11',   name:'ERP-SRV-01',  bps:'1.9Gbps', proto:'TCP/443', flag:null     },
  { ip:'10.10.3.12',   name:'ERP-SRV-02',  bps:'1.7Gbps', proto:'TCP/443', flag:null     },
  { ip:'10.10.9.5',    name:'NFS-STOR-01', bps:'1.4Gbps', proto:'NFS/2049',flag:null     },
  { ip:'10.10.9.6',    name:'NFS-STOR-02', bps:'1.2Gbps', proto:'NFS/2049',flag:null     },
];

// ── 流量异常 ────────────────────────────────────────────
const TRF_ANOMALIES = [
  {
    icon:'security', sev:'crit',
    title:'VM-Prod-047 DNS 隧道外连',
    desc:'420�?�?DNS 查询，目�?IP 命中 APT C2 威胁情报库，AI 置信�?93%',
    time:'14:10', action:'已隔�?
  },
  {
    icon:'upload', sev:'warn',
    title:'BACKUP-SRV �?WAN 异常备份流量',
    desc:'2.1Gbps rsync 流量占出口带�?21%，与备份策略窗口不符',
    time:'09:03', action:'告警�?
  },
];

// ── 链路详细数据 v2 (流量分析重设计) ─────────────────────
const TRF_LINKS = [
  { id:'wan1',  name:'WAN-01',     label:'电信出口',  zone:'互联网大区', util:84, capacity:'1G',   status:'warn', aiNote:'预计 48h 后达 91%',      trend:[72,75,78,80,82,84] },
  { id:'wan2',  name:'WAN-02',     label:'联通备用',  zone:'互联网大区', util:12, capacity:'1G',   status:'ok',   aiNote:null,                       trend:[10,11,12,11,12,12] },
  { id:'core1', name:'SW-Core-01', label:'核心上行',  zone:'内网核心',   util:62, capacity:'100G', status:'ok',   aiNote:null,                       trend:[55,58,60,61,62,62] },
  { id:'core2', name:'SW-Core-02', label:'核心上行',  zone:'内网核心',   util:89, capacity:'100G', status:'crit', aiNote:'热降频·有效带宽降至60%',  trend:[70,75,80,85,87,89] },
  { id:'dcab',  name:'DC互联 A-B', label:'DC间互联',  zone:'骨干网',     util:44, capacity:'10G',  status:'ok',   aiNote:null,                       trend:[40,42,41,43,44,44] },
  { id:'iscsi', name:'iSCSI-02',   label:'存储专网',  zone:'存储网络',   util:78, capacity:'10G',  status:'warn', aiNote:'错误率轻微上升',           trend:[68,70,72,74,76,78] },
];
const TRF_LINK_TRENDS = {
  wan1:  { data:[220,210,205,198,205,230,350,540,610,680,720,750,740,730,750,760,790,810,840,820,800,770,740,700], color:'#0969DA', bg:'rgba(9,105,218,0.08)',   aiNote:'AI 预测：明日峰值 855 Mbps，建议开启 SD-WAN 流量调度策略' },
  wan2:  { data:[60,58,55,52,55,62,80,95,110,118,115,112,110,108,112,115,120,125,115,110,108,105,100,95],          color:'#1A7F37', bg:'rgba(26,127,55,0.07)',   aiNote:null },
  core1: { data:[500,490,480,470,490,540,620,720,750,780,800,810,800,790,810,820,830,840,860,850,840,820,800,760],  color:'#6E40C9', bg:'rgba(110,64,201,0.07)', aiNote:null },
  core2: { data:[600,590,580,570,590,640,750,820,860,890,920,940,960,980,980,820,780,750,720,700,690,680,670,650],  color:'#CF222E', bg:'rgba(207,34,46,0.07)',  aiNote:'AI 分析：14:00 后热降频，有效转发能力下降约 40%' },
  dcab:  { data:[280,275,270,265,272,290,320,380,400,420,430,440,435,428,440,450,460,465,460,455,448,440,430,410],  color:'#D09B00', bg:'rgba(209,155,0,0.07)',  aiNote:null },
  iscsi: { data:[320,315,310,305,315,340,400,480,520,540,550,560,558,552,560,568,576,580,578,572,565,558,548,530],  color:'#9A6700', bg:'rgba(154,103,0,0.07)',  aiNote:'AI 分析：错误率从 09:00 起轻微上升，当前 0.03%' },
};
const TRF_TOP_BY_ZONE = {
  wan: [
    { ip:'10.10.2.47',  name:'VM-Prod-047', bps:'8.4Gbps', pct:84, proto:'DNS',      flag:'crit', note:'APT C2 威胁' },
    { ip:'10.10.1.50',  name:'BACKUP-SRV',  bps:'2.1Gbps', pct:21, proto:'rsync',    flag:'warn', note:'窗口外备份' },
    { ip:'10.10.5.101', name:'APP-SRV-01',  bps:'1.8Gbps', pct:18, proto:'HTTPS',    flag:null,   note:null },
    { ip:'10.10.5.102', name:'APP-SRV-02',  bps:'1.6Gbps', pct:16, proto:'HTTPS',    flag:null,   note:null },
    { ip:'10.10.3.11',  name:'ERP-SRV-01',  bps:'0.9Gbps', pct:9,  proto:'HTTPS',    flag:null,   note:null },
  ],
  core: [
    { ip:'10.10.5.101', name:'APP-SRV-01',  bps:'4.2Gbps', pct:42, proto:'TCP/8080', flag:'warn', note:'突发流量' },
    { ip:'10.10.5.102', name:'APP-SRV-02',  bps:'3.9Gbps', pct:39, proto:'TCP/8080', flag:null,   note:null },
    { ip:'10.10.8.200', name:'DB-CRM-01',   bps:'2.8Gbps', pct:28, proto:'MySQL',    flag:null,   note:null },
    { ip:'10.10.8.201', name:'DB-CRM-02',   bps:'2.6Gbps', pct:26, proto:'MySQL',    flag:null,   note:null },
    { ip:'10.10.3.11',  name:'ERP-SRV-01',  bps:'1.9Gbps', pct:19, proto:'TCP/443',  flag:null,   note:null },
    { ip:'10.10.3.12',  name:'ERP-SRV-02',  bps:'1.7Gbps', pct:17, proto:'TCP/443',  flag:null,   note:null },
    { ip:'10.10.12.15', name:'MIS-SRV-01',  bps:'1.2Gbps', pct:12, proto:'TCP/80',   flag:null,   note:null },
  ],
  dc: [
    { ip:'10.10.9.5',   name:'NFS-STOR-01', bps:'1.4Gbps', pct:56, proto:'NFS/2049', flag:null,   note:null },
    { ip:'10.10.9.6',   name:'NFS-STOR-02', bps:'1.2Gbps', pct:48, proto:'NFS/2049', flag:null,   note:null },
    { ip:'10.10.9.20',  name:'iSCSI-TGT-01',bps:'0.9Gbps', pct:36, proto:'iSCSI',    flag:'warn', note:'延迟上升' },
    { ip:'10.10.2.10',  name:'VM-ESXi-01',  bps:'0.7Gbps', pct:28, proto:'vMotion',  flag:null,   note:null },
    { ip:'10.10.2.11',  name:'VM-ESXi-02',  bps:'0.6Gbps', pct:24, proto:'vMotion',  flag:null,   note:null },
  ],
};
const TRF_ANOMALIES_V2 = [
  { icon:'security',          sev:'crit', title:'VM-Prod-047 DNS 隧道外连',  desc:'420次/分 DNS 查询命中 APT C2 威胁情报，AI 置信度 93%',  time:'14:10', action:'已隔离', link:'WAN-01' },
  { icon:'upload',            sev:'warn', title:'BACKUP-SRV 异常大流量',      desc:'2.1Gbps rsync 占出口带宽 21%，与备份窗口不符，置信度 88%', time:'09:03', action:'告警中', link:'WAN-01' },
  { icon:'device_thermostat', sev:'warn', title:'SW-Core-02 热降频流量异常',  desc:'CPU 热降频后转发能力降至 60%，下游设备级联受影响',      time:'14:03', action:'处置中', link:'SW-Core-02' },
];
const TRF_CAPACITY = [
  { link:'WAN-01 电信出口',   util:84, etaText:'预计 48h 后利用率达 91%',    risk:'high', advice:'建议开启 SD-WAN 调度，将部分流量迁移至 WAN-02 联通备用线路', action:'生成调度策略' },
  { link:'SW-Core-02 上行',   util:89, etaText:'热降频致有效带宽降至 60%',   risk:'crit', advice:'优先检修 PAC-B06 精密空调，恢复核心交换机满血转发能力',    action:'创建工单' },
  { link:'iSCSI-02 存储专网', util:78, etaText:'预计 14 天后利用率达 85%',   risk:'med',  advice:'存储 I/O 错误率轻微上升，建议检查 SFP 光模块及光纤链路质量',action:'查看详情' },
];

// ── 多源融合数据 ─────────────────────────────────────────
const OPS_FUSION_SOURCES = [
  { name:'NMS (H3C SNMP)', icon:'router',         count:1247, status:'ok',   desc:'设备性能·端口状态·LLDP拓扑' },
  { name:'NTA (sFlow)',    icon:'area_chart',      count:8832, status:'ok',   desc:'流量识别·协议分布·TopN主机' },
  { name:'巡检工具 (SSH)',  icon:'terminal',        count:156,  status:'ok',   desc:'配置核查·端口错误·日志' },
  { name:'HostMonitor',    icon:'monitor_heart',   count:2341, status:'ok',   desc:'ICMP连通·端到端延迟' },
  { name:'DCIM/动环',       icon:'thermostat',      count:428,  status:'warn', desc:'温度·电力·精密空调（部分延迟）' },
  { name:'3D 机房',        icon:'view_in_ar',      count:89,   status:'warn', desc:'机柜位置·物理连线（部分延迟）' },
];

// ════════════════════════════════════════════════════════
//  拓扑数据 �?企业级真实网络架�?
// ════════════════════════════════════════════════════════

// 设备类型视觉样式
const TOPO_NODE_STYLES = {
  router:     { bg:'#EEF2FF', bd:'#3B82F6', tc:'#1D4ED8', abbr:'RT'  },
  firewall:   { bg:'#FEE2E2', bd:'#DC2626', tc:'#991B1B', abbr:'FW'  },
  waf:        { bg:'#EDE9FE', bd:'#7C3AED', tc:'#5B21B6', abbr:'WAF' },
  slb:        { bg:'#DBEAFE', bd:'#2563EB', tc:'#1E40AF', abbr:'SLB' },
  ips:        { bg:'#FEF3C7', bd:'#D97706', tc:'#92400E', abbr:'IPS' },
  coreswitch: { bg:'#D1FAE5', bd:'#059669', tc:'#065F46', abbr:'CSW' },
  aggswitch:  { bg:'#ECFDF5', bd:'#10B981', tc:'#065F46', abbr:'AGG' },
  accswitch:  { bg:'#F3F4F6', bd:'#6B7280', tc:'#374151', abbr:'ACC' },
  sanswitch:  { bg:'#FEF3C7', bd:'#F59E0B', tc:'#92400E', abbr:'SAN' },
  bastion:    { bg:'#EDE9FE', bd:'#8B5CF6', tc:'#4C1D95', abbr:'JH'  },
};

// 全局拓扑（站点视图）
const TOPO_GLOBAL = {
  sites: [
    { id:'dc1', label:'主数据中�?(DC-A)', status:'warn', rooms:4, devices:87 },
    { id:'dc2', label:'灾备中心 (DC-B)',   status:'ok',   rooms:2, devices:43 },
    { id:'dc3', label:'边缘节点 (PoP-C)', status:'ok',   rooms:1, devices:12 },
  ],
  links: [
    { from:'dc1', to:'dc2', type:'ok', label:'MPLS 100G 专线' },
    { from:'dc1', to:'dc3', type:'ok', label:'MPLS 10G'       },
    { from:'dc2', to:'dc3', type:'ok', label:'MPLS 10G'       },
  ]
};

// ── DC-A：主数据中心 完整企业级架�?─────────────────────
const TOPO_DC1 = {
  title: '主数据中�?DC-A',
  layers: [
    { id:'l-wan',  label:'互联网出�?/ WAN 接入',        yr:0.09 },
    { id:'l-ext',  label:'边界防火�?/ IPS',              yr:0.24 },
    { id:'l-dmz',  label:'DMZ �?(WAF · SLB · 堡垒�?', yr:0.40 },
    { id:'l-core', label:'核心交换�?(VSS)',               yr:0.57 },
    { id:'l-agg',  label:'汇聚交换�?,                    yr:0.73 },
    { id:'l-acc',  label:'接入交换�?,                    yr:0.89 },
  ],
  nodes: [
    // 互联网出�?/ WAN
    { id:'rt-ct',    layer:'l-wan',  label:'ISP-CT-01',   sub:'中国电信 1G×2',      type:'router',     status:'ok',   xr:0.11, alerts:0, cpu:22, ip:'100.1.1.1',  model:'Cisco ASR 1002X',  role:'互联网接入路由器' },
    { id:'rt-cu',    layer:'l-wan',  label:'ISP-CU-01',   sub:'中国联�?1G×2',      type:'router',     status:'ok',   xr:0.34, alerts:0, cpu:18, ip:'100.2.1.1',  model:'H3C MSR 5600',     role:'互联网接入路由器' },
    { id:'rt-mpls',  layer:'l-wan',  label:'MPLS-PE-01',  sub:'100G 专线�?,         type:'router',     status:'ok',   xr:0.63, alerts:0, cpu:12, ip:'10.254.1.1', model:'Cisco ASR 9001',   role:'MPLS 专线路由�?  },
    { id:'rt-mpls2', layer:'l-wan',  label:'MPLS-PE-02',  sub:'100G 专线�?,         type:'router',     status:'ok',   xr:0.85, alerts:0, cpu:8,  ip:'10.254.1.2', model:'Cisco ASR 9001',   role:'MPLS 专线路由�?  },
    // 边界防火�?/ IPS
    { id:'fw-ext1',  layer:'l-ext',  label:'NGFW-EXT-01', sub:'边界FW Active',       type:'firewall',   status:'ok',   xr:0.17, alerts:0, cpu:45, ip:'10.1.0.1',   model:'华为 USG6730E',    role:'下一代边界防火墙' },
    { id:'fw-ext2',  layer:'l-ext',  label:'NGFW-EXT-02', sub:'边界FW Standby �?,   type:'firewall',   status:'warn', xr:0.40, alerts:2, cpu:62, ip:'10.1.0.2',   model:'华为 USG6730E',    role:'下一代边界防火墙' },
    { id:'ips-01',   layer:'l-ext',  label:'IPS-01',      sub:'在线IPS 主用',        type:'ips',        status:'ok',   xr:0.63, alerts:0, cpu:38, ip:'10.1.0.10',  model:'深信�?IDPV-2000', role:'在线入侵防御系统' },
    { id:'ips-02',   layer:'l-ext',  label:'IPS-02',      sub:'在线IPS 热备',        type:'ips',        status:'ok',   xr:0.83, alerts:0, cpu:32, ip:'10.1.0.11',  model:'深信�?IDPV-2000', role:'在线入侵防御系统' },
    // DMZ �?
    { id:'waf-01',   layer:'l-dmz',  label:'WAF-01',      sub:'WAF 主用',            type:'waf',        status:'ok',   xr:0.10, alerts:0, cpu:32, ip:'10.2.0.1',   model:'绿盟 ADS-2100',    role:'Web 应用防火�?   },
    { id:'waf-02',   layer:'l-dmz',  label:'WAF-02',      sub:'WAF 热备',            type:'waf',        status:'ok',   xr:0.26, alerts:0, cpu:28, ip:'10.2.0.2',   model:'绿盟 ADS-2100',    role:'Web 应用防火�?   },
    { id:'slb-01',   layer:'l-dmz',  label:'SLB-01',      sub:'负载均衡 Active',     type:'slb',        status:'ok',   xr:0.46, alerts:0, cpu:55, ip:'10.2.0.10',  model:'F5 BIG-IP LTM',    role:'应用负载均衡�?   },
    { id:'slb-02',   layer:'l-dmz',  label:'SLB-02',      sub:'负载均衡 Standby',    type:'slb',        status:'ok',   xr:0.63, alerts:0, cpu:40, ip:'10.2.0.11',  model:'F5 BIG-IP LTM',    role:'应用负载均衡�?   },
    { id:'jump-01',  layer:'l-dmz',  label:'BASTION-01',  sub:'堡垒�?跳板�?,       type:'bastion',    status:'ok',   xr:0.82, alerts:0, cpu:18, ip:'10.2.0.20',  model:'CyberArk PAS',     role:'统一堡垒�?       },
    // 核心交换�?
    { id:'core-01',  layer:'l-core', label:'SW-CORE-01',  sub:'VSS Master',          type:'coreswitch', status:'ok',   xr:0.30, alerts:0, cpu:42, ip:'10.0.0.1',   model:'H3C S12500X-AF',   role:'核心交换�?       },
    { id:'core-02',  layer:'l-core', label:'SW-CORE-02',  sub:'VSS Slave �?,        type:'coreswitch', status:'crit', xr:0.63, alerts:3, cpu:89, ip:'10.0.0.2',   model:'H3C S12500X-AF',   role:'核心交换�?       },
    // 汇聚交换�?
    { id:'agg-prd1', layer:'l-agg',  label:'AGG-PRD-01',  sub:'生产汇聚 �?,         type:'aggswitch',  status:'ok',   xr:0.12, alerts:0, cpu:35, ip:'10.3.0.1',   model:'H3C S6800',        role:'生产区汇聚交换机' },
    { id:'agg-prd2', layer:'l-agg',  label:'AGG-PRD-02',  sub:'生产汇聚 �?,         type:'aggswitch',  status:'ok',   xr:0.32, alerts:0, cpu:28, ip:'10.3.0.2',   model:'H3C S6800',        role:'生产区汇聚交换机' },
    { id:'agg-sto',  layer:'l-agg',  label:'AGG-STO-01',  sub:'存储网络汇聚',        type:'sanswitch',  status:'ok',   xr:0.57, alerts:0, cpu:22, ip:'10.3.0.10',  model:'Brocade 6510',     role:'SAN 存储汇聚'     },
    { id:'agg-oam',  layer:'l-agg',  label:'AGG-OAM-01',  sub:'带外管理汇聚',        type:'aggswitch',  status:'ok',   xr:0.79, alerts:0, cpu:15, ip:'10.3.0.20',  model:'H3C S5130',        role:'带外管理汇聚'     },
    // 接入交换�?
    { id:'acc-01',   layer:'l-acc',  label:'ACC-PRD-01',  sub:'生产接入',            type:'accswitch',  status:'ok',   xr:0.07, alerts:0, cpu:20, ip:'10.4.0.1',   model:'H3C S5560',        role:'生产服务器接�?   },
    { id:'acc-02',   layer:'l-acc',  label:'ACC-PRD-02',  sub:'生产接入 �?,         type:'accswitch',  status:'warn', xr:0.23, alerts:1, cpu:25, ip:'10.4.0.2',   model:'H3C S5560',        role:'生产服务器接�?   },
    { id:'acc-03',   layer:'l-acc',  label:'ACC-PRD-03',  sub:'生产接入',            type:'accswitch',  status:'ok',   xr:0.40, alerts:0, cpu:18, ip:'10.4.0.3',   model:'H3C S5560',        role:'生产服务器接�?   },
    { id:'san-sw1',  layer:'l-acc',  label:'SAN-SW-01',   sub:'FC SAN �?,           type:'sanswitch',  status:'ok',   xr:0.58, alerts:0, cpu:30, ip:'10.4.1.1',   model:'Brocade 300',      role:'光纤通道存储网络' },
    { id:'san-sw2',  layer:'l-acc',  label:'SAN-SW-02',   sub:'FC SAN �?,           type:'sanswitch',  status:'ok',   xr:0.74, alerts:0, cpu:25, ip:'10.4.1.2',   model:'Brocade 300',      role:'光纤通道存储网络' },
    { id:'acc-oam',  layer:'l-acc',  label:'ACC-OAM-01',  sub:'管理接入',            type:'accswitch',  status:'ok',   xr:0.88, alerts:0, cpu:12, ip:'10.4.2.1',   model:'H3C S5130',        role:'带外管理接入'     },
  ],
  links: [
    // ISP路由�?�?边界防火�?
    { from:'rt-ct',    to:'fw-ext1',  type:'ok'                },
    { from:'rt-ct',    to:'fw-ext2',  type:'ok'                },
    { from:'rt-cu',    to:'fw-ext1',  type:'ok'                },
    { from:'rt-cu',    to:'fw-ext2',  type:'ok'                },
    // MPLS专线 �?核心交换（直连绕过FW�?
    { from:'rt-mpls',  to:'core-01',  type:'ok',  label:'10G专线' },
    { from:'rt-mpls2', to:'core-02',  type:'ok',  label:'10G专线' },
    // 边界FW �?IPS（串联）
    { from:'fw-ext1',  to:'ips-01',   type:'ok'                },
    { from:'fw-ext2',  to:'ips-02',   type:'warn'              },
    // IPS �?DMZ（WAF/SLB�?
    { from:'ips-01',   to:'waf-01',   type:'ok'                },
    { from:'ips-01',   to:'slb-01',   type:'ok'                },
    { from:'ips-02',   to:'waf-02',   type:'ok'                },
    { from:'ips-02',   to:'slb-02',   type:'ok'                },
    // 边界FW �?核心（内网流量通道�?
    { from:'fw-ext1',  to:'core-01',  type:'ok',  label:'10G'  },
    { from:'fw-ext2',  to:'core-02',  type:'warn',label:'10G'  },
    // DMZ/堡垒�?�?核心
    { from:'waf-01',   to:'core-01',  type:'ok'                },
    { from:'slb-01',   to:'core-01',  type:'ok'                },
    { from:'jump-01',  to:'core-01',  type:'ok'                },
    // 核心 HA 互联
    { from:'core-01',  to:'core-02',  type:'crit',label:'VSS 40G' },
    // 核心 �?汇聚
    { from:'core-01',  to:'agg-prd1', type:'ok',  label:'40G'  },
    { from:'core-01',  to:'agg-prd2', type:'ok',  label:'40G'  },
    { from:'core-02',  to:'agg-prd1', type:'ok',  label:'40G'  },
    { from:'core-02',  to:'agg-prd2', type:'crit',label:'40G'  },
    { from:'core-01',  to:'agg-sto',  type:'ok',  label:'10G'  },
    { from:'core-01',  to:'agg-oam',  type:'ok',  label:'GE'   },
    // 汇聚 �?接入
    { from:'agg-prd1', to:'acc-01',   type:'ok',  label:'10G'  },
    { from:'agg-prd1', to:'acc-02',   type:'warn',label:'10G'  },
    { from:'agg-prd2', to:'acc-02',   type:'ok',  label:'10G'  },
    { from:'agg-prd2', to:'acc-03',   type:'ok',  label:'10G'  },
    { from:'agg-sto',  to:'san-sw1',  type:'ok',  label:'8G FC'},
    { from:'agg-sto',  to:'san-sw2',  type:'ok',  label:'8G FC'},
    { from:'agg-oam',  to:'acc-oam',  type:'ok',  label:'GE'   },
  ]
};

// ── AI Analysis Data for DC-A ─────────────────────────────
const TOPO_DC1_AI = {
  nodeAnalysis: {
    'fw-ext2': {
      incidentId: 'INC-2024-001',
      rootCause: '�?SW-CORE-02 同属热障碍事�?· 机柜温升使防火墙会话表压力达 78%，HA 心跳出现 120ms 抖动',
      confidence: 87,
      blastRadius: ['ips-02', 'waf-02', 'slb-02'],
      predictEta: null,
      actions: ['检�?NGFW-EXT-02 会话表使用率', '确认 HA 心跳与主备切换状�?, '临时切换流量至主�?NGFW-EXT-01']
    },
    'core-02': {
      incidentId: 'INC-2024-001',
      rootCause: '精密空调 PAC-B06 故障停止制冷，机柜温升至 38.2°C，SW-CORE-02 触发 CPU 热降�?34%�?9%，VSS 心跳延迟增大',
      confidence: 96,
      blastRadius: ['agg-prd1', 'agg-prd2', 'acc-01', 'acc-02', 'acc-03'],
      predictEta: '�?若不处置，预�?1.5h 内触发设备保护性关�?,
      actions: ['立即开启机柜应急送风', '�?VSS 主控切换�?SW-CORE-01', '通知工程师检�?PAC-B06']
    },
    'acc-02': {
      incidentId: 'INC-2024-001',
      rootCause: 'SW-CORE-02 热降频后转发异常经汇聚层扩散，ACC-PRD-02 接口错误率上升至 2.1%，与 INC-2024-001 级联关联',
      confidence: 79,
      blastRadius: [],
      predictEta: null,
      actions: ['持续观察接口错误�?, '此设备将�?SW-CORE-02 处置完成后自动恢�?]
    }
  },
  correlations: [
    { from: 'fw-ext2', to: 'core-02', incidentId: 'INC-001', label: '同源事件', conf: 87 },
    { from: 'core-02', to: 'acc-02',  incidentId: 'INC-001', label: '故障扩散', conf: 79 }
  ],
  risks: [
    { nodeId: 'agg-prd1', reason: 'CPU 利用率持�?6h 上升趋势', eta: '~3h 后达告警阈�?, conf: 72 }
  ]
};

const TOPO_AI_MAP = { dc1: TOPO_DC1_AI };

// ── DC-B：灾备中�?───────────────────────────────────────
const TOPO_DC2 = {
  title: '灾备中心 DC-B',
  layers: [
    { id:'l-wan',  label:'WAN / 专线接入',     yr:0.10 },
    { id:'l-ext',  label:'边界防护�?(FW+IPS)', yr:0.27 },
    { id:'l-dmz',  label:'DMZ 服务�?,          yr:0.45 },
    { id:'l-core', label:'核心交换�?,           yr:0.62 },
    { id:'l-agg',  label:'汇聚 / 存储网络',     yr:0.79 },
    { id:'l-acc',  label:'接入交换�?,           yr:0.92 },
  ],
  nodes: [
    { id:'b-rt1',   layer:'l-wan',  label:'MPLS-PE-B01', sub:'100G 专线�?,      type:'router',     status:'ok', xr:0.25, alerts:0, cpu:14, ip:'10.254.2.1', model:'Cisco ASR 9001',  role:'MPLS 专线路由�?  },
    { id:'b-rt2',   layer:'l-wan',  label:'ISP-B01',     sub:'电信 1G 备用',     type:'router',     status:'ok', xr:0.65, alerts:0, cpu:8,  ip:'100.3.1.1',  model:'华为 AR6280',     role:'互联网备用接�?   },
    { id:'b-fw1',   layer:'l-ext',  label:'FW-B01',      sub:'边界FW Active',    type:'firewall',   status:'ok', xr:0.22, alerts:0, cpu:38, ip:'10.11.0.1',  model:'华为 USG6550E',  role:'边界防火�?       },
    { id:'b-fw2',   layer:'l-ext',  label:'FW-B02',      sub:'边界FW Standby',   type:'firewall',   status:'ok', xr:0.48, alerts:0, cpu:25, ip:'10.11.0.2',  model:'华为 USG6550E',  role:'边界防火�?       },
    { id:'b-ips',   layer:'l-ext',  label:'IPS-B01',     sub:'在线IPS',          type:'ips',        status:'ok', xr:0.75, alerts:0, cpu:22, ip:'10.11.0.10', model:'深信�?IDPV',     role:'入侵防御系统'     },
    { id:'b-waf',   layer:'l-dmz',  label:'WAF-B01',     sub:'Web应用防护',      type:'waf',        status:'ok', xr:0.22, alerts:0, cpu:22, ip:'10.12.0.1',  model:'绿盟 ADS-1000',  role:'Web 应用防火�?   },
    { id:'b-slb',   layer:'l-dmz',  label:'SLB-B01',     sub:'负载均衡',         type:'slb',        status:'ok', xr:0.50, alerts:0, cpu:35, ip:'10.12.0.10', model:'深信�?AD-1000',  role:'应用负载均衡�?   },
    { id:'b-jh',    layer:'l-dmz',  label:'BASTION-B01', sub:'堡垒�?,           type:'bastion',    status:'ok', xr:0.77, alerts:0, cpu:12, ip:'10.12.0.20', model:'CyberArk PAS',    role:'统一堡垒�?       },
    { id:'b-core1', layer:'l-core', label:'SW-CORE-B01', sub:'核心交换 Active',  type:'coreswitch', status:'ok', xr:0.28, alerts:0, cpu:32, ip:'10.10.0.1',  model:'H3C S10508X',     role:'核心交换�?       },
    { id:'b-core2', layer:'l-core', label:'SW-CORE-B02', sub:'核心交换 Standby', type:'coreswitch', status:'ok', xr:0.62, alerts:0, cpu:28, ip:'10.10.0.2',  model:'H3C S10508X',     role:'核心交换�?       },
    { id:'b-agg1',  layer:'l-agg',  label:'AGG-B01',     sub:'汇聚�?,           type:'aggswitch',  status:'ok', xr:0.18, alerts:0, cpu:25, ip:'10.13.0.1',  model:'H3C S6520',       role:'汇聚交换�?       },
    { id:'b-agg2',  layer:'l-agg',  label:'AGG-B02',     sub:'汇聚�?,           type:'aggswitch',  status:'ok', xr:0.44, alerts:0, cpu:20, ip:'10.13.0.2',  model:'H3C S6520',       role:'汇聚交换�?       },
    { id:'b-san',   layer:'l-agg',  label:'SAN-B01',     sub:'FC SAN',           type:'sanswitch',  status:'ok', xr:0.72, alerts:0, cpu:18, ip:'10.13.1.1',  model:'Brocade 300',     role:'FC SAN 存储网络'  },
    { id:'b-acc1',  layer:'l-acc',  label:'ACC-B01',     sub:'接入-1',           type:'accswitch',  status:'ok', xr:0.18, alerts:0, cpu:18, ip:'10.14.0.1',  model:'H3C S5130',       role:'服务器接�?       },
    { id:'b-acc2',  layer:'l-acc',  label:'ACC-B02',     sub:'接入-2',           type:'accswitch',  status:'ok', xr:0.44, alerts:0, cpu:15, ip:'10.14.0.2',  model:'H3C S5130',       role:'服务器接�?       },
    { id:'b-acc3',  layer:'l-acc',  label:'ACC-B03',     sub:'接入-3',           type:'accswitch',  status:'ok', xr:0.68, alerts:0, cpu:12, ip:'10.14.0.3',  model:'H3C S5130',       role:'服务器接�?       },
  ],
  links: [
    { from:'b-rt1',   to:'b-fw1',   type:'ok'               },
    { from:'b-rt2',   to:'b-fw2',   type:'ok'               },
    { from:'b-fw1',   to:'b-ips',   type:'ok'               },
    { from:'b-fw2',   to:'b-ips',   type:'ok'               },
    { from:'b-ips',   to:'b-waf',   type:'ok'               },
    { from:'b-ips',   to:'b-slb',   type:'ok'               },
    { from:'b-fw1',   to:'b-jh',    type:'ok'               },
    { from:'b-fw1',   to:'b-core1', type:'ok',  label:'10G' },
    { from:'b-fw2',   to:'b-core2', type:'ok',  label:'10G' },
    { from:'b-waf',   to:'b-core1', type:'ok'               },
    { from:'b-slb',   to:'b-core1', type:'ok'               },
    { from:'b-core1', to:'b-core2', type:'ok',  label:'40G HA' },
    { from:'b-core1', to:'b-agg1',  type:'ok',  label:'10G' },
    { from:'b-core1', to:'b-agg2',  type:'ok',  label:'10G' },
    { from:'b-core2', to:'b-agg2',  type:'ok',  label:'10G' },
    { from:'b-core1', to:'b-san',   type:'ok',  label:'8G FC' },
    { from:'b-agg1',  to:'b-acc1',  type:'ok',  label:'GE'  },
    { from:'b-agg1',  to:'b-acc2',  type:'ok',  label:'GE'  },
    { from:'b-agg2',  to:'b-acc3',  type:'ok',  label:'GE'  },
    { from:'b-san',   to:'b-acc1',  type:'ok'               },
  ]
};

// ── DC-C：边缘节�?PoP-C ─────────────────────────────────
const TOPO_DC3 = {
  title: '边缘节点 PoP-C',
  layers: [
    { id:'l-wan',  label:'接入链路 (双线双路)',   yr:0.14 },
    { id:'l-fw',   label:'安全防护�?(FW + WAF)', yr:0.38 },
    { id:'l-core', label:'核心交换�?,            yr:0.62 },
    { id:'l-svc',  label:'边缘服务节点',          yr:0.84 },
  ],
  nodes: [
    { id:'c-rt1',  layer:'l-wan',  label:'CE-RT-01',  sub:'中国电信 主用',  type:'router',     status:'ok', xr:0.25, alerts:0, cpu:22, ip:'10.200.1.1',  model:'华为 NE40E-X3A',  role:'客户边缘路由�? },
    { id:'c-rt2',  layer:'l-wan',  label:'CE-RT-02',  sub:'中国联�?备用',  type:'router',     status:'ok', xr:0.65, alerts:0, cpu:18, ip:'10.200.1.2',  model:'华为 NE40E-X3A',  role:'客户边缘路由�? },
    { id:'c-fw',   layer:'l-fw',   label:'FW-C01',    sub:'边界防火�?,     type:'firewall',   status:'ok', xr:0.28, alerts:0, cpu:30, ip:'10.201.0.1',  model:'华为 USG6350E',   role:'边界防火�?     },
    { id:'c-waf',  layer:'l-fw',   label:'WAF-C01',   sub:'Web应用防护',    type:'waf',        status:'ok', xr:0.62, alerts:0, cpu:25, ip:'10.201.0.5',  model:'绿盟 ADS-500',    role:'Web 应用防火�? },
    { id:'c-core', layer:'l-core', label:'SW-C01',    sub:'核心交换',       type:'coreswitch', status:'ok', xr:0.45, alerts:0, cpu:28, ip:'10.202.0.1',  model:'H3C S6520',       role:'核心交换�?     },
    { id:'c-cdn',  layer:'l-svc',  label:'CDN-NODE',  sub:'内容分发加�?,   type:'slb',        status:'ok', xr:0.18, alerts:0, cpu:65, ip:'10.203.0.1',  model:'网宿 CDN',         role:'CDN 边缘节点'   },
    { id:'c-dns',  layer:'l-svc',  label:'DNS-01',    sub:'递归 DNS',       type:'bastion',    status:'ok', xr:0.45, alerts:0, cpu:35, ip:'10.203.0.5',  model:'BIND 9',           role:'递归 DNS 服务�?},
    { id:'c-cache',layer:'l-svc',  label:'CACHE-01',  sub:'HTTP 反向代理',  type:'slb',        status:'ok', xr:0.72, alerts:0, cpu:48, ip:'10.203.0.10', model:'Nginx/Varnish',    role:'HTTP 缓存加�?  },
  ],
  links: [
    { from:'c-rt1',  to:'c-fw',    type:'ok'              },
    { from:'c-rt2',  to:'c-fw',    type:'ok'              },
    { from:'c-rt1',  to:'c-waf',   type:'ok'              },
    { from:'c-rt2',  to:'c-waf',   type:'ok'              },
    { from:'c-fw',   to:'c-core',  type:'ok', label:'10G' },
    { from:'c-waf',  to:'c-core',  type:'ok'              },
    { from:'c-core', to:'c-cdn',   type:'ok', label:'GE'  },
    { from:'c-core', to:'c-dns',   type:'ok', label:'GE'  },
    { from:'c-core', to:'c-cache', type:'ok', label:'GE'  },
  ]
};

// ── 容量建议数据 ─────────────────────────────────────────
const CAP_ACTIONS = [
  { pri:'紧�?, cls:'sug-crit', action:'WAN-01 出口带宽扩容�?2G', detail:'季度末高�?48h 内达阈值，预计费用 ¥3.2�?月，建议今日提交申请', impact:'消除出口瓶颈风险' },
  { pri:'本月', cls:'sug-warn', action:'SW-Core-02 热降频根�?, detail:'空调维保�?CPU 恢复正常，建议同步检�?SW-Core-02 散热模块', impact:'恢复转发能力 100%' },
  { pri:'本季', cls:'sug-info', action:'核心�?100G 链路聚合', detail:'现有 2×40G 升级�?2×100G Link-Agg，提升东西向承载能力 2.5�?, impact:'+150% 内部带宽' },
];
const CAP_PORTS = [
  { zone:'出口�?,   total:32,  used:24, pct:75 },
  { zone:'核心�?,   total:384, used:260, pct:68 },
  { zone:'汇聚�?,   total:192, used:150, pct:78 },
  { zone:'接入�?,   total:576, used:394, pct:68 },
];


// ── G6 自定义拓扑节点注�?────────────────────────────────
(function registerG6TopoNodes() {
  if (typeof G6 === 'undefined') return;

  const _cMap = { ok:'#16A34A', warn:'#D97706', crit:'#DC2626' };

  // ── 设备卡片节点 (DC视图) ─────────────────────────────
  G6.registerNode('topo-device', {
    draw(cfg, group) {
      const NW = 88, NHH = 14;
      const st = TOPO_NODE_STYLES[cfg.devType] || TOPO_NODE_STYLES.accswitch;
      const sc = _cMap[cfg.devStatus] || '#6B7280';
      const bgColor = cfg.devStatus === 'crit' ? '#FEF2F2' : cfg.devStatus === 'warn' ? '#FFFBEB' : st.bg;
      const bdColor = cfg.devStatus !== 'ok' ? sc : st.bd;
      const bdWidth = cfg.devStatus !== 'ok' ? 1.5 : 1;

      // 状态光�?(问题节点)
      if (cfg.devStatus === 'crit') {
        group.addShape('rect', { attrs: { x:-NW/2-3, y:-NHH-3, width:NW+6, height:NHH*2+6, radius:8, fill:sc, opacity:0.13, stroke:null, shadowColor:sc, shadowBlur:9 }, name:'glow' });
      } else if (cfg.devStatus === 'warn') {
        group.addShape('rect', { attrs: { x:-NW/2-2, y:-NHH-2, width:NW+4, height:NHH*2+4, radius:7, fill:sc, opacity:0.10, stroke:null, shadowColor:sc, shadowBlur:6 }, name:'glow' });
      }
      // 卡片阴影
      group.addShape('rect', { attrs: { x:-NW/2+1, y:-NHH+2, width:NW, height:NHH*2, radius:5, fill:'rgba(0,0,0,0.07)', stroke:null }, name:'card-shadow' });
      // 卡片主体 (keyShape)
      const keyShape = group.addShape('rect', { attrs: { x:-NW/2, y:-NHH, width:NW, height:NHH*2, radius:5, fill:bgColor, stroke:bdColor, lineWidth:bdWidth, cursor:'pointer' }, name:'card-body' });
      // 左侧类型色条
      group.addShape('rect', { attrs: { x:-NW/2, y:-NHH, width:14, height:NHH*2, radius:[5,0,0,5], fill:st.bd, stroke:null }, name:'type-strip' });
      group.addShape('rect', { attrs: { x:-NW/2+8, y:-NHH, width:6, height:NHH*2, fill:st.bd, stroke:null }, name:'strip-fill' });
      // 缩写文字
      group.addShape('text', { attrs: { x:-NW/2+7, y:0, text:st.abbr.slice(0,3), fontSize:5.5, fill:'white', fontWeight:'bold', textAlign:'center', textBaseline:'middle' }, name:'abbr-text' });
      // 设备�?
      const nm = (cfg.label||'').length > 12 ? cfg.label.slice(0,12) : (cfg.label||'');
      group.addShape('text', { attrs: { x:-NW/2+19, y:-3, text:nm, fontSize:9, fill:st.tc, fontWeight:'bold', textBaseline:'middle' }, name:'label-text' });
      // 副标�?
      const sub = (cfg.devSub||'').replace(' �?,'').slice(0,14);
      group.addShape('text', { attrs: { x:-NW/2+19, y:8, text:sub, fontSize:6.5, fill:'#6B7280', textBaseline:'middle' }, name:'sub-text' });
      // 状态指示点
      if (cfg.devStatus !== 'ok') {
        group.addShape('circle', { attrs: { cx:NW/2-5, cy:-NHH+5, r:5, fill:sc, stroke:'white', lineWidth:1.2 }, name:'status-dot' });
        if (cfg.alerts > 0) {
          group.addShape('text', { attrs: { x:NW/2-5, y:-NHH+5, text:String(cfg.alerts), fontSize:5.5, fill:'white', fontWeight:'bold', textAlign:'center', textBaseline:'middle' }, name:'alert-count' });
        }
      } else {
        group.addShape('circle', { attrs: { cx:NW/2-5, cy:-NHH+5, r:2.5, fill:'#16A34A', opacity:0.6, stroke:null }, name:'ok-dot' });
      }
      return keyShape;
    },
    setState(name, value, item) {
      const group = item.getContainer();
      const children = group.getChildren();
      if (name === 'selected') {
        let ring = group.find(el => el.get('name') === 'highlight-ring');
        if (value) {
          if (!ring) group.addShape('rect', { attrs: { x:-48, y:-18, width:96, height:36, radius:8, fill:null, stroke:'#2563EB', lineWidth:2.5 }, name:'highlight-ring' });
        } else if (ring) { ring.remove(); }
      }
      if (name === 'dimmed') {
        const op = value ? 0.07 : 1;
        children.forEach(c => { if (c.get('name') !== 'highlight-ring') c.attr('opacity', op); });
      }
      if (name === 'context') {
        const op = value ? 0.4 : 1;
        children.forEach(c => { if (c.get('name') !== 'highlight-ring') c.attr('opacity', op); });
      }
    },
    getAnchorPoints() { return [[0.5,0],[0.5,1],[0,0.5],[1,0.5]]; },
  }, 'single-node');

  // ── 数据中心站点节点 (全局视图) ──────────────────────
  G6.registerNode('topo-site', {
    draw(cfg, group) {
      const BW = cfg.boxW || 140, BH = cfg.boxH || 88;
      const sc = _cMap[cfg.status] || '#64748B';
      const bdColor = cfg.status !== 'ok' ? sc : '#CBD5E1';
      // 阴影
      group.addShape('rect', { attrs: { x:-BW/2+2, y:-BH/2+3, width:BW, height:BH, radius:10, fill:'rgba(0,0,0,0.08)', stroke:null }, name:'shadow' });
      // 主框 (keyShape)
      const keyShape = group.addShape('rect', { attrs: { x:-BW/2, y:-BH/2, width:BW, height:BH, radius:10, fill:'white', stroke:bdColor, lineWidth:1.5, cursor:'pointer' }, name:'box' });
      // 顶部色条
      const hH = 26;
      const hFill = cfg.status === 'crit' ? '#DC2626' : cfg.status === 'warn' ? '#D97706' : '#0F172A';
      group.addShape('rect', { attrs: { x:-BW/2, y:-BH/2, width:BW, height:hH, radius:[10,10,0,0], fill:hFill, stroke:null, cursor:'pointer' }, name:'header' });
      // 站点标签
      const siteNames = { dc1:'DC-A · 主数据中�?, dc2:'DC-B · 灾备中心', dc3:'PoP-C · 边缘节点' };
      group.addShape('text', { attrs: { x:0, y:-BH/2+hH/2, text:siteNames[cfg.id]||cfg.label||'', fontSize:8.5, fill:'white', fontWeight:'bold', textAlign:'center', textBaseline:'middle', cursor:'pointer' }, name:'site-label' });
      // 统计信息
      group.addShape('text', { attrs: { x:0, y:-BH/2+hH+16, text:`${cfg.devices||0} 台网络设备`, fontSize:9, fill:'#475569', textAlign:'center', textBaseline:'middle' }, name:'stat-dev' });
      group.addShape('text', { attrs: { x:0, y:-BH/2+hH+33, text:`${cfg.rooms||0} 个机房`, fontSize:9, fill:'#475569', textAlign:'center', textBaseline:'middle' }, name:'stat-rooms' });
      // 状态芯�?
      const chipFill = cfg.status==='ok'?'#F0FDF4':cfg.status==='warn'?'#FFFBEB':'#FEF2F2';
      const chipBd   = cfg.status==='ok'?'#86EFAC':cfg.status==='warn'?'#FDE68A':'#FECACA';
      const statusTxt = cfg.status==='ok'?'�?状态正�?:cfg.status==='warn'?'�?部分告警':'�?设备故障';
      group.addShape('rect', { attrs: { x:-38, y:-BH/2+hH+42, width:76, height:17, radius:4, fill:chipFill, stroke:chipBd, lineWidth:1 }, name:'status-chip' });
      group.addShape('text', { attrs: { x:0, y:-BH/2+hH+50.5, text:statusTxt, fontSize:8.5, fill:sc, fontWeight:'bold', textAlign:'center', textBaseline:'middle' }, name:'status-txt' });
      // 告警徽章
      if (cfg.alertCount > 0) {
        group.addShape('circle', { attrs: { cx:BW/2-4, cy:-BH/2-4, r:9, fill:'#DC2626', stroke:'white', lineWidth:2 }, name:'alert-circle' });
        group.addShape('text', { attrs: { x:BW/2-4, y:-BH/2-4, text:String(cfg.alertCount), fontSize:7.5, fill:'white', fontWeight:'bold', textAlign:'center', textBaseline:'middle' }, name:'alert-num' });
      }
      return keyShape;
    },
    getAnchorPoints() { return [[0.5,0],[0.5,1],[0,0.5],[1,0.5]]; },
  }, 'single-node');

  // ── 云节�?(Internet / MPLS) ─────────────────────────
  G6.registerNode('topo-cloud', {
    draw(cfg, group) {
      const W = cfg.boxW || 130, H = cfg.boxH || 48;
      const color = cfg.cloudColor || '#3B82F6';
      const keyShape = group.addShape('ellipse', { attrs: { x:0, y:0, rx:W/2, ry:H/2, fill:cfg.cloudBg||'#EFF6FF', stroke:cfg.cloudBd||'#93C5FD', lineWidth:1.5, lineDash:[5,3] }, name:'cloud-body' });
      group.addShape('text', { attrs: { x:0, y:-6, text:cfg.cloudLabel||'', fontSize:10, fill:color, fontWeight:'bold', textAlign:'center', textBaseline:'middle' }, name:'cloud-label' });
      group.addShape('text', { attrs: { x:0, y:9, text:cfg.cloudSub||'', fontSize:7.5, fill:'#64748B', textAlign:'center', textBaseline:'middle' }, name:'cloud-sub' });
      return keyShape;
    },
    getAnchorPoints() { return [[0.5,0],[0.5,1],[0,0.5],[1,0.5]]; },
  }, 'single-node');

  // ── 层带背景节点 ──────────────────────────────────────
  G6.registerNode('topo-band', {
    draw(cfg, group) {
      const bW = cfg.bandW || 600, bH = cfg.bandH || 50;
      const keyShape = group.addShape('rect', { attrs: { x:-bW/2, y:-bH/2, width:bW, height:bH, fill:cfg.bandFill||'#F8FAFC', stroke:null, cursor:'default' }, name:'band-bg' });
      if (cfg.bandLabel) {
        group.addShape('text', { attrs: { x:-bW/2+8, y:-bH/2+13, text:cfg.bandLabel, fontSize:8, fill:'#94A3B8', fontWeight:'600', letterSpacing:0.3 }, name:'band-label' });
      }
      group.addShape('line', { attrs: { x1:-bW/2, y1:bH/2, x2:bW/2, y2:bH/2, stroke:'#E2E8F0', lineWidth:0.8 }, name:'band-sep' });
      return keyShape;
    },
    getAnchorPoints() { return []; },
    setState() {},
  }, 'single-node');
})();

// ── 主初始化入口 ─────────────────────────────────────────
function initOps() {
  // 每次切换到ops视图都重新初始化页面切换逻辑（数据每次刷新）
  initOpsSubNav();
  switchOpsSub(opsSubPage, false);
}

function initOpsSubNav() {
  document.querySelectorAll('.osn-btn').forEach(btn => {
    btn.onclick = null;
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      document.querySelectorAll('.osn-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchOpsSub(page, true);
    });
  });
  // "查看全图" 快捷按钮
  document.querySelectorAll('.osn-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      document.querySelectorAll('.osn-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.page === page);
      });
      switchOpsSub(page, true);
    });
  });
}

function switchOpsSub(page, animate) {
  opsSubPage = page;
  document.querySelectorAll('.ops-page').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById(page);
  if (!target) return;
  target.classList.remove('hidden');
  requestAnimationFrame(() => {
    if (page === 'ops-overview') initOpsOverview();
    if (page === 'ops-topo')     initOpsTopo();
    if (page === 'ops-traffic')  initOpsTraffic();
    if (page === 'ops-fault')    initOpsFault();
    if (page === 'ops-inventory') initOpsInventory();
    if (page === 'ops-capacity') initOpsCapacity();
  });
}

// ── 全局总览 ─────────────────────────────────────────────
function initOpsOverview() {
  renderOpsRcaList();
  renderOpsFusionList();
  renderOpsLinksList();
  renderOpsThumbSvg();
  initOpsTrendChart();
  initOpsSrcChart();
}

function renderOpsRcaList() {
  const el = document.getElementById('opsRcaList');
  if (!el) return;
  const active = FAULT_EVENTS.filter(f => f.status !== '已关�?);
  el.innerHTML = active.map(f => `
    <div class="ops-rca-item" style="border-left-color:${f.rca.color}">
      <div class="rca-top">
        <span class="rca-pri rca-${f.pri.toLowerCase()}">${f.pri}</span>
        <span class="rca-title">${f.title}</span>
        <span class="rca-conf">AI ${f.rca.conf}%</span>
      </div>
      <div class="rca-root">${f.rca.rootCause}</div>
      <div class="rca-sources">
        ${f.rca.dataSources.map(s => `<span class="rca-src-chip">${s}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function renderOpsFusionList() {
  const el = document.getElementById('opsFusionList');
  if (!el) return;
  el.innerHTML = OPS_FUSION_SOURCES.map(s => `
    <div class="ofl-item">
      <span class="material-symbols-rounded ofl-icon">${s.icon}</span>
      <div class="ofl-body">
        <div class="ofl-name">${s.name}</div>
        <div class="ofl-desc">${s.desc}</div>
      </div>
      <div class="ofl-right">
        <span class="ofl-count">${s.count.toLocaleString()}</span>
        <span class="ofl-status ofl-${s.status}">${s.status === 'ok' ? '�? : '�?}</span>
      </div>
    </div>
  `).join('');
}

function renderOpsLinksList() {
  const el = document.getElementById('opsLinksList');
  if (!el) return;
  el.innerHTML = OPS_LINKS.map(l => `
    <div class="opl-item">
      <span class="opl-name">${l.name}</span>
      <div class="opl-bar-wrap">
        <div class="opl-bar opl-${l.status}" style="width:${l.util}%"></div>
      </div>
      <span class="opl-util opl-util-${l.status}">${l.util}%</span>
      <span class="opl-cap">${l.capacity}</span>
      ${l.aiNote ? `<span class="opl-ai"><span class="material-symbols-rounded" style="font-size:11px">neurology</span>${l.aiNote}</span>` : ''}
    </div>
  `).join('');
}

function renderOpsThumbSvg() {
  const svg = document.getElementById('opsThumbSvg');
  if (!svg) return;
  // Simple hierarchical thumbnail: WAN �?Core �?AGG �?ACC
  const nodes = [
    { id:'wan',   x:210, y:25,  label:'WAN-01/02', status:'warn',  type:'router'  },
    { id:'core1', x:130, y:80,  label:'SW-Core-01', status:'ok',   type:'switch'  },
    { id:'core2', x:290, y:80,  label:'SW-Core-02', status:'crit', type:'switch'  },
    { id:'agg1',  x:80,  y:145, label:'AGG-B01',   status:'ok',   type:'switch'  },
    { id:'agg2',  x:200, y:145, label:'AGG-B02',   status:'ok',   type:'switch'  },
    { id:'agg3',  x:340, y:145, label:'AGG-A01',   status:'ok',   type:'switch'  },
    { id:'acc1',  x:50,  y:205, label:'ACC-B01',   status:'warn', type:'switch'  },
    { id:'acc2',  x:130, y:205, label:'ACC-B02',   status:'warn', type:'switch'  },
    { id:'acc3',  x:210, y:205, label:'ACC-A01',   status:'ok',   type:'switch'  },
    { id:'acc4',  x:290, y:205, label:'ACC-A02',   status:'ok',   type:'switch'  },
    { id:'acc5',  x:370, y:205, label:'ACC-C01',   status:'ok',   type:'switch'  },
  ];
  const links = [
    {from:'wan',to:'core1',s:'warn'},{from:'wan',to:'core2',s:'crit'},
    {from:'core1',to:'agg1',s:'ok'},{from:'core1',to:'agg2',s:'ok'},
    {from:'core2',to:'agg2',s:'crit'},{from:'core2',to:'agg3',s:'ok'},
    {from:'agg1',to:'acc1',s:'warn'},{from:'agg1',to:'acc2',s:'warn'},
    {from:'agg2',to:'acc3',s:'ok'},{from:'agg2',to:'acc4',s:'ok'},
    {from:'agg3',to:'acc4',s:'ok'},{from:'agg3',to:'acc5',s:'ok'},
  ];
  const colorMap = {ok:'#1A7F37', warn:'#D09B00', crit:'#CF222E'};
  const dashMap  = {ok:'none', warn:'4 2', crit:'2 2'};
  const nodeMap = {};
  nodes.forEach(n => nodeMap[n.id] = n);
  let html = '';
  links.forEach(l => {
    const a = nodeMap[l.from], b = nodeMap[l.to];
    html += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${colorMap[l.s]}" stroke-width="1.5" stroke-dasharray="${dashMap[l.s]}" opacity="0.8"/>`;
  });
  nodes.forEach(n => {
    const c = colorMap[n.status];
    if (n.type === 'router') {
      html += `<polygon points="${n.x},${n.y-9} ${n.x+8},${n.y+5} ${n.x-8},${n.y+5}" fill="${c}" opacity="0.9"/>`;
    } else {
      html += `<rect x="${n.x-7}" y="${n.y-6}" width="14" height="12" rx="2" fill="${c}" opacity="0.9"/>`;
    }
    if (n.status !== 'ok') {
      html += `<circle cx="${n.x+6}" cy="${n.y-6}" r="3.5" fill="${c}" stroke="#fff" stroke-width="1"/>`;
    }
    html += `<text x="${n.x}" y="${n.y+18}" text-anchor="middle" font-size="8" fill="#636C76">${n.label}</text>`;
  });
  svg.innerHTML = html;
}

function initOpsTrendChart() {
  const canvas = document.getElementById('opsTrendChart');
  if (!canvas) return;
  if (opsCharts.trend) { opsCharts.trend.destroy(); delete opsCharts.trend; }
  const hours = Array.from({length:24},(_,i)=>`${String(i).padStart(2,'0')}:00`);
  const crit = [0,0,0,0,0,0,0,1,0,0,0,2,1,0,3,1,0,0,0,0,0,0,0,0];
  const warn = [1,0,0,0,0,0,2,3,4,5,6,8,7,6,12,8,5,4,4,3,3,2,2,1];
  opsCharts.trend = new Chart(canvas.getContext('2d'), {
    type:'bar',
    data:{
      labels:hours,
      datasets:[
        {label:'CRIT',data:crit,backgroundColor:'#CF222E',stack:'s'},
        {label:'WARN',data:warn,backgroundColor:'#D09B00',stack:'s'},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{title:t=>`${t[0].label}`}}},
      scales:{
        x:{grid:{display:false},ticks:{font:{size:9},color:'#8C959F',maxTicksLimit:8}},
        y:{grid:{color:'#F0F3F6'},ticks:{font:{size:9},color:'#8C959F'},beginAtZero:true},
      }
    }
  });
}

function initOpsSrcChart() {
  const canvas = document.getElementById('opsSrcChart');
  if (!canvas) return;
  if (opsCharts.src) { opsCharts.src.destroy(); delete opsCharts.src; }
  const data = [{label:'NMS/网管',val:12,color:'#0969DA'},{label:'NTA/流量',val:5,color:'#1A7F37'},{label:'DCIM/动环',val:3,color:'#D09B00'},{label:'HM',val:2,color:'#6E40C9'},{label:'巡检',val:1,color:'#636C76'}];
  opsCharts.src = new Chart(canvas.getContext('2d'), {
    type:'doughnut',
    data:{labels:data.map(d=>d.label),datasets:[{data:data.map(d=>d.val),backgroundColor:data.map(d=>d.color),borderWidth:2,borderColor:'#fff'}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.label}: ${c.raw}条`}}},cutout:'65%'}
  });
  const legend = document.getElementById('opsSrcLegend');
  if (legend) legend.innerHTML = data.map(d=>`<span style="display:flex;align-items:center;gap:4px;font-size:10.5px;color:#636C76"><span style="width:8px;height:8px;border-radius:50%;background:${d.color};flex-shrink:0"></span>${d.label} <strong style="color:#1F2328">${d.val}</strong></span>`).join('');
}


// ── 网络拓扑 ─────────────────────────────────────────────
function initOpsTopo() {
  topoLevel = 'global';
  topoFilter = 'all';
  topoHighlightNode = null;
  renderTopoTree();
  renderTopoGlobal();
  renderTopoBreadcrumb();
  renderTopoAlertPanel();
}

function renderTopoTree() {
  const tree = document.getElementById('topoTree');
  if (!tree) return;
  const dcMap = { dc1: TOPO_DC1, dc2: TOPO_DC2, dc3: TOPO_DC3 };
  tree.innerHTML = `
    <div class="tts-site-item tts-active" data-level="global" data-id="">
      <span class="material-symbols-rounded tts-site-icon">language</span>全网总览
    </div>
    ${TOPO_GLOBAL.sites.map(s => {
      const dc = dcMap[s.id];
      const nodeCount = dc ? dc.nodes.length : 0;
      const alertCount = dc ? dc.nodes.filter(n => n.status !== 'ok').length : 0;
      return `
      <div class="tts-site-item" data-level="dc" data-id="${s.id}">
        <span class="material-symbols-rounded tts-site-icon" style="color:${alertCount>0?'#D97706':'#16A34A'}">corporate_fare</span>
        <span style="flex:1;font-size:11px">${s.label}</span>
        <span class="tts-badge tts-badge-${alertCount>0?'warn':'ok'}" style="font-size:9.5px">${nodeCount}设备${alertCount>0?' · �?+alertCount:''}</span>
      </div>`;
    }).join('')}
  `;
  tree.querySelectorAll('.tts-site-item').forEach(item => {
    item.addEventListener('click', () => {
      tree.querySelectorAll('.tts-site-item').forEach(i => i.classList.remove('tts-active'));
      item.classList.add('tts-active');
      const level = item.dataset.level;
      const id = item.dataset.id;
      if (level === 'global') { topoLevel='global'; renderTopoGlobal(); }
      else if (level === 'dc') { topoLevel='dc'; topoSelectedDC=id; renderTopoDC(id); }
      renderTopoBreadcrumb();
    });
  });
}

function renderTopoAlertPanel() {
  const list = document.getElementById('tdpAlertList');
  const countEl = document.getElementById('tdpAlertCount');
  if (!list) return;
  const dcMap = { dc1: TOPO_DC1, dc2: TOPO_DC2, dc3: TOPO_DC3 };
  const allAlerts = [];
  TOPO_GLOBAL.sites.forEach(s => {
    const dc = dcMap[s.id];
    if (!dc) return;
    dc.nodes.filter(n => n.status !== 'ok').forEach(n => allAlerts.push({ ...n, dcId: s.id }));
  });
  allAlerts.sort((a, b) => (a.status === 'crit' ? 0 : 1) - (b.status === 'crit' ? 0 : 1));
  if (countEl) {
    if (allAlerts.length > 0) { countEl.textContent = allAlerts.length; countEl.classList.remove('hidden'); }
    else { countEl.classList.add('hidden'); }
  }
  if (allAlerts.length === 0) {
    list.innerHTML = '<div class="tdp-ap-empty">�?无异常设�?/div>';
    return;
  }
  const cMap = { warn: '#D97706', crit: '#DC2626' };
  const dcShortMap = { dc1: 'DC-A', dc2: 'DC-B', dc3: 'DC-C' };
  list.innerHTML = allAlerts.map(n => `
    <div class="tdp-ap-item" data-dcid="${n.dcId}" data-nodeid="${n.id}">
      <span class="tdp-ap-dot" style="background:${cMap[n.status]}"></span>
      <div class="tdp-ap-body">
        <div class="tdp-ap-name">${n.label}</div>
        <div class="tdp-ap-meta">${dcShortMap[n.dcId]} · ${n.role}${n.alerts > 0 ? ' · ' + n.alerts + '条告�? : ''}</div>
      </div>
      <span class="tdp-ap-badge ${n.status === 'crit' ? 'tdp-ap-badge-crit' : 'tdp-ap-badge-warn'}">${n.status === 'crit' ? '故障' : '告警'}</span>
    </div>`).join('');
  list.querySelectorAll('.tdp-ap-item').forEach(item => {
    item.addEventListener('click', () => {
      list.querySelectorAll('.tdp-ap-item').forEach(i => i.classList.remove('tdp-ap-active'));
      item.classList.add('tdp-ap-active');
      navigateToTopoAlert(item.dataset.dcid, item.dataset.nodeid);
    });
  });
}

function navigateToTopoAlert(dcId, nodeId) {
  topoLevel = 'dc'; topoSelectedDC = dcId;
  topoHighlightNode = nodeId;
  topoFilter = 'all';  // reset filter when navigating from alert list
  renderTopoDC(dcId);
  renderTopoBreadcrumb();
  document.querySelectorAll('.tts-site-item').forEach(i => {
    i.classList.toggle('tts-active', i.dataset.id === dcId);
  });
  const dcData = dcId === 'dc1' ? TOPO_DC1 : dcId === 'dc2' ? TOPO_DC2 : TOPO_DC3;
  const node = dcData.nodes.find(n => n.id === nodeId);
  if (node) showTopoDevDetail(node);
}

function applyTopoFilter(filterVal) {
  topoFilter = filterVal;
  document.querySelectorAll('.tfb-btn').forEach(b => {
    b.classList.toggle('tfb-active', b.dataset.filter === filterVal);
  });
  if (topoLevel !== 'dc' || !topoG6Graph) return;

  const dcData = topoSelectedDC === 'dc1' ? TOPO_DC1 : topoSelectedDC === 'dc2' ? TOPO_DC2 : TOPO_DC3;
  const graph = topoG6Graph;

  // AI overlay edge 透明�?
  const aiOp = filterVal === 'ai' ? 1 : 0.45;
  graph.getEdges().forEach(edge => {
    if (edge.getID().startsWith('__ai_')) {
      graph.updateItem(edge, { style: Object.assign({}, edge.getModel().style, { opacity: aiOp }) });
    }
  });

  if (filterVal === 'all') {
    graph.getNodes().forEach(n => graph.clearItemStates(n, ['dimmed','context']));
    graph.getEdges().forEach(e => {
      if (!e.getID().startsWith('__ai_')) graph.clearItemStates(e, 'dimmed');
    });
    return;
  }

  // 计算主节点集�?
  const primaryIds = new Set();
  if (filterVal === 'ai') {
    const aiData = TOPO_AI_MAP[topoSelectedDC];
    if (aiData) {
      aiData.correlations.forEach(c => { primaryIds.add(c.from); primaryIds.add(c.to); });
      aiData.risks.forEach(r => primaryIds.add(r.nodeId));
    }
  } else {
    dcData.nodes.forEach(n => {
      if (filterVal === 'issue' && n.status !== 'ok') primaryIds.add(n.id);
      else if (filterVal === 'crit' && n.status === 'crit') primaryIds.add(n.id);
      else if (filterVal === 'warn' && n.status === 'warn') primaryIds.add(n.id);
    });
  }

  // 相邻上下文节�?
  const contextIds = new Set();
  dcData.links.forEach(l => {
    if (primaryIds.has(l.from)) contextIds.add(l.to);
    if (primaryIds.has(l.to))   contextIds.add(l.from);
  });

  // 应用节点状�?
  graph.getNodes().forEach(n => {
    const id = n.getID();
    if (id.startsWith('__band__')) return;
    graph.clearItemStates(n, ['dimmed','context']);
    if (!primaryIds.has(id)) {
      graph.setItemState(n, contextIds.has(id) ? 'context' : 'dimmed', true);
    }
  });

  // 应用边状�?
  graph.getEdges().forEach(e => {
    const id = e.getID();
    if (id.startsWith('__ai_')) return;
    const m = e.getModel();
    graph.clearItemStates(e, 'dimmed');
    const vis = primaryIds.has(m.source) || contextIds.has(m.source) || primaryIds.has(m.target) || contextIds.has(m.target);
    if (!vis) graph.setItemState(e, 'dimmed', true);
  });
}
}

function renderTopoBreadcrumb() {
  const bc = document.getElementById('topoBreadcrumb');
  if (!bc) return;
  let html = `<span class="tbc-item ${topoLevel==='global'?'tbc-active':''}" style="cursor:pointer" onclick="topoLevel='global';renderTopoGlobal();renderTopoBreadcrumb()">🌐 全网总览</span>`;
  if (topoLevel !== 'global') {
    const dc = TOPO_GLOBAL.sites.find(s=>s.id===topoSelectedDC);
    if (dc) html += `<span class="tbc-sep">�?/span><span class="tbc-item tbc-active">🏢 ${dc.label}</span>`;
  }
  bc.innerHTML = html;
}

function renderTopoGlobal() {
  const wrap = document.getElementById('topoMainGraph');
  if (!wrap) return;
  if (topoG6Graph) { topoG6Graph.destroy(); topoG6Graph = null; }

  const W = wrap.clientWidth || 620;
  const H = wrap.clientHeight || 400;

  const fb = document.getElementById('topoFilterBar');
  if (fb) fb.classList.add('hidden');
  topoFilter = 'all';
  topoHighlightNode = null;

  const cx = W / 2, cy = H / 2;
  const positions = {
    dc1: [cx - 175, cy + 20],
    dc2: [cx + 100, cy + 20],
    dc3: [cx - 38,  cy + 140],
  };

  const cMap = { ok:'#16A34A', warn:'#D97706', crit:'#DC2626' };
  const dcMap = { dc1: TOPO_DC1, dc2: TOPO_DC2, dc3: TOPO_DC3 };

  const nodes = [
    // 云节�?
    { id:'cloud-internet', x:cx - 80, y:55, type:'topo-cloud', cloudLabel:'�? Internet', cloudSub:'中国电信 / 中国联�?, cloudColor:'#2563EB', cloudBg:'#EFF6FF', cloudBd:'#93C5FD', boxW:140, boxH:48 },
    { id:'cloud-mpls',     x:cx + 120, y:75, type:'topo-cloud', cloudLabel:'MPLS 骨干�?, cloudSub:'运营商专�?, cloudColor:'#059669', cloudBg:'#F0FDF4', cloudBd:'#6EE7B7', boxW:128, boxH:48 },
  ];

  // DC 站点节点
  TOPO_GLOBAL.sites.forEach(s => {
    const dc = dcMap[s.id];
    const alertCount = dc ? dc.nodes.filter(n => n.status !== 'ok').length : 0;
    nodes.push({ id:s.id, x:positions[s.id][0], y:positions[s.id][1], type:'topo-site', label:s.label, status:s.status, rooms:s.rooms, devices:s.devices, alertCount, boxW:144, boxH:90 });
  });

  const edges = [
    // 互联�?�?DC-A (高负载警�?
    { id:'inet-dc1', source:'cloud-internet', target:'dc1', type:'cubic', flowType:'warn',
      label:'WAN 84%', labelCfg:{ style:{ fontSize:8, fill:'#D97706', fontWeight:'bold', background:{ fill:'white', stroke:'#FDE68A', radius:3, padding:[2,5] } } },
      style:{ stroke:'#D97706', lineWidth:1.8, lineDash:[4,10], opacity:0.85, endArrow:false } },
    // MPLS �?DC-A/B
    { id:'mpls-dc1', source:'cloud-mpls', target:'dc1', type:'cubic', flowType:'ok',
      style:{ stroke:'#10B981', lineWidth:1.5, lineDash:[4,10], opacity:0.8, endArrow:false } },
    { id:'mpls-dc2', source:'cloud-mpls', target:'dc2', type:'cubic', flowType:'ok',
      style:{ stroke:'#10B981', lineWidth:1.5, lineDash:[4,10], opacity:0.8, endArrow:false } },
  ];

  // 站点间互�?
  TOPO_GLOBAL.links.forEach((l, i) => {
    const c = cMap[l.type] || '#94A3B8';
    edges.push({
      id:`site-${i}`, source:l.from, target:l.to, type:'cubic', flowType:l.type,
      label:l.label||'',
      labelCfg:{ style:{ fontSize:8, fill:c, fontWeight:'bold', background:{ fill:'white', stroke:'#E2E8F0', radius:3, padding:[2,5] } } },
      style:{ stroke:c, lineWidth:2, lineDash:[4,10], opacity:0.85, endArrow:false },
    });
  });

  const graph = new G6.Graph({
    container: 'topoMainGraph',
    width: W, height: H,
    modes: { default: ['drag-canvas', 'zoom-canvas'] },
    layout: { type: 'preset' },
    animate: false,
    fitView: false,
  });

  graph.data({ nodes, edges });
  graph.render();

  // 流量动画
  setTimeout(() => {
    graph.getEdges().forEach(edge => {
      const m = edge.getModel();
      if (!m.flowType) return;
      const dur = m.flowType === 'warn' ? 1200 : m.flowType === 'crit' ? 400 : 850;
      const shape = edge.getKeyShape();
      if (shape && shape.animate) {
        shape.animate({ lineDashOffset: -16 }, { duration: dur, easing: 'easeLinear', repeat: true });
      }
    });
  }, 80);

  // 点击 DC 站点 �?下钻
  graph.on('node:click', e => {
    const id = e.item.getID();
    if (!['dc1','dc2','dc3'].includes(id)) return;
    topoLevel = 'dc'; topoSelectedDC = id;
    renderTopoDC(id);
    renderTopoBreadcrumb();
    document.querySelectorAll('.tts-site-item').forEach(i => i.classList.toggle('tts-active', i.dataset.id === id));
  });

  topoG6Graph = graph;
  renderTopoBreadcrumb();
  hideTDPContent();
}

  hideTDPContent();
}

function renderTopoAIOverlay(dcId, graph) {
  const aiData = TOPO_AI_MAP[dcId];
  if (!aiData || !graph) return;
  const NW = 88, NHH = 14;
  const corrOp = topoFilter === 'ai' ? 1 : 0.5;

  // AI 关联�?(紫色虚线�?
  aiData.correlations.forEach((c, i) => {
    const edgeId = `__ai_corr_${i}`;
    try {
      graph.addItem('edge', {
        id: edgeId, source: c.from, target: c.to, type: 'cubic',
        label: `�?${c.label} · ${c.conf}%`,
        labelCfg: { style: { fontSize: 7.5, fill: '#7C3AED', fontWeight: 'bold', background: { fill: '#F5F3FF', stroke: '#C4B5FD', radius: 3, padding: [2,5] } } },
        style: { stroke: '#7C3AED', lineWidth: 2, lineDash: [5,4], opacity: corrOp, endArrow: { path: G6.Arrow.triangle(5,6,0), fill: '#7C3AED' } },
      });
      setTimeout(() => {
        const item = graph.findById(edgeId);
        if (item) {
          const shape = item.getKeyShape();
          if (shape && shape.animate) shape.animate({ lineDashOffset: -11 }, { duration: 800, easing: 'easeLinear', repeat: true });
        }
      }, 200);
    } catch(e) {}
  });

  // AI 风险预警�?+ 徽章 (加在节点 group �?
  aiData.risks.forEach(r => {
    const item = graph.findById(r.nodeId);
    if (!item) return;
    const group = item.getContainer();
    if (!group) return;
    const ring = group.addShape('rect', {
      attrs: { x: -NW/2-5, y: -NHH-5, width: NW+10, height: NHH*2+10, radius: 9, fill: null, stroke: '#F59E0B', lineWidth: 2.5, lineDash: [5,3], opacity: 0.8 },
      name: 'ai-risk-ring',
    });
    ring.animate(ratio => ({ opacity: 0.2 + Math.abs(Math.sin(ratio * Math.PI)) * 0.6 }), { duration: 1800, repeat: true });
    group.addShape('rect', { attrs: { x: -16, y: -NHH-18, width: 33, height: 14, radius: 4, fill: '#F59E0B', stroke: null }, name: 'ai-risk-bg' });
    group.addShape('text', { attrs: { x: 0.5, y: -NHH-11, text: '⚡预�?, fontSize: 7.5, fill: 'white', fontWeight: 'bold', textAlign: 'center', textBaseline: 'middle' }, name: 'ai-risk-txt' });
  });
}

function renderTopoDC(dcId) {
  const wrap = document.getElementById('topoMainGraph');
  if (!wrap) return;
  if (topoG6Graph) { topoG6Graph.destroy(); topoG6Graph = null; }

  const W = wrap.clientWidth || 620;
  const H = wrap.clientHeight || 420;

  const fb = document.getElementById('topoFilterBar');
  if (fb) fb.classList.remove('hidden');
  document.querySelectorAll('.tfb-btn').forEach(b => b.classList.toggle('tfb-active', b.dataset.filter === topoFilter));

  const dcData = dcId === 'dc1' ? TOPO_DC1 : dcId === 'dc2' ? TOPO_DC2 : TOPO_DC3;
  const cMap = { ok:'#16A34A', warn:'#D97706', crit:'#DC2626' };

  // 节点位置
  const layerY = {};
  dcData.layers.forEach(l => { layerY[l.id] = l.yr * H; });
  const nodePos = {};
  dcData.nodes.forEach(n => { nodePos[n.id] = { x: n.xr * W, y: layerY[n.layer] }; });

  const nodes = [];
  const edges = [];

  // ── 层带背景节点 ─────────────────────────────────────
  dcData.layers.forEach((l, i) => {
    const y = l.yr * H;
    const nextYr = i < dcData.layers.length - 1 ? dcData.layers[i+1].yr : 1.02;
    const bandH = (nextYr - l.yr) * H;
    nodes.push({
      id: `__band__${l.id}`, type: 'topo-band', draggable: false,
      x: W / 2, y: y - 22 + bandH / 2,
      bandW: W, bandH, bandFill: i % 2 === 0 ? '#F8FAFC' : '#FFFFFF', bandLabel: l.label,
    });
  });

  // ── 设备节点 ─────────────────────────────────────────
  dcData.nodes.forEach(n => {
    nodes.push({
      id: n.id, type: 'topo-device',
      x: nodePos[n.id].x, y: nodePos[n.id].y,
      label: n.label, devSub: n.sub, devType: n.type, devStatus: n.status, alerts: n.alerts,
    });
  });

  // ── 连接�?───────────────────────────────────────────
  dcData.links.forEach((l, i) => {
    const a = nodePos[l.from], b = nodePos[l.to];
    if (!a || !b) return;
    const c = cMap[l.type] || '#94A3B8';
    const sameLayer = Math.abs(a.y - b.y) < 8;
    const edgeDef = {
      id: `link-${i}`, source: l.from, target: l.to, flowType: l.type,
      type: sameLayer ? 'quadratic' : 'cubic-vertical',
      curveOffset: sameLayer ? 30 : 0,
      style: { stroke: c, lineWidth: 1.5, lineDash: [4,12], opacity: 0.88, endArrow: false },
    };
    if (l.label) {
      edgeDef.label = l.label;
      edgeDef.labelCfg = { style: { fontSize: 7, fill: c, fontWeight: 'bold', background: { fill: 'white', stroke: '#E2E8F0', radius: 2, padding: [1,4] } } };
    }
    edges.push(edgeDef);
  });

  const graph = new G6.Graph({
    container: 'topoMainGraph',
    width: W, height: H,
    modes: { default: ['drag-canvas', 'zoom-canvas', 'drag-node'] },
    layout: { type: 'preset' },
    animate: false, fitView: false,
    nodeStateStyles: { selected: {}, dimmed: {}, context: {} },
    edgeStateStyles: { dimmed: { opacity: 0.04 } },
  });

  graph.data({ nodes, edges });
  graph.render();

  // 流量动画
  setTimeout(() => {
    graph.getEdges().forEach(edge => {
      const m = edge.getModel();
      if (!m.flowType) return;
      const shape = edge.getKeyShape();
      const dur = m.flowType === 'crit' ? 400 : m.flowType === 'warn' ? 1200 : 850;
      if (shape && shape.animate) {
        shape.animate({ lineDashOffset: -16 }, { duration: dur, easing: 'easeLinear', repeat: true });
      }
    });
  }, 80);

  // 高亮节点 (从告警面板导�?
  if (topoHighlightNode) {
    setTimeout(() => {
      const item = graph.findById(topoHighlightNode);
      if (item) { graph.setItemState(item, 'selected', true); graph.focusItem(item); }
    }, 150);
  }

  // 节点点击事件
  graph.on('node:click', e => {
    const id = e.item.getID();
    if (id.startsWith('__band__')) return;
    graph.getNodes().forEach(n => { if (!n.getID().startsWith('__band__')) graph.clearItemStates(n, 'selected'); });
    graph.setItemState(e.item, 'selected', true);
    topoHighlightNode = id;
    document.querySelectorAll('.tdp-ap-item').forEach(i => i.classList.remove('tdp-ap-active'));
    const node = dcData.nodes.find(nd => nd.id === id);
    if (node) showTopoDevDetail(node);
  });

  topoG6Graph = graph;
  renderTopoAIOverlay(dcId, graph);
  if (topoFilter !== 'all') applyTopoFilter(topoFilter);
  hideTDPContent();
}

}

function showTopoDevDetail(node) {
  const ph = document.getElementById('tdpPlaceholder');
  const content = document.getElementById('tdpContent');
  if (ph) ph.classList.add('hidden');
  if (!content) return;
  content.classList.remove('hidden');
  const cMap  = { ok:'#16A34A', warn:'#D97706', crit:'#DC2626' };
  const sLab  = { ok:'正常运行', warn:'告警�?, crit:'故障'    };
  const c  = cMap[node.status];
  const st = TOPO_NODE_STYLES[node.type] || TOPO_NODE_STYLES.accswitch;
  const cpuC = node.cpu > 80 ? '#DC2626' : node.cpu > 60 ? '#D97706' : '#16A34A';
  // AI analysis section (prepended for nodes with AI data)
  let aiHtml = '';
  const aiDataMap = TOPO_AI_MAP[topoSelectedDC];
  const ai = aiDataMap && aiDataMap.nodeAnalysis[node.id];
  if (ai) {
    const dcRef = topoSelectedDC === 'dc1' ? TOPO_DC1 : topoSelectedDC === 'dc2' ? TOPO_DC2 : TOPO_DC3;
    const blastLabels = (ai.blastRadius || []).map(id => {
      const nd = dcRef.nodes.find(n => n.id === id);
      return nd ? nd.label : id;
    });
    aiHtml = `<div class="tdp-ai-section">
      <div class="tdp-ai-header">
        <span style="font-size:15px;line-height:1">🤖</span>
        <span class="tdp-ai-label">AI 根因推断</span>
        <span class="tdp-ai-conf">${ai.confidence}% 置信</span>
      </div>
      <div class="tdp-ai-cause">${ai.rootCause}</div>
      ${blastLabels.length > 0 ? `<div style="font-size:9px;color:#6D28D9;font-weight:700;margin-bottom:3px">影响 ${blastLabels.length} 台下游设�?/div>
      <div class="tdp-ai-row">${blastLabels.slice(0, 4).map(n => `<span class="tdp-ai-tag">${n}</span>`).join('')}${blastLabels.length > 4 ? `<span class="tdp-ai-tag">+${blastLabels.length - 4}</span>` : ''}</div>` : ''}
      ${ai.predictEta ? `<div class="tdp-ai-risk-bar"><span style="flex-shrink:0">�?/span>${ai.predictEta}</div>` : ''}
      <div style="font-size:9px;font-weight:700;color:#5B21B6;margin-top:7px;margin-bottom:2px">💡 建议操作</div>
      ${ai.actions.map((a, i) => `<div class="tdp-ai-action-item"><span style="color:#7C3AED;font-weight:700;flex-shrink:0">${i + 1}.</span>${a}</div>`).join('')}
      <div style="font-size:8px;color:#A78BFA;margin-top:6px">事件编号: ${ai.incidentId} · AI 多源关联分析</div>
    </div>`;
  }
  content.innerHTML = aiHtml + `
    <div style="border-left:3px solid ${st.bd};padding:7px 10px;background:${st.bg};border-radius:0 6px 6px 0;margin-bottom:10px">
      <div style="font-size:12px;font-weight:700;color:#1F2328">${node.label}</div>
      <div style="font-size:10px;color:${st.tc};margin-top:2px">${node.role}</div>
    </div>
    <div class="tdp-kv-list">
      <div class="tdp-kv"><span class="tdp-k">运行状�?/span>
        <span class="tdp-v" style="color:${c};font-weight:700">${sLab[node.status]}</span></div>
      <div class="tdp-kv"><span class="tdp-k">管理 IP</span>
        <span class="tdp-v" style="font-family:monospace">${node.ip}</span></div>
      <div class="tdp-kv"><span class="tdp-k">设备型号</span>
        <span class="tdp-v" style="font-size:10px">${node.model}</span></div>
      <div class="tdp-kv"><span class="tdp-k">CPU 使用�?/span>
        <span class="tdp-v" style="display:flex;align-items:center;gap:5px">
          <span style="color:${cpuC};font-weight:700;min-width:28px">${node.cpu}%</span>
          <span style="flex:1;height:5px;background:#E5E7EB;border-radius:3px;min-width:44px">
            <span style="display:block;height:100%;width:${node.cpu}%;background:${cpuC};border-radius:3px"></span>
          </span>
        </span>
      </div>
      ${node.alerts > 0 ? `<div class="tdp-kv"><span class="tdp-k">活跃告警</span>
        <span class="tdp-v" style="color:#DC2626;font-weight:700">${node.alerts} �?/span></div>` : ''}
    </div>
    ${node.status !== 'ok' ? `
    <div style="margin-top:8px;padding:8px;background:#FEF2F2;border-radius:6px;border:1px solid #FECACA">
      <div style="font-size:10px;font-weight:700;color:#DC2626;margin-bottom:3px">�?异常说明</div>
      <div style="font-size:10px;color:#7F1D1D">${node.status === 'crit' ? '设备存在严重故障，请立即处置' : '设备存在告警，请关注处理'}</div>
    </div>` : ''}
    <div style="margin-top:10px;display:flex;gap:6px">
      <button onclick="switchOpsSub('ops-fault',true)" style="flex:1;padding:5px 4px;font-size:10px;background:${st.bd};color:white;border:none;border-radius:5px;cursor:pointer">关联故障</button>
      <button style="flex:1;padding:5px 4px;font-size:10px;background:white;color:${st.tc};border:1px solid ${st.bd};border-radius:5px;cursor:pointer">查看详情</button>
    </div>
  `;
}

function hideTDPContent() {
  const ph = document.getElementById('tdpPlaceholder');
  const content = document.getElementById('tdpContent');
  if (ph) ph.classList.remove('hidden');
  if (content) content.classList.add('hidden');
}


// ── 流量分析 v2 ────────────────────────────────────────────
var trfSelectedLink = 'wan1';

function initOpsTraffic() {
  trfSelectedLink = 'wan1';
  renderTrfAIStrip();
  renderTrfLinkGrid();
  renderTrfLinkTabs();
  updateTrfTrendChart();
  renderTrfTopList();
  initTrfProtoChart();
  renderTrfAnomalyList();
  renderTrfCapList();
  var zsel = document.getElementById('trfTopZone');
  if (zsel) { zsel.value = 'wan'; zsel.onchange = function() { renderTrfTopList(); }; }
}

function renderTrfAIStrip() {
  var el = document.getElementById('trfAIStrip');
  if (!el) return;
  var cards = [
    { icon:'warning',     bg:'#FFF5F5', border:'#FFCDD2', col:'#CF222E', label:'链路异常',    val:'2 条', sub:'SW-Core-02 · WAN-01' },
    { icon:'trending_up', bg:'#FEFCE8', border:'#FDE68A', col:'#D09B00', label:'容量预警',    val:'3 条', sub:'48h 内达阈值' },
    { icon:'security',    bg:'#FFF5F5', border:'#FFCDD2', col:'#CF222E', label:'安全威胁',    val:'1 起', sub:'DNS 隧道 · APT C2' },
    { icon:'query_stats', bg:'#F5F0FF', border:'#DDD6FE', col:'#6E40C9', label:'AI 分析置信', val:'93%',  sub:'多源关联完成' },
  ];
  el.innerHTML = cards.map(function(c) {
    return '<div class="trf-ai-card" style="background:' + c.bg + ';border-color:' + c.border + '">' +
      '<span class="material-symbols-rounded trf-ai-card-icon" style="color:' + c.col + '">' + c.icon + '</span>' +
      '<div class="trf-ai-card-body">' +
        '<div class="trf-ai-card-label">' + c.label + '</div>' +
        '<div class="trf-ai-card-val" style="color:' + c.col + '">' + c.val + '</div>' +
        '<div class="trf-ai-card-sub">' + c.sub + '</div>' +
      '</div></div>';
  }).join('');
}

function renderTrfLinkGrid() {
  var el = document.getElementById('trfLinkGrid');
  if (!el) return;
  el.innerHTML = TRF_LINKS.map(function(lk) {
    var sc = lk.status === 'crit' ? '#CF222E' : lk.status === 'warn' ? '#D09B00' : '#1A7F37';
    var sl = lk.status === 'crit' ? '严重' : lk.status === 'warn' ? '预警' : '正常';
    var sel = lk.id === trfSelectedLink;
    return '<div class="trf-lh-card' + (sel ? ' trf-lh-selected' : '') + '" data-linkid="' + lk.id + '" onclick="selectTrfLink(\'' + lk.id + '\')">' +
      '<div class="trf-lh-top"><span class="trf-lh-name">' + lk.name + '</span><span class="trf-lh-status" style="color:' + sc + '">' + sl + '</span></div>' +
      '<div class="trf-lh-zone">' + lk.zone + ' · ' + lk.capacity + '</div>' +
      '<div class="trf-lh-bar-wrap"><div class="trf-lh-bar" style="width:' + lk.util + '%;background:' + sc + '"></div></div>' +
      '<div class="trf-lh-pct-row"><span class="trf-lh-pct" style="color:' + sc + '">' + lk.util + '%</span>' +
        (lk.aiNote ? '<span class="trf-lh-ainote">&#129302; ' + lk.aiNote + '</span>' : '') +
      '</div></div>';
  }).join('');
}

function selectTrfLink(linkId) {
  trfSelectedLink = linkId;
  document.querySelectorAll('.trf-lh-card').forEach(function(c) { c.classList.toggle('trf-lh-selected', c.dataset.linkid === linkId); });
  document.querySelectorAll('.trf-link-tab').forEach(function(t) { t.classList.toggle('trf-tab-active', t.dataset.linkid === linkId); });
  updateTrfTrendChart();
}

function renderTrfLinkTabs() {
  var el = document.getElementById('trfLinkTabs');
  if (!el) return;
  el.innerHTML = TRF_LINKS.map(function(lk) {
    var dot = lk.status === 'crit' ? '#CF222E' : lk.status === 'warn' ? '#D09B00' : '#1A7F37';
    return '<button class="trf-link-tab' + (lk.id === trfSelectedLink ? ' trf-tab-active' : '') + '" data-linkid="' + lk.id + '" onclick="selectTrfLink(\'' + lk.id + '\')">' +
      '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + dot + ';margin-right:3px;vertical-align:middle"></span>' + lk.name + '</button>';
  }).join('');
}

function updateTrfTrendChart() {
  var canvas = document.getElementById('trfTrendChart');
  if (!canvas) return;
  if (opsCharts.trfTrend) { opsCharts.trfTrend.destroy(); delete opsCharts.trfTrend; }
  var lk = TRF_LINKS.find(function(l) { return l.id === trfSelectedLink; });
  var trd = TRF_LINK_TRENDS[trfSelectedLink];
  if (!lk || !trd) return;
  var hours = Array.from({length: 24}, function(_, i) { return String(i).padStart(2, '0') + ':00'; });
  opsCharts.trfTrend = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: hours,
      datasets: [{
        label: lk.name + ' (' + lk.capacity + ')',
        data: trd.data,
        borderColor: trd.color, backgroundColor: trd.bg,
        fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#8C959F', maxTicksLimit: 8 } },
        y: { grid: { color: '#F0F3F6' }, ticks: { font: { size: 9 }, color: '#8C959F' }, beginAtZero: false,
             title: { display: true, text: 'Mbps', font: { size: 9 }, color: '#8C959F' } }
      }
    }
  });
  var badge = document.getElementById('trfAIPredBadge');
  if (badge) {
    if (trd.aiNote) {
      badge.style.display = '';
      badge.innerHTML = '<span class="material-symbols-rounded" style="font-size:12px;vertical-align:middle;margin-right:4px">smart_toy</span>' + trd.aiNote;
    } else { badge.style.display = 'none'; }
  }
}

function renderTrfTopList() {
  var el = document.getElementById('trfTopList');
  if (!el) return;
  var zsel = document.getElementById('trfTopZone');
  var zone = zsel ? zsel.value : 'wan';
  var hosts = TRF_TOP_BY_ZONE[zone] || [];
  el.innerHTML = hosts.map(function(h, i) {
    var flagHtml = h.flag === 'crit'
      ? '<span class="material-symbols-rounded trf-flag-red">warning</span>'
      : h.flag === 'warn'
      ? '<span class="material-symbols-rounded trf-flag-yellow">info</span>' : '';
    var noteHtml = h.note ? '<span class="trf-top-note">' + h.note + '</span>' : '';
    return '<div class="trf-top-item">' +
      '<span class="trf-rank ' + (i < 3 ? 'trf-rank-top' : '') + '">' + (i + 1) + '</span>' +
      '<div class="trf-top-body">' +
        '<div class="trf-top-name">' + h.name + ' <span class="trf-top-ip">' + h.ip + '</span> ' + flagHtml + '</div>' +
        '<div class="trf-top-proto">' + h.proto + ' ' + noteHtml + '</div>' +
      '</div>' +
      '<div class="trf-top-right"><span class="trf-top-bps">' + h.bps + '</span></div>' +
      '</div>';
  }).join('');
}

function renderTrfAnomalyList() {
  var el = document.getElementById('trfAnomalyList');
  if (!el) return;
  el.innerHTML = TRF_ANOMALIES_V2.map(function(a) {
    var actCls = a.action === '已隔离' ? 'trf-action-done' : a.action === '处置中' ? 'trf-action-proc' : 'trf-action-warn';
    return '<div class="trf-anomaly-item trf-anom-' + a.sev + '">' +
      '<span class="material-symbols-rounded trf-anom-icon">' + a.icon + '</span>' +
      '<div class="trf-anom-body">' +
        '<div class="trf-anom-title">' + a.title + ' <span class="trf-anom-time">' + a.time + '</span></div>' +
        '<div class="trf-anom-desc">' + a.desc + '</div>' +
        '<div class="trf-anom-link">链路：' + a.link + '</div>' +
      '</div>' +
      '<span class="trf-anom-action ' + actCls + '">' + a.action + '</span></div>';
  }).join('');
}

function renderTrfCapList() {
  var el = document.getElementById('trfCapList');
  if (!el) return;
  el.innerHTML = TRF_CAPACITY.map(function(c) {
    var rc = c.risk === 'crit' ? '#CF222E' : c.risk === 'high' ? '#D09B00' : '#9A6700';
    var rb = c.risk === 'crit' ? '#FFEBE9' : c.risk === 'high' ? '#FFF8C5' : '#FEFCE8';
    return '<div class="trf-cap-item">' +
      '<div class="trf-cap-top"><span class="trf-cap-link">' + c.link + '</span><span class="trf-cap-util" style="color:' + rc + '">' + c.util + '%</span></div>' +
      '<div class="trf-cap-eta" style="background:' + rb + ';color:' + rc + '">' +
        '<span class="material-symbols-rounded" style="font-size:11px;vertical-align:middle;margin-right:3px">schedule</span>' + c.etaText +
      '</div>' +
      '<div class="trf-cap-advice">' + c.advice + '</div>' +
      '<button class="trf-cap-btn">' + c.action + '</button></div>';
  }).join('');
}

/* orphan_removed {label:'6号机房互�?

*/
function initTrfProtoChart() {
  const canvas = document.getElementById('trfProtoChart');
  if (!canvas) return;
  if (opsCharts.trfProto) { opsCharts.trfProto.destroy(); delete opsCharts.trfProto; }
  const data=[
    {label:'HTTP/HTTPS',val:38,color:'#0969DA'},
    {label:'MySQL/DB',  val:22,color:'#1A7F37'},
    {label:'NFS/存储',  val:16,color:'#9A6700'},
    {label:'rsync/备份',val:10,color:'#6E40C9'},
    {label:'DNS',       val:8, color:'#CF222E'},
    {label:'其他',      val:6, color:'#636C76'},
  ];
  opsCharts.trfProto = new Chart(canvas.getContext('2d'), {
    type:'doughnut',
    data:{labels:data.map(d=>d.label),datasets:[{data:data.map(d=>d.val),backgroundColor:data.map(d=>d.color),borderWidth:2,borderColor:'#fff'}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'right',labels:{font:{size:10},boxWidth:10,padding:6}}},cutout:'60%'}
  });
}

// ── 故障分析 ─────────────────────────────────────────────
function initOpsFault() {
  faultFilterSev = 'ALL';
  renderFaultList();
  selectFault(FAULT_EVENTS[0].id);
  bindFaultFilters();
}

function renderFaultList() {
  const el = document.getElementById('faultEventList');
  if (!el) return;
  const colorMap = {P1:'#CF222E', P2:'#D09B00', P3:'#636C76'};
  const statusIcon= {'处置�?:'sync','已关�?:'check_circle'};
  const filtered = faultFilterSev === 'ALL' ? FAULT_EVENTS : FAULT_EVENTS.filter(f=>f.pri===faultFilterSev);
  el.innerHTML = filtered.map(f => `
    <div class="fault-list-item ${selectedFaultId===f.id?'fli-active':''}" data-id="${f.id}" style="border-left:3px solid ${colorMap[f.pri]}">
      <div class="fli-top">
        <span class="fli-pri" style="color:${colorMap[f.pri]};background:${colorMap[f.pri]}15;border-radius:4px;padding:1px 7px;font-size:10.5px;font-weight:700">${f.pri}</span>
        <span class="fli-time">${f.time}</span>
        <span class="material-symbols-rounded fli-status" style="font-size:13px;color:${f.status==='处置�??'#D09B00':'#636C76'}">${statusIcon[f.status]||'help'}</span>
        <span class="fli-status-label">${f.status}</span>
      </div>
      <div class="fli-title">${f.title}</div>
      <div class="fli-tags">${f.tags.map(t=>`<span class="fli-tag">${t}</span>`).join('')}</div>
    </div>
  `).join('');
  el.querySelectorAll('.fault-list-item').forEach(item => {
    item.addEventListener('click', () => selectFault(item.dataset.id));
  });
}

function selectFault(id) {
  selectedFaultId = id;
  renderFaultList();
  renderFaultRca(id);
  renderFaultImpact(id);
}

function renderFaultRca(id) {
  const fault = FAULT_EVENTS.find(f => f.id === id);
  const el = document.getElementById('faultRcaBody');
  if (!fault || !el) return;
  const r = fault.rca;
  el.innerHTML = `
    <div class="frca-conf-row">
      <span class="frca-conf-label">AI 根因置信�?/span>
      <span class="frca-conf-pct" style="color:${r.color}">${r.conf}%</span>
      <div class="frca-conf-bar-wrap"><div class="frca-conf-bar" style="width:${r.conf}%;background:${r.color}"></div></div>
    </div>
    <div class="frca-root-cause">${r.rootCause}</div>
    <div class="frca-chain-title">因果链路</div>
    <div class="frca-chain">
      ${r.chain.map((c,i) => `
        <div class="frca-chain-item frca-sev-${c.sev}">
          <div class="frca-chain-connector">${i>0?'�?:''}</div>
          <div class="frca-chain-content">
            <span class="material-symbols-rounded frca-chain-icon">${c.icon}</span>
            <span class="frca-chain-text">${c.text}</span>
            <span class="frca-chain-time">${c.time}</span>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="frca-sources-title">数据来源</div>
    <div class="frca-sources">${r.dataSources.map(s=>`<span class="frca-src">${s}</span>`).join('')}</div>
  `;
}

function renderFaultImpact(id) {
  const fault = FAULT_EVENTS.find(f => f.id === id);
  const el = document.getElementById('faultImpactBody');
  if (!fault || !el) return;
  el.innerHTML = `
    <div class="fimp-scope">${fault.rca.impact}</div>
    <div class="fimp-domain"><span class="fimp-label">跨域</span>${fault.domain}</div>
    <div class="fimp-section-title">关联设备</div>
    <div class="fimp-device-list">
      ${fault.tags.filter(t=>t.match(/^[A-Z]/)).map(t=>`
        <div class="fimp-dev-item">
          <span class="material-symbols-rounded" style="font-size:13px;color:#636C76">router</span>
          <span>${t}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function bindFaultFilters() {
  document.querySelectorAll('.ffc-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.ffc-btn').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      faultFilterSev = chip.dataset.sev;
      renderFaultList();
    });
  });
}


// ── 设备台账 ─────────────────────────────────────────────
function initOpsInventory() {
  invAllDevices = [...INV_DEVICES];
  bindInvFilters();
  renderInvTable('');
}

function bindInvFilters() {
  const search = document.getElementById('invSearch');
  const selType = document.getElementById('invTypeFilter');
  const selZone = document.getElementById('invZoneFilter');
  const selHealth = document.getElementById('invHealthFilter');
  const handler = () => {
    const q = search ? search.value.toLowerCase() : '';
    const typ = selType ? selType.value : '';
    const zon = selZone ? selZone.value : '';
    const hlt = selHealth ? selHealth.value : '';
    renderInvTable(q, typ, zon, hlt);
  };
  if (search) search.oninput = handler;
  if (selType) selType.onchange = handler;
  if (selZone) selZone.onchange = handler;
  if (selHealth) selHealth.onchange = handler;
}

function renderInvTable(q, type, zone, health) {
  const el = document.getElementById('invTableBody');
  if (!el) return;
  const q2 = (q||'').toLowerCase();
  const rows = INV_DEVICES.filter(d => {
    if (q2 && !d.name.toLowerCase().includes(q2) && !d.ip.includes(q2)) return false;
    if (type && d.type !== type) return false;
    if (zone && d.zone !== zone) return false;
    if (health && d.health !== health) return false;
    return true;
  });
  const cpuColor = v => v>=85?'#CF222E':v>=70?'#D09B00':'#1A7F37';
  const hColor   = v => v==='告警'?'#D09B00':v==='故障'?'#CF222E':'#1A7F37';
  el.innerHTML = rows.map(d => `
    <tr class="inv-tr">
      <td class="inv-td inv-td-name"><span class="inv-health-dot" style="background:${hColor(d.health)}"></span>${d.name}</td>
      <td class="inv-td">${d.type}</td>
      <td class="inv-td inv-td-mono">${d.ip}</td>
      <td class="inv-td">${d.zone}</td>
      <td class="inv-td">${d.room}</td>
      <td class="inv-td">
        <div class="inv-cpu-bar-wrap">
          <div class="inv-cpu-bar" style="width:${d.cpu}%;background:${cpuColor(d.cpu)}"></div>
        </div>
        <span style="font-size:10px;color:${cpuColor(d.cpu)};font-weight:600">${d.cpu}%</span>
      </td>
      <td class="inv-td"><span style="font-size:10px;color:${cpuColor(d.mem)};font-weight:600">${d.mem}%</span></td>
      <td class="inv-td">${d.portUsed}/${d.portTotal}</td>
      <td class="inv-td"><span class="inv-health-badge" style="color:${hColor(d.health)};background:${hColor(d.health)}15">${d.health}</span></td>
      <td class="inv-td">${d.alerts>0?`<span style="color:#CF222E;font-weight:700">${d.alerts}</span>`:'<span style="color:#636C76">�?/span>'}</td>
      <td class="inv-td inv-td-insp">${d.lastInsp}</td>
      <td class="inv-td"><button class="inv-act-btn">详情</button></td>
    </tr>
  `).join('');
  // Update count
  const countEl = document.getElementById('invCount');
  if (countEl) countEl.textContent = `�?${rows.length} 台`;
}

// ── 容量规划 ─────────────────────────────────────────────
function initOpsCapacity() {
  renderCapKpis();
  renderCapActions();
  renderCapPorts();
  initCapForecastChart();
}

function renderCapKpis() {
  const kpis = [
    { id:'capKpiWan',  label:'WAN-01 利用�?, val:'84%',  trend:'+2%/�?, sev:'crit' },
    { id:'capKpiCore', label:'核心层峰�?,     val:'89%',  trend:'SW-Core-02热降�?, sev:'crit' },
    { id:'capKpiAgg',  label:'汇聚层利用率',   val:'67%',  trend:'正常', sev:'ok' },
    { id:'capKpiPort', label:'端口利用�?,      val:'68%',  trend:'+1.2%/�?, sev:'ok' },
  ];
  kpis.forEach(k => {
    const el = document.getElementById(k.id);
    if (el) {
      el.querySelector && el.querySelector('.cap-kpi-val') ?
        (el.querySelector('.cap-kpi-val').textContent = k.val) : null;
    }
  });
}

function renderCapActions() {
  const el = document.getElementById('capActionList');
  if (!el) return;
  el.innerHTML = CAP_ACTIONS.map(a => `
    <div class="cap-action-item ${a.cls}">
      <div class="cap-action-top">
        <span class="cap-action-pri">${a.pri}</span>
        <span class="cap-action-title">${a.action}</span>
      </div>
      <div class="cap-action-detail">${a.detail}</div>
      <div class="cap-action-impact"><span class="material-symbols-rounded" style="font-size:11px">trending_up</span>${a.impact}</div>
    </div>
  `).join('');
}

function renderCapPorts() {
  const el = document.getElementById('capPortList');
  if (!el) return;
  el.innerHTML = CAP_PORTS.map(p => {
    const sev = p.pct>=85?'crit':p.pct>=70?'warn':'ok';
    const c = sev==='crit'?'#CF222E':sev==='warn'?'#D09B00':'#1A7F37';
    return `
      <div class="cap-port-row">
        <span class="cap-port-zone">${p.zone}</span>
        <div class="cap-port-bar-wrap">
          <div class="cap-port-bar" style="width:${p.pct}%;background:${c}"></div>
        </div>
        <span class="cap-port-pct" style="color:${c}">${p.pct}%</span>
        <span class="cap-port-detail">${p.used}/${p.total}</span>
      </div>
    `;
  }).join('');
}

function initCapForecastChart() {
  const canvas = document.getElementById('capForecastChart');
  if (!canvas) return;
  if (opsCharts.capForecast) { opsCharts.capForecast.destroy(); delete opsCharts.capForecast; }
  const days = Array.from({length:30},(_,i)=>`D+${i+1}`);
  const actual   = [840,845,843,848,855,862,858,870,875,880,878,885,890,895,898,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];
  const predict  = [null,null,null,null,null,null,null,null,null,null,null,null,null,null,898,905,912,918,922,928,935,942,948,955,962,970,975,982,988,995];
  const threshold= Array(30).fill(900);
  opsCharts.capForecast = new Chart(canvas.getContext('2d'), {
    type:'line',
    data:{
      labels:days,
      datasets:[
        {label:'实际流量(Mbps)',   data:actual,   borderColor:'#0969DA', backgroundColor:'rgba(9,105,218,0.08)', fill:true, tension:0.4, pointRadius:0, borderWidth:2},
        {label:'AI预测',           data:predict,  borderColor:'#D09B00', borderDash:[5,3], backgroundColor:'rgba(208,155,0,0.05)', fill:false, tension:0.4, pointRadius:0, borderWidth:2},
        {label:'80%阈�?(900Mbps)',data:threshold,borderColor:'#CF222E', borderDash:[3,3], backgroundColor:'transparent', fill:false, pointRadius:0, borderWidth:1.5},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:true,position:'top',labels:{font:{size:10},boxWidth:12,padding:8}}},
      scales:{
        x:{grid:{display:false},ticks:{font:{size:9},color:'#8C959F',maxTicksLimit:10}},
        y:{grid:{color:'#F0F3F6'},ticks:{font:{size:9},color:'#8C959F'},title:{display:true,text:'Mbps',font:{size:9},color:'#8C959F'},min:700},
      }
    }
  });
}

