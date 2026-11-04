/**
 * KIRAFOREX DIGITAL PLATFORM — TRADING CALCULATION ENGINE
 * Pure, deterministic functions with strict edge-case and precision handling.
 */

export interface PositionSizeInput {
  accountBalance: number;
  riskPercentage?: number;
  riskAmount?: number;
  entryPrice: number;
  stopLossPrice: number;
  instrumentType: 'forex_standard' | 'forex_jpy' | 'synthetic_volatility' | 'synthetic_boom_crash' | 'crypto_gold';
  contractSize?: number; // default 100,000 for standard forex
}

export interface PositionSizeResult {
  monetaryRisk: number;
  stopDistancePoints: number;
  stopDistancePips: number;
  calculatedLotSize: number;
  standardLotSize: number;
  estimatedLossAtSL: number;
  calculationAssumptions: string[];
  isValid: boolean;
  errorMessage?: string;
}

/**
 * 1. Risk and Position Size Calculator
 */
export function calculatePositionSize(input: PositionSizeInput): PositionSizeResult {
  const {
    accountBalance,
    riskPercentage,
    riskAmount,
    entryPrice,
    stopLossPrice,
    instrumentType,
  } = input;

  if (accountBalance <= 0) {
    return {
      monetaryRisk: 0,
      stopDistancePoints: 0,
      stopDistancePips: 0,
      calculatedLotSize: 0,
      standardLotSize: 0,
      estimatedLossAtSL: 0,
      calculationAssumptions: [],
      isValid: false,
      errorMessage: 'Account balance must be greater than zero.',
    };
  }

  // Calculate monetary risk
  let effectiveRisk = 0;
  if (riskAmount !== undefined && riskAmount > 0) {
    effectiveRisk = Math.min(riskAmount, accountBalance);
  } else if (riskPercentage !== undefined && riskPercentage > 0) {
    effectiveRisk = (accountBalance * Math.min(riskPercentage, 100)) / 100;
  } else {
    return {
      monetaryRisk: 0,
      stopDistancePoints: 0,
      stopDistancePips: 0,
      calculatedLotSize: 0,
      standardLotSize: 0,
      estimatedLossAtSL: 0,
      calculationAssumptions: [],
      isValid: false,
      errorMessage: 'Please specify either a valid risk percentage or fixed dollar risk amount.',
    };
  }

  const priceDiff = Math.abs(entryPrice - stopLossPrice);
  if (priceDiff <= 0) {
    return {
      monetaryRisk: effectiveRisk,
      stopDistancePoints: 0,
      stopDistancePips: 0,
      calculatedLotSize: 0,
      standardLotSize: 0,
      estimatedLossAtSL: 0,
      calculationAssumptions: [],
      isValid: false,
      errorMessage: 'Entry price and stop-loss price cannot be identical.',
    };
  }

  let pips = 0;
  let lotSize = 0;
  const assumptions: string[] = [];

  switch (instrumentType) {
    case 'forex_standard': {
      // 4-decimal currency pairs: 1 pip = 0.0001
      pips = Number((priceDiff / 0.0001).toFixed(1));
      // Standard 100,000 unit contract: 1 lot = $10 per pip
      const pipValueStandardLot = 10;
      lotSize = effectiveRisk / (pips * pipValueStandardLot);
      assumptions.push('Assumes standard Forex contract size of 100,000 units.');
      assumptions.push('1 standard lot pip value ≈ $10.00 (USD quote).');
      break;
    }
    case 'forex_jpy': {
      // 2-decimal JPY pairs: 1 pip = 0.01
      pips = Number((priceDiff / 0.01).toFixed(1));
      // Standard 100k contract on USD/JPY approx pip value
      const jpyPipValue = 1000 / (entryPrice > 0 ? entryPrice : 150);
      lotSize = effectiveRisk / (pips * (jpyPipValue > 0 ? jpyPipValue : 6.8));
      assumptions.push('Calculated with JPY pip unit of 0.01.');
      assumptions.push(`Adjusted for current quote rate (${entryPrice.toFixed(2)}).`);
      break;
    }
    case 'synthetic_volatility': {
      // Deriv Volatility Indices (e.g. Vol 75, Vol 100)
      pips = Number(priceDiff.toFixed(2));
      // Lot size formula based on point movement
      lotSize = effectiveRisk / priceDiff;
      assumptions.push('Synthetics Volatility Index point pricing.');
      assumptions.push('Minimum contract volume depends on broker specifications (e.g. 0.001 on V75).');
      break;
    }
    case 'synthetic_boom_crash': {
      pips = Number(priceDiff.toFixed(2));
      lotSize = effectiveRisk / priceDiff;
      assumptions.push('Deriv Boom/Crash Index tick calculation.');
      assumptions.push('Always account for unexpected spike slippage beyond stop loss.');
      break;
    }
    case 'crypto_gold': {
      // Gold (XAUUSD): 1 point = $1 on 100 oz contract
      pips = Number((priceDiff * 10).toFixed(1));
      lotSize = effectiveRisk / (priceDiff * 100);
      assumptions.push('Assumes standard Gold (XAU/USD) 100-ounce contract.');
      assumptions.push('$1.00 move in gold price = $100 per standard lot.');
      break;
    }
  }

  // Round lots to 2 decimal places (standard micro-lot precision 0.01)
  const roundedLot = Math.max(0.01, Number(lotSize.toFixed(2)));
  const estimatedLoss = Number((effectiveRisk).toFixed(2));

  return {
    monetaryRisk: Number(effectiveRisk.toFixed(2)),
    stopDistancePoints: Number(priceDiff.toFixed(4)),
    stopDistancePips: pips,
    calculatedLotSize: roundedLot,
    standardLotSize: roundedLot,
    estimatedLossAtSL: estimatedLoss,
    calculationAssumptions: assumptions,
    isValid: true,
  };
}

