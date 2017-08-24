'use strict';

const Boom = require('boom');
const userService = require('./userservice');
const logger = require('../../utils/logger');

module.exports = {};

module.exports.register = function(server, options, next) {
  server.route([
    {
      method: 'GET',
      path: '/users/search/{keyword}',
      config: {
        handler: searchUsers
      }  
    },
    {
      method: 'GET',
      path: '/users',
      config: {
        handler: allUsers
      }  
    }
  ])
  next();
}

module.exports.register.attributes = {
    name: 'hapiapp-user-module',
    version: '1.0.0'
};

function searchUsers(request, reply) {
  let params = request.params;
  userService.searchUsers(params, function (err, response) {
    if (err) {
      logger.error(err);
      return reply(err);
    }
    reply({
      status: 'success',
      error_type: '',
      data: response
    })
  })
}

function allUsers(request, reply) {
  let query = request.query;
  userService.allUsers(query, function (err, response) {
    if (err) {
      logger.error(err);
      return reply(err);
    }
    reply({
      status: 'success',
      error_type: '',
      data: response
    })
  })
}