const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Tripti Dhawan\\.gemini\\antigravity\\brain\\bb47f723-df86-42ba-9e78-5b46672d66af';

// Valid student JWT token for authenticated routes
const sHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
const sPayload = Buffer.from(JSON.stringify({
  user_id: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
  email: 'triptidhawan15@gmail.com',
  name: 'Tripti Dhawan'
})).toString('base64url');
const studentToken = `${sHeader}.${sPayload}.sig`;

async function captureUrl(url, outFileName, width = 1440, height = 1800, isMobile = false, selectorWait = 'h1, h2, form, article, .skill-sel-hero', actions = null) {
  const tmpDir = path.join(os.tmpdir(), 'edge_p2_' + Date.now() + '_' + Math.random().toString(36).substring(7));
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
          for (let attempt = 0; attempt < 40; attempt++) {
            await new Promise(r => setTimeout(r, 200));
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
    }, 1200);
  });
}

async function run() {
  console.log('='.repeat(70));
  console.log('CAPTURING PHASE 2 SKILL SELECTION VISUAL EVIDENCE');
  console.log('='.repeat(70));

  // 1. Role Selection Page Preserved (/interview-preparation)
  console.log('\n[1/6] Capturing preserved Role Selection page...');
  await captureUrl(
    'http://localhost:5173/interview-preparation',
    'phase2_role_selection_preserved.png',
    1440,
    1400,
    false,
    '.prep-role-grid'
  );

  // 2. Desktop Skill Selection Overview (/interview-preparation/frontend-developer/skills)
  console.log('\n[2/6] Capturing Desktop Skill Selection Overview...');
  await captureUrl(
    'http://localhost:5173/interview-preparation/frontend-developer/skills',
    'phase2_skills_overview_desktop.png',
    1440,
    1800,
    false,
    '.skill-sel-categories'
  );

  // 3. Search Filter Active ("React")
  console.log('\n[3/6] Capturing Search Filter Active...');
  await captureUrl(
    'http://localhost:5173/interview-preparation/frontend-developer/skills',
    'phase2_skills_search_filtered.png',
    1440,
    1400,
    false,
    '.skill-sel-categories',
    async (send) => {
      await send('Runtime.evaluate', {
        expression: `
          const input = document.querySelector('.skill-sel-search__input');
          if (input) {
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(input, 'React');
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        `
      });
      await new Promise(r => setTimeout(r, 600));
    }
  );

  // 4. Skills Selected + Custom Skill Added + Sticky Tray Active
  console.log('\n[4/6] Capturing Skills Selected + Custom Skill + Sticky Tray...');
  await captureUrl(
    'http://localhost:5173/interview-preparation/frontend-developer/skills',
    'phase2_skills_with_custom.png',
    1440,
    1600,
    false,
    '.skill-sel-categories',
    async (send) => {
      await send('Runtime.evaluate', {
        expression: `
          // Expand all categories first
          const expandBtn = document.querySelectorAll('.skill-sel-actions__btn')[0];
          if (expandBtn && expandBtn.textContent.includes('Expand All')) {
            expandBtn.click();
          }

          // Select first 3 skill items
          const items = document.querySelectorAll('.skill-item');
          if (items.length >= 3) {
            items[0].click();
            items[1].click();
            items[2].click();
          }

          // Add a custom skill
          const customInput = document.querySelector('.skill-custom-input');
          if (customInput) {
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(customInput, 'Three.js & WebGL');
            customInput.dispatchEvent(new Event('input', { bubbles: true }));
            const addBtn = document.querySelector('.skill-custom-add-btn');
            if (addBtn) addBtn.click();
          }
        `
      });
      await new Promise(r => setTimeout(r, 800));
    }
  );

  // 5. Saved State / Confirmation View
  console.log('\n[5/6] Capturing Saved State Confirmation View...');
  await captureUrl(
    'http://localhost:5173/interview-preparation/frontend-developer/skills',
    'phase2_skills_saved_confirmation.png',
    1440,
    1500,
    false,
    '.skill-sel-categories',
    async (send) => {
      await send('Runtime.evaluate', {
        expression: `
          // Select some skills and click Save
          const items = document.querySelectorAll('.skill-item');
          if (items.length >= 2) {
            items[0].click();
            items[1].click();
          }
          const saveBtn = document.querySelector('.skill-sel-tray__save-btn');
          if (saveBtn) {
            saveBtn.click();
          }
        `
      });
      // Wait for saved view
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 250));
        const res = await send('Runtime.evaluate', {
          expression: `Boolean(document.querySelector('.skill-sel-saved-card'))`
        });
        if (res?.result?.value === true) break;
      }
      await new Promise(r => setTimeout(r, 800));
    }
  );

  // 6. Mobile View (390x844)
  console.log('\n[6/6] Capturing Mobile View (390px)...');
  await captureUrl(
    'http://localhost:5173/interview-preparation/frontend-developer/skills',
    'phase2_skills_mobile_view.png',
    390,
    1800,
    true,
    '.skill-sel-categories'
  );

  console.log('\n' + '='.repeat(70));
  console.log('ALL PHASE 2 SCREENSHOTS CAPTURED SUCCESSFULLY!');
  console.log('='.repeat(70));
}

run().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
