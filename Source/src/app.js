const express = require('express');
const dotenv = require('dotenv');

const route = require('./routes');
const configServer = require('./configs/configServer');

// Load variables from .env into process.env
dotenv.config({ path: __dirname + '/.env' });

// Conect MongoDB
const db = require('./configs/db');
db.connect();

const app = express();

// Config server (register middlewares)
const config = configServer(app, __dirname);

// Route
route(app, config);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Web started on: http://localhost:${port}.`));
