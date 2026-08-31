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

async function runShareTest() {
  console.log("Testing Public Share Page & Referral Attribution on Staging...");
  const target = await fetch("http://127.0.0.1:9222/json/new?https://staging.tryfundme.in/share/sh_833faf2434d5a38bef1ef26f", { method: "PUT" }).then((r) => r.json());
  const cdp = new SimpleCDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  await new Promise((r) => setTimeout(r, 4000));

  const shareView = await cdp.eval(`(() => {
    return {
      title: document.title,
      text: document.body.innerText.slice(0, 500),
      hasAssessButton: Boolean(Array.from(document.querySelectorAll('a, button')).find(b => b.textContent.includes('Assess your startup') || b.textContent.includes('Get your funding fit'))),
      currentUrl: window.location.href,
    };
  })()`);
  console.log("Share page rendering:", shareView);

  // Click CTA to check referral attribution
  const clickAssess = await cdp.eval(`(() => {
    const link = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('/assessment'));
    if (link) {
      return { href: link.href };
    }
    return null;
  })()`);
  console.log("Assessment referral link from share page:", clickAssess);

  await cdp.close();
}

runShareTest().catch(console.error);
