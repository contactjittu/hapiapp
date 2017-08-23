'use strict';

const Boom = require('boom');
const userService = require('./userservice');
const logger = require('../../utils/logger');

module.exports = {};

module.exports.register = function(server, options, next) {
  server.route([
    {
      method: 'POST',
      path: '/auth/signup',
      config: {
        handler: signup
      }  
    },
    {
      method: 'POST',
      path: '/auth/login',
      config: {
        handler: login
      }  
    }
  ])
  next();
}

module.exports.register.attributes = {
    name: 'hapiapp-user-module',
    version: '1.0.0'
};

function signup(request, reply) {
  let payload = request.payload;
  userService.createUser(payload, function (err, response) {
    if (err) {
      logger.error(err.stack);
      if (err.code ===  11000 || err.code === 11001) {
        return reply(Boom.conflict('please provide another email, it already exist'));
      }
      return reply(err);
    }
    reply(response);
  })
}

function login(request, reply) {
  let payload = request.payload;
  userService.login(payload, function (err, response) {
    if (err) {
      logger.error(err);
      if (err.name === 'authenticationError') {
        return reply(Boom.unauthorized('The email or password you entered is incorrect.'));
      }
      logger.error(err);
      return reply(Boom.badImplementation(err));
    }
    reply({ data: response });
  })
}