import {
	Body,
	Controller,
	Get,
	HttpCode,
	Put,
	Res,
	UsePipes,
	Delete,
	Param,
	ValidationPipe,
	Patch,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { User } from './decorators/user.decorator'
import { Auth } from '@/auth/decorators/auth.decorator'
import { Response } from 'express'
import { UpdateProfileDto } from './dtos/UpdateProfile.dto'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Auth()
	@Get('profile')
	async getProfile(
		@User('username') username: string,
		@Res({ passthrough: true }) response: Response
	) {
		const result = await this.usersService.getProfile(username)

		response.cookie('refreshToken', result.tokens.refreshToken, {
			httpOnly: true,
			maxAge: 15 * 24 * 60 * 60 * 1000,
			path: '/api',
		})
		return {
			user: result.user,
			token: result.tokens.accessToken,
		}
	}

	@UsePipes(new ValidationPipe())
	@Auth()
	@HttpCode(200)
	@Put('profile')
	async updateProfile(
		@User('username') username: string,
		@Body() updateProfileDto: UpdateProfileDto
	) {
		return await this.usersService.updateProfile(username, updateProfileDto)
	}

	@Auth()
	@Delete('profile')
	async deleteProfile(@User('username') username: string) {
		return await this.usersService.deleteProfile(username)
	}

	@Auth()
	@HttpCode(200)
	@Patch('profile/online')
	async updateOnline(
		@User('username') username: string,
		@Body() { online }: { online: boolean }
	) {
		return await this.usersService.updateOnline(online, username)
	}

	@Auth()
	@HttpCode(200)
	@Patch('profile/activate/:activateLink')
	async activateProfile(@Param('activateLink') activateLink: string) {
		return await this.usersService.activateProfile(activateLink)
	}

	@Auth()
	@Get('existing-username/:username')
	async checkExistingUsername(
		@Param('username') username: string,
		@User('username') userUsername: string
	) {
		return await this.usersService.checkExistingUsername(username, userUsername)
	}
}
