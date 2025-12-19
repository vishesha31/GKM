
import React, { useState, useEffect } from 'react';
import { FeedbackForm } from './components/FeedbackForm';
import { LiveDashboard } from './components/LiveDashboard';

const App: React.FC = () => {
  const [view, setView] = useState<'input' | 'display'>('input');

  useEffect(() => {
    if (window.location.hash === '#display') {
      setView('display');
    }

    const handleHashChange = () => {
      setView(window.location.hash === '#display' ? 'display' : 'input');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const switchToDisplay = () => {
    window.location.hash = 'display';
    setView('display');
  };

  const switchToInput = () => {
    window.location.hash = '';
    setView('input');
  };

  if (view === 'display') {
    return (
      <div className="relative h-screen">
        <LiveDashboard />
        <button 
          onClick={switchToInput}
          className="fixed bottom-4 left-4 z-50 bg-white/80 hover:bg-white px-5 py-2 rounded-full text-[13px] italic text-sky-900 transition-all backdrop-blur-sm shadow-xl border border-sky-100"
        >
          ← Exit Display Mode
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-sky-100 p-4 flex justify-between items-center z-50">
        <div className="text-[12px] italic text-sky-900 font-bold uppercase tracking-widest">Gurukul Kaushal Mela • 2024</div>
        <button 
          onClick={switchToDisplay}
          className="text-[13px] italic text-sky-50 bg-sky-900 px-5 py-2 rounded-full hover:bg-sky-800 transition-all active:scale-95 shadow-lg"
        >
          Go to Live Dashboard
        </button>
      </nav>
      
      <main className="pt-6">
        <FeedbackForm />
        
        <div className="max-w-xl mx-auto mt-6 px-4 text-center">
            <div className="bg-white/80 p-8 rounded-[3rem] shadow-xl border-4 border-dashed border-sky-100 inline-block w-full max-w-sm">
                <div className="w-full aspect-square bg-sky-50/50 rounded-3xl flex items-center justify-center relative overflow-hidden group border border-sky-100">
                    <div className="grid grid-cols-5 grid-rows-5 gap-1.5 p-6 opacity-30">
                         {Array.from({length: 25}).map((_, i) => (
                             <div key={i} className={`bg-sky-900 rounded-sm ${Math.random() > 0.4 ? 'opacity-100' : 'opacity-0'}`}></div>
                         ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white p-5 rounded-2xl shadow-xl border border-sky-50 text-sky-900 text-sm text-center italic leading-tight">
                            Scan to Give<br/>Feedback
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-[11px] italic text-sky-400 uppercase tracking-[0.2em]">Share Screen for Mobile Users</p>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
