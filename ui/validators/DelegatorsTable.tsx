/* eslint-disable */
import { Table, Tbody, Thead , Flex, TableContainer, Tr, Th,  Td, Box } from '@chakra-ui/react';
import { useStakeLoginContextValue } from 'lib/contexts/stakeLogin';
import axios from 'axios';
import React, { useEffect } from 'react';
import { debounce, orderBy } from 'lodash';
import TableTokenAmount from 'ui/staking/TableTokenAmount';
import WithTipsText from 'ui/validators/WithTipsText';
import Pagination from 'ui/validators/Pagination';
import { useClipboard } from '@chakra-ui/react';
import { Avatar, Text } from '@chakra-ui/react';
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import advancedFormat from 'dayjs/plugin/advancedFormat';
import styles from 'ui/staking/spinner.module.css';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);


type tableHeadType = {
    label: string | React.ReactNode;
    key: string;
    allowSort?: boolean;
    render?: (value: any) => React.ReactNode;
    width?: string;
    tips?: string;
    minWidth?: string;
    sortBy?: string;
    sortOrder?: string;
}

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


type sortOrderType = 'asc' | 'desc' | '';

const icon_asc = (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M3.74377 7.32026C3.92589 7.15115 4.21062 7.16169 4.37973 7.34381L5.99998 9.08869L7.62022 7.34381C7.78933 7.16169 8.07406 7.15115 8.25618 7.32026C8.4383 7.48937 8.44885 7.7741 8.27973 7.95622L6.32973 10.0562C6.24459 10.1479 6.12511 10.2 5.99998 10.2C5.87485 10.2 5.75537 10.1479 5.67022 10.0562L3.72022 7.95622C3.55111 7.7741 3.56165 7.48937 3.74377 7.32026Z" fill="black" fillOpacity="0.4"/>
        <path d="M5.99998 1.79999C6.12511 1.79999 6.24459 1.85209 6.32973 1.94378L8.27974 4.04379C8.44885 4.2259 8.4383 4.51063 8.25618 4.67975C8.07406 4.84886 7.78933 4.83831 7.62022 4.65619L5.99998 2.91131L4.37973 4.65619C4.21062 4.83831 3.92589 4.84886 3.74377 4.67974C3.56165 4.51063 3.55111 4.2259 3.72022 4.04378L5.67022 1.94378C5.75537 1.85209 5.87485 1.79999 5.99998 1.79999Z" fill="#A80C53"/>
    </svg>
);

const icon_desc = (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M3.74377 4.67974C3.92589 4.84885 4.21062 4.83831 4.37973 4.65619L5.99998 2.91131L7.62022 4.65619C7.78933 4.83831 8.07406 4.84885 8.25618 4.67974C8.4383 4.51063 8.44885 4.2259 8.27973 4.04378L6.32973 1.94378C6.24459 1.85209 6.12511 1.79999 5.99998 1.79999C5.87485 1.79999 5.75537 1.85209 5.67022 1.94378L3.72022 4.04378C3.55111 4.2259 3.56165 4.51063 3.74377 4.67974Z" fill="black" fillOpacity="0.4"/>
        <path d="M5.99998 10.2C6.12511 10.2 6.24459 10.1479 6.32973 10.0562L8.27974 7.95621C8.44885 7.7741 8.4383 7.48937 8.25618 7.32025C8.07406 7.15114 7.78933 7.16169 7.62022 7.34381L5.99998 9.08869L4.37973 7.34381C4.21062 7.16169 3.92589 7.15114 3.74377 7.32026C3.56165 7.48937 3.55111 7.7741 3.72022 7.95622L5.67022 10.0562C5.75537 10.1479 5.87485 10.2 5.99998 10.2Z" fill="#A80C53"/>
    </svg>
);

