import 'dotenv/config';
// import './db.js';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import http from 'http';
import https from 'https';
import routes from './routes.js';

const { NODE_ENV, CLIENT_URL, CLIENT_URL_TEST, SSL_PATH, PORT } = process.env;

const whitelist = [CLIENT_URL, CLIENT_URL_TEST];
const corsOpts = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors(CLIENT_URL ? corsOpts : { origin: '*' }));

app.use('/api', routes);

if (NODE_ENV === 'production') {
  const httpsServer = https.createServer(
    {
      key: fs.readFileSync(`${SSL_PATH}privkey.pem`),
      cert: fs.readFileSync(`${SSL_PATH}fullchain.pem`),
    },
    app
  );

  httpsServer.listen(PORT);
}

if (NODE_ENV === 'development') {
  const httpServer = http.createServer(app);
  httpServer.listen(PORT);
}

console.log('Server running on port ' + PORT);
