import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from '@nestjs/common'
import { CardsService } from './cards.service'
import { Auth } from '@/auth/decorators/auth.decorator'
import { User } from '@/users/decorators/user.decorator'
import { TransferMoneyDto } from './dtos/transferMoney.dto'
import { CardEntity } from './entities/card.entity'

@Controller('cards')
export class CardsController {
	constructor(private readonly cardsService: CardsService) {}

	@Auth()
	@Post()
	async transferMoney(
		@User('card') card: CardEntity,
		@Body() transferMoneyDto: TransferMoneyDto
	) {
		return await this.cardsService.transferMoney(card.number, transferMoneyDto)
	}
}
