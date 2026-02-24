export function disableServiceWorkerCaching(): void {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          void registration.unregister();
        });
      })
      .catch((error) => {
        console.error("Service worker cleanup failed:", error);
      });

    if ("caches" in window) {
      caches
        .keys()
        .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
        .catch((error) => {
          console.error("Cache storage cleanup failed:", error);
        });
    }
  });
}
