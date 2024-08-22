import { Flex, Grid, Tag } from '@chakra-ui/react';
import React from 'react';

import type { SearchResultBucket } from 'types/api/search';

import IconSvg from 'ui/shared/IconSvg';

interface Props {
  data: SearchResultBucket;
  searchTerm: string;
}

const SearchBarSuggestBucket = ({ data }: Props) => {
  return (
    <Grid templateColumns="228px minmax(auto, max-content) auto" gap={ 2 }>
      <Flex alignItems="center">
        <IconSvg w="24px" h="24px" mr="8px" name="bucket"/>
        { data.bucket_name }
      </Flex>
      <Flex columnGap={ 3 } minW={ 0 } alignItems="center">
        <Tag flexShrink={ 0 }>Owner</Tag>
        { data.owner_address }
      </Flex>
    </Grid>
  );
};

export default React.memo(SearchBarSuggestBucket);