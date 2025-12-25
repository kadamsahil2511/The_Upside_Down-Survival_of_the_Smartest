export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

// Use NEXT_PUBLIC_URL if available, otherwise use NEXT_PUBLIC_VERCEL_URL (auto-set by Vercel)
const getAppUrl = (): string => {
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  // Production fallback
  return 'https://theupsidedown.superuserz.com';
};

export const APP_URL: string = getAppUrl();
