import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  adminSecret: process.env.ADMIN_SECRET || 'lab-admin-2023',
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || 'localhost:4000'
};