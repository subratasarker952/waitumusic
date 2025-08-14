import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.ts";
import { eq, and } from 'drizzle-orm';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

// Demo data for various user types
const demoData = {
  // Demo Artists
  artists: [
    {
      stageName: "Aria Nova",
      userType: "artist",
      genre: "Pop",
      secondaryTalents: [
        { skillType: "instrument", skillName: "Piano", proficiencyLevel: "expert" },
        { skillType: "instrument", skillName: "Guitar", proficiencyLevel: "advanced" },
        { skillType: "skill", skillName: "Songwriting", proficiencyLevel: "expert" },
        { skillType: "skill", skillName: "Music Production", proficiencyLevel: "intermediate" }
      ],
      technicalRequirements: [
        { requirementType: "equipment", requirementName: "Wireless Microphone", specifications: "Shure ULXD2/Beta87A or equivalent high-end wireless system", isRequired: true },
        { requirementType: "equipment", requirementName: "Stage Piano", specifications: "88-key weighted action, Nord Stage 3 or Yamaha CP88 preferred", isRequired: true },
        { requirementType: "stage_setup", requirementName: "Center Stage Position", specifications: "Main vocal position with 6ft radius clear space for movement", isRequired: true },
        { requirementType: "lighting", requirementName: "Follow Spot", specifications: "LED follow spot for solo segments with warm white 3200K color temperature", isRequired: false }
      ],
      hospitalityRequirements: [
        { requirementType: "dressing_room", requirementName: "Private Dressing Room", specifications: "Lockable room with mirror, seating for 3, and power outlets", isRequired: true },
        { requirementType: "catering", requirementName: "Vegetarian Meal", specifications: "Plant-based dinner option 2 hours before show, no nuts", isRequired: true },
        { requirementType: "transportation", requirementName: "Ground Transportation", specifications: "Sedan or SUV for 3 people from hotel to venue", isRequired: false },
        { requirementType: "accommodation", requirementName: "Hotel Room", specifications: "4-star hotel within 15 minutes of venue, non-smoking", isRequired: false }
      ],
      performanceSpecs: [
        { specType: "duration", specName: "Set Length", specValue: "45 minutes" },
        { specType: "break_requirements", specName: "Intermission", specValue: "10 minute break after 25 minutes if acoustic set" },
        { specType: "setup_time", specName: "Sound Check", specValue: "30 minutes minimum for full setup and line check" }
      ]
    },
    {
      stageName: "Marcus Thunder",
      userType: "artist", 
      genre: "Hip-Hop",
      secondaryTalents: [
        { skillType: "instrument", skillName: "Turntables", proficiencyLevel: "expert" },
        { skillType: "skill", skillName: "Beat Making", proficiencyLevel: "expert" },
        { skillType: "skill", skillName: "Rap Writing", proficiencyLevel: "expert" },
        { skillType: "skill", skillName: "Audio Engineering", proficiencyLevel: "advanced" }
      ],
      technicalRequirements: [
        { requirementType: "equipment", requirementName: "DJ Controller", specifications: "Pioneer CDJ-3000 or equivalent with USB and streaming capability", isRequired: true },
        { requirementType: "equipment", requirementName: "Wireless Mic", specifications: "Dynamic handheld wireless mic with backup transmitter", isRequired: true },
        { requirementType: "stage_setup", requirementName: "DJ Booth Setup", specifications: "4ft x 6ft table at stage left with power and monitor access", isRequired: true },
        { requirementType: "lighting", requirementName: "Strobe Effects", specifications: "Programmable LED strobes synchronized to BPM detection", isRequired: false }
      ],
      hospitalityRequirements: [
        { requirementType: "dressing_room", requirementName: "Artist Lounge", specifications: "Shared space with couch, refreshments, and WiFi access", isRequired: true },
        { requirementType: "catering", requirementName: "Energy Drinks", specifications: "Red Bull, Monster, or similar energy drinks on ice", isRequired: true },
        { requirementType: "guest_list", requirementName: "VIP Access", specifications: "6 guest passes for friends and collaborators", isRequired: false }
      ],
      performanceSpecs: [
        { specType: "duration", specName: "Performance Time", specValue: "60 minutes with possible 15-minute encore" },
        { specType: "setup_time", specName: "Equipment Setup", specValue: "45 minutes for turntable setup and sound check" }
      ]
    }
  ],

  // Demo Musicians  
  musicians: [
    {
      stageName: "Jazz Rodriguez",
      userType: "musician",
      genre: "Jazz",
      primaryInstrument: "Bass Guitar",
      secondaryTalents: [
        { skillType: "instrument", skillName: "Upright Bass", proficiencyLevel: "expert" },
        { skillType: "instrument", skillName: "Bass Guitar", proficiencyLevel: "expert" },
        { skillType: "instrument", skillName: "Cello", proficiencyLevel: "intermediate" },
        { skillType: "skill", skillName: "Music Arrangement", proficiencyLevel: "advanced" },
        { skillType: "skill", skillName: "Session Recording", proficiencyLevel: "expert" }
      ],
      technicalRequirements: [
        { requirementType: "equipment", requirementName: "Bass Amplifier", specifications: "Ampeg SVT-VR or equivalent 300W tube head with 8x10 cabinet", isRequired: true },
        { requirementType: "equipment", requirementName: "Direct Input Box", specifications: "Active DI with ground lift and pad, Avalon U5 preferred", isRequired: true },
        { requirementType: "equipment", requirementName: "Upright Bass Pickup", specifications: "Realist SoundClip or equivalent piezo pickup system", isRequired: false },
        { requirementType: "stage_setup", requirementName: "Stage Position", specifications: "Stage right with 4ft space for upright bass if needed", isRequired: true }
      ],
      hospitalityRequirements: [
        { requirementType: "dressing_room", requirementName: "Instrument Storage", specifications: "Secure area for upright bass case with climate control", isRequired: true },
        { requirementType: "catering", requirementName: "Healthy Snacks", specifications: "Fresh fruit, nuts, and water available throughout event", isRequired: true },
        { requirementType: "parking", requirementName: "Load-In Access", specifications: "Vehicle access to stage door for large instrument transport", isRequired: true }
      ],
      performanceSpecs: [
        { specType: "setup_time", specName: "Instrument Setup", specValue: "20 minutes for electric setup, 30 minutes if using upright bass" },
        { specType: "break_requirements", specName: "Tuning Breaks", specValue: "2-minute breaks between sets for tuning checks" }
      ]
    },
    {
      stageName: "Harmony Keys",
      userType: "musician",
      genre: "Gospel", 
      primaryInstrument: "Keyboard",
      secondaryTalents: [
        { skillType: "instrument", skillName: "Piano", proficiencyLevel: "expert" },
        { skillType: "instrument", skillName: "Organ", proficiencyLevel: "expert" },
        { skillType: "instrument", skillName: "Synthesizer", proficiencyLevel: "advanced" },
        { skillType: "skill", skillName: "Music Direction", proficiencyLevel: "advanced" },
        { skillType: "skill", skillName: "Vocal Arrangement", proficiencyLevel: "intermediate" }
      ],
      technicalRequirements: [
        { requirementType: "equipment", requirementName: "Stage Piano", specifications: "Nord Stage 3 or Yamaha CP88 with weighted 88-key action", isRequired: true },
        { requirementType: "equipment", requirementName: "Synthesizer", specifications: "Roland Fantom or Korg Kronos workstation", isRequired: true },
        { requirementType: "equipment", requirementName: "Keyboard Stand", specifications: "Heavy-duty dual-tier X-frame stand", isRequired: true },
        { requirementType: "stage_setup", requirementName: "Keyboard Rig", specifications: "6ft x 4ft area center-left with power and monitor access", isRequired: true }
      ],
      hospitalityRequirements: [
        { requirementType: "dressing_room", requirementName: "Warm-up Space", specifications: "Quiet room with acoustic piano or keyboard for pre-show preparation", isRequired: true },
        { requirementType: "catering", requirementName: "Tea and Honey", specifications: "Hot herbal tea and honey available for vocal preparation", isRequired: true }
      ],
      performanceSpecs: [
        { specType: "setup_time", specName: "Keyboard Setup", specValue: "25 minutes for dual keyboard rig setup and programming" },
        { specType: "duration", specName: "Performance Length", specValue: "Variable based on service requirements, 30-90 minutes" }
      ]
    }
  ],

  // Demo Professionals
  professionals: [
    {
      fullName: "Sarah Chen",
      userType: "professional",
      specialty: "Sound Engineer",
      secondaryTalents: [
        { skillType: "skill", skillName: "Live Sound Engineering", proficiencyLevel: "expert" },
        { skillType: "skill", skillName: "Studio Recording", proficiencyLevel: "advanced" },
        { skillType: "skill", skillName: "Audio Post-Production", proficiencyLevel: "advanced" },
        { skillType: "skill", skillName: "System Design", proficiencyLevel: "intermediate" },
        { skillType: "capability", skillName: "Multi-language Support", proficiencyLevel: "advanced" }
      ],
      technicalRequirements: [
        { requirementType: "equipment", requirementName: "Digital Console", specifications: "32+ channel digital board, Yamaha CL5 or Avid S6L preferred", isRequired: true },
        { requirementType: "equipment", requirementName: "Monitor System", specifications: "IEM system with 8+ channels, Shure PSM1000 or Sennheiser G4", isRequired: true },
        { requirementType: "equipment", requirementName: "Recording Interface", specifications: "Multi-track recording capability, minimum 32 channels", isRequired: false },
        { requirementType: "stage_setup", requirementName: "FOH Position", specifications: "Front of house position with clear sightlines to stage", isRequired: true }
      ],
      hospitalityRequirements: [
        { requirementType: "catering", requirementName: "Coffee Service", specifications: "Fresh coffee and energy drinks available throughout event", isRequired: true },
        { requirementType: "accommodation", requirementName: "Tech Hotel", specifications: "Hotel accommodation if event requires multi-day setup", isRequired: false },
        { requirementType: "transportation", requirementName: "Equipment Transport", specifications: "Assistance with heavy equipment loading/unloading", isRequired: false }
      ],
      performanceSpecs: [
        { specType: "setup_time", specName: "System Setup", specValue: "3-4 hours for full PA system setup and sound check" },
        { specType: "break_requirements", specName: "Technical Breaks", specValue: "15-minute breaks every 2 hours during long events" }
      ]
    },
    {
      fullName: "David Martinez",
      userType: "professional",
      specialty: "Music Producer",
      secondaryTalents: [
        { skillType: "skill", skillName: "Music Production", proficiencyLevel: "expert" },
        { skillType: "skill", skillName: "Beat Making", proficiencyLevel: "expert" },
        { skillType: "skill", skillName: "Mixing", proficiencyLevel: "advanced" },
        { skillType: "skill", skillName: "Mastering", proficiencyLevel: "intermediate" },
        { skillType: "instrument", skillName: "Piano", proficiencyLevel: "advanced" },
        { skillType: "instrument", skillName: "Guitar", proficiencyLevel: "intermediate" }
      ],
      technicalRequirements: [
        { requirementType: "equipment", requirementName: "Mobile Studio Setup", specifications: "Laptop with Pro Tools/Logic, audio interface, and studio monitors", isRequired: true },
        { requirementType: "equipment", requirementName: "MIDI Controller", specifications: "88-key weighted MIDI controller for live production", isRequired: true },
        { requirementType: "stage_setup", requirementName: "Production Station", specifications: "Table setup with power, ethernet, and isolation from audience", isRequired: true }
      ],
      hospitalityRequirements: [
        { requirementType: "dressing_room", requirementName: "Production Suite", specifications: "Quiet room for audio work with reliable WiFi and multiple power outlets", isRequired: true },
        { requirementType: "catering", requirementName: "Brain Food", specifications: "Light meals and healthy snacks to maintain focus during long sessions", isRequired: true }
      ],
      performanceSpecs: [
        { specType: "setup_time", specName: "Production Setup", specValue: "45 minutes for mobile studio setup and software configuration" },
        { specType: "duration", specName: "Session Length", specValue: "Flexible based on project needs, typically 2-8 hour blocks" }
      ]
    }
  ]
};

