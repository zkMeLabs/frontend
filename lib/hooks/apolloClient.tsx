import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

import { getEnvValue } from 'configs/app/utils';
import isBrowser from 'lib/isBrowser';

export default async function apolloClient(query: string, limit: number, offset: number) {
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
  const queryGql = gql`query Storage($limit: Int = ${ limit }, $offset: Int = ${ offset }) {${ query }}`;
  try {
    const result = await client.query({
      query: queryGql,
      variables: { limit, offset },
    });
    return result.data;
  } catch (error) {
    const result = error;
    return result;
  }
}
