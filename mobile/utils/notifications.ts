import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_TOKEN_KEY = '@loksuraksha:notification_token';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  let token: string | null = null;

  try {
    // Check if we already have a token
    const storedToken = await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
    if (storedToken) {
      return storedToken;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    // Get the token
    if (Constants.isDevice) {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      token = tokenData.data;

      // Store token
      await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);

      // Register token with backend
      await registerTokenWithBackend(token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    // Configure Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

async function registerTokenWithBackend(token: string) {
  try {
    const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
    const authToken = await AsyncStorage.getItem('auth_token');

    await fetch(`${apiBaseUrl}/api/auth/register-push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.error('Error registering token with backend:', error);
  }
}

export async function getNotificationToken(): Promise<string | null> {
  return await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
}

export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(listener);
}

export function addNotificationResponseReceivedListener(
  listener: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Show immediately
  });
}

