// @ts-nocheck
import crypto from 'crypto';

function randomBytes(saltlen) {
  return new Promise((resolve, reject) => crypto.randomBytes(saltlen, (err, saltBuffer) => (err ? reject(err) : resolve(saltBuffer))));
}

function pbkdf2(password, salt, options, callback) {
  crypto.pbkdf2(
    password,
    salt,
    options.iterations,
    options.keylen,
    options.digestAlgorithm,
    callback,
  );
}

function pbkdf2Promisified(password, salt, options) {
  return new Promise((resolve, reject) => pbkdf2(password, salt, options, (err, hashRaw) => (err ? reject(err) : resolve(hashRaw))));
}

export default async function setPasswordCustom(password, cb?) {
  const obj = {};
  const promise = Promise.resolve()
    .then(() => randomBytes(32))
    .then((saltBuffer) => saltBuffer.toString('hex'))
    .then((salt) => {
      obj.salt = salt;
      return salt;
    })
    .then((salt) => pbkdf2Promisified(password, salt, {
      iterations: 25000,
      keylen: 512,
      digestAlgorithm: 'sha256',
    }))
    .then((hashRaw) => {
      obj.hash = Buffer.from(hashRaw, 'binary').toString('hex');
      return obj;
    });

  const result = await promise;

  if (!cb) {
    return result;
  }

  return result;
}
