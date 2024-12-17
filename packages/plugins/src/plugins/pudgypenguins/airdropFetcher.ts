import { NetworkId } from '@sonarwatch/portfolio-core';
import {
  AirdropFetcher,
  AirdropFetcherExecutor,
  getAirdropRaw,
  airdropFetcherToFetcher,
} from '../../AirdropFetcher';

import { airdropApi, airdropStatics, pudgyMint, platform } from './constants';
import { AirdropResponse } from './types';

const executor: AirdropFetcherExecutor = async (owner: string) => {
  try {
    const res = await fetch(`${airdropApi + owner}?`);
    const response: AirdropResponse = await res.json();

    const items = response.categories
      .map((category) => category.items.filter((i) => i.address === owner))
      .flat();

    if (items.length) {
      const amount = items.reduce(
        (previousValue, item) => Number(item?.amount || 0) + previousValue,
        0
      );
      const isClaimed = response.totalUnclaimed < amount;

      return getAirdropRaw({
        statics: airdropStatics,
        items: [
          {
            amount,
            isClaimed,
            label: 'PENGU',
            address: pudgyMint,
          },
        ],
      });
    }
  } catch (err) {}

  return getAirdropRaw({
    statics: airdropStatics,
    items: [
      {
        amount: 0,
        isClaimed: false,
        label: 'PENGU',
        address: pudgyMint,
      },
    ],
  });
};

export const airdropFetcher: AirdropFetcher = {
  id: airdropStatics.id,
  networkId: NetworkId.solana,
  executor,
};

export const fetcher = airdropFetcherToFetcher(
  airdropFetcher,
  platform.id,
  'pudgy-airdrop',
  airdropStatics.claimEnd
);
