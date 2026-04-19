/**
 * Default backend URL — used on first launch.
 *
 * On a phone using Expo Go over a hotspot/LAN, the URL MUST be reachable
 * from the phone. Put your PC's LAN IPv4 address (e.g. 192.168.43.12) here,
 * or set it from the Settings sheet inside the app.
 *
 * You can also override at start time:
 *     set EXPO_PUBLIC_API_URL=http://192.168.43.12:8000
 *     npx expo start
 */
export const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.35.30.172:8000";
