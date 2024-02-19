import {
  NetworkId,
  PortfolioAsset,
  PortfolioElement,
  PortfolioElementType,
} from '@sonarwatch/portfolio-core';
import { Cache } from '../../Cache';
import { Fetcher, FetcherExecutor } from '../../Fetcher';
import { platformId } from './constants';
import { getClientSolana } from '../../utils/clients';
import {
  getParsedMultipleAccountsInfo,
  usdcSolanaMint,
} from '../../utils/solana';
import { lpAccountStruct, lpPositionStruct } from './structs';
import tokenPriceToAssetToken from '../../utils/misc/tokenPriceToAssetToken';
import { getLpPositionsPdas, getOldLpAccountPda } from './helpers';
import { getParsedAccountInfo } from '../../utils/solana/getParsedAccountInfo';

const thirtyDays = 30 * 1000 * 60 * 60 * 24;

const executor: FetcherExecutor = async (owner: string, cache: Cache) => {
  const client = getClientSolana();

  const oldLpAccount = await getParsedAccountInfo(
    client,
    lpAccountStruct,
    getOldLpAccountPda(owner)
  );

  let id = 0;
  const lpPositions = [];
  let parsedAccount;
  do {
    const accountPubKeys = getLpPositionsPdas(owner, id, id + 10);
    parsedAccount = await getParsedMultipleAccountsInfo(
      client,
      lpPositionStruct,
      accountPubKeys
    );
    lpPositions.push(...parsedAccount);
    id += 10;
  } while (parsedAccount[parsedAccount.length]);

  const usdcTokenPrice = await cache.getTokenPrice(
    usdcSolanaMint,
    NetworkId.solana
  );
  const elements: PortfolioElement[] = [];

  if (oldLpAccount && !oldLpAccount.liquidity.isZero()) {
    const unlockStartedAt = new Date(
      oldLpAccount.lastAddLiquidityTimestamp.times(1000).toNumber()
    );
    const unlockingAt = new Date(unlockStartedAt.getTime() + thirtyDays);
    const asset: PortfolioAsset = {
      ...tokenPriceToAssetToken(
        usdcSolanaMint,
        oldLpAccount.liquidity.dividedBy(10 ** 6).toNumber(),
        NetworkId.solana,
        usdcTokenPrice
      ),
      attributes: {
        lockedUntil: unlockingAt.getTime(),
        tags: ['depreciated'],
      },
    };
    elements.push({
      type: PortfolioElementType.multiple,
      label: 'Deposit',
      networkId: NetworkId.solana,
      platformId,
      data: { assets: [asset] },
      value: asset.value,
    });
  }

  for (const lpPosition of lpPositions) {
    if (lpPosition && !lpPosition.liquidity.isZero()) {
      const unlockStartedAt = new Date(
        lpPosition.maturity.times(1000).toNumber()
      );
      const unlockingAt = new Date(unlockStartedAt.getTime() + thirtyDays);
      const asset: PortfolioAsset = {
        ...tokenPriceToAssetToken(
          usdcSolanaMint,
          lpPosition.liquidity.dividedBy(10 ** 6).toNumber(),
          NetworkId.solana,
          usdcTokenPrice
        ),
        attributes: {
          lockedUntil: unlockingAt.getTime(),
        },
      };
      elements.push({
        type: PortfolioElementType.multiple,
        label: 'Deposit',
        networkId: NetworkId.solana,
        platformId,
        data: { assets: [asset] },
        value: asset.value,
      });
    }
  }

  return elements;
};

const fetcher: Fetcher = {
  id: `${platformId}-deposits`,
  networkId: NetworkId.solana,
  executor,
};

export default fetcher;
