/**
 * OppHub Data Integrity & Proactive Dummy Data Detection System
 * Comprehensive system for detecting, preventing, and fixing data inconsistencies
 * with intelligent suggestions for superadmin approval
 */

import { DatabaseStorage } from './storage';

interface DataInconsistency {
  id: string;
  type: 'role_mismatch' | 'dummy_data' | 'null_data' | 'duplicate_data' | 'incomplete_profile';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedTable: string;
  affectedRecordId: number;
  currentValue: any;
  suggestedFix: any;
  confidence: number; // 0-100
  researchEvidence: string[];
  autoFixable: boolean;
  created_at: Date;
}

interface DataIntegrityReport {
  scan_id: string;
  scan_date: Date;
  total_records_scanned: number;
  inconsistencies_found: number;
  critical_issues: number;
  auto_fixable_issues: number;
  issues: DataInconsistency[];
  recommendations: string[];
}

export class OppHubDataIntegritySystem {
  private storage: DatabaseStorage;
  private scanHistory: Map<string, DataIntegrityReport> = new Map();

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  /**
   * Comprehensive data integrity scan across all platform data
   */
  async performComprehensiveScan(): Promise<DataIntegrityReport> {
    const scanId = `scan_${Date.now()}`;
    const scanDate = new Date();
    const inconsistencies: DataInconsistency[] = [];

    console.log(`🔍 Starting comprehensive data integrity scan: ${scanId}`);

    try {
      // Scan users for role inconsistencies
      const users = await this.storage.getAllUsers();
      const roles = await this.storage.getRoles();
      
      for (const user of users) {
        const userRole = roles.find(r => r.id === user.roleId);
        
        // Check for role-profile consistency
        const roleInconsistencies = await this.checkUserRoleConsistency(user, userRole);
        inconsistencies.push(...roleInconsistencies);
        
        // Check for dummy/placeholder data
        const dummyDataIssues = await this.detectDummyData(user);
        inconsistencies.push(...dummyDataIssues);
        
        // Check profile completeness
        const profileIssues = await this.checkProfileCompleteness(user, userRole);
        inconsistencies.push(...profileIssues);
      }

      // Scan for duplicate data across platform
      const duplicateIssues = await this.detectDuplicateData();
      inconsistencies.push(...duplicateIssues);

      // Generate comprehensive report
      const report: DataIntegrityReport = {
        scan_id: scanId,
        scan_date: scanDate,
        total_records_scanned: users.length,
        inconsistencies_found: inconsistencies.length,
        critical_issues: inconsistencies.filter(i => i.severity === 'critical').length,
        auto_fixable_issues: inconsistencies.filter(i => i.autoFixable).length,
        issues: inconsistencies,
        recommendations: this.generateRecommendations(inconsistencies)
      };

      this.scanHistory.set(scanId, report);
      
      console.log(`✅ Data integrity scan complete: ${inconsistencies.length} issues found`);
      return report;

    } catch (error) {
      console.error('Data integrity scan failed:', error);
      throw new Error(`Comprehensive scan failed: ${error}`);
    }
  }

