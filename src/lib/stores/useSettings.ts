import { useState, useEffect, useCallback } from 'react';
import { AnalysisSettings, DEFAULT_SETTINGS } from '@/types/settings';

const SETTINGS_STORAGE_KEY = 'stock-analysis-settings';

function loadSettingsFromStorage(): AnalysisSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load settings from storage:', error);
  }
  return DEFAULT_SETTINGS;
}

function loadSettingsFromURL(): Partial<AnalysisSettings> {
  const params = new URLSearchParams(window.location.search);
  const settings: Partial<AnalysisSettings> = {};
  
  const preset = params.get('preset');
  if (preset && ['pessimistic', 'neutral', 'optimistic'].includes(preset)) {
    settings.preset = preset as AnalysisSettings['preset'];
  }
  
  const betaBenchmark = params.get('betaBenchmark');
  if (betaBenchmark && ['SPY', 'QQQ', 'IWM'].includes(betaBenchmark)) {
    settings.betaBenchmark = betaBenchmark as AnalysisSettings['betaBenchmark'];
  }
  
  const sharpeWindow = params.get('sharpeWindow');
  if (sharpeWindow && ['126', '252', '504'].includes(sharpeWindow)) {
    settings.sharpeWindow = sharpeWindow as AnalysisSettings['sharpeWindow'];
  }
  
  const rf = params.get('rf');
  if (rf) {
    const rfValue = parseFloat(rf);
    if (!isNaN(rfValue)) {
      settings.riskFreeRate = rfValue;
    }
  }
  
  const peWindow = params.get('peWindow');
  if (peWindow && ['1y', '3y', '5y'].includes(peWindow)) {
    settings.peWindow = peWindow as AnalysisSettings['peWindow'];
  }
  
  const epsWindow = params.get('epsWindow');
  if (epsWindow && ['1y', '3y', '5y'].includes(epsWindow)) {
    settings.epsWindow = epsWindow as AnalysisSettings['epsWindow'];
  }
  
  const volatilityWindow = params.get('volatilityWindow');
  if (volatilityWindow && ['30', '90', '252'].includes(volatilityWindow)) {
    settings.volatilityWindow = volatilityWindow as AnalysisSettings['volatilityWindow'];
  }
  
  const evEbitdaType = params.get('evEbitdaType');
  if (evEbitdaType && ['ttm', 'forward'].includes(evEbitdaType)) {
    settings.evEbitdaType = evEbitdaType as AnalysisSettings['evEbitdaType'];
  }
  
  const dividendWindow = params.get('dividendWindow');
  if (dividendWindow && ['3y', '5y', '10y'].includes(dividendWindow)) {
    settings.dividendWindow = dividendWindow as AnalysisSettings['dividendWindow'];
  }
  
  return settings;
}

function saveSettingsToStorage(settings: AnalysisSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to storage:', error);
  }
}

function updateURLParams(settings: AnalysisSettings, ticker?: string): void {
  const params = new URLSearchParams();
  
  if (ticker) {
    params.set('ticker', ticker);
  }
  
  if (settings.preset !== DEFAULT_SETTINGS.preset) {
    params.set('preset', settings.preset);
  }
  if (settings.betaBenchmark !== DEFAULT_SETTINGS.betaBenchmark) {
    params.set('betaBenchmark', settings.betaBenchmark);
  }
  if (settings.sharpeWindow !== DEFAULT_SETTINGS.sharpeWindow) {
    params.set('sharpeWindow', settings.sharpeWindow);
  }
  if (settings.riskFreeRate !== DEFAULT_SETTINGS.riskFreeRate) {
    params.set('rf', settings.riskFreeRate.toString());
  }
  if (settings.peWindow !== DEFAULT_SETTINGS.peWindow) {
    params.set('peWindow', settings.peWindow);
  }
  if (settings.epsWindow !== DEFAULT_SETTINGS.epsWindow) {
    params.set('epsWindow', settings.epsWindow);
  }
  if (settings.volatilityWindow !== DEFAULT_SETTINGS.volatilityWindow) {
    params.set('volatilityWindow', settings.volatilityWindow);
  }
  if (settings.evEbitdaType !== DEFAULT_SETTINGS.evEbitdaType) {
    params.set('evEbitdaType', settings.evEbitdaType);
  }
  if (settings.dividendWindow !== DEFAULT_SETTINGS.dividendWindow) {
    params.set('dividendWindow', settings.dividendWindow);
  }
  
  const newURL = params.toString() 
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;
  
  window.history.replaceState({}, '', newURL);
}

export function useSettings() {
  const [settings, setSettings] = useState<AnalysisSettings>(() => {
    const storageSettings = loadSettingsFromStorage();
    const urlSettings = loadSettingsFromURL();
    return { ...storageSettings, ...urlSettings };
  });

  useEffect(() => {
    const urlSettings = loadSettingsFromURL();
    if (Object.keys(urlSettings).length > 0) {
      setSettings(prev => ({ ...prev, ...urlSettings }));
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AnalysisSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettingsToStorage(updated);
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettingsToStorage(DEFAULT_SETTINGS);
  }, []);

  const syncURL = useCallback((ticker?: string) => {
    updateURLParams(settings, ticker);
  }, [settings]);

  return {
    settings,
    updateSettings,
    resetSettings,
    syncURL,
  };
}

