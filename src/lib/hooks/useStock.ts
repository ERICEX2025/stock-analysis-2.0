import { useQuery } from '@tanstack/react-query';
import { getStockSummary, getStockDecision, getStockMetrics } from '@/lib/api/stockApi';
import { AnalysisSettings } from '@/types/settings';

export function useStockSummary(ticker: string | null) {
  return useQuery({
    queryKey: ['stock', 'summary', ticker],
    queryFn: () => getStockSummary(ticker!),
    enabled: !!ticker && ticker.length > 0,
    retry: 2,
    staleTime: 30000, // 30 seconds
  });
}

export function useStockDecision(ticker: string | null, settings: AnalysisSettings) {
  return useQuery({
    queryKey: ['stock', 'decision', ticker, settings],
    queryFn: () => getStockDecision(ticker!, settings),
    enabled: !!ticker && ticker.length > 0,
    retry: 2,
    staleTime: 30000,
  });
}

export function useStockMetrics(ticker: string | null, settings: AnalysisSettings) {
  return useQuery({
    queryKey: ['stock', 'metrics', ticker, settings],
    queryFn: () => getStockMetrics(ticker!, settings),
    enabled: !!ticker && ticker.length > 0,
    retry: 2,
    staleTime: 30000,
  });
}

