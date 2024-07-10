enum Packet {
  HANDSHAKE = 0x00,
  HANDSHAKE_ERROR,
  EXCHANGE,
  EXCHANGE_ERROR,
  DATA,
  ERROR
}

export default Packet;