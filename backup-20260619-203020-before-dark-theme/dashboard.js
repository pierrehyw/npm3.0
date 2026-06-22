/* ══════════════════════════════════════════════════════════
   NGPM Dashboard — dashboard.js
   演示数据 · 角色切换 · 告警抽屉 · AI Copilot
══════════════════════════════════════════════════════════ */

// ── 演示数据 ─────────────────────────────────────────────

const RAW_ALERTS = [
  { time: '14:23:07', sev: 'CRIT', src: '网管系统', device: 'SW-Core-02', msg: 'CPU 利用率 89%（阈值 80%）' },
  { time: '14:23:09', sev: 'WARN', src: '网管系统', device: 'SW-Core-02', msg: 'Gi1/0/1 输出错误率 2.3%' },
  { time: '14:23:09', sev: 'WARN', src: '网管系统', device: 'SW-Core-02', msg: 'Gi1/0/2 输出错误率 1.8%' },
  { time: '14:23:09', sev: 'WARN', src: '网管系统', device: 'SW-Core-02', msg: 'Gi1/0/3 输出错误率 2.1%' },
  { time: '14:23:10', sev: 'WARN', src: '网管系统', device: 'SW-Core-02', msg: 'Gi1/0/4 输出错误率 1.6%' },
  { time: '14:23:11', sev: 'WARN', src: '云监控', device: 'VM-047', msg: '心跳延迟超阈值（240ms > 100ms）' },
  { time: '14:23:11', sev: 'WARN', src: '云监控', device: 'VM-051', msg: '心跳延迟超阈值（270ms > 100ms）' },
  { time: '14:23:11', sev: 'WARN', src: '云监控', device: 'VM-063', msg: '心跳延迟超阈值（310ms > 100ms）' },
  { time: '14:23:12', sev: 'CRIT', src: '动环监控', device: 'PAC-B06', msg: '精密空调控制器失联' },
  { time: '14:23:12', sev: 'CRIT', src: '动环监控', device: 'TMP-B06-1', msg: '机柜温度 38.2°C（阈值 32°C）' },
  { time: '14:23:14', sev: 'WARN', src: '云监控', device: 'VM-071', msg: '迁移任务超时' },
  { time: '14:23:14', sev: 'WARN', src: '云监控', device: 'VM-082', msg: '迁移任务超时' },
  { time: '14:23:15', sev: 'WARN', src: '网管系统', device: 'ACC-B01', msg: 'VLAN100 转发延迟 +340ms' },
  { time: '14:23:15', sev: 'WARN', src: '网管系统', device: 'ACC-B02', msg: 'VLAN100 转发延迟 +340ms' },
  { time: '14:23:16', sev: 'WARN', src: '云监控', device: 'VM-091', msg: '心跳延迟超阈值' },
  { time: '14:23:16', sev: 'WARN', src: '云监控', device: 'VM-095', msg: '心跳延迟超阈值' },
  { time: '14:23:17', sev: 'WARN', src: '服务器监控', device: 'APP-SRV-01', msg: 'ERP P99 响应时间 2,100ms' },
  { time: '14:23:18', sev: 'WARN', src: '服务器监控', device: 'APP-SRV-02', msg: 'ERP 数据库连接池告警' },
  { time: '14:23:19', sev: 'INFO', src: '云监控', device: 'VM-CLST-B', msg: '集群可用性进入告警状态' },
  { time: '14:23:21', sev: 'WARN', src: '网管系统', device: 'SW-Core-02', msg: '内存利用率 94%（基线 45%）' },
];

const AI_EVENTS = [
  {
    id: '#001', sev: '🔴', type: '根因', cls: 'aie-root',
    title: 'PAC-B06 精密空调制冷异常',
    conf: '96%',
    chain: [
      { icon: 'thermostat', text: '温度传感器 TMP-B06-1 → 38.2°C（阈值 32°C） | 14:21:03' },
      { icon: 'power_off', text: '空调控制器 PAC-B06 停止响应 | 14:22:17' },
      { icon: 'device_thermostat', text: 'SW-Core-02 触发热降频保护，CPU 34%→89% | 14:23:07' },
    ],
    impact: '影响：1台核心交换机 · VLAN100 · 14台VM · ERP系统',
  },
  {
    id: '#002', sev: '🟠', type: '影响', cls: 'aie-impact',
    title: 'SW-Core-02 热降频导致 VLAN100 转发能力下降',
    conf: '94%',
    chain: [
      { icon: 'trending_up', text: '关联于事件 #001（空调故障）' },
      { icon: 'network_check', text: 'VLAN100 转发延迟 +340ms · 3个接口错误率上升' },
    ],
    impact: '影响：ACC-B01 / ACC-B02 / 下联 VM 集群',
  },
  {
    id: '#003', sev: '�', type: '影响', cls: 'aie-impact',
    title: '云平台 VM 集群迁移任务堆积',
    conf: '89%',
    chain: [
      { icon: 'link', text: '关联于事件 #002（VLAN100 延迟）' },
      { icon: 'warning', text: '14台VM迁移挂起 · ERP p99: 2,100ms' },
    ],
    impact: '业务影响：ERP 3个部门，响应超阈值',
  },
  {
    id: '#004', sev: '🔴', type: '根因', cls: 'aie-root',
    title: 'CRM 集群 CPU 持续高负载',
    conf: '91%',
    chain: [
      { icon: 'memory', text: 'APP-SRV-01/02 CPU 均值 94%，持续超 80% SLA 阈值 | 14:18:00' },
      { icon: 'database', text: 'CRM 数据库连接池达上限（500/500）| 14:19:33' },
      { icon: 'speed', text: 'CRM P99 响应时间 2,100ms（基线 65ms）| 14:20:10' },
    ],
    impact: '影响：CRM 业务 3 个部门，218ms 响应时间上升 3.2倍',
  },
  {
    id: '#005', sev: '🟡', type: '影响', cls: 'aie-impact',
    title: '存储池 IO 延迟升高',
    conf: '82%',
    chain: [
      { icon: 'link', text: '关联于事件 #004（CPU 高负载）' },
      { icon: 'storage', text: '存储池 IOPS 超阈值 · 平均延迟 45ms（基线 8ms）' },
    ],
    impact: '影响：VM-CLST-B 存储访问，数据库写入延迟',
  },
  {
    id: '#006', sev: '🟡', type: '预警', cls: 'aie-impact',
    title: '出口带宽 48h 容量预警',
    conf: '88%',
    chain: [
      { icon: 'show_chart', text: 'AI 预测出口带宽将于 48h 内达到 91% 利用率' },
      { icon: 'schedule', text: '当前峰值 82%，趋势持续上升 | 历史同期 +18%' },
    ],
    impact: '潜在影响：业务高峰期带宽瓶颈，建议提前扩容',
  },
  {
    id: '#007', sev: '🔴', type: '安全', cls: 'aie-root',
    title: '疑似 DNS 隧道 C2 外连行为',
    conf: '93%',
    chain: [
      { icon: 'security', text: 'VM-Prod-047 向境外 IP 发起异常 DNS 查询 · 频率 420次/分 | 14:10:05' },
      { icon: 'block', text: 'AI 自动隔离 VM-Prod-047，切断外连 | 14:10:38' },
      { icon: 'policy', text: '同批次镜像 2 台 VM 待确认排查' },
    ],
    impact: '安全影响：高危 · 已隔离，待扩大排查',
  },
  {
    id: '#008', sev: '🟡', type: '预警', cls: 'aie-impact',
    title: '存储池剩余空间预警',
    conf: '95%',
    chain: [
      { icon: 'storage', text: '当前存储池剩余 26%（2.8TB / 10.8TB）' },
      { icon: 'trending_down', text: 'AI 预测 38 天后触警（<20%）· 增速加快 12%/月' },
    ],
    impact: '影响：VM 新建 / 快照操作受阻，建议本月申请扩容',
  },
  {
    id: '#009~023', sev: '⚪', type: '低级别', cls: 'aie-info',
    title: '其余 15 个低级别事件（已自动处置）',
    conf: '—',
    chain: [
      { icon: 'check_circle', text: '接口 CRC 错误 × 4 · 日志量超阈值 × 3 · 性能基线偏移 × 8' },
      { icon: 'auto_fix_high', text: 'AI 已自动收敛，无业务影响' },
    ],
    impact: '无业务影响，系统已自动处置',
  },
];

// ── AI Copilot 静态问答库 ────────────────────────────────

const COPILOT_QA = {
  executive: [
    {
      q: '今天有什么需要我关注的风险？',
      a: `今日有 2 项需要您关注：

🔴 已发生：B区空调故障已于 47 分钟前处置完毕，ERP系统已恢复正常。本次故障从 AI 识别到根因仅用时 3 分钟，避免了传统方式约 2-4 小时的排查延迟。

🟡 即将发生：季度末业务高峰将在 48 小时内到来，核心出口链路预计达到 91% 利用率。运维处已收到 AI 预警，建议今日确认备用链路配置方案是否已启动。

其余 21 个 AI 识别事件均为低级别，已由系统自动处置。`,
    },
    {
      q: '本月 SLA 达成情况怎样？',
      a: `本月（1-28日）SLA 达成率为 99.2%，高于目标 99% ✅

故障时长统计：
· 累计业务影响时长：347 分钟
· 其中今日 B区空调事件：47 分钟
· MTTR 平均：38 分钟（上月 142 分钟，↓ 73%）

AI 贡献：本月共收敛告警 47,832 条 → 186 个有效事件，运维团队工单处理量减少约 86%。`,
    },
    {
      q: '生成本月运维报告',
      a: `📄 大数据中心 · 2026年4月 运维分析报告（AI 生成）

── 整体评估 ──
综合健康评分：88/100，较上月提升 3 分
SLA 达成率：99.2%（目标 99%）✅

── 故障概览 ──
本月发生故障 3 次，较上月减少 2 次（-40%）
MTTR 从 142 分钟降至 38 分钟（AI 驱动 -73%）

── AI 价值 ──
告警收敛：47,832 → 186 有效事件（-99.6%）
跨系统根因关联：3 次准确定位，节省人工排查约 16 小时

── 建议 ──
① B区机柜精密空调建议纳入本月维保计划
② 核心出口链路 WAN-01 建议评估扩容（季度末风险）
③ TLS 1.0 遗留 API（2%）建议联系 ERP 厂商升级`,
    },
  ],
  ops: [
    {
      q: 'B区空调故障现在处理好了吗？',
      a: `PAC-B06 空调已于 15:10 完成应急处置（启用临时制冷），机柜温度已降至 29.4°C，恢复正常范围。

后续需关注：
1. SW-Core-02 降频保护已自动解除，CPU 恢复至 34%，但接口 Gi1/0/1~Gi1/0/3 错误率仍略偏高（0.12%），建议今晚低峰期检查接口物理状态

2. 14台 VM 的迁移任务已全部完成，无数据丢失

3. 空调 PAC-B06 历史维保记录：上次维保 284 天前，建议纳入本月紧急维保计划`,
    },
    {
      q: '最近30天哪条链路最值得关注？',
      a: `基于 30 天趋势分析，以下 3 条链路需要关注：

🔴 WAN-01（核心出口）62% → 预测 91%
   季度末高峰风险，建议 48h 内完成备用链路配置

🟠 DC-Core ↔ IDC-B 互联链路，平均利用率 78%
   过去 30 天持续上升（+23%），建议评估是否需要扩容至 400G

🟡 存储网络 iSCSI Fabric-02，错误率轻微上升趋势
   0.001% → 0.008%，建议检查 SFP 模块`,
    },
    {
      q: '当前最高优先级事件是什么？',
      a: `当前最高优先级：事件 #001（根因）

PAC-B06 精密空调故障（AI置信度 96%）
已触发下游影响链：
 SW-Core-02 → VLAN100 → VM集群-B → ERP

⚡ 建议立即操作：
1. 联系机房部创建空调维修工单
2. 确认 SW-Core-02 温度是否持续下降
3. 监控 14台 VM 迁移完成情况

其余 22 个事件均为衍生影响，处置根因后将自动消除。`,
    },
  ],
  security: [
    {
      q: '凌晨那个DNS异常是真实威胁还是误报？',
      a: `AI 判断为高置信度真实威胁（91%），主要依据：

行为特征：
· VM-Prod-047 在 02:17-02:43 共发送 21,840 次 DNS 查询
· 查询目标：*.cdn-updates.net（已知 C2 域名变种特征）
· 查询载荷平均长度 187 字节（正常 DNS 平均 42 字节）
· 查询间隔极度规律（每 72ms ±2ms），符合自动化工具特征

为何排除设备故障误报：
· 同时段 VM-089 的流量突增经对比为 rsync 备份（时间戳与备份策略吻合），AI 已标记为无威胁

建议立即操作：
· 一键隔离 VM-Prod-047 网络
· 创建安全审计工单
· 导出取证数据包（.pcap）`,
    },
    {
      q: '我们的TLS合规情况如何？',
      a: `当前 TLS 版本分布（基于过去7天流量分析）：

✅ TLS 1.3：67%（目标 >80%，需持续优化）
✅ TLS 1.2：31%（合规，等待迁移）
⚠ TLS 1.0：2%（不合规，等保三级要求禁用）

TLS 1.0 来源定位：
· 主要来自 ERP 系统对接的 2 个遗留 API 接口
· 建议联系 ERP 厂商升级，或在防火墙配置 TLS 降级拒绝策略

证书到期预警：
· cert-api-gw：7 天后到期 ⚠ 建议立即续签
· cert-internal-ldap：23 天后到期`,
    },
    {
      q: '今日安全事件与运维故障有关联吗？',
      a: `AI 跨域关联分析结论（置信度 97%）：

✅ 两个事件相互独立，无关联：

1. B区空调故障（运维#001）
   · 纯硬件故障，无异常外联，无攻击特征
   · 来源：机房环境自然老化

2. VM-047 DNS 隧道（安全#001）
   · 独立安全事件，发生在 02:17，与运维故障时间线（14:23）无重叠
   · 攻击目标：通过 DNS 隧道外联 C2 服务器

关联分析依据：
· 检查了两事件的来源IP、时间线、受影响设备集合，无任何重叠
· AI 排除"运维故障被利用作为掩护"的可能性`,
    },
  ],
};

const ROLE_SUGGESTIONS = {
  executive: ['今天有什么需要我关注的风险？', '本月 SLA 达成情况怎样？', '生成本月运维报告'],
  ops: ['B区空调故障现在处理好了吗？', '最近30天哪条链路最值得关注？', '当前最高优先级事件是什么？'],
  security: ['凌晨那个DNS异常是真实威胁还是误报？', '我们的TLS合规情况如何？', '今日安全事件与运维故障有关联吗？'],
};

// ── 证据链详情数据 ──────────────────────────────────────
const EVIDENCE_DATA = {
  '#001': {
    conf: 96, confColor: '#1A7F37',
    summary: 'B06 机柜精密空调制冷系统故障，导致物理温升 → 核心交换机热降频 → VLAN100 转发延迟 → 上层业务响应升高。完整因果链由 AI 在 2 分钟内完成跨域关联推断。',
    timeline: [
      { time: '14:18:02', level: 'info', icon: 'sensors',
        title: '基线偏离检测',
        metric: 'B06 机柜温度', val: '34.8°C',
        desc: '机房环境巡检传感器首次上报 B06 号机柜温度高于基线（均值 26.2°C），AI 标记为异常前兆，进入高频采样模式（每 30s）' },
      { time: '14:21:03', level: 'warn', icon: 'thermostat',
        title: '温度超告警阈值',
        metric: 'TMP-B06-1', val: '38.2°C（阈值 36°C）',
        desc: '温度传感器持续攀升跨越告警阈值。AI 对比历史：当前空调功率比正常值低 62%，判断制冷系统已实质失效' },
      { time: '14:22:17', level: 'crit', icon: 'power_off',
        title: '空调控制器失联',
        metric: 'PAC-B06 控制总线', val: '无响应 >10s',
        desc: 'SNMP Trap 收到 PAC-B06 控制器 heartbeat 超时，压缩机转速传感器归零。AI 确认：精密空调完全停机（非软件重启）' },
      { time: '14:23:07', level: 'crit', icon: 'device_thermostat',
        title: '下游：交换机热降频',
        metric: 'SW-Core-02 CPU', val: '34% → 89%',
        desc: 'SW-Core-02 内置温控触发保护机制，强制降频至 40% 主频。CPU 利用率骤升（相同业务流量、算力骤降导致）。AI 关联至 B06 温升原因链' },
      { time: '14:23:15', level: 'warn', icon: 'network_check',
        title: '下游：VLAN100 延迟',
        metric: 'VLAN100 转发延迟', val: '+340ms（基线 1.2ms）',
        desc: 'ACC-B01 / ACC-B02 接入层上报 VLAN100 延迟告警。AI 关联：由 SW-Core-02 降频导致，排除网络配置变更（最近变更 72h 前）' },
      { time: '14:23:17', level: 'crit', icon: 'web_asset',
        title: '业务层：ERP 响应超阈值',
        metric: 'ERP P99 延迟', val: '2,100ms（SLA 500ms）',
        desc: 'ERP 前端监控上报响应超阈值。AI 关联完整链路：物理层（空调）→ 网络层（SW-Core-02）→ VLAN → 应用层（ERP）。根因置信度升至 96%' },
    ],
    reasoning: `AI 按照"5-Why 跨域因果推断"方法，在 2 分钟内完成以下推理路径：

① 为何 ERP 响应慢？→ VLAN100 延迟骤升
② 为何 VLAN100 延迟高？→ SW-Core-02 转发能力下降
③ 为何 SW-Core-02 性能下降？→ 热降频（CPU SLA 超限）
④ 为何 SW-Core-02 过热？→ B06 机柜温度升高
⑤ 为何机柜温度升高？→ PAC-B06 精密空调停机

推断过程排除了 4 个竞争假设（见右侧），最终锁定根因。`,
    eliminated: [
      { hyp: '网络配置变更', reason: '最近变更记录为 72 小时前，变更内容为 OSPF metric 调整，与本次延迟无关联' },
      { hyp: '链路物理故障', reason: 'SW-Core-02 所有上/下行接口物理层状态正常，光功率在基线范围内' },
      { hyp: 'DDoS 流量冲击', reason: '流量入口总带宽未见异常（当前 62G，基线 58G），且延迟先于流量增加出现' },
      { hyp: '软件/固件 Bug', reason: 'SW-Core-02 进程表无异常，其他机房区域同型号设备运行正常，排除固件问题' },
    ],
    cascade: [
      { icon: 'ac_unit', label: 'PAC-B06 精密空调', detail: '制冷停止，机柜温升 +12.2°C', cls: 'cas-root' },
      { icon: 'router', label: 'SW-Core-02 核心交换机', detail: '热降频，转发算力 ↓60%', cls: 'cas-network' },
      { icon: 'hub', label: 'ACC-B01 / ACC-B02', detail: 'VLAN100 延迟 +340ms', cls: 'cas-network' },
      { icon: 'cloud', label: 'VM-CLST-B（14台VM）', detail: '迁移任务挂起', cls: 'cas-cloud' },
      { icon: 'apps', label: 'ERP 系统', detail: 'P99 2,100ms，3部门受影响', cls: 'cas-biz' },
    ],
    suggestions: [
      { pri: '立即', pri_cls: 'sug-crit', action: '启用应急制冷 PAC-B06-BAK', detail: '已完成，15:10 机柜温度恢复 29.4°C' },
      { pri: '今日', pri_cls: 'sug-warn', action: '创建 PAC-B06 紧急维保工单', detail: '控制板返厂维修，预计 3 工作日恢复' },
      { pri: '本月', pri_cls: 'sug-info', action: '全机房精密空调预防性巡检', detail: 'B区 12 台空调，上次巡检均值 190 天前' },
    ],
  },
  '#004': {
    conf: 91, confColor: '#CF222E',
    summary: 'CRM 集群应用服务器因 ERP 批量数据导入触发 ORDER_FOLLOW_UP 表全表扫描，慢查询积压导致数据库连接池耗尽，响应时间上升至基线 32 倍。直接根因为缺失联合索引。',
    timeline: [
      { time: '14:15:00', level: 'info', icon: 'trending_up',
        title: 'CPU 趋势异常检测',
        metric: 'CRM APP-SRV CPU（趋势）', val: '62% → 78%',
        desc: 'AI 对比 14 天历史数据，识别当前 CPU 利用率偏离历史同时段基线（+33%），触发趋势预警，进入监控加强模式' },
      { time: '14:18:00', level: 'warn', icon: 'memory',
        title: 'CPU 超 SLA 阈值',
        metric: 'APP-SRV-01/02 CPU', val: '94%（SLA 80%）',
        desc: 'APP-SRV-01 和 APP-SRV-02 CPU 均超 SLA 阈值。AI 热点分析：78% 消耗集中在 CRM-DB-Worker 进程（MySQL 连接线程池）' },
      { time: '14:18:23', level: 'warn', icon: 'database',
        title: '慢查询激增',
        metric: 'CRM DB 慢查询', val: '2次/分 → 47次/分',
        desc: 'MySQL 慢查询日志频率突增 23.5 倍。AI 定位：集中在 ORDER_FOLLOW_UP 表全表扫描（4.2M 行，缺失索引）。触发时间点与 ERP 导入订单数据重合' },
      { time: '14:19:33', level: 'crit', icon: 'link_off',
        title: '数据库连接池耗尽',
        metric: 'CRM DB 连接池', val: '500/500（满载）',
        desc: '慢查询堆积导致连接不释放，连接池达上限（500/500）。新业务请求进入 30s 等待超时队列，应用层请求开始积压' },
      { time: '14:20:10', level: 'crit', icon: 'speed',
        title: '业务响应崩溃',
        metric: 'CRM P99 响应时间', val: '2,100ms（基线 65ms）',
        desc: 'CRM 前端监控上报 P99 飙升 32.3 倍（SLA 基线 65ms）。影响：销售、客服、市场部共约 218 名用户' },
    ],
    reasoning: `AI 通过"指标关联图谱"方法，追踪以下因果路径：

① ERP 批量导入 18,000 行订单数据（13:58，正常操作）
② ORDER_FOLLOW_UP 表新增行触发全表扫描（缺失联合索引）
③ 慢查询从 2次/分 → 47次/分，MySQL 线程 CPU 78%
④ 连接等待时间从 50ms → 30,000ms（连接池满）
⑤ 应用层请求积压 → P99 响应 2,100ms

AI 识别出"缺失数据库索引"为直接技术根因，"ERP 数据导入"为触发条件。`,
    eliminated: [
      { hyp: '硬件故障（CPU/内存）', reason: '硬件健康检测正常，内存利用率 56%，未见 ECC 错误' },
      { hyp: '网络带宽瓶颈', reason: 'CRM 内网流量 <200Mbps，带宽利用率 3%，排除网络问题' },
      { hyp: '外部 DDoS 或爬虫', reason: '访问来源 99.8% 为内网 IP，未见异常外部流量' },
      { hyp: '软件部署变更', reason: '最近部署记录为 3 天前（小版本更新），与本次慢查询触发时间无关联' },
    ],
    cascade: [
      { icon: 'table_rows', label: 'ERP 数据导入（触发）', detail: '18,000 行订单，13:58', cls: 'cas-trigger' },
      { icon: 'database', label: 'CRM MySQL 慢查询', detail: 'ORDER_FOLLOW_UP 全表扫描', cls: 'cas-root' },
      { icon: 'memory', label: 'APP-SRV-01/02', detail: 'CPU 94%，连接池 500/500', cls: 'cas-server' },
      { icon: 'apps', label: 'CRM 业务系统', detail: 'P99 2,100ms，218 人受影响', cls: 'cas-biz' },
    ],
    suggestions: [
      { pri: '立即', pri_cls: 'sug-crit', action: '为 ORDER_FOLLOW_UP 添加联合索引', detail: 'idx_crm_order_follow(order_id, created_at, status)，预计执行 8 分钟' },
      { pri: '今日', pri_cls: 'sug-warn', action: '临时扩大连接池上限至 800', detail: '修改 max_connections=800，等待慢查询积压清空' },
      { pri: '本周', pri_cls: 'sug-info', action: '建立 ERP-CRM 大批量同步限流机制', detail: '大批量导入限制在业务低峰期（00:00–06:00）' },
    ],
  },
  '#007': {
    conf: 93, confColor: '#CF222E',
    summary: 'VM-Prod-047 被检测到向境外已知 APT C2 IP 发起高频 DNS 查询，行为特征与 DNS 隧道外连高度匹配（6 维特征综合评分 93/100）。AI 在发现后 33 秒内自动隔离，威胁已收敛。',
    timeline: [
      { time: '14:10:05', level: 'crit', icon: 'dns',
        title: 'DNS 查询频率异常',
        metric: 'VM-Prod-047 DNS 频率', val: '420次/分（基线 2次/分）',
        desc: 'DNS 流量监控检测到 VM-Prod-047 查询频率是正常基线的 210 倍。查询目标：多个随机子域名（长度均匀分布 32–40 字符），子域名格式符合 Base64 编码特征' },
      { time: '14:10:12', level: 'crit', icon: 'security',
        title: '域名熵值异常',
        metric: '目标域名香农熵值', val: '7.8 bit（正常 <4.5）',
        desc: 'AI 对 DNS 查询目标域名做香农熵分析，熵值 7.8 高于正常域名（<4.5）。高熵值是 DNS 隧道/DGA 的典型特征。子域名含 == 填充符，确认 Base64 编码负载' },
      { time: '14:10:18', level: 'crit', icon: 'gpp_bad',
        title: '威胁情报命中',
        metric: 'IP 威胁情报匹配', val: 'TI 命中，匹配度 98%',
        desc: '目标 IP（185.220.101.x/24）命中内部威胁情报库（TIP-Ext-02）。该 IP 段已被标记为 APT 组织 TA505 的 C2 服务器范围，历史 IOC 记录 47 条' },
      { time: '14:10:25', level: 'warn', icon: 'analytics',
        title: 'DNS 包长度异常',
        metric: 'DNS 响应包大小', val: '均值 489B（正常 <150B）',
        desc: 'DNS 响应包远超正常应答大小。数据包分析：ANSWER 段包含大量编码数据，确认为 DNS 隧道数据外传行为，综合威胁评分达 93/100' },
      { time: '14:10:38', level: 'ok', icon: 'block',
        title: 'AI 自动隔离执行',
        metric: 'VM-Prod-047 网络策略', val: '已隔离至 VLAN-Quarantine',
        desc: 'AI 触发自动响应：调用 SDN 控制器 API，将 VM-Prod-047 隔离至安全隔离区，同时保留取证快照（内存 + 磁盘）。从检测到隔离共 33 秒' },
      { time: '14:10:42', level: 'warn', icon: 'policy',
        title: '同源镜像扫描启动',
        metric: '同批镜像 VM', val: '2台待确认',
        desc: 'VM-Prod-047 创建记录：来源镜像 IMG-2026-0115-prod-v2.3。同批次部署还有 VM-Prod-048 / VM-Prod-051，建议扩大排查范围' },
    ],
    reasoning: `AI 使用"多特征融合威胁评分"模型，综合 6 项特征完成判断：

① DNS 查询频率异常（权重 25%）：420次/分，偏离基线 +20,900%
② 域名熵值（权重 20%）：7.8 bit，高于 Base64 编码特征阈值
③ 威胁情报命中（权重 30%）：TA505 APT 已知 C2 IP 段
④ 数据包长度分布（权重 15%）：DNS 响应 489B，典型隧道外传
⑤ 行为时序（权重 5%）：查询间隔极度规律（每 72ms ±2ms）
⑥ 横向移动（权重 5%）：未发现内网扫描，排除蠕虫传播

综合威胁评分 93/100，触发自动隔离（阈值 85）。`,
    eliminated: [
      { hyp: '正常业务 DNS 请求', reason: '业务系统 DNS 查询基线 <5次/分，420次/分超标 84 倍，且目标为随机化子域名而非固定业务域名' },
      { hyp: 'DNS 服务器故障/放大攻击', reason: 'DNS 服务器其他 VM 流量正常，查询方向为出向，排除 DNS 放大攻击' },
      { hyp: '杀毒软件/安全扫描器', reason: 'VM-Prod-047 安装清单无已知安全工具，查询目标 IP 不在安全扫描范围数据库' },
      { hyp: '配置错误', reason: '应用程序 DNS 解析配置最近无变更，且域名格式为典型随机化 DGA 特征，非配置错误' },
    ],
    cascade: [
      { icon: 'computer', label: 'VM-Prod-047（已隔离）', detail: 'DNS 隧道外连，420次/分', cls: 'cas-root' },
      { icon: 'cloud_upload', label: '境外 C2 服务器', detail: 'TA505 APT 已知 IOC', cls: 'cas-threat' },
      { icon: 'hub', label: '同源镜像 VM × 2', detail: 'VM-048 / VM-051 待排查', cls: 'cas-warn' },
      { icon: 'storage', label: '潜在数据外泄', detail: '隔离前外传估算 ~23MB（已截断）', cls: 'cas-biz' },
    ],
    suggestions: [
      { pri: '立即', pri_cls: 'sug-crit', action: '对 VM-048 / VM-051 执行流量审计', detail: '确认是否存在相同 DNS 外连行为，如发现则自动隔离' },
      { pri: '今日', pri_cls: 'sug-warn', action: '对 IMG-2026-0115-prod-v2.3 做恶意代码扫描', detail: '使用 ClamAV + YARA 规则集确认镜像供应链安全' },
      { pri: '本周', pri_cls: 'sug-info', action: '取证分析 VM-Prod-047 内存快照', detail: 'AI 已保留快照，分析 C2 植入时间及潜在横向移动意图' },
    ],
  },
};

// ── 状态 ──────────────────────────────────────────────────
let currentRole = 'executive';
let drawerOpen = false;
let copilotOpen = false;
let drawerTab = 'raw'; // 'raw' | 'ai'
let charts = {};
let secInited = false;

// ── 工具函数 ─────────────────────────────────────────────
function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

// ── 初始化 ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initRoleSelector();
  initRoleHint();
  initAiProgressBar();
  initAlertDrawer();
  initCopilot();
  initTopoTooltip();
  initModals();
  initDcTabs();
  initEventDrawer();
  initForensicModal();
  // 若 URL 携带 ?goto=ops-fault 等参数，直接跳到运维视图对应子页
  const _goto = new URLSearchParams(location.search).get('goto');
  if (_goto && document.getElementById(_goto)) {
    // 激活角色选择器中的「运维」选项
    document.querySelectorAll('.rdrop-item').forEach(it => it.classList.toggle('active', it.dataset.role === 'ops'));
    renderView('ops');
  } else {
    renderView('executive');
  }
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
    title: 'B 区 06 号机柜精密空调故障',
    meta: '事件 ID：INC-20260428-006 · 已关闭 · 2026-04-28',
    badges: [
      { text: '已处置', color: '#1A7F37', bg: '#DAFBE1' },
      { text: '机房基础设施', color: '#0969DA', bg: '#DDF4FF' }
    ],
    headerBg: '#F0FFF4',
    stats: [
      { num: '47分', label: '故障持续时长', cls: 'stat-yellow' },
      { num: '1', label: '影响业务系统', cls: '' },
      { num: '98.6%', label: 'AI 处置效率', cls: 'stat-green' },
      { num: 'P2', label: '事件级别', cls: '' }
    ],
    timeline: [
      { dot: 'tl-dot-red', icon: 'emergency', time: '13:36', label: 'AI 检测到异常', desc: 'B 区 06 号机柜温度传感器上报 34.2°C，超过 32°C 预警阈值，AI 识别为精密空调故障前兆' },
      { dot: 'tl-dot-red', icon: 'warning', time: '13:38', label: '告警升级', desc: '温度持续攀升至 37.8°C，空调压缩机停止运转信号确认，触发 P2 故障告警' },
      { dot: 'tl-dot-yellow', icon: 'person', time: '13:41', label: '自动派单', desc: 'NGPM 自动生成工单 WO-2026-1124，分配至机房运维组（负责人：李建国），同步推送企业微信通知' },
      { dot: 'tl-dot-yellow', icon: 'build', time: '14:02', label: '现场响应', desc: '运维人员到达现场确认：空调 PAC-B06 控制板故障，启用备用精密空调 PAC-B06-BAK 临时接管' },
      { dot: 'tl-dot-green', icon: 'thermostat', time: '14:18', label: '温度恢复', desc: '机柜温度降至 27.3°C，ERP 系统响应时间恢复正常（42ms），业务影响解除' },
      { dot: 'tl-dot-green', icon: 'check_circle', time: '14:23', label: '事件关闭', desc: '备用空调稳定运行，工单转维保计划，主空调预计 3 工作日内完成修复' }
    ],
    impact: ['ERP 系统（响应时间偶发升高）', 'B 区 06-08 号机柜', 'PAC-B06 精密空调'],
    kv: [
      { k: '根因', v: 'PAC-B06 空调控制板故障，压缩机停机' },
      { k: '处置人', v: '机房运维组 / 李建国' },
      { k: '恢复方式', v: '切换备用空调 PAC-B06-BAK' },
      { k: '后续动作', v: '控制板返厂维修，预计 3 工作日恢复主机' },
      { k: '上次维保', v: '2025-07-04（284 天前）' }
    ],
    aiAnalysis: 'AI 评估：该空调 MTBF 历史数据为 340 天，上次维保距今 284 天，已接近维保周期。建议将 B 区所有精密空调（共 12 台）纳入本季度预防性维保计划，可降低类似故障概率约 73%。',
    footerBtns: [
      { text: '下载事件报告', cls: 'ev-btn-primary', icon: 'download' },
      { text: '查看维保计划', cls: 'ev-btn-secondary', icon: 'build_circle' }
    ],
    footerNote: 'NGPM AI 自动生成 · 2026-04-28 14:45'
  },

  'wan-event': {
    icon: 'router', iconColor: '#9A6700',
    title: '核心出口链路 WAN-01 带宽容量预警',
    meta: '事件 ID：RISK-20260428-002 · 预警中 · 2026-04-28',
    badges: [
      { text: '待处理', color: '#9A6700', bg: '#FFF3CD' },
      { text: '网络容量', color: '#0969DA', bg: '#DDF4FF' }
    ],
    headerBg: '#FFFBF0',
    stats: [
      { num: '84%', label: '当前利用率', cls: 'stat-yellow' },
      { num: '~2天', label: '触警预计时间', cls: 'stat-red' },
      { num: '1G', label: '当前带宽', cls: '' },
      { num: '91%', label: '峰值预测', cls: 'stat-red' }
    ],
    timeline: [
      { dot: 'tl-dot-blue', icon: 'trending_up', time: '04/22', label: 'AI 容量趋势预测', desc: 'AI 检测到 WAN-01 利用率近 7 天持续上升，建立预测模型：季度末（4/28-5/05）期间将出现流量高峰' },
      { dot: 'tl-dot-yellow', icon: 'warning', time: '04/26', label: '预警触发（80%阈值）', desc: 'WAN-01 日峰值利用率首次突破 80% 预警线（达 82%），NGPM 自动生成容量预警工单' },
      { dot: 'tl-dot-yellow', icon: 'schedule', time: '04/28 今日', label: '当前状态：84% 运行', desc: '实时利用率 84%，AI 预测 4/30 前后将达 91%，超出 90% 高危阈值' },
      { dot: 'tl-dot-gray', icon: 'pending', time: '预计 04/30', label: '预计触警（91%）', desc: '如不干预，季度末业务高峰将导致出口拥塞，影响跨部门协同和远程办公访问质量' }
    ],
    impact: ['跨区域业务访问', 'VPN 远程办公', '视频会议质量', '云备份传输'],
    kv: [
      { k: '链路标识', v: 'WAN-01（电信 1G 专线）' },
      { k: '峰值时段', v: '工作日 9:00–11:00、14:00–17:00' },
      { k: '备用链路', v: 'WAN-02（联通 500M）可临时切流' },
      { k: '扩容方案', v: '① 临时启用 WAN-02 分流；② 申请 1G→2G 升级（报价已就绪）' },
      { k: '决策截止', v: '2026-04-29（需 1 天提前审批）' }
    ],
    aiAnalysis: 'AI 建议：短期（今日）启用 WAN-02 进行流量均衡可将 WAN-01 峰值降至约 62%，可规避本次风险。中期建议启动 WAN-01 扩容至 2G 的采购流程，预计报价 ¥3.2万/年，可支撑未来 18 个月增长。',
    footerBtns: [
      { text: '审批扩容方案', cls: 'ev-btn-primary', icon: 'approval' },
      { text: '启用备用链路', cls: 'ev-btn-secondary', icon: 'route' }
    ],
    footerNote: 'AI 预测置信度 92% · 需在 04/29 前决策'
  },

  'dns-event': {
    icon: 'security', iconColor: '#CF222E',
    title: '疑似 DNS 隧道 C2 外连行为',
    meta: '安全事件 ID：SEC-20260428-001 · 处置中 · 高危',
    badges: [
      { text: '🔴 高危', color: '#CF222E', bg: '#FFEBE9' },
      { text: 'APT 威胁', color: '#CF222E', bg: '#FFEBE9' },
      { text: '处置中', color: '#9A6700', bg: '#FFF3CD' }
    ],
    headerBg: '#FFF0F0',
    stats: [
      { num: '1', label: '受控主机', cls: 'stat-red' },
      { num: '已隔离', label: '当前状态', cls: 'stat-green' },
      { num: 'C2', label: 'AI 判定威胁类型', cls: 'stat-red' },
      { num: '97%', label: 'AI 置信度', cls: 'stat-red' }
    ],
    timeline: [
      { dot: 'tl-dot-red', icon: 'emergency', time: '11:23', label: 'AI 检测异常 DNS 请求', desc: 'AI 检测到 VM-Prod-047 向外部 IP（185.220.xx.xx）发起大量 DNS TXT 查询，请求频率 47 次/分，远超正常基线' },
      { dot: 'tl-dot-red', icon: 'policy', time: '11:24', label: 'AI 自动研判：C2 通信特征', desc: '行为特征匹配 DNS Tunneling C2 通信模式（置信度 97%），确认为高危安全事件。目标域名已加入全局封锁名单' },
      { dot: 'tl-dot-red', icon: 'block', time: '11:24:30', label: '自动隔离执行', desc: 'NGPM 自动下发防火墙策略，隔离 VM-Prod-047（10.12.4.47），切断其所有出站连接，业务流量自动切至 VM-Prod-048' },
      { dot: 'tl-dot-yellow', icon: 'manage_search', time: '11:30', label: '深度取证分析', desc: 'AI 对主机内存快照和进程树进行分析：发现恶意进程 svchost32.exe（PID 4892），疑似通过供应链植入' },
      { dot: 'tl-dot-yellow', icon: 'person_search', time: '持续中', label: '溯源调查', desc: '安全团队正在排查同批次虚拟机镜像（共 8 台），已初步排除 6 台，剩余 2 台待确认' }
    ],
    impact: ['VM-Prod-047（已隔离）', '潜在横向移动风险', '等保合规状态'],
    kv: [
      { k: '受控主机', v: 'VM-Prod-047（10.12.4.47）· CentOS 7.9' },
      { k: '恶意域名', v: '*.cdn-update-check[.]xyz（已封锁）' },
      { k: '恶意进程', v: 'svchost32.exe（PID 4892）' },
      { k: '感染方式', v: '疑似供应链镜像植入（待确认）' },
      { k: '主机业务', v: '内部报表服务（已切换至备机）' }
    ],
    aiAnalysis: 'AI 威胁评估：攻击者利用 DNS 协议隐蔽外连，属于 APT 常用手法（ATT&CK T1071.004）。当前已自动阻断，建议：① 对同镜像 8 台主机全量扫描；② 审查近 30 天 DNS 日志中同类特征；③ 提前申报等保事件记录以避免复测影响。',
    footerBtns: [
      { text: '查看完整取证报告', cls: 'ev-btn-primary', icon: 'policy', action: 'forensic' },
      { text: '扩大排查范围', cls: 'ev-btn-danger', icon: 'manage_search' }
    ],
    footerNote: '等保合规影响：需在 48h 内完成事件报告归档'
  },

  'vm-sg-event': {
    icon: 'shield_with_heart', iconColor: '#9A6700',
    title: '7 台虚拟机安全组策略过宽',
    meta: '安全合规 ID：COMP-20260428-004 · 整改截止 2026-05-15',
    badges: [
      { text: '中危', color: '#9A6700', bg: '#FFF3CD' },
      { text: '等保合规', color: '#0969DA', bg: '#DDF4FF' },
      { text: '待整改', color: '#9A6700', bg: '#FFF3CD' }
    ],
    headerBg: '#FFFBF0',
    stats: [
      { num: '7台', label: '需整改主机', cls: 'stat-yellow' },
      { num: '17天', label: '距整改截止', cls: 'stat-yellow' },
      { num: '3', label: '高危端口暴露', cls: 'stat-red' },
      { num: '84%', label: '等保当前评分', cls: 'stat-yellow' }
    ],
    timeline: [
      { dot: 'tl-dot-blue', icon: 'search', time: '04/20', label: 'AI 安全扫描发现', desc: 'NGPM 例行安全配置扫描发现 7 台虚拟机安全组规则存在 0.0.0.0/0 全开放策略，不符合等保三级访问控制要求' },
      { dot: 'tl-dot-yellow', icon: 'assignment', time: '04/21', label: '合规评估', desc: '安全团队确认：3 台主机暴露了 22（SSH）、3389（RDP）、8080 高危端口，等保评分受此影响扣 2 分（84% → 需达 86%）' },
      { dot: 'tl-dot-yellow', icon: 'event', time: '04/28 今日', label: '整改进度：4/7 完成', desc: '已完成整改：VM-Dev-012、013、021、032（低优先级主机）。待完成：3 台生产主机（需停机维护窗口）' },
      { dot: 'tl-dot-gray', icon: 'event_upcoming', time: '05/15', label: '等保复测截止', desc: '需在此日前完成全部整改，并提交整改报告，否则影响等保三级证书续期' }
    ],
    impact: ['等保三级证书（复测风险）', 'VM-Prod-031、044、061（3台生产主机）', '信息安全评分（当前 84%，需≥86%）'],
    kv: [
      { k: '涉及主机', v: 'VM-Dev-012/013/021/032（已整改）+ VM-Prod-031/044/061（待整改）' },
      { k: '高危端口', v: '22/SSH、3389/RDP、8080/HTTP（仅面向 0.0.0.0/0）' },
      { k: '整改方案', v: '收窄源地址白名单至运维跳板机 IP 段（10.0.1.0/24）' },
      { k: '停机窗口', v: '计划 2026-05-03 02:00–04:00（已申请）' },
      { k: '负责人', v: '安全运维组 / 王晓敏' }
    ],
    aiAnalysis: 'AI 合规建议：3 台待整改生产主机中，VM-Prod-031（ERP 数据库从库）风险最高，建议优先处置。整改方案已自动生成安全组规则变更脚本，审批后可一键部署。完成后预计等保评分恢复至 87%，超过 86% 合格线。',
    footerBtns: [
      { text: '审批整改变更', cls: 'ev-btn-primary', icon: 'approval' },
      { text: '查看整改详情', cls: 'ev-btn-secondary', icon: 'list_alt' }
    ],
    footerNote: '整改截止 2026-05-15 · 当前进度 4/7（57%）'
  },

  'djbh-event': {
    icon: 'verified_user', iconColor: '#0969DA',
    title: '等保三级复测准备状态',
    meta: '合规追踪 ID：COMP-20260428-005 · 关注 · 复测预计 6月',
    badges: [
      { text: '关注', color: '#0969DA', bg: '#DDF4FF' },
      { text: '等保三级', color: '#636C76', bg: '#F6F8FA' }
    ],
    headerBg: '#F0F8FF',
    stats: [
      { num: '84%', label: '当前综合评分', cls: 'stat-yellow' },
      { num: '86%', label: '合格线', cls: '' },
      { num: '-2%', label: '差距', cls: 'stat-red' },
      { num: '6月', label: '预计复测', cls: 'stat-blue' }
    ],
    timeline: [
      { dot: 'tl-dot-green', icon: 'check_circle', time: '2025-06', label: '等保三级通过', desc: '完成等保三级认证，综合评分 91 分，有效期至 2026-06' },
      { dot: 'tl-dot-blue', icon: 'trending_down', time: '2026-04', label: '评分下降至 84%', desc: 'DNS 隧道攻击事件（-3分）、VM 安全组问题（-2分）、TLS 遗留接口（-2分）导致评分下降' },
      { dot: 'tl-dot-yellow', icon: 'assignment_late', time: '现在', label: '整改进行中', desc: 'VM 安全组整改 57% 完成，DNS 事件已处置，TLS 接口升级待排期' },
      { dot: 'tl-dot-gray', icon: 'event_upcoming', time: '2026-06', label: '复测目标', desc: '需在复测前将评分提升至 ≥86%。AI 预测：完成剩余整改后可达 88-90 分' }
    ],
    impact: ['等保三级证书续期', '公司合规资质', '政府业务资质'],
    kv: [
      { k: '主要失分项', v: '① 安全事件记录（-3分）② 访问控制（-2分）③ 传输加密（-2分）' },
      { k: '已完成整改', v: 'DNS 事件归档、4 台 VM 安全组收窄' },
      { k: '待完成整改', v: '3 台生产 VM 安全组（05/15前）、TLS 1.0 升级（待排期）' },
      { k: '整改后预测', v: '88–90 分（超过 86% 合格线）' },
      { k: '负责人', v: '信息安全部 / 张磊' }
    ],
    aiAnalysis: 'AI 整改路径规划：优先级最高为 VM-Prod-031 安全组整改（+1.5分，05/03 维护窗口可完成）；其次为 TLS 接口升级（+2分，需联系 ERP 厂商，建议本月内启动）。两项完成后预测评分 88 分，复测通过概率 94%。',
    footerBtns: [
      { text: '查看整改路线图', cls: 'ev-btn-primary', icon: 'map' },
      { text: '导出合规报告', cls: 'ev-btn-secondary', icon: 'download' }
    ],
    footerNote: '复测预计 2026-06 · AI 预测通过概率 94%（完成整改后）'
  },

  'storage-event': {
    icon: 'storage', iconColor: '#9A6700',
    title: '存储池剩余空间不足预警',
    meta: '容量预警 ID：CAP-20260428-003 · 关注 · 2026-04-28',
    badges: [
      { text: '关注', color: '#9A6700', bg: '#FFF3CD' },
      { text: '存储容量', color: '#0969DA', bg: '#DDF4FF' }
    ],
    headerBg: '#FFFBF0',
    stats: [
      { num: '26%', label: '剩余空间', cls: 'stat-yellow' },
      { num: '38天', label: '触警预计时间', cls: 'stat-yellow' },
      { num: '74%', label: '当前使用率', cls: 'stat-yellow' },
      { num: '1.2TB', label: '剩余可用', cls: '' }
    ],
    timeline: [
      { dot: 'tl-dot-blue', icon: 'analytics', time: '04/15', label: 'AI 增长趋势预测', desc: 'AI 分析近 90 天存储增长数据，建立线性预测模型：当前增速约 18GB/天（主因：虚拟机快照积累 + 日志未清理）' },
      { dot: 'tl-dot-yellow', icon: 'warning', time: '04/25', label: '存储使用率达 70%', desc: '触发 70% 一级预警，NGPM 自动清理 30 天以上过期快照（释放 180GB），预警暂时解除' },
      { dot: 'tl-dot-yellow', icon: 'storage', time: '04/28 今日', label: '当前 74%（1.2TB 剩余）', desc: '过期快照清理效果递减，增速依然偏高，AI 预测 38 天后将再次达到 80% 预警阈值' },
      { dot: 'tl-dot-gray', icon: 'pending', time: '预计 06/05', label: '预计触警（80%）', desc: '建议在此之前完成扩容或策略优化，否则可能影响数据库备份和虚拟机快照策略' }
    ],
    impact: ['VM 快照策略', 'ERP/财务数据库备份', '日志归档合规性'],
    kv: [
      { k: '存储池', v: 'SAN-POOL-01（Dell EMC PowerStore 4TB）' },
      { k: '使用率', v: '74%（2.96TB / 4TB），剩余 1.04TB' },
      { k: '增长速率', v: '约 18GB/天（快照积累为主要因素）' },
      { k: '扩容方案', v: '① 新增 2TB 扩展柜（报价 ¥6.8万）；② 迁移冷数据至 NAS（低成本方案）' },
      { k: '近期释放', v: '已清理过期快照 180GB，可再优化日志压缩约 120GB' }
    ],
    aiAnalysis: 'AI 优化建议：短期（本周）可通过调整快照保留策略（7天→3天）额外释放约 350GB，将预警时间延长至 65 天；中期建议启动 NAS 冷数据迁移方案（预计释放 600GB，成本约 ¥1.2万），无需采购硬件即可解决近期压力。扩容方案可延后至 Q3 评估。',
    footerBtns: [
      { text: '审批快照策略变更', cls: 'ev-btn-primary', icon: 'approval' },
      { text: '查看存储详情', cls: 'ev-btn-secondary', icon: 'analytics' }
    ],
    footerNote: 'AI 预测触警时间：38天（优化策略后可延长至 65 天）'
  },

  'ssh-event': {
    icon: 'gpp_bad', iconColor: '#636C76',
    title: 'SSH 暴力破解尝试 · 已自动拦截',
    meta: '安全事件 ID：SEC-20260428-008 · 已拦截 · 低危',
    badges: [
      { text: '低危', color: '#636C76', bg: '#F6F8FA' },
      { text: '已拦截', color: '#1A7F37', bg: '#DAFBE1' }
    ],
    headerBg: '#F6F8FA',
    stats: [
      { num: '1,247', label: '尝试次数', cls: 'stat-yellow' },
      { num: '3', label: '攻击源 IP', cls: '' },
      { num: '已封锁', label: '当前状态', cls: 'stat-green' },
      { num: '0', label: '成功登录', cls: 'stat-green' }
    ],
    timeline: [
      { dot: 'tl-dot-yellow', icon: 'lock', time: '03:14', label: 'AI 检测异常登录尝试', desc: '检测到外部 IP（45.33.32.156）以 root、admin 等账户对 Jump-01（10.0.1.5）发起高频 SSH 登录，频率 23 次/分' },
      { dot: 'tl-dot-yellow', icon: 'warning', time: '03:15', label: '识别为暴力破解', desc: 'AI 匹配暴力破解特征：字典序递增用户名、固定时间间隔、来源为已知恶意 IP 段（Shodan 标记）' },
      { dot: 'tl-dot-green', icon: 'block', time: '03:15:42', label: '防火墙自动封锁', desc: 'NGPM 自动下发 ACL 规则，封锁 3 个攻击源 IP 段（/24 段），封锁有效期 72 小时' },
      { dot: 'tl-dot-green', icon: 'check_circle', time: '03:16', label: '攻击中止', desc: '封锁后无新增登录尝试，跳板机 SSH 服务正常，所有账户均未被入侵' }
    ],
    impact: ['Jump-01 跳板机（未受损）', '防火墙 ACL 规则（已更新）'],
    kv: [
      { k: '攻击目标', v: 'Jump-01（10.0.1.5）· 运维跳板机' },
      { k: '攻击源 IP', v: '45.33.32.156、185.220.101.x、194.165.16.x' },
      { k: '尝试账户', v: 'root、admin、ubuntu、guest（共 47 个字典词）' },
      { k: '拦截方式', v: '防火墙 IP 封锁 + fail2ban（72h）' },
      { k: '登录成功', v: '0 次（全部拦截）' }
    ],
    aiAnalysis: 'AI 安全建议：此次攻击来源已在全球威胁情报库中标记，属于自动化扫描行为，未发现针对性特征。建议：① 将 SSH 端口从 22 改为非标准端口；② 启用基于密钥的认证并禁用密码登录；③ 将跳板机访问限制到 VPN 网段（10.0.0.0/8）。',
    footerBtns: [
      { text: '查看完整取证报告', cls: 'ev-btn-primary', icon: 'policy', action: 'forensic' },
      { text: '查看防火墙封锁日志', cls: 'ev-btn-secondary', icon: 'shield' }
    ],
    footerNote: '已封锁 3 个攻击源 IP · 防护有效期 72h'
  },

  'tls-event': {
    icon: 'https', iconColor: '#636C76',
    title: 'TLS 1.0 遗留接口 · 等保合规风险',
    meta: '合规扫描 ID：COMP-20260428-009 · 待排期整改',
    badges: [
      { text: '低危', color: '#636C76', bg: '#F6F8FA' },
      { text: '合规风险', color: '#9A6700', bg: '#FFF3CD' },
      { text: '待排期', color: '#636C76', bg: '#F6F8FA' }
    ],
    headerBg: '#F6F8FA',
    stats: [
      { num: '5', label: '受影响接口', cls: 'stat-yellow' },
      { num: '-2分', label: '等保评分扣分', cls: 'stat-yellow' },
      { num: '2026-06', label: '复测截止', cls: '' },
      { num: '3个月', label: '存在时间', cls: '' }
    ],
    timeline: [
      { dot: 'tl-dot-blue', icon: 'search', time: '04/10', label: 'AI 合规扫描发现', desc: 'NGPM 例行合规扫描检测到 5 个 HTTPS 接口仍支持 TLS 1.0/1.1 协议，不符合等保三级传输安全要求（需 TLS 1.2+）' },
      { dot: 'tl-dot-yellow', icon: 'assignment', time: '04/12', label: '等保影响评估', desc: '安全团队确认：5 个接口均为内部服务，对外暴露风险低，但等保三级扫描工具可检出，预计扣分 2 分（84%→82%）' },
      { dot: 'tl-dot-yellow', icon: 'event_busy', time: '04/28 今日', label: '整改待排期', desc: 'ERP 接口（ERPWeb-01）依赖旧版 TLS，厂商升级报价已收到（¥0.8万），需协调停机窗口' },
      { dot: 'tl-dot-gray', icon: 'event_upcoming', time: '2026-06', label: '整改截止（等保复测前）', desc: '需在等保复测前完成全部 5 个接口的 TLS 升级，建议最迟 5 月底完成' }
    ],
    impact: ['等保三级评分（-2分）', 'ERP Web 接口（5个）', '传输加密合规状态'],
    kv: [
      { k: '受影响服务', v: 'ERPWeb-01/02、OA-Portal、财务报表系统、视频会议 API' },
      { k: '当前协议', v: 'TLS 1.0（已禁用 SSL 3.0 / SSL 2.0）' },
      { k: '目标版本', v: 'TLS 1.2+（建议同时启用 TLS 1.3）' },
      { k: '整改方案', v: '① Nginx 配置更新（内部服务，30分钟）；② ERP 厂商升级（需协调，约 2 小时停机）' },
      { k: '整改费用', v: 'ERP 接口升级 ¥0.8万，其余内部服务免费' }
    ],
    aiAnalysis: 'AI 整改建议：5 个接口中 4 个为 Nginx 反向代理，修改 ssl_protocols 配置即可完成，无需停机，可在本周内处理（预计 30 分钟）。ERPWeb-01 需联系 ERP 厂商，建议结合 05/03 维护窗口一并处理，避免多次停机。完成后等保评分恢复 +2 分。',
    footerBtns: [
      { text: '查看完整合规报告', cls: 'ev-btn-primary', icon: 'policy', action: 'forensic' },
      { text: '申请整改排期', cls: 'ev-btn-secondary', icon: 'event' }
    ],
    footerNote: '整改预计 0.5 工作日 · 等保复测截止 2026-06'
  }
};

function initEventDrawer() {
  const overlay = document.getElementById('evOverlay');
  const drawer = document.getElementById('evDrawer');
  const closeBtn = document.getElementById('evClose');
  let currentEventId = null;

  function openDrawer(eventId) {
    const data = EVENT_REPORTS[eventId];
    if (!data) return;
    currentEventId = eventId;

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
        <div class="ev-section-title">事件时间线</div>
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
          <span class="ev-ai-label">AI 分析与建议</span>
          <span class="ev-ai-text">${data.aiAnalysis}</span>
        </div>
      </div>
    `;

    // Footer — 带 data-action 属性以便绑定取证报告跳转
    const footer = document.getElementById('evDrawerFooter');
    footer.innerHTML = `
      ${data.footerBtns.map(b => `
        <button class="${b.cls}" ${b.action ? `data-action="${b.action}"` : ''}>
          <span class="material-symbols-rounded" style="font-size:15px;vertical-align:-3px;margin-right:4px">${b.icon}</span>${b.text}
        </button>`).join('')}
      <span class="ev-footer-note">${data.footerNote}</span>
    `;

    // 绑定 forensic 按钮
    footer.querySelectorAll('[data-action="forensic"]').forEach(btn => {
      btn.addEventListener('click', () => openForensicReport(currentEventId));
    });

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

  // AI 决策中心"查看取证报告"快捷按钮 —— 直接跳过 drawer 打开取证报告
  document.querySelectorAll('.dc-sec-btn-ghost[data-forensic]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openForensicReport(btn.dataset.forensic);
    });
  });

  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
}

// ── 取证报告模态层 ─────────────────────────────────────────
const FORENSIC_REPORTS = {
  'dns-event': {
    icon: 'policy', iconColor: '#CF222E', headerBg: 'linear-gradient(135deg,#7F1D1D,#991B1B)',
    title: '完整取证报告：疑似 DNS 隧道 C2 外连行为',
    meta: '报告编号：FOR-SEC-20260428-001 · 生成时间：2026-04-28 14:45 · 分析师：NGPM AI',
    badges: [
      { text: '🔴 高危 · APT 威胁', color: '#fff', bg: 'rgba(255,255,255,0.18)' },
      { text: '处置中', color: '#FEF3C7', bg: 'rgba(255,255,255,0.12)' }
    ],
    tabs: ['事件时间线', '网络流量证据', '进程分析', 'ATT&CK 映射'],
    tabContent: {
      '事件时间线': `
        <div class="fm-timeline-rich">
          <div class="fm-tl-item fm-tl-red"><div class="fm-tl-dot"><span class="material-symbols-rounded">emergency</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-28 11:22:47</div><div class="fm-tl-label">AI 检测到异常 DNS 高频请求</div><div class="fm-tl-detail">VM-Prod-047（10.12.4.47）在 5 分钟内发起 235 次 DNS TXT 查询，目标域 *.cdn-update-check[.]xyz，正常基线 &lt;3 次/分钟，异常倍数 ×47。AI 触发威胁狩猎模块。</div></div></div>
          <div class="fm-tl-item fm-tl-red"><div class="fm-tl-dot"><span class="material-symbols-rounded">policy</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-28 11:23:58</div><div class="fm-tl-label">C2 通信特征研判（置信度 97%）</div><div class="fm-tl-detail">行为特征与 DNS Tunneling C2 模式高度匹配：① TXT 记录返回体积异常（平均 198B，正常 &lt;50B）；② 查询序列包含 Base64 编码载荷；③ 域名 TTL 异常低（30s）；④ 目标 IP 185.220.xx.xx 在威胁情报库中标记为 Tor 出口节点。</div></div></div>
          <div class="fm-tl-item fm-tl-red"><div class="fm-tl-dot"><span class="material-symbols-rounded">block</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-28 11:24:30</div><div class="fm-tl-label">自动隔离执行完毕</div><div class="fm-tl-detail">NGPM 自动下发防火墙策略，隔离 VM-Prod-047（10.12.4.47），切断所有出站连接。业务流量自动切至备机 VM-Prod-048（10.12.4.48），切换耗时 8 秒，业务无感知。</div></div></div>
          <div class="fm-tl-item fm-tl-yellow"><div class="fm-tl-dot"><span class="material-symbols-rounded">manage_search</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-28 11:30:12</div><div class="fm-tl-label">深度取证：内存快照分析</div><div class="fm-tl-detail">AI 对 VM-Prod-047 内存快照进行分析，发现异常进程 <code>svchost32.exe</code>（PID 4892，注意：非系统进程），该进程由合法进程 <code>services.exe</code> 伪装注入启动，疑似供应链镜像污染。恶意进程持久化注册表条目：<code>HKLM\Software\Microsoft\Windows\CurrentVersion\Run\SystemUpdate</code>。</div></div></div>
          <div class="fm-tl-item fm-tl-yellow"><div class="fm-tl-dot"><span class="material-symbols-rounded">person_search</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-28 11:35 – 持续中</div><div class="fm-tl-label">同批次镜像溯源调查</div><div class="fm-tl-detail">安全团队正在对同批次虚拟机镜像（共 8 台，镜像版本 CentOS79-Base-v2.3.1）进行全量扫描。已排除 6 台（无恶意特征），剩余 VM-Prod-051、VM-Dev-033 待确认。</div></div></div>
        </div>`,
      '网络流量证据': `
        <div class="fm-evidence-block">
          <div class="fm-evidence-title">DNS 查询样本（截取前 10 条）</div>
          <table class="fm-table">
            <thead><tr><th>时间</th><th>查询域名</th><th>类型</th><th>响应大小</th><th>解析 IP</th></tr></thead>
            <tbody>
              <tr><td>11:22:47.312</td><td class="fm-mono">a8f3k2.cdn-update-check.xyz</td><td><span class="fm-tag fm-tag-red">TXT</span></td><td>187 B</td><td>185.220.101.34</td></tr>
              <tr><td>11:22:47.891</td><td class="fm-mono">x7q9p1.cdn-update-check.xyz</td><td><span class="fm-tag fm-tag-red">TXT</span></td><td>203 B</td><td>185.220.101.34</td></tr>
              <tr><td>11:22:48.445</td><td class="fm-mono">m3n8w5.cdn-update-check.xyz</td><td><span class="fm-tag fm-tag-red">TXT</span></td><td>195 B</td><td>185.220.101.34</td></tr>
              <tr><td>11:22:49.002</td><td class="fm-mono">k2p7r4.cdn-update-check.xyz</td><td><span class="fm-tag fm-tag-red">TXT</span></td><td>211 B</td><td>185.220.101.34</td></tr>
              <tr><td>11:22:49.587</td><td class="fm-mono">j5t1v8.cdn-update-check.xyz</td><td><span class="fm-tag fm-tag-red">TXT</span></td><td>198 B</td><td>185.220.101.34</td></tr>
              <tr><td>11:22:50.134</td><td class="fm-mono">b9w6u2.cdn-update-check.xyz</td><td><span class="fm-tag fm-tag-red">TXT</span></td><td>204 B</td><td>185.220.101.34</td></tr>
              <tr><td>11:22:50.678</td><td class="fm-mono">d4y3s9.cdn-update-check.xyz</td><td><span class="fm-tag fm-tag-red">TXT</span></td><td>189 B</td><td>185.220.101.34</td></tr>
              <tr><td>11:22:51.221</td><td class="fm-mono">h6z0q7.cdn-update-check.xyz</td><td><span class="fm-tag fm-tag-red">TXT</span></td><td>215 B</td><td>185.220.101.34</td></tr>
              <tr><td>11:22:51.763</td><td class="fm-mono">n1c5e3.cdn-update-check.xyz</td><td><span class="fm-tag fm-tag-red">TXT</span></td><td>201 B</td><td>185.220.101.34</td></tr>
              <tr><td>11:22:52.308</td><td class="fm-mono">g8f2l6.cdn-update-check.xyz</td><td><span class="fm-tag fm-tag-red">TXT</span></td><td>193 B</td><td>185.220.101.34</td></tr>
            </tbody>
          </table>
          <div class="fm-evidence-note">共 235 次查询 · 平均间隔 0.54s · 平均响应 198B（正常基线 &lt;50B）· 全部 TXT 类型（高度异常）</div>
          <div class="fm-evidence-title" style="margin-top:20px">解码样本（TXT 记录载荷片段）</div>
          <div class="fm-code-block">
            <div class="fm-code-line"><span class="fm-code-comment"># 解码后 Base64 内容（部分还原）</span></div>
            <div class="fm-code-line"><span class="fm-code-key">cmd:</span> <span class="fm-code-val">whoami; hostname; ipconfig /all</span></div>
            <div class="fm-code-line"><span class="fm-code-key">interval:</span> <span class="fm-code-val">500ms</span></div>
            <div class="fm-code-line"><span class="fm-code-key">c2_proto:</span> <span class="fm-code-val">dns_txt_v2</span></div>
            <div class="fm-code-line"><span class="fm-code-key">beacon_id:</span> <span class="fm-code-val">0x4A3F8C21</span></div>
          </div>
        </div>`,
      '进程分析': `
        <div class="fm-evidence-block">
          <div class="fm-evidence-title">恶意进程树（VM-Prod-047 内存快照）</div>
          <div class="fm-process-tree">
            <div class="fm-proc fm-proc-ok"><span class="material-symbols-rounded">check_circle</span><span class="fm-proc-name">systemd</span><span class="fm-proc-pid">PID 1</span><span class="fm-proc-info">系统合法进程</span></div>
            <div class="fm-proc-child">
              <div class="fm-proc fm-proc-ok"><span class="material-symbols-rounded">check_circle</span><span class="fm-proc-name">services.exe</span><span class="fm-proc-pid">PID 892</span><span class="fm-proc-info">系统合法进程</span></div>
              <div class="fm-proc-child">
                <div class="fm-proc fm-proc-bad"><span class="material-symbols-rounded">dangerous</span><span class="fm-proc-name">svchost32.exe</span><span class="fm-proc-pid">PID 4892</span><span class="fm-proc-info">⚠ 恶意进程 · 非系统文件 · 注入启动</span></div>
                <div class="fm-proc-child">
                  <div class="fm-proc fm-proc-bad"><span class="material-symbols-rounded">wifi_tethering_error</span><span class="fm-proc-name">dns_beacon</span><span class="fm-proc-pid">PID 5103</span><span class="fm-proc-info">⚠ C2 通信子进程 · 已终止</span></div>
                </div>
              </div>
            </div>
          </div>
          <div class="fm-evidence-title" style="margin-top:20px">恶意文件哈希</div>
          <table class="fm-table">
            <thead><tr><th>文件</th><th>路径</th><th>MD5</th><th>状态</th></tr></thead>
            <tbody>
              <tr><td>svchost32.exe</td><td class="fm-mono">C:\\Windows\\System32\\</td><td class="fm-mono">a3f7c9b1d4e8f2a5c6d9e0b3</td><td><span class="fm-tag fm-tag-red">恶意文件</span></td></tr>
              <tr><td>dns_beacon.dll</td><td class="fm-mono">C:\\Windows\\Temp\\</td><td class="fm-mono">b8e4d2f1a9c7b5e3d6f0a2c4</td><td><span class="fm-tag fm-tag-red">C2 模块</span></td></tr>
            </tbody>
          </table>
          <div class="fm-evidence-title" style="margin-top:20px">持久化机制</div>
          <div class="fm-code-block">
            <div class="fm-code-line"><span class="fm-code-key">注册表键：</span><span class="fm-code-val">HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\SystemUpdate</span></div>
            <div class="fm-code-line"><span class="fm-code-key">值：</span><span class="fm-code-val">C:\\Windows\\System32\\svchost32.exe --hidden</span></div>
            <div class="fm-code-line"><span class="fm-code-comment"># 已随隔离操作自动清除</span></div>
          </div>
        </div>`,
      'ATT&CK 映射': `
        <div class="fm-attck-grid">
          <div class="fm-attck-card fm-attck-high">
            <div class="fm-attck-id">T1071.004</div>
            <div class="fm-attck-name">Application Layer Protocol: DNS</div>
            <div class="fm-attck-phase">Command and Control</div>
            <div class="fm-attck-desc">攻击者使用 DNS 协议进行 C2 通信，通过 TXT 记录传输加密指令和数据，绕过传统防火墙检测。</div>
            <div class="fm-attck-match">匹配置信度：<strong>97%</strong></div>
          </div>
          <div class="fm-attck-card fm-attck-med">
            <div class="fm-attck-id">T1059.001</div>
            <div class="fm-attck-name">Command and Scripting Interpreter</div>
            <div class="fm-attck-phase">Execution</div>
            <div class="fm-attck-desc">通过 C2 通道执行远程命令，包括系统侦察（whoami、hostname、ipconfig）。</div>
            <div class="fm-attck-match">匹配置信度：<strong>82%</strong></div>
          </div>
          <div class="fm-attck-card fm-attck-med">
            <div class="fm-attck-id">T1195.002</div>
            <div class="fm-attck-name">Supply Chain Compromise: Software Supply Chain</div>
            <div class="fm-attck-phase">Initial Access</div>
            <div class="fm-attck-desc">恶意软件疑似通过受污染的 VM 基础镜像（CentOS79-Base-v2.3.1）植入，属于供应链攻击。</div>
            <div class="fm-attck-match">匹配置信度：<strong>71%</strong>（待确认）</div>
          </div>
          <div class="fm-attck-card fm-attck-low">
            <div class="fm-attck-id">T1547.001</div>
            <div class="fm-attck-name">Boot or Logon Autostart: Registry Run Keys</div>
            <div class="fm-attck-phase">Persistence</div>
            <div class="fm-attck-desc">通过写入注册表 Run 键实现持久化，确保系统重启后恶意进程仍可运行。</div>
            <div class="fm-attck-match">匹配置信度：<strong>95%</strong></div>
          </div>
        </div>`
    },
    iocs: [
      { type: '域名', value: '*.cdn-update-check[.]xyz', severity: 'red' },
      { type: 'IP', value: '185.220.101.34（Tor 出口）', severity: 'red' },
      { type: '进程', value: 'svchost32.exe（PID 4892）', severity: 'red' },
      { type: '文件 MD5', value: 'a3f7c9b1d4e8f2a5c6d9e0b3', severity: 'red' },
      { type: '注册表', value: 'HKLM\\...\\Run\\SystemUpdate', severity: 'yellow' }
    ],
    assets: [
      { name: 'VM-Prod-047', detail: '10.12.4.47 · CentOS 7.9', status: '已隔离', cls: 'red' },
      { name: 'VM-Prod-051', detail: '待排查（同批镜像）', status: '排查中', cls: 'yellow' },
      { name: 'VM-Dev-033', detail: '待排查（同批镜像）', status: '排查中', cls: 'yellow' }
    ],
    actions: [
      { icon: 'search', text: '对 8 台同批镜像全量扫描', done: false },
      { icon: 'dns', text: '审查近 30 天 DNS 日志同类特征', done: false },
      { icon: 'assignment', text: '提前申报等保安全事件记录', done: false },
      { icon: 'block', text: '封锁 C2 域名（已完成）', done: true },
      { icon: 'device_reset', text: '隔离受控主机（已完成）', done: true }
    ],
    statusLabel: '等保合规：需在 48h 内完成事件报告归档',
    statusCls: 'fm-status-red'
  },

  'ssh-event': {
    icon: 'gpp_bad', iconColor: '#636C76', headerBg: 'linear-gradient(135deg,#374151,#4B5563)',
    title: '完整取证报告：SSH 暴力破解尝试',
    meta: '报告编号：FOR-SEC-20260428-008 · 生成时间：2026-04-28 03:25 · 分析师：NGPM AI',
    badges: [
      { text: '低危 · 已拦截', color: '#fff', bg: 'rgba(255,255,255,0.18)' }
    ],
    tabs: ['事件时间线', '攻击日志', '防御措施'],
    tabContent: {
      '事件时间线': `
        <div class="fm-timeline-rich">
          <div class="fm-tl-item fm-tl-yellow"><div class="fm-tl-dot"><span class="material-symbols-rounded">lock</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-28 03:14:22</div><div class="fm-tl-label">检测到 SSH 高频登录失败</div><div class="fm-tl-detail">Jump-01（10.0.1.5）在 60 秒内记录 23 次 SSH 认证失败，源 IP 45.33.32.156，使用 root、admin、ubuntu 等字典账户尝试登录。</div></div></div>
          <div class="fm-tl-item fm-tl-yellow"><div class="fm-tl-dot"><span class="material-symbols-rounded">warning</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-28 03:14:45</div><div class="fm-tl-label">识别为字典暴力破解</div><div class="fm-tl-detail">AI 识别攻击模式：用户名按字典序递增、来源 IP 被 Shodan 标记为扫描节点、攻击间隔固定 0.47±0.02s（自动化工具特征）。确认为低危事件（无成功登录）。</div></div></div>
          <div class="fm-tl-item fm-tl-green"><div class="fm-tl-dot"><span class="material-symbols-rounded">block</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-28 03:15:42</div><div class="fm-tl-label">防火墙自动封锁</div><div class="fm-tl-detail">NGPM 自动下发 ACL，封锁 3 个攻击源 /24 段，fail2ban 同步更新拒绝列表，封锁有效期 72 小时。</div></div></div>
          <div class="fm-tl-item fm-tl-green"><div class="fm-tl-dot"><span class="material-symbols-rounded">check_circle</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-28 03:16:00</div><div class="fm-tl-label">攻击中止 · 服务正常</div><div class="fm-tl-detail">封锁后无新增登录尝试。Jump-01 SSH 服务持续正常运行，所有账户均未被入侵，无数据泄露风险。</div></div></div>
        </div>`,
      '攻击日志': `
        <div class="fm-evidence-block">
          <div class="fm-evidence-title">暴力破解尝试记录（截取前 15 条）</div>
          <table class="fm-table">
            <thead><tr><th>时间</th><th>源 IP</th><th>用户名</th><th>认证方式</th><th>结果</th></tr></thead>
            <tbody>
              <tr><td>03:14:22</td><td>45.33.32.156</td><td>root</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
              <tr><td>03:14:22</td><td>45.33.32.156</td><td>admin</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
              <tr><td>03:14:23</td><td>45.33.32.156</td><td>ubuntu</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
              <tr><td>03:14:23</td><td>45.33.32.156</td><td>centos</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
              <tr><td>03:14:24</td><td>45.33.32.156</td><td>guest</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
              <tr><td>03:14:24</td><td>185.220.101.45</td><td>root</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
              <tr><td>03:14:25</td><td>185.220.101.45</td><td>administrator</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
              <tr><td>03:14:25</td><td>194.165.16.78</td><td>deploy</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
              <tr><td>03:14:26</td><td>194.165.16.78</td><td>git</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
              <tr><td>03:14:26</td><td>45.33.32.156</td><td>pi</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
              <tr><td>03:14:27</td><td>45.33.32.156</td><td>oracle</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
              <tr><td>03:14:27</td><td>185.220.101.45</td><td>test</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
              <tr><td>03:14:28</td><td>194.165.16.78</td><td>nagios</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
              <tr><td>03:14:28</td><td>45.33.32.156</td><td>ftpuser</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
              <tr><td>03:14:29</td><td>45.33.32.156</td><td>support</td><td>密码</td><td><span class="fm-tag fm-tag-gray">失败</span></td></tr>
            </tbody>
          </table>
          <div class="fm-evidence-note">共 1,247 次尝试 · 0 次成功 · 攻击持续时间：89秒 · 使用字典词汇 47 个</div>
        </div>`,
      '防御措施': `
        <div class="fm-evidence-block">
          <div class="fm-evidence-title">已执行防御操作</div>
          <table class="fm-table">
            <thead><tr><th>防御措施</th><th>执行时间</th><th>执行方式</th><th>有效期</th></tr></thead>
            <tbody>
              <tr><td>封锁 45.33.32.156/24</td><td>03:15:42</td><td>NGPM 自动</td><td>72小时</td></tr>
              <tr><td>封锁 185.220.101.0/24</td><td>03:15:42</td><td>NGPM 自动</td><td>72小时</td></tr>
              <tr><td>封锁 194.165.16.0/24</td><td>03:15:42</td><td>NGPM 自动</td><td>72小时</td></tr>
              <tr><td>fail2ban 规则更新</td><td>03:15:45</td><td>NGPM 自动</td><td>永久</td></tr>
            </tbody>
          </table>
          <div class="fm-evidence-title" style="margin-top:20px">加固建议</div>
          <div class="fm-suggestion-list">
            <div class="fm-suggestion"><span class="material-symbols-rounded fm-sug-icon">key</span><div><div class="fm-sug-title">禁用密码登录，启用密钥认证</div><div class="fm-sug-desc">修改 /etc/ssh/sshd_config：PasswordAuthentication no，从根本上消除暴力破解风险</div></div></div>
            <div class="fm-suggestion"><span class="material-symbols-rounded fm-sug-icon">router</span><div><div class="fm-sug-title">将 SSH 访问限制到 VPN 网段</div><div class="fm-sug-desc">仅允许 10.0.0.0/8 访问 22 端口，互联网直接访问跳板机风险过高</div></div></div>
            <div class="fm-suggestion"><span class="material-symbols-rounded fm-sug-icon">swap_horiz</span><div><div class="fm-sug-title">更换非标准端口</div><div class="fm-sug-desc">将 SSH 从 22 改为高位端口（如 2222、22222），可降低 90% 的自动化扫描流量</div></div></div>
          </div>
        </div>`
    },
    iocs: [
      { type: '攻击源 IP', value: '45.33.32.156（Shodan 扫描节点）', severity: 'yellow' },
      { type: '攻击源 IP', value: '185.220.101.45（Tor 出口）', severity: 'yellow' },
      { type: '攻击源 IP', value: '194.165.16.78（已知恶意 ASN）', severity: 'yellow' }
    ],
    assets: [
      { name: 'Jump-01', detail: '10.0.1.5 · 运维跳板机', status: '正常', cls: 'green' }
    ],
    actions: [
      { icon: 'key', text: '禁用密码登录，启用密钥认证', done: false },
      { icon: 'router', text: '限制 SSH 访问到 VPN 网段', done: false },
      { icon: 'block', text: '封锁 3 个攻击源 IP 段（已完成）', done: true }
    ],
    statusLabel: '事件已关闭 · 无需等保归档（低危）',
    statusCls: 'fm-status-green'
  },

  'tls-event': {
    icon: 'https', iconColor: '#636C76', headerBg: 'linear-gradient(135deg,#374151,#4B5563)',
    title: '完整合规扫描报告：TLS 1.0 遗留接口',
    meta: '报告编号：FOR-COMP-20260428-009 · 生成时间：2026-04-28 10:00 · 分析师：NGPM AI',
    badges: [
      { text: '低危 · 合规风险', color: '#FEF3C7', bg: 'rgba(255,255,255,0.15)' },
      { text: '待排期整改', color: '#fff', bg: 'rgba(255,255,255,0.12)' }
    ],
    tabs: ['扫描发现', '受影响接口', '整改方案'],
    tabContent: {
      '扫描发现': `
        <div class="fm-timeline-rich">
          <div class="fm-tl-item fm-tl-blue"><div class="fm-tl-dot"><span class="material-symbols-rounded">search</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-10</div><div class="fm-tl-label">AI 合规扫描触发发现</div><div class="fm-tl-detail">NGPM 例行等保合规扫描对全量 HTTPS 服务进行 SSL/TLS 协议版本探测，发现 5 个服务端点仍响应 TLS 1.0 Client Hello，不符合等保三级通信安全标准（GB/T 22239-2019 要求最低 TLS 1.2）。</div></div></div>
          <div class="fm-tl-item fm-tl-yellow"><div class="fm-tl-dot"><span class="material-symbols-rounded">assignment</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-12</div><div class="fm-tl-label">等保影响评估完成</div><div class="fm-tl-detail">安全团队评估：5 个接口均为内部业务服务，无直接外网暴露，实际攻击利用难度较低。但等保三级专项扫描工具（NSFOCUS、安恒）会检出，预计在"通信传输"子项扣 2 分，影响总分从 84% 降至 82%。</div></div></div>
          <div class="fm-tl-item fm-tl-yellow"><div class="fm-tl-dot"><span class="material-symbols-rounded">event_busy</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-28 今日</div><div class="fm-tl-label">整改进展：0/5 已完成</div><div class="fm-tl-detail">ERPWeb-01 依赖旧版 TLS 由 ERP 厂商控制配置，协调进行中（报价 ¥0.8万）。其余 4 个 Nginx 代理接口整改简单，但因排期冲突尚未执行。</div></div></div>
          <div class="fm-tl-item fm-tl-gray"><div class="fm-tl-dot"><span class="material-symbols-rounded">event_upcoming</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-06（目标）</div><div class="fm-tl-label">整改截止：等保复测前</div><div class="fm-tl-detail">等保三级复测预计 2026 年 6 月，需在此前完成全部整改并提交整改证明材料。建议最迟 5 月底完成。</div></div></div>
        </div>`,
      '受影响接口': `
        <div class="fm-evidence-block">
          <div class="fm-evidence-title">TLS 版本扫描结果</div>
          <table class="fm-table">
            <thead><tr><th>服务名称</th><th>地址</th><th>当前协议</th><th>整改难度</th><th>状态</th></tr></thead>
            <tbody>
              <tr><td>ERPWeb-01</td><td class="fm-mono">10.0.2.15:443</td><td><span class="fm-tag fm-tag-red">TLS 1.0</span></td><td>高（需厂商支持）</td><td><span class="fm-tag fm-tag-yellow">待协调</span></td></tr>
              <tr><td>ERPWeb-02</td><td class="fm-mono">10.0.2.16:443</td><td><span class="fm-tag fm-tag-red">TLS 1.0</span></td><td>高（同上）</td><td><span class="fm-tag fm-tag-yellow">待协调</span></td></tr>
              <tr><td>OA-Portal</td><td class="fm-mono">10.0.3.10:443</td><td><span class="fm-tag fm-tag-yellow">TLS 1.1</span></td><td>低（Nginx 配置）</td><td><span class="fm-tag fm-tag-yellow">待排期</span></td></tr>
              <tr><td>财务报表系统</td><td class="fm-mono">10.0.3.22:8443</td><td><span class="fm-tag fm-tag-yellow">TLS 1.1</span></td><td>低（Nginx 配置）</td><td><span class="fm-tag fm-tag-yellow">待排期</span></td></tr>
              <tr><td>视频会议 API</td><td class="fm-mono">10.0.4.5:443</td><td><span class="fm-tag fm-tag-yellow">TLS 1.1</span></td><td>低（Nginx 配置）</td><td><span class="fm-tag fm-tag-yellow">待排期</span></td></tr>
            </tbody>
          </table>
          <div class="fm-evidence-note">目标版本：TLS 1.2 + TLS 1.3 · 禁用：TLS 1.0、TLS 1.1、SSL 3.0</div>
        </div>`,
      '整改方案': `
        <div class="fm-evidence-block">
          <div class="fm-evidence-title">Nginx 接口整改（OA / 财务 / 视频会议）</div>
          <div class="fm-code-block">
            <div class="fm-code-comment"># /etc/nginx/nginx.conf 或站点配置文件</div>
            <div class="fm-code-line"><span class="fm-code-key">ssl_protocols</span> <span class="fm-code-val">TLSv1.2 TLSv1.3;</span></div>
            <div class="fm-code-line"><span class="fm-code-key">ssl_ciphers</span> <span class="fm-code-val">ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:TLS_AES_128_GCM_SHA256;</span></div>
            <div class="fm-code-line"><span class="fm-code-key">ssl_prefer_server_ciphers</span> <span class="fm-code-val">on;</span></div>
            <div class="fm-code-comment"># 配置后 nginx -t 验证，nginx -s reload 生效（无需停机）</div>
          </div>
          <div class="fm-evidence-title" style="margin-top:20px">ERP 接口整改（需厂商支持）</div>
          <div class="fm-suggestion-list">
            <div class="fm-suggestion"><span class="material-symbols-rounded fm-sug-icon">phone</span><div><div class="fm-sug-title">联系 ERP 厂商升级 TLS 配置</div><div class="fm-sug-desc">厂商报价 ¥0.8万，预计需要约 2 小时停机窗口，建议结合 05/03 02:00 维护窗口一并完成</div></div></div>
            <div class="fm-suggestion"><span class="material-symbols-rounded fm-sug-icon">calendar_month</span><div><div class="fm-sug-title">整改时间表建议</div><div class="fm-sug-desc">本周内：完成 Nginx 3 个接口（30分钟）· 05/03 维护窗口：完成 ERP 2 个接口（2小时）</div></div></div>
          </div>
        </div>`
    },
    iocs: [],
    assets: [
      { name: 'ERPWeb-01/02', detail: 'TLS 1.0 · 需厂商支持', status: '待协调', cls: 'yellow' },
      { name: 'OA / 财务 / 视频 API', detail: 'TLS 1.1 · Nginx 配置', status: '待排期', cls: 'yellow' }
    ],
    actions: [
      { icon: 'build', text: '本周内修复 3 个 Nginx 接口', done: false },
      { icon: 'phone', text: '联系 ERP 厂商（报价 ¥0.8万）', done: false },
      { icon: 'calendar_month', text: '结合 05/03 窗口完成 ERP 整改', done: false }
    ],
    statusLabel: '等保复测截止 2026-06 · 整改预计 0.5 工作日',
    statusCls: 'fm-status-yellow'
  },

  'vm-sg-event': {
    icon: 'shield_with_heart', iconColor: '#9A6700', headerBg: 'linear-gradient(135deg,#78350F,#92400E)',
    title: '完整整改报告：VM 安全组策略过宽',
    meta: '报告编号：FOR-COMP-20260428-004 · 生成时间：2026-04-28 09:00 · 分析师：NGPM AI',
    badges: [
      { text: '中危 · 等保合规', color: '#FEF3C7', bg: 'rgba(255,255,255,0.18)' },
      { text: '整改中 4/7', color: '#fff', bg: 'rgba(255,255,255,0.12)' }
    ],
    tabs: ['整改进度', '配置对比', '合规检查'],
    tabContent: {
      '整改进度': `
        <div class="fm-timeline-rich">
          <div class="fm-tl-item fm-tl-blue"><div class="fm-tl-dot"><span class="material-symbols-rounded">search</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-20</div><div class="fm-tl-label">AI 安全扫描发现配置风险</div><div class="fm-tl-detail">NGPM 安全配置合规扫描发现 7 台虚拟机安全组规则包含 0.0.0.0/0 源地址全开放策略，暴露 SSH（22）、RDP（3389）、HTTP（8080）高危端口。不符合等保三级"最小权限原则"。</div></div></div>
          <div class="fm-tl-item fm-tl-yellow"><div class="fm-tl-dot"><span class="material-symbols-rounded">assignment</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-21</div><div class="fm-tl-label">制定整改方案</div><div class="fm-tl-detail">安全团队确认整改方案：将安全组源地址从 0.0.0.0/0 收窄至运维跳板机 IP 段（10.0.1.0/24）。生产主机需申请停机维护窗口（05/03 02:00–04:00）。</div></div></div>
          <div class="fm-tl-item fm-tl-green"><div class="fm-tl-dot"><span class="material-symbols-rounded">check_circle</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-04-22 至 04/27</div><div class="fm-tl-label">Dev 主机整改完成（4/7）</div><div class="fm-tl-detail">已完成低优先级开发机整改：VM-Dev-012、013、021、032。均已将安全组源地址收窄，等保合规验证通过。</div></div></div>
          <div class="fm-tl-item fm-tl-yellow"><div class="fm-tl-dot"><span class="material-symbols-rounded">pending</span></div><div class="fm-tl-body"><div class="fm-tl-time">2026-05-03 02:00（计划）</div><div class="fm-tl-label">生产主机整改（3/7，待审批）</div><div class="fm-tl-detail">待整改：VM-Prod-031（ERP 数据库从库）、VM-Prod-044（财务系统）、VM-Prod-061（OA 系统）。变更申请已提交，等待管理员审批。</div></div></div>
        </div>`,
      '配置对比': `
        <div class="fm-evidence-block">
          <div class="fm-evidence-title">安全组规则变更对比（以 VM-Prod-031 为例）</div>
          <table class="fm-table">
            <thead><tr><th>方向</th><th>端口</th><th>整改前源地址</th><th>整改后源地址</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>入站</td><td>22 (SSH)</td><td><span class="fm-tag fm-tag-red">0.0.0.0/0</span></td><td><span class="fm-tag fm-tag-green">10.0.1.0/24</span></td><td>仅允许跳板机网段</td></tr>
              <tr><td>入站</td><td>3389 (RDP)</td><td><span class="fm-tag fm-tag-red">0.0.0.0/0</span></td><td><span class="fm-tag fm-tag-red">已移除</span></td><td>生产机不允许 RDP</td></tr>
              <tr><td>入站</td><td>8080 (HTTP)</td><td><span class="fm-tag fm-tag-red">0.0.0.0/0</span></td><td><span class="fm-tag fm-tag-green">10.0.0.0/8</span></td><td>仅允许内网访问</td></tr>
              <tr><td>入站</td><td>443 (HTTPS)</td><td>10.0.0.0/8</td><td>10.0.0.0/8</td><td>无变化</td></tr>
              <tr><td>出站</td><td>全部</td><td>0.0.0.0/0</td><td>0.0.0.0/0</td><td>出站策略不变</td></tr>
            </tbody>
          </table>
          <div class="fm-evidence-note">整改脚本已自动生成（一键部署）· 变更需审批后执行</div>
        </div>`,
      '合规检查': `
        <div class="fm-evidence-block">
          <div class="fm-evidence-title">等保三级合规检查项状态</div>
          <table class="fm-table">
            <thead><tr><th>检查项</th><th>标准要求</th><th>当前状态</th><th>整改后预测</th></tr></thead>
            <tbody>
              <tr><td>访问控制·最小权限</td><td>不允许全源地址开放高危端口</td><td><span class="fm-tag fm-tag-yellow">部分不合规（3台）</span></td><td><span class="fm-tag fm-tag-green">合规</span></td></tr>
              <tr><td>访问控制·端口管理</td><td>生产环境禁止暴露 RDP</td><td><span class="fm-tag fm-tag-red">不合规</span></td><td><span class="fm-tag fm-tag-green">合规</span></td></tr>
              <tr><td>访问控制·网络分区</td><td>运维访问通过跳板机</td><td><span class="fm-tag fm-tag-yellow">待整改</span></td><td><span class="fm-tag fm-tag-green">合规</span></td></tr>
              <tr><td>变更管理</td><td>生产变更需审批</td><td><span class="fm-tag fm-tag-green">合规（已申请审批）</span></td><td><span class="fm-tag fm-tag-green">合规</span></td></tr>
            </tbody>
          </table>
          <div class="fm-evidence-note">整改后预计等保评分：+2分（84% → 86%，达到合格线）</div>
        </div>`
    },
    iocs: [],
    assets: [
      { name: 'VM-Dev-012/013/021/032', detail: '已整改 · 等保合规', status: '已完成', cls: 'green' },
      { name: 'VM-Prod-031', detail: 'ERP 数据库从库 · 高风险', status: '待审批', cls: 'yellow' },
      { name: 'VM-Prod-044/061', detail: '财务 / OA · 待审批', status: '待审批', cls: 'yellow' }
    ],
    actions: [
      { icon: 'approval', text: '审批生产主机变更申请', done: false },
      { icon: 'build', text: '05/03 窗口一键部署整改脚本', done: false },
      { icon: 'check_circle', text: 'Dev 机整改（已完成 4/7）', done: true }
    ],
    statusLabel: '整改截止 2026-05-15 · 当前进度 57%（4/7）',
    statusCls: 'fm-status-yellow'
  }
};

function openForensicReport(eventId) {
  const data = FORENSIC_REPORTS[eventId];
  if (!data) return;

  const modal = document.getElementById('forensicModal');
  const overlay = document.getElementById('forensicOverlay');

  // Header
  const iconEl = document.getElementById('fmIcon');
  iconEl.textContent = data.icon;
  iconEl.style.color = data.iconColor;
  document.getElementById('fmIconWrap').style.background = 'rgba(255,255,255,0.15)';
  document.getElementById('fmTitle').textContent = data.title;
  document.getElementById('fmMeta').textContent = data.meta;
  const headerEl = modal.querySelector('.fm-header');
  headerEl.style.background = data.headerBg;
  headerEl.style.color = '#fff';
  document.getElementById('fmHeaderBadges').innerHTML = data.badges.map(b =>
    `<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:${b.bg};color:${b.color}">${b.text}</span>`
  ).join('');

  // Tabs
  const tabsEl = document.getElementById('fmTabs');
  tabsEl.innerHTML = data.tabs.map((t, i) =>
    `<button class="fm-tab ${i === 0 ? 'active' : ''}" data-tab="${t}">${t}</button>`
  ).join('');
  const contentEl = document.getElementById('fmTabContent');
  contentEl.innerHTML = data.tabContent[data.tabs[0]];

  tabsEl.querySelectorAll('.fm-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.fm-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      contentEl.innerHTML = data.tabContent[btn.dataset.tab] || '';
    });
  });

  // Sidebar IOC
  const iocSec = document.getElementById('fmSbIoc');
  if (data.iocs && data.iocs.length > 0) {
    iocSec.style.display = '';
    document.getElementById('fmIocBody').innerHTML = data.iocs.map(ioc =>
      `<div class="fm-ioc-item">
        <span class="fm-ioc-type">${ioc.type}</span>
        <span class="fm-ioc-val fm-ioc-${ioc.severity}">${ioc.value}</span>
      </div>`
    ).join('');
  } else {
    iocSec.style.display = 'none';
  }

  // Sidebar Assets
  document.getElementById('fmAssetsBody').innerHTML = data.assets.map(a =>
    `<div class="fm-asset-item">
      <div class="fm-asset-name">${a.name}</div>
      <div class="fm-asset-detail">${a.detail}</div>
      <span class="fm-asset-status fm-asset-${a.cls}">${a.status}</span>
    </div>`
  ).join('');

  // Sidebar Actions
  document.getElementById('fmActionsBody').innerHTML = data.actions.map(a =>
    `<div class="fm-action-item ${a.done ? 'fm-action-done' : ''}">
      <span class="material-symbols-rounded fm-action-icon">${a.done ? 'check_circle' : a.icon}</span>
      <span>${a.text}</span>
    </div>`
  ).join('');

  // Status
  const statusEl = document.getElementById('fmSbStatus');
  statusEl.textContent = data.statusLabel;
  statusEl.className = 'fm-sb-status ' + data.statusCls;

  overlay.classList.add('open');
  modal.classList.add('open');
}

function initForensicModal() {
  const modal = document.getElementById('forensicModal');
  const overlay = document.getElementById('forensicOverlay');
  document.getElementById('fmClose').addEventListener('click', () => {
    modal.classList.remove('open');
    overlay.classList.remove('open');
  });
  overlay.addEventListener('click', () => {
    modal.classList.remove('open');
    overlay.classList.remove('open');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      modal.classList.remove('open');
      overlay.classList.remove('open');
    }
  });
}

// ── 角色选择器 ────────────────────────────────────────────
function initRoleHint() {
  const HINT_KEY    = 'ngpm_role_hint_v1';
  const SWITCH_KEY  = 'ngpm_role_switched_v1';
  const selector    = qs('#roleSelector');

  // 如果已经切换过，不再显示任何提示效果
  if (localStorage.getItem(SWITCH_KEY)) return;

  const hint     = qs('#roleHint');
  const closeBtn = qs('#roleHintClose');
  let bubbleDismissed = false;

  // 气泡消隐：只关气泡，不关脉冲
  function dismissBubble() {
    if (bubbleDismissed) return;
    bubbleDismissed = true;
    hint.style.opacity    = '0';
    hint.style.transition = 'opacity 0.2s';
    setTimeout(() => hint.classList.remove('visible'), 220);
    localStorage.setItem(HINT_KEY, '1');
  }

  // 1.5s 后展示气泡 + 开启脉冲
  setTimeout(() => {
    selector.classList.add('hint-active');
    if (!localStorage.getItem(HINT_KEY)) {
      hint.classList.add('visible');
      setTimeout(dismissBubble, 7000);
    }
  }, 1500);

  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); dismissBubble(); });
  // 点开下拉时只关气泡，脉冲保持
  selector.addEventListener('click', dismissBubble);
}

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
  executive: { label: '数据中心总经理', icon: 'manage_accounts' },
  ops:       { label: '网络运维处', icon: 'engineering' },
  security:  { label: '网络安全处', icon: 'shield' },
};

function switchRole(role) {
  currentRole = role;
  const meta = ROLE_META[role];
  qs('#roleLabel').textContent = meta.label;
  qs('#roleIcon').textContent = meta.icon;

  // 用户实际切换了角色，停止脉冲并永久记录
  const sel = qs('#roleSelector');
  if (sel.classList.contains('hint-active')) {
    sel.classList.remove('hint-active');
    localStorage.setItem('ngpm_role_switched_v1', '1');
  }

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

  qsa('.dashboard-subrail-group').forEach(group => {
    group.classList.toggle('hidden', group.dataset.roleRail !== role);
  });

  // 延迟初始化图表（确保DOM可见）
  requestAnimationFrame(() => {
    if (role !== 'security') { secMapRunning = false; }
    if (role === 'executive' && !charts.exec) initExecCharts();
    if (role === 'security' && !secInited) { secInited = true; initSecurity(); }
    if (role === 'ops') initOps();
  });
}

// ── AI 进度条 ─────────────────────────────────────────────
function initAiProgressBar() {
  const btnRaw = qs('#btnRawAlerts');
  const btnAi = qs('#btnAiEvents');

  btnRaw.addEventListener('click', () => {
    openAlertDrawer('raw');
  });
  btnAi.addEventListener('click', () => {
    openAlertDrawer('ai');
  });

  // 进度动画（演示：从 87% 慢慢到 100%）
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
          'AI 关联分析完成，'
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

// 今日24小时模拟告警分布（小时0-23），14时为事件爆发高峰
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
            title(items) { return `${items[0].dataIndex}:00 — ${items[0].dataIndex}:59`; },
            label(item) { return ` ${item.raw} 条告警`; },
            afterLabel(item) { return item.dataIndex === 14 ? '⚠ 事件爆发时段' : ''; }
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

  // 重置过滤状态
  rawFilterSev = 'ALL';

  // 渲染内容
  renderRawAlerts();
  renderAiEvents();
  switchDrawerTab(tab);

  // 趋势图（切到 raw tab 时初始化）
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
  qs('#rawFilterCount').textContent = `共 ${filtered.length} 条`;
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
        <span class="aie-conf">置信度 <strong>${ev.conf}</strong></span>
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
        ${ev.type === '根因' ? `<button class="ef-btn ef-btn-primary">创建工单</button><button class="ef-btn evd-btn" data-evid="${ev.id}">证据链详情</button>` : ''}
        ${ev.type === '影响' ? '<button class="ef-btn">查看关联</button>' : ''}
      </div>
    </div>
  `).join('');
}

// ── 拓扑图 Tooltip ────────────────────────────────────────
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

  // 4/1 ~ 4/30，共30天
  const labels = Array.from({length: 30}, (_, i) => `4/${i + 1}`);
  const alertData = [
    1820, 1950, 2100, 1880, 1760,  // 4/1–4/5
    1650, 1720, 1810, 1980, 2050,  // 4/6–4/10
    2200, 2350, 2300, 2180, 2420,  // 4/11–4/15
    5800, 3200, 2450, 2100, 1980,  // 4/16–4/20（峰值 4/16）
    1870, 1920, 1990, 2080, 2150,  // 4/21–4/25
    2200, 2380, 2450, 2600, 2847,  // 4/26–4/30
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

  const ctx = canvas.getContext('2d');
  // 柱子渐变（普通：靛蓝；峰值：琥珀）
  const barNormal = ctx.createLinearGradient(0, 0, 0, 320);
  barNormal.addColorStop(0, 'rgba(123,159,249,0.92)');
  barNormal.addColorStop(1, 'rgba(199,213,248,0.55)');
  const barPeak = ctx.createLinearGradient(0, 0, 0, 320);
  barPeak.addColorStop(0, 'rgba(245,158,11,0.95)');
  barPeak.addColorStop(1, 'rgba(252,211,77,0.65)');
  // 折线下方渐变填充
  const lineFill = ctx.createLinearGradient(0, 0, 0, 320);
  lineFill.addColorStop(0, 'rgba(225,29,72,0.28)');
  lineFill.addColorStop(1, 'rgba(225,29,72,0)');

  charts.exec = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '告警数/天',
          data: alertData,
          backgroundColor: alertData.map((_, i) => i === peakIndex ? barPeak : barNormal),
          borderColor: alertData.map((_, i) => i === peakIndex ? '#F59E0B' : 'rgba(99,135,232,0.6)'),
          borderWidth: 1,
          borderRadius: 3,
          borderSkipped: false,
          yAxisID: 'y',
          order: 2,
        },
        {
          label: '故障次数',
          data: faultData,
          type: 'line',
          borderColor: '#E11D48',
          backgroundColor: lineFill,
          borderWidth: 2,
          fill: true,
          pointRadius: faultData.map(v => v > 0 ? 4.5 : 0),
          pointBackgroundColor: '#fff',
          pointBorderColor: '#E11D48',
          pointBorderWidth: 2,
          pointHoverRadius: faultData.map(v => v > 0 ? 6 : 3),
          pointHoverBackgroundColor: '#E11D48',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          tension: 0.4,
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
          backgroundColor: 'rgba(31,35,40,0.95)',
          titleColor: '#fff',
          bodyColor: '#E6EBF0',
          titleFont: { family: 'Inter', size: 11, weight: '600' },
          bodyFont: { family: 'Geist Mono', size: 11 },
          padding: 10, cornerRadius: 6, displayColors: true, boxPadding: 4,
          callbacks: {
            afterTitle(items) {
              if (items[0].dataIndex === peakIndex) return '⚠ 变更引发告警峰值';
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#EEF1F5', drawTicks: false },
          border: { display: false },
          ticks: { font: { size: 10 }, color: '#8C959F', maxTicksLimit: 7, autoSkip: true, padding: 6 }
        },
        y: {
          position: 'left', min: 0,
          grid: { color: '#EEF1F5', drawTicks: false },
          border: { display: false },
          ticks: { font: { family: 'Geist Mono', size: 10 }, color: '#8C959F', maxTicksLimit: 5, padding: 8 },
        },
        y1: {
          position: 'right', min: 0, max: 4,
          grid: { drawOnChartArea: false },
          border: { display: false },
          ticks: { font: { family: 'Geist Mono', size: 10 }, color: '#E11D48', stepSize: 1, padding: 8 },
        },
      }
    }
  });
}

// ── 安全处视图 ───────────────────────────────────────────

const SEC_ATTACK_SOURCES = [
  { country:'美国',     lat:40.7,  lon:-74.0, count:842, type:'crit', flag:'🇺🇸' },
  { country:'俄罗斯',   lat:55.7,  lon:37.6,  count:634, type:'crit', flag:'🇷🇺' },
  { country:'荷兰',     lat:52.3,  lon:4.9,   count:287, type:'warn', flag:'🇳🇱' },
  { country:'巴西',     lat:-23.5, lon:-46.6, count:241, type:'warn', flag:'🇧🇷' },
  { country:'新加坡',   lat:1.3,   lon:103.8, count:198, type:'warn', flag:'🇸🇬' },
  { country:'德国',     lat:52.5,  lon:13.4,  count:156, type:'warn', flag:'🇩🇪' },
  { country:'英国',     lat:51.5,  lon:-0.1,  count:134, type:'info', flag:'🇬🇧' },
  { country:'乌克兰',   lat:50.4,  lon:30.5,  count:122, type:'crit', flag:'🇺🇦' },
  { country:'法国',     lat:48.8,  lon:2.3,   count:98,  type:'info', flag:'🇫🇷' },
  { country:'印度',     lat:28.6,  lon:77.2,  count:87,  type:'info', flag:'🇮🇳' },
  { country:'加拿大',   lat:45.4,  lon:-75.7, count:76,  type:'info', flag:'🇨🇦' },
  { country:'南非',     lat:-26.2, lon:28.0,  count:54,  type:'info', flag:'🇿🇦' },
  { country:'澳大利亚', lat:-33.8, lon:151.2, count:43,  type:'info', flag:'🇦🇺' }
];

const SEC_DC_LAT = 39.9, SEC_DC_LON = 116.4;

const SEC_PIPELINE = [
  { name:'流量采集', icon:'wifi',          status:'ok',     stat:'2,847 条/秒', detail:'7 个采集节点' },
  { name:'异常检测', icon:'manage_search', status:'ok',     stat:'312 条/分钟', detail:'ML v2.3 模型' },
  { name:'行为分析', icon:'analytics',     status:'active', stat:'47 条分析中', detail:'深度关联引擎' },
  { name:'威胁研判', icon:'gavel',         status:'ok',     stat:'2 条高危',    detail:'ATT&CK 映射' },
  { name:'响应编排', icon:'smart_toy',     status:'ok',     stat:'全自动模式',  detail:'0 待人工审批' }
];

const SEC_STREAM_INIT = [
  { type:'crit',       text:'<strong>DNS 隧道 C2 通信</strong>：VM-Prod-047 确认高危，已自动隔离，证据包已生成',    time:'02:43' },
  { type:'auto',       text:'<strong>VM-089 rsync 备份</strong>：流量模式与策略匹配，判定误报，已自动关闭',        time:'02:44' },
  { type:'warn',       text:'<strong>安全组策略扫描</strong>：7 台 VM 允许 0.0.0.0/0 入站，等保合规风险',          time:'08:30' },
  { type:'auto',       text:'<strong>端口扫描探针</strong> × 12 条：来源已知安全扫描器，判定授权行为，已关闭',     time:'09:02' },
  { type:'auto',       text:'<strong>内部测试流量</strong> × 23 条：测试账号标记流量，与测试计划吻合，已关闭',     time:'10:15' },
  { type:'auto',       text:'<strong>规则误触发</strong> × 12 条：旧版规则冲突新服务，已自动更新规则',            time:'11:48' },
  { type:'ok',         text:'AI 完成今日低危批量处置：共 47 条，人工介入 0 条，平均处置时间 3.2 秒',              time:'13:22' },
  { type:'processing', text:'正在分析：10.10.2.34 → 境外 IP 异常 UDP 流量，模式匹配中...',                       time:'14:38' }
];

const SEC_EVENTS = [
  {
    id:'SEC-001', sev:'high', title:'DNS 隧道 C2 通信 · 已隔离', time:'02:17', status:'处置中',
    src:'VM-Prod-047 (10.10.47.3)', conf:91, method:'DNS 隧道 / C2 通信框架',
    tools:['DNS Tunneling', 'C2 Framework', '定时轮询查询'],
    killChain:[
      { name:'侦察',    active:true,  desc:'探测内网 DNS 可控外联通道' },
      { name:'武器化',  active:true,  desc:'构建 DNS 载荷，使用已知 C2 域名变种' },
      { name:'投递',    active:true,  desc:'VM 镜像供应链投递，时间未知' },
      { name:'利用',    active:true,  desc:'通过 53 端口绕过出口防火墙策略' },
      { name:'驻留',    active:true,  desc:'定时任务维持 C2，间隔 72ms' },
      { name:'C2',      active:true,  desc:'21,840 次 DNS 查询至 *.cdn-updates.net' },
      { name:'目标行动',active:false, desc:'AI 已在 C2 阶段拦截，外泄未完成' }
    ],
    content:[
      '查询目标：*.cdn-updates.net（已知 C2 域名家族变种）',
      '查询频率：21,840 次 / 26 分钟，间隔 72ms（机器特征）',
      '查询类型：TXT 记录（常见 C2 数据承载方式）',
      '查询内容：base64 编码载荷，AI 解码后含加密指令',
      '源 IP：10.10.47.3（VM-Prod-047，生产环境虚拟机）'
    ],
    remediation:[
      { pri:'P0', text:'VM-Prod-047 已由 AI 自动隔离至安全隔离区（33秒内完成）', status:'done',       color:'#1A7F37', icon:'check_circle' },
      { pri:'P0', text:'*.cdn-updates.net 已加入全局 DNS 封锁名单',              status:'done',       color:'#1A7F37', icon:'check_circle' },
      { pri:'P1', text:'提取 VM 内存快照 + 磁盘镜像，进行深度取证分析',         status:'pending',    color:'#D97706', icon:'pending' },
      { pri:'P1', text:'扫描同批次 VM 镜像（共 8 台，6 台已排除，2 台待确认）', status:'inprogress', color:'#0969DA', icon:'autorenew' },
      { pri:'P2', text:'审计 DNS 查询历史，评估数据外泄范围',                   status:'pending',    color:'#D97706', icon:'pending' },
      { pri:'P2', text:'复查 VM 镜像供应链，追溯恶意代码植入时间节点',          status:'pending',    color:'#D97706', icon:'pending' }
    ]
  },
  {
    id:'SEC-002', sev:'med', title:'7 台 VM 安全组策略过宽', time:'08:30', status:'整改中',
    src:'VM-Prod-012/015/022/033/041/056/069', conf:98, method:'安全配置缺陷 / 暴露面过大',
    tools:['0.0.0.0/0 入站规则', '等保合规扫描检测'],
    killChain:[
      { name:'侦察',    active:true,  desc:'外部扫描发现 22/3389/8080 等开放端口' },
      { name:'武器化',  active:false, desc:'暂未发现武器化行为' },
      { name:'投递',    active:false, desc:'暂未发现主动攻击投递' },
      { name:'利用',    active:false, desc:'策略过宽提供潜在入口，尚未被利用' },
      { name:'驻留',    active:false, desc:'—' },
      { name:'C2',      active:false, desc:'—' },
      { name:'目标行动',active:false, desc:'—' }
    ],
    content:[
      '受影响 VM：7 台（VM-Prod-012/015/022/033/041/056/069）',
      '问题规则：入站规则允许 0.0.0.0/0（全部 IP 无限制访问）',
      '暴露端口：22(SSH)、3389(RDP)、8080(HTTP)、443(HTTPS)',
      '等保要求：三级系统必须最小化入站源 IP，禁止 0.0.0.0/0',
      '整改截止：2026年5月15日（等保复测前必须完成）'
    ],
    remediation:[
      { pri:'P1', text:'AI 已生成最小权限安全组策略，可一键应用',         status:'pending',    color:'#8250DF', icon:'flash_on' },
      { pri:'P1', text:'确认各 VM 业务合规入站 IP 范围，避免误阻断',      status:'inprogress', color:'#0969DA', icon:'autorenew' },
      { pri:'P2', text:'创建整改工单，变更操作留审计日志',                status:'pending',    color:'#D97706', icon:'pending' },
      { pri:'P2', text:'整改完成后触发等保合规扫描验证',                  status:'pending',    color:'#D97706', icon:'pending' }
    ]
  },
  {
    id:'SEC-003', sev:'low', title:'AI 批量处置：47 条低危告警', time:'全天', status:'AI已关闭',
    src:'多源（内网）', conf:96, method:'扫描探针 / 误报 / 测试流量',
    tools:['端口扫描', 'rsync 备份流量', '规则误触发'],
    killChain:[
      { name:'侦察',    active:true,  desc:'12 条端口扫描，来自已知授权安全扫描器' },
      { name:'武器化',  active:false, desc:'均为探针行为，无武器化意图' },
      { name:'投递',    active:false, desc:'—' },
      { name:'利用',    active:false, desc:'—' },
      { name:'驻留',    active:false, desc:'—' },
      { name:'C2',      active:false, desc:'—' },
      { name:'目标行动',active:false, desc:'—' }
    ],
    content:[
      '扫描探针 12 条：来自已知安全扫描服务，AI 核验为授权扫描',
      '内部测试流量 23 条：测试账号产生，与测试计划完全匹配',
      '历史规则误触发 12 条：旧规则与新部署服务冲突，已自动更新',
      'AI 处置：共 47 条，人工介入 0 条，平均处置时间 3.2 秒/条'
    ],
    remediation:[
      { pri:'P0', text:'AI 已自动处置 47 条低危告警，无需人工介入', status:'done', color:'#1A7F37', icon:'check_circle' },
      { pri:'P2', text:'12 条过期规则已自动更新，防止再次误触发', status:'done', color:'#1A7F37', icon:'check_circle' }
    ]
  }
];

var secMapChart = null;
var secMapRunning = false;
var secMapWorldLoaded = false;
var secMapResizeHandler = null;
var secMapPopupTimer = null;
var secMapPopupIdx = 0;
var secAtkFeedTimer = null;
var secStreamTimer = null;

function initSecurity() {
  document.querySelectorAll('.ssn-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.ssn-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchSecPage(btn.dataset.secpage);
    };
  });
  switchSecPage('situation');
}

function switchSecPage(page) {
  if (page !== 'situation') {
    secMapRunning = false;
    if (secAtkFeedTimer) { clearInterval(secAtkFeedTimer); secAtkFeedTimer = null; }
    if (secMapPopupTimer) { clearInterval(secMapPopupTimer); secMapPopupTimer = null; }
    const popEl = document.getElementById('secMapPopups');
    if (popEl) popEl.innerHTML = '';
  }
  if (page !== 'aistream' && secStreamTimer) { clearInterval(secStreamTimer); secStreamTimer = null; }
  document.querySelectorAll('.sec-page').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById('sec-page-' + page);
  if (target) target.classList.remove('hidden');
  if (page === 'situation') {
    requestAnimationFrame(() => { initSecWorldMap(); renderSecTopCountries(); startSecAtkFeed(); });
  } else if (page === 'aistream') {
    renderSecPipeline(); renderSecStream(); startSecStreamTicker();
  } else if (page === 'events') {
    renderSecEvList(); showSecEvDetail('SEC-001');
  } else if (page === 'compliance') {
    setTimeout(initTlsChart, 50);
  }
}

// ── ECharts 世界攻击地图 ──────────────────────────────────
const SEC_WORLD_GEOJSON_URL = 'https://cdn.jsdelivr.net/gh/apache/echarts@4.9.0/map/json/world.json';

function loadWorldGeoJson() {
  if (secMapWorldLoaded) return Promise.resolve();
  return fetch(SEC_WORLD_GEOJSON_URL)
    .then(r => r.json())
    .then(geo => { echarts.registerMap('world', geo); secMapWorldLoaded = true; });
}

function buildSecMapOption() {
  const dcCoord = [SEC_DC_LON, SEC_DC_LAT];
  const sevColor = { crit:'#FF4444', warn:'#FFB800', info:'#00B4D8' };
  const lines = SEC_ATTACK_SOURCES.map(src => ({
    fromName: src.country, toName: 'DC-A',
    coords: [[src.lon, src.lat], dcCoord],
    lineStyle: { color: sevColor[src.type] || '#00B4D8' }
  }));
  const sources = SEC_ATTACK_SOURCES.map(src => ({
    name: src.country, value: [src.lon, src.lat, src.count],
    itemStyle: { color: sevColor[src.type] || '#00B4D8' }
  }));
  return {
    backgroundColor: '#050F1C',
    geo: {
      map: 'world', roam: false, silent: true,
      left: 0, right: 0, top: 0, bottom: 0,
      itemStyle: {
        areaColor: '#0A2944', borderColor: 'rgba(0,180,220,0.35)', borderWidth: 0.6
      },
      emphasis: { disabled: true },
      regions: [{ name: 'Antarctica', itemStyle: { areaColor: 'transparent', borderColor: 'transparent' } }]
    },
    series: [
      {
        name: '攻击飞线', type: 'lines', coordinateSystem: 'geo', zlevel: 2,
        effect: {
          show: true, period: 4, trailLength: 0.55,
          symbol: 'arrow', symbolSize: 6, color: '#FFFFFF'
        },
        lineStyle: { width: 1.2, opacity: 0.75, curveness: 0.32 },
        data: lines
      },
      {
        name: '攻击源', type: 'effectScatter', coordinateSystem: 'geo', zlevel: 3,
        rippleEffect: { brushType: 'stroke', period: 3, scale: 4 },
        symbolSize: val => Math.max(5, Math.min(14, Math.sqrt(val[2]) / 2.5)),
        data: sources,
        label: {
          show: true, position: 'right', formatter: '{b}',
          color: '#8CB4D0', fontSize: 9, fontWeight: 600
        }
      },
      {
        name: '本数据中心', type: 'effectScatter', coordinateSystem: 'geo', zlevel: 4,
        rippleEffect: { brushType: 'stroke', period: 2.5, scale: 6 },
        symbolSize: 14,
        itemStyle: { color: '#00FF88', shadowBlur: 12, shadowColor: '#00FF88' },
        data: [{ name: 'DC-A', value: [...dcCoord, 100] }],
        label: { show: true, position: 'right', formatter: 'DC-A', color: '#00FF88', fontSize: 11, fontWeight: 700 }
      }
    ]
  };
}

function initSecWorldMap() {
  const el = document.getElementById('secWorldMap');
  if (!el || typeof echarts === 'undefined') return;
  if (secMapRunning) { if (secMapChart) secMapChart.resize(); return; }
  secMapRunning = true;
  loadWorldGeoJson().then(() => {
    if (!secMapRunning) return;
    if (secMapChart) { secMapChart.dispose(); secMapChart = null; }
    secMapChart = echarts.init(el, null, { renderer: 'canvas' });
    secMapChart.setOption(buildSecMapOption());
    if (!secMapResizeHandler) {
      secMapResizeHandler = () => { if (secMapChart) secMapChart.resize(); };
      window.addEventListener('resize', secMapResizeHandler);
    }
    startSecMapPopups();
  }).catch(err => { console.warn('world map load failed:', err); secMapRunning = false; });
}

// ── 攻击事件浮窗动画 ─────────────────────────────────────
const SEC_POPUP_EVENTS = [
  { country:'美国',     type:'crit', title:'DNS 隧道 C2 通信',  text:'21,840 次异常 DNS 查询', meta:'02:17 · VM-Prod-047 已隔离' },
  { country:'俄罗斯',   type:'crit', title:'SSH 暴力破解',      text:'3,247 次失败登录 / 8min', meta:'02:43 · IP 封禁' },
  { country:'乌克兰',   type:'crit', title:'勒索软件 C2 探测',  text:'已知 LockBit 域名解析',  meta:'14:38 · AI 阻断' },
  { country:'荷兰',     type:'warn', title:'端口扫描',          text:'1024 端口全段探测',      meta:'09:02 · 防火墙拦截' },
  { country:'巴西',     type:'warn', title:'Web 攻击载荷',      text:'SQL 注入特征 × 47',      meta:'10:15 · WAF 拦截' },
  { country:'新加坡',   type:'warn', title:'API 异常调用',      text:'限速触发 × 312 次',      meta:'11:48 · 已限流' },
  { country:'德国',     type:'warn', title:'敏感目录扫描',      text:'/admin /backup 探针',    meta:'13:22 · 已记录' },
  { country:'英国',     type:'info', title:'TOR 出口节点连接',  text:'185.220.x.x 接入请求',   meta:'14:05 · 监控中' },
  { country:'印度',     type:'info', title:'ICMP 主机发现',     text:'ping 扫描 192.168.x.x',  meta:'14:22 · 已丢弃' },
  { country:'澳大利亚', type:'info', title:'UDP 反射探测',      text:'NTP / DNS 放大尝试',     meta:'14:44 · 已过滤' }
];

function startSecMapPopups() {
  const overlay = document.getElementById('secMapPopups');
  if (!overlay || !secMapChart) return;
  if (secMapPopupTimer) clearInterval(secMapPopupTimer);
  secMapPopupIdx = 0;

  const colorMap = {
    crit: { c:'#FF4444', g:'rgba(255,68,68,0.45)' },
    warn: { c:'#FFB800', g:'rgba(255,184,0,0.4)' },
    info: { c:'#00B4D8', g:'rgba(0,180,216,0.4)' }
  };

  const showOne = () => {
    if (!secMapRunning || !secMapChart) return;
    const ev = SEC_POPUP_EVENTS[secMapPopupIdx % SEC_POPUP_EVENTS.length];
    secMapPopupIdx++;
    const src = SEC_ATTACK_SOURCES.find(s => s.country === ev.country);
    if (!src) return;
    let pt;
    try { pt = secMapChart.convertToPixel('geo', [src.lon, src.lat]); } catch (e) { return; }
    if (!pt || !isFinite(pt[0])) return;
    const wrap = overlay.parentElement;
    const W = wrap.offsetWidth, H = wrap.offsetHeight;
    const margin = 140;
    const x = Math.max(margin, Math.min(W - margin, pt[0]));
    const y = Math.max(80, Math.min(H - 20, pt[1]));
    const col = colorMap[ev.type] || colorMap.info;
    const el = document.createElement('div');
    el.className = 'sec-map-popup';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.setProperty('--popup-color', col.c);
    el.style.setProperty('--popup-glow', col.g);
    el.innerHTML =
      '<div class="sec-map-popup-title"><span class="sec-mp-dot"></span>'
      + (src.flag || '') + ' ' + ev.country + ' · ' + ev.title + '</div>'
      + '<div class="sec-map-popup-text">' + ev.text + '</div>'
      + '<div class="sec-map-popup-meta">' + ev.meta + '</div>';
    overlay.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 5800);
  };

  showOne();
  setTimeout(showOne, 1200);
  secMapPopupTimer = setInterval(showOne, 2200);
}


function renderSecTopCountries() {
  const el = document.getElementById('secTopCountries'); if (!el) return;
  const max = SEC_ATTACK_SOURCES[0].count;
  const col = s => s.type==='crit'?'#CF222E':s.type==='warn'?'#D97706':'#0969DA';
  el.innerHTML = SEC_ATTACK_SOURCES.slice(0,7).map(src => {
    const pct = Math.round(src.count/max*100);
    return `<div class="sec-cntry-row"><span class="sec-cntry-flag">${src.flag}</span><span class="sec-cntry-name">${src.country}</span><div class="sec-cntry-bar-wrap"><div class="sec-cntry-bar" style="width:${pct}%;background:${col(src)}"></div></div><span class="sec-cntry-cnt">${src.count}</span></div>`;
  }).join('');
}

const SEC_ATK_TEMPLATES = [
  { color:'#FF4444', text: s => `${s.country} → TCP SYN 洪泛探测，目标端口 22/3389，已拦截` },
  { color:'#FF4444', text: s => `${s.country} → 疑似爆破攻击，SSH 连接失败 47 次，IP 已封禁` },
  { color:'#FFB800', text: s => `${s.country} → 端口扫描探针 1~1024，来源 ${s.flag}` },
  { color:'#FFB800', text: s => `${s.country} → HTTP 异常 User-Agent，疑似 Web 扫描器，已记录` },
  { color:'#00B4D8', text: s => `${s.country} → UDP 小包探测，占用带宽 <0.1%，已过滤` },
  { color:'#00B4D8', text: s => `${s.country} → ICMP 扫描 ${s.flag}，已由防火墙丢弃` }
];

function startSecAtkFeed() {
  const feed = document.getElementById('secAtkFeed'); if (!feed) return;
  feed.innerHTML = '';
  const addItem = () => {
    if (!document.getElementById('secAtkFeed')) return;
    const src = SEC_ATTACK_SOURCES[Math.floor(Math.random()*SEC_ATTACK_SOURCES.length)];
    const tpl = SEC_ATK_TEMPLATES[Math.floor(Math.random()*SEC_ATK_TEMPLATES.length)];
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    const div = document.createElement('div'); div.className = 'sec-atk-item';
    div.innerHTML = `<span class="sec-atk-dot" style="background:${tpl.color}"></span><span class="sec-atk-text">${tpl.text(src)}</span><span class="sec-atk-time">${ts}</span>`;
    feed.insertBefore(div, feed.firstChild);
    while (feed.children.length > 30) feed.removeChild(feed.lastChild);
  };
  for (var i = 0; i < 8; i++) addItem();
  secAtkFeedTimer = setInterval(addItem, 2200);
}

function renderSecPipeline() {
  const el = document.getElementById('secPipeline'); if (!el) return;
  const statusLabel = { ok:'运行中', active:'分析中', pending:'等待' };
  let html = '';
  SEC_PIPELINE.forEach((stage, i) => {
    if (i > 0) {
      const cc = SEC_PIPELINE[i-1].status === 'ok' ? 'ok' : 'active';
      html += `<div class="sec-pipe-connector ${cc}"></div>`;
    }
    html += `<div class="sec-pipe-stage"><div class="sec-pipe-icon ${stage.status}"><span class="material-symbols-rounded" style="font-size:22px;font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24">${stage.icon}</span></div><div class="sec-pipe-name">${stage.name}</div><div class="sec-pipe-stat">${stage.stat}</div><div class="sec-pipe-stat" style="color:#8C959F">${stage.detail}</div><span class="sec-pipe-status ${stage.status}">${statusLabel[stage.status]||stage.status}</span></div>`;
  });
  el.innerHTML = html;
}

function renderSecStream() {
  const el = document.getElementById('secStreamBody'); if (!el) return;
  const typeMap = {
    crit:{ icon:'emergency_heat', color:'#CF222E' }, warn:{ icon:'gpp_maybe', color:'#D97706' },
    ok:{ icon:'neurology', color:'#8250DF' }, auto:{ icon:'check_circle', color:'#1A7F37' },
    processing:{ icon:'autorenew', color:'#0969DA' }
  };
  el.innerHTML = SEC_STREAM_INIT.map(item => {
    const tm = typeMap[item.type] || typeMap.ok;
    const spin = item.type==='processing' ? ' sec-stream-spin' : '';
    return `<div class="sec-stream-item ${item.type}"><span class="material-symbols-rounded sec-stream-icon${spin}" style="color:${tm.color}">${tm.icon}</span><span class="sec-stream-text">${item.text}</span><span class="sec-stream-time">${item.time}</span></div>`;
  }).join('');
  const cnt = document.getElementById('secStreamCount');
  if (cnt) cnt.textContent = `今日已处理 ${SEC_STREAM_INIT.length} 条`;
}

function startSecStreamTicker() {
  const NEW_ITEMS = [
    { type:'auto',       text:'<strong>内部 IP 10.10.8.22</strong> 出站 UDP 流量轻微异常，与历史基线偏差 12%，判定正常波动，已关闭' },
    { type:'processing', text:'正在分析：来自 185.220.x.x 的 TOR 出口节点连接请求，特征匹配中...' },
    { type:'auto',       text:'<strong>VM-Prod-031</strong> 登录失败 3 次，来源内网测试账号，与测试计划匹配，已关闭' },
    { type:'warn',       text:'<strong>cert-api-gw</strong> 证书将在 7 天后到期，AI 建议尽快续签以避免服务中断' },
    { type:'ok',         text:'AI 基线更新完成：今日新增行为模式 247 条，异常检测模型准确率提升至 97.8%' }
  ];
  const typeMap = {
    crit:{ icon:'emergency_heat', color:'#CF222E' }, warn:{ icon:'gpp_maybe', color:'#D97706' },
    ok:{ icon:'neurology', color:'#8250DF' }, auto:{ icon:'check_circle', color:'#1A7F37' },
    processing:{ icon:'autorenew', color:'#0969DA' }
  };
  let newIdx = 0;
  secStreamTimer = setInterval(() => {
    const el = document.getElementById('secStreamBody'); if (!el) return;
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const item = Object.assign({}, NEW_ITEMS[newIdx % NEW_ITEMS.length], { time: ts });
    newIdx++;
    const tm = typeMap[item.type] || typeMap.ok;
    const spin = item.type==='processing' ? ' sec-stream-spin' : '';
    const div = document.createElement('div'); div.className = `sec-stream-item ${item.type}`;
    div.innerHTML = `<span class="material-symbols-rounded sec-stream-icon${spin}" style="color:${tm.color}">${tm.icon}</span><span class="sec-stream-text">${item.text}</span><span class="sec-stream-time">${ts}</span>`;
    el.insertBefore(div, el.firstChild);
    while (el.children.length > 20) el.removeChild(el.lastChild);
    const cnt = document.getElementById('secStreamCount');
    if (cnt) cnt.textContent = `今日已处理 ${SEC_STREAM_INIT.length + newIdx} 条`;
  }, 5000);
}

function renderSecEvList() {
  const el = document.getElementById('secEvList'); if (!el) return;
  const statusColor = { '处置中':'#CF222E', '整改中':'#D97706', 'AI已关闭':'#1A7F37' };
  el.innerHTML = SEC_EVENTS.map(ev => {
    const sc = statusColor[ev.status] || '#636C76';
    return `<div class="sec-ev-item" data-evid="${ev.id}" onclick="showSecEvDetail('${ev.id}')"><div class="sec-ev-item-top"><span class="sec-ev-sev ${ev.sev}">${ev.sev.toUpperCase()}</span><span class="sec-ev-title">${ev.title}</span></div><div class="sec-ev-meta"><span>${ev.id}</span><span style="color:${sc};font-weight:600">${ev.status}</span><span>AI 置信度 ${ev.conf}%</span></div></div>`;
  }).join('');
}

function showSecEvDetail(evId) {
  const ev = SEC_EVENTS.find(e => e.id === evId); if (!ev) return;
  document.querySelectorAll('.sec-ev-item').forEach(el => el.classList.toggle('active', el.dataset.evid === evId));
  const sevColor = { high:'#CF222E', med:'#D97706', low:'#636C76' };
  const sevBg    = { high:'#FFEBE9', med:'#FFF8E5', low:'#F6F8FA' };
  const sc = sevColor[ev.sev]||'#636C76', sbg = sevBg[ev.sev]||'#F6F8FA';
  const statusColor = { '处置中':'#CF222E', '整改中':'#D97706', 'AI已关闭':'#1A7F37' };
  const ssc = statusColor[ev.status]||'#636C76';
  const kcHtml = '<div class="sec-kill-chain">' + ev.killChain.map((kc, i) => {
    const boxCls = kc.active ? (ev.sev==='high'?'kc-crit':'kc-warn') : 'kc-off';
    const arr = i < ev.killChain.length-1 ? '<span class="sec-kc-arr">›</span>' : '';
    return `<div class="sec-kc-stage"><div class="sec-kc-box ${boxCls}">${kc.name}</div><div class="sec-kc-desc" style="${kc.active?'':'color:#D0D7DE'}">${kc.active?kc.desc:'—'}</div></div>${arr}`;
  }).join('') + '</div>';
  const contentHtml = ev.content.map(c => `<div style="display:flex;align-items:flex-start;gap:6px;font-size:11px;padding:3px 0"><span style="color:${sc};flex-shrink:0;margin-top:1px">•</span><span style="color:#1F2328;line-height:1.5">${c}</span></div>`).join('');
  const toolsHtml = ev.tools.map(t => `<span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${sbg};color:${sc};border:1px solid ${sc}30;font-weight:600">${t}</span>`).join(' ');
  const remedHtml = ev.remediation.map(r => `<div class="sec-remedy-item" style="border-left:3px solid ${r.color}"><span class="material-symbols-rounded sec-remedy-icon" style="color:${r.color}">${r.icon}</span><div style="flex:1"><div style="font-size:11px;color:#1F2328;line-height:1.5">${r.text}</div><div style="font-size:10px;color:${r.color};font-weight:600;margin-top:2px">${r.pri} · ${r.status==='done'?'已完成':r.status==='inprogress'?'进行中':'待执行'}</div></div></div>`).join('');
  const fv = s => `font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 20`;
  document.getElementById('secEvDetail').innerHTML =
    `<div class="sec-detail-header"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span class="sec-ev-sev ${ev.sev}" style="font-size:10px;padding:3px 8px">${ev.sev.toUpperCase()}</span><span style="font-size:14px;font-weight:700;color:#1F2328;flex:1">${ev.title}</span><span style="font-size:11px;font-weight:700;color:${ssc};background:${ssc}15;padding:3px 10px;border-radius:10px">${ev.status}</span></div><div style="display:flex;gap:16px;font-size:11px;color:#636C76"><span>事件ID：<strong style="color:#1F2328">${ev.id}</strong></span><span>来源：<strong style="color:#1F2328">${ev.src}</strong></span><span>时间：<strong style="color:#1F2328">${ev.time}</strong></span><span>AI 置信度：<strong style="color:${sc}">${ev.conf}%</strong></span></div></div>` +
    `<div class="sec-detail-body"><div><div class="sec-detail-section-title"><span class="material-symbols-rounded" style="font-size:14px;color:${sc};${fv()}">category</span>攻击方式 / 工具</div><div style="font-size:12px;font-weight:700;color:${sc};margin-bottom:8px">${ev.method}</div><div style="display:flex;flex-wrap:wrap;gap:6px">${toolsHtml}</div></div>` +
    `<div><div class="sec-detail-section-title"><span class="material-symbols-rounded" style="font-size:14px;color:#8250DF;${fv()}">timeline</span>攻击链条（MITRE ATT&CK）</div>${kcHtml}</div>` +
    `<div><div class="sec-detail-section-title"><span class="material-symbols-rounded" style="font-size:14px;color:#0969DA;${fv()}">find_in_page</span>攻击内容</div><div style="background:#F6F8FA;border-radius:8px;padding:10px 14px">${contentHtml}</div></div>` +
    `<div><div class="sec-detail-section-title"><span class="material-symbols-rounded" style="font-size:14px;color:#1A7F37;${fv()}">healing</span>处置建议 / 进度</div><div style="display:flex;flex-direction:column;gap:6px">${remedHtml}</div></div></div>`;
}

function initTlsChart() {
  const canvas = qs('#tlsChart');
  if (!canvas) return;
  if (charts.tls) { charts.tls.destroy(); charts.tls = null; }
  charts.tls = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['TLS 1.3', 'TLS 1.2', 'TLS 1.0'],
      datasets: [{ data: [67, 31, 2], backgroundColor: ['#1A7F37', '#D4A72C', '#CF222E'], borderWidth: 2, borderColor: '#fff' }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` } } },
      cutout: '65%'
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

  // 打字中...
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
    answer = `正在分析「${q}」...\n\n基于当前数据中心实时数据，AI Copilot 将为您提供精准分析。（演示模式：请使用下方预设问题体验完整对话）`;
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
// ── 证据链详情 Modal ─────────────────────────────────────
function openEvidenceModal(eventId) {
  const ev = AI_EVENTS.find(e => e.id === eventId);
  const data = EVIDENCE_DATA[eventId];
  if (!ev || !data) return;

  // Header
  const icon = qs('#evidenceTitleIcon');
  icon.textContent = ev.type === '安全' ? 'security' : 'hub';
  icon.style.color = data.confColor;
  qs('#evidenceTitleText').textContent = `${ev.id} · ${ev.title}`;
  qs('#evidenceSubtitle').textContent = `AI ${ev.type}分析 · 置信度 ${ev.conf} · 2026-04-28`;

  const levelCls = { crit: 'evd-tl-crit', warn: 'evd-tl-warn', info: 'evd-tl-info', ok: 'evd-tl-ok' };
  const valCls   = { crit: 'evd-tl-val-crit', warn: 'evd-tl-val-warn', info: 'evd-tl-val-info', ok: 'evd-tl-val-ok' };

  qs('#evidenceBody').innerHTML = `
    <div class="evd-conf-section">
      <span class="evd-conf-label">AI 置信度</span>
      <div class="evd-conf-track">
        <div class="evd-conf-fill" style="width:${data.conf}%;background:${data.confColor}"></div>
      </div>
      <span class="evd-conf-val" style="color:${data.confColor}">${data.conf}%</span>
    </div>
    <div class="evd-summary">${data.summary}</div>
    <div class="evd-body-cols">
      <div>
        <div class="evd-sec-title">
          <span class="material-symbols-rounded">timeline</span>证据时间线
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
            <span class="material-symbols-rounded">block</span>已排除假设
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
      <span class="material-symbols-rounded">account_tree</span>影响传导链
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
  // 辅助函数：开关 modal
  function openModal(overlayId, panelId) {
    qs('#' + overlayId).classList.add('open');
    qs('#' + panelId).classList.add('open');
  }
  function closeModal(overlayId, panelId) {
    qs('#' + overlayId).classList.remove('open');
    qs('#' + panelId).classList.remove('open');
  }

  // 云平台扣分详情按钮
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

  // 证据链详情：事件代理（告警抽屉 AI 面板）
  qs('#drawerBodyAi').addEventListener('click', e => {
    const btn = e.target.closest('.evd-btn');
    if (btn) openEvidenceModal(btn.dataset.evid);
  });
  qs('#evidenceClose').addEventListener('click', () => closeModal('evidenceOverlay', 'evidenceModal'));
  qs('#evidenceOverlay').addEventListener('click', () => closeModal('evidenceOverlay', 'evidenceModal'));
  // 设备详情抽屉
  qs('#invDevClose').addEventListener('click', () => {
    qs('#invDevOverlay').classList.remove('open');
    qs('#invDevDrawer').classList.remove('open');
  });
  qs('#invDevOverlay').addEventListener('click', () => {
    qs('#invDevOverlay').classList.remove('open');
    qs('#invDevDrawer').classList.remove('open');
  });
}

// ══════════════════════════════════════════════════════════
//  网络运维处视图 JS
// ══════════════════════════════════════════════════════════

// ── ops 状态 ─────────────────────────────────────────────
let opsInited = false;
const _gotoParam = new URLSearchParams(location.search).get('goto');
let opsSubPage = (_gotoParam && document.getElementById(_gotoParam)) ? _gotoParam : 'ops-overview';
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
  { name:'SW-Core-01', type:'交换机', model:'H3C S12508X-AF', ip:'10.0.0.1',  zone:'核心区', room:'1号机房B区', cpu:52, mem:61, portTotal:128, portUsed:87, health:'正常', alerts:0,  lastInsp:'1天前'  },
  { name:'SW-Core-02', type:'交换机', model:'H3C S12508X-AF', ip:'10.0.0.2',  zone:'核心区', room:'1号机房B区', cpu:89, mem:74, portTotal:128, portUsed:88, health:'告警', alerts:3,  lastInsp:'2天前'  },
  { name:'SW-Core-03', type:'交换机', model:'H3C S12508X-AF', ip:'10.0.0.3',  zone:'核心区', room:'2号机房A区', cpu:44, mem:55, portTotal:128, portUsed:72, health:'正常', alerts:0,  lastInsp:'1天前'  },
  { name:'SW-AGG-B01', type:'交换机', model:'H3C S10508',     ip:'10.1.1.1',  zone:'汇聚区', room:'1号机房B区', cpu:38, mem:48, portTotal:48,  portUsed:36, health:'正常', alerts:0,  lastInsp:'3天前'  },
  { name:'SW-AGG-B02', type:'交换机', model:'H3C S10508',     ip:'10.1.1.2',  zone:'汇聚区', room:'1号机房B区', cpu:41, mem:51, portTotal:48,  portUsed:38, health:'正常', alerts:0,  lastInsp:'3天前'  },
  { name:'ACC-B01',    type:'交换机', model:'H3C S5560X',     ip:'10.2.1.1',  zone:'接入区', room:'1号机房B区', cpu:22, mem:35, portTotal:48,  portUsed:42, health:'正常', alerts:1,  lastInsp:'5天前'  },
  { name:'ACC-B02',    type:'交换机', model:'H3C S5560X',     ip:'10.2.1.2',  zone:'接入区', room:'1号机房B区', cpu:19, mem:32, portTotal:48,  portUsed:40, health:'正常', alerts:1,  lastInsp:'5天前'  },
  { name:'ACC-A01',    type:'交换机', model:'H3C S5560X',     ip:'10.2.2.1',  zone:'接入区', room:'2号机房A区', cpu:28, mem:41, portTotal:48,  portUsed:35, health:'正常', alerts:0,  lastInsp:'4天前'  },
  { name:'ACC-A02',    type:'交换机', model:'H3C S5560X',     ip:'10.2.2.2',  zone:'接入区', room:'2号机房A区', cpu:31, mem:44, portTotal:48,  portUsed:37, health:'正常', alerts:0,  lastInsp:'4天前'  },
  { name:'FW-OUT-01',  type:'防火墙', model:'华为 USG6680',    ip:'10.0.10.1', zone:'出口区', room:'1号机房A区', cpu:67, mem:72, portTotal:16,  portUsed:12, health:'告警', alerts:1,  lastInsp:'1天前'  },
  { name:'FW-OUT-02',  type:'防火墙', model:'华为 USG6680',    ip:'10.0.10.2', zone:'出口区', room:'1号机房A区', cpu:63, mem:68, portTotal:16,  portUsed:12, health:'正常', alerts:0,  lastInsp:'1天前'  },
  { name:'RT-WAN-01',  type:'路由器', model:'H3C CR16010',     ip:'10.0.20.1', zone:'出口区', room:'1号机房A区', cpu:58, mem:49, portTotal:8,   portUsed:6,  health:'告警', alerts:2,  lastInsp:'2天前'  },
  { name:'RT-WAN-02',  type:'路由器', model:'H3C CR16010',     ip:'10.0.20.2', zone:'出口区', room:'1号机房A区', cpu:52, mem:47, portTotal:8,   portUsed:6,  health:'正常', alerts:0,  lastInsp:'2天前'  },
  { name:'LB-WEB-01',  type:'负载均衡', model:'F5 BIG-IP 2200', ip:'10.0.30.1', zone:'DMZ区', room:'1号机房C区', cpu:44, mem:58, portTotal:8,   portUsed:4,  health:'正常', alerts:0,  lastInsp:'7天前'  },
  { name:'LB-WEB-02',  type:'负载均衡', model:'F5 BIG-IP 2200', ip:'10.0.30.2', zone:'DMZ区', room:'1号机房C区', cpu:41, mem:55, portTotal:8,   portUsed:4,  health:'正常', alerts:0,  lastInsp:'7天前'  },
];

// ── 设备台账扩展详情数据（by device name）────────────────
const INV_DEV_EXTRA = {
  'SW-Core-01': {
    sn:'H3C-12508X-SN031', firmware:'Comware 7 R6612P02', uptime:'287天',
    warrantyEnd:'2027-03-01', rackPos:'1号机房B区 · U14-U20', deployDate:'2021-09-15',
    aiScore:88, aiRisk:'low',
    aiSummary:'设备运行平稳，所有指标处于安全区间。AI 预测未来 7 天无显著异常风险。',
    aiTips:[
      {type:'info', text:'端口组 GE0/0/1-4 流量持续增长，建议关注汇聚层带宽余量'},
      {type:'info', text:'距上次固件更新 182 天，建议计划下次维护窗口升级'},
      {type:'ok',   text:'无活跃告警，AI 风险综合评估：低，设备状态优'}
    ],
    cpuTrend:[48,50,52,49,51,50,52,53,51,52,51,52],
    ports:[
      {name:'GE0/0/1', status:'up',   speed:'100G', util:62, peer:'SW-AGG-B01'},
      {name:'GE0/0/2', status:'up',   speed:'100G', util:58, peer:'SW-AGG-B02'},
      {name:'GE0/0/3', status:'up',   speed:'100G', util:44, peer:'SW-Core-02'},
      {name:'GE0/0/4', status:'up',   speed:'10G',  util:12, peer:'FW-OUT-01'},
      {name:'GE0/0/5', status:'down', speed:'10G',  util:0,  peer:'—'}
    ],
    changes:[
      {time:'04-27 22:30', user:'AI自动基线',  desc:'ACL 规则优化（AI 建议应用）', type:'auto'},
      {time:'04-20 10:12', user:'ops-admin',   desc:'VLAN 200 配置变更',           type:'manual'},
      {time:'04-12 14:05', user:'ops-admin',   desc:'固件升级 R6612P01→P02',       type:'upgrade'}
    ]
  },
  'SW-Core-02': {
    sn:'H3C-12508X-SN032', firmware:'Comware 7 R6612P02', uptime:'12天',
    warrantyEnd:'2027-03-01', rackPos:'1号机房B区 · U21-U27', deployDate:'2021-09-15',
    aiScore:52, aiRisk:'high',
    aiSummary:'【关联故障 F001】B区06号机柜制冷故障引发热降频，CPU 89%，转发能力下降约 40%。机柜温度 38.2°C 仍高于阈值，建议优先恢复制冷。',
    aiTips:[
      {type:'crit', text:'立即处置：关联 F001，机柜温度 38.2°C，精密空调控制板待更换'},
      {type:'warn', text:'预测：制冷恢复后约 45 分钟 CPU 可回落至正常区间（约 52%）'},
      {type:'warn', text:'下联 ACC-B01/B02 接口错误率 2.1%，建议同步监控接口质量'}
    ],
    cpuTrend:[44,48,52,58,65,70,76,80,84,87,89,89],
    ports:[
      {name:'GE0/0/1', status:'up',  speed:'100G', util:89, peer:'SW-AGG-B01'},
      {name:'GE0/0/2', status:'up',  speed:'100G', util:86, peer:'SW-AGG-B02'},
      {name:'GE0/0/3', status:'up',  speed:'100G', util:74, peer:'SW-Core-01'},
      {name:'GE0/0/4', status:'err', speed:'10G',  util:38, peer:'FW-OUT-01'}
    ],
    changes:[
      {time:'04-29 14:23', user:'DCIM自动', desc:'热降频事件触发，转发性能下降 40%',   type:'alert'},
      {time:'04-29 14:21', user:'DCIM',     desc:'TMP-B06-1 机柜温度越限 38.2°C',     type:'alert'},
      {time:'04-17 09:00', user:'ops-admin',desc:'ECMP 路由策略调整',                  type:'manual'}
    ]
  },
  'SW-Core-03': {
    sn:'H3C-12508X-SN033', firmware:'Comware 7 R6612P02', uptime:'287天',
    warrantyEnd:'2027-03-01', rackPos:'2号机房A区 · U14-U20', deployDate:'2021-09-15',
    aiScore:92, aiRisk:'low',
    aiSummary:'设备状态优良，CPU/内存利用率偏低，端口余量充裕。AI 预测未来 14 天内无风险。',
    aiTips:[
      {type:'ok',   text:'所有性能指标均处于最优区间，AI 过去 7 天行为基线正常'},
      {type:'info', text:'端口组有 56 个空闲端口，可承接后续扩容需求'},
      {type:'info', text:'与 SW-Core-01 互联链路质量良好，可作为热备冗余'}
    ],
    cpuTrend:[40,42,44,41,43,42,44,45,43,44,43,44],
    ports:[
      {name:'GE0/0/1', status:'up',   speed:'100G', util:44, peer:'SW-AGG-A01'},
      {name:'GE0/0/2', status:'up',   speed:'100G', util:38, peer:'SW-AGG-A02'},
      {name:'GE0/0/3', status:'up',   speed:'100G', util:32, peer:'SW-Core-01'},
      {name:'GE0/0/4', status:'down', speed:'10G',  util:0,  peer:'—'}
    ],
    changes:[
      {time:'04-15 11:00', user:'ops-admin',  desc:'STP 根桥优先级调整',              type:'manual'},
      {time:'04-08 09:30', user:'AI自动基线', desc:'端口安全策略优化（AI 建议）',     type:'auto'},
      {time:'03-20 08:00', user:'ops-admin',  desc:'固件升级 R6612P01→P02',           type:'upgrade'}
    ]
  },
  'SW-AGG-B01': {
    sn:'H3C-S10508-SN011', firmware:'Comware 7 R6612P01', uptime:'420天',
    warrantyEnd:'2026-06-30', rackPos:'1号机房B区 · U8-U11', deployDate:'2020-12-01',
    aiScore:78, aiRisk:'med',
    aiSummary:'设备运行稳定，但维保将于 62 天后到期（2026-06-30），且固件版本较最新落后一个版本，AI 建议尽快规划续保与升级。',
    aiTips:[
      {type:'warn', text:'维保将于 62 天后到期（2026-06-30），建议提前续保或评估替换'},
      {type:'info', text:'固件版本 R6612P01 较最新版本落后，建议计划升级'},
      {type:'ok',   text:'端口利用率 75%（36/48），运行状态良好'}
    ],
    cpuTrend:[32,35,38,36,37,38,39,38,37,38,38,38],
    ports:[
      {name:'GE0/0/1', status:'up', speed:'100G', util:38, peer:'SW-Core-01'},
      {name:'GE0/0/2', status:'up', speed:'100G', util:35, peer:'SW-Core-02'},
      {name:'GE0/0/3', status:'up', speed:'10G',  util:22, peer:'ACC-B01'},
      {name:'GE0/0/4', status:'up', speed:'10G',  util:19, peer:'ACC-B02'}
    ],
    changes:[
      {time:'04-18 15:20', user:'ops-admin',  desc:'QoS 策略模板应用',              type:'manual'},
      {time:'03-25 10:00', user:'AI自动基线', desc:'环路保护策略更新（AI 建议）',   type:'auto'}
    ]
  },
  'SW-AGG-B02': {
    sn:'H3C-S10508-SN012', firmware:'Comware 7 R6612P01', uptime:'420天',
    warrantyEnd:'2026-06-30', rackPos:'1号机房B区 · U12-U15', deployDate:'2020-12-01',
    aiScore:79, aiRisk:'med',
    aiSummary:'与 SW-AGG-B01 互为 VRRP 冗余对，双活运行正常。维保同步到期，AI 建议统一规划续保以降低运维风险。',
    aiTips:[
      {type:'warn', text:'维保将于 62 天后到期（2026-06-30），建议与 SW-AGG-B01 统一续保'},
      {type:'info', text:'固件版本低于最新，建议与 B01 同期升级以减少维护窗口频次'},
      {type:'ok',   text:'与 SW-AGG-B01 构成 VRRP 双活，冗余状态正常'}
    ],
    cpuTrend:[36,38,41,39,40,41,42,41,40,41,41,41],
    ports:[
      {name:'GE0/0/1', status:'up', speed:'100G', util:41, peer:'SW-Core-01'},
      {name:'GE0/0/2', status:'up', speed:'100G', util:38, peer:'SW-Core-02'},
      {name:'GE0/0/3', status:'up', speed:'10G',  util:24, peer:'ACC-B01'},
      {name:'GE0/0/4', status:'up', speed:'10G',  util:21, peer:'ACC-B02'}
    ],
    changes:[
      {time:'04-18 15:22', user:'ops-admin',  desc:'QoS 策略模板应用',              type:'manual'},
      {time:'03-25 10:02', user:'AI自动基线', desc:'环路保护策略更新（AI 建议）',   type:'auto'}
    ]
  },
  'ACC-B01': {
    sn:'H3C-S5560X-SN061', firmware:'Comware 7 R6609P01', uptime:'510天',
    warrantyEnd:'2026-09-01', rackPos:'1号机房B区 · U3-U4', deployDate:'2020-06-15',
    aiScore:68, aiRisk:'med',
    aiSummary:'上联端口错误率自 14:23 起升至 2.1%，关联 SW-Core-02 热降频故障（F001）。AI 判断为联动故障，预计随 F001 处置后自动恢复。',
    aiTips:[
      {type:'warn', text:'关联 F001：上联 GE0/0/1 错误率 2.1%，待 SW-Core-02 温度恢复后评估'},
      {type:'info', text:'端口利用率 87.5%（42/48），偏高，建议关注接入区扩容计划'},
      {type:'info', text:'固件 R6609P01 落后 2 个版本，建议安排升级'}
    ],
    cpuTrend:[18,19,20,19,21,22,21,22,23,22,22,22],
    ports:[
      {name:'GE0/0/1', status:'up',   speed:'10G', util:35, peer:'SW-AGG-B01'},
      {name:'GE0/0/2', status:'up',   speed:'10G', util:28, peer:'SW-AGG-B02'},
      {name:'GE0/0/3', status:'up',   speed:'1G',  util:12, peer:'SERVER-01'},
      {name:'GE0/0/4', status:'up',   speed:'1G',  util:8,  peer:'SERVER-02'},
      {name:'GE0/0/5', status:'down', speed:'1G',  util:0,  peer:'—'}
    ],
    changes:[
      {time:'04-22 08:30', user:'ops-admin',  desc:'服务器接入口 VLAN 调整',          type:'manual'},
      {time:'04-01 11:00', user:'AI自动基线', desc:'风暴控制阈值优化（AI 建议）',     type:'auto'}
    ]
  },
  'ACC-B02': {
    sn:'H3C-S5560X-SN062', firmware:'Comware 7 R6609P01', uptime:'510天',
    warrantyEnd:'2026-09-01', rackPos:'1号机房B区 · U5-U6', deployDate:'2020-06-15',
    aiScore:68, aiRisk:'med',
    aiSummary:'与 ACC-B01 情况相同，上联错误率 2.1% 关联 F001 事件。AI 判断为联动故障，无需单独处置，静待制冷恢复后自动消除。',
    aiTips:[
      {type:'warn', text:'关联 F001：上联 GE0/0/1 错误率 2.1%，属联动故障，AI 判断无需单独处置'},
      {type:'info', text:'端口利用率 83%（40/48），利用率偏高，建议规划扩容'},
      {type:'ok',   text:'AI 预测：随 F001 处置完成，本告警将自动消除'}
    ],
    cpuTrend:[15,17,18,17,19,20,19,19,20,19,19,19],
    ports:[
      {name:'GE0/0/1', status:'up', speed:'10G', util:32, peer:'SW-AGG-B01'},
      {name:'GE0/0/2', status:'up', speed:'10G', util:26, peer:'SW-AGG-B02'},
      {name:'GE0/0/3', status:'up', speed:'1G',  util:10, peer:'SERVER-03'},
      {name:'GE0/0/4', status:'up', speed:'1G',  util:7,  peer:'SERVER-04'}
    ],
    changes:[
      {time:'04-22 08:32', user:'ops-admin',  desc:'服务器接入口 VLAN 调整',          type:'manual'},
      {time:'04-01 11:02', user:'AI自动基线', desc:'风暴控制阈值优化（AI 建议）',     type:'auto'}
    ]
  },
  'ACC-A01': {
    sn:'H3C-S5560X-SN071', firmware:'Comware 7 R6611P01', uptime:'390天',
    warrantyEnd:'2027-06-01', rackPos:'2号机房A区 · U3-U4', deployDate:'2021-01-15',
    aiScore:87, aiRisk:'low',
    aiSummary:'设备状态良好，位于 2 号机房 A 区，与 SW-Core-03 连接，近期无告警，AI 基线行为正常。',
    aiTips:[
      {type:'ok',   text:'无活跃告警，AI 过去 7 天行为基线正常'},
      {type:'info', text:'端口利用率 73%（35/48），有一定余量'},
      {type:'info', text:'建议下次维护窗口检查 SFP 光模块（已使用 390 天）'}
    ],
    cpuTrend:[24,26,28,25,27,28,27,28,29,28,28,28],
    ports:[
      {name:'GE0/0/1', status:'up',   speed:'10G', util:28, peer:'SW-Core-03'},
      {name:'GE0/0/2', status:'up',   speed:'10G', util:24, peer:'SW-AGG-A01'},
      {name:'GE0/0/3', status:'up',   speed:'1G',  util:9,  peer:'SERVER-05'},
      {name:'GE0/0/4', status:'down', speed:'1G',  util:0,  peer:'—'}
    ],
    changes:[
      {time:'04-10 09:00', user:'ops-admin',  desc:'VLAN 300 接入配置',               type:'manual'},
      {time:'03-15 14:30', user:'AI自动基线', desc:'接口速率基线更新',                 type:'auto'}
    ]
  },
  'ACC-A02': {
    sn:'H3C-S5560X-SN072', firmware:'Comware 7 R6611P01', uptime:'390天',
    warrantyEnd:'2027-06-01', rackPos:'2号机房A区 · U5-U6', deployDate:'2021-01-15',
    aiScore:86, aiRisk:'low',
    aiSummary:'与 ACC-A01 构成接入层冗余对，运行状态正常，AI 近期无风险检测，互备路径已验证。',
    aiTips:[
      {type:'ok',   text:'无活跃告警，设备运行状态优'},
      {type:'info', text:'端口利用率 77%（37/48），运行在合理区间'},
      {type:'info', text:'与 ACC-A01 构成接入冗余，互为备份路径已验证'}
    ],
    cpuTrend:[27,29,31,28,30,31,30,31,32,31,31,31],
    ports:[
      {name:'GE0/0/1', status:'up',   speed:'10G', util:31, peer:'SW-Core-03'},
      {name:'GE0/0/2', status:'up',   speed:'10G', util:27, peer:'SW-AGG-A02'},
      {name:'GE0/0/3', status:'up',   speed:'1G',  util:11, peer:'SERVER-06'},
      {name:'GE0/0/4', status:'down', speed:'1G',  util:0,  peer:'—'}
    ],
    changes:[
      {time:'04-10 09:02', user:'ops-admin',  desc:'VLAN 300 接入配置',               type:'manual'},
      {time:'03-15 14:32', user:'AI自动基线', desc:'接口速率基线更新',                 type:'auto'}
    ]
  },
  'FW-OUT-01': {
    sn:'HW-USG6680-SN101', firmware:'V500R005C20SPC300', uptime:'180天',
    warrantyEnd:'2027-10-01', rackPos:'1号机房A区 · U28-U30', deployDate:'2022-06-01',
    aiScore:65, aiRisk:'med',
    aiSummary:'内存利用率 72% 持续偏高，会话表使用率 81%（阈值 85%）。AI 预测若流量继续增长，12h 内可能触发会话表满告警，建议清理超时 NAT 会话。',
    aiTips:[
      {type:'warn', text:'会话表使用率 81%，距阈值仅 4%；AI 建议清理长超时 NAT 会话'},
      {type:'warn', text:'内存 72% 持续走高，建议检查安全策略命中率，精简无效规则'},
      {type:'info', text:'与 FW-OUT-02 构成双机 HA，当前主备状态正常，切换无风险'}
    ],
    cpuTrend:[55,58,60,59,62,63,65,64,66,67,68,67],
    ports:[
      {name:'GE1/0/0', status:'up', speed:'10G', util:67, peer:'RT-WAN-01'},
      {name:'GE1/0/1', status:'up', speed:'10G', util:63, peer:'RT-WAN-02'},
      {name:'GE1/0/2', status:'up', speed:'10G', util:45, peer:'SW-Core-01'},
      {name:'GE1/0/3', status:'up', speed:'1G',  util:12, peer:'管理网'}
    ],
    changes:[
      {time:'04-26 17:00', user:'ops-admin',  desc:'新增安全策略组 POLICY-ERP-OUT',    type:'manual'},
      {time:'04-20 10:30', user:'AI自动基线', desc:'NAT 超时会话自动清理（AI 建议）', type:'auto'},
      {time:'04-05 09:00', user:'ops-admin',  desc:'IPS 特征库升级 2026Q1',            type:'upgrade'}
    ]
  },
  'FW-OUT-02': {
    sn:'HW-USG6680-SN102', firmware:'V500R005C20SPC300', uptime:'180天',
    warrantyEnd:'2027-10-01', rackPos:'1号机房A区 · U31-U33', deployDate:'2022-06-01',
    aiScore:84, aiRisk:'low',
    aiSummary:'当前为 HA 备机，CPU/内存均正常。AI 建议定期验证 HA 切换演练，确保主备策略一致。',
    aiTips:[
      {type:'ok',   text:'当前为 HA 备机，心跳状态正常，随时可接管业务'},
      {type:'info', text:'最近一次策略同步：4 小时前，主备配置一致'},
      {type:'info', text:'建议定期验证 HA 切换演练（上次演练：60 天前）'}
    ],
    cpuTrend:[58,60,62,59,61,63,62,63,63,63,63,63],
    ports:[
      {name:'GE1/0/0', status:'up', speed:'10G', util:63, peer:'RT-WAN-01'},
      {name:'GE1/0/1', status:'up', speed:'10G', util:58, peer:'RT-WAN-02'},
      {name:'GE1/0/2', status:'up', speed:'10G', util:42, peer:'SW-Core-01'},
      {name:'GE1/0/3', status:'up', speed:'1G',  util:10, peer:'管理网'}
    ],
    changes:[
      {time:'04-26 17:05', user:'HA同步', desc:'策略同步 POLICY-ERP-OUT', type:'auto'},
      {time:'04-05 09:05', user:'HA同步', desc:'IPS 特征库同步升级',       type:'auto'}
    ]
  },
  'RT-WAN-01': {
    sn:'H3C-CR16010-SN201', firmware:'Comware 7 R0306P12', uptime:'210天',
    warrantyEnd:'2028-01-01', rackPos:'1号机房A区 · U1-U7', deployDate:'2022-10-15',
    aiScore:60, aiRisk:'high',
    aiSummary:'WAN-01 出口利用率 84%（840Mbps/1G），AI 预测 48h 内将达 91%。当前季度末业务高峰叠加，建议立即启用 SD-WAN 流量调度策略。',
    aiTips:[
      {type:'crit', text:'AI 预测：48h 内利用率达 91%，建议立即启用 SD-WAN 调度，将 ERP/OA 备份迁移至 WAN-02'},
      {type:'warn', text:'NTA 检测：ERP/OA 备份任务占用 18% 带宽，建议调至非高峰时段（00:00-06:00）'},
      {type:'info', text:'WAN-02 当前利用率仅 12%，可承载约 880Mbps 转移流量'}
    ],
    cpuTrend:[48,50,52,51,53,55,56,57,56,58,57,58],
    ports:[
      {name:'GE0/0/0', status:'up', speed:'1G',  util:84, peer:'ISP-电信'},
      {name:'GE0/0/1', status:'up', speed:'10G', util:48, peer:'FW-OUT-01'},
      {name:'GE0/0/2', status:'up', speed:'10G', util:45, peer:'FW-OUT-02'},
      {name:'GE0/0/3', status:'up', speed:'1G',  util:8,  peer:'管理网'}
    ],
    changes:[
      {time:'04-28 08:00', user:'ops-admin',  desc:'BGP 路由策略调整（流量优化）', type:'manual'},
      {time:'04-22 11:30', user:'AI自动基线', desc:'带宽告警阈值从 90% 调整为 80%', type:'auto'},
      {time:'04-01 09:00', user:'ops-admin',  desc:'QoS 优先级策略更新',           type:'manual'}
    ]
  },
  'RT-WAN-02': {
    sn:'H3C-CR16010-SN202', firmware:'Comware 7 R0306P12', uptime:'210天',
    warrantyEnd:'2028-01-01', rackPos:'1号机房A区 · U8-U14', deployDate:'2022-10-15',
    aiScore:91, aiRisk:'low',
    aiSummary:'WAN-02 备用出口利用率仅 12%，当前承载备用路由。AI 建议在 WAN-01 拥塞时作为流量调度目标，可吸收约 880Mbps。',
    aiTips:[
      {type:'ok',   text:'设备运行状态优，当前利用率仅 12%，有充足带宽余量'},
      {type:'info', text:'AI 建议：WAN-01 流量调度策略中，此接口可承接约 880Mbps 转移流量'},
      {type:'info', text:'BGP 路由热备已就绪，切换延迟预估 < 30 秒'}
    ],
    cpuTrend:[46,48,50,47,49,51,50,52,51,52,52,52],
    ports:[
      {name:'GE0/0/0', status:'up', speed:'1G',  util:12, peer:'ISP-联通'},
      {name:'GE0/0/1', status:'up', speed:'10G', util:45, peer:'FW-OUT-01'},
      {name:'GE0/0/2', status:'up', speed:'10G', util:43, peer:'FW-OUT-02'}
    ],
    changes:[
      {time:'04-28 08:02', user:'ops-admin',  desc:'BGP 热备路由策略同步',            type:'manual'},
      {time:'04-22 11:32', user:'AI自动基线', desc:'带宽监控阈值同步更新',            type:'auto'}
    ]
  },
  'LB-WEB-01': {
    sn:'F5-BIG-IP-2200-SN301', firmware:'BIG-IP 16.1.4.1', uptime:'490天',
    warrantyEnd:'2026-12-31', rackPos:'1号机房C区 · U18-U19', deployDate:'2020-09-01',
    aiScore:85, aiRisk:'low',
    aiSummary:'负载均衡运行正常，Web 集群当前活跃连接数 14,208，P99 延迟 38ms，远低于 SLA 阈值（200ms）。',
    aiTips:[
      {type:'ok',   text:'Web 服务 P99 延迟 38ms，AI 评估远低于 SLA 阈值 200ms，状态优'},
      {type:'info', text:'当前 VIP 池中 8 台后端全部在线，会话持久化策略正常'},
      {type:'info', text:'维保将于 2026-12-31 到期（245 天后），建议提前规划续约'}
    ],
    cpuTrend:[40,42,44,41,43,44,43,44,45,44,44,44],
    ports:[
      {name:'1.1', status:'up',   speed:'10G', util:44, peer:'SW-Core-01'},
      {name:'1.2', status:'up',   speed:'10G', util:41, peer:'SW-Core-03'},
      {name:'1.3', status:'up',   speed:'1G',  util:22, peer:'管理网'},
      {name:'1.4', status:'down', speed:'10G', util:0,  peer:'—'}
    ],
    changes:[
      {time:'04-24 16:00', user:'ops-admin',  desc:'新增 Web 后端成员 10.10.3.18',   type:'manual'},
      {time:'04-08 14:00', user:'ops-admin',  desc:'SSL 证书更新（有效至 2027-04）', type:'upgrade'},
      {time:'03-20 11:00', user:'AI自动基线', desc:'健康检查间隔优化（AI 建议）',    type:'auto'}
    ]
  },
  'LB-WEB-02': {
    sn:'F5-BIG-IP-2200-SN302', firmware:'BIG-IP 16.1.4.1', uptime:'490天',
    warrantyEnd:'2026-12-31', rackPos:'1号机房C区 · U20-U21', deployDate:'2020-09-01',
    aiScore:85, aiRisk:'low',
    aiSummary:'与 LB-WEB-01 构成 Active-Standby，当前为备机，配置同步正常，随时可接管业务。',
    aiTips:[
      {type:'ok',   text:'HA 备机状态正常，配置最后同步：2 小时前'},
      {type:'info', text:'建议与 LB-WEB-01 维保同步续约（均为 2026-12-31 到期）'},
      {type:'info', text:'上次 HA 切换演练：30 天前，建议每季度演练一次'}
    ],
    cpuTrend:[37,39,41,38,40,41,40,41,42,41,41,41],
    ports:[
      {name:'1.1', status:'up', speed:'10G', util:41, peer:'SW-Core-01'},
      {name:'1.2', status:'up', speed:'10G', util:38, peer:'SW-Core-03'},
      {name:'1.3', status:'up', speed:'1G',  util:18, peer:'管理网'}
    ],
    changes:[
      {time:'04-24 16:05', user:'HA同步', desc:'后端成员配置同步',   type:'auto'},
      {time:'04-08 14:05', user:'HA同步', desc:'SSL 证书同步更新',   type:'auto'}
    ]
  }
};

// ── 故障事件数据 ─────────────────────────────────────────
const FAULT_EVENTS = [
  {
    id:'F001', pri:'P1', status:'处置中', title:'B区06号机柜精密空调故障', time:'14:21',
    domain:'物理层→网络层', icon:'ac_unit', iconColor:'#CF222E',
    tags:['机房基础', 'SW-Core-02', 'VLAN100', 'ERP'],
    rawAlerts:[
      { src:'DCIM',  sev:'crit', text:'TMP-B06-1 温度 38.2°C 超阈值 32°C', time:'14:21:03' },
      { src:'DCIM',  sev:'crit', text:'TMP-B06-2 温度 38.1°C 超阈值 32°C', time:'14:21:05' },
      { src:'DCIM',  sev:'crit', text:'PAC-B06 控制器 SNMP 超时（第 1 次）', time:'14:22:17' },
      { src:'DCIM',  sev:'crit', text:'PAC-B06 控制器 SNMP 超时（第 2 次）', time:'14:22:32' },
      { src:'DCIM',  sev:'crit', text:'PAC-B06 控制器 SNMP 超时（第 3 次）', time:'14:22:47' },
      { src:'NMS',   sev:'crit', text:'SW-Core-02 CPU 利用率 89%（阈值 80%）', time:'14:23:07' },
      { src:'NMS',   sev:'warn', text:'SW-Core-02 Gi1/0/1 CRC 错误率上升', time:'14:23:09' },
      { src:'NMS',   sev:'warn', text:'SW-Core-02 Gi1/0/2 CRC 错误率上升', time:'14:23:10' },
      { src:'NMS',   sev:'warn', text:'SW-Core-02 Gi1/0/3 CRC 错误率上升', time:'14:23:11' },
      { src:'NMS',   sev:'warn', text:'VSS 心跳延迟 320ms 超阈值 100ms', time:'14:23:12' },
      { src:'NTA',   sev:'warn', text:'VLAN100 东西向延迟 344ms（基线 4ms）', time:'14:23:15' },
      { src:'NTA',   sev:'warn', text:'VLAN100 丢包率 0.3% 超阈值', time:'14:23:16' },
      { src:'APM',   sev:'crit', text:'ERP P99 响应 2100ms（SLA 500ms）', time:'14:23:17' },
      { src:'NMS',   sev:'warn', text:'ACC-B01 Gi0/1 错误率 2.1%', time:'14:23:09', suppressed:true },
      { src:'NMS',   sev:'warn', text:'ACC-B01 Gi0/2 错误率 1.9%', time:'14:23:10', suppressed:true },
      { src:'NMS',   sev:'warn', text:'ACC-B01 Gi0/3 错误率 1.8%', time:'14:23:11', suppressed:true },
      { src:'NMS',   sev:'warn', text:'ACC-B02 Gi0/1 错误率 1.8%', time:'14:23:12', suppressed:true },
    ],
    rca: {
      conf:96, color:'#1A7F37',
      rootCause:'PAC-B06 精密空调控制板故障，制冷停止导致 SW-Core-02 热降频',
      chain:[
        { icon:'thermostat',       text:'TMP-B06-1: 38.2°C（阈值 32°C）',         time:'14:21:03', sev:'crit', src:'DCIM', conf:99,
          detail:'B06-1 与 B06-2 双传感器读数吻合（38.2°C / 38.1°C），排除单点误报。温升速率 +2.1°C/min，AI 预测约 11 分钟后将达到 SW-Core-02 热降频触发阈值 40°C。' },
        { icon:'power_off',        text:'PAC-B06 控制器停止响应',                  time:'14:22:17', sev:'crit', src:'DCIM', conf:96,
          detail:'DCIM 连续 3 次 SNMP get 超时（每次间隔 15s），确认 PAC-B06 控制板完全离线。机房 B06 区域已无主动制冷，温升趋势将持续扩大。' },
        { icon:'device_thermostat', text:'SW-Core-02 热降频 CPU 34%→89%',         time:'14:23:07', sev:'crit', src:'NMS', conf:97,
          detail:'CPU 利用率从基线 34% 骤升至 89%，触发 H3C S12500X 内置热保护降频策略，转发能力下降约 40%。VSS 心跳延迟同步从 12ms 升至 320ms（阈值 100ms），主备同步异常。' },
        { icon:'network_check',    text:'VLAN100 延迟 +340ms · 3接口错误率上升',  time:'14:23:15', sev:'warn', src:'NTA', conf:91,
          detail:'VLAN100 东西向平均延迟从基线 4ms 升至 344ms。SW-Core-02 的 Gi1/0/1、Gi1/0/2、Gi1/0/3 接口 CRC 错误计数器每秒新增 120+ 次，NTA 流量分析确认下游丢包率 0.3%。' },
        { icon:'web_asset',        text:'ERP P99 响应 2100ms（SLA 500ms）',        time:'14:23:17', sev:'crit', src:'APM', conf:88,
          detail:'ERP P99 响应时间超 SLA 阈值 4.2 倍。APM 链路追踪显示瓶颈在数据库层网络 I/O（DB-CRM-01 查询等待 +1800ms），与 VLAN100 延迟上升时间点吻合，AI 关联置信 88%。' },
      ],
      dataSources:['DCIM（温度传感器）','NMS（CPU/端口）','NTA（流量）','APM（ERP延迟）'],
      impact:'1台核心交换机 · 2台汇聚 · VLAN100 · 14VM · ERP系统',
      impactLayers:[
        { layer:'物理层', icon:'thermostat', color:'#9A6700',
          items:[
            { name:'PAC-B06 精密空调', status:'crit', note:'制冷停止' },
            { name:'TMP-B06-1', status:'crit', note:'38.2°C' },
            { name:'TMP-B06-2', status:'crit', note:'38.1°C' },
          ]
        },
        { layer:'网络层', icon:'device_hub', color:'#CF222E',
          items:[
            { name:'SW-Core-02', status:'crit', note:'CPU热降频 34%→89%' },
            { name:'VLAN100',    status:'warn', note:'延迟 +340ms' },
            { name:'AGG-PRD-01', status:'warn', note:'上游降频级联' },
            { name:'ACC-B01',    status:'warn', note:'CRC错误 2.1%' },
            { name:'ACC-B02',    status:'warn', note:'CRC错误 1.8%' },
          ]
        },
        { layer:'业务层', icon:'web_asset', color:'#6E40C9',
          items:[
            { name:'ERP 系统', status:'crit', note:'P99 2100ms', sla:'SLA 超限 4.2×' },
            { name:'VM集群 ×14台', status:'warn', note:'网络 I/O 降速' },
          ]
        },
      ],
      actions:[
        { step:1, urgent:true,  title:'开启机柜 B06 应急送风',
          desc:'立即打开 B06 列间空调应急模式并启动走廊顶部辅助风扇，预计 3 分钟内将机柜入口温度降低约 2°C，使 SW-Core-02 退出热降频保护。',
          effect:'温度从 38.2°C 降至 36°C 以下，SW-Core-02 转发能力完全恢复',
          tool:'机房值班工程师', eta:'立即执行（约 3 min）' },
        { step:2, urgent:true,  title:'切换 VSS 主控至 SW-Core-01',
          desc:'通过 NMS 下发 VSS 主控切换命令，将业务流量主路径迁移至 SW-Core-01，消除 SW-Core-02 降频对下游业务的持续影响。建议在业务低谷或告知业务方后执行。',
          effect:'切换抖动 < 50ms，ERP P99 响应恢复至 SLA 500ms 以内',
          tool:'网络工程师', eta:'立即执行（切换 < 1 min）' },
        { step:3, urgent:false, title:'创建工单检修 PAC-B06',
          desc:'通过 DCIM 工单系统创建精密空调控制板检修任务，联系厂商驻场工程师更换 PAC-B06 控制板，消除根本故障点。',
          effect:'根本修复，防止再次降温失效，闭合告警',
          tool:'DCIM 工单 / 厂商工程师', eta:'工单创建后约 2 h 响应' },
        { step:4, urgent:false, title:'验证 VLAN100 延迟与 ERP SLA 恢复',
          desc:'处置完成后，由 AI Copilot 自动轮询 NTA 与 APM 数据，确认 VLAN100 延迟回落至基线 4ms 以内，ERP P99 恢复至 500ms 以内，并关闭本事件。',
          effect:'延迟 < 10ms，ERP P99 < 500ms，事件自动闭环',
          tool:'AI Copilot（自动验证）', eta:'主控切换后 5 min' },
      ],
    }
  },
  {
    id:'F002', pri:'P2', status:'已关闭', title:'WAN-01 带宽持续超阈值告警', time:'09:14',
    domain:'网络层→业务层', icon:'router', iconColor:'#9A6700',
    tags:['出口区', 'WAN-01', '带宽'],
    rawAlerts:[
      { src:'NMS',  sev:'warn', text:'WAN-01 接口利用率 84%（阈值 80%）5分钟均值', time:'09:14:22' },
      { src:'NMS',  sev:'warn', text:'WAN-01 接口利用率 83%（阈值 80%）5分钟均值', time:'09:09:22', suppressed:true },
      { src:'NTA',  sev:'info', text:'BACKUP-SRV 检测到 rsync 大流量（~180Mbps）', time:'09:16:00' },
      { src:'AI',   sev:'warn', text:'AI 预测：WAN-01 利用率 48h 内将达 91%', time:'09:15:00' },
    ],
    rca: {
      conf:88, color:'#D09B00',
      rootCause:'季度末业务高峰叠加 WAN-01 链路 1G 瓶颈，利用率 84% 并持续上升',
      chain:[
        { icon:'trending_up',  text:'WAN-01 接口流量：840Mbps（阈值 800Mbps）', time:'09:14:22', sev:'warn', src:'NMS', conf:99,
          detail:'NMS SNMP 计数器（5 分钟均值）840Mbps 超阈值 5%。过去 7 天同时段平均值 720Mbps，本日高出 16.7%，判断为季度末业务高峰叠加效应。' },
        { icon:'show_chart',   text:'AI 预测：48h 内达到 91% 利用率',             time:'09:15:00', sev:'warn', src:'AI', conf:85,
          detail:'基于过去 14 天同期流量趋势线性外推，置信区间 ±4%。若 BACKUP-SRV 备份任务继续超窗运行，48h 内峰值预测值为 905Mbps（91%），将触发 P1 告警阈值。' },
        { icon:'cloud_upload', text:'NTA 识别：ERP/OA 备份任务占用 18%',          time:'09:16:00', sev:'info', src:'NTA', conf:92,
          detail:'NTA DPI 识别到 BACKUP-SRV（10.10.1.50）持续向外部备份节点发起 rsync 会话，占 WAN 出口 18%（~180Mbps）。该任务按策略应在 02:00–06:00 窗口执行，存在超窗 3h+ 问题。' },
      ],
      dataSources:['NMS（接口计数器）','NTA（流量识别）'],
      impact:'出口带宽即将成为业务瓶颈，季度末高峰存在丢包风险',
      impactLayers:[
        { layer:'物理层', icon:'cable', color:'#9A6700',
          items:[
            { name:'WAN-01 接口', status:'warn', note:'840 Mbps / 1G (84%)' },
          ]
        },
        { layer:'网络层', icon:'router', color:'#D09B00',
          items:[
            { name:'BACKUP-SRV', status:'warn', note:'rsync超窗 ~180 Mbps' },
            { name:'AI 预测', status:'warn', note:'48h 后达 91%' },
          ]
        },
        { layer:'业务层', icon:'business', color:'#6E40C9',
          items:[
            { name:'季度末业务高峰', status:'warn', note:'潜在丢包风险' },
          ]
        },
      ],
      actions:[
        { step:1, urgent:true,  title:'终止 BACKUP-SRV 超窗备份任务',
          desc:'登录 BACKUP-SRV 终止当前 rsync 进程，并修正备份策略执行窗口（02:00–06:00）。预计立即释放约 180 Mbps（18%）带宽占用。',
          effect:'WAN-01 利用率从 84% 降至约 66%，缓解峰值超限风险',
          tool:'系统管理员', eta:'立即执行（约 5 min）' },
        { step:2, urgent:false, title:'启用 SD-WAN 出口负载均衡',
          desc:'在 SD-WAN 控制器上开启 WAN-01/WAN-02 负载均衡策略，将 HTTP 及大文件传输流量调度至 WAN-02 联通备用线路，降低 WAN-01 峰值压力。',
          effect:'两条出口均衡分担后，WAN-01 利用率预计降至 50% 以下',
          tool:'网络工程师', eta:'配置变更约 30 min' },
        { step:3, urgent:false, title:'申请 WAN-01 带宽扩容至 2G',
          desc:'联系电信 ISP 将 WAN-01 出口升级至 2G，在季度末高峰期前完成扩容，从根本解决出口瓶颈。',
          effect:'长期方案：扩容后峰值利用率降至 45% 以下，SLA 保障更充裕',
          tool:'网络工程师 / ISP', eta:'业务申请审批约 10 工作日' },
      ],
    }
  },
  {
    id:'F003', pri:'P3', status:'已关闭', title:'ACC-B01/B02 接口错误率告警', time:'08:02',
    domain:'网络层', icon:'settings_input_component', iconColor:'#636C76',
    tags:['接入区', 'ACC-B01', 'ACC-B02'],
    rawAlerts:[
      { src:'NMS',  sev:'warn', text:'ACC-B01 Gi0/1 接口错误率 2.1%', time:'14:23:09' },
      { src:'NMS',  sev:'warn', text:'ACC-B01 Gi0/2 接口错误率 1.9%', time:'14:23:10' },
      { src:'NMS',  sev:'warn', text:'ACC-B01 Gi0/3 接口错误率 1.8%', time:'14:23:11' },
      { src:'NMS',  sev:'warn', text:'ACC-B02 Gi0/1 接口错误率 1.8%', time:'14:23:12' },
    ],
    rca: {
      conf:79, color:'#636C76',
      rootCause:'SW-Core-02 热降频导致下联接入层接口错误帧增加（关联 F001）',
      chain:[
        { icon:'error_outline',  text:'ACC-B01 Gi0/1~Gi0/3 错误率 2.1%',          time:'14:23:09', sev:'warn', src:'NMS', conf:95,
          detail:'NMS 接口错误计数器显示 ACC-B01 的 Gi0/1、Gi0/2、Gi0/3 CRC 错误率从 0% 升至 2.1%，ACC-B02 同时段 Gi0/1 错误率 1.8%。受影响 VM 集群共约 24 台服务器接口质量下降。' },
        { icon:'link',           text:'关联 F001：SW-Core-02 降频，转发错误扩散', time:'14:23:15', sev:'info', src:'AI', conf:79,
          detail:'AI 关联分析确认 ACC-B01/B02 错误率上升与 F001 的 SW-Core-02 热降频事件时间差仅 6 秒。拓扑路径验证 ACC-B01→AGG-PRD-01→SW-Core-02，错误帧为核心交换机下发的级联影响，已随 F001 处置后自动恢复。' },
      ],
      dataSources:['NMS（接口错误计数器）'],
      impact:'下联 VM 集群部分接口质量下降，已随 F001 处置后恢复',
      impactLayers:[
        { layer:'物理层', icon:'settings_input_component', color:'#636C76',
          items:[
            { name:'SW-Core-02', status:'warn', note:'热降频级联（关联 F001）' },
          ]
        },
        { layer:'网络层', icon:'device_hub', color:'#9A6700',
          items:[
            { name:'ACC-B01 Gi0/1−0/3', status:'warn', note:'错误率 2.1%' },
            { name:'ACC-B02 Gi0/1',     status:'warn', note:'错误率 1.8%' },
          ]
        },
        { layer:'业务层', icon:'dns', color:'#1A7F37',
          items:[
            { name:'VM 集群 ×24 台', status:'ok', note:'接口质量已恢复' },
          ]
        },
      ],
      actions:[
        { step:1, urgent:false, title:'等待 F001 处置完成（级联恢复）',
          desc:'ACC-B01/B02 接口错误率上升是 SW-Core-02 热降频的级联效应，F001 处置完成后接口错误率将自动恢复，无需单独干预。',
          effect:'接口错误率从 2.1% 自动恢复至 0%，无服务中断风险',
          tool:'自动恢复（依赖 F001）', eta:'F001 处置完成后约 2 min' },
        { step:2, urgent:false, title:'验证接口错误率归零并关闭事件',
          desc:'F001 处置完成后，通过 NMS 确认 ACC-B01 Gi0/1~Gi0/3 及 ACC-B02 Gi0/1 错误计数器已停止增长，并由 AI Copilot 自动关闭本事件。',
          effect:'F003 事件闭环，下联 VM 集群 24 台服务器接口质量恢复正常',
          tool:'NMS / AI Copilot（自动验证）', eta:'验证约 5 min' },
      ],
    }
  },
];

// ── 关键链路数据 ─────────────────────────────────────────
const OPS_LINKS = [
  { name:'WAN-01 (出口互联网)', util:84, capacity:'1G',  status:'warn',  aiNote:'预测 48h 达 91%' },
  { name:'WAN-02 (备用互联网)', util:12, capacity:'1G',  status:'ok',    aiNote:null },
  { name:'SW-Core-01 上行',     util:62, capacity:'100G', status:'ok',    aiNote:null },
  { name:'SW-Core-02 上行',     util:89, capacity:'100G', status:'crit',  aiNote:'热降频，转发能力降 60%' },
  { name:'DC互联 A-B',          util:44, capacity:'10G',  status:'ok',    aiNote:null },
  { name:'存储网 iSCSI-02',     util:78, capacity:'10G',  status:'warn',  aiNote:'错误率轻微上升' },
];

// ── 链路详细数据 v2 (流量分析重设计) ─────────────────────
const TRF_LINKS = [
  { id:'wan1',  name:'WAN-01',     label:'电信出口',  zone:'互联网大区', util:84, capacity:'1G',   status:'warn', aiNote:'预计 48h 后达 91%' },
  { id:'wan2',  name:'WAN-02',     label:'联通备用',  zone:'互联网大区', util:12, capacity:'1G',   status:'ok',   aiNote:null },
  { id:'core1', name:'SW-Core-01', label:'核心上行',  zone:'内网核心',   util:62, capacity:'100G', status:'ok',   aiNote:null },
  { id:'core2', name:'SW-Core-02', label:'核心上行',  zone:'内网核心',   util:89, capacity:'100G', status:'crit', aiNote:'热降频·有效带宽降至60%' },
  { id:'dcab',  name:'DC互联 A-B', label:'DC间互联',  zone:'骨干网',     util:44, capacity:'10G',  status:'ok',   aiNote:null },
  { id:'iscsi', name:'iSCSI-02',   label:'存储专网',  zone:'存储网络',   util:78, capacity:'10G',  status:'warn', aiNote:'错误率轻微上升' },
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
    { ip:'10.10.2.47',  name:'VM-Prod-047', bps:'8.4Gbps', proto:'DNS',      flag:'crit', note:'APT C2 威胁' },
    { ip:'10.10.1.50',  name:'BACKUP-SRV',  bps:'2.1Gbps', proto:'rsync',    flag:'warn', note:'窗口外备份' },
    { ip:'10.10.5.101', name:'APP-SRV-01',  bps:'1.8Gbps', proto:'HTTPS',    flag:null,   note:null },
    { ip:'10.10.5.102', name:'APP-SRV-02',  bps:'1.6Gbps', proto:'HTTPS',    flag:null,   note:null },
    { ip:'10.10.3.11',  name:'ERP-SRV-01',  bps:'0.9Gbps', proto:'HTTPS',    flag:null,   note:null },
  ],
  core: [
    { ip:'10.10.5.101', name:'APP-SRV-01',  bps:'4.2Gbps', proto:'TCP/8080', flag:'warn', note:'突发流量' },
    { ip:'10.10.5.102', name:'APP-SRV-02',  bps:'3.9Gbps', proto:'TCP/8080', flag:null,   note:null },
    { ip:'10.10.8.200', name:'DB-CRM-01',   bps:'2.8Gbps', proto:'MySQL',    flag:null,   note:null },
    { ip:'10.10.8.201', name:'DB-CRM-02',   bps:'2.6Gbps', proto:'MySQL',    flag:null,   note:null },
    { ip:'10.10.3.11',  name:'ERP-SRV-01',  bps:'1.9Gbps', proto:'TCP/443',  flag:null,   note:null },
    { ip:'10.10.3.12',  name:'ERP-SRV-02',  bps:'1.7Gbps', proto:'TCP/443',  flag:null,   note:null },
    { ip:'10.10.12.15', name:'MIS-SRV-01',  bps:'1.2Gbps', proto:'TCP/80',   flag:null,   note:null },
  ],
  dc: [
    { ip:'10.10.9.5',   name:'NFS-STOR-01', bps:'1.4Gbps', proto:'NFS/2049', flag:null,   note:null },
    { ip:'10.10.9.6',   name:'NFS-STOR-02', bps:'1.2Gbps', proto:'NFS/2049', flag:null,   note:null },
    { ip:'10.10.9.20',  name:'iSCSI-TGT-01',bps:'0.9Gbps', proto:'iSCSI',    flag:'warn', note:'延迟上升' },
    { ip:'10.10.2.10',  name:'VM-ESXi-01',  bps:'0.7Gbps', proto:'vMotion',  flag:null,   note:null },
    { ip:'10.10.2.11',  name:'VM-ESXi-02',  bps:'0.6Gbps', proto:'vMotion',  flag:null,   note:null },
  ],
};
const TRF_ANOMALIES_V2 = [
  { icon:'security',          sev:'crit', title:'VM-Prod-047 DNS 隧道外连',  desc:'420次/分 DNS 查询命中 APT C2 威胁情报，AI 置信度 93%',      time:'14:10', action:'已隔离', link:'WAN-01' },
  { icon:'upload',            sev:'warn', title:'BACKUP-SRV 异常大流量',      desc:'2.1Gbps rsync 占出口带宽 21%，与备份窗口不符，置信度 88%',  time:'09:03', action:'告警中', link:'WAN-01' },
  { icon:'device_thermostat', sev:'warn', title:'SW-Core-02 热降频流量异常',  desc:'CPU 热降频后转发能力降至 60%，下游设备级联受影响',          time:'14:03', action:'处置中', link:'SW-Core-02' },
];
const TRF_CAPACITY = [
  { link:'WAN-01 电信出口',   util:84, etaText:'预计 48h 后利用率达 91%',  risk:'high', advice:'建议开启 SD-WAN 调度，将部分流量迁移至 WAN-02 联通备用线路', action:'生成调度策略' },
  { link:'SW-Core-02 上行',   util:89, etaText:'热降频致有效带宽降至 60%', risk:'crit', advice:'优先检修 PAC-B06 精密空调，恢复核心交换机满血转发能力',    action:'创建工单' },
  { link:'iSCSI-02 存储专网', util:78, etaText:'预计 14 天后利用率达 85%', risk:'med',  advice:'存储 I/O 错误率轻微上升，建议检查 SFP 光模块及光纤链路质量',action:'查看详情' },
];

// ── 流量 Top10 主机 (旧，兼容保留) ──────────────────────
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

// ── 流量异常 (旧，兼容保留) ─────────────────────────────
const TRF_ANOMALIES = [
  {
    icon:'security', sev:'crit',
    title:'VM-Prod-047 DNS 隧道外连',
    desc:'420次/分 DNS 查询，目标 IP 命中 APT C2 威胁情报库，AI 置信度 93%',
    time:'14:10', action:'已隔离'
  },
  {
    icon:'upload', sev:'warn',
    title:'BACKUP-SRV → WAN 异常备份流量',
    desc:'2.1Gbps rsync 流量占出口带宽 21%，与备份策略窗口不符',
    time:'09:03', action:'告警中'
  },
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
//  拓扑数据 — 企业级真实网络架构
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
    { id:'dc1', label:'主数据中心 (DC-A)', status:'warn', rooms:4, devices:87 },
    { id:'dc2', label:'灾备中心 (DC-B)',   status:'ok',   rooms:2, devices:43 },
    { id:'dc3', label:'边缘节点 (PoP-C)', status:'ok',   rooms:1, devices:12 },
  ],
  links: [
    { from:'dc1', to:'dc2', type:'ok', label:'MPLS 100G 专线' },
    { from:'dc1', to:'dc3', type:'ok', label:'MPLS 10G'       },
    { from:'dc2', to:'dc3', type:'ok', label:'MPLS 10G'       },
  ]
};

// ── DC-A：主数据中心 完整企业级架构 ─────────────────────
const TOPO_DC1 = {
  title: '主数据中心 DC-A',
  layers: [
    { id:'l-wan',  label:'互联网出口 / WAN 接入',        yr:0.09 },
    { id:'l-ext',  label:'边界防火墙 / IPS',              yr:0.24 },
    { id:'l-dmz',  label:'DMZ 区 (WAF · SLB · 堡垒机)', yr:0.40 },
    { id:'l-core', label:'核心交换区 (VSS)',               yr:0.57 },
    { id:'l-agg',  label:'汇聚交换区',                    yr:0.73 },
    { id:'l-acc',  label:'接入交换区',                    yr:0.89 },
  ],
  nodes: [
    // 互联网出口 / WAN
    { id:'rt-ct',    layer:'l-wan',  label:'ISP-CT-01',   sub:'中国电信 1G×2',      type:'router',     status:'ok',   xr:0.11, alerts:0, cpu:22, ip:'100.1.1.1',  model:'Cisco ASR 1002X',  role:'互联网接入路由器' },
    { id:'rt-cu',    layer:'l-wan',  label:'ISP-CU-01',   sub:'中国联通 1G×2',      type:'router',     status:'ok',   xr:0.34, alerts:0, cpu:18, ip:'100.2.1.1',  model:'H3C MSR 5600',     role:'互联网接入路由器' },
    { id:'rt-mpls',  layer:'l-wan',  label:'MPLS-PE-01',  sub:'100G 专线主',         type:'router',     status:'ok',   xr:0.63, alerts:0, cpu:12, ip:'10.254.1.1', model:'Cisco ASR 9001',   role:'MPLS 专线路由器'  },
    { id:'rt-mpls2', layer:'l-wan',  label:'MPLS-PE-02',  sub:'100G 专线备',         type:'router',     status:'ok',   xr:0.85, alerts:0, cpu:8,  ip:'10.254.1.2', model:'Cisco ASR 9001',   role:'MPLS 专线路由器'  },
    // 边界防火墙 / IPS
    { id:'fw-ext1',  layer:'l-ext',  label:'NGFW-EXT-01', sub:'边界FW Active',       type:'firewall',   status:'ok',   xr:0.17, alerts:0, cpu:45, ip:'10.1.0.1',   model:'华为 USG6730E',    role:'下一代边界防火墙' },
    { id:'fw-ext2',  layer:'l-ext',  label:'NGFW-EXT-02', sub:'边界FW Standby ⚠',   type:'firewall',   status:'warn', xr:0.40, alerts:2, cpu:62, ip:'10.1.0.2',   model:'华为 USG6730E',    role:'下一代边界防火墙' },
    { id:'ips-01',   layer:'l-ext',  label:'IPS-01',      sub:'在线IPS 主用',        type:'ips',        status:'ok',   xr:0.63, alerts:0, cpu:38, ip:'10.1.0.10',  model:'深信服 IDPV-2000', role:'在线入侵防御系统' },
    { id:'ips-02',   layer:'l-ext',  label:'IPS-02',      sub:'在线IPS 热备',        type:'ips',        status:'ok',   xr:0.83, alerts:0, cpu:32, ip:'10.1.0.11',  model:'深信服 IDPV-2000', role:'在线入侵防御系统' },
    // DMZ 区
    { id:'waf-01',   layer:'l-dmz',  label:'WAF-01',      sub:'WAF 主用',            type:'waf',        status:'ok',   xr:0.10, alerts:0, cpu:32, ip:'10.2.0.1',   model:'绿盟 ADS-2100',    role:'Web 应用防火墙'   },
    { id:'waf-02',   layer:'l-dmz',  label:'WAF-02',      sub:'WAF 热备',            type:'waf',        status:'ok',   xr:0.26, alerts:0, cpu:28, ip:'10.2.0.2',   model:'绿盟 ADS-2100',    role:'Web 应用防火墙'   },
    { id:'slb-01',   layer:'l-dmz',  label:'SLB-01',      sub:'负载均衡 Active',     type:'slb',        status:'ok',   xr:0.46, alerts:0, cpu:55, ip:'10.2.0.10',  model:'F5 BIG-IP LTM',    role:'应用负载均衡器'   },
    { id:'slb-02',   layer:'l-dmz',  label:'SLB-02',      sub:'负载均衡 Standby',    type:'slb',        status:'ok',   xr:0.63, alerts:0, cpu:40, ip:'10.2.0.11',  model:'F5 BIG-IP LTM',    role:'应用负载均衡器'   },
    { id:'jump-01',  layer:'l-dmz',  label:'BASTION-01',  sub:'堡垒机/跳板机',       type:'bastion',    status:'ok',   xr:0.82, alerts:0, cpu:18, ip:'10.2.0.20',  model:'CyberArk PAS',     role:'统一堡垒机'       },
    // 核心交换区
    { id:'core-01',  layer:'l-core', label:'SW-CORE-01',  sub:'VSS Master',          type:'coreswitch', status:'ok',   xr:0.30, alerts:0, cpu:42, ip:'10.0.0.1',   model:'H3C S12500X-AF',   role:'核心交换机'       },
    { id:'core-02',  layer:'l-core', label:'SW-CORE-02',  sub:'VSS Slave ⚠',        type:'coreswitch', status:'crit', xr:0.63, alerts:3, cpu:89, ip:'10.0.0.2',   model:'H3C S12500X-AF',   role:'核心交换机'       },
    // 汇聚交换区
    { id:'agg-prd1', layer:'l-agg',  label:'AGG-PRD-01',  sub:'生产汇聚 主',         type:'aggswitch',  status:'ok',   xr:0.12, alerts:0, cpu:35, ip:'10.3.0.1',   model:'H3C S6800',        role:'生产区汇聚交换机' },
    { id:'agg-prd2', layer:'l-agg',  label:'AGG-PRD-02',  sub:'生产汇聚 备',         type:'aggswitch',  status:'ok',   xr:0.32, alerts:0, cpu:28, ip:'10.3.0.2',   model:'H3C S6800',        role:'生产区汇聚交换机' },
    { id:'agg-sto',  layer:'l-agg',  label:'AGG-STO-01',  sub:'存储网络汇聚',        type:'sanswitch',  status:'ok',   xr:0.57, alerts:0, cpu:22, ip:'10.3.0.10',  model:'Brocade 6510',     role:'SAN 存储汇聚'     },
    { id:'agg-oam',  layer:'l-agg',  label:'AGG-OAM-01',  sub:'带外管理汇聚',        type:'aggswitch',  status:'ok',   xr:0.79, alerts:0, cpu:15, ip:'10.3.0.20',  model:'H3C S5130',        role:'带外管理汇聚'     },
    // 接入交换区
    { id:'acc-01',   layer:'l-acc',  label:'ACC-PRD-01',  sub:'生产接入',            type:'accswitch',  status:'ok',   xr:0.07, alerts:0, cpu:20, ip:'10.4.0.1',   model:'H3C S5560',        role:'生产服务器接入'   },
    { id:'acc-02',   layer:'l-acc',  label:'ACC-PRD-02',  sub:'生产接入 ⚠',         type:'accswitch',  status:'warn', xr:0.23, alerts:1, cpu:25, ip:'10.4.0.2',   model:'H3C S5560',        role:'生产服务器接入'   },
    { id:'acc-03',   layer:'l-acc',  label:'ACC-PRD-03',  sub:'生产接入',            type:'accswitch',  status:'ok',   xr:0.40, alerts:0, cpu:18, ip:'10.4.0.3',   model:'H3C S5560',        role:'生产服务器接入'   },
    { id:'san-sw1',  layer:'l-acc',  label:'SAN-SW-01',   sub:'FC SAN 主',           type:'sanswitch',  status:'ok',   xr:0.58, alerts:0, cpu:30, ip:'10.4.1.1',   model:'Brocade 300',      role:'光纤通道存储网络' },
    { id:'san-sw2',  layer:'l-acc',  label:'SAN-SW-02',   sub:'FC SAN 备',           type:'sanswitch',  status:'ok',   xr:0.74, alerts:0, cpu:25, ip:'10.4.1.2',   model:'Brocade 300',      role:'光纤通道存储网络' },
    { id:'acc-oam',  layer:'l-acc',  label:'ACC-OAM-01',  sub:'管理接入',            type:'accswitch',  status:'ok',   xr:0.88, alerts:0, cpu:12, ip:'10.4.2.1',   model:'H3C S5130',        role:'带外管理接入'     },
  ],
  links: [
    // ISP路由器 → 边界防火墙
    { from:'rt-ct',    to:'fw-ext1',  type:'ok'                },
    { from:'rt-ct',    to:'fw-ext2',  type:'ok'                },
    { from:'rt-cu',    to:'fw-ext1',  type:'ok'                },
    { from:'rt-cu',    to:'fw-ext2',  type:'ok'                },
    // MPLS专线 → 核心交换（直连绕过FW）
    { from:'rt-mpls',  to:'core-01',  type:'ok',  label:'10G专线' },
    { from:'rt-mpls2', to:'core-02',  type:'ok',  label:'10G专线' },
    // 边界FW → IPS（串联）
    { from:'fw-ext1',  to:'ips-01',   type:'ok'                },
    { from:'fw-ext2',  to:'ips-02',   type:'warn'              },
    // IPS → DMZ（WAF/SLB）
    { from:'ips-01',   to:'waf-01',   type:'ok'                },
    { from:'ips-01',   to:'slb-01',   type:'ok'                },
    { from:'ips-02',   to:'waf-02',   type:'ok'                },
    { from:'ips-02',   to:'slb-02',   type:'ok'                },
    // 边界FW → 核心（内网流量通道）
    { from:'fw-ext1',  to:'core-01',  type:'ok',  label:'10G'  },
    { from:'fw-ext2',  to:'core-02',  type:'warn',label:'10G'  },
    // DMZ/堡垒机 → 核心
    { from:'waf-01',   to:'core-01',  type:'ok'                },
    { from:'waf-02',   to:'core-02',  type:'warn'              },
    { from:'slb-01',   to:'core-01',  type:'ok'                },
    { from:'slb-02',   to:'core-02',  type:'warn'              },
    { from:'jump-01',  to:'core-01',  type:'ok'                },
    // 核心 HA 互联
    { from:'core-01',  to:'core-02',  type:'crit',label:'VSS 40G' },
    // 核心 → 汇聚
    { from:'core-01',  to:'agg-prd1', type:'ok',  label:'40G'  },
    { from:'core-01',  to:'agg-prd2', type:'ok',  label:'40G'  },
    { from:'core-02',  to:'agg-prd1', type:'ok',  label:'40G'  },
    { from:'core-02',  to:'agg-prd2', type:'crit',label:'40G'  },
    { from:'core-01',  to:'agg-sto',  type:'ok',  label:'10G'  },
    { from:'core-01',  to:'agg-oam',  type:'ok',  label:'GE'   },
    // 汇聚 → 接入
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
      rootCause: '与 SW-CORE-02 同属热障碍事件 · 机柜温升使防火墙会话表压力达 78%，HA 心跳出现 120ms 抖动',
      confidence: 87,
      blastRadius: ['ips-02', 'waf-02', 'slb-02'],
      predictEta: null,
      actions: ['检查 NGFW-EXT-02 会话表使用率', '确认 HA 心跳与主备切换状态', '临时切换流量至主用 NGFW-EXT-01'],
      timeline: [
        { time: '13:48', text: 'NGFW-EXT-02 会话表使用率超 70% 首次告警', level: 'warn' },
        { time: '14:03', text: 'HA 心跳抖动至 120ms，超阈值 1.2×', level: 'warn' },
        { time: '14:06', text: '机柜温升关联事件上报，与 INC-2024-001 合并分析', level: 'info' },
        { time: '14:09', text: 'AI 置信度从 72% 更新至 87%（多源关联完成）', level: 'info' },
      ]
    },
    'core-02': {
      incidentId: 'INC-2024-001',
      rootCause: '精密空调 PAC-B06 故障停止制冷，机柜温升至 38.2°C，SW-CORE-02 触发 CPU 热降频 34%→89%，VSS 心跳延迟增大',
      confidence: 96,
      blastRadius: ['agg-prd1', 'agg-prd2', 'acc-01', 'acc-02', 'acc-03'],
      predictEta: '⚠ 若不处置，预计 1.5h 内触发设备保护性关机',
      actions: ['立即开启机柜应急送风', '将 VSS 主控切换至 SW-CORE-01', '通知工程师检修 PAC-B06'],
      timeline: [
        { time: '13:42', text: 'PAC-B06 压缩机故障报警，机房制冷停止', level: 'warn' },
        { time: '13:58', text: '机柜 B06 温度 36.1°C → 38.2°C，越限告警', level: 'crit' },
        { time: '14:03', text: 'SW-CORE-02 CPU 热降频触发，利用率骤升 34%→89%', level: 'crit' },
        { time: '14:05', text: 'VSS 心跳延迟 320ms（阈值 100ms），主备同步异常', level: 'warn' },
        { time: '14:08', text: 'AGG-PRD-02 下行转发丢包率上升至 0.3%', level: 'warn' },
        { time: '14:12', text: 'ACC-PRD-02 接口错误率级联扩散至 2.1%', level: 'warn' },
      ]
    },
    'acc-02': {
      incidentId: 'INC-2024-001',
      rootCause: 'SW-CORE-02 热降频后转发异常经汇聚层扩散，ACC-PRD-02 接口错误率上升至 2.1%，与 INC-2024-001 级联关联',
      confidence: 79,
      blastRadius: [],
      predictEta: null,
      actions: ['持续观察接口错误率', '此设备将随 SW-CORE-02 处置完成后自动恢复'],
      timeline: [
        { time: '14:08', text: '上行 AGG-PRD-01/02 出现异常转发，收到影响流量', level: 'warn' },
        { time: '14:12', text: 'ACC-PRD-02 下行接口 Err 帧计数快速上升', level: 'warn' },
        { time: '14:15', text: 'AI 确认为 INC-2024-001 三级级联影响，置信 79%', level: 'info' },
      ]
    }
  },
  correlations: [
    { from: 'fw-ext2', to: 'core-02', incidentId: 'INC-001', label: '同源事件', conf: 87 },
    { from: 'core-02', to: 'acc-02',  incidentId: 'INC-001', label: '故障扩散', conf: 79 }
  ],
  risks: [
    { nodeId: 'agg-prd1', reason: 'CPU 利用率持续 6h 上升趋势', eta: '~3h 后达告警阈值', conf: 72 }
  ]
};

const TOPO_AI_MAP = { dc1: TOPO_DC1_AI };

// ── 接入层展开数据（服务器 + 虚拟机）──────────────────────
// ── 接入层云区域展开数据（pNIC → vSwitch → vmk → segment → VM）──
const ACC_EXPAND_DATA = {
  'acc-01': {
    title: 'ACC-PRD-01 · 生产接入区',
    subtitle: '3台 ESXi主机 · 7 VM实例运行中',
    nodes: [
      { id:'p0', lbl:'vmnic0',      type:'pnic',    xr:0.32, yr:0.07 },
      { id:'p1', lbl:'vmnic1',      type:'pnic',    xr:0.68, yr:0.07 },
      { id:'u0', lbl:'uplink-0',    type:'vswitch', xr:0.22, yr:0.28 },
      { id:'u1', lbl:'uplink-1',    type:'vswitch', xr:0.62, yr:0.28 },
      { id:'k0', lbl:'vmk10', type:'vmk', tep:true, xr:0.10, yr:0.52 },
      { id:'k1', lbl:'vmk11', type:'vmk', tep:true, xr:0.31, yr:0.52 },
      { id:'k2', lbl:'vmk12', type:'vmk', tep:true, xr:0.52, yr:0.52 },
      { id:'k3', lbl:'vmk13', type:'vmk', tep:true, xr:0.73, yr:0.52 },
      { id:'sg', lbl:'segment1',    type:'segment', xr:0.48, yr:0.73 },
      { id:'m0', lbl:'hw_srv1_vm1', type:'vm', xr:0.14, yr:0.91 },
      { id:'m1', lbl:'hw_srv1_vm2', type:'vm', xr:0.37, yr:0.91 },
      { id:'m2', lbl:'hw_srv1_vm3', type:'vm', xr:0.62, yr:0.91 },
      { id:'m3', lbl:'hw_srv1_vm4', type:'vm', xr:0.86, yr:0.91 },
    ],
    links: [
      { s:'p0', t:'u0' }, { s:'p1', t:'u1' },
      { s:'u0', t:'k0' }, { s:'u0', t:'k1' },
      { s:'u1', t:'k2' }, { s:'u1', t:'k3' },
      { s:'k1', t:'sg' }, { s:'k2', t:'sg' },
      { s:'sg', t:'m0' }, { s:'sg', t:'m1' }, { s:'sg', t:'m2' }, { s:'sg', t:'m3' },
    ],
    tepGroup: ['k0','k1','k2','k3'], vdsLabel: 'hw_vds1',
  },
  'acc-02': {
    title: 'ACC-PRD-02 · 生产接入区',
    subtitle: '2台 ESXi主机 · 5 VM (⚠ 1告警)',
    nodes: [
      { id:'p0', lbl:'vmnic2',      type:'pnic',    xr:0.32, yr:0.07 },
      { id:'p1', lbl:'vmnic3',      type:'pnic',    xr:0.68, yr:0.07 },
      { id:'u0', lbl:'uplink-0',    type:'vswitch', xr:0.22, yr:0.28 },
      { id:'u1', lbl:'uplink-1',    type:'vswitch', xr:0.62, yr:0.28 },
      { id:'k0', lbl:'vmk20', type:'vmk', tep:true, xr:0.10, yr:0.52 },
      { id:'k1', lbl:'vmk21', type:'vmk', tep:true, xr:0.31, yr:0.52 },
      { id:'k2', lbl:'vmk22', type:'vmk', tep:true, xr:0.52, yr:0.52 },
      { id:'k3', lbl:'vmk23', type:'vmk', tep:true, xr:0.73, yr:0.52 },
      { id:'sg', lbl:'segment2',    type:'segment', xr:0.48, yr:0.73 },
      { id:'m0', lbl:'hw_srv2_vm1', type:'vm', status:'warn', xr:0.14, yr:0.91 },
      { id:'m1', lbl:'hw_srv2_vm2', type:'vm', xr:0.37, yr:0.91 },
      { id:'m2', lbl:'hw_srv2_vm3', type:'vm', xr:0.62, yr:0.91 },
      { id:'m3', lbl:'hw_srv2_vm4', type:'vm', xr:0.86, yr:0.91 },
    ],
    links: [
      { s:'p0', t:'u0' }, { s:'p1', t:'u1' },
      { s:'u0', t:'k0' }, { s:'u0', t:'k1' },
      { s:'u1', t:'k2' }, { s:'u1', t:'k3' },
      { s:'k1', t:'sg' }, { s:'k2', t:'sg' },
      { s:'sg', t:'m0' }, { s:'sg', t:'m1' }, { s:'sg', t:'m2' }, { s:'sg', t:'m3' },
    ],
    tepGroup: ['k0','k1','k2','k3'], vdsLabel: 'hw_vds2',
  },
  'acc-03': {
    title: 'ACC-PRD-03 · 生产接入区',
    subtitle: '3台 ESXi主机 · 6 VM实例运行中',
    nodes: [
      { id:'p0', lbl:'vmnic4',      type:'pnic',    xr:0.32, yr:0.07 },
      { id:'p1', lbl:'vmnic5',      type:'pnic',    xr:0.68, yr:0.07 },
      { id:'u0', lbl:'uplink-0',    type:'vswitch', xr:0.22, yr:0.28 },
      { id:'u1', lbl:'uplink-1',    type:'vswitch', xr:0.62, yr:0.28 },
      { id:'k0', lbl:'vmk30', type:'vmk', tep:true, xr:0.10, yr:0.52 },
      { id:'k1', lbl:'vmk31', type:'vmk', tep:true, xr:0.31, yr:0.52 },
      { id:'k2', lbl:'vmk32', type:'vmk', tep:true, xr:0.52, yr:0.52 },
      { id:'k3', lbl:'vmk33', type:'vmk', tep:true, xr:0.73, yr:0.52 },
      { id:'sg', lbl:'segment3',    type:'segment', xr:0.48, yr:0.73 },
      { id:'m0', lbl:'hw_srv3_vm1', type:'vm', xr:0.14, yr:0.91 },
      { id:'m1', lbl:'hw_srv3_vm2', type:'vm', xr:0.38, yr:0.91 },
      { id:'m2', lbl:'hw_srv3_vm3', type:'vm', xr:0.62, yr:0.91 },
      { id:'m3', lbl:'hw_srv3_vm4', type:'vm', xr:0.86, yr:0.91 },
    ],
    links: [
      { s:'p0', t:'u0' }, { s:'p1', t:'u1' },
      { s:'u0', t:'k0' }, { s:'u0', t:'k1' },
      { s:'u1', t:'k2' }, { s:'u1', t:'k3' },
      { s:'k1', t:'sg' }, { s:'k2', t:'sg' },
      { s:'sg', t:'m0' }, { s:'sg', t:'m1' }, { s:'sg', t:'m2' }, { s:'sg', t:'m3' },
    ],
    tepGroup: ['k0','k1','k2','k3'], vdsLabel: 'hw_vds3',
  },
  'acc-oam': {
    title: 'ACC-OAM-01 · 带外管理接入区',
    subtitle: '1台管理服务器 · 3 管理VM',
    nodes: [
      { id:'p0', lbl:'mgmt-nic0',  type:'pnic',    xr:0.50, yr:0.08 },
      { id:'u0', lbl:'mgmt-sw',    type:'vswitch', xr:0.50, yr:0.32 },
      { id:'sg', lbl:'mgmt-net',   type:'segment', xr:0.50, yr:0.60 },
      { id:'m0', lbl:'ntp-svc',    type:'vm', xr:0.20, yr:0.86 },
      { id:'m1', lbl:'syslog-srv', type:'vm', xr:0.50, yr:0.86 },
      { id:'m2', lbl:'nms-agent',  type:'vm', xr:0.80, yr:0.86 },
    ],
    links: [
      { s:'p0', t:'u0' }, { s:'u0', t:'sg' },
      { s:'sg', t:'m0' }, { s:'sg', t:'m1' }, { s:'sg', t:'m2' },
    ],
    tepGroup: [], vdsLabel: '',
  },
};

// ── 接入层云区域展开函数 ───────────────────────────────────
var accCloudCollapsed = false;
// 记录当前展开节点的图坐标和画布引用，供拖拽同步使用
var _accGX = 0, _accGY = 0, _accCanvasEl = null, _accGraphRef = null;

// ── AI 气泡（节点旁摘要锚点） ──────────────────────────────
var _aiBubbleGX = 0, _aiBubbleGY = 0, _aiBubbleCanvasEl = null, _aiBubbleGraphRef = null;

function _applyAIBubblePos() {
  var bubble = document.getElementById('aiNodeBubble');
  if (!bubble || bubble.classList.contains('anb-hidden')) return;
  if (!_aiBubbleGraphRef || !_aiBubbleCanvasEl) return;
  var pt   = _aiBubbleGraphRef.getCanvasByPoint(_aiBubbleGX, _aiBubbleGY);
  var rect = _aiBubbleCanvasEl.getBoundingClientRect();
  var vpX  = rect.left + pt.x;
  var vpY  = rect.top  + pt.y;
  bubble.style.left = Math.max(8, vpX - bubble.offsetWidth / 2) + 'px';
  bubble.style.top  = (vpY - bubble.offsetHeight - 16) + 'px';
}

function showAIBubble(nodeModel, ai, canvasEl, graphRef) {
  var bubble = document.getElementById('aiNodeBubble');
  if (!bubble) return;
  _aiBubbleGX = nodeModel.x; _aiBubbleGY = nodeModel.y;
  _aiBubbleCanvasEl = canvasEl; _aiBubbleGraphRef = graphRef;
  // 摘要文字：取根因前 32 字
  var summary = ai.rootCause.length > 32 ? ai.rootCause.slice(0, 32) + '…' : ai.rootCause;
  document.getElementById('anbConf').textContent   = ai.confidence + '% 置信';
  document.getElementById('anbSummary').textContent = summary;
  document.getElementById('anbNodeId').value = nodeModel.id;
  // 置信度颜色
  var confEl = document.getElementById('anbConf');
  confEl.style.background = ai.confidence >= 90 ? '#DC2626' : ai.confidence >= 75 ? '#D97706' : '#2563EB';
  bubble.classList.remove('anb-hidden');
  _applyAIBubblePos();
}

function closeAIBubble() {
  var bubble = document.getElementById('aiNodeBubble');
  if (bubble) bubble.classList.add('anb-hidden');
}

// ── AI 全量分析模态框 ──────────────────────────────────────
function showAIFullAnalysis(nodeId) {
  var modal = document.getElementById('aiAnalysisModal');
  if (!modal || !nodeId) return;
  var aiDataMap = TOPO_AI_MAP[topoSelectedDC];
  if (!aiDataMap) return;
  var ai = aiDataMap.nodeAnalysis[nodeId];
  if (!ai) return;
  var dcRef = topoSelectedDC === 'dc1' ? TOPO_DC1 : topoSelectedDC === 'dc2' ? TOPO_DC2 : TOPO_DC3;
  var nodeData = dcRef.nodes.find(function(n) { return n.id === nodeId; });
  var nodeLabel  = nodeData ? nodeData.label : nodeId;
  var nodeStatus = nodeData ? nodeData.status : 'ok';

  // ─ 头部
  var sevMap = { ok: ['正常','#16A34A'], warn: ['告警','#D97706'], crit: ['故障','#DC2626'] };
  var sevInfo = sevMap[nodeStatus] || sevMap.ok;
  var badge = document.getElementById('aiaIncBadge');
  badge.textContent = sevInfo[0]; badge.style.background = sevInfo[1];
  document.getElementById('aiaIncId').textContent    = ai.incidentId;
  document.getElementById('aiaNodeName').textContent = nodeLabel;
  var confColor = ai.confidence >= 90 ? '#DC2626' : ai.confidence >= 75 ? '#D97706' : '#2563EB';
  var confBadge = document.getElementById('aiaConfBadge');
  confBadge.textContent = ai.confidence + '% 置信度'; confBadge.style.background = confColor;

  // ─ 根因 + 置信度条
  document.getElementById('aiaRootCause').textContent  = ai.rootCause;
  var fillEl = document.getElementById('aiaConfBar');
  fillEl.style.width = '0'; fillEl.style.background = confColor;
  requestAnimationFrame(function() { fillEl.style.width = ai.confidence + '%'; });
  document.getElementById('aiaConfPct').textContent = ai.confidence + '%';
  document.getElementById('aiaConfPct').style.color  = confColor;

  // ─ 时间线
  var tlEl = document.getElementById('aiaTimeline');
  var levelDot = { crit:'#DC2626', warn:'#D97706', info:'#3B82F6' };
  var levelBg  = { crit:'#FEF2F2', warn:'#FFFBEB', info:'#EFF6FF' };
  if (ai.timeline && ai.timeline.length) {
    tlEl.innerHTML = ai.timeline.map(function(ev, i) {
      var dot = levelDot[ev.level] || '#94A3B8';
      var bg  = levelBg[ev.level]  || '#F9FAFB';
      var isLast = i === ai.timeline.length - 1;
      return '<div class="aia-tl-row">' +
        '<div class="aia-tl-left">' +
          '<div class="aia-tl-dot" style="background:' + dot + ';box-shadow:0 0 0 3px ' + dot + '33"></div>' +
          (isLast ? '' : '<div class="aia-tl-line"></div>') +
        '</div>' +
        '<div class="aia-tl-content" style="background:' + bg + '">' +
          '<span class="aia-tl-time">' + ev.time + '</span>' +
          '<span class="aia-tl-text">' + ev.text + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  } else {
    tlEl.innerHTML = '<div style="font-size:11px;color:#94A3B8;padding:6px 0">暂无时间线数据</div>';
  }

  // ─ 影响范围
  var blastEl = document.getElementById('aiaBlast');
  var cMap2   = { ok:'#16A34A', warn:'#D97706', crit:'#DC2626' };
  var sLab2   = { ok:'正常', warn:'告警', crit:'故障' };
  if (ai.blastRadius && ai.blastRadius.length) {
    blastEl.innerHTML = ai.blastRadius.map(function(id) {
      var nd  = dcRef.nodes.find(function(n) { return n.id === id; });
      var lbl = nd ? nd.label : id;
      var st  = nd ? nd.status : 'ok';
      return '<div class="aia-blast-row">' +
        '<span class="aia-blast-dot" style="background:' + (cMap2[st]||'#94A3B8') + '"></span>' +
        '<span class="aia-blast-lbl">' + lbl + '</span>' +
        '<span class="aia-blast-st" style="color:' + (cMap2[st]||'#94A3B8') + '">' + (sLab2[st]||'') + '</span>' +
      '</div>';
    }).join('');
  } else {
    blastEl.innerHTML = '<div style="font-size:11px;color:#94A3B8;padding:4px 0">无下游受影响设备</div>';
  }

  // ─ 风险预测
  var riskWrap = document.getElementById('aiaRiskWrap');
  if (ai.predictEta) {
    document.getElementById('aiaRiskEta').textContent = ai.predictEta;
    riskWrap.style.display = '';
  } else {
    riskWrap.style.display = 'none';
  }

  // ─ 建议操作（可勾选）
  document.getElementById('aiaActions').innerHTML = ai.actions.map(function(a, i) {
    return '<div class="aia-action-row">' +
      '<input type="checkbox" class="aia-chk" id="aiachk_' + i + '">' +
      '<label for="aiachk_' + i + '" class="aia-action-lbl">' + a + '</label>' +
    '</div>';
  }).join('');

  modal.classList.remove('aia-hidden');
}

function closeAIFullAnalysis() {
  var modal = document.getElementById('aiAnalysisModal');
  if (modal) modal.classList.add('aia-hidden');
}

function focusAIInPanel() {
  // 滚动右侧面板 AI 区块到可见位置，并给它加一个闪烁高亮
  var aiSec = document.querySelector('#tdpContent .tdp-ai-section');
  if (aiSec) {
    aiSec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    aiSec.classList.remove('tdp-ai-flash');
    void aiSec.offsetWidth; // reflow
    aiSec.classList.add('tdp-ai-flash');
  }
}

function locateTopoNode(nodeId) {
  if (!topoG6Graph) return;
  topoG6Graph.getNodes().forEach(function(n) { topoG6Graph.clearItemStates(n, ['highlight']); });
  var item = topoG6Graph.findById(nodeId);
  if (item) topoG6Graph.setItemState(item, 'highlight', true);
}

function _applyAccPanelPos() {
  var panel = document.getElementById('accCloudPanel');
  if (!panel || panel.classList.contains('hidden')) return;
  if (!_accGraphRef || !_accCanvasEl) return;
  var pt   = _accGraphRef.getCanvasByPoint(_accGX, _accGY);
  var rect = _accCanvasEl.getBoundingClientRect();
  var vpX  = rect.left + pt.x;
  var vpY  = rect.top  + pt.y;
  var pw   = 360;
  var left = Math.max(8, Math.min(vpX - pw / 2, window.innerWidth - pw - 8));
  var top  = vpY + 32;
  var maxTop = window.innerHeight - 110;
  if (top > maxTop) top = maxTop;
  if (top < 8) top = 8;
  panel.style.left = left + 'px';
  panel.style.top  = top  + 'px';
}

function showAccExpand(node, gx, gy, canvasEl, graphRef) {
  var panel = document.getElementById('accCloudPanel');
  if (!panel) return;
  var data = ACC_EXPAND_DATA[node.id];
  if (!data) { closeAccExpand(); return; }
  accCloudCollapsed = false;
  _accGX = gx; _accGY = gy; _accCanvasEl = canvasEl; _accGraphRef = graphRef;
  var body = document.getElementById('acpBody');
  if (body) body.style.display = '';
  var icon = document.getElementById('acpToggleIcon');
  if (icon) icon.textContent = '-';
  document.getElementById('acpTitle').textContent = data.title;
  document.getElementById('acpSubtitle').textContent = data.subtitle;
  renderAccCloudTopo(data);
  panel.classList.remove('hidden');
  _applyAccPanelPos();
}

function renderAccCloudTopo(data) {
  var container = document.getElementById('acpTopoContainer');
  if (!container) return;
  var TW = 340, TH = 252;
  // 计算像素坐标
  var pixPos = {};
  data.nodes.forEach(function(nd) {
    pixPos[nd.id] = { x: Math.round(nd.xr * TW), y: Math.round(nd.yr * TH) };
  });
  // SVG 连线
  var lines = data.links.map(function(lk) {
    var s = pixPos[lk.s], t = pixPos[lk.t];
    if (!s || !t) return '';
    return '<line x1="' + s.x + '" y1="' + s.y + '" x2="' + t.x + '" y2="' + t.y +
      '" stroke="#94A3B8" stroke-width="1.3"/>';
  }).join('');
  // TEP 组高亮框
  var tepHtml = '';
  if (data.tepGroup && data.tepGroup.length > 0) {
    var tg = data.tepGroup.map(function(id) { return pixPos[id]; }).filter(Boolean);
    if (tg.length) {
      var bx = Math.min.apply(null, tg.map(function(p) { return p.x; })) - 22;
      var by = Math.min.apply(null, tg.map(function(p) { return p.y; })) - 18;
      var br = Math.max.apply(null, tg.map(function(p) { return p.x; })) + 22;
      var bb = Math.max.apply(null, tg.map(function(p) { return p.y; })) + 18;
      tepHtml = '<div class="acp-tep-zone" style="left:' + bx + 'px;top:' + by +
        'px;width:' + (br - bx) + 'px;height:' + (bb - by) + 'px"></div>';
    }
  }
  // VDS 标签（segment 节点下方）
  var vdsHtml = '';
  if (data.vdsLabel) {
    var segNd = data.nodes.find(function(n) { return n.type === 'segment'; });
    if (segNd) {
      var sp = pixPos[segNd.id];
      vdsHtml = '<div class="acp-vds-lbl" style="left:' + sp.x + 'px;top:' + (sp.y + 22) + 'px">' + data.vdsLabel + '</div>';
    }
  }
  // 节点 HTML
  var nodeHtml = data.nodes.map(function(nd) {
    var p = pixPos[nd.id];
    var cls = 'acp-nd acp-nd-' + nd.type + (nd.status === 'warn' ? ' acp-nd-warn' : '');
    return '<div class="' + cls + '" style="left:' + p.x + 'px;top:' + p.y + 'px">' +
      buildAccNodeInner(nd) + '</div>';
  }).join('');
  container.innerHTML =
    '<svg class="acp-svg" width="' + TW + '" height="' + TH + '">' + lines + '</svg>' +
    tepHtml + vdsHtml + nodeHtml;
}

function buildAccNodeInner(nd) {
  var lbl = '<div class="acn-lbl">' + nd.lbl + '</div>';
  if (nd.type === 'pnic') {
    return '<div class="acn-pnic"><div class="acn-pnic-bays"><div class="acn-bay"></div><div class="acn-bay"></div></div><div class="acn-pnic-ports"></div></div>' + lbl;
  }
  if (nd.type === 'vswitch') {
    return '<div class="acn-sw"><div class="acn-sw-pts"></div></div>' + lbl;
  }
  if (nd.type === 'vmk') {
    var tep = nd.tep ? '<div class="acn-tep">TEP</div>' : '';
    return '<div class="acn-vmk">' + tep + '<div class="acn-vmk-name">' + nd.lbl + '</div></div>';
  }
  if (nd.type === 'segment') {
    return '<div class="acn-seg"><div class="acn-seg-dot"></div><div class="acn-seg-txt">' + nd.lbl + '</div></div>';
  }
  if (nd.type === 'vm') {
    return '<div class="acn-vm"><div class="acn-vm-scr"></div><div class="acn-vm-base"></div></div>' + lbl;
  }
  return lbl;
}

function toggleAccCloud() {
  accCloudCollapsed = !accCloudCollapsed;
  var body = document.getElementById('acpBody');
  var icon = document.getElementById('acpToggleIcon');
  if (body) body.style.display = accCloudCollapsed ? 'none' : '';
  if (icon) icon.textContent = accCloudCollapsed ? '+' : '-';
}

function closeAccExpand() {
  var panel = document.getElementById('accCloudPanel');
  if (panel) panel.classList.add('hidden');
}
const TOPO_DC2 = {
  title: '灾备中心 DC-B',
  layers: [
    { id:'l-wan',  label:'WAN / 专线接入',     yr:0.10 },
    { id:'l-ext',  label:'边界防护层 (FW+IPS)', yr:0.27 },
    { id:'l-dmz',  label:'DMZ 服务区',          yr:0.45 },
    { id:'l-core', label:'核心交换区',           yr:0.62 },
    { id:'l-agg',  label:'汇聚 / 存储网络',     yr:0.79 },
    { id:'l-acc',  label:'接入交换区',           yr:0.92 },
  ],
  nodes: [
    { id:'b-rt1',   layer:'l-wan',  label:'MPLS-PE-B01', sub:'100G 专线主',      type:'router',     status:'ok', xr:0.25, alerts:0, cpu:14, ip:'10.254.2.1', model:'Cisco ASR 9001',  role:'MPLS 专线路由器'  },
    { id:'b-rt2',   layer:'l-wan',  label:'ISP-B01',     sub:'电信 1G 备用',     type:'router',     status:'ok', xr:0.65, alerts:0, cpu:8,  ip:'100.3.1.1',  model:'华为 AR6280',     role:'互联网备用接入'   },
    { id:'b-fw1',   layer:'l-ext',  label:'FW-B01',      sub:'边界FW Active',    type:'firewall',   status:'ok', xr:0.22, alerts:0, cpu:38, ip:'10.11.0.1',  model:'华为 USG6550E',  role:'边界防火墙'       },
    { id:'b-fw2',   layer:'l-ext',  label:'FW-B02',      sub:'边界FW Standby',   type:'firewall',   status:'ok', xr:0.48, alerts:0, cpu:25, ip:'10.11.0.2',  model:'华为 USG6550E',  role:'边界防火墙'       },
    { id:'b-ips',   layer:'l-ext',  label:'IPS-B01',     sub:'在线IPS',          type:'ips',        status:'ok', xr:0.75, alerts:0, cpu:22, ip:'10.11.0.10', model:'深信服 IDPV',     role:'入侵防御系统'     },
    { id:'b-waf',   layer:'l-dmz',  label:'WAF-B01',     sub:'Web应用防护',      type:'waf',        status:'ok', xr:0.22, alerts:0, cpu:22, ip:'10.12.0.1',  model:'绿盟 ADS-1000',  role:'Web 应用防火墙'   },
    { id:'b-slb',   layer:'l-dmz',  label:'SLB-B01',     sub:'负载均衡',         type:'slb',        status:'ok', xr:0.50, alerts:0, cpu:35, ip:'10.12.0.10', model:'深信服 AD-1000',  role:'应用负载均衡器'   },
    { id:'b-jh',    layer:'l-dmz',  label:'BASTION-B01', sub:'堡垒机',           type:'bastion',    status:'ok', xr:0.77, alerts:0, cpu:12, ip:'10.12.0.20', model:'CyberArk PAS',    role:'统一堡垒机'       },
    { id:'b-core1', layer:'l-core', label:'SW-CORE-B01', sub:'核心交换 Active',  type:'coreswitch', status:'ok', xr:0.28, alerts:0, cpu:32, ip:'10.10.0.1',  model:'H3C S10508X',     role:'核心交换机'       },
    { id:'b-core2', layer:'l-core', label:'SW-CORE-B02', sub:'核心交换 Standby', type:'coreswitch', status:'ok', xr:0.62, alerts:0, cpu:28, ip:'10.10.0.2',  model:'H3C S10508X',     role:'核心交换机'       },
    { id:'b-agg1',  layer:'l-agg',  label:'AGG-B01',     sub:'汇聚主',           type:'aggswitch',  status:'ok', xr:0.18, alerts:0, cpu:25, ip:'10.13.0.1',  model:'H3C S6520',       role:'汇聚交换机'       },
    { id:'b-agg2',  layer:'l-agg',  label:'AGG-B02',     sub:'汇聚备',           type:'aggswitch',  status:'ok', xr:0.44, alerts:0, cpu:20, ip:'10.13.0.2',  model:'H3C S6520',       role:'汇聚交换机'       },
    { id:'b-san',   layer:'l-agg',  label:'SAN-B01',     sub:'FC SAN',           type:'sanswitch',  status:'ok', xr:0.72, alerts:0, cpu:18, ip:'10.13.1.1',  model:'Brocade 300',     role:'FC SAN 存储网络'  },
    { id:'b-acc1',  layer:'l-acc',  label:'ACC-B01',     sub:'接入-1',           type:'accswitch',  status:'ok', xr:0.18, alerts:0, cpu:18, ip:'10.14.0.1',  model:'H3C S5130',       role:'服务器接入'       },
    { id:'b-acc2',  layer:'l-acc',  label:'ACC-B02',     sub:'接入-2',           type:'accswitch',  status:'ok', xr:0.44, alerts:0, cpu:15, ip:'10.14.0.2',  model:'H3C S5130',       role:'服务器接入'       },
    { id:'b-acc3',  layer:'l-acc',  label:'ACC-B03',     sub:'接入-3',           type:'accswitch',  status:'ok', xr:0.68, alerts:0, cpu:12, ip:'10.14.0.3',  model:'H3C S5130',       role:'服务器接入'       },
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

// ── DC-C：边缘节点 PoP-C ─────────────────────────────────
const TOPO_DC3 = {
  title: '边缘节点 PoP-C',
  layers: [
    { id:'l-wan',  label:'接入链路 (双线双路)',   yr:0.14 },
    { id:'l-fw',   label:'安全防护层 (FW + WAF)', yr:0.38 },
    { id:'l-core', label:'核心交换层',            yr:0.62 },
    { id:'l-svc',  label:'边缘服务节点',          yr:0.84 },
  ],
  nodes: [
    { id:'c-rt1',  layer:'l-wan',  label:'CE-RT-01',  sub:'中国电信 主用',  type:'router',     status:'ok', xr:0.25, alerts:0, cpu:22, ip:'10.200.1.1',  model:'华为 NE40E-X3A',  role:'客户边缘路由器' },
    { id:'c-rt2',  layer:'l-wan',  label:'CE-RT-02',  sub:'中国联通 备用',  type:'router',     status:'ok', xr:0.65, alerts:0, cpu:18, ip:'10.200.1.2',  model:'华为 NE40E-X3A',  role:'客户边缘路由器' },
    { id:'c-fw',   layer:'l-fw',   label:'FW-C01',    sub:'边界防火墙',     type:'firewall',   status:'ok', xr:0.28, alerts:0, cpu:30, ip:'10.201.0.1',  model:'华为 USG6350E',   role:'边界防火墙'     },
    { id:'c-waf',  layer:'l-fw',   label:'WAF-C01',   sub:'Web应用防护',    type:'waf',        status:'ok', xr:0.62, alerts:0, cpu:25, ip:'10.201.0.5',  model:'绿盟 ADS-500',    role:'Web 应用防火墙' },
    { id:'c-core', layer:'l-core', label:'SW-C01',    sub:'核心交换',       type:'coreswitch', status:'ok', xr:0.45, alerts:0, cpu:28, ip:'10.202.0.1',  model:'H3C S6520',       role:'核心交换机'     },
    { id:'c-cdn',  layer:'l-svc',  label:'CDN-NODE',  sub:'内容分发加速',   type:'slb',        status:'ok', xr:0.18, alerts:0, cpu:65, ip:'10.203.0.1',  model:'网宿 CDN',         role:'CDN 边缘节点'   },
    { id:'c-dns',  layer:'l-svc',  label:'DNS-01',    sub:'递归 DNS',       type:'bastion',    status:'ok', xr:0.45, alerts:0, cpu:35, ip:'10.203.0.5',  model:'BIND 9',           role:'递归 DNS 服务器'},
    { id:'c-cache',layer:'l-svc',  label:'CACHE-01',  sub:'HTTP 反向代理',  type:'slb',        status:'ok', xr:0.72, alerts:0, cpu:48, ip:'10.203.0.10', model:'Nginx/Varnish',    role:'HTTP 缓存加速'  },
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
  { pri:'紧急', cls:'sug-crit', action:'WAN-01 出口带宽扩容至 2G', detail:'季度末高峰 48h 内达阈值，预计费用 ¥3.2万/月，建议今日提交申请', impact:'消除出口瓶颈风险' },
  { pri:'本月', cls:'sug-warn', action:'SW-Core-02 热降频根治', detail:'空调维保后 CPU 恢复正常，建议同步检查 SW-Core-02 散热模块', impact:'恢复转发能力 100%' },
  { pri:'本季', cls:'sug-info', action:'核心层 100G 链路聚合', detail:'现有 2×40G 升级为 2×100G Link-Agg，提升东西向承载能力 2.5倍', impact:'+150% 内部带宽' },
];
const CAP_PORTS = [
  { zone:'出口区',   total:32,  used:24, pct:75 },
  { zone:'核心层',   total:384, used:260, pct:68 },
  { zone:'汇聚层',   total:192, used:150, pct:78 },
  { zone:'接入层',   total:576, used:394, pct:68 },
];


// ── G6 设备图标绘制函数（2.5D 等轴测实物风格）──────────
var TOPO_ICON_DRAW = (function() {
  // 每种设备类型的三面颜色：[顶面, 正面, 右侧面]
  var C = {
    router:     ['#93C5FD', '#3B82F6', '#1D4ED8'],
    firewall:   ['#FCA5A5', '#EF4444', '#B91C1C'],
    waf:        ['#C4B5FD', '#8B5CF6', '#5B21B6'],
    slb:        ['#93C5FD', '#2563EB', '#1E40AF'],
    ips:        ['#FDE68A', '#D97706', '#92400E'],
    coreswitch: ['#6EE7B7', '#059669', '#064E3B'],
    aggswitch:  ['#A7F3D0', '#10B981', '#065F46'],
    accswitch:  ['#D1D5DB', '#9CA3AF', '#4B5563'],
    sanswitch:  ['#FCD34D', '#F59E0B', '#78350F'],
    bastion:    ['#DDD6FE', '#7C3AED', '#4C1D95'],
  };

  // 绘制等轴测 3D 机箱底座 + 前面板细节
  // (cx, cy) = 前面板视觉中心在 G6 局部坐标系中的位置
  function drawBox(g, cx, cy, c, detailFn) {
    var W = 38, H = 15, dX = 10, dY = 7;
    // 等轴测视角修正：使整个3D箱体视觉中心落在(cx,cy)
    var fx = cx - W/2 - dX/2;   // 前面板左上角 x
    var fy = cy - H/2 + dY/2;   // 前面板左上角 y
    // 机箱阴影（底部偏移增加立体感）
    g.addShape('path', {
      attrs: { path: [['M',fx+2,fy+H+1],['L',fx+W+2,fy+H+1],['L',fx+W+dX+1,fy+H-dY+1],['L',fx+dX,fy+H],['Z']],
        fill: 'rgba(0,0,0,0.10)' }, name: 'shadow' });
    // 顶面（最浅）
    g.addShape('path', {
      attrs: { path: [['M',fx,fy],['L',fx+dX,fy-dY],['L',fx+W+dX,fy-dY],['L',fx+W,fy],['Z']],
        fill: c[0], stroke: 'rgba(0,0,0,0.10)', lineWidth: 0.5 }, name: 'top' });
    // 正面（中等）
    g.addShape('rect', {
      attrs: { x: fx, y: fy, width: W, height: H,
        fill: c[1], stroke: 'rgba(0,0,0,0.08)', lineWidth: 0.5 }, name: 'front' });
    // 右侧面（最深）
    g.addShape('path', {
      attrs: { path: [['M',fx+W,fy],['L',fx+W+dX,fy-dY],['L',fx+W+dX,fy-dY+H],['L',fx+W,fy+H],['Z']],
        fill: c[2], stroke: 'rgba(0,0,0,0.10)', lineWidth: 0.5 }, name: 'side' });
    // 正面顶部品牌条（高光）
    g.addShape('rect', {
      attrs: { x: fx, y: fy, width: W, height: 3, fill: 'rgba(255,255,255,0.18)' }, name: 'brand' });
    // 电源 LED（绿色指示灯）
    g.addShape('circle', { attrs: { cx: fx+3.5, cy: fy+4, r: 2, fill: '#34D399', opacity: 0.95 }, name: 'led' });
    // 端口排（底部）
    g.addShape('rect', { attrs: { x: fx+7, y: fy+H-6, width: W-12, height: 4.5, rx: 0.8,
      fill: 'rgba(0,0,0,0.28)' }, name: 'portbar' });
    for (var i = 0; i < 6; i++) {
      var px = fx + 8 + i * ((W-14)/5.2);
      g.addShape('rect', { attrs: { x: px, y: fy+H-5.5, width: 3, height: 3, rx: 0.5,
        fill: i < 4 ? 'rgba(147,197,253,0.85)' : 'rgba(52,211,153,0.85)' }, name: 'p'+i });
    }
    // 设备类型专属图形
    if (detailFn) detailFn(g, fx, fy, W, H);
  }

  // 各类型专属前面板图案
  function rtDetail(g, fx, fy, W, H) {
    var cx = fx+W/2+2, cy = fy+4.5;
    g.addShape('path', { attrs: { path: [['M',cx-9,cy],['L',cx+3,cy],['L',cx,cy-2.5],['M',cx+3,cy],['L',cx,cy+2.5]],
      stroke:'rgba(255,255,255,0.9)', lineWidth:1.6, fill:'none' }, name:'arr1' });
    g.addShape('path', { attrs: { path: [['M',cx+9,cy+3.5],['L',cx-3,cy+3.5],['L',cx,cy+1],['M',cx-3,cy+3.5],['L',cx,cy+6]],
      stroke:'rgba(255,255,255,0.9)', lineWidth:1.6, fill:'none' }, name:'arr2' });
  }
  function fwDetail(g, fx, fy, W, H) {
    var cx = fx+W/2+2, cy = fy+2;
    g.addShape('path', { attrs: { path: [['M',cx,cy],['L',cx+7,cy+3],['L',cx+7,cy+7],['Q',cx+7,cy+H-2,cx,cy+H],['Q',cx-7,cy+H-2,cx-7,cy+7],['L',cx-7,cy+3],['Z']],
      fill:'rgba(255,255,255,0.15)', stroke:'rgba(255,255,255,0.75)', lineWidth:1.3 }, name:'shield' });
    g.addShape('line', { attrs: { x1:cx-3,y1:cy+6.5,x2:cx+3,y2:cy+6.5, stroke:'rgba(255,255,255,0.8)', lineWidth:1.5, lineDash:[2,1.5] }, name:'fl1' });
    g.addShape('line', { attrs: { x1:cx-3,y1:cy+9.5,x2:cx+3,y2:cy+9.5, stroke:'rgba(255,255,255,0.8)', lineWidth:1.5, lineDash:[2,1.5] }, name:'fl2' });
  }
  function wafDetail(g, fx, fy, W, H) {
    var cx = fx+W/2+2, cy = fy+2;
    g.addShape('path', { attrs: { path: [['M',cx,cy],['L',cx+7,cy+3],['L',cx+7,cy+7],['Q',cx+7,cy+H-2,cx,cy+H],['Q',cx-7,cy+H-2,cx-7,cy+7],['L',cx-7,cy+3],['Z']],
      fill:'rgba(255,255,255,0.15)', stroke:'rgba(255,255,255,0.75)', lineWidth:1.3 }, name:'shield' });
    g.addShape('text', { attrs: { x:cx, y:cy+H/2+1, text:'W', fontSize:8, fill:'white', fontWeight:900,
      textAlign:'center', textBaseline:'middle' }, name:'wt' });
  }
  function slbDetail(g, fx, fy, W, H) {
    var cx = fx+W/2+2, cy = fy+5;
    g.addShape('circle', { attrs: { cx:cx, cy:cy-1, r:2.2, fill:'rgba(255,255,255,0.9)' }, name:'n0' });
    [[-6,6],[0,6],[6,6]].forEach(function(d,i) {
      g.addShape('line', { attrs: { x1:cx,y1:cy+1.2,x2:cx+d[0],y2:cy+d[1], stroke:'rgba(255,255,255,0.75)', lineWidth:1.3 }, name:'sl'+i });
      g.addShape('circle', { attrs: { cx:cx+d[0],cy:cy+d[1]+1,r:1.6, fill:'rgba(255,255,255,0.75)' }, name:'sn'+i });
    });
  }
  function ipsDetail(g, fx, fy, W, H) {
    var cx = fx+W/2+2, cy = fy+H/2;
    [6.5,4,2].forEach(function(r,i) {
      g.addShape('circle', { attrs: { cx:cx,cy:cy,r:r, fill:'none', stroke:'rgba(255,255,255,0.75)', lineWidth:0.8+i*0.3 }, name:'ring'+i });
    });
    g.addShape('circle', { attrs: { cx:cx,cy:cy,r:1.1, fill:'white' }, name:'rdot' });
    g.addShape('line', { attrs: { x1:cx+5.5,y1:cy-5.5,x2:cx+8,y2:cy-8, stroke:'rgba(255,255,255,0.8)', lineWidth:1.5 }, name:'rl' });
  }
  function cswDetail(g, fx, fy, W, H) {
    for (var r = 0; r < 2; r++) {
      for (var col = 0; col < 10; col++) {
        g.addShape('rect', { attrs: { x:fx+3+col*3.6, y:fy+2.5+r*4.5, width:2.8, height:3.2, rx:0.5,
          fill: (r===0&&col<6) ? 'rgba(52,211,153,0.9)' : 'rgba(255,255,255,0.3)' }, name:'cp'+r+'_'+col });
      }
    }
  }
  function sanDetail(g, fx, fy, W, H) {
    var cx = fx+W/2+2, cy = fy+H/2;
    g.addShape('path', { attrs: { path:[['M',cx,cy-7],['L',cx+7,cy],['L',cx,cy+6],['L',cx-7,cy],['Z']],
      fill:'rgba(255,255,255,0.2)', stroke:'rgba(255,255,255,0.85)', lineWidth:1.4 }, name:'dia' });
    g.addShape('circle', { attrs: { cx:cx,cy:cy,r:2, fill:'rgba(255,255,255,0.9)' }, name:'dc' });
    [[0,-7],[7,0],[0,6],[-7,0]].forEach(function(d,i) {
      g.addShape('circle', { attrs: { cx:cx+d[0],cy:cy+d[1],r:1.2, fill:'rgba(255,255,255,0.8)' }, name:'sc'+i });
    });
  }
  function bastionDetail(g, fx, fy, W, H) {
    var cx = fx+W/2+2, cy = fy+4;
    g.addShape('rect', { attrs: { x:cx-5,y:cy+1,width:10,height:8,rx:1.5,
      fill:'rgba(255,255,255,0.18)', stroke:'rgba(255,255,255,0.8)', lineWidth:1.4 }, name:'lb' });
    g.addShape('path', { attrs: { path:[['M',cx-3.5,cy+1],['L',cx-3.5,cy-3],['A',3.5,3.5,0,0,1,cx+3.5,cy-3],['L',cx+3.5,cy+1]],
      fill:'none', stroke:'rgba(255,255,255,0.8)', lineWidth:1.4 }, name:'la' });
    g.addShape('circle', { attrs: { cx:cx,cy:cy+5,r:1.5, fill:'rgba(255,255,255,0.85)' }, name:'lk' });
  }

  return {
    router:     function(g,cx,cy) { drawBox(g,cx,cy,C.router,    rtDetail);      },
    firewall:   function(g,cx,cy) { drawBox(g,cx,cy,C.firewall,  fwDetail);      },
    waf:        function(g,cx,cy) { drawBox(g,cx,cy,C.waf,       wafDetail);     },
    slb:        function(g,cx,cy) { drawBox(g,cx,cy,C.slb,       slbDetail);     },
    ips:        function(g,cx,cy) { drawBox(g,cx,cy,C.ips,       ipsDetail);     },
    coreswitch: function(g,cx,cy) { drawBox(g,cx,cy,C.coreswitch,cswDetail);     },
    aggswitch:  function(g,cx,cy) { drawBox(g,cx,cy,C.aggswitch, null);          },
    accswitch:  function(g,cx,cy) { drawBox(g,cx,cy,C.accswitch, null);          },
    sanswitch:  function(g,cx,cy) { drawBox(g,cx,cy,C.sanswitch, sanDetail);     },
    bastion:    function(g,cx,cy) { drawBox(g,cx,cy,C.bastion,   bastionDetail); },
  };
})();

// ── G6 自定义节点注册 ───────────────────────────────────
(function registerG6Nodes() {
  if (typeof G6 === 'undefined') return;
  G6.registerNode('topo-dev', {
    draw: function(cfg, group) {
      var cMap = { ok: '#16A34A', warn: '#D97706', crit: '#DC2626' };
      var sc = cMap[cfg.status] || '#6B7280';
      // 节点边界框（透明，用于碰撞检测和锚点计算）
      var BW = 58, BH = 46;
      var shape = group.addShape('rect', {
        attrs: { x: -BW/2, y: -BH/2, width: BW, height: BH, fill: 'transparent', opacity: 0 },
        name: 'main-box', draggable: true
      });
      // 等轴测 3D 机箱图标（视觉中心在 cy=-11）
      var icFn = TOPO_ICON_DRAW[cfg.devType] || TOPO_ICON_DRAW.accswitch;
      icFn(group, 0, -11);
      // 设备名称标签（使用 nodeLabel 字段，避免 G6 内置 label 双重渲染）
      var rawLabel = cfg.nodeLabel || cfg.label || '';
      var nm = rawLabel.length > 11 ? rawLabel.slice(0, 11) : rawLabel;
      group.addShape('text', {
        attrs: { x: 0, y: 9, text: nm, fontSize: 9.5, fill: '#111827', fontWeight: 700,
          textAlign: 'center', textBaseline: 'middle' },
        name: 'label-text'
      });
      // IP 地址副文本
      if (cfg.ip) {
        group.addShape('text', {
          attrs: { x: 0, y: 20, text: cfg.ip, fontSize: 7, fill: '#6B7280',
            textAlign: 'center', textBaseline: 'middle' },
          name: 'sub-text'
        });
      }
      // 告警角标（机箱右上角）
      if (cfg.status !== 'ok') {
        group.addShape('circle', {
          attrs: { cx: 22, cy: -21, r: 7, fill: sc, stroke: 'white', lineWidth: 1.5 },
          name: 'status-dot'
        });
        if (cfg.alerts > 0) {
          group.addShape('text', {
            attrs: { x: 22, y: -21, text: String(cfg.alerts), fontSize: 6.5,
              fill: 'white', fontWeight: 700, textAlign: 'center', textBaseline: 'middle' },
            name: 'alert-badge'
          });
        }
      }
      return shape;
    },
    setState: function(name, value, item) {
      var group = item.getContainer();
      var shapes = group.get('children');
      if (name === 'dimmed') {
        shapes.forEach(function(s) { s.attr('opacity', value ? 0.12 : 1); });
      }
      if (name === 'highlight') {
        var front = group.find(function(el) { return el.get('name') === 'front'; });
        if (front) { front.attr('lineWidth', value ? 2.5 : 0.5); front.attr('stroke', value ? '#2563EB' : 'rgba(0,0,0,0.08)'); }
        var top = group.find(function(el) { return el.get('name') === 'top'; });
        if (top) { top.attr('lineWidth', value ? 2 : 0.5); top.attr('stroke', value ? '#3B82F6' : 'rgba(0,0,0,0.10)'); }
      }
    },
    getAnchorPoints: function() { return [[0.5, 0], [0.5, 1], [0, 0.5], [1, 0.5]]; }
  }, 'rect');

  G6.registerNode('topo-site', {
    draw: function(cfg, group) {
      // ── 蓝图科技风配色（深色描边 + 浅色玻璃填充，适配浅色画布）──
      var palette = {
        ok:   { neon: '#0891B2', neonSoft: 'rgba(8,145,178,',   glassTop: 'rgba(125,211,252,', glassL: 'rgba(56,189,248,',  glassR: 'rgba(14,116,144,',  grid: 'rgba(8,145,178,' },
        warn: { neon: '#D97706', neonSoft: 'rgba(217,119,6,',   glassTop: 'rgba(252,211,77,', glassL: 'rgba(251,191,36,', glassR: 'rgba(180,83,9,',   grid: 'rgba(217,119,6,' },
        crit: { neon: '#DB2777', neonSoft: 'rgba(219,39,119,',  glassTop: 'rgba(244,114,182,',glassL: 'rgba(236,72,153,', glassR: 'rgba(157,23,77,',  grid: 'rgba(219,39,119,' }
      };
      var status = cfg.alertCount > 2 ? 'crit' : cfg.alertCount > 0 ? 'warn' : 'ok';
      var p = palette[status];
      var stColor = p.neon;

      // ── 三段式现代楼宇尺寸（podium + tower + crown，等距投影）──
      var Wp = 44, Dp = 22, Hp = 14;     // 裙楼：宽矮
      var Wt = 32, Dt = 16, Ht = 44;     // 主塔：高瘦
      var Wc = 22, Dc = 11, Hc = 9;      // 顶冠：最窄
      var S = (typeof cfg.nodeScale === 'number') ? cfg.nodeScale : 1;
      Wp*=S; Dp*=S; Hp*=S; Wt*=S; Dt*=S; Ht*=S; Wc*=S; Dc*=S; Hc*=S;
      var yPodTop   = -Hp;
      var yTowerTop = -Hp - Ht;
      var yCrownTop = -Hp - Ht - Hc;
      var H = Hp + Ht + Hc;              // 总高度（用于碰撞框等）
      var W = Wp;                        // 最大宽度（裙楼）
      var D = Dp;                        // 最大深度（裙楼）

      // 工具：根据宽 / 深 / 起止 y 生成各立面与顶面的 4 个角点
      function faces(w, d, y0, y1) {
        return {
          bl: [-w, y0], br: [w, y0], bf: [0, y0 + d], bb: [0, y0 - d],
          tl: [-w, y1], tr: [w, y1], tf: [0, y1 + d], tb: [0, y1 - d]
        };
      }
      var pod   = faces(Wp, Dp, 0,        yPodTop);
      var tower = faces(Wt, Dt, yPodTop,  yTowerTop);
      var crown = faces(Wc, Dc, yTowerTop, yCrownTop);

      // === 1. 全息地面光圈（多层叠加营造发光底盘）===
      group.addShape('ellipse', {
        attrs: { x: 0, y: 6, rx: Wp + 14, ry: Dp + 8,
          fill: p.neonSoft + '0.08)', opacity: 0.9 },
        name: 'ground-halo-outer'
      });
      group.addShape('ellipse', {
        attrs: { x: 0, y: 4, rx: Wp + 6, ry: Dp + 4,
          fill: p.neonSoft + '0.18)', opacity: 1,
          shadowColor: stColor, shadowBlur: 10 },
        name: 'ground-halo'
      });
      var gridPts = [[-Wp - 4, 0], [0, -Dp - 2], [Wp + 4, 0], [0, Dp + 2]];
      group.addShape('polygon', {
        attrs: { points: gridPts, fill: 'rgba(255,255,255,0.7)',
          stroke: p.neonSoft + '0.7)', lineWidth: 1.2 },
        name: 'ground-plate'
      });
      group.addShape('path', {
        attrs: { path: 'M ' + (-Wp - 4) + ' 0 L ' + (Wp + 4) + ' 0 M 0 ' + (-Dp - 2) + ' L 0 ' + (Dp + 2),
          stroke: p.neonSoft + '0.4)', lineWidth: 0.6 },
        name: 'ground-cross'
      });

      // === 2. 主碰撞框（视觉透明，但保留极弱填充确保 SVG 捕获鼠标事件）===
      // 注意：SVG 渲染器下 fill 完全透明 (alpha=0) 会让 pointer-events:visiblePainted 失效，
      // 导致 node:mouseenter / mouseleave 在节点之间切换时不触发。这里用 alpha=0.01 解决。
      var keyShape = group.addShape('rect', {
        attrs: { x: -(Wp + 6), y: yCrownTop - 14, width: 2 * (Wp + 6),
          height: H + 14 + Dp + 10,
          fill: 'rgba(255,255,255,0.01)', stroke: 'none', lineWidth: 0 },
        name: 'main-box', draggable: true
      });

      // ── 通用绘制：一段楼体（右立面 + 左立面 + 顶面 + 楼层光带）──
      function drawTier(F, levels, name, opts) {
        opts = opts || {};
        var rightFill = opts.rightFill || (p.glassR + '0.32)');
        var leftFill  = opts.leftFill  || (p.glassL + '0.28)');
        var topFill   = opts.topFill   || (p.glassTop + '0.42)');
        var topShadow = opts.topShadow !== false;
        // 右立面（最暗）
        group.addShape('polygon', {
          attrs: { points: [F.bf, F.br, F.tr, F.tf],
            fill: rightFill, stroke: p.neon, lineWidth: 1.1, opacity: 0.95 },
          name: name + '-face-right'
        });
        // 左立面（中亮）
        group.addShape('polygon', {
          attrs: { points: [F.bl, F.bf, F.tf, F.tl],
            fill: leftFill, stroke: p.neon, lineWidth: 1.3, opacity: 0.92 },
          name: name + '-face-left'
        });
        // 楼层光带（每层一根贯穿左→前→右的折线，模拟楼板灯带）
        for (var lv = 1; lv < levels; lv++) {
          var fy = lv / levels;
          // 左立面：从左角沿楼高内插
          var L1x = F.bl[0] + (F.tl[0] - F.bl[0]) * fy;
          var L1y = F.bl[1] + (F.tl[1] - F.bl[1]) * fy;
          var L2x = F.bf[0] + (F.tf[0] - F.bf[0]) * fy;
          var L2y = F.bf[1] + (F.tf[1] - F.bf[1]) * fy;
          var L3x = F.br[0] + (F.tr[0] - F.br[0]) * fy;
          var L3y = F.br[1] + (F.tr[1] - F.br[1]) * fy;
          group.addShape('path', {
            attrs: { path: 'M ' + L1x + ' ' + L1y + ' L ' + L2x + ' ' + L2y + ' L ' + L3x + ' ' + L3y,
              stroke: p.grid + '0.7)', lineWidth: 0.7,
              shadowColor: stColor, shadowBlur: 2 },
            name: name + '-floor-' + lv
          });
        }
        // 顶面（最亮，玻璃发光顶板）
        var topAttrs = { points: [F.tl, F.tb, F.tr, F.tf],
          fill: topFill, stroke: p.neon, lineWidth: 1.4, opacity: 0.96 };
        if (topShadow) { topAttrs.shadowColor = stColor; topAttrs.shadowBlur = 6; }
        group.addShape('polygon', { attrs: topAttrs, name: name + '-face-top' });
        // 顶面镜面三角反光
        group.addShape('polygon', {
          attrs: { points: [F.tl, F.tb, [0, F.tb[1] + (F.tf[1] - F.tb[1]) / 2]],
            fill: 'rgba(255,255,255,0.45)' },
          name: name + '-face-top-shine'
        });
      }

      // === 3. 裙楼 podium（2 层楼层光带）===
      drawTier(pod, 2, 'pod');
      // 裙楼正立面入口（中部一道半高玻璃门效果）
      var doorW = 8*S, doorH = 8*S;
      group.addShape('polygon', {
        attrs: { points: [[-doorW, Dp - doorW * Dp / Wp], [doorW, Dp - doorW * Dp / Wp],
          [doorW, Dp - doorH - doorW * Dp / Wp], [-doorW, Dp - doorH - doorW * Dp / Wp]],
          fill: p.neonSoft + '0.35)', stroke: p.neon, lineWidth: 0.8,
          shadowColor: stColor, shadowBlur: 4 },
        name: 'pod-entrance'
      });

      // === 4. 主塔 tower（8 层楼层光带）===
      // 塔基与裙楼顶之间的退台阴影（增强体积感）
      group.addShape('polygon', {
        attrs: { points: [tower.bl, tower.bf, tower.br,
          [Wt + 2, yPodTop + 1], [0, yPodTop + Dt + 1], [-Wt - 2, yPodTop + 1]],
          fill: 'rgba(0,0,0,0.10)' },
        name: 'tower-base-shadow'
      });
      drawTier(tower, 8, 'tower', {
        rightFill: p.glassR + '0.30)',
        leftFill:  p.glassL + '0.26)',
        topFill:   p.glassTop + '0.40)'
      });
      // 主塔正立面竖向能量柱（左右对称两根，模拟现代幕墙竖梃）
      var spineGap = Wt * 0.55;
      [-spineGap, spineGap].forEach(function(sx, idx) {
        // 投影到等距：x_iso = sx, y_iso 沿楼高从 0 到 -Ht，但在前面 (y+D) 平面
        var startX = sx * (Dt - Dt) / Dt + sx;
        group.addShape('path', {
          attrs: { path: 'M ' + sx + ' ' + (yPodTop + Dt) + ' L ' + sx + ' ' + (yTowerTop + Dt + 2),
            stroke: stColor, lineWidth: 1, opacity: 0.7,
            shadowColor: stColor, shadowBlur: 5 },
          name: 'tower-spine-' + idx
        });
      });

      // === 5. 顶冠 crown（最窄一段）===
      drawTier(crown, 2, 'crown', {
        rightFill: p.glassR + '0.40)',
        leftFill:  p.glassL + '0.36)',
        topFill:   p.glassTop + '0.55)'
      });

      // === 6. 屋顶设备阵列（架在主塔顶 / 顶冠两侧）===
      // 设备小立方：位置以等距投影定位（在 yTowerTop 平面上，环绕 crown）
      var equipSpots = [
        { ex: -Wt + 5, ez: -Dt + 4, w: 5, d: 3, h: 4 },   // 左前空调机组
        { ex: -Wt + 5, ez:  Dt - 6, w: 5, d: 3, h: 5 },   // 左后冷却塔
        { ex:  Wt - 9, ez: -Dt + 4, w: 4, d: 3, h: 6 },   // 右前烟囱
        { ex:  Wt - 9, ez:  Dt - 6, w: 5, d: 3, h: 4 }    // 右后机柜
      ];
      equipSpots.forEach(function(e, i) {
        // 等距投影：(ex, ez) → 屏幕 (ex, yTowerTop + ez * Dt/Wt)
        // 简化：在 yTowerTop 平面上，screenY = yTowerTop + ez * (Dt/Wt) — 但因为顶面已是菱形，等价于线性
        var by = yTowerTop + (e.ez / Wt) * Dt;
        var bx = e.ex;
        var topY = by - e.h;
        // 设备右立面
        group.addShape('polygon', {
          attrs: { points: [[bx, by + e.d * Dt / Wt], [bx + e.w, by + (e.w - e.d) * Dt / Wt],
            [bx + e.w, topY + (e.w - e.d) * Dt / Wt], [bx, topY + e.d * Dt / Wt]],
            fill: 'rgba(30,41,59,0.55)', stroke: p.neon, lineWidth: 0.6 },
          name: 'eq-r-' + i
        });
        // 设备左立面
        group.addShape('polygon', {
          attrs: { points: [[bx - e.w, by + (e.w - e.d) * Dt / Wt], [bx, by + e.d * Dt / Wt],
            [bx, topY + e.d * Dt / Wt], [bx - e.w, topY + (e.w - e.d) * Dt / Wt]],
            fill: 'rgba(71,85,105,0.55)', stroke: p.neon, lineWidth: 0.7 },
          name: 'eq-l-' + i
        });
        // 设备顶
        group.addShape('polygon', {
          attrs: { points: [[-e.w + bx, topY + (e.w - e.d) * Dt / Wt], [bx, topY - e.d * Dt / Wt],
            [bx + e.w, topY + (e.w - e.d) * Dt / Wt], [bx, topY + e.d * Dt / Wt]],
            fill: p.neonSoft + '0.6)', stroke: p.neon, lineWidth: 0.7,
            shadowColor: stColor, shadowBlur: 3 },
          name: 'eq-t-' + i
        });
      });

      // === 7. 屋顶天线 + 信号灯（霓虹光晕）===
      var beaconY = yCrownTop - 8*S;
      // 天线杆
      group.addShape('rect', {
        attrs: { x: -0.5, y: beaconY, width: Math.max(1, S), height: 8*S, fill: stColor, opacity: 0.8,
          shadowColor: stColor, shadowBlur: 4 },
        name: 'beacon-pole'
      });
      // 信号灯光晕（外）
      group.addShape('circle', {
        attrs: { x: 0, y: beaconY, r: Math.max(6, 14*S), fill: p.neonSoft + '0.10)' },
        name: 'beacon-glow-outer'
      });
      group.addShape('circle', {
        attrs: { x: 0, y: beaconY, r: Math.max(4, 8*S), fill: p.neonSoft + '0.28)' },
        name: 'beacon-glow'
      });
      group.addShape('circle', {
        attrs: { x: 0, y: beaconY, r: Math.max(2.5, 3.5*S), fill: stColor,
          shadowColor: stColor, shadowBlur: 14 },
        name: 'beacon'
      });

      // === 8. DC ID 标签（贴在顶冠顶面）===
      var idLabel = cfg.dcId === 'dc1' ? 'DC-A' : cfg.dcId === 'dc2' ? 'DC-B' : 'PoP-C';
      group.addShape('text', {
        attrs: { x: 0, y: yCrownTop + 4, text: idLabel,
          fontSize: 10, fill: '#FFFFFF', fontWeight: 800,
          textAlign: 'center', textBaseline: 'middle',
          shadowColor: stColor, shadowBlur: 6 },
        name: 'id-label'
      });

      // === 9. 底部信息卡（白玻璃 HUD）===
      var infoY = Dp + 16;
      group.addShape('rect', {
        attrs: { x: -Wp - 4, y: infoY - 10, width: 2 * (Wp + 4), height: 32,
          radius: 4, fill: 'rgba(255,255,255,0.95)',
          stroke: p.neonSoft + '0.85)', lineWidth: 1.2,
          shadowColor: stColor, shadowBlur: 8 },
        name: 'info-card'
      });
      // HUD 角装饰（科技感切角）
      var cn = 5;
      var ix0 = -Wp - 4, ix1 = Wp + 4, iy0 = infoY - 10, iy1 = infoY + 22;
      group.addShape('path', {
        attrs: { path: 'M ' + ix0 + ' ' + (iy0 + cn) + ' L ' + ix0 + ' ' + iy0 + ' L ' + (ix0 + cn) + ' ' + iy0
          + ' M ' + ix1 + ' ' + (iy0 + cn) + ' L ' + ix1 + ' ' + iy0 + ' L ' + (ix1 - cn) + ' ' + iy0
          + ' M ' + ix0 + ' ' + (iy1 - cn) + ' L ' + ix0 + ' ' + iy1 + ' L ' + (ix0 + cn) + ' ' + iy1
          + ' M ' + ix1 + ' ' + (iy1 - cn) + ' L ' + ix1 + ' ' + iy1 + ' L ' + (ix1 - cn) + ' ' + iy1,
          stroke: stColor, lineWidth: 1.4 },
        name: 'info-corners'
      });
      var sn = (cfg.label || '').replace(/\s*\(.*\)/, '');
      group.addShape('text', {
        attrs: { x: 0, y: infoY - 1, text: sn,
          fontSize: 9.5, fill: '#1E293B', fontWeight: 700,
          textAlign: 'center', textBaseline: 'middle' },
        name: 'site-name'
      });
      group.addShape('text', {
        attrs: { x: 0, y: infoY + 12,
          text: (cfg.devices || 0) + ' \u8bbe\u5907  \u00b7  '
            + (cfg.alertCount > 0 ? '\u26a0 ' + cfg.alertCount + ' \u544a\u8b66' : '\u2713 \u5065\u5eb7'),
          fontSize: 8.5, fill: stColor, fontWeight: 700,
          textAlign: 'center', textBaseline: 'middle' },
        name: 'site-meta'
      });

      // === 10. 告警角标（主塔顶右上）===
      if (cfg.alertCount > 0) {
        group.addShape('circle', {
          attrs: { x: Wt - 2, y: yTowerTop + 4, r: 9, fill: '#DC2626',
            stroke: 'white', lineWidth: 2,
            shadowColor: 'rgba(220,38,38,0.55)', shadowBlur: 8 },
          name: 'alert-ring'
        });
        group.addShape('text', {
          attrs: { x: Wt - 2, y: yTowerTop + 4, text: String(cfg.alertCount),
            fontSize: 9, fill: 'white', fontWeight: 800,
            textAlign: 'center', textBaseline: 'middle' },
          name: 'alert-count'
        });
      }
      // === 11. 信号灯呼吸动画 ===
      try {
        var beaconAnim = group.find(function(el) { return el.get('name') === 'beacon-glow-outer'; });
        if (beaconAnim && beaconAnim.animate) {
          beaconAnim.animate(function(ratio) {
            return { r: 10 + 6 * Math.sin(ratio * Math.PI), opacity: 0.08 + 0.18 * (1 - Math.sin(ratio * Math.PI)) };
          }, { duration: status === 'crit' ? 900 : 1800, repeat: true, easing: 'easeQuadInOut' });
        }
        var glowMid = group.find(function(el) { return el.get('name') === 'beacon-glow'; });
        if (glowMid && glowMid.animate) {
          glowMid.animate(function(ratio) {
            return { r: 5 + 3 * Math.sin(ratio * Math.PI), opacity: 0.25 + 0.25 * Math.sin(ratio * Math.PI) };
          }, { duration: status === 'crit' ? 900 : 1800, repeat: true, easing: 'easeQuadInOut' });
        }
      } catch (e) { /* G6 SVG 渲染可能不支持，忽略 */ }
      return keyShape;
    },
    setState: function(name, value, item) {
      var group = item.getContainer();
      var cfg = item.getModel();
      if (name === 'dimmed') {
        group.get('children').forEach(function(s) { s.attr('opacity', value ? 0.18 : 1); });
      }
      if (name === 'hover') {
        // 高亮三段楼体的描边（podium / tower / crown）
        var tiers = ['pod', 'tower', 'crown'];
        var faceSuffix = ['-face-top', '-face-left', '-face-right'];
        tiers.forEach(function(t) {
          faceSuffix.forEach(function(sfx) {
            var sh = group.find(function(el) { return el.get('name') === t + sfx; });
            if (sh) sh.attr('lineWidth', value ? 1.8 : (sfx === '-face-top' ? 1.4 : (sfx === '-face-left' ? 1.3 : 1.1)));
          });
        });
        var glow = group.find(function(el) { return el.get('name') === 'beacon-glow'; });
        if (glow) glow.attr('opacity', value ? 0.55 : 0.28);
        var glowOuter = group.find(function(el) { return el.get('name') === 'beacon-glow-outer'; });
        if (glowOuter) glowOuter.attr('opacity', value ? 0.35 : 1);
        var info = group.find(function(el) { return el.get('name') === 'info-card'; });
        if (info) info.attr({ shadowBlur: value ? 14 : 8, shadowOffsetY: value ? 4 : 2 });
        var halo = group.find(function(el) { return el.get('name') === 'ground-halo'; });
        if (halo) halo.attr({ shadowBlur: value ? 18 : 10 });
        var beaconHov = group.find(function(el) { return el.get('name') === 'beacon'; });
        if (beaconHov) beaconHov.attr({ r: value ? 4.5 : 3.5, shadowBlur: value ? 22 : 14 });
      }
    },
    getAnchorPoints: function() { return [[0.5, 0.18], [0.5, 0.82], [0, 0.5], [1, 0.5]]; }
  }, 'rect');
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
  document.querySelectorAll('.osn-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
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
  const active = FAULT_EVENTS.filter(f => f.status !== '已关闭');
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
        <span class="ofl-status ofl-${s.status}">${s.status === 'ok' ? '●' : '▲'}</span>
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
  // 与"网络拓扑→全网总览"保持一致：Internet/MPLS 骨干 + 3 个数据中心
  // 状态由 TOPO_GLOBAL.sites + 各 DC 节点告警情况自动派生，避免静态硬编码。
  const dcMap = { dc1: TOPO_DC1, dc2: TOPO_DC2, dc3: TOPO_DC3 };
  const sites = (typeof TOPO_GLOBAL !== 'undefined') ? TOPO_GLOBAL.sites : [];
  // 派生每个 DC 的状态（与全图相同口径）
  function deriveStatus(s) {
    const dc = dcMap[s.id];
    if (!dc) return s.status || 'ok';
    const crit = dc.nodes.filter(n => n.status === 'crit').length;
    const warn = dc.nodes.filter(n => n.status === 'warn').length;
    return crit > 0 ? 'crit' : warn > 0 ? 'warn' : 'ok';
  }
  // 简化布局：Internet 左上、MPLS 居中、3 个 DC 横排靠下
  const dcPos = { dc1: { x: 280, y: 165 }, dc2: { x: 130, y: 165 }, dc3: { x: 210, y: 75 } };
  const inet  = { x: 360, y: 50 };
  const mpls  = { x: 210, y: 130 };
  const colorMap = { ok: '#1A7F37', warn: '#D09B00', crit: '#CF222E' };
  let html = '';
  // 链路：Internet→DC-A、MPLS→各 DC、DC↔DC（来自 TOPO_GLOBAL.links）
  function line(a, b, status, dashed) {
    const dash = dashed ? '5 3' : 'none';
    return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${colorMap[status]}" stroke-width="1.6" stroke-dasharray="${dash}" opacity="0.8"/>`;
  }
  html += line(inet, dcPos.dc1, 'warn', true);
  html += line(mpls, dcPos.dc1, 'ok', true);
  html += line(mpls, dcPos.dc2, 'ok', true);
  html += line(mpls, dcPos.dc3, 'ok', true);
  ((typeof TOPO_GLOBAL !== 'undefined') ? TOPO_GLOBAL.links : []).forEach(l => {
    const a = dcPos[l.from], b = dcPos[l.to];
    if (a && b) html += line(a, b, l.type || 'ok', true);
  });
  // 云节点：Internet
  html += `<ellipse cx="${inet.x}" cy="${inet.y}" rx="40" ry="14" fill="#fff" stroke="#0EA5E9" stroke-width="1.2" stroke-dasharray="4 2"/>`;
  html += `<text x="${inet.x}" y="${inet.y + 3}" text-anchor="middle" font-size="9" font-weight="700" fill="#0369A1">Internet</text>`;
  // MPLS 骨干
  html += `<ellipse cx="${mpls.x}" cy="${mpls.y}" rx="46" ry="13" fill="#fff" stroke="#0891B2" stroke-width="1.2" stroke-dasharray="4 2"/>`;
  html += `<text x="${mpls.x}" y="${mpls.y + 3}" text-anchor="middle" font-size="9" font-weight="700" fill="#0E7490">MPLS 骨干</text>`;
  // 3 个 DC：建筑图标（梯形+矩形）+ 状态色
  sites.forEach(s => {
    const pos = dcPos[s.id];
    if (!pos) return;
    const st = deriveStatus(s);
    const c = colorMap[st];
    // 简化的"楼"：底盘 + 主体
    html += `<rect x="${pos.x - 14}" y="${pos.y - 4}" width="28" height="18" rx="2" fill="${c}" opacity="0.85"/>`;
    html += `<rect x="${pos.x - 9}" y="${pos.y - 14}" width="18" height="12" rx="2" fill="${c}" opacity="0.95"/>`;
    html += `<rect x="${pos.x - 5}" y="${pos.y - 20}" width="10" height="8" rx="1.5" fill="${c}" opacity="1"/>`;
    // 状态角标
    if (st !== 'ok') {
      html += `<circle cx="${pos.x + 13}" cy="${pos.y - 18}" r="4" fill="${c}" stroke="#fff" stroke-width="1.2"/>`;
    }
    // 标签
    const short = s.id.toUpperCase().replace('DC', 'DC-').replace('DC-1', 'DC-A').replace('DC-2', 'DC-B').replace('DC-3', 'PoP-C');
    html += `<text x="${pos.x}" y="${pos.y + 28}" text-anchor="middle" font-size="9" font-weight="700" fill="#1F2328">${short}</text>`;
    html += `<text x="${pos.x}" y="${pos.y + 38}" text-anchor="middle" font-size="8" fill="#636C76">${s.devices}台 · ${st === 'ok' ? '健康' : st === 'warn' ? '预警' : '严重'}</text>`;
  });
  svg.setAttribute('viewBox', '0 0 420 220');
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
  _topoMode = 'live';
  renderTopoTree();
  renderTopoGlobal();
  renderTopoBreadcrumb();
  renderTopoAlertPanel();
  initTopoModeBar();
  initTopoSearch();
}

// ══════════════════════════════════════════════════════════
// 拓扑增强 — Task 1: 分析模式工具栏 + 设备搜索
// ══════════════════════════════════════════════════════════
var _topoMode = 'live'; // live | path | changes

function initTopoModeBar() {
  const btns = document.querySelectorAll('#topoModeBar .tmb-btn');
  btns.forEach(btn => {
    btn.onclick = function() {
      _topoMode = this.dataset.mode;
      btns.forEach(b => b.classList.toggle('tmb-active', b.dataset.mode === _topoMode));
      // Task 2 / Task 3 的模式切换在后续任务中实现
    };
  });
  // 确保 live 按钮默认激活
  btns.forEach(b => b.classList.toggle('tmb-active', b.dataset.mode === 'live'));
}

// ── 设备搜索 ──────────────────────────────────────────────

// 图标映射
const _tmb_ICON = { core: 'hub', access: 'router', dist: 'account_tree',
  firewall: 'security', lb: 'balance', server: 'dns', default: 'devices' };

function _tmbNodeIcon(role) {
  const r = (role || '').toLowerCase();
  if (r.includes('core')) return _tmb_ICON.core;
  if (r.includes('access')) return _tmb_ICON.access;
  if (r.includes('dist')) return _tmb_ICON.dist;
  if (r.includes('firewall') || r.includes('防火墙')) return _tmb_ICON.firewall;
  if (r.includes('lb') || r.includes('负载')) return _tmb_ICON.lb;
  if (r.includes('server') || r.includes('服务器')) return _tmb_ICON.server;
  return _tmb_ICON.default;
}

function initTopoSearch() {
  const input = document.getElementById('topoSearchInput');
  const dropdown = document.getElementById('topoSearchDropdown');
  const clearBtn = document.getElementById('topoSearchClear');
  if (!input || !dropdown) return;

  function doSearch(q) {
    q = q.trim().toLowerCase();
    clearBtn && clearBtn.classList.toggle('hidden', !q);
    if (!q) { dropdown.classList.add('hidden'); return; }

    // 跨所有 DC 检索
    const dcList = [
      { id: 'dc1', data: TOPO_DC1 },
      { id: 'dc2', data: TOPO_DC2 },
      { id: 'dc3', data: TOPO_DC3 }
    ];
    const hits = [];
    dcList.forEach(dc => {
      if (!dc.data || !dc.data.nodes) return;
      dc.data.nodes.forEach(n => {
        const label = (n.label || '').toLowerCase();
        const ip    = (n.ip    || '').toLowerCase();
        const role  = (n.role  || '').toLowerCase();
        if (label.includes(q) || ip.includes(q) || role.includes(q)) {
          hits.push({ dcId: dc.id, dcTitle: dc.data.title || dc.id, node: n });
        }
      });
    });

    if (!hits.length) {
      dropdown.innerHTML = '<div class="tsd-empty">无匹配设备</div>';
      dropdown.classList.remove('hidden');
      return;
    }

    const statusLabel = { ok: '正常', warn: '告警', crit: '故障' };
    const iconMap = { ok: 'tsd-icon-ok', warn: 'tsd-icon-warn', crit: 'tsd-icon-crit' };
    const statusCls = { ok: 'tsd-status-ok', warn: 'tsd-status-warn', crit: 'tsd-status-crit' };

    dropdown.innerHTML = hits.slice(0, 14).map(item => {
      const n = item.node;
      const st = n.status || 'ok';
      const icon = _tmbNodeIcon(n.role);
      const alertBadge = n.alerts > 0
        ? `<span class="tsd-status ${statusCls[st]}">${n.alerts} 告警</span>`
        : `<span class="tsd-status ${statusCls.ok}">${statusLabel[st]}</span>`;
      return `<div class="tsd-item" data-dc="${item.dcId}" data-nodeid="${n.id}">
        <div class="tsd-icon ${iconMap[st]}">
          <span class="material-symbols-rounded" style="font-size:14px">${icon}</span>
        </div>
        <div class="tsd-body">
          <div class="tsd-name">${n.label}</div>
          <div class="tsd-meta">${n.ip} &nbsp;·&nbsp; ${n.role} &nbsp;·&nbsp; ${item.dcTitle}</div>
        </div>
        ${alertBadge}
      </div>`;
    }).join('');

    dropdown.querySelectorAll('.tsd-item[data-nodeid]').forEach(el => {
      el.addEventListener('click', function() {
        const dcId   = this.dataset.dc;
        const nodeId = this.dataset.nodeid;
        dropdown.classList.add('hidden');
        input.value = '';
        clearBtn && clearBtn.classList.add('hidden');
        topoSearchNavigateTo(dcId, nodeId);
      });
    });
    dropdown.classList.remove('hidden');
  }

  input.addEventListener('input', function() { doSearch(this.value); });
  clearBtn && clearBtn.addEventListener('click', function() {
    input.value = '';
    dropdown.classList.add('hidden');
    clearBtn.classList.add('hidden');
    input.focus();
  });

  // 点击外部关闭
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#topoSearchWrap')) dropdown.classList.add('hidden');
  });
}

function topoSearchNavigateTo(dcId, nodeId) {
  // 若当前已在目标 DC 的详细图则直接高亮；否则先钻入该 DC
  if (topoLevel === 'dc' && topoSelectedDC === dcId) {
    topoSearchHighlight(nodeId);
  } else {
    // 切换到目标 DC（drillIntoDC 或 renderTopoDC）
    topoLevel = 'dc';
    topoSelectedDC = dcId;
    renderTopoDC(dcId);
    renderTopoBreadcrumb();
    // 同步左侧树高亮
    const tree = document.getElementById('topoTree');
    if (tree) {
      tree.querySelectorAll('.tts-site-item').forEach(i => {
        i.classList.toggle('tts-active', i.dataset.id === dcId);
      });
    }
    // 等待 G6 渲染后再高亮
    setTimeout(() => topoSearchHighlight(nodeId), 350);
  }
}

function topoSearchHighlight(nodeId) {
  // 打开右侧设备详情
  const dcData = topoSelectedDC === 'dc1' ? TOPO_DC1
               : topoSelectedDC === 'dc2' ? TOPO_DC2 : TOPO_DC3;
  const node = dcData && dcData.nodes.find(n => n.id === nodeId);
  if (node) showTopoDevDetail(node);

  // G6 高亮 + 定位
  if (topoG6Graph) {
    const item = topoG6Graph.findById(nodeId);
    if (item) {
      topoG6Graph.focusItem(item, true);
      // 三次闪烁 (setItemState highlight)
      let count = 0;
      const timer = setInterval(() => {
        count++;
        topoG6Graph.setItemState(item, 'highlight', count % 2 !== 0);
        if (count >= 6) {
          clearInterval(timer);
          topoG6Graph.setItemState(item, 'highlight', true);
        }
      }, 200);
    }
  }
}

// ══════════════════════════════════════════════════════════
// 拓扑增强 — Task 2: 路径追踪
// ══════════════════════════════════════════════════════════

// ── Mock 路径数据 ──────────────────────────────────────────
const PATH_MOCK = {
  // Tab1: 单IP溯源 10.100.0.47
  'single:10.100.0.47': {
    hops: [
      { nodeId:'acc-02',   iface:'Gi0/1',     loss:'0.0%',  latency:'1ms',  cpu:25, alerts:1 },
      { nodeId:'agg-prd1', iface:'Te1/1',     loss:'0.0%',  latency:'2ms',  cpu:35, alerts:0 },
      { nodeId:'core-02',  iface:'Te3/1',     loss:'0.3%',  latency:'18ms', cpu:89, alerts:3, warn:true },
      { nodeId:'fw-ext2',  iface:'Gi1/1',     loss:'0.0%',  latency:'5ms',  cpu:62, alerts:2 },
      { nodeId:'rt-ct',    iface:'Gi0/0',     loss:'0.0%',  latency:'2ms',  cpu:22, alerts:0 },
    ],
    quality: 'degraded',
    aiNote: 'SW-CORE-02 热降频导致路径质量下降，额外时延约 +15ms',
    altPath: ['acc-02','agg-prd2','core-01','fw-ext1','rt-ct'],
  },
  // Tab2: IP→IP 10.100.0.47 → 10.2.0.10
  'ip2ip:10.100.0.47:10.2.0.10': {
    hops: [
      { nodeId:'acc-02',   iface:'Gi0/1→Gi0/24',   loss:'0.0%',  latency:'1ms',  cpu:25, alerts:1 },
      { nodeId:'agg-prd1', iface:'Te1/1→Te1/2',    loss:'0.0%',  latency:'2ms',  cpu:35, alerts:0 },
      { nodeId:'core-02',  iface:'Te3/1→Te3/4',    loss:'0.3%',  latency:'18ms', cpu:89, alerts:3, warn:true },
      { nodeId:'slb-01',   iface:'V101→V201',       loss:'0.0%',  latency:'3ms',  cpu:55, alerts:0 },
    ],
    quality: 'degraded',
    aiNote: '路径质量下降主因是 SW-CORE-02 热降频（CPU 89%），建议切换备用路径经 SW-CORE-01',
    altPath: ['acc-02','agg-prd2','core-01','slb-01'],
  },
  // Tab3: 服务三元组 10.100.0.47 → 10.2.0.10:443
  'svc:10.100.0.47:10.2.0.10:443': {
    hops: [
      { nodeId:'acc-02',   iface:'Gi0/1→Gi0/24',       loss:'0.0%',  latency:'1ms',  cpu:25, alerts:1 },
      { nodeId:'agg-prd1', iface:'Te1/1→Te1/2',        loss:'0.0%',  latency:'2ms',  cpu:35, alerts:0 },
      { nodeId:'core-02',  iface:'Te3/1→Te3/4',        loss:'0.3%',  latency:'18ms', cpu:89, alerts:3, warn:true },
      { nodeId:'fw-ext1',  iface:'Gi1/1→Gi1/2',        loss:'0.0%',  latency:'3ms',  cpu:45, alerts:0,
        matchedPolicy: { name:'VLAN100-TO-INTERNET', rule:'#47 PERMIT TCP any:443', action:'PERMIT' } },
      { nodeId:'slb-01',   iface:'VIP:443→pool-https', loss:'0.0%',  latency:'4ms',  cpu:55, alerts:0,
        matchedPolicy: { name:'pool-https', rule:'round-robin 3成员', action:'转发' } },
    ],
    quality: 'degraded',
    aiNote: '防火墙规则 #47 匹配正常，路径质量受 SW-CORE-02 热降频影响',
    altPath: null,
  },
  // Tab4: 五元组
  'five:10.100.0.47:52341:10.2.0.10:443:TCP': {
    sessionInfo: { srcIp:'10.100.0.47', srcPort:52341, dstIp:'10.2.0.10', dstPort:443, proto:'TCP',
      bytes:'1.24MB', pkts:923, duration:'00:04:32', state:'ESTABLISHED' },
    hops: [
      { nodeId:'acc-02',   iface:'Gi0/1',   loss:'0.0%', latency:'1ms',  cpu:25, alerts:1 },
      { nodeId:'core-02',  iface:'Te3/1',   loss:'0.3%', latency:'18ms', cpu:89, alerts:3, warn:true },
      { nodeId:'fw-ext1',  iface:'Gi1/1',   loss:'0.0%', latency:'3ms',  cpu:45, alerts:0,
        matchedPolicy: { name:'VLAN100-TO-INTERNET', rule:'#47', action:'PERMIT' } },
      { nodeId:'slb-01',   iface:'VIP:443', loss:'0.0%', latency:'4ms',  cpu:55, alerts:0 },
    ],
    quality: 'degraded',
    aiNote: 'TCP 会话建立于 14:01，当前状态正常，时延偏高来源于 SW-CORE-02 热降频',
  },
  // Tab5: 交易流水号
  'txn:TXN-20260503-000847291': {
    txnInfo: { id:'TXN-20260503-000847291', type:'支付', amount:'¥ 12,450.00',
      slaTarget:'500ms', actualLatency:'2,147ms', status:'超时', merchant:'某某商户' },
    resolvedFiveTuple: { srcIp:'10.100.0.47', srcPort:52341, dstIp:'10.2.0.10', dstPort:443, proto:'TCP' },
    hops: [
      { nodeId:'acc-02',   iface:'Gi0/1',   loss:'0.0%', latency:'1ms',  cpu:25, alerts:1, txnContrib:'1ms' },
      { nodeId:'core-02',  iface:'Te3/1',   loss:'0.3%', latency:'18ms', cpu:89, alerts:3, warn:true, txnContrib:'1,820ms' },
      { nodeId:'fw-ext1',  iface:'Gi1/1',   loss:'0.0%', latency:'3ms',  cpu:45, alerts:0, txnContrib:'280ms' },
      { nodeId:'slb-01',   iface:'VIP:443', loss:'0.0%', latency:'4ms',  cpu:55, alerts:0, txnContrib:'46ms' },
    ],
    quality: 'broken',
    aiNote: 'SW-CORE-02 热降频是导致交易超时的主因，贡献 1,820ms（占总耗时 84.8%）',
  },
};

// ── 路径追踪状态变量 ───────────────────────────────────────
var _pathActiveTab = 'single';
var _pathTraceResult = null;
var _pathOrigNodeStyles = {};
var _pathOrigEdgeStyles = {};
var _pdpCollapsed = false;

// ── 模式面板管理（Task 2 + Task 3 完整版） ──────────────
function initTopoModeBar() {
  const btns = document.querySelectorAll('#topoModeBar .tmb-btn');
  btns.forEach(btn => {
    btn.onclick = function() {
      const newMode = this.dataset.mode;
      if (newMode === _topoMode) return;
      const prevMode = _topoMode;
      _topoMode = newMode;
      btns.forEach(b => b.classList.toggle('tmb-active', b.dataset.mode === _topoMode));

      // 离开旧模式的清理
      if (prevMode === 'path') {
        document.getElementById('topoPathPanel').classList.add('hidden');
        clearPathTrace();
      }
      if (prevMode === 'changes') {
        document.getElementById('changeHistoryPanel').classList.add('hidden');
        // 恢复右侧面板
        document.getElementById('tdpDcPanel').style.display = '';
        document.getElementById('tdpAlertPanel').style.display = '';
        document.getElementById('tdpPlaceholder').style.display = '';
        clearChangeBadges();
      }

      // 进入新模式
      if (_topoMode === 'path') {
        document.getElementById('topoPathPanel').classList.remove('hidden');
        // 隐藏变更历史面板（若有）
        document.getElementById('changeHistoryPanel').classList.add('hidden');
      } else if (_topoMode === 'changes') {
        document.getElementById('topoPathPanel').classList.add('hidden');
        clearPathTrace();
        // 隐藏右侧正常内容，显示变更历史面板
        document.getElementById('tdpDcPanel').style.display = 'none';
        document.getElementById('tdpAlertPanel').style.display = 'none';
        document.getElementById('tdpPlaceholder').style.display = 'none';
        var tdpContent = document.getElementById('tdpContent');
        if (tdpContent) tdpContent.classList.add('hidden');
        document.getElementById('changeHistoryPanel').classList.remove('hidden');
        renderChangeHistoryPanel();
        // 若已在 DC 视图则立即上色
        if (topoLevel === 'dc') applyChangeBadges();
      }
    };
  });
  btns.forEach(b => b.classList.toggle('tmb-active', b.dataset.mode === _topoMode));
}

// ── 路径追踪面板 Tab 切换 ────────────────────────────────
function setPathTab(tab) {
  expandPathPanel();
  _pathActiveTab = tab;
  document.querySelectorAll('.tpp-tab').forEach(b =>
    b.classList.toggle('tpp-tab-active', b.dataset.tab === tab));
  const formIds = ['Single','Ip2ip','Svc','Five','Txn'];
  const tabMap = { single:'Single', ip2ip:'Ip2ip', svc:'Svc', five:'Five', txn:'Txn' };
  formIds.forEach(id => {
    const el = document.getElementById('tppForm' + id);
    if (el) el.classList.toggle('hidden', id !== tabMap[tab]);
    if (el && id === tabMap[tab]) el.classList.add('tpp-form-active');
    else if (el) el.classList.remove('tpp-form-active');
  });
}

// ── 执行路径追踪 ─────────────────────────────────────────
function runPathTrace(mode) {
  var key;
  if (mode === 'single') {
    var ip = (document.getElementById('tppSingleIp') || {}).value || '10.100.0.47';
    key = 'single:' + ip.trim();
  } else if (mode === 'ip2ip') {
    var src = (document.getElementById('tppSrcIp') || {}).value || '10.100.0.47';
    var dst = (document.getElementById('tppDstIp') || {}).value || '10.2.0.10';
    key = 'ip2ip:' + src.trim() + ':' + dst.trim();
  } else if (mode === 'svc') {
    var ss = (document.getElementById('tppSvcSrc') || {}).value || '10.100.0.47';
    var sd = (document.getElementById('tppSvcDst') || {}).value || '10.2.0.10';
    var sp = (document.getElementById('tppSvcPort') || {}).value || '443';
    key = 'svc:' + ss.trim() + ':' + sd.trim() + ':' + sp.trim();
  } else if (mode === 'five') {
    var fi = (document.getElementById('tppFiveSrcIp') || {}).value || '10.100.0.47';
    var fsp = (document.getElementById('tppFiveSrcPort') || {}).value || '52341';
    var fdi = (document.getElementById('tppFiveDstIp') || {}).value || '10.2.0.10';
    var fdp = (document.getElementById('tppFiveDstPort') || {}).value || '443';
    var fpr = (document.getElementById('tppFiveProto') || {}).value || 'TCP';
    key = 'five:' + fi.trim() + ':' + fsp.trim() + ':' + fdi.trim() + ':' + fdp.trim() + ':' + fpr;
  } else if (mode === 'txn') {
    var tid = (document.getElementById('tppTxnId') || {}).value || 'TXN-20260503-000847291';
    key = 'txn:' + tid.trim();
  }

  var result = PATH_MOCK[key] || PATH_MOCK['ip2ip:10.100.0.47:10.2.0.10'];
  _pathTraceResult = result;
  _pdpCollapsed = false;

  // 切换到 DC1 视图（路径数据基于 DC1）
  function doTrace() {
    highlightPathOnTopo(result.hops, result.altPath);
    renderPathDetailPanel(result, mode);
  }

  if (topoLevel !== 'dc' || topoSelectedDC !== 'dc1') {
    topoLevel = 'dc'; topoSelectedDC = 'dc1';
    renderTopoDC('dc1'); renderTopoBreadcrumb();
    var tree = document.getElementById('topoTree');
    if (tree) tree.querySelectorAll('.tts-site-item').forEach(function(i) {
      i.classList.toggle('tts-active', i.dataset.id === 'dc1');
    });
    setTimeout(doTrace, 380);
  } else {
    doTrace();
  }
}

// ── 拓扑图路径高亮 ───────────────────────────────────────
function highlightPathOnTopo(hops, altPath) {
  if (!topoG6Graph) return;
  _pathOrigNodeStyles = {};
  _pathOrigEdgeStyles = {};
  var pathIds = hops.map(function(h) { return h.nodeId; });
  var altIds = altPath || [];
  var allIds = pathIds.concat(altIds);

  // 暗化非路径节点
  topoG6Graph.getNodes().forEach(function(node) {
    var m = node.getModel();
    var ks = node.getKeyShape();
    _pathOrigNodeStyles[m.id] = {
      stroke: ks.attr('stroke'), lineWidth: ks.attr('lineWidth') || 1.5,
    };
    if (allIds.indexOf(m.id) === -1) {
      topoG6Graph.setItemState(node, 'dimmed', true);
    } else {
      topoG6Graph.setItemState(node, 'dimmed', false);
    }
  });

  // 高亮路径节点
  hops.forEach(function(hop) {
    var item = topoG6Graph.findById(hop.nodeId);
    if (!item) return;
    var isWarn = !!hop.warn;
    topoG6Graph.setItemState(item, 'dimmed', false);
    topoG6Graph.updateItem(item, { style: {
      stroke: isWarn ? '#CF222E' : '#0969DA',
      lineWidth: isWarn ? 3 : 2.5,
      shadowColor: isWarn ? 'rgba(207,34,46,0.4)' : 'rgba(9,105,218,0.35)',
      shadowBlur: isWarn ? 16 : 10,
    }});
  });

  // 备用路径节点（灰色半透明）
  altIds.forEach(function(nodeId) {
    if (pathIds.indexOf(nodeId) !== -1) return;
    var item = topoG6Graph.findById(nodeId);
    if (!item) return;
    topoG6Graph.setItemState(item, 'dimmed', false);
    topoG6Graph.updateItem(item, { style: { stroke:'#8C959F', lineWidth:1.5, opacity:0.45 }});
  });

  // 暗化/亮化边
  topoG6Graph.getEdges().forEach(function(edge) {
    var m = edge.getModel();
    var srcIdx = pathIds.indexOf(m.source);
    var tgtIdx = pathIds.indexOf(m.target);
    var isPathEdge = srcIdx !== -1 && tgtIdx !== -1 && Math.abs(srcIdx - tgtIdx) === 1;
    _pathOrigEdgeStyles[m.id] = { opacity: 1 };
    if (isPathEdge) {
      topoG6Graph.updateItem(edge, { style: { stroke:'#0969DA', lineWidth:3, opacity:1 }});
    } else {
      topoG6Graph.updateItem(edge, { style: { opacity: 0.06 }});
    }
  });
}

// ── 清除路径高亮 ─────────────────────────────────────────
function clearPathHighlight() {
  if (!topoG6Graph) return;
  topoG6Graph.getNodes().forEach(function(node) {
    var m = node.getModel();
    var orig = _pathOrigNodeStyles[m.id];
    topoG6Graph.setItemState(node, 'dimmed', false);
    topoG6Graph.updateItem(node, { style: {
      stroke: orig ? orig.stroke : undefined,
      lineWidth: orig ? orig.lineWidth : 1.5,
      shadowBlur: 0,
    }});
  });
  topoG6Graph.getEdges().forEach(function(edge) {
    topoG6Graph.updateItem(edge, { style: { opacity: 1 }});
  });
  _pathOrigNodeStyles = {};
  _pathOrigEdgeStyles = {};
}

// ── 渲染路径详情浮层 ─────────────────────────────────────
function renderPathDetailPanel(result, mode) {
  var panel = document.getElementById('pathDetailPanel');
  if (!panel) return;

  var qualityLabel = { ok:'正常', degraded:'质量下降', broken:'路径中断' };
  var qualityColor = { ok:'#16A34A', degraded:'#D09B00', broken:'#CF222E' };
  var quality = result.quality || 'ok';
  var showPolicy = (mode === 'svc' || mode === 'five' || mode === 'txn');

  // 交易信息行
  var txnInfoHtml = '';
  if (mode === 'txn' && result.txnInfo) {
    var t = result.txnInfo;
    var sc = t.status === '超时' ? '#CF222E' : '#16A34A';
    txnInfoHtml = '<div class="pdp-txn-info">' +
      '<span class="pdp-txn-badge" style="background:' + sc + '20;color:' + sc + ';border-color:' + sc + '30">' + t.type + ' · ' + t.status + '</span>' +
      '<span class="pdp-txn-id">' + t.id + '</span>' +
      '<span class="pdp-txn-amount">' + t.amount + '</span>' +
      '<span class="pdp-txn-sla">SLA目标 ' + t.slaTarget + ' · 实际 <strong style="color:' + sc + '">' + t.actualLatency + '</strong></span>' +
      '</div>';
  }
  // 会话信息行
  var sessionHtml = '';
  if (mode === 'five' && result.sessionInfo) {
    var s = result.sessionInfo;
    sessionHtml = '<div class="pdp-session-info">' +
      '<span>' + s.srcIp + ':' + s.srcPort + ' → ' + s.dstIp + ':' + s.dstPort + ' [' + s.proto + ']</span>' +
      '<span style="margin-left:8px">' + s.bytes + ' · ' + s.pkts + '包 · ' + s.duration + ' · <strong>' + s.state + '</strong></span>' +
      '</div>';
  }

  // 跳列表行
  var hopRows = result.hops.map(function(hop, i) {
    var warn = !!hop.warn;
    var cpuColor = hop.cpu > 80 ? '#CF222E' : hop.cpu > 60 ? '#D09B00' : '#16A34A';
    var policyCol = showPolicy
      ? '<td class="pdp-td">' + (hop.matchedPolicy
          ? '<span class="pdp-policy-tag">' + hop.matchedPolicy.rule + '</span>'
          : '—') + '</td>'
      : '';
    var txnCol = mode === 'txn'
      ? '<td class="pdp-td" style="color:' + (warn ? '#CF222E' : '#1F2328') + '">' + (hop.txnContrib || '—') + '</td>'
      : '';
    var devCell = warn
      ? '<span class="material-symbols-rounded" style="font-size:11px;vertical-align:middle;color:#CF222E;margin-right:2px">warning</span>' + hop.nodeId
      : hop.nodeId;
    return '<tr class="pdp-tr' + (warn ? ' pdp-tr-warn' : '') + '" data-nodeid="' + hop.nodeId + '">' +
      '<td class="pdp-td pdp-td-num">' + (i + 1) + '</td>' +
      '<td class="pdp-td pdp-td-dev" style="' + (warn ? 'color:#CF222E' : '') + '">' + devCell + '</td>' +
      '<td class="pdp-td" style="font-family:\'Geist Mono\',monospace;font-size:10.5px">' + hop.iface + '</td>' +
      '<td class="pdp-td' + (parseFloat(hop.loss) > 0 ? ' pdp-td-warn' : '') + '">' + hop.loss + '</td>' +
      '<td class="pdp-td' + (warn ? ' pdp-td-warn' : '') + '">' + hop.latency + '</td>' +
      '<td class="pdp-td"><div class="pdp-cpu-bar"><div class="pdp-cpu-fill" style="width:' + hop.cpu + '%;background:' + cpuColor + '"></div></div>' + hop.cpu + '%</td>' +
      '<td class="pdp-td">' + (hop.alerts > 0 ? '<span class="pdp-alert-count">' + hop.alerts + '</span>' : '—') + '</td>' +
      policyCol + txnCol +
      '</tr>';
  }).join('');

  var policyTh = showPolicy ? '<th class="pdp-th">命中策略</th>' : '';
  var txnTh = mode === 'txn' ? '<th class="pdp-th">交易贡献</th>' : '';

  var altHtml = result.altPath
    ? '<div class="pdp-alt-path"><span class="material-symbols-rounded" style="font-size:13px;color:#8C959F;flex-shrink:0">alt_route</span><span>备用路径：' + result.altPath.join(' → ') + '</span></div>'
    : '';

  var qc = qualityColor[quality] || '#636C76';
  var qSign = quality === 'ok' ? '●' : quality === 'broken' ? '✕' : '▲';

  panel.innerHTML =
    '<div class="pdp-hdr" id="pdpHdr">' +
      '<span class="material-symbols-rounded pdp-hdr-icon">route</span>' +
      '<span class="pdp-hdr-title">路径追踪结果</span>' +
      '<span class="pdp-quality-badge" style="background:' + qc + '20;color:' + qc + ';border-color:' + qc + '30">' + qSign + ' ' + qualityLabel[quality] + '</span>' +
      '<span class="pdp-hop-count">' + result.hops.length + ' 跳</span>' +
      txnInfoHtml + sessionHtml +
      '<button class="pdp-collapse-btn" id="pdpCollapseBtn" onclick="togglePathPanel()">' +
        '<span class="material-symbols-rounded" id="pdpCollapseIcon">expand_less</span>' +
      '</button>' +
      '<button class="pdp-close-btn" onclick="clearPathTrace()">' +
        '<span class="material-symbols-rounded">close</span>' +
      '</button>' +
    '</div>' +
    '<div class="pdp-body" id="pdpBody">' +
      '<div class="pdp-table-wrap">' +
        '<table class="pdp-table"><thead><tr>' +
          '<th class="pdp-th">#</th>' +
          '<th class="pdp-th">设备</th>' +
          '<th class="pdp-th">接口</th>' +
          '<th class="pdp-th">丢包率</th>' +
          '<th class="pdp-th">时延</th>' +
          '<th class="pdp-th">CPU</th>' +
          '<th class="pdp-th">告警</th>' +
          policyTh + txnTh +
        '</tr></thead><tbody>' + hopRows + '</tbody></table>' +
      '</div>' +
      altHtml +
      '<div class="pdp-ai-note"><span class="material-symbols-rounded pdp-ai-icon">auto_awesome</span><span>' + result.aiNote + '</span></div>' +
    '</div>';

  panel.classList.remove('hidden');

  // 追踪完成 → 折叠输入面板
  var _modeLabels = { single:'单IP溯源', ip2ip:'IP→IP', svc:'服务三元组', five:'五元组', txn:'交易流水号' };
  var _qlabels = { ok:'质量良好', degraded:'质量降级', broken:'路径故障' };
  collapsePathPanel((_modeLabels[mode] || mode) + ' · ' + (_qlabels[result.quality] || '') + ' · ' + result.hops.length + ' 跳');

  // 点击跳行 → 右侧设备详情
  panel.querySelectorAll('.pdp-tr[data-nodeid]').forEach(function(tr) {
    tr.addEventListener('click', function() {
      var nodeId = this.dataset.nodeid;
      panel.querySelectorAll('.pdp-tr').forEach(function(r) { r.classList.remove('pdp-tr-selected'); });
      this.classList.add('pdp-tr-selected');
      var dcData = topoSelectedDC === 'dc1' ? TOPO_DC1 : topoSelectedDC === 'dc2' ? TOPO_DC2 : TOPO_DC3;
      var node = dcData && dcData.nodes.find(function(n) { return n.id === nodeId; });
      if (node) showTopoDevDetail(node);
      if (topoG6Graph) {
        var item = topoG6Graph.findById(nodeId);
        if (item) topoG6Graph.focusItem(item, false);
      }
    });
  });
}

// ── 折叠/展开路径详情面板 ────────────────────────────────
function togglePathPanel() {
  _pdpCollapsed = !_pdpCollapsed;
  var panel = document.getElementById('pathDetailPanel');
  var icon  = document.getElementById('pdpCollapseIcon');
  if (panel) panel.classList.toggle('pdp-minimized', _pdpCollapsed);
  if (icon)  icon.textContent = _pdpCollapsed ? 'expand_more' : 'expand_less';
}

// ── 清除路径追踪 ─────────────────────────────────────────
function clearPathTrace() {
  expandPathPanel();
  clearPathHighlight();
  var panel = document.getElementById('pathDetailPanel');
  if (panel) panel.classList.add('hidden');
  _pathTraceResult = null;
}

// ── 折叠/展开路径输入面板 ─────────────────────────────────
function collapsePathPanel(summaryText) {
  var pp = document.getElementById('topoPathPanel');
  var ci = document.getElementById('tppCompactInfo');
  var eb = document.getElementById('tppEditBtn');
  if (!pp) return;
  pp.classList.add('tpp-compact');
  if (ci) { ci.textContent = summaryText || ''; ci.classList.remove('hidden'); }
  if (eb) eb.classList.remove('hidden');
}
function expandPathPanel() {
  var pp = document.getElementById('topoPathPanel');
  var ci = document.getElementById('tppCompactInfo');
  var eb = document.getElementById('tppEditBtn');
  if (!pp) return;
  pp.classList.remove('tpp-compact');
  if (ci) ci.classList.add('hidden');
  if (eb) eb.classList.add('hidden');
}

// ──═══════════════════════════════════════════════════════
// Task 3: 变更历史 + 配置 Diff
// ══════════════════════════════════════════════════════════

const CHANGE_HISTORY = [
  { id:'CH001', time:'14:23', type:'config', device:'fw-ext1', deviceLabel:'NGFW-EXT-01',
    title:'防火墙策略变更', detail:'规则 #47 新增 + 规则 #23 修改',
    operator:'admin', source:'API(NGPM自动化)', ticket:'CHG-0503-042',
    risk:'high',
    diff: {
      added: ['规则 #47  PERMIT  TCP  10.100.0.0/24 → any:443',
              '规则 #48  PERMIT  UDP  10.100.0.0/24 → 8.8.8.8:53'],
      modified: ['规则 #23  DENY → PERMIT  ANY  10.100.0.5/32 → any  ⚠ 绕过所有目标限制'],
      deleted: ['规则 #12  PERMIT  TCP  10.100.0.0/24 → 10.2.0.1:80'],
    }
  },
  { id:'CH002', time:'14:05', type:'topo', device:'core-02', deviceLabel:'SW-CORE-02',
    title:'VSS 心跳超时，主备状态异常', detail:'VSS 心跳延迟 320ms（阈值 100ms）',
    operator:'system', source:'NMS告警', ticket:null, risk:'none', diff:null },
  { id:'CH003', time:'14:03', type:'alert', device:'core-02', deviceLabel:'SW-CORE-02',
    title:'热降频触发', detail:'CPU 34%→89%，热降频保护激活',
    operator:'system', source:'SNMP Trap', ticket:null, risk:'none', diff:null },
  { id:'CH004', time:'13:58', type:'config', device:'slb-01', deviceLabel:'SLB-01',
    title:'负载均衡池成员变更', detail:'APP-SRV-03 从 pool-http 中摘除',
    operator:'deploy-bot', source:'CI/CD Pipeline', ticket:'DEP-0503-019',
    risk:'low',
    diff: {
      added: [],
      modified: [],
      deleted: ['pool-http 成员  APP-SRV-03  10.4.0.35:8080  (摘除原因：健康检查失败)'],
    }
  },
  { id:'CH005', time:'13:42', type:'alert', device:'dcim-b06', deviceLabel:'PAC-B06(DCIM)',
    title:'精密空调压缩机故障告警', detail:'制冷停止，机柜 B06 开始升温',
    operator:'system', source:'DCIM告警', ticket:null, risk:'none', diff:null },
  { id:'CH006', time:'10:14', type:'topo', device:'agg-prd1', deviceLabel:'AGG-PRD-01',
    title:'新设备自动发现接入', detail:'AGG-04 接入 Te3/4 端口，已纳入监控',
    operator:'system', source:'AI自动发现', ticket:null, risk:'none', diff:null },
  { id:'CH007', time:'09:30', type:'config', device:'core-01', deviceLabel:'SW-CORE-01',
    title:'VLAN 配置变更', detail:'VLAN 300 描述修改，新增 VLAN 450',
    operator:'netadmin', source:'CLI', ticket:'CHG-0503-011',
    risk:'none',
    diff: {
      added: ['VLAN 450  name STORAGE-BACKUP-NET'],
      modified: ['VLAN 300  description PROD-APP-TIER → PROD-APP-TIER-EAST'],
      deleted: [],
    }
  },
];

var _changeBadgeOrigStyles = {};

// ── 渲染变更历史面板 ─────────────────────────────────────
function renderChangeHistoryPanel() {
  var el = document.getElementById('changeHistoryPanel');
  if (!el) return;

  var typeIcon  = { config:'settings', topo:'account_tree', alert:'warning' };
  var typeColor = { config:'#8250DF', topo:'#0969DA', alert:'#CF222E' };
  var typeBg    = { config:'#F3E8FE', topo:'#DBEAFE', alert:'#FFEBE9' };

  var configCount   = CHANGE_HISTORY.filter(function(c) { return c.type === 'config'; }).length;
  var highRiskCount = CHANGE_HISTORY.filter(function(c) { return c.risk === 'high'; }).length;

  var listHtml = CHANGE_HISTORY.map(function(c) {
    var hasDiff   = c.diff !== null;
    var isHigh    = c.risk === 'high';
    var isLow     = c.risk === 'low';
    return '<div class="chp-entry" onclick="highlightChangeNodeOnTopo(\'' + c.device + '\')">' +
      '<div class="chp-entry-icon" style="background:' + typeBg[c.type] + ';color:' + typeColor[c.type] + '">' +
        '<span class="material-symbols-rounded">' + typeIcon[c.type] + '</span>' +
      '</div>' +
      '<div class="chp-entry-body">' +
        '<div class="chp-entry-top">' +
          '<span class="chp-entry-time">' + c.time + '</span>' +
          '<span class="chp-entry-device" onclick="event.stopPropagation();highlightChangeNodeOnTopo(\'' + c.device + '\')">' + c.deviceLabel + '</span>' +
          (isHigh ? '<span class="chp-risk-badge chp-risk-high">⚠ AI高风险</span>' : '') +
          (isLow  ? '<span class="chp-risk-badge chp-risk-low">低风险</span>' : '') +
        '</div>' +
        '<div class="chp-entry-title">' + c.title + '</div>' +
        '<div class="chp-entry-detail">' + c.detail + '</div>' +
        '<div class="chp-entry-meta">' +
          '<span class="material-symbols-rounded chp-meta-icon">person</span>' +
          c.operator + ' &nbsp;·&nbsp; ' +
          '<span class="material-symbols-rounded chp-meta-icon">webhook</span>' +
          c.source +
          (c.ticket ? ' &nbsp;·&nbsp; <span class="chp-ticket">' + c.ticket + '</span>' : '') +
        '</div>' +
        (hasDiff
          ? '<div class="chp-entry-actions"><button class="chp-diff-btn" onclick="event.stopPropagation();showChangeDiffModal(\'' + c.id + '\')">' +
              '<span class="material-symbols-rounded">diff</span>查看配置对比</button></div>'
          : '') +
      '</div>' +
    '</div>';
  }).join('');

  el.innerHTML =
    '<div class="chp-hdr">' +
      '<span class="material-symbols-rounded chp-hdr-icon">history</span>' +
      '<span class="chp-hdr-title">变更历史</span>' +
      '<span class="chp-hdr-date">今日 · 2026-05-03</span>' +
    '</div>' +
    '<div class="chp-filter-bar">' +
      '<select class="chp-filter-select"><option>全部类型</option><option>配置变更</option><option>拓扑变化</option><option>告警事件</option></select>' +
      '<select class="chp-filter-select"><option>全部设备</option><option>fw-ext1</option><option>core-02</option><option>slb-01</option><option>agg-prd1</option><option>core-01</option></select>' +
    '</div>' +
    '<div class="chp-stats-row">' +
      '<span class="chp-stat-total">共 <strong>' + CHANGE_HISTORY.length + '</strong> 条变更</span>' +
      '<span class="chp-stat-config">配置变更 <strong>' + configCount + '</strong> 条</span>' +
      (highRiskCount ? '<span class="chp-stat-risk">含 <strong>' + highRiskCount + '</strong> 条高风险</span>' : '') +
    '</div>' +
    '<div class="chp-list">' + listHtml + '</div>';
}

// ── 显示配置 Diff 弹窗 ───────────────────────────────────
function showChangeDiffModal(id) {
  var c = CHANGE_HISTORY.filter(function(x) { return x.id === id; })[0];
  if (!c || !c.diff) return;

  var hdrHtml =
    '<div class="cdm-title"><span class="material-symbols-rounded">diff</span>' +
      c.deviceLabel + ' — 配置对比</div>' +
    '<div class="cdm-meta-row">' +
      '<span class="cdm-meta-item"><span class="material-symbols-rounded">schedule</span>' + c.time + ' · 2026-05-03</span>' +
      '<span class="cdm-meta-item"><span class="material-symbols-rounded">person</span>' + c.operator + '</span>' +
      '<span class="cdm-meta-item"><span class="material-symbols-rounded">webhook</span>' + c.source + '</span>' +
      (c.ticket ? '<span class="cdm-meta-item cdm-ticket"><span class="material-symbols-rounded">confirmation_number</span>' + c.ticket + '</span>' : '') +
    '</div>';

  var diffHtml = '';
  (c.diff.added || []).forEach(function(line) {
    diffHtml += '<div class="cdm-line cdm-added"><span class="cdm-prefix">+</span>' + line + '</div>';
  });
  (c.diff.modified || []).forEach(function(line) {
    diffHtml += '<div class="cdm-line cdm-modified"><span class="cdm-prefix">~</span>' + line +
      (c.risk === 'high' ? ' <span class="cdm-risk-flag">⚠ AI风险</span>' : '') + '</div>';
  });
  (c.diff.deleted || []).forEach(function(line) {
    diffHtml += '<div class="cdm-line cdm-deleted"><span class="cdm-prefix">-</span>' + line + '</div>';
  });

  document.getElementById('cdmHdr').innerHTML = hdrHtml;
  document.getElementById('cdmBody').innerHTML = '<div class="cdm-diff-block">' + diffHtml + '</div>';
  document.getElementById('changeDiffModal').classList.remove('hidden');
}

// ── 关闭配置 Diff 弹窗 ───────────────────────────────────
function closeChangeDiffModal() {
  var modal = document.getElementById('changeDiffModal');
  if (modal) modal.classList.add('hidden');
}

// ── 拓扑图闪烁定位变更节点 ───────────────────────────────
function highlightChangeNodeOnTopo(deviceId) {
  if (!topoG6Graph || topoLevel !== 'dc') {
    if (topoLevel !== 'dc') {
      topoLevel = 'dc'; topoSelectedDC = 'dc1';
      renderTopoDC('dc1'); renderTopoBreadcrumb();
      setTimeout(function() { highlightChangeNodeOnTopo(deviceId); }, 420);
    }
    return;
  }
  var node = topoG6Graph.findById(deviceId);
  if (!node) return;
  topoG6Graph.focusItem(node, true, { duration: 300 });
  var origStyle = node.getModel().style || {};
  var origStroke = origStyle.stroke;
  var origLW = origStyle.lineWidth || 1.5;
  var flashColor = '#F4A400';
  var count = 0;
  var iv = setInterval(function() {
    count++;
    if (count % 2 === 1) {
      topoG6Graph.updateItem(node, { style: { stroke: flashColor, lineWidth: 4, shadowColor: flashColor, shadowBlur: 18 } });
    } else {
      topoG6Graph.updateItem(node, { style: { stroke: origStroke, lineWidth: origLW, shadowBlur: 0 } });
    }
    if (count >= 6) clearInterval(iv);
  }, 300);
}

// ── 变更徽标覆盖（节点描边着色） ────────────────────────
function applyChangeBadges() {
  if (!topoG6Graph) return;
  _changeBadgeOrigStyles = {};
  CHANGE_HISTORY.forEach(function(c) {
    var node = topoG6Graph.findById(c.device);
    if (!node) return;
    if (!_changeBadgeOrigStyles[c.device]) {
      var curStyle = node.getModel().style || {};
      _changeBadgeOrigStyles[c.device] = { stroke: curStyle.stroke, lineWidth: curStyle.lineWidth || 1.5 };
    }
    var stroke = c.type === 'alert' ? '#CF222E' : c.type === 'config' ? '#8250DF' : '#0969DA';
    topoG6Graph.updateItem(node, { style: { stroke: stroke, lineWidth: 2.5 } });
  });
}

function clearChangeBadges() {
  if (!topoG6Graph) return;
  Object.keys(_changeBadgeOrigStyles).forEach(function(nodeId) {
    var node = topoG6Graph.findById(nodeId);
    if (!node) return;
    var orig = _changeBadgeOrigStyles[nodeId];
    topoG6Graph.updateItem(node, { style: { stroke: orig.stroke, lineWidth: orig.lineWidth } });
  });
  _changeBadgeOrigStyles = {};
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
        <span class="tts-badge tts-badge-${alertCount>0?'warn':'ok'}" style="font-size:9.5px">${nodeCount}设备${alertCount>0?' · ⚠'+alertCount:''}</span>
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
    list.innerHTML = '<div class="tdp-ap-empty">✓ 无异常设备</div>';
    return;
  }
  const cMap = { warn: '#D97706', crit: '#DC2626' };
  const dcShortMap = { dc1: 'DC-A', dc2: 'DC-B', dc3: 'DC-C' };
  list.innerHTML = allAlerts.map(n => `
    <div class="tdp-ap-item" data-dcid="${n.dcId}" data-nodeid="${n.id}">
      <span class="tdp-ap-dot" style="background:${cMap[n.status]}"></span>
      <div class="tdp-ap-body">
        <div class="tdp-ap-name">${n.label}</div>
        <div class="tdp-ap-meta">${dcShortMap[n.dcId]} · ${n.role}${n.alerts > 0 ? ' · ' + n.alerts + '条告警' : ''}</div>
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
  renderTdpDcPanel();
}

function renderTdpDcPanel() {
  var el = document.getElementById('tdpDcPanel');
  if (!el) return;
  var dcDataMap = { dc1: TOPO_DC1, dc2: TOPO_DC2, dc3: TOPO_DC3 };
  var dcShortMap = { dc1: 'DC-A', dc2: 'DC-B', dc3: 'PoP-C' };
  var cMap = { ok: '#1A7F37', warn: '#D09B00', crit: '#CF222E' };
  var html = '<div class="tdp-dc-header"><span class="material-symbols-rounded">corporate_fare</span>\u6570\u636e\u4e2d\u5fc3\u5065\u5eb7\u770b\u677f</div>';
  TOPO_GLOBAL.sites.forEach(function(s) {
    var dc = dcDataMap[s.id];
    if (!dc) return;
    var critCount = dc.nodes.filter(function(n) { return n.status === 'crit'; }).length;
    var warnCount = dc.nodes.filter(function(n) { return n.status === 'warn'; }).length;
    var totalAlerts = dc.nodes.reduce(function(acc, n) { return acc + (n.alerts || 0); }, 0);
    var worstStatus = critCount > 0 ? 'crit' : warnCount > 0 ? 'warn' : 'ok';
    var dotColor = cMap[worstStatus];
    var healthPct = Math.max(10, 100 - critCount * 15 - warnCount * 5);
    var cnts = '';
    if (critCount > 0) cnts += '<span class="tdp-dc-cnt" style="background:#FFEBE9;color:#CF222E">' + critCount + ' \u4e25\u91cd</span>';
    if (warnCount > 0) cnts += '<span class="tdp-dc-cnt" style="background:#FFF8C5;color:#9A6700">' + warnCount + ' \u9884\u8b66</span>';
    if (critCount + warnCount === 0) cnts += '<span class="tdp-dc-cnt" style="background:#D1F7E4;color:#1A7F37">\u5065\u5eb7</span>';
    var aiData = TOPO_AI_MAP[s.id];
    var dcShortLabel = s.label.replace(/\s*\(.*\)/, '');
    var metaText = s.devices + ' \u53f0\u8bbe\u5907';
    if (totalAlerts > 0) metaText += ' \u00b7 ' + totalAlerts + ' \u6761\u6d3b\u8dc3\u544a\u8b66';
    if (aiData) metaText += ' \u00b7 AI \u5df2\u5206\u6790';
    html += '<div class="tdp-dc-item" data-dcid="' + s.id + '">' +
      '<div class="tdp-dc-item-top">' +
        '<div class="tdp-dc-badge" style="background:' + dotColor + '"></div>' +
        '<span class="tdp-dc-name">' + dcShortMap[s.id] + ' ' + dcShortLabel + '</span>' +
        '<div class="tdp-dc-counts">' + cnts + '</div>' +
      '</div>' +
      '<div class="tdp-dc-bar-wrap"><div class="tdp-dc-bar" style="width:' + healthPct + '%;background:' + dotColor + '"></div></div>' +
      '<div class="tdp-dc-meta">' + metaText + '</div>' +
    '</div>';
  });
  el.innerHTML = html;
  el.querySelectorAll('.tdp-dc-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var dcId = item.dataset.dcid;
      topoLevel = 'dc'; topoSelectedDC = dcId;
      renderTopoDC(dcId);
      renderTopoBreadcrumb();
      document.querySelectorAll('.tts-site-item').forEach(function(i) {
        i.classList.toggle('tts-active', i.dataset.id === dcId);
      });
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
  document.querySelectorAll('.tfb-btn').forEach(function(b) {
    b.classList.toggle('tfb-active', b.dataset.filter === filterVal);
  });
  if (topoLevel !== 'dc' || !topoG6Graph) return;
  var dcData = topoSelectedDC === 'dc1' ? TOPO_DC1 : topoSelectedDC === 'dc2' ? TOPO_DC2 : TOPO_DC3;
  var allNodes = topoG6Graph.getNodes();
  var allEdges = topoG6Graph.getEdges();
  if (filterVal === 'all') {
    allNodes.forEach(function(n) { topoG6Graph.clearItemStates(n, ['dimmed']); });
    allEdges.forEach(function(e) { topoG6Graph.clearItemStates(e, ['dimmed']); });
    return;
  }
  var primaryIds = new Set();
  if (filterVal === 'ai') {
    var aiData = TOPO_AI_MAP[topoSelectedDC];
    if (aiData) {
      aiData.correlations.forEach(function(c) { primaryIds.add(c.from); primaryIds.add(c.to); });
      aiData.risks.forEach(function(r) { primaryIds.add(r.nodeId); });
    }
  } else {
    dcData.nodes.forEach(function(n) {
      var match = false;
      if (filterVal === 'issue') match = n.status !== 'ok';
      else if (filterVal === 'crit') match = n.status === 'crit';
      else if (filterVal === 'warn') match = n.status === 'warn';
      if (match) primaryIds.add(n.id);
    });
  }
  var contextIds = new Set();
  dcData.links.forEach(function(l) {
    if (primaryIds.has(l.from)) contextIds.add(l.to);
    if (primaryIds.has(l.to)) contextIds.add(l.from);
  });
  allNodes.forEach(function(n) {
    var id = n.getModel().id;
    if (primaryIds.has(id) || contextIds.has(id)) topoG6Graph.clearItemStates(n, ['dimmed']);
    else topoG6Graph.setItemState(n, 'dimmed', true);
  });
  allEdges.forEach(function(e) {
    var m = e.getModel();
    var vis = primaryIds.has(m.source) || contextIds.has(m.source) ||
              primaryIds.has(m.target) || contextIds.has(m.target);
    if (!vis) topoG6Graph.setItemState(e, 'dimmed', true);
    else topoG6Graph.clearItemStates(e, ['dimmed']);
  });
}

function renderTopoBreadcrumb() {
  const bc = document.getElementById('topoBreadcrumb');
  if (!bc) return;
  let html = `<span class="tbc-item ${topoLevel==='global'?'tbc-active':''}" style="cursor:pointer" onclick="topoLevel='global';renderTopoGlobal();renderTopoBreadcrumb()">🌐 全网总览</span>`;
  if (topoLevel !== 'global') {
    const dc = TOPO_GLOBAL.sites.find(s=>s.id===topoSelectedDC);
    if (dc) html += `<span class="tbc-sep">›</span><span class="tbc-item tbc-active">🏢 ${dc.label}</span>`;
  }
  bc.innerHTML = html;
}

// ── 中国地图加载器（ECharts 真实 GeoJSON，单次缓存）──────────
var _chinaGeoJson = null;
var _chinaMapPromise = null;
function ensureChinaMap(cb) {
  if (_chinaGeoJson) { cb(); return; }
  if (_chinaMapPromise) { _chinaMapPromise.then(cb); return; }
  // 湖北省地图（DataV GeoAtlas 湖北全域）
  _chinaMapPromise = fetch('hubei.json')
    .then(function(r) { return r.json(); })
    .then(function(json) {
      _chinaGeoJson = json;
      if (window.echarts && echarts.registerMap) echarts.registerMap('hubei', json);
    })
    .catch(function(err) { console.warn('[topo] hubei map load failed', err); });
  _chinaMapPromise.then(cb);
}

function renderTopoGlobal() {
  var container = document.getElementById('topoMainGraph');
  if (!container) return;
  if (topoG6Graph) { topoG6Graph.destroy(); topoG6Graph = null; }
  var W = container.clientWidth || 700;
  var H = container.clientHeight || 380;
  // 先确保地图就绪，再渲染
  ensureChinaMap(function() { _renderTopoGlobalWithMap(container, W, H); });
}

function _renderTopoGlobalWithMap(container, W, H) {
  var cMap = { ok: '#16A34A', warn: '#D97706', crit: '#DC2626' };
  var dcMap = { dc1: TOPO_DC1, dc2: TOPO_DC2, dc3: TOPO_DC3 };

  // ── 0) 清理二级视图残留的层级覆盖层 ─────────────────────────
  var wrap = container.parentElement;
  var oldOvl = wrap && wrap.querySelector('.topo-layer-overlay');
  if (oldOvl) oldOvl.remove();

  // ── 1) 背景层：ECharts geo 中国地图 ─────────────────────────
  var bg = wrap && wrap.querySelector('#topoChinaMapBg');
  if (bg && bg._echartsInst) { try { bg._echartsInst.dispose(); } catch (e) {} bg.remove(); bg = null; }
  if (wrap) {
    bg = document.createElement('div');
    bg.id = 'topoChinaMapBg';
    bg.className = 'topo-china-map-bg';
    wrap.insertBefore(bg, wrap.firstChild);
  }
  var chinaChart = null;
  if (bg && window.echarts && _chinaGeoJson) {
    chinaChart = echarts.init(bg, null, { renderer: 'svg', width: W, height: H });
    bg._echartsInst = chinaChart;
    chinaChart.setOption({
      backgroundColor: 'transparent',
      geo: {
        map: 'hubei',
        roam: false,
        silent: true,
        layoutCenter: ['50%', '50%'],
        layoutSize: '98%',
        itemStyle: {
          areaColor: 'rgba(125,211,252,0.13)',
          borderColor: 'rgba(14,165,233,0.55)',
          borderWidth: 1
        },
        emphasis: { disabled: true },
        regions: []
      }
    });
    // ECharts 必须先 flush 才能立即调用 convertToPixel
    try { chinaChart.getZr().flush(); } catch(e) {}
  }

  // ── 2) 经纬度 → 像素投影（基于 echarts geo）─────────────────
  function geo2px(lng, lat) {
    if (chinaChart) {
      var p = chinaChart.convertToPixel({ geoIndex: 0 }, [lng, lat]);
      if (p && isFinite(p[0]) && isFinite(p[1])) return { x: p[0], y: p[1] };
    }
    // 回退：湖北省层级线性投影（lng 108.36~116.13，lat 29.05~33.28）
    var mx = W * 0.01 + (lng - 108.36) / (116.13 - 108.36) * W * 0.98;
    var my = H * 0.01 + (1 - (lat - 29.05) / (33.28 - 29.05)) * H * 0.98;
    return { x: mx, y: my };
  }

  // ── 3) G6 拓扑图（在地图上层）────────────────────────────────
  var graph = new G6.Graph({
    container: 'topoMainGraph',
    width: W, height: H,
    renderer: 'svg',
    fitView: false,
    // 不指定 layout：节点已带 x/y 直接使用绝对坐标（preset 在 G6 v4 中不存在）
    modes: { default: [] },   // 全局视图禁止缩放/拖拽：DC 节点绑定地图坐标，不可随意缩放
    minZoom: 1, maxZoom: 1,
    defaultEdge: {
      type: 'line',
      style: { lineWidth: 2, opacity: 0.85 },
      // 不使用 label background：G6 v4 SVG 渲染器在某些边端点几何下
      // 会把 background rect 的 x 算成 NaN，污染控制台。改用文字描边模拟"白底"效果。
      labelCfg: { style: { fontSize: 10, fontWeight: 700, fill: '#0F172A',
        stroke: '#FFFFFF', lineWidth: 3 } }
    },
    edgeStateStyles: { dimmed: { opacity: 0.08 } },
    nodeStateStyles: { hover: {}, selected: {} }  // 禁用 G6 默认的蓝色高亮边框
  });
  topoG6Graph = graph;
  // ── DC 地理坐标（湖北省内城市）─────────────────────────────
  var NS = 0.62;  // 省级地图节点缩放系数
  var dcGeo = {
    dc1: { lng: 114.30, lat: 30.60 },  // 武汉（主数据中心）
    dc2: { lng: 111.28, lat: 30.70 },  // 宜昌（灾备中心）
    dc3: { lng: 112.12, lat: 32.01 }   // 襄阳（边缘节点）
  };
  var positions = {};
  Object.keys(dcGeo).forEach(function(k) { positions[k] = geo2px(dcGeo[k].lng, dcGeo[k].lat); });
  // Internet 云：湖北东南方（安徽方向，象征广域出口）
  var inetPos = geo2px(116.0, 30.2);
  // MPLS 骨干云：湖北中部腹地（荆门附近）
  var mplsPos = geo2px(112.2, 31.0);
  var nodes = [
    { id: '__inet', type: 'ellipse', size: [120, 46],
      label: 'Internet\n\u4e2d\u56fd\u7535\u4fe1/\u8054\u901a',
      x: Math.min(inetPos.x, W - 70), y: Math.max(inetPos.y, 40),
      style: { fill: 'rgba(255,255,255,0.85)', stroke: '#0EA5E9', lineWidth: 1.4, lineDash: [5, 3],
        shadowColor: '#0EA5E9', shadowBlur: 6 },
      labelCfg: { style: { fontSize: 9.5, fill: '#0369A1', fontWeight: 700 } } },
    { id: '__mpls', type: 'ellipse', size: [120, 46],
      label: 'MPLS \u9aa8\u5e72\u7f51\n\u8fd0\u8425\u5546\u4e13\u7ebf',
      x: mplsPos.x, y: mplsPos.y,
      style: { fill: 'rgba(255,255,255,0.85)', stroke: '#0891B2', lineWidth: 1.4, lineDash: [4, 2],
        shadowColor: '#0891B2', shadowBlur: 6 },
      labelCfg: { style: { fontSize: 9.5, fill: '#0E7490', fontWeight: 700 } } }
  ];
  TOPO_GLOBAL.sites.forEach(function(s) {
    var dc = dcMap[s.id];
    var alertCount = dc ? dc.nodes.filter(function(n) { return n.status !== 'ok'; }).length : 0;
    nodes.push({
      id: s.id, type: 'topo-site',
      dcId: s.id, label: s.label, status: s.status,
      devices: s.devices, alertCount: alertCount,
      nodeScale: NS,
      x: positions[s.id].x, y: positions[s.id].y
    });
  });
  var edges = [
    { id: 'e-wan', source: '__inet', target: 'dc1', label: 'WAN 84%',
      style: { stroke: '#D97706', lineWidth: 2, lineDash: [6, 3], opacity: 0.9,
        shadowColor: '#FBBF24', shadowBlur: 3 } },
    { id: 'e-ympls1', source: '__mpls', target: 'dc1',
      style: { stroke: '#0891B2', lineWidth: 1.6, lineDash: [10, 5], opacity: 0.85 } },
    { id: 'e-ympls2', source: '__mpls', target: 'dc2',
      style: { stroke: '#0891B2', lineWidth: 1.6, lineDash: [10, 5], opacity: 0.85 } }
  ];
  TOPO_GLOBAL.links.forEach(function(l, i) {
    edges.push({
      id: 'e-s' + i, source: l.from, target: l.to, label: l.label,
      style: { stroke: cMap[l.type] || '#0891B2', lineWidth: 2, lineDash: [10, 5], opacity: 0.9 }
    });
  });
  graph.data({ nodes: nodes, edges: edges });
  graph.render();
  // ── 全局图连线流动动画 ────────────────────────────────────
  graph.getEdges().forEach(function(edge) {
    var ks = edge.getKeyShape();
    var el = ks && ks.get('el');
    if (el) el.classList.add('anim-dash');
  });
  // ── DC 节点悬停预览卡片 ──────────────────────────────────────
  // 策略：node:mouseenter 总是先重置再显示新内容；用画布 DOM 的 mouseleave 兜底隐藏
  var dcTooltip = document.getElementById('topoDcTooltip');
  var dcDataMap = { dc1: TOPO_DC1, dc2: TOPO_DC2, dc3: TOPO_DC3 };
  var _dcTipCurrentId = null;

  function _hideDcTooltip() {
    if (dcTooltip) dcTooltip.style.display = 'none';
    if (_dcTipCurrentId) {
      var oldItem = graph.findById(_dcTipCurrentId);
      if (oldItem) graph.setItemState(oldItem, 'hover', false);
    }
    _dcTipCurrentId = null;
  }

  graph.on('node:mouseenter', function(e) {
    var item = e.item;
    var m = item.getModel();
    if (m.type !== 'topo-site') return;
    if (_dcTipCurrentId === m.id) return;
    // 先取消上一个节点的 hover 状态（防止两个节点同时高亮）
    if (_dcTipCurrentId) {
      var oldItem = graph.findById(_dcTipCurrentId);
      if (oldItem) graph.setItemState(oldItem, 'hover', false);
    }
    _dcTipCurrentId = m.id;
    graph.setItemState(item, 'hover', true);
    if (!dcTooltip) return;
    var dc = dcDataMap[m.dcId];
    if (!dc) return;
    var critCount = dc.nodes.filter(function(n) { return n.status === 'crit'; }).length;
    var warnCount = dc.nodes.filter(function(n) { return n.status === 'warn'; }).length;
    var totalAlerts = dc.nodes.reduce(function(s, n) { return s + (n.alerts || 0); }, 0);
    var maxCpuNode = dc.nodes.reduce(function(a, b) { return (b.cpu || 0) > (a.cpu || 0) ? b : a; }, dc.nodes[0]);
    var aiData = TOPO_AI_MAP[m.dcId];
    var issueHtml = '';
    if (aiData) {
      var entries = Object.keys(aiData.nodeAnalysis).map(function(k) { return aiData.nodeAnalysis[k]; });
      var top = entries.reduce(function(a, b) { return (b.confidence || 0) > (a.confidence || 0) ? b : a; }, entries[0]);
      if (top) issueHtml = '<div class="tdc-issue">🤖 ' + top.rootCause.slice(0, 58) + '\u2026 <span class="tdc-conf">' + top.confidence + '% \u7f6e\u4fe1</span></div>';
    }
    var statusBadge = critCount > 0 ? '<span class="tdc-badge tdc-badge-crit">\u4e25\u91cd</span>'
      : warnCount > 0 ? '<span class="tdc-badge tdc-badge-warn">\u9884\u8b66</span>'
      : '<span class="tdc-badge tdc-badge-ok">\u5065\u5eb7</span>';
    var cpuCls = maxCpuNode.cpu > 80 ? ' tdc-v-crit' : maxCpuNode.cpu > 60 ? ' tdc-v-warn' : ' tdc-v-ok';
    var metricsHtml = '<div class="tdc-metrics"><div class="tdc-metric-row"><span>\u6700\u9ad8 CPU</span><span class="tdc-metric-val' + cpuCls + '">' + maxCpuNode.cpu + '% \u00b7 ' + maxCpuNode.label + '</span></div></div>';
    var statParts = '<div class="tdc-stat"><div class="tdc-stat-val">' + (m.devices || dc.nodes.length) + '</div><div class="tdc-stat-lbl">\u8bbe\u5907</div></div><div class="tdc-stat-sep"></div>';
    if (critCount > 0) statParts += '<div class="tdc-stat"><div class="tdc-stat-val tdc-v-crit">' + critCount + '</div><div class="tdc-stat-lbl">\u4e25\u91cd</div></div>';
    if (warnCount > 0) statParts += '<div class="tdc-stat"><div class="tdc-stat-val tdc-v-warn">' + warnCount + '</div><div class="tdc-stat-lbl">\u9884\u8b66</div></div>';
    if (critCount + warnCount === 0) statParts += '<div class="tdc-stat"><div class="tdc-stat-val tdc-v-ok">\u2713</div><div class="tdc-stat-lbl">\u5065\u5eb7</div></div>';
    if (totalAlerts > 0) statParts += '<div class="tdc-stat"><div class="tdc-stat-val tdc-v-warn">' + totalAlerts + '</div><div class="tdc-stat-lbl">\u544a\u8b66\u6761</div></div>';
    dcTooltip.innerHTML =
      '<div class="tdc-header"><span class="tdc-name">' + m.label + '</span>' + statusBadge + '</div>' +
      '<div class="tdc-stats">' + statParts + '</div>' +
      metricsHtml + issueHtml +
      '<div class="tdc-hint">\u70b9\u51fb\u8fdb\u5165\u67e5\u770b\u8be6\u60c5 \u2192</div>';
    var cvs = graph.get('canvas').get('el');
    var cRect = cvs.getBoundingClientRect();
    var wRect = container.parentElement.getBoundingClientRect();
    var pt = graph.getCanvasByPoint(m.x, m.y);
    var left = (cRect.left - wRect.left) + pt.x + 58;
    var top = (cRect.top - wRect.top) + pt.y - 30;
    dcTooltip.style.left = Math.min(left, wRect.width - 234) + 'px';
    dcTooltip.style.top  = Math.max(10, top) + 'px';
    dcTooltip.style.display = 'block';
  });

  // 鼠标离开整个画布容器时隐藏（DOM 级别，不依赖 G6 内部事件）
  try {
    var _canvasObj = graph.get('canvas');
    var _canvasEl = _canvasObj && _canvasObj.get && _canvasObj.get('el');
    if (_canvasEl && _canvasEl.addEventListener) {
      _canvasEl.addEventListener('mouseleave', _hideDcTooltip);
    } else if (container && container.addEventListener) {
      container.addEventListener('mouseleave', _hideDcTooltip);
    }
  } catch (err) {
    if (container && container.addEventListener) {
      container.addEventListener('mouseleave', _hideDcTooltip);
    }
  }
  var fb = document.getElementById('topoFilterBar');
  if (fb) fb.classList.add('hidden');
  topoFilter = 'all';
  topoHighlightNode = null;
  graph.on('node:click', function(e) {
    var m = e.item.getModel();
    if (m.type !== 'topo-site') return;
    // Hide tooltip before destroying the graph
    _hideDcTooltip();
    topoLevel = 'dc'; topoSelectedDC = m.id;
    renderTopoDC(m.id);
    renderTopoBreadcrumb();
    document.querySelectorAll('.tts-site-item').forEach(function(i) {
      i.classList.toggle('tts-active', i.dataset.id === m.id);
    });
  });
  hideTDPContent();
}

function renderTopoAIOverlay(dcId, edges) {
  var aiData = TOPO_AI_MAP[dcId];
  if (!aiData) return;
  aiData.correlations.forEach(function(c, i) {
    edges.push({
      id: 'ai-' + i, source: c.from, target: c.to,
      label: 'AI \u5173\u8054 ' + c.conf + '%',
      type: 'quadratic',
      style: { stroke: '#7C3AED', lineWidth: 2, lineDash: [6, 3], opacity: 0.85 },
      // 用文字描边代替 background，避免 G6 SVG drawLabelBg 在 quadratic 边端点算 NaN
      labelCfg: { style: { fill: '#7C3AED', fontSize: 9, fontWeight: 700,
        stroke: '#FFFFFF', lineWidth: 3 } },
      curveOffset: -60 - i * 30
    });
  });
}

function renderTopoDC(dcId) {
  var container = document.getElementById('topoMainGraph');
  if (!container) return;
  if (topoG6Graph) { topoG6Graph.destroy(); topoG6Graph = null; }
  // ── 清除全局视图的 ECharts 地图背景层（避免二级视图显示地图）────
  var _mapBg = document.getElementById('topoChinaMapBg');
  if (_mapBg) { if (_mapBg._echartsInst) { try { _mapBg._echartsInst.dispose(); } catch(e){} } _mapBg.remove(); }
  closeAccExpand();
  var W = container.clientWidth || 700;
  var H = container.clientHeight || 420;
  var dcData = dcId === 'dc1' ? TOPO_DC1 : dcId === 'dc2' ? TOPO_DC2 : TOPO_DC3;
  var cMap = { ok: '#16A34A', warn: '#D97706', crit: '#DC2626' };
  var fb = document.getElementById('topoFilterBar');
  if (fb) fb.classList.remove('hidden');
  document.querySelectorAll('.tfb-btn').forEach(function(b) {
    b.classList.toggle('tfb-active', b.dataset.filter === topoFilter);
  });

  // ── 节点均匀分布计算 ──────────────────────────────────────
  var layerNodeMap = {};
  dcData.layers.forEach(function(l) { layerNodeMap[l.id] = []; });
  dcData.nodes.forEach(function(n) { if (layerNodeMap[n.layer]) layerNodeMap[n.layer].push(n); });

  var nLayers = dcData.layers.length;
  var padTop = 44, padBot = 26, padX = 56;
  var layerYStep = nLayers > 1 ? (H - padTop - padBot) / (nLayers - 1) : (H / 2);
  var layerY = {};
  dcData.layers.forEach(function(l, i) { layerY[l.id] = padTop + i * layerYStep; });

  var nodePos = {};
  dcData.layers.forEach(function(l) {
    var lNodes = layerNodeMap[l.id] || [];
    var cnt = lNodes.length;
    var fixedGap = 80;
    var totalSpan = (cnt - 1) * fixedGap;
    var startX = W / 2 - totalSpan / 2;
    if (startX < padX) { fixedGap = cnt > 1 ? (W - 2 * padX) / (cnt - 1) : 0; startX = padX; }
    lNodes.forEach(function(nd, idx) {
      nodePos[nd.id] = {
        x: cnt === 1 ? W / 2 : startX + idx * fixedGap,
        y: layerY[l.id]
      };
    });
  });

  // ── 层级分隔线（HTML 覆盖层）──────────────────────────────
  var wrap = container.parentElement;
  var oldOvl = wrap.querySelector('.topo-layer-overlay');
  if (oldOvl) oldOvl.remove();
  var ovl = document.createElement('div');
  ovl.className = 'topo-layer-overlay';
  dcData.layers.forEach(function(l, i) {
    var y = padTop + i * layerYStep;
    var row = document.createElement('div');
    row.className = 'topo-layer-label';
    row.style.top = (y - 14) + 'px';
    row.textContent = l.label;
    ovl.appendChild(row);
    if (i < nLayers - 1) {
      var sep = document.createElement('div');
      sep.className = 'topo-layer-sep';
      sep.style.top = (y + layerYStep / 2) + 'px';
      ovl.appendChild(sep);
    }
  });
  wrap.appendChild(ovl);

  var nodes = dcData.nodes.map(function(n) {
    return {
      id: n.id, type: 'topo-dev',
      size: [58, 46],
      label: '', nodeLabel: n.label, devType: n.type, status: n.status,
      ip: n.ip, model: n.model, cpu: n.cpu, alerts: n.alerts || 0, role: n.role,
      layer: n.layer,
      x: nodePos[n.id].x, y: nodePos[n.id].y
    };
  });
  var edges = dcData.links.map(function(l, i) {
    var lw = l.type === 'ok' ? 1.4 : 2;
    return {
      id: 'el' + i, source: l.from, target: l.to,
      style: { stroke: cMap[l.type] || '#94A3B8', lineWidth: lw,
        lineDash: l.type === 'crit' ? [4, 4] : l.type === 'warn' ? [6, 3] : null }
    };
  });
  renderTopoAIOverlay(dcId, edges);
  var graph = new G6.Graph({
    container: 'topoMainGraph',
    width: W, height: H,
    renderer: 'svg',
    fitView: false,
    // 节点带 x/y，不需要 layout（preset 在 G6 v4 不存在）
    modes: { default: ['drag-canvas', 'zoom-canvas'] },
    defaultEdge: {
      type: 'line',
      style: { lineWidth: 1.4, endArrow: false }
    },
    edgeStateStyles: { dimmed: { opacity: 0.05 } }
  });
  topoG6Graph = graph;
  graph.data({ nodes: nodes, edges: edges });
  graph.render();
  // ── 为 warn/crit 边附加流动动画 ───────────────────────────
  dcData.links.forEach(function(l, i) {
    if (l.type === 'ok') return;
    var item = graph.findById('el' + i);
    if (!item) return;
    var el = item.getKeyShape().get('el');
    if (el) el.classList.add('anim-dash');
  });
  // AI 关联虚线边也加流动效果
  edges.forEach(function(e) {
    if (e.id && e.id.indexOf('ai-') === 0) {
      var item = graph.findById(e.id);
      if (!item) return;
      var el = item.getKeyShape().get('el');
      if (el) el.classList.add('anim-dash');
    }
  });
  // ── 层级标签跟随画布平移/缩放 ──────────────────────────────
  function syncLayerOverlay() {
    var labels = ovl.querySelectorAll('.topo-layer-label');
    var seps   = ovl.querySelectorAll('.topo-layer-sep');
    dcData.layers.forEach(function(l, i) {
      var gY = padTop + i * layerYStep;
      var cy = graph.getCanvasByPoint(0, gY).y;
      if (labels[i]) labels[i].style.top = (cy - 14) + 'px';
      if (i < dcData.layers.length - 1) {
        var midY = graph.getCanvasByPoint(0, gY + layerYStep / 2).y;
        if (seps[i]) seps[i].style.top = midY + 'px';
      }
    });
    _applyAccPanelPos();
    _applyAIBubblePos();
  }
  graph.on('canvas:drag',    syncLayerOverlay);
  graph.on('canvas:dragend', syncLayerOverlay);
  graph.on('wheelzoom',      syncLayerOverlay);
  if (topoHighlightNode) {
    var hItem = graph.findById(topoHighlightNode);
    if (hItem) graph.setItemState(hItem, 'highlight', true);
  }
  if (topoFilter !== 'all') applyTopoFilter(topoFilter);
  graph.on('node:click', function(e) {
    var m = e.item.getModel();
    graph.getNodes().forEach(function(n) { graph.clearItemStates(n, ['highlight']); });
    graph.setItemState(e.item, 'highlight', true);
    topoHighlightNode = m.id;
    var node = dcData.nodes.find(function(nd) { return nd.id === m.id; });
    if (node) showTopoDevDetail(node);
    // AI 摘要气泡：有 AI 数据的节点显示锚点气泡
    var aiDataMap = TOPO_AI_MAP[dcId];
    var aiEntry = aiDataMap && aiDataMap.nodeAnalysis[m.id];
    if (aiEntry) {
      showAIBubble(m, aiEntry, container, graph);
    } else {
      closeAIBubble();
    }
    // 接入层节点展开下层服务器/VM 视图
    if (m.layer === 'l-acc' && ACC_EXPAND_DATA[m.id]) {
      showAccExpand(node, m.x, m.y, container, graph);
    } else {
      closeAccExpand();
    }
  });
  hideTDPContent();
}

function showTopoDevDetail(node) {
  const ph = document.getElementById('tdpPlaceholder');
  const content = document.getElementById('tdpContent');
  if (ph) ph.classList.add('hidden');
  if (!content) return;
  content.classList.remove('hidden');
  const cMap  = { ok:'#16A34A', warn:'#D97706', crit:'#DC2626' };
  const sLab  = { ok:'正常运行', warn:'告警中', crit:'故障'    };
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
        <button class="tdp-ai-locate-btn" onclick="locateTopoNode('${node.id}')" title="在拓扑中定位">⊕ 定位节点</button>
      </div>
      <div class="tdp-ai-cause">${ai.rootCause}</div>
      ${blastLabels.length > 0 ? `<div style="font-size:9px;color:#6D28D9;font-weight:700;margin-bottom:3px">影响 ${blastLabels.length} 台下游设备</div>
      <div class="tdp-ai-row">${blastLabels.slice(0, 4).map(n => `<span class="tdp-ai-tag">${n}</span>`).join('')}${blastLabels.length > 4 ? `<span class="tdp-ai-tag">+${blastLabels.length - 4}</span>` : ''}</div>` : ''}
      ${ai.predictEta ? `<div class="tdp-ai-risk-bar"><span style="flex-shrink:0">⏱</span>${ai.predictEta}</div>` : ''}
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
      <div class="tdp-kv"><span class="tdp-k">运行状态</span>
        <span class="tdp-v" style="color:${c};font-weight:700">${sLab[node.status]}</span></div>
      <div class="tdp-kv"><span class="tdp-k">管理 IP</span>
        <span class="tdp-v" style="font-family:monospace">${node.ip}</span></div>
      <div class="tdp-kv"><span class="tdp-k">设备型号</span>
        <span class="tdp-v" style="font-size:10px">${node.model}</span></div>
      <div class="tdp-kv"><span class="tdp-k">CPU 使用率</span>
        <span class="tdp-v" style="display:flex;align-items:center;gap:5px">
          <span style="color:${cpuC};font-weight:700;min-width:28px">${node.cpu}%</span>
          <span style="flex:1;height:5px;background:#E5E7EB;border-radius:3px;min-width:44px">
            <span style="display:block;height:100%;width:${node.cpu}%;background:${cpuC};border-radius:3px"></span>
          </span>
        </span>
      </div>
      ${node.alerts > 0 ? `<div class="tdp-kv"><span class="tdp-k">活跃告警</span>
        <span class="tdp-v" style="color:#DC2626;font-weight:700">${node.alerts} 条</span></div>` : ''}
    </div>
    ${node.status !== 'ok' ? `
    <div style="margin-top:8px;padding:8px;background:#FEF2F2;border-radius:6px;border:1px solid #FECACA">
      <div style="font-size:10px;font-weight:700;color:#DC2626;margin-bottom:3px">⚠ 异常说明</div>
      <div style="font-size:10px;color:#7F1D1D">${node.status === 'crit' ? '设备存在严重故障，请立即处置' : '设备存在告警，请关注处理'}</div>
    </div>` : ''}
    <div style="margin-top:10px;display:flex;flex-direction:column;gap:5px">
      <button onclick="switchOpsSub('ops-fault',true)" style="width:100%;padding:6px 10px;font-size:11px;font-weight:600;background:${node.status!=='ok'?'#CF222E':'#636C76'};color:white;border:none;border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:space-between">
        <span>查看该设备的故障事件</span><span>→</span>
      </button>
      <button onclick="switchOpsSub('ops-traffic',true)" style="width:100%;padding:6px 10px;font-size:11px;font-weight:600;background:white;color:#0969DA;border:1px solid #B6E3FF;border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:space-between">
        <span>查看该设备的流量</span><span>→</span>
      </button>
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
  const statusIcon= {'处置中':'sync','已关闭':'check_circle'};
  const filtered = faultFilterSev === 'ALL' ? FAULT_EVENTS : FAULT_EVENTS.filter(f=>f.pri===faultFilterSev);
  const SEV_COLOR = { crit:'#CF222E', warn:'#D09B00', info:'#0969DA' };
  el.innerHTML = filtered.map(f => {
    const raw = f.rawAlerts || [];
    const suppressed = raw.filter(a=>a.suppressed).length;
    const active = raw.filter(a=>!a.suppressed).length;
    const alertRow = raw.length > 0 ? `
      <div class="fli-alert-row" onclick="event.stopPropagation();toggleRawAlerts('fra-${f.id}',this)">
        <span class="material-symbols-rounded fli-alert-icon">notifications</span>
        <span class="fli-alert-text">聚合 <strong>${active}</strong> 条</span>
        ${suppressed > 0 ? `<span class="fli-suppressed-text">· 抑制 ${suppressed} 条</span>` : ''}
        <span class="material-symbols-rounded fli-alert-chevron">expand_more</span>
      </div>
      <div class="fli-raw-alerts" id="fra-${f.id}">
        ${raw.map(a=>`
          <div class="fra-item fra-${a.sev}${a.suppressed?' fra-suppressed':''}">
            <span class="fra-src fra-src-${(a.src||'').toLowerCase()}">${a.src||''}</span>
            <span class="fra-text">${a.text}</span>
            <span class="fra-time">${a.time}</span>
            ${a.suppressed ? '<span class="fra-sup-tag">已抑制</span>' : ''}
          </div>
        `).join('')}
      </div>
    ` : '';
    return `
      <div class="fault-list-item ${selectedFaultId===f.id?'fli-active':''}" data-id="${f.id}" style="border-left:3px solid ${colorMap[f.pri]}">
        <div class="fli-top">
          <span class="fli-pri" style="color:${colorMap[f.pri]};background:${colorMap[f.pri]}15;border-radius:4px;padding:1px 7px;font-size:10.5px;font-weight:700">${f.pri}</span>
          <span class="fli-time">${f.time}</span>
          <span class="material-symbols-rounded fli-status" style="font-size:13px;color:${f.status==='处置中'?'#D09B00':'#636C76'}">${statusIcon[f.status]||'help'}</span>
          <span class="fli-status-label">${f.status}</span>
        </div>
        <div class="fli-title">${f.title}</div>
        <div class="fli-tags">${f.tags.map(t=>`<span class="fli-tag">${t}</span>`).join('')}</div>
        ${alertRow}
      </div>
    `;
  }).join('');
  el.querySelectorAll('.fault-list-item').forEach(item => {
    item.addEventListener('click', () => selectFault(item.dataset.id));
  });
}

function selectFault(id) {
  selectedFaultId = id;
  renderFaultList();
  renderFaultRca(id);
  renderFaultImpact(id);
  renderFaultActions(id);
}

function renderFaultRca(id) {
  const fault = FAULT_EVENTS.find(f => f.id === id);
  const el = document.getElementById('faultRcaBody');
  if (!fault || !el) return;
  const r = fault.rca;
  el.innerHTML = `
    <div class="frca-conf-row">
      <span class="frca-conf-label">AI 根因置信度</span>
      <span class="frca-conf-pct" style="color:${r.color}">${r.conf}%</span>
      <div class="frca-conf-bar-wrap"><div class="frca-conf-bar" style="width:${r.conf}%;background:${r.color}"></div></div>
    </div>
    <div class="frca-root-cause">${r.rootCause}</div>
    <div class="frca-chain-title">因果链路</div>
    <div class="frca-chain">
      ${r.chain.map((c,i) => `
        <div class="frca-chain-item frca-sev-${c.sev}" id="fci-${id}-${i}">
          <div class="frca-chain-connector">${i>0?'↓':''}</div>
          <div class="frca-chain-content" onclick="toggleFaultChainItem('fci-${id}-${i}')">
            <span class="material-symbols-rounded frca-chain-icon">${c.icon}</span>
            <div class="frca-chain-main">
              <span class="frca-chain-text">${c.text}</span>
              <div class="frca-chain-meta">
                ${c.src ? `<span class="frca-chain-src-badge ${(c.src||'').toLowerCase()}">${c.src}</span>` : ''}
                ${c.conf != null ? `<span class="frca-chain-step-conf">步骤置信 ${c.conf}%</span>` : ''}
              </div>
            </div>
            <span class="frca-chain-time">${c.time}</span>
            ${c.detail ? `<span class="material-symbols-rounded frca-chain-expand-icon">expand_more</span>` : ''}
          </div>
          ${c.detail ? `<div class="frca-chain-detail">${c.detail}</div>` : ''}
        </div>
      `).join('')}
    </div>
    <div class="frca-sources-title">数据来源</div>
    <div class="frca-sources">${r.dataSources.map(s=>`<span class="frca-src">${s}</span>`).join('')}</div>
    <div style="margin-top:12px;padding-top:10px;border-top:1px solid #E5E7EB">
      <div style="font-size:10px;font-weight:700;color:#8C959F;margin-bottom:6px">跨模块分析</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        <button onclick="switchOpsSub('ops-topo',true)" style="width:100%;padding:6px 10px;font-size:11px;font-weight:600;background:#F5F0FF;color:#6E40C9;border:1px solid #E2D9F3;border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:space-between">
          <span>在网络拓扑中定位设备</span><span>→</span>
        </button>
        ${fault.tags.some(t => /WAN|带宽|流量/.test(t)) ? `
        <button onclick="switchOpsSub('ops-traffic',true)" style="width:100%;padding:6px 10px;font-size:11px;font-weight:600;background:#EFF6FF;color:#0969DA;border:1px solid #BFDBFE;border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:space-between">
          <span>查看链路流量详情</span><span>→</span>
        </button>` : ''}
      </div>
    </div>
  `;
}

function renderFaultImpact(id) {
  const fault = FAULT_EVENTS.find(f => f.id === id);
  const el = document.getElementById('faultImpactBody');
  if (!fault || !el) return;
  const layers = (fault.rca && fault.rca.impactLayers) || [];
  const STATUS_DOT = { crit:'#CF222E', warn:'#D09B00', ok:'#1A7F37' };
  const layerCount = layers.reduce((n,l)=>n+l.items.length, 0);
  el.innerHTML = `
    <div class="fimp2-summary">
      <span class="fimp2-count">${layerCount}</span>
      <span class="fimp2-count-label">受影响实体</span>
      <span class="fimp2-domain-tag">${fault.domain}</span>
    </div>
    <div class="fimp2-layers">
      ${layers.map((layer, li) => `
        <div class="fimp2-layer">
          <div class="fimp2-layer-hdr">
            <span class="material-symbols-rounded fimp2-layer-icon" style="color:${layer.color}">${layer.icon}</span>
            <span class="fimp2-layer-name">${layer.layer}</span>
            <span class="fimp2-layer-count">${layer.items.length}</span>
          </div>
          <div class="fimp2-items">
            ${layer.items.map(item => `
              <div class="fimp2-item fimp2-item-${item.status}">
                <span class="fimp2-dot" style="background:${STATUS_DOT[item.status]||'#636C76'}"></span>
                <span class="fimp2-item-name">${item.name}</span>
                ${item.note ? `<span class="fimp2-item-note">${item.note}</span>` : ''}
                ${item.sla ? `<span class="fimp2-sla-badge">${item.sla}</span>` : ''}
              </div>
            `).join('')}
          </div>
          ${li < layers.length-1 ? '<div class="fimp2-arrow">↓ 传导</div>' : ''}
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

function renderFaultActions(id) {
  var fault = FAULT_EVENTS.find(function(f){ return f.id === id; });
  var el = document.getElementById('faultActionBody');
  if (!fault || !el) return;
  var actions = (fault.rca && fault.rca.actions) || [];
  if (actions.length === 0) { el.innerHTML = '<div class="fact-empty">暂无处置建议</div>'; return; }
  el.innerHTML = actions.map(function(a) {
    return [
      '<div class="fact-item' + (a.urgent ? ' fact-urgent' : '') + '">',
        '<div class="fact-step-num">' + a.step + '</div>',
        '<div class="fact-body">',
          '<div class="fact-title-row">',
            '<span class="fact-title">' + a.title + '</span>',
            (a.urgent ? '<span class="fact-urgent-badge">立即</span>' : '<span class="fact-plan-badge">计划</span>'),
          '</div>',
          '<div class="fact-desc">' + a.desc + '</div>',
          '<div class="fact-meta-row">',
            '<span class="fact-effect-icon material-symbols-rounded">check_circle</span>',
            '<span class="fact-effect">' + a.effect + '</span>',
          '</div>',
          '<div class="fact-foot-row">',
            '<span class="fact-foot-item"><span class="material-symbols-rounded fact-foot-icon">person</span>' + a.tool + '</span>',
            '<span class="fact-foot-item"><span class="material-symbols-rounded fact-foot-icon">schedule</span>' + a.eta + '</span>',
          '</div>',
        '</div>',
      '</div>',
    ].join('');
  }).join('<div class="fact-connector"></div>');
}

function toggleFaultChainItem(itemId) {
  var item = document.getElementById(itemId);
  if (item) item.classList.toggle('expanded');
}

function toggleRawAlerts(panelId, rowEl) {
  var panel = document.getElementById(panelId);
  if (!panel) return;
  var expanded = panel.classList.toggle('expanded');
  var chevron = rowEl && rowEl.querySelector('.fli-alert-chevron');
  if (chevron) chevron.style.transform = expanded ? 'rotate(180deg)' : '';
}


// ── 设备台账 ─────────────────────────────────────────────
function initOpsInventory() {
  invAllDevices = [...INV_DEVICES];
  bindInvFilters();
  renderInvTable('');
  var tbody = document.getElementById('invTableBody');
  if (tbody && !tbody.dataset.detailBound) {
    tbody.dataset.detailBound = '1';
    tbody.addEventListener('click', function(e) {
      var btn = e.target.closest('.inv-act-btn');
      if (!btn) return;
      var dev = INV_DEVICES.find(function(d) { return d.name === btn.dataset.name; });
      if (dev) showInvDevDetail(dev);
    });
  }
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
      <td class="inv-td">${d.alerts>0?`<span style="color:#CF222E;font-weight:700">${d.alerts}</span>`:'<span style="color:#636C76">—</span>'}</td>
      <td class="inv-td inv-td-insp">${d.lastInsp}</td>
      <td class="inv-td"><button class="inv-act-btn" data-name="${d.name}">详情</button></td>
    </tr>
  `).join('');
  // Update count
  const countEl = document.getElementById('invCount');
  if (countEl) countEl.textContent = `共 ${rows.length} 台`;
}

function showInvDevDetail(d) {
  var ex = INV_DEV_EXTRA[d.name] || {
    sn:'—', firmware:'—', uptime:'—', warrantyEnd:'—', rackPos:d.zone, deployDate:'—',
    aiScore:d.health==='正常'?80:58, aiRisk:d.health==='正常'?'low':'med',
    aiSummary:'AI 分析数据加载中…',
    aiTips:[{type:'info', text:'暂无 AI 建议数据'}],
    cpuTrend:[d.cpu,d.cpu,d.cpu,d.cpu,d.cpu,d.cpu,d.cpu,d.cpu,d.cpu,d.cpu,d.cpu,d.cpu],
    ports:[], changes:[]
  };
  var sc = ex.aiScore;
  var scColor = sc>=80?'#1A7F37':sc>=60?'#D09B00':'#CF222E';
  var scBg    = sc>=80?'#E8F4ED':sc>=60?'#FFF8E5':'#FFEBE9';
  var r = 22, circ = +(2*Math.PI*r).toFixed(1);
  var scoreRing = '<svg width="52" height="52" viewBox="0 0 52 52">'
    +'<circle cx="26" cy="26" r="'+r+'" fill="none" stroke="#E8ECF0" stroke-width="5"/>'
    +'<circle cx="26" cy="26" r="'+r+'" fill="none" stroke="'+scColor+'" stroke-width="5"'
    +' stroke-dasharray="'+circ+'" stroke-dashoffset="'+(circ*(1-sc/100)).toFixed(1)+'"'
    +' stroke-linecap="round" transform="rotate(-90 26 26)"/>'
    +'<text x="26" y="30" text-anchor="middle" font-size="13" font-weight="700" fill="'+scColor+'">'+sc+'</text>'
    +'</svg>';

  function sparkline(data, color) {
    var max = Math.max.apply(null,data), min = Math.min.apply(null,data), range = max-min||1;
    var pts = data.map(function(v,i){
      return ((i/(data.length-1))*110).toFixed(1)+','+(26-((v-min)/range)*20).toFixed(1);
    }).join(' ');
    return '<svg viewBox="0 0 110 28" width="110" height="28"><polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  }

  var riskLabel = {low:'AI风险：低', med:'AI风险：中', high:'AI风险：高'}[ex.aiRisk]||'AI风险：低';
  var cpuColor = d.cpu>=85?'#CF222E':d.cpu>=70?'#D09B00':'#1A7F37';
  var memColor = d.mem>=85?'#CF222E':d.mem>=70?'#D09B00':'#1A7F37';
  var hColor   = d.health==='告警'?'#D09B00':d.health==='故障'?'#CF222E':'#1A7F37';
  var portPct  = Math.round(d.portUsed/d.portTotal*100);
  var tipMap   = {ok:['#1A7F37','#E8F4ED','check_circle'], warn:['#D09B00','#FFF8E5','warning'], crit:['#CF222E','#FFEBE9','error'], info:['#0969DA','#EEF6FF','info']};
  var chgColor = {auto:'#6E40C9', manual:'#0969DA', upgrade:'#1A7F37', alert:'#CF222E'};
  var chgLabel = {auto:'自动', manual:'人工', upgrade:'升级', alert:'告警'};
  var portSt   = {up:['#1A7F37','up'], down:['#636C76','down'], err:['#CF222E','err']};

  // Alerts section
  var related = FAULT_EVENTS.filter(function(ev){ return ev.tags&&ev.tags.some(function(t){ return t===d.name; }); });
  var alertsHtml = '';
  if (d.alerts>0 && related.length>0) {
    alertsHtml = related.map(function(ev){
      var sev = ev.pri==='P1'?'#CF222E':ev.pri==='P2'?'#D09B00':'#636C76';
      return '<div style="display:flex;align-items:flex-start;gap:8px;padding:8px 10px;background:#FAFAFA;border-radius:6px;border-left:3px solid '+sev+'">'
        +'<span class="material-symbols-rounded" style="font-size:16px;color:'+sev+';flex-shrink:0;margin-top:1px;font-variation-settings:\'FILL\' 1,\'wght\' 400,\'GRAD\' 0,\'opsz\' 20">'+ev.icon+'</span>'
        +'<div style="flex:1"><div style="font-size:12px;font-weight:600;color:#1F2328">'+ev.title+'</div>'
        +'<div style="font-size:11px;color:#636C76;margin-top:2px">'+ev.id+' · '+ev.status+' · 今日 '+ev.time+'</div></div>'
        +'<span style="margin-left:auto;font-size:10px;font-weight:700;color:'+sev+';background:'+sev+'20;padding:2px 7px;border-radius:10px;flex-shrink:0">'+ev.pri+'</span></div>';
    }).join('');
  } else if (d.alerts>0) {
    alertsHtml = '<div style="padding:9px 12px;background:#FFF8E5;border-radius:6px;border-left:3px solid #D09B00;font-size:12px;color:#9A6700">⚠ 该设备当前有 '+d.alerts+' 条活跃告警</div>';
  } else {
    alertsHtml = '<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:#E8F4ED;border-radius:8px">'
      +'<span class="material-symbols-rounded" style="color:#1A7F37;font-size:18px;font-variation-settings:\'FILL\' 1,\'wght\' 400,\'GRAD\' 0,\'opsz\' 20">check_circle</span>'
      +'<span style="font-size:12px;color:#1A7F37;font-weight:600">AI 检测：无活跃告警，设备行为基线正常</span></div>';
  }

  var tipsHtml = ex.aiTips.map(function(t){
    var tm = tipMap[t.type]||tipMap.info;
    return '<div style="display:flex;align-items:flex-start;gap:8px;padding:9px 12px;background:'+tm[1]+';border-radius:7px;border-left:3px solid '+tm[0]+'">'
      +'<span class="material-symbols-rounded" style="font-size:16px;color:'+tm[0]+';flex-shrink:0;margin-top:1px;font-variation-settings:\'FILL\' 1,\'wght\' 400,\'GRAD\' 0,\'opsz\' 20">'+tm[2]+'</span>'
      +'<span style="font-size:12px;color:#1F2328;line-height:1.5">'+t.text+'</span></div>';
  }).join('');

  var portsHtml = ex.ports.length>0 ? ex.ports.map(function(p){
    var ps = portSt[p.status]||portSt.down;
    var pc = p.util>=85?'#CF222E':p.util>=70?'#D09B00':'#1A7F37';
    return '<div style="display:grid;grid-template-columns:82px 34px 44px 1fr 68px;align-items:center;gap:6px;padding:5px 8px;background:#FAFAFA;border-radius:5px;font-size:11px">'
      +'<span style="font-family:monospace;color:#1F2328;font-weight:600">'+p.name+'</span>'
      +'<span style="color:'+ps[0]+';font-weight:700">'+ps[1]+'</span>'
      +'<span style="color:#636C76">'+p.speed+'</span>'
      +'<span style="color:#57606A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+p.peer+'</span>'
      +'<div style="display:flex;align-items:center;gap:4px"><div style="flex:1;height:4px;background:#E8ECF0;border-radius:2px;overflow:hidden"><div style="width:'+p.util+'%;height:100%;background:'+pc+';border-radius:2px"></div></div>'
      +'<span style="color:'+pc+';font-weight:600;width:28px;text-align:right">'+p.util+'%</span></div></div>';
  }).join('') : '<div style="font-size:12px;color:#636C76;text-align:center;padding:12px">暂无端口数据</div>';

  var changesHtml = ex.changes.length>0 ? ex.changes.map(function(c,i){
    var cc = chgColor[c.type]||'#636C76', cl = chgLabel[c.type]||c.type;
    return '<div style="display:flex;gap:10px;align-items:flex-start;padding:6px 0;'+(i<ex.changes.length-1?'border-bottom:1px solid #F0F3F6':'')+'">'
      +'<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">'
      +'<div style="width:8px;height:8px;border-radius:50%;background:'+cc+';margin-top:3px;flex-shrink:0"></div>'
      +(i<ex.changes.length-1?'<div style="width:1px;flex:1;background:#E8ECF0;min-height:16px;margin-top:4px"></div>':'')
      +'</div><div><div style="font-size:12px;color:#1F2328">'+c.desc+'</div>'
      +'<div style="font-size:10px;color:#636C76;margin-top:2px">'+c.time+' · '+c.user+' · <span style="color:'+cc+'">'+cl+'</span></div></div></div>';
  }).join('') : '<div style="font-size:12px;color:#636C76;text-align:center;padding:12px">暂无变更记录</div>';

  var infoRows = [['型号',d.model],['序列号',ex.sn],['固件版本',ex.firmware],['投运日期',ex.deployDate],['运行时长',ex.uptime],['机柜位置',ex.rackPos],['维保到期',ex.warrantyEnd]].map(function(row){
    return '<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #EAEEF2;font-size:11px">'
      +'<span style="color:#636C76;flex-shrink:0">'+row[0]+'</span>'
      +'<span style="color:#1F2328;font-weight:600;max-width:180px;text-align:right;word-break:break-all">'+row[1]+'</span></div>';
  }).join('');

  document.getElementById('invDevBody').innerHTML =
    // AI 诊断条
    '<div style="background:'+scBg+';border-radius:10px;padding:12px 14px;display:flex;gap:12px;align-items:flex-start;border:1px solid '+scColor+'30">'
    +'<span class="material-symbols-rounded" style="font-size:20px;color:'+scColor+';flex-shrink:0;margin-top:1px;font-variation-settings:\'FILL\' 1,\'wght\' 400,\'GRAD\' 0,\'opsz\' 24">auto_awesome</span>'
    +'<div style="flex:1"><div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">'
    +'<span style="font-size:11px;font-weight:700;color:'+scColor+';background:'+scColor+'20;padding:2px 8px;border-radius:10px">'+riskLabel+'</span>'
    +'<span style="font-size:11px;color:#636C76">AI 综合诊断</span></div>'
    +'<div style="font-size:12px;color:#1F2328;line-height:1.65">'+ex.aiSummary+'</div></div></div>'
    // 基本信息 + 实时性能
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
    +'<div style="background:#F6F8FA;border-radius:8px;padding:12px">'
    +'<div style="font-size:11px;font-weight:700;color:#636C76;letter-spacing:.5px;margin-bottom:10px">基本信息</div>'
    +infoRows+'</div>'
    +'<div style="background:#F6F8FA;border-radius:8px;padding:12px">'
    +'<div style="font-size:11px;font-weight:700;color:#636C76;letter-spacing:.5px;margin-bottom:10px">实时性能</div>'
    +'<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span style="color:#636C76">CPU 利用率</span><span style="color:'+cpuColor+';font-weight:700">'+d.cpu+'%</span></div>'
    +'<div style="height:5px;background:#E8ECF0;border-radius:3px;overflow:hidden;margin-bottom:6px"><div style="width:'+d.cpu+'%;height:100%;background:'+cpuColor+';border-radius:3px"></div></div>'
    +'<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:10px;color:#636C76">12h 趋势</span>'
    +sparkline(ex.cpuTrend,cpuColor)+'</div></div>'
    +'<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span style="color:#636C76">内存利用率</span><span style="color:'+memColor+';font-weight:700">'+d.mem+'%</span></div>'
    +'<div style="height:5px;background:#E8ECF0;border-radius:3px;overflow:hidden"><div style="width:'+d.mem+'%;height:100%;background:'+memColor+';border-radius:3px"></div></div></div>'
    +'<div><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span style="color:#636C76">端口占用</span><span style="color:#1F2328;font-weight:700">'+d.portUsed+'/'+d.portTotal+'</span></div>'
    +'<div style="height:5px;background:#E8ECF0;border-radius:3px;overflow:hidden"><div style="width:'+portPct+'%;height:100%;background:#0969DA;border-radius:3px"></div></div></div></div></div>'
    // 活跃告警
    +'<div><div style="font-size:11px;font-weight:700;color:#636C76;letter-spacing:.5px;margin-bottom:8px">活跃告警</div>'
    +'<div style="display:flex;flex-direction:column;gap:6px">'+alertsHtml+'</div></div>'
    // AI 运维建议
    +'<div><div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">'
    +'<span class="material-symbols-rounded" style="font-size:16px;color:#8250DF;font-variation-settings:\'FILL\' 1,\'wght\' 400,\'GRAD\' 0,\'opsz\' 20">auto_awesome</span>'
    +'<span style="font-size:11px;font-weight:700;color:#636C76;letter-spacing:.5px">AI 运维建议</span></div>'
    +'<div style="display:flex;flex-direction:column;gap:6px">'+tipsHtml+'</div></div>'
    // 端口快览
    +'<div><div style="font-size:11px;font-weight:700;color:#636C76;letter-spacing:.5px;margin-bottom:8px">端口快览</div>'
    +'<div style="display:flex;flex-direction:column;gap:4px">'+portsHtml+'</div></div>'
    // 变更历史
    +'<div><div style="font-size:11px;font-weight:700;color:#636C76;letter-spacing:.5px;margin-bottom:8px">近期变更历史</div>'
    +'<div>'+changesHtml+'</div></div>';

  document.getElementById('invDevTitle').textContent = d.name;
  document.getElementById('invDevSubtitle').textContent = d.type + ' · ' + d.ip + ' · ' + d.room;
  document.getElementById('invDevScoreRing').innerHTML = scoreRing;
  document.getElementById('invDevHealthBadge').innerHTML = '<span style="font-size:11px;font-weight:700;color:'+hColor+';background:'+hColor+'15;padding:3px 10px;border-radius:10px;border:1px solid '+hColor+'40">'+d.health+'</span>';
  document.getElementById('invDevOverlay').classList.add('open');
  document.getElementById('invDevDrawer').classList.add('open');
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
    { id:'capKpiWan',  label:'WAN-01 利用率', val:'84%',  trend:'+2%/天', sev:'crit' },
    { id:'capKpiCore', label:'核心层峰值',     val:'89%',  trend:'SW-Core-02热降频', sev:'crit' },
    { id:'capKpiAgg',  label:'汇聚层利用率',   val:'67%',  trend:'正常', sev:'ok' },
    { id:'capKpiPort', label:'端口利用率',      val:'68%',  trend:'+1.2%/月', sev:'ok' },
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
        {label:'80%阈值 (900Mbps)',data:threshold,borderColor:'#CF222E', borderDash:[3,3], backgroundColor:'transparent', fill:false, pointRadius:0, borderWidth:1.5},
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

