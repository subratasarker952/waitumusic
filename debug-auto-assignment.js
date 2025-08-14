// Debug script to test auto-assignment logic
// Run this in browser console when on Technical Rider page

console.log('🔍 DEBUGGING AUTO-ASSIGNMENT LOGIC');

// Test the comprehensive workflow assignment data
async function debugAutoAssignment() {
  try {
    // Get the token from localStorage (if available)
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No authentication token found');
      return;
    }

    // Fetch the comprehensive workflow assignment data
    const response = await fetch('/api/bookings/1/assigned-talent', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.log('❌ Failed to fetch assigned talent:', response.status, response.statusText);
      return;
    }

    const assignedTalent = await response.json();
    console.log('📋 ASSIGNED TALENT FROM API:', assignedTalent);
    
    // Analyze each assigned talent member
    console.log('📊 TALENT ANALYSIS:');
    assignedTalent.forEach((talent, index) => {
      console.log(`${index + 1}. ${talent.name || talent.fullName || 'NO NAME'}`);
      console.log(`   - User ID: ${talent.userId || 'NO USER ID'}`);
      console.log(`   - Role: ${talent.role || 'NO ROLE'}`);
      console.log(`   - Primary Talent: ${talent.primaryTalent || 'NO PRIMARY TALENT'}`);
      console.log(`   - Secondary Talents: ${JSON.stringify(talent.secondaryTalents) || 'NONE'}`);
      console.log(`   - Type: ${talent.type || 'NO TYPE'}`);
      console.log(`   - Is Main: ${talent.isMainBookedTalent || false}`);
      console.log(`   - Full Object:`, talent);
      console.log('---');
    });

    // Test instrument extraction logic
    console.log('🎸 INSTRUMENT EXTRACTION TEST:');
    const musicians = assignedTalent
      .filter(talent => talent.userId && talent.name)
      .map((talent, index) => {
        const instruments = [];
        
        if (talent.primaryTalent) {
          instruments.push(talent.primaryTalent.toLowerCase());
        }
        
        if (talent.secondaryTalents && Array.isArray(talent.secondaryTalents)) {
          instruments.push(...talent.secondaryTalents.map(t => t.toLowerCase()));
        }
        
        // Role-based fallback
        if (instruments.length === 0 && talent.role) {
          const roleLower = talent.role.toLowerCase();
          if (roleLower.includes('vocalist') || roleLower.includes('singer')) {
            instruments.push('vocals');
          } else if (roleLower.includes('bass')) {
            instruments.push('bass');
          } else if (roleLower.includes('guitar')) {
            instruments.push('guitar');
          } else if (roleLower.includes('drum')) {
            instruments.push('drums');
          } else if (roleLower.includes('keyboard') || roleLower.includes('piano')) {
            instruments.push('keyboard');
          }
        }
        
        const musician = {
          name: talent.name || talent.fullName,
          instruments: [...new Set(instruments)],
          userId: talent.userId,
          priority: talent.isMainBookedTalent || talent.isPrimary ? 'high' : 'normal'
        };
        
        console.log(`${index + 1}. ${musician.name} → [${musician.instruments.join(', ')}]`);
        return musician;
      })
      .filter(musician => musician.instruments.length > 0);

    console.log(`🎯 FINAL MUSICIAN COUNT: ${musicians.length} with instruments`);
    
    if (musicians.length === 0) {
      console.log('❌ NO MUSICIANS WITH INSTRUMENTS FOUND!');
      console.log('This explains why only hardcoded Maya/Lí-Lí are being used');
    }

  } catch (error) {
    console.error('❌ DEBUG ERROR:', error);
  }
}

// Run the debug
debugAutoAssignment();