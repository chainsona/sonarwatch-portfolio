import { suiNativeAddress } from '../constants';
import { isMoveTokenAddress } from './validTokenAddress';

describe('validTokenAddress', () => {
  it('should isMoveTokenAddress', async () => {
    expect(
      isMoveTokenAddress(
        '06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS'
      )
    ).toBeTruthy();
    expect(
      isMoveTokenAddress(
        '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS'
      )
    ).toBeTruthy();
    expect(
      isMoveTokenAddress(
        '0x6864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS'
      )
    ).toBeTruthy();
    expect(isMoveTokenAddress('0x1::aptos_coin::AptosCoin')).toBeTruthy();
    expect(isMoveTokenAddress('0x2::sui::SUI')).toBeTruthy();
    expect(isMoveTokenAddress(suiNativeAddress)).toBeTruthy();
  });
});
