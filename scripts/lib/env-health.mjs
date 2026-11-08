import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

/**
 * Checks MongoDB connectivity and database presence using mongoose from server/node_modules.
 */
async function checkMongo(timeoutMs = 4000) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/careerlaunch';
  try {
    const mongoosePath = pathToFileURL(path.join(rootDir, 'server/node_modules/mongoose/index.js')).href;
    const mongoose = (await import(mongoosePath)).default;

    const connectPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs,
      connectTimeoutMS: timeoutMs,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Connection timed out after ${timeoutMs}ms`)), timeoutMs)
    );

    await Promise.race([connectPromise, timeoutPromise]);

    const pingRes = await mongoose.connection.db.admin().ping();
    const studentsCount = await mongoose.connection.db.collection('studentprofiles').countDocuments();
    const lessonsCount = await mongoose.connection.db.collection('generatedlessons').countDocuments();

    await mongoose.disconnect();

    return {
      ok: Boolean(pingRes && pingRes.ok),
      port: 27018,
      database: 'careerlaunch',
      studentsCount,
      lessonsCount,
      message: 'MongoDB is healthy and accepting connections.',
    };
  } catch (err) {
    return {
      ok: false,
      port: 27018,
      database: 'careerlaunch',
      error: err.message,
      message: 'MongoDB connection failed on port 27018.',
    };
  }
}

/**
 * Checks Backend API health on port 5000.
 */
async function checkBackend(timeoutMs = 3000) {
  const url = 'http://127.0.0.1:5000/api/health';
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) {
      return {
        ok: false,
        port: 5000,
        status: res.status,
        message: `Backend returned HTTP ${res.status}`,
      };
    }
    const data = await res.json();
    const isDbConnected = data.database === 'connected';
    return {
      ok: data.status === 'ok' && isDbConnected,
      port: 5000,
      service: data.service,
      database: data.database,
      status: data.status,
      message: isDbConnected
        ? 'CareerLaunch Backend API is running with active database connection.'
        : 'Backend is running but reports database disconnected.',
    };
  } catch (err) {
    return {
      ok: false,
      port: 5000,
      error: err.message,
      message: 'Backend is unreachable on http://127.0.0.1:5000/api/health.',
    };
  }
}

/**
 * Checks Frontend Vite dev server on port 5173.
 */
async function checkFrontend(timeoutMs = 3000) {
  const url = 'http://localhost:5173/';
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    const text = await res.text();
    const isCareerLaunch = text.includes('CareerLaunch') || text.includes('vite') || res.status === 200;
    return {
      ok: res.status === 200 && isCareerLaunch,
      port: 5173,
      status: res.status,
      message: res.status === 200 ? 'Frontend Vite development server is responding.' : `Frontend returned HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      port: 5173,
      error: err.message,
      message: 'Frontend is unreachable on http://localhost:5173.',
    };
  }
}

async function main() {
  const target = (process.argv[2] || 'all').toLowerCase();

  if (target === 'mongo') {
    const res = await checkMongo();
    console.log(JSON.stringify(res));
    process.exit(res.ok ? 0 : 1);
  }

  if (target === 'backend') {
    const res = await checkBackend();
    console.log(JSON.stringify(res));
    process.exit(res.ok ? 0 : 1);
  }

  if (target === 'frontend') {
    const res = await checkFrontend();
    console.log(JSON.stringify(res));
    process.exit(res.ok ? 0 : 1);
  }

  // Target 'all'
  const [mongoRes, backendRes, frontendRes] = await Promise.all([
    checkMongo(),
    checkBackend(),
    checkFrontend(),
  ]);

  const allOk = mongoRes.ok && backendRes.ok && frontendRes.ok;
  console.log(
    JSON.stringify({
      ok: allOk,
      mongo: mongoRes,
      backend: backendRes,
      frontend: frontendRes,
    })
  );

  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err.message }));
  process.exit(1);
});
