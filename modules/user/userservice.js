'use strict';

var mongoose = require('mongoose');
var User = require('./usermodel').User;

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
          if (!isMatch) {
						return callback(err);
					}
					else {
						let sendData = {};
						sendData.userId = foundUser._id;
						sendData.fistname = foundUser.fistname;
						sendData.lastname = foundUser.lastname;
						sendData.email = foundUser.email;
            return callback(null, sendData);
					}
				})
			}
      else {
        return callback(foundUser);
			}
		}
	})
}