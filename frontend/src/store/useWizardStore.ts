/**
 * Wizard state store
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WizardFields {
  caseType: string;
  claimant: string;
  defendant: string;
  periodStart: string;
  periodEnd: string;
  mission: string;
  requirements: string;
  theme: string;
  aoiTheme: string;
  aoiCode: string;
  aoiName: string;
  bandNbr: string;
  summaryEnabled: boolean;
  llmMode: string;
  allowedExts: string;
  themeLand: boolean;
  themeGovernance: boolean;
  themeFiduciary: boolean;
  themeWater: boolean;
  themeCoercion: boolean;
}

interface WizardSuggestions {
  aoi_themes: string[];
  aoi_codes: string[];
  aoi_names: string[];
  band_numbers: string[];
}

interface WizardState {
  open: boolean;
  fields: WizardFields;
  suggestions: WizardSuggestions | null;
  applyFrame: boolean;

  // Actions
  setOpen: (open: boolean) => void;
  setField: <K extends keyof WizardFields>(key: K, value: WizardFields[K]) => void;
  setFields: (fields: Partial<WizardFields>) => void;
  setSuggestions: (s: WizardSuggestions | null) => void;
  setApplyFrame: (apply: boolean) => void;
  save: () => void;
}

const DEFAULT_FIELDS: WizardFields = {
  caseType: 'general_project',
  claimant: '',
  defendant: '',
  periodStart: '',
  periodEnd: '',
  mission: '',
  requirements: '',
  theme: '',
  aoiTheme: '',
  aoiCode: '',
  aoiName: '',
  bandNbr: '',
  summaryEnabled: true,
  llmMode: 'sync',
  allowedExts: 'pdf,png,jpg,jpeg,tiff',
  themeLand: false,
  themeGovernance: false,
  themeFiduciary: false,
  themeWater: false,
  themeCoercion: false,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      open: false,
      fields: { ...DEFAULT_FIELDS },
      suggestions: null,
      applyFrame: true,

      // Actions
      setOpen: (open) => set({ open }),
      setField: (key, value) =>
        set((state) => ({ fields: { ...state.fields, [key]: value } })),
      setFields: (fields) =>
        set((state) => ({ fields: { ...state.fields, ...fields } })),
      setSuggestions: (s) => set({ suggestions: s }),
      setApplyFrame: (apply) => set({ applyFrame: apply }),
      save: () => set({ open: false }),
    }),
    {
      name: 'pukaist-wizard-store',
      partialize: (state) => ({
        fields: state.fields,
        applyFrame: state.applyFrame,
      }),
    }
  )
);
