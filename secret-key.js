/**
 * Created by Vadym Yatsyuk on 20.11.17
 */

const sodium = require('sodium-native');

let secretKey = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES);
sodium.randombytes_buf(secretKey);
console.log(secretKey.toString('hex'));