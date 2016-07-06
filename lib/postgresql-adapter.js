/**
 *
 * @module postgresql-adapter
 */
;(function () {

  var knex = require('knex')

  module.exports = {

  }

  function init (options, callback) {

    var database = options.id

    var adapter = knex({
      client: 'pg',
      connection: {
        host: process.env.PG_HOST,
        user: process.env.PG_USER,
        password: process.env.PG_PASS
      }
    })

    adapter.createTableIfNotExists(database)
  }

})()
