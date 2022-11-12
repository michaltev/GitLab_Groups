import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GitLabApiService } from './GitLabAPI.service';
import { MongoService } from './mongoDB.service';

@Module({
	imports: [],
	controllers: [AppController],
	providers: [AppService, MongoService, GitLabApiService],
})
export class AppModule {}
