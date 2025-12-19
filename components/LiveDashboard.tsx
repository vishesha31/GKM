
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getFeedback, subscribeToGlobalFeedback, broadcast, SyncStatus } from '../services/dataService';
import { FeedbackEntry, EMOJIS, PollOption } from '../types';
import { WordCloud } from './WordCloud';
import { CreativePoll } from './CreativePoll';
import { EmojiGrid } from './EmojiGrid';
import { audioService } from '../services/audioService';
import { Logo } from './Branding';

type ViewMode = 'grid' | 'cycle';

export const LiveDashboard: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [currentCycleIndex, setCurrentCycleIndex] = useState<number>(0); 
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const processedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const initial = getFeedback();
    initial.forEach(f => processedIds.current.add(f.id));
    setFeedbacks(initial);

    const unsubscribe = subscribeToGlobalFeedback(
      (entry) => {
        if (!processedIds.current.has(entry.id)) {
          processedIds.current.add(entry.id);
          setFeedbacks(prev => [...prev, entry]);
          audioService.playPop();
        }
      },
      (status) => setSyncStatus(status)
    );

    const handleLocal = (e: MessageEvent) => {
      if (e.data.type === 'NEW_FEEDBACK') {
        const entry = e.data.entry;
        if (!processedIds.current.has(entry.id)) {
          processedIds.current.add(entry.id);
          setFeedbacks(prev => [...prev, entry]);
          audioService.playPop();
        }
      }
    };
    broadcast.addEventListener('message', handleLocal);
    return () => {
      unsubscribe();
      broadcast.removeEventListener('message', handleLocal);
    };
  }, []);

  useEffect(() => {
    if (viewMode !== 'cycle') return;
    const timer = setInterval(() => {
      setCurrentCycleIndex(prev => (prev + 1) % 4);
    }, 30000);
    return () => clearInterval(timer);
  }, [viewMode]);

  const data = useMemo(() => {
    const words = feedbacks.filter(f => f.type === 'word').map(f => f.value);
    const emojiEntries = feedbacks.filter(f => f.type === 'emoji').map(f => ({ value: f.value, id: f.id }));
    const pollVotes: Record<string, number> = {};
    feedbacks.filter(f => f.type === 'poll').forEach(f => {
      pollVotes[f.value] = (pollVotes[f.value] || 0) + 1;
    });
    const comments = feedbacks.filter(f => f.type === 'comment').map(f => f.value).reverse();

    return { words, emojiEntries, pollVotes, comments };
  }, [feedbacks]);

  const modules = [
    { title: "Parent Sentiments", component: <WordCloud words={data.words} /> },
    { title: "Reaction Wall", component: <EmojiGrid entries={data.emojiEntries} /> },
    { title: "Exhibition Rating", component: <CreativePoll votes={data.pollVotes} /> },
    { title: "Voices of Gurukul", component: (
      <div className="flex flex-col gap-3 p-6 overflow-hidden h-full">
        {data.comments.slice(0, 5).map((c, i) => (
          <div key={i} className="bg-sky-50/40 p-5 rounded-[1.5rem] shadow-sm border-l-[8px] border-sky-800 text-sky-900 text-lg animate-fade-in italic">
            "{c}"
          </div>
        ))}
        {data.comments.length === 0 && <p className="text-sky-200 italic text-center mt-20 text-xl uppercase tracking-widest">Awaiting Messages...</p>}
      </div>
    )}
  ];

  return (
    <div className="fixed inset-0 bg-transparent flex flex-col font-serif select-none overflow-hidden">
      {/* Dashboard Mode Selector Toggle (Bottom Right Corner) - Tiny & Thinner */}
      <div className="fixed bottom-3 right-3 z-50 flex bg-sky-800 p-0.5 rounded-lg shadow-lg border border-sky-700">
        <button 
          onClick={() => setViewMode('grid')}
          title="Grid View"
          className={`p-1.5 rounded-md transition-all duration-300 ${viewMode === 'grid' ? 'bg-white text-sky-800 shadow-sm' : 'text-white hover:bg-sky-700 opacity-50'}`}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button 
          onClick={() => setViewMode('cycle')}
          title="Auto Cycle Mode"
          className={`p-1.5 rounded-md transition-all duration-300 ${viewMode === 'cycle' ? 'bg-white text-sky-800 shadow-sm' : 'text-white hover:bg-sky-700 opacity-50'}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <header className="bg-white/90 backdrop-blur-md px-10 flex justify-between items-center z-20 border-b border-sky-100 shadow-sm h-20">
        <div className="flex items-center gap-4 h-full">
           <Logo type="event" className="h-14 w-14" />
           <div className="flex flex-col justify-center h-full">
              <h1 className="text-xl md:text-2xl text-sky-900 tracking-tight leading-none flex items-center gap-3 italic whitespace-nowrap">
                Gurukul Kaushal Mela
                <span className="bg-sky-800 text-white text-[9px] px-2 py-0.5 rounded-full uppercase border border-sky-900/10 not-italic">LIVE</span>
              </h1>
              <div className="h-px bg-sky-200 w-full my-1.5"></div>
              <span className="text-sky-600 italic text-[13px] leading-none">Your Feedback at a Glance</span>
           </div>
        </div>
        
        <div className="flex items-center gap-10 h-full">
          <div className="text-right flex items-center gap-4">
            <div className="text-[10px] text-sky-600 uppercase tracking-widest italic">Total Voices</div>
            <div className="text-3xl text-sky-900 tabular-nums font-bold leading-none">{feedbacks.length}</div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-4 p-4">
            {modules.map((m, i) => (
              <Card key={i} title={m.title}>{m.component}</Card>
            ))}
          </div>
        ) : (
          <div key={currentCycleIndex} className="h-full w-full animate-fade-in flex flex-col items-center justify-center p-8">
             <div className="mb-6 text-center">
                <h2 className="text-4xl md:text-6xl text-sky-900 italic leading-none">
                  {modules[currentCycleIndex].title}
                </h2>
                <div className="h-1 w-24 bg-sky-800 mx-auto mt-4 rounded-full opacity-20"></div>
             </div>
             <div className="w-full flex-1 max-w-6xl mx-auto flex items-center justify-center bg-white/95 rounded-[3rem] shadow-2xl border-[10px] border-white/50 overflow-hidden">
                {modules[currentCycleIndex].component}
             </div>
          </div>
        )}
      </main>

      <footer className="h-1 bg-sky-100 w-full overflow-hidden relative">
        <div 
          className={`h-full bg-sky-800 transition-all duration-[1000ms] ease-linear`}
          style={{ width: viewMode === 'cycle' ? `${((currentCycleIndex + 1) / 4) * 100}%` : '100%' }}
        />
      </footer>
    </div>
  );
};

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white/95 rounded-[2rem] shadow-sm flex flex-col overflow-hidden border border-sky-100 group hover:shadow-xl transition-all duration-500">
    <div className="px-5 py-2 flex justify-between items-center bg-sky-800 text-white">
      <h3 className="text-[13px] italic tracking-wider whitespace-nowrap overflow-hidden text-ellipsis mr-2">{title}</h3>
      <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40 group-hover:opacity-100 transition-opacity"></div>
    </div>
    <div className="flex-1 overflow-hidden relative">
      {children}
    </div>
  </div>
);
