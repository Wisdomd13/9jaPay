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
          icon: <ArrowUpRight className="w-5 h-5 text-[#22C55E]" />,
          bgColor: 'bg-[#063B16] border-[#22C55E]/30',
          textColor: 'text-[#22C55E]',
          sign: '-'
        };
      case 'UPGRADE_PAYMENT':
        return {
          icon: <Sparkles className="w-5 h-5 text-[#FFB800]" />,
          bgColor: 'bg-[#FFB800]/10 border-[#FFB800]/20',
          textColor: 'text-[#FFB800]',
          sign: '-'
        };
      case 'LOAN_DISBURSED':
        return {
          icon: <ArrowDownLeft className="w-5 h-5 text-[#7CFF00]" />,
          bgColor: 'bg-[#063B16] border-[#7CFF00]/30',
          textColor: 'text-[#7CFF00]',
          sign: '+'
        };
      case 'LOAN_REPAID':
        return {
          icon: <ArrowUpRight className="w-5 h-5 text-sky-400" />,
          bgColor: 'bg-sky-500/10 border-sky-500/20',
          textColor: 'text-sky-400',
          sign: '-'
        };
      default:
        return {
          icon: <ArrowDownLeft className="w-5 h-5 text-[#7CFF00]" />,
          bgColor: 'bg-[#063B16] border-[#7CFF00]/30',
          textColor: 'text-[#7CFF00]',
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
              <History className="w-6 h-6 text-[#7CFF00]" />
              Transaction Ledger
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#063B16] text-[#7CFF00] font-mono border border-[#7CFF00]/30">
              {transactions.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#A8B5AB] mt-1">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filter === f
                  ? 'bg-[#063B16] text-[#7CFF00] border border-[#7CFF00] shadow-md shadow-[#7CFF00]/20'
                  : 'bg-[#071A0C] text-[#A8B5AB] hover:text-white border border-[#7CFF00]/15 hover:border-[#7CFF00]/30'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List Card */}
      <div className="rounded-3xl p-4 sm:p-6 bg-[#071A0C] border border-[#7CFF00]/20 shadow-2xl space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#A8B5AB] space-y-2">
            <History className="w-10 h-10 mx-auto text-gray-600" />
            <p className="text-sm font-semibold text-white">No transactions found under this filter.</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const meta = getTxDetails(tx);
            return (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-[#040F07] border border-[#7CFF00]/15 hover:border-[#7CFF00]/50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${meta.bgColor}`}>
                    {meta.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {tx.description}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#A8B5AB]">
                      <span className="font-mono">{formatDate(tx.date)}</span>
                      {tx.reference && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[#7CFF00] font-semibold">{tx.reference}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className={`text-base font-black font-display ${meta.textColor}`}>
                    {meta.sign}₦{tx.amount.toLocaleString()}
                  </span>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-[#22C55E] font-semibold mt-0.5">
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
