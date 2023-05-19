import { CardEntity } from '@/cards/entities/card.entity'
import { UserEntity } from '@/users/entities/user.entity'
import {
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	Column,
	ManyToOne,
} from 'typeorm'

@Entity('transactions-db')
export class TransactionEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ unique: true })
	number: string

	@Column()
	money: number

	@Column()
	type: string

	@CreateDateColumn({ name: 'created_at' })
	createdAt: string

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: string

	@ManyToOne(() => CardEntity, card => card.fromTransactions)
	fromCard: CardEntity

	@ManyToOne(() => CardEntity, card => card.toTransactions)
	toCard: CardEntity
}
