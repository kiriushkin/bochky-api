import { JsonDB, Config } from 'node-json-db';

const db = new JsonDB(new Config('db', true, false, '/'));

export default db;
