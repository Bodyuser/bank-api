import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UserEntity } from './entities/user.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from '@/strategies/jwt.strategy'
import { AuthModule } from '@/auth/auth.module'
import { SendMailModule } from '@/send-mail/send-mail.module'
import { connectJWT } from '@/configs/connectJWT.config'

@Module({
	controllers: [UsersController],
	providers: [UsersService, JwtStrategy],
	imports: [
		ConfigModule,
		TypeOrmModule.forFeature([UserEntity]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: connectJWT,
		}),
		AuthModule,
		SendMailModule,
	],
})
export class UsersModule {}
