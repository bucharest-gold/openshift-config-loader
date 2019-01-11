'use strict';
/* eslint promise/prefer-await-to-then: "off" */
const test = require('tape');

const proxyquire = require('proxyquire');

test('test loading of non-default config', t => {
  const openshiftConfigLoader = require('..');
  const settings = {
    configLocation: `${__dirname}/test-config`
  };

  openshiftConfigLoader(settings).then(config => {
    t.ok(config.apiVersion, 'should have an api version prop');
    t.ok(config.context.cluster, 'should have the context cluster prop');
    t.ok(config.context.namespace, 'should have the context namespace prop');
    t.ok(config.context.user, 'should have the context user prop');

    // Context user object
    t.ok(config.user.token, 'should have the user token prop');
    t.ok(config.cluster, 'should have the cluster prop');
    t.end();
  });
});

test('test loading of default config', t => {
  // Probably a better way to do this.
  const tempConfigYaml = `
    apiVersion: v1
    clusters:
    - cluster:
        server: https://192.168.99.100:8443
      name: 192-168-99-100:8443
    contexts:
    - context:
        cluster: 192-168-99-100:8443
        user: developer/192-168-99-100:8443
      name: /192-168-99-100:8443/developer
    - context:
        cluster: 192-168-99-100:8443
        namespace: for-node-client-testing
        user: developer/192-168-99-100:8443
      name: for-node-client-testing/192-168-99-100:8443/developer
    - context:
        cluster: 192-168-99-100:8443
        namespace: for-testing-purposes
        user: developer/192-168-99-100:8443
      name: for-testing-purposes/192-168-99-100:8443/developer
    current-context: for-node-client-testing/192-168-99-100:8443/developer
    kind: Config
    preferences: {}
    users:
    - name: developer/192-168-99-100:8443
      user:
        token: zVBd1ZFeJqEAILJgimm4-gZJauaw3PW4EVqV_peEZ3U
  `;

  // Need to stub the config loader for this tests
  const stubbedFs = {
    readFile: (locations, options, cb) => {
      return cb(null, tempConfigYaml);
    }
  };

  const configLoader = proxyquire('../lib/kube-config-loader', {
    fs: stubbedFs
  });

  // Accessing the configLoader directly here, with no options
  configLoader().then(_ => {
    t.pass('load config using DEFAULT_CONFIG_LOCATION');
    t.end();
  });
});

test('test loading of config, error', t => {
  const openshiftConfigLoader = require('..');
  const settings = {
    configLocation: `${__dirname}/test-config-not-here`
  };

  openshiftConfigLoader(settings).catch(() => {
    t.pass('Should throw an error for not finding the config file');
    t.end();
  });
});

test('test using service account', t => {
  // Need to stub the config loader for this tests
  const stubbedKubeConfigLoader = () => {
    return Promise.reject(new Error('config not found'));
  };

  const stubbedServiceAccountLoader = () => {
    return Promise.resolve();
  };

  const configLoader = proxyquire('../lib/openshift-config-loader', {
    './kube-config-loader': stubbedKubeConfigLoader,
    './service-account-loader': stubbedServiceAccountLoader
  });

  configLoader().then(_ => {
    t.pass('service account was called');
    t.end();
  });
});

test('test using service account with the true option', t => {
  // Need to stub the config loader for this tests
  const stubbedKubeConfigLoader = () => {
    return Promise.reject(new Error('config not found'));
  };

  const stubbedServiceAccountLoader = () => {
    return Promise.resolve();
  };

  const configLoader = proxyquire('../lib/openshift-config-loader', {
    './kube-config-loader': stubbedKubeConfigLoader,
    './service-account-loader': stubbedServiceAccountLoader
  });

  configLoader({tryServiceAccount: true}).then(_ => {
    t.pass('service account was called with the true option');
    t.end();
  });
});

test('test not using service account', t => {
  // Need to stub the config loader for this tests
  const stubbedKubeConfigLoader = () => {
    return Promise.reject(new Error('config not found'));
  };

  const stubbedServiceAccountLoader = () => {
    // Shouldn't get here
    t.fail();
    return Promise.reject(new Error('service account failed'));
  };

  const configLoader = proxyquire('../lib/openshift-config-loader', {
    './kube-config-loader': stubbedKubeConfigLoader,
    './service-account-loader': stubbedServiceAccountLoader
  });

  configLoader({tryServiceAccount: false}).catch(error => {
    t.equal('config not found', error.message, 'error message should be from the default config loader');
    t.end();
  });
});