const icon_no_order = (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M5.99998 1.79999C6.12511 1.79999 6.24459 1.85209 6.32973 1.94378L8.27974 4.04379C8.44885 4.2259 8.4383 4.51063 8.25618 4.67975C8.07406 4.84886 7.78933 4.83831 7.62022 4.65619L5.99998 2.91131L4.37973 4.65619C4.21062 4.83831 3.92589 4.84886 3.74377 4.67974C3.56165 4.51063 3.55111 4.2259 3.72022 4.04378L5.67022 1.94378C5.75537 1.85209 5.87485 1.79999 5.99998 1.79999ZM3.74377 7.32023C3.92589 7.15112 4.21062 7.16166 4.37973 7.34379L5.99998 9.08866L7.62022 7.34379C7.78933 7.16167 8.07406 7.15112 8.25618 7.32023C8.4383 7.48934 8.44885 7.77407 8.27973 7.95619L6.32973 10.0562C6.24459 10.1479 6.12511 10.2 5.99998 10.2C5.87485 10.2 5.75537 10.1479 5.67022 10.0562L3.72022 7.95619C3.55111 7.77407 3.56165 7.48934 3.74377 7.32023Z" fill="black" fillOpacity="0.4"/>
    </svg>
);





const getShortAddress = (address: string) => {
    if( !address) {
        return '';
    }
    if ( address.length > 10) {
        return `${address.slice(0, 12)}...${address.slice(-4)}`;
    }
    return address;
}


const ValidatorInfo = ({
    validatorName
}: {
    validatorName: string;
}) => {

    return (
        <Flex
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
            width="auto"
        >
            <Avatar
                name="MOCA"
                src="/static/moca-brand.svg"
                size='2xs'
                width="16px"
                height="16px"
                borderRadius="full"
                marginRight="4px"
            />
            <Text 
                fontSize="12px"
                fontWeight="500"
                textAlign={"left"}
                color="#A80C53"
                fontStyle="normal"
                fontFamily="HarmonyOS Sans"
                lineHeight="normal"
                textTransform="capitalize"
                userSelect="none"
                as ="span"
            > { getShortAddress(validatorName) } </Text>
        </Flex>
    )
}

const tableHead: tableHeadType[] = [
    {
        label: 'Delegators',
        key: 'delegatorAddress',
        width : '25%',
        render: (record: any) => (
            <ValidatorInfo
                validatorName={ getShortAddress(record.delegatorAddress) }
            />
        ),
    },
    {
        label: 'Stake Amount',
        key: 'stakeAmount',
        width : '25%',
        allowSort: true,
        render: (record) => (
            <TableTokenAmount
                amount = { record.stakeAmount }
                symbol = 'Moca'
            />
        )
    },
        {
        label: 'Total Earned',
        key: 'totalEarned',
        width : '25%',
        allowSort: true,
        render: (record) => (
            <TableTokenAmount
                amount = { record.totalEarned }
                symbol = 'Moca'
            />
        )
    },
    {
        label: 'Start Date',
        key: 'startDate',
        width : '25%',
        allowSort: false,
        render: (record) => (
            <span style={{ 
                color: '#000',
                fontFamily: "HarmonyOS Sans",
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'normal',
                textTransform: 'capitalize',
            }}>{ !!record.startDate ? dayjs.utc(record.startDate).format('DD MMM YYYY HH:mm [UTC]') : '-' }</span>
        ),
    },
];

    

