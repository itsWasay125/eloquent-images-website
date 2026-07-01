export function waitForIdle(timeout = 400) {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => resolve(), { timeout });
      return;
    }

    window.setTimeout(resolve, Math.min(timeout, 120));
  });
}
