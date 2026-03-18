import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // Point this to your schema file
  schema: 'prisma/schema.prisma',

  // Define where your migrations should live
  migrations: {
    path: 'prisma/migrations',
  },

  // This replaces the 'url' property you previously had in schema.prisma
  datasource: {
    url: env('DATABASE_URL'),
  },
});
