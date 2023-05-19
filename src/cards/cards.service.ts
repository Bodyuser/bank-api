import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CardEntity } from './entities/card.entity'
import { generateCode } from '@/utils/GenerateCode'
import { UserEntity } from '@/users/entities/user.entity'
import { TransferMoneyDto } from './dtos/transferMoney.dto'
import { TransactionsService } from '@/transactions/transactions.service'
import { returnUserProfileObject } from '@/users/returnUserObject'

@Injectable()
export class CardsService {
	constructor(
		@InjectRepository(CardEntity)
		private cardRepository: Repository<CardEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private transactionService: TransactionsService
	) {}
	async createCard(id: number) {
		const user = await this.userRepository.findOne({
			where: { id },
		})
		const card = await this.cardRepository.create({
			cvc: generateCode(3),
			number: `${generateCode(3)} ${generateCode(5)} ${generateCode(6)}`,
			term: `${new Date().getDay()}/${new Date().getMonth()}/${
				new Date().getUTCFullYear() + 7
			}`,
			user,
		})

		await this.cardRepository.save(card)

		return card
	}

	async transferMoney(number: string, transferMoneyDto: TransferMoneyDto) {
		const card = await this.cardRepository.findOne({
			where: {
				number,
			},
			relations: {
				user: true,
				fromTransactions: true,
				toTransactions: true,
			},
			// select: {
			// 	user: returnUserProfileObject,
			// },
		})

		if (!card) throw new BadRequestException('Card not found')

		const transferCard = await this.cardRepository.findOne({
			where: {
				number: transferMoneyDto.number,
			},
			relations: {
				user: true,
				fromTransactions: true,
				toTransactions: true,
			},
		})

		if (!transferCard) throw new BadRequestException('Transfer card not found')

		if (card.balance > transferMoneyDto.money) {
			card.balance = card.balance - transferMoneyDto.money
			transferCard.balance = transferCard.balance + transferMoneyDto.money
			const fromTransaction = await this.transactionService.create(
				'from',
				card.id,
				transferCard.id,
				transferMoneyDto.money
			)
			const toTransaction = await this.transactionService.create(
				'to',
				card.id,
				transferCard.id,
				transferMoneyDto.money
			)
			card.fromTransactions = [...card.fromTransactions, fromTransaction]
			transferCard.toTransactions = [
				...transferCard.toTransactions,
				toTransaction,
			]
		} else {
			throw new BadRequestException("You don't have a this money on balance")
		}

		await this.cardRepository.save(card)
		await this.cardRepository.save(transferCard)

		return card
	}

	async getCard(id: number) {
		const card = await this.cardRepository.findOne({
			where: { id },
			relations: {
				fromTransactions: true,
				toTransactions: true,
				user: true,
			},
			select: {
				// @ts-ignore
				user: returnUserProfileObject,
			},
		})

		if (!card) throw new BadRequestException('Card not found')

		return card
	}
}
