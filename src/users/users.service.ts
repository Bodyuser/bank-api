import {
	Injectable,
	UnauthorizedException,
	BadRequestException,
} from '@nestjs/common'
import { UserEntity } from './entities/user.entity'
import { AuthService } from '@/auth/auth.service'
import { SendMailService } from '@/send-mail/send-mail.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, ILike } from 'typeorm'
import { returnUserProfile } from './returnUserObject'
import { UpdateProfileDto } from './dtos/UpdateProfile.dto'
import { generateCode } from '@/utils/GenerateCode'
import { compare, genSalt, hash } from 'bcryptjs'

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,

		private authService: AuthService,
		private sendMailService: SendMailService
	) {}

	async getProfile(username: string) {
		const user = await this.userRepository.findOne({
			where: { username },
			...returnUserProfile,
		})
		if (!user)
			throw new UnauthorizedException('User not found or you are not logged in')

		const tokens = await this.authService.issueToken(user.id)

		return {
			user,
			tokens,
		}
	}

	async updateProfile(username: string, updateProfileDto: UpdateProfileDto) {
		const user = await this.userRepository.findOne({
			where: { username },
			...returnUserProfile,
		})
		if (!user)
			throw new UnauthorizedException('User not found or you are not logged in')

		if (updateProfileDto.email && user.email !== updateProfileDto.email) {
			if (!updateProfileDto.code) {
				await this.sendMailService.sendMailForCode({ email: user.email })
				throw new BadRequestException('Please enter the code')
			}

			if (user.code !== updateProfileDto.code) {
				await this.sendMailService.sendMailForCode({ email: user.email })
				throw new BadRequestException('Please enter the correct code')
			}

			const emailExists = await this.userRepository.findOne({
				where: { email: updateProfileDto.email },
			})
			if (emailExists) throw new BadRequestException('Email already exists')
			user.email = updateProfileDto.email
			user.code = generateCode(6)
		}

		if (
			updateProfileDto.username &&
			user.username !== updateProfileDto.username
		) {
			const usernameExists = await this.userRepository.findOne({
				where: { username: updateProfileDto.username },
			})
			if (usernameExists)
				throw new BadRequestException('Username already exists')

			user.username = updateProfileDto.username
		}

		if (updateProfileDto.password) {
			if (!updateProfileDto.currentPassword)
				throw new BadRequestException('Please enter the current password')

			const isValidPassword = await compare(
				updateProfileDto.currentPassword,
				user.password
			)
			if (!isValidPassword)
				throw new BadRequestException('Invalid current password')

			const salt = await genSalt(10)
			user.password = await hash(updateProfileDto.password, salt)
		}

		updateProfileDto.avatarPath
			? (user.avatarPath = updateProfileDto.avatarPath)
			: (user.avatarPath = user.avatarPath)
		updateProfileDto.name
			? (user.name = updateProfileDto.name)
			: (user.name = user.name)

		user.isActivated = false

		await this.userRepository.save(user)

		if (user.email === updateProfileDto.email) {
			await this.sendMailService.sendMail(
				user.email,
				'ACtivate profile',
				`
                Your link for activate profile 
                <br />
                <br />
                <br />
                <a href='${process.env.APP_URL}/profile/activate/${user.activateLink}'>Click here</a>
                `
			)
		}

		return {
			user,
		}
	}

	async deleteProfile(username: string) {
		const user = await this.userRepository.findOne({
			where: { username },
		})
		if (!user)
			throw new UnauthorizedException('User not found or you are not logged in')

		await this.userRepository.delete({ username })

		return {
			message: 'User deleted successfully',
		}
	}

	async updateOnline(online: boolean, username: string) {
		const user = await this.userRepository.findOne({ where: { username } })
		if (!user)
			throw new UnauthorizedException('User not found or you are not logged in')

		user.online = online
		await this.userRepository.save(user)
		return
	}

	async activateProfile(activateLink: string) {
		const user = await this.userRepository.findOne({ where: { activateLink } })
		if (!user)
			throw new UnauthorizedException('User not found or you are not logged in')

		if (user.isActivated)
			throw new BadRequestException('User is already activated')

		user.isActivated = true
		await this.userRepository.save(user)

		return {
			message: 'User activated successfully',
		}
	}

	async checkExistingUsername(username: string, userUsername: string) {
		if (username !== userUsername) {
			const options = {
				username: username ? username : '',
			}
			const userBySlug = await this.userRepository.find({
				where: {
					username: ILike(`${options.username}`),
				},
			})
			if (userBySlug.length) {
				return {
					message: 'This user by username existing',
					access: false,
				}
			}
			return {
				message: 'This username is not busy',
				access: true,
			}
		} else {
			return {
				message: 'This username is yours',
				access: true,
			}
		}
	}
}
