const crypto = require("crypto");

function generateChallenge() {
  return crypto.randomBytes(32).toString("base64");
}

module.exports = {
  generateChallenge,
};
