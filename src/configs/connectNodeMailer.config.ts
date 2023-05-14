import { ConfigService } from '@nestjs/config'
import { MailerOptions } from '@nestjs-modules/mailer'

export const connectNodeMailer = async (
	configService: ConfigService
): Promise<MailerOptions> => ({
	transport: {
		host: 'smtp.gmail.com',
		secure: false,
		auth: {
			user: configService.get('EMAIL'),
			pass: configService.get('PASS'),
		},
	},
})
