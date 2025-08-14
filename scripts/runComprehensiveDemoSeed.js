
const { seedComprehensiveDemoData } = require('../server/seedComprehensiveDemoData.ts');

async function runSeed() {
  console.log('🚀 Starting comprehensive demo data seed process...');
  
  try {
    await seedComprehensiveDemoData();
    console.log('✅ Comprehensive demo data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running comprehensive demo seed:', error);
    process.exit(1);
  }
}

runSeed();
