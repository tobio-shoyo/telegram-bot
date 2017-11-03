'use strict';

/**
 * Requires
 */
const rp = require('request-promise');
const moment = require('moment');

const config = require('./config');
const helper = require('./helper');

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
  error(error) {
    return Promise.reject(new Error(error));
  },

  /**
   * Get Bus Arrival Timing
   *
   * @param {object} commandArguments Command Arguments
   *
   * @return {object} Request promise
   */
  bus(commandArguments) {
    const busStopNo = commandArguments[0];
    const busNo = commandArguments[1] || '';
    let busQuery = busStopNo;

    if (busNo !== '') {
      busQuery += `/${busNo}`;
    }

    return rp({
      uri: `${config.lesterchanApiUrl}/lta/bus-arrival/${busQuery}`,
      json: true,
    }).then((body) => {
      if (body.Services && body.Services.length > 0) {
        const busLoad = {
          SEA: 'Seats Available',
          SDA: 'Standing Available',
          LSD: 'Limited Standing',
        };
        const busType = {
          SD: 'Single Deck',
          DD: 'Double Deck',
          BD: 'Bendy',
        };
        // Fields
        const fields = [];
        body.Services.forEach((bus) => {
          fields.push({
            title: 'Bus',
            value: bus.ServiceNo,
          });

          // Bus Arrival Timings
          const nextBus = bus.NextBus || '';
          const subBus = bus.NextBus2 || '';
          const followBus = bus.NextBus3 || '';

          if (nextBus !== '') {
            fields.push({
              title: 'Next Bus',
              value: `${moment(nextBus.EstimatedArrival).fromNow()} (${busLoad[nextBus.Load]}, ${busType[nextBus.Type]})`,
            });
          } else {
            fields.push({
              title: 'Next Bus',
              value: 'Not Operating Now',
            });
          }

          if (subBus !== '') {
            fields.push({
              title: 'Subsequent Bus',
              value: `${moment(subBus.EstimatedArrival).fromNow()} (${busLoad[subBus.Load]}, ${busType[subBus.Type]})`,
            });
          } else {
            fields.push({
              title: 'Subsequent Bus',
              value: 'Not Operating Now',
            });
          }

          if (followBus !== '') {
            fields.push({
              title: 'Following Bus',
              value: `${moment(followBus.EstimatedArrival).fromNow()} (${busLoad[followBus.Load]}, ${busType[followBus.Type]})`,
            });
          } else {
            fields.push({
              title: 'Following Bus',
              value: 'Not Operating Now',
            });
          }
        });

        return helper.formatMessage(`Bus Stop ${body.BusStopCode}`, '', fields);
      }

      return 'Bus stop or number is invalid';
    });
  },

  /**
   * Haze
   *
   * @return {object} Request promise
   */
  haze() {
    return rp({
      uri: `${config.lesterchanApiUrl}/nea/psipm25`,
      json: true,
    }).then((body) => {
      // Variables
      const northPsi = parseInt(body.item.region[0].record.reading['@attributes'].value, 10);
      const centralPsi = parseInt(body.item.region[1].record.reading['@attributes'].value, 10);
      const eastPsi = parseInt(body.item.region[2].record.reading['@attributes'].value, 10);
      const westPsi = parseInt(body.item.region[3].record.reading['@attributes'].value, 10);
      const southPsi = parseInt(body.item.region[4].record.reading['@attributes'].value, 10);
      const averagePsi = Math.ceil((northPsi + centralPsi + eastPsi + westPsi + southPsi) / 5);
      const timestamp = body.item.region[0].record['@attributes'].timestamp;
      const niceDate = moment(timestamp, 'YYYYMMDDHHmmss');

      // Fields
      const fields = [
        {
          title: 'Average',
          value: helper.getMessage(averagePsi),
        },
        {
          title: 'Central',
          value: helper.getMessage(centralPsi),
        },
        {
          title: 'North',
          value: helper.getMessage(northPsi),
        },
        {
          title: 'South',
          value: helper.getMessage(southPsi),
        },
        {
          title: 'East',
          value: helper.getMessage(eastPsi),
        },
        {
          title: 'West',
          value: helper.getMessage(westPsi),
        },
      ];

      return helper.formatMessage('Singapore Haze Conditions', `PM2.5 Hourly Update. Last updated at ${niceDate.format(config.defaultDateTimeFormat)}.`, fields);
    });
  },

  /**
   * Weather (2 hour Forecast)
   *
   * @return {object} Request promise
   */
  weather() {
    return rp({
      uri: `${config.lesterchanApiUrl}/nea/nowcast`,
      json: true,
    }).then((body) => {
      const fields = [];
      if (body.item.weatherForecast.area &&
        body.item.weatherForecast.area.length > 0) {
        body.item.weatherForecast.area.forEach((nowcast) => {
          fields.push({
            title: helper.ucWords(nowcast['@attributes'].name),
            value: helper.getMessage(nowcast['@attributes'].forecast),
          });
        });
      }

      return helper.formatMessage('Singapore Weather Conditions', `2 hour Forecast. ${body.item.validTime}.`, fields);
    });
  },

  /**
   * IP Info
   *
   * @param {object} commandArguments Command Arguments
   *
   * @return {object} Request promise
   */
  ipinfo(commandArguments) {
    // Variables
    const ip = commandArguments[0] || '127.0.0.1';

    // Validate IP Address
    if (!helper.validateIp(ip)) {
      return this.error('Invalid IP');
    }

    return rp({
      uri: `http://ipinfo.io/${ip}/json`,
      json: true,
    }).then((body) => {
      // Fields
      const fields = [
        {
          title: 'IP',
          value: helper.getMessage(body.ip),
        },
        {
          title: 'Hostname',
          value: helper.getMessage(body.hostname),
        },
        {
          title: 'Country',
          value: helper.getMessage(body.country),
        },
        {
          title: 'City',
          value: helper.getMessage(body.city),
        },
        {
          title: 'Region',
          value: helper.getMessage(body.region),
        },
        {
          title: 'Organization',
          value: helper.getMessage(body.org),
        },
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
  socialstats(commandArguments) {
    const link = commandArguments[0] || 'https://lesterchan.net';

    return rp({
      uri: `${config.lesterchanApiUrl}/link/?page=${link}`,
      json: true,
    }).then((body) => {
      // Fields
      const fields = [
        {
          title: 'Total',
          value: helper.formatNumber(body.total_count),
        },
        {
          title: 'Facebook',
          value: helper.formatNumber(body.count.facebook),
        },
        {
          title: 'Twitter',
          value: helper.formatNumber(body.count.twitter),
        },
        {
          title: 'Google+',
          value: helper.formatNumber(body.count['google-plus']),
        },
        {
          title: 'LinkedIn',
          value: helper.formatNumber(body.count.linkedin),
        },
        {
          title: 'Pinterest',
          value: helper.formatNumber(body.count.pinterest),
        },
      ];

      return helper.formatMessage('Link Social Stats', body.url, fields);
    });
  },
};
