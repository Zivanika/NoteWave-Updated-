const crypto = require("crypto");

const createRandomBytes = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buffer) => {
      if (err) {
        reject(err);
      }
      const token = buffer.toString("hex");
      resolve(token);
    });
  });
};

module.exports = createRandomBytes;