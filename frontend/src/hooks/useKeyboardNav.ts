/**
 * Keyboard navigation hook
 */
import { useEffect } from 'react';
import { useDocsStore, useWizardStore } from '../store';

export function useKeyboardNav() {
  const gotoNext = useDocsStore((s) => s.gotoNext);
  const gotoPrev = useDocsStore((s) => s.gotoPrev);
  const wizardOpen = useWizardStore((s) => s.open);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (wizardOpen) return;

      if (e.key === 'ArrowRight' || e.key === 'j') {
        gotoNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'k') {
        gotoPrev();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gotoNext, gotoPrev, wizardOpen]);
}
