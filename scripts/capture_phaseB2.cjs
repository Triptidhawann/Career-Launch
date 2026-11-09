const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Tripti Dhawan\\.gemini\\antigravity\\brain\\bb47f723-df86-42ba-9e78-5b46672d66af';

// Valid student JWT token
const sHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
const sPayload = Buffer.from(JSON.stringify({
  user_id: 'H0cYrHDcguQl66eMXY5niCG8mEj2',
  email: 'triptidhawan15@gmail.com',
  name: 'Tripti Dhawan'
})).toString('base64url');
const studentToken = `${sHeader}.${sPayload}.sig`;

async function captureUrl(url, outFileName, width = 1440, height = 2200, isMobile = false, selectorWait = 'h1, h2, form, article', actions = null) {
  const tmpDir = path.join(os.tmpdir(), 'edge_pb2_' + Date.now() + '_' + Math.random().toString(36).substring(7));
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
    console.log('\n--- Capturing Phase B2 Visual Verification Screenshots ---\n');

    // 1. Setup Session & Navigate to Diagnostic (MCQ View)
    console.log('[1/7] Capturing Diagnostic Question View (MCQ)...');
    await captureUrl(
      'http://localhost:5173/interview-preparation/frontend-developer/diagnostic',
      'phaseB2_diagnostic_question_mcq.png',
      1440,
      1800,
      false,
      '.diag-card, .diag-options-grid',
      async (send) => {
        // Select first radio option
        await send('Runtime.evaluate', {
          expression: `
            const firstOpt = document.querySelector('.diag-option-card');
            if (firstOpt) firstOpt.click();
          `
        });
        await new Promise(r => setTimeout(r, 400));
      }
    );

    // 2. Formative Feedback View
    console.log('[2/7] Capturing Formative Feedback State...');
    await captureUrl(
      'http://localhost:5173/interview-preparation/frontend-developer/diagnostic',
      'phaseB2_diagnostic_feedback.png',
      1440,
      1800,
      false,
      '.diag-card',
      async (send) => {
        // Submit answer to show formative feedback
        await send('Runtime.evaluate', {
          expression: `
            const firstOpt = document.querySelector('.diag-option-card');
            if (firstOpt) firstOpt.click();
            const submitBtn = document.querySelector('.diag-btn-submit');
            if (submitBtn) submitBtn.click();
          `
        });
        // Wait for feedback card
        for (let i = 0; i < 20; i++) {
          await new Promise(r => setTimeout(r, 200));
          const chk = await send('Runtime.evaluate', {
            expression: `Boolean(document.querySelector('.diag-feedback-card'))`
          });
          if (chk?.result?.value) break;
        }
      }
    );

    // 3. Diagnostic Completion Summary Screen
    console.log('[3/7] Capturing Diagnostic Completion Summary Screen...');
    await captureUrl(
      'http://localhost:5173/interview-preparation/frontend-developer/diagnostic',
      'phaseB2_diagnostic_summary.png',
      1440,
      1800,
      false,
      '.diag-card, .diag-summary-card',
      async (send) => {
        // Click skip remaining
        await send('Runtime.evaluate', {
          expression: `
            window.confirm = () => true;
            const skipBtn = document.querySelector('.diag-skip-all-btn');
            if (skipBtn) skipBtn.click();
          `
        });
        for (let i = 0; i < 25; i++) {
          await new Promise(r => setTimeout(r, 200));
          const chk = await send('Runtime.evaluate', {
            expression: `Boolean(document.querySelector('.diag-summary-card'))`
          });
          if (chk?.result?.value) break;
        }
      }
    );

    // 4. Personalised Preparation Plan Overview & Milestones
    console.log('[4/7] Generating and Capturing Preparation Plan Page (Desktop)...');
    // First, let's fetch the latest planId from the backend
    const planRes = await fetch('http://127.0.0.1:5000/api/prep/plan/latest?roleId=frontend-developer', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const planData = await planRes.json();
    const planId = planData?.plan?.planId;

    if (!planId) {
      throw new Error('No planId found from latest plan query.');
    }

    await captureUrl(
      `http://localhost:5173/interview-preparation/frontend-developer/plan/${planId}`,
      'phaseB2_generated_preparation_plan.png',
      1440,
      2800,
      false,
      '.plan-hero, .plan-milestones-list'
    );

    // 5. Plan Customized View (Adding custom milestone / showing unsaved badge)
    console.log('[5/7] Capturing Plan Customization View...');
    await captureUrl(
      `http://localhost:5173/interview-preparation/frontend-developer/plan/${planId}`,
      'phaseB2_plan_customized.png',
      1440,
      2800,
      false,
      '.plan-hero, .plan-milestones-list',
      async (send) => {
        // Click Move Down on first milestone to trigger unsaved customization
        await send('Runtime.evaluate', {
          expression: `
            const moveDownBtn = document.querySelector('.plan-icon-btn[title="Move milestone down"]');
            if (moveDownBtn) moveDownBtn.click();
          `
        });
        await new Promise(r => setTimeout(r, 600));
      }
    );

    // 6. Plan Accepted Final State
    console.log('[6/7] Capturing Accepted Plan Final Confirmation State...');
    // Accept plan via API first so it renders the celebration banner
    await fetch(`http://127.0.0.1:5000/api/prep/plan/${planId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    await captureUrl(
      `http://localhost:5173/interview-preparation/frontend-developer/plan/${planId}`,
      'phaseB2_plan_accepted.png',
      1440,
      2600,
      false,
      '.plan-accepted-banner, .plan-milestones-list'
    );

    // 7. Plan Mobile View (390px)
    console.log('[7/7] Capturing Plan Mobile Responsiveness (390px)...');
    await captureUrl(
      `http://localhost:5173/interview-preparation/frontend-developer/plan/${planId}`,
      'phaseB2_plan_mobile.png',
      390,
      3200,
      true,
      '.plan-accepted-banner, .plan-milestones-list'
    );

    console.log('\n✓ All 7 Phase B2 verification screenshots captured in Artifact Directory!');
  } catch (err) {
    console.error('Screenshot capture failed:', err);
    process.exit(1);
  }
}

run();
