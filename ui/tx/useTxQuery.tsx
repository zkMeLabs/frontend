import { useBoolean } from '@chakra-ui/react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React from 'react';

import type { SocketMessage } from 'lib/socket/types';
import type { Transaction } from 'types/api/transaction';

import config from 'configs/app';
import { getEnvValue } from 'configs/app/utils';
import type { ResourceError } from 'lib/api/resources';
import useApiQuery, { getResourceKey } from 'lib/api/useApiQuery';
import { retry } from 'lib/api/useQueryClientConfig';
import { SECOND } from 'lib/consts';
import delay from 'lib/delay';
import getQueryParamString from 'lib/router/getQueryParamString';
import useSocketChannel from 'lib/socket/useSocketChannel';
import useSocketMessage from 'lib/socket/useSocketMessage';
import { TX, TX_ZKEVM_L2 } from 'stubs/tx';

const rollupFeature = config.features.rollup;

export type TxQuery = UseQueryResult<Transaction, ResourceError<{ status: number }>> & {
  socketStatus: 'close' | 'error' | undefined;
  setRefetchOnError: {
    on: () => void;
    off: () => void;
    toggle: () => void;
  };
};

interface Params {
  hash?: string;
  isEnabled?: boolean;
}

export default function useTxQuery(params?: Params): TxQuery {
  const [ socketStatus, setSocketStatus ] = React.useState<'close' | 'error'>();
  const [ isRefetchEnabled, setRefetchEnabled ] = useBoolean(false);
  const [ requestFlag, setRequestFlag ] = React.useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const hash = params?.hash ?? getQueryParamString(router.query.hash);
  const url = getEnvValue('NEXT_PUBLIC_CREDENTIAL_API_HOST');

  const queryResult = useApiQuery<'tx', { status: number }>('tx', {
    pathParams: { hash },
    queryOptions: {
      enabled: Boolean(hash) && params?.isEnabled !== false,
      refetchOnMount: false,
      placeholderData: rollupFeature.isEnabled && rollupFeature.type === 'zkEvm' ? TX_ZKEVM_L2 : TX,
      retry: (failureCount, error) => {
        if (isRefetchEnabled) {
          return false;
        }

        return retry(failureCount, error);
      },
      refetchInterval: (): number | false => {
        return isRefetchEnabled ? 15 * SECOND : false;
      },
    },
  });
  const { data, isError, isPlaceholderData, isPending } = queryResult;
  const request = React.useCallback(async() => {
    if (requestFlag) return;
    setRequestFlag(true);
    try {
      const rp2 = await (await fetch(url + `/api/v1/explorer/transaction/${ hash }`,
        { method: 'get' })).json() as { credential_id: string; credential_status: string };
      if (data) {
        queryClient.setQueryData(getResourceKey('tx', { pathParams: { hash } }), {
          ...data,
          credential_id: rp2.credential_id,
          credential_status: rp2.credential_status,
        });
      }
    } catch (error: unknown) {
      throw new Error(String(error));
    }
  }, [ data, hash, queryClient, url, setRequestFlag, requestFlag ]);

  React.useEffect(() => {
    if (router.query.tab === 'credentials' && !requestFlag) {
      setTimeout(() => {
        request();
      }, 500);
    }
  }, [ request, router.query.tab, requestFlag ]);

  const handleStatusUpdateMessage: SocketMessage.TxStatusUpdate['handler'] = React.useCallback(async() => {
    await delay(5 * SECOND);
    queryClient.invalidateQueries({
      queryKey: getResourceKey('tx', { pathParams: { hash } }),
    });
  }, [ queryClient, hash ]);

  const handleSocketClose = React.useCallback(() => {
    setSocketStatus('close');
  }, []);

  const handleSocketError = React.useCallback(() => {
    setSocketStatus('error');
  }, []);

  const channel = useSocketChannel({
    topic: `transactions:${ hash }`,
    onSocketClose: handleSocketClose,
    onSocketError: handleSocketError,
    isDisabled: isPending || isPlaceholderData || isError || data.status !== null,
  });
  useSocketMessage({
    channel,
    event: 'collated',
    handler: handleStatusUpdateMessage,
  });

  return React.useMemo(() => ({
    ...queryResult,
    socketStatus,
    setRefetchOnError: setRefetchEnabled,
  }), [ queryResult, socketStatus, setRefetchEnabled ]);
}
