import EventEmitter from 'node:events';

import {
  createServer,
  Server as NetServer,
  Socket
} from 'node:net';

import {
  handleData,
  handleExchange,
  handleServerHandshake,
  sendData
} from '../util/packetHandlers';

import {
  InvalidPacketError
} from '../util/error';

import Packet from '../util/Packet';

export type Settings = {
  keyPair: {
    privateKey: string;
    publicKey: string;
  }
}

export type Options = {
  host?: string;
  port: number;
}

export type Event = 'connection' | 'message' | 'error' | 'close';

export class Server {
  settings:    Settings;
  connections: ServerClient[] = [];

  eventEmitter = new EventEmitter();

  server: NetServer = createServer((socket) => {
    let clientPublicKey;
    let client;

    socket.on('data', async (data) => {
      const packetID = data.readUint8(0);

      switch (packetID) {
        case Packet.HANDSHAKE: {
          try {
            const {
              timestamp,
              packet
            } = await handleServerHandshake(data);

            socket.write(packet);
          } catch (e) {
            this.eventEmitter.emit('error', e);
          }

          break;
        }
        case Packet.EXCHANGE: {
          try {
            const {
              timestamp,
              packet,
              publicKey
            } = await handleExchange(data, this.settings.keyPair.publicKey);

            clientPublicKey = publicKey;

            socket.write(packet);

            client = new ServerClient(socket, publicKey);

            this.eventEmitter.emit('connection', client);

            this.connections.push(client);
          } catch (e) {
            this.eventEmitter.emit('error', e);
          }

          break;
        }
        case Packet.DATA: {
          try {
            const {
              timestamp,
              decryptedMessage
            } = await handleData(data, this.settings.keyPair.privateKey);

            this.eventEmitter.emit('message', {
              timestamp,
              decryptedMessage
            });
          } catch (e) {
            this.eventEmitter.emit('error', e);
          }

          break;
        }
        default: {
          this.eventEmitter.emit('error', new InvalidPacketError());

          break;
        }
      }
    });

    socket.on('error', (error) => {
      this.eventEmitter.emit('error', error);
    });
  });

  constructor(settings: Settings) {
    this.settings = settings;
  }

  on(event: Event, callback: (variable?: any) => any) {
    this.eventEmitter.on(event, callback);
  };

  listen(options: Options) {
    return this.server.listen(options.port, (options.host || '0.0.0.0'));
  };

  broadcast(message: string) {
    this.connections.forEach((client) => {
      client.sendData(message);
    });
  };
}

export class ServerClient {
  socket: Socket;
  publicKey: string;

  constructor(socket: Socket, publicKey: string) {
    this.socket = socket;
    this.publicKey = publicKey;
  }

  async sendData(message: string) {
    const { packet, encrypted } = await sendData(
      this.publicKey,
      message
    );

    this.socket.write(packet);

    return encrypted;
  }
}