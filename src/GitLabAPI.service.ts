import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

// DB creds and access keys should be stored in a secret after deploying this to an AWS environment
const GITLAB_ACCESS_KEY = 'glpat-wAqGQuYRkya57hmser8Z';

const RESULTS_PER_PAGE = 100;

@Injectable()
export class GitLabApiService {
	async getProjectsByGroupId(groupId: number): Promise<any> {
		const url = `groups/${groupId}/projects?`;
		const projects = await this.fetchPaginatedDataFromGitLabAPI(url, 'GET');

		for (const project of projects) {
			const projectMembers = await this.getMembersByProjectId(project.id);
			project.membersIds = projectMembers.length ? projectMembers.map(member => member.id) : [];
		}

		return projects;
	}

	async getMembersByGroupId(groupId: number): Promise<any> {
		const url = `groups/${groupId}/members?`;
		const members = await this.fetchPaginatedDataFromGitLabAPI(url, 'GET', true);
		return members;
	}

	async getMembersByProjectId(projectId: number): Promise<any> {
		const url = `projects/${projectId}/members?`;

		return await this.fetchPaginatedDataFromGitLabAPI(url, 'GET', true);
	}

	async fetchPaginatedDataFromGitLabAPI(url: string, method: string, addAccessToken = false): Promise<any> {
		const gitLabUrl = `https://gitlab.com/api/v4/${url}${addAccessToken ? '&private_token=' + GITLAB_ACCESS_KEY : ''}`;
		let results: any[] = [];

		let page = 1;

		let currentPageResults = await this.fetchFromGitLabAPIByPage(gitLabUrl, page, method);

		results = results.concat(currentPageResults);

		while (results.length === page * RESULTS_PER_PAGE) {
			page++;
			currentPageResults = await this.fetchFromGitLabAPIByPage(gitLabUrl, page, method);
			results = results.concat(currentPageResults);
		}

		return results;
	}

	private async fetchFromGitLabAPIByPage(url: string, page: number, method: string): Promise<any[]> {
		const gitLabUrl = `${url}&page=${page}&per_page=${RESULTS_PER_PAGE}`;

		const fetched = await fetch(gitLabUrl, {
			method,
		});

		const currentPageResults = await fetched.json();
		return currentPageResults;
	}
}
