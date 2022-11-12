import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import fetch from 'node-fetch';

export const projectSchema = new mongoose.Schema({}, { strict: false });
//export const memberSchema = new mongoose.Schema({}, { strict: false });

const Project = mongoose.model('Project', projectSchema);
//const Member = mongoose.model('Member', memberSchema);

@Injectable()
export class AppService {
	async getDataByGroupId(groupId: number): Promise<any> {
		const data = {
			projects: [],
			members: [],
		};
		data.projects = await this.getProjectsByGroupId(groupId);
		data.members = await this.getMembersByGroupId(groupId);

		await this.saveDataToDb(groupId, data);

		return data;
	}

	async saveDataToDb(groupId: number, data: { projects: any[]; members: any[] }) {
		await this.connectToDb();

		for (const project of data.projects) {
			await Project.updateOne({ id: project.id, groupId }, { ...project, groupId }, { upsert: true });
		}

		/*
		for (const project of data.members) {
			await Member.updateOne({ id: project.id, groupId }, { ...project, groupId }, { upsert: true });
		}*/
	}

	async connectToDb() {
		const uri =
			'mongodb://gitlabGroups:gitlabGroups@ac-tfkevby-shard-00-00.klildug.mongodb.net:27017,ac-tfkevby-shard-00-01.klildug.mongodb.net:27017,ac-tfkevby-shard-00-02.klildug.mongodb.net:27017/?ssl=true&replicaSet=atlas-13ka9o-shard-0&authSource=admin&retryWrites=true&w=majority';
		mongoose
			.connect(uri, {
				serverSelectionTimeoutMS: 2000,
				dbName: 'gitlabGroups',
				authSource: 'admin',
			})
			.catch(err => console.log({ ...err }));
	}

	async getProjectsByGroupId(groupId: number): Promise<any> {
		const url = `groups/${groupId}/projects`;
		return await this.fetchFromGitLabAPI(url, 'GET');
	}

	async getMembersByGroupId(groupId: number): Promise<any> {
		const url = `groups/${groupId}/members`;
		return await this.fetchFromGitLabAPI(url, 'GET');
	}

	//getMembersByProjectId(projectId: number, user_ids?: number[]): any {}

	async fetchFromGitLabAPI(url: string, method: string): Promise<any> {
		const gitLabUrl = `https://gitlab.com/api/v4/${url}`;

		const fetched = await fetch(gitLabUrl, {
			method,
		});

		return await fetched.json();
	}
}
