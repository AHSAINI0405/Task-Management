import { webpush } from '../config/webpush.js';

/**
 * Send a web push notification to a single subscription object.
 * @param {{ endpoint, keys: { p256dh, auth } }} subscription
 * @param {{ title: string, body: string, url?: string }} payload
 */
export async function sendPushNotification(subscription, payload) {
  const message = JSON.stringify({
    title: payload.title,
    body:  payload.body,
    url:   payload.url ?? '/',
    icon:  '/icons/icon-192.png',
  });

  try {
    await webpush.sendNotification(subscription, message);
  } catch (err) {
    // 410 Gone = subscription expired/unsubscribed — caller should delete it
    if (err.statusCode === 410) {
      const expiredError = new Error('Subscription expired');
      expiredError.expired = true;
      expiredError.endpoint = subscription.endpoint;
      throw expiredError;
    }
    throw err;
  }
}

/**
 * Send a push notification to ALL of a user's subscriptions.
 * Automatically removes expired subscriptions from the user doc.
 * @param {import('../models/User.model.js').default} user  Mongoose User doc
 * @param {{ title: string, body: string, url?: string }} payload
 */
export async function sendPushToUser(user, payload) {
  if (!user.notifyByPush || !user.pushSubscriptions?.length) return;

  const expiredEndpoints = [];

  await Promise.allSettled(
    user.pushSubscriptions.map(async (sub) => {
      try {
        await sendPushNotification(sub.toObject(), payload);
      } catch (err) {
        if (err.expired) expiredEndpoints.push(err.endpoint);
        else console.error('[push.service] Push failed:', err.message);
      }
    }),
  );

  // Prune expired subscriptions
  if (expiredEndpoints.length) {
    user.pushSubscriptions = user.pushSubscriptions.filter(
      (s) => !expiredEndpoints.includes(s.endpoint),
    );
    await user.save();
  }
}
