import { Module } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { TransactionsController } from './transactions.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TransactionEntity } from './entities/transaction.entity'
import { CardEntity } from '@/cards/entities/card.entity'
@Module({
	controllers: [TransactionsController],
	providers: [TransactionsService],
	imports: [TypeOrmModule.forFeature([TransactionEntity, CardEntity])],
	exports: [TransactionsService],
})
export class TransactionsModule {}
