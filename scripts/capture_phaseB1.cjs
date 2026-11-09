const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Tripti Dhawan\\.gemini\\antigravity\\brain\\bb47f723-df86-42ba-9e78-5b46672d66af';

// Generate valid student JWT token
const sHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
const sPayload = Buffer.from(JSON.stringify({
  user_id: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
  email: 'triptidhawan15@gmail.com',
  name: 'Tripti Dhawan'
})).toString('base64url');
const studentToken = `${sHeader}.${sPayload}.sig`;

async function captureUrl(url, outFileName, width = 1440, height = 2200, isMobile = false, selectorWait = 'h1, h2, form, article', actions = null) {
  const tmpDir = path.join(os.tmpdir(), 'edge_pb1_' + Date.now() + '_' + Math.random().toString(36).substring(7));
  fs.mkdirSync(tmpDir, { recursive: true });

  const port = 9880 + Math.floor(Math.random() * 50);
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const p = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-fre',
    '--disable-sync',
    '--disable-features=Translate,OptimizationHints,MediaRouter',
    '--user-data-dir=' + tmpDir,
    `--window-size=${width},${height}`,
    'http://localhost:5173/'
  ]);

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json`);
        const tabs = await res.json();
        let targetTab = tabs.find(t => t.type === 'page');
        if (!targetTab) throw new Error('No page target found');

        const ws = new globalThis.WebSocket(targetTab.webSocketDebuggerUrl);

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

        ws.onopen = async () => {
          await send('Page.enable');
          await send('Runtime.enable');

          await send('Runtime.evaluate', {
            expression: `window.localStorage.setItem('careerlaunch_preview_token', '${studentToken}');`
          });

          await send('Page.navigate', { url });

          // Wait for content selector
          for (let attempt = 0; attempt < 35; attempt++) {
            await new Promise(r => setTimeout(r, 250));
            const check = await send('Runtime.evaluate', {
              expression: `Boolean(document.querySelector('${selectorWait}'))`
            });
            if (check && check.result && check.result.value === true) {
              break;
            }
          }

          // Optional custom actions (like clicking or filling forms)
          if (actions) {
            await actions(send);
          }

          // Settle time for rendering
          await new Promise(r => setTimeout(r, 1200));

          await send('Emulation.setDeviceMetricsOverride', {
            width,
            height,
            deviceScaleFactor: isMobile ? 2 : 1,
            mobile: isMobile
          });

          await new Promise(r => setTimeout(r, 400));

          const shot = await send('Page.captureScreenshot', {
            format: 'png',
            fromSurface: true,
            captureBeyondViewport: true
          });

          const outPath = path.join(ARTIFACT_DIR, outFileName);
          fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
          console.log(`✓ Saved screenshot: ${outFileName} (${width}x${height}${isMobile ? ' Mobile' : ''})`);

          ws.close();
          p.kill();
          resolve();
        };

        ws.onerror = (err) => {
          p.kill();
          reject(err);
        };
      } catch (e) {
        p.kill();
        reject(e);
      }
    }, 2000);
  });
}

async function run() {
  try {
    console.log('\n--- Capturing Phase B1 Verification Screenshots ---\n');

    // 1. Role Catalog (Screen 0): Preserved 8 roles
    console.log('[1/7] Capturing Preserved Role Catalog Page...');
    await captureUrl(
      'http://localhost:5173/interview-preparation',
      'phaseB1_role_catalog_preserved.png',
      1440,
      1800,
      false,
      '.prep-roles-grid, .prep-role-card'
    );

    // 2. Personalised Preparation Setup (Desktop)
    console.log('[2/7] Capturing Preparation Setup Page (Desktop)...');
    await captureUrl(
      'http://localhost:5173/interview-preparation/frontend-developer/setup',
      'phaseB1_setup_desktop.png',
      1440,
      2200,
      false,
      'form.prep-setup-card, .prep-setup-hero'
    );

    // 3. Personalised Preparation Setup (Mobile 390x1800)
    console.log('[3/7] Capturing Preparation Setup Page (Mobile)...');
    await captureUrl(
      'http://localhost:5173/interview-preparation/frontend-developer/setup',
      'phaseB1_setup_mobile.png',
      390,
      2400,
      true,
      'form.prep-setup-card, .prep-setup-hero'
    );

    // 4. Topic Picker Drawer (Direct Topic Selection)
    console.log('[4/7] Capturing Preparation Setup with Topic Picker expanded...');
    await captureUrl(
      'http://localhost:5173/interview-preparation/frontend-developer/setup',
      'phaseB1_setup_topic_picker.png',
      1440,
      2400,
      false,
      'form.prep-setup-card',
      async (send) => {
        // Click the "Choose a topic instead" button
        await send('Runtime.evaluate', {
          expression: `
            const btn = document.querySelector('.prep-setup-shortcut__btn');
            if (btn) btn.click();
          `
        });
        await new Promise(r => setTimeout(r, 600));
      }
    );

    // 5. Preparation Setup Saved / Pending Plan State
    console.log('[5/7] Capturing Preparation Setup Saved Confirmation State...');
    await captureUrl(
      'http://localhost:5173/interview-preparation/frontend-developer/setup',
      'phaseB1_setup_saved_state.png',
      1440,
      1800,
      false,
      'form.prep-setup-card',
      async (send) => {
        // Pre-fill and submit form
        await send('Runtime.evaluate', {
          expression: `
            const textarea = document.querySelector('#goalPrompt');
            if (textarea) {
              textarea.value = "I want to prepare React.js for a frontend developer campus placement. I know HTML, CSS and JavaScript, but I struggle with state management and performance.";
              textarea.dispatchEvent(new Event('input', { bubbles: true }));
            }
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.click();
          `
        });
        // Wait for saved card to appear
        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 200));
          const chk = await send('Runtime.evaluate', {
            expression: `Boolean(document.querySelector('.prep-setup-saved-card'))`
          });
          if (chk?.result?.value) break;
        }
      }
    );

    // 6. Frontend Developer Roadmap (Preserved + Personalise Button)
    console.log('[6/7] Capturing Frontend Roadmap with Personalise Button...');
    await captureUrl(
      'http://localhost:5173/interview-preparation/frontend-developer',
      'phaseB1_frontend_roadmap_preserved.png',
      1440,
      2000,
      false,
      '.roadmap-view, .roadmap-hero'
    );

    // 7. Software Engineer Roadmap (Verifying non-pilot role continues to work)
    console.log('[7/7] Capturing Software Engineer Roadmap (Non-pilot role check)...');
    await captureUrl(
      'http://localhost:5173/interview-preparation/software-engineer',
      'phaseB1_other_role_roadmap_preserved.png',
      1440,
      2000,
      false,
      '.roadmap-view, .roadmap-hero'
    );

    console.log('\n✓ All 7 Phase B1 verification screenshots captured in Artifact Directory!');
  } catch (err) {
    console.error('Screenshot capture failed:', err);
    process.exit(1);
  }
}

run();
