import { authApi } from '../modules/auth/api';
import { User } from '../types';

export const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
  '698627504521-3jql59dth4c2srp7prb9mpba45biom5c.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: any;
  }
}

/**
 * Trigger Real Google Sign-In with Account Selection Popup
 * using official Google Identity Services (GSI).
 */
export function triggerRealGoogleLogin(): Promise<User> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window is not defined'));
    }

    const clientId = GOOGLE_CLIENT_ID;

    // Check if Google Identity Services script is available
    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          prompt: 'select_account',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              return reject(new Error(tokenResponse.error_description || tokenResponse.error));
            }
            if (tokenResponse?.access_token) {
              try {
                const res = await authApi.googleLogin(tokenResponse.access_token);
                if (res?.user) {
                  return resolve(res.user);
                }
                return reject(new Error('No user profile returned from server'));
              } catch (err) {
                return reject(err);
              }
            }
            return reject(new Error('No access token received from Google'));
          },
        });

        // Open Real Google Account Chooser popup
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('Google GSI initTokenClient notice, falling back to OAuth popup:', e);
      }
    }

    // Fallback: Standard Google OAuth2 Popup with prompt=select_account
    const redirectUri = `${window.location.origin}`;
    const scope = encodeURIComponent('openid email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${scope}&prompt=select_account`;

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'google_oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );

    if (!popup) {
      return reject(new Error('Popup blocked. Please allow popups for Google Sign-In.'));
    }

    const pollTimer = window.setInterval(async () => {
      try {
        if (!popup || popup.closed) {
          window.clearInterval(pollTimer);
          return reject(new Error('Google Sign-In window closed.'));
        }

        const currentUrl = popup.location?.href;
        if (currentUrl && currentUrl.includes('access_token=')) {
          window.clearInterval(pollTimer);
          const hash = popup.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          popup.close();

          if (accessToken) {
            const res = await authApi.googleLogin(accessToken);
            if (res?.user) {
              return resolve(res.user);
            }
          }
          return reject(new Error('Failed to extract access token from Google.'));
        }
      } catch (_) {
        // Cross-origin access while popup is navigating on google.com is expected
      }
    }, 500);
  });
}
