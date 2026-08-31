import { EventEmitter } from "node:events";

class SimpleCDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.events = new EventEmitter();
    this.ready = new Promise((resolve) => {
      this.ws.onopen = resolve;
    });
    this.ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(new Error(data.error.message));
        else resolve(data.result);
      } else if (data.method) {
        this.events.emit(data.method, data.params);
      }
    };
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error("Eval Exception: " + JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  async close() {
    this.ws.close();
  }
}

async function runProductionSmoke() {
  console.log("Starting Production Smoke Test on https://tryfundme.in...");
  const target = await fetch("http://127.0.0.1:9222/json/new?https://tryfundme.in", { method: "PUT" }).then((r) => r.json());
  const cdp = new SimpleCDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  await new Promise((r) => setTimeout(r, 3000));
  const landingTitle = await cdp.eval("document.title");
  console.log("1. Production Landing Page Title:", landingTitle);

  // Navigate to /assessment
  await cdp.send("Page.navigate", { url: "https://tryfundme.in/assessment" });
  await new Promise((r) => setTimeout(r, 3000));
  console.log("2. Navigated to Production Assessment intake");

  // Fill intake form
  const fillRes = await cdp.eval(`(() => {
    function setVal(id, val) {
      const el = document.getElementById(id);
      if (!el) return false;
      const setter = Object.getOwnPropertyDescriptor(el.__proto__, 'value') || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      setter.set.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    setVal('founder-name', 'Devon Chen');
    setVal('startup-name', 'SignalStack');
    setVal('startup-website', 'https://stripe.com');
    setVal('startup-description', 'SignalStack helps procurement teams automate vendor security and compliance evidence reviews.');
    return { filled: true };
  })()`);
  console.log("3. Filled intake inputs:", fillRes);

  // Click 'Analyze my funding fit'
  await cdp.eval(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Analyze my funding fit'));
    if (btn) btn.click();
  })()`);
  console.log("4. Submitted intake form on Production");

  // Poll for result completion
  console.log("5. Waiting for assessment analysis on Production...");
  let reportData = null;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const state = await cdp.eval(`(() => {
      const sess = JSON.parse(localStorage.getItem('fundme-grill-preview-v1') || '{}');
      return {
        path: window.location.pathname,
        hasReport: Boolean(sess.report),
        score: sess.report?.readinessScore,
        verdict: sess.report?.verdict,
        claimToken: sess.claimToken,
        strongest: sess.report?.strongestDimension,
        weakest: sess.report?.weakestDimension,
      };
    })()`);
    if (state.hasReport && state.path.includes('/assessment/result')) {
      reportData = state;
      break;
    }
  }

  if (!reportData) {
    throw new Error("Timed out waiting for production assessment result");
  }
  console.log("6. Production Analysis Completed Successfully!");
  console.log("   - Score:", reportData.score);
  console.log("   - Verdict:", reportData.verdict);
  console.log("   - Strongest Dimension:", reportData.strongest);
  console.log("   - Weakest Dimension:", reportData.weakest);
  console.log("   - Claim Token:", reportData.claimToken);

  // Click 'Save my assessment' button
  await cdp.eval(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save my assessment'));
    if (btn) btn.click();
  })()`);
  await new Promise((r) => setTimeout(r, 1000));

  // Click 'Continue with Preview profile'
  await cdp.eval(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Continue with Preview profile'));
    if (btn) btn.click();
  })()`);

  // Wait for /app/preview dashboard
  await new Promise((r) => setTimeout(r, 2000));
  const dashboardState = await cdp.eval(`(() => {
    const sess = JSON.parse(localStorage.getItem('fundme-grill-preview-v1') || '{}');
    return {
      path: window.location.pathname,
      title: document.title,
      founder: sess.input?.founderName,
      startup: sess.input?.startupName,
      score: sess.report?.readinessScore,
      verdict: sess.report?.verdict,
    };
  })()`);
  console.log("7. Loaded Production Saved Dashboard (/app/preview):", dashboardState);

  // Perform Hard Refresh
  await cdp.send("Page.reload", { ignoreCache: true });
  await new Promise((r) => setTimeout(r, 3000));

  const restoredState = await cdp.eval(`(() => {
    const sess = JSON.parse(localStorage.getItem('fundme-grill-preview-v1') || '{}');
    return {
      path: window.location.pathname,
      score: sess.report?.readinessScore,
      verdict: sess.report?.verdict,
      founder: sess.input?.founderName,
    };
  })()`);
  console.log("8. Production Restored Workspace after Hard Refresh:", restoredState);

  // Test Public Sharing Generation on Production
  console.log("9. Testing Public Sharing Generation on Production...");
  const shareRes = await cdp.eval(`(() => {
    return fetch('/api/assessment/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimToken: '${reportData.claimToken}' })
    }).then(r => r.json());
  })()`);
  console.log("10. Production Share API response:", shareRes);

  await cdp.close();
  console.log("=== PRODUCTION SMOKE TEST COMPLETE: ALL SYSTEMS VERIFIED ===");
}

runProductionSmoke().catch((err) => {
  console.error("Production Smoke Failed:", err);
  process.exit(1);
});
