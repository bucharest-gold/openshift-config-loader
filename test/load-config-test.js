'use strict';

const test = require('tape');

const proxyquire = require('proxyquire');

test('test loading of non-default config', (t) => {
  const openshiftConfigLoader = require('../');
  const settings = {
    configLocation: `${__dirname}/test-config`
  };

  openshiftConfigLoader(settings).then((config) => {
    t.ok(config.apiVersion, 'should have an api version prop');
    t.ok(config.context.cluster, 'should have the context cluster prop');
    t.ok(config.context.namespace, 'should have the context namespace prop');
    t.ok(config.context.user, 'should have the context user prop');

    // context user object
    t.ok(config.user.token, 'should have the user token prop');
    t.ok(config.cluster, 'should have the cluster prop');
    t.end();
  });
});

test('test loading of default config', (t) => {
  // probably a better way to do this.
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
    'fs': stubbedFs
  });

  // accessing the configLoader directly here, with no options
  configLoader().then((config) => {
    t.pass('load config using DEFAULT_CONFIG_LOCATION');
    t.end();
  });
});

test('test loading of config, error', (t) => {
  const openshiftConfigLoader = require('../');
  const settings = {
    configLocation: `${__dirname}/test-config-not-here`
  };

  openshiftConfigLoader(settings).catch(() => {
    t.pass('Should throw an error for not finding the config file');
    t.end();
  });
});
