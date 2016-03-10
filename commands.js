/**
 * Requires
 */
var Promise = require('bluebird');
var rp = require('request-promise');
var moment = require('moment');
var ip = require('ip');

var config = require('./config');
var helper = require('./helper');

/**
 * Commands
 */
module.exports = {
  /**
   * Fake a error promise
   *
   * @param {string} error Error Message
   *
   * @return {object} Rejected Request Promise
   */
  error: function(error) {
    return Promise.reject(new Error(error.message));
  },

  /**
   * Get Bus Arrival Timing
   *
   * @param {object} commandArguments Command Arguments
   *
   * @return {object} Request promise
   */
  bus: function(commandArguments) {
    var busStopNo = commandArguments[0];
    var busNo = commandArguments[1] || '';
    var busQuery = busStopNo;

    if (busNo !== '') {
      busQuery += '/' + busNo;
    }

    return rp({
      uri: config.lesterchanApiUrl + '/lta/bus-arrival/' + busQuery,
      json: true
    }).then(function(body) {
      if (body.Services && body.Services.length > 0) {
        // Fields
        var fields = [];
        body.Services.forEach(function(bus) {
          fields.push({
            title: 'Bus',
            value: bus.ServiceNo
          });
          fields.push({
            title: 'Status',
            value: bus.Status
          });

          // Bus Arrival Timings
          if (bus.Status !== 'Not In Operation') {
            var nextBus = bus.NextBus;
            var subBus = bus.SubsequentBus;
            var followBus = bus.SubsequentBus3;

            if (nextBus.EstimatedArrival !== '') {
              fields.push({
                title: 'Next Bus',
                value: moment(nextBus.EstimatedArrival).fromNow() +
                       ' (' + nextBus.Load + ')'
              });
            } else if (bus.Status === 'In Operation') {
              fields.push({
                title: 'Next Bus',
                value: 'No Estimate Available'
              });
            } else {
              fields.push({
                title: 'Next Bus',
                value: 'Not Operating Now'
              });
            }

            if (subBus.EstimatedArrival !== '') {
              fields.push({
                title: 'Subsequent Bus',
                value: moment(subBus.EstimatedArrival).fromNow() +
                       ' (' + subBus.Load + ')'
              });
            } else if (bus.Status === 'In Operation') {
              fields.push({
                title: 'Subsequent Bus',
                value: 'No Estimate Available'
              });
            } else {
              fields.push({
                title: 'Subsequent Bus',
                value: 'Not Operating Now'
              });
            }

            if (followBus.EstimatedArrival !== '') {
              fields.push({
                title: 'Following Bus',
                value: moment(followBus.EstimatedArrival).fromNow() +
                       ' (' + followBus.Load + ')'
              });
            } else if (bus.Status === 'In Operation') {
              fields.push({
                title: 'Following Bus',
                value: 'No Estimate Available'
              });
            } else {
              fields.push({
                title: 'Following Bus',
                value: 'Not Operating Now'
              });
            }
          }
        });

        return helper.formatMessage('Bus Stop ' + body.BusStopID, '', fields);
      }

      return 'Bus stop or number is invalid';
    });
  },

  /**
   * Haze
   *
   * @return {object} Request promise
   */
  haze: function() {
    return rp({
      uri: config.lesterchanApiUrl + '/nea/psipm25',
      json: true
    }).then(function(body) {
      // Variables
      var northPsi = parseInt(
        body.item.region[0].record.reading['@attributes'].value, 10
      );
      var centralPsi = parseInt(
        body.item.region[1].record.reading['@attributes'].value, 10
      );
      var eastPsi = parseInt(
        body.item.region[2].record.reading['@attributes'].value, 10
      );
      var westPsi = parseInt(
        body.item.region[3].record.reading['@attributes'].value, 10
      );
      var southPsi = parseInt(
        body.item.region[4].record.reading['@attributes'].value, 10
      );
      var averagePsi = Math.ceil(
        (northPsi + centralPsi + eastPsi + westPsi + southPsi) / 5
      );
      var timestamp = body.item.region[0].record['@attributes'].timestamp;
      var niceDate = moment(timestamp, 'YYYYMMDDHHmmss');

      // Fields
      var fields = [
        {
          title: 'Average',
          value: helper.getMessage(averagePsi)
        },
        {
          title: 'Central',
          value: helper.getMessage(centralPsi)
        },
        {
          title: 'North',
          value: helper.getMessage(northPsi)
        },
        {
          title: 'South',
          value: helper.getMessage(southPsi)
        },
        {
          title: 'East',
          value: helper.getMessage(eastPsi)
        },
        {
          title: 'West',
          value: helper.getMessage(westPsi)
        }
      ];

      return helper.formatMessage(
        'Singapore Haze Conditions',
        'PM2.5 Hourly Update. Last updated at ' +
        niceDate.format(config.defaultDateTimeFormat) + '.',
        fields
      );
    });
  },

  /**
   * Weather (3 hour Forecast)
   *
   * @return {object} Request promise
   */
  weather: function() {
    return rp({
      uri: config.lesterchanApiUrl + '/nea/nowcast',
      json: true
    }).then(function(body) {
      var fields = [];
      if (body.item.weatherForecast.area &&
          body.item.weatherForecast.area.length > 0) {
        body.item.weatherForecast.area.forEach(function(nowcast) {
          fields.push(
            {
              title: helper.ucWords(nowcast['@attributes'].name),
              value: helper.getMessage(nowcast['@attributes'].forecast)
            }
          );
        });
      }

      return helper.formatMessage(
        'Singapore Weather Conditions',
        '3 hour Forecast. ' + helper.ucWords(
          body.item.issue_datentime
            .replace('<br><font size=1>', '. ')
            .toLowerCase()
        ).replace(/am|pm|at|to|on/gi, function lower(str) {
          return str.toLowerCase();
        }) + '.',
        fields);
    });
  },

  /**
   * IP Info
   *
   * @param {object} commandArguments Command Arguments
   *
   * @return {object} Request promise
   */
  ipinfo: function(commandArguments) {
    // Variables
    var ipRequest = commandArguments[0] || ip.address();

    // Validate IP Address
    try {
      ip.toBuffer(ipRequest);
    } catch (error) {
      return this.error(error);
    }

    return rp({
      uri: 'http://ipinfo.io/' + ipRequest + '/json',
      json: true
    }).then(function(body) {
      // Fields
      var fields = [
        {
          title: 'IP',
          value: helper.getMessage(body.ip)
        },
        {
          title: 'Hostname',
          value: helper.getMessage(body.hostname)
        },
        {
          title: 'Country',
          value: helper.getMessage(body.country)
        },
        {
          title: 'City',
          value: helper.getMessage(body.city)
        },
        {
          title: 'Region',
          value: helper.getMessage(body.region)
        },
        {
          title: 'Organization',
          value: helper.getMessage(body.org)
        }
      ];

      return helper.formatMessage('IP Information', body.ip, fields);
    });
  },

  /**
   * Social Site Sharing Count
   *
   * @param {object} commandArguments Command Arguments
   *
   * @return {object} Request promise
   */
  socialstats: function(commandArguments) {
    var link = commandArguments[0] || 'https://lesterchan.net';

    return rp({
      uri: config.lesterchanApiUrl + '/link/?page=' + link,
      json: true
    }).then(function(body) {
      // Fields
      var fields = [
        {
          title: 'Total',
          value: helper.formatNumber(body.total_count)
        },
        {
          title: 'Facebook',
          value: helper.formatNumber(body.count.facebook)
        },
        {
          title: 'Twitter',
          value: helper.formatNumber(body.count.twitter)
        },
        {
          title: 'Google+',
          value: helper.formatNumber(body.count['google-plus'])
        },
        {
          title: 'LinkedIn',
          value: helper.formatNumber(body.count.linkedin)
        },
        {
          title: 'Pinterest',
          value: helper.formatNumber(body.count.pinterest)
        }
      ];

      return helper.formatMessage('Link Social Stats', body.url, fields);
    });
  }
};
