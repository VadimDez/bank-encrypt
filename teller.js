/**
 * Created by Vadym Yatsyuk on 09.11.17
 */

const jsonStream = require('duplex-json-stream');
const net = require('net');
const PORT = 8080;

const cmd = process.argv[2];
const value = process.argv[3];
const clinet = jsonStream(net.connect(PORT));

clinet.on('data', msg => {
  console.log('Teller received', msg);
});

clinet.end(getMessage());

function getMessage() {
  switch (cmd) {
    case 'balance':
      return { cmd: cmd };
    case 'deposit':
      return { cmd: cmd, deposit: parseFloat(value)};
    case 'withdraw':
      return { cmd: cmd, withdraw: parseFloat(value)};
  }
}