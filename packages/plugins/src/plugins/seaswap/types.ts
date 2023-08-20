export type PoolInfo = {
  lp_token_address: string;
  lp_token_supply: string;
  token1_denom: { [k: string]: string };
  token1_reserve: string;
  token2_denom: { [k: string]: string };
  token2_reserve: string;
};

// export type Denom = Native | CW20;
// export type Native = { native: string };
// export type CW20 = { cw20: string };

export type TokenInfo = {
  decimals: number;
  name: string;
  symbol: string;
  total_supply: string;
};

export type TokenMetaData = {
  amount: number;
  id: string;
  name: string;
  precision: number;
  price: number;
  symbol: string;
  type: string;
};

export type MinterInfo = {
  cap: string;
  minter: string;
};

export type Balance = {
  balance: string;
};
