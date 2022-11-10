require('dotenv').config();
import { App } from './app';
import { AppDataSource } from './data-source';

AppDataSource.initialize().then(async () => {
  const server = new App();
  server.start();
}).catch(error => console.log(error));
