import {
	Injectable,
	BadRequestException,
	UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LoginDto } from './dtos/login.dto'
import { compare, genSalt, hash } from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import { RegisterDto } from './dtos/register.dto'
import { ResetPasswordDto } from './dtos/resetPassword.dto'
import { v4 } from 'uuid'
import { UserEntity } from '@/users/entities/user.entity'
import { SendMailService } from '@/send-mail/send-mail.service'
import { returnProfile } from '@/utils/ReturnProfile'
import { generateCode } from '@/utils/GenerateCode'
import { generateUsername } from '@/utils/GenerateUsername'
import { returnRelationsUserProfile } from '@/users/returnUserObject'

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private jwtService: JwtService,
		private sendMailService: SendMailService
	) {}

	async login(loginDto: LoginDto) {
		const user = await this.validateUser(loginDto)

		const tokens = await this.issueToken(user.id)
		return {
			user: returnProfile(user),
			tokens,
		}
	}

	async register(registerDto: RegisterDto) {
		const existEmail = await this.userRepository.findOne({
			where: { email: registerDto.email },
		})
		if (existEmail) throw new BadRequestException('Email already exists')

		const salt = await genSalt(10)

		const user = this.userRepository.create({
			...registerDto,
			code: generateCode(6),
			username: generateUsername(registerDto.name, registerDto.email),
			password: await hash(registerDto.password, salt),
		})
		await this.userRepository.save(user)

		const tokens = await this.issueToken(user.id)

		await this.sendMailService.sendMail(
			user.email,
			'Activate profile',
			`You get this mail for activate your profile. Click to button
                <br />
                <br />
                <br />
                <a href='${process.env.APP_URL}/profile/activate/${user.activateLink}'>Click here</a>
                `
		)

		return {
			user: returnProfile(user),
			tokens,
		}
	}

	async getNewTokens(refreshToken: string) {
		if (!refreshToken)
			throw new UnauthorizedException(
				'You are not registered or not logged in, please login'
			)

		const payload = await this.jwtService.verifyAsync(refreshToken)
		if (!payload.id)
			throw new UnauthorizedException(
				'The token has expired or the token is invalid'
			)

		const user = await this.userRepository.findOne({
			where: { id: payload.id },
			relations: returnRelationsUserProfile,
		})
		if (!user)
			throw new BadRequestException('User with this email does not exist')

		const tokens = await this.issueToken(user.id)

		return {
			user: returnProfile(user),
			tokens,
		}
	}

	async resetPassword(resetLink: string, resetPasswordDto: ResetPasswordDto) {
		const user = await this.userRepository.findOne({
			where: { resetLink },
		})
		if (!user) throw new BadRequestException('User not found')

		const salt = await genSalt(10)
		user.password = await hash(resetPasswordDto.password, salt)
		user.resetLink = v4()
		await this.userRepository.save(user)

		return {
			message: 'Password changed successfully',
		}
	}

	async checkResetLink(resetLink: string) {
		const user = await this.userRepository.findOne({ where: { resetLink } })
		if (!user)
			throw new BadRequestException('User with this resetLink does not exist')
		return {
			message: 'You can change your password',
		}
	}

	async issueToken(userId: number) {
		const payload = {
			id: userId,
		}

		const accessToken = await this.jwtService.signAsync(payload, {
			expiresIn: '5m',
		})

		const refreshToken = await this.jwtService.signAsync(payload, {
			expiresIn: '15d',
		})

		return {
			accessToken,
			refreshToken,
		}
	}

	private async validateUser(loginDto: LoginDto) {
		const user = await this.userRepository.findOne({
			where: { email: loginDto.email },
			relations: returnRelationsUserProfile,
		})
		if (!user) throw new BadRequestException('User not found')

		const isValidPassword = await compare(loginDto.password, user.password)
		if (!isValidPassword)
			throw new BadRequestException('Invalid email or password')

		return user
	}
}