  /**
   * Check for user role consistency across profile tables
   */
  private async checkUserRoleConsistency(user: any, userRole: any): Promise<DataInconsistency[]> {
    const issues: DataInconsistency[] = [];
    
    if (!userRole) {
      issues.push({
        id: `role_missing_${user.id}`,
        type: 'role_mismatch',
        severity: 'critical',
        description: `User ${user.fullName} has invalid roleId ${user.roleId}`,
        affectedTable: 'users',
        affectedRecordId: user.id,
        currentValue: user.roleId,
        suggestedFix: { roleId: 6 }, // Default to fan role
        confidence: 95,
        researchEvidence: ['Role ID does not exist in roles table'],
        autoFixable: true,
        created_at: new Date()
      });
      return issues;
    }

    // Check for role-specific profile consistency
    if (userRole.name.includes('artist') || userRole.name.includes('managed_artist')) {
      try {
        const artist = await this.storage.getArtist(user.id);
        if (!artist && userRole.name.includes('artist')) {
          issues.push({
            id: `missing_artist_profile_${user.id}`,
            type: 'incomplete_profile',
            severity: 'high',
            description: `User ${user.fullName} has artist role but no artist profile`,
            affectedTable: 'artists',
            affectedRecordId: user.id,
            currentValue: null,
            suggestedFix: {
              create_artist_profile: {
                userId: user.id,
                stageNames: [user.fullName],
                genre: 'General',
                isManaged: userRole.name.includes('managed_')
              }
            },
            confidence: 90,
            researchEvidence: ['Artist role requires artist profile for proper functionality'],
            autoFixable: true,
            created_at: new Date()
          });
        }
      } catch (error) {
        console.error(`Error checking artist profile for user ${user.id}:`, error);
      }
    }

    if (userRole.name.includes('musician') || userRole.name.includes('managed_musician')) {
      try {
        const musician = await this.storage.getMusician(user.id);
        if (!musician && userRole.name.includes('musician')) {
          issues.push({
            id: `missing_musician_profile_${user.id}`,
            type: 'incomplete_profile',
            severity: 'high',
            description: `User ${user.fullName} has musician role but no musician profile`,
            affectedTable: 'musicians',
            affectedRecordId: user.id,
            currentValue: null,
            suggestedFix: {
              create_musician_profile: {
                userId: user.id,
                instruments: ['General'],
                genres: ['General'],
                isManaged: userRole.name.includes('managed_')
              }
            },
            confidence: 90,
            researchEvidence: ['Musician role requires musician profile for proper functionality'],
            autoFixable: true,
            created_at: new Date()
          });
        }
      } catch (error) {
        console.error(`Error checking musician profile for user ${user.id}:`, error);
      }
    }

    if (userRole.name.includes('professional') || userRole.name.includes('managed_professional')) {
      try {
        const professional = await this.storage.getProfessional(user.id);
        if (!professional && userRole.name.includes('professional')) {
          issues.push({
            id: `missing_professional_profile_${user.id}`,
            type: 'incomplete_profile',
            severity: 'high',
            description: `User ${user.fullName} has professional role but no professional profile`,
            affectedTable: 'professionals',
            affectedRecordId: user.id,
            currentValue: null,
            suggestedFix: {
              create_professional_profile: {
                userId: user.id,
                specializations: ['General Services'],
                hourlyRate: 50,
                isManaged: userRole.name.includes('managed_')
              }
            },
            confidence: 90,
            researchEvidence: ['Professional role requires professional profile for proper functionality'],
            autoFixable: true,
            created_at: new Date()
          });
        }
      } catch (error) {
        console.error(`Error checking professional profile for user ${user.id}:`, error);
      }
    }

    return issues;
  }

  /**
   * Detect dummy, placeholder, or test data
   */
  private async detectDummyData(user: any): Promise<DataInconsistency[]> {
    const issues: DataInconsistency[] = [];
    
    const dummyPatterns = [
      /test\d*/i,
      /dummy/i,
      /placeholder/i,
      /example/i,
      /sample/i,
      /mock/i,
      /fake/i,
      /lorem\s*ipsum/i,
      /john\s*doe/i,
      /jane\s*doe/i,
      /temp/i,
      /default/i
    ];

    // Check user name for dummy patterns
    if (dummyPatterns.some(pattern => pattern.test(user.fullName))) {
      issues.push({
        id: `dummy_name_${user.id}`,
        type: 'dummy_data',
        severity: 'high',
        description: `User name "${user.fullName}" appears to be dummy/test data`,
        affectedTable: 'users',
        affectedRecordId: user.id,
        currentValue: user.fullName,
        suggestedFix: { 
          action: 'manual_review',
          suggestion: 'Review user account - may need deletion or proper name update'
        },
        confidence: 85,
        researchEvidence: ['Name matches common dummy data patterns'],
        autoFixable: false,
        created_at: new Date()
      });
    }

    // Check email for dummy patterns
    if (dummyPatterns.some(pattern => pattern.test(user.email))) {
      issues.push({
        id: `dummy_email_${user.id}`,
        type: 'dummy_data',
        severity: 'high',
        description: `User email "${user.email}" appears to be dummy/test data`,
        affectedTable: 'users',
        affectedRecordId: user.id,
        currentValue: user.email,
        suggestedFix: { 
          action: 'manual_review',
          suggestion: 'Review user account - may need deletion or proper email update'
        },
        confidence: 85,
        researchEvidence: ['Email matches common dummy data patterns'],
        autoFixable: false,
        created_at: new Date()
      });
    }

    return issues;
  }

