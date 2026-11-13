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
  const tmpDir = path.join(os.tmpdir(), 'edge_p337_' + Date.now() + Math.random().toString(36).slice(5));
  fs.mkdirSync(tmpDir, { recursive: true });

  const port = 9930 + Math.floor(Math.random() * 50);
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

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (evt) => {
          const d = JSON.parse(evt.data);
          if (d.id === id) {
            ws.removeEventListener('message', handler);
            resolve(d.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');

    // First load root to establish origin
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 800));

    // Inject preview auth token
    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('careerlaunch_preview_token', '${studentToken}');
        localStorage.setItem('careerlaunch_preview_user', JSON.stringify({
          uid: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
          email: 'triptidhawan15@gmail.com',
          displayName: 'Tripti Dhawan'
        }));
      `
    });

    // Navigate to target URL
    await send('Page.navigate', { url });

    // Wait for learning assistant elements to appear
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 200));
      const chk = await send('Runtime.evaluate', {
        expression: `Boolean(document.querySelector('.cl-sidebar, .cl-chat-view, .cl-msg'))`
      });
      if (chk?.result?.value) break;
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

    await new Promise(r => setTimeout(r, 600));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const outPath = path.join(ARTIFACT_DIR, outName);
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log(`✓ Saved screenshot: ${outName} (${(shot.data.length * 0.75 / 1024).toFixed(1)} KB)`);

    ws.close();
  } finally {
    p.kill('SIGKILL');
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

async function runAll() {
  console.log('Capturing Phase 3.3.7 Screenshots with Clean Sidebar History & Teaching Quality...');

  const listRes = await fetch('http://localhost:5000/api/learning/conversations?roleId=frontend-developer', {
    headers: { Authorization: `Bearer ${studentToken}` }
  }).then(r => r.json());

  console.log(`Found ${listRes.conversations?.length || 0} active conversations in sidebar.`);
  const voidConv = listRes.conversations?.find(c => c.title?.includes('Void Elements') && c.messageCount > 0);
  const semanticConv = listRes.conversations?.find(c => c.title?.includes('Semantic Elements') && c.messageCount > 0);
  const targetSession = voidConv || semanticConv || listRes.conversations?.[0];

  const targetId = targetSession ? targetSession.sessionId : '';
  console.log(`Target Session ID for screenshots: ${targetId} ("${targetSession?.title}")`);

  // 1. Desktop 1440x900 - Active Chat with structured title and clean sidebar
  await capture(
    `http://localhost:5173/interview-preparation/frontend-developer/assistant/${targetId}`,
    'phase3_3_7_desktop_clean_sidebar_and_chat.png',
    1440,
    900,
    false
  );

  // 2. Desktop 1280x720 - Deep technical teaching view
  await capture(
    `http://localhost:5173/interview-preparation/frontend-developer/assistant/${targetId}`,
    'phase3_3_7_desktop_deep_teaching_view.png',
    1280,
    720,
    false
  );

  // 3. Mobile 390x844 - Mobile drawer showing grouped history
  await capture(
    `http://localhost:5173/interview-preparation/frontend-developer/assistant/${targetId}`,
    'phase3_3_7_mobile_drawer_history.png',
    390,
    844,
    true,
    async (send) => {
      await send('Runtime.evaluate', {
        expression: `
          const menuBtn = document.querySelector('.cl-topbar__toggle-btn');
          if (menuBtn) menuBtn.click();
        `
      });
      await new Promise(r => setTimeout(r, 1200));
    }
  );

  console.log('\nAll Phase 3.3.7 screenshots captured successfully!');
}

runAll().catch(console.error);
