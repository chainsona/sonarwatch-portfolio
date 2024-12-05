import { GetProgramAccountsFilter } from '@solana/web3.js';

export const vaultsFilters: GetProgramAccountsFilter[] = [{ dataSize: 10240 }];

export const constantPoolsFilters: GetProgramAccountsFilter[] = [
  { dataSize: 944 },
];

export const stablePoolsFilters: GetProgramAccountsFilter[] = [
  { dataSize: 1387 },
];

export const farmAccountFilter = (
  owner: string
): GetProgramAccountsFilter[] => [
  { dataSize: 200 },
  {
    memcmp: {
      offset: 40,
      bytes: owner,
    },
  },
];

export const dlmmPositionAccountFilter = (
  owner: string
): GetProgramAccountsFilter[] => [
  { dataSize: 7560 },
  {
    memcmp: {
      offset: 40,
      bytes: owner,
    },
  },
];

export const dlmmPositionV2AccountFilter = (
  owner: string
): GetProgramAccountsFilter[] => [
  { dataSize: 8120 },
  {
    memcmp: {
      offset: 40,
      bytes: owner,
    },
  },
];

export const stakeEscrowFilter = (
  owner: string
): GetProgramAccountsFilter[] => [
  {
    memcmp: {
      offset: 8,
      bytes: owner,
    },
  },
  {
    dataSize: 520,
  },
];

export const feeVaultFilter = (): GetProgramAccountsFilter[] => [
  {
    dataSize: 1048,
  },
];
