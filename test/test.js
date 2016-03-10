/**
 * Requires (Test Modules)
 */
var expect = require('expect.js');

/**
 * Requires (Main App)
 */
var lambda = require('../index');

/**
 * Mock AWS Lambda Context
 */
var context = {
  fail: function() {},
  succeed: function() {}
};

describe('slack-bot', function() {
  this.timeout(5000);

  it('Should list down all buses arrival timing at the bus stop', function(done) {
    var output = lambda.handler({
      body: {
        message: {
          text: '/bus 14229'
        }
      }
    }, context);

    output.then(function(response) {
      expect(response).to.contain('Bus Stop 14229');
      done();
    }).catch(done);
  });

  it('Should list down a single bus arrival timing at the bus stop', function(done) {
    var output = lambda.handler({
      body: {
        message: {
          text: '/bus 14229 61'
        }
      }
    }, context);

    output.then(function(response) {
      expect(response).to.contain('Bus Stop 14229');
      expect(response).to.contain('Bus: 61');
      done();
    }).catch(done);
  });

  it('Should validate against invalid bus stop number', function(done) {
    var output = lambda.handler({
      body: {
        message: {
          text: '/bus invalidbustopno'
        }
      }
    }, context);

    output.then(function(response) {
      expect(response).to.eql('Bus stop or number is invalid');
      done();
    }).catch(done);
  });

  it('Should validate against invalid bus number', function(done) {
    var output = lambda.handler({
      body: {
        message: {
          text: '/bus 14229 invalidbusno'
        }
      }
    }, context);

    output.then(function(response) {
      expect(response).to.eql('Bus stop or number is invalid');
      done();
    }).catch(done);
  });

  it('Should list down Singapore haze conditions', function(done) {
    var output = lambda.handler({
      body: {
        message: {
          text: '/haze'
        }
      }
    }, context);

    output.then(function(response) {
      expect(response).to.contain('Singapore Haze Conditions');
      done();
    }).catch(done);
  });

  it('Should list down Singapore 3 hour forecast weather conditions', function(done) {
    var output = lambda.handler({
      body: {
        message: {
          text: '/weather'
        }
      }
    }, context);

    output.then(function(response) {
      expect(response).to.contain('Singapore Weather Conditions');
      done();
    }).catch(done);
  });

  it('Should list down Google DNS information', function(done) {
    var output = lambda.handler({
      body: {
        message: {
          text: '/ipinfo 8.8.8.8'
        }
      }
    }, context);

    output.then(function(response) {
      expect(response).to.contain('8.8.8.8');
      done();
    }).catch(done);
  });

  it('Should validate against invalid IP', function(done) {
    var output = lambda.handler({
      body: {
        message: {
          text: '/ipinfo invalidip'
        }
      }
    }, context);

    output.catch(function(error) {
      expect(error).to.have.property('message');
      expect(error.message).to.eql('Invalid ip address: invalidip');

      done();
    }).catch(done);
  });

  it('Should list down social stats count for a link', function(done) {
    var output = lambda.handler({
      body: {
        message: {
          text: '/socialstats https://lesterchan.net/blog/2016/02/26/singtel-samsung-galaxy-s7-4g-and-galaxy-s7-edge-4g-price-plans/'
        }
      }
    }, context);

    output.then(function(response) {
      expect(response).to.contain('https://lesterchan.net/blog/2016/02/26/singtel-samsung-galaxy-s7-4g-and-galaxy-s7-edge-4g-price-plans/');
      done();
    }).catch(done);
  });
});