  /**
   * Check profile completeness based on role requirements
   */
  private async checkProfileCompleteness(user: any, userRole: any): Promise<DataInconsistency[]> {
    const issues: DataInconsistency[] = [];

    // Check for null/empty critical fields
    if (!user.fullName || user.fullName.trim() === '') {
      issues.push({
        id: `empty_name_${user.id}`,
        type: 'null_data',
        severity: 'critical',
        description: `User ID ${user.id} has empty or null name`,
        affectedTable: 'users',
        affectedRecordId: user.id,
        currentValue: user.fullName,
        suggestedFix: { fullName: 'New User' },
        confidence: 100,
        researchEvidence: ['Full name is required for all users'],
        autoFixable: true,
        created_at: new Date()
      });
    }

    if (!user.email || user.email.trim() === '') {
      issues.push({
        id: `empty_email_${user.id}`,
        type: 'null_data',
        severity: 'critical',
        description: `User ID ${user.id} has empty or null email`,
        affectedTable: 'users',
        affectedRecordId: user.id,
        currentValue: user.email,
        suggestedFix: { action: 'manual_review', suggestion: 'Email required - may need account deletion' },
        confidence: 100,
        researchEvidence: ['Email is required for authentication'],
        autoFixable: false,
        created_at: new Date()
      });
    }

    return issues;
  }

  /**
   * Detect duplicate data across platform
   */
  private async detectDuplicateData(): Promise<DataInconsistency[]> {
    const issues: DataInconsistency[] = [];
    
    try {
      const users = await this.storage.getAllUsers();
      const emailMap = new Map<string, any[]>();
      
      // Group users by email to find duplicates
      users.forEach(user => {
        if (user.email) {
          const normalizedEmail = user.email.toLowerCase().trim();
          if (!emailMap.has(normalizedEmail)) {
            emailMap.set(normalizedEmail, []);
          }
          emailMap.get(normalizedEmail)!.push(user);
        }
      });

      // Find duplicate emails
      emailMap.forEach((usersWithEmail, email) => {
        if (usersWithEmail.length > 1) {
          issues.push({
            id: `duplicate_email_${email}`,
            type: 'duplicate_data',
            severity: 'high',
            description: `Email "${email}" is used by ${usersWithEmail.length} users`,
            affectedTable: 'users',
            affectedRecordId: usersWithEmail[0].id,
            currentValue: usersWithEmail.map(u => ({ id: u.id, name: u.fullName })),
            suggestedFix: {
              action: 'manual_review',
              suggestion: 'Review duplicate accounts - may need merge or deletion',
              users: usersWithEmail
            },
            confidence: 100,
            researchEvidence: ['Email addresses must be unique'],
            autoFixable: false,
            created_at: new Date()
          });
        }
      });

    } catch (error) {
      console.error('Error detecting duplicate data:', error);
    }

    return issues;
  }

