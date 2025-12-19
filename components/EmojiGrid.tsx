
import React, { useMemo } from 'react';
import { EMOJIS } from '../types';

interface EmojiGridProps {
  entries: { value: string; id: string }[];
}

export const EmojiGrid: React.FC<EmojiGridProps> = ({ entries }) => {
  const pinGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};
    EMOJIS.forEach(e => groups[e] = []);
    
    entries.forEach(entry => {
      if (groups[entry.value]) {
        groups[entry.value].push(entry.id);
      }
    });
    return groups;
  }, [entries]);

  return (
    <div className="grid grid-cols-2 gap-3 h-full p-3 bg-transparent">
      {EMOJIS.map((emoji) => {
        const votes = pinGroups[emoji];
        const visibleVotes = votes.slice(-25); 
        
        return (
          <div
            key={emoji}
            className="relative bg-white/80 rounded-[1.5rem] shadow-sm border border-sky-100 overflow-hidden flex flex-col items-center justify-center group"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:24px_24px]"></div>
            
            {/* Subtle Center Reference */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none">
              <span className="text-[10rem]">{emoji}</span>
            </div>

            {/* Label - Top Right Corner - Smaller and Fit to Content */}
            <div className="absolute top-3 right-3 z-20">
               <span className="bg-sky-50 text-sky-800 text-[11px] px-2 py-0.5 rounded-lg italic shadow-sm border border-sky-100 whitespace-nowrap">
                 {emoji} Pinboard
               </span>
            </div>

            {/* Pins Clustered from Center */}
            <div className="absolute inset-0 overflow-hidden">
              {visibleVotes.map((id, index) => {
                const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                
                const spread = Math.min(25, 8 + (index * 0.7));
                const left = 50 + (((seed * 3) % (spread * 2)) - spread);
                const top = 50 + (((seed * 11) % (spread * 2)) - spread);
                const rotate = (seed % 20) - 10;
                const scale = 0.7 + ((seed % 4) / 10);

                return (
                  <div
                    key={id}
                    className="absolute animate-pin z-10 filter drop-shadow-sm -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      transform: `rotate(${rotate}deg) scale(${scale})`,
                    }}
                  >
                    <div className="relative">
                       <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-sky-700 rounded-full border border-white shadow-sm z-20"></div>
                       <span className="text-3xl md:text-4xl select-none">{emoji}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {votes.length === 0 && (
              <div className="text-sky-300 italic text-sm z-10">
                Share your reaction
              </div>
            )}
            
            {votes.length > 0 && (
              <div className="absolute bottom-3 left-4 flex items-center gap-2 z-10">
                <div className="w-1 h-1 bg-sky-600 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-sky-600 italic">{votes.length} Votes</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
