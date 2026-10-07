import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { profileApi } from '../api/api.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const subscribe = async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported by your browser');
      return;
    }

    try {
      setLoading(true);
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission was denied');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.warn('VITE_VAPID_PUBLIC_KEY is not defined in frontend env.');
      }

      const options = {
        userVisibleOnly: true,
        ...(vapidPublicKey && {
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }),
      };

      const newSub = await registration.pushManager.subscribe(options);
      await profileApi.pushSubscribe(newSub.toJSON());

      setSubscription(newSub);
      toast.success('Push notifications enabled!');
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
      toast.error('Failed to enable push notifications');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return;

    try {
      setLoading(true);
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await profileApi.pushUnsubscribe(endpoint);
      setSubscription(null);
      toast.success('Push notifications disabled');
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
      toast.error('Failed to disable push notifications');
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed: !!subscription,
    loading,
    subscribe,
    unsubscribe,
  };
}
