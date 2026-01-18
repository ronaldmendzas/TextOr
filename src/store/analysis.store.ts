import { create } from 'zustand';
import type { WritingAnalysis, QualityMetrics } from '@/types/analysis';

interface AnalysisState {
  analysis: WritingAnalysis | null;
  metrics: QualityMetrics | null;
  isAnalyzing: boolean;
  
  setAnalysis: (analysis: WritingAnalysis) => void;
  setMetrics: (metrics: QualityMetrics) => void;
  setAnalyzing: (analyzing: boolean) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  analysis: null,
  metrics: null,
  isAnalyzing: false,

  setAnalysis: (analysis: WritingAnalysis) => set({ analysis }),
  
  setMetrics: (metrics: QualityMetrics) => set({ metrics }),
  
  setAnalyzing: (analyzing: boolean) => set({ isAnalyzing: analyzing }),
  
  reset: () => set({ analysis: null, metrics: null, isAnalyzing: false }),
}));
