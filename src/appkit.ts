import { AppKit, createTonConnectConnector } from '@ton/appkit';

const manifestUrl = 'https://ton-jam.vercel.app/tonconnect-manifest.json';

export const appKit = new AppKit({
  connectors: [createTonConnectConnector({
    manifest: { url: manifestUrl }
  } as any)],
});
