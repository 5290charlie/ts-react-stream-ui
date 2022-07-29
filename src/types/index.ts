export type ClientRole = 'streamer' | 'watcher';

export interface ServerToClientEvents {
  noArg: () => void;
  offer: (data: any) => void;
  answer: (data: any) => void;
  candidate: (data: any) => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
  reg: (role: ClientRole) => void;
  offer: (data: any) => void;
  answer: (data: any) => void;
  candidate: (data: any) => void;
  hello: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}
