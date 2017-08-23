'use strict';

const mongoose = require('mongoose');
const User = require('./usermodel').User;
const config = require('../../config/config');
const jwt = require('jsonwebtoken');

const secret = config.SECRET;

module.exports.createUser = function (payload, callback) {
  let newUser = new User(payload);
  newUser.save(function (err, created) {
    if (err) {
      return callback(err);
    }
    callback(null, created);
  })
}

module.exports.login = function (payload, callback) {
  let email = payload.email;
  let password = payload.password;
  User.findOne({ email: email.toLowerCase() }, '+password', function (err, foundUser) {
		if (err) {
      return callback(err);
		}
		else {
			if (foundUser) {
				foundUser.comparePassword(password, function (err, isMatch) {
					if (err) {
						return callback(err);
					}
					if (!isMatch) {
						let error = new Error();
						error.name = 'authenticationError';
						return callback(error);
					}
					else {
						let sendData = {};
						try {
							sendData.userId = foundUser._id;
							sendData.firstname = foundUser.firstname;
							sendData.lastname = foundUser.lastname;
							sendData.email = foundUser.email;
							sendData.token = createToken(foundUser);
						}
						catch (e) {
							return callback(e);
						}
            return callback(null, sendData);
					}
				})
			}
			else {
				let error = new Error();
				error.name = 'authenticationError';
        return callback(error);
			}
		}
	})
}

const createToken = function (user) {
	let payload = {
		sub: user._id,
		iat: Math.floor(Date.now() / 1000) - 30,
		exp: Math.floor(Date.now() / 1000) + 86400000
	};
	return jwt.sign(payload, secret);
}