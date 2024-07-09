# e2e-protocol

A simple e2e encrypted tcp server and client library. 

## Why?

I wanted to experiment with pgp and making my own protocol.

## Setup

### Installation

Install it using `pnpm i e2e-protocol`.

### Basic Server

Creating a simple server that send hello world to the client is simple as:

```ts
import { Server } from 'e2e-protocol';

const server = new Server({
  keyPair: {
    privateKey: process.env.PRIVATE_KEY,
    publicKey: process.env.PUBLIC_KEY
  }
});

server.on('connection', (client) => {
  client.sendData('Hello, World!');
});

server.on('message', (msg) => {
  console.log(msg);
});

server.listen({
  port: 442
});
```

### Basic Client

Creating a simple client that responds hello world when the server sends a hello world is simple as:

```ts
import { Client } from 'e2e-protocol';

const client = new Client({
  keyPair: {
    privateKey: process.env.PRIVATE_KEY,
    publicKey: process.env.PUBLIC_KEY
  }
});

client.on('message', (msg) => {
  if (msg === 'Hello, World!')
    client.sendData('Hello, World!');

  console.log(msg);
});

client.connect({
  port: 442
});
```

### Trusted Fingerprints

You can add trusted fingerprints to the server and client with either `trustedFingerprints?: string[];` in the settings or `(client | server).shouldTrust((fingerprint: string) => Promise<boolean> | boolean);`.

This is not required but is recommended to for more security.

## Specification

### 1. Handshake

The handshake is initiated by the client.

#### 1.1. Client -> Server


| Packet ID | Version | Timestamp           |
|-----------|---------|---------------------|
| 0x00      | 0x01    | 0x00 0x00 0x00 0x00 |


* Packet ID (1 byte): `0x00`
* Version (1 byte): `0x01`
* Timestamp (4 bytes): `UInt32`

#### 1.2. Server -> Client

| Packet ID | Version | Timestamp           | Latency                                 |
|-----------|---------|---------------------|-----------------------------------------|
| 0x00      | 0x01    | 0x00 0x00 0x00 0x00 | 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 |

* Packet ID (1 byte): `0x00`
* Version (1 byte): `0x01`
* Timestamp (4 bytes): `UInt32`
* Latency (8 bytes): `Double`

### 2. Key Exchange

The key exchange is also initiated by the client.

#### 2.1. Client -> Server

| Packet ID | Timestamp                                | Public Key                                 |
|-----------|------------------------------------------|--------------------------------------------|
| 0x02      | 0x00 0x00 0x00 0x00                      | `-----BEGIN PGP PUBLIC KEY BLOCK----- ...` |

* Packet ID (1 byte): `0x02`
* Timestamp (4 bytes): `UInt32`
* Public Key (Variable): `String`

#### 2.2. Server -> Client

| Packet ID | Timestamp                                | Public Key                                 |
|-----------|------------------------------------------|--------------------------------------------|
| 0x02      | 0x00 0x00 0x00 0x00                      | `-----BEGIN PGP PUBLIC KEY BLOCK----- ...` |

* Packet ID (1 byte): `0x02`
* Timestamp (4 bytes): `UInt32`
* Public Key (Variable): `String`

### 3. Data

The data is sent by the client or server.

| Packet ID | Timestamp                                | Data         |
|-----------|------------------------------------------|--------------|
| 0x04      | 0x00 0x00 0x00 0x00                      | `Any String` |

* Packet ID (1 byte): `0x04`
* Timestamp (4 bytes): `UInt32`
* Data (Variable): `String`

## License

```
MIT License

Copyright (c) 2024 TheClashFruit

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```