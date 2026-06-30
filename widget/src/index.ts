import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { QuantumChatWidget } from './QuantumChatWidget';
import type { WidgetConfig } from '@quantum-chat/shared';

export { QuantumChatWidget };
export type { WidgetConfig };
export * from '@quantum-chat/shared';

let root: Root | null = null;

export function init(config: WidgetConfig): void {
  let container = document.getElementById('quantum-chat-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'quantum-chat-root';
    document.body.appendChild(container);
  }

  if (!root) {
    root = createRoot(container);
  }

  root.render(
    React.createElement(QuantumChatWidget, { config })
  );
}

export function destroy(): void {
  root?.unmount();
  root = null;
  document.getElementById('quantum-chat-root')?.remove();
}

export function open(): void {
  window.postMessage({ source: 'quantum-chat-sdk', type: 'open' }, '*');
}

export function close(): void {
  window.postMessage({ source: 'quantum-chat-sdk', type: 'close' }, '*');
}

export function toggle(): void {
  window.postMessage({ source: 'quantum-chat-sdk', type: 'toggle' }, '*');
}

const QuantumChat = { init, destroy, open, close, toggle, QuantumChatWidget };
export default QuantumChat;

if (typeof window !== 'undefined') {
  (window as unknown as { QuantumChat: typeof QuantumChat }).QuantumChat = QuantumChat;
}
