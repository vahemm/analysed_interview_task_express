import Category from '../category/category.entity';
import {Categories1689787472219} from "../migrations/1689787472219-categories";
import City from "../city/city.entity";
import Person from "../person/person.entity";
import Company from "../company/company.entity";
import {City1689872718847} from "../migrations/1689872718847-city";
import {Company1689873160505} from "../migrations/1689873160505-company";
import {Person1689873177423} from "../migrations/1689873177423-person";

const databaseConfig = () => ({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DkB || 'neo4j',
    // username: process.env.POSTGRES_USER || '',
    // password: process.env.DB_PASSWORD || '',
    synchronize: false,
    entities: [
        City,
        Person,
    ],
    migrations: [
        City1689872718847,
        Person1689873177423
    ],
    subscribers: ['dist/subscriber/**/*.js'],
    // migrationsRun: true,
    cli: {
        entitiesDir: 'src',
        migrationsDir: '../src/migrations',
        seedsDir: 'src/seed',
    },
});

export default databaseConfig;
