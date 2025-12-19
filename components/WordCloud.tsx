
import React, { useMemo } from 'react';

interface WordCloudProps {
  words: string[];
}

export const WordCloud: React.FC<WordCloudProps> = ({ words }) => {
  const cloudData = useMemo(() => {
    const counts: Record<string, number> = {};
    words.forEach(w => {
      const normalized = w.toUpperCase().trim();
      if (!normalized) return;
      counts[normalized] = (counts[normalized] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const max = entries[0]?.[1] || 1;
    
    return entries.slice(0, 30).map(([text, count]) => ({
      text,
      count,
      size: Math.min(5, Math.max(1.2, (count / max) * 5))
    }));
  }, [words]);

  // Warm palette consistent with logo theme
  const colors = ['text-orange-600', 'text-purple-600', 'text-orange-800', 'text-purple-800', 'text-pink-600'];

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-8 w-full h-full bg-transparent">
      {cloudData.length === 0 ? (
        <p className="text-orange-200 italic uppercase tracking-[0.4em] text-2xl animate-pulse">Awaiting Sentiments...</p>
      ) : (
        cloudData.map((item, idx) => (
          <span
            key={item.text}
            className={`${colors[idx % colors.length]} transition-all duration-1000 font-bold tracking-tight animate-fade-in inline-block italic`}
            style={{ 
              fontSize: `${item.size}rem`, 
              transform: `rotate(${(idx % 2 === 0 ? 1 : -1) * (idx % 5)}deg)`,
              opacity: 0.7 + (item.size / 5) * 0.3,
              textShadow: '0 2px 8px rgba(249,115,22,0.1)'
            }}
          >
            {item.text}
          </span>
        ))
      )}
    </div>
  );
};
