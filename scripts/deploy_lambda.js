const fs           = require('fs');
const AWS          = require('aws-sdk');
const lambdaConfig = require('../config/lambda.json');
const yazl         = require('yazl');
const glob         = require('glob');

const argv = process.argv;

const env     = process.env.ENV || 'develop';
const zipName = './api.zip';
const role    = 'arn:aws:iam::806692882144:role/musicfav_spotify_token_swap';

function promisify(thisArg, func, params) {
  return new Promise((resolve, reject) => {
    func.call(thisArg, params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}


AWS.config.update({ region: process.env.AWS_DEFAULT_REGION });

const lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });
const functions = [
  { handler: 'swap'   , name: 'spotify_token_swap'    },
  { handler: 'refresh', name: 'spotify_token_refresh' },
];


function createFunction(handler, functionName) {
  const params = Object.assign({}, lambdaConfig, {
    "Code":      {
      "ZipFile": fs.readFileSync(zipName),
    },
    "FunctionName": functionName,
    "Role":         role,
    "Handler":      `index.${handler}`,
  });
  return promisify(lambda, lambda.createFunction, params).catch((e) => {
    if (e.name === 'ResourceConflictException') {
      return Promise.resolve(null);
    }
    return Promise.reject(e);
  });
}

function updateFunction(handler, functionName) {
  const params = {
    "FunctionName": functionName,
    "Publish": true,
    "ZipFile": fs.readFileSync(zipName),
  };
  return promisify(lambda, lambda.updateFunctionCode, params);
}

function createConfig() {
  const config = {
    ENV:                       env,
    SPOTIFY_CLIENT_ID:         process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET:     process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_CALLBACK_URL:      process.env.SPOTIFY_CALLBACK_URL,
    SPOTIFY_ENCRYPTION_SECRET: process.env.SPOTIFY_ENCRYPTION_SECRET
  };
  return new Promise((resolve, reject) => {
    fs.writeFile(`./api/config.json`, JSON.stringify(config), (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
}

const sources = [
  'index.js',
  'encryption.js',
  'config.json',
];

function buildPackage() {
  return new Promise((resolve) => {
    const zipfile = new yazl.ZipFile();
    zipfile.outputStream.pipe(fs.createWriteStream(zipName)).on('close', () => resolve());
    sources.forEach(name => zipfile.addFile(`./api/${name}`, name));
    zipfile.addEmptyDirectory('node_modules');
    glob(`./api/node_modules/**/*`, (err, files) => {
      files.forEach((file) => {
        const stats = fs.statSync(file);
        const path = file.slice('./api/'.length);
        if (stats.isFile()) {
          zipfile.addFile(file, path);
        } else if (stats.isDirectory()) {
          zipfile.addEmptyDirectory(path);
        }
      });
      zipfile.end();
    });
  });
}

function deployFunction(handler, functionName) {
  return createFunction(handler, functionName).then((data) => {
    if (!data) {
      return updateFunction(handler, functionName);
    }
    return data;
  }).then((data) => {
    console.log(`Succeeded in deploying lambda function ${functionName}`);
  });
}

createConfig()
  .then(() => buildPackage())
  .then(() => deployFunction(functions[0].handler, functions[0].name))
  .then(() => deployFunction(functions[1].handler, functions[1].name))
  .catch((e) => {
    console.error(e);
  });
