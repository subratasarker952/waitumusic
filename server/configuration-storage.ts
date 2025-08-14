/**
 * Configuration Storage Layer - Real Database Persistence
 * Handles all configuration CRUD operations with full audit trail
 */

import { db } from './db';
import { adminConfigurations, configurationHistory, configurationDelegations } from '@shared/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { AdminConfigType, DEFAULT_ADMIN_CONFIG } from '@shared/admin-config';

export class ConfigurationStorage {
  private static instance: ConfigurationStorage;
  private configCache: Map<string, AdminConfigType> = new Map();

  public static getInstance(): ConfigurationStorage {
    if (!ConfigurationStorage.instance) {
      ConfigurationStorage.instance = new ConfigurationStorage();
    }
    return ConfigurationStorage.instance;
  }

  /**
   * Get current platform configuration with caching
   */
  async getPlatformConfiguration(): Promise<AdminConfigType> {
    try {
      // Check cache first
      const cached = this.configCache.get('platform_config');
      if (cached) {
        return cached;
      }

      // Fetch from database
      const [dbConfig] = await db
        .select()
        .from(adminConfigurations)
        .where(eq(adminConfigurations.configurationKey, 'platform_config'))
        .orderBy(desc(adminConfigurations.updatedAt))
        .limit(1);

      if (dbConfig && dbConfig.configurationData) {
        const config = dbConfig.configurationData as AdminConfigType;
        this.configCache.set('platform_config', config);
        return config;
      }

      // Return default and create initial record
      await this.createInitialConfiguration();
      return DEFAULT_ADMIN_CONFIG;
    } catch (error) {
      console.error('Error fetching platform configuration:', error);
      return DEFAULT_ADMIN_CONFIG;
    }
  }

  /**
   * Update platform configuration with full audit trail
   */
  async updatePlatformConfiguration(
    newConfig: Partial<AdminConfigType>,
    userId: number,
    changeDescription?: string
  ): Promise<boolean> {
    try {
      const currentConfig = await this.getPlatformConfiguration();
      const mergedConfig = { ...currentConfig, ...newConfig };

      // Start transaction
      const result = await db.transaction(async (tx) => {
        // Update main configuration
        const [updatedConfig] = await tx
          .insert(adminConfigurations)
          .values({
            configurationKey: 'platform_config',
            configurationData: mergedConfig,
            lastModifiedBy: userId,
            version: 1,
          })
          .onConflictDoUpdate({
            target: adminConfigurations.configurationKey,
            set: {
              configurationData: mergedConfig,
              lastModifiedBy: userId,
              version: sql`version + 1`,
              updatedAt: new Date(),
            },
          })
          .returning();

        // Create audit trail
        await tx.insert(configurationHistory).values({
          configurationId: updatedConfig.id,
          changeType: 'update',
          previousData: currentConfig,
          newData: mergedConfig,
          changedBy: userId,
          changeDescription: changeDescription || 'Configuration updated via dashboard',
        });

        return updatedConfig;
      });

      // Update cache
      this.configCache.set('platform_config', mergedConfig);
      
      return !!result;
    } catch (error) {
      console.error('Error updating platform configuration:', error);
      return false;
    }
  }

  /**
   * Get configuration change history
   */
  async getConfigurationHistory(limit: number = 50) {
    try {
      return await db
        .select()
        .from(configurationHistory)
        .orderBy(desc(configurationHistory.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error fetching configuration history:', error);
      return [];
    }
  }

  /**
   * Create delegation for configuration aspects
   */
  async createConfigurationDelegation(
    delegatedBy: number,
    delegatedTo: number,
    configurationAspects: string[],
    permissions: { read: boolean; write: boolean; admin: boolean },
    expiresAt?: Date
  ): Promise<boolean> {
    try {
      await db.insert(configurationDelegations).values({
        delegatedBy,
        delegatedTo,
        configurationAspects,
        permissions,
        expiresAt,
      });
      return true;
    } catch (error) {
      console.error('Error creating configuration delegation:', error);
      return false;
    }
  }

  /**
   * Get user's delegated configuration aspects
   */
  async getUserDelegatedAspects(userId: number): Promise<string[]> {
    try {
      const delegations = await db
        .select()
        .from(configurationDelegations)
        .where(eq(configurationDelegations.delegatedTo, userId));

      const aspects: string[] = [];
      for (const delegation of delegations) {
        if (delegation.configurationAspects) {
          aspects.push(...(delegation.configurationAspects as string[]));
        }
      }
      return aspects;
    } catch (error) {
      console.error('Error fetching user delegated aspects:', error);
      return [];
    }
  }

  /**
   * Create initial configuration record
   */
  private async createInitialConfiguration(): Promise<void> {
    try {
      await db.insert(adminConfigurations).values({
        configurationKey: 'platform_config',
        configurationData: DEFAULT_ADMIN_CONFIG,
        lastModifiedBy: 1, // System user
      });
    } catch (error) {
      console.error('Error creating initial configuration:', error);
    }
  }

  /**
   * Clear configuration cache
   */
  clearCache(): void {
    this.configCache.clear();
  }
}

export const configurationStorage = ConfigurationStorage.getInstance();