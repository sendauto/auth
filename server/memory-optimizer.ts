/**
 * Memory Optimization Module
 * Implements XM-identified performance improvements
 */

export class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private memoryThreshold = 150; // MB
  private isActive = false;

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('[Memory Optimizer] Starting memory optimization...');
    
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 5 * 60 * 1000);

    // Initial cleanup
    this.performCleanup();
  }

  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isActive = false;
    console.log('[Memory Optimizer] Stopped memory optimization');
  }

  private performCleanup() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    console.log(`[Memory Optimizer] Current heap usage: ${heapUsedMB}MB`);
    
    if (heapUsedMB > this.memoryThreshold) {
      console.log(`[Memory Optimizer] Memory usage high (${heapUsedMB}MB > ${this.memoryThreshold}MB), performing cleanup...`);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        
        const afterGC = process.memoryUsage();
        const newHeapUsedMB = Math.round(afterGC.heapUsed / 1024 / 1024);
        console.log(`[Memory Optimizer] After GC: ${newHeapUsedMB}MB (saved ${heapUsedMB - newHeapUsedMB}MB)`);
      } else {
        console.log('[Memory Optimizer] GC not available, consider running with --expose-gc flag');
      }
      
      this.clearInMemoryCaches();
    }
  }

  private clearInMemoryCaches() {
    // Clear any in-memory caches that might be holding references
    try {
      // Clear require cache for development (not recommended for production)
      if (process.env.NODE_ENV === 'development') {
        const moduleKeys = Object.keys(require.cache);
        let cleared = 0;
        
        moduleKeys.forEach(key => {
          // Only clear non-core modules
          if (!key.includes('node_modules') && key.includes('.ts')) {
            delete require.cache[key];
            cleared++;
          }
        });
        
        if (cleared > 0) {
          console.log(`[Memory Optimizer] Cleared ${cleared} modules from require cache`);
        }
      }
    } catch (error) {
      console.error('[Memory Optimizer] Error clearing caches:', error);
    }
  }

  getMemoryStats() {
    const memUsage = process.memoryUsage();
    return {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      isOptimizing: this.isActive,
      threshold: this.memoryThreshold
    };
  }

  setThreshold(thresholdMB: number) {
    this.memoryThreshold = thresholdMB;
    console.log(`[Memory Optimizer] Memory threshold set to ${thresholdMB}MB`);
  }
}

export const memoryOptimizer = MemoryOptimizer.getInstance();