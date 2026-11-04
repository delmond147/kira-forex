'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Youtube, ExternalLink, Calendar } from 'lucide-react';

export interface YouTubeVideoItem {
  id: string;
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  videoUrl: string;
}

interface YouTubeSectionProps {
  videos?: YouTubeVideoItem[];
  channelUrl?: string;
}

const DEFAULT_VIDEOS: YouTubeVideoItem[] = [
  {
    id: 'vid_01',
    videoId: 'v1',
    title: 'Forex Risk Management: How to Calculate Lot Size Like a Pro',
    publishedAt: '2026-10-24',
    thumbnailUrl: '/kira_forex_founder.jpg',
    videoUrl: 'https://youtube.com/@kiraforexgh?si=9Jb8w2JXp1lYrF6U',
  },
  {
    id: 'vid_02',
    videoId: 'v2',
    title: 'Mastering Deriv Synthetics: Boom & Crash Price Action Explained',
    publishedAt: '2026-10-18',
    thumbnailUrl: '/kira_forex_founder.jpg',
    videoUrl: 'https://youtube.com/@kiraforexgh?si=9Jb8w2JXp1lYrF6U',
  },
  {
    id: 'vid_03',
    videoId: 'v3',
    title: "The Trader's Mindset: Overcoming Emotional Traps in the Market",
    publishedAt: '2026-10-10',
    thumbnailUrl: '/kira_forex_founder.jpg',
    videoUrl: 'https://youtube.com/@kiraforexgh?si=9Jb8w2JXp1lYrF6U',
  },
];

export function YouTubeSection({ 
  videos = DEFAULT_VIDEOS,
  channelUrl = 'https://youtube.com/@kiraforexgh?si=9Jb8w2JXp1lYrF6U' 
}: YouTubeSectionProps) {
  // Ensure exactly up to 3 videos are presented
  const displayVideos = videos.slice(0, 3);

  return (
    <section className="py-20 bg-sage-50/60 border-y border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-600 text-xs font-bold uppercase tracking-wider mb-3">
              <Youtube className="w-4 h-4 text-red-600" />
              <span>Official Channel: @kiraforexgh</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-forest-900 tracking-tight">
              Latest Video Breakdowns & Analysis
            </h2>
            <p className="mt-2 text-base text-neutral-600 max-w-2xl">
              Watch real market breakdowns, trade reviews, and live risk-management walk-throughs directly from Kira's desk.
            </p>
          </div>

          <div>
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-semibold text-sm shadow-sm hover:border-red-500 hover:text-red-600 transition"
            >
              <Youtube className="w-4 h-4 text-red-600" />
              <span>View All Videos on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>

        {/* Mandatory 1 Row × 3 Columns Grid (No Carousel) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayVideos.map((video, index) => {
            const formattedDate = video.publishedAt 
              ? new Date(video.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recent Upload';

            return (
              <a
                key={video.id || index}
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-subtle hover:shadow-card hover:border-forest-500 transition-all duration-300"
              >
                {/* 16:9 Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  {/* Subtle Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Play Button Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* YouTube Tag Pill */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-[11px] font-semibold text-white flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-red-500" />
                    <span>KIRAFOREX</span>
                  </div>
                </div>

                {/* Video Metadata Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <h3 className="font-heading font-bold text-base text-neutral-900 group-hover:text-forest-700 transition-colors line-clamp-2">
                    {video.title}
                  </h3>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-forest-600" />
                      {formattedDate}
                    </span>
                    <span className="text-forest-700 font-semibold group-hover:underline flex items-center gap-1">
                      Watch Video &rarr;
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}
