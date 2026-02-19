import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  
  if (typeof window.global === 'undefined') {
    (window as any).global = window;
  }
  
  if (typeof window.process === 'undefined') {
    (window as any).process = {
      env: { NODE_DEBUG: undefined },
      browser: true,
      version: '',
      nextTick: (cb: any) => setTimeout(cb, 0),
    };
  }
}
