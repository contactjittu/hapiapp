'use strict';

const mongoose = require('mongoose');
const config = require('../config/config');

const dbUrl = config.MONGO_URI;
mongoose.connect(dbUrl, { useMongoClient: true });

mongoose.Promise = global.Promise;