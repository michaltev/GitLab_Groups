import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import fetch from 'node-fetch';

// DB creds and access keys should be stored in a secret after deploying this to an AWS environment
const GITLAB_ACCESS_KEY = 'glpat-wAqGQuYRkya57hmser8Z';
const MONGO_USER = 'gitlabGroups';
const MONGO_PASS = 'gitlabGroups';

const RESULTS_PER_PAGE = 100;

const projectSchema = new mongoose.Schema({}, { strict: false });
const memberSchema = new mongoose.Schema({}, { strict: false });

const Project = mongoose.model('Project', projectSchema);
const Member = mongoose.model('Member', memberSchema);

@Injectable()
export class AppService {
	async getDataByGroupId(groupId: number): Promise<any> {
		await this.connectToDb();

		const data = {
			projects: [],
			members: [],
		};

		data.members = await this.getAndSaveMembersByGroupId(groupId);

		data.projects = await this.getAndSaveProjectsByGroupId(groupId);

		return data;
	}

	async saveDataToDb(
		groupId: number,
		data: any[],
		modelToSave: mongoose.Model<
			{},
			{},
			{},
			{},
			mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, 'type', {}>
		>
	) {
		if (data.length) {
			for (const object of data) {
				await modelToSave.updateOne({ id: object.id, groupId }, { ...object, groupId }, { upsert: true });
			}
		}
	}

	async connectToDb() {
		const uri = `mongodb://${MONGO_USER}:${MONGO_PASS}@ac-tfkevby-shard-00-00.klildug.mongodb.net:27017,ac-tfkevby-shard-00-01.klildug.mongodb.net:27017,ac-tfkevby-shard-00-02.klildug.mongodb.net:27017/?ssl=true&replicaSet=atlas-13ka9o-shard-0&authSource=admin&retryWrites=true&w=majority`;
		mongoose
			.connect(uri, {
				serverSelectionTimeoutMS: 2000,
				dbName: 'gitlabGroups',
				authSource: 'admin',
			})
			.catch(err => console.log({ ...err }));
	}

	async getAndSaveProjectsByGroupId(groupId: number): Promise<any> {
		const url = `groups/${groupId}/projects?`;
		const projects = await this.fetchPaginatedDataFromGitLabAPI(url, 'GET');

		for (const project of projects) {
			const projectMembers = await this.getMembersByProjectId(project.id);
			project.membersIds = projectMembers.length ? projectMembers.map(member => member.id) : [];
		}
		this.saveDataToDb(groupId, projects, Project);

		return projects;
	}

	async getAndSaveMembersByGroupId(groupId: number): Promise<any> {
		const url = `groups/${groupId}/members?`;
		const members = await this.fetchPaginatedDataFromGitLabAPI(url, 'GET', true);
		this.saveDataToDb(groupId, members, Member);
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
