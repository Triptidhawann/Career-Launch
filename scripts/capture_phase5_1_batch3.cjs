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
          {/* Phase 5.1 Batch 3 Verification Routes */}
          <Route path="/preview-prep/:roleId" element={<InterviewPreparationPage />} />
          <Route path="/preview-lesson/:roleId/topic/:topicId" element={<InterviewPreparationPage />} />
          <Route path="*"`;

let patchedAppContent = originalAppContent;
if (!originalAppContent.includes('/preview-prep')) {
  patchedAppContent = originalAppContent.replace('<Route path="*"', previewRoutes);
  fs.writeFileSync(appPath, patchedAppContent, 'utf8');
}

async function captureUrl(url, outFileName, width = 1440, height = 2400, isMobile = false, selectorWait = '.lesson-container, .lesson-unavailable-card, .roadmap-container, h1') {
  const tmpDir = path.join(os.tmpdir(), 'edge_p51_b3_' + Date.now() + '_' + Math.random().toString(36).substring(7));
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
    console.log('\n--- Capturing Phase 5.1 Batch 3 Verification Screenshots ---\n');

    // 1. Roadmap view showing AI Lesson badges
    console.log('Capturing Software Engineer Roadmap with AI Badges...');
    await captureUrl(
      'http://localhost:5173/preview-prep/software-engineer',
      'phase5_1_batch3_roadmap_with_badges.png',
      1440,
      2000,
      false,
      'button, h2, h3'
    );

    // 2. Batch 3 Topic: se-top-13
    console.log('Capturing Lesson: se-top-13 (Processes, Threads & Synchronization)...');
    await captureUrl(
      'http://localhost:5173/preview-lesson/software-engineer/topic/se-top-13',
      'phase5_1_lesson_se_top_13.png',
      1440,
      2800,
      false,
      '.lesson-container, h1, h2'
    );

    // 3. Batch 3 Topic: se-top-15
    console.log('Capturing Lesson: se-top-15 (Computer Networking)...');
    await captureUrl(
      'http://localhost:5173/preview-lesson/software-engineer/topic/se-top-15',
      'phase5_1_lesson_se_top_15.png',
      1440,
      2800,
      false,
      '.lesson-container, h1, h2'
    );

    // 4. Batch 3 Topic: se-top-16
    console.log('Capturing Lesson: se-top-16 (Object-Oriented Design Patterns)...');
    await captureUrl(
      'http://localhost:5173/preview-lesson/software-engineer/topic/se-top-16',
      'phase5_1_lesson_se_top_16.png',
      1440,
      2800,
      false,
      '.lesson-container, h1, h2'
    );

    // 5. Batch 3 Topic: se-top-17
    console.log('Capturing Lesson: se-top-17 (High-Level System Design & Scalability)...');
    await captureUrl(
      'http://localhost:5173/preview-lesson/software-engineer/topic/se-top-17',
      'phase5_1_lesson_se_top_17.png',
      1440,
      2800,
      false,
      '.lesson-container, h1, h2'
    );

    // 6. Deferred Topic: se-top-14 (Virtual Memory unavailable placeholder)
    console.log('Capturing Unavailable Lesson: se-top-14 (Virtual Memory, Paging & Storage)...');
    await captureUrl(
      'http://localhost:5173/preview-lesson/software-engineer/topic/se-top-14',
      'phase5_1_lesson_se_top_14_unavailable.png',
      1440,
      1200,
      false,
      '.lesson-unavailable-card, h2, h3'
    );

    console.log('\n✓ All 6 screenshots successfully captured in Artifact Directory!');
  } finally {
    // Restore original App.jsx
    fs.writeFileSync(appPath, originalAppContent, 'utf8');
    console.log('✓ Restored original src/App.jsx');
  }
}

run().catch((err) => {
  fs.writeFileSync(appPath, originalAppContent, 'utf8');
  console.error('Capture script error:', err);
  process.exit(1);
});
