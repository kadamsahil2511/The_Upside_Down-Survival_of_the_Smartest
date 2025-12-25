export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

// Production URL - this is the canonical domain
const PRODUCTION_URL = 'https://theupsidedown.superuserz.com';

// Use NEXT_PUBLIC_URL if set, otherwise default to production URL
// Note: Don't use NEXT_PUBLIC_VERCEL_URL as it returns the auto-generated Vercel subdomain, not custom domains
const getAppUrl = (): string => {
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL;
  }
  return PRODUCTION_URL;
};

export const APP_URL: string = getAppUrl();
