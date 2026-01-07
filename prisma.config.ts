import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // FIX: Use a string path directly
  schema: 'prisma/schema.prisma', 
  
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // This is where your DATABASE_URL goes now
    url: env('DATABASE_URL'),
  },
});