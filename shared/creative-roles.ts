// Creative role display names for enhanced user experience
// Keep system role names in database for authorization, use these for display

export const CREATIVE_ROLE_NAMES: Record<string, string> = {
  'superadmin': 'Platform Maestro',
  'admin': 'Music Director',
  'managed_artist': 'Star Talent',
  'artist': 'Rising Artist', 
  'managed_musician': 'Studio Pro',
  'musician': 'Session Player',
  'managed_professional': 'Industry Expert',
  'professional': 'Music Professional',
  'fan': 'Music Lover'
};

export const getCreativeRoleName = (systemRoleName: string): string => {
  return CREATIVE_ROLE_NAMES[systemRoleName] || systemRoleName;
};

export const getSystemRoleName = (creativeRoleName: string): string => {
  const entry = Object.entries(CREATIVE_ROLE_NAMES).find(([_, creative]) => creative === creativeRoleName);
  return entry ? entry[0] : creativeRoleName;
};