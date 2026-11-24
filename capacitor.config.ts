const serverUrl =
  process.env.CAPACITOR_SERVER_URL ||
  process.env.APP_URL ||
  'https://ais-pre-44u5bfox3uoyejinxjlds7-374353743788.asia-northeast1.run.app';

const config = {
  appId: 'id.rasidx.terminal',
  appName: 'RAS.IDX Terminal',
  webDir: 'dist',
  server: {
    url: serverUrl,
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#060a0f',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
