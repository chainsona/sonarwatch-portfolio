import { NetworkId, solanaNativeAddress } from '@sonarwatch/portfolio-core';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { Cache } from '../../Cache';
import {
  nxfinanceStakingIdlItem,
  platformId,
  stakePool,
  stakingPoolKey,
  stakingProgramId,
} from './constants';
import { Fetcher, FetcherExecutor } from '../../Fetcher';
import { getClientSolana } from '../../utils/clients';
import { getAutoParsedMultipleAccountsInfo } from '../../utils/solana';
import { StakingAccount, StakingPoolAccount } from './types';
import { ElementRegistry } from '../../utils/elementbuilder/ElementRegistry';

const executor: FetcherExecutor = async (owner: string, cache: Cache) => {
  const connection = getClientSolana();

  const stakingAccount = (
    await getAutoParsedMultipleAccountsInfo<StakingAccount>(
      connection,
      nxfinanceStakingIdlItem,
      [
        PublicKey.findProgramAddressSync(
          [
            new PublicKey(stakePool).toBuffer(),
            Buffer.from('nx_account', 'utf8'),
            new PublicKey(owner).toBuffer(),
          ],
          new PublicKey(stakingProgramId)
        )[0],
      ]
    )
  )[0];

  if (!stakingAccount || stakingAccount.stakedTokens === '0') return [];

  const stakePoolAccount = await cache.getItem<StakingPoolAccount>(
    stakingPoolKey,
    {
      prefix: platformId,
      networkId: NetworkId.solana,
    }
  );

  if (!stakePoolAccount) return [];

  const elementRegistry = new ElementRegistry(NetworkId.solana, platformId);
  const element = elementRegistry.addElementBorrowlend({
    label: 'Staked',
  });

  element.addSuppliedAsset({
    address: stakePoolAccount.stakeTokenMint,
    amount: stakingAccount.stakedTokens,
  });

  /* const m = new Date(
    new BigNumber(stakingAccount.lastUpdateNoteTime)
      .multipliedBy(new BigNumber(1e3))
      .toNumber()
  );
  const stakedTokens = new BigNumber(stakingAccount.stakedTokens);
  const w = new BigNumber(stakePoolAccount.increaseNoteRatePerSecond)
    .times(stakedTokens)
    .times(new BigNumber(Date.now()).minus(m.getTime()))
    .div(1e3)
    .dividedBy(10 ** 9);
  const stakedNotes = new BigNumber(stakingAccount.stakedNotes);
  const A = stakedTokens.multipliedBy(2).minus(stakedNotes);
  const M = new BigNumber(stakingAccount.notes).plus(w);

  element.addRewardAsset({
    address: stakePoolAccount.stakeTokenMint,
    amount: (M.isGreaterThan(A) ? A : M).toNumber(),
  }); */

  element.addRewardAsset({
    address: solanaNativeAddress,
    amount: stakingAccount.claimableReward,
  });

  element.addSuppliedAsset({
    address: stakePoolAccount.stakeTokenMint,
    amount: stakingAccount.withdrawingTokens,
    attributes: {
      lockedUntil: new BigNumber(stakingAccount.timeOfWithdrawApply)
        .plus(14 * 24 * 60 * 60) // 14 days
        .multipliedBy(new BigNumber(1e3))
        .toNumber(),
    },
  });

  return elementRegistry.getElements(cache);
};

const fetcher: Fetcher = {
  id: `${platformId}-staking`,
  networkId: NetworkId.solana,
  executor,
};

export default fetcher;
