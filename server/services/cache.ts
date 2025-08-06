/**
 * Redis Cache Service for Auth247
 * High-performance caching for sessions, user data, and frequent queries
 */

import { createClient, RedisClientType } from 'redis';

class CacheService {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private isConnecting = false;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    if (this.isConnecting || this.isConnected) return;
    
    this.isConnecting = true;
    
    try {
      // Use Redis URL if available, otherwise fallback to memory (development)
      const redisUrl = process.env.REDIS_URL || process.env.REDIS_TLS_URL;
      
      if (redisUrl) {
        this.client = createClient({
          url: redisUrl,
          socket: {
            tls: redisUrl.includes('rediss://'),
            rejectUnauthorized: false
          }
        });

        this.client.on('error', (err) => {
          console.log('[Cache] Redis connection error, falling back to memory:', err.message);
          this.isConnected = false;
        });

        this.client.on('connect', () => {
          console.log('[Cache] Redis connected successfully');
          this.isConnected = true;
        });

        await this.client.connect();
      } else {
        console.log('[Cache] No Redis URL provided, using memory fallback');
      }
    } catch (error) {
      console.log('[Cache] Redis initialization failed, using memory fallback:', error);
    } finally {
      this.isConnecting = false;
    }
  }

  // Session caching
  async setSession(sessionId: string, sessionData: any, ttl: number = 86400): Promise<void> {
    if (!this.isConnected || !this.client) return;
    
    try {
      await this.client.setEx(`session:${sessionId}`, ttl, JSON.stringify(sessionData));
    } catch (error) {
      console.log('[Cache] Session set error:', error);
    }
  }

  async getSession(sessionId: string): Promise<any | null> {
    if (!this.isConnected || !this.client) return null;
    
    try {
      const data = await this.client.get(`session:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.log('[Cache] Session get error:', error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    
    try {
      await this.client.del(`session:${sessionId}`);
    } catch (error) {
      console.log('[Cache] Session delete error:', error);
    }
  }

  // User data caching
  async setUser(userId: string, userData: any, ttl: number = 3600): Promise<void> {
    if (!this.isConnected || !this.client) return;
    
    try {
      await this.client.setEx(`user:${userId}`, ttl, JSON.stringify(userData));
    } catch (error) {
      console.log('[Cache] User set error:', error);
    }
  }

  async getUser(userId: string): Promise<any | null> {
    if (!this.isConnected || !this.client) return null;
    
    try {
      const data = await this.client.get(`user:${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.log('[Cache] User get error:', error);
      return null;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    
    try {
      await this.client.del(`user:${userId}`);
    } catch (error) {
      console.log('[Cache] User delete error:', error);
    }
  }

  // Generic caching
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    if (!this.isConnected || !this.client) return;
    
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.log('[Cache] Set error:', error);
    }
  }

  async get(key: string): Promise<any | null> {
    if (!this.isConnected || !this.client) return null;
    
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.log('[Cache] Get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    
    try {
      await this.client.del(key);
    } catch (error) {
      console.log('[Cache] Delete error:', error);
    }
  }

  // Cache statistics
  async getStats(): Promise<any> {
    if (!this.isConnected || !this.client) {
      return { connected: false, status: 'Memory fallback active' };
    }
    
    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      
      return {
        connected: true,
        status: 'Redis active',
        memory: info,
        keyspace: keyspace
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  // Cleanup
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.disconnect();
        this.isConnected = false;
        console.log('[Cache] Redis disconnected');
      } catch (error) {
        console.log('[Cache] Disconnect error:', error);
      }
    }
  }
}

export const cacheService = new CacheService();