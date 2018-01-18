const crypto       = require('crypto');
const randomstring = require('randomstring');

module.exports.encrypt = function (text, encSecret) {
  const cipher = crypto.createCipher('aes-256-ctr', encSecret);
  const crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
};

module.exports.decrypt = function (text, encSecret) {
  const decipher = crypto.createDecipher('aes-256-ctr', encSecret);
  const dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};
