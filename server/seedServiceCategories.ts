import { db } from './db';
import { serviceCategories } from '@shared/schema';

// Seed default service categories for Wai'tuMusic platform
export async function seedServiceCategories() {
  console.log('Seeding service categories...');
  
  const defaultCategories = [
    {
      name: 'Music Production',
      description: 'Recording, mixing, mastering, and audio production services',
      icon: 'music',
      color: '#8B5CF6'
    },
    {
      name: 'Visual Content',
      description: 'Photography, videography, album artwork, and visual design',
      icon: 'camera',
      color: '#EC4899'
    },
    {
      name: 'Marketing & Promotion',
      description: 'Social media management, PR, and promotional campaigns',
      icon: 'megaphone',
      color: '#10B981'
    },
    {
      name: 'Live Performance',
      description: 'Booking, event management, and live show production',
      icon: 'mic',
      color: '#F59E0B'
    },
    {
      name: 'Business Services',
      description: 'Legal, financial, and administrative support for artists',
      icon: 'briefcase',
      color: '#3B82F6'
    },
    {
      name: 'Technical Services',
      description: 'Audio engineering, equipment rental, and technical support',
      icon: 'settings',
      color: '#6B7280'
    },
    {
      name: 'Education & Coaching',
      description: 'Music lessons, career coaching, and professional development',
      icon: 'book',
      color: '#EF4444'
    },
    {
      name: 'Digital Distribution',
      description: 'Streaming platform distribution and digital marketing',
      icon: 'globe',
      color: '#06B6D4'
    }
  ];

  try {
    // Check if categories already exist
    const existingCategories = await db.select().from(serviceCategories);
    
    if (existingCategories.length === 0) {
      await db.insert(serviceCategories).values(defaultCategories);
      console.log('✅ Successfully seeded service categories');
    } else {
      console.log('ℹ️ Service categories already exist, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding service categories:', error);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedServiceCategories().then(() => {
    console.log('Service categories seeding completed');
    process.exit(0);
  });
}