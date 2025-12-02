import isBrowser from 'lib/isBrowser';

import { getEnvValue } from './utils';

const appPort = getEnvValue('NEXT_PUBLIC_APP_PORT');
const appSchema = getEnvValue('NEXT_PUBLIC_APP_PROTOCOL');
const appHost = getEnvValue('NEXT_PUBLIC_APP_HOST');
const baseUrl = (() => {
  const trimmedHost = appHost?.trim();
  if (trimmedHost) {
    return [
      appSchema || 'https',
      '://',
      trimmedHost,
      appPort && ':' + appPort,
    ].filter(Boolean).join('');
  }
  if (isBrowser()) {
    return window.location.origin;
  }
  return (appSchema || 'http') + '://localhost' + (appPort ? ':' + appPort : ':3000');
})();
const isDev = getEnvValue('NEXT_PUBLIC_APP_ENV') === 'development';
const isProduction = getEnvValue('NEXT_PUBLIC_APP_ENV') === 'production';
const spriteHash = getEnvValue('NEXT_PUBLIC_ICON_SPRITE_HASH');

const app = Object.freeze({
  isProduction,
  isDev,
  protocol: appSchema,
  host: appHost,
  port: appPort,
  baseUrl,
  useProxy: getEnvValue('NEXT_PUBLIC_USE_NEXT_JS_PROXY') === 'true',
  spriteHash,
});

export default app;
