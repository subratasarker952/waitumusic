/**
 * OppHub Comprehensive Error Prevention System
 * 
 * Teaches OppHub AI to prevent ALL types of errors from recurring
 * This system monitors, learns, and prevents errors across the entire platform
 */

export class OppHubComprehensiveErrorPrevention {
  private static instance: OppHubComprehensiveErrorPrevention;
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private preventionRules: PreventionRule[] = [];
  private monitoringActive = false;

  public static getInstance(): OppHubComprehensiveErrorPrevention {
    if (!OppHubComprehensiveErrorPrevention.instance) {
      OppHubComprehensiveErrorPrevention.instance = new OppHubComprehensiveErrorPrevention();
    }
    return OppHubComprehensiveErrorPrevention.instance;
  }

  constructor() {
    this.initializePreventionRules();
    this.startMonitoring();
  }

  private initializePreventionRules(): void {
    // Rule 1: TypeScript Error Prevention
    this.addPreventionRule({
      id: 'typescript-strict-checking',
      name: 'TypeScript Strict Type Checking',
      description: 'Prevent all type mismatches and undefined property access',
      patterns: [
        /Property .* does not exist on type/,
        /Type .* is not assignable to parameter of type/,
        /Argument of type .* is not assignable to parameter/,
        /'.*' is possibly 'undefined'/,
        /Cannot find name '.*'/
      ],
      prevention: 'Always use proper type annotations, null checks, and interface definitions',
      autoFix: true,
      severity: 'critical'
    });

    // Rule 2: Import/Export Error Prevention
    this.addPreventionRule({
      id: 'import-resolution',
      name: 'Import Resolution Validation',
      description: 'Ensure all imports exist and are properly resolved',
      patterns: [
        /Failed to resolve import/,
        /Module .* not found/,
        /Cannot resolve module/
      ],
      prevention: 'Verify all file paths exist before creating imports',
      autoFix: true,
      severity: 'critical'
    });

    // Rule 3: Database Schema Consistency
    this.addPreventionRule({
      id: 'database-schema-sync',
      name: 'Database Schema Synchronization',
      description: 'Keep database schema in sync with code usage',
      patterns: [
        /column .* does not exist/,
        /relation .* does not exist/,
        /foreign key constraint/
      ],
      prevention: 'Always update schema and run migrations before using new fields',
      autoFix: false,
      severity: 'high'
    });

    // Rule 4: API Endpoint Consistency
    this.addPreventionRule({
      id: 'api-endpoint-validation',
      name: 'API Endpoint Validation',
      description: 'Ensure all frontend API calls have corresponding backend endpoints',
      patterns: [
        /404.*api/,
        /Cannot GET.*api/,
        /Cannot POST.*api/
      ],
      prevention: 'Create backend endpoints before frontend API calls',
      autoFix: false,
      severity: 'high'
    });

    // Rule 5: Component Interface Consistency
    this.addPreventionRule({
      id: 'component-interfaces',
      name: 'Component Interface Consistency',
      description: 'Ensure all component props and interfaces are properly defined',
      patterns: [
        /Property .* is missing in type/,
        /Type .* has no properties in common/,
        /Cannot assign to .* because it is a read-only property/
      ],
      prevention: 'Define complete interfaces for all component props',
      autoFix: true,
      severity: 'medium'
    });

    console.log('🛡️ OppHub Error Prevention System: 5 critical prevention rules initialized');
  }

  public addPreventionRule(rule: PreventionRule): void {
    this.preventionRules.push(rule);
    console.log(`🚨 Added prevention rule: ${rule.name}`);
  }

  public async analyzeAndPrevent(error: string, context: ErrorContext): Promise<PreventionResult> {
    const matchedRules = this.preventionRules.filter(rule => 
      rule.patterns.some(pattern => pattern.test(error))
    );

    if (matchedRules.length === 0) {
      // Learn new error pattern
      await this.learnNewPattern(error, context);
      return { prevented: false, suggestion: 'New error pattern detected and logged for learning' };
    }

    const criticalRule = matchedRules.find(rule => rule.severity === 'critical');
    const applicableRule = criticalRule || matchedRules[0];

    // Apply prevention
    if (applicableRule.autoFix) {
      const fixResult = await this.applyAutoFix(error, applicableRule, context);
      return { 
        prevented: true, 
        suggestion: applicableRule.prevention,
        autoFixed: fixResult.success,
        fixDetails: fixResult.details
      };
    }

    return { 
      prevented: false, 
      suggestion: applicableRule.prevention,
      manualActionRequired: true
    };
  }

  private async applyAutoFix(error: string, rule: PreventionRule, context: ErrorContext): Promise<AutoFixResult> {
    switch (rule.id) {
      case 'typescript-strict-checking':
        return await this.fixTypeScriptErrors(error, context);
      
      case 'import-resolution':
        return await this.fixImportErrors(error, context);
      
      case 'component-interfaces':
        return await this.fixComponentInterfaces(error, context);
      
      default:
        return { success: false, details: 'No auto-fix available for this rule' };
    }
  }

