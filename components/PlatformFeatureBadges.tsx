'use client';

import React from 'react';
import { motion } from 'motion/react';

interface FeatureItem {
  id: string;
  label: string;
  dotColor: string;
  dotRingColor?: string;
  badgeBg?: string;
  badgeBorder?: string;
  textColor?: string;
  description?: string;
}

interface PlatformFeatureBadgesProps {
  variant?: 'pill' | 'card' | 'inline' | 'bar';
  className?: string;
  showDescriptions?: boolean;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: 'format-support',
    label: 'PDF & Text Format Supported',
    dotColor: 'bg-emerald-500',
    dotRingColor: 'ring-emerald-200/70',
    badgeBg: 'bg-emerald-50/40',
    badgeBorder: 'border-emerald-200/60',
    textColor: 'text-stone-700',
    description: 'Bilingual PDF renderer & instant chapter text viewer',
  },
  {
    id: 'realtime-sync',
    label: 'Real-time Catalog Synchronization',
    dotColor: 'bg-sky-500',
    dotRingColor: 'ring-sky-200/70',
    badgeBg: 'bg-sky-50/40',
    badgeBorder: 'border-sky-200/60',
    textColor: 'text-stone-700',
    description: 'Instant state persistence across sessions and tabs',
  },
];

export default function PlatformFeatureBadges({
  variant = 'pill',
  className = '',
  showDescriptions = false,
}: PlatformFeatureBadgesProps) {
  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mx-auto ${className}`}>
        {DEFAULT_FEATURES.map((feature) => (
          <div
            key={feature.id}
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/90 border border-stone-200/80 shadow-2xs transition-all hover:border-stone-300"
          >
            {/* Precise Indicator Dot with harmonic ring */}
            <div className="flex items-center justify-center w-5 h-5 shrink-0 mt-0.5">
              <span className={`relative flex h-2.5 w-2.5`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${feature.dotColor}`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ring-2 ring-offset-1 ring-offset-white ${feature.dotColor} ${feature.dotRingColor}`} />
              </span>
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-[13px] font-semibold text-stone-800 tracking-tight whitespace-nowrap">
                {feature.label}
              </span>
              {showDescriptions && feature.description && (
                <span className="text-[11px] text-stone-500 leading-snug mt-0.5">
                  {feature.description}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'bar') {
    return (
      <div className={`w-full py-3 px-4 sm:px-6 rounded-2xl bg-stone-50/80 border border-stone-200/70 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 ${className}`}>
        {DEFAULT_FEATURES.map((feature) => (
          <div
            key={feature.id}
            className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
          >
            {/* Precision Optical Indicator Dot */}
            <span className="relative flex h-2 w-2 shrink-0 items-center justify-center" aria-hidden="true">
              <span className={`w-2 h-2 rounded-full ring-2 ring-white shadow-2xs ${feature.dotColor}`} />
            </span>
            {/* Typography */}
            <span className="text-xs font-semibold text-stone-700 tracking-tight whitespace-nowrap select-none">
              {feature.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Default 'pill' variant: Balanced, standalone capsules with exact mathematical 2x horizontal padding
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 ${className}`}>
      {DEFAULT_FEATURES.map((feature) => (
        <div
          key={feature.id}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border bg-white/90 ${feature.badgeBorder} shadow-2xs transition-all hover:bg-stone-50/80 whitespace-nowrap shrink-0`}
        >
          {/* Precise Optical Indicator Dot */}
          <span className="relative flex h-2 w-2 shrink-0 items-center justify-center" aria-hidden="true">
            <span className={`w-2 h-2 rounded-full ${feature.dotColor}`} />
          </span>

          {/* Typography */}
          <span className="text-xs font-medium text-stone-700 tracking-tight whitespace-nowrap select-none">
            {feature.label}
          </span>
        </div>
      ))}
    </div>
  );
}
