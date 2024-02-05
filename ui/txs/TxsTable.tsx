import { Thead, Table, Tbody, Tr, Th } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import React from 'react';

import type { Transaction, TransactionsSortingField, TransactionsSortingValue } from 'types/api/transaction';

import { AddressHighlightProvider } from 'lib/contexts/addressHighlight';
import useLazyRenderedList from 'lib/hooks/useLazyRenderedList';

import TxsTableItem from './TxsTableItem';

type Props = {
  txs: Array<Transaction>;
  sort: (field: TransactionsSortingField) => () => void;
  sorting?: TransactionsSortingValue;
  top: number;
  showBlockInfo: boolean;
  showSocketInfo: boolean;
  socketInfoAlert?: string;
  socketInfoNum?: number;
  currentAddress?: string;
  enableTimeIncrement?: boolean;
  isLoading?: boolean;
}

const TxsTable = ({
  txs,
  top,
  showBlockInfo,
  currentAddress,
  enableTimeIncrement,
  isLoading,
}: Props) => {
  const { cutRef, renderedItemsNum } = useLazyRenderedList(txs, !isLoading);

  return (
    <AddressHighlightProvider>
      <Table variant="simple" minWidth="950px" size="xs">
        <Thead top={ top }>
          <Tr>
            <Th width="54px"></Th>
            <Th width="22%">Txn hash</Th>
            <Th width="160px">Type</Th>
            <Th width="20%">Method</Th>
            { showBlockInfo && <Th width="18%">Block</Th> }
            <Th width={{ base: '224px', xl: '360px' }}>From/To</Th>
            <Th width="20%" isNumeric>Value</Th>
            <Th width="20%" isNumeric pr={ 5 }>Fee</Th>
          </Tr>
        </Thead>
        <Tbody>
          <AnimatePresence initial={ false }>
            { txs.slice(0, renderedItemsNum).map((item, index) => (
              <TxsTableItem
                key={ item.hash + (isLoading ? index : '') }
                tx={ item }
                showBlockInfo={ showBlockInfo }
                currentAddress={ currentAddress }
                enableTimeIncrement={ enableTimeIncrement }
                isLoading={ isLoading }
              />
            )) }
          </AnimatePresence>
        </Tbody>
      </Table>
      <div ref={ cutRef }/>
    </AddressHighlightProvider>
  );
};

export default React.memo(TxsTable);
