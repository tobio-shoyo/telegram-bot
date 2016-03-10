/**
 * Requires (Custom Modules)
 */
var rp = require('request-promise');
var helper = require('./helper');
var commands = require('./commands');
var telegramToken = require('./token');

/**
 * Main Lambda function
 *
 * @param {object} event AWS Lambda uses this parameter to pass in event data to the handler.
 * @param {object} context AWS Lambda uses this parameter to provide your handler the runtime information of the Lambda function that is executing.
 *
 * @return {object} Request Promise
 */
exports.handler = function(event, context) {
  var processCommand = processCommands(event);

  if (event.body.message.chat && event.body.message.chat.id) {
    processCommand.then(function(response) {
      var processTelegram = sendMessageToTelegram(
        event.body.message.chat.id,
        response
      );
      processTelegram.then(function() {
        context.succeed();
      }).catch(function() {
        context.fail();
      });
    }).catch(function(error) {
      var processTelegram = sendMessageToTelegram(
        event.body.message.chat.id,
        error.message
      );
      processTelegram.then(function() {
        context.succeed();
      }).catch(function() {
        context.fail();
      });
    });
  } else {
    processCommand.then(function() {
      context.succeed();
    }).catch(function() {
      context.fail();
    });
  }

  return processCommand;
};

/**
 * Send message to Telegram
 *
 * @param {int} chatId Chat ID
 * @param {string} message Message to send
 *
 * @return {object} Request Promise
 */
function sendMessageToTelegram(chatId, message) {
  return rp({
    method: 'POST',
    uri: 'https://api.telegram.org/bot' + telegramToken + '/sendMessage',
    form: {
      chat_id: chatId, // eslint-disable-line camelcase
      text: message,
      parse_mode: 'HTML' // eslint-disable-line camelcase
    }
  });
}

/**
 * Process Commands
 *
 * @param {object} event AWS Lambda Event
 *
 * @return {object} Request Promise
 */
function processCommands(event) {
  if (event &&
    event.body &&
    event.body.message &&
    event.body.message.text
  ) {
    var commandArguments = helper.parseCommand(event.body.message.text.trim());
    if (commandArguments === null) {
      return commands.error('Invalid Command');
    }

    var commandKeys = Object.keys(commandArguments);
    if (commandKeys.length === 0 && !commands[commandKeys[0]]) {
      return commands.error('Invalid Command');
    }

    var command = commandKeys[0];

    return commands[command](commandArguments[command]);
  }

  return commands.error('Event not specified');
}
