import type React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useApi } from '../hooks';
import { useAppStore, useDocsStore } from '../store';
import { DocumentStatsDashboard } from '../features/stats/DocumentStatsDashboard';
import { CollectionsPanel } from '../features/workspace/CollectionsPanel';
import { TimelineAnimation } from '../features/stats/TimelineAnimation';

export const Dashboard: React.FC = () => {
  const { loadDocs, loadAoiLayers } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  const docs = useDocsStore((s) => s.docs);

  // Timeline animation state
  const [timelineYear, setTimelineYear] = useState<number | null>(null);

  // Get year range from docs
  const getYearRange = useCallback(() => {
    const years = docs
      .map((d) => d.created_at ? new Date(d.created_at * 1000).getFullYear() : null)
      .filter((y): y is number => y !== null && y > 1900);
    if (years.length === 0) return { start: 1990, end: 2024 };
    return { start: Math.min(...years), end: Math.max(...years) };
  }, [docs]);

  const yearRange = getYearRange();

  useEffect(() => {
    // Preload data
    loadDocs().catch(() => setBanner('Failed to load docs'));
    loadAoiLayers().catch(() => console.warn('AOI load failed'));
  }, [loadDocs, loadAoiLayers, setBanner]);

  const handleTimelineYearChange = (year: number | null) => {
    setTimelineYear(year);
    // Could filter docs by year here if needed
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex gap-2">
          <span className="text-sm text-white/50">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Stats Area */}
        <div className="lg:col-span-3 space-y-6">
          <DocumentStatsDashboard />
          
          {/* Timeline Animation */}
          <TimelineAnimation
            startYear={yearRange.start}
            endYear={yearRange.end}
            onYearChange={handleTimelineYearChange}
          />
          
          {timelineYear && (
            <div className="text-sm text-white/60 text-center">
              Showing documents from <span className="font-bold text-purple-400">{timelineYear}</span>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CollectionsPanel />
        </div>
      </div>
    </div>
  );
};
