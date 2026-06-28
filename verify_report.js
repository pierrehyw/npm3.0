// 简单的页面验证脚本 - 在浏览器控制台运行
console.log('=== 链路性能报表验证 ===');

// 检查 ECharts 是否加载
if (typeof echarts === 'undefined') {
  console.error('❌ ECharts 未加载');
} else {
  console.log('✅ ECharts 已加载');
}

// 检查所有图表容器
const charts = [
  { id: 'healthRingChart', name: '健康度环形图' },
  { id: 'trendChart', name: '趋势折线图' },
  { id: 'topUtilChart', name: 'Top 5 利用率柱状图' },
  { id: 'topLossChart', name: 'Top 5 丢包率柱状图' },
  { id: 'radarChart', name: '雷达图' }
];

charts.forEach(chart => {
  const el = document.getElementById(chart.id);
  const hasCanvas = el && el.querySelector('canvas');
  console.log(`${hasCanvas ? '✅' : '❌'} ${chart.name}`);
});

// 检查表格
const tableRows = document.querySelectorAll('#linkTableBody tr');
console.log(`${tableRows.length === 10 ? '✅' : '❌'} 链路明细表格 (${tableRows.length}/10 行)`);

// 检查 KPI 数据
const kpis = [
  { id: 'kpiHealthScore', name: '健康度评分' },
  { id: 'kpiLatency', name: '平均时延' },
  { id: 'kpiUtilization', name: '峰值利用率' },
  { id: 'kpiAnomalyCount', name: '异常链路数' }
];

kpis.forEach(kpi => {
  const el = document.getElementById(kpi.id);
  const hasData = el && el.textContent.trim() !== '' && el.textContent.trim() !== '0';
  console.log(`${hasData ? '✅' : '⚠️'} KPI - ${kpi.name}: ${el?.textContent}`);
});

console.log('=== 验证完成 ===');
