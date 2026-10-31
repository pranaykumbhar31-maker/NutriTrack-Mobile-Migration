import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.nutritrack.mobile',
  appName: 'NutriTrack AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
