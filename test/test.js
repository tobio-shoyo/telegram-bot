'use strict';

/**
 * Requires (Test Modules)
 */
const expect = require('chai').expect;

/**
 * Requires (Main App)
 */
const lambda = require('../index');

/**
 * Timeout
 */
const timeout = 5000;

/**
 * Mock AWS Lambda Context
 */
const context = {
  fail() {},
  succeed() {},
};

describe('telegram-bot', () => {
  it('Should list down all buses arrival timing at the bus stop', (done) => {
    const output = lambda.handler({
      body: {
        message: {
          text: '/bus 14229',
        },
      },
    }, context);

    output.then((response) => {
      expect(response).to.contain('Bus Stop 14229');
      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should list down a single bus arrival timing at the bus stop', (done) => {
    const output = lambda.handler({
      body: {
        message: {
          text: '/bus 14229 61',
        },
      },
    }, context);

    output.then((response) => {
      expect(response).to.contain('Bus Stop 14229');
      expect(response).to.contain('Bus: 61');
      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should validate against invalid bus stop number', (done) => {
    const output = lambda.handler({
      body: {
        message: {
          text: '/bus invalidbustopno',
        },
      },
    }, context);

    output.then((response) => {
      expect(response).to.eql('Bus stop or number is invalid');
      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should validate against invalid bus number', (done) => {
    const output = lambda.handler({
      body: {
        message: {
          text: '/bus 14229 invalidbusno',
        },
      },
    }, context);

    output.then((response) => {
      expect(response).to.eql('Bus stop or number is invalid');
      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should list down Singapore haze conditions', (done) => {
    const output = lambda.handler({
      body: {
        message: {
          text: '/haze',
        },
      },
    }, context);

    output.then((response) => {
      expect(response).to.contain('Singapore Haze Conditions');
      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should list down Singapore 3 hour forecast weather conditions', (done) => {
    const output = lambda.handler({
      body: {
        message: {
          text: '/weather',
        },
      },
    }, context);

    output.then((response) => {
      expect(response).to.contain('Singapore Weather Conditions');
      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should list down Google DNS information', (done) => {
    const output = lambda.handler({
      body: {
        message: {
          text: '/ipinfo 8.8.8.8',
        },
      },
    }, context);

    output.then((response) => {
      expect(response).to.contain('8.8.8.8');
      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should validate against invalid IP', (done) => {
    const output = lambda.handler({
      body: {
        message: {
          text: '/ipinfo invalidip',
        },
      },
    }, context);

    output.catch((e) => {
      expect(e.message).to.eql('Invalid IP');
      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should list down social stats count for a link', (done) => {
    const output = lambda.handler({
      body: {
        message: {
          text: '/socialstats https://lesterchan.net/blog/2017/06/30/apple-ipad-pro-10-5-space-grey-256gb-wi-fi-cellular/',
        },
      },
    }, context);

    output.then((response) => {
      expect(response).to.contain('https://lesterchan.net/blog/2017/06/30/apple-ipad-pro-10-5-space-grey-256gb-wi-fi-cellular/');
      done();
    }).catch(done);
  }).timeout(timeout);
});
