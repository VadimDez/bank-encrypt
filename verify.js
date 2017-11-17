/**
 * Created by Vadym Yatsyuk on 17.11.17
 */
const sodium = require('sodium-native');

const publicKey = Buffer.from(process.argv[2], 'hex');
const message = Buffer.from(process.argv[3]);
const signature = Buffer.from(process.argv[4], 'hex');

console.log(sodium.crypto_sign_verify_detached(signature, message, publicKey));