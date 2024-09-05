import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import type { ResourceError, ResourceName, ResourcePayload } from './resources';
import type { Params as ApiFetchParams } from './useApiFetch';
import useApiFetch from './useApiFetch';

export interface Params<R extends ResourceName, E = unknown, D = ResourcePayload<R>> extends ApiFetchParams<R> {
  queryOptions?: Omit<UseQueryOptions<ResourcePayload<R>, ResourceError<E>, D>, 'queryKey' | 'queryFn'>;
}

export function getResourceKey<R extends ResourceName>(resource: R, { pathParams, queryParams }: Params<R> = {}) {
  if (pathParams || queryParams) {
    return [ resource, { ...pathParams, ...queryParams } ];
  }

  return [ resource ];
}

export default function useApiQuery<R extends ResourceName, E = unknown, D = ResourcePayload<R>>(
  resource: R,
  { queryOptions, pathParams, queryParams, fetchParams }: Params<R, E, D> = {},
) {

  const apiFetch = useApiFetch();

  return useQuery<ResourcePayload<R>, ResourceError<E>, D>({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: getResourceKey(resource, { pathParams, queryParams }),
    queryFn: async() => {
      // all errors and error typing is handled by react-query
      // so error response will never go to the data
      // that's why we are safe here to do type conversion "as Promise<ResourcePayload<R>>"
      return apiFetch(resource, { pathParams, queryParams, fetchParams }) as Promise<ResourcePayload<R>>;
    },
    enabled: queryOptions?.enabled !== false,
    ...queryOptions,
  });
}
