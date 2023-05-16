import { BadRequestException, Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from '@/users/entities/user.entity'
import { Repository } from 'typeorm'
import { SendMailDto } from './dtos/sendMail.dto'

@Injectable()
export class SendMailService {
	constructor(
		private mailerService: MailerService,
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
	) {}

	async sendMail(to: string, subject: string, html: string) {
		return await this.mailerService.sendMail({
			to,
			from: to,
			subject,
			html,
		})
	}

	async sendMailForCode(sendMailDto: SendMailDto) {
		const user = await this.userRepository.findOne({
			where: { email: sendMailDto.email },
		})
		if (!user)
			throw new BadRequestException('User with this email does not exist')

		return await this.sendMail(
			sendMailDto.email,
			'Enter code',
			`You give this send for enter code<br><br>
           <b>${user.code}</b>
            `
		)
	}
}
