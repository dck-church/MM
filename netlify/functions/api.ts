import express from 'express';
import serverless from 'serverless-http';
import { db } from '../../server/db.js';
import { apiRouter } from '../../server/routes.js';

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(apiRouter);

let initialization: Promise<void> | undefined;
const expressHandler = serverless(app, {
  basePath: '/.netlify/functions/api',
});

export const handler = async (event: object, context: object) => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be configured in the Netlify environment.');
  }

  initialization ??= db.initialize();
  await initialization;
  return db.withExclusiveRequest(() => expressHandler(event, context));
};
