import { ApolloClient, InMemoryCache } from '@apollo/client';

import { getEnvValue } from 'configs/app/utils';
import isBrowser from 'lib/isBrowser';

const storageApiHost = getEnvValue('NEXT_PUBLIC_STORAGE_API_HOST');
const uri = (() => {
  const trimmedHost = storageApiHost?.trim();
  if (trimmedHost) {
    return trimmedHost;
  }
  if (isBrowser()) {
    return window.location.origin + '/callisto/graphql';
  }
  return 'http://callisto-graphql:8080/v1/graphql';
})();

const client = new ApolloClient({
  uri: uri,
  cache: new InMemoryCache(),
});

export default client;
