import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('groups')
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get('/:groupId')
	async getDataByGroupId(@Param('groupId') groupId: string): Promise<{ data: any }> {
		const data = await this.appService.getDataByGroupId(+groupId);

		return { data };
	}
}
