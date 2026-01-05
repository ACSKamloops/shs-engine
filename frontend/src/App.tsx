/**
 * App - SHS Public Website
 * Secwépemc Hunting Society - Clean Public Site
 * NO Pukaist Engine components - standalone public website
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicLayout } from './layouts/PublicLayout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Public pages
import {
  HomePage,
  CurriculumHub,
  CurriculumPage,
  AboutPage,
  ContactPage,
  DonatePage,
  MapPage,
  GalleryPage,
  MembershipPage,
  CulturalCampsPage,
  EventsPage,
  ProjectsPage,
  LanguagePage,
  StewardshipPage,
  StoriesPage,
  PhraseBrowserPage,
  CulturalKnowledgePage,
  LawsPage,
  DictionaryPage,
  SeasonalCalendarPage,
  PlantDatabasePage,
  LandscapeTermsPage,
  LessonsPage,
} from './pages/public';

import './index.css';

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* SHS Public Website */}
            <Route element={<PublicLayout />}>
              {/* Home */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              
              {/* Curriculum Routes */}
              <Route path="/curriculum" element={<CurriculumHub />} />
              <Route path="/curriculum/land" element={<CurriculumHub />} />
              <Route path="/curriculum/mind" element={<CurriculumHub />} />
              <Route path="/curriculum/heart" element={<CurriculumHub />} />
              <Route path="/curriculum/spirit" element={<CurriculumHub />} />
              <Route path="/curriculum/:pathwayId/:moduleId" element={<CurriculumPage />} />
              
              {/* Main Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/territory-map" element={<MapPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/cultural-camps" element={<CulturalCampsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              
              {/* Language & Culture */}
              <Route path="/language" element={<LanguagePage />} />
              <Route path="/stewardship" element={<StewardshipPage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/phrases" element={<PhraseBrowserPage />} />
              <Route path="/cultural-knowledge" element={<CulturalKnowledgePage />} />
              <Route path="/laws" element={<LawsPage />} />
              <Route path="/dictionary" element={<DictionaryPage />} />
              
              {/* Data Pages */}
              <Route path="/seasonal-calendar" element={<SeasonalCalendarPage />} />
              <Route path="/plants" element={<PlantDatabasePage />} />
              <Route path="/landscape-terms" element={<LandscapeTermsPage />} />
              <Route path="/lessons" element={<LessonsPage />} />
            </Route>

            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
