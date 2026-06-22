// ── Chart.js Trend Chart ─────────────────────────────

const LABELS = ['14:00', '14:10', '14:20', '14:23', '14:30', '14:40', '14:50', '15:00'];
const P99_DATA =    [320, 330, 325, 980, 1180, 1230, 1210, 1230];
const ERR_DATA =    [0.1, 0.1, 0.1, 0.5, 0.7,  0.8,  0.75, 0.8];
const EVENT_IDX = 3; // index of 14:23

// Vertical event line plugin
const eventLinePlugin = {
  id: 'eventLine',
  afterDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const x = scales.x.getPixelForValue(LABELS[EVENT_IDX]);
    ctx.save();
    ctx.strokeStyle = '#F2A8AE';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.restore();
  }
};

window.addEventListener('DOMContentLoaded', () => {
  // ── Trend Chart ──────────────────────────────────────
  const canvas = document.getElementById('trendChart');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      plugins: [eventLinePlugin],
      data: {
        labels: LABELS,
        datasets: [
          {
            label: 'P99 (ms)',
            data: P99_DATA,
            borderColor: '#0550AE',
            backgroundColor: 'rgba(5,80,174,0.06)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: P99_DATA.map((_, i) => i === EVENT_IDX ? '#CF222E' : '#0550AE'),
            pointRadius: P99_DATA.map((_, i) => i === EVENT_IDX ? 5 : 2.5),
            tension: 0.3,
            yAxisID: 'y',
            fill: false,
          },
          {
            label: '错误率 (%)',
            data: ERR_DATA,
            borderColor: '#CF222E',
            backgroundColor: 'rgba(207,34,46,0.06)',
            borderWidth: 2,
            pointRadius: ERR_DATA.map((_, i) => i === EVENT_IDX ? 5 : 2.5),
            pointBackgroundColor: ERR_DATA.map((_, i) => i === EVENT_IDX ? '#CF222E' : '#CF222E'),
            tension: 0.3,
            yAxisID: 'y1',
            fill: false,
            borderDash: [4, 3],
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1F2328',
            titleFont: { family: 'Inter', size: 11 },
            bodyFont: { family: 'Geist Mono', size: 11 },
            padding: 8,
            cornerRadius: 6,
            callbacks: {
              afterTitle(items) {
                if (items[0].dataIndex === EVENT_IDX) return '⚠ 异常触发点';
                return '';
              },
              label(item) {
                if (item.datasetIndex === 0) return ` P99: ${item.raw} ms`;
                return ` 错误率: ${item.raw}%`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#F0F3F6' },
            ticks: { font: { family: 'Geist Mono', size: 10 }, color: '#8C959F', maxRotation: 0 },
          },
          y: {
            position: 'left',
            min: 0, max: 1500,
            grid: { color: '#F0F3F6' },
            ticks: {
              font: { family: 'Geist Mono', size: 10 },
              color: '#0550AE',
              stepSize: 500,
              callback: v => v + 'ms'
            },
            title: { display: false }
          },
          y1: {
            position: 'right',
            min: 0, max: 1.2,
            grid: { drawOnChartArea: false },
            ticks: {
              font: { family: 'Geist Mono', size: 10 },
              color: '#CF222E',
              stepSize: 0.4,
              callback: v => v.toFixed(1) + '%'
            }
          }
        }
      }
    });
  }

  // ── Time Dropdown ────────────────────────────────────
  const timeBtnMain = document.getElementById('timeBtnMain');
  const timeDropdown = document.getElementById('timeDropdown');

  if (timeBtnMain && timeDropdown) {
    timeBtnMain.addEventListener('click', (e) => {
      e.stopPropagation();
      const r = timeBtnMain.getBoundingClientRect();
      timeDropdown.style.top = (r.bottom + 4) + 'px';
      timeDropdown.style.right = (window.innerWidth - r.right) + 'px';
      timeDropdown.style.left = 'auto';
      timeDropdown.classList.toggle('open');
    });
    timeDropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        document.getElementById('timeLabelMain').textContent = item.dataset.val;
        timeDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        timeDropdown.classList.remove('open');
      });
    });
    document.addEventListener('click', () => timeDropdown.classList.remove('open'));
  }

  // ── Table Row Click → Highlight ──────────────────────
  document.querySelectorAll('#urlTableBody tr').forEach(row => {
    row.addEventListener('click', () => {
      document.querySelectorAll('#urlTableBody tr').forEach(r => r.style.outline = '');
      row.style.outline = '2px solid #6E40C9';
      row.style.outlineOffset = '-2px';
    });
  });

  // ── Status Chip Toggle ────────────────────────────────
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('chip-selected');
    });
  });

  // ── Long tail hint ────────────────────────────────────
  const hint = document.querySelector('.long-tail-hint');
  if (hint) {
    hint.addEventListener('click', () => {
      alert('长尾分布图：P99/P50 比值超过 2.6×，表明存在显著尾延迟。建议查看耗时分位数分布图。');
    });
  }

  // ── AI Copilot btn ────────────────────────────────────
  const aiBtn = document.querySelector('.btn-ai');
  if (aiBtn) {
    aiBtn.addEventListener('click', () => {
      aiBtn.textContent = '';
      const icon = document.createElement('span');
      icon.className = 'material-symbols-rounded';
      icon.textContent = 'neurology';
      icon.style.fontSize = '13px';
      aiBtn.appendChild(icon);
      const txt = document.createElement('span');
      txt.textContent = '分析中…';
      aiBtn.appendChild(txt);
      setTimeout(() => {
        aiBtn.innerHTML = '';
        const i2 = document.createElement('span');
        i2.className = 'material-symbols-rounded';
        i2.textContent = 'neurology';
        i2.style.fontSize = '13px';
        aiBtn.appendChild(i2);
        const t2 = document.createElement('span');
        t2.textContent = 'AI Copilot';
        aiBtn.appendChild(t2);
      }, 2000);
    });
  }
});
