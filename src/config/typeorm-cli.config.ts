import { DataSource } from 'typeorm';
import { join } from 'path';
import * as fs from 'fs';

interface EnvConfig {
  [key: string]: string;
}

function parseDotEnv(): EnvConfig {
  try {
    const envConfig: EnvConfig = {};
    const envContent = fs.readFileSync('.env', 'utf-8');
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envConfig[key.trim()] = value.trim();
      }
    });
    
    return envConfig;
  } catch (error) {
    console.error('Erro ao ler arquivo .env:', error);
    return {};
  }
}

const envVars = parseDotEnv();

export default new DataSource({
  type: 'postgres',
  host: envVars['DB_HOST'] || 'localhost',
  port: parseInt(envVars['DB_PORT'] || '5432', 10),
  username: envVars['DB_USERNAME'] || 'postgres',
  password: envVars['DB_PASSWORD'] || 'root',
  database: envVars['DB_DATABASE'] || 'user_management',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: true,
  logging: ['error', 'warn'],
}); 