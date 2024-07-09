# e2e-protocol

A simple e2e encrypted tcp server and client library. 

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
  client.send('Hello, World!');
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

server.on('message', (msg) => {
  if (msg === 'Hello, World!')
    client.sendData('Hello, World!');

  console.log(msg);
});

client.connect({
  port: 442
});
```
