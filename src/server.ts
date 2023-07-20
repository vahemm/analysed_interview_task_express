import 'dotenv/config';
import neo4j from 'neo4j-driver';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import App from './app';
import CategoryController from './category/category.controller';
import * as config from './ormconfig';

import validateEnv from './utils/validateEnv';

validateEnv();

(async () => {
  try {
    const connection = await createConnection(config);
  } catch (error) {
    console.log('Error while connecting to the database', error);
    return error;
  }
  const driver = neo4j.driver('neo4j+s://be26c759.databases.neo4j.io:7687', neo4j.auth.basic('neo4j', 'lZWnqraIX514M-4LWdizfGq_cfNOzOyH0E0RwTiSUN4'));

  const app = new App(
      [
        // new PostController(),
        // new AuthenticationController(),
        // new AddressController(),
        new CategoryController(driver),
      ],
  );
  app.listen();
})();
