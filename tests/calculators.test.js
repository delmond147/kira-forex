/**
 * KIRAFOREX DIGITAL PLATFORM — AUTOMATED TEST SUITE FOR CALCULATORS & RULES
 * Run with: node tests/calculators.test.js
 */

const assert = require('assert');

// 1. Mock calculation functions directly to test logic deterministically
function calculatePositionSize({ accountBalance, riskPercentage, riskAmount, entryPrice, stopLossPrice, instrumentType }) {
  if (accountBalance <= 0) {
    return { isValid: false, errorMessage: 'Account balance must be greater than zero.' };
  }

  let effectiveRisk = 0;
  if (riskAmount !== undefined && riskAmount > 0) {
    effectiveRisk = Math.min(riskAmount, accountBalance);
  } else if (riskPercentage !== undefined && riskPercentage > 0) {
    effectiveRisk = (accountBalance * Math.min(riskPercentage, 100)) / 100;
  } else {
    return { isValid: false, errorMessage: 'Invalid risk amount or percentage.' };
  }

  const priceDiff = Math.abs(entryPrice - stopLossPrice);
  if (priceDiff <= 0) {
    return { isValid: false, errorMessage: 'Entry price and stop-loss cannot be equal.' };
  }

  let pips = 0;
  let lotSize = 0;

  if (instrumentType === 'forex_standard') {
    pips = Number((priceDiff / 0.0001).toFixed(1));
    const pipValueStandardLot = 10;
    lotSize = effectiveRisk / (pips * pipValueStandardLot);
  } else if (instrumentType === 'forex_jpy') {
    pips = Number((priceDiff / 0.01).toFixed(1));
    lotSize = effectiveRisk / (pips * 7.0);
  } else if (instrumentType === 'synthetic_volatility') {
    pips = Number(priceDiff.toFixed(2));
    lotSize = effectiveRisk / priceDiff;
  }

  const roundedLot = Math.max(0.01, Number(lotSize.toFixed(2)));
  return {
    isValid: true,
    monetaryRisk: effectiveRisk,
    stopDistancePips: pips,
    calculatedLotSize: roundedLot,
  };
}

function calculateRiskReward({ direction, entryPrice, stopLossPrice, takeProfitPrice }) {
  if (entryPrice <= 0 || stopLossPrice <= 0 || takeProfitPrice <= 0) {
    return { isValid: false };
  }

  let riskDist = 0;
  let rewardDist = 0;

  if (direction === 'LONG') {
    if (stopLossPrice >= entryPrice || takeProfitPrice <= entryPrice) {
      return { isValid: false, error: 'Invalid LONG setup parameters' };
    }
    riskDist = entryPrice - stopLossPrice;
    rewardDist = takeProfitPrice - entryPrice;
  } else {
    if (stopLossPrice <= entryPrice || takeProfitPrice >= entryPrice) {
      return { isValid: false, error: 'Invalid SHORT setup parameters' };
    }
    riskDist = stopLossPrice - entryPrice;
    rewardDist = entryPrice - takeProfitPrice;
  }

  const ratio = rewardDist / riskDist;
  const breakevenWinRate = (1 / (1 + ratio)) * 100;

  return {
    isValid: true,
    ratio: Number(ratio.toFixed(2)),
    ratioString: `1:${ratio.toFixed(2)}`,
    breakevenWinRate: Number(breakevenWinRate.toFixed(1)),
  };
}

function isEventActive(status, expiryDateString) {
  if (status !== 'published') return false;
  const expiryTime = new Date(expiryDateString).getTime();
  return expiryTime > Date.now();
}

// ---------------------------------------------------------
// TEST EXECUTION
// ---------------------------------------------------------
let passed = 0;
let total = 0;

function it(description, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
  }
}

console.log('\n--- 1. Testing Position Size Calculator ---');

it('calculates standard 2% risk on $10,000 account with 20-pip SL (EURUSD)', () => {
  const res = calculatePositionSize({
    accountBalance: 10000,
    riskPercentage: 2,
    entryPrice: 1.0850,
    stopLossPrice: 1.0830,
    instrumentType: 'forex_standard',
  });
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.monetaryRisk, 200);
  assert.strictEqual(res.stopDistancePips, 20);
  assert.strictEqual(res.calculatedLotSize, 1.0); // $200 / (20 * $10) = 1.0 Lot
});

it('rejects zero or negative balance', () => {
  const res = calculatePositionSize({
    accountBalance: 0,
    riskPercentage: 2,
    entryPrice: 1.0850,
    stopLossPrice: 1.0830,
    instrumentType: 'forex_standard',
  });
  assert.strictEqual(res.isValid, false);
});

it('rejects identical entry and stop-loss price', () => {
  const res = calculatePositionSize({
    accountBalance: 5000,
    riskPercentage: 1,
    entryPrice: 1.0850,
    stopLossPrice: 1.0850,
    instrumentType: 'forex_standard',
  });
  assert.strictEqual(res.isValid, false);
});

console.log('\n--- 2. Testing Risk-to-Reward Calculator ---');

it('calculates 1:3 R:R for valid LONG setup (EURUSD)', () => {
  const res = calculateRiskReward({
    direction: 'LONG',
    entryPrice: 1.1000,
    stopLossPrice: 1.0950, // 50 pips risk
    takeProfitPrice: 1.1150, // 150 pips reward
  });
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.ratio, 3.0);
  assert.strictEqual(res.ratioString, '1:3.00');
  assert.strictEqual(res.breakevenWinRate, 25.0); // 1 / (1 + 3) = 25%
});

it('rejects LONG setup if stop loss is higher than entry', () => {
  const res = calculateRiskReward({
    direction: 'LONG',
    entryPrice: 1.1000,
    stopLossPrice: 1.1050, // Invalid!
    takeProfitPrice: 1.1200,
  });
  assert.strictEqual(res.isValid, false);
});

it('calculates 1:2 R:R for valid SHORT setup', () => {
  const res = calculateRiskReward({
    direction: 'SHORT',
    entryPrice: 1.2500,
    stopLossPrice: 1.2550, // 50 pips risk
    takeProfitPrice: 1.2400, // 100 pips reward
  });
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.ratio, 2.0);
  assert.strictEqual(res.breakevenWinRate, 33.3);
});

console.log('\n--- 3. Testing Event Expiry Logic ---');

it('marks past event as expired', () => {
  const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(); // 1 day ago
  const active = isEventActive('published', pastDate);
  assert.strictEqual(active, false);
});

it('keeps future published event active', () => {
  const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days ahead
  const active = isEventActive('published', futureDate);
  assert.strictEqual(active, true);
});

it('excludes draft events even if future date', () => {
  const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  const active = isEventActive('draft', futureDate);
  assert.strictEqual(active, false);
});

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed}/${total} passed (${((passed/total)*100).toFixed(0)}%)`);
console.log(`========================================\n`);

if (passed !== total) process.exit(1);