/**
 * 2. Risk-to-Reward (R:R) Calculator
 */
export interface RiskRewardInput {
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  positionSizeLots?: number;
}

export interface RiskRewardResult {
  riskDistance: number;
  rewardDistance: number;
  riskRewardRatio: string;
  ratioNumber: number;
  breakevenWinRatePercent: number;
  potentialProfit?: number;
  potentialLoss?: number;
  isValid: boolean;
  errorMessage?: string;
}

export function calculateRiskReward(input: RiskRewardInput): RiskRewardResult {
  const { direction, entryPrice, stopLossPrice, takeProfitPrice, positionSizeLots = 1.0 } = input;

  if (entryPrice <= 0 || stopLossPrice <= 0 || takeProfitPrice <= 0) {
    return {
      riskDistance: 0,
      rewardDistance: 0,
      riskRewardRatio: '0:0',
      ratioNumber: 0,
      breakevenWinRatePercent: 0,
      isValid: false,
      errorMessage: 'Prices must be positive numbers.',
    };
  }

  let riskDist = 0;
  let rewardDist = 0;

  if (direction === 'LONG') {
    if (stopLossPrice >= entryPrice) {
      return {
        riskDistance: 0,
        rewardDistance: 0,
        riskRewardRatio: '0:0',
        ratioNumber: 0,
        breakevenWinRatePercent: 0,
        isValid: false,
        errorMessage: 'For a LONG trade, Stop Loss must be strictly below Entry Price.',
      };
    }
    if (takeProfitPrice <= entryPrice) {
      return {
        riskDistance: 0,
        rewardDistance: 0,
        riskRewardRatio: '0:0',
        ratioNumber: 0,
        breakevenWinRatePercent: 0,
        isValid: false,
        errorMessage: 'For a LONG trade, Take Profit must be strictly above Entry Price.',
      };
    }
    riskDist = entryPrice - stopLossPrice;
    rewardDist = takeProfitPrice - entryPrice;
  } else {
    // SHORT
    if (stopLossPrice <= entryPrice) {
      return {
        riskDistance: 0,
        rewardDistance: 0,
        riskRewardRatio: '0:0',
        ratioNumber: 0,
        breakevenWinRatePercent: 0,
        isValid: false,
        errorMessage: 'For a SHORT trade, Stop Loss must be strictly above Entry Price.',
      };
    }
    if (takeProfitPrice >= entryPrice) {
      return {
        riskDistance: 0,
        rewardDistance: 0,
        riskRewardRatio: '0:0',
        ratioNumber: 0,
        breakevenWinRatePercent: 0,
        isValid: false,
        errorMessage: 'For a SHORT trade, Take Profit must be strictly below Entry Price.',
      };
    }
    riskDist = stopLossPrice - entryPrice;
    rewardDist = entryPrice - takeProfitPrice;
  }

  const ratio = rewardDist / riskDist;
  const breakevenWinRate = (1 / (1 + ratio)) * 100;

  // Approximate dollar values assuming standard 100k unit contract ($10/pip on 0.0001)
  const pipDistanceRisk = riskDist / 0.0001;
  const pipDistanceReward = rewardDist / 0.0001;
  const estLoss = pipDistanceRisk * 10 * positionSizeLots;
  const estProfit = pipDistanceReward * 10 * positionSizeLots;

  return {
    riskDistance: Number(riskDist.toFixed(5)),
    rewardDistance: Number(rewardDist.toFixed(5)),
    riskRewardRatio: `1:${ratio.toFixed(2)}`,
    ratioNumber: Number(ratio.toFixed(2)),
    breakevenWinRatePercent: Number(breakevenWinRate.toFixed(1)),
    potentialLoss: Number(estLoss.toFixed(2)),
    potentialProfit: Number(estProfit.toFixed(2)),
    isValid: true,
  };
}

