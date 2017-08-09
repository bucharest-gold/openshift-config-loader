'use strict';

/*
 *
 *  Copyright 2016-2017 Red Hat, Inc, and individual contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

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

    let ca;
    let token;
    let namespace;

    // Just quick and dirty for now
    try {
      ca = fs.readFileSync(KUBERNETES_SERVICE_ACCOUNT_CA_CRT_PATH, 'utf8');
      token = fs.readFileSync(KUBERNETES_SERVICE_ACCOUNT_TOKEN_PATH, 'utf8');
      namespace = fs.readFileSync(KUBERNETES_SERVICE_ACCOUNT_NAMESPACE_PATH, 'utf8');
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
