import React, { useState } from 'react';
import useOraclePrices from 'hooks/useOraclePrices';
import { Box, Flex, Text } from '@makerdao/ui-components-core';

import styled from 'styled-components';
import { ReactComponent as BatIcon } from 'images/oasis-tokens/bat.svg';
import { ReactComponent as EthIcon } from 'images/oasis-tokens/eth.svg';
import { ReactComponent as UsdcIcon } from 'images/oasis-tokens/usdc.svg';
import { ReactComponent as WbtcIcon } from 'images/oasis-tokens/wbtc.svg';

import { ReactComponent as CaratDown } from 'images/carat-down-filled.svg';

const Dropdown = (() => {
  const Trigger = styled(Flex)`
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    border: 1px solid #d4d9e1;
    border-radius: 5px;
    padding-right: 27.79px;
    cursor: pointer;
  `;

  const Items = styled(Box)`
    position: absolute;
    width: calc(100% - 2px);
    top: calc(100% + 5px);
    right: 0;
    background: #ffffff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    padding-top: 12px;
    padding-left: 1px;
    padding-bottom: 16px;

    .item:hover .text {
      opacity: 0.6;
    }
  `;

  const DropdownStyle = styled(Box)`
    width: 396px;
    position: relative;
  `;

  return ({ items, onSelected }) => {
    const [selected, setSelected] = useState(items[0].value);
    const [isOpen, setIsOpen] = useState(false);

    const getSelectedItem = () => items.find(gem => gem.value === selected);

    return (
      <DropdownStyle>
        <Trigger onClick={() => setIsOpen(!isOpen)}>
          {getSelectedItem().render()}
          <CaratDown style={{ fill: '#231536' }} />
        </Trigger>
        <Items display={isOpen ? 'block' : 'none'}>
          {items
            .filter(item => item.value !== selected)
            .map(item => (
              <div
                key={item.value}
                onClick={() => {
                  setSelected(item.value);
                  onSelected(item.value);
                  setIsOpen(false);
                }}
              >
                {item.render()}
              </div>
            ))}
        </Items>
      </DropdownStyle>
    );
  };
})();

const CalculatorStyle = styled(Box)`
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  width: 980px;
  height: 554px;
  padding: 20px;
`;

// can_borrow = (deposit_amount*price)/(ratio/100)

const ItemWithIconStyle = styled.div`
  height: 58px;
  display: flex;
  align-items: center;
  text-align: left;
  padding-left: 26.83px;
  cursor: pointer;

  svg {
    margin-right: 14px;
  }
`;

const ItemWithIcon = ({ img, text }) => (
  <ItemWithIconStyle className="item">
    {img}
    <Text className="text" fontSize="18px" letterSpacing="0.5px">
      {text}
    </Text>
  </ItemWithIconStyle>
);

const BorrowCalculator = () => {
  // todo: find where to better get the price from in the code
  const { currentPrice: ethPrice } = useOraclePrices({ gem: 'ETH' });
  const { currentPrice: batPrice } = useOraclePrices({ gem: 'BAT' });
  const { currentPrice: usdcPrice } = useOraclePrices({ gem: 'USDC' });

  console.log('PRICE:', ethPrice?.toString());
  const gems = [
    { symbol: 'ETH', name: 'Ethereum', Icon: EthIcon, price: ethPrice },
    { symbol: 'BAT', Icon: BatIcon, price: batPrice },
    { symbol: 'USDC', Icon: UsdcIcon, price: usdcPrice }
  ];

  const [selectedValue, setSelectedValue] = useState(gems[0].symbol);
  const selectedGem = gems.find(gem => gem.symbol === selectedValue);

  return (
    <CalculatorStyle>
      <Dropdown
        items={gems.map(gem => ({
          value: gem.symbol,
          render: () => (
            <ItemWithIcon
              text={gem.name || gem.symbol}
              img={<gem.Icon width="28.33" height="28.33" />}
            />
          )
        }))}
        onSelected={selected => setSelectedValue(selected)}
      />
      <div>
        {selectedGem.symbol} price:{' '}
        {selectedGem.price && selectedGem.price.toString()}
      </div>
    </CalculatorStyle>
  );
};

export { BorrowCalculator };
