import { Platform } from '@sonarwatch/portfolio-core';

export const platformId = 'sushiswap';
export const sushiswapPlatform: Platform = {
  id: platformId,
  name: 'Sushiswap',
  image: 'https://sonar.watch/img/platforms/sushiswap.png',
  defiLlamaId: 'sushiswap', // from https://defillama.com/docs/api
  website: 'https://www.sushi.com/',
  twitter: 'https://twitter.com/SushiSwap',
};

export const theGraphV3 =
  'https://api.thegraph.com/subgraphs/name/sushi-v3/v3-ethereum';
export const ethereumTheGraphV2 =
  'https://api.thegraph.com/subgraphs/name/sushiswap/exchange';
export const avalancheTheGraphV2 =
  'https://api.thegraph.com/subgraphs/name/sushiswap/avalanche-exchange';
export const polygonTheGraphV2 =
  'https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange';
export const bnbTheGraphV2 =
  'https://api.thegraph.com/subgraphs/name/sushiswap/bsc-exchange';
