
import React, { useState } from 'react';
import { FeedbackType, EMOJIS, PollOption } from '../types';
import { saveFeedback } from '../services/dataService';
import { audioService } from '../services/audioService';
import { EmojiFountain } from './EmojiFountain';
import { Logo } from './Branding';

export const FeedbackForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeedbackType>('emoji');
  const [word, setWord] = useState('');
  const [comment, setComment] = useState('');
  const [activeEmoji, setActiveEmoji] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (type: FeedbackType, value: string) => {
    if (!value.trim()) return;
    
    saveFeedback({
      id: Math.random().toString(36).substr(2, 9) + Date.now(),
      type,
      value,
      timestamp: Date.now(),
    });
    
    audioService.playSuccess();
    
    if (type === 'word') setWord('');
    if (type === 'comment') setComment('');
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleEmojiSelect = (emoji: string) => {
    setActiveEmoji(emoji);
    audioService.playPop();
    handleSubmit('emoji', emoji);
    setTimeout(() => setActiveEmoji(null), 1500);
  };

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 font-serif">
      {activeEmoji && <EmojiFountain emoji={activeEmoji} />}

      <header className="flex items-center gap-5 mb-8 bg-white py-4 px-8 rounded-[2rem] shadow-sm border border-orange-100">
        <Logo type="event" className="h-16 w-16 flex-shrink-0" />
        <div className="flex-1 min-w-0 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl italic whitespace-nowrap overflow-hidden text-ellipsis leading-none font-bold text-gradient">Gurukul Kaushal Mela</h1>
          <p className="text-orange-600/70 text-[12px] italic uppercase tracking-[0.2em] mt-2 border-t border-orange-50 pt-1">Project Based Learning Exhibition 2025-26</p>
        </div>
      </header>

      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-8 py-4 rounded-full shadow-2xl z-50 animate-bounce flex items-center gap-3 text-sm border-2 border-white italic">
          ✨ Feedback Received! 🎊
        </div>
      )}

      {/* Enhanced Category Navigation with Icons */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {(['emoji', 'word', 'poll', 'comment'] as FeedbackType[]).map((tab) => {
          const config = {
            emoji: { label: 'Emoji React', icon: '😍' },
            word: { label: 'One Word', icon: '💭' },
            poll: { label: 'Quick Poll', icon: '📊' },
            comment: { label: 'Comments', icon: '✍️' }
          }[tab];
          
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-[2rem] transition-all duration-500 shadow-sm border ${
                isActive 
                  ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white border-transparent shadow-xl scale-105' 
                  : 'bg-white/90 border-orange-50 text-orange-900/60 hover:bg-white hover:border-orange-100'
              }`}
            >
              <span className={`text-3xl md:text-4xl mb-2 transition-transform duration-500 ${isActive ? 'scale-110 rotate-3' : 'grayscale-[0.2] opacity-80'}`}>
                {config.icon}
              </span>
              <span className={`text-[10px] md:text-[11px] font-bold text-center leading-tight ${isActive ? 'text-white' : 'text-orange-950'}`}>
                {config.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-[0_20px_60px_rgba(249,115,22,0.05)] border border-orange-100 transition-all duration-500 min-h-[380px] flex items-center justify-center relative overflow-hidden">
        {activeTab === 'word' && (
          <div className="w-full text-center animate-fade-in">
            <h2 className="text-lg text-orange-800 mb-8 italic">Your exhibition experience in one word?</h2>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Type here..."
              className="w-full text-center text-4xl font-serif p-4 border-b-2 border-orange-100 focus:border-purple-500 outline-none transition-colors text-orange-900 placeholder:text-orange-100"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit('word', word)}
              autoFocus
            />
            <button
              onClick={() => handleSubmit('word', word)}
              className="mt-12 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-14 py-3.5 rounded-full text-lg hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-orange-100 italic font-bold"
            >
              Share Sentiment
            </button>
          </div>
        )}

        {activeTab === 'emoji' && (
          <div className="grid grid-cols-2 gap-6 w-full animate-fade-in">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="text-6xl md:text-7xl p-8 bg-orange-50/10 hover:bg-orange-50 rounded-[2.5rem] transition-all hover:scale-105 active:scale-90 border border-transparent hover:border-orange-200 group relative"
              >
                {emoji}
                <div className="absolute inset-0 rounded-[2.5rem] bg-orange-900 opacity-0 group-hover:opacity-[0.03] transition-opacity"></div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'poll' && (
          <div className="w-full animate-fade-in">
            <h2 className="text-lg text-orange-800 mb-8 text-center italic">Rate the Gurukul Kaushal Mela</h2>
            <div className="space-y-3">
              {Object.values(PollOption).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSubmit('poll', opt)}
                  className="w-full p-5 rounded-2xl border border-orange-100 hover:border-purple-400 hover:bg-purple-50 text-left text-orange-900 transition-all flex justify-between items-center group text-lg italic"
                >
                  {opt}
                  <span className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">✨</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'comment' && (
          <div className="w-full text-center animate-fade-in">
            <h2 className="text-lg text-orange-800 mb-8 italic">Leave a note for the students...</h2>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Your encouraging words..."
              className="w-full h-40 p-6 bg-orange-50/20 rounded-[2rem] border border-orange-100 focus:border-purple-500 outline-none resize-none transition-all text-orange-900 text-lg italic"
            />
            <button
              onClick={() => handleSubmit('comment', comment)}
              className="mt-6 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-14 py-3.5 rounded-full text-lg hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-orange-100 w-full italic font-bold"
            >
              Post Feedback
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
