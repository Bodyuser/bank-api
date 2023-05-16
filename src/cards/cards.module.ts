import { Module } from '@nestjs/common'
import { CardsService } from './cards.service'
import { CardsController } from './cards.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CardEntity } from './entities/card.entity'
import { UserEntity } from '@/users/entities/user.entity'
@Module({
	controllers: [CardsController],
	providers: [CardsService],
	imports: [TypeOrmModule.forFeature([CardEntity, UserEntity])],
	exports: [CardsService],
})
export class CardsModule {}
