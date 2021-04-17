import { Db, MongoClient } from 'mongodb';
import { logger } from './logger';

if (process.env.MONGO_URL == null) throw new Error(`MONGO_URL environment variable must be set`);
if (process.env.MONGO_DB_NAME == null) throw new Error(`MONGO_DB_NAME environment variable must be set`);

const client = new MongoClient(process.env.MONGO_URL, {
  useUnifiedTopology: true,
});

// Use connect method to connect to the server

export function connectToMongoDB(): Promise<Db> {
  return new Promise<Db>((resolve, reject) => {
    client.connect((err) => {
      if (err) return reject(err);

      logger.info('Connected successfully to the MongoDB server');

      const db = client.db(process.env.MONGO_DB_NAME);

      resolve(db);
    });
  });
}
