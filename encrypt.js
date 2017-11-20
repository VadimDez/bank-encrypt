/**
 * Created by Vadym Yatsyuk on 20.11.17
 */
const sodium = require('sodium-native');

const secretKey = Buffer.from(process.argv[2], 'hex');
const message = Buffer.from(process.argv[3]);

let nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES);
sodium.randombytes_buf(nonce);

let cipher = Buffer.alloc(message.length + sodium.crypto_secretbox_MACBYTES);

sodium.crypto_secretbox_easy(cipher, message, nonce, secretKey);

console.log(cipher.toString('hex'), nonce.toString('hex'));

