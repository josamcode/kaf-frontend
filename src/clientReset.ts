const RESET_ENABLED = process.env.REACT_APP_FORCE_CLIENT_RESET === "true";
const RESET_VERSION = process.env.REACT_APP_FORCE_CLIENT_RESET_VERSION || "1";
const RESET_SESSION_KEY = `kaf.client-reset.${RESET_VERSION}`;

function clearCookies(): void {
  const cookies = document.cookie ? document.cookie.split(";") : [];
  const hostname = window.location.hostname;
  const domains = [hostname, `.${hostname}`];

  cookies.forEach((cookieEntry) => {
    const cookieName = cookieEntry.split("=")[0]?.trim();
    if (!cookieName) {
      return;
    }

    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    domains.forEach((domain) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    });
  });
}

async function clearServiceWorkersAndCaches(): Promise<void> {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  }
}

export async function forceClientResetIfEnabled(): Promise<boolean> {
  if (!RESET_ENABLED) {
    return false;
  }

  if (sessionStorage.getItem(RESET_SESSION_KEY) === "done") {
    return false;
  }

  sessionStorage.setItem(RESET_SESSION_KEY, "done");

  try {
    await clearServiceWorkersAndCaches();
  } catch (error) {
    console.error("Client reset cache cleanup failed:", error);
  }

  try {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem(RESET_SESSION_KEY, "done");
    clearCookies();
  } catch (error) {
    console.error("Client reset storage cleanup failed:", error);
  }

  window.location.reload();
  return true;
}
