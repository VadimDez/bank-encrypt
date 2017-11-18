/**
 * Created by Vadym Yatsyuk on 18.11.17
 */

'use strict';
const fs = require('fs');
const sodium = require('sodium-native');

const KEY_PAIR_FILE = './key-pair.json';

module.exports = class KeyPairGenerator {

  constructor(persistence) {
    this.persistence = persistence;
  }

  generateKeyPair() {
    let publicKey = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
    let secretKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES);
    sodium.crypto_sign_keypair(publicKey, secretKey);

    return {
      publicKey: publicKey.toString('hex'),
      secretKey: secretKey.toString('hex')
    };
  }

  getKeyPair() {
    if (!fs.existsSync(KEY_PAIR_FILE)) {
      this.saveKeyPairToDisk(this.generateKeyPair());
    }

    return require(KEY_PAIR_FILE);
  }

  saveKeyPairToDisk(keyPair) {
    this.persistence.save(KEY_PAIR_FILE, keyPair);
  }
};