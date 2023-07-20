import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import databaseConfig from './database.config';

dotenv.config();

const typeormConfig = new DataSource(databaseConfig() as DataSourceOptions);
export default typeormConfig;
