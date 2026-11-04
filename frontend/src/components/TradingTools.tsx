'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Scale, 
  BarChart3, 
  BookOpen, 
  Activity, 
  Clock, 
  CheckSquare, 
  TrendingUp, 
  Check, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Download 
} from 'lucide-react';
import { 
  calculatePositionSize, 
  calculateRiskReward, 
  calculatePipMovement, 
  calculateSentimentGauge 
} from '@/lib/calculators';

type ToolTab = 
  | 'position_size' 
  | 'risk_reward' 
  | 'pip_calc' 
  | 'journal' 
  | 'sentiment' 
  | 'session_clock' 
  | 'checklist' 
  | 'performance';

interface JournalEntry {
  id: string;
  instrument: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  pnl: number;
  strategy: string;
  session: string;
  emotion: string;
  date: string;
}

export function TradingTools() {
  const [activeTab, setActiveTab] = useState<ToolTab>('position_size');

  // -------------------------------------------------------------
  // Tool 1: Position Size Calculator State
  // -------------------------------------------------------------
  const [balance, setBalance] = useState<number>(5000);
  const [riskPercent, setRiskPercent] = useState<number>(2);
  const [entryPrice, setEntryPrice] = useState<number>(1.0850);
  const [stopLoss, setStopLoss] = useState<number>(1.0825);
  const [instrument, setInstrument] = useState<'forex_standard' | 'forex_jpy' | 'synthetic_volatility' | 'crypto_gold'>('forex_standard');

  const posResult = calculatePositionSize({
    accountBalance: balance,
    riskPercentage: riskPercent,
    entryPrice,
    stopLossPrice: stopLoss,
    instrumentType: instrument,
  });

  // -------------------------------------------------------------
  // Tool 2: Risk-to-Reward State
  // -------------------------------------------------------------
  const [rrDirection, setRrDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [rrEntry, setRrEntry] = useState<number>(1.1000);
  const [rrSl, setRrSl] = useState<number>(1.0950);
  const [rrTp, setRrTp] = useState<number>(1.1150);
  const [rrLots, setRrLots] = useState<number>(1.0);

  const rrResult = calculateRiskReward({
    direction: rrDirection,
    entryPrice: rrEntry,
    stopLossPrice: rrSl,
    takeProfitPrice: rrTp,
    positionSizeLots: rrLots,
  });

  // -------------------------------------------------------------
  // Tool 3: Pip Movement Calculator State
  // -------------------------------------------------------------
  const [pipIsJpy, setPipIsJpy] = useState(false);
  const [pipStart, setPipStart] = useState(1.0800);
  const [pipEnd, setPipEnd] = useState(1.0865);
  const [pipLots, setPipLots] = useState(1.0);
  const pipResult = calculatePipMovement({
    isJpyPair: pipIsJpy,
    priceStart: pipStart,
    priceEnd: pipEnd,
    lotSize: pipLots,
  });

  // -------------------------------------------------------------
  // Tool 4: Trading Journal State (LocalStorage persistence)
  // -------------------------------------------------------------
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [newInstrument, setNewInstrument] = useState('EUR/USD');
  const [newDirection, setNewDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [newEntry, setNewEntry] = useState<number>(1.0850);
  const [newExit, setNewExit] = useState<number>(1.0890);
  const [newLots, setNewLots] = useState<number>(0.5);
  const [newPnl, setNewPnl] = useState<number>(200);
  const [newSession, setNewSession] = useState('London');
  const [newEmotion, setNewEmotion] = useState('Disciplined');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kirafx_journal');
      if (saved) {
        setJournal(JSON.parse(saved));
      } else {
        // Initial sample trades
        const initialTrades: JournalEntry[] = [
          {
            id: '1',
            instrument: 'EUR/USD',
            direction: 'BUY',
            entryPrice: 1.0820,
            exitPrice: 1.0865,
            stopLoss: 1.0800,
            takeProfit: 1.0880,
            lotSize: 1.0,
            pnl: 450,
            strategy: 'Breakout Pullback',
            session: 'London',
            emotion: 'Patient',
            date: '2026-10-28',
          },
          {
            id: '2',
            instrument: 'Deriv Volatility 75',
            direction: 'SELL',
            entryPrice: 425000,
            exitPrice: 422100,
            stopLoss: 427000,
            takeProfit: 420000,
            lotSize: 0.005,
            pnl: 145,
            strategy: 'Key Level Rejection',
            session: 'New York',
            emotion: 'Disciplined',
            date: '2026-10-29',
          },
          {
            id: '3',
            instrument: 'GBP/JPY',
            direction: 'BUY',
            entryPrice: 198.50,
            exitPrice: 198.15,
            stopLoss: 198.15,
            takeProfit: 199.50,
            lotSize: 0.5,
            pnl: -125,
            strategy: 'Support Bounce',
            session: 'Asian',
            emotion: 'Anxious',
            date: '2026-10-30',
          },
        ];
        setJournal(initialTrades);
        localStorage.setItem('kirafx_journal', JSON.stringify(initialTrades));
      }
    } catch {
      // LocalStorage unavailable fallback
    }
  }, []);

  const saveJournal = (entries: JournalEntry[]) => {
    setJournal(entries);
    try {
      localStorage.setItem('kirafx_journal', JSON.stringify(entries));
    } catch {}
  };

  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: JournalEntry = {
      id: Date.now().toString(),
      instrument: newInstrument,
      direction: newDirection,
      entryPrice: newEntry,
      exitPrice: newExit,
      stopLoss: newEntry - 0.0020,
      takeProfit: newEntry + 0.0050,
      lotSize: newLots,
      pnl: newPnl,
      strategy: 'Manual Setup',
      session: newSession,
      emotion: newEmotion,
      date: new Date().toISOString().split('T')[0],
    };
    saveJournal([entry, ...journal]);
  };

  const handleDeleteTrade = (id: string) => {
    saveJournal(journal.filter(j => j.id !== id));
  };

  const exportJournalCSV = () => {
    const headers = 'ID,Date,Instrument,Direction,Entry,Exit,Lots,PnL,Session,Emotion\n';
    const rows = journal.map(j => `${j.id},${j.date},${j.instrument},${j.direction},${j.entryPrice},${j.exitPrice},${j.lotSize},${j.pnl},${j.session},${j.emotion}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiraforex-journal-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // -------------------------------------------------------------
  // Tool 5: Sentiment Gauge State
  // -------------------------------------------------------------
  const [sentimentScore, setSentimentScore] = useState<number>(75);
  const [momentum, setMomentum] = useState<boolean>(true);
  const [volume, setVolume] = useState<boolean>(true);
  const [htf, setHtf] = useState<boolean>(true);
  const sentimentResult = calculateSentimentGauge({
    trendScore: sentimentScore,
    momentumConfirmed: momentum,
    volumeAboveAverage: volume,
    htfAligned: htf,
  });

  // -------------------------------------------------------------
  // Tool 6: Pre-Trade Checklist State
  // -------------------------------------------------------------
  const [checks, setChecks] = useState<{ [key: string]: boolean }>({
    bias: true,
    keyLevel: true,
    trigger: true,
    riskLimit: true,
    noNews: true,
    mindset: true,
  });

  const toggleCheck = (key: string) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const checkedCount = Object.values(checks).filter(Boolean).length;
  const readinessPercent = Math.round((checkedCount / Object.keys(checks).length) * 100);

  // -------------------------------------------------------------
  // Tool 7 & 8: Performance Dashboard Calculations
  // -------------------------------------------------------------
  const totalTrades = journal.length;
  const winningTrades = journal.filter(t => t.pnl > 0);
  const losingTrades = journal.filter(t => t.pnl < 0);
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
  const netPnl = journal.reduce((acc, t) => acc + t.pnl, 0);
  const totalGains = winningTrades.reduce((acc, t) => acc + t.pnl, 0);
  const totalLosses = Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0));
  const profitFactor = totalLosses > 0 ? totalGains / totalLosses : totalGains > 0 ? 99 : 0;

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-card overflow-hidden">
      
      {/* Tools Hub Navigation Bar */}
      <div className="border-b border-neutral-200 bg-sage-50/70 p-3 sm:p-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {[
            { id: 'position_size', label: '1. Position Size', icon: Calculator },
            { id: 'risk_reward', label: '2. Risk-to-Reward', icon: Scale },
            { id: 'pip_calc', label: '3. Pip Calculator', icon: BarChart3 },
            { id: 'journal', label: '4. Trading Journal', icon: BookOpen },
            { id: 'sentiment', label: '5. Sentiment Gauge', icon: Activity },
            { id: 'session_clock', label: '6. Session Clock', icon: Clock },
            { id: 'checklist', label: '7. Pre-Trade Checklist', icon: CheckSquare },
            { id: 'performance', label: '8. Performance Metrics', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ToolTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm transition-all ${
                  isActive
                    ? 'bg-forest-800 text-white shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-200/60 hover:text-forest-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-forest-600'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool Content Panels */}
      <div className="p-6 sm:p-10">

        {/* ---------------- 1. POSITION SIZE CALCULATOR ---------------- */}
        {activeTab === 'position_size' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Tool 1: Capital Protection</span>
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest-950 mt-1">
                Risk & Position Size Calculator
              </h3>
              <p className="text-neutral-600 text-sm mt-1">
                Calculate the mathematically exact lot size based on your account size and stop-loss distance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form Inputs */}
              <div className="space-y-4 bg-sage-50/50 p-6 rounded-2xl border border-neutral-200">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Instrument Category</label>
                  <select 
                    value={instrument}
                    onChange={(e: any) => setInstrument(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white font-medium text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                  >
                    <option value="forex_standard">Standard Forex Pairs (EUR/USD, GBP/USD, etc.)</option>
                    <option value="forex_jpy">Forex JPY Pairs (USD/JPY, GBP/JPY)</option>
                    <option value="synthetic_volatility">Deriv Synthetics (Volatility 75, 100)</option>
                    <option value="crypto_gold">Commodity / Gold (XAU/USD)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Account Balance ($)</label>
                    <input 
                      type="number"
                      value={balance}
                      onChange={(e) => setBalance(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-semibold text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Risk Percentage (%)</label>
                    <input 
                      type="number"
                      step="0.5"
                      value={riskPercent}
                      onChange={(e) => setRiskPercent(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-semibold text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Entry Price</label>
                    <input 
                      type="number"
                      step="0.0001"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-semibold text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Stop Loss Price</label>
                    <input 
                      type="number"
                      step="0.0001"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-semibold text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Result Summary */}
              <div className="bg-forest-900 text-white p-7 rounded-2xl flex flex-col justify-between shadow-card">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Calculated Execution</span>
                  <div className="mt-4 pb-6 border-b border-forest-700">
                    <span className="text-xs text-neutral-300 block">Recommended Position Size</span>
                    <span className="text-4xl sm:text-5xl font-heading font-extrabold text-white mt-1 block">
                      {posResult.isValid ? `${posResult.calculatedLotSize} Lots` : '0.00 Lots'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                    <div>
                      <span className="text-xs text-neutral-400 block">Monetary Risk</span>
                      <span className="text-xl font-bold text-emerald-300">${posResult.monetaryRisk.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-neutral-400 block">Stop Distance</span>
                      <span className="text-xl font-bold text-white">{posResult.stopDistancePips} Pips/Pts</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-forest-800 text-[11px] text-neutral-300 space-y-1">
                  {posResult.calculationAssumptions.map((a, i) => (
                    <p key={i}>• {a}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 2. RISK-TO-REWARD CALCULATOR ---------------- */}
        {activeTab === 'risk_reward' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Tool 2: Trade Edge</span>
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest-950 mt-1">
                Risk-to-Reward (R:R) Calculator
              </h3>
              <p className="text-neutral-600 text-sm mt-1">
                Evaluate long or short trade asymmetry and required breakeven win rate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 bg-sage-50/50 p-6 rounded-2xl border border-neutral-200">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRrDirection('LONG')}
                      className={`py-2 rounded-xl font-bold text-sm ${rrDirection === 'LONG' ? 'bg-forest-800 text-white' : 'bg-white border text-neutral-700'}`}
                    >
                      LONG (Buy)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRrDirection('SHORT')}
                      className={`py-2 rounded-xl font-bold text-sm ${rrDirection === 'SHORT' ? 'bg-red-700 text-white' : 'bg-white border text-neutral-700'}`}
                    >
                      SHORT (Sell)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Entry Price</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={rrEntry}
                    onChange={(e) => setRrEntry(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-semibold text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Stop Loss Price</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={rrSl}
                      onChange={(e) => setRrSl(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-semibold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Take Profit Price</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={rrTp}
                      onChange={(e) => setRrTp(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-semibold text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* R:R Result Display */}
              <div className="bg-forest-900 text-white p-7 rounded-2xl flex flex-col justify-between shadow-card">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Setup Edge</span>
                  <div className="mt-4 pb-6 border-b border-forest-700">
                    <span className="text-xs text-neutral-300 block">Risk : Reward Ratio</span>
                    <span className="text-4xl sm:text-5xl font-heading font-extrabold text-white mt-1 block">
                      {rrResult.isValid ? rrResult.riskRewardRatio : 'Invalid'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                    <div>
                      <span className="text-xs text-neutral-400 block">Required Win Rate</span>
                      <span className="text-xl font-bold text-emerald-300">{rrResult.breakevenWinRatePercent}%</span>
                    </div>
                    <div>
                      <span className="text-xs text-neutral-400 block">Direction</span>
                      <span className="text-xl font-bold text-white">{rrDirection}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-forest-800 text-xs text-neutral-300">
                  {rrResult.isValid 
                    ? `At ${rrResult.riskRewardRatio}, you only need to win ${rrResult.breakevenWinRatePercent}% of your trades to break even.`
                    : 'Ensure stop loss and take profit are valid for the selected direction.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 3. PIP CALCULATOR ---------------- */}
        {activeTab === 'pip_calc' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Tool 3: Price Measurement</span>
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest-950 mt-1">
                Pip & Price Movement Calculator
              </h3>
              <p className="text-neutral-600 text-sm mt-1">
                Convert price shifts into exact pips and dollar values across standard and JPY instruments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 bg-sage-50/50 p-6 rounded-2xl border border-neutral-200">
                <div className="flex items-center gap-4">
                  <label className="text-xs font-bold text-neutral-700 uppercase">Pair Type:</label>
                  <button
                    type="button"
                    onClick={() => setPipIsJpy(!pipIsJpy)}
                    className="px-3 py-1 rounded-lg text-xs font-bold border bg-white shadow-sm"
                  >
                    {pipIsJpy ? 'JPY Pair (2 Decimals)' : 'Standard Pair (4 Decimals)'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Start Price</label>
                    <input
                      type="number"
                      step={pipIsJpy ? '0.01' : '0.0001'}
                      value={pipStart}
                      onChange={(e) => setPipStart(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-semibold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">End Price</label>
                    <input
                      type="number"
                      step={pipIsJpy ? '0.01' : '0.0001'}
                      value={pipEnd}
                      onChange={(e) => setPipEnd(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-semibold text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Trade Volume (Lots)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={pipLots}
                    onChange={(e) => setPipLots(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-semibold text-sm"
                  />
                </div>
              </div>

              <div className="bg-forest-900 text-white p-7 rounded-2xl flex flex-col justify-between shadow-card">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Distance Analysis</span>
                  <div className="mt-4 pb-6 border-b border-forest-700">
                    <span className="text-xs text-neutral-300 block">Total Pip Movement</span>
                    <span className="text-4xl sm:text-5xl font-heading font-extrabold text-white mt-1 block">
                      {pipResult.pips} Pips
                    </span>
                  </div>

                  <div className="mt-6 text-sm">
                    <span className="text-xs text-neutral-400 block">Estimated Movement Value</span>
                    <span className="text-2xl font-bold text-emerald-300">${pipResult.totalValue.toLocaleString()} USD</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-forest-800 text-xs text-neutral-300">
                  Calculated based on {pipLots} standard lot(s) with 1 pip unit = {pipResult.pipUnit}.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 4. TRADING JOURNAL ---------------- */}
        {activeTab === 'journal' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Tool 4: Accountability</span>
                <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest-950 mt-1">
                  Trader's Log & Journal
                </h3>
                <p className="text-neutral-600 text-sm mt-1">
                  Local-first persistent trading journal stored privately in your browser.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={exportJournalCSV}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5 text-forest-700" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddTrade} className="bg-sage-50/60 p-5 rounded-2xl border border-neutral-200 mb-8 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Pair/Asset</label>
                <input
                  type="text"
                  value={newInstrument}
                  onChange={(e) => setNewInstrument(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Direction</label>
                <select
                  value={newDirection}
                  onChange={(e: any) => setNewDirection(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-semibold bg-white"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Lots</label>
                <input
                  type="number"
                  step="0.01"
                  value={newLots}
                  onChange={(e) => setNewLots(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Net P/L ($)</label>
                <input
                  type="number"
                  value={newPnl}
                  onChange={(e) => setNewPnl(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Session</label>
                <select
                  value={newSession}
                  onChange={(e) => setNewSession(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-semibold bg-white"
                >
                  <option value="London">London</option>
                  <option value="New York">New York</option>
                  <option value="Asian">Asian</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Mindset</label>
                <select
                  value={newEmotion}
                  onChange={(e) => setNewEmotion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-semibold bg-white"
                >
                  <option value="Disciplined">Disciplined</option>
                  <option value="Patient">Patient</option>
                  <option value="FOMO">FOMO</option>
                  <option value="Anxious">Anxious</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Trade</span>
                </button>
              </div>
            </form>

            {/* Trade Log Table */}
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 shadow-subtle">
              <table className="w-full text-left text-xs text-neutral-700">
                <thead className="bg-sage-100 text-neutral-800 font-heading font-bold border-b border-neutral-200">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Instrument</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Lots</th>
                    <th className="p-3.5">Session</th>
                    <th className="p-3.5">Mindset</th>
                    <th className="p-3.5">P/L ($)</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white font-medium">
                  {journal.map((trade) => (
                    <tr key={trade.id} className="hover:bg-neutral-50 transition">
                      <td className="p-3.5 text-neutral-500">{trade.date}</td>
                      <td className="p-3.5 font-bold text-neutral-900">{trade.instrument}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trade.direction === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="p-3.5">{trade.lotSize}</td>
                      <td className="p-3.5">{trade.session}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[10px]">
                          {trade.emotion}
                        </span>
                      </td>
                      <td className={`p-3.5 font-bold ${trade.pnl >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {trade.pnl >= 0 ? `+$${trade.pnl}` : `-$${Math.abs(trade.pnl)}`}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteTrade(trade.id)}
                          className="text-neutral-400 hover:text-red-600 transition p-1"
                          aria-label="Delete trade record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- 5. SENTIMENT GAUGE ---------------- */}
        {activeTab === 'sentiment' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Tool 5: Market Direction</span>
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest-950 mt-1">
                Sentiment & Trend Strength Gauge
              </h3>
              <p className="text-neutral-600 text-sm mt-1">
                Evaluates institutional conviction percentage across trend, volume, and momentum indicators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 bg-sage-50/50 p-6 rounded-2xl border border-neutral-200">
                <div>
                  <div className="flex justify-between text-xs font-bold text-neutral-700 uppercase mb-2">
                    <span>Base Technical Trend Momentum</span>
                    <span>{sentimentScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={sentimentScore}
                    onChange={(e) => setSentimentScore(Number(e.target.value))}
                    className="w-full accent-forest-800"
                  />
                </div>

                <div className="space-y-3 pt-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={momentum}
                      onChange={(e) => setMomentum(e.target.checked)}
                      className="w-4 h-4 accent-forest-800 rounded"
                    />
                    <span className="text-xs font-semibold text-neutral-800">Momentum Oscillator Aligned (RSI / MACD)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={volume}
                      onChange={(e) => setVolume(e.target.checked)}
                      className="w-4 h-4 accent-forest-800 rounded"
                    />
                    <span className="text-xs font-semibold text-neutral-800">Institutional Volume Expansion</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={htf}
                      onChange={(e) => setHtf(e.target.checked)}
                      className="w-4 h-4 accent-forest-800 rounded"
                    />
                    <span className="text-xs font-semibold text-neutral-800">Higher Timeframe (HTF) Market Structure Confirmed</span>
                  </label>
                </div>
              </div>

              {/* Gauge Display */}
              <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-card text-center flex flex-col items-center justify-center">
                <div className="relative w-44 h-44 rounded-full border-8 border-neutral-100 flex items-center justify-center mb-4">
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-transparent transition-all duration-500"
                    style={{
                      borderTopColor: sentimentResult.badgeColor,
                      borderRightColor: sentimentResult.score > 50 ? sentimentResult.badgeColor : 'transparent',
                      transform: 'rotate(-45deg)'
                    }}
                  />
                  <div>
                    <span className="text-4xl sm:text-5xl font-heading font-extrabold text-forest-950 block">
                      {sentimentResult.score}%
                    </span>
                    <span className="text-[11px] font-bold uppercase text-neutral-400">Strength</span>
                  </div>
                </div>

                <span 
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: sentimentResult.badgeColor }}
                >
                  {sentimentResult.rating} Trend Conviction
                </span>

                <p className="mt-3 text-xs text-neutral-500 font-medium">
                  {sentimentResult.label}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 6. TRADING SESSION CLOCK ---------------- */}
        {activeTab === 'session_clock' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Tool 6: Timing</span>
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest-950 mt-1">
                Global Trading Session Clock
              </h3>
              <p className="text-neutral-600 text-sm mt-1">
                Live international session states and liquidity overlap monitoring.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { city: 'London', hours: '08:00 - 16:30 GMT', status: 'ACTIVE / HIGH LIQUIDITY', isOpen: true },
                { city: 'New York', hours: '13:00 - 21:00 GMT', status: 'OVERLAP ACTIVE', isOpen: true },
                { city: 'Tokyo / Asian', hours: '00:00 - 09:00 GMT', status: 'CLOSED', isOpen: false },
                { city: 'Sydney', hours: '22:00 - 07:00 GMT', status: 'CLOSED', isOpen: false },
              ].map((sess, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-subtle flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-heading font-bold text-base text-neutral-900">{sess.city}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${sess.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-300'}`} />
                    </div>
                    <span className="text-xs text-neutral-500 block">{sess.hours}</span>
                  </div>

                  <div className="mt-6 pt-3 border-t border-neutral-100">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${sess.isOpen ? 'text-emerald-700' : 'text-neutral-400'}`}>
                      {sess.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-forest-50 border border-forest-200 text-xs text-forest-900 flex items-center gap-3">
              <Clock className="w-4 h-4 text-forest-700 flex-shrink-0" />
              <span>
                <strong>High Volatility Window:</strong> The London & New York session overlap (13:00 – 16:30 GMT) accounts for over 70% of global daily forex volume.
              </span>
            </div>
          </div>
        )}

        {/* ---------------- 7. PRE-TRADE CHECKLIST ---------------- */}
        {activeTab === 'checklist' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Tool 7: Discipline</span>
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest-950 mt-1">
                Pre-Trade Confirmation Checklist
              </h3>
              <p className="text-neutral-600 text-sm mt-1">
                Enforce rule-based execution. Complete every checkpoint before entering any market order.
              </p>
            </div>

            <div className="bg-sage-50/50 p-6 rounded-2xl border border-neutral-200 space-y-4">
              {[
                { key: 'bias', title: '1. Higher Timeframe Market Structure', desc: 'Is current bias aligned with Daily and 4-Hour trend?' },
                { key: 'keyLevel', title: '2. High-Probability Key Level', desc: 'Is price testing a validated support, resistance, or order block?' },
                { key: 'trigger', title: '3. Explicit Entry Trigger', desc: 'Did you witness a confirmed candlestick pattern or breakout signal?' },
                { key: 'riskLimit', title: '4. Strict Risk Sizing & Hard Stop Loss', desc: 'Calculated position size strictly within 1% to 2% max capital risk?' },
                { key: 'noNews', title: '5. High-Impact Economic Calendar Check', desc: 'No CPI, NFP, or Central Bank rate announcements within 30 minutes?' },
                { key: 'mindset', title: '6. Emotional & Mental Equilibrium', desc: 'Trading from cold objectivity rather than revenge, greed, or boredom?' },
              ].map((item) => (
                <div 
                  key={item.key} 
                  onClick={() => toggleCheck(item.key)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                    checks[item.key] 
                      ? 'bg-white border-forest-600 shadow-sm' 
                      : 'bg-white/60 border-neutral-200 opacity-70'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                    checks[item.key] ? 'bg-forest-800 border-forest-800 text-white' : 'border-neutral-300 bg-white'
                  }`}>
                    {checks[item.key] && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">{item.title}</h4>
                    <p className="text-xs text-neutral-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}

              <div className="pt-4 flex items-center justify-between border-t border-neutral-200">
                <span className="text-xs font-bold text-neutral-700">Execution Readiness Score:</span>
                <span className={`text-base font-extrabold ${readinessPercent === 100 ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {readinessPercent}% ({checkedCount}/6 Confirmed)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 8. PERFORMANCE DASHBOARD ---------------- */}
        {activeTab === 'performance' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Tool 8: Audit</span>
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-forest-950 mt-1">
                Trading Performance Dashboard
              </h3>
              <p className="text-neutral-600 text-sm mt-1">
                Real statistics computed directly from your saved journal trades.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-subtle">
                <span className="text-xs font-bold text-neutral-400 uppercase">Total Trades</span>
                <span className="text-3xl font-heading font-extrabold text-forest-950 block mt-1">{totalTrades}</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-subtle">
                <span className="text-xs font-bold text-neutral-400 uppercase">Win Rate</span>
                <span className="text-3xl font-heading font-extrabold text-emerald-600 block mt-1">{winRate.toFixed(1)}%</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-subtle">
                <span className="text-xs font-bold text-neutral-400 uppercase">Net Realized P/L</span>
                <span className={`text-3xl font-heading font-extrabold block mt-1 ${netPnl >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {netPnl >= 0 ? `+$${netPnl}` : `-$${Math.abs(netPnl)}`}
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-subtle">
                <span className="text-xs font-bold text-neutral-400 uppercase">Profit Factor</span>
                <span className="text-3xl font-heading font-extrabold text-forest-800 block mt-1">{profitFactor.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-sage-50/50 border border-neutral-200 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700 block mb-1">Risk Management Note</span>
              <p className="text-xs text-neutral-600 max-w-xl mx-auto leading-relaxed">
                Consistency is born from risk discipline, not winning every trade. A 40% win-rate with a 1:3 risk-to-reward ratio produces sustainable edge and capital preservation.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
