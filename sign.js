/**
 * Created by Vadym Yatsyuk on 17.11.17
 */
const sodium = require('sodium-native');

let publicKey = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
let secretKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES);
sodium.crypto_sign_keypair(publicKey, secretKey);

let signature = Buffer.alloc(sodium.crypto_sign_BYTES);
let message = Buffer.from(process.argv[2]);
sodium.crypto_sign_detached(signature, message, secretKey);

console.log(message.toString(), publicKey.toString('hex'), signature.toString('hex'));