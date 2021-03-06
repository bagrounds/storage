/**
 * Stores stuff.
 *
 * @module storage
 */
;(function () {
  'use strict'

  /**
   * imports
   */
  var typeCheck = require('type-check').typeCheck
  var _ = require('lodash')
  var serialize = require('serialize-javascript')

  var redis = require('redis')

  var redisAdapter = require('./lib/redis-adapter')
  var postgresqlAdapter = require('./lib/postgresql-adapter')

  var DEFAULT_HOST = 'localhost'
  var DEFAULT_PORT = '6379'

  var ACTION = {
    GET: 'get',
    SET: 'set',
    DELETE: 'delete',
    INIT: 'init'
  }

  var MEDIUM = {
    REDIS: 'redis',
    POSTGRESQL: 'postgresql'
  }

  /**
   * exports
   */
  module.exports = storage

  /**
   * Provide an action and associated options. Can get, set, and delete values.
   * Uses redis on localhost with default port (6379) by default. Can provide
   * a different host and port in options.
   *
   * @function storage
   * @param {options} options contains all function parameters
   * @param {Function} callback handles results
   */
  function storage (options, callback) {
    if (!options || !options.action) {
      callback(null, ACTION)
      return
    }

    var error = optionsAreInvalid(options)

    var action = options.action

    if (error) {
      callback(error)
      return
    }

    switch (action) {
      case ACTION.SET:
        memorize(options, callback)
        break

      case ACTION.GET:
        recall(options, callback)
        break

      case ACTION.DELETE:
        forget(options, callback)
        break

      case ACTION.INIT:
        init(options, callback)
        break

      default:

        break
    }
  }

  /**
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
  function memorize (options, callback) {
    options.value = serialize(options.value)

    var redisClient = initializeRedisClient(options)

    redisClient.set(options.key, options.value, callback)

    redisClient.quit()
  }

  /**
   * Return the value previously saved with key.
   *
   * @param {options} options contains key
   * @param {Function} callback handles results
   */
  function recall (options, callback) {
    var redisClient = initializeRedisClient(options)

    redisClient.get(options.key, function (error, response) {
      response = JSON.parse(response)

      callback(error, response)
    })

    redisClient.quit()
  }

  /**
   * Delete the value associated with key.
   *
   * @param {options} options contains key
   * @param {Function} callback handle results
   */
  function forget (options, callback) {
    var redisClient = initializeRedisClient(options)

    redisClient.DEL(options.key, callback)

    redisClient.quit()
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
  function optionsAreInvalid (options) {
    var message
    var action = options.action

    var actionIsString = typeCheck('String', action)

    if (!actionIsString) {
      message = 'invalid action: ' + action

      message += '. should be a String'

      return new Error(message)
    }

    var supportedActions = _.values(ACTION)

    var actionIsSupported = _.includes(supportedActions, action)

    if (!actionIsSupported) {
      message = 'unsupported action: ' + action

      return new Error(message)
    }

    return false
  }

  /**
   * Initialize redis client, optionally specifying a non-default host and port.
   *
   * @private
   *
   * @param {options} options optionally contains host and port
   * @returns {Error|Boolean} An error if options are invalid, false otherwise.
   */
  function initializeRedisClient (options) {
    var redisOptions = {
      host: DEFAULT_HOST,
      port: DEFAULT_PORT
    }

    if (options.host && options.port) {
      redisOptions = {
        host: options.host,
        port: options.port
      }
    }

    if (options.test) {
      var redis = require('fakeredis')
    }

    return redis.createClient(redisOptions)
  }

  /**
   *
   * @param options
   * @param callback
   */
  function init (options, callback) {
    var medium = options.medium

    switch (medium) {
      case MEDIUM.REDIS:
        redisAdapter.init(options, callback)
        break

      case MEDIUM.POSTGRESQL:
        postgresqlAdapter.init(options,callback)
        break
    }
  }


})()
