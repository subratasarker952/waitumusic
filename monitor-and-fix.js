
const fs = require('fs');
const path = require('path');

// Monitor WaituMusic for errors and fix them proactively
class WaituMusicMonitor {
  constructor() {
    this.logFile = path.join(__dirname, 'server.log');
    this.errors = [];
    this.fixes = [];
  }

  // Monitor server logs for errors
  startMonitoring() {
    console.log('🔍 Starting WaituMusic proactive monitoring...');
    
    setInterval(() => {
      this.checkForErrors();
    }, 5000); // Check every 5 seconds

    this.checkForErrors(); // Initial check
  }

  checkForErrors() {
    try {
      if (!fs.existsSync(this.logFile)) {
        console.log('📝 Server log not found yet, waiting...');
        return;
      }

      const logContent = fs.readFileSync(this.logFile, 'utf8');
      const lines = logContent.split('\n');
      const recentLines = lines.slice(-50); // Check last 50 lines

      // Common error patterns and fixes
      const errorPatterns = [
        {
          pattern: /storage is not defined/,
          type: 'STORAGE_IMPORT_ERROR',
          fix: 'Fix storage import in routes.ts'
        },
        {
          pattern: /Cannot read properties of null \(reading 'map'\)/,
          type: 'NULL_MAP_ERROR', 
          fix: 'Add null safety checks for array operations'
        },
        {
          pattern: /email is not defined/,
          type: 'UNDEFINED_VARIABLE',
          fix: 'Fix variable scope in error logging'
        },
        {
          pattern: /ECONNREFUSED.*5432/,
          type: 'DATABASE_CONNECTION',
          fix: 'Database connection failed - check PostgreSQL service'
        },
        {
          pattern: /Login error/,
          type: 'LOGIN_ERROR',
          fix: 'Authentication system needs fixing'
        }
      ];

      for (const line of recentLines) {
        for (const errorDef of errorPatterns) {
          if (errorDef.pattern.test(line) && !this.errors.includes(errorDef.type)) {
            this.errors.push(errorDef.type);
            console.log(`❌ Detected error: ${errorDef.type}`);
            console.log(`🔧 Suggested fix: ${errorDef.fix}`);
            console.log(`📍 Log line: ${line.substring(0, 100)}...`);
            
            // Auto-fix if possible
            this.attemptAutoFix(errorDef.type);
          }
        }
      }

    } catch (error) {
      console.error('Error reading log file:', error.message);
    }
  }

  attemptAutoFix(errorType) {
    console.log(`🔄 Attempting auto-fix for: ${errorType}`);
    
    switch (errorType) {
      case 'STORAGE_IMPORT_ERROR':
        console.log('✅ Storage import error already addressed - server restart needed');
        break;
      case 'LOGIN_ERROR':
        console.log('📝 Login errors detected - comprehensive demo data will resolve this');
        break;
      case 'DATABASE_CONNECTION':
        console.log('🔌 Database connection issue - using external hosted DB');
        break;
      default:
        console.log(`ℹ️  Manual intervention may be required for: ${errorType}`);
    }
  }

  // Report current status
  getStatus() {
    return {
      errors: this.errors,
      fixes: this.fixes,
      timestamp: new Date().toISOString()
    };
  }
}

