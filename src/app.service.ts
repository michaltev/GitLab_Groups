import { Injectable } from '@nestjs/common';
import { GitLabApiService } from './GitLabAPI.service';
import { Member, MongoService, Project } from './mongoDB.service';

@Injectable()
export class AppService {
	mongoService = new MongoService();
	gitLabApiService = new GitLabApiService();
	async getDataByGroupId(groupId: number): Promise<any> {
		await this.mongoService.connectToDb();

		const data = {
			projects: [],
			members: [],
		};

		data.members = await this.getAndSaveMembersByGroupId(groupId);
		data.projects = await this.getAndSaveProjectsByGroupId(groupId);

		return data;
	}

	async getAndSaveProjectsByGroupId(groupId: number): Promise<any> {
		const projects = await this.gitLabApiService.getProjectsByGroupId(groupId);
		this.mongoService.saveDataToDb(groupId, projects, Project);
		return projects;
	}

	async getAndSaveMembersByGroupId(groupId: number): Promise<any> {
		const members = await this.gitLabApiService.getMembersByGroupId(groupId);
		this.mongoService.saveDataToDb(groupId, members, Member);
		return members;
	}
}
