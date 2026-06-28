// src/utils/OneSignalInit.ts
const ONESIGNAL_APP_ID = 'ad9d92dd-6826-4a42-91d0-b96a2aa05943';

export const initOneSignal = async () => {
  if (typeof window === 'undefined') return;

  try {
    await loadOneSignalScript();

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        notifyButton: { enable: false },
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerParam: { scope: '/' },
        serviceWorkerPath: '/OneSignalSDKWorker.js',
      });
    });
  } catch (err) {
    // Silently fail — not critical
  }
};

const loadOneSignalScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('onesignal-sdk')) { resolve(); return; }
    const script = document.createElement('script');
    script.id = 'onesignal-sdk';
    // Use v15 — more stable than v16
    script.src = 'https://cdn.onesignal.com/sdks/web/v15/OneSignalSDK.page.js';
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load OneSignal SDK'));
    document.head.appendChild(script);
  });
};

const waitForOneSignal = (timeout = 5000): Promise<any> => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const OS = (window as any).OneSignal;
      if (OS && OS.User && typeof OS.User.addTags === 'function') {
        resolve(OS);
      } else if (Date.now() - start > timeout) {
        reject(new Error('OneSignal timeout'));
      } else {
        setTimeout(check, 300);
      }
    };
    check();
  });
};

export const identifyUser = async (userId: string, email?: string, name?: string) => {
  try {
    const OneSignal = await waitForOneSignal();
    await OneSignal.User.addTags({
      supabase_user_id: userId,
      ...(email && { email }),
      ...(name && { name }),
    });
  } catch {
    // Silently fail
  }
};

export const subscribeUser = async (userId: string): Promise<string | null> => {
  try {
    const OneSignal = await waitForOneSignal();
    const permission = await OneSignal.Notifications.requestPermission();
    if (!permission) return null;
    await identifyUser(userId);
    return OneSignal.User.PushSubscription?.id || null;
  } catch {
    return null;
  }
};

export const logoutOneSignal = async () => {
  try {
    const OneSignal = await waitForOneSignal(2000);
    await OneSignal.User.addTags({ supabase_user_id: '', email: '', name: '' });
  } catch {
    // Silently fail
  }
};

export const unsubscribeUser = async (): Promise<void> => {
  try {
    const OneSignal = (window as any).OneSignal;
    if (!OneSignal) return;
    await OneSignal.User.PushSubscription.optOut();
  } catch { }
};

export const isSubscribed = async (): Promise<boolean> => {
  try {
    const OneSignal = (window as any).OneSignal;
    if (!OneSignal) return false;
    return OneSignal.User.PushSubscription.optedIn || false;
  } catch {
    return false;
  }
};
