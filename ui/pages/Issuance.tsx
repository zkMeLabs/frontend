/* eslint-disable @typescript-eslint/no-explicit-any */

import { Box, Flex, Text } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import debounce from 'lodash/debounce';
import orderBy from 'lodash/orderBy';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

// import type { ObjetTalbeListType, ObjetRequestType } from 'types/storage';

import PageNextJs from 'nextjs/PageNextJs';

import { getEnvValue } from 'configs/app/utils';
// import { truncateString } from 'ui/storage/utils';

const TableList = dynamic(() => import('ui/storage/table-list'), { ssr: false });
type RequestType = {
  has_more: boolean;
  title_data: Array<{
    block_number: number;
    credential_id: string;
    from_address: string;
    to_address: string;
    transaction_status: string;
    tx_fee: string;
    tx_hash: string;
    tx_time: string;
    tx_value: string;
  }>;
};
type IssuanceTalbeListType = {
  'Credential ID': string;
  'Txn hash': string;
  Block: string;
  Method: string;
  'From/To': [ string, string ];
  Time: string;
  'Value MOCA': string;
  'Fee MOCA': string;
};
const ObjectDetails: NextPage = () => {
  const [ queryParams, setQueryParams ] = React.useState<{ offset: number; searchTerm: string; page: number }>({
    offset: 0,
    searchTerm: '',
    page: 1,
  });

  const updateQueryParams = (newParams: Partial<{ offset: number; searchTerm: string; page: number }>) => {
    setQueryParams(prevParams => ({
      ...prevParams,
      ...newParams,
    }));
  };

  const [ toNext, setToNext ] = React.useState<boolean>(true);
  React.useEffect(() => {
    if (queryParams.page > 1) {
      updateQueryParams({
        offset: (queryParams.page - 1) * 20,
      });
    } else {
      updateQueryParams({
        offset: 0,
      });
    }
  }, [ queryParams.page ]);

  const propsPage = React.useCallback((value: number) => {
    updateQueryParams({
      page: value,
    });
  }, []);

  const [ tableList, setTableList ] = React.useState<Array<IssuanceTalbeListType>>([]);

  const tabThead = [ 'Credential ID', 'Txn hash', 'Block', 'Method', 'From/To', 'Time', 'Value MOCA', 'Fee MOCA' ];

  const debouncedHandleSearchChange = React.useMemo(
    () => debounce((event: React.ChangeEvent<HTMLInputElement> | null) => {
      if (!event) {
        updateQueryParams({
          searchTerm: '',
          offset: 0,
          page: 1,
        });
      } else {
        updateQueryParams({
          searchTerm: event.target.value,
          page: 1,
          offset: 0,
        });
      }
    }, 300),
    [],
  );
  const url = getEnvValue('NEXT_PUBLIC_CREDENTIAL_API_HOST');
  const [ totalIssued, setTotalIssued ] = React.useState<number>(0);
  const [ totalCredential, setTotalCredential ] = React.useState<number>(0);
  const [ tableLength, setTableLength ] = React.useState<number>(0);
  const [ loading, setLoading ] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof tableLength === 'number' && tableLength !== 51) {
      setToNext(false);
    } else {
      setToNext(true);
    }
  }, [ tableLength ]);

  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement> | null) => {
    debouncedHandleSearchChange(event);
  }, [ debouncedHandleSearchChange ]);

  function truncateToSignificantDigits(numberStr: string, significantDigits: number) {
    const num = new BigNumber(numberStr);
    if (num.isZero()) return num;

    const exponent = num.e || 0;

    let decimalPlaces;
    if (num.abs().isLessThan(1)) {
      decimalPlaces = Math.abs(exponent) + significantDigits - 1;
    } else {
      const integerDigits = exponent + 1;
      decimalPlaces = Math.max(significantDigits - integerDigits, 0);
    }

    return num.decimalPlaces(decimalPlaces, BigNumber.ROUND_DOWN);
  }

  const request = React.useCallback(async() => {
    try {
      setLoading(true);
      const rp1 = await (await fetch(url + '/api/v1/explorer/issuancestitle', { method: 'get' })).json() as RequestType;
      const rp2 = await (await fetch(url + '/api/v1/explorer/totalissuancesinfo', { method: 'get' })).json() as {
        total_credential_number: number; total_issued_number: number;
      };
      const tableList: Array<IssuanceTalbeListType> = [];
      orderBy(rp1.title_data, [ 'transaction_status' ]).forEach((v: any) => {
        tableList.push({
          'Credential ID': v.credential_id || '/',
          'Txn hash': v.tx_hash,
          Block: v.block_number,
          Method: v.method,
          'From/To': [ v.from_address, v.to_address ],
          Time: v.tx_time,
          'Value MOCA': v.tx_value,
          'Fee MOCA': truncateToSignificantDigits(BigNumber(v.tx_fee / 1e18).toString(10), 3).toString(10),
        });
      });
      setTableLength(rp1.title_data.length);
      setTableList(tableList);
      setLoading(false);
      setTotalIssued(rp2.total_credential_number);
      setTotalCredential(rp2.total_issued_number);
    } catch (error: any) {
      throw Error(error);
    }
  }, [ url ]);

  React.useEffect(() => {
    if (url) {
      request();
    }
  }, [ request, url ]);

  return (
    <PageNextJs pathname="/object">
      <Flex justifyContent="space-between" textAlign="left" margin="24px 0">
        <Box width="48%" border="solid 1px rgba(0, 0, 0, 0.06)" borderRadius="12px" display="grid" gridGap="8px" padding="16px">
          <Text>Total Issued Number</Text>
          <Text>{ Number(new Intl.NumberFormat('en-US').format(totalIssued)) || '-' }</Text>
        </Box>
        <Box width="48%" border="solid 1px rgba(0, 0, 0, 0.06)" borderRadius="12px" display="grid" gridGap="18px" padding="16px">
          <Text>Total Credential Number</Text>
          <Text>{ Number(new Intl.NumberFormat('en-US').format(totalCredential)) || '-' }</Text>
        </Box>
      </Flex>
      <Flex>
        <Box
          display="flex" padding="16px" margin="24px 0" border="1px solid rgba(0, 46, 51, 0.10)" borderRadius="30px" backdropFilter="blur(5px)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8.66667 8.00001H14M8.66667 5.33334H14M8.66667 10.6667H14M4 4.66667V11.3333M4 11.3333L2
            9.33334M4 11.3333L6 9.33334" stroke="#FF57B7" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <Text color="rgba(0, 0, 0, 0.30)" fontSize="12px" fontWeight="400" marginLeft="12px">
            Advanced Filter
          </Text>
        </Box>
      </Flex>
      <TableList
        totleDate={ 0 }
        showTotal={ true }
        toNext={ toNext }
        currPage={ queryParams.page }
        propsPage={ propsPage }
        loading={ loading }
        tableList={ tableList }
        tabThead={ tabThead }
        page="Issuance"
        handleSearchChange={ handleSearchChange }
      />
    </PageNextJs>
  );
};

export default React.memo(ObjectDetails);
