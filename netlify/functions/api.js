import serverless from 'serverless-http';
import app from '../../server-supabase.js';

export const handler = serverless(app);