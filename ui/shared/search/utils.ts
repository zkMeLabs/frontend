import type { SearchResultItem } from 'types/api/search';
import type { MarketplaceAppOverview } from 'types/client/marketplace';

import config from 'configs/app';

export type ApiCategory = 'token' | 'nft' | 'address' | 'public_tag' | 'transaction' | 'block' | 'user_operation' | 'blob' | 'domain' | 'all';
export type GraphQLCategory = 'buckets' | 'objects' | 'groups';
export type Category = ApiCategory | GraphQLCategory | 'app' | 'all';

export type ItemsCategoriesMap =
Record<ApiCategory | GraphQLCategory, Array<SearchResultItem>> &
Record<'app', Array<MarketplaceAppOverview>>;

export type SearchResultAppItem = {
  type: 'app';
  app: MarketplaceAppOverview;
}

export const searchCategories: Array<{id: Category; title: string }> = [
  { id: 'all', title: 'All' },
  { id: 'app', title: 'DApps' },
  { id: 'token', title: `Tokens (${ config.chain.tokenStandard }-20)` },
  { id: 'nft', title: `NFTs (${ config.chain.tokenStandard }-721 & 1155)` },
  { id: 'address', title: 'Addresses' },
  { id: 'public_tag', title: 'Public tags' },
  { id: 'transaction', title: 'Transactions' },
  { id: 'block', title: 'Blocks' },
  { id: 'buckets', title: 'Buckets' },
  { id: 'objects', title: 'Objects' },
  { id: 'groups', title: 'Groups' },
];

if (config.features.userOps.isEnabled) {
  searchCategories.push({ id: 'user_operation', title: 'User operations' });
}

if (config.features.dataAvailability.isEnabled) {
  searchCategories.push({ id: 'blob', title: 'Blobs' });
}

if (config.features.nameService.isEnabled) {
  searchCategories.push({ id: 'domain', title: 'Names' });
}

export const searchItemTitles: Record<Category, { itemTitle: string; itemTitleShort: string }> = {
  all: { itemTitle: 'All', itemTitleShort: 'All' },
  app: { itemTitle: 'DApp', itemTitleShort: 'App' },
  domain: { itemTitle: 'Name', itemTitleShort: 'Name' },
  token: { itemTitle: 'Token', itemTitleShort: 'Token' },
  nft: { itemTitle: 'NFT', itemTitleShort: 'NFT' },
  address: { itemTitle: 'Address', itemTitleShort: 'Address' },
  public_tag: { itemTitle: 'Public tag', itemTitleShort: 'Tag' },
  transaction: { itemTitle: 'Transaction', itemTitleShort: 'Txn' },
  block: { itemTitle: 'Block', itemTitleShort: 'Block' },
  user_operation: { itemTitle: 'User operation', itemTitleShort: 'User op' },
  blob: { itemTitle: 'Blob', itemTitleShort: 'Blob' },
  buckets: { itemTitle: 'Bucket', itemTitleShort: 'Bucket' },
  objects: { itemTitle: 'Object', itemTitleShort: 'Object' },
  groups: { itemTitle: 'Group', itemTitleShort: 'Group' },
};

export function getItemCategory(item: SearchResultItem | SearchResultAppItem): Category | undefined {
  switch (item.type) {
    case 'address':
    case 'contract': {
      return 'address';
    }
    case 'token': {
      if (item.token_type === 'ERC-20') {
        return 'token';
      }
      return 'nft';
    }
    case 'block': {
      return 'block';
    }
    case 'label': {
      return 'public_tag';
    }
    case 'transaction': {
      return 'transaction';
    }
    case 'app': {
      return 'app';
    }
    case 'user_operation': {
      return 'user_operation';
    }
    case 'blob': {
      return 'blob';
    }
    case 'ens_domain': {
      return 'domain';
    }
    case 'buckets': {
      return 'buckets';
    }
    case 'objects': {
      return 'objects';
    }
    case 'groups': {
      return 'groups';
    }
  }
}

export function getItemCategoryForGraphql(type: string): Category | undefined {
  switch (type) {
    case 'buckets': {
      return 'buckets';
    }
    case 'objects': {
      return 'objects';
    }
    case 'groups': {
      return 'groups';
    }
  }
}
