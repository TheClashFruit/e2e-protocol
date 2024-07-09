import EventEmitter from 'node:events';

import * as net from 'node:net';

import {
  handleData,
  handleExchange,
  handleServerHandshake,
  sendData
} from '../util/packetHandlers';

import {
  InvalidPacketError
} from '../util/error';

import {
  Options,
  Settings,
  Event
} from '../util/types';

import Packet from '../util/Packet';

export class Server {
  settings:    Settings;
  connections: ServerClient[] = [];

  eventEmitter = new EventEmitter();

  server: net.Server = net.createServer((socket) => {
    let clientPublicKey: string;
    let client: ServerClient;

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

    socket.on('close', () => {
      this.connections = this.connections.filter((c) => c !== client);

      this.eventEmitter.emit('close');
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
  socket: net.Socket;
  publicKey: string;

  constructor(socket: net.Socket, publicKey: string) {
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