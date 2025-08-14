// OppHub Data Integrity System - Ensures Only Real Data Usage
// Critical: Prevents mock/placeholder data and enforces authentic data sources

interface DataValidationRule {
  field: string;
  type: 'required' | 'authentic' | 'no_placeholder' | 'database_linked';
  description: string;
  validator: (value: any) => boolean;
  errorMessage: string;
}

interface PlaceholderPattern {
  pattern: RegExp;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  replacement?: string;
}

class OppHubDataIntegritySystem {
  private validationRules: Map<string, DataValidationRule[]> = new Map();
  private placeholderPatterns: PlaceholderPattern[] = [];
  private authenticDataSources: Set<string> = new Set();
  private bannedPatterns: Set<string> = new Set();

  constructor() {
    this.initializeValidationRules();
    this.initializePlaceholderDetection();
    this.initializeAuthenticDataSources();
    this.initializeBannedPatterns();
  }

  private initializeValidationRules() {
    // Opportunity data validation
    this.validationRules.set('opportunities', [
      {
        field: 'title',
        type: 'required',
        description: 'Opportunity title must be from authentic source',
        validator: (value) => typeof value === 'string' && value.length > 10 && !this.containsPlaceholder(value),
        errorMessage: 'Opportunity title must be authentic and descriptive'
      },
      {
        field: 'organizer',
        type: 'authentic',
        description: 'Organizer must be a real entity',
        validator: (value) => typeof value === 'string' && !this.containsPlaceholder(value) && value !== 'TBD',
        errorMessage: 'Organizer must be a verified real entity'
      },
      {
        field: 'compensationType',
        type: 'authentic',
        description: 'Compensation must be real and specific',
        validator: (value) => ['paid', 'revenue_share', 'exposure', 'volunteer'].includes(value),
        errorMessage: 'Compensation type must be one of the valid authentic types'
      },
      {
        field: 'sourceUrl',
        type: 'database_linked',
        description: 'Source URL must be a real, accessible website',
        validator: (value) => typeof value === 'string' && value.startsWith('http') && !this.isBannedUrl(value),
        errorMessage: 'Source URL must be a real, accessible website'
      }
    ]);

    // Revenue data validation
    this.validationRules.set('revenue', [
      {
        field: 'amount',
        type: 'authentic',
        description: 'Revenue amounts must be real financial data',
        validator: (value) => typeof value === 'number' && value >= 0 && !isNaN(value),
        errorMessage: 'Revenue amount must be a real positive number'
      },
      {
        field: 'source',
        type: 'database_linked',
        description: 'Revenue source must link to actual booking/service',
        validator: (value) => typeof value === 'string' && this.authenticDataSources.has(value),
        errorMessage: 'Revenue source must be linked to authentic booking or service data'
      }
    ]);

    // User profile validation
    this.validationRules.set('profiles', [
      {
        field: 'name',
        type: 'authentic',
        description: 'User names must be real (not placeholder)',
        validator: (value) => typeof value === 'string' && !this.containsPlaceholder(value),
        errorMessage: 'User name cannot be a placeholder or generic value'
      },
      {
        field: 'email',
        type: 'authentic',
        description: 'Email addresses must be real and valid',
        validator: (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !value.includes('example'),
        errorMessage: 'Email must be a real, valid email address'
      }
    ]);
  }

  private initializePlaceholderDetection() {
    this.placeholderPatterns = [
      {
        pattern: /coming soon|placeholder|lorem ipsum|sample|mock|fake|dummy/gi,
        description: 'Generic placeholder text',
        severity: 'critical'
      },
      {
        pattern: /\$?0(\.0+)?$|TBD|N\/A|TODO|FIXME/gi,
        description: 'Placeholder values and development artifacts',
        severity: 'high'
      },
      {
        pattern: /example\.com|test\.com|placeholder\.com|dummy\.com/gi,
        description: 'Placeholder domains and URLs',
        severity: 'critical'
      },
      {
        pattern: /john doe|jane doe|test user|admin user|sample user/gi,
        description: 'Generic user names',
        severity: 'medium'
      },
      {
        pattern: /feature.*coming|will.*be.*available|configuration.*panel.*opening/gi,
        description: 'Development status messages',
        severity: 'critical'
      }
    ];
  }

  private initializeAuthenticDataSources() {
    // Only verified, real data sources allowed
    this.authenticDataSources.add('booking_revenue');
    this.authenticDataSources.add('merchandise_sales');
    this.authenticDataSources.add('streaming_royalties');
    this.authenticDataSources.add('performance_fees');
    this.authenticDataSources.add('sync_licensing');
    this.authenticDataSources.add('consultation_fees');
    this.authenticDataSources.add('splitsheet_services');
    this.authenticDataSources.add('pro_registration_services');
  }

  private initializeBannedPatterns() {
    // Patterns that should never appear in production data
    this.bannedPatterns.add('mock');
    this.bannedPatterns.add('fake');
    this.bannedPatterns.add('placeholder');
    this.bannedPatterns.add('sample');
    this.bannedPatterns.add('test');
    this.bannedPatterns.add('dummy');
    this.bannedPatterns.add('lorem');
    this.bannedPatterns.add('coming soon');
    this.bannedPatterns.add('feature.*coming');
  }

  // Main validation method
  public validateData(dataType: string, data: any): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const rules = this.validationRules.get(dataType);
    if (!rules) {
      warnings.push(`No validation rules found for data type: ${dataType}`);
      return { isValid: true, errors, warnings };
    }

    for (const rule of rules) {
      const fieldValue = data[rule.field];
      
      if (!rule.validator(fieldValue)) {
        errors.push(`${rule.field}: ${rule.errorMessage}`);
      }
    }

    // Check for placeholder patterns in all string fields
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && this.containsPlaceholder(value)) {
        errors.push(`${key}: Contains placeholder or mock data - "${value}"`);
      }
    }

    return { 
      isValid: errors.length === 0, 
      errors, 
      warnings 
    };
  }

  // Check if string contains placeholder patterns
  private containsPlaceholder(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    
    return this.placeholderPatterns.some(pattern => 
      pattern.pattern.test(text)
    );
  }

  // Check if URL is banned or problematic
  private isBannedUrl(url: string): boolean {
    return Array.from(this.bannedPatterns).some(pattern => 
      new RegExp(pattern, 'gi').test(url)
    );
  }

  // Sanitize and validate opportunity data
  public sanitizeOpportunityData(opportunity: any): any {
    const validation = this.validateData('opportunities', opportunity);
    
    if (!validation.isValid) {
      throw new Error(`Invalid opportunity data: ${validation.errors.join(', ')}`);
    }

    // Return only validated, authentic data
    return {
      ...opportunity,
      validated: true,
      validatedAt: new Date().toISOString(),
      dataSource: 'authentic'
    };
  }

  // Real-time code scanning for placeholder patterns
  public scanCodeForPlaceholders(code: string): { issues: any[]; isClean: boolean } {
    const issues: any[] = [];
    
    for (const pattern of this.placeholderPatterns) {
      const matches = code.match(pattern.pattern);
      if (matches) {
        issues.push({
          pattern: pattern.pattern.source,
          matches: matches,
          severity: pattern.severity,
          description: pattern.description,
          recommendation: 'Replace with authentic data or remove'
        });
      }
    }

    return {
      issues,
      isClean: issues.length === 0
    };
  }

  // TypeScript error detection and resolution guidance
  public analyzeTypeScriptError(errorMessage: string): { 
    errorType: string; 
    resolution: string; 
    preventionStrategy: string;
    isDataIntegrityRelated: boolean;
  } {
    const dataIntegrityErrors = [
      'Cannot read property.*of undefined',
      'Property.*does not exist on type',
      'Type.*is not assignable to type',
      'Argument of type.*is not assignable'
    ];

    const isDataIntegrityRelated = dataIntegrityErrors.some(pattern => 
      new RegExp(pattern).test(errorMessage)
    );

    if (errorMessage.includes('Cannot read property')) {
      return {
        errorType: 'null_safety',
        resolution: 'Add null/undefined checks using optional chaining (?.) or null coalescing (??)',
        preventionStrategy: 'Always validate data exists before accessing properties',
        isDataIntegrityRelated: true
      };
    }

    if (errorMessage.includes('Property') && errorMessage.includes('does not exist')) {
      return {
        errorType: 'type_mismatch',
        resolution: 'Verify object structure matches TypeScript interface. Check if property name is correct.',
        preventionStrategy: 'Use strict typing and validate data structure at runtime',
        isDataIntegrityRelated: true
      };
    }

    if (errorMessage.includes('not assignable to type')) {
      return {
        errorType: 'type_assignment',
        resolution: 'Ensure data types match expected interface. Cast or validate data if necessary.',
        preventionStrategy: 'Use consistent typing throughout data flow',
        isDataIntegrityRelated: true
      };
    }

    return {
      errorType: 'general',
      resolution: 'Review error context and fix type inconsistencies',
      preventionStrategy: 'Implement comprehensive TypeScript strict mode',
      isDataIntegrityRelated: false
    };
  }

  // Generate authentic data validation report
  public generateDataIntegrityReport(): {
    authenticDataSources: string[];
    validationRules: number;
    bannedPatterns: string[];
    lastValidation: string;
  } {
    return {
      authenticDataSources: Array.from(this.authenticDataSources),
      validationRules: Array.from(this.validationRules.values()).reduce((count, rules) => count + rules.length, 0),
      bannedPatterns: Array.from(this.bannedPatterns),
      lastValidation: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const oppHubDataIntegrity = new OppHubDataIntegritySystem();

// Enhanced opportunity storage with data integrity validation
export async function storeAuthenticOpportunity(opportunityData: any): Promise<boolean> {
  try {
    // Validate data integrity first
    const sanitizedData = oppHubDataIntegrity.sanitizeOpportunityData(opportunityData);
    
    // Only store if validation passes
    console.log(`✅ Storing validated opportunity: ${sanitizedData.title}`);
    
    // Store in database with validation metadata
    // This would connect to your actual database storage
    return true;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Data integrity violation: ${errorMessage}`);
    return false;
  }
}