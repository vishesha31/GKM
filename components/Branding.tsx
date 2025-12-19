
import React, { useState, useEffect } from 'react';

interface LogoProps {
  type: 'school' | 'event';
  className?: string;
}

/**
 * Branding component for Gurukul Kaushal Mela.
 * Optimized for reliable asset loading in the preview environment.
 * input_file_0.png: The latest GKM Logo provided by the user.
 */
export const Logo: React.FC<LogoProps> = ({ type, className = "" }) => {
  const [src, setSrc] = useState<string>('');
  const [errorCount, setErrorCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // The user provided the logo as an attachment.
    // In this environment, attachments are accessed via input_file_N.png
    // Based on the prompt history, input_file_0.png is the most likely target for the latest logo.
    const paths = type === 'school' 
      ? ['input_file_1.png', 'School.png'] 
      : ['input_file_0.png', 'GKM.png'];
    
    setSrc(paths[errorCount] || paths[0]);
  }, [type, errorCount]);

  const handleError = () => {
    if (errorCount < 1) {
      setErrorCount(prev => prev + 1);
    }
  };

  return (
    <div className={`flex items-center justify-center ${className} overflow-hidden`}>
      {src && (
        <img 
          src={src} 
          alt={type === 'school' ? "School Logo" : "Event Logo"} 
          className={`h-full w-auto object-contain transition-all duration-500 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={handleError}
        />
      )}
      {!loaded && !src && (
         <div className="w-10 h-10 bg-sky-100 rounded-lg animate-pulse"></div>
      )}
    </div>
  );
};
