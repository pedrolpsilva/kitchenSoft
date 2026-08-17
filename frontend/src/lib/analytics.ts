import { getAnalytics, isSupported, logEvent, setUserProperties, type Analytics } from 'firebase/analytics';
import { app } from './firebase';

let analyticsPromise: Promise<Analytics | null> | null = null;

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => (supported ? getAnalytics(app) : null))
      .catch((err) => {
        console.warn('[Analytics] Firebase Analytics is not supported in this environment:', err);
        return null;
      });
  }
  return analyticsPromise;
}

export async function trackEvent(eventName: string, params?: Record<string, any>) {
  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
  } catch (err) {
    console.warn('[Analytics] Error logging event:', eventName, err);
  }
}

export async function trackButtonClick(
  buttonLabel: string,
  context: string,
  extraParams?: Record<string, any>
) {
  await trackEvent('button_click', {
    button_name: buttonLabel,
    context,
    timestamp: new Date().toISOString(),
    ...extraParams,
  });
}

export async function trackUserLoginLocation(username: string) {
  if (typeof window === 'undefined') return;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Desconhecido';
  const language = navigator.language || 'Desconhecido';
  const screenRes = `${window.screen.width}x${window.screen.height}`;
  const userAgent = navigator.userAgent;

  let geoData = {
    ip: 'Desconhecido',
    city: 'Desconhecida',
    region: 'Desconhecida',
    country: 'Desconhecido',
  };

  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        geoData = {
          ip: data.ip || 'Desconhecido',
          city: data.city || 'Desconhecida',
          region: data.region || 'Desconhecida',
          country: data.country || 'Desconhecido',
        };
      }
    }
  } catch {
  }

  const locationParams = {
    username,
    timezone,
    language,
    screen_resolution: screenRes,
    user_agent: userAgent,
    ip: geoData.ip,
    city: geoData.city,
    region: geoData.region,
    country: geoData.country,
    location_summary: `${geoData.city}, ${geoData.region}, ${geoData.country} (IP: ${geoData.ip})`,
    logged_at: new Date().toISOString(),
  };

  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      setUserProperties(analytics, {
        user_timezone: timezone,
        user_language: language,
        user_ip: geoData.ip,
        user_location: `${geoData.city}, ${geoData.country}`,
      });
      logEvent(analytics, 'user_login_location', locationParams);
    }
  } catch (err) {
    console.warn('[Analytics] Error tracking login location:', err);
  }
}