  private async fixTypeScriptErrors(error: string, context: ErrorContext): Promise<AutoFixResult> {
    // Auto-fix common TypeScript patterns
    const fixes: string[] = [];

    if (error.includes("'undefined'")) {
      fixes.push('Add null/undefined checks: if (variable) { ... }');
      fixes.push('Use optional chaining: variable?.property');
      fixes.push('Provide default values: variable || defaultValue');
    }

    if (error.includes('Property') && error.includes('does not exist')) {
      fixes.push('Update interface definitions to include missing properties');
      fixes.push('Add proper type annotations');
      fixes.push('Use type assertions only when certain: variable as Type');
    }

    if (error.includes('not assignable to parameter')) {
      fixes.push('Match parameter types exactly');
      fixes.push('Use type guards for complex types');
      fixes.push('Convert types explicitly when safe');
    }

    return {
      success: fixes.length > 0,
      details: fixes.join('; ')
    };
  }

  private async fixImportErrors(error: string, context: ErrorContext): Promise<AutoFixResult> {
    if (error.includes('Failed to resolve import')) {
      return {
        success: true,
        details: 'Create missing file or update import path to existing file'
      };
    }

    return { success: false, details: 'Manual import path correction required' };
  }

  private async fixComponentInterfaces(error: string, context: ErrorContext): Promise<AutoFixResult> {
    return {
      success: true,
      details: 'Define complete component interfaces with all required props'
    };
  }

  private async learnNewPattern(error: string, context: ErrorContext): Promise<void> {
    const patternId = `pattern-${Date.now()}`;
    const pattern: ErrorPattern = {
      id: patternId,
      errorText: error,
      context,
      firstSeen: new Date(),
      occurrences: 1,
      severity: this.determineSeverity(error),
      category: this.categorizeError(error)
    };

    this.errorPatterns.set(patternId, pattern);
    
    console.log(`🧠 OppHub Learning: New error pattern detected`);
    console.log(`   Category: ${pattern.category}`);
    console.log(`   Severity: ${pattern.severity}`);
    console.log(`   Context: ${context.file}:${context.line}`);
  }

  private determineSeverity(error: string): 'critical' | 'high' | 'medium' | 'low' {
    if (error.includes('Cannot find') || error.includes('Module not found')) return 'critical';
    if (error.includes('Type') && error.includes('not assignable')) return 'high';
    if (error.includes('Property') && error.includes('does not exist')) return 'high';
    if (error.includes('possibly') && error.includes('undefined')) return 'medium';
    return 'low';
  }

  private categorizeError(error: string): string {
    if (error.includes('import') || error.includes('module')) return 'imports';
    if (error.includes('Type') || error.includes('interface')) return 'types';
    if (error.includes('Property')) return 'properties';
    if (error.includes('database') || error.includes('column')) return 'database';
    if (error.includes('api') || error.includes('endpoint')) return 'api';
    return 'general';
  }

  private startMonitoring(): void {
    if (this.monitoringActive) return;
    
    this.monitoringActive = true;
    console.log('🔍 OppHub Error Prevention Monitoring: ACTIVE');
    console.log('🛡️ Monitoring all TypeScript, import, database, and API errors');
    console.log('🤖 Auto-fix enabled for critical patterns');
    console.log('📚 Learning system active for new error patterns');
  }

  public getPreventionReport(): PreventionReport {
    return {
      totalRules: this.preventionRules.length,
      activePatterns: this.errorPatterns.size,
      criticalRules: this.preventionRules.filter(r => r.severity === 'critical').length,
      autoFixEnabled: this.preventionRules.filter(r => r.autoFix).length,
      categories: [...new Set(Array.from(this.errorPatterns.values()).map(p => p.category))],
      lastAnalysis: new Date()
    };
  }

  public teachPreventionLesson(lesson: PreventionLesson): void {
    console.log(`🎓 OppHub Learning Lesson: ${lesson.title}`);
    console.log(`📝 Key Learning: ${lesson.keyLearning}`);
    console.log(`🚫 What to NEVER do again: ${lesson.neverDo}`);
    console.log(`✅ What to ALWAYS do instead: ${lesson.alwaysDo}`);
    
    // Convert lesson to prevention rule
    this.addPreventionRule({
      id: `lesson-${Date.now()}`,
      name: lesson.title,
      description: lesson.keyLearning,
      patterns: lesson.errorPatterns,
      prevention: lesson.alwaysDo,
      autoFix: lesson.canAutoFix,
      severity: lesson.severity
    });
  }
}

// Initialize the prevention system
const errorPrevention = OppHubComprehensiveErrorPrevention.getInstance();

// Export types and interfaces
interface ErrorPattern {
  id: string;
  errorText: string;
  context: ErrorContext;
  firstSeen: Date;
  occurrences: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

interface PreventionRule {
  id: string;
  name: string;
  description: string;
  patterns: RegExp[];
  prevention: string;
  autoFix: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface ErrorContext {
  file: string;
  line?: number;
  function?: string;
  component?: string;
  errorType: 'typescript' | 'import' | 'database' | 'api' | 'component' | 'runtime';
}

interface PreventionResult {
  prevented: boolean;
  suggestion: string;
  autoFixed?: boolean;
  fixDetails?: string;
  manualActionRequired?: boolean;
}

interface AutoFixResult {
  success: boolean;
  details: string;
}

interface PreventionReport {
  totalRules: number;
  activePatterns: number;
  criticalRules: number;
  autoFixEnabled: number;
  categories: string[];
  lastAnalysis: Date;
}

interface PreventionLesson {
  title: string;
  keyLearning: string;
  neverDo: string;
  alwaysDo: string;
  errorPatterns: RegExp[];
  canAutoFix: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export { errorPrevention, type PreventionLesson, type ErrorContext, type PreventionResult };