import { AppKit, createTonConnectConnector } from '@ton/appkit';

const manifestUrl = typeof window !== 'undefined' ? `${window.location.origin}/tonconnect-manifest.json` : 'https://tonjam.app/tonconnect-manifest.json';

export const appKit = new AppKit({
  connectors: [createTonConnectConnector({
    manifest: { url: manifestUrl }
  } as any)],
});
