/**
 * Created by Vadym Yatsyuk on 18.11.17
 */
'use strict';
const fs = require('fs');

module.exports = class PersistenceSync {
  save(fileName, content) {
    try {
      fs.writeFileSync(fileName, JSON.stringify(content));
    } catch (e) {
      console.log(chalk.red(err));
    }
  }
};