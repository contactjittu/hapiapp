'use strict';

const mongoose = require('mongoose');
const async = require('async');
const crypto = require('crypto');
const User = require('./usermodel').User;
const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const mail = require('../../utils/mail');

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

module.exports.forgotPassword = function (payload, callback) {
	var email = payload.email;
	async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
			User.findOne({ email: email }, function (err, user) {
				if (err) {
					return done(err);
				}
        if (!user) {
					let error = new Error();
					error.name = 'authenticationError';
					return done(error);
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var mailOptions = {
        to: user.email,
        from: config.MAIL.EMAIL_ID,
        subject: 'Hapiapp Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
          Please click on the following link, or paste this into your browser to complete the process
          http://${config.SERVER}:${config.PORT}/auth/resetpassword/${token}
          If you did not request this, please ignore this email and your password will remain unchanged.`
      };
			mail.sendEmail(mailOptions)
			done(null);
    }
  ], function(err) {
		if (err) {
			return callback(err);
		};
		return callback();
  });
}

module.exports.resetPassword = function (payload, callback) {
	let token = payload.token;
	let password = payload.password;
	async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
				if (err) {
					return done(err);
				}
				if (!user) {
					let error = new Error();
					error.name = 'authenticationError';
					return done(error);
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
					done(err, user);
        });
      });
    },
    function(user, done) {

      var mailOptions = {
        to: user.email,
        from: config.MAIL.EMAIL_ID,
        subject: 'Your password has been changed',
        text: `Hello ${user.firstname},
          This is a confirmation that the password for your account ${user.email} has just been changed.`
			};
			
      mail.sendEmail(mailOptions)
			done(null);
    }
  ], function(err) {
    if (err) {
			return callback(err);
		};
		return callback();
  });
}

module.exports.searchUser = function (params, callback) {

	let filter = params.keyword;
  let regexStr = filter.split(/ /).join("|"); 
	let projection = {
		'firstname': 1,
		'lastname': 1,
		'email': 1
	}
  User.find({
    "$or": [
        { "firstname": { "$regex": regexStr, "$options": 'i' } },
        { "lastname": { "$regex": regexStr, "$options": 'i' }}
    ]
	},projection).limit(50).exec(function (err, result) {
    if (err) {
			return callback(err);
    }
    return callback(null, result);
  })
}