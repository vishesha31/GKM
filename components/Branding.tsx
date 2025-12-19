
import React, { useState } from 'react';

interface LogoProps {
  type: 'school' | 'event';
  className?: string;
}

/**
 * Branding component for Gurukul Kaushal Mela.
 * Strictly attempts to load the uploaded image asset without any synthetic fallbacks.
 */
export const Logo: React.FC<LogoProps> = ({ type, className = "" }) => {
  const [srcIndex, setSrcIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failedAll, setFailedAll] = useState(false);

  // The platform usually provides the uploaded file at input_file_0.png.
  const paths = [
    'input_file_0.png',
    'input_file_1.png'
  ];

  const handleError = () => {
    if (srcIndex < paths.length - 1) {
      setSrcIndex(prev => prev + 1);
    } else {
      setFailedAll(true);
    }
  };

  if (failedAll) {
    return null;
  }

  return (
    <div className={`relative flex items-center justify-center ${className} overflow-hidden`}>
      <img 
        src={paths[srcIndex]} 
        alt="" 
        className={`h-full w-auto object-contain transition-all duration-700 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        draggable={false}
      />
      
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-sky-100 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};
