import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
} from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'
import { Auth } from '@/auth/decorators/auth.decorator'
import { User } from '@/users/decorators/user.decorator'
import { CardEntity } from '@/cards/entities/card.entity'
import { SortTransactionsEnum } from './enums/sortTransactions.enum'

@Controller('transactions')
export class TransactionsController {
	constructor(private readonly transactionsService: TransactionsService) {}

	@Auth()
	@Get()
	async getTransactions(
		@User('card') card: CardEntity,
		@Query('sort') sort: SortTransactionsEnum
	) {
		return await this.transactionsService.getTransactions(card.id, sort)
	}
}
