import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ruralnex.app',
  appName: 'RuralNex',
  webDir: 'dist',
  // For development: point to your local network IP running Vite dev server
  // Uncomment the line below and replace with your machine's IP for live-reload dev
  // server: {
  //   url: 'http://192.168.1.X:5173',
  //   cleartext: true,
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0b0d11',
      showSpinner: false,
      launchFadeOutDuration: 300,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0b0d11',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
