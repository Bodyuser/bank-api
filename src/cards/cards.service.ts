import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CardEntity } from './entities/card.entity'
import { generateCode } from '@/utils/GenerateCode'
import { UserEntity } from '@/users/entities/user.entity'
import { TransferMoneyDto } from './dtos/transferMoney.dto'
import {
	returnRelationsUserProfile,
	returnUserProfileObject,
} from '@/users/returnUserObject'

@Injectable()
export class CardsService {
	constructor(
		@InjectRepository(CardEntity)
		private cardRepository: Repository<CardEntity>,
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
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
		})

		if (!card) throw new BadRequestException('Transfer card not found')

		if (card.balance > transferMoneyDto.money) {
			card.balance = card.balance - transferMoneyDto.money
			transferCard.balance = transferCard.balance + transferMoneyDto.money
		} else {
			throw new BadRequestException("You don't have a this money on balance")
		}
		await this.cardRepository.save(card)
		await this.cardRepository.save(transferCard)

		return card
	}
}
