const fs = require('fs');
const path = require('path');
const stepsDir = path.join(__dirname, 'packages/workflow-runtime/src/steps');
const files = fs.readdirSync(stepsDir).filter(f => f.endsWith('-step.tsx'));

for (const f of files) {
  let content = fs.readFileSync(path.join(stepsDir, f), 'utf8');
  const idx = content.indexOf('{/* Footer Actions */}');
  
  if (idx !== -1) {
    // Find the end of the div that encapsulates the footer
    // Since we know the file ends with this block, we can just replace from {/* Footer Actions */} to the end of the file,
    // BUT preserving the closing tags of the main component!
    // Let's find the last occurrences of `</div>`, `);`, `};`, etc.
    
    // A simpler regex that matches the Footer Actions block:
    // It starts with {/* Footer Actions */}
    // It contains the <div class="mt-4 flex ...">
    // It ends with </div>
    // Let's match from {/* Footer Actions */} down to </div> right before </div>\n    );
    
    // We can use a regex that matches the footer block div
    const replaced = content.replace(/\{\/\* Footer Actions \*\/\}\s*<div[^>]*>[\s\S]*?<\/div>\s*(<\/div>\s*\);\s*};\s*(export default [^;]+;\s*)?(registerStepComponent[^;]+;\s*)?)$/, '$1');
    
    if (replaced !== content) {
      fs.writeFileSync(path.join(stepsDir, f), replaced);
      console.log(`Successfully removed Footer Actions from ${f}`);
    } else {
      console.log(`Regex did not match for ${f}`);
    }
  }
}
