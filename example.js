'use strict';

const openshiftConfigLoader = require('.');

/* eslint promise/prefer-await-to-then: "off" */
openshiftConfigLoader().then(config => {
  console.log(config);
});
