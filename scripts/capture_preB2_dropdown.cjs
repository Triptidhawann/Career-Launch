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
  const tmpDir = path.join(os.tmpdir(), 'edge_preB2_' + Date.now() + '_' + Math.random().toString(36).substring(7));
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
    console.log('\n--- Capturing Pre-B2 Searchable Multi-Select Dropdown Screenshots ---\n');

    // 1. Dropdown Closed View: showing trigger count badge and chips tray
    console.log('[1/5] Capturing Dropdown Closed State with Selected Chips...');
    await captureUrl(
      'http://localhost:5173/interview-preparation/frontend-developer/setup',
      'preB2_dropdown_closed.png',
      1440,
      1800,
      false,
      '.prep-topic-dropdown-trigger, .prep-selected-topics-tray',
      async (send) => {
        // If saved state is showing, click Edit
        await send('Runtime.evaluate', {
          expression: `
            const editBtn = document.querySelector('.prep-setup-saved-card button');
            if (editBtn) editBtn.click();
          `
        });
        await new Promise(r => setTimeout(r, 500));
      }
    );

    // 2. Dropdown Open with Live Search Query: filtering topics by "React"
    console.log('[2/5] Capturing Open Dropdown with Search Filter ("React")...');
    await captureUrl(
      'http://localhost:5173/interview-preparation/frontend-developer/setup',
      'preB2_dropdown_open_search.png',
      1440,
      2000,
      false,
      '.prep-topic-dropdown-trigger',
      async (send) => {
        // Click edit if saved
        await send('Runtime.evaluate', {
          expression: `
            const editBtn = document.querySelector('.prep-setup-saved-card button');
            if (editBtn) editBtn.click();
          `
        });
        await new Promise(r => setTimeout(r, 500));

        // Open dropdown
        await send('Runtime.evaluate', {
          expression: `
            const trigger = document.querySelector('.prep-topic-dropdown-trigger');
            if (trigger) trigger.click();
          `
        });
        await new Promise(r => setTimeout(r, 600));

        // Type "React" into search input
        await send('Runtime.evaluate', {
          expression: `
            const searchInput = document.querySelector('.prep-topic-dropdown-search-input');
            if (searchInput) {
              searchInput.value = 'React';
              searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
          `
        });
        await new Promise(r => setTimeout(r, 500));
      }
    );

    // 3. Dropdown with "Other — Add my own topic" & Custom Topics Added
    console.log('[3/5] Capturing Custom Topic Addition & Multiple Chips...');
    await captureUrl(
      'http://localhost:5173/interview-preparation/frontend-developer/setup',
      'preB2_dropdown_custom_topic.png',
      1440,
      2200,
      false,
      '.prep-topic-dropdown-trigger',
      async (send) => {
        // Click edit if saved
        await send('Runtime.evaluate', {
          expression: `
            const editBtn = document.querySelector('.prep-setup-saved-card button');
            if (editBtn) editBtn.click();
          `
        });
        await new Promise(r => setTimeout(r, 500));

        // Open dropdown
        await send('Runtime.evaluate', {
          expression: `
            const trigger = document.querySelector('.prep-topic-dropdown-trigger');
            if (trigger) trigger.click();
          `
        });
        await new Promise(r => setTimeout(r, 500));

        // Add custom topic 1: "Next.js 14 App Router"
        await send('Runtime.evaluate', {
          expression: `
            const customInput = document.querySelector('.prep-topic-dropdown-other__input');
            const addBtn = document.querySelector('.prep-topic-dropdown-other__add-btn');
            if (customInput && addBtn) {
              customInput.value = 'Next.js 14 App Router';
              customInput.dispatchEvent(new Event('input', { bubbles: true }));
              addBtn.click();
            }
          `
        });
        await new Promise(r => setTimeout(r, 500));

        // Add custom topic 2: "Redux Toolkit & RTK Query"
        await send('Runtime.evaluate', {
          expression: `
            const customInput = document.querySelector('.prep-topic-dropdown-other__input');
            const addBtn = document.querySelector('.prep-topic-dropdown-other__add-btn');
            if (customInput && addBtn) {
              customInput.value = 'Redux Toolkit & RTK Query';
              customInput.dispatchEvent(new Event('input', { bubbles: true }));
              addBtn.click();
            }
          `
        });
        await new Promise(r => setTimeout(r, 500));
      }
    );

    // 4. Mobile Responsiveness View (390x2000)
    console.log('[4/5] Capturing Searchable Dropdown Mobile View (390px)...');
    await captureUrl(
      'http://localhost:5173/interview-preparation/frontend-developer/setup',
      'preB2_dropdown_mobile.png',
      390,
      2200,
      true,
      '.prep-topic-dropdown-trigger',
      async (send) => {
        // Click edit if saved
        await send('Runtime.evaluate', {
          expression: `
            const editBtn = document.querySelector('.prep-setup-saved-card button');
            if (editBtn) editBtn.click();
          `
        });
        await new Promise(r => setTimeout(r, 500));
      }
    );

    // 5. Preparation Setup Saved Confirmation State (With Official and Custom Topics summary)
    console.log('[5/5] Capturing Saved State with Official and Custom Topics...');
    await captureUrl(
      'http://localhost:5173/interview-preparation/frontend-developer/setup',
      'preB2_saved_state_with_custom.png',
      1440,
      1800,
      false,
      '.prep-setup-card, .prep-setup-saved-card',
      async (send) => {
        // If in saved card, click edit first to fill custom topics
        await send('Runtime.evaluate', {
          expression: `
            const editBtn = document.querySelector('.prep-setup-saved-card button');
            if (editBtn) editBtn.click();
          `
        });
        await new Promise(r => setTimeout(r, 500));

        // Add custom topic and fill prompt
        await send('Runtime.evaluate', {
          expression: `
            const textarea = document.querySelector('#goalPrompt');
            if (textarea) {
              textarea.value = "Preparing for Frontend SDE-1 placement interviews. Targeting core React architecture, Next.js App Router, CSS layouts and performance optimization.";
              textarea.dispatchEvent(new Event('input', { bubbles: true }));
            }
            const customInput = document.querySelector('.prep-topic-dropdown-other__input');
            const addBtn = document.querySelector('.prep-topic-dropdown-other__add-btn');
            if (customInput && addBtn) {
              customInput.value = 'Next.js 14 App Router';
              customInput.dispatchEvent(new Event('input', { bubbles: true }));
              addBtn.click();
            }
          `
        });
        await new Promise(r => setTimeout(r, 600));

        // Submit form
        await send('Runtime.evaluate', {
          expression: `
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.click();
          `
        });

        // Wait for saved card
        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 200));
          const chk = await send('Runtime.evaluate', {
            expression: `Boolean(document.querySelector('.prep-setup-saved-card'))`
          });
          if (chk?.result?.value) break;
        }
      }
    );

    console.log('\n✓ All 5 Pre-B2 verification screenshots captured successfully in Artifact Directory!');
  } catch (err) {
    console.error('Screenshot capture failed:', err);
    process.exit(1);
  }
}

run();
