const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Tripti Dhawan\\.gemini\\antigravity\\brain\\bb47f723-df86-42ba-9e78-5b46672d66af';
const appPath = path.resolve(__dirname, '../src/App.jsx');
const originalAppContent = fs.readFileSync(appPath, 'utf8');

const sHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
const sPayload = Buffer.from(JSON.stringify({
  user_id: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
  email: 'triptidhawan15@gmail.com',
  name: 'Tripti Dhawan'
})).toString('base64url');
const studentToken = `${sHeader}.${sPayload}.sig`;

// Ensure preview route
const previewRoutes = `
          {/* Temporary verification routes for Phase 4 */}
          <Route path="/preview-lesson/:roleId/topic/:topicId" element={<InterviewPreparationPage />} />
          <Route path="*"`;

let patchedAppContent = originalAppContent;
if (!originalAppContent.includes('/preview-lesson')) {
  patchedAppContent = originalAppContent.replace('<Route path="*"', previewRoutes);
  fs.writeFileSync(appPath, patchedAppContent, 'utf8');
}

async function captureUrl(url, outFileName, width = 1440, height = 1200) {
  const tmpDir = path.join(os.tmpdir(), 'edge_unavail_' + Date.now() + '_' + Math.random().toString(36).substring(7));
  fs.mkdirSync(tmpDir, { recursive: true });

  const port = 9580 + Math.floor(Math.random() * 20);
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const p = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=Translate,OptimizationHints,MediaRouter',
    '--user-data-dir=' + tmpDir,
    `--window-size=${width},${height}`,
    url
  ]);

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json`);
        const tabs = await res.json();
        let targetTab = tabs.find(t => t.url && t.url.includes('preview-lesson')) || tabs.find(t => t.type === 'page');
        if (!targetTab) {
          throw new Error('No page target found');
        }

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
            expression: `window.localStorage.setItem('careerlaunch_preview_token', '${studentToken}'); window.location.reload();`
          });

          // Wait for reload and fetch to finish
          await new Promise(r => setTimeout(r, 2500));

          await send('Emulation.setDeviceMetricsOverride', {
            width,
            height,
            deviceScaleFactor: 1,
            mobile: false
          });

          await new Promise(r => setTimeout(r, 800));

          const shot = await send('Page.captureScreenshot', {
            format: 'png',
            fromSurface: true
          });

          const outPath = path.join(ARTIFACT_DIR, outFileName);
          fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
          console.log(`Saved screenshot: ${outPath} (${width}x${height})`);

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
    }, 2500);
  });
}

async function run() {
  try {
    console.log('Capturing Non-Pilot Unavailable State (se-top-1)...');
    await captureUrl('http://localhost:5173/preview-lesson/software-engineer/topic/se-top-1', 'phase4_lesson_unavailable_se_top_1.png', 1440, 1200);
    console.log('Successfully captured unavailable state screenshot!');
  } finally {
    // Restore clean App.jsx
    let content = fs.readFileSync(appPath, 'utf8');
    const previewMarker = '\n          {/* Temporary verification routes for Phase 4 */}\n          <Route path="/preview-lesson/:roleId/topic/:topicId" element={<InterviewPreparationPage />} />';
    content = content.replace(previewMarker, '');
    fs.writeFileSync(appPath, content, 'utf8');
    console.log('Restored clean App.jsx');
  }
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
