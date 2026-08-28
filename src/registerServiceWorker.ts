/**
 * PWA Service Worker Registration & Install Prompt Management
 */

export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ ConnectHub ServiceWorker registered: ', registration.scope);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('🔄 New ConnectHub content is available; please refresh.');
                } else {
                  console.log('⚡ Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('ConnectHub ServiceWorker registration failed: ', error);
        });
    });
  }
}

let deferredPrompt: any = null;

export function initPwaInstallPrompt(onPromptReady: () => void) {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
    onPromptReady();
  });
}

export async function promptPwaInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const choiceResult = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return choiceResult.outcome === 'accepted';
}
