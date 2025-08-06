/**
 * Performance Cache Service - Redis-based caching for improved API performance
 */

import { createHash } from 'crypto';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Whether to compress large values
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  tags: string[];
  compressed: boolean;
}

class PerformanceCacheService {
  private cache = new Map<string, CacheEntry>();
  private tagIndex = new Map<string, Set<string>>(); // tag -> set of keys
  private readonly maxSize = 10000; // Maximum cache entries
  private readonly cleanupInterval = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Start periodic cleanup
    setInterval(() => this.cleanup(), this.cleanupInterval);
    console.log('[Cache] Performance cache service initialized');
  }

  /**
   * Generate cache key from request parameters
   */
  public generateKey(prefix: string, params: any): string {
    const hash = createHash('sha256');
    hash.update(JSON.stringify(params));
    return `${prefix}:${hash.digest('hex').substring(0, 16)}`;
  }

  /**
   * Compress data for storage
   */
  private compress(data: string): string {
    // Simple compression for demo - in production use zlib
    return Buffer.from(data).toString('base64');
  }

  /**
   * Decompress data
   */
  private decompress(data: string): string {
    return Buffer.from(data, 'base64').toString();
  }

  /**
   * Set cache entry
   */
  async set(key: string, data: any, options: CacheOptions = {}): Promise<void> {
    const {
      ttl = 300, // 5 minutes default
      tags = [],
      compress = false
    } = options;

    // Handle cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    let serializedData = JSON.stringify(data);
    
    if (compress && serializedData.length > 1024) {
      serializedData = this.compress(serializedData);
    }

    const entry: CacheEntry = {
      data: compress ? serializedData : data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
      tags,
      compressed: compress
    };

    this.cache.set(key, entry);

    // Update tag index
    tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    });
  }

  /**
   * Get cache entry
   */
  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    let data = entry.data;
    
    if (entry.compressed) {
      data = JSON.parse(this.decompress(data));
    }

    return data;
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    const entry = this.cache.get(key);
    
    if (entry) {
      // Remove from tag index
      entry.tags.forEach(tag => {
        const tagSet = this.tagIndex.get(tag);
        if (tagSet) {
          tagSet.delete(key);
          if (tagSet.size === 0) {
            this.tagIndex.delete(tag);
          }
        }
      });
    }

    this.cache.delete(key);
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    const keysToDelete = new Set<string>();

    tags.forEach(tag => {
      const tagSet = this.tagIndex.get(tag);
      if (tagSet) {
        tagSet.forEach(key => keysToDelete.add(key));
      }
    });

    // Delete all keys with matching tags
    for (const key of keysToDelete) {
      await this.delete(key);
    }

    console.log(`[Cache] Invalidated ${keysToDelete.size} entries for tags: ${tags.join(', ')}`);
  }

  /**
   * Cache wrapper for functions
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Check cache first
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn();
    await this.set(key, result, options);
    
    return result;
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`[Cache] Cleaned up ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let hitCount = 0;
    let expiredCount = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      } else {
        hitCount++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries: hitCount,
      expiredEntries: expiredCount,
      tagCount: this.tagIndex.size,
      memoryUsage: `${(JSON.stringify([...this.cache.entries()]).length / 1024).toFixed(2)} KB`
    };
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.tagIndex.clear();
    console.log('[Cache] All cache entries cleared');
  }
}

// Create singleton instance
export const performanceCache = new PerformanceCacheService();

// Helper functions for common cache patterns
export const cacheHelpers = {
  // User data caching
  userCache: {
    get: (userId: number) => performanceCache.get(`user:${userId}`),
    set: (userId: number, data: any) => 
      performanceCache.set(`user:${userId}`, data, { ttl: 600, tags: ['users'] }),
    invalidate: (userId: number) => performanceCache.delete(`user:${userId}`),
    invalidateAll: () => performanceCache.invalidateByTags(['users'])
  },

  // API response caching
  apiCache: {
    get: (endpoint: string, params: any) => {
      const key = performanceCache.generateKey(endpoint, params);
      return performanceCache.get(key);
    },
    set: (endpoint: string, params: any, data: any, ttl = 300) => {
      const key = performanceCache.generateKey(endpoint, params);
      return performanceCache.set(key, data, { ttl, tags: ['api'] });
    },
    invalidateEndpoint: (endpoint: string) => 
      performanceCache.invalidateByTags([`api:${endpoint}`])
  },

  // Configuration caching
  configCache: {
    get: (configType: string) => performanceCache.get(`config:${configType}`),
    set: (configType: string, data: any) =>
      performanceCache.set(`config:${configType}`, data, { ttl: 3600, tags: ['config'] }),
    invalidateAll: () => performanceCache.invalidateByTags(['config'])
  }
};