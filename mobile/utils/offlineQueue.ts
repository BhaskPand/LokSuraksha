import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateIssueRequest } from '@citizen-safety/shared';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = '@citizen_safety:offline_queue';

export interface QueuedIssue extends CreateIssueRequest {
  id: string;
  timestamp: number;
}

export async function queueIssue(issue: CreateIssueRequest): Promise<string> {
  const queuedIssue: QueuedIssue = {
    ...issue,
    id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };

  const queue = await getQueuedIssues();
  queue.push(queuedIssue);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

  return queuedIssue.id;
}

export async function getQueuedIssues(): Promise<QueuedIssue[]> {
  try {
    const data = await AsyncStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading queue:', error);
    return [];
  }
}

export async function removeQueuedIssue(id: string): Promise<void> {
  const queue = await getQueuedIssues();
  const filtered = queue.filter((item) => item.id !== id);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}

