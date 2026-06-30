import type { WidgetConfig } from '@quantum-chat/shared';

export interface SDKConfig extends WidgetConfig {
  containerId?: string;
  autoOpen?: boolean;
}

export interface QuantumChatSDKInstance {
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;
  setUser(user: NonNullable<WidgetConfig['user']>): Promise<void>;
  getUnreadCount(): number;
}

type MessageHandler = (event: MessageEvent) => void;

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function injectStylesheet(href: string, id: string): void {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

class QuantumChatSDK implements QuantumChatSDKInstance {
  private config: SDKConfig;
  private unreadCount = 0;
  private messageHandler: MessageHandler | null = null;
  private ready = false;

  constructor(config: SDKConfig) {
    this.config = {
      apiUrl: 'http://localhost:4000',
      ...config,
    };
    this.init();
  }

  private init(): void {
    this.setupMessageListener();
    void this.loadWidget();
  }

  private setupMessageListener(): void {
    this.messageHandler = (event: MessageEvent) => {
      if (event.data?.source !== 'quantum-chat') return;
      switch (event.data.type) {
        case 'ready':
          this.ready = true;
          this.config.onReady?.();
          if (this.config.autoOpen) this.open();
          break;
        case 'unread':
          this.unreadCount = event.data.count;
          this.config.onUnreadCount?.(event.data.count);
          break;
      }
    };
    window.addEventListener('message', this.messageHandler);
  }

  private async loadWidget(): Promise<void> {
    const apiUrl = this.config.apiUrl || 'http://localhost:4000';
    injectStylesheet(`${apiUrl}/widget/quantum-chat-widget.css`, 'quantum-chat-widget-css');

    try {
      await loadScript('https://unpkg.com/react@18/umd/react.production.min.js', 'qc-react');
      await loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', 'qc-react-dom');
      await loadScript(`${apiUrl}/widget/quantum-chat-widget.umd.cjs`, 'quantum-chat-widget-script');
      this.mountWidget();
    } catch (err) {
      console.error('[QuantumChat SDK] Failed to load widget:', err);
    }
  }

  private mountWidget(): void {
    const QuantumChat = (window as unknown as { QuantumChat?: { init: (c: WidgetConfig) => void } }).QuantumChat;
    if (!QuantumChat) {
      console.error('[QuantumChat SDK] QuantumChat global not found after script load');
      return;
    }
    QuantumChat.init({
      ...this.config,
      onReady: () => {
        this.ready = true;
        this.config.onReady?.();
        if (this.config.autoOpen) this.open();
      },
      onUnreadCount: (count) => {
        this.unreadCount = count;
        this.config.onUnreadCount?.(count);
      },
      onMessage: this.config.onMessage,
    });
  }

  open(): void {
    window.postMessage({ source: 'quantum-chat-sdk', type: 'open' }, '*');
  }

  close(): void {
    window.postMessage({ source: 'quantum-chat-sdk', type: 'close' }, '*');
  }

  toggle(): void {
    window.postMessage({ source: 'quantum-chat-sdk', type: 'toggle' }, '*');
  }

  async setUser(user: NonNullable<WidgetConfig['user']>): Promise<void> {
    this.config.user = user;
    window.postMessage({ source: 'quantum-chat-sdk', type: 'setUser', user }, '*');
  }

  getUnreadCount(): number {
    return this.unreadCount;
  }

  destroy(): void {
    const QuantumChat = (window as unknown as { QuantumChat?: { destroy: () => void } }).QuantumChat;
    QuantumChat?.destroy();
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
    }
  }
}

export function createQuantumChat(config: SDKConfig): QuantumChatSDKInstance {
  return new QuantumChatSDK(config);
}

export default createQuantumChat;

if (typeof window !== 'undefined') {
  (window as unknown as { createQuantumChat: typeof createQuantumChat }).createQuantumChat = createQuantumChat;
}
