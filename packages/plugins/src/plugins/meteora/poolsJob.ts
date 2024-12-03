import { NetworkId, TokenPriceSource } from '@sonarwatch/portfolio-core';
import { PublicKey } from '@solana/web3.js';
import { platformId, poolsProgramId } from './constants';
import { getClientSolana } from '../../utils/clients';
import {
  MintAccount,
  TokenAccount,
  getParsedMultipleAccountsInfo,
  getParsedProgramAccounts,
  mintAccountStruct,
  tokenAccountStruct,
} from '../../utils/solana';
import { PoolState, poolStateStruct } from './struct';
import { constantPoolsFilters, stablePoolsFilters } from './filters';
import { Cache } from '../../Cache';
import { Job, JobExecutor } from '../../Job';
import { getLpTokenSourceRaw } from '../../utils/misc/getLpTokenSourceRaw';

const executor: JobExecutor = async (cache: Cache) => {
  const client = getClientSolana();

  // Get all 2-tokens pool (permissionless)
  const constantPoolsAccounts = await getParsedProgramAccounts(
    client,
    poolStateStruct,
    poolsProgramId,
    constantPoolsFilters
  );
  const stablePoolsAccounts = await getParsedProgramAccounts(
    client,
    poolStateStruct,
    poolsProgramId,
    stablePoolsFilters
  );

  const poolsAcountsUnfiltered: PoolState[] = [
    ...stablePoolsAccounts,
    ...constantPoolsAccounts,
  ];

  const poolsAccounts = poolsAcountsUnfiltered.filter((poolAccount) => {
    if (!poolAccount.enabled) return false;
    return !(
      poolAccount.tokenAMint.toString() ===
        '11111111111111111111111111111111' ||
      poolAccount.tokenBMint.toString() === '11111111111111111111111111111111'
    );
  });

  // Store all tokens, lpmint, lpVaults
  const vaultsLpAddresses: Set<PublicKey> = new Set();
  const tokensMint: Set<string> = new Set();
  const lpMints: Set<PublicKey> = new Set();
  poolsAccounts.forEach((poolAccount) => {
    vaultsLpAddresses.add(poolAccount.aVaultLp);
    vaultsLpAddresses.add(poolAccount.bVaultLp);
    tokensMint.add(poolAccount.tokenAMint.toString());
    tokensMint.add(poolAccount.tokenBMint.toString());
    lpMints.add(poolAccount.lpMint);
  });

  const tokenPrices = await cache.getTokenPricesAsMap(
    [...Array.from(tokensMint)],
    NetworkId.solana
  );

  // Get all vaults token accounts
  const tokensAccounts = await getParsedMultipleAccountsInfo(
    client,
    tokenAccountStruct,
    Array.from(vaultsLpAddresses)
  );
  if (!tokensAccounts) return;
  const tokenAccountsMap: Map<string, TokenAccount> = new Map();
  tokensAccounts.forEach((tokenAccount) => {
    if (!tokenAccount) return;
    tokenAccountsMap.set(tokenAccount.pubkey.toString(), tokenAccount);
  });

  // Get all mints account
  const mintsAccounts = await getParsedMultipleAccountsInfo(
    client,
    mintAccountStruct,
    [
      ...Array.from(lpMints),
      ...Array.from(tokensMint).map((tM) => new PublicKey(tM)),
    ]
  );
  const mintsAccountByAddress: Map<string, MintAccount> = new Map();
  mintsAccounts.forEach((mintAccount) => {
    if (!mintAccount) return;
    mintsAccountByAddress.set(mintAccount.pubkey.toString(), mintAccount);
  });

  const lpSources: TokenPriceSource[] = [];
  for (let id = 0; id < poolsAccounts.length; id++) {
    const poolAccount = poolsAccounts[id];

    const aTokenMint = poolAccount.tokenAMint.toString();
    const bTokenMint = poolAccount.tokenBMint.toString();
    const aTokenPrice = tokenPrices.get(aTokenMint);
    const bTokenPrice = tokenPrices.get(bTokenMint);

    const aMintAccount = mintsAccountByAddress.get(aTokenMint);
    const bMintAccount = mintsAccountByAddress.get(bTokenMint);

    const tAccountA = tokenAccountsMap.get(poolAccount.aVaultLp.toString());
    const tAccountB = tokenAccountsMap.get(poolAccount.bVaultLp.toString());
    if (!tAccountA || !tAccountB) continue;
    if (tAccountA.amount.isZero() || tAccountB.amount.isZero()) continue;

    const lpMint = poolAccount.lpMint.toString();
    const lpMintAccount = mintsAccountByAddress.get(lpMint);
    if (!lpMintAccount) continue;

    if (aMintAccount && bMintAccount) {
      const tokenPriceSources = getLpTokenSourceRaw({
        lpDetails: {
          address: lpMint.toString(),
          decimals: lpMintAccount.decimals,
          supplyRaw: lpMintAccount.supply,
        },
        networkId: NetworkId.solana,
        platformId,
        poolUnderlyingsRaw: [
          {
            address: aTokenMint,
            decimals: aMintAccount.decimals,
            tokenPrice: aTokenPrice,
            reserveAmountRaw: tAccountA.amount,
          },
          {
            address: bTokenMint,
            decimals: bMintAccount.decimals,
            tokenPrice: bTokenPrice,
            reserveAmountRaw: tAccountB.amount,
          },
        ],
        sourceId: lpMint.toString(),
        priceUnderlyings: true,
      });
      lpSources.push(...tokenPriceSources);
    }
  }
  await cache.setTokenPriceSources(lpSources);
};

const job: Job = {
  id: `${platformId}-pools`,
  executor,
  label: 'normal',
};
export default job;
