import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class AppService {
	async getDataByGroupId(groupId: number): Promise<any> {
		const data = {
			projects: [],
			members: [],
		};
		data.projects = await this.getProjectsByGroupId(groupId);
		data.members = await this.getMembersByGroupId(groupId);

		return data;
	}

	async getProjectsByGroupId(groupId: number): Promise<any> {
		const url = `groups/${groupId}/projects`;
		return await this.fetchFromGitLabAPI(url, 'GET');
	}

	async getMembersByGroupId(groupId: number): Promise<any> {
		const url = `groups/${groupId}/members`;
		return await this.fetchFromGitLabAPI(url, 'GET');
	}

	getMembersByProjectId(projectId: number, user_ids?: number[]): any {}

	async fetchFromGitLabAPI(url: string, method: string): Promise<any> {
		const gitLabUrl = `https://gitlab.com/api/v4/${url}`;

		const fetched = await fetch(gitLabUrl, {
			method,
		});

		return await fetched.json();
	}
}
