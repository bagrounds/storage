/**
 * Template for a function module that can be served by serve-function.
 *
 * @module storage
 */
(function(){
  'use strict';

  /*****************************************************************************
   * imports
   */
  var typeCheck = require('type-check').typeCheck;
  var _ = require('lodash');
  var serialize = require('serialize-javascript');

  var redis = require('redis');

  var DEFAULT_HOST = 'localhost';
  var DEFAULT_PORT = '6379';

  var SUPPORTED_ACTIONS = {
    GET: 'get',
    SET: 'set',
    DELETE: 'delete'
  };

  /*****************************************************************************
   * exports
   */
  module.exports = storage;

  /**
   * Provide an action and associated options. Can get, set, and delete values.
   * Uses redis on localhost with default port (6379) by default. Can provide
   * a different host and port in options.
   *
   * @function storage
   * @param {options} options contains all function parameters
   * @param {Function} callback handles results
   */
  function storage(options, callback){

    var error = optionsAreInvalid(options);

    var action = options.action;

    if(error){
      callback(error);
      return;
    }

    switch(action){

      case 'set':
        memorize(options, callback);
        break;

      case 'get':
        recall(options, callback);
        break;

      case 'delete':
        forget(options, callback);
        break;
    }
  }

  /*****************************************************************************
   * Define helper functions
   */


  /**
   *
   * @typedef {Object} options contains all function parameters
   * @property {String} [action] get, set, or delete
   * @property {String} [key] identifier for value
   * @property {*} [value] the value to set
   * @property {String} [host] host other than the default
   * @property {Number} [port] port other than the default
   * @property {Boolean} [test] use a fake redis client
   */

  /**
   * Save a value with an associated key.
   *
   * @param {options} options contains key and value
   * @param {Function} callback handles results
   */
  function memorize(options,callback){

    options.value = serialize(options.value);

    var redisClient = initializeRedisClient(options);

    redisClient.set(options.key, options.value, callback);

    redisClient.quit();
  }

  /**
   * Return the value previously saved with key.
   *
   * @param {options} options contains key
   * @param {Function} callback handles results
   */
  function recall(options,callback){

    var redisClient = initializeRedisClient(options);

    redisClient.get(options.key, function(error, response){

      response = JSON.parse(response);

      callback(error,response);
    });

    redisClient.quit();
  }

  /**
   * Delete the value associated with key.
   *
   * @param {options} options contains key
   * @param {Function} callback handle results
   */
  function forget(options, callback){

    var redisClient = initializeRedisClient(options);

    redisClient.DEL(options.key, callback);

    redisClient.quit();
  }



  /**
   * Validate inputs.
   *
   * @private
   *
   * @param {Object} options contains all function parameters
   *
   * @returns {Error|Boolean} any errors due to invalid inputs
   */
  function optionsAreInvalid(options){

    var message;
    var action = options.action;

    var actionIsString = typeCheck('String',action);

    if(!actionIsString){
      message = 'invalid action: ' + action;

      message += '. should be a String';

      return new Error(message);
    }

    var supportedActions = _.values(SUPPORTED_ACTIONS);

    var actionIsSupported = _.includes(supportedActions,action);

    if(!actionIsSupported){
      message = 'unsupported action: ' + action;

      return new Error(message);
    }

    return false;
  }

  /**
   * Initialize redis client, optionally specifying a non-default host and port.
   *
   * @private
   *
   * @param {options} options optionally contains host and port
   * @returns {Error|Boolean} An error if options are invalid, false otherwise.
   */
  function initializeRedisClient(options){

    var redisOptions = {
      host: DEFAULT_HOST,
      port: DEFAULT_PORT
    };

    if( options.host && options.port ){

      redisOptions = {
        host: options.host,
        port: options.port
      };
    }

    if(options.test){

      var redis = require('fakeredis');
    }

    return redis.createClient(redisOptions);
  }
})();
