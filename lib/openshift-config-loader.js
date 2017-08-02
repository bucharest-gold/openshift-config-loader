'use strict';

const kubeConfigLoader = require('./kube-config-loader');
const serviceAccountLoader = require('./service-account-loader');

const KUBERNETES_AUTH_TRYSERVICEACCOUNT = process.env.KUBERNETES_AUTH_TRYSERVICEACCOUNT || true;

/**
  This module will load attempt to load the Openshift configuration

  @param {object} [options] -
  @param {string} [options.tryServiceAccount] - option to turn off looking for a service account. defaults to true
  @returns {Promise}
*/
module.exports = function configLoader (options) {
  options = options || {};

  if (options.tryServiceAccount !== false) {
    options.tryServiceAccount = true;
  }

  // Try loading the config from the kube file
  return kubeConfigLoader(options).catch((err) => {
    // Do we want to check for a Service Account
    if (!options.tryServiceAccount || !KUBERNETES_AUTH_TRYSERVICEACCOUNT) {
      return Promise.reject(err);
    }

    // try loading with the service account
    return serviceAccountLoader(options).catch((err) => {
      // If that fails, then fail
      return Promise.reject(err);
    });
  });
};
