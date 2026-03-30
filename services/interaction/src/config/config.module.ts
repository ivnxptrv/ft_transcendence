import { Module } from '@nestjs/common'
import { ConfigModule as NestConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validationSchema: Joi.object({
        INTERACTION_PORT: Joi.number().default(4013),
        DATABASE_URL: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        IDENTITY_SERVICE_URL: Joi.string().required(),
        LEDGER_SERVICE_URL: Joi.string().required(),
        SEMANTIC_SERVICE_URL: Joi.string().required(),
      }),
    }),
  ],
})
export class ConfigModule {}