const CustomTableHeader = ({
    selfKey,
    width,
    allowSort,
    children,
    sortKey,
    sortOrder,
    setSort,
    setSortOrder,
    minWidth = '180px',
}: { 
    children: React.ReactNode
    width?: string | number
    selfKey: string
    allowSort?: boolean
    sortKey?: string
    sortOrder?: sortOrderType
    setSort?: (sort: string) => void
    setSortOrder?: (sortOrder: sortOrderType) => void
    minWidth?: string
}) => {

    const handleSort = () => {
        if (allowSort) {
            if (selfKey === sortKey) {
                setSort && setSort(selfKey || '');
                const newSortOrder = sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? '' : 'asc';
                setSortOrder && setSortOrder(newSortOrder);
            } else {
                setSort && setSort(selfKey || '');
                const newSortOrder = 'asc';
                setSortOrder && setSortOrder(newSortOrder);
            }
        }
    };

    const w = width || 'auto';
    const _w = width || '200px'; 
    const _minWidth = minWidth || '180px';

    return (
        <Th
            _first={{ p: "4px 10px 10px 10px" }}
            color="rgba(0, 0, 0, 0.6)"
            p="4px 10px 10px 10px"
            bg="#FFFF"
            borderBottom="1px"
            borderColor="rgba(0, 0, 0, 0.1)"
            width={{ base: _w , lg: w }}
            minWidth={_minWidth}
            flexShrink={ 0 }
        >
            <Flex
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
                width="100%"
                userSelect={'none'}
                gap="2px" 
            >
                <span style={{ color: 'rgba(0, 0, 0, 0.40)' }}>
                    { children }
                </span>
                { allowSort && (
                    <Box
                        display="flex"
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                        width="12px"
                        height="12px"
                        cursor="pointer"
                        onClick={handleSort}
                    >
                        { (sortOrder === 'asc' && selfKey === sortKey) && icon_asc }
                        { (sortOrder === 'desc' && selfKey === sortKey) && icon_desc }
                        { (sortOrder === '' || selfKey !== sortKey) && icon_no_order }
                    </Box>
                )}
            </Flex>
        </Th>
    );
}


