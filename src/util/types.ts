export interface Settings {
  keyPair: {
    privateKey: string;
    publicKey: string;
  }
  trustedFingerprints?: string[];
}

export interface Options {
  host?: string;
  port: number;
}

export type Event = 'connection' | 'message' | 'error' | 'close';