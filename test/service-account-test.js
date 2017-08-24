'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('service account lookup test - error', (t) => {
  // Need to stub the config loader for this tests
  const stubbedUtil = {
    promisify: () => {
      return () => {
        return Promise.reject(new Error('Error'));
      };
    }
  };

  const serviceAccountLoader = proxyquire('../lib/service-account-loader', {
    'util': stubbedUtil
  });

  serviceAccountLoader().catch(() => {
    t.pass('should error');
    t.end();
  });
});

test('service account lookup test', (t) => {
  // Need to stub the config loader for this tests
  const stubbedUtil = {
    promisify: () => {
      return (path) => {
        switch (path) {
          case '/var/run/secrets/kubernetes.io/serviceaccount/token':
            return Promise.resolve('token');
          case '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt':
            return Promise.resolve('ca.crt');
          case '/var/run/secrets/kubernetes.io/serviceaccount/namespace':
            return Promise.resolve('namespace');
          default:
            return Promise.reject(new Error('no path found'));
        }
      };
    }
  };

  const serviceAccountLoader = proxyquire('../lib/service-account-loader', {
    'util': stubbedUtil
  });

  serviceAccountLoader().then((configObject) => {
    t.equal(configObject.context.namespace, 'namespace', 'has a namespace value');
    t.equal(configObject.user.token, 'token', 'has a token value');
    t.equal(configObject.user.ca, 'ca.crt', 'has a ca value');
    t.pass();
    t.end();
  });
});
