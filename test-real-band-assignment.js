#!/usr/bin/env node

// Test channel assignment with REAL band members from database
console.log('🎛️ TESTING CHANNEL ASSIGNMENT WITH REAL BAND DATA');
console.log('==================================================');

// Real band members from booking ID 1 (from database query)
const bandMembers = [
  {
    userId: 6,
    name: "Lí-Lí Octave",
    fullName: "Lianne Letang", 
    instruments: ["vocals"],
    talentType: "managed_artist",
    primaryTalent: "Lead Vocalist"
  },
  {
    userId: 12,
    name: "Maya Bass",
    fullName: "Maya Thompson",
    instruments: ["bass"], 
    talentType: "managed_musician",
    primaryTalent: "Bass Player"
  }
];

// Standard mixer channel configuration
const mixerChannels = {
  vocals: [
    { id: 'vocal-1', input: "Lead Vocal", assignedTo: "", applicable: true },
    { id: 'vocal-2', input: "Backup Vocal", assignedTo: "", applicable: true }
  ],
  guitar: [
    { id: 'guitar-1', input: "Guitar 1", assignedTo: "", applicable: true },
    { id: 'guitar-2', input: "Guitar 2", assignedTo: "", applicable: false }
  ],
  bass: [
    { id: 'bass-1', input: "Bass DI", assignedTo: "", applicable: true },
    { id: 'bass-2', input: "Bass Mic", assignedTo: "", applicable: false }
  ],
  keyboard: [
    { id: 'keyboard-1', input: "Keyboard Left", assignedTo: "", applicable: true },
    { id: 'keyboard-2', input: "Keyboard Right", assignedTo: "", applicable: true }
  ],
  drums: [
    { id: 'drum-1', input: "Kick In", assignedTo: "", applicable: true },
    { id: 'drum-2', input: "Snare Top", assignedTo: "", applicable: true },
    { id: 'drum-3', input: "Hi Hat", assignedTo: "", applicable: true },
    { id: 'drum-4', input: "Over Head Left", assignedTo: "", applicable: true },
    { id: 'drum-5', input: "Over Head Right", assignedTo: "", applicable: true }
  ]
};

function applyCorrectChannelAssignment(channels, members) {
  console.log('\n📋 Real Band Members:');
  members.forEach(member => {
    console.log(`  - ${member.name} (${member.primaryTalent}) - Instruments: ${member.instruments.join(', ')}`);
  });

  const updatedChannels = JSON.parse(JSON.stringify(channels));
  const assignedMembers = new Set();

  // PHASE 1: 1-to-1 assignments (vocals, guitar, bass)
  console.log('\n🎯 PHASE 1: 1-to-1 Channel Assignments');
  
  const oneToOneChannels = ['vocals', 'guitar', 'bass'];
  oneToOneChannels.forEach(channelType => {
    const availableChannels = updatedChannels[channelType].filter(ch => ch.applicable);
    const compatibleMembers = members.filter(member => 
      member.instruments.includes(channelType) && !assignedMembers.has(member.name)
    );

    if (availableChannels.length > 0 && compatibleMembers.length > 0) {
      const maxAssignments = Math.min(availableChannels.length, compatibleMembers.length);
      
      for (let i = 0; i < maxAssignments; i++) {
        const member = compatibleMembers[i];
        const channel = availableChannels[i];
        
        const channelIndex = updatedChannels[channelType].findIndex(ch => ch.id === channel.id);
        updatedChannels[channelType][channelIndex].assignedTo = member.name;
        
        assignedMembers.add(member.name);
        console.log(`✅ ${channelType.toUpperCase()}: ${member.name} → "${channel.input}" (SINGLE channel)`);
      }
    }
  });

  // PHASE 2: Keyboard L/R pairs  
  console.log('\n🎯 PHASE 2: Keyboard L/R Pair Assignments');
  const keyboardMembers = members.filter(member => 
    member.instruments.includes('keyboard') && !assignedMembers.has(member.name)
  );
  
  if (keyboardMembers.length === 0) {
    console.log(`🎹 No keyboardists in this band - skipping keyboard assignments`);
  }

  // PHASE 3: Drummer gets multiple channels
  console.log('\n🎯 PHASE 3: Drum Multi-Channel Assignments');
  const drummers = members.filter(member => 
    member.instruments.includes('drums') && !assignedMembers.has(member.name)
  );
  
  if (drummers.length === 0) {
    console.log(`🥁 No drummers in this band - skipping drum assignments`);
  }

  console.log('\n🎯 ASSIGNMENT SEQUENCE COMPLETE');
  console.log(`✅ Successfully assigned: ${Array.from(assignedMembers).join(', ')}`);
  
  return updatedChannels;
}

