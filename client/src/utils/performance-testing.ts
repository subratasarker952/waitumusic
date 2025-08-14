import { queryClient } from '@/lib/queryClient';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  queryTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  componentCount: number;
}

interface TestResult {
  testName: string;
  passed: boolean;
  metrics: PerformanceMetrics;
  issues: string[];
  recommendations: string[];
}

class PerformanceTestingSuite {
  private startTime: number = 0;
  private testResults: TestResult[] = [];

  startTest(testName: string) {
    this.startTime = performance.now();
    console.log(`🔍 Starting performance test: ${testName}`);
  }

  endTest(testName: string): PerformanceMetrics {
    const endTime = performance.now();
    const loadTime = endTime - this.startTime;

    const metrics: PerformanceMetrics = {
      loadTime,
      renderTime: this.measureRenderTime(),
      queryTime: this.measureQueryTime(),
      memoryUsage: this.measureMemoryUsage(),
      cacheHitRate: this.measureCacheHitRate(),
      componentCount: this.countActiveComponents()
    };

    console.log(`✅ Test completed: ${testName}`, metrics);
    return metrics;
  }

  private measureRenderTime(): number {
    // Measure React render cycles
    return performance.getEntriesByType('measure')
      .filter(entry => entry.name.includes('React'))
      .reduce((total, entry) => total + entry.duration, 0);
  }

  private measureQueryTime(): number {
    // Measure API query performance
    const queries = queryClient.getQueryCache().getAll();
    return queries.reduce((total, query) => {
      const duration = query.state.dataUpdatedAt - (query.state.fetchStatus === 'fetching' ? Date.now() - 1000 : query.state.dataUpdatedAt);
      return total + Math.max(0, duration);
    }, 0) / queries.length || 0;
  }

