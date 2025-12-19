
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
    <div className="flex flex-col h-full w-full bg-[#FAF5FF]/50 font-serif select-none overflow-hidden">
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 p-4 lg:p-6 h-full">
        {EMOJIS.map((emoji) => {
          const votes = pinGroups[emoji];
          
          return (
            <div
              key={emoji}
              className="relative bg-white rounded-[2rem] border border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden transition-all duration-500"
            >
              {/* Tap to react background text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center opacity-[0.08]">
                   <span className="text-6xl md:text-8xl mb-2">{emoji}</span>
                   <span className="text-sm md:text-xl font-bold italic tracking-wider">Tap to react</span>
                </div>
              </div>

              {/* Top Right "Pins" Badge */}
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-orange-50 border border-orange-100 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="text-xs md:text-sm">{emoji}</span>
                  <span className="text-[10px] md:text-[11px] font-bold italic text-orange-950/80">Pins</span>
                </div>
              </div>

              {/* Animated Pin Area */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                {votes.slice(-50).map((id) => {
                  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const left = (seed * 17) % 85 + 7;
                  const top = (seed * 23) % 85 + 7;
                  const baseRot = (seed % 40) - 20;
                  const baseScale = 0.8 + (seed % 10) / 10;
                  const jumpDur = 1.8 + (seed % 20) / 10 + 's';
                  const jumpDelay = (seed % 15) / 10 + 's';

                  return (
                    <div
                      key={id}
                      className="absolute animate-pin animate-jumping-pin flex flex-col items-center"
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        '--base-rot': `${baseRot}deg`,
                        '--base-scale': baseScale,
                        '--jump-dur': jumpDur,
                        '--jump-delay': jumpDelay,
                      } as React.CSSProperties}
                    >
                      {/* Visual 'Pin' tack - Matching Reference Style */}
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 border border-white shadow-sm mb-0.5"></div>
                      <span className="text-4xl md:text-5xl lg:text-6xl drop-shadow-xl">{emoji}</span>
                    </div>
                  );
                })}
              </div>

              {/* Subtle visual grid like in reference */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
