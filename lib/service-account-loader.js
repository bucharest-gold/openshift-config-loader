'use strict';

const fs = require('fs');

// Look here by default
const KUBERNETES_SERVICE_ACCOUNT_TOKEN_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/token';
const KUBERNETES_SERVICE_ACCOUNT_CA_CRT_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt';
const KUBERNETES_SERVICE_ACCOUNT_NAMESPACE_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/namespace';

function loadServiceAccountConfig (options) {
  return new Promise((resolve, reject) => {
    options = options || {};

    const host = process.env.KUBERNETES_SERVICE_HOST;
    const port = process.env.KUBERNETES_SERVICE_PORT;

    // Check to see if that CA_CRT_PATH is there and if it is load it as a string
    // set this as user.ca

    // Check and load the TOKEN
    // set that is the user.token property

    // Check and load the NAMESPACE
    // set this as context.namespace

    // Just quick and dirty for now
    try {
      const ca = fs.readFileSync(KUBERNETES_SERVICE_ACCOUNT_CA_CRT_PATH, 'utf8');
      const token = fs.readFileSync(KUBERNETES_SERVICE_ACCOUNT_TOKEN_PATH, 'utf8');
      const namespace = fs.readFileSync(KUBERNETES_SERVICE_ACCOUNT_NAMESPACE_PATH, 'utf8');
    } catch (err) {
      return reject(err);
    }

    // Merge those bits together into a new object
    const config = Object.assign({},
      {apiVersion: 'v1'},
      {context: {namespace: namespace}},
      {
        user: {
          token: token,
          ca: ca
        }
      },
      {cluster: `https://${host}:${port}`}
    );

    // resolve the promise with the config obejct
    return resolve(config);
  });
}

module.exports = loadServiceAccountConfig;
