import { Box, chakra, Table, Tbody, Tr, Th, Skeleton, Show, Hide } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import type { FormEvent } from 'react';
import React from 'react';

import config from 'configs/app';
import useMarketplaceApps from 'ui/marketplace/useMarketplaceApps';
import SearchResultListItem from 'ui/searchResults/SearchResultListItem';
import SearchResultsInput from 'ui/searchResults/SearchResultsInput';
import SearchResultTableItem from 'ui/searchResults/SearchResultTableItem';
import ActionBar, { ACTION_BAR_HEIGHT_DESKTOP } from 'ui/shared/ActionBar';
import AppErrorBoundary from 'ui/shared/AppError/AppErrorBoundary';
import ContentLoader from 'ui/shared/ContentLoader';
import DataFetchAlert from 'ui/shared/DataFetchAlert';
import * as Layout from 'ui/shared/layout/components';
import PageTitle from 'ui/shared/Page/PageTitle';
import Pagination from 'ui/shared/pagination/Pagination';
import Thead from 'ui/shared/TheadSticky';
import HeaderAlert from 'ui/snippets/header/HeaderAlert';
import HeaderDesktop from 'ui/snippets/header/HeaderDesktop';
import HeaderMobile from 'ui/snippets/header/HeaderMobile';
import useSearchQuery from 'ui/snippets/searchBar/useSearchQuery';

