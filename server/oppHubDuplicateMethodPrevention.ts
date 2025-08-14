// OppHub AI Duplicate Method Prevention System
// Teaches OppHub to detect and prevent duplicate method definitions

export class OppHubDuplicateMethodPrevention {
  private knownDuplicatePatterns: Map<string, DuplicatePattern> = new Map();
  
  constructor() {
    this.initializeDuplicatePatterns();
  }

  private initializeDuplicatePatterns() {
    // Pattern 1: TypeScript method evolution duplicates
    this.knownDuplicatePatterns.set('typescript_method_evolution', {
      description: 'Methods redefined with better TypeScript types',
      pattern: /async\s+(\w+)\s*\([^)]*\):\s*Promise<(any|[A-Z]\w*)>/g,
      riskFactors: [
        'Method returns `Promise<any>` (old version)',
        'Same method returns `Promise<SpecificType>` (new version)',
        'Parameter types changed from `any` to specific types',
        'Method implementation improved but old version left behind'
      ],
      preventionStrategy: 'Always remove old `any`-typed versions when adding TypeScript-typed methods',
      autoFixApproach: 'Keep the properly typed version, remove the `any` version'
    });

    // Pattern 2: Database migration duplicates
    this.knownDuplicatePatterns.set('database_migration_duplicates', {
      description: 'Methods duplicated during database schema migrations',
      pattern: /async\s+(get|create|update|delete)\w+\s*\([^)]*\)/g,
      riskFactors: [
        'Schema changes requiring method signature updates',
        'Old methods kept for backward compatibility',
        'Database query improvements creating new implementations',
        'ORM migration creating parallel implementations'
      ],
      preventionStrategy: 'Use database migration approach - update method signatures in place',
      autoFixApproach: 'Merge implementations, keeping the most complete one'
    });

    // Pattern 3: Interface evolution duplicates
    this.knownDuplicatePatterns.set('interface_evolution_duplicates', {
      description: 'Methods duplicated when implementing new interfaces',
      pattern: /implements\s+\w+.*{[\s\S]*async\s+\w+/g,
      riskFactors: [
        'Interface requirements change',
        'New interface methods added without removing old ones',
        'Multiple interface implementations in same class',
        'Interface method signature evolution'
      ],
      preventionStrategy: 'Update interface first, then update all implementations',
      autoFixApproach: 'Check interface requirements and keep matching methods'
    });
  }

  // Scan file for duplicate methods
  async scanForDuplicateMethods(filePath: string, fileContent: string): Promise<DuplicateAnalysis> {
    const methodSignatures: Map<string, MethodOccurrence[]> = new Map();
    const lines = fileContent.split('\n');
    
    // Extract all method signatures
    lines.forEach((line, index) => {
      const methodMatch = line.match(/async\s+(\w+)\s*\([^)]*\):\s*Promise<([^>]+)>/);
      if (methodMatch) {
        const [fullMatch, methodName, returnType] = methodMatch;
        
        if (!methodSignatures.has(methodName)) {
          methodSignatures.set(methodName, []);
        }
        
        methodSignatures.get(methodName)!.push({
          methodName,
          returnType,
          lineNumber: index + 1,
          fullSignature: fullMatch,
          lineContent: line.trim()
        });
      }
    });

    // Find duplicates
    const duplicates: DuplicateMethod[] = [];
    methodSignatures.forEach((occurrences, methodName) => {
      if (occurrences.length > 1) {
        duplicates.push({
          methodName,
          occurrences,
          pattern: this.identifyDuplicatePattern(occurrences),
          recommendedAction: this.getRecommendedAction(occurrences)
        });
      }
    });

    return {
      filePath,
      totalMethods: Array.from(methodSignatures.values()).flat().length,
      duplicateCount: duplicates.length,
      duplicateMethods: duplicates,
      riskLevel: this.calculateRiskLevel(duplicates),
      autoFixable: duplicates.filter(d => d.recommendedAction.autoFixable).length
    };
  }

  private identifyDuplicatePattern(occurrences: MethodOccurrence[]): string {
    // Check for TypeScript evolution pattern (any -> specific type)
    const hasAnyReturn = occurrences.some(o => o.returnType === 'any');
    const hasSpecificReturn = occurrences.some(o => o.returnType !== 'any');
    
    if (hasAnyReturn && hasSpecificReturn) {
      return 'typescript_method_evolution';
    }

    // Check for parameter differences
    const signatures = occurrences.map(o => o.fullSignature);
    const uniqueSignatures = new Set(signatures);
    
    if (uniqueSignatures.size === occurrences.length) {
      return 'interface_evolution_duplicates';
    }

    return 'database_migration_duplicates';
  }

  private getRecommendedAction(occurrences: MethodOccurrence[]): RecommendedAction {
    const pattern = this.identifyDuplicatePattern(occurrences);
    
    switch (pattern) {
      case 'typescript_method_evolution':
        const anyVersion = occurrences.find(o => o.returnType === 'any');
        const typedVersion = occurrences.find(o => o.returnType !== 'any');
        
        return {
          action: 'remove_old_version',
          description: `Remove the 'any' typed version at line ${anyVersion?.lineNumber}, keep the properly typed version at line ${typedVersion?.lineNumber}`,
          autoFixable: true,
          linesToRemove: anyVersion ? [anyVersion.lineNumber] : [],
          linesToKeep: typedVersion ? [typedVersion.lineNumber] : []
        };

      case 'database_migration_duplicates':
        // Keep the most recent (usually last) implementation
        const lastOccurrence = occurrences[occurrences.length - 1];
        const linesToRemove = occurrences.slice(0, -1).map(o => o.lineNumber);
        
        return {
          action: 'keep_latest_implementation',
          description: `Keep the latest implementation at line ${lastOccurrence.lineNumber}, remove earlier versions`,
          autoFixable: true,
          linesToRemove,
          linesToKeep: [lastOccurrence.lineNumber]
        };

      default:
        return {
          action: 'manual_review_required',
          description: 'Multiple method signatures require manual review to determine correct implementation',
          autoFixable: false,
          linesToRemove: [],
          linesToKeep: []
        };
    }
  }

  private calculateRiskLevel(duplicates: DuplicateMethod[]): 'low' | 'medium' | 'high' | 'critical' {
    if (duplicates.length === 0) return 'low';
    if (duplicates.length <= 3) return 'medium';
    if (duplicates.length <= 6) return 'high';
    return 'critical';
  }

  // Generate OppHub learning content
  generateLearningContent(analysis: DuplicateAnalysis): string {
    return `
🔧 OppHub Duplicate Method Prevention Learning:

📊 Analysis Results:
- File: ${analysis.filePath}
- Total Methods: ${analysis.totalMethods}
- Duplicates Found: ${analysis.duplicateCount}
- Risk Level: ${analysis.riskLevel.toUpperCase()}
- Auto-fixable: ${analysis.autoFixable}/${analysis.duplicateCount}

🎯 Duplicate Patterns Identified:
${analysis.duplicateMethods.map(d => `
  ❌ Method: ${d.methodName}
  📍 Occurrences: ${d.occurrences.map(o => `Line ${o.lineNumber} (${o.returnType})`).join(', ')}
  🔍 Pattern: ${d.pattern}
  💡 Action: ${d.recommendedAction.description}
`).join('')}

📚 Prevention Rules for Future Development:
1. Before adding a method, search for existing implementations
2. When improving TypeScript types, remove old 'any' versions immediately
3. During database migrations, update methods in-place rather than adding new ones
4. Use TypeScript strict mode to catch duplicate method definitions
5. Implement pre-commit hooks to scan for duplicate methods

🛡️ OppHub Auto-Prevention Strategy:
- Scan all .ts files for duplicate async method signatures
- Flag any method defined more than once in the same class
- Prioritize properly typed methods over 'any' typed methods
- Suggest immediate removal of outdated implementations
- Generate automated fix suggestions with line numbers

This learning prevents future duplicate method build warnings and maintains clean codebases.
`;
  }

  // Integration with OppHub Error Learning System
  async reportToOppHubLearning(analysis: DuplicateAnalysis): Promise<void> {
    try {
      // Check if global OppHub learning system exists
      if ((global as any).oppHubErrorLearning) {
        const learningContent = this.generateLearningContent(analysis);
        
        await (global as any).oppHubErrorLearning.learnFromError(
          new Error(`Duplicate method definitions detected: ${analysis.duplicateCount} duplicates found`),
          'duplicate_method_prevention',
          learningContent
        );
        
        console.log('🎓 OppHub learned duplicate method prevention patterns');
      }
    } catch (error) {
      console.error('Failed to report to OppHub learning system:', error);
    }
  }
}

// Type definitions
interface DuplicatePattern {
  description: string;
  pattern: RegExp;
  riskFactors: string[];
  preventionStrategy: string;
  autoFixApproach: string;
}

interface MethodOccurrence {
  methodName: string;
  returnType: string;
  lineNumber: number;
  fullSignature: string;
  lineContent: string;
}

interface DuplicateMethod {
  methodName: string;
  occurrences: MethodOccurrence[];
  pattern: string;
  recommendedAction: RecommendedAction;
}

interface RecommendedAction {
  action: string;
  description: string;
  autoFixable: boolean;
  linesToRemove: number[];
  linesToKeep: number[];
}

interface DuplicateAnalysis {
  filePath: string;
  totalMethods: number;
  duplicateCount: number;
  duplicateMethods: DuplicateMethod[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  autoFixable: number;
}

// Export singleton
export const oppHubDuplicatePrevention = new OppHubDuplicateMethodPrevention();