import {
  cleanEnv, port, str,
} from 'envalid';

function validateEnv() {
  cleanEnv(process.env, {
    POSTGRES_HOST: str(),
    POSTGRES_PORT: port(),
    POSTGRES_USER: str(),
    POSTGRES_PASSWORD: str(),
    POSTGRES_DB: str(),
    PORT: port(),
  });
}

export default validateEnv;
