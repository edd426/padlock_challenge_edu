/**
 * Azure Table Storage client wrapper
 * Handles operations for storing and retrieving challenge configurations
 */

import { TableClient } from '@azure/data-tables';
import type { Challenge } from './types';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const tableName = 'challenges';

if (!connectionString) {
  console.warn('AZURE_STORAGE_CONNECTION_STRING not set. API will use in-memory storage.');
}

let tableClient: TableClient | null = null;

function getTableClient(): TableClient {
  if (!tableClient && connectionString) {
    tableClient = TableClient.fromConnectionString(connectionString, tableName);
  }

  if (!tableClient) {
    throw new Error('Azure Table Storage not configured. Set AZURE_STORAGE_CONNECTION_STRING environment variable.');
  }

  return tableClient;
}

/**
 * Get the active challenge configuration from Azure Table Storage
 * Returns null if no challenge is found or if Azure is not configured
 */
export async function getActiveChallenge(): Promise<Challenge | null> {
  try {
    if (!connectionString) {
      console.warn('Using in-memory storage (Azure not configured)');
      return null;
    }

    const client = getTableClient();
    const entity = await client.getEntity('active', 'current');

    // Entity is stored with locks as a JSON string
    const challenge: Challenge = {
      locks: JSON.parse(entity.locks as string),
      lastUpdated: entity.timestamp?.toString()
    };

    return challenge;
  } catch (error: any) {
    // 404 means no challenge exists yet, which is fine
    if (error.code === 'ResourceNotFound' || error.statusCode === 404) {
      console.log('No active challenge found in storage');
      return null;
    }

    console.error('Error retrieving active challenge:', error);
    throw error;
  }
}

/**
 * Save the challenge configuration to Azure Table Storage
 * Overwrites the current 'active' challenge
 */
export async function saveActiveChallenge(challenge: Challenge): Promise<void> {
  try {
    if (!connectionString) {
      throw new Error('Azure Table Storage not configured');
    }

    const client = getTableClient();

    // Upsert creates or updates the entity
    await client.upsertEntity({
      partitionKey: 'active',
      rowKey: 'current',
      locks: JSON.stringify(challenge.locks),
      timestamp: new Date().toISOString()
    });

    console.log('Challenge saved successfully');
  } catch (error) {
    console.error('Error saving challenge to Azure:', error);
    throw error;
  }
}

/**
 * Health check - verify Azure Table Storage connection
 */
export async function checkAzureConnection(): Promise<boolean> {
  try {
    if (!connectionString) {
      return false;
    }

    const client = getTableClient();
    // Just try to access the properties
    await client.getProperties();
    return true;
  } catch (error) {
    console.error('Azure connection check failed:', error);
    return false;
  }
}
