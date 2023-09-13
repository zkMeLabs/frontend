import app from './app';
import { getEnvValue } from './utils';

const defaultImageUrl = app.baseUrl + '/static/og_placeholder.png';

const opengraph = Object.freeze({
  promoteBlockscout: getEnvValue(process.env.NEXT_PUBLIC_OG_PROMOTE_BLOCKSCOUT),
  description: getEnvValue(process.env.NEXT_PUBLIC_OG_DESCRIPTION) || '',
  ogImageUrl: getEnvValue(process.env.NEXT_PUBLIC_OG_IMAGE_URL) || defaultImageUrl,
});

export default opengraph;
