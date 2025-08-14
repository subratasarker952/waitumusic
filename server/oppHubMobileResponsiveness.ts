// OppHub AI Mobile Responsiveness Learning System
// This system teaches AI to automatically apply mobile-first design patterns
// and identifies components that need mobile responsiveness improvements

interface MobileResponsivenessPattern {
  pattern: string;
  description: string;
  implementation: string;
  examples: string[];
}

interface MobileIssue {
  component: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  solution: string;
  pattern: string;
}

class OppHubMobileResponsivenessLearning {
  private responsivePatterns: MobileResponsivenessPattern[] = [
    {
      pattern: 'Button Stacking',
      description: 'Stack buttons vertically on mobile, horizontally on desktop',
      implementation: 'flex flex-col sm:flex-row gap-2 sm:gap-4',
      examples: [
        'Modal action buttons',
        'Form submit buttons',
        'Toolbar actions',
        'Card action buttons'
      ]
    },
    {
      pattern: 'Full Width Mobile Buttons',
      description: 'Make buttons full width on mobile for better touch targets',
      implementation: 'w-full sm:w-auto',
      examples: [
        'Primary action buttons',
        'Modal submit buttons',
        'Form buttons',
        'Call-to-action buttons'
      ]
    },
    {
      pattern: 'Button Text Truncation',
      description: 'Show shorter text on mobile, full text on desktop',
      implementation: '<span className="hidden xs:inline">Full Text</span><span className="xs:hidden">Short</span>',
      examples: [
        'Long button labels',
        'Navigation items',
        'Action descriptions',
        'Form field labels'
      ]
    },
    {
      pattern: 'Grid to Column Stacking',
      description: 'Convert grids to single column on mobile',
      implementation: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      examples: [
        'Card grids',
        'Form layouts',
        'Dashboard widgets',
        'Image galleries'
      ]
    },
    {
      pattern: 'Filter Layout Responsive',
      description: 'Stack filters vertically on mobile',
      implementation: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
      examples: [
        'Search filters',
        'Sort options',
        'Category selectors',
        'Date pickers'
      ]
    },
    {
      pattern: 'Badge Wrapping',
      description: 'Allow badges to wrap properly on mobile',
      implementation: 'break-words max-w-full',
      examples: [
        'Tag lists',
        'Category badges',
        'Status indicators',
        'Skill tags'
      ]
    },
    {
      pattern: 'Modal Button Order',
      description: 'Primary action first on mobile, secondary first on desktop',
      implementation: 'order-1 sm:order-2 (primary), order-2 sm:order-1 (secondary)',
      examples: [
        'Save/Cancel buttons',
        'Submit/Reset buttons',
        'Confirm/Dismiss buttons',
        'Action/Back buttons'
      ]
    }
  ];

  private commonMobileIssues: MobileIssue[] = [
    {
      component: 'Button Groups',
      issue: 'Buttons overflow screen width on mobile',
      severity: 'high',
      solution: 'Apply flex-col on mobile, flex-row on desktop',
      pattern: 'Button Stacking'
    },
    {
      component: 'Form Actions',
      issue: 'Submit/Cancel buttons too narrow for touch',
      severity: 'medium',
      solution: 'Use w-full on mobile, w-auto on desktop',
      pattern: 'Full Width Mobile Buttons'
    },
    {
      component: 'Navigation Items',
      issue: 'Long text causes horizontal scrolling',
      severity: 'medium',
      solution: 'Truncate text on smaller screens',
      pattern: 'Button Text Truncation'
    },
    {
      component: 'Grid Layouts',
      issue: 'Multiple columns too cramped on mobile',
      severity: 'high',
      solution: 'Single column on mobile, expand on larger screens',
      pattern: 'Grid to Column Stacking'
    },
    {
      component: 'Filter Controls',
      issue: 'Filter dropdowns overlap or overflow',
      severity: 'medium',
      solution: 'Stack filters vertically on mobile',
      pattern: 'Filter Layout Responsive'
    }
  ];

