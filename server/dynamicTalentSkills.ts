/**
 * Dynamic Talent/Skill Options for Technical Rider
 * Provides contextual, role-based skill suggestions
 */

export interface TalentSkill {
  id: string;
  name: string;
  category: 'instrument' | 'vocal' | 'technical' | 'performance';
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  requirements?: string[];
  equipment?: string[];
}

export const DYNAMIC_TALENT_SKILLS: Record<string, TalentSkill[]> = {
  // Lead Vocalist Skills
  'lead_vocalist': [
    {
      id: 'lead_vocal_range',
      name: 'Vocal Range (specify octaves)',
      category: 'vocal',
      level: 'professional',
      requirements: ['4+ octave range', 'Professional vocal training'],
      equipment: ['Wireless microphone', 'In-ear monitors', 'Vocal processor']
    },
    {
      id: 'lead_harmonies',
      name: 'Complex Harmonies',
      category: 'vocal',
      level: 'advanced',
      requirements: ['Music theory knowledge', 'Perfect pitch preferred']
    },
    {
      id: 'stage_presence',
      name: 'Stage Presence & Crowd Interaction',
      category: 'performance',
      level: 'professional',
      requirements: ['5+ years live performance', 'Crowd engagement skills']
    }
  ],

  // Guitarist Skills  
  'guitarist': [
    {
      id: 'lead_guitar',
      name: 'Lead Guitar & Solos',
      category: 'instrument',
      level: 'advanced',
      equipment: ['Electric guitar', 'Amplifier', 'Effects pedals', 'Guitar cables']
    },
    {
      id: 'rhythm_guitar',
      name: 'Rhythm Guitar & Chord Progressions',
      category: 'instrument',
      level: 'intermediate',
      equipment: ['Acoustic/Electric guitar', 'Capo', 'Pick assortment']
    },
    {
      id: 'fingerstyle',
      name: 'Fingerstyle Technique',
      category: 'instrument',
      level: 'advanced',
      requirements: ['Classical training preferred', '10+ years experience']
    }
  ],

  // Bassist Skills
  'bassist': [
    {
      id: 'electric_bass',
      name: 'Electric Bass Performance',
      category: 'instrument',
      level: 'professional',
      equipment: ['Electric bass', 'Bass amplifier', 'DI box', 'Bass cables']
    },
    {
      id: 'upright_bass',
      name: 'Upright/Double Bass',
      category: 'instrument',
      level: 'advanced',
      equipment: ['Upright bass', 'Bass pickup system', 'Bow']
    },
    {
      id: 'slap_bass',
      name: 'Slap Bass Technique',
      category: 'instrument',
      level: 'advanced',
      requirements: ['Funk/R&B experience', 'Advanced finger dexterity']
    }
  ],

  // Drummer Skills
  'drummer': [
    {
      id: 'acoustic_drums',
      name: 'Acoustic Drum Kit',
      category: 'instrument',
      level: 'professional',
      equipment: ['Full drum kit', 'Cymbals', 'Drum sticks', 'Drum throne']
    },
    {
      id: 'electronic_drums',
      name: 'Electronic Drums & Triggers',
      category: 'technical',
      level: 'advanced',
      equipment: ['Electronic drum kit', 'Drum module', 'Triggers', 'Headphones']
    },
    {
      id: 'polyrhythms',
      name: 'Complex Polyrhythms',
      category: 'instrument',
      level: 'advanced',
      requirements: ['Jazz training preferred', 'Advanced coordination']
    }
  ],

  // Keyboardist Skills
  'keyboardist': [
    {
      id: 'piano_classical',
      name: 'Classical Piano',
      category: 'instrument',
      level: 'professional',
      requirements: ['Conservatory training', 'Sheet music reading'],
      equipment: ['Grand/Digital piano', 'Piano bench', 'Music stand']
    },
    {
      id: 'synthesizer',
      name: 'Synthesizer Programming',
      category: 'technical',
      level: 'advanced',
      equipment: ['Synthesizer', 'MIDI controller', 'Audio interface']
    },
    {
      id: 'organ',
      name: 'Hammond/Church Organ',
      category: 'instrument',
      level: 'intermediate',
      equipment: ['Hammond organ', 'Leslie speaker', 'Expression pedal']
    }
  ],

  // Backup Vocalist Skills
  'backup_vocalist': [
    {
      id: 'harmony_vocals',
      name: 'Harmony & Background Vocals',
      category: 'vocal',
      level: 'intermediate',
      requirements: ['Pitch accuracy', 'Blend ability'],
      equipment: ['Microphone', 'Music stand', 'In-ear monitors']
    },
    {
      id: 'call_response',
      name: 'Call & Response Vocals',
      category: 'vocal',
      level: 'intermediate',
      requirements: ['Gospel/R&B experience preferred']
    }
  ],

  // Sound Engineer Skills
  'sound_engineer': [
    {
      id: 'live_mixing',
      name: 'Live Sound Mixing',
      category: 'technical',
      level: 'professional',
      requirements: ['Audio engineering degree/certificate', '3+ years experience'],
      equipment: ['Digital mixing console', 'Audio processors', 'Microphones']
    },
    {
      id: 'monitor_mixing',
      name: 'Monitor Mix Engineering',
      category: 'technical',
      level: 'advanced',
      requirements: ['Live sound experience', 'Artist communication skills']
    }
  ]
};

export function getTalentSkillsByRole(roleId: number): TalentSkill[] {
  const roleSkillMap: Record<number, string> = {
    3: 'lead_vocalist', // Managed Artist
    4: 'lead_vocalist', // Artist  
    5: 'guitarist',     // Managed Musician
    6: 'bassist',       // Musician
    7: 'sound_engineer', // Managed Professional
    8: 'sound_engineer'  // Professional
  };

  const skillCategory = roleSkillMap[roleId];
  if (!skillCategory) return [];

  return DYNAMIC_TALENT_SKILLS[skillCategory] || [];
}

export function getSkillsByInstrument(instrument: string): TalentSkill[] {
  const instrumentMap: Record<string, string> = {
    'guitar': 'guitarist',
    'bass': 'bassist', 
    'drums': 'drummer',
    'piano': 'keyboardist',
    'keyboard': 'keyboardist',
    'vocals': 'lead_vocalist',
    'singing': 'lead_vocalist'
  };

  const skillCategory = instrumentMap[instrument.toLowerCase()];
  return DYNAMIC_TALENT_SKILLS[skillCategory] || [];
}

export function getAllSkillCategories(): string[] {
  return Object.keys(DYNAMIC_TALENT_SKILLS);
}