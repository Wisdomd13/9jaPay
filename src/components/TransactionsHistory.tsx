import React, { useState } from 'react';
import { Transaction } from '../types';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Zap,
  Filter
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TransactionsHistoryProps {
  transactions: Transaction[];
}

export const TransactionsHistory: React.FC<TransactionsHistoryProps> = ({ transactions }) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filtered = transactions.filter(t => {
    if (filter === 'ALL') return true;
    if (filter === 'EARNINGS') return t.type === 'TASK_EARN' || t.type === 'QUIZ_EARN' || t.type === 'REFERRAL_BONUS' || t.type === 'WELCOME_BONUS';
    if (filter === 'WITHDRAWALS') return t.type === 'WITHDRAWAL';
    if (filter === 'LOANS') return t.type === 'LOAN_DISBURSED' || t.type === 'LOAN_REPAID';
    return true;
  });

  const getTxDetails = (tx: Transaction) => {
    switch (tx.type) {
      case 'WITHDRAWAL':
        return {
          icon: <ArrowUpRight className="w-5 h-5 text-emerald-400" />,
          bgColor: 'bg-emerald-500/10 border-emerald-500/20',
          textColor: 'text-emerald-400',
          sign: '-'
        };
      case 'UPGRADE_PAYMENT':
        return {
          icon: <Sparkles className="w-5 h-5 text-amber-400" />,
          bgColor: 'bg-amber-500/10 border-amber-500/20',
          textColor: 'text-amber-400',
          sign: '-'
        };
      case 'LOAN_DISBURSED':
        return {
          icon: <ArrowDownLeft className="w-5 h-5 text-blue-400" />,
          bgColor: 'bg-blue-500/10 border-blue-500/20',
          textColor: 'text-blue-400',
          sign: '+'
        };
      case 'LOAN_REPAID':
        return {
          icon: <ArrowUpRight className="w-5 h-5 text-indigo-400" />,
          bgColor: 'bg-indigo-500/10 border-indigo-500/20',
          textColor: 'text-indigo-400',
          sign: '-'
        };
      default:
        return {
          icon: <ArrowDownLeft className="w-5 h-5 text-emerald-400" />,
          bgColor: 'bg-emerald-500/10 border-emerald-500/20',
          textColor: 'text-emerald-400',
          sign: '+'
        };
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
              <History className="w-6 h-6 text-purple-400" />
              Transaction Ledger
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 font-mono">
              {transactions.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Complete real-time audit log of your task earnings, quiz rewards, referrals, loans, and bank payouts.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'EARNINGS', 'WITHDRAWALS', 'LOANS'].map((f) => (
            <button
              key={f}
              onClick={() => {
                soundManager.playClickSound();
                setFilter(f);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List Card */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 border border-purple-800/30 shadow-2xl space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 space-y-2">
            <History className="w-10 h-10 mx-auto text-gray-600" />
            <p className="text-sm font-semibold text-gray-300">No transactions found under this filter.</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const meta = getTxDetails(tx);
            return (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-[#0D101C] border border-gray-800/80 hover:border-purple-500/40 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${meta.bgColor}`}>
                    {meta.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {tx.description}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                      <span className="font-mono">{formatDate(tx.date)}</span>
                      {tx.reference && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-purple-400 font-semibold">{tx.reference}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className={`text-base font-black font-display ${meta.textColor}`}>
                    {meta.sign}₦{tx.amount.toLocaleString()}
                  </span>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-400 font-semibold mt-0.5">
                    <CheckCircle className="w-3 h-3" />
                    <span>SUCCESS</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
