import { useEffect, useRef } from 'react';
import type { WidgetConfig } from '@quantum-chat/shared';
import type { ApiClient } from '../api';
import { SocketClient } from '../socket';
import type { ChatAction } from '../context/types';
import { mergeBranding, mergeSettings } from '../utils/branding';

interface SdkBridgeOptions {
  dispatch: React.Dispatch<ChatAction>;
  api: ApiClient;
  socketRef: React.MutableRefObject<SocketClient | null>;
  apiUrl: string;
  configRef: React.MutableRefObject<WidgetConfig>;
  getIsOpen: () => boolean;
  onReady?: () => void;
  onUnreadCount?: (count: number) => void;
  tokenStorageKey: string;
}

export function useSdkBridge({
  dispatch,
  api,
  socketRef,
  apiUrl,
  configRef,
  getIsOpen,
  onReady,
  onUnreadCount,
  tokenStorageKey,
}: SdkBridgeOptions) {
  const reauthInFlight = useRef(false);

  useEffect(() => {
    const handleSetUser = async (user: NonNullable<WidgetConfig['user']>) => {
      if (reauthInFlight.current) return;
      reauthInFlight.current = true;
      try {
        const cfg = configRef.current;
        const auth = await api.widgetAuth({
          email: user.email || `user-${user.externalId}@widget.local`,
          displayName: user.displayName || 'Guest User',
          externalId: user.externalId,
          avatarUrl: user.avatarUrl,
        });
        const websiteConfig = await api.getWebsiteConfig();
        api.setToken(auth.token);
        sessionStorage.setItem(tokenStorageKey, auth.token);
        socketRef.current?.disconnect();
        const socketClient = new SocketClient();
        socketRef.current = socketClient;
        socketClient.connect(apiUrl, auth.token, {
          onUnreadCount: (count) => {
            dispatch({ type: 'SET_UNREAD', payload: count });
            onUnreadCount?.(count);
            window.postMessage({ source: 'quantum-chat', type: 'unread', count }, '*');
          },
        });
        dispatch({
          type: 'UPDATE_USER',
          payload: {
            token: auth.token,
            user: auth.user,
            branding: mergeBranding(websiteConfig.branding, auth.website.branding, cfg.theme),
            settings: mergeSettings(websiteConfig.settings, auth.website.settings),
            websiteName: websiteConfig.name,
          },
        });
        cfg.onReady?.();
      } catch (err) {
        console.error('[QuantumChat] setUser failed:', err);
      } finally {
        reauthInFlight.current = false;
      }
    };

    const handler = (event: MessageEvent) => {
      if (event.data?.source !== 'quantum-chat-sdk') return;
      switch (event.data.type) {
        case 'open':
          dispatch({ type: 'SET_OPEN', payload: true });
          break;
        case 'close':
          dispatch({ type: 'SET_OPEN', payload: false });
          break;
        case 'toggle':
          dispatch({ type: 'SET_OPEN', payload: !getIsOpen() });
          break;
        case 'setUser':
          if (event.data.user) void handleSetUser(event.data.user);
          break;
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [api, apiUrl, configRef, dispatch, getIsOpen, onReady, onUnreadCount, socketRef, tokenStorageKey]);
}

export function notifyWidgetReady() {
  window.postMessage({ source: 'quantum-chat', type: 'ready' }, '*');
}

export function notifyUnreadCount(count: number) {
  window.postMessage({ source: 'quantum-chat', type: 'unread', count }, '*');
}
