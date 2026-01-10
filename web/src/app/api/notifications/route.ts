import { NextRequest, NextResponse } from 'next/server';

// Types for push notifications
interface NotificationPreferences {
  userId: string;
  preferences: {
    buildComplete: boolean;
    prReview: boolean;
    agentBlocked: boolean;
    agentCompleted: boolean;
    deploySuccess: boolean;
    deployFailed: boolean;
    securityAlert: boolean;
    teamMention: boolean;
  };
  channels: {
    push: boolean;
    email: boolean;
    slack: boolean;
  };
}

interface PushSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: string;
  userAgent?: string;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

// Mock storage (in production, use database)
const subscriptions: Map<string, PushSubscription> = new Map();
const userPreferences: Map<string, NotificationPreferences> = new Map();

// Default preferences
const defaultPreferences: NotificationPreferences['preferences'] = {
  buildComplete: true,
  prReview: true,
  agentBlocked: true,
  agentCompleted: true,
  deploySuccess: true,
  deployFailed: true,
  securityAlert: true,
  teamMention: true,
};

// GET: Get user's notification preferences
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const view = searchParams.get('view');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  // Get subscription status
  if (view === 'subscription') {
    const subscription = subscriptions.get(userId);
    return NextResponse.json({
      subscribed: !!subscription,
      subscription: subscription ? {
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        createdAt: subscription.createdAt,
      } : null,
    });
  }

  // Get preferences
  const prefs = userPreferences.get(userId) || {
    userId,
    preferences: defaultPreferences,
    channels: { push: true, email: false, slack: false },
  };

  return NextResponse.json(prefs);
}

// POST: Subscribe to push notifications or update preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, subscription, preferences, channels } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Subscribe to push notifications
    if (action === 'subscribe') {
      if (!subscription?.endpoint || !subscription?.keys) {
        return NextResponse.json(
          { error: 'Valid push subscription required' },
          { status: 400 }
        );
      }

      const pushSub: PushSubscription = {
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        createdAt: new Date().toISOString(),
        userAgent: body.userAgent,
      };

      subscriptions.set(userId, pushSub);

      console.log('[Push Subscription]', {
        userId,
        endpoint: subscription.endpoint.substring(0, 50) + '...',
      });

      // Send welcome notification
      const welcomePayload: NotificationPayload = {
        title: '🎉 Notifications Enabled',
        body: 'You will now receive push notifications from PrismCode',
        icon: '/icons/icon-192x192.png',
        url: '/settings',
      };

      // In production, use web-push library to send notification
      console.log('[Send Welcome Notification]', welcomePayload);

      return NextResponse.json({
        success: true,
        message: 'Push notifications enabled',
      }, { status: 201 });
    }

    // Unsubscribe from push notifications
    if (action === 'unsubscribe') {
      subscriptions.delete(userId);
      
      console.log('[Push Unsubscribe]', { userId });

      return NextResponse.json({
        success: true,
        message: 'Push notifications disabled',
      });
    }

    // Update preferences
    if (action === 'update_preferences') {
      const currentPrefs = userPreferences.get(userId) || {
        userId,
        preferences: defaultPreferences,
        channels: { push: true, email: false, slack: false },
      };

      const updatedPrefs: NotificationPreferences = {
        ...currentPrefs,
        preferences: { ...currentPrefs.preferences, ...preferences },
        channels: { ...currentPrefs.channels, ...channels },
      };

      userPreferences.set(userId, updatedPrefs);

      console.log('[Preferences Updated]', { userId, preferences: updatedPrefs });

      return NextResponse.json({
        success: true,
        preferences: updatedPrefs,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[Notifications Error]', error);
    return NextResponse.json(
      { error: 'Failed to process notification request' },
      { status: 500 }
    );
  }
}

// PUT: Send push notification to user(s)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds, type, payload } = body;

    if (!userIds || !Array.isArray(userIds) || !type || !payload) {
      return NextResponse.json(
        { error: 'userIds (array), type, and payload required' },
        { status: 400 }
      );
    }

    const results: { userId: string; sent: boolean; reason?: string }[] = [];

    for (const userId of userIds) {
      const subscription = subscriptions.get(userId);
      const prefs = userPreferences.get(userId);

      // Check if user has subscription
      if (!subscription) {
        results.push({ userId, sent: false, reason: 'No subscription' });
        continue;
      }

      // Check if user has enabled this notification type
      if (prefs && !prefs.preferences[type as keyof NotificationPreferences['preferences']]) {
        results.push({ userId, sent: false, reason: 'Notification type disabled' });
        continue;
      }

      // In production, use web-push library:
      // await webpush.sendNotification(subscription, JSON.stringify(payload));
      
      console.log('[Send Push]', {
        userId,
        type,
        title: payload.title,
      });

      results.push({ userId, sent: true });
    }

    const sentCount = results.filter(r => r.sent).length;

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: results.length - sentCount,
      results,
    });

  } catch (error) {
    console.error('[Send Notification Error]', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