const SearchResultsStoragePageContent = () => {
  const router = useRouter();
  const { query, redirectCheckQuery, searchTerm, debouncedSearchTerm, handleSearchTermChange } = useSearchQuery();
  const { data, isError, isPlaceholderData, pagination } = query;
  const [ showContent, setShowContent ] = React.useState(false);

  const marketplaceApps = useMarketplaceApps(debouncedSearchTerm);

  React.useEffect(() => {
    if (showContent) {
      return;
    }

    if (!debouncedSearchTerm) {
      setShowContent(true);
      return;
    }

    if (redirectCheckQuery.data?.redirect && redirectCheckQuery.data.parameter) {
      switch (redirectCheckQuery.data.type) {
        case 'block': {
          router.replace({ pathname: '/block/[height_or_hash]', query: { height_or_hash: redirectCheckQuery.data.parameter } });
          return;
        }
        case 'address': {
          router.replace({ pathname: '/address/[hash]', query: { hash: redirectCheckQuery.data.parameter } });
          return;
        }
        case 'transaction': {
          router.replace({ pathname: '/tx/[hash]', query: { hash: redirectCheckQuery.data.parameter } });
          return;
        }
        case 'user_operation': {
          if (config.features.userOps.isEnabled) {
            router.replace({ pathname: '/op/[hash]', query: { hash: redirectCheckQuery.data.parameter } });
            return;
          }
          break;
        }
        case 'blob': {
          if (config.features.dataAvailability.isEnabled) {
            router.replace({ pathname: '/blobs/[hash]', query: { hash: redirectCheckQuery.data.parameter } });
            return;
          }
          break;
        }
      }
    }

    !redirectCheckQuery.isPending && setShowContent(true);
  }, [ redirectCheckQuery, router, debouncedSearchTerm, showContent ]);

  const handleSubmit = React.useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, [ ]);

  const displayedItems = (data?.items || []).filter((item) => {
    if (!config.features.userOps.isEnabled && item.type === 'user_operation') {
      return false;
    }
    if (!config.features.dataAvailability.isEnabled && item.type === 'blob') {
      return false;
    }
    if (!config.features.nameService.isEnabled && item.type === 'ens_domain') {
      return false;
    }
    return true;
  });

  const content = (() => {
    if (isError) {
      return <DataFetchAlert/>;
    }

    const hasData = displayedItems.length || (pagination.page === 1 && marketplaceApps.displayedApps.length);

    if (!hasData) {
      return null;
    }

    return (
      <>
        <Show below="lg" ssr={ false }>
          { pagination.page === 1 && marketplaceApps.displayedApps.map((item, index) => (
            <SearchResultListItem
              key={ 'actual_' + index }
              data={{ type: 'app', app: item }}
              searchTerm={ debouncedSearchTerm }
            />
          )) }
          { displayedItems.map((item, index) => (
            <SearchResultListItem
              key={ (isPlaceholderData ? 'placeholder_' : 'actual_') + index }
              data={ item }
              searchTerm={ debouncedSearchTerm }
              isLoading={ isPlaceholderData }
            />
          )) }
        </Show>
        <Hide below="lg" ssr={ false }>
          <Table variant="simple" size="md" fontWeight={ 500 }>
            <Thead top={ pagination.isVisible ? ACTION_BAR_HEIGHT_DESKTOP : 0 }>
              <Tr>
                <Th width="30%">Search result</Th>
                <Th width="35%"/>
                <Th width="35%" pr={ 10 }/>
                <Th width="150px">Category</Th>
              </Tr>
            </Thead>
            <Tbody>
              { pagination.page === 1 && marketplaceApps.displayedApps.map((item, index) => (
                <SearchResultTableItem
                  key={ 'actual_' + index }
                  data={{ type: 'app', app: item }}
                  searchTerm={ debouncedSearchTerm }
                />
              )) }
              { displayedItems.map((item, index) => (
                <SearchResultTableItem
                  key={ (isPlaceholderData ? 'placeholder_' : 'actual_') + index }
                  data={ item }
                  searchTerm={ debouncedSearchTerm }
                  isLoading={ isPlaceholderData }
                />
              )) }
            </Tbody>
          </Table>
        </Hide>
      </>
    );
  })();

  const bar = (() => {
    if (isError) {
      return null;
    }

    const resultsCount = pagination.page === 1 && !data?.next_page_params ? (displayedItems.length || 0) + marketplaceApps.displayedApps.length : '50+';

    const text = isPlaceholderData && pagination.page === 1 ? (
      <Skeleton h={ 6 } w="280px" borderRadius="full" mb={ pagination.isVisible ? 0 : 6 }/>
    ) : (
      (
        <Box mb={ pagination.isVisible ? 0 : 6 } lineHeight="32px">
          <span>Found </span>
          <chakra.span fontWeight={ 700 }>
            { resultsCount }
          </chakra.span>
          <span> matching result{ (((displayedItems.length || 0) + marketplaceApps.displayedApps.length) > 1) || pagination.page > 1 ? 's' : '' } for </span>
          “<chakra.span fontWeight={ 700 }>{ debouncedSearchTerm }</chakra.span>”
        </Box>
      )
    );

    if (!pagination.isVisible) {
      return text;
    }

    return (
      <>
        <Box display={{ base: 'block', lg: 'none' }}>{ text }</Box>
        <ActionBar mt={{ base: 0, lg: -6 }} alignItems="center">
          <Box display={{ base: 'none', lg: 'block' }}>{ text }</Box>
          <Pagination { ...pagination }/>
        </ActionBar>
      </>
    );
  })();

  const renderSearchBar = React.useCallback(() => {
    return (
      <SearchResultsInput
        searchTerm={ searchTerm }
        handleSubmit={ handleSubmit }
        handleSearchTermChange={ handleSearchTermChange }
      />
    );
  }, [ handleSearchTermChange, handleSubmit, searchTerm ]);

  const pageContent = !showContent ? <ContentLoader/> : (
    <>
      <PageTitle title="Search results"/>
      { bar }
      { content }
    </>
  );

  return (
    <>
      <HeaderMobile renderSearchBar={ renderSearchBar }/>
      <Layout.MainArea>
        <Layout.SideBar/>
        <Layout.MainColumn>
          <HeaderAlert/>
          <HeaderDesktop renderSearchBar={ renderSearchBar }/>
          <AppErrorBoundary>
            <Layout.Content>
              { pageContent }
            </Layout.Content>
          </AppErrorBoundary>
        </Layout.MainColumn>
      </Layout.MainArea>
      <Layout.Footer/>
    </>
  );
};

export default React.memo(SearchResultsStoragePageContent);
