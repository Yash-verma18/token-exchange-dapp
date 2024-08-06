const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule('MyModule', (m) => {
  const account0 = m.getAccount(0);
  const account1 = m.getAccount(1);
  console.log('account1', account1);
  console.log('account0', account0);

  const uniqueSuffix = Date.now().toString();

  console.log(`Deploying Token contracts...`);

  const dapp = m.contract('Token', ['Dapp University', 'Dapp', 1000000], {
    id: `DappToken_${uniqueSuffix}`,
  });
  const mEth = m.contract('Token', ['mEth', 'mEth', 1000000], {
    id: `mEthToken_${uniqueSuffix}`,
  });
  const mDai = m.contract('Token', ['mDai', 'mDai', 1000000], {
    id: `mDaiToken_${uniqueSuffix}`,
  });

  console.log(`Deploying Exchange contract...`);
  const exchange = m.contract('Exchange', [account1, 10], {
    id: `Exchange_${uniqueSuffix}`,
  });

  // Access the addresses after deployment
  const dappAddress = dapp;
  const mEthAddress = mEth;
  const mDaiAddress = mDai;
  const exchangeAddress = exchange;

  console.log('Dapp Token deployed to:', dappAddress);
  console.log('mEth Token deployed to:', mEthAddress);
  console.log('mDai Token deployed to:', mDaiAddress);
  console.log('Exchange deployed to:', exchangeAddress);

  return { dapp, mEth, mDai, exchange };
});
