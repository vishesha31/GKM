
import React from 'react';
import { PollOption } from '../types';

interface CreativePollProps {
  votes: Record<string, number>;
}

export const CreativePoll: React.FC<CreativePollProps> = ({ votes }) => {
  const options = Object.values(PollOption);
  const total = (Object.values(votes) as number[]).reduce((a, b) => a + b, 0);

  const getPercentage = (count: number) => (total === 0 ? 0 : Math.round((count / total) * 100));

  return (
    <div className="flex flex-col justify-center gap-4 w-full max-w-2xl mx-auto p-6 md:p-8 h-full">
      {options.map((option) => {
        const count = votes[option] || 0;
        const pct = getPercentage(count);
        return (
          <div key={option} className="relative group w-full">
            <div className="flex justify-between mb-1.5 items-end px-1">
              <span className="font-bold text-orange-950 text-[13px] md:text-[15px] italic">{option}</span>
              <span className="font-bold text-xl md:text-2xl text-purple-700 tabular-nums leading-none">{pct}%</span>
            </div>
            <div className="h-5 md:h-6 bg-orange-50/50 rounded-full overflow-hidden p-0.5 border border-orange-100">
              <div
                className={`h-full bg-gradient-to-r from-orange-500 to-purple-600 rounded-full transition-all duration-[2000ms] ease-out flex items-center justify-end pr-4 shadow-lg relative overflow-hidden`}
                style={{ width: `${pct}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_3s_infinite]"></div>
                
                {pct > 15 && (
                  <span className="text-white text-[9px] md:text-[10px] uppercase tracking-widest z-10 italic font-bold">
                    {count}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
