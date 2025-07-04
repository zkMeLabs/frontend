/* eslint-disable */
"use client";

import { Box, Flex, Button , Progress , Grid, Text } from '@chakra-ui/react';
import axios from 'axios';
import type { NextPage } from 'next';
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import ValidatorsTable from 'ui/validators/ValidatorsTable';
import WithTipsText from 'ui/validators/WithTipsText';
import TableFilter from 'ui/validators/TableFilter';
import { useStakeLoginContextValue } from 'lib/contexts/stakeLogin';
import Web3ModalProvider from 'ui/staking/Web3Provider';
import { getFormatterFloat } from 'ui/staking/numberFormat';
import truncateTokenAmountWithComma from 'ui/staking/truncateTokenAmountWithComma';

const DOC_LINK = 'https://drive.google.com/stake/validators?ddrp=1';

type RequestType = {
  has_next: boolean;
  has_more: boolean;
  next_cursor: string;
  previous_cursor: string;
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

type ValidatorQueryParams = {
  /** 验证者状态过滤，支持数字或字符串类型 */
  status?: number | 'active' | 'inactive' | 'unbonding';

  /** 分页键，用于获取下一页数据 */
  nextKey?: string; // 默认值 '0x00'

  page?: number; // 默认值 1

  /** 每页返回的验证者数量 */
  limit?: number; // 默认值 10

  /** 是否返回总记录数 */
  countTotal?: boolean; // 默认值 true

  /** 是否按投票权重倒序排列 */
  reverse?: boolean; // 默认值 true
};


const icon_link = (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M2.55001 3.30001C2.30148 3.30001 2.10001 3.50148 2.10001 3.75001V8.85001C2.10001 9.09854 2.30148 9.30001 2.55001 9.30001H7.65001C7.89854 9.30001 8.10001 9.09854 8.10001 8.85001V6.45001C8.10001 6.20148 8.30148 6.00001 8.55001 6.00001C8.79854 6.00001 9.00001 6.20148 9.00001 6.45001V8.85001C9.00001 9.5956 8.3956 10.2 7.65001 10.2H2.55001C1.80443 10.2 1.20001 9.5956 1.20001 8.85001V3.75001C1.20001 3.00443 1.80443 2.40001 2.55001 2.40001H5.55001C5.79854 2.40001 6.00001 2.60148 6.00001 2.85001C6.00001 3.09854 5.79854 3.30001 5.55001 3.30001H2.55001Z" 
    fill="#FF57B7"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M3.71632 7.65192C3.88306 7.83622 4.16763 7.85044 4.35192 7.6837L9.90001 2.664V4.35001C9.90001 4.59854 10.1015 4.80001 10.35 4.80001C10.5985 4.80001 10.8 4.59854 10.8 4.35001V1.65001C10.8 1.40148 10.5985 1.20001 10.35 1.20001H7.65001C7.40148 1.20001 7.20001 1.40148 7.20001 1.65001C7.20001 1.89854 7.40148 2.10001 7.65001 2.10001H9.18192L3.7481 7.01632C3.56381 7.18306 3.54958 7.46763 3.71632 7.65192Z" fill="#FF57B7"/>
  </svg>
)

const InfoNumberWrapper = ({
  number
}: {
  number: string | number;
}) => {
  return (
    <Text fontSize="24px" fontWeight="600" lineHeight="32px" color="#000">
      { getFormatterFloat(number) }
    </Text>
  );
}


const defaultLimit = 100;
const initial_nextKey = '0x00'; // 默认的 nextKey 值

const AllValidatorPage: NextPage = () => {

  const [ queryParams, setQueryParams ] = React.useState<{ 
    status?: ValidatorQueryParams['status'];
    nextKey?: string;
    page?: ValidatorQueryParams['page'];
    limit?: ValidatorQueryParams['limit'];
    countTotal?: ValidatorQueryParams['countTotal'];
    reverse?: ValidatorQueryParams['reverse'];
  }>({
    nextKey: '',
    page: 1,
  });

  const updateQueryParams = (newParams: Partial<ValidatorQueryParams>) => {
    setQueryParams((prevParams) => ({
      ...prevParams,
      ...newParams,
    }));
  }

  const [ toNext, setToNext ] = React.useState<boolean>(true);
  const [ tableList, setTableList ] = React.useState<Array<IssuanceTalbeListType>>([]);
  const [ isOverviewStatsLoading, setIsOverviewStatsLoading ] = React.useState<boolean>(false);

  const [ isActiveOnly, setIsActiveOnly ] = React.useState<boolean>(false);
  const [ searchValue, setSearchValue ] = React.useState<string>('');
  // const url = getEnvValue('NEXT_PUBLIC_CREDENTIAL_API_HOST');
  const { serverUrl : url } = useStakeLoginContextValue();
  const [ totalIssued, setTotalIssued ] = React.useState<number>(0);
  const [ totalCredential, setTotalCredential ] = React.useState<number>(0);
  const [ loading, setLoading ] = React.useState<boolean>(false);
  const [ nextCursor, setNextCursor ] = React.useState<string>('');
  const [ previousCursor, setpreviousCursor ] = React.useState<string>('');

  const [ totalDelegators, setTotalDelegators ] = React.useState<number>(0);
  const [ totalValidators, setTotalValidators ] = React.useState<number>(0);
  const [ totalStaked, setTotalStaked ] = React.useState<any>(0);
  const [ totalEpoch, setTotalEpoch ] = React.useState<any>({});
  
  const [nextKey, setNextKey] = useState<string | null>(initial_nextKey);
  const [currentPageKey, setCurrentPageKey] = useState<string | null>(initial_nextKey);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tableData, setTableData] = useState<any[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [keyStack, setKeyStack] = useState<(string | null)[]>([initial_nextKey]);
  const currentKeyRef = useRef<string | null>(initial_nextKey);

  const [ tableDataList, setTableDataList ] = React.useState<Array<any>>([]);

  const handleSearchChange = () => () => {};

  const filteredList = React.useMemo(() => {
    const trimedSearchValue = searchValue.trim().toLowerCase();
    if (!trimedSearchValue) {
      return tableDataList;
    } else {
      return tableDataList.filter((item) => {
        const { validatorName, validator} = item;
        return (
          validatorName.toLowerCase().includes(trimedSearchValue) ||
          validator.toLowerCase().includes(trimedSearchValue)
        );
      });
    }
  }, [ tableDataList, searchValue ]);



  const requestOverviewStats = React.useCallback(async() => {
    try {
      setIsOverviewStatsLoading(true);
      const res = await axios.get(url + '/api/network/overview-stats', {
        method: 'get',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((response) => {
          return response.data;
      }).catch((error) => {
          return null; 
      });

      setIsOverviewStatsLoading(false);
      if(res && res.code === 200) {
        const { 
          delegatorCount,
          validatorCount,
          totalStake,
          epoch,
        } = res.data;
        setTotalDelegators(delegatorCount);
        setTotalValidators(validatorCount);
        setTotalStaked(totalStake);
        setTotalEpoch(epoch || {});
      }
    }
    catch (error: any) {
      setIsOverviewStatsLoading(false);
    }
  }
  , [ url ]);


  const requestTableList = React.useCallback(async() => {
    try {
      setIsTableLoading(true);
      const key = currentKeyRef.current;
      const param = new URLSearchParams();
      param.append('nextKey', key || initial_nextKey);
      param.append('limit', defaultLimit.toString());
      if (isActiveOnly) {
        param.append('status', 'active');
      }
      // const res = await (await fetch(url + `/api/network/validators/list?${param.toString()}`, { method: 'get' })).json() as any;
      const res = await axios.get(url + `/api/network/validators/list?${param.toString()}`, {
        method: 'get',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((response) => {
          return response.data;
      }).catch((error) => {
          return null; 
      });
      setIsTableLoading(false);
      if(res && res.code === 200) {
        setTableDataList(res.data.validators || []);
        setNextKey(res.data.pagination.nextKey);
        setTotalCount(Number(res.data.pagination.total || "0"))
        setNextKey( res.data.pagination.nextKey || null );
        setCurrentPageKey(key ?? null);
      }
    }
    catch (error: any) {
      setIsTableLoading(false);
    }
  }
  , [ url , isActiveOnly, queryParams.nextKey ]);


  React.useEffect(() => {
    if (url) {
      requestOverviewStats();
      requestTableList();
    }
  }, [ url, requestOverviewStats, requestTableList]);


  const formatSeconds = (seconds : number ) => {
      const days = Math.floor(seconds / (24 * 3600));
      const hours = Math.floor((seconds % (24 * 3600)) / 3600);
      // const minutes = Math.floor((seconds % 3600) / 60);

      let result = '';
      if (days > 0) result += `${days}d `;
      if (hours > 0) result += `${hours}h `;
      // result += `${minutes}m`;

      const _res = (hours > 0 ) ? ("New: " + result) : result;
      return _res.trim();
  }

    const jumpToPrevPage = useCallback(() => {
        if (isTableLoading || currentPage <= 1) return;
        const prevKey = keyStack[currentPage - 2] ?? null;
        currentKeyRef.current = prevKey;

        setCurrentPage((prev) => prev - 1);
        requestTableList();
    }, [nextKey, isTableLoading, currentPage, requestTableList]);

    // 上一页
    const jumpToNextPage = useCallback(() => {
        if (isTableLoading || !nextKey) return;
        const nextKeyToUse = nextKey;
        currentKeyRef.current = nextKeyToUse;

        setKeyStack((prev) => [...prev.slice(0, currentPage), nextKeyToUse]);
        setCurrentPage((prev) => prev + 1);
        requestTableList();
    }, [currentPage, keyStack, isTableLoading, requestTableList]);

  return (
    <>

        <Flex 
            display={{ base: 'flex', lg: 'flex' }}
            userSelect="none"
            justifyContent= {{ lg:  'flex-start' }}
            alignItems="baseline" marginBottom="24px">
            <Text fontSize="24px" fontWeight="600" lineHeight="32px" color="#000">All Validators</Text>

            <Button
                onClick={() => {
                    window.open(DOC_LINK, '_blank');
                }}
                px = "6px"
                py = "2px"
                width={ 'auto' }
                height={ 'auto' }
                marginLeft={"8px"}
                variant="surface"
                color="#FF57B7"
                borderRadius={9999}
                backgroundColor="#FEE5F4"
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap="2px"
                >
                <Text 
                    fontSize="12px"
                    fontWeight="400"
                    lineHeight="140%"
                    color="#FF57B7"
                    fontFamily="Inter"
                >Staking Tutorial</Text>
                {icon_link}
            </Button>
        </Flex>

        <Grid templateColumns={{ md: '1fr', lg: '1fr 1fr', xl: '1fr 1fr 1fr 1fr ' }} marginBottom = {4} rowGap={ 4 } columnGap={ 6 } mb={ 8 }>
            <Box border="solid 1px rgba(0, 0, 0, 0.06)" borderRadius="12px" display="grid" gridGap="8px" padding="16px">
            <WithTipsText
                placement='right'
                label={  <Text
                fontSize="12px"
                display="inline"
                lineHeight="16px"
                fontStyle="normal"
                as={'span'}
                fontFamily="HarmonyOS Sans" fontWeight="400" color="rgba(0, 0, 0, 0.4)">Total Staking</Text> }
                tips={ `Total tokens staked across all nodes and users on the blockchain network.` }
            />
            <Text fontSize="24px" fontWeight="600" lineHeight="32px" color="#000">
              {truncateTokenAmountWithComma(Number(totalStaked || '0.00'))}
            </Text>
            </Box>
            <Box border="solid 1px rgba(0, 0, 0, 0.06)" borderRadius="12px" display="grid" gridGap="18px" padding="16px">
            <WithTipsText
                placement='right'
                label={ <Text
                fontSize="12px"
                display="inline"
                lineHeight="16px"
                fontStyle="normal"
                as={'span'}
                fontFamily="HarmonyOS Sans"
                fontWeight="400" color="rgba(0, 0, 0, 0.4)">Epoch</Text> }
                tips={ `A fixed duration for selecting validators, assigning staking tasks, and distributing rewards.` }
            />
            <Flex alignItems="center" justifyContent="space-between">
                <InfoNumberWrapper  number = { totalEpoch.current || '-' } />
                <Box width={"168px"} display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                    <Flex alignItems="center" justifyContent="space-between" width="100%" userSelect="none">
                        <Text fontSize="12px" color="#FF57B7" fontWeight="400" lineHeight="16px" fontFamily="HarmonyOS Sans">
                            { totalEpoch.progress || 0 }%
                        </Text>
                        <Text fontSize="12px" color="rgba(0, 0, 0, 0.4)" fontWeight="400" lineHeight="16px" fontFamily="HarmonyOS Sans">
                           { formatSeconds(Number(totalEpoch.remainingTime || 0 ))}
                        </Text>
                    </Flex>
                    <Progress
                        colorScheme='pink'
                        opacity={0.8}
                        size='sm' 
                          sx={{
                            '& > div': {
                              backgroundColor: '#FF57B7', // 自定义颜色
                          },
                        }}
                        value={ totalEpoch.progress || 0}
                        borderRadius="4px"
                        backgroundColor={ '#FDF1F9'}
                        width="100%" height="4px" marginTop="6px" />
                </Box>
            </Flex>
            </Box>
            <Box border="solid 1px rgba(0, 0, 0, 0.06)" borderRadius="12px" display="grid" gridGap="8px" padding="16px">
            <WithTipsText
                placement='right'
                label={ <Text
                fontSize="12px"
                display="inline"
                lineHeight="16px"
                fontStyle="normal"
                as={'span'}
                fontFamily="HarmonyOS Sans" fontWeight="400" color="rgba(0, 0, 0, 0.4)">Validators</Text> }
                tips={ `Total number of active validators responsible for verifying transactions and maintaining blockchain security.` }
            />
            <InfoNumberWrapper number = { totalValidators || '0' } />
            </Box>
            <Box border="solid 1px rgba(0, 0, 0, 0.06)" borderRadius="12px" display="grid" gridGap="8px" padding="16px">
            <WithTipsText
                placement='right'
                label={ <Text
                fontSize="12px"
                display="inline"
                lineHeight="16px"
                fontStyle="normal"
                as={'span'}
                fontFamily="HarmonyOS Sans" fontWeight="400" color="rgba(0, 0, 0, 0.4)">Delegators</Text> }
                tips={ `Users who delegate their tokens to validators and receive rewards without running nodes themselves.` }
            />
            <InfoNumberWrapper number = { totalDelegators || '0' } />
            </Box>
        </Grid>
        <TableFilter 
            totalCount = { totalCount }
            isActiveOnly = { isActiveOnly }
            setIsActiveOnly = {  (value: boolean) => {
                setIsActiveOnly(value);
                // updateQueryParams({ offset: 0, page: 1 });
            }}
            searchValue = { searchValue }
            setSearchValue = { (value: string) => {
                setSearchValue(value);
                // updateQueryParams({ offset: 0, page: 1 });
            }}
        />
        <Web3ModalProvider>
            <ValidatorsTable 
                data={ filteredList }
                nextKey={ nextKey }
                fetcher ={ () => {
                  requestTableList();
                  requestOverviewStats();
                }}
                searchTerm={ searchValue }
                isLoading={ isTableLoading }
                totalCount={ totalCount }
                currentPage={ currentPage }
                onJumpPrevPage={ jumpToPrevPage }
                onJumpNextPage={ jumpToNextPage }
            />
        </Web3ModalProvider>
    </>
  );
};

export default React.memo(AllValidatorPage);
