const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');

const ARTIFACT_DIR = 'C:\\Users\\Tripti Dhawan\\.gemini\\antigravity\\brain\\bb47f723-df86-42ba-9e78-5b46672d66af';

const sHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
const sPayload = Buffer.from(JSON.stringify({
  user_id: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
  email: 'triptidhawan15@gmail.com',
  name: 'Tripti Dhawan'
})).toString('base64url');
const studentToken = `${sHeader}.${sPayload}.sig`;

async function capture(url, outName, width = 1440, height = 900, isMobile = false, actions = null) {
  const tmpDir = path.join(os.tmpdir(), 'edge_p33_' + Date.now() + Math.random().toString(36).slice(5));
  fs.mkdirSync(tmpDir, { recursive: true });

  const port = 9910 + Math.floor(Math.random() * 80);
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const p = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-fre',
    '--user-data-dir=' + tmpDir,
    `--window-size=${width},${height}`,
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch(`http://127.0.0.1:${port}/json`);
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page');
    if (!pageTab) throw new Error('No page tab found');

    const ws = new globalThis.WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.addEventListener('open', res);
      ws.addEventListener('error', rej);
    });

    let id = 1;
    const send = (method, params = {}) => new Promise((resSend) => {
      const msgId = id++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === msgId) {
          ws.removeEventListener('message', handler);
          resSend(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    // First load root to establish origin
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 800));

    // Inject preview auth token
    await send('Runtime.evaluate', {
      expression: `localStorage.setItem('careerlaunch_preview_token', '${studentToken}');`
    });

    // Navigate to target URL
    await send('Page.navigate', { url });

    // Wait for content selector
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 200));
      const res = await send('Runtime.evaluate', {
        expression: `Boolean(document.querySelector('.bolt-sidebar, .bolt-hero-content, .bolt-thread'))`
      });
      if (res?.result?.value) break;
    }

    if (actions) {
      await actions(send);
    }

    await new Promise(r => setTimeout(r, 1500));

    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: isMobile ? 2 : 1,
      mobile: isMobile
    });

    await new Promise(r => setTimeout(r, 500));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const outPath = path.join(ARTIFACT_DIR, outName);
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log(`✓ Saved screenshot: ${outName} (${width}x${height}${isMobile ? ' Mobile' : ''})`);

    ws.close();
  } finally {
    p.kill();
  }
}

async function run() {
  console.log('Capturing Phase 3.3 Screenshots...');

  // 1. Desktop: New Chat Workspace with Open Sidebar
  await capture(
    'http://localhost:5173/interview-preparation/frontend-developer/assistant',
    'phase3_3_desktop_workspace_sidebar.png',
    1440,
    900,
    false
  );

  // 2. Desktop: Active Conversation with Messages
  // Find a conversation with messages
  const list = await fetch('http://localhost:5000/api/learning/conversations?roleId=frontend-developer', {
    headers: { Authorization: `Bearer ${studentToken}` }
  }).then(r => r.json());

  const activeWithMsgs = list.conversations.find(c => c.messageCount > 0);
  const targetId = activeWithMsgs ? activeWithMsgs.sessionId : list.conversations[0]?.sessionId;

  if (targetId) {
    await capture(
      `http://localhost:5173/interview-preparation/frontend-developer/assistant/${targetId}`,
      'phase3_3_desktop_active_chat.png',
      1440,
      900,
      false
    );
  }

  // 3. Mobile View: Collapsed Sidebar
  await capture(
    'http://localhost:5173/interview-preparation/frontend-developer/assistant',
    'phase3_3_mobile_workspace_collapsed.png',
    390,
    844,
    true
  );

  // 4. Mobile View: Open Drawer Overlay
  await capture(
    'http://localhost:5173/interview-preparation/frontend-developer/assistant',
    'phase3_3_mobile_drawer_open.png',
    390,
    844,
    true,
    async (send) => {
      await send('Runtime.evaluate', {
        expression: `
          const btn = document.querySelector('.bolt-topbar__menu-btn');
          if (btn) btn.click();
        `
      });
      await new Promise(r => setTimeout(r, 600));
    }
  );

  console.log('\nAll screenshots captured successfully!');
}

run().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
