/**
 * AdminApp - Admin Dashboard Application
 * Contains the original Pukaist Engine dashboard functionality
 * Lazy loaded when accessing /admin routes
 */
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useWizardStore, useAppStore } from './store';
import { useApi } from './hooks';
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { DocumentList } from './pages/DocumentList';
import { MapExplorer } from './pages/MapExplorer';
import { Settings } from './pages/Settings';
import { Wizard } from './components/Wizard';
import { UploadStatusIndicator } from './components/UploadStatusIndicator';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';
import { CommandPalette, useCommandPalette } from './components/CommandPalette';
import { DevPanel } from './features/dev';
import { TourModal } from './features/tour';
import { ErrorBoundary } from './components/ErrorBoundary';
import { lazy, Suspense } from 'react';

const AdminView = lazy(() => import('./features/admin/AdminView'));
const OcrViewer = lazy(() => import('./features/ocr-viewer/OcrViewer'));
const AdminMapPage = lazy(() => import('./pages/admin/AdminMapPage').then(m => ({ default: m.AdminMapPage })));

export default function AdminApp() {
  // Enable keyboard shortcuts
  useKeyboardShortcuts(DEFAULT_SHORTCUTS);

  // Command palette state
  const commandPalette = useCommandPalette();

  const wizardOpen = useWizardStore((s) => s.open);
  const setWizardOpen = useWizardStore((s) => s.setOpen);
  const wizardFields = useWizardStore((s) => s.fields);
  const setWizardFields = useWizardStore((s) => s.setFields);
  const wizardSuggestions = useWizardStore((s) => s.suggestions);
  const setSuggestions = useWizardStore((s) => s.setSuggestions);
  const setBanner = useAppStore((s) => s.setBanner);
  const { geoSuggest } = useApi();

  // Listen for keyboard shortcut to open wizard
  useEffect(() => {
    const handleNewWizard = () => setWizardOpen(true);
    document.addEventListener('shortcut:new-wizard', handleNewWizard);
    return () => document.removeEventListener('shortcut:new-wizard', handleNewWizard);
  }, [setWizardOpen]);

  const handleWizardSuggest = async () => {
    const mission = (wizardFields.mission || '').trim();
    if (!mission) {
      setBanner('Add a goal first, then request suggestions');
      return;
    }
    const suggestion = await geoSuggest(mission);
    if (!suggestion) return;
    setSuggestions(suggestion);
    return suggestion;
  };

  return (
    <>
      <Routes>
        {/* Territory Map Manager - Full screen layout */}
        <Route
          path="territory-map"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen bg-shs-cream flex items-center justify-center">
                  <div className="text-shs-forest-600 animate-pulse">Loading map manager...</div>
                </div>
              }
            >
              <AdminMapPage />
            </Suspense>
          }
        />

        {/* Dashboard routes - with DashboardLayout */}
        <Route
          path="*"
          element={
            <DashboardLayout>
              <ErrorBoundary>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="documents" element={<DocumentList />} />
                  <Route path="map" element={<MapExplorer />} />
                  <Route path="settings" element={<Settings />} />
                  <Route
                    path="console"
                    element={
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center h-96">
                            <div className="text-white/50 animate-pulse">Loading admin console...</div>
                          </div>
                        }
                      >
                        <AdminView />
                      </Suspense>
                    }
                  />
                  <Route
                    path="ocr-viewer"
                    element={
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center h-96">
                            <div className="text-white/50 animate-pulse">Loading OCR viewer...</div>
                          </div>
                        }
                      >
                        <OcrViewer />
                      </Suspense>
                    }
                  />
                  {/* Redirect unknown admin routes to dashboard */}
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </ErrorBoundary>
            </DashboardLayout>
          }
        />
      </Routes>

      {/* Global Overlays */}
      <UploadStatusIndicator />
      <KeyboardShortcutsHelp />
      <CommandPalette isOpen={commandPalette.isOpen} onClose={commandPalette.close} />
      <DevPanel />
      <TourModal />

      {/* Wizard Modal */}
      {wizardOpen && (
        <Wizard
          isOpen={wizardOpen}
          caseType={wizardFields.caseType}
          claimant={wizardFields.claimant}
          defendant={wizardFields.defendant}
          periodStart={wizardFields.periodStart}
          periodEnd={wizardFields.periodEnd}
          mission={wizardFields.mission}
          requirements={wizardFields.requirements}
          theme={wizardFields.theme}
          aoiTheme={wizardFields.aoiTheme}
          aoiCode={wizardFields.aoiCode}
          aoiName={wizardFields.aoiName}
          bandNbr={wizardFields.bandNbr}
          summaryEnabled={wizardFields.summaryEnabled}
          llmMode={wizardFields.llmMode}
          allowedExts={wizardFields.allowedExts}
          themeLand={wizardFields.themeLand}
          themeGovernance={wizardFields.themeGovernance}
          themeFiduciary={wizardFields.themeFiduciary}
          themeWater={wizardFields.themeWater}
          themeCoercion={wizardFields.themeCoercion}
          onChange={setWizardFields}
          onClose={() => setWizardOpen(false)}
          onSave={() => {
            setBanner('Profile saved');
            setWizardOpen(false);
          }}
          onSuggest={handleWizardSuggest}
          suggestions={wizardSuggestions}
        />
      )}
    </>
  );
}
