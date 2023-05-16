import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { connectJWT } from '@/configs/connectJWT.config'
import { JwtStrategy } from '@/strategies/jwt.strategy'
import { UserEntity } from '@/users/entities/user.entity'
import { SendMailModule } from '@/send-mail/send-mail.module'
import { CardsModule } from '@/cards/cards.module'

@Module({
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	imports: [
		ConfigModule,
		TypeOrmModule.forFeature([UserEntity]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: connectJWT,
		}),
		SendMailModule,
		CardsModule,
	],
	exports: [AuthService],
})
export class AuthModule {}
