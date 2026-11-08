const sHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
const sPayload = Buffer.from(
  JSON.stringify({ user_id: 'H0cYrHDcguQl66eMXY5niCG8mEj2', email: 'triptidhawan15@gmail.com' })
).toString('base64url');
const studentToken = sHeader + '.' + sPayload + '.sig';

const tests = [
  { id: 'se-top-3', expectedCanonical: 'swe-top-1' },
  { id: 'swe-top-4', expectedCanonical: 'swe-top-4' },
  { id: 'se-top-7', expectedCanonical: 'swe-top-7' },
  { id: 'se-top-9', expectedCanonical: 'swe-top-9' },
  { id: 'se-top-12', expectedCanonical: 'swe-top-13' },
  { id: 'se-top-6', expectedCanonical: null } // genuinely unavailable
];

async function run() {
  console.log('=== TESTING LESSON RETRIEVAL THROUGH VITE PROXY ===\n');
  for (const t of tests) {
    const start = Date.now();
    const res = await fetch('http://localhost:5173/api/lessons/' + t.id + '?roleId=software-engineer', {
      headers: { authorization: 'Bearer ' + studentToken }
    });
    const duration = Date.now() - start;
    const data = await res.json();
    console.log('Topic ID:', t.id);
    console.log('  HTTP Status:', res.status, '(' + duration + 'ms)');
    console.log('  Available:', data.available);
    console.log('  Resolved Topic ID:', data.lesson?.topicId || 'N/A');
    console.log('  Title:', data.lesson?.title || 'None');
    console.log('  9 Sections Present:', Boolean(
      data.lesson?.content?.introduction &&
      data.lesson?.content?.coreConcepts &&
      data.lesson?.content?.stepByStep &&
      data.lesson?.content?.practicalExamples &&
      data.lesson?.content?.complexityAnalysis &&
      data.lesson?.content?.commonMistakes &&
      data.lesson?.content?.interviewInsights &&
      data.lesson?.content?.summary &&
      data.lesson?.content?.references
    ));
    console.log('');
  }
}

run();
