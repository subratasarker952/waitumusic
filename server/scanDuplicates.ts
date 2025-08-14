// Scan for duplicate methods and teach OppHub AI
import fs from 'fs/promises';
import { oppHubDuplicatePrevention } from './oppHubDuplicateMethodPrevention';

async function scanStorageForDuplicates() {
  try {
    const storageContent = await fs.readFile('./server/storage.ts', 'utf-8');
    const analysis = await oppHubDuplicatePrevention.scanForDuplicateMethods('./server/storage.ts', storageContent);
    
    console.log('🔍 OppHub Duplicate Method Analysis Results:');
    console.log(`📁 File: ${analysis.filePath}`);
    console.log(`📊 Total Methods: ${analysis.totalMethods}`);
    console.log(`❌ Duplicates Found: ${analysis.duplicateCount}`);
    console.log(`⚠️ Risk Level: ${analysis.riskLevel.toUpperCase()}`);
    console.log(`🔧 Auto-fixable: ${analysis.autoFixable}/${analysis.duplicateCount}`);
    
    if (analysis.duplicateMethods.length > 0) {
      console.log('\n🚨 Duplicate Methods Detected:');
      analysis.duplicateMethods.forEach(duplicate => {
        console.log(`\n❌ Method: ${duplicate.methodName}`);
        console.log(`📍 Found at lines: ${duplicate.occurrences.map(o => `${o.lineNumber} (${o.returnType})`).join(', ')}`);
        console.log(`💡 Recommended: ${duplicate.recommendedAction.description}`);
      });
    }
    
    // Report to OppHub Learning System
    await oppHubDuplicatePrevention.reportToOppHubLearning(analysis);
    
    return analysis;
  } catch (error) {
    console.error('Failed to scan for duplicates:', error);
  }
}

// Run the scan
if (require.main === module) {
  scanStorageForDuplicates();
}

export { scanStorageForDuplicates };