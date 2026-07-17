const fs = require('fs');
const path = require('path');

const stepsDir = path.join(__dirname, 'packages/workflow-runtime/src/steps');
const files = fs.readdirSync(stepsDir).filter(f => f.endsWith('-step.tsx'));

for (const f of files) {
  let content = fs.readFileSync(path.join(stepsDir, f), 'utf8');
  if (content.includes('Footer Actions')) {
    const startIndex = content.indexOf('{/* Footer Actions */}');
    let divCount = 0;
    let i = startIndex;
    let foundStartDiv = false;
    
    // Find the end of the div
    while (i < content.length) {
      if (content.substring(i, i + 4) === '<div') {
        divCount++;
        foundStartDiv = true;
      } else if (content.substring(i, i + 6) === '</div') {
        divCount--;
      }
      
      if (foundStartDiv && divCount === 0) {
        break;
      }
      i++;
    }
    
    if (i < content.length) {
      const toRemove = content.substring(startIndex, i + 6);
      content = content.replace(toRemove, '');
      fs.writeFileSync(path.join(stepsDir, f), content);
      console.log(`Removed Footer Actions from ${f}`);
    } else {
      console.log(`Failed to parse Footer Actions in ${f}`);
    }
  }
}
