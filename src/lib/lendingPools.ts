import { prisma } from '@/lib/prisma';

function getTokenIcon(token) {
  switch (token) {
    case 'ETH':
      return '💠';
    case 'USDC':
      return '💵';
    case 'DAI':
      return '◈';
    case 'WBTC':
      return '₿';
    case 'GO':
      return '⟠'; // or any icon for your custom token
    default:
      return '🟢';
  }
}

function calculateMaxLoan(liquidity) {
  return Number(liquidity) * 0.5;
}

export async function getLendingPools() {
  const pools = await prisma.pool.findMany();

  const lendingPools = pools.map((pool) => ({
    token: pool.asset_symbol,
    icon: getTokenIcon(pool.asset_symbol),
    interest_rate: parseFloat(pool.base_interest_rate), // assuming this field exists
    liquidity: parseFloat(pool.total_liquidity),
    borrowed: parseFloat(pool.total_borrowed),
    maxLoan: calculateMaxLoan(pool.total_liquidity),
  }));

  return lendingPools;
}
