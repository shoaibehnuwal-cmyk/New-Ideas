import dotenv from 'dotenv';
import type { Knex } from 'knex';

dotenv.config({ path: '../.env' });

const config: Record<string, Knex.Config> = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/reputationflow',
    pool: { min: 2, max: 10 },
    migrations: {
      directory: '../migrations',
      extension: 'ts',
    },
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 20 },
    migrations: {
      directory: '../migrations',
      extension: 'ts',
    },
  },
};

export default config;
