import 'dotenv/config';
import neo4j from 'neo4j-driver';
import 'reflect-metadata';
// import {createConnection} from 'typeorm';
import App from './app';
import * as config from './ormconfig';
import "reflect-metadata"
import {DataSource} from "typeorm"

import validateEnv from './utils/validateEnv';
import CityController from "./city/city.controller";
import PersonController from "./person/person.controller";


validateEnv();

(async () => {

    const AppDataSource = new DataSource(config)

    AppDataSource.initialize()
        .then(() => {
            // here you can start to work with your database
        })
        .catch((error) => console.log(error))

    const driver = neo4j.driver('neo4j+s://24212b12.databases.neo4j.io', neo4j.auth.basic('neo4j', 'tPxBa3gCCn6P-B2oGlJ8P7LW5pzlmKBKSXA9XW7cYTk'));

    const app = new App(
        [
            new CityController(driver, AppDataSource),
            new PersonController(driver, AppDataSource),
        ],
    );
    app.listen();
})();
