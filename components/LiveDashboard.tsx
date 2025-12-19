
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
  const [isPaused, setIsPaused] = useState<boolean>(false);
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
    if (viewMode !== 'cycle' || isPaused) return;
    const rotateInterval = setInterval(() => {
      setCurrentCycleIndex(prev => (prev + 1) % 4);
    }, 15000);
    return () => clearInterval(rotateInterval);
  }, [viewMode, isPaused]);

  useEffect(() => {
    if (isPaused) return;
    const modeToggleInterval = setInterval(() => {
      setViewMode(prev => (prev === 'grid' ? 'cycle' : 'grid'));
    }, 180000); 
    return () => clearInterval(modeToggleInterval);
  }, [isPaused]);

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
    { title: "Reaction Wall", component: <EmojiGrid entries={data.emojiEntries} />, gradient: 'from-orange-500 to-pink-500', color: 'bg-orange-500' },
    { title: "Parent Sentiments", component: <WordCloud words={data.words} />, gradient: 'from-purple-600 to-fuchsia-500', color: 'bg-fuchsia-500' },
    { title: "Exhibition Rating", component: <CreativePoll votes={data.pollVotes} />, gradient: 'from-orange-500 to-pink-500', color: 'bg-pink-500' },
    { title: "Voices of Gurukul", component: (
      <div className="flex flex-col gap-4 p-8 overflow-hidden h-full">
        {data.comments.slice(0, 6).map((c, i) => (
          <div key={i} className="bg-orange-50/40 p-6 rounded-[2rem] shadow-sm border-l-[12px] border-purple-600 text-orange-950 text-xl lg:text-2xl animate-fade-in italic">
            "{c}"
          </div>
        ))}
        {data.comments.length === 0 && <p className="text-orange-200 italic text-center mt-32 text-2xl uppercase tracking-[0.4em]">Awaiting Messages...</p>}
      </div>
    ), gradient: 'from-purple-600 to-fuchsia-500', color: 'bg-purple-600' }
  ];

  const handleManualSwitch = (index: number) => {
    setCurrentCycleIndex(index);
    if (viewMode === 'grid') setViewMode('cycle');
  };

  return (
    <div className="fixed inset-0 bg-[#FFF9F2] flex flex-col font-serif select-none overflow-hidden">
      
      {/* Icon-only Controls - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 bg-purple-950/80 backdrop-blur-xl p-1 rounded-xl border border-white/10 shadow-2xl scale-75 lg:scale-90 origin-bottom-right">
        <button 
          onClick={() => setViewMode('grid')}
          className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-purple-950 shadow-sm' : 'text-white/40 hover:text-white'}`}
          title="Grid View"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2-2h-2a2 2 0 01-2-2v-2z" /></svg>
        </button>
        
        <button 
          onClick={() => setViewMode('cycle')}
          className={`p-1.5 rounded-lg transition-all ${viewMode === 'cycle' ? 'bg-white text-purple-950 shadow-sm' : 'text-white/40 hover:text-white'}`}
          title="Auto Cycle"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5"></div>

        <button 
          onClick={() => setIsPaused(!isPaused)}
          className={`p-1.5 rounded-lg transition-all ${isPaused ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white'}`}
          title={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          )}
        </button>
      </div>

      {/* Header with Logo before Title */}
      <header className="bg-white px-8 flex justify-between items-center z-20 border-b border-orange-50 shadow-sm h-16 lg:h-24 flex-shrink-0">
        <div className="flex items-center gap-4 pt-4 lg:pt-6">
           <Logo type="event" className="h-10 lg:h-14 w-auto" />
           <div className="flex flex-col">
              <h1 className="text-lg lg:text-2xl font-bold italic text-gradient leading-none">Gurukul Kaushal Mela</h1>
              <span className="text-purple-600 italic text-[10px] lg:text-[12px] tracking-widest mt-1 uppercase">Live Dashboard</span>
           </div>
        </div>
        
        <div className="flex items-center gap-8 pt-4 lg:pt-6">
          <div className="text-right">
            <div className="text-[10px] text-orange-400 uppercase tracking-widest font-bold">Total Feedback</div>
            <div className="text-2xl lg:text-3xl text-purple-900 tabular-nums font-bold leading-none">{feedbacks.length}</div>
          </div>
        </div>
      </header>

      {/* Main Display Area */}
      <main className="flex-1 relative overflow-hidden bg-white/50">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-2 lg:gap-4 p-2 lg:p-4 animate-fade-in">
            {modules.map((m, i) => (
              <Card key={i} title={m.title} gradient={m.gradient} onClick={() => handleManualSwitch(i)}>
                {m.component}
              </Card>
            ))}
          </div>
        ) : (
          <div key={currentCycleIndex} className="h-full w-full animate-fade-in flex flex-col items-center justify-center p-2 lg:p-6">
             {/* Unified Card Structure for Cycle View */}
             <div className="w-full h-full bg-white rounded-[1.5rem] lg:rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] border border-orange-50 flex flex-col overflow-hidden relative group">
                
                {/* Same Styled Title Bar as Grid View */}
                <div className={`px-6 py-3 lg:py-4 bg-gradient-to-r ${modules[currentCycleIndex].gradient} flex justify-between items-center z-20`}>
                  <h3 className="text-lg lg:text-2xl tracking-wide font-bold text-white italic leading-none">
                    {modules[currentCycleIndex].title}
                  </h3>
                  <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_12px_white] animate-pulse"></div>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative overflow-hidden">
                  {modules[currentCycleIndex].component}
                  
                  {/* Colorful Dot Navigation - Bottom Center */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40 bg-white/40 backdrop-blur-md px-5 py-3 rounded-full border border-black/5 shadow-sm transition-all duration-300 group-hover:bg-white/70 group-hover:shadow-lg">
                    {modules.map((m, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); handleManualSwitch(i); }}
                        className={`w-3.5 h-3.5 rounded-full transition-all duration-500 hover:scale-150 ${
                          currentCycleIndex === i 
                            ? `${m.color} scale-125 ring-4 ring-white shadow-md` 
                            : 'bg-black/20 hover:bg-black/40'
                        }`}
                        title={m.title}
                      />
                    ))}
                  </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Progress/Status Bar */}
      <div className="h-[3px] w-full bg-orange-50/50 flex flex-shrink-0">
        <div 
          className={`h-full bg-gradient-to-r from-orange-500 to-purple-600 transition-all ease-linear ${isPaused ? 'opacity-30' : ''}`}
          style={{ 
            width: isPaused ? '0%' : '100%',
            transitionDuration: viewMode === 'cycle' ? '15000ms' : '180000ms'
          }}
          key={`${viewMode}-${currentCycleIndex}-${isPaused}`}
        />
      </div>
    </div>
  );
};

const Card: React.FC<{ title: string; children: React.ReactNode; gradient?: string; onClick?: () => void }> = ({ title, children, gradient = 'from-orange-500 to-purple-600', onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-2xl lg:rounded-[2rem] shadow-sm flex flex-col overflow-hidden border border-orange-50 group hover:shadow-xl hover:scale-[1.005] transition-all duration-500 cursor-pointer"
  >
    <div className={`px-5 py-2 lg:py-3 bg-gradient-to-r ${gradient} flex justify-between items-center`}>
      <h3 className="text-sm lg:text-base tracking-wide font-bold text-white italic leading-none">{title}</h3>
      <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]"></div>
    </div>
    <div className="flex-1 overflow-hidden relative">
      {children}
    </div>
  </div>
);