async function seedDemoRequirements() {
  console.log('🌱 Starting demo requirements seeding...');

  try {
    // Get all demo users from the database
    const demoUsers = await db
      .select({
        id: schema.users.id,
        fullName: schema.users.fullName,
        roleId: schema.users.roleId,
        isDemo: schema.users.isDemo
      })
      .from(schema.users)
      .where(eq(schema.users.isDemo, true));

    console.log(`📊 Found ${demoUsers.length} demo users`);

    for (const user of demoUsers) {
      console.log(`\n👤 Processing demo user: ${user.fullName} (Role: ${user.roleId})`);

      // Determine user type based on role
      let userType = 'fan';
      let demoProfile = null;
      
      if (user.roleId === 3 || user.roleId === 4) { // artist or managed_artist
        userType = 'artist';
        // Find matching demo profile by name similarity
        demoProfile = demoData.artists.find(artist => 
          user.fullName.toLowerCase().includes(artist.stageName.toLowerCase().split(' ')[0]) ||
          artist.stageName.toLowerCase().includes(user.fullName.toLowerCase().split(' ')[0])
        ) || demoData.artists[0]; // fallback to first artist
      } else if (user.roleId === 5 || user.roleId === 6) { // musician or managed_musician
        userType = 'musician';
        demoProfile = demoData.musicians.find(musician => 
          user.fullName.toLowerCase().includes(musician.stageName?.toLowerCase().split(' ')[0]) ||
          musician.stageName?.toLowerCase().includes(user.fullName.toLowerCase().split(' ')[0])
        ) || demoData.musicians[0]; // fallback to first musician
      } else if (user.roleId === 7 || user.roleId === 8) { // professional or managed_professional
        userType = 'professional';
        demoProfile = demoData.professionals.find(prof => 
          user.fullName.toLowerCase().includes(prof.fullName.toLowerCase().split(' ')[0]) ||
          prof.fullName.toLowerCase().includes(user.fullName.toLowerCase().split(' ')[0])
        ) || demoData.professionals[0]; // fallback to first professional
      }

      if (!demoProfile) {
        console.log(`⚠️  No demo profile found for ${user.fullName}, skipping...`);
        continue;
      }

      // Clear existing demo data for this user
      await db.delete(schema.userSkillsAndInstruments)
        .where(and(
          eq(schema.userSkillsAndInstruments.userId, user.id),
          eq(schema.userSkillsAndInstruments.isDemo, true)
        ));
      
      await db.delete(schema.userTechnicalRequirements)
        .where(and(
          eq(schema.userTechnicalRequirements.userId, user.id),
          eq(schema.userTechnicalRequirements.isDemo, true)
        ));
      
      await db.delete(schema.userHospitalityRequirements)
        .where(and(
          eq(schema.userHospitalityRequirements.userId, user.id),
          eq(schema.userHospitalityRequirements.isDemo, true)
        ));
      
      await db.delete(schema.userPerformanceSpecs)
        .where(and(
          eq(schema.userPerformanceSpecs.userId, user.id),
          eq(schema.userPerformanceSpecs.isDemo, true)
        ));

      // Add secondary talents
      console.log(`🎯 Adding ${demoProfile.secondaryTalents.length} secondary talents...`);
      for (const talent of demoProfile.secondaryTalents) {
        await db.insert(schema.userSkillsAndInstruments).values({
          userId: user.id,
          skillType: talent.skillType,
          skillName: talent.skillName,
          proficiencyLevel: talent.proficiencyLevel,
          isDemo: true
        });
      }

      // Add technical requirements
      if (demoProfile.technicalRequirements) {
        console.log(`🎛️ Adding ${demoProfile.technicalRequirements.length} technical requirements...`);
        for (const req of demoProfile.technicalRequirements) {
          await db.insert(schema.userTechnicalRequirements).values({
            userId: user.id,
            requirementType: req.requirementType,
            requirementName: req.requirementName,
            specifications: req.specifications,
            isRequired: req.isRequired,
            isDemo: true
          });
        }
      }

      // Add hospitality requirements
      if (demoProfile.hospitalityRequirements) {
        console.log(`🏨 Adding ${demoProfile.hospitalityRequirements.length} hospitality requirements...`);
        for (const req of demoProfile.hospitalityRequirements) {
          await db.insert(schema.userHospitalityRequirements).values({
            userId: user.id,
            requirementType: req.requirementType,
            requirementName: req.requirementName,
            specifications: req.specifications,
            isRequired: req.isRequired,
            isDemo: true
          });
        }
      }

      // Add performance specs
      if (demoProfile.performanceSpecs) {
        console.log(`⏱️ Adding ${demoProfile.performanceSpecs.length} performance specifications...`);
        for (const spec of demoProfile.performanceSpecs) {
          await db.insert(schema.userPerformanceSpecs).values({
            userId: user.id,
            specType: spec.specType,
            specName: spec.specName,
            specValue: spec.specValue,
            isDemo: true
          });
        }
      }

      console.log(`✅ Completed seeding for ${user.fullName}`);
    }

    console.log('\n🎉 Demo requirements seeding completed successfully!');
    
    // Summary
    const totalTalents = await db.select().from(schema.userSkillsAndInstruments).where(eq(schema.userSkillsAndInstruments.isDemo, true));
    const totalTechnical = await db.select().from(schema.userTechnicalRequirements).where(eq(schema.userTechnicalRequirements.isDemo, true));
    const totalHospitality = await db.select().from(schema.userHospitalityRequirements).where(eq(schema.userHospitalityRequirements.isDemo, true));
    const totalPerformance = await db.select().from(schema.userPerformanceSpecs).where(eq(schema.userPerformanceSpecs.isDemo, true));
    
    console.log('\n📈 SEEDING SUMMARY:');
    console.log(`   Secondary Talents: ${totalTalents.length}`);
    console.log(`   Technical Requirements: ${totalTechnical.length}`);
    console.log(`   Hospitality Requirements: ${totalHospitality.length}`);
    console.log(`   Performance Specs: ${totalPerformance.length}`);

  } catch (error) {
    console.error('❌ Error seeding demo requirements:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemoRequirements()
    .then(() => {
      console.log('✅ Demo requirements seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Demo requirements seeding failed:', error);
      process.exit(1);
    });
}

export { seedDemoRequirements };