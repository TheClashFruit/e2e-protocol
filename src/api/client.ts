import EventEmitter from 'node:events';

import * as net from 'node:net';

import {
  handleData,
  handleExchange,
  sendData,
  sendClientHandshake,
  sendExchange
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

export class Client {
  settings: Settings;
  socket?: net.Socket;

  serverPublicKey?: string;

  eventEmitter = new EventEmitter();

  constructor(settings: Settings) {
    this.settings = settings;
  }

  on(event: Event, callback: (variable?: any) => any) {
    this.eventEmitter.on(event, callback);
  };

  connect(options: Options) {
    this.socket = net.createConnection(options, async () => {
      const { packet }    = await sendClientHandshake();
      const { ackPacket } = await sendExchange(this.settings.keyPair.publicKey);

      this.socket!!.write(packet);

      this.socket!!.on('data', async (data) => {
        const packetID = data.readUint8(0);

        switch (packetID) {
          case Packet.HANDSHAKE: {
            this.socket!!.write(ackPacket);

            break;
          }
          case Packet.EXCHANGE: {
            const {
              timestamp,
              publicKey
            } = await handleExchange(data, this.settings.keyPair.privateKey);

            this.serverPublicKey = publicKey;

            break;
          }
          case Packet.DATA: {
            const {
              timestamp,
              decryptedMessage
            } = await handleData(data, this.settings.keyPair.privateKey);

            this.eventEmitter.emit('message', decryptedMessage);

            break;
          }
          default: {
            this.eventEmitter.emit('error', new InvalidPacketError());

            break;
          }
        }
      });

      this.socket!!.on('close', () => {
        this.eventEmitter.emit('close');
      });
    });
  }

  async sendData(message: string) {
    const { packet } = await sendData(this.serverPublicKey!!, message);

    this.socket!!.write(packet);
  }
}