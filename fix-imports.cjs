
const fs = require('fs');
const path = require('path');

const files = [
  'server/seedData.ts',
  'server/recommendationEngine.ts', 
  'server/oppHubSocialMediaAI.ts',
  'server/oppHubOpportunityMatcher.ts',
  'server/ai-recommendations.ts',
  'server/configuration-routes.ts',
  'server/routes/technicalRiderIntegration.ts',
  'server/oppHubComprehensiveSystemAnalyzer.ts',
  'server/oppHubSubscriptionEngine.ts',
  'server/oppHubProfessionalGuidanceEngine.ts',
  'server/currencyService.ts',
  'server/isrcGenerator.ts',
  'server/middleware/permission-system.ts',
  'server/middleware/permission-validator.ts',
  'server/oppHubProactiveSystemMonitor.ts',
  'server/oppHubRevenueEngine.ts',
  'server/opportunityMatchingEngine.ts',
  'server/professionalIntegrationSystem.ts'
];

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace imports that get db from storage
    content = content.replace(
      /import\s*{\s*db\s*}\s*from\s*['"]\.\/storage['"];?/g, 
      "import { db } from './db';"
    );
    content = content.replace(
      /import\s*{\s*db\s*}\s*from\s*['"]\.\.\/storage['"];?/g, 
      "import { db } from '../db';"
    );
    content = content.replace(
      /import\s*{\s*db,\s*(.*?)\s*}\s*from\s*['"]\.\/storage['"];?/g, 
      "import { db } from './db';\nimport { $1 } from './storage';"
    );
    content = content.replace(
      /import\s*{\s*db,\s*(.*?)\s*}\s*from\s*['"]\.\.\/storage['"];?/g, 
      "import { db } from '../db';\nimport { $1 } from '../storage';"
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in ${filePath}`);
  } else {
    console.log(`File ${filePath} does not exist`);
  }
});

console.log('All imports fixed!');
