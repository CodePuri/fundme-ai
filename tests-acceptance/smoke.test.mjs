import assert from 'node:assert';
import { spawn } from 'node:child_process';

const server = spawn('npm', ['run', 'dev'], { stdio: 'ignore' });

async function checkUrl(path) {
  try {
    const res = await fetch(`http://localhost:3000${path}`, { redirect: 'manual' });
    return { status: res.status, headers: res.headers };
  } catch (err) {
    return { error: err.message };
  }
}

async function run() {
  console.log("Waiting for Next.js server to boot...");
  // Wait up to 15s for server to start
  let up = false;
  for (let i = 0; i < 15; i++) {
    const res = await checkUrl('/api/env');
    if (!res.error) {
      up = true;
      break;
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  if (!up) {
    console.error("Server did not start in time.");
    server.kill();
    process.exit(1);
  }

  try {
    console.log("Running public route access test...");
    const pub = await checkUrl('/explore');
    assert.strictEqual(pub.status, 200, "Public route should be accessible (200)");

    console.log("Running protected route access and Clerk redirect test...");
    const priv = await checkUrl('/app/tracker');
    // Clerk middleware returns 307 for redirect to sign-in
    assert.strictEqual(priv.status, 307, "Private route should redirect (307)");
    assert.ok(priv.headers.get('location').includes('sign-in'), "Should redirect to sign-in");

    console.log("Running environment endpoint security test...");
    const apiEnv = await checkUrl('/api/env');
    assert.strictEqual(apiEnv.status, 200);
    const data = await (await fetch('http://localhost:3000/api/env')).json();
    assert.strictEqual(data.status, "ok");
    assert.strictEqual(typeof data.services.supabase, "boolean", "Should expose boolean supabase service status");
    assert.strictEqual(typeof data.services.clerk, "boolean", "Should expose boolean clerk service status");
    assert.ok(data.keyPreview === undefined, "Should not expose any key preview");

    console.log("✅ All tests passed successfully.");
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exitCode = 1;
  } finally {
    server.kill();
  }
}

run();