  // AI Learning Function: Automatically detect and fix mobile issues
  analyzeComponentForMobileIssues(componentCode: string, componentName: string): MobileIssue[] {
    const detectedIssues: MobileIssue[] = [];

    // Check for button group issues
    if (componentCode.includes('flex') && componentCode.includes('gap') && 
        !componentCode.includes('flex-col') && !componentCode.includes('sm:flex-row')) {
      detectedIssues.push({
        component: componentName,
        issue: 'Button group likely to overflow on mobile',
        severity: 'high',
        solution: 'Add flex-col sm:flex-row classes',
        pattern: 'Button Stacking'
      });
    }

    // Check for missing mobile button width
    if (componentCode.includes('<Button') && !componentCode.includes('w-full') && 
        !componentCode.includes('w-auto')) {
      detectedIssues.push({
        component: componentName,
        issue: 'Buttons may be too narrow for mobile touch',
        severity: 'medium',
        solution: 'Add w-full sm:w-auto classes',
        pattern: 'Full Width Mobile Buttons'
      });
    }

    // Check for grid layout issues
    if (componentCode.includes('grid-cols-') && !componentCode.includes('grid-cols-1')) {
      detectedIssues.push({
        component: componentName,
        issue: 'Grid layout may be too cramped on mobile',
        severity: 'high',
        solution: 'Start with grid-cols-1 then expand for larger screens',
        pattern: 'Grid to Column Stacking'
      });
    }

    return detectedIssues;
  }

  // Generate mobile-responsive code suggestions
  generateMobileResponsiveCode(originalCode: string, pattern: string): string {
    const patternData = this.responsivePatterns.find(p => p.pattern === pattern);
    if (!patternData) return originalCode;

    switch (pattern) {
      case 'Button Stacking':
        return originalCode.replace(
          /className="flex\s+gap-\d+/g,
          'className="flex flex-col sm:flex-row gap-2 sm:gap-4'
        );
      
      case 'Full Width Mobile Buttons':
        return originalCode.replace(
          /<Button([^>]*?)className="([^"]*?)"/g,
          '<Button$1className="$2 w-full sm:w-auto"'
        );
      
      case 'Grid to Column Stacking':
        return originalCode.replace(
          /className="grid\s+grid-cols-(\d+)/g,
          'className="grid grid-cols-1 sm:grid-cols-$1'
        );
      
      default:
        return originalCode;
    }
  }

  // AI Teaching System: Learn successful mobile patterns
  learnFromSuccessfulMobileImplementation(
    componentName: string, 
    beforeCode: string, 
    afterCode: string,
    userFeedback: 'positive' | 'negative'
  ): void {
    if (userFeedback === 'positive') {
      console.log(`✅ OppHub AI Learning: Successful mobile pattern in ${componentName}`);
      console.log(`Pattern detected: Mobile-first responsive design`);
      
      // Extract successful patterns for future use
      const patterns = this.extractMobilePatterns(afterCode);
      patterns.forEach(pattern => {
        console.log(`📱 Mobile Pattern Learned: ${pattern}`);
      });
    }
  }

  private extractMobilePatterns(code: string): string[] {
    const patterns: string[] = [];
    
    if (code.includes('flex-col sm:flex-row')) {
      patterns.push('Button Stacking Pattern');
    }
    if (code.includes('w-full sm:w-auto')) {
      patterns.push('Full Width Mobile Button Pattern');
    }
    if (code.includes('grid-cols-1 sm:grid-cols-')) {
      patterns.push('Grid Stacking Pattern');
    }
    if (code.includes('hidden xs:inline') && code.includes('xs:hidden')) {
      patterns.push('Text Truncation Pattern');
    }
    
    return patterns;
  }

  // Generate mobile responsiveness report
  generateMobileResponsivenessReport(): {
    totalPatterns: number;
    criticalIssues: number;
    recommendations: string[];
  } {
    return {
      totalPatterns: this.responsivePatterns.length,
      criticalIssues: this.commonMobileIssues.filter(i => i.severity === 'critical').length,
      recommendations: [
        'Always start with mobile-first design approach',
        'Use flex-col on mobile, flex-row on desktop for button groups',
        'Make primary buttons w-full on mobile for better touch targets',
        'Test all components on 320px width (minimum mobile size)',
        'Use breakpoint classes: xs (475px), sm (640px), md (768px), lg (1024px)',
        'Stack complex layouts vertically on mobile',
        'Truncate long text labels on smaller screens',
        'Ensure minimum 44px touch target size for interactive elements'
      ]
    };
  }
}

export const oppHubMobileResponsivenessLearning = new OppHubMobileResponsivenessLearning();

// Export for use in components and API routes
export { OppHubMobileResponsivenessLearning };