'use strict';

const kubeConfigLoader = require('./kube-config-loader');
const serviceAccountLoader = require('./service-account-loader');

module.exports = function configLoader (options) {
  // Try loading the config from the kube file
  return kubeConfigLoader(options).catch(() => {
    // If that fails then try loading with the service account
    return serviceAccountLoader(options).catch((err) => {
      // If that fails, then fail
      return Promise.reject(err)
    });
  });
};