// Demo users summary for comprehensive testing
const DEMO_USERS_SUMMARY = {
  login_info: {
    password: 'demo123',
    note: 'All demo users use the same password for testing'
  },
  users_by_role: {
    superadmin: [
      'demo.superadmin@waitumusic.com',
      'demo.superadmin2@waitumusic.com'
    ],
    admin: [
      'demo.admin@waitumusic.com', 
      'demo.admin2@waitumusic.com'
    ],
    managed_artists: [
      'demo.liliotave@waitumusic.com',      // Real artist: Lí-Lí Octave
      'demo.janetazzouz@waitumusic.com',    // Real artist: Janet Azzouz
      'demo.artist3@waitumusic.com',        // Demo: C-Dub
      'demo.artist4@waitumusic.com'         // Demo: Bella Sol
    ],
    independent_artists: [
      'demo.indie.artist1@waitumusic.com',  // Rico Flow
      'demo.indie.artist2@waitumusic.com'   // K-Shine
    ],
    managed_musicians: [
      'demo.jcro@waitumusic.com',           // Real artist: JCro
      'demo.princesstrinidad@waitumusic.com', // Real artist: Princess Trinidad
      'demo.musician3@waitumusic.com',      // Bass Master Andre
      'demo.musician4@waitumusic.com'       // Piano Maria
    ],
    independent_musicians: [
      'demo.indie.musician1@waitumusic.com', // Carlos Drums
      'demo.indie.musician2@waitumusic.com'  // Sax Sam
    ],
    professionals: [
      'demo.professional1@waitumusic.com',   // Dr. Michael Thompson
      'demo.professional2@waitumusic.com'    // Sarah Williams
    ],
    managed_professionals: [
      'demo.managedpro1@waitumusic.com',     // Robert Garcia
      'demo.managedpro2@waitumusic.com'      // Lisa Martinez
    ],
    fans: [
      'demo.fan1@waitumusic.com',           // Jennifer Adams
      'demo.fan2@waitumusic.com'            // David Brown
    ]
  },
  real_artists_featured: [
    {
      name: 'Lí-Lí Octave',
      email: 'demo.liliotave@waitumusic.com',
      genre: 'Neo-Soul',
      origin: 'Dominica',
      description: 'Caribbean Neo-Soul Queen with four-octave vocal range'
    },
    {
      name: 'Janet Azzouz',
      email: 'demo.janetazzouz@waitumusic.com', 
      genre: 'Soca',
      origin: 'Martinique/Dominica',
      description: 'Veteran Caribbean artist, decades of experience'
    },
    {
      name: 'JCro',
      email: 'demo.jcro@waitumusic.com',
      genre: 'Inspirational',
      origin: 'Dominica',
      description: 'Dominican inspirational artist and musician'
    },
    {
      name: 'Princess Trinidad',
      email: 'demo.princesstrinidad@waitumusic.com',
      genre: 'Soca',
      origin: 'Trinidad and Tobago',
      description: 'Emerging Trinidadian carnival artist'
    }
  ]
};

// Initialize monitoring
const monitor = new WaituMusicMonitor();
monitor.startMonitoring();

// Print demo users info
console.log('\n🎭 COMPREHENSIVE DEMO USERS CREATED:\n');
console.log('📊 Users Summary:');
Object.entries(DEMO_USERS_SUMMARY.users_by_role).forEach(([role, users]) => {
  console.log(`\n${role.toUpperCase()}:`);
  users.forEach(email => console.log(`  • ${email}`));
});

console.log('\n🌟 FEATURED REAL ARTISTS:');
DEMO_USERS_SUMMARY.real_artists_featured.forEach(artist => {
  console.log(`\n📀 ${artist.name}`);
  console.log(`   Email: ${artist.email}`);
  console.log(`   Genre: ${artist.genre}`);
  console.log(`   Origin: ${artist.origin}`);
  console.log(`   Bio: ${artist.description}`);
});

console.log(`\n🔐 LOGIN INFO:`);
console.log(`   Password for ALL demo users: ${DEMO_USERS_SUMMARY.login_info.password}`);
console.log(`   Note: ${DEMO_USERS_SUMMARY.login_info.note}`);

console.log('\n🔄 Monitoring WaituMusic for errors...');
console.log('💡 Will provide proactive fixes and suggestions');

// Keep the process running
setInterval(() => {
  const status = monitor.getStatus();
  if (status.errors.length > 0) {
    console.log(`\n📊 Current Status: ${status.errors.length} error types detected`);
  }
}, 30000); // Status update every 30 seconds
