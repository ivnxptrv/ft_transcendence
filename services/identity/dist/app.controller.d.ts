import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    testConnection(): Promise<{
        status: string;
        database_time: any;
        postgres_version: any;
        message?: undefined;
    } | {
        status: string;
        message: any;
        database_time?: undefined;
        postgres_version?: undefined;
    }>;
}
