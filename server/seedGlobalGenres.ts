import { db } from "./db";
import { globalGenres } from "@shared/schema";

const genreData = [
  // Pop
  { category: "Pop", name: "Pop", description: "Mainstream popular music" },
  { category: "Pop", name: "Dance Pop", description: "Pop music with dance elements" },
  { category: "Pop", name: "Electropop", description: "Pop music with electronic elements" },
  { category: "Pop", name: "Indie Pop", description: "Independent pop music" },
  { category: "Pop", name: "Pop Rock", description: "Pop music with rock elements" },
  { category: "Pop", name: "Synth Pop", description: "Pop music with synthesizers" },
  
  // Rock
  { category: "Rock", name: "Rock", description: "Classic rock music" },
  { category: "Rock", name: "Hard Rock", description: "Heavy rock music" },
  { category: "Rock", name: "Alternative Rock", description: "Alternative rock music" },
  { category: "Rock", name: "Indie Rock", description: "Independent rock music" },
  { category: "Rock", name: "Progressive Rock", description: "Complex rock music" },
  { category: "Rock", name: "Punk Rock", description: "Fast, aggressive rock" },
  { category: "Rock", name: "Grunge", description: "Alternative rock subgenre" },
  
  // Electronic
  { category: "Electronic", name: "Electronic", description: "Electronic music" },
  { category: "Electronic", name: "House", description: "Electronic dance music" },
  { category: "Electronic", name: "Techno", description: "Electronic dance music" },
  { category: "Electronic", name: "Trance", description: "Electronic dance music" },
  { category: "Electronic", name: "Dubstep", description: "Electronic music with bass drops" },
  { category: "Electronic", name: "Ambient", description: "Atmospheric electronic music" },
  { category: "Electronic", name: "Drum & Bass", description: "Fast electronic music" },
  
  // Hip-Hop
  { category: "Hip-Hop", name: "Hip-Hop", description: "Hip-hop music" },
  { category: "Hip-Hop", name: "Rap", description: "Rap music" },
  { category: "Hip-Hop", name: "Trap", description: "Hip-hop subgenre" },
  { category: "Hip-Hop", name: "Gangsta Rap", description: "Hard rap music" },
  { category: "Hip-Hop", name: "Conscious Hip-Hop", description: "Socially aware rap" },
  { category: "Hip-Hop", name: "Alternative Hip-Hop", description: "Alternative rap music" },
  
  // Jazz
  { category: "Jazz", name: "Jazz", description: "Jazz music" },
  { category: "Jazz", name: "Smooth Jazz", description: "Mellow jazz music" },
  { category: "Jazz", name: "Bebop", description: "Fast jazz style" },
  { category: "Jazz", name: "Fusion", description: "Jazz fusion" },
  { category: "Jazz", name: "Swing", description: "Swing jazz" },
  { category: "Jazz", name: "Contemporary Jazz", description: "Modern jazz" },
  
  // Classical
  { category: "Classical", name: "Classical", description: "Classical music" },
  { category: "Classical", name: "Baroque", description: "Baroque period music" },
  { category: "Classical", name: "Romantic", description: "Romantic period music" },
  { category: "Classical", name: "Contemporary Classical", description: "Modern classical music" },
  { category: "Classical", name: "Opera", description: "Operatic music" },
  { category: "Classical", name: "Chamber Music", description: "Small ensemble music" },
  
  // World
  { category: "World", name: "World", description: "World music" },
  { category: "World", name: "Afrobeat", description: "African music style" },
  { category: "World", name: "Bossa Nova", description: "Brazilian music style" },
  { category: "World", name: "Flamenco", description: "Spanish music style" },
  { category: "World", name: "Celtic", description: "Celtic music" },
  { category: "World", name: "Indian Classical", description: "Indian classical music" },
  
  // Folk
  { category: "Folk", name: "Folk", description: "Folk music" },
  { category: "Folk", name: "Acoustic", description: "Acoustic music" },
  { category: "Folk", name: "Indie Folk", description: "Independent folk music" },
  { category: "Folk", name: "Contemporary Folk", description: "Modern folk music" },
  { category: "Folk", name: "Singer-Songwriter", description: "Singer-songwriter music" },
  
  // Country
  { category: "Country", name: "Country", description: "Country music" },
  { category: "Country", name: "Bluegrass", description: "Bluegrass music" },
  { category: "Country", name: "Country Rock", description: "Country with rock elements" },
  { category: "Country", name: "Alt-Country", description: "Alternative country music" },
  { category: "Country", name: "Americana", description: "American roots music" },
  
  // R&B/Soul
  { category: "R&B/Soul", name: "R&B", description: "Rhythm and blues" },
  { category: "R&B/Soul", name: "Soul", description: "Soul music" },
  { category: "R&B/Soul", name: "Neo-Soul", description: "Modern soul music" },
  { category: "R&B/Soul", name: "Funk", description: "Funk music" },
  { category: "R&B/Soul", name: "Contemporary R&B", description: "Modern R&B" },
  { category: "R&B/Soul", name: "Motown", description: "Motown sound" },
  
  // Reggae
  { category: "Reggae", name: "Reggae", description: "Reggae music" },
  { category: "Reggae", name: "Dancehall", description: "Dancehall music" },
  { category: "Reggae", name: "Dub", description: "Dub music" },
  { category: "Reggae", name: "Ska", description: "Ska music" },
  { category: "Reggae", name: "Roots Reggae", description: "Traditional reggae" },
  
  // Latin
  { category: "Latin", name: "Latin", description: "Latin music" },
  { category: "Latin", name: "Salsa", description: "Salsa music" },
  { category: "Latin", name: "Bachata", description: "Bachata music" },
  { category: "Latin", name: "Merengue", description: "Merengue music" },
  { category: "Latin", name: "Reggaeton", description: "Reggaeton music" },
  { category: "Latin", name: "Latin Pop", description: "Latin pop music" },
  
  // Alternative
  { category: "Alternative", name: "Alternative", description: "Alternative music" },
  { category: "Alternative", name: "Indie", description: "Independent music" },
  { category: "Alternative", name: "Shoegaze", description: "Shoegaze music" },
  { category: "Alternative", name: "Post-Rock", description: "Post-rock music" },
  { category: "Alternative", name: "Emo", description: "Emo music" },
  
  // Experimental
  { category: "Experimental", name: "Experimental", description: "Experimental music" },
  { category: "Experimental", name: "Avant-Garde", description: "Avant-garde music" },
  { category: "Experimental", name: "Noise", description: "Noise music" },
  { category: "Experimental", name: "Industrial", description: "Industrial music" },
  { category: "Experimental", name: "Dark Ambient", description: "Dark ambient music" },
];

export async function seedGlobalGenres() {
  try {
    console.log("Seeding global genres...");
    
    // Insert genres in batches to avoid database limits
    const batchSize = 10;
    for (let i = 0; i < genreData.length; i += batchSize) {
      const batch = genreData.slice(i, i + batchSize);
      await db.insert(globalGenres).values(batch).onConflictDoNothing();
    }
    
    console.log(`Seeded ${genreData.length} global genres successfully.`);
  } catch (error) {
    console.error("Error seeding global genres:", error);
  }
}