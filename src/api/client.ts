import EventEmitter from 'node:events';

import * as net from 'node:net';

import {
  handleBinaryData,
  handleData,
  handleExchange,
  sendBinaryData,
  sendClientHandshake,
  sendData,
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
import * as pgp from "openpgp";

export class Client {
  settings: Settings;
  socket?: net.Socket;

  serverPublicKey?: string;
  client?: ClientClient;

  eventEmitter = new EventEmitter();
  shouldTrustCallback?: (fingerprint: string) => Promise<boolean> | boolean;

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

            const fingerprint = (await pgp.readKey({ armoredKey: publicKey })).getFingerprint();

            if (typeof this.settings.trustedFingerprints !== 'undefined') {
              if (!this.settings.trustedFingerprints.includes(fingerprint)){

                this.socket!!.write(Buffer.from([ Packet.EXCHANGE_ERROR, 0x00 ]));

                return;
              }
            } else if (typeof this.shouldTrustCallback !== 'undefined') {
              const shouldTrust = await this.shouldTrustCallback(fingerprint);

              if (shouldTrust) {
                this.socket!!.write(Buffer.from([ Packet.EXCHANGE_ERROR, 0x00 ]));

                return;
              }
            }

            this.client = new ClientClient(this.socket!!, publicKey);

            this.eventEmitter.emit('connection', this.client);

            break;
          }
          case Packet.DATA: {
            const {
              timestamp,
              decryptedMessage
            } = await handleData(data, this.settings.keyPair.privateKey, this.settings.keyPair.passphrase);

            this.eventEmitter.emit('message', {
              timestamp,
              type: 'text',
              message: decryptedMessage
            });

            break;
          }
          case Packet.BINARY_DATA: {
            try {
              const {
                timestamp,
                decryptedMessage
              } = await handleBinaryData(data, this.settings.keyPair.privateKey, this.settings.keyPair.passphrase);

              this.eventEmitter.emit('message', {
                timestamp,
                type: 'binary',
                message: decryptedMessage
              });
            } catch (e) {
              this.eventEmitter.emit('error', e);
            }

            break;
          }
          default: {
            this.eventEmitter.emit('error', new InvalidPacketError(data));

            break;
          }
        }
      });

      this.socket!!.on('close', () => {
        this.eventEmitter.emit('close');
      });
    });
  }

  shouldTrust(callback: (fingerprint: string) => boolean) {
    this.shouldTrustCallback = callback;
  }

  async sendData(message: string) {
    const { packet } = await sendData(this.serverPublicKey!!, message);

    this.socket!!.write(packet);
  }
}

export class ClientClient {
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

  async sendBinaryData(message: Buffer) {
    const { packet, encrypted } = await sendBinaryData(
      this.publicKey,
      message
    );

    this.socket.write(packet);

    return encrypted;
  }
}