  private measureMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round((memory.usedJSHeapSize / 1048576) * 100) / 100;
    }
    return 0;
  }

  private measureCacheHitRate(): number {
    const queries = queryClient.getQueryCache().getAll();
    const cachedQueries = queries.filter(query => 
      query.state.data && query.state.status === 'success'
    );
    return queries.length > 0 ? (cachedQueries.length / queries.length) * 100 : 0;
  }

  private countActiveComponents(): number {
    // Estimate active React components
    const reactDevTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (reactDevTools && reactDevTools.renderers) {
      let componentCount = 0;
      reactDevTools.renderers.forEach((renderer: any) => {
        if (renderer.findFiberByHostInstance) {
          componentCount += Object.keys(renderer._debugRootType || {}).length;
        }
      });
      return componentCount;
    }
    return 0;
  }

  // Large Dataset Performance Test
  async testLargeDatasetHandling(dataSize: number = 1000): Promise<TestResult> {
    this.startTest(`Large Dataset (${dataSize} items)`);
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Generate test data
    const testData = Array.from({ length: dataSize }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`.repeat(10),
      metadata: { type: 'test', created: new Date().toISOString() }
    }));

    // Test rendering performance
    const renderStart = performance.now();
    
    // Simulate component rendering with data
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        // Simulate DOM operations
        const fragment = document.createDocumentFragment();
        testData.slice(0, 50).forEach(item => {
          const div = document.createElement('div');
          div.textContent = item.name;
          fragment.appendChild(div);
        });
        resolve(fragment);
      });
    });

    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;

    // Performance thresholds
    if (renderTime > 100) {
      issues.push(`Slow rendering: ${renderTime.toFixed(2)}ms for ${dataSize} items`);
      recommendations.push('Consider implementing virtualization for large lists');
    }

    if (dataSize > 500) {
      recommendations.push('Use pagination or infinite scrolling for better UX');
    }

    const metrics = this.endTest(`Large Dataset (${dataSize} items)`);
    
    return {
      testName: `Large Dataset (${dataSize} items)`,
      passed: issues.length === 0,
      metrics: { ...metrics, renderTime },
      issues,
      recommendations
    };
  }

  // API Performance Test
  async testAPIPerformance(): Promise<TestResult> {
    this.startTest('API Performance');
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    try {
      // Test multiple concurrent API calls
      const apiTests = [
        '/api/user/profile',
        '/api/artists',
        '/api/songs',
        '/api/dashboard/stats'
      ];

      const startTime = performance.now();
      const results = await Promise.allSettled(
        apiTests.map(endpoint => 
          fetch(endpoint, { 
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
          })
        )
      );
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const avgTime = totalTime / apiTests.length;

      if (avgTime > 500) {
        issues.push(`Slow API response: ${avgTime.toFixed(2)}ms average`);
        recommendations.push('Consider implementing request caching and optimization');
      }

      const failedRequests = results.filter(result => result.status === 'rejected');
      if (failedRequests.length > 0) {
        issues.push(`${failedRequests.length} API requests failed`);
        recommendations.push('Implement proper error handling and retry logic');
      }

    } catch (error) {
      issues.push(`API test failed: ${error}`);
      recommendations.push('Check network connectivity and API endpoint availability');
    }

    const metrics = this.endTest('API Performance');
    
    return {
      testName: 'API Performance',
      passed: issues.length === 0,
      metrics,
      issues,
      recommendations
    };
  }

  // Memory Leak Detection
  async testMemoryLeaks(): Promise<TestResult> {
    this.startTest('Memory Leak Detection');
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const initialMemory = this.measureMemoryUsage();
    
    // Simulate component mounting/unmounting cycles
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => {
        // Simulate React component lifecycle
        const div = document.createElement('div');
        document.body.appendChild(div);
        
        setTimeout(() => {
          document.body.removeChild(div);
          resolve(void 0);
        }, 50);
      });
    }

    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalMemory = this.measureMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;

    if (memoryIncrease > 10) {
      issues.push(`Potential memory leak detected: ${memoryIncrease}MB increase`);
      recommendations.push('Review component cleanup and event listener removal');
    }

    const metrics = this.endTest('Memory Leak Detection');
    
    return {
      testName: 'Memory Leak Detection',
      passed: issues.length === 0,
      metrics,
      issues,
      recommendations
    };
  }

  // Cache Performance Test
  async testCachePerformance(): Promise<TestResult> {
    this.startTest('Cache Performance');
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const cacheHitRate = this.measureCacheHitRate();
    const queryCache = queryClient.getQueryCache();
    const cacheSize = queryCache.getAll().length;

    if (cacheHitRate < 70) {
      issues.push(`Low cache hit rate: ${cacheHitRate.toFixed(1)}%`);
      recommendations.push('Optimize query keys and stale time settings');
    }

    if (cacheSize > 100) {
      issues.push(`Large cache size: ${cacheSize} queries cached`);
      recommendations.push('Implement cache cleanup and size limits');
    }

    const metrics = this.endTest('Cache Performance');
    
    return {
      testName: 'Cache Performance',
      passed: issues.length === 0,
      metrics,
      issues,
      recommendations
    };
  }

  // Run full performance test suite
  async runFullSuite(): Promise<TestResult[]> {
    console.log('🚀 Starting comprehensive performance test suite...');
    
    const results = await Promise.all([
      this.testLargeDatasetHandling(100),
      this.testLargeDatasetHandling(500),
      this.testLargeDatasetHandling(1000),
      this.testAPIPerformance(),
      this.testMemoryLeaks(),
      this.testCachePerformance()
    ]);

    this.testResults = results;
    
    // Generate summary report
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const overallScore = (passedTests / totalTests) * 100;

    console.log(`📊 Performance Test Summary:`);
    console.log(`   Passed: ${passedTests}/${totalTests} (${overallScore.toFixed(1)}%)`);
    console.log(`   Issues found: ${results.reduce((sum, r) => sum + r.issues.length, 0)}`);
    console.log(`   Recommendations: ${results.reduce((sum, r) => sum + r.recommendations.length, 0)}`);

    return results;
  }

  getTestResults(): TestResult[] {
    return this.testResults;
  }

  generateReport(): string {
    const results = this.getTestResults();
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    
    let report = `# Performance Test Report\n\n`;
    report += `**Overall Score:** ${((passedTests / totalTests) * 100).toFixed(1)}% (${passedTests}/${totalTests} tests passed)\n\n`;
    
    results.forEach(result => {
      report += `## ${result.testName}\n`;
      report += `**Status:** ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
      
      report += `**Metrics:**\n`;
      report += `- Load Time: ${result.metrics.loadTime.toFixed(2)}ms\n`;
      report += `- Render Time: ${result.metrics.renderTime.toFixed(2)}ms\n`;
      report += `- Memory Usage: ${result.metrics.memoryUsage}MB\n`;
      report += `- Cache Hit Rate: ${result.metrics.cacheHitRate.toFixed(1)}%\n\n`;
      
      if (result.issues.length > 0) {
        report += `**Issues:**\n`;
        result.issues.forEach(issue => report += `- ${issue}\n`);
        report += `\n`;
      }
      
      if (result.recommendations.length > 0) {
        report += `**Recommendations:**\n`;
        result.recommendations.forEach(rec => report += `- ${rec}\n`);
        report += `\n`;
      }
      
      report += `---\n\n`;
    });
    
    return report;
  }
}

export const performanceTester = new PerformanceTestingSuite();

// Export convenience functions
export const runPerformanceTests = () => performanceTester.runFullSuite();
export const testLargeDataset = (size: number) => performanceTester.testLargeDatasetHandling(size);
export const testAPIPerformance = () => performanceTester.testAPIPerformance();
export const generatePerformanceReport = () => performanceTester.generateReport();