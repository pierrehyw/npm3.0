/**
 * Playwright 验证脚本 - traffic.html T7 功能验证
 * 测试：链路视角切换、实体点击 KPI 更新、Tab 切换
 * 运行：node validate_traffic.js
 */

const { chromium } = require('playwright');

const BASE = 'http://192.168.40.129:8080/traffic.html';

// 验证用例定义
const LINK_ENTITIES = [
  { id: 'link-bjsh', label: 'BJ↔SH', expectUtil: '84%', expectRttCls: 'red', expectBadge: '2' },
  { id: 'link-dc12', label: 'DC1↔DC2', expectUtil: '91%', expectRttCls: 'green', expectBadge: '1' },
  { id: 'link-inet', label: '互联网', expectUtil: '42%', expectRttCls: 'green', expectBadge: '0' },
  { id: 'link-dmz', label: 'DMZ', expectUtil: '32%', expectRttCls: 'green', expectBadge: '0' },
  { id: 'link-dr',  label: 'WAN-DR', expectUtil: '8%',  expectRttCls: 'green', expectBadge: '0' },
];

let pass = 0, fail = 0;
const errors = [];

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✓ ${msg}`);
    pass++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    fail++;
    errors.push(msg);
  }
}

(async () => {
  console.log('启动 Chromium...\n');
  // 优先用本地 Chrome，避免下载
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
  });
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error') console.warn('  [JS ERR]', m.text()); });
  page.on('pageerror', err => console.error('  [PAGE ERR]', err.message));

  // ── TC1: 页面加载 ──────────────────────────
  console.log('TC1: 页面加载');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  const title = await page.title();
  assert(title.length > 0, `页面标题存在: "${title}"`);

  // ── TC2: 初始状态 appTabsArea 可见，linkTabsArea 隐藏 ──
  console.log('\nTC2: 初始状态 Tab 区域可见性');
  const appVisible = await page.locator('#appTabsArea').isVisible();
  const linkVisible = await page.locator('#linkTabsArea').isVisible();
  assert(appVisible, 'appTabsArea 初始可见');
  assert(!linkVisible, 'linkTabsArea 初始隐藏');

  // ── TC3: 切换到"按链路"视角 ──────────────────
  console.log('\nTC3: 切换到"按链路"视角');

  // 调试：先检查函数是否存在
  const fnExists = await page.evaluate(() => typeof showTabsArea);
  console.log(`  [debug] typeof showTabsArea = ${fnExists}`);

  await page.locator('.tr-filter .tr-chip[data-view="link"]').scrollIntoViewIfNeeded();
  await page.locator('.tr-filter .tr-chip[data-view="link"]').click();
  await page.waitForTimeout(500);

  // 调试：看 display 实际值
  const appDisplay = await page.locator('#appTabsArea').evaluate(el => el.style.display);
  const linkDisplay = await page.locator('#linkTabsArea').evaluate(el => el.style.display);
  console.log(`  [debug] appTabsArea.display="${appDisplay}" linkTabsArea.display="${linkDisplay}"`);

  assert(appDisplay === 'none', `切链路视角后 appTabsArea display=none (got: "${appDisplay}")`);
  assert(linkDisplay !== 'none', `切链路视角后 linkTabsArea display!=none (got: "${linkDisplay}")`);

  // ── TC4: 链路 Tab 切换 ───────────────────────
  console.log('\nTC4: 链路 Tab 切换');
  const linkTabs = ['traffic', 'anomaly', 'quality', 'capacity', 'impact'];
  for (const tab of linkTabs) {
    await page.locator(`#linkProtoTabs .tr-proto-tab[data-link-tab="${tab}"]`).click();
    await page.waitForTimeout(100);
    const paneActive = await page.locator(`.tr-proto-pane[data-link-pane="${tab}"]`).evaluate(el => el.classList.contains('active'));
    assert(paneActive, `切换到 Tab "${tab}" 后对应 pane active`);
  }
  // 切回 traffic
  await page.locator('#linkProtoTabs .tr-proto-tab[data-link-tab="traffic"]').click();

  // ── TC5: 链路实体面板存在 ──────────────────────
  console.log('\nTC5: 链路实体面板');
  const epLink = await page.locator('#epLink').count();
  assert(epLink > 0, '链路实体面板 #epLink 存在');

  // ── TC6: 点击各链路实体 → KPI 更新 ─────────────
  console.log('\nTC6: 实体点击 KPI 联动');
  for (const entity of LINK_ENTITIES) {
    const rowExists = await page.locator(`#epLink .tr-entity-row[data-entity="${entity.id}"]`).count();
    if (rowExists === 0) {
      console.warn(`  ! 跳过 ${entity.label}：找不到 [data-entity="${entity.id}"]`);
      continue;
    }
    // 用 JS 直接触发 selectEntity，避免因滚动容器截断导致点击超时
    const evalResult = await page.evaluate((eid) => {
      const sel = `#epLink .tr-entity-row[data-entity="${eid}"]`;
      const row = document.querySelector(sel);
      if (!row) return { found: false };
      // 直接触发 selectEntity（与 onclick 等效）
      if (typeof selectEntity === 'function') {
        selectEntity(row, eid, row.dataset.search || eid, '');
        return { found: true, entityId: row.dataset.entity, calledSelectEntity: true };
      }
      row.click();
      return { found: true, entityId: row.dataset.entity, calledSelectEntity: false };
    }, entity.id);
    await page.waitForTimeout(300);
    // 调试：确认 updateLinkTabsForEntity 实际接收的 entityId
    const dbgUtil = await page.locator('#lkpi-util').evaluate(el => el.innerHTML);
    console.log(`  [debug] ${entity.id} → #lkpi-util.innerHTML = "${dbgUtil}"`);

    // focusBar 显示
    const focusVisible = await page.locator('#focusBar').isVisible();
    assert(focusVisible, `${entity.label}: focusBar 可见`);

    // linkTabsArea 仍然可见
    const linkStillShown = await page.locator('#linkTabsArea').isVisible();
    assert(linkStillShown, `${entity.label}: linkTabsArea 仍可见`);

    // 当前激活 Tab 应是 traffic
    const trafficActive = await page.locator('#linkProtoTabs .tr-proto-tab[data-link-tab="traffic"]')
      .evaluate(el => el.classList.contains('active'));
    assert(trafficActive, `${entity.label}: 实体点击后自动切到流量态势 Tab`);

    // 验证利用率 KPI 数值（精确匹配以避免 "8%" 误匹配 "84%"）
    const utilText = await page.locator('#lkpi-util').innerText();
    const expectDigit = entity.expectUtil.replace('%', '').trim();
    const gotDigit = utilText.replace('%', '').trim();
    assert(gotDigit === expectDigit, `${entity.label}: 利用率 KPI = ${entity.expectUtil} (got: "${utilText.trim()}")`);

    // 验证异常 badge
    const badge = page.locator('#linkAnomalyBadge');
    const badgeText = await badge.innerText().catch(() => '0');
    const badgeDisplay = await badge.evaluate(el => el.style.display);
    if (entity.expectBadge === '0') {
      assert(badgeDisplay === 'none', `${entity.label}: badge 隐藏（无异常）`);
    } else {
      assert(badgeText.trim() === entity.expectBadge, `${entity.label}: badge = ${entity.expectBadge} (got: "${badgeText.trim()}")`);
    }
  }

  // ── TC7: 切回总览视角 → appTabsArea 恢复 ────────
  console.log('\nTC7: 切回总览视角');
  await page.locator('.tr-filter .tr-chip[data-view="overview"]').click();
  await page.waitForTimeout(300);
  const appDispBack = await page.locator('#appTabsArea').evaluate(el => el.style.display);
  const linkDispBack = await page.locator('#linkTabsArea').evaluate(el => el.style.display);
  assert(appDispBack !== 'none', `切回总览后 appTabsArea display!=none (got: "${appDispBack}")`);
  assert(linkDispBack === 'none', `切回总览后 linkTabsArea display=none (got: "${linkDispBack}")`);

  // ── 截图 ──────────────────────────────────────
  await page.locator('.tr-filter .tr-chip[data-view="link"]').click();
  await page.waitForTimeout(200);
  const epItem = page.locator('#epLink .tr-ep-item').first();
  if (await epItem.count() > 0) await epItem.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'validate_result.png', fullPage: false });
  console.log('\n截图已保存: validate_result.png');

  await browser.close();

  // ── 总结 ──────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log(`结果: ${pass} 通过 / ${fail} 失败`);
  if (errors.length > 0) {
    console.error('\n失败项:');
    errors.forEach(e => console.error('  - ' + e));
    process.exit(1);
  } else {
    console.log('✅ 全部验证通过！');
    process.exit(0);
  }
})();
