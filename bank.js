/**
 * Created by Vadym Yatsyuk on 08.11.17
 */

const jsonStream = require('duplex-json-stream');
const net = require('net');
const chalk = require('chalk');
const fs = require('fs');
const sodium = require('sodium-native');

const KeyPairGenerator = require('./key-pair-generator');
const PersistenceSync = require('./persistence-sync');
const PersistenceAsync = require('./persistence-async');

const PORT = 8080;
const TRANSACTION_FILE = './transactions.json';
const DEPOSIT_TYPE = 'deposit';
const WITHDRAW_TYPE = 'withdraw';

const genesisHash = Buffer.alloc(32).toString('hex');

let persistenceAsync = new PersistenceAsync();
let transactions = restoreTransactionsFromDisk();
let keyPairGenerator = new KeyPairGenerator(new PersistenceSync());
let keyPair = keyPairGenerator.getKeyPair();

validateIntegrity();

const server = net.createServer((socket) => {
  socket = jsonStream(socket);

  socket.on('data', msg => {
    console.log(chalk.blue('Bank received:'), msg);

    if (msg && msg.cmd) {
      commands(msg, socket);
    }
  });
}).on('error', err => {
  console.log(chalk.red(err));
});

server.listen(PORT, () => {
  console.log(chalk.yellow(`Server is listening on ${ PORT }`));
});

function commands(msg, connection) {
  switch (msg.cmd) {
    case 'deposit':
      deposit(msg.deposit);
      writeBalance(connection);
      return;

    case 'balance':
      writeBalance(connection);
      break;

    case 'withdraw':
      withdraw(msg.withdraw);
      writeBalance(connection);
      break;
  }
}

function writeBalance(connection) {
  connection.write({ cmd: 'balance', balance: getBalance() });
}

function getBalance() {
  return transactions.reduce((prev, actual) => {
    const f = actual.value.type === DEPOSIT_TYPE ? 1 : -1;
    return prev + (actual.value.amount * f);
  }, 0);
}

function deposit(value) {
  if (value < 0) {
    return;
  }

  appendToTransactionLog({ type: DEPOSIT_TYPE, amount: value });
  saveTransactionsToDisk();
}

function withdraw(value) {
  if (!value || value < 0) {
    return;
  }

  const balance = getBalance();

  if (balance < value) {
    return;
  }

  appendToTransactionLog({ type: WITHDRAW_TYPE, amount: value });
  saveTransactionsToDisk();
}

function restoreTransactionsFromDisk() {
  return fs.existsSync(TRANSACTION_FILE) ? require(TRANSACTION_FILE) : [];
}

function saveTransactionsToDisk() {
  persistenceAsync.save(TRANSACTION_FILE, transactions);
}

function appendToTransactionLog(entry) {
  const prevHash = transactions.length ? transactions[transactions.length - 1].hash : genesisHash;
  const newHash = hashToHex(prevHash + JSON.stringify(entry));

  transactions.push({
    value: entry,
    hash: newHash,
    signature: signHash(newHash)
  })
}

function signHash(hash) {
  let signature = Buffer.alloc(sodium.crypto_sign_BYTES);

  sodium.crypto_sign_detached(signature, Buffer.from(hash), Buffer.from(keyPair.secretKey, 'hex'));

  return signature.toString('hex');
}

function hashToHex(value) {
  let output = Buffer.alloc(sodium.crypto_generichash_BYTES);

  sodium.crypto_generichash(output, Buffer.from(value));

  return output.toString('hex');
}

function validateIntegrity() {
  let prevHash = genesisHash;
  const totalTransactions = transactions.length;

  for (let i = 0; i < totalTransactions; i++) {
    prevHash = hashToHex(prevHash + JSON.stringify(transactions[i].value));

    if (prevHash !== transactions[i].hash) {
      throw new Error('Integrity violated! Transaction:' + JSON.stringify(transactions[i].value));
    }

    const publicKey = Buffer.from(keyPair.publicKey, 'hex');
    const hash = Buffer.from(transactions[i].hash);
    const signature = Buffer.from(transactions[i].signature, 'hex');

    if (!sodium.crypto_sign_verify_detached(signature, hash, publicKey)) {
      throw new Error('Signature is not valid!');
    }
  }
}