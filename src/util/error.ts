class VersionMismatchError extends Error {
  name = 'VersionMismatchError';
}

class InvalidPacketError extends Error {
  name = 'InvalidPacketError';

  constructor(message?: Buffer) {
    const packetData: string[] = [];

    message!!.forEach((byte) => {
      packetData.push(byte.toString(16).padStart(2, '0'));
    });

    super(`Packet recived was: <Buffer ${packetData.join(' ')}>`);
  }
}

export {
  VersionMismatchError,
  InvalidPacketError
}