/**
 * Created by Vadym Yatsyuk on 08.11.17
 */

const jsonStream = require('duplex-json-stream');
const net = require('net');
const chalk = require('chalk');
const fs = require('fs');

const PORT = 8080;
const TRANSACTION_FILE = './transactions.json';
const DEPOSIT_TYPE = 'deposit';
const WITHDRAW_TYPE = 'withdraw';

let transactions = restoreTransactionsFromDisk();

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
    const f = actual.type === DEPOSIT_TYPE ? 1 : -1;
    return prev + (actual.amount * f);
  }, 0);
}

function deposit(value) {
  if (value < 0) {
    return;
  }

  transactions.push({ type: DEPOSIT_TYPE, amount: value });
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

  transactions.push({ type: WITHDRAW_TYPE, amount: value });
  saveTransactionsToDisk();
}

function restoreTransactionsFromDisk() {
  return fs.existsSync(TRANSACTION_FILE) ? require(TRANSACTION_FILE) : [];
}

function saveTransactionsToDisk() {
  const content = JSON.stringify(transactions);
  fs.writeFile(TRANSACTION_FILE, content, err => {
    if (err) {
      console.log(chalk.red(err));
    }
  })
}