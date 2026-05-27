import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.type() === 'warning') consoleWarnings.push(msg.text());
  });

  page.on('pageerror', err => {
    consoleErrors.push(`PAGE ERROR: ${err.message}`);
  });

  console.log('=== STEP 1: Navigate and check expanded sidebar ===');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Check sidebar width
  const sidebarBox = await page.locator('aside.sidebar').boundingBox();
  console.log('Sidebar bounding box:', JSON.stringify(sidebarBox));

  // Check if sidebar has collapsed class
  const hasCollapsed = await page.locator('aside.sidebar').evaluate(el => el.classList.contains('collapsed'));
  console.log('Sidebar has "collapsed" class:', hasCollapsed);

  // Check nav labels visible
  const navLabels = await page.locator('.nav-label').all();
  console.log('Number of nav-label elements:', navLabels.length);
  const firstLabelVisible = navLabels.length > 0 ? await navLabels[0].isVisible() : false;
  console.log('First nav label visible:', firstLabelVisible);

  // Check brand text visible
  const brandTextVisible = await page.locator('.brand-text').isVisible();
  console.log('Brand text visible:', brandTextVisible);

  // Check toggle button exists
  const toggleBtn = page.locator('.sidebar-toggle');
  const toggleVisible = await toggleBtn.isVisible();
  console.log('Toggle button visible:', toggleVisible);

  // Screenshot step 1
  await page.screenshot({ path: '/c/Users/TLlanwarne/work/claude-training/inventory-management/client/sidebar-step1-expanded.png', fullPage: false });
  console.log('Screenshot saved: sidebar-step1-expanded.png');

  // Check main-wrapper width
  const mainWrapper = await page.locator('.main-wrapper').boundingBox();
  console.log('Main wrapper bounding box:', JSON.stringify(mainWrapper));

  console.log('\n=== STEP 2: Click toggle to collapse sidebar ===');
  await toggleBtn.click();
  await page.waitForTimeout(500);

  const sidebarBoxCollapsed = await page.locator('aside.sidebar').boundingBox();
  console.log('Sidebar bounding box (collapsed):', JSON.stringify(sidebarBoxCollapsed));

  const hasCollapsedAfter = await page.locator('aside.sidebar').evaluate(el => el.classList.contains('collapsed'));
  console.log('Sidebar has "collapsed" class after click:', hasCollapsedAfter);

  // Check nav labels hidden after collapse
  const navLabelsAfter = await page.locator('.nav-label').all();
  const firstLabelVisibleAfter = navLabelsAfter.length > 0 ? await navLabelsAfter[0].isVisible() : false;
  console.log('First nav label visible after collapse:', firstLabelVisibleAfter);

  // Check brand text hidden
  const brandTextVisibleAfter = await page.locator('.brand-text').isVisible();
  console.log('Brand text visible after collapse:', brandTextVisibleAfter);

  // Check toggle button still visible
  const toggleVisibleAfter = await toggleBtn.isVisible();
  console.log('Toggle button still visible after collapse:', toggleVisibleAfter);

  // Check main wrapper shifted
  const mainWrapperAfter = await page.locator('.main-wrapper').boundingBox();
  console.log('Main wrapper bounding box (collapsed):', JSON.stringify(mainWrapperAfter));

  // Screenshot step 2
  await page.screenshot({ path: '/c/Users/TLlanwarne/work/claude-training/inventory-management/client/sidebar-step2-collapsed.png', fullPage: false });
  console.log('Screenshot saved: sidebar-step2-collapsed.png');

  console.log('\n=== STEP 3: Hover over nav link to check tooltip ===');
  // Get the first nav link (Overview)
  const firstNavLink = page.locator('.sidebar-nav a').first();
  const titleAttr = await firstNavLink.getAttribute('title');
  console.log('First nav link title attribute:', titleAttr);

  // Hover over it
  await firstNavLink.hover();
  await page.waitForTimeout(1000);

  // Screenshot with hover
  await page.screenshot({ path: '/c/Users/TLlanwarne/work/claude-training/inventory-management/client/sidebar-step3-tooltip.png', fullPage: false });
  console.log('Screenshot saved: sidebar-step3-tooltip.png');

  // Check all nav links have title attributes
  const navLinks = await page.locator('.sidebar-nav a').all();
  for (let i = 0; i < navLinks.length; i++) {
    const title = await navLinks[i].getAttribute('title');
    const text = await navLinks[i].textContent();
    console.log(`Nav link ${i + 1} - title: "${title}", text content: "${text?.trim()}"`);
  }

  console.log('\n=== STEP 4: Click toggle to expand sidebar again ===');
  await toggleBtn.click();
  await page.waitForTimeout(500);

  const sidebarBoxExpanded = await page.locator('aside.sidebar').boundingBox();
  console.log('Sidebar bounding box (re-expanded):', JSON.stringify(sidebarBoxExpanded));

  const hasCollapsedReexpanded = await page.locator('aside.sidebar').evaluate(el => el.classList.contains('collapsed'));
  console.log('Sidebar has "collapsed" class (re-expanded):', hasCollapsedReexpanded);

  const navLabelsReexpanded = await page.locator('.nav-label').all();
  const firstLabelVisibleReexpanded = navLabelsReexpanded.length > 0 ? await navLabelsReexpanded[0].isVisible() : false;
  console.log('First nav label visible after re-expand:', firstLabelVisibleReexpanded);

  const brandTextReexpanded = await page.locator('.brand-text').isVisible();
  console.log('Brand text visible after re-expand:', brandTextReexpanded);

  // Screenshot step 4
  await page.screenshot({ path: '/c/Users/TLlanwarne/work/claude-training/inventory-management/client/sidebar-step4-reexpanded.png', fullPage: false });
  console.log('Screenshot saved: sidebar-step4-reexpanded.png');

  console.log('\n=== STEP 5: Browser Console Errors ===');
  if (consoleErrors.length === 0) {
    console.log('No JavaScript errors found in browser console.');
  } else {
    console.log('ERRORS FOUND:');
    consoleErrors.forEach(e => console.log(' -', e));
  }
  if (consoleWarnings.length > 0) {
    console.log('Warnings:');
    consoleWarnings.forEach(w => console.log(' -', w));
  }

  await browser.close();
  console.log('\nDone.');
})();
