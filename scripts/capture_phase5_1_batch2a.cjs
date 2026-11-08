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
          {/* Phase 5.1 Batch 2A Verification Routes */}
          <Route path="/preview-prep/:roleId" element={<InterviewPreparationPage />} />
          <Route path="/preview-lesson/:roleId/topic/:topicId" element={<InterviewPreparationPage />} />
          <Route path="*"`;

let patchedAppContent = originalAppContent;
if (!originalAppContent.includes('/preview-prep')) {
  patchedAppContent = originalAppContent.replace('<Route path="*"', previewRoutes);
  fs.writeFileSync(appPath, patchedAppContent, 'utf8');
}

async function captureUrl(url, outFileName, width = 1440, height = 2400, isMobile = false, selectorWait = '.lesson-container, .lesson-unavailable-card, .roadmap-container, h1') {
  const tmpDir = path.join(os.tmpdir(), 'edge_p51_b2a_' + Date.now() + '_' + Math.random().toString(36).substring(7));
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

          // Settle time for rendering
          await new Promise(r => setTimeout(r, 1200));

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
    console.log('\n--- Capturing Phase 5.1 Batch 2A Verification Screenshots ---\n');

    // 1. Roadmap view showing AI Lesson badges
    console.log('Capturing Software Engineer Roadmap with AI Badges...');
    await captureUrl(
      'http://localhost:5173/preview-prep/software-engineer',
      'phase5_1_batch2a_roadmap_with_badges.png',
      1440,
      1800,
      false,
      'button, h2, h3'
    );

    // 2. Batch 2A Topic 1: se-top-8
    console.log('Capturing Lesson: se-top-8 (Heaps & Priority Queues)...');
    await captureUrl(
      'http://localhost:5173/preview-lesson/software-engineer/topic/se-top-8',
      'phase5_1_lesson_se_top_8.png',
      1440,
      2400,
      false,
      '.lesson-container'
    );

    // 3. Batch 2A Topic 2: se-top-10
    console.log('Capturing Lesson: se-top-10 (Topological Sort & Shortest Paths)...');
    await captureUrl(
      'http://localhost:5173/preview-lesson/software-engineer/topic/se-top-10',
      'phase5_1_lesson_se_top_10.png',
      1440,
      2400,
      false,
      '.lesson-container'
    );

    // 4. Batch 2A Topic 3: se-top-11
    console.log('Capturing Lesson: se-top-11 (Recursion & Backtracking Strategies)...');
    await captureUrl(
      'http://localhost:5173/preview-lesson/software-engineer/topic/se-top-11',
      'phase5_1_lesson_se_top_11.png',
      1440,
      2400,
      false,
      '.lesson-container'
    );

    // 5. Restricted Topic se-top-1 (Unavailable state verified)
    console.log('Capturing Unavailable Topic: se-top-1 (Memory Architecture)...');
    await captureUrl(
      'http://localhost:5173/preview-lesson/software-engineer/topic/se-top-1',
      'phase5_1_lesson_se_top_1_unavailable.png',
      1440,
      1200,
      false,
      '.lesson-unavailable-card'
    );

    console.log('\nAll Phase 5.1 Batch 2A screenshots successfully captured and saved to artifact directory!\n');
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
