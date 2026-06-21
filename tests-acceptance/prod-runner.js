const { chromium, devices } = require('playwright');
const fs = require('fs');

const url = 'https://tryfundme.in';

async function runProdQA() {
  console.log('[ProdQA] Starting...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let hasConsoleErrors = false;
  let hasHydrationErrors = false;
  let hasApiErrors = false;
  let submissionId = null;

  page.on('console', msg => {
    if (msg.type() === 'error') {
      hasConsoleErrors = true;
      console.log('[ProdQA Console Error]', msg.text());
      if (msg.text().includes('Hydration') || msg.text().includes('Minified React error #418') || msg.text().includes('Minified React error #423')) {
        hasHydrationErrors = true;
      }
    }
  });

  page.on('response', async res => {
    if (res.status() >= 400 && !res.url().includes('google-analytics')) {
      hasApiErrors = true;
      console.log(`[ProdQA Network Error] ${res.status()} on ${res.url()}`);
    }
    if (res.url().includes('/api/onboarding') && res.request().method() === 'POST' && res.status() === 200) {
      try {
        const json = await res.json();
        if (json.success && json.submissionId) {
          submissionId = json.submissionId;
          console.log('[ProdQA] Valid submissionId received:', submissionId);
        }
      } catch (e) {
        // ignore JSON parse err
      }
    }
  });

  try {
    console.log('[ProdQA] Checking homepage (200)...');
    const res = await page.goto(url);
    if (res.status() !== 200) throw new Error('Homepage returned ' + res.status());

    console.log('[ProdQA] Refreshing 5 times for hero stability...');
    for (let i = 0; i < 5; i++) {
      await page.goto(url);
      await page.waitForSelector('text="Get Funded"', { timeout: 5000 }).catch(()=>{});
    }

    console.log('[ProdQA] Checking routes...');
    await page.goto(`${url}/explore`);
    await page.waitForLoadState('networkidle');
    if (page.url().includes('sign-in')) throw new Error('/explore redirected to auth');
    
    await page.goto(`${url}/search`);
    await page.waitForLoadState('networkidle');
    if (page.url().includes('sign-in')) throw new Error('/search redirected to auth');

    await page.goto(`${url}/onboarding`);
    await page.waitForLoadState('networkidle');
    if (page.url().includes('sign-in')) throw new Error('/onboarding redirected to auth');

    await page.goto(`${url}/app/matches`);
    await page.waitForLoadState('networkidle');
    if (!page.url().includes('sign-in')) throw new Error('/app/matches did NOT protect');

    console.log('[ProdQA] Filling Onboarding...');
    await page.goto(`${url}/onboarding`);
    await page.waitForLoadState('networkidle');
    
    // Step 1 Welcome
    const emails = await page.$$('input[type="email"]');
    if (emails.length > 0) await emails[0].fill('prod_qa_final@example.com');
    const phoneInput = await page.$('input[type="tel"]');
    if (phoneInput) {
      await phoneInput.focus();
      await page.keyboard.type('5551234567', { delay: 50 });
    }
    await page.waitForTimeout(1000);
    
    let continueBtn = page.getByRole('button', { name: /Continue to assessment/i });
    if (await continueBtn.isVisible()) await continueBtn.click();
    await page.waitForTimeout(2000);
    
    // Step 2 Profile
    await page.fill('input[placeholder="e.g. Priya Sharma"]', 'Prod QA').catch(()=>{});
    await page.fill('input[placeholder="e.g. Founder"]', 'QA Engineer').catch(()=>{});
    await page.fill('input[placeholder="e.g. Orbit Labs"]', 'ProdQA Inc').catch(()=>{});
    
    let cont2 = page.getByRole('button', { name: /Continue/i });
    if (await cont2.isVisible()) await cont2.click();
    await page.waitForTimeout(2000);
    
    // Step 3 Pitch
    const textarea = await page.$('textarea');
    if (textarea) await textarea.fill('Prod QA Pitch. This text is long enough to bypass the 35 character minimum requirement.');
    
    let cont3 = page.getByRole('button', { name: /Continue/i });
    if (await cont3.isVisible()) await cont3.click();
    await page.waitForTimeout(2000);
    
    // Step 4 Docs
    let skip = page.getByRole('button', { name: /Skip/i });
    if (await skip.isVisible()) await skip.click();
    await page.waitForTimeout(2000);
    
    // Step 5 Review
    console.log('[ProdQA] Submitting...');
    let submit = page.getByRole('button', { name: /Submit/i });
    if (await submit.isVisible()) await submit.click();
    
    console.log('[ProdQA] Waiting for account-save...');
    await page.waitForURL('**/account-save', { timeout: 15000 });
    
    console.log('[ProdQA] Testing Account Save CTA...');
    let saveInfoBtn = page.getByRole('button', { name: /Save my information/i });
    if (await saveInfoBtn.isVisible()) {
      await saveInfoBtn.click();
      await page.waitForTimeout(2000);
      if (!page.url().includes('sign-up') && !page.url().includes('sign-in') && !page.url().includes('clerk')) {
         console.log('[ProdQA] Save info did not trigger Clerk.');
      }
    }

    console.log('--- SUMMARY ---');
    console.log('hasConsoleErrors:', hasConsoleErrors);
    console.log('hasHydrationErrors:', hasHydrationErrors);
    console.log('hasApiErrors:', hasApiErrors);
    console.log('submissionId:', submissionId);
    
  } catch (e) {
    console.error('[ProdQA] Flow Exception:', e);
  } finally {
    await browser.close();
  }
}

async function runMobileQA() {
  console.log('[ProdQA Mobile] Starting...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...devices['iPhone 12'] });
  const page = await context.newPage();

  try {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    console.log('[ProdQA Mobile] Horizontal overflow test:', bodyWidth <= windowWidth ? 'PASS' : 'FAIL (overflows)');
    
  } catch (e) {
    console.error('[ProdQA Mobile] Exception:', e);
  } finally {
    await browser.close();
  }
}

(async () => {
  await runProdQA();
  await runMobileQA();
})();
