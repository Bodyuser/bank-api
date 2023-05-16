import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'

import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { connectToDB } from './configs/connectToDB.config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { SendMailModule } from './send-mail/send-mail.module'
import { connectNodeMailer } from './configs/connectNodeMailer.config'
import { CardsModule } from './cards/cards.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: connectToDB,
		}),
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: connectNodeMailer,
		}),
		AuthModule,
		UsersModule,
		SendMailModule,
		CardsModule,
		TransactionsModule,
	],
})
export class AppModule {}
