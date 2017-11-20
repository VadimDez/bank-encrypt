/**
 * Created by Vadym Yatsyuk on 20.11.17
 */
const sodium = require('sodium-native');

const cipher = Buffer.from(process.argv[2], 'hex');
const secretKey = Buffer.from(process.argv[3], 'hex');
const nonce = Buffer.from(process.argv[4], 'hex');
let message = Buffer.alloc(cipher.byteLength + sodium.crypto_secretbox_MACBYTES);

if (sodium.crypto_secretbox_open_easy(message, cipher, nonce, secretKey)) {
  console.log(message.toString('ascii'));
} else {
  console.log('Decoding error!');
}
