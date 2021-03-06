'use strict';
const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('./logger');

module.exports.sendEmail = function (mailOptions) {

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.MAIL.EMAIL_ID,
      pass: config.MAIL.EMAIL_PWD
    }
  });

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      logger.error(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
  
}