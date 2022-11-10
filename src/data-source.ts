import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(<string>process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: true,
  logging: false,
  
  entities: [__dirname + '/entity/*.js'],
  migrations: ['src/subscriber/**/*.ts'],
  subscribers: [],
  ssl: process.env.NODE_ENV === 'DEV' ? false : {
    rejectUnauthorized: false,
  },
});
