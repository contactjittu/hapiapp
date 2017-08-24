'use strict';

const Boom = require('boom');
const userService = require('../user/userservice');
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
    },
    {
      method: 'POST',
      path: '/auth/forgot',
      config: {
        handler: forgotPassword
      }  
    },
    {
      method: 'POST',
      path: '/auth/resetpassword/{token}',
      config: {
        handler: resetPassword
      }  
    }
  ])
  next();
}

module.exports.register.attributes = {
    name: 'hapiapp-auth-module',
    version: '1.0.0'
};

function signup(request, reply) {
  let payload = request.payload;
  userService.createUser(payload, function (err, response) {
    if (err) {
      logger.error(err);
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
      return reply(Boom.badImplementation(err));
    }
    reply({ data: response });
  })
}

function forgotPassword(request, reply) {
  let payload = request.payload;
  userService.forgotPassword(payload, function (err, response) {
    if (err) {
      logger.error(err);
      if (err.name === 'authenticationError') {
        return reply(Boom.unauthorized('No account with that email address exists.'));
      }
      return reply(Boom.badImplementation(err));
    }
    reply({
      status: 'success',
      error_type: '',
      message: 'An e-mail has been sent with further instructions.'
    });
  })
}

function resetPassword(request, reply) {
  let payload = {};
  payload.token = request.params.token;
  payload.password = request.payload.password;
  userService.resetPassword(payload, function (err, response) {
    if (err) {
      logger.error(err);
      if (err.name === 'authenticationError') {
        return reply(Boom.unauthorized('Password reset token is invalid or has expired.'));
      }
      return reply(Boom.badImplementation(err));
    }
    reply({
      status: 'success',
      error_type: '',
      message: 'An e-mail has been sent with further instructions.'
    });
  })
}