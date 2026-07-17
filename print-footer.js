const fs = require('fs');
const path = require('path');
const stepsDir = path.join(__dirname, 'packages/workflow-runtime/src/steps');
const files = fs.readdirSync(stepsDir).filter(f => f.endsWith('-step.tsx'));

for (const f of files) {
  let content = fs.readFileSync(path.join(stepsDir, f), 'utf8');
  const idx = content.indexOf('{/* Footer Actions */}');
  if (idx !== -1) {
    console.log(`\n--- ${f} ---`);
    console.log(content.substring(idx, idx + 200) + '...');
  }
}
