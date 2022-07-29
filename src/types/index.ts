export type ClientRole = 'streamer' | 'watcher';
export type RtcDataType = 'offer' | 'answer' | 'candidate';

export interface RtcData {
  type: RtcDataType;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export interface RtcClient {
  id: string;
  role: ClientRole;
  name: string;
}

export interface RtcMsg {
  data: RtcData;
  client: RtcClient;
}

export interface ServerToClientEvents {
  noArg: () => void;
  offer: (msg: RtcMsg) => void;
  answer: (msg: RtcMsg) => void;
  candidate: (msg: RtcMsg) => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
  reg: (role: ClientRole) => void;
  offer: (msg: RtcMsg) => void;
  answer: (msg: RtcMsg) => void;
  candidate: (msg: RtcMsg) => void;
  // stream: (msg: RtcMsg) => void;
  // watch: (msg: RtcMsg) => void;
  // hello: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name?: string;
  age?: number;
}
