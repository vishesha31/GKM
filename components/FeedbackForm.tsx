
import React, { useState } from 'react';
import { FeedbackType, EMOJIS, PollOption } from '../types';
import { saveFeedback } from '../services/dataService';
import { audioService } from '../services/audioService';
import { EmojiFountain } from './EmojiFountain';
import { Logo } from './Branding';

export const FeedbackForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeedbackType>('word');
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

      <header className="flex items-center gap-5 mb-6 bg-white py-4 px-8 rounded-[2rem] shadow-sm border border-sky-100">
        <Logo type="event" className="h-16 w-16" />
        <div className="flex-1">
          <h1 className="text-sky-900 text-2xl md:text-3xl italic whitespace-nowrap overflow-hidden text-ellipsis leading-none">Gurukul Kaushal Mela</h1>
          <p className="text-sky-600 text-[12px] italic uppercase tracking-[0.2em] mt-2 border-t border-sky-50 pt-1">Interactive Feedback Portal</p>
        </div>
      </header>

      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-sky-700 text-white px-8 py-4 rounded-full shadow-2xl z-50 animate-bounce flex items-center gap-3 text-sm border-2 border-white italic">
          ✨ Feedback Received
        </div>
      )}

      <div className="flex justify-center gap-2 mb-6 bg-sky-100/30 p-1.5 rounded-2xl border border-sky-200/20">
        {(['word', 'emoji', 'poll', 'comment'] as FeedbackType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-1 rounded-xl text-[14px] transition-all duration-300 ${
              activeTab === tab ? 'bg-sky-700 text-white shadow-md' : 'text-sky-600 hover:text-sky-800 italic'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-[0_20px_60px_rgba(12,74,110,0.05)] border border-sky-100 transition-all duration-500 min-h-[380px] flex items-center justify-center relative overflow-hidden">
        {activeTab === 'word' && (
          <div className="w-full text-center animate-fade-in">
            <h2 className="text-lg text-sky-800 mb-8 italic">Your exhibition experience in one word?</h2>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Type here..."
              className="w-full text-center text-4xl font-serif p-4 border-b-2 border-sky-100 focus:border-sky-500 outline-none transition-colors text-sky-900 placeholder:text-sky-200"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit('word', word)}
              autoFocus
            />
            <button
              onClick={() => handleSubmit('word', word)}
              className="mt-12 bg-sky-700 text-white px-14 py-3.5 rounded-full text-lg hover:bg-sky-800 transition-all active:scale-95 shadow-lg shadow-sky-100 italic"
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
                className="text-6xl md:text-7xl p-8 bg-sky-50/10 hover:bg-sky-50 rounded-[2.5rem] transition-all hover:scale-105 active:scale-90 border border-transparent hover:border-sky-200 group relative"
              >
                {emoji}
                <div className="absolute inset-0 rounded-[2.5rem] bg-sky-900 opacity-0 group-hover:opacity-[0.03] transition-opacity"></div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'poll' && (
          <div className="w-full animate-fade-in">
            <h2 className="text-lg text-sky-800 mb-8 text-center italic">Rate the Gurukul Kaushal Mela</h2>
            <div className="space-y-3">
              {Object.values(PollOption).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSubmit('poll', opt)}
                  className="w-full p-5 rounded-2xl border border-sky-100 hover:border-sky-400 hover:bg-sky-50 text-left text-sky-900 transition-all flex justify-between items-center group text-lg italic"
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
            <h2 className="text-lg text-sky-800 mb-8 italic">Leave a note for the students...</h2>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Your encouraging words..."
              className="w-full h-40 p-6 bg-sky-50/20 rounded-[2rem] border border-sky-100 focus:border-sky-500 outline-none resize-none transition-all text-sky-900 text-lg italic"
            />
            <button
              onClick={() => handleSubmit('comment', comment)}
              className="mt-6 bg-sky-700 text-white px-14 py-3.5 rounded-full text-lg hover:bg-sky-800 transition-all active:scale-95 shadow-lg shadow-sky-100 w-full italic"
            >
              Post Feedback
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
