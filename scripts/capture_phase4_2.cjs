const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Tripti Dhawan\\.gemini\\antigravity\\brain\\bb47f723-df86-42ba-9e78-5b46672d66af';
const appPath = path.resolve(__dirname, '../src/App.jsx');
const originalAppContent = fs.readFileSync(appPath, 'utf8');

// Generate valid student JWT token
const sHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
const sPayload = Buffer.from(JSON.stringify({
  user_id: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
  email: 'triptidhawan15@gmail.com',
  name: 'Tripti Dhawan'
})).toString('base64url');
const studentToken = `${sHeader}.${sPayload}.sig`;

// Add preview routes for direct headless browser verification
const previewRoutes = `
          {/* Phase 4.2 Verification Routes */}
          <Route path="/preview-prep/:roleId" element={<InterviewPreparationPage />} />
          <Route path="/preview-lesson/:roleId/topic/:topicId" element={<InterviewPreparationPage />} />
          <Route path="*"`;

let patchedAppContent = originalAppContent;
if (!originalAppContent.includes('/preview-prep')) {
  patchedAppContent = originalAppContent.replace('<Route path="*"', previewRoutes);
  fs.writeFileSync(appPath, patchedAppContent, 'utf8');
}

async function captureUrl(url, outFileName, width = 1440, height = 2200, isMobile = false) {
  const tmpDir = path.join(os.tmpdir(), 'edge_p42_' + Date.now() + '_' + Math.random().toString(36).substring(7));
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

          // Wait for lesson content or unavailable card
          for (let attempt = 0; attempt < 35; attempt++) {
            await new Promise(r => setTimeout(r, 250));
            const check = await send('Runtime.evaluate', {
              expression: `Boolean(document.querySelector('.lesson-container, .lesson-unavailable-card'))`
            });
            if (check && check.result && check.result.value === true) {
              break;
            }
          }

          await new Promise(r => setTimeout(r, 800));

          await send('Emulation.setDeviceMetricsOverride', {
            width,
            height,
            deviceScaleFactor: 1,
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
          console.log(`✓ Saved screenshot: ${outFileName} (${width}x${height})`);

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
    console.log('\n--- Capturing Phase 4.2 Verification Screenshots ---\n');

    // 1. Binary Search Desktop
    console.log('Capturing Binary Search (swe-top-4) Desktop...');
    await captureUrl('http://localhost:5173/preview-lesson/software-engineer/topic/swe-top-4', 'phase4_2_lesson_swe_top_4_desktop.png', 1440, 2400, false);

    // 2. Binary Search Mobile
    console.log('Capturing Binary Search (swe-top-4) Mobile...');
    await captureUrl('http://localhost:5173/preview-lesson/software-engineer/topic/swe-top-4', 'phase4_2_lesson_swe_top_4_mobile.png', 375, 2600, true);

    // 3. Arrays (se-top-3)
    console.log('Capturing Arrays (se-top-3) Desktop...');
    await captureUrl('http://localhost:5173/preview-lesson/software-engineer/topic/se-top-3', 'phase4_2_lesson_se_top_3.png', 1440, 2400, false);

    // 4. BST Invariants (se-top-7)
    console.log('Capturing BST (se-top-7) Desktop...');
    await captureUrl('http://localhost:5173/preview-lesson/software-engineer/topic/se-top-7', 'phase4_2_lesson_se_top_7.png', 1440, 2400, false);

    // 5. Graphs (se-top-9)
    console.log('Capturing Graphs (se-top-9) Desktop...');
    await captureUrl('http://localhost:5173/preview-lesson/software-engineer/topic/se-top-9', 'phase4_2_lesson_se_top_9.png', 1440, 2400, false);

    // 6. Dynamic Programming (se-top-12)
    console.log('Capturing DP (se-top-12) Desktop...');
    await captureUrl('http://localhost:5173/preview-lesson/software-engineer/topic/se-top-12', 'phase4_2_lesson_se_top_12.png', 1440, 2400, false);

    // 7. Genuinely Unavailable Topic (se-top-6)
    console.log('Capturing Unavailable Topic (se-top-6)...');
    await captureUrl('http://localhost:5173/preview-lesson/software-engineer/topic/se-top-6', 'phase4_2_lesson_se_top_6_unavailable.png', 1440, 1200, false);

    console.log('\nAll Phase 4.2 screenshots successfully captured and saved to artifact directory!\n');
  } finally {
    fs.writeFileSync(appPath, originalAppContent, 'utf8');
    console.log('Restored original App.jsx');
  }
}

run().catch((err) => {
  console.error('Fatal capture error:', err);
  fs.writeFileSync(appPath, originalAppContent, 'utf8');
  process.exit(1);
});
