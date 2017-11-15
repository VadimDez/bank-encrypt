/**
 * Created by Vadym Yatsyuk on 09.11.17
 */

const sodium = require('sodium-native');

let output = Buffer.alloc(sodium.crypto_generichash_BYTES);

sodium.crypto_generichash(output, Buffer.from('Hello, World!'));

console.log(output.toString('hex'));