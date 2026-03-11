import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Pool } from 'pg';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async testConnection() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return {
        status: 'Error',
        message: 'DATABASE_URL is not defined in .env',
      };
    }
    // 1. Create a pool using your connection string
    const pool = new Pool({
      connectionString: dbUrl,
    });

    try {
      // 2. Run a simple query to see if the DB is alive
      const res = await pool.query('SELECT NOW() as current_time, version()');

      // 3. Clean up the connection (important for a one-off test!)
      await pool.end();

      return {
        status: 'Connected!',
        database_time: res.rows[0].current_time,
        postgres_version: res.rows[0].version,
      };
    } catch (err) {
      return {
        status: 'Error',
        message: err.message,
      };
    }
  }
  // getHello(): string {
  //   return this.appService.getHello();
  // }
}
