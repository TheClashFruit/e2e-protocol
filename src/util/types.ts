export interface Settings {
  keyPair: {
    privateKey: string;
    publicKey: string;
    passphrase?: string;
  }
  trustedFingerprints?: string[];
}

export interface Options {
  host?: string;
  port: number;
}

export type Event = 'connection' | 'message' | 'error' | 'close';