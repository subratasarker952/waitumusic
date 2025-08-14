import { db } from "./db";
import { globalProfessions } from "../shared/schema";
import { eq } from "drizzle-orm";

const professionCategories = {
  "Legal & Rights": [
    { name: "Entertainment Lawyer", description: "Specialized in music industry contracts and rights" },
    { name: "Copyright Attorney", description: "Handles intellectual property and copyright matters" },
    { name: "Music Rights Manager", description: "Manages publishing and performance rights" },
    { name: "Contract Negotiator", description: "Negotiates recording and publishing deals" },
    { name: "Trademark Attorney", description: "Handles brand protection and trademark registration" },
    { name: "Licensing Specialist", description: "Manages sync and licensing agreements" },
    { name: "Music Law Consultant", description: "Provides legal advice on music industry matters" },
  ],
  "Business & Finance": [
    { name: "Music Business Manager", description: "Manages financial and business affairs" },
    { name: "Music Accountant", description: "Handles accounting and tax matters for musicians" },
    { name: "Financial Advisor", description: "Provides financial planning and investment advice" },
    { name: "Business Consultant", description: "Advises on business strategy and operations" },
    { name: "Tour Accountant", description: "Manages finances for touring operations" },
    { name: "Royalty Analyst", description: "Analyzes and audits royalty statements" },
    { name: "Music Industry Analyst", description: "Provides market research and industry insights" },
  ],
  "Marketing & Promotion": [
    { name: "Music Marketing Manager", description: "Develops and executes marketing strategies" },
    { name: "Social Media Manager", description: "Manages social media presence and engagement" },
    { name: "PR Specialist", description: "Handles public relations and media coverage" },
    { name: "Brand Manager", description: "Develops and maintains artist brand identity" },
    { name: "Digital Marketing Specialist", description: "Focuses on online marketing and advertising" },
    { name: "Radio Promoter", description: "Promotes music to radio stations and DJs" },
    { name: "Music Publicist", description: "Manages press relations and media coverage" },
  ],
  "A&R & Talent": [
    { name: "A&R Representative", description: "Scouts and develops new talent" },
    { name: "Talent Scout", description: "Identifies and evaluates new artists" },
    { name: "Artist Development Manager", description: "Guides artistic and career development" },
    { name: "Music Supervisor", description: "Selects music for films, TV, and advertising" },
    { name: "Label Representative", description: "Represents record label interests" },
    { name: "Music Director", description: "Oversees musical content and programming" },
    { name: "Creative Director", description: "Provides creative vision and direction" },
  ],
  "Production & Technical": [
    { name: "Music Producer", description: "Oversees recording and production process" },
    { name: "Audio Engineer", description: "Handles recording, mixing, and mastering" },
    { name: "Sound Designer", description: "Creates and designs sound effects and textures" },
    { name: "Music Technology Consultant", description: "Advises on music technology and software" },
    { name: "Studio Manager", description: "Manages recording studio operations" },
    { name: "Live Sound Engineer", description: "Handles sound for live performances" },
    { name: "Music Software Developer", description: "Develops music-related software and apps" },
  ],
  "Media & Content": [
    { name: "Music Journalist", description: "Writes about music and the music industry" },
    { name: "Music Video Director", description: "Directs and produces music videos" },
    { name: "Content Creator", description: "Creates music-related content for various platforms" },
    { name: "Music Photographer", description: "Specializes in music and artist photography" },
    { name: "Music Blogger", description: "Writes blogs and articles about music" },
    { name: "Podcast Producer", description: "Produces music-related podcasts" },
    { name: "Music Documentarian", description: "Creates documentaries about music and artists" },
  ],
  "Distribution & Platforms": [
    { name: "Digital Distribution Manager", description: "Manages digital music distribution" },
    { name: "Streaming Platform Manager", description: "Manages relationships with streaming services" },
    { name: "Music Aggregator", description: "Aggregates and distributes music to multiple platforms" },
    { name: "Playlist Curator", description: "Curates playlists for streaming platforms" },
    { name: "Music Retail Manager", description: "Manages physical and digital music retail" },
    { name: "Platform Relations Manager", description: "Manages relationships with music platforms" },
  ],
  "Event & Live": [
    { name: "Concert Promoter", description: "Promotes and organizes live music events" },
    { name: "Venue Manager", description: "Manages music venues and performance spaces" },
    { name: "Tour Manager", description: "Manages logistics for touring operations" },
    { name: "Festival Coordinator", description: "Coordinates music festivals and events" },
    { name: "Booking Agent", description: "Books live performances and tours" },
    { name: "Event Producer", description: "Produces music events and concerts" },
    { name: "Stage Manager", description: "Manages live performance logistics" },
  ],
  "Education & Training": [
    { name: "Music Educator", description: "Teaches music theory, performance, or industry skills" },
    { name: "Music Therapist", description: "Uses music for therapeutic purposes" },
    { name: "Music Industry Trainer", description: "Provides training on music industry practices" },
    { name: "Performance Coach", description: "Coaches artists on performance skills" },
    { name: "Music Business Instructor", description: "Teaches music business and entrepreneurship" },
    { name: "Vocal Coach", description: "Provides vocal training and coaching" },
    { name: "Music Career Counselor", description: "Provides career guidance for musicians" },
  ],
  "Specialized Services": [
    { name: "Music Archivist", description: "Preserves and organizes music collections" },
    { name: "Music Librarian", description: "Manages music libraries and collections" },
    { name: "Music Transcriber", description: "Transcribes music from audio to notation" },
    { name: "Music Translator", description: "Translates music-related content" },
    { name: "Music Critic", description: "Writes critical reviews of music and performances" },
    { name: "Music Consultant", description: "Provides specialized consulting services" },
    { name: "Music Historian", description: "Researches and documents music history" },
  ],
};

export async function seedGlobalProfessions() {
  console.log("Seeding global professions...");
  
  try {
    // Clear existing professions (but not custom ones)
    await db.delete(globalProfessions).where(eq(globalProfessions.isCustom, false));
    
    // Insert all profession categories
    for (const [category, professions] of Object.entries(professionCategories)) {
      for (const profession of professions) {
        await db.insert(globalProfessions).values({
          name: profession.name,
          category,
          description: profession.description,
          isCustom: false,
        });
      }
    }
    
    console.log("Global professions seeded successfully!");
    
    // Log the count
    const count = await db.$count(globalProfessions);
    console.log(`Total professions in database: ${count}`);
    
  } catch (error) {
    console.error("Error seeding global professions:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedGlobalProfessions()
    .then(() => {
      console.log("Seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}