import { IsString, IsNumber } from 'class-validator'

export class TransferMoneyDto {
	@IsString({ message: 'Number card must be a string' })
	number: string

	@IsNumber({}, { message: 'Money must be a number' })
	money: number
}
