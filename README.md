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