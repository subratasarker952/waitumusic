/**
 * Data Integrity Fix Tracker API Routes
 */

import { Router } from 'express';
import { getDataIntegrityFixTracker } from '../dataIntegrityFixTracker';
import { storage } from '../storage';
// Note: requireAuth middleware will be implemented inline

const router = Router();

// Get fix tracker status report
router.get('/status', (req, res) => {
  try {
    const fixTracker = getDataIntegrityFixTracker(storage);
    const statusReport = fixTracker.getStatusReport();
    res.json({ success: true, statusReport });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Apply a fix
router.post('/apply-fix', (req, res) => {
  try {
    const { issueId, fixDescription } = req.body;
    const appliedBy = 'System User';
    
    const fixTracker = getDataIntegrityFixTracker(storage);
    const fix = fixTracker.applyFix(issueId, fixDescription, appliedBy);
    
    res.json({ success: true, fix });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Verify a fix
router.post('/verify-fix', (req, res) => {
  try {
    const { fixId, verificationNotes } = req.body;
    
    const fixTracker = getDataIntegrityFixTracker(storage);
    fixTracker.verifyFix(fixId, verificationNotes);
    
    res.json({ success: true, message: 'Fix verified and issue marked as completed' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Mark fix as failed
router.post('/mark-failed', (req, res) => {
  try {
    const { fixId, reason } = req.body;
    
    const fixTracker = getDataIntegrityFixTracker(storage);
    fixTracker.markFixFailed(fixId, reason);
    
    res.json({ success: true, message: 'Fix marked as failed and issue reverted to active' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Add new issue
router.post('/add-issue', (req, res) => {
  try {
    const { component, description, severity, category } = req.body;
    
    const fixTracker = getDataIntegrityFixTracker(storage);
    const issueId = fixTracker.addIssue(component, description, severity, category);
    
    res.json({ success: true, issueId });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get fix history
router.get('/fix-history', (req, res) => {
  try {
    const fixTracker = getDataIntegrityFixTracker(storage);
    const fixHistory = fixTracker.getFixHistory();
    
    res.json({ success: true, fixHistory });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get active issues
router.get('/active-issues', (req, res) => {
  try {
    const fixTracker = getDataIntegrityFixTracker(storage);
    const activeIssues = fixTracker.getActiveIssues();
    
    res.json({ success: true, activeIssues });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get completed issues
router.get('/completed-issues', (req, res) => {
  try {
    const fixTracker = getDataIntegrityFixTracker(storage);
    const completedIssues = fixTracker.getCompletedIssues();
    
    res.json({ success: true, completedIssues });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;