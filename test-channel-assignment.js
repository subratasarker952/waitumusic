#!/usr/bin/env node

// Simple channel assignment test using database approach
// This demonstrates the correct audio engineering sequence without frontend complexity

import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Mock mixer channels (typical 32-channel setup)
const defaultMixerChannels = {
  vocals: [
    { id: 'vocal-1', input: "Lead Vocal", assignedTo: "", applicable: true },
    { id: 'vocal-2', input: "Backup Vocal 1", assignedTo: "", applicable: true },
    { id: 'vocal-3', input: "Backup Vocal 2", assignedTo: "", applicable: false }
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
    { id: 'keyboard-2', input: "Keyboard Right", assignedTo: "", applicable: true },
    { id: 'keyboard-3', input: "Synth Left", assignedTo: "", applicable: false },
    { id: 'keyboard-4', input: "Synth Right", assignedTo: "", applicable: false }
  ],
  drums: [
    { id: 'drum-1', input: "Kick In", assignedTo: "", applicable: true },
    { id: 'drum-2', input: "Kick Out", assignedTo: "", applicable: true },
    { id: 'drum-3', input: "Snare Top", assignedTo: "", applicable: true },
    { id: 'drum-4', input: "Snare Bottom", assignedTo: "", applicable: false },
    { id: 'drum-5', input: "Hi Hat", assignedTo: "", applicable: true },
    { id: 'drum-6', input: "Rack Tom 1", assignedTo: "", applicable: true },
    { id: 'drum-7', input: "Rack Tom 2", assignedTo: "", applicable: true },
    { id: 'drum-8', input: "Floor Tom", assignedTo: "", applicable: false },
    { id: 'drum-9', input: "Over Head Left", assignedTo: "", applicable: true },
    { id: 'drum-10', input: "Over Head Right", assignedTo: "", applicable: true }
  ]
};

async function getAssignedTalent(bookingId) {
  const query = `
    SELECT 
        ba.assigned_user_id,
        u.full_name,
        a.stage_name as artist_stage_name,
        m.stage_name as musician_stage_name,
        m.primary_genre
    FROM booking_assignments ba
    JOIN users u ON ba.assigned_user_id = u.id
    LEFT JOIN artists a ON u.id = a.user_id
    LEFT JOIN musicians m ON u.id = m.user_id
    WHERE ba.booking_id = $1
  `;
  
  const result = await pool.query(query, [bookingId]);
  return result.rows.map(row => ({
    userId: row.assigned_user_id,
    name: row.artist_stage_name || row.musician_stage_name || row.full_name,
    fullName: row.full_name,
    stageName: row.artist_stage_name || row.musician_stage_name,
    instruments: determineInstruments(row)
  }));
}

function determineInstruments(row) {
  const instruments = [];
  
  // If it's an artist (has artist_stage_name), assume vocals
  if (row.artist_stage_name) {
    instruments.push('vocals');
  }
  
  // If it's a musician, determine by stage name or genre
  if (row.musician_stage_name) {
    const nameLower = row.musician_stage_name.toLowerCase();
    if (nameLower.includes('bass')) {
      instruments.push('bass');
    } else if (nameLower.includes('guitar')) {
      instruments.push('guitar');
    } else if (nameLower.includes('drum')) {
      instruments.push('drums');
    } else if (nameLower.includes('key') || nameLower.includes('piano')) {
      instruments.push('keyboard');
    }
  }
  
  // If no instruments determined, default based on context
  if (instruments.length === 0) {
    if (row.primary_genre) {
      instruments.push('vocals'); // Default fallback
    }
  }
  
  return instruments;
}

