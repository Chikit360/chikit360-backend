const jwt = require('jsonwebtoken');

const SUBSCRIPTION_SECRET_KEY = process.env.SUBSCRIPTION_SECRET_KEY;

function generateSubscriptionToken (hospitalId) {
  const iat = Math.floor(Date.now() / 1000); // current time in seconds
  const exp = iat + 7 * 24 * 60 * 60; // 7 days later

  const payload = {
    sub: hospitalId,
    iat,
    exp
  };

  return jwt.sign(payload, SUBSCRIPTION_SECRET_KEY);
};

module.exports=generateSubscriptionToken;