/**
 * Tests for serve-function-module-template
 */
;(function () {
  /* global describe, it, beforeEach */
  'use strict';

  /***************************************************************************
   * Imports
   */
  var expect = require('chai').expect;

  var storage = require('../storage');

  /***************************************************************************
   * Tests
   */
  describe('storage', function () {

    var options;
    var TEST_KEY;
    var TEST_VALUE;

    beforeEach(function () {

      TEST_KEY = 'a key';
      TEST_VALUE = {
        string: 'a string',
        number: 42,
        object: {
          string: 'another string',
          number: 43,
          array: [1,2,3]
        },
        array: [
          'string',
          {},
          ['a','b','c']
        ]
      };

      options = {
        key: TEST_KEY,
        value: TEST_VALUE,
        test: true
      };
    });

    describe('verifying inputs', function () {

      it('should return an error if action is not a string', function (done) {

        options.action = {};

        storage(options, function (error) {

          expect(error).to.be.ok;

          done();
        });
      });

      it('should return something if no options were specified', function(done){

        storage({}, function(error, response) {

          expect(error).to.not.be.ok;
          expect(response).to.be.ok;
          done();
        });
      });

      it('should return an error for invalid action', function (done) {

        options.action = 'foo';

        storage(options, function (error) {

          expect(error).to.be.ok;

          done();
        });
      });
    });

    describe('providing non-default host and port', function(){

      it('should use the provided host and port', function(done){

        options.host = 'localhost';
        options.port = 6379;
        options.action = 'set';

        storage(options, function(error) {

          expect(error).to.not.be.ok;

          options.action = 'get';

          storage(options, function(error, result) {

            expect(error).to.not.be.ok;
            expect(result).to.deep.equal(TEST_VALUE);

            options.action = 'delete';

            storage(options, function(error) {

              expect(error).to.not.be.ok;

              options.action = 'get';

              storage(options, function(error, result) {

                expect(error).to.not.be.ok;

                expect(result).to.be.null;

                done();
              });
            });
          });
        });
      });
    });

    describe('set', function () {

      it('should set values', function (done) {

        options.action = 'set';

        storage(options, function (error) {

          expect(error).to.not.be.ok;

          done();
        });
      });
    });

    describe('get', function () {

      it('should get values', function (done) {

        options.action = 'get';

        storage(options, function (error, result) {

          expect(error).to.not.be.ok;
          expect(result).to.deep.equal(TEST_VALUE);

          done();
        });
      });
    });

    describe('delete', function () {

      it('should delete values', function (done) {

        options.action = 'delete';

        storage(options, function (error) {

          expect(error).to.not.be.ok;

          options.action = 'get';

          storage(options, function (error, result) {

            expect(error).to.not.be.ok;
            expect(result).to.be.null;

            done();
          });
        });
      });
    });
  });
})();