/**
 * 3. Pip and Price Movement Calculator
 */
export interface PipCalculatorInput {
  isJpyPair: boolean;
  priceStart: number;
  priceEnd: number;
  lotSize: number;
}

export function calculatePipMovement(input: PipCalculatorInput) {
  const { isJpyPair, priceStart, priceEnd, lotSize } = input;
  const pipUnit = isJpyPair ? 0.01 : 0.0001;
  const diff = Math.abs(priceEnd - priceStart);
  const pips = Number((diff / pipUnit).toFixed(1));
  const standardPipValue = isJpyPair ? 7.5 : 10.0; // Approx USD pip value per standard lot
  const totalValue = Number((pips * standardPipValue * lotSize).toFixed(2));

  return {
    pips,
    pipUnit,
    totalValue,
    formattedMovement: `${pips} pips ($${totalValue.toLocaleString()})`,
  };
}

/**
 * 4. Sentiment Gauge Indicator (Low, Neutral, Strong)
 */
export interface SentimentInput {
  trendScore: number; // 0 to 100
  momentumConfirmed: boolean;
  volumeAboveAverage: boolean;
  htfAligned: boolean;
}

export interface SentimentResult {
  score: number;
  rating: 'Low' | 'Neutral' | 'Strong';
  label: string;
  badgeColor: string;
}

export function calculateSentimentGauge(input: SentimentInput): SentimentResult {
  let score = Math.max(0, Math.min(100, input.trendScore));
  
  if (input.momentumConfirmed) score += 10;
  if (input.volumeAboveAverage) score += 10;
  if (input.htfAligned) score += 15;

  score = Math.min(100, score);

  if (score < 40) {
    return {
      score,
      rating: 'Low',
      label: 'Weak / Choppy Market Bias',
      badgeColor: '#EF4444', // Red
    };
  } else if (score < 70) {
    return {
      score,
      rating: 'Neutral',
      label: 'Consolidating / Moderate Trend',
      badgeColor: '#F59E0B', // Amber
    };
  } else {
    return {
      score,
      rating: 'Strong',
      label: 'High Conviction Trend Impulse',
      badgeColor: '#008751', // Academy Emerald
    };
  }
}

/**
 * 5. Event Expiry Evaluator
 */
export function isEventActive(status: string, expiryDateString: string): boolean {
  if (status !== 'published') return false;
  const expiryTime = new Date(expiryDateString).getTime();
  const nowTime = Date.now();
  return expiryTime > nowTime;
}
