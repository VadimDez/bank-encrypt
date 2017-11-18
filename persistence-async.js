/**
 * Created by Vadym Yatsyuk on 18.11.17
 */
'use strict';
const fs = require('fs');

module.exports = class PersistenceAsync {
  save(fileName, content) {
    fs.writeFile(fileName, JSON.stringify(content), err => {
      if (err) {
        console.log(chalk.red(err));
      }
    });
  }
};