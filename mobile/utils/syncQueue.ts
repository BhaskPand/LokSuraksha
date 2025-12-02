import { CreateIssueRequest } from '@citizen-safety/shared';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getQueuedIssues, removeQueuedIssue } from './offlineQueue';
import { isOnline } from './offlineQueue';

const getApiBaseUrl = () => {
  return Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
};

/**
 * Syncs queued issues when connection is restored
 * Call this when app comes to foreground or network state changes
 */
export async function syncQueuedIssues(): Promise<{
  success: number;
  failed: number;
}> {
  const online = await isOnline();
  if (!online) {
    return { success: 0, failed: 0 };
  }

  const queuedIssues = await getQueuedIssues();
  let success = 0;
  let failed = 0;

  for (const queuedIssue of queuedIssues) {
    try {
      // Remove the id and timestamp before sending
      const { id, timestamp, ...issueData } = queuedIssue;
      
      // Get auth token
      const token = await AsyncStorage.getItem('auth_token');
      const apiBaseUrl = getApiBaseUrl();
      
      // Submit issue using fetch
      const response = await fetch(`${apiBaseUrl}/api/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(issueData),
      });

      if (response.ok) {
        await removeQueuedIssue(id);
        success++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to sync queued issue ${queuedIssue.id}:`, error);
      failed++;
    }
  }

  return { success, failed };
}
