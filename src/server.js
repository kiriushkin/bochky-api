import 'dotenv/config';
// import './db.js';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import http from 'http';
import https from 'https';
import routes from './routes.js';

const { NODE_ENV, CLIENT_URL, SSL_PATH, PORT } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: CLIENT_URL || '*' }));

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
