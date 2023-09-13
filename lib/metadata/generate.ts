import type { ApiData, Metadata } from './types';

import type { Route } from 'nextjs-routes';

import config from 'configs/app';
import getNetworkTitle from 'lib/networks/getNetworkTitle';

import compileValue from './compileValue';
import getPageOgType from './getPageOgType';
import * as templates from './templates';

export default function generate<R extends Route>(route: R, apiData?: ApiData<R>): Metadata {
  const params = {
    ...route.query,
    ...apiData,
    network_name: config.chain.name,
    network_title: getNetworkTitle(),
  };

  const title = compileValue(templates.title.make(route.pathname), params);
  const description = compileValue(templates.description.make(route.pathname), params);

  const pageOgType = getPageOgType(route.pathname);

  return {
    title: title + ' | Blockscout',
    description,
    opengraph: {
      title: title + (config.opengraph.promoteBlockscout ? ' | Blockscout' : ''),
      description: pageOgType === 'Homepage' ? config.opengraph.description : '',
      imageUrl: pageOgType !== 'Regular page' ? config.opengraph.ogImageUrl : '',
    },
  };
}
