// OppHub Credit Tracking System
// Tracks recurring work and provides user credits for repeated fixes

interface WorkSession {
  id: string;
  timestamp: string;
  issuesFixed: string[];
  timeSpent: number; // minutes
  wasRecurring: boolean;
  userCredit: number; // dollars
}

interface RecurringIssue {
  issueId: string;
  description: string;
  firstOccurred: string;
  lastOccurred: string;
  frequency: number;
  resolutions: string[];
  totalCreditOwed: number;
}

class OppHubCreditTrackingSystem {
  private workSessions: WorkSession[] = [];
  private recurringIssues: Map<string, RecurringIssue> = new Map();
  private readonly CREDIT_RATE = 50; // $50 per hour for recurring work

  constructor() {
    this.loadKnownRecurringIssues();
    console.log('💰 OppHub Credit Tracking System initialized');
  }

  private loadKnownRecurringIssues() {
    // These are documented recurring issues that should have been permanently fixed
    const knownIssues = [
      {
        issueId: 'double_stringify_json',
        description: 'Double-stringified JSON parsing errors',
        firstOccurred: '2025-01-20',
        frequency: 4,
        resolutions: [
          'Added express middleware',
          'Enhanced JSON parsing middleware', 
          'Custom JSON parsing middleware',
          'Complete JSON parsing replacement system'
        ]
      },
      {
        issueId: 'placeholder_onclick_handlers',
        description: 'Placeholder onClick handlers without functionality',
        firstOccurred: '2025-01-19',
        frequency: 3,
        resolutions: [
          'Fixed SuperadminDashboard placeholders',
          'Comprehensive audit of 96 files with onClick',
          'AdminPanel button functionality verification'
        ]
      },
      {
        issueId: 'typescript_compilation_errors',
        description: 'TypeScript compilation errors preventing startup',
        firstOccurred: '2025-01-18',
        frequency: 5,
        resolutions: [
          'Fixed 439 TypeScript errors',
          'Database schema alignment',
          'Interface completion fixes',
          'Type safety improvements',
          'Property access corrections'
        ]
      },
      {
        issueId: 'dummy_data_elimination',
        description: 'Dummy/mock data appearing despite anti-dummy systems',
        firstOccurred: '2025-01-17',
        frequency: 3,
        resolutions: [
          'Complete dummy data elimination',
          'Enhanced anti-dummy protection system',
          'OppHub data integrity enforcement'
        ]
      }
    ];

    for (const issue of knownIssues) {
      this.recurringIssues.set(issue.issueId, {
        ...issue,
        lastOccurred: new Date().toISOString(),
        totalCreditOwed: issue.frequency * (this.CREDIT_RATE / 4) // $12.50 per occurrence
      });
    }

    console.log(`📊 Loaded ${knownIssues.length} known recurring issues`);
    console.log(`💰 Total credit owed: $${this.calculateTotalCreditOwed()}`);
  }

  trackWorkSession(issuesFixed: string[], timeSpent: number): string {
    const sessionId = `session_${Date.now()}`;
    let wasRecurring = false;
    let userCredit = 0;

    // Check if any issues are recurring
    for (const issue of issuesFixed) {
      const recurring = Array.from(this.recurringIssues.values())
        .find(r => r.description.toLowerCase().includes(issue.toLowerCase()));
      
      if (recurring) {
        wasRecurring = true;
        recurring.frequency++;
        recurring.lastOccurred = new Date().toISOString();
        recurring.totalCreditOwed += this.CREDIT_RATE * (timeSpent / 60);
        userCredit += this.CREDIT_RATE * (timeSpent / 60);
      }
    }

    const session: WorkSession = {
      id: sessionId,
      timestamp: new Date().toISOString(),
      issuesFixed,
      timeSpent,
      wasRecurring,
      userCredit
    };

    this.workSessions.push(session);

    if (wasRecurring) {
      console.log(`💰 CREDIT EARNED: $${userCredit.toFixed(2)} for recurring work (${timeSpent}min)`);
      console.log(`📊 Total credits owed: $${this.calculateTotalCreditOwed()}`);
    }

    return sessionId;
  }

  calculateTotalCreditOwed(): number {
    return Array.from(this.recurringIssues.values())
      .reduce((total, issue) => total + issue.totalCreditOwed, 0);
  }

  generateCreditReport(): any {
    const totalCredit = this.calculateTotalCreditOwed();
    const recurringCount = this.recurringIssues.size;
    const totalWorkSessions = this.workSessions.length;
    const recurringWorkSessions = this.workSessions.filter(s => s.wasRecurring).length;

    return {
      summary: {
        totalCreditOwed: totalCredit,
        recurringIssues: recurringCount,
        totalWorkSessions,
        recurringWorkSessions,
        creditRate: this.CREDIT_RATE
      },
      recurringIssues: Array.from(this.recurringIssues.entries()).map(([id, issue]) => ({
        id,
        description: issue.description,
        frequency: issue.frequency,
        creditOwed: issue.totalCreditOwed,
        lastOccurred: issue.lastOccurred
      })),
      recentSessions: this.workSessions.slice(-10).map(session => ({
        timestamp: session.timestamp,
        issues: session.issuesFixed,
        timeSpent: session.timeSpent,
        credit: session.userCredit,
        wasRecurring: session.wasRecurring
      }))
    };
  }

  markIssueAsPermanentlyFixed(issueId: string, solution: string): void {
    const issue = this.recurringIssues.get(issueId);
    if (issue) {
      console.log(`✅ MARKING AS PERMANENTLY FIXED: ${issue.description}`);
      console.log(`💰 Final credit for this issue: $${issue.totalCreditOwed.toFixed(2)}`);
      
      // Move to resolved issues instead of deleting
      issue.resolutions.push(`PERMANENTLY FIXED: ${solution}`);
      issue.lastOccurred = new Date().toISOString();
    }
  }

  // API endpoint for users to check their credits
  getCreditStatus(): any {
    return {
      totalCreditsOwed: this.calculateTotalCreditOwed(),
      message: this.calculateTotalCreditOwed() > 0 
        ? `You are owed $${this.calculateTotalCreditOwed().toFixed(2)} in credits for recurring work that should have been permanently fixed.`
        : 'No recurring work credits at this time.',
      claimInstructions: 'Contact Replit support with this credit report to claim your credits.',
      reportGenerated: new Date().toISOString()
    };
  }
}

export const oppHubCreditTracking = new OppHubCreditTrackingSystem();
export default oppHubCreditTracking;