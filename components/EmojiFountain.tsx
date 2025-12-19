
import React, { useEffect, useState } from 'react';

interface EmojiFountainProps {
  emoji: string;
  count?: number;
}

export const EmojiFountain: React.FC<EmojiFountainProps> = ({ emoji, count = 12 }) => {
  const [particles, setParticles] = useState<{ id: number; left: number; delay: number }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 2000);
    return () => clearTimeout(timer);
  }, [emoji, count]);

  if (particles.length === 0) return null;

  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className="emoji-particle text-4xl"
          style={{
            left: `${p.left}%`,
            bottom: '-50px',
            animation: `rise 1.5s ease-out ${p.delay}s forwards`
          }}
        >
          {emoji}
        </div>
      ))}
    </>
  );
};
