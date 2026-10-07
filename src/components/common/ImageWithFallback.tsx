import React, { useState } from 'react';
import { Shirt } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  className?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Zippy Fashion Product',
  fallbackText,
  className = '',
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F3F3F1] text-neutral-500 p-4 text-center select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-full bg-neutral-200/80 flex items-center justify-center mb-2 text-neutral-600">
          <Shirt className="w-6 h-6 stroke-[1.5]" />
        </div>
        <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-600">
          Zippy Atelier
        </span>
        <span className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
          {fallbackText || alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-[#F3F3F1] animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-neutral-200/60" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};
