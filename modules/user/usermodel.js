'use strict';

const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcryptjs');

const userSchema = new Schema({
  firstname: { type: String },
  lastname: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

userSchema.pre('save', function (next) {
  let user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(user.password, salt, function (err, hash) {
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (password, done) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    done(err, isMatch);
  });
};

var User = mongoose.model('User', userSchema);

module.exports.User = User;