import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'

import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { connectToDB } from './configs/connectToDB.config'
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SendMailModule } from './send-mail/send-mail.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: connectToDB,
		}),
		MailerModule.forRoot({
			transport: {
				host: 'smtp.gmail.com',
				secure: false,
				auth: {
					user: 'ahmetsinfail987@gmail.com',
					pass: 'tkvpxwnhgpmpiniq',
				},
			},
		}),
		AuthModule,
		UsersModule,
		SendMailModule,
	],
})
export class AppModule {}
