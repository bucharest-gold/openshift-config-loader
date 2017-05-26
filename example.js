'use strict';

const openshiftConfigLoader = require('./');

openshiftConfigLoader().then((config) => {
  console.log(config);
});
