import isBrowser from 'lib/isBrowser';

jest.mock('lib/isBrowser');

describe('app config baseUrl', () => {
  // eslint-disable-next-line no-restricted-properties
  const originalEnv = process.env;
  const mockWindowLocation = {
    origin: 'http://localhost:3000',
  };

  beforeEach(() => {
    jest.resetModules();
    // eslint-disable-next-line no-restricted-properties
    process.env = { ...originalEnv };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: mockWindowLocation,
    });
  });

  afterEach(() => {
    // eslint-disable-next-line no-restricted-properties
    process.env = originalEnv;
  });

  describe('when NEXT_PUBLIC_APP_HOST is empty string', () => {
    it('should use window.location.origin in browser environment', () => {
      (isBrowser as jest.Mock).mockReturnValue(true);
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_HOST = '';
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_PORT = '';
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_PROTOCOL = '';

      const app = require('./app').default;
      expect(app.baseUrl).toBe('http://localhost:3000');
    });

    it('should use localhost in server environment', () => {
      (isBrowser as jest.Mock).mockReturnValue(false);
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_HOST = '';
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_PORT = '';
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_PROTOCOL = '';

      const app = require('./app').default;
      expect(app.baseUrl).toBe('http://localhost:3000');
    });
  });

  describe('when NEXT_PUBLIC_APP_HOST is whitespace only', () => {
    it('should treat as empty and use window.location.origin in browser', () => {
      (isBrowser as jest.Mock).mockReturnValue(true);
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_HOST = '   ';
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_PORT = '';
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_PROTOCOL = '';

      const app = require('./app').default;
      expect(app.baseUrl).toBe('http://localhost:3000');
    });
  });

  describe('when NEXT_PUBLIC_APP_HOST is undefined', () => {
    it('should use window.location.origin in browser environment', () => {
      (isBrowser as jest.Mock).mockReturnValue(true);
      // eslint-disable-next-line no-restricted-properties
      delete process.env.NEXT_PUBLIC_APP_HOST;
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_PORT = '';
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_PROTOCOL = '';

      const app = require('./app').default;
      expect(app.baseUrl).toBe('http://localhost:3000');
    });
  });

  describe('when NEXT_PUBLIC_APP_HOST has a valid value', () => {
    it('should use the provided host', () => {
      (isBrowser as jest.Mock).mockReturnValue(true);
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_HOST = 'example.com';
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_PORT = '';
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_PROTOCOL = 'https';

      const app = require('./app').default;
      expect(app.baseUrl).toBe('https://example.com');
    });

    it('should include port when provided', () => {
      (isBrowser as jest.Mock).mockReturnValue(true);
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_HOST = 'example.com';
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_PORT = '8080';
      // eslint-disable-next-line no-restricted-properties
      process.env.NEXT_PUBLIC_APP_PROTOCOL = 'https';

      const app = require('./app').default;
      expect(app.baseUrl).toBe('https://example.com:8080');
    });
  });
});
