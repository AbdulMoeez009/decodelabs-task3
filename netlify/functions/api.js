import serverlessExpress from '@vendia/serverless-express';
import app from '../../server-supabase.js';

export const handler = serverlessExpress({ app });