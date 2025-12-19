
import React, { useState, useEffect } from 'react';
import { FeedbackForm } from './components/FeedbackForm';
import { LiveDashboard } from './components/LiveDashboard';

const App: React.FC = () => {
  const [view, setView] = useState<'input' | 'display'>('input');
  // Updated URL to point to the root with a source tracker
  const qrUrl = "https://gkm-ruby.vercel.app/?source=qr";
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}&color=4A2B12&bgcolor=ffffff`;

  const [isQrMode, setIsQrMode] = useState(false);

  useEffect(() => {
    // Check if opened via QR code
    const params = new URLSearchParams(window.location.search);
    if (params.get('source') === 'qr') {
      setIsQrMode(true);
    }

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

  const handleFeedbackSuccess = () => {
    if (isQrMode) {
      // If via QR, wait for the thank you message then switch to dashboard
      setTimeout(() => {
        switchToDisplay();
      }, 2500);
    }
  };

  const CreditBadge = () => (
    <div className="fixed top-1 right-2 lg:top-2 lg:right-6 z-[100] pointer-events-none select-none text-[11px] lg:text-[13px] text-black italic font-bold tracking-tight animate-fade-in drop-shadow-sm">
      created by Saisha Saxena (VII G)
    </div>
  );

  if (view === 'display') {
    return (
      <div className="relative h-screen">
        <LiveDashboard />
        <CreditBadge />
        <button 
          onClick={switchToInput}
          className="fixed bottom-4 left-4 z-50 bg-white/90 hover:bg-white px-5 py-2 rounded-full text-[13px] italic text-purple-900 transition-all backdrop-blur-sm shadow-xl border border-purple-100 font-bold"
        >
          ← Return to Feedback
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative">
      <CreditBadge />
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-orange-100 p-4 flex justify-between items-center z-50">
        <div className="text-[12px] italic font-bold uppercase tracking-widest text-gradient">Gurukul Kaushal Mela • 2025-26</div>
        <button 
          onClick={switchToDisplay}
          className="text-[13px] italic text-white bg-gradient-to-r from-orange-500 to-purple-600 px-6 py-2.5 rounded-full hover:opacity-90 transition-all active:scale-95 shadow-lg font-bold"
        >
          Live Dashboard 🖥️
        </button>
      </nav>
      
      <main className="pt-6">
        <FeedbackForm onSubmitted={handleFeedbackSuccess} />
        
        <div className="max-w-xl mx-auto mt-10 px-4 text-center">
            <div className="bg-white/80 p-8 rounded-[3rem] shadow-xl border-4 border-dashed border-orange-100 inline-block w-full max-w-sm transform hover:scale-[1.02] transition-transform duration-500">
                <div className="w-full aspect-square bg-white rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group border border-orange-50 p-6 shadow-inner">
                    <img 
                      src={qrImageUrl} 
                      alt="QR Code for Feedback" 
                      className="w-full h-full object-contain mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 pointer-events-none border-[12px] border-white/40 rounded-3xl"></div>
                </div>
                <div className="mt-6 space-y-2">
                    <div className="bg-orange-50 py-2 px-4 rounded-full inline-block border border-orange-100">
                        <p className="text-orange-950 text-[13px] italic font-bold leading-tight">
                            Share your feedback! ✨
                        </p>
                    </div>
                    <p className="text-[10px] text-orange-400 uppercase tracking-[0.2em] font-bold">
                        Scan to open Feedback Page
                    </p>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
