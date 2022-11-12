import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({}, { strict: false });
const memberSchema = new mongoose.Schema({}, { strict: false });

export const Project = mongoose.model('Project', projectSchema);
export const Member = mongoose.model('Member', memberSchema);

@Injectable()
export class MongoService {
	// DB creds and access keys should be stored in a secret after deploying this to an AWS environment
	MONGO_USER = 'gitlabGroups';
	MONGO_PASS = 'gitlabGroups';

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
		const uri = `mongodb://${this.MONGO_USER}:${this.MONGO_PASS}@ac-tfkevby-shard-00-00.klildug.mongodb.net:27017,ac-tfkevby-shard-00-01.klildug.mongodb.net:27017,ac-tfkevby-shard-00-02.klildug.mongodb.net:27017/?ssl=true&replicaSet=atlas-13ka9o-shard-0&authSource=admin&retryWrites=true&w=majority`;
		mongoose
			.connect(uri, {
				serverSelectionTimeoutMS: 2000,
				dbName: 'gitlabGroups',
				authSource: 'admin',
			})
			.catch(err => console.log({ ...err }));
	}
}
