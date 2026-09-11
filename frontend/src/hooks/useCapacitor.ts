import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { useNavigate } from 'react-router-dom';

/**
 * Hook for Capacitor mobile-specific behaviors.
 * Safe to call on web — all native calls are guarded by platform check.
 */
export function useCapacitor() {
  const [isNative] = useState(Capacitor.isNativePlatform());
  const [platform] = useState(Capacitor.getPlatform());
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNative) return;

    // Configure StatusBar for dark theme
    StatusBar.setBackgroundColor({ color: '#0b0d11' }).catch(() => {});
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});

    // Android back button — navigate back or exit app
    const backHandler = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        navigate(-1);
      } else {
        CapApp.exitApp();
      }
    });

    // Auto-scroll input into view when keyboard shows
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-visible');
    }).catch(() => {});

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-visible');
    }).catch(() => {});

    return () => {
      backHandler.then(h => h.remove());
      Keyboard.removeAllListeners().catch(() => {});
    };
  }, [isNative, navigate]);

  return { isNative, platform };
}