const TableApp = (props: {
    data: any;
    isLoading: boolean;
    totalCount: number;
    currentPage: number;
    onJumpPrevPage: () => void;
    onJumpNextPage: () => void;
    nextKey: string | null;
}) => {

    const {
        data,
        isLoading,
        currentPage,
        onJumpPrevPage,
        onJumpNextPage,
        totalCount,
        nextKey
    } = props;

    const [sortBy, setSortBy] = React.useState<string>('');
    const [sortOrder, setSortOrder] = React.useState<sortOrderType>('');


    const handleRowClick = (item: any) => {
        console.log('Row clicked:', item);
    };


    const sortedData = React.useMemo(() => {
        if (sortBy && sortOrder) {
            return orderBy(data, [sortBy], [ !sortOrder ? false : sortOrder]);
        }
        return data;
    }, [data, sortBy, sortOrder]);
        


    const tableHeaders = (
        <Tr>
            {tableHead.map((item: tableHeadType, index: number) => (
                <CustomTableHeader 
                    key={index}
                    width={ item.width }
                    minWidth={ item.minWidth }
                    allowSort={ item.allowSort }
                    sortKey = { sortBy }
                    sortOrder = { sortOrder }
                    setSort = { setSortBy }
                    setSortOrder = { setSortOrder }
                    selfKey = { item.key }
                >
                    { ( item.tips ? ( 
                        <WithTipsText 
                            label={ item.label }
                            tips={ item.tips }
                        />
                    ) : item.label ) }
                </CustomTableHeader>
            ))}
        </Tr>
    );

    return (
        <div style={{
                width: '100%',
                height: 'auto',
                overflowX: 'auto',
                overflowY: 'hidden',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                borderRadius: '12px',
            }}
        >
            { isLoading ? (
                <div style={{ width: '100%', height: 'auto', 
                    display: 'flex', minHeight: '200px',
                        justifyContent: 'center', alignItems: 'center', marginTop: '56px', position: 'relative'}}>
                    <Box className={ styles.loader }></Box>
                </div>
                ) : (
                <Table variant="simple">
                    <Thead bg ="white" position="sticky" top={ 0 } zIndex={ 1 }>
                        { tableHeaders }
                    </Thead>
                    <Tbody>
                        {sortedData.map((validator: any, index: number) => (
                            <Tr key={index}
                                borderBottom={'none'}
                                _last={{ borderBottom: 'none' }} 
                                _hover={{ bg: 'rgba(0, 0, 0, 0.02)' }}
                                onClick={() => handleRowClick(validator)}
                            >
                                { tableHead.map((item: tableHeadType, index: number) => (
                                    <Td
                                        key={index}
                                        p="14px 10px 10px 10px"
                                        color="rgba(0, 0, 0, 0.6)"
                                        borderBottom={'none'} _last={{ borderBottom: 'none' }} 
                                        onClick={() => handleRowClick(validator)}
                                    >
                                        {item.render ? item.render(validator) : validator[item.key]}
                                    </Td>
                                ))}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
            {/* page, onNextPageClick, onPrevPageClick, resetPage, hasPages, hasNextPage, className, canGoBackwards, isLoading, isVisible  */}
            <Flex
                justifyContent="flex-end"
                alignItems="center"
                zIndex='200'
                width="100%"
                marginTop={ '16px'}
            >
                <Pagination 
                    totalCount={ props.totalCount }
                    currentPage={ currentPage }
                    onJumpPrevPage={ onJumpPrevPage }
                    onJumpNextPage={ onJumpNextPage }
                    isNextDisabled = { isLoading || !nextKey  || nextKey === 'null' }
                    isPrevDisabled = { currentPage === 1 || currentPage === 0  || isLoading }
                />
            </Flex>
        </div>
    );
}


const initial_nextKey = '0x00';
const defaultLimit = 15;

const TableWrapper = (props: {
    addr: string;
    totalCount: number;
    setTotalCount: (totalCount: number) => void;
}) => {

    const { addr, totalCount, setTotalCount } = props;
    const { serverUrl : url } = useStakeLoginContextValue();

    const [ toNext, setToNext ] = React.useState<boolean>(true);
    const [ nextKey , setNextKey ] = React.useState<string>(initial_nextKey);
    const [ currentPage, setCurrentPage ] = React.useState<number>(1);
    const [ tableData, setTableData ] = React.useState<any[]>([]);
    const [ isTableLoading, setIsTableLoading ] = React.useState(false);

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

    const requestDelegatorsInfo = React.useCallback(async( _addr : string) => {
        try {
            setIsTableLoading(true);
            const param = new URLSearchParams();
            param.append('limit', defaultLimit.toString());
            param.append('nextKey', queryParams.nextKey || initial_nextKey);
            // const res = await (await fetch(url + '/api/network/validators/delegations/' + _addr + '?' + param.toString(),
            //     { method: 'get' })).json() as any
            const res = await axios.get(url + '/api/network/validators/delegations/' + _addr + '?' + param.toString(), { 
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }).then((response) => {
                return response.data;
            }).catch((error) => {
                return null;
            });
            setIsTableLoading(false);
            if(res && res.code === 200) {
                setTableData(res.data.delegators || []);
                setTotalCount(Number(res.data.pagination.total || "0"))
                setNextKey(res.data.pagination.nextKey);
                setCurrentPage( queryParams.page || 1 );
            }
        }
        catch (error: any) {
            setIsTableLoading(false);
            throw Error(error);
        }
    }, [ url , addr, queryParams.nextKey ]);

    useEffect(() => {
        if (addr) {
            requestDelegatorsInfo(addr);
        }
    }, [ addr, requestDelegatorsInfo ]);

    return (
        <Box
            width="100%"
            height="auto"
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="flex-start"
            padding="16px"
        >
            <TableApp
                data={ tableData }
                isLoading={ isTableLoading }
                totalCount={ totalCount }
                currentPage={ currentPage }
                onJumpPrevPage={ () => {
                    setToNext(false);
                    updateQueryParams({ nextKey: nextKey, page: currentPage - 1 });
                }}
                onJumpNextPage={ () => {
                    setToNext(true);
                    updateQueryParams({ nextKey: nextKey , page: currentPage + 1 });
                }}
                nextKey={ nextKey }
            />
        </Box>
    );
}


export default TableWrapper;