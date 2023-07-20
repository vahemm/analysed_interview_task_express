import Category from '../category/category.entity';
import {Categories1689787472219} from "../migrations/1689787472219-Categories";

const databaseConfig = () => ({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DkB || 'neo4j',
  // username: process.env.POSTGRES_USER || '',
    // password: process.env.DB_PASSWORD || '',
  synchronize: false,
  entities: [
    Category,
  ],
  migrations: [
    Categories1689787472219,
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
