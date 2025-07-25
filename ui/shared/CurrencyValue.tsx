import { chakra, Skeleton } from '@chakra-ui/react';
import React from 'react';

import getCurrencyValue from 'lib/getCurrencyValue';

interface Props {
  value: string;
  currency?: string;
  exchangeRate?: string | null;
  className?: string;
  accuracy?: number;
  accuracyUsd?: number;
  decimals?: string | null;
  isLoading?: boolean;
  withUsd?: boolean;
}

const CurrencyValue = ({ value, currency = '', decimals, exchangeRate, className, accuracy, accuracyUsd, isLoading, withUsd }: Props) => {
  if (isLoading) {
    return (
      <Skeleton className={ className } display="inline-block">0.00 ($0.00)</Skeleton>
    );
  }

  if (value === undefined || value === null) {
    return (
      <chakra.span className={ className }>
        -
      </chakra.span>
    );
  }
  const { valueStr: valueResult, usd: usdResult } = getCurrencyValue({ value, accuracy, accuracyUsd, exchangeRate, decimals });

  return (
    <chakra.span className={ className } display="inline-flex" rowGap={ 3 } columnGap={ 1 }>
      <chakra.span display="inline-block">
        { valueResult }{ currency ? ` ${ currency }` : '' }
      </chakra.span>
      { usdResult && withUsd && <chakra.span color="text_secondary" className="latest-tx-item-fee-value " fontWeight={ 400 }>(${ usdResult })</chakra.span> }
    </chakra.span>
  );
};

export default React.memo(chakra(CurrencyValue));
