class VersionMismatchError extends Error {
  name = 'VersionMismatchError';
}

class InvalidPacketError extends Error {
  name = 'InvalidPacketError';
}

export {
  VersionMismatchError,
  InvalidPacketError
}