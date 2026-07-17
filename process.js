const fs = require('fs');
const path = require('path');

const components = [
  { file: 'kyc-verification.tsx', name: 'KycVerification', step: 'KYC_VERIFICATION' },
  { file: 'selfie-verification.tsx', name: 'SelfieVerification', step: 'SELFIE_VERIFICATION' },
  { file: 'aa-link-bank-data-fetch.tsx', name: 'AALinkBankDataFetch', step: 'AA_LINK_BANK_DATA_FETCH' },
  { file: 'tentative-kfs.tsx', name: 'TentativeKFS', step: 'TENTATIVE_KFS' },
  { file: 'field-investigation-rcu.tsx', name: 'FieldInvestigationRCU', step: 'FIELD_INVESTIGATION_RCU' },
  { file: 'enach.tsx', name: 'Enach', step: 'CONSUMER_ENACH', targetFile: 'consumer-enach.tsx' },
  { file: 'final-offer-selection.tsx', name: 'FinalOfferSelection', step: 'FINAL_OFFER_SELECTION' },
  { file: 'penny-drop.tsx', name: 'PennyDrop', step: 'PENNY_DROP' },
  { file: 'kfs-acceptance.tsx', name: 'KFSAcceptance', step: 'KFS_ACCEPTANCE' },
];

const uiDir = path.join(__dirname, 'packages/ui/src/components');
const stepsDir = path.join(__dirname, 'packages/workflow-runtime/src/steps');

for (const comp of components) {
  const sourcePath = path.join(uiDir, comp.file);
  let targetFile = comp.targetFile || comp.file;
  const destPath = path.join(stepsDir, targetFile.replace('.tsx', '-step.tsx'));
  
  if (!fs.existsSync(sourcePath)) {
    console.log(`Source not found: ${sourcePath}`);
    continue;
  }
  
  let content = fs.readFileSync(sourcePath, 'utf8');
  
  // Replace imports like: import { Card, CardContent } from "./card";
  // to: import { Card, CardContent } from "@craft-apex/ui";
  content = content.replace(/from\s+['"]\.\/[^'"]+['"]/g, 'from "@craft-apex/ui"');
  
  // Add registerStepComponent import if not present
  if (!content.includes('registerStepComponent')) {
    content = `import { registerStepComponent } from "../step-component-registry";\n` + content;
  }
  
  // Append registration
  content += `\nregisterStepComponent("${comp.step}", ${comp.name});\n`;
  
  fs.writeFileSync(destPath, content);
  console.log(`Created ${destPath}`);
  
  // Delete original
  fs.unlinkSync(sourcePath);
}

// Now update packages/ui/src/index.ts
const indexTsPath = path.join(__dirname, 'packages/ui/src/index.ts');
let indexTs = fs.readFileSync(indexTsPath, 'utf8');
for (const comp of components) {
  const exportLine = `export * from "./components/${comp.file.replace('.tsx', '')}";\n`;
  indexTs = indexTs.replace(exportLine, '');
}
fs.writeFileSync(indexTsPath, indexTs);
console.log('Updated packages/ui/src/index.ts');
