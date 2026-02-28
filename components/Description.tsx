'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DescriptionProps {
  text: string;
}

export default function Description({ text }: DescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const element = textRef.current;
        // Reset to clamped state to measure correctly
        const isOverflowing = element.scrollHeight > element.clientHeight;
        setShouldShowButton(isOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <div className="relative">
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[1000px]' : 'max-h-[4.5rem]'
        }`}
      >
        <div 
          ref={textRef as any}
          className={`text-stone-600 text-sm md:text-base leading-relaxed prose prose-sm md:prose-base prose-stone max-w-none ${
            !isExpanded ? 'line-clamp-3' : ''
          }`}
          dangerouslySetInnerHTML={{ __html: text || 'Tidak ada deskripsi.' }}
        />
      </div>
      
      {shouldShowButton && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-emerald-600 hover:text-emerald-700 text-xs md:text-sm font-bold flex items-center gap-1 transition-colors group"
        >
          {isExpanded ? (
            <>
              Read less <ChevronUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
            </>
          ) : (
            <>
              Read more <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