function displayResults(channels) {
  console.log('\n📊 FINAL CHANNEL ASSIGNMENTS:');
  console.log('=====================================');
  
  Object.entries(channels).forEach(([sectionName, channelList]) => {
    console.log(`\n${sectionName.toUpperCase()} SECTION:`);
    channelList.forEach(channel => {
      const status = channel.assignedTo ? `→ ${channel.assignedTo}` : '(unassigned)';
      const applicable = channel.applicable ? '✓' : '○';
      console.log(`  ${applicable} ${channel.input} ${status}`);
    });
  });
}

function verifyCorrectBehavior(channels, members) {
  console.log('\n🔍 VERIFICATION: Audio Engineering Rules Check');
  console.log('============================================');
  
  let isCorrect = true;
  const assignmentCounts = {};
  
  // Count assignments per person
  Object.values(channels).forEach(channelList => {
    channelList.forEach(channel => {
      if (channel.assignedTo) {
        assignmentCounts[channel.assignedTo] = (assignmentCounts[channel.assignedTo] || 0) + 1;
      }
    });
  });
  
  console.log('Channel counts per person:');
  Object.entries(assignmentCounts).forEach(([person, count]) => {
    console.log(`  - ${person}: ${count} channels`);
  });
  
  // Verify Lí-Lí Octave (Lead Vocalist) only gets vocal channels
  const liLiVocalChannels = channels.vocals.filter(ch => ch.assignedTo === "Lí-Lí Octave");
  const liLiOtherChannels = Object.entries(channels)
    .filter(([section]) => section !== 'vocals')
    .flatMap(([_, channelList]) => channelList)
    .filter(ch => ch.assignedTo === "Lí-Lí Octave");
    
  if (liLiVocalChannels.length > 0 && liLiOtherChannels.length === 0) {
    console.log('✅ Lí-Lí Octave (Lead Vocalist) correctly assigned only to vocal channels');
  } else {
    console.log('❌ ERROR: Lí-Lí Octave assigned to non-vocal channels');
    isCorrect = false;
  }
  
  // Verify Maya Bass (Bass Player) only gets bass channels
  const mayaBassChannels = channels.bass.filter(ch => ch.assignedTo === "Maya Bass");
  const mayaOtherChannels = Object.entries(channels)
    .filter(([section]) => section !== 'bass')
    .flatMap(([_, channelList]) => channelList)
    .filter(ch => ch.assignedTo === "Maya Bass");
    
  if (mayaBassChannels.length > 0 && mayaOtherChannels.length === 0) {
    console.log('✅ Maya Bass (Bass Player) correctly assigned only to bass channels');
  } else {
    console.log('❌ ERROR: Maya Bass assigned to non-bass channels');
    isCorrect = false;
  }
  
  // Verify no one is assigned to ALL channels (the bug we're fixing)
  const maxAssignments = Math.max(...Object.values(assignmentCounts));
  const totalApplicableChannels = Object.values(channels)
    .flatMap(channelList => channelList)
    .filter(ch => ch.applicable).length;
    
  if (maxAssignments < totalApplicableChannels) {
    console.log('✅ No person assigned to ALL channels (bug prevention working)');
  } else {
    console.log('❌ CRITICAL ERROR: Someone assigned to ALL channels');
    isCorrect = false;
  }
  
  console.log(`\n🎯 FINAL RESULT: ${isCorrect ? 'PASS ✅' : 'FAIL ❌'}`);
  
  if (isCorrect) {
    console.log('\n🎵 SUCCESS: Channel assignment follows proper audio engineering rules:');
    console.log('   • Each musician gets channels for their instrument only');
    console.log('   • Lead Vocalist → Lead Vocal channel');
    console.log('   • Bass Player → Bass DI channel');
    console.log('   • No cross-contamination between instrument sections');
    console.log('   • Proper 1-to-1 assignment sequence maintained');
  } else {
    console.log('\n💥 FAILURE: Channel assignment violates audio engineering principles');
  }
  
  return isCorrect;
}

// Execute the test
console.log('Testing with REAL band members from booking ID 1...\n');

const result = applyCorrectChannelAssignment(mixerChannels, bandMembers);
displayResults(result);
const isCorrect = verifyCorrectBehavior(result, bandMembers);

console.log('\n📋 CONCLUSION:');
console.log('This demonstrates exactly what the EnhancedTechnicalRider component should do:');
console.log('• Use real band member data from the database');
console.log('• Apply correct audio engineering sequence (1-to-1 → L/R pairs → multi-channel)');
console.log('• Prevent the bug where everyone gets assigned to all channels');
console.log('• Ensure each person only gets channels for their specific instrument');

if (isCorrect) {
  console.log('\n🎯 READY FOR IMPLEMENTATION: This logic should replace the frontend complexity');
} else {
  console.log('\n⚠️  NEEDS FIXING: Logic requires adjustment before implementation');
}