import BigNumber from 'bignumber.js';

import { toHex } from 'utils/ethereum';
import { fromWei, fromRay, sub, mul, RAY } from 'utils/units';
import {
  ADAPTER_BALANCE,
  MAX_AUCTION_LOT_SIZE,
  LIQUIDATION_PENALTY,
  LIQUIDATOR_ADDRESS,
  LIQUIDATION_RATIO,
  RATE,
  ILK_RATE,
  LAST_DRIP,
  PRICE_WITH_SAFETY_MARGIN,
  DEBT_CEILING
} from 'reducers/feeds';

export const rateData = addresses => name => ({
  target: addresses.MCD_JUG,
  call: ['ilks(bytes32)(uint256,uint48)', toHex(name)],
  returns: [
    [
      `${name}.${RATE}`,
      val => {
        const taxBigNumber = new BigNumber(val.toString()).dividedBy(RAY);
        const secondsPerYear = 60 * 60 * 24 * 365;
        BigNumber.config({ POW_PRECISION: 100 });
        return taxBigNumber
          .pow(secondsPerYear)
          .minus(1)
          .toFixed(3);
      }
    ],
    [`${name}.${LAST_DRIP}`]
  ]
});

export const ilkVatData = addresses => name => ({
  target: addresses.MCD_VAT,
  call: ['ilks(bytes32)(uint256,uint256,uint256,uint256,uint256)', toHex(name)],
  returns: [
    [],
    [`${name}.${ILK_RATE}`, val => fromRay(val, 5)],
    [`${name}.${PRICE_WITH_SAFETY_MARGIN}`, val => fromRay(val, 5)],
    [`${name}.${DEBT_CEILING}`, val => fromWei(val, 5)],
    []
  ]
});

export const liquidation = addresses => name => ({
  target: addresses.MCD_SPOT,
  call: ['ilks(bytes32)(address,uint256)', toHex(name)],
  returns: [
    [`${name}.pip`],
    [`${name}.${LIQUIDATION_RATIO}`, val => fromRay(mul(val, 100), 0)]
  ]
});

export const flipper = addresses => name => ({
  target: addresses.MCD_CAT,
  call: ['ilks(bytes32)(address,uint256,uint256)', toHex(name)],
  returns: [
    [`${name}.${LIQUIDATOR_ADDRESS}`],
    [
      `${name}.${LIQUIDATION_PENALTY}`,
      val => fromRay(mul(sub(val, RAY), 100), 2)
    ],
    [`${name}.${MAX_AUCTION_LOT_SIZE}`, val => fromWei(val, 5)]
  ]
});

export const adapterBalance = addresses => name => ({
  target: addresses[name],
  call: ['balanceOf(address)(uint256)', addresses[`MCD_JOIN_${name}`]],
  returns: [[`${name}.${ADAPTER_BALANCE}`, val => fromWei(val, 5)]]
});

export function createCDPTypeModel(ilk, addresses) {
  const cdpModel = [
    rateData,
    liquidation,
    flipper,
    ilkVatData,
    adapterBalance
  ].map(f => f(addresses)(ilk));
  return cdpModel;
}
