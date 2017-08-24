'use strict';

const Hapi = require('hapi');
const config = require('./config/config');

const server = new Hapi.Server();

server.connection({ port: config.PORT });

server.register({
  register: require('./modules/user/usercontroller.js')
}, function (err) {
  if (err) {
    throw err;
  }
  });

server.register({
  register: require('./modules/auth/authcontroller.js')
}, function (err) {
  if (err) {
    throw err;
  }
});

server.start(function (err) {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});

require('./utils/dbconnection');

server.on('response', function (request) {
    console.log(request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.url.path + ' --> ' + request.response.statusCode);
});