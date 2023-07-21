function isLoaded() {
  if (typeof window.ga?.getAll === 'function') {
    // eslint-disable-next-line no-console
    console.log('loaded');
    return true;
  } else {
    // eslint-disable-next-line no-console
    console.log('not loaded');
    setTimeout(isLoaded, 500);
  }
}

export default async function getGoogleAnalyticsClientId() {
  await isLoaded();
  return window.ga?.getAll()[0].get('clientId');
}
