import { createContext, useContext } from 'react';
import type { WidgetContextValue } from './types';

export const WidgetContext = createContext<WidgetContextValue | null>(null);

export function useWidget() {
  const ctx = useContext(WidgetContext);
  if (!ctx) throw new Error('useWidget must be used within QuantumChatProvider');
  return ctx;
}
