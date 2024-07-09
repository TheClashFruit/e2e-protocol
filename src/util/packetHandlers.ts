import version from './version';
import utils from './utils';

import Packet from './Packet';

import {
  VersionMismatchError
} from './error';

const handleServerHandshake = async (data: Buffer) => {
  const dataVersion = data.readUint8(1);

  if (dataVersion !== version) {
    throw new VersionMismatchError();
  }

  const timestamp = data.readUint32LE(2);
  const latency   = utils.getDate32Now() - timestamp;

  const ackPacket = Buffer.alloc(1 + 1 + 4 + 8);

  ackPacket.writeUint8(Packet.HANDSHAKE, 0);
  ackPacket.writeUint8(version, 1);

  ackPacket.writeUint32LE(utils.getDate32Now(), 2);
  ackPacket.writeDoubleLE(latency, 6);

  return {
    timestamp,
    packet: ackPacket
  };
};

const sendClientHandshake = async () => {
  const packet = Buffer.alloc(1 + 1 + 4 + 8);

  packet.writeUint8(Packet.HANDSHAKE, 0);
  packet.writeUint8(version, 1);

  packet.writeUint32LE(utils.getDate32Now(), 2);

  return {
    packet
  };
};

const handleExchange = async (data: Buffer, publicKey: string) => {
  const timestamp = data.readUint32LE(1);
  const receivedPublicKey = data.slice(5).toString();

  const ackPacket = Buffer.alloc(1 + 4 + publicKey.length);

  ackPacket.writeUint8(Packet.EXCHANGE, 0);
  ackPacket.writeUint32LE(utils.getDate32Now(), 1);
  ackPacket.write(publicKey, 5, 'utf-8');

  return {
    timestamp,
    packet: ackPacket,
    publicKey: receivedPublicKey
  };
};

const sendExchange = async (publicKey: string) => {
  const ackPacket = Buffer.alloc(1 + 4 + publicKey.length);

  ackPacket.writeUint8(Packet.EXCHANGE, 0);
  ackPacket.writeUint32LE(Date.now() / 1000, 1);
  ackPacket.write(publicKey, 5, 'utf-8');

  return {
    ackPacket
  }
};

const handleData = async (data: Buffer, privateKey: string) => {
  const timestamp = data.readUint32LE(1);

  const encryptedMessage = data.slice(5).toString();
  const decryptedMessage = await utils.decryptMessage(privateKey, encryptedMessage);

  return {
    timestamp,
    decryptedMessage
  };
};

const sendData = async (publicKey: string, message: string) => {
  const encrypted = await utils.encryptMessage(publicKey, message);

  const packet = Buffer.alloc(1 + 4 + encrypted.length);

  packet.writeUint8(Packet.DATA, 0);
  packet.writeUint32LE(utils.getDate32Now(), 1);
  packet.write(encrypted, 5, 'utf-8');

  return {
    packet,
    encrypted
  };
};

export {
  handleServerHandshake,
  sendClientHandshake,
  handleExchange,
  sendExchange,
  handleData,
  sendData
}