// import Base64 from 'crypto-js/enc-base64';
// import sha256 from 'crypto-js/sha256';
import type CspDev from 'csp-dev';

// import { connectAdbutler, placeAd } from 'ui/shared/ad/adbutlerScript';
// import { hypeInit } from 'ui/shared/ad/hypeBannerScript';

export function ad(): CspDev.DirectiveDescriptor {
  return {
    'connect-src': [
      // coinzilla
      'coinzilla.com',
      '*.coinzilla.com',
      'https://request-global.czilladx.com',

      // adbutler
      'servedbyadbutler.com',

      // slise
      '*.slise.xyz',

      // hype
      'api.hypelab.com',
      '*.ixncdn.com',
      '*.cloudfront.net',

      //getit
      'v1.getittech.io',
      'ipapi.co',
      'http://154.48.244.46:9090/v1/graphql',
      'http://192.168.0.97:8080',
      'https://devzk-staking.bitkinetic.com',
      'https://devint-storage.mechain.tech/v1/graphql',
      'https://testint-storage.mechain.tech/v1/graphql',
      'https://testnet-storage.mechain.tech/v1/graphql',
      'https://devnet-storage.mocachain.org/v1/graphql',
      'https://testnet-storage.mocachain.org/v1/graphql',
      'https://devzk-credential.bitkinetic.com',
      'https://testzk-credential.bitkinetic.com',
    ],
    'frame-src': [
      // coinzilla
      'https://request-global.czilladx.com',
    ],
    'script-src': [
      '\'unsafe-eval\'',
      // coinzilla
      'coinzillatag.com',

      // adbutler
      'servedbyadbutler.com',
      // `'sha256-${ Base64.stringify(sha256(connectAdbutler)) }'`,
      // `'sha256-${ Base64.stringify(sha256(placeAd(undefined) ?? '')) }'`,
      // `'sha256-${ Base64.stringify(sha256(placeAd('mobile') ?? '')) }'`,

      // slise
      '*.slise.xyz',

      //hype
      // `'sha256-${ Base64.stringify(sha256(hypeInit ?? '')) }'`,
      'https://api.hypelab.com',
      'd1q98dzwj6s2rb.cloudfront.net',
    ],
    'img-src': [
      // coinzilla
      'cdn.coinzilla.io',

      // adbutler
      'servedbyadbutler.com',
    ],
    'font-src': [
      // coinzilla
      'https://request-global.czilladx.com',
    ],
  };
}