function applyChannelAssignmentSequence(mixerChannels, bandMembers) {
  console.log('\n🎛️ STARTING AUDIO ENGINEERING CHANNEL ASSIGNMENT SEQUENCE');
  console.log(`📋 Band Members: ${bandMembers.map(m => `${m.name} (${m.instruments.join(', ')})`).join(', ')}`);
  
  const updatedChannels = JSON.parse(JSON.stringify(mixerChannels));
  const assignedMembers = new Set();
  
  // PHASE 1: 1-to-1 assignments (vocals, guitar, bass)
  console.log('\n🎯 PHASE 1: 1-to-1 Channel Assignments');
  
  const oneToOneChannels = ['vocals', 'guitar', 'bass'];
  oneToOneChannels.forEach(channelType => {
    if (!updatedChannels[channelType]) return;
    
    const availableChannels = updatedChannels[channelType].filter(ch => ch.applicable && !ch.assignedTo);
    const compatibleMembers = bandMembers.filter(member => 
      member.instruments.includes(channelType) && !assignedMembers.has(member.name)
    );
    
    if (availableChannels.length > 0 && compatibleMembers.length > 0) {
      // STRICT 1-to-1: Only assign one channel per person
      const maxAssignments = Math.min(availableChannels.length, compatibleMembers.length);
      
      for (let i = 0; i < maxAssignments; i++) {
        const member = compatibleMembers[i];
        const channel = availableChannels[i];
        
        // Find channel in original array and update
        const channelIndex = updatedChannels[channelType].findIndex(ch => ch.id === channel.id);
        updatedChannels[channelType][channelIndex].assignedTo = member.name;
        
        assignedMembers.add(member.name);
        console.log(`✅ ${channelType.toUpperCase()}: ${member.name} → "${channel.input}"`);
      }
    }
  });
  
  // PHASE 2: Keyboard L/R pairs
  console.log('\n🎯 PHASE 2: Keyboard L/R Pair Assignments');
  
  if (updatedChannels.keyboard) {
    const availableChannels = updatedChannels.keyboard.filter(ch => ch.applicable && !ch.assignedTo);
    const compatibleMembers = bandMembers.filter(member => 
      member.instruments.includes('keyboard') && !assignedMembers.has(member.name)
    );
    
    // Group into L/R pairs
    const leftChannels = availableChannels.filter(ch => 
      ch.input.toLowerCase().includes('left') || ch.input.toLowerCase().includes('l')
    );
    const rightChannels = availableChannels.filter(ch => 
      ch.input.toLowerCase().includes('right') || ch.input.toLowerCase().includes('r')
    );
    
    const maxPairs = Math.min(leftChannels.length, rightChannels.length, compatibleMembers.length);
    
    for (let i = 0; i < maxPairs; i++) {
      const member = compatibleMembers[i];
      const leftChannel = leftChannels[i];
      const rightChannel = rightChannels[i];
      
      // Assign both channels to same person
      const leftIndex = updatedChannels.keyboard.findIndex(ch => ch.id === leftChannel.id);
      const rightIndex = updatedChannels.keyboard.findIndex(ch => ch.id === rightChannel.id);
      
      updatedChannels.keyboard[leftIndex].assignedTo = member.name;
      updatedChannels.keyboard[rightIndex].assignedTo = member.name;
      
      assignedMembers.add(member.name);
      console.log(`🎹 KEYBOARD PAIR: ${member.name} → "${leftChannel.input}" + "${rightChannel.input}"`);
    }
  }
  
  // PHASE 3: Drummer gets multiple channels
  console.log('\n🎯 PHASE 3: Drum Multi-Channel Assignments');
  
  if (updatedChannels.drums) {
    const availableChannels = updatedChannels.drums.filter(ch => ch.applicable && !ch.assignedTo);
    const compatibleMembers = bandMembers.filter(member => 
      member.instruments.includes('drums') && !assignedMembers.has(member.name)
    );
    
    if (availableChannels.length > 0 && compatibleMembers.length > 0) {
      const drummer = compatibleMembers[0]; // Take first drummer
      
      // Assign ALL drum channels to one drummer
      availableChannels.forEach(channel => {
        const channelIndex = updatedChannels.drums.findIndex(ch => ch.id === channel.id);
        updatedChannels.drums[channelIndex].assignedTo = drummer.name;
      });
      
      assignedMembers.add(drummer.name);
      console.log(`🥁 DRUMS: ${drummer.name} → ALL ${availableChannels.length} drum channels`);
      availableChannels.forEach(ch => console.log(`   - "${ch.input}"`));
    }
  }
  
  console.log('\n🎯 ASSIGNMENT SEQUENCE COMPLETE');
  console.log(`✅ Assigned Members: ${Array.from(assignedMembers).join(', ')}`);
  
  return updatedChannels;
}

function displayChannelAssignments(mixerChannels) {
  console.log('\n📊 FINAL CHANNEL ASSIGNMENTS:');
  console.log('=====================================');
  
  Object.entries(mixerChannels).forEach(([sectionName, channels]) => {
    console.log(`\n${sectionName.toUpperCase()} SECTION:`);
    channels.forEach(channel => {
      const status = channel.assignedTo ? `→ ${channel.assignedTo}` : '(unassigned)';
      const applicable = channel.applicable ? '✓' : '○';
      console.log(`  ${applicable} Channel ${channel.id}: ${channel.input} ${status}`);
    });
  });
}

async function testChannelAssignment() {
  try {
    console.log('🎛️ TESTING CHANNEL ASSIGNMENT WITH DATABASE DATA');
    console.log('================================================');
    
    // Get real assigned talent from database
    const bandMembers = await getAssignedTalent(1);
    console.log('\n📋 Retrieved from database:');
    bandMembers.forEach(member => {
      console.log(`  - ${member.name} (${member.fullName}) - Instruments: ${member.instruments.join(', ')}`);
    });
    
    // Apply channel assignment sequence
    const assignedChannels = applyChannelAssignmentSequence(defaultMixerChannels, bandMembers);
    
    // Display final results
    displayChannelAssignments(assignedChannels);
    
    console.log('\n🎯 TEST RESULT: Each band member should have unique channel assignments');
    console.log('- Lead Vocalist should get vocal channels only');
    console.log('- Bass Player should get bass channels only');
    console.log('- NO member should be assigned to ALL channels');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the test
testChannelAssignment();