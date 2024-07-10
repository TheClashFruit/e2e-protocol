import * as openpgp from 'openpgp';

const utils = {
  getDate32Now: () => {
    return (Date.now() / 1000);
  },
  encryptMessage: async (publicKeyArmored: string, message: string) => {
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: message }),
      encryptionKeys: publicKey
    });

    return encrypted.toString();
  },
  decryptMessage: async (privateKeyArmored: string, encryptedMessage: string, passphrase?: string) => {
    let privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });

    if (typeof passphrase !== 'undefined') {
      privateKey = await openpgp.decryptKey({
        privateKey,
        passphrase
      });
    }

    const message = await openpgp.readMessage({
      armoredMessage: encryptedMessage
    });

    const decrypted = await openpgp.decrypt({
      message,
      decryptionKeys: privateKey
    });

    const chunks = [];

    // @ts-ignore
    for await (const chunk of decrypted.data) {
      chunks.push(chunk);
    }

    return chunks.join('');
  },
  encryptBinary: async (publicKeyArmored: string, binary: Buffer) => {
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ binary }),
      encryptionKeys: publicKey
    });

    const chunks = [];

    // @ts-ignore
    for await (const chunk of decrypted.data) {
      chunks.push(chunk);
    }

    return chunks.join('');
  },
  decryptBinary: async (privateKeyArmored: string, encryptedBinary: string, passphrase?: string) => {
    let privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });

    if (typeof passphrase !== 'undefined') {
      privateKey = await openpgp.decryptKey({
        privateKey,
        passphrase
      });
    }

    const message = await openpgp.readMessage({
      binaryMessage: encryptedBinary
    });

    const decrypted = await openpgp.decrypt({
      message,
      decryptionKeys: privateKey
    });

    const chunks = [];

    // @ts-ignore
    for await (const chunk of decrypted.data) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }
}

export default utils;