  /**
   * Generate actionable recommendations based on found issues
   */
  private generateRecommendations(issues: DataInconsistency[]): string[] {
    const recommendations: string[] = [];
    
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const autoFixableCount = issues.filter(i => i.autoFixable).length;
    
    if (criticalCount > 0) {
      recommendations.push(`🚨 ${criticalCount} critical issues require immediate attention`);
    }
    
    if (autoFixableCount > 0) {
      recommendations.push(`🔧 ${autoFixableCount} issues can be automatically fixed with your approval`);
    }
    
    const roleIssues = issues.filter(i => i.type === 'role_mismatch').length;
    if (roleIssues > 0) {
      recommendations.push(`👤 ${roleIssues} users have role/profile inconsistencies`);
    }
    
    const dummyDataIssues = issues.filter(i => i.type === 'dummy_data').length;
    if (dummyDataIssues > 0) {
      recommendations.push(`🎭 ${dummyDataIssues} potential dummy/test accounts found`);
    }
    
    const duplicateIssues = issues.filter(i => i.type === 'duplicate_data').length;
    if (duplicateIssues > 0) {
      recommendations.push(`📋 ${duplicateIssues} duplicate data entries need review`);
    }

    recommendations.push('📊 Run regular scans to maintain data integrity');
    recommendations.push('🔍 Review and approve suggested fixes to improve platform quality');
    
    return recommendations;
  }

  /**
   * Apply approved fixes to data inconsistencies
   */
  async applyApprovedFixes(scanId: string, approvedIssueIds: string[]): Promise<{
    applied: string[];
    failed: string[];
    results: any[];
  }> {
    const report = this.scanHistory.get(scanId);
    if (!report) {
      throw new Error(`Scan report ${scanId} not found`);
    }

    const applied: string[] = [];
    const failed: string[] = [];
    const results: any[] = [];

    for (const issueId of approvedIssueIds) {
      const issue = report.issues.find(i => i.id === issueId);
      if (!issue) {
        failed.push(issueId);
        continue;
      }

      if (!issue.autoFixable) {
        failed.push(issueId);
        results.push({ issueId, error: 'Issue marked as not auto-fixable' });
        continue;
      }

      try {
        const result = await this.applyFix(issue);
        applied.push(issueId);
        results.push({ issueId, result });
      } catch (error) {
        failed.push(issueId);
        results.push({ issueId, error: String(error) });
      }
    }

    return { applied, failed, results };
  }

  /**
   * Apply individual fix to data inconsistency
   */
  private async applyFix(issue: DataInconsistency): Promise<any> {
    console.log(`🔧 Applying fix for issue: ${issue.id}`);
    
    switch (issue.type) {
      case 'role_mismatch':
        if (issue.suggestedFix.roleId) {
          return await this.storage.updateUser(issue.affectedRecordId, {
            roleId: issue.suggestedFix.roleId
          });
        }
        break;
        
      case 'null_data':
        return await this.storage.updateUser(issue.affectedRecordId, issue.suggestedFix);
        
      case 'incomplete_profile':
        if (issue.suggestedFix.create_artist_profile) {
          return await this.storage.createArtist(issue.suggestedFix.create_artist_profile);
        }
        if (issue.suggestedFix.create_musician_profile) {
          return await this.storage.createMusician(issue.suggestedFix.create_musician_profile);
        }
        if (issue.suggestedFix.create_professional_profile) {
          return await this.storage.createProfessional(issue.suggestedFix.create_professional_profile);
        }
        break;
        
      default:
        throw new Error(`Unsupported fix type: ${issue.type}`);
    }
    
    throw new Error(`Unable to apply fix for issue: ${issue.id}`);
  }

  /**
   * Get latest data integrity report
   */
  getLatestReport(): DataIntegrityReport | null {
    const reports = Array.from(this.scanHistory.values());
    return reports.length > 0 ? reports[reports.length - 1] : null;
  }

  /**
   * Get all scan reports
   */
  getAllReports(): DataIntegrityReport[] {
    return Array.from(this.scanHistory.values());
  }

  /**
   * Schedule regular integrity scans
   */
  scheduleRegularScans(intervalHours: number = 24): void {
    setInterval(async () => {
      try {
        console.log('🔄 Running scheduled data integrity scan...');
        await this.performComprehensiveScan();
      } catch (error) {
        console.error('Scheduled integrity scan failed:', error);
      }
    }, intervalHours * 60 * 60 * 1000);
    
    console.log(`📅 Scheduled data integrity scans every ${intervalHours} hours`);
  }
}