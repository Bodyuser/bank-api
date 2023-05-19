import { BadRequestException, Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { TransactionEntity } from './entities/transaction.entity'
import { generateCode } from '@/utils/GenerateCode'
import { CardEntity } from '@/cards/entities/card.entity'
import { SortTransactionsEnum } from './enums/sortTransactions.enum'
@Injectable()
export class TransactionsService {
	constructor(
		@InjectRepository(TransactionEntity)
		private transactionRepository: Repository<TransactionEntity>,
		@InjectRepository(CardEntity) private cardRepository: Repository<CardEntity>
	) {}

	async create(
		type: 'from' | 'to',
		fromId: number,
		toId: number,
		money: number
	) {
		const toCard = await this.cardRepository.findOne({
			where: {
				id: toId,
			},
		})

		if (!toCard) throw new BadRequestException('To card not found')

		const fromCard = await this.cardRepository.findOne({
			where: {
				id: fromId,
			},
		})

		if (!fromCard) throw new BadRequestException('From card not found')

		const transaction = await this.transactionRepository.create({
			number: `${generateCode(10)}`,
			type,
			toCard,
			fromCard,
			money,
		})

		console.log(fromCard)

		await this.transactionRepository.save(transaction)
		return transaction
	}

	async getTransactions(cardId: number, sort: SortTransactionsEnum) {
		let where = {}
		if (sort === SortTransactionsEnum.ALL) {
			where = [
				{
					fromCard: {
						id: cardId,
					},
				},
				{
					toCard: {
						id: cardId,
					},
				},
			]
		} else if (sort === SortTransactionsEnum.FROM) {
			where = {
				fromCard: {
					id: cardId,
				},
			}
		} else {
			where = {
				toCard: {
					id: cardId,
				},
			}
		}
		const transactions = await this.transactionRepository.find({
			relations: {
				fromCard: true,
				toCard: true,
			},
			where,
		})

		return transactions
	}
}
