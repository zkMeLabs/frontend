/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-imports */
import { Box, Flex, Text } from '@chakra-ui/react';
import { debounce, orderBy } from 'lodash';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import type { ObjetTalbeListType, ObjetRequestType } from 'types/storage';

import PageNextJs from 'nextjs/PageNextJs';

import useGraphqlQuery from 'lib/api/useGraphqlQuery';
// import PageTitle from 'ui/shared/Page/PageTitle';
import { sizeTool, filtersName } from 'ui/storage/utils';

const TableList = dynamic(() => import('ui/storage/table-list'), { ssr: false });
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

  const [ queries, setQueries ] = React.useState<Array<any>>([
    {
      tableName: 'objects',
      fields: [
        'object_id',
        'object_name',
        'content_type',
        'payload_size',
        'status',
        'visibility',
        'update_time',
        'bucket_name',
        'creator_address',
      ],
      where: {
        removed: { _eq: false },
      },
      order: { update_time: 'desc' },
      limit: 21,
      offset: 0,
      distinctOn: 'object_id',
    },
    {
      tableName: 'objects_aggregate',
      where: {
        removed: { _eq: false },
      },
      distinctOn: 'object_id',
      aggregate: [
        'count',
      ],
    },
  ]);

  React.useEffect(() => {
    setQueries([
      {
        tableName: 'objects',
        fields: [
          'object_id',
          'object_name',
          'content_type',
          'payload_size',
          'status',
          'visibility',
          'update_time',
          'bucket_name',
          'creator_address',
        ],
        where: queryParams.searchTerm ? {
          _or: [
            { object_name: { _ilike: `${ queryParams.searchTerm }%` } },
            { object_id: { _eq: queryParams.searchTerm.toString() } },
          ],
          _and: [
            { removed: { _eq: false } },
          ],
        } : { removed: { _eq: false } },
        // order: { update_time: 'desc' },
        order: { object_id: 'desc' },
        limit: 21,
        offset: queryParams.offset,
        distinctOn: 'object_id',
      },
      {
        tableName: 'objects_aggregate',
        where: queryParams.searchTerm ? {
          _or: [
            { object_name: { _ilike: `${ queryParams.searchTerm }%` } },
            { object_id: { _eq: queryParams.searchTerm.toString() } },
          ],
          _and: [
            { removed: { _eq: false } },
          ],
        } : { removed: { _eq: false } },
        distinctOn: 'object_id',
        aggregate: [
          'count',
        ],
      },
    ]);
  }, [ queryParams ]);

  const tableList: Array<ObjetTalbeListType> = [];
  const { loading, data, error } = useGraphqlQuery('Objects', queries);
  const tableLength = data?.objects?.length || 0;
  const totleDate = data?.objects_aggregate?.aggregate?.count || 0;
  orderBy(data?.objects?.slice(0, 20), [ 'update_time' ], [ 'desc' ]).forEach((v: ObjetRequestType) => {
    tableList.push({
      'Object Name': v.object_name,
      Type: v.content_type,
      'Object Size': sizeTool(v.payload_size),
      Status: v.status,
      Visibility: filtersName(v.visibility),
      'Last Updated Time': v.update_time,
      Bucket: v.bucket_name,
      Creator: v.creator_address,
      id: v.object_id,
    });
  });

  React.useEffect(() => {
    if (typeof tableLength === 'number' && tableLength !== 21) {
      setToNext(false);
    } else {
      setToNext(true);
    }
  }, [ tableLength ]);

  const tabThead = [ 'Object Name', 'Type', 'Object Size', 'Status', 'Visibility', 'Last Updated Time', 'Bucket', 'Creator' ];

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
    }, 300), // Adjust the debounce delay as needed (300ms in this case)
    [], // Dependencies array is empty because the debounce function itself is memoized
  );

  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement> | null) => {
    debouncedHandleSearchChange(event);
  }, [ debouncedHandleSearchChange ]);

  return (
    <PageNextJs pathname="/object">
      <Flex justifyContent="space-between" textAlign="left" margin="24px 0">
        <Box width="48%" border="solid 1px rgba(0, 0, 0, 0.06)" borderRadius="12px" display="grid" gridGap="8px" padding="16px">
          <Text>Total Issued Number</Text>
          <Text>156,476</Text>
        </Box>
        <Box width="48%" border="solid 1px rgba(0, 0, 0, 0.06)" borderRadius="12px" display="grid" gridGap="18px" padding="16px">
          <Text>Total Issued Number</Text>
          <Text>1,006</Text>
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
        showTotal={ true }
        totleDate={ totleDate }
        toNext={ toNext }
        currPage={ queryParams.page }
        propsPage={ propsPage }
        error={ error }
        loading={ loading }
        tableList={ orderBy(tableList, [ 'update_time' ], [ 'desc' ]) }
        tabThead={ tabThead }
        page="object"
        handleSearchChange={ handleSearchChange }
      />
    </PageNextJs>
  );
};

export default React.memo(ObjectDetails);
