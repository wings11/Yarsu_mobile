import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api, getAuthToken, API_BASE_URL } from '@/libs/api';
import { storeItem, getItem } from '@/utils/storage';

/**
 * Professionally register for native push notifications and send the token to backend.
 * - Uses expo-notifications to obtain a token.
 * - Sends token to backend `POST /api/noti/register` (expects { token, platform }).
 * - Stores token locally.
 */
export default function usePushRegistration() {
  useEffect(() => {
    let subscription: any;

    async function register() {
      try {
        if (!Device.isDevice) {
          // Allow Android emulators to proceed — many Google Play AVDs support FCM.
          if (Platform.OS !== 'android') {
            console.warn('push - Not a physical device; emulator may not support FCM.');
            return;
          }
          console.warn('push - Running on an Android emulator; attempting registration.');
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.warn('push - Permission not granted for notifications.');
          return;
        }

        const tokenResponse = await Notifications.getDevicePushTokenAsync();
        const token = tokenResponse.data;
        // try to capture a device identifier when available
        let deviceId = null;
        try {
          deviceId = Device.osBuildId || Device.modelId || null;
        } catch {}
        // fallback: use persisted deviceId or generate a stable identifier
        try {
          if (!deviceId) {
            const existing = await getItem('deviceId');
            if (existing) {
              deviceId = existing;
            } else {
              try {
                const Application = await import('expo-application');
                const androidId = Application?.getAndroidId?.();
                if (androidId) deviceId = androidId;
              } catch {
                // ignore
              }
              // final fallback: generate a pseudo-random id and persist it
              if (!deviceId) {
                const generated = `install-${Math.random().toString(36).slice(2, 10)}`;
                deviceId = generated;
              }
                // persist deviceId locally so unregister can use it even if registration is skipped
                try {
                  if (deviceId) await storeItem('deviceId', deviceId);
                } catch {
                  // ignore
                }
            }
          }
        } catch {
          // ignore
        }
        console.log('push - Obtained device push token:', token);

        // store locally
        await storeItem('pushToken', token);

        // send to backend
        try {
          // Only register with backend if API base URL is configured and we have an auth token
          const authToken = await getAuthToken();
          if (!API_BASE_URL) {
            console.warn('push - API_BASE_URL not configured; skipping backend registration');
          } else if (!authToken) {
            console.log('push - No auth token available; skipping backend registration until signed in');
          } else {
            console.log('push - Sending token to backend at', `${API_BASE_URL}/noti/push/register`);
            await api.post('/noti/push/register', { token, platform: Platform.OS, deviceId });
            console.log('push - Registered token with backend');
            // persist deviceId locally for unregister
            if (deviceId) await storeItem('deviceId', deviceId);
          }
        } catch (err: any) {
          console.error('push - Failed to register token with backend:', err?.response?.status, err?.response?.data || err?.message || err);
        }

        // foreground notification handler (optional)
        subscription = Notifications.addNotificationReceivedListener(notification => {
          console.log('push - Notification received (foreground):', notification);
        });
      } catch (err) {
        console.error('push - Error during registration:', err);
      }
    }

    register();

    return () => {
      if (subscription && subscription.remove) subscription.remove();
    };
  }, []);
}
