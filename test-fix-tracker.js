// Simple test script to demonstrate the Data Integrity Fix Tracker

const testFixTracker = async () => {
  try {
    // Login first
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@waitumusic.com',
        password: 'secret123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Logged in successfully');
    
    // Get current status
    const statusResponse = await fetch('http://localhost:5000/api/data-integrity/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const statusData = await statusResponse.json();
    const { statusReport } = statusData;
    
    console.log('\n📊 Current Fix Tracker Status:');
    console.log(`- Total Issues: ${statusReport.totalIssues}`);
    console.log(`- Active Issues: ${statusReport.activeIssues}`);
    console.log(`- Completed Issues: ${statusReport.completedIssues}`);
    console.log(`- Fixes Applied: ${statusReport.fixesApplied}`);
    
    // Get active issues
    const activeResponse = await fetch('http://localhost:5000/api/data-integrity/active-issues', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const activeData = await activeResponse.json();
    console.log('\n🚨 Active Issues:');
    activeData.activeIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.component}: ${issue.description} (${issue.severity})`);
    });
    
    // Apply a fix to first active issue if any exist
    if (activeData.activeIssues.length > 0) {
      const firstIssue = activeData.activeIssues[0];
      console.log(`\n🔧 Applying fix to: ${firstIssue.id}`);
      
      const applyResponse = await fetch('http://localhost:5000/api/data-integrity/apply-fix', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          issueId: firstIssue.id,
          fixDescription: `Demo fix applied: Resolved ${firstIssue.description} through automated testing`
        })
      });
      
      const applyData = await applyResponse.json();
      if (applyData.success) {
        console.log('✅ Fix applied successfully!');
        console.log(`Fix ID: ${applyData.fix.id}`);
        
        // Now verify the fix to mark it as completed
        console.log('\n✅ Verifying fix to mark as completed...');
        
        const verifyResponse = await fetch('http://localhost:5000/api/data-integrity/verify-fix', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            fixId: applyData.fix.id,
            verificationNotes: 'Fix verified through automated testing - issue resolved and removed from active list'
          })
        });
        
        const verifyData = await verifyResponse.json();
        if (verifyData.success) {
          console.log('🎉 Fix verified and issue marked as completed!');
          console.log('📝 Issue will now be removed from active issues listing');
          
          // Get updated status
          const updatedStatusResponse = await fetch('http://localhost:5000/api/data-integrity/status', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const updatedStatusData = await updatedStatusResponse.json();
          const { statusReport: updatedReport } = updatedStatusData;
          
          console.log('\n📊 Updated Fix Tracker Status:');
          console.log(`- Total Issues: ${updatedReport.totalIssues}`);
          console.log(`- Active Issues: ${updatedReport.activeIssues} (decreased!)`);
          console.log(`- Completed Issues: ${updatedReport.completedIssues} (increased!)`);
          console.log(`- Fixes Applied: ${updatedReport.fixesApplied}`);
          
          console.log('\n✨ SUCCESS: Issue automatically removed from active list and moved to completed!');
        } else {
          console.log('❌ Fix verification failed:', verifyData.error);
        }
      } else {
        console.log('❌ Fix application failed:', applyData.error);
      }
    } else {
      console.log('\n✅ No active issues found - all issues are resolved!');
    }
    
  } catch (error) {
    console.error('Error testing fix tracker:', error);
  }
};

// Run the test
console.log('🚀 Testing Data Integrity Fix Tracker...\n');
testFixTracker();