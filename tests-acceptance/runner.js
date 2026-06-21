const { chromium, devices } = require('playwright');
const fs = require('fs');

const url = 'https://fundme-gkn51tskq-aakash-s-projects-bf7b5a5e.vercel.app';

async function runDesktop() {
  console.log('[Desktop] Starting...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: './videos/desktop' },
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    console.log('[Desktop] Homepage stability test...');
    for (let i = 0; i < 5; i++) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
    }

    console.log('[Desktop] Interacting with CTAs...');
    await page.goto(`${url}/onboarding`);
    await page.waitForLoadState('networkidle');
    
    console.log('[Desktop] Filling Welcome...');
    const emails = await page.$$('input[type="email"]');
    if (emails.length > 0) {
      await emails[0].fill('qa_desktop_final@example.com');
    }
    const phoneInput = await page.$('input[type="tel"]');
    if (phoneInput) {
      await phoneInput.focus();
      await page.keyboard.type('5551234567', { delay: 50 });
    }
    await page.waitForTimeout(1000);
    
    let continueBtn = page.getByRole('button', { name: /Continue to assessment/i });
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(2000);
    }
    
    console.log('[Desktop] Filling Founder Profile...');
    await page.fill('input[placeholder="e.g. Priya Sharma"]', 'QA Desktop E2E').catch(()=>{});
    await page.fill('input[placeholder="e.g. Founder"]', 'CEO').catch(()=>{});
    await page.fill('input[placeholder="e.g. Orbit Labs"]', 'Desktop E2E Inc').catch(()=>{});
    
    let cont2 = page.getByRole('button', { name: /Continue/i });
    if (await cont2.isVisible()) {
      await cont2.click();
      await page.waitForTimeout(2000);
    }
    
    console.log('[Desktop] Filling Startup Pitch...');
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill('E2E final pitch desktop. We are revolutionizing the AI industry and we absolutely need funding to continue our grand vision for the future.');
    }
    let cont3 = page.getByRole('button', { name: /Continue/i });
    if (await cont3.isVisible()) {
      await cont3.click();
      await page.waitForTimeout(2000);
    }
    
    console.log('[Desktop] Skipping Documents...');
    let skip = page.getByRole('button', { name: /Skip/i });
    if (await skip.isVisible()) {
      await skip.click();
      await page.waitForTimeout(2000);
    }
    
    console.log('[Desktop] Submitting...');
    let submit = page.getByRole('button', { name: /Submit/i });
    if (await submit.isVisible()) {
      await submit.click();
      await page.waitForTimeout(2000);
    }
    
    console.log('[Desktop] Waiting for account-save...');
    await page.waitForURL('**/account-save', { timeout: 15000 }).catch(() => console.log('[Desktop] Did not reach account-save'));
    await page.waitForTimeout(5000);
    
  } catch (e) {
    console.error('[Desktop] Error:', e);
  } finally {
    const videoPath = await page.video().path();
    await context.close();
    await browser.close();
    fs.renameSync(videoPath, 'fundme-final-desktop-walkthrough.webm');
    console.log('[Desktop] Video saved.');
  }
}

async function runMobile() {
  console.log('[Mobile] Starting...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['iPhone 12'],
    recordVideo: { dir: './videos/mobile' }
  });
  const page = await context.newPage();

  try {
    await page.goto(url);
    await page.waitForTimeout(3000);
    await page.goto(`${url}/onboarding`);
    await page.waitForTimeout(2000);
    
    const emails = await page.$$('input[type="email"]');
    if (emails.length > 0) {
      await emails[0].fill('qa_mobile_final@example.com');
    }
    const phoneInput = await page.$('input[type="tel"]');
    if (phoneInput) {
      await phoneInput.focus();
      await page.keyboard.type('5559876543', { delay: 50 });
    }
    await page.waitForTimeout(1000);
    
    let continueBtn = page.getByRole('button', { name: /Continue to assessment/i });
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(2000);
    }
    
    await page.fill('input[placeholder="e.g. Priya Sharma"]', 'QA Mobile E2E').catch(()=>{});
    await page.fill('input[placeholder="e.g. Founder"]', 'CTO').catch(()=>{});
    await page.fill('input[placeholder="e.g. Orbit Labs"]', 'Mobile E2E Inc').catch(()=>{});
    
    let cont2 = page.getByRole('button', { name: /Continue/i });
    if (await cont2.isVisible()) {
      await cont2.click();
      await page.waitForTimeout(2000);
    }
    
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill('E2E final pitch mobile. We are revolutionizing the AI industry and we absolutely need funding to continue our grand vision for the future.');
    }
    let cont3 = page.getByRole('button', { name: /Continue/i });
    if (await cont3.isVisible()) {
      await cont3.click();
      await page.waitForTimeout(2000);
    }
    
    let skip = page.getByRole('button', { name: /Skip/i });
    if (await skip.isVisible()) {
      await skip.click();
      await page.waitForTimeout(2000);
    }
    
    let submit = page.getByRole('button', { name: /Submit/i });
    if (await submit.isVisible()) {
      await submit.click();
      await page.waitForTimeout(2000);
    }
    
    await page.waitForURL('**/account-save', { timeout: 15000 }).catch(() => console.log('[Mobile] Did not reach account-save'));
    await page.waitForTimeout(5000);
    
  } catch (e) {
    console.error('[Mobile] Error:', e);
  } finally {
    const videoPath = await page.video().path();
    await context.close();
    await browser.close();
    fs.renameSync(videoPath, 'fundme-final-mobile-walkthrough.webm');
    console.log('[Mobile] Video saved.');
  }
}

(async () => {
  if (!fs.existsSync('./videos')) fs.mkdirSync('./videos');
  if (!fs.existsSync('./videos/desktop')) fs.mkdirSync('./videos/desktop');
  if (!fs.existsSync('./videos/mobile')) fs.mkdirSync('./videos/mobile');
  
  await runDesktop();
  await runMobile();
})();
