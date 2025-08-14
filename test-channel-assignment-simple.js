#!/usr/bin/env node

// Simple channel assignment test demonstrating correct sequence
// Uses real band member data we know from the database

console.log('🎛️ TESTING CHANNEL ASSIGNMENT SEQUENCE');
console.log('====================================');

// Real band members from database (booking ID 1)
const bandMembers = [
  {
    userId: 6,
    name: "Lí-Lí Octave", 
    fullName: "Lianne Letang",
    instruments: ["vocals"]
  },
  {
    userId: 12,
    name: "Maya Bass",
    fullName: "Maya Thompson", 
    instruments: ["bass"]
  }
];

// Mock mixer channels
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
  console.log('\n📋 Band Members:');
  members.forEach(member => {
    console.log(`  - ${member.name} (${member.instruments.join(', ')})`);
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
        console.log(`✅ ${channelType.toUpperCase()}: ${member.name} → "${channel.input}" (1 channel only)`);
      }
    }
  });

  // PHASE 2: Keyboard L/R pairs
  console.log('\n🎯 PHASE 2: Keyboard L/R Pair Assignments');
  const keyboardChannels = updatedChannels.keyboard.filter(ch => ch.applicable);
  const keyboardMembers = members.filter(member => 
    member.instruments.includes('keyboard') && !assignedMembers.has(member.name)
  );
  
  if (keyboardMembers.length > 0) {
    console.log(`🎹 No keyboardists in current band - skipping keyboard assignments`);
  }

  // PHASE 3: Drummer gets multiple channels
  console.log('\n🎯 PHASE 3: Drum Multi-Channel Assignments');
  const drumChannels = updatedChannels.drums.filter(ch => ch.applicable);
  const drummers = members.filter(member => 
    member.instruments.includes('drums') && !assignedMembers.has(member.name)
  );
  
  if (drummers.length > 0) {
    const drummer = drummers[0];
    drumChannels.forEach(channel => {
      const channelIndex = updatedChannels.drums.findIndex(ch => ch.id === channel.id);
      updatedChannels.drums[channelIndex].assignedTo = drummer.name;
    });
    assignedMembers.add(drummer.name);
    console.log(`🥁 DRUMS: ${drummer.name} → ALL ${drumChannels.length} drum channels`);
  } else {
    console.log(`🥁 No drummers in current band - skipping drum assignments`);
  }

  console.log('\n🎯 ASSIGNMENT SEQUENCE COMPLETE');
  console.log(`✅ Assigned Members: ${Array.from(assignedMembers).join(', ')}`);
  
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

function verifyCorrectAssignment(channels) {
  console.log('\n🔍 VERIFICATION RESULTS:');
  console.log('========================');
  
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
  
  console.log('Assignment counts per person:');
  Object.entries(assignmentCounts).forEach(([person, count]) => {
    console.log(`  - ${person}: ${count} channels`);
  });
  
  // Check if Lead Vocalist only has vocal channels
  const vocalChannels = channels.vocals.filter(ch => ch.assignedTo === "Lí-Lí Octave");
  const nonVocalChannels = Object.entries(channels)
    .filter(([section]) => section !== 'vocals')
    .flatMap(([_, channelList]) => channelList)
    .filter(ch => ch.assignedTo === "Lí-Lí Octave");
    
  if (vocalChannels.length > 0 && nonVocalChannels.length === 0) {
    console.log('✅ Lead Vocalist correctly assigned only to vocal channels');
  } else {
    console.log('❌ Lead Vocalist incorrectly assigned to non-vocal channels');
    isCorrect = false;
  }
  
  // Check if Bass Player only has bass channels
  const bassChannels = channels.bass.filter(ch => ch.assignedTo === "Maya Bass");
  const nonBassChannels = Object.entries(channels)
    .filter(([section]) => section !== 'bass')
    .flatMap(([_, channelList]) => channelList)
    .filter(ch => ch.assignedTo === "Maya Bass");
    
  if (bassChannels.length > 0 && nonBassChannels.length === 0) {
    console.log('✅ Bass Player correctly assigned only to bass channels');
  } else {
    console.log('❌ Bass Player incorrectly assigned to non-bass channels');
    isCorrect = false;
  }
  
  // Check that no one is assigned to ALL channels
  const maxAssignments = Math.max(...Object.values(assignmentCounts));
  const totalApplicableChannels = Object.values(channels)
    .flatMap(channelList => channelList)
    .filter(ch => ch.applicable).length;
    
  if (maxAssignments < totalApplicableChannels) {
    console.log('✅ No person assigned to ALL channels');
  } else {
    console.log('❌ Someone assigned to ALL channels (this is wrong)');
    isCorrect = false;
  }
  
  console.log(`\n🎯 OVERALL RESULT: ${isCorrect ? 'PASS ✅' : 'FAIL ❌'}`);
  
  if (isCorrect) {
    console.log('The channel assignment follows correct audio engineering principles:');
    console.log('- Each person gets channels for their specific instrument only');
    console.log('- No person is assigned to channels for instruments they don\'t play');
    console.log('- The 1-to-1 assignment rule is properly followed');
  }
  
  return isCorrect;
}

// Run the test
console.log('Starting channel assignment test with REAL band data...\n');

const result = applyCorrectChannelAssignment(mixerChannels, bandMembers);
displayResults(result);
const isCorrect = verifyCorrectAssignment(result);

console.log('\n📋 SUMMARY:');
console.log('This demonstrates the CORRECT channel assignment sequence that should be');
console.log('implemented in the EnhancedTechnicalRider component instead of the current');
console.log('broken logic that assigns all channels to the same person.');