import { Box, Flex, chakra, useColorModeValue, Skeleton } from '@chakra-ui/react';
import clamp from 'lodash/clamp';
import React from 'react';

interface Props {
  className?: string;
  value: number;
  colorScheme?: 'green' | 'gray';
  isLoading?: boolean;
}

const WIDTH = 50;

const Utilization = ({ className, value, colorScheme = 'green', isLoading }: Props) => {
  const valueString = (clamp(value * 100 || 0, 0, 100)).toLocaleString(undefined, { maximumFractionDigits: 2 }) + '%';
  const colorGrayScheme = useColorModeValue('gray.500', 'gray.400');
  const color = colorScheme === 'gray' ? colorGrayScheme : 'green.500';
  const newColor = '#A80C53';
  return (
    <Flex className={ className } alignItems="center" columnGap={ 2 }>
      <Skeleton isLoaded={ !isLoading } w={ `${ WIDTH }px` } h="4px" borderRadius="full" overflow="hidden">
        <Box bg="#FEE5F4" h="100%">
          <Box bg="#FF57B7" w={ valueString } h="100%"/>
        </Box>
      </Skeleton>
      <Skeleton isLoaded={ !isLoading } color={ newColor || color } fontWeight="bold">
        <span>
          { valueString }
        </span>
      </Skeleton>
    </Flex>
  );
};

export default React.memo(chakra(Utilization));
