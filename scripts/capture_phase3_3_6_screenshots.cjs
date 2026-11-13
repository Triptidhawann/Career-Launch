const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Tripti Dhawan\\.gemini\\antigravity\\brain\\bb47f723-df86-42ba-9e78-5b46672d66af';

const sHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
const sPayload = Buffer.from(JSON.stringify({
  user_id: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
  email: 'triptidhawan15@gmail.com',
  name: 'Tripti Dhawan'
})).toString('base64url');
const studentToken = `${sHeader}.${sPayload}.sig`;

async function capture(url, outName, width = 1440, height = 900, isMobile = false, actions = null) {
  const tmpDir = path.join(os.tmpdir(), 'edge_p336_' + Date.now() + Math.random().toString(36).slice(5));
  fs.mkdirSync(tmpDir, { recursive: true });

  const port = 9930 + Math.floor(Math.random() * 60);
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

    // First navigate to root to set localStorage
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 800));

    await send('Runtime.evaluate', {
      expression: `localStorage.setItem('careerlaunch_preview_token', '${studentToken}');`
    });

    // Navigate to target URL
    await send('Page.navigate', { url });

    // Wait for content selector
    const isChatPage = url.split('/').length > 5;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 200));
      const selector = isChatPage
        ? `.cl-msg, .cl-roadmap-guide, .cl-welcome-container`
        : `.cl-sidebar, .cl-welcome-container, .cl-chat-thread`;
      const res = await send('Runtime.evaluate', {
        expression: `Boolean(document.querySelector('${selector}'))`
      });
      if (res?.result?.value) break;
    }

    if (actions) {
      await actions(send);
    }

    await new Promise(r => setTimeout(r, 1200));

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
  console.log('Capturing Phase 3.3.6 Screenshots across requested viewports...\n');

  const codeSessionId = '6af6a516c025373f900ce628';
  const roadmapSessionId = '6af6a576c025373f900ce6fc';

  // 1. Empty new-chat screen (1440 × 900 Desktop)
  await capture(
    'http://localhost:5173/interview-preparation/frontend-developer/assistant',
    'phase3_3_6_1440x900_empty_chat.png',
    1440,
    900,
    false
  );

  // 2. Active conversation with detailed AI answer & sidebar history (1440 × 900 Desktop)
  await capture(
    `http://localhost:5173/interview-preparation/frontend-developer/assistant/${codeSessionId}`,
    'phase3_3_6_1440x900_active_chat.png',
    1440,
    900,
    false,
    async (send) => {
      // Scroll to start of conversation
      await send('Runtime.evaluate', {
        expression: `
          const thread = document.querySelector('.cl-chat-thread');
          if (thread) thread.scrollTop = 0;
        `
      });
      await new Promise(r => setTimeout(r, 600));
    }
  );

  // 3. Complete Roadmap Guide (1440 × 900 Desktop)
  await capture(
    `http://localhost:5173/interview-preparation/frontend-developer/assistant/${roadmapSessionId}`,
    'phase3_3_6_1440x900_roadmap_guide.png',
    1440,
    900,
    false,
    async (send) => {
      await send('Runtime.evaluate', {
        expression: `
          const roadmap = document.querySelector('.cl-roadmap-guide');
          if (roadmap) {
            roadmap.scrollIntoView({ behavior: 'instant', block: 'start' });
          }
        `
      });
      await new Promise(r => setTimeout(r, 800));
    }
  );

  // 4. Laptop 1366 × 768: Active Conversation
  await capture(
    `http://localhost:5173/interview-preparation/frontend-developer/assistant/${codeSessionId}`,
    'phase3_3_6_1366x768_laptop.png',
    1366,
    768,
    false,
    async (send) => {
      await send('Runtime.evaluate', {
        expression: `
          const thread = document.querySelector('.cl-chat-thread');
          if (thread) thread.scrollTop = 0;
        `
      });
      await new Promise(r => setTimeout(r, 600));
    }
  );

  // 5. Laptop 1280 × 720: Code explanation with syntax highlight & copy button
  await capture(
    `http://localhost:5173/interview-preparation/frontend-developer/assistant/${codeSessionId}`,
    'phase3_3_6_1280x720_code_explanation.png',
    1280,
    720,
    false,
    async (send) => {
      await send('Runtime.evaluate', {
        expression: `
          const codeBlock = document.querySelector('.cl-codeblock');
          if (codeBlock) {
            codeBlock.scrollIntoView({ behavior: 'instant', block: 'center' });
          }
        `
      });
      await new Promise(r => setTimeout(r, 600));
    }
  );

  // 6. Tablet 768 × 1024: Responsive layout with active chat
  await capture(
    `http://localhost:5173/interview-preparation/frontend-developer/assistant/${codeSessionId}`,
    'phase3_3_6_768x1024_tablet.png',
    768,
    1024,
    false,
    async (send) => {
      await send('Runtime.evaluate', {
        expression: `
          const thread = document.querySelector('.cl-chat-thread');
          if (thread) thread.scrollTop = 0;
        `
      });
      await new Promise(r => setTimeout(r, 600));
    }
  );

  // 7. Mobile 390 × 844: Sidebar Closed
  await capture(
    'http://localhost:5173/interview-preparation/frontend-developer/assistant',
    'phase3_3_6_390x844_mobile_closed.png',
    390,
    844,
    true
  );

  // 8. Mobile 390 × 844: Sidebar Open Drawer with Backdrop
  await capture(
    'http://localhost:5173/interview-preparation/frontend-developer/assistant',
    'phase3_3_6_390x844_mobile_open.png',
    390,
    844,
    true,
    async (send) => {
      await send('Runtime.evaluate', {
        expression: `
          const btn = document.querySelector('.cl-topbar__toggle-btn');
          if (btn) btn.click();
        `
      });
      await new Promise(r => setTimeout(r, 500));
    }
  );

  console.log('\nAll Phase 3.3.6 screenshots captured successfully!');
}

run